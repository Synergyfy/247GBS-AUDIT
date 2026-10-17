# Partner M2M Data Sharing (247GBS Audit → fundordonate)

This document describes the backend-to-backend contract that lets **fundordonate**
read a consented user's pre-audit and audit data from **247GBS Audit**.

Architecture follows the MCOM service-mesh rule: fundordonate mints a short-lived
RS256 **delegated** token at MCOM Central and calls 247GBS Audit **directly**.
Central is never in the data path.

## 1. Console setup (required, or every call fails)

In the **MCOM Admin Console**:

1. **Service Mesh Policy** — enable the edge **fundordonate → 247gbs-audit**:
   - fundordonate: Egress → `247gbs-audit`
   - 247gbs-audit: Ingress ← `fundordonate`
2. **247gbs-audit app → Supported Scopes** — add `preaudit:read` and `audit:read`.
   (Scopes are registered on the **resource server** — us — not on the caller.)
3. Ensure 247gbs-audit has `serviceEnabled: true`.

On the 247GBS Audit API, set:

```bash
MCOM_ALLOWED_CALLERS=fundordonate
MCOM_SERVICE_ISSUER=mcom-solutions
# MCOM_JWKS_URL=...   # only if JWKS is not under MCOM_SOLUTIONS_URL
```

## 2. How fundordonate gets a token

Exchange the signed-in user's SSO access token for a delegated token scoped to
this app (RFC 8693):

```http
POST {MCOM_SOLUTIONS_URL}/api/v1/auth/service-token/exchange
Authorization: Basic base64(fundordonate:cs_...)
Content-Type: application/json

{
  "subject_token": "<user SSO access token>",
  "audience": "247gbs-audit",
  "scope": "preaudit:read audit:read"
}
```

The returned token carries `sub` = the MCOM user id, `act.sub` = `fundordonate`,
`aud` = `247gbs-audit`, `typ` = `delegated`.

> Only **delegated** tokens are accepted. A plain client-credentials service
> token is rejected with `403 PEER_DELEGATION_REQUIRED`, so a caller can only
> read the data of the user it was delegated for.

## 3. Endpoints

Base: `{247GBS_AUDIT_API}/api/v1/partner/audit-data`
Header on every call: `Authorization: Bearer <delegated token>`

| Method | Path | Scope | Returns |
|---|---|---|---|
| GET | `/pre-audit` | `preaudit:read` | Latest completed pre-audit + server-computed diagnostic (funding need/gap, operations, readiness, recommendation) |
| GET | `/audits` | `audit:read` | Audit sessions + calculated metrics |
| GET | `/audits/:id` | `audit:read` | A single audit session |
| GET | `/summary` | `preaudit:read` **and** `audit:read` | Combined pre-audit + audits for a funding decision |

There is **no user id in the path** — the user always comes from the token.

### Example

```bash
curl "{API}/api/v1/partner/audit-data/pre-audit" \
  -H "Authorization: Bearer $DELEGATED_TOKEN"
```

```json
{
  "available": true,
  "id": "uuid-pre-1",
  "recommendedAuditType": "LONG_FORM",
  "destinationType": "LONG_FORM",
  "completedAt": "2026-02-03T10:00:00.000Z",
  "diagnosticSummary": {
    "funding": { "fundingNeed": 4500, "fundingGap": 3000, "status": "gap_identified" },
    "recommendation": { "auditType": "LONG_FORM" }
  }
}
```

## 4. Consent

Sharing reuses the **pre-audit consent** (`pre_audit_sessions.consentGrantedAt`).
If the user has a completed pre-audit but no consent, or has no consenting
pre-audit at all, audit reads are denied with `403 PARTNER_CONSENT_REQUIRED`.
A user with no pre-audit returns `200 { "available": false, "reason": "no_pre_audit" }`.

## 5. Error codes

| Status | `code` | Meaning |
|---|---|---|
| 401 | `PEER_TOKEN_MISSING` | No `Authorization: Bearer` header |
| 401 | `PEER_TOKEN_INVALID` | Bad signature / expired / wrong `iss` or `aud` |
| 401 | `PEER_SUBJECT_MISSING` | Token has no `sub` |
| 403 | `PEER_DELEGATION_REQUIRED` | Service token used instead of a delegated token |
| 403 | `PEER_CALLER_DENIED` | Caller not on the 247gbs-audit ingress allow-list |
| 403 | `PEER_SCOPE_MISSING` | Token lacks the endpoint's required scope |
| 403 | `PARTNER_CONSENT_REQUIRED` | User has not consented to share |
| 404 | — | No linked 247GBS Audit account, or audit not found for this user |

## 6. Notes

- Raw audit answers are **never** exposed; only calculated metrics and AI insights.
- The delegated `sub` is matched to `audit_users.mcomUserId` (set by MCOM SSO
  JIT provisioning). Users with no linked MCOM identity return `404`.
- `preaudit:read` / `audit:read` must be registered on **247gbs-audit** in the
  Console; fundordonate only needs the mesh edge.

## 7. Outbound: 247GBS Audit → fundordonate (optional)

When an audit is completed, 247GBS Audit can push an event to fundordonate so it
can re-evaluate funding. This is **disabled by default** and fully env-driven.

Required in the Console: a mesh edge **247gbs-audit → fundordonate** (egress on
us, ingress on fundordonate) plus an inbound event scope agreed with the
fundordonate team (default `audit:write`).

```bash
FUNDORDONATE_AUDIT_EVENTS_ENABLED=true
FUNDORDONATE_BASE_URL=https://api.fundordonate.mcom.com
FUNDORDONATE_CLIENT_ID=fundordonate
FUNDORDONATE_AUDIT_EVENT_PATH=/api/v1/partner/audit-events
FUNDORDONATE_AUDIT_EVENT_SCOPE=audit:write
```

```http
POST {FUNDORDONATE_BASE_URL}{FUNDORDONATE_AUDIT_EVENT_PATH}
Authorization: Bearer <RS256 service token, aud=fundordonate>
X-Caller-Id: 247gbs-audit
Content-Type: application/json

{
  "auditId": "uuid-audit-1",
  "mcomUserId": "mcom-123",
  "status": "COMPLETED",
  "auditType": "LONG_FORM",
  "sectorId": "retail-wholesale",
  "calculatedMetrics": { "annualRecovery": 12000, "impactScore": 65 },
  "completedAt": "2026-02-04T11:30:00.000Z"
}
```

Failures are logged and swallowed — a fundordonate outage never blocks audit
completion.
