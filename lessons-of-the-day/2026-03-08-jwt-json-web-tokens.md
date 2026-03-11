# JWT (JSON Web Tokens) – Deep Dive

## 📋 Learning Objectives

- [ ] Understand what a JWT is and its three-part structure (header.payload.signature)
- [ ] Learn standard claims (iss, sub, aud, exp, iat) and custom claims
- [ ] Master signing and verification (HMAC vs RSA/ECDSA)
- [ ] Use JWTs for stateless API authentication and session-like flows
- [ ] Understand security pitfalls (alg:none, secret handling, expiration)
- [ ] Relate JWTs to OAuth 2.0 and OpenID Connect (OIDC)
- [ ] Implement create/verify in code and recognize when to use JWT vs sessions

---

## 🎯 Definition

A **JSON Web Token (JWT)** is a compact, URL-safe way to represent claims between two parties. It consists of three Base64url-encoded segments separated by dots: **header.payload.signature**. The payload carries claims (e.g. user id, roles, expiry); the signature ensures the token was issued by a trusted party and wasn’t tampered with.

**Origin:**
- RFC 7519 (May 2015), part of the JOSE (JSON Object Signing and Encryption) suite
- Widely used for stateless API auth, OAuth 2.0 access tokens, and OpenID Connect ID tokens
- Supported by all major languages and frameworks

**Key Principle:**
> "Encode claims in a signed token so that the receiver can verify who issued it and that it wasn’t modified—without calling the issuer on every request."

**Alternative formulation:**
> "A JWT is a signed, self-contained credential: the server that issues it signs the payload; any service that knows the key can verify and trust the claims without contacting the issuer."

---

## 🏗️ Structure

### The Three Parts

```
┌─────────────────────────────────────────────────────────────────┐
│  JWT = header.payload.signature                                  │
│                                                                  │
│  xxxxx.yyyyy.zzzzz                                               │
│    │      │      │                                               │
│    │      │      └── SIGNATURE (proves authenticity)             │
│    │      └── PAYLOAD (claims: who, when, custom data)            │
│    └── HEADER (algorithm, token type)                            │
└─────────────────────────────────────────────────────────────────┘
```

**1. Header** – Algorithm and type (e.g. `{"alg":"HS256","typ":"JWT"}`).  
**2. Payload** – Claims (e.g. `sub`, `exp`, `iat`, custom keys).  
**3. Signature** – Cryptographic signature over `base64url(header).base64url(payload)` so the token cannot be altered without the secret/key.

Decoded example:

```json
// HEADER
{ "alg": "HS256", "typ": "JWT" }

// PAYLOAD (claims)
{
  "sub": "user-123",
  "name": "Jane Doe",
  "iat": 1640000000,
  "exp": 1640003600
}
```

---

## 📦 Core Concepts

### Standard (Registered) Claims

| Claim | Full name | Description |
|-------|-----------|-------------|
| **iss** | Issuer | Who issued the token (e.g. your auth server) |
| **sub** | Subject | Who the token is about (e.g. user id) |
| **aud** | Audience | Who should accept the token (e.g. API identifier) |
| **exp** | Expiration | Unix time after which the token is invalid |
| **iat** | Issued At | Unix time when the token was created |
| **nbf** | Not Before | Unix time before which the token is invalid |

You can add **custom claims** (e.g. `roles`, `email`, `tenant_id`). Keep the payload small; put only what consumers need to authorize or personalize.

### Signing Algorithms

| Type | Algorithm | Use case |
|------|-----------|----------|
| **Symmetric** | HS256, HS384, HS512 | Single service issues and verifies; shared secret |
| **Asymmetric** | RS256, RS384, RS512, ES256… | Issuer has private key; consumers verify with public key (multi-service, OIDC) |

**Rule of thumb:** Use **RS256** (or similar) when multiple services must verify tokens and only the auth server should sign; use **HS256** when one service both issues and verifies and you can keep the secret safe.

### How Verification Works

```
1. Split token on "." → header, payload, signature
2. Recompute signature: sign(header + "." + payload, secret_or_public_key)
3. Compare with the signature in the token (constant-time!)
4. If they match and exp > now (and aud/iss if checked) → token is valid
```

Never trust the token’s payload without verifying the signature and checking **exp** (and optionally **aud**, **iss**).

---

## 🔄 Typical Flows

### Stateless API Authentication

```
┌──────────┐                    ┌─────────────┐                    ┌──────────┐
│  Client  │  1. Login (e.g.     │  Auth       │  2. Issue JWT      │  Client  │
│          │     username/pwd)   │  Server     │  (signed)           │          │
│          │ ──────────────────▶│             │ ──────────────────▶│          │
│          │                    │             │                    │          │
│          │  3. Request +      │             │                    │  API     │
│          │     Authorization: │             │                    │  Server  │
│          │     Bearer <JWT>   │             │                    │          │
│          │ ────────────────────────────────────────────────────▶│          │
│          │                    │             │  4. Verify JWT     │          │
│          │                    │             │     (signature +   │          │
│          │                    │             │      exp); use    │          │
│          │  5. Response       │             │     sub/claims      │          │
│          │ ◀────────────────────────────────────────────────────│          │
└──────────┘                    └─────────────┘                    └──────────┘
```

The API server does **not** call the auth server on each request; it only needs the public key (or shared secret) to verify the JWT.

### Relation to OAuth 2.0 and OIDC

- **OAuth 2.0** – Access tokens are often **opaque**; in many implementations they are **JWTs** so APIs can verify them without a central introspection call.
- **OpenID Connect (OIDC)** – ID tokens are **always JWTs** (signed, with `iss`, `sub`, `aud`, `exp`, `iat`). So after an OAuth/OIDC login, the client often receives a JWT (access token and/or ID token).

---

## 💻 Implementation Examples

### Creating a JWT (Node.js with jsonwebtoken)

```javascript
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET; // or use a key pair for RS256

const token = jwt.sign(
  {
    sub: 'user-123',
    name: 'Jane Doe',
    roles: ['user', 'editor']
  },
  secret,
  { algorithm: 'HS256', expiresIn: '1h', issuer: 'my-auth-server' }
);

console.log(token); // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....
```

### Verifying a JWT (Node.js)

```javascript
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const token = auth.slice(7);
  try {
    const decoded = jwt.verify(token, secret, {
      algorithms: ['HS256'],
      issuer: 'my-auth-server',
      audience: 'my-api'
    });
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
```

### Python (PyJWT)

```python
import jwt
from datetime import datetime, timedelta

SECRET = "your-256-bit-secret"
payload = {
    "sub": "user-123",
    "name": "Jane Doe",
    "iat": datetime.utcnow(),
    "exp": datetime.utcnow() + timedelta(hours=1),
}
token = jwt.encode(payload, SECRET, algorithm="HS256")

# Verify
decoded = jwt.decode(token, SECRET, algorithms=["HS256"], audience="my-api")
print(decoded["sub"])
```

---

## 🔐 Security Considerations

### 1. Reject `alg: "none"`

Some old libraries allowed "none" and skipped verification. **Always** pass an explicit list of allowed algorithms when verifying (e.g. `algorithms: ['HS256']` or `['RS256']`).

### 2. Use Short Expiration

Keep access token lifetime short (e.g. 15–60 minutes). Use refresh tokens or re-login for longer sessions.

### 3. Validate Audience and Issuer

Set and check **aud** and **iss** so a token issued for one API or issuer cannot be used elsewhere.

### 4. Protect the Secret / Private Key

- **HS***: Shared secret must be strong (e.g. 256 bits) and never in client code or logs.
- **RS***/ES***: Private key only on the auth server; distribute only the public key to APIs.

### 5. Don’t Put Sensitive Data in the Payload

Payload is Base64-encoded, not encrypted. Anyone can decode it. Put only non-sensitive claims (ids, roles, scopes); never passwords or secrets.

### 6. Prefer HTTPS

Send JWTs only over TLS so they cannot be stolen or tampered in transit.

---

## 📊 When to Use JWT

| Scenario | Use JWT? |
|----------|-----------|
| Stateless API auth (many services, no shared session store) | ✅ |
| OAuth 2.0 access tokens or OIDC ID tokens | ✅ |
| Short-lived, verifiable identity/claims | ✅ |
| Single app with server-side sessions only | ⚠️ Sessions often simpler |
| Very large claims or frequent rotation | ⚠️ Consider opaque tokens + introspection |
| Need to revoke immediately (logout all devices) | ⚠️ JWT is valid until exp; use short TTL + blocklist or opaque tokens |

---

## ⚠️ Common Pitfalls

1. **Trusting payload without verifying** – Always verify signature and **exp** (and **aud**/ **iss** where applicable).  
2. **Allowing `alg: none`** – Use an explicit `algorithms` whitelist in the library.  
3. **Weak secret (HS256)** – Use a long, random secret (e.g. 32+ bytes).  
4. **Sensitive data in payload** – Assume payload is visible; encode only what’s needed for auth/authz.  
5. **No expiration or very long exp** – Reduces impact of token theft; keep access token lifetime short.

---

## 🎯 Best Practices

1. **Short-lived access tokens** – e.g. 15–60 min; refresh via refresh token or re-auth.  
2. **Explicit algorithm list** – Never rely on the token’s `alg`; pass `algorithms: ['HS256']` or `['RS256']`.  
3. **Validate iss, aud, exp** – Align with your auth server and API identifiers.  
4. **Keep payload small** – Improves performance and reduces exposure.  
5. **Use RS256 (or similar) in multi-service setups** – So only the auth server has the private key.  
6. **Prefer established libraries** – e.g. `jsonwebtoken` (Node), `PyJWT` (Python), and validate dependencies.

---

## 🔗 Related Patterns & Topics

| Topic | Relationship |
|-------|--------------|
| **OAuth 2.0** | Access tokens are often JWTs; OAuth defines how the client gets the token. |
| **OpenID Connect (OIDC)** | ID tokens are JWTs with standard claims. |
| **Session-based auth** | Alternative when you have a single app and want server-side revocation. |
| **API Gateway** | Often validates JWTs at the edge and forwards claims to backends. |
| **TLS/SSL** | Protects JWTs in transit; always use HTTPS. |

---

## 📝 Key Takeaways

1. **JWT** = signed, self-contained token: **header.payload.signature**; payload holds claims.  
2. **Verify** signature and **exp** (and **aud**/ **iss**) on every use; use an explicit algorithm whitelist.  
3. **HS256** = shared secret (one issuer/verifier); **RS256** = public key verification (multi-service, OIDC).  
4. Use JWTs for **stateless API auth** and as **OAuth/OIDC tokens**; keep access tokens **short-lived**.  
5. **Never** put secrets in the payload; send tokens only over **HTTPS**.

---

**Date Created:** 2026-03-08  
**Topic Type:** Security / Authentication  
**Difficulty:** Intermediate  
**Related:** OAuth 2.0, OpenID Connect, TLS/SSL, API Gateway
