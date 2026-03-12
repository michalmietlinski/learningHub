# Password Hashing (bcrypt, Argon2)

## 📋 Learning Objectives

- [ ] Understand why we hash passwords (not encrypt) and what “one-way” means
- [ ] Learn the role of salt and why unique salt per password is required
- [ ] Master work factor / cost and why slow hashes protect against brute force
- [ ] Use bcrypt and Argon2 in practice (hash + verify)
- [ ] Avoid weak options: MD5, SHA1, plain SHA-256 without salt
- [ ] Relate password hashing to authentication, JWT, and OAuth flows

---

## 🎯 Definition

**Password hashing** is the practice of turning a user’s password into a fixed-size, **one-way** value (a hash) before storing it. Good password hashes are **salted** (each password gets a random value so identical passwords produce different hashes) and **slow** (deliberately expensive to compute so brute-force and dictionary attacks are impractical). We **never** store plaintext passwords or reversible encryption of passwords.

**Key principle:**
> "Store a one-way, salted, slow hash of the password so that even if the database is stolen, an attacker cannot recover passwords and cannot efficiently try billions of guesses."

**Why not encryption?** Encryption is reversible; if the key is stolen, all passwords are exposed. Hashing is one-way: you can only verify by hashing the candidate and comparing; you cannot “decrypt” back to the password.

---

## 🏗️ Core Concepts

### Hash vs Encryption

```
┌─────────────────────────────────────────────────────────────────┐
│  ENCRYPTION (reversible – wrong for passwords)                   │
│  password ──► [encrypt with key] ──► ciphertext                  │
│  ciphertext ──► [decrypt with key] ──► password   ❌             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  HASHING (one-way – right for passwords)                         │
│  password ──► [hash + salt] ──► stored_hash                     │
│  candidate  ──► [same hash + same salt] ──► compare ✅           │
│  (cannot get password from stored_hash)                         │
└─────────────────────────────────────────────────────────────────┘
```

### Salt

A **salt** is a random value unique per password, stored alongside the hash (often embedded in the hash string).

- **Without salt:** Same password → same hash. Attackers can precompute hashes for common passwords (rainbow tables) and reverse a lot of breached hashes at once.
- **With salt:** Same password + different salt → different hash. Each password must be attacked separately; rainbow tables are useless.

**Rule:** Generate a **cryptographically random** salt for each new password; never reuse or derive salt from the password.

### Work Factor (Cost)

**Slow** hashes are intentional. Fast hashes (e.g. raw SHA-256) let an attacker try billions of candidates per second on GPU/ASIC. **bcrypt**, **Argon2**, and **scrypt** have a **cost parameter** (work factor) that increases CPU/memory cost:

- **bcrypt:** `cost` (e.g. 10–12); doubles work for each +1.
- **Argon2:** `timeCost`, `memoryCost` (and parallelism); tune to use a target amount of memory and time.
- **scrypt:** `N`, `r`, `p`; memory-hard.

**Verify** uses the same cost as the stored hash, so verification is also slow—that’s acceptable (once per login). Attackers must pay the same cost per guess.

---

## 📦 Algorithms

### What to Use

| Algorithm | Use case | Notes |
|-----------|----------|--------|
| **Argon2id** | New applications | Memory-hard + time-hard; preferred by many standards (e.g. PHC). |
| **bcrypt** | Widely supported | Mature, built into many stacks; tune cost (e.g. 12). |
| **scrypt** | Alternative | Memory-hard; good if Argon2/bcrypt not available. |

### What NOT to Use

| Avoid | Why |
|-------|-----|
| **MD5, SHA1** | Too fast; broken for collision resistance; no built-in salt. |
| **Plain SHA-256/SHA-512** | Too fast; no salt or cost; trivial to brute-force. |
| **Single global salt** | Same password → same hash; precomputation and cross-user attacks. |
| **Reversible encryption** | Key compromise exposes all passwords. |

---

## 💻 Implementation

### bcrypt (Node.js)

```javascript
const bcrypt = require('bcrypt');

// Hash (salt is generated and embedded in the result)
const saltRounds = 12;
const hash = await bcrypt.hash('userPassword123', saltRounds);
// e.g. $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtQYpS3qK.FKu

// Verify
const match = await bcrypt.compare('userPassword123', hash);
// true
```

### bcrypt (Python)

```python
import bcrypt

# Hash
password = b"userPassword123"
hashed = bcrypt.hashpw(password, bcrypt.gensalt(rounds=12))

# Verify
if bcrypt.checkpw(password, hashed):
    print("OK")
```

### Argon2 (Node.js with argon2 package)

```javascript
const argon2 = require('argon2');

// Hash (Argon2id – default in many libs)
const hash = await argon2.hash('userPassword123', {
  type: argon2.argon2id,
  memoryCost: 65536,  // 64 MiB
  timeCost: 3
});
// Hash string includes parameters and salt

// Verify
const ok = await argon2.verify(hash, 'userPassword123');
```

### Argon2 (Python with argon2-cffi)

```python
from argon2 import PasswordHasher

ph = PasswordHasher()
hash = ph.hash("userPassword123")   # uses Argon2id, random salt
ph.verify(hash, "userPassword123")  # raises if wrong
```

---

## 🔐 Security Practices

| Practice | Reason |
|----------|--------|
| **Unique salt per password** | Prevents rainbow tables and cross-user attacks. |
| **Sufficient cost** | bcrypt ~12; Argon2 tune for ~0.5–1 s and meaningful memory. |
| **Store hash + salt** | Usually one string (e.g. `$2b$12$...` or Argon2 format). |
| **Constant-time compare** | When comparing hashes, use the library’s compare; don’t do string equality that can leak timing. |
| **Limit login attempts** | Rate-limit and lockout to slow online brute force. |
| **Don’t log passwords** | Never log or send the plaintext password. |

---

## 📊 When to Use

| Scenario | Use password hashing? |
|----------|------------------------|
| Storing user passwords for login | ✅ Always hash (bcrypt/Argon2). |
| API keys or tokens you need to show again | ❌ Use encryption or store a hash and show once; or use a dedicated secret store. |
| Comparing two secrets in app logic | ⚠️ Hashing is fine if you only need equality; use constant-time compare. |
| Passwords for third-party (e.g. OAuth) | ❌ You don’t store them; OAuth gives tokens. |

---

## ⚠️ Common Pitfalls

1. **No salt or shared salt** – Always per-password random salt.
2. **Too low cost** – Raise bcrypt/Argon2 cost as hardware improves; don’t leave at defaults forever.
3. **Fast hash (SHA-*) for passwords** – Use bcrypt, Argon2, or scrypt.
4. **Custom crypto** – Use established libraries and standard algorithms.
5. **Timing attacks** – Use the library’s compare function (constant-time).

---

## 🎯 Best Practices

1. **Prefer Argon2id** for new code; **bcrypt** is fine and widely supported.
2. **Tune cost** – Aim for ~0.5–1 s per hash on your server; increase over time.
3. **One hash per password** – Don’t “double hash” or chain hashes; use one proper algorithm.
4. **Upgrade path** – When users log in, rehash with current algorithm/cost if the stored hash is older/weaker.
5. **Secure storage** – Protect the DB and backups; hashing limits damage from a breach but doesn’t replace access control.

---

## 🔗 Related Topics

| Topic | Relationship |
|-------|--------------|
| **JWT / OAuth 2.0** | OAuth avoids storing passwords; JWT/OAuth tokens are used after authentication. Password hashing is for “login with password” flows. |
| **TLS/SSL** | Passwords must be sent over HTTPS (TLS) so they’re not captured in transit. |
| **Symmetric/secret storage** | API keys or secrets you need to retrieve are a different problem (encryption or secret manager). |

---

## 📝 Key Takeaways

1. **Hash, don’t encrypt** – Passwords must be one-way; use a **salted, slow** hash (bcrypt, Argon2id, or scrypt).
2. **Salt** – Random, unique per password; stored with the hash; prevents rainbow tables and cross-user attacks.
3. **Work factor** – Slow hashes limit brute force; tune bcrypt cost or Argon2 time/memory.
4. **Never** use MD5, SHA1, or plain SHA-256 for passwords; **never** store plaintext or reversibly encrypted passwords.
5. **Verify** with the library’s compare; **rehash** on login when the stored hash is weaker than your current policy.

---

**Date Created:** 2026-03-10  
**Topic Type:** Security / Authentication  
**Difficulty:** Intermediate  
**Related:** JWT, OAuth 2.0, TLS/SSL
