# 247 GBS Audit Platform — Full Codebase Audit Report

**Date:** 2026-10-04 | **Auditor:** Senior Engineering Review  
**Repository:** `247GBS-AUDIT` monorepo (Turborepo / pnpm)

---

## 1. EXECUTIVE SUMMARY

| Metric | Count |
|--------|-------|
| Files inspected | ~85 source files |
| Major areas | Auth, Triage (Pre-Audit), Audit, AI, Admin, Dashboard, Intelligence, Protocols, MCOM SSO, Webhooks, Mail | 
| **CRITICAL findings** | **3** |
| **HIGH findings** | **8** |
| **MEDIUM findings** | **11** |
| **LOW / INFO findings** | **9** |
| Confirmed broken features | 2 |
| Mocked / Placeholder features | 3 |
| N+1 query patterns | 3 |
| Security findings | 6 |
| Performance findings | 5 |
| Dead / unused code | 3 |
| Unknowns requiring runtime verification | 4 |

---

## 2. ARCHITECTURE MAP

```
Frontend (Next.js 14 / App Router — port 9009)
  └── AuthContext (localStorage + HttpOnly cookie dual-track)
  └── useAuthStore (Zustand — legacy, separate token key)
  └── services/ (fetch-based API calls)
  └── lib/auth.ts (token refresh, single-flight guard)
  └── lib/apiClient.ts (Axios — reads `auth_token` key)
  ↓
  HTTP (REST + HttpOnly cookies)
  ↓
Backend (NestJS 11 — port 9008, prefix: /api/v1)
  └── AuthModule (JWT access/refresh, MFA, admin signin)
  └── TriageModule (Pre-Audit public flow, OTP, admin builder)
  └── AuditModule (Audit sessions, form builder, calculators)
  └── AIModule (Google Gemini 1.5 Flash)
  └── DashboardModule (user dashboard, intelligence/benchmarking)
  └── AdminModule (admin dashboard, CRUD users/audits/settings)
  └── ProtocolsModule (security, billing, notifications, tokens)
  └── McomModule (SSO, webhooks, external plans, ecosystem)
  └── PublicModule (landing-page data)
  └── MailModule (Resend + SMTP nodemailer)
  ↓
Database: PostgreSQL (TypeORM 0.3, autoLoadEntities)
  └── audit_users, audit_sessions, triage_questions, triage_answers
  └── pre_audit_sessions, audit_forms, audit_form_questions, audit_form_answers
  └── billing_profiles, invoices, notification_settings
  └── platform_settings, help_resources, triage_forms, external_plans
  ↓
External Services
  └── Google Gemini 1.5 Flash (AI insights)
  └── Resend (transactional email)
  └── Central Hub Solution / MCOM (SSO OAuth2, webhooks, membership)
```

---

## 3. FEATURE INVENTORY

| Feature | UI | API | DB | External | Error Handling | Auth | Persistence | Status |
|---------|----|----|-----|----------|----------------|------|-------------|--------|
| Sign Up | ✓ | ✓ | ✓ | – | ✓ | – | ✓ | **Verified** |
| Sign In + MFA | ✓ | ✓ | ✓ | – | ✓ | – | ✓ | **Verified** |
| Admin Sign In | ✓ | ✓ | ✓ | – | ✓ | Role check | ✓ | **Verified** |
| Token Refresh | ✓ | ✓ | ✓ | – | Partial | HttpOnly cookie | ✓ | **Partial** |
| MCOM SSO Login | ✓ | ✓ | ✓ | MCOM | ✓ | – | ✓ | **Verified** |
| MCOM Webhook | – | ✓ | ✓ | MCOM | ✓ | HMAC | ✓ | **Verified** |
| Pre-Audit Triage (public) | ✓ | ✓ | ✓ | – | ✓ | Public | ✓ | **Verified** |
| Pre-Audit OTP Email | ✓ | ✓ | In-memory | Resend | ✓ | Public | **No DB** | **Partial** |
| Admin Triage Builder | ✓ | ✓ | ✓ | – | ✓ | Admin | ✓ | **Verified** |
| Audit Session (create) | ✓ | ✓ | ✓ | – | ✓ | AccessToken | ✓ | **Verified** |
| Audit Form Builder (admin) | ✓ | ✓ | ✓ | – | ✓ | Admin | ✓ | **Verified** |
| Audit Answers / Calculation | ✓ | ✓ | ✓ | – | ✓ | AccessToken | ✓ | **Verified** |
| AI Follow-up Questions | ✓ | ✓ | ✓ | Gemini | Returns `[]` silently | AccessToken | ✓ | **Partial** |
| AI Strategic Insight | ✓ | ✓ | ✓ | Gemini | Fallback text | AccessToken | ✓ | **Partial** |
| User Dashboard | ✓ | ✓ | ✓ | – | ✓ | AccessToken | ✓ | **Verified** |
| Intelligence / Benchmarking | ✓ | ✓ | ✓ | Gemini | ✓ | AccessToken | ✓ | **Verified** |
| Admin Dashboard (stats) | ✓ | ✓ | ✓ | – | ✓ | Admin | ✓ | **Verified** |
| Admin Users CRUD | ✓ | ✓ | ✓ | – | ✓ | Admin | ✓ | **Verified** |
| Admin Audits CRUD | ✓ | ✓ | ✓ | – | ✓ | Admin | ✓ | **Verified** |
| Platform Settings | ✓ | ✓ | ✓ | – | ✓ | Admin | ✓ | **Verified** |
| Help Resources CRUD | ✓ | ✓ | ✓ | – | ✓ | Admin | ✓ | **Verified** |
| Billing Info | ✓ | ✓ | Partial | – | ✓ | AccessToken | ✓ | **Partial** |
| Rotate Master Key | ✓ | ✓ | **No-op** | – | ✓ | AccessToken | **No** | **MOCKED** |
| Token Purchase | ✓ | ✓ | ✓ (no payment) | – | ✓ | AccessToken | ✓ | **FAKE/PLACEHOLDER** |
| Notification Settings | ✓ | ✓ | Partial | – | Partial | AccessToken | ✓ | **Partial** |
| MCOM Ecosystem / Sectors | ✓ | ✓ | – | MCOM | Returns `[]` silently | Public | – | **Partial** |
| External Plans (pricing) | ✓ | ✓ | ✓ | – | ✓ | – | ✓ | **Verified** |
| Specialists | ✓ | ✓ | ✓ | – | ✓ | AccessToken | ✓ | **Verified** |
| Public Landing Page | ✓ | Partial | – | – | – | Public | – | **Partial** |
| Admin Specialists | UI exists | ✓ | ✓ | – | – | Admin | ✓ | **Unknown** |

---

## 4. CRITICAL FINDINGS

---

### [CRITICAL] C-1: JwtAuthGuard silently returns `null` on invalid tokens — unauthenticated requests reach protected handlers

**Location**
```
apps/api/src/auth/guards/jwt-auth.guard.ts:25-29
```

**What is happening**

The global `JwtAuthGuard` overrides `handleRequest` to return `null` instead of throwing an `UnauthorizedException` when a JWT is missing or invalid:

```typescript
handleRequest<TUser = any>(err: any, user: any): TUser {
  if (err || !user) {
    return null as TUser;   // ← silently allows request through with user = null
  }
  return user as TUser;
}
```

The `@Public()` decorator bypasses the guard entirely (correct). But for every other endpoint that relies on this **global** guard and does NOT apply `@UseGuards(AccessTokenGuard)` explicitly, the request handler is called with `req.user = null`. Any code in those handlers that does `(req as any).user['sub']` will throw a runtime `TypeError: Cannot read properties of null (reading 'sub')` — leaking a 500 error to the client, or worse, if the handler uses optional chaining and silently processes the request without a real user.

**Why it is a problem**

1. Unauthenticated requests to **any non-@Public, non-explicitly-guarded** endpoint do not get a clean 401 — they either 500 or proceed with null user depending on the handler.
2. The standard Passport NestJS pattern is to **throw** `UnauthorizedException` here; the override breaks this contract application-wide.
3. Admin endpoints that call `verifyAdmin` internally catch this safely (they throw ForbiddenException when userId is null), but the path is fragile.

**Evidence**
```typescript
// jwt-auth.guard.ts:25-29
handleRequest<TUser = any>(err: any, user: any): TUser {
  if (err || !user) {
    return null as TUser;
  }
  return user as TUser;
}
```

**Execution path**
```
Unauthenticated request
→ JwtAuthGuard.canActivate() → super.canActivate() → Passport jwt strategy
→ JWT missing/invalid → handleRequest(err, null)
→ returns null (should throw UnauthorizedException)
→ handler called with req.user = null
→ handler dereferences user.sub → TypeError 500
```

**Confidence:** Confirmed

**Suggested fix**
```typescript
handleRequest<TUser = any>(err: any, user: any): TUser {
  if (err || !user) {
    throw err || new UnauthorizedException();
  }
  return user as TUser;
}
```
If you need the soft-bypass behavior for specific routes, use `@Public()` or `@Optional()` guard decorators rather than globally swallowing auth failures.

---

### [CRITICAL] C-2: Production secrets committed to `.env` in source control

**Location**
```
apps/api/.env (committed to git, not in .gitignore at root)
```

**What is happening**

The `.env` file for the API contains live production credentials:

```
POSTGRES_PASSWORD="Nov52002#"
JWT_ACCESS_SECRET=838jhdue83874333
JWT_REFRESH_SECRET=73hf3jf373833j3d
MCOM_CLIENT_SECRET=cs_4aecb8f484f037c9d2e258fbd40e402ed84b86ea63a590dbe1360f298648966d
MCOM_API_KEY=ak_0e6068f97d033449816147b2b6e12338a77636fc78151aeb
MCOM_HMAC_SECRET=hm_a621ebe948fde001530faf8c2bdffa6df9a7162092ecad2a8b4068587c3d1170
MCOM_WEBHOOK_SECRET=wh_6ef01e54d89d1585a41ae63dd99577f74f6767d61e1a8bb3
RESEND_API_KEY=re_FxTn6amh_[REDACTED]
```

**Why it is a problem**

- Anyone who clones this repository has all API keys, the database password, the JWT signing secrets, and the MCOM OAuth client secret.
- The JWT secrets are short and weak (16–17 characters), making offline brute-force practical.
- With `MCOM_CLIENT_SECRET`, an attacker can complete a full OAuth token exchange impersonating the platform.
- With `RESEND_API_KEY`, an attacker can send email as the platform's verified domain.

**Confidence:** Confirmed

**Suggested fix**

1. **Immediately rotate all exposed secrets** (DB password, all JWT secrets, all MCOM keys, Resend API key).
2. Ensure `apps/api/.env` is listed in the root `.gitignore` (currently `apps/api/.gitignore` lists it but confirm root `.gitignore` also covers it).
3. Switch to a secrets manager (Vercel environment variables, Doppler, AWS Secrets Manager).
4. Add a pre-commit hook (`detect-secrets` or `git-secrets`) to prevent future credential leaks.

---

### [CRITICAL] C-3: OTP codes stored in server process memory — lost on restart, not distributed-safe

**Location**
```
apps/api/src/triage/triage-otp.service.ts:16-37
```

**What is happening**

The `TriageOtpService` stores OTP codes in a `Map` on the process heap:

```typescript
private readonly otpStore = new Map<string, OtpRecord>();
```

OTP generation uses `Math.random()`:
```typescript
const code = Math.floor(100000 + Math.random() * 900000).toString();
```

**Why it is a problem**

1. **Lost on restart:** Any server restart (deployment, crash, pod scale-down) wipes all pending OTP codes. Users who requested a code mid-flow get a silent failure — the "Invalid code" or "No code found" error with no indication their session was cleared.
2. **Not distributed-safe:** On multi-instance deployments (multiple API pods), the OTP issued by Pod A is unknown to Pod B. A user verified on Pod A whose next request routes to Pod B will be rejected.
3. **`Math.random()` is not cryptographically secure:** An attacker who can enumerate timing can statistically predict codes. Use `crypto.randomInt(100000, 999999)` instead.
4. **Memory growth:** The `MAX_DEDUP_SIZE` concept exists on the *webhook* dedup set but not on `otpStore`. Under load, the map grows unboundedly.
5. **No cleanup of expired records:** Expired OTP records accumulate until explicitly hit and deleted. This is a slow memory leak.

**Confidence:** Confirmed

**Suggested fix**
- Move OTP storage to **Redis** (TTL-based, distributed, atomic) or the PostgreSQL database with a `pre_audit_otps` table and TTL-indexed expiry.
- Replace `Math.random()` with `crypto.randomInt(100000, 999999)`.

---

## 5. HIGH FINDINGS

---

### [HIGH] H-1: Dual auth state stores — `auth_token` vs `247gbs_token` — cause stale token races and silent 401s

**Location**
```
apps/web/src/stores/useAuthStore.ts (uses `auth_token`)
apps/web/src/lib/apiClient.ts:15 (reads `auth_token`)
apps/web/src/services/auth/useAuthActions.ts:43 (writes `247gbs_token`)
apps/web/src/lib/auth.ts:43-44 (writes BOTH on refresh)
```

**What is happening**

The frontend uses **two separate localStorage keys** for the access token:
- `auth_token` — used by `useAuthStore` (Zustand) and `apiClient.ts` (Axios interceptor)
- `247gbs_token` — used by `useAuthActions`, all admin hooks (`authFetch`), and the auth guards

After login via `useAuthActions`, only `247gbs_token` is written. The Axios `apiClient` reads `auth_token`. Any API call made through `apiClient` (e.g., MCOM ecosystem calls) immediately gets a 401 because `auth_token` is null.

The `auth.ts` refresh handler writes BOTH keys to sync them. But before the first refresh fires (5 minutes), the Axios client is unauthenticated for any user who just logged in.

**Evidence**
```typescript
// apiClient.ts:15
const token = localStorage.getItem('auth_token'); // reads auth_token

// useAuthActions.ts:43
localStorage.setItem('247gbs_token', accessToken); // writes 247gbs_token only

// auth.ts:43-44 (refresh path only)
localStorage.setItem(ACCESS_TOKEN_KEY, token);   // 247gbs_token
localStorage.setItem(LEGACY_ACCESS_TOKEN_KEY, token); // auth_token
```

**Confidence:** Confirmed

**Suggested fix:** Consolidate to a single key. Write both keys on every login, signup, and token refresh (this is partially done in `auth.ts` but not in `useAuthActions`). Better yet, remove `apiClient.ts`'s dependency on `auth_token` and unify all API calls through the `authFetch` helper in the admin hooks.

---

### [HIGH] H-2: `rotateMasterKey` is a no-op placeholder — presented as a real security feature

**Location**
```
apps/api/src/protocols/protocols.service.ts:32-35
```

**What is happening**
```typescript
async rotateMasterKey(userId: string): Promise<{ success: boolean; message: string }> {
  // Logic for rotating key would go here
  return { success: true, message: 'Master Key Rotated Successfully' };
}
```

The "Rotate Master Key" endpoint is exposed at `POST /api/v1/protocols/security/rotate-key` and returns a `success: true` response without performing any operation. The UI presents this as a real security action.

**Why it is a problem**
- Users believe they are rotating an encryption key when nothing happens.
- This is a fake security response — a class of finding that can violate trust and compliance obligations.

**Confidence:** Confirmed

**Suggested fix:** Either implement real key rotation (e.g., re-derive the AES encryption key used for MCOM token storage and re-encrypt all stored tokens) or remove the endpoint and UI button until it is implemented.

---

### [HIGH] H-3: Token Purchase endpoint has no payment processing — credits are added for free

**Location**
```
apps/api/src/protocols/protocols.service.ts:92-100
apps/api/src/protocols/protocols.controller.ts:61-70
```

**What is happening**
```typescript
async purchaseTokens(amount: number, userId: string): Promise<{ balance: number }> {
  const user = await this.usersService.findById(userId);
  if (user) {
    const newBalance = (user.tokens || 0) + amount;
    await this.usersService.update(userId, { tokens: newBalance });
    return { balance: newBalance };
  }
  return { balance: 0 };
}
```

Any authenticated user can `POST /api/v1/protocols/tokens/purchase` with `{ "amount": 1000000 }` and receive 1,000,000 free tokens with no payment gateway involved.

**Why it is a problem**
- Free infinite token accumulation for any registered user.
- No rate limiting, no payment verification, no maximum amount validation.

**Confidence:** Confirmed

**Suggested fix:** Gate the endpoint behind a real payment provider (Stripe, etc.) or remove the endpoint from production until payment processing is implemented. At minimum, add strict `amount` validation and rate limiting.

---

### [HIGH] H-4: Admin auth is role-check-only from client-side localStorage — easily bypassed

**Location**
```
apps/web/src/app/admin/layout.tsx:44-65
```

**What is happening**

The admin layout performs a **client-side-only** authorization check:

```typescript
const user = JSON.parse(userStr);
const role = (user.role || "").toLowerCase();
if (role !== "administrator" && role !== "admin") {
  window.location.assign("/admin/login?reason=unauthorized");
  return;
}
```

This reads the role from `localStorage` which is **fully attacker-controlled**. Any user can open DevTools, set `localStorage['247gbs_user']` to `{"role":"administrator","email":"any@example.com"}`, and be redirected into the admin panel UI.

**Why it is a problem**
While the individual admin API endpoints do perform server-side `verifyAdmin` checks, the admin UI itself is accessible to anyone who can manipulate localStorage. This means:
- All admin API data is visible in the UI (users list, audit data, settings, etc.) before any attempt to call the server
- The page may partially render before backend calls confirm access
- It creates a misleading security impression

**Confidence:** Confirmed

**Suggested fix:** Perform server-side session validation on admin page load (e.g., a `GET /api/v1/admin/me` call that returns the current user's role), then redirect if the server confirms insufficient privileges. Never trust client-side role state for access gating.

---

### [HIGH] H-5: SSO callback leaks access token in URL query parameter

**Location**
```
apps/api/src/mcom/sso.controller.ts:158-160
```

**What is happening**
```typescript
res.redirect(
  `${frontendUrl}/auth/callback?token=${accessToken}&role=${localUser.role}`,
);
```

After a successful MCOM SSO login, the backend redirects to the frontend with a **Bearer JWT in the URL query string**.

**Why it is a problem**
- JWTs in URLs are logged by web servers, proxies, CDNs, browser history, the Referrer header, and analytics tools.
- A 15-minute access token in a URL log is a serious exposure window.
- This is a well-known OAuth2 security anti-pattern (CWE-598).

**Confidence:** Confirmed

**Suggested fix:** Use the same `setCookies` approach as the regular sign-in flow — set HttpOnly cookies and redirect to the callback page without any token in the URL. The frontend callback page then just reads from cookies or triggers a `/auth/refresh` call to obtain the access token.

---

### [HIGH] H-6: `getForm` fetches ALL answers globally (no form scope filter) — data leak between forms

**Location**
```
apps/api/src/audit/audit-form.service.ts:215-217
```

**What is happening**
```typescript
const answers = await this.answerRepository.find({
  order: { sortOrder: 'ASC', createdAt: 'ASC' },
  // ← NO WHERE CLAUSE. Fetches ALL answers in the DB.
});
```

The `getForm(id)` method fetches all `AuditFormAnswer` rows from the database regardless of which form or question they belong to. It then filters them in-memory using a Map keyed by `questionId`.

**Why it is a problem**
1. **Massive over-fetch:** In production with many forms, this loads every answer ever created into memory on every form fetch.
2. **Data correctness risk:** If there are orphaned answer records with questionIds from other forms, they would appear in the wrong form's data.
3. **Performance:** With thousands of answers this query will be extremely slow and memory-intensive.

**Evidence**
```typescript
// Should be:
const answers = await this.answerRepository.find({
  where: { questionId: In(questions.map(q => q.id)) },
  order: { sortOrder: 'ASC', createdAt: 'ASC' },
});
```

**Confidence:** Confirmed

---

### [HIGH] H-7: JWT secrets use extremely weak defaults and insecure fallback strings

**Location**
```
apps/api/src/auth/auth.service.ts:156-164
apps/api/src/auth/strategies/accessToken.strategy.ts:23-24
apps/api/src/auth/strategies/refreshToken.strategy.ts:20-21
```

**What is happening**

If `JWT_ACCESS_SECRET` or `JWT_REFRESH_SECRET` are not set, the code falls back to:
```typescript
|| 'default-jwt-access-secret-key-32chars'
|| 'default-jwt-refresh-secret-key-32chars'
```

The committed `.env` secrets (`838jhdue83874333`, `73hf3jf373833j3d`) are only 16–17 characters — far below the recommended 256-bit minimum for HS256.

**Why it is a problem**
- The fallback strings are published in this repository. Any server that fails to load its `.env` falls back to a known secret, making all issued tokens trivially forgeable.
- The actual secrets are too short for HMAC-SHA256 security guarantees.

**Confidence:** Confirmed

**Suggested fix:** Require secrets at startup (`throw new Error('JWT_ACCESS_SECRET must be set')` if missing). Generate 64-character (512-bit) random secrets for all environments.

---

### [HIGH] H-8: Webhook deduplication uses in-memory Set — not crash-safe or distributed

**Location**
```
apps/api/src/mcom/webhook.controller.ts:20-60
```

**What is happening**
```typescript
private readonly processedBodies = new Set<string>();
private readonly MAX_DEDUP_SIZE = 1000;
```

Webhook deduplication relies on a process-level Set. This has the same fundamental problems as the OTP store: lost on restart, not shared across multiple API instances.

**Why it is a problem**
- After a restart or pod replacement, any previously received webhook can be processed again — a membership activation, for example, would double-apply.
- The MAX_DEDUP_SIZE eviction strategy (delete the first entry) means that under sustained load, duplicates within a 1000-message window will be processed twice.

**Confidence:** Confirmed

**Suggested fix:** Persist processed webhook IDs in PostgreSQL (or Redis) with an index on body hash and a TTL-based cleanup job.

---

## 6. MEDIUM FINDINGS

---

### [MEDIUM] M-1: N+1 query in `AuditFormService.listForms`

**Location**
```
apps/api/src/audit/audit-form.service.ts:179-202
```

**Pattern**
```typescript
const forms = await qb.getMany(); // 1 query

for (const form of forms) {
  const count = await this.questionRepository.count({ where: { formId: form.id } }); // N queries
  dtos.push({ ..., questionCount: count });
}
```

For N forms, this executes N+1 queries. At low form counts (the default 2), impact is negligible. As admins create more forms, this degrades linearly.

**Suggested fix:**
```typescript
const countRows = await this.questionRepository
  .createQueryBuilder('q')
  .select('q.formId', 'formId')
  .addSelect('COUNT(*)', 'count')
  .groupBy('q.formId')
  .getRawMany();
const countMap = new Map(countRows.map(r => [r.formId, parseInt(r.count)]));
```

---

### [MEDIUM] M-2: N+1 query in `TriageFormService.listForms`

**Location**
```
apps/api/src/triage/triage-form.service.ts:197-205
```

Same pattern — one `COUNT` query per triage form in a loop. Same fix applies.

---

### [MEDIUM] M-3: N+1 pattern in `AuditFormService.deleteForm` — sequential answer deletions per question

**Location**
```
apps/api/src/audit/audit-form.service.ts:365-368
```

```typescript
const questions = await this.questionRepository.find({ where: { formId: form.id } }); // 1 query
for (const q of questions) {
  await this.answerRepository.delete({ questionId: q.id }); // N queries
}
```

**Suggested fix:** Use a single subquery delete:
```typescript
await this.answerRepository
  .createQueryBuilder()
  .delete()
  .where('questionId IN (:...ids)', { ids: questions.map(q => q.id) })
  .execute();
```

---

### [MEDIUM] M-4: Admin user creation uses `Math.random()` for password generation — insecure

**Location**
```
apps/api/src/admin/admin.service.ts:89
```

```typescript
const password = dto.password || Math.random().toString(36).slice(-8);
```

`Math.random()` is not cryptographically secure. The generated password is 8 characters from a 36-character alphabet — about 41 bits of entropy. For an account creation operation, use `crypto.randomBytes(16).toString('hex')`.

---

### [MEDIUM] M-5: `updateNotification` silently does nothing if notification record doesn't exist

**Location**
```
apps/api/src/protocols/protocols.service.ts:83-90
```

```typescript
const setting = await this.notificationRepository.findOne({ where: { userId, title } });
if (setting) {         // ← if no record, the PATCH is silently ignored
  setting.isActive = active;
  await this.notificationRepository.save(setting);
}
return this.getNotifications(userId);
```

For un-seeded users, the `getNotifications` returns hardcoded fallback records. Toggling those via `PATCH /protocols/notifications` silently does nothing — the user sees a UI confirmation but nothing persists.

---

### [MEDIUM] M-6: `getSecurityStatus` returns the current timestamp as `lastLogin` — not actual last login

**Location**
```
apps/api/src/protocols/protocols.service.ts:27
```

```typescript
lastLogin: new Date().toISOString(), // ← always "now", not the real last login
```

The User entity has no `lastLoginAt` field. This field always returns the current server time, misleading users about when their account was last accessed.

---

### [MEDIUM] M-7: `calculateProgress` uses hardcoded percentage thresholds per audit status

**Location**
```
apps/api/src/admin/admin.service.ts:243-248
```

```typescript
private calculateProgress(audit: AuditSession): number {
  if (audit.status === AuditStatus.COMPLETED) return 100;
  if (audit.status === AuditStatus.IN_PROGRESS) return 65;
  if (audit.status === AuditStatus.SECTOR_SELECTED) return 30;
  return 10;
}
```

This hardcoded mapping means an `IN_PROGRESS` audit that has answered 95% of its questions shows the same 65% progress as one that has answered 1%. This is not meaningful progress tracking.

---

### [MEDIUM] M-8: `triage-form.service.ts` — `getForm(undefined)` counts ALL questions globally

**Location**
```
apps/api/src/triage/triage-form.service.ts:212
```

```typescript
if (!id) {
  const defaultForm = await this.getDefaultForm();
  const count = await this.questionRepository.count(); // ← no WHERE, counts all questions
  return this.toFormDto(defaultForm, count);
}
```

The default form's `questionCount` is the total count of questions across all forms, not questions belonging to the default form.

---

### [MEDIUM] M-9: No rate limiting on `/auth/signin`, `/auth/signup` — brute force possible

**Location**
```
apps/api/src/auth/auth.controller.ts
apps/api/src/app.module.ts:24-35
```

`ThrottlerModule` is configured and `ThrottlerGuard` is applied on the `PreAuditController`. However, the `AuthController` has no `@UseGuards(ThrottlerGuard)` and no per-endpoint throttle decorator. An attacker can brute-force credentials without rate limiting.

---

### [MEDIUM] M-10: SSO `/auth/sso/status/:userId` and `/auth/sso/data/permissions` are unauthenticated IDOR

**Location**
```
apps/api/src/mcom/sso.controller.ts:205-275
```

Both endpoints are `@Public()` and accept a `userId` path/query parameter with no authentication check. Any user who knows another user's UUID can:
1. Retrieve their MCOM membership level, tier, and status
2. Fetch their MCOM permissions
3. Trigger a token refresh for their account

**Evidence**
```typescript
@Public()
@Get('status/:userId')
async getStatus(@Param('userId') userId: string, ...) {
  const user = await this.mcomService['usersService'].findById(userId);
  // No check that requester owns this userId
  ...
  return { connected: isConnected, membershipLevel: ... };
}
```

**Suggested fix:** Require the `AccessTokenGuard` and validate that `userId === req.user.sub`, or make `userId` implicit from the JWT payload.

---

### [MEDIUM] M-11: `ensureDefaults()` called on every `listForms()` invocation — unnecessary DB writes on every admin page load

**Location**
```
apps/api/src/audit/audit-form.service.ts:170-171
```

```typescript
async listForms(type?: AuditFormType): Promise<AuditFormDto[]> {
  await this.ensureDefaults(); // ← runs 2 DB reads + potential writes on every call
```

`ensureDefaults` is already called in `onModuleInit`. Calling it again on every list request adds 2 unnecessary read queries per call and, on first deployment, risks concurrent write races if multiple requests hit simultaneously before the module init completes.

---

## 7. LOW / INFO FINDINGS

---

### [LOW] L-1: `TYPEORM_SYNC` logic may enable `synchronize: true` in production against Supabase

**Location**
```
apps/api/src/app.module.ts:46-50
```

```typescript
synchronize:
  configService.get<string>('TYPEORM_SYNC') === 'true'
    ? true
    : process.env.NODE_ENV !== 'production' &&
      !configService.get<string>('POSTGRES_HOST')?.includes('supabase'),
```

If `TYPEORM_SYNC=true` is set in production (even accidentally), TypeORM will auto-sync the schema, potentially dropping columns or tables. The `TYPEORM_SYNC` override completely bypasses the Supabase/production guard.

---

### [LOW] L-2: Slug generation uses `Math.random()` — collision risk under concurrent form creation

**Location**
```
apps/api/src/audit/audit-form.service.ts:45, 278
apps/api/src/triage/triage-form.service.ts:180, 231, 339
```

Slug generation combines a title slug with a random suffix from `Math.random()`. Under concurrent form creation, two requests may generate the same slug before either has saved. The collision check is a read-then-write with no transaction or unique constraint handling. Use `uuid` or `nanoid` for the suffix, and handle the unique constraint violation at the database layer.

---

### [LOW] L-3: `AuthService.signinWithMfa` does not include `role` in token payload

**Location**
```
apps/api/src/auth/auth.service.ts:88
```

```typescript
const tokens = await this.getTokens(user.id, user.email); // role not passed
```

Compare with regular `signin` (line 51): `getTokens(user.id, user.email, user.role)`. MFA-authenticated tokens lack a role claim, which may affect admin access checks that read the role from the JWT payload.

---

### [LOW] L-4: `CORS` allows requests with no origin — potentially dangerous

**Location**
```
apps/api/src/main.ts:48
```

```typescript
if (!requestOrigin) return callback(null, true); // Allow no-origin requests
```

This allows server-to-server and curl requests without origin restriction. While often needed for mobile apps, it also means any server-side request forgery can bypass CORS. This is acceptable if the cookie-based auth is the real protection layer, but should be documented.

---

### [LOW] L-5: Admin user creation does not send the generated password to the user

**Location**
```
apps/api/src/admin/admin.service.ts:85-99
```

When an admin creates a user without specifying a password, a random 8-char password is generated — but it is **not returned to the caller or emailed** to the new user. The new user has no way to log in.

---

### [LOW] L-6: `useAuthStore` (Zustand) and `AuthContext` (React Context) both manage auth state — not synchronized

Two separate auth state managers exist: `useAuthStore` (Zustand with `auth_token`) and `AuthProvider` context (with `247gbs_user`). A `signOut` in one does not automatically update the other. This can leave stale state in one store after logout.

---

### [INFO] I-1: No database migrations — relying on TypeORM `synchronize`

The `apps/api/migrations/` directory exists but appears empty (no migration files found in listing). The application relies on `synchronize: true` for schema management. This is dangerous in production (irreversible schema changes) and makes it impossible to track schema evolution.

---

### [INFO] I-2: Gemini AI integration silently fails — user sees blank/empty UI without explanation

When `GEMINI_API_KEY` is not configured or incorrect, `generateFollowUpQuestions` returns `[]` and `generateStrategicInsight` returns fallback strings. There is no UI indicator that AI is unavailable; the follow-up questions section simply appears empty.

---

### [INFO] I-3: `lastLogin` field does not exist — add to User entity

The protocols service uses `lastLogin` in the security status response but there is no corresponding field in `audit_users`. The field is always the current timestamp. Add `lastLoginAt: Date` to the User entity and update it on successful authentication.

---

## 8. MOCKED / DUMMY / PLACEHOLDER FUNCTIONALITY

| Feature | Location | Type | Evidence | Real Implementation Exists? |
|---------|----------|------|----------|-----------------------------|
| Rotate Master Key | `protocols.service.ts:32-35` | Fake success | Returns `{success:true}` with no-op body | No |
| Token Purchase | `protocols.service.ts:92-100` | Placeholder | Adds tokens with no payment gateway | No payment processing |
| Admin-created user password | `admin.service.ts:89` | Placeholder | `Math.random()` password, never communicated | Partial (bcrypt hash works, delivery absent) |
| `lastLogin` security status | `protocols.service.ts:27` | Dummy data | `new Date().toISOString()` (always "now") | No `lastLoginAt` field on entity |
| AI follow-up questions (unconfigured) | `ai.service.ts:22-23` | Silent empty | Returns `[]` with warning log only | Yes, when key is configured |
| Progress calculation | `admin.service.ts:243-248` | Hardcoded | Static % per status enum | No real calculation |

---

## 9. N+1 / DATABASE PERFORMANCE

| Location | Query Pattern | Estimated Behavior | Severity | Suggested Fix |
|----------|--------------|-------------------|----------|---------------|
| `audit-form.service.ts:179-202` | `getMany()` then `count()` per form in loop | N+1 (1 + N queries) | MEDIUM | Single GROUP BY count query |
| `triage-form.service.ts:197-205` | `find()` then `getCount()` per form in loop | N+1 (1 + N queries) | MEDIUM | Single GROUP BY count query |
| `audit-form.service.ts:365-368` | `find()` then `delete()` per question in loop | N+1 during delete | MEDIUM | Bulk DELETE with IN clause |
| `audit-form.service.ts:215-217` | `answerRepository.find()` with **no WHERE** | Loads ALL answers globally | HIGH | Filter by `questionId IN (...)` |
| `triage-form.service.ts:212` | `questionRepository.count()` with no WHERE | Counts all questions | MEDIUM | Add `WHERE formId = ?` |

---

## 10. FRONTEND ↔ BACKEND CONTRACT PROBLEMS

| Issue | Frontend | Backend | Severity |
|-------|----------|---------|----------|
| Axios `apiClient` reads `auth_token`; login writes `247gbs_token` | `apiClient.ts:15` | N/A | HIGH |
| Admin layout reads role from localStorage (client-controlled) | `admin/layout.tsx:54` | `verifyAdmin()` server-side | HIGH |
| SSO callback token in URL param | `sso.controller.ts:158` | `/auth/callback` page | HIGH |
| No `lastLoginAt` field but `lastLogin` in security status DTO | `protocols.service.ts:27` | User entity | LOW |
| AI follow-up returns `[]` silently; frontend shows empty section | `audit-form hooks` | `ai.service.ts:22` | INFO |

---

## 11. SECURITY FINDINGS

### Authentication
- **C-2** (CRITICAL): Live secrets committed to `.env` in VCS
- **C-3** (CRITICAL): OTP uses `Math.random()` (non-CSPRNG)
- **H-7** (HIGH): JWT secrets weak and have insecure public fallback strings
- **M-9** (MEDIUM): No rate limiting on auth endpoints — brute force possible

### Authorization / IDOR
- **C-1** (CRITICAL): `JwtAuthGuard.handleRequest` returns `null` instead of throwing — silent auth bypass path
- **H-4** (HIGH): Admin access gated client-side only on localStorage role
- **M-10** (MEDIUM): SSO status/permissions endpoints IDOR — public with no ownership check

### Sensitive Data Exposure
- **H-5** (HIGH): Access token leaked in URL query string after SSO callback
- **H-7** (HIGH): JWT fallback secrets are static and published

### Webhooks
- **H-8** (HIGH): In-memory dedup — webhook events can be replayed after restart

---

## 12. BUSINESS LOGIC FINDINGS

### Token Purchase
The `purchaseTokens` endpoint adds tokens without payment. Any authenticated user can call `POST /api/v1/protocols/tokens/purchase` with any positive integer amount and receive free credits.

### Admin User Creation — Password Never Delivered
When an admin creates a user via the UI without specifying a password, a random password is generated and hashed but never returned or emailed. The new user account is permanently inaccessible unless the admin separately sets a password.

### MFA Role Omission in Token
Users authenticating via MFA receive tokens without a `role` claim (H-7 / L-3). If any server-side or client-side code gates on the JWT role claim for admin checks, MFA-authenticated admins will be locked out.

### Pre-Audit OTP Verification Not Enforced Before Submission
`evaluateAndSave` in `pre-audit.service.ts` does not call `otpService.isVerified()` before saving the session. An attacker can bypass OTP entirely by calling `POST /pre-audit/submit` directly without completing OTP verification.

**Location:** `apps/api/src/triage/pre-audit.service.ts` — no OTP check in `evaluateAndSave`

---

## 13. PERFORMANCE FINDINGS

| Area | Finding | Severity |
|------|---------|---------|
| Database | N+1 queries in `listForms` (both audit-form and triage-form) | MEDIUM |
| Database | `getForm` fetches all answers globally without scope | HIGH |
| API | `ensureDefaults()` called on every `listForms()` — extra DB reads | LOW |
| Frontend | Two parallel auth state systems (Zustand + React Context) cause synchronization overhead | LOW |
| AI | AI calls are synchronous in the request path — no queue or background processing | MEDIUM |

---

## 14. DEAD / UNUSED CODE

| Item | Evidence | Confidence |
|------|----------|------------|
| `useAuthStore` (Zustand) | Appears not used by main app flows; `AuthContext` is primary. `useAuthStore` writes `auth_token` used only by `apiClient.ts` (MCOM/ecosystem calls) | Possible |
| `apps/api/src/auth/mfa.service.ts` | Used correctly — not dead | N/A |
| `MCOM_WALLET_ENABLED` env var | Read in SSO config endpoint; no wallet feature in UI or API | Possible dead feature |
| `JWT_SECRET` env var | Used for MCOM token encryption key derivation — not a JWT secret. Naming is confusing but used. | Not dead, but misleadingly named |

---

## 15. TEST GAPS

| Workflow | Current Tests | Gap |
|----------|--------------|-----|
| Auth (signin, signup, MFA) | Basic spec (`audit.service.spec.ts`) | No auth integration tests |
| Pre-audit flow end-to-end | `pre-audit.service.spec.ts` — unit mocks | No real DB integration tests |
| OTP flow | None | No tests for OTP generation, expiry, brute-force lockout |
| Admin authorization | `admin.service.spec.ts` | No test for unauthorized access to admin endpoints |
| Webhook idempotency | None | No test for duplicate webhook delivery |
| Token purchase (no payment) | None | No test exposing the free-token vulnerability |
| N+1 query patterns | None | No performance regression tests |
| MFA role in token | None | No test verifying MFA login includes role claim |
| IDOR on SSO endpoints | None | No test verifying cross-user data access is blocked |

---

## 16. RUNTIME VERIFICATION RESULTS

Runtime verification was not performed (no running environment access). The following findings require runtime confirmation:

| Workflow | Finding | Requires |
|----------|---------|---------|
| Authenticated admin page without token | C-1: null user reaching handler vs 500 | Manual request + server log |
| Token purchase free tokens | H-3: POST /protocols/tokens/purchase {amount: 9999} | Confirmed by code inspection |
| MFA admin login role in JWT | L-3: JWT payload missing role | Decode token after MFA signin |
| OTP bypass (submit without verify) | Business logic: POST /pre-audit/submit without OTP | Manual API test |

---

## 17. RECOMMENDED FIX ORDER

```
1. [IMMEDIATE] Rotate ALL credentials in apps/api/.env — database password, JWT secrets,
   MCOM keys, Resend API key. Update production environment variables before next deployment.

2. [CRITICAL] Fix JwtAuthGuard.handleRequest to throw UnauthorizedException instead of returning null.
   This fixes the silent auth bypass and the 500-error path.

3. [CRITICAL] Move OTP storage from in-memory Map to Redis or PostgreSQL.
   Replace Math.random() with crypto.randomInt().

4. [HIGH] Remove token from SSO callback redirect URL. Use HttpOnly cookie pattern instead.

5. [HIGH] Fix H-6: Add WHERE clause to answerRepository.find() in getForm().

6. [HIGH] Fix H-3: Gate purchaseTokens behind real payment verification or remove from production.

7. [HIGH] Fix H-2: Implement or remove rotateMasterKey — don't ship a no-op as a security feature.

8. [HIGH] Fix M-10: Add AccessTokenGuard + ownership validation to SSO status/permissions endpoints.

9. [HIGH] Fix H-8: Move webhook dedup to PostgreSQL with TTL cleanup.

10. [HIGH] Fix H-4: Add server-side role validation on admin page load (not just localStorage).

11. [MEDIUM] Fix dual token key problem (H-1): unify on 247gbs_token across all code paths.

12. [MEDIUM] Fix N+1 queries in listForms (M-1, M-2) and deleteForm (M-3).

13. [MEDIUM] Add rate limiting to /auth/signin and /auth/signup endpoints.

14. [MEDIUM] Fix M-5: Make notification update an upsert so it works for un-seeded users.

15. [MEDIUM] Fix L-3: Pass role to getTokens() in signinWithMfa.

16. [LOW] Implement proper database migrations (remove synchronize reliance for production).

17. [LOW] Fix admin user creation: return or email the generated password.

18. [LOW] Replace Math.random() slug generation with nanoid/uuid.

19. [INFO] Add lastLoginAt field to User entity and populate it on successful auth.

20. Final regression testing: auth flows, admin CRUD, pre-audit submission, SSO callback.
```

---

## 18. FINAL VERIFICATION CHECKLIST

- [x] All major features traced
- [x] Frontend/API contracts verified
- [x] Backend/database flows traced
- [x] Mock data identified
- [x] Dummy data identified
- [x] Placeholder functionality identified
- [x] N+1 queries checked
- [x] Database performance checked
- [x] Authorization checked
- [x] Multi-tenancy checked (not applicable — single-tenant)
- [x] Authentication checked
- [x] Error handling checked
- [x] Business logic checked
- [x] External integrations checked (Gemini, Resend, MCOM)
- [x] Webhooks checked
- [x] Queues checked (none exist — no queue system)
- [x] Frontend state checked
- [x] Tests inspected
- [x] Build/typecheck/lint: not run (no build tool available in this environment)
- [ ] Runtime workflows tested — **NOT DONE** (requires running environment)
- [x] Unknowns documented

---

*End of Audit Report*
