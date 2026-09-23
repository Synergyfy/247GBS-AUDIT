# 247GBS Audit Backend API Documentation

Welcome to the API documentation for the 247GBS Audit Backend. This document provides a comprehensive guide to all available endpoints, their usage, access controls, payloads, and response structures.

---

## Table of Contents
1. [Authentication](#1-authentication)
2. [Users](#2-users)
3. [Triage](#3-triage)
4. [Audit](#4-audit)
5. [Dashboard](#5-dashboard)
6. [Protocols](#6-protocols)
7. [Admin](#7-admin)
8. [Miscellaneous](#8-miscellaneous)

---

## 1. Authentication
Endpoints for user registration, login, and token management.

### POST `/auth/signup`
- **Use**: Register a new user account.
- **Who can use**: Public.
- **Payload**: `CreateUserDto`
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe",
  "businessName": "Global Corp"
}
```
- **Response**:
```json
{
  "accessToken": "ey..."
}
```
*(Also sets `refresh_token` in an HttpOnly cookie)*

### POST `/auth/signin`
- **Use**: Authenticate a user and receive an access token.
- **Who can use**: Public.
- **Payload**: `AuthDto`
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```
- **Response**:
```json
{
  "accessToken": "ey..."
}
```

### GET `/auth/logout`
- **Use**: Invalidate the refresh token and clear the auth cookie.
- **Who can use**: Authenticated Users.
- **Response**:
```json
{
  "message": "Logged out"
}
```

### GET `/auth/refresh`
- **Use**: Exchange the refresh cookie for a new access token.
- **Who can use**: Authenticated Users (via Refresh Token).
- **Response**:
```json
{
  "accessToken": "ey..."
}
```

---

## 2. Users
Endpoints for managing user profiles.

### GET `/users/profile`
- **Use**: Retrieve current user profile details.
- **Who can use**: Authenticated Users.
- **Response**:
```json
{
  "id": "uuid-123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "businessName": "Global Corp",
  "role": "Administrator",
  "tokens": 12
}
```

### PATCH `/users/profile`
- **Use**: Update user profile information.
- **Who can use**: Authenticated Users.
- **Payload**: `UpdateProfileDto`
```json
{
  "firstName": "Johnny",
  "location": "London, UK",
  "website": "www.globalcorp.com"
}
```
- **Response**: Updated user profile object.

---

## 3. Triage
The entry point for the "Henry Flow Model" to decide if an audit is needed.

### POST `/triage`
- **Use**: Submit business screening questions to get an audit recommendation.
- **Who can use**: Authenticated Users.
- **Payload**: `CreateTriageDto`
```json
{
  "hasExcessStock": "yes",
  "stockExtent": 25,
  "stockImpact": "serious",
  "hasSpareCapacity": "no",
  "monthlyTurnover": "10k-50k",
  "isReady": "yes"
}
```
- **Response**:
```json
{
  "triageId": "uuid-1234",
  "decision": "CRITICAL",
  "auditType": "LONG_FORM",
  "auditSessionId": "uuid-5678"
}
```

---

## 4. Audit
Management of forensic audit sessions.

### GET `/audit`
- **Use**: List all audit sessions for the authenticated user.
- **Who can use**: Authenticated Users.
- **Response**: Array of audit session objects.

### GET `/audit/:id`
- **Use**: Get specialized metrics and state of a specific audit.
- **Who can use**: Owner of the audit.
- **Response**: Audit session details including `calculatedMetrics`.

### PATCH `/audit/:id/sector`
- **Use**: Select the business sector/group for the audit context.
- **Who can use**: Owner of the audit.
- **Payload**:
```json
{
  "sectorId": "hospitality-food",
  "groupId": "dining",
  "businessTypeId": "fine-dining"
}
```

### PUT `/audit/:id/answers`
- **Use**: Submit audit raw data for real-time calculation.
- **Who can use**: Owner of the audit.
- **Payload**: Map of question IDs to values.
```json
{
  "stock_value_excess": 5000,
  "idle_staff_hours": 10
}
```

### POST `/audit/:id/ai/generate-questions`
- **Use**: Generate AI-powered follow-up questions via Gemini.
- **Who can use**: Owner of the audit.

### POST `/audit/:id/ai/generate-insight`
- **Use**: Generate strategic pivots and insights based on audit data.
- **Who can use**: Owner of the audit.

---

## 5. Dashboard
Aggregated analytics for the business owner.

### GET `/dashboard`
- **Use**: Returns stats, recent audits, and AI advisor suggestions.
- **Who can use**: Authenticated Users.
- **Response**: `DashboardResponseDto`

### GET `/dashboard/intelligence`
- **Use**: Returns forensic intelligence (Growth forecast, leakage heatmaps).
- **Who can use**: Authenticated Users.

---

## 6. Protocols
Infrastructure and safety settings.

### GET `/protocols/security`
- **Use**: Check 2FA and Master Key status.
- **Who can use**: Authenticated Users.

### POST `/protocols/security/rotate-key`
- **Use**: Rotate the vault encryption key.
- **Who can use**: Authenticated Users.

### GET `/protocols/billing`
- **Use**: Retrieve subscription plan and invoice history.
- **Who can use**: Authenticated Users.

### GET `/protocols/notifications`
- **Use**: Returns user notification preferences.
- **Who can use**: Authenticated Users.

### PATCH `/protocols/notifications`
- **Use**: Toggles a notification setting.
- **Who can use**: Authenticated Users.

### POST `/protocols/tokens/purchase`
- **Use**: Purchase vault tokens.
- **Who can use**: Authenticated Users.

---

## 7. Admin
Management endpoints for platform administrators.

### GET `/admin/dashboard`
- **Use**: Returns all dashboard data aggregated (stats, activities, trends).
- **Who can use**: Admins only.

### GET `/admin/users`
- **Use**: Returns a list of users with optional search.
- **Who can use**: Admins only.
- **Query Params**: `search` (optional)

### POST `/admin/users`
- **Use**: Create a new user or admin.
- **Who can use**: Admins only.
- **Payload**: `AdminCreateUserDto`

### PATCH `/admin/users/:id`
- **Use**: Update user details (role, status, etc.).
- **Who can use**: Admins only.
- **Payload**: `AdminUpdateUserDto`

### DELETE `/admin/users/:id`
- **Use**: Remove a user from the platform.
- **Who can use**: Admins only.

### GET `/admin/audits`
- **Use**: Returns a list of audits with filtering and search.
- **Who can use**: Admins only.
- **Query Params**: `filter`, `search` (optional)

### POST `/admin/audits`
- **Use**: Initiate a new audit session for a user.
- **Who can use**: Admins only.
- **Payload**: `AdminCreateAuditDto`

### GET `/admin/audits/:id`
- **Use**: Get full details for a specific audit.
- **Who can use**: Admins only.

### PATCH `/admin/audits/:id`
- **Use**: Update audit status or details.
- **Who can use**: Admins only.
- **Payload**: `AdminUpdateAuditDto`

### DELETE `/admin/audits/:id`
- **Use**: Remove an audit session.
- **Who can use**: Admins only.

### GET `/admin/audits/metrics`
- **Use**: Returns summary metrics (Active, Overdue, etc.).
- **Who can use**: Admins only.

### GET `/admin/stats`
- **Use**: Returns main statistics cards for the dashboard.
- **Who can use**: Admins only.

### GET `/admin/activities`
- **Use**: Returns recent system activities.
- **Who can use**: Admins only.

### GET `/admin/trends`
- **Use**: Returns audit volume trends over time.
- **Who can use**: Admins only.

---

## 8. Miscellaneous

### GET `/`
- **Use**: Basic health check / Welcome message.
- **Who can use**: Public.
- **Response**: String "Hello World!"