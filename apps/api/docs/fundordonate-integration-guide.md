# fundordonate → 247GBS Audit — Full Integration Guide

**Audience:** the fundordonate engineering team
**Purpose:** read a consented user's pre-audit and audit data from 247GBS Audit, and
(optionally) receive audit-completed events pushed by 247GBS Audit.
**Protocol version:** MCOM service mesh `2026-10-01`

This document is self-contained. If you follow it top to bottom you will have a
working, secure integration without needing to read the 247GBS Audit source code.

---

## 0. TL;DR checklist

1. Register/locate fundordonate in the MCOM Console and copy its `clientId` +
   `clientSecret` (`cs_...`).
2. Ask the MCOM Console admin to enable the mesh edge **fundordonate → 247gbs-audit**
   (Egress on fundordonate, Ingress on 247gbs-audit) and register the scopes
   `preaudit:read`, `audit:read` on the **247gbs-audit** app.
3. Store `MCOM_SOLUTIONS_URL`, `MCOM_CLIENT_ID`, `MCOM_CLIENT_SECRET`, and the
   audit API base URL in your backend env. **Never ship the client secret to a browser.**
4. For each signed-in user action, exchange the user's SSO access token for a
   **delegated** token scoped to `247gbs-audit`, then call the audit API directly.
5. Verify the token's `aud`, `iss`, `typ`, and scopes; cache tokens (~5 min).
6. Handle the error codes in §8 exactly.
7. (Optional) Expose the audit-completed event endpoint in §10.

---

## 1. Architecture in one picture

```
┌──────────────┐   1. SSO login          ┌────────────────────────────┐
│ fundordonate │◀───────────────────────▶│ MCOM Central (control      │
│   web/app    │                         │ plane — NEVER in data path)│
└──────┬───────┘   2. token exchange     │                            │
       │          POST /auth/service-    │ • issues RS256 tokens      │
       │          token/exchange         │ • publishes /.well-known/  │
       │                                 │   jwks.json                │
       │                                 └────────────────────────────┘
       │
       │ 3. DIRECT HTTPS  GET /api/v1/partner/audit-data/...
       │    Authorization: Bearer <delegated token>
       ▼
┌──────────────────────────────┐
│ 247GBS Audit API             │
│ • verifies token OFFLINE     │
│   against Central's JWKS     │
│ • checks aud = 247gbs-audit  │
│ • checks act.sub = fundordonate
│ • checks scope + consent     │
│ • returns the user's data    │
└──────────────────────────────┘
```

**Key law:** registered app backends talk **directly** over HTTPS. Requests never
transit MCOM Central. Central is an offline identity provider (control plane) only.

**Key security law:** 247GBS Audit only accepts **user-delegated** tokens. You must
act on behalf of a signed-in user. There is no endpoint that lets you read
arbitrary users' data with a service token.

---

## 2. Console setup (one-time, by an MCOM admin)

These steps are outside your codebase but the integration will not work without them.

### 2.1 Service mesh policy
Enable the edge **fundordonate → 247gbs-audit**:

| App | Field | Value |
|---|---|---|
| fundordonate | Permitted Outbound Targets (Egress) | `247gbs-audit` |
| 247gbs-audit | Permitted Inbound Callers (Ingress) | `fundordonate` |

### 2.2 Scopes (registered on the RESOURCE SERVER, i.e. 247gbs-audit)
On the **247gbs-audit** app entry → **Supported Scopes**, add:

```
preaudit:read
audit:read
```

> Scopes describe what the *target* exposes. You (fundordonate) merely *request*
> them. Do not add them to fundordonate's supported-scopes list — that list
> describes what fundordonate itself offers to callers.
>
> Confirm with your Central admin whether your Central build also validates
> requested scopes against the *caller's* list. If it does, add `preaudit:read`
> and `audit:read` to fundordonate as well. The `aud`-based model says target-only.

### 2.3 Service enabled
Ensure **247gbs-audit** has `serviceEnabled: true`, otherwise Central returns
`400 Unknown or inactive target audience` at exchange time.

### 2.4 (Optional, only if you receive push events)
Enable the edge **247gbs-audit → fundordonate** and register an inbound event
scope on fundordonate (default `audit:write`, see §10).

---

## 3. Your environment variables

```bash
# Central authority (identity provider)
MCOM_SOLUTIONS_URL=https://api.centralhubsolution.com
# MCOM_SOLUTIONS_URL=https://auth.mcomsolutions.com   # if your tenant uses this host

# fundordonate's own Console credentials (SERVER-SIDE ONLY)
MCOM_CLIENT_ID=fundordonate
MCOM_CLIENT_SECRET=cs_live_xxxxxxxxxxxxxxxx

# 247GBS Audit service base URL (from the ecosystem service registry)
AUDIT_API_BASE_URL=https://api.247gbs_audit.mcom.com
```

`AUDIT_API_BASE_URL` is published by Central at
`GET {MCOM_SOLUTIONS_URL}/api/v1/ecosystem/services` (look for `clientId:
"247gbs-audit"` → `serviceBaseUrl`). Fetch it at boot rather than hardcoding if
you want to survive host changes.

---

## 4. Getting a delegated token (RFC 8693 token exchange)

You do **not** mint tokens with a shared secret between apps. You present your
Console credentials + the user's SSO access token to Central, and Central issues a
token whose audience is 247gbs-audit.

### 4.1 Request

```http
POST {MCOM_SOLUTIONS_URL}/api/v1/auth/service-token/exchange
Authorization: Basic base64("fundordonate:cs_live_xxxx")
Content-Type: application/json

{
  "subject_token": "<the signed-in user's MCOM SSO access token>",
  "audience": "247gbs-audit",
  "scope": "preaudit:read audit:read"
}
```

### 4.2 Response

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 300
}
```

### 4.3 Delegated token claims (what you will be holding)

```json
{
  "iss": "mcom-solutions",
  "aud": "247gbs-audit",
  "sub": "<MCOM user id>",
  "act": { "sub": "fundordonate" },
  "typ": "delegated",
  "scope": "preaudit:read audit:read",
  "iat": 1770000000,
  "exp": 1770000300
}
```

- `sub` — the user the token is delegated for. 247GBS Audit uses this to find the
  user's data. **You never send a user id in the request path or body.**
- `act.sub` — your app (`fundordonate`). This is what 247GBS Audit checks against
  its ingress allow-list.
- `aud` — must be `247gbs-audit`.
- `typ` — `delegated`. A plain service token (no `act`) is **rejected**.

### 4.4 Caching

Tokens are short-lived (~5 minutes). Cache per `(user, audience, scope)` and
refresh when fewer than ~60 seconds remain. Do **not** request a fresh token on
every HTTP call. Never persist the token beyond its lifetime; never log it.

### 4.5 Node/TypeScript example (fundordonate side)

```ts
// audit-client.ts
const MCOM_URL = process.env.MCOM_SOLUTIONS_URL!;
const CLIENT_ID = process.env.MCOM_CLIENT_ID!;
const CLIENT_SECRET = process.env.MCOM_CLIENT_SECRET!;
const AUDIT_BASE = process.env.AUDIT_API_BASE_URL!;

const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
const tokenCache = new Map<string, { token: string; expiresAt: number }>();

export async function getDelegatedToken(
  userSsoAccessToken: string,
  scope: string,
): Promise<string> {
  const key = `audit:${scope}`;
  const hit = tokenCache.get(key);
  if (hit && hit.expiresAt > Date.now() + 60_000) return hit.token;

  const res = await fetch(`${MCOM_URL}/api/v1/auth/service-token/exchange`, {
    method: 'POST',
    headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subject_token: userSsoAccessToken,
      audience: '247gbs-audit',
      scope,
    }),
  });
  if (!res.ok) {
    throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  tokenCache.set(key, {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 300) * 1000,
  });
  return data.access_token;
}

export async function getAuditData<T>(
  userSsoAccessToken: string,
  path: string,        // e.g. '/api/v1/partner/audit-data/summary'
  scope: string,       // e.g. 'preaudit:read audit:read'
): Promise<T> {
  const token = await getDelegatedToken(userSsoAccessToken, scope);
  const res = await fetch(`${AUDIT_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new AuditApiError(res.status, body);
  }
  return (await res.json()) as T;
}

export class AuditApiError extends Error {
  constructor(public status: number, public body: any) {
    super(body?.code ?? body?.error ?? `Audit API error ${status}`);
  }
}
```

> Important: the `tokenCache` above is keyed only by scope because in this snippet
> the token belongs to whoever's SSO token is passed. In production, **key the
> cache by the user id as well** (or keep it per-request/per-session) so you never
> serve one user's delegated token to another user.

### 4.6 curl example

```bash
BASIC=$(printf '%s' "fundordonate:$MCOM_CLIENT_SECRET" | base64)

TOKEN=$(curl -s -X POST "$MCOM_SOLUTIONS_URL/api/v1/auth/service-token/exchange" \
  -H "Authorization: Basic $BASIC" \
  -H "Content-Type: application/json" \
  -d "{\"subject_token\":\"$USER_SSO_TOKEN\",\"audience\":\"247gbs-audit\",\"scope\":\"preaudit:read audit:read\"}" \
  | jq -r .access_token)

curl -s "$AUDIT_API_BASE_URL/api/v1/partner/audit-data/summary" \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## 5. Endpoint reference

**Base:** `{AUDIT_API_BASE_URL}/api/v1/partner/audit-data`
**Auth header (every call):** `Authorization: Bearer <delegated token>`
**No user id in the path or body** — the user is always the token's `sub`.

| Method | Path | Required scope | Purpose |
|---|---|---|---|
| `GET` | `/pre-audit` | `preaudit:read` | Latest completed pre-audit + funding diagnostic |
| `GET` | `/audits` | `audit:read` | All audit sessions + calculated metrics |
| `GET` | `/audits/:id` | `audit:read` | One audit session (must belong to the token's user) |
| `GET` | `/summary` | `preaudit:read` **and** `audit:read` | Combined view for a funding decision |

All endpoints are read-only. There are no write endpoints.

### 5.1 `GET /pre-audit`

Returns the user's most recent **completed** pre-audit that carries consent.

**200 — data available**

```json
{
  "available": true,
  "id": "b3f1c2a4-....",
  "recommendedAuditType": "LONG_FORM",
  "destinationType": "LONG_FORM",
  "destinationTarget": null,
  "consentVersion": "1",
  "completedAt": "2026-02-03T10:00:00.000Z",
  "diagnosticSummary": { /* see §6 */ }
}
```

**200 — no data**

```json
{ "available": false, "reason": "no_pre_audit" }
```

`reason` is `"no_email"` when the account has no email on record, or
`"no_pre_audit"` when the user never completed one.

**403 — consent missing**

```json
{ "error": "User has not consented to share pre-audit data.", "code": "PARTNER_CONSENT_REQUIRED" }
```

### 5.2 `GET /audits`

**200**

```json
{
  "available": true,
  "count": 2,
  "audits": [
    {
      "id": "a1...",
      "status": "COMPLETED",
      "auditType": "LONG_FORM",
      "scopes": ["EXCESS_STOCK"],
      "sectorId": "retail-wholesale",
      "groupId": "inventory",
      "businessTypeId": "warehouse",
      "preAuditSessionId": "b3f1c2a4-....",
      "calculatedMetrics": {
        "capacityDrainPct": 25,
        "totalStockImpact": 15000,
        "annualRecovery": 12000,
        "impactScore": 65
      },
      "aiInsight": { "summary": "Fix waste", "actionablePivot": "Sell bundles" },
      "createdAt": "2026-02-03T10:00:00.000Z",
      "updatedAt": "2026-02-04T11:30:00.000Z"
    }
  ]
}
```

`status` is one of `TRIAGE_COMPLETED | SECTOR_SELECTED | IN_PROGRESS | COMPLETED | ABANDONED`.
`calculatedMetrics` and `aiInsight` are `null` until the audit has progressed.
Raw audit answers are **never** returned.

**403 — consent missing** (same shape as §5.1).

### 5.3 `GET /audits/:id`

Same object as one element of `audits[]`. `404` if the id does not exist **or**
does not belong to the token's user (so you cannot probe other users' audits).

### 5.4 `GET /summary`

Runs both reads and returns them together. Requires **both** scopes.

```json
{
  "available": true,
  "preAudit": { "available": true, "id": "b3...", "diagnosticSummary": { /* ... */ } },
  "audits": { "available": true, "count": 2, "audits": [ /* ... */ ] }
}
```

If the user has no consenting pre-audit, this returns `403 PARTNER_CONSENT_REQUIRED`.

---

## 6. `diagnosticSummary` schema

This is the server-computed pre-audit diagnosis. All monetary values are GBP.

```ts
interface DiagnosticSummary {
  funding: {
    fundingNeed: number | null;
    fundingNeedFormatted: string | null;      // "£4,500"
    ownContribution: number | null;
    ownContributionFormatted: string | null;
    otherContribution: number | null;
    otherContributionFormatted: string | null;
    fundingGap: number | null;                // max(0, need - own - other)
    fundingGapFormatted: string | null;       // "£3,000"
    status: 'fully_funded' | 'gap_identified' | 'not_specified';
    timing: string | null;                    // free text, e.g. "Within 3 months"
    season: string | null;
  };
  marketing: {
    budget: number | null;
    budgetFormatted: string | null;
    needs: string[];
    timing: string | null;
    digitalPresence: string | null;
    channels: string[];
  };
  operations: {
    excessStockLevel: string | null;
    excessStockSeasonal: boolean;
    excessStockPeakSeason: string | null;
    spareCapacityType: string[];
    spareCapacityLevel: string | null;
    spareCapacitySeasonal: boolean;
    spareCapacityPeakSeason: string | null;
  };
  business: {
    category: string | null;
    location: string | null;
    operatingStatus: string | null;
    operatingTenure: string | null;
    identifiedNeeds: string[];
  };
  readiness: {
    level: 'immediate' | 'preparation_needed' | 'blocked' | 'not_specified';
    label: string;
    details: string[];
  };
  accountant: {
    involved: boolean;
    email: string | null;
  };
  recommendation: {
    auditType: 'SHORT_FORM' | 'LONG_FORM';
    title: string;
    rationale: string;
    keyTakeaway: string;
  };
}
```

**For a funding decision you will usually care about:**
`funding.fundingGap`, `funding.status`, `funding.timing`,
`recommendation.auditType`, `readiness.level`, and the audit
`calculatedMetrics.annualRecovery` / `impactScore`.

---

## 7. Consent model (critical)

247GBS Audit reuses the **pre-audit consent** the user granted at submission
(`pre_audit_sessions.consentGrantedAt`). Consequences:

- The user must have **completed a pre-audit and consented** for you to read
  **anything** (pre-audit *and* audits).
- If a user has audits but no consenting pre-audit, `GET /audits` and `/summary`
  return `403 PARTNER_CONSENT_REQUIRED`.
- If a user has no pre-audit at all, `GET /pre-audit` returns
  `200 { "available": false }`, while `GET /audits` / `/summary` return `403`.

**UX implication:** before calling, present your own clear notice that the user's
audit data will be read from 247GBS Audit. Do not assume consent exists; handle
`403 PARTNER_CONSENT_REQUIRED` gracefully with a "the user hasn't shared their
audit data yet" state, and direct them to complete/consent to their pre-audit in
247GBS Audit.

---

## 8. Error codes

All 401/403 responses have the body shape `{ "error": string, "code": string }`.
`404` uses the standard Nest shape `{ "statusCode": 404, "message": string, "error": "Not Found" }`.

| HTTP | `code` | Meaning | What you should do |
|---|---|---|---|
| 401 | `PEER_TOKEN_MISSING` | No `Authorization: Bearer` header | Send the delegated token |
| 401 | `PEER_TOKEN_INVALID` | Bad signature, expired, wrong `iss`/`aud` | Re-exchange the token; check your clock |
| 401 | `PEER_SUBJECT_MISSING` | Token has no `sub` | Re-exchange with a valid user SSO token |
| 401 | `PEER_NOT_CONFIGURED` | 247GBS Audit misconfiguration | Contact the 247GBS Audit team |
| 403 | `PEER_DELEGATION_REQUIRED` | You sent a service token, not a delegated token | Use `/service-token/exchange` |
| 403 | `PEER_CALLER_DENIED` | `act.sub` is not on the audit ingress allow-list | Ask admin to enable the mesh edge (§2.1) |
| 403 | `PEER_SCOPE_MISSING` | Token lacks the endpoint's scope | Request the scope at exchange |
| 403 | `PARTNER_CONSENT_REQUIRED` | User has not consented | Show a "not shared" state (§7) |
| 404 | — | No linked audit account, or audit not found for this user | Show an empty state |
| 429 | — | Rate limited | Back off and retry with jitter (see §9) |
| 5xx | — | 247GBS Audit error | Retry with exponential backoff |

Note the two different 403 families: `PEER_*` are **authentication/authorization**
problems (fix your request or ask an admin); `PARTNER_CONSENT_REQUIRED` is a
**user-consent** state (handle in your UX).

---

## 9. Operational guidance

- **Direct calls only.** Call `AUDIT_API_BASE_URL` directly. Never route through
  Central. No CORS configuration is needed — these are server-to-server calls.
- **Timeouts.** Use a 5–10s timeout. The endpoints do a single DB read.
- **Retries.** Retry only on network errors / `429` / `5xx`. Use exponential
  backoff with jitter. **Do not** retry `403`/`404` — they are deterministic.
- **Idempotency.** All endpoints are `GET`, so retries are safe.
- **Rate limiting.** The audit endpoints are throttled per client IP (default
  ~20 requests / 60s). Batch sensibly; don't poll per page render.
- **Clock sync.** Token verification depends on `exp`/`nbf`. Keep NTP running.
- **Caching responses.** The data changes only when the user completes a new
  pre-audit or audit. Cache per user for a few minutes.
- **Token handling.** Keep the delegated token server-side. Never log it, never
  put it in a URL, never send it to the browser.

---

## 10. Optional: receiving audit-completed events

If enabled, 247GBS Audit pushes an event when a user's audit reaches `COMPLETED`.

### 10.1 Console + env
- Enable the mesh edge **247gbs-audit → fundordonate**.
- Register an inbound event scope on fundordonate (default `audit:write`).
- 247GBS Audit sets (its side): `FUNDORDONATE_AUDIT_EVENTS_ENABLED=true`,
  `FUNDORDONATE_BASE_URL`, `FUNDORDONATE_AUDIT_EVENT_PATH`,
  `FUNDORDONATE_AUDIT_EVENT_SCOPE`.

### 10.2 The request you will receive

```http
POST {FUNDORDONATE_BASE_URL}{FUNDORDONATE_AUDIT_EVENT_PATH}   # default /api/v1/partner/audit-events
Authorization: Bearer <RS256 service token, aud=fundordonate>
X-Caller-Id: 247gbs-audit
Content-Type: application/json

{
  "auditId": "a1...",
  "mcomUserId": "mcom-123",
  "status": "COMPLETED",
  "auditType": "LONG_FORM",
  "sectorId": "retail-wholesale",
  "calculatedMetrics": { "capacityDrainPct": 25, "totalStockImpact": 15000, "annualRecovery": 12000, "impactScore": 65 },
  "completedAt": "2026-02-04T11:30:00.000Z"
}
```

This is a **service token** (client-credentials), so `sub` is the caller
(`247gbs-audit`) and there is **no** `act` claim. Respond `2xx` quickly; 247GBS
Audit logs and swallows failures, so it will not retry.

### 10.3 Verifying the event (offline, via JWKS)

```ts
import { createRemoteJWKSet, jwtVerify } from 'jose';

const JWKS = createRemoteJWKSet(
  new URL(`${process.env.MCOM_SOLUTIONS_URL}/.well-known/jwks.json`),
);

export async function verifyAuditEvent(req: Request) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) throw new Error('missing token');

  const { payload } = await jwtVerify(token, JWKS, {
    issuer: 'mcom-solutions',
    audience: 'fundordonate',        // YOUR clientId
  });

  const scopes = String(payload.scope ?? '').split(/\s+/);
  if (!scopes.includes('audit:write')) throw new Error('missing scope');
  if (payload.sub !== '247gbs-audit') throw new Error('unexpected caller');

  return payload; // payload carries auditId etc. from the JSON body
}
```

> `jose` is ESM-first. Use v5 (`jose@^5`) if your service is CommonJS.

---

## 11. Security checklist

- [ ] `clientSecret` lives only in your backend secret store (never client-side).
- [ ] You use the **delegated** token flow, not a shared secret with 247GBS Audit.
- [ ] You never send a user id in the path/body — identity comes from `sub`.
- [ ] You key token caches by user id so tokens can't cross users.
- [ ] You validate `aud`, `iss`, `exp`, `scope`, and (for events) `sub`.
- [ ] You handle `PARTNER_CONSENT_REQUIRED` as a UX state, not an error toast.
- [ ] You don't log tokens or full API responses containing personal data.

---

## 12. Testing the connection

### 12.1 Discovery + registry smoke test

```bash
curl -s "$MCOM_SOLUTIONS_URL/api/v1/ecosystem/discovery" | jq
curl -s "$MCOM_SOLUTIONS_URL/api/v1/ecosystem/services" | jq '.[] | select(.clientId=="247gbs-audit")'
```

### 12.2 Exchange smoke test

```bash
BASIC=$(printf '%s' "fundordonate:$MCOM_CLIENT_SECRET" | base64)
curl -s -X POST "$MCOM_SOLUTIONS_URL/api/v1/auth/service-token/exchange" \
  -H "Authorization: Basic $BASIC" -H "Content-Type: application/json" \
  -d "{\"subject_token\":\"$USER_SSO_TOKEN\",\"audience\":\"247gbs-audit\",\"scope\":\"preaudit:read audit:read\"}" | jq
```

A `403 Client not permitted to call target` means the mesh edge (§2.1) is missing.
A `400 Unknown or inactive target audience` means 247gbs-audit is disabled (§2.3).

### 12.3 Endpoint smoke test

```bash
curl -s "$AUDIT_API_BASE_URL/api/v1/partner/audit-data/summary" \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## 13. Troubleshooting matrix

| Symptom | Likely cause | Fix |
|---|---|---|
| `403 Client not permitted to call target` (at exchange) | Mesh edge missing | Enable fundordonate → 247gbs-audit (§2.1) |
| `403 Caller not permitted to call this service` (from audit API → `PEER_CALLER_DENIED`) | `act.sub` not allowed on audit side | Ensure 247GBS Audit's `MCOM_ALLOWED_CALLERS` includes `fundordonate` and the ingress edge is set |
| `401 Invalid client credentials` (at exchange) | Wrong `clientSecret` | Re-copy from Console |
| `403 PEER_DELEGATION_REQUIRED` | You used a service token | Use the exchange flow (§4) |
| `403 PEER_SCOPE_MISSING` | Scope not requested/registered | Request at exchange; ensure scopes registered on 247gbs-audit (§2.2) |
| `401 PEER_TOKEN_INVALID` | Expired token / clock skew | Refresh token; sync clocks |
| `403 PARTNER_CONSENT_REQUIRED` | User hasn't consented | UX state (§7) |
| `404` | User has no linked audit account | Empty state; user must sign into 247GBS Audit via SSO |
| `429` | Rate limited | Back off with jitter |

---

## 14. Questions to align with the MCOM/247GBS teams

1. Confirm the exact `MCOM_SOLUTIONS_URL` host for your tenant.
2. Confirm whether Central validates requested scopes against the caller's list too.
3. Confirm the event endpoint path + scope you want (defaults:
   `/api/v1/partner/audit-events`, `audit:write`).
4. Confirm whether you need the audit `aiInsight` object or only metrics.

---

*Source of truth for this contract: `apps/api/src/partner/` and
`apps/api/src/mcom/peer/` in the 247GBS Audit repository. If the code and this
doc ever disagree, the code wins — open an issue.*
