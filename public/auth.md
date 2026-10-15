# auth.md

You are an agent. The Ekbasis API at `https://openinterp.org/api/v1` supports **agentic registration** ([auth.md](https://github.com/workos/auth.md), v0.6): discover → register with the user's email → the user confirms a code you show them → exchange for an access_token → call the API → handle revocation. Follow the steps in order.

Ekbasis is a consequence model: before an action runs, it answers typed questions about what the action will do (will it lose work? will it fail?), in one forward pass. What to ask it and how: https://openinterp.org/ekbasis/agents.md

Here the resource server and the authorization server are the same host: `https://openinterp.org`.

## Step 1 — Discover

A request to the API without a valid key returns 401 with:

```http
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer resource_metadata="https://openinterp.org/.well-known/oauth-protected-resource"
```

```http
GET https://openinterp.org/.well-known/oauth-protected-resource
```

```json
{
  "resource": "https://openinterp.org/api/v1",
  "resource_name": "Ekbasis API (OpenInterpretability)",
  "resource_logo_uri": "https://openinterp.org/icon.svg",
  "authorization_servers": ["https://openinterp.org"],
  "scopes_supported": ["ekbasis.api"],
  "bearer_methods_supported": ["header"]
}
```

```http
GET https://openinterp.org/.well-known/oauth-authorization-server
```

It restates the above and adds `issuer`, `token_endpoint` (`https://openinterp.org/oauth2/token`), `revocation_endpoint` (`https://openinterp.org/oauth2/revoke`), `grant_types_supported` (the JWT-bearer grant and `urn:workos:agent-auth:grant-type:claim`) and the `agent_auth` block: `identity_endpoint` `https://openinterp.org/agent/identity`, `claim_endpoint` `https://openinterp.org/agent/identity/claim`, `identity_types_supported: ["service_auth"]`. The metadata wins if it ever disagrees with this file.

## Step 2 — Pick a method

Only **`service_auth`** is enabled: you need the user's email, and the user confirms a code. `anonymous` and `identity_assertion` (ID-JAG) answer `anonymous_not_enabled` / `issuer_not_enabled`.

## Step 3 — Register

Before sending, tell the user what you are about to do — "I'll get an Ekbasis API key on your openinterp.org account (scope `ekbasis.api`); calls use your credits" — and get their OK.

```http
POST https://openinterp.org/agent/identity
Content-Type: application/json

{ "type": "service_auth", "login_hint": "user@example.com" }
```

Response (200):

```json
{
  "registration_id": "reg_...",
  "registration_type": "service_auth",
  "claim_url": "https://openinterp.org/agent/identity/claim",
  "claim_token": "clm_...",
  "claim_token_expires": "…",
  "post_claim_scopes": ["ekbasis.api"],
  "claim": {
    "user_code": "123456",
    "expires_in": 600,
    "verification_uri": "https://openinterp.org/claim?claim_attempt_token=cat_...",
    "interval": 5
  }
}
```

`claim_token` is returned once: keep it in memory until Step 4 ends; do not persist it.

## Step 4 — Claim ceremony

### 4b. Hand off to the user

Show both in one message:

> Open this link, sign in (or sign up — it's free) with **user@example.com**, and type this 6-digit code on the page: **123456**
> https://openinterp.org/claim?claim_attempt_token=…

The code goes into the page, not back to you. The page only accepts the account whose verified email is the `login_hint`.

### 4c. Poll for completion

```http
POST https://openinterp.org/oauth2/token
Content-Type: application/x-www-form-urlencoded

grant_type=urn:workos:agent-auth:grant-type:claim&claim_token=clm_...
```

Every `interval` seconds (5). While waiting: `{ "error": "authorization_pending" }`; too fast: `slow_down`. On success (once — the `claim_token` cannot be exchanged twice):

```json
{
  "access_token": "<an Ekbasis API key>",
  "token_type": "Bearer",
  "expires_in": 86400,
  "scope": "ekbasis.api",
  "identity_assertion": "<service-signed JWT>",
  "assertion_expires": "…"
}
```

If the 10-minute code window passes (`expired_token`), get a fresh code with the same `claim_token` and email:

```http
POST https://openinterp.org/agent/identity/claim
Content-Type: application/json

{ "claim_token": "clm_...", "email": "user@example.com" }
```

It returns a `claim_attempt` block of the same shape; show the new code and link and resume polling. `410 claim_expired` means the 24-hour registration window closed: restart at Step 3.

## Step 5 — Exchange the assertion

When the access_token expires (24 h), get a new one with the `identity_assertion` (valid for 30 days):

```http
POST https://openinterp.org/oauth2/token
Content-Type: application/x-www-form-urlencoded

grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=<identity_assertion>
```

Response: `{ "access_token", "token_type": "Bearer", "expires_in": 86400, "scope": "ekbasis.api" }`. `invalid_grant` means the assertion expired, was superseded, or the user revoked your access: restart at Step 3.

## Step 6 — Use the access_token

The API base is `https://openinterp.org/api/v1` (the `resource`); its paths are in the OpenAPI document. For example:

```http
POST https://openinterp.org/api/v1/v1/systemone
Authorization: Bearer <access_token>
Content-Type: application/json

{ "state": "A Linux shell in a project folder. notes.txt does not exist.",
  "questions": { "fails": { "type": "noul", "instructions": "Will the command `cat notes.txt` fail?" } } }
```

The access_token is an ordinary Ekbasis API key: with the Python client, `EKBASIS_URL=https://openinterp.org/api/v1 EKBASIS_API_KEY=<access_token>`. The account pays per input token from prepaid credits: `402 insufficient_credits` means the user has to add credits at https://openinterp.org/console — tell them; do not retry. API reference: https://openinterp.org/api/v1/openapi.json

## Errors

| Code | Where | What to do |
| --- | --- | --- |
| `anonymous_not_enabled`, `issuer_not_enabled` | `/agent/identity` | Use `service_auth`. |
| `invalid_login_hint`, `invalid_request` | `/agent/identity`, `/agent/identity/claim` | Fix the body (a real email). |
| `rate_limited` (429) | `/agent/identity` | Back off; retry after the `Retry-After` header. |
| `invalid_claim_token` | `/agent/identity/claim` | Restart at Step 3. |
| `claimed_or_in_flight` | `/agent/identity/claim` | Already confirmed: poll the token endpoint. |
| `claim_expired` (410) | `/agent/identity/claim` | Restart at Step 3. |
| `authorization_pending` | `/oauth2/token` | Keep polling every `interval` seconds. |
| `slow_down` | `/oauth2/token` | Add 5 s to your interval. |
| `expired_token` | `/oauth2/token` | Re-initiate at `/agent/identity/claim`; if that says `claim_expired`, restart at Step 3. |
| `invalid_grant` | `/oauth2/token` | Restart at Step 3. |
| `unsupported_grant_type` | `/oauth2/token` | Use one of the two grants above. |
| `402 insufficient_credits` | `/api/v1/...` | The user must add credits at /console. |

## Revocation

- You can revoke an access_token (RFC 7009): `POST https://openinterp.org/oauth2/revoke` with `token=<access_token>` (form-encoded). 200, idempotent; your identity_assertion still works (Step 5).
- The user can revoke your key (named `Agent via auth.md`) in the console. After that, Step 5 answers `invalid_grant`: restart at Step 3 only if the user asks you to.
