# Certificate Chains & PKI

## 📋 Learning Objectives

- [ ] Understand what a certificate is and how it binds an identity to a public key
- [ ] Learn the chain of trust: root CA → intermediate CA → leaf (server) certificate
- [ ] Master certificate validation: signature, chain, expiry, hostname, revocation
- [ ] Relate PKI to TLS/HTTPS, mTLS, and code signing
- [ ] Understand revocation: CRL and OCSP (and OCSP stapling)
- [ ] Connect to Public-Key Cryptography, TLS/SSL, and JWT/OAuth

---

## 🎯 Definition

**PKI (Public Key Infrastructure)** is the set of roles, policies, and technology used to create, distribute, and validate **digital certificates**. A **certificate** is a signed document that binds an **identity** (e.g. a domain name or organization) to a **public key**. Clients trust a certificate if they can verify a **chain of signatures** from that certificate up to a **root CA** they already trust (in their trust store).

**Certificate chain:** A sequence of certificates from the **leaf** (the server or client cert you’re checking) through **intermediate** CAs up to a **root CA**. Each certificate is signed by the next one in the chain; the root is self-signed and pre-installed in OS/browser trust stores.

**Key principle:**
> "Trust is delegated: you trust a root CA; the root signs intermediates; intermediates sign leaf certificates. Validating the chain and revocation ensures you’re talking to the right entity and the cert wasn’t revoked."

---

## 🏗️ Structure

### The Chain of Trust

```
┌─────────────────────────────────────────────────────────────────┐
│  TRUST STORE (on client/OS)                                      │
│  Root CA (self-signed, pre-installed)                            │
│       │                                                          │
│       │ signs                                                    │
│       ▼                                                          │
│  Intermediate CA certificate                                    │
│       │                                                          │
│       │ signs                                                    │
│       ▼                                                          │
│  Leaf (server) certificate  ←  "api.example.com" + public key    │
│       │                                                          │
│       └── Private key (only on server; never sent)                │
└─────────────────────────────────────────────────────────────────┘
```

- **Root CA** – Self-signed; distributed with OS/browsers; used only to sign intermediate CAs (kept offline when possible).
- **Intermediate CA** – Signed by root (or another intermediate); signs leaf certs; can be revoked and rotated without changing the root.
- **Leaf certificate** – End-entity cert (e.g. for `api.example.com`); signed by an intermediate; contains the **public key** the server uses for TLS.

When a server does TLS, it sends its **leaf cert** plus the **intermediate(s)** so the client can build the chain to a root it trusts.

### What’s Inside a Certificate (X.509)

| Field | Meaning |
|-------|---------|
| **Subject** | Entity the cert is for (e.g. CN=api.example.com, O=Example Inc). |
| **Subject Alternative Name (SAN)** | List of names (DNS, IP); **prefer SAN** for hostname checks (CN is legacy). |
| **Issuer** | Who signed this cert (e.g. intermediate CA). |
| **Public key** | The key bound to this identity (RSA or ECDSA). |
| **Validity** | Not Before / Not After (cert is invalid outside this window). |
| **Signature** | Signature over the cert body by the Issuer’s private key. |
| **Serial number** | Unique per cert from that issuer (used for revocation). |

---

## 📦 Validation (What the Client Checks)

To accept a certificate, the client typically:

1. **Signature** – Verify the leaf is signed by its issuer; then verify the issuer by the next cert in the chain; repeat until the root.
2. **Chain to trusted root** – The last cert in the chain must be a root in the client’s trust store.
3. **Validity** – Current time is within Not Before and Not After.
4. **Hostname** – For TLS server auth: the host you’re connecting to (e.g. `api.example.com`) must match a SAN (or CN if no SAN). Never skip this.
5. **Revocation** – Cert might have been revoked; check via **CRL (Certificate Revocation List)** or **OCSP (Online Certificate Status Protocol)**.

### Revocation

| Mechanism | Description |
|-----------|-------------|
| **CRL** | List of revoked serial numbers published by the CA; client fetches and checks. Can be large and stale. |
| **OCSP** | Client (or server) asks “is this cert revoked?” and gets a signed response. |
| **OCSP stapling** | Server fetches its own OCSP response and “staples” it in the TLS handshake so the client doesn’t have to contact the CA. Prefer when supported. |

You already have an **OCSP** summary (2026-01-08); certificate chains are what OCSP attests about.

---

## 🔄 How TLS Uses the Chain

During the TLS handshake:

1. Server sends **Certificate** message: leaf cert + intermediate(s) (root is usually omitted; client has it).
2. Client builds the chain: leaf → intermediate → … → root.
3. Client checks each signature (issuer’s public key from the next cert in the chain).
4. Client checks root is in trust store, validity, hostname, and optionally revocation (OCSP/CRL).
5. If all pass, client uses the **leaf’s public key** for key exchange (e.g. RSA or ECDSA in the cert).

So **certificate chains and PKI are what make TLS server authentication work.**

---

## 💻 Practical Notes

### Inspecting a Certificate (OpenSSL)

```bash
# Fetch and print server certificate chain
openssl s_client -connect api.example.com:443 -servername api.example.com -showcerts

# Decode a PEM certificate file
openssl x509 -in cert.pem -noout -text
# Shows Subject, Issuer, SAN, validity, public key
```

### Chain Building

Servers must send the **full chain** (leaf + intermediates). If the intermediate is missing, some clients can’t build the path to a trusted root and will fail. Configure your web server or load balancer with the leaf cert and the intermediate(s) in order.

### Trust Stores

- **Browsers/OS** – Ship with a set of root CAs (and sometimes intermediates). Updates add/remove CAs.
- **Java** – `cacerts` or custom truststore.
- **Node.js** – Uses OS trust store by default; can override with `NODE_EXTRA_CA_CERTS` or custom options.
- **Internal PKI** – Your own root CA; install your root (or intermediate) in the trust store of clients that need to trust your services (e.g. mTLS in a microservice mesh).

---

## 🔐 Security Considerations

| Topic | Recommendation |
|-------|----------------|
| **Private key protection** | Leaf (and CA) private keys must be kept secure; restrict file permissions; use HSM for high-value keys. |
| **Root CA** | Keep offline; use only to sign intermediates; rotate very carefully. |
| **Revocation** | Use OCSP or CRL and respect revocation in production; consider OCSP stapling. |
| **Hostname** | Always validate SAN/CN against the host; never disable. |
| **Short validity** | Prefer shorter-lived leaf certs (e.g. 90 days) and automate renewal (e.g. Let’s Encrypt). |
| **Strong algorithms** | Use RSA 2048+ or ECDSA (e.g. P-256); avoid SHA-1 signatures. |

---

## 📊 When to Use PKI / Certificates

| Scenario | Use |
|----------|-----|
| HTTPS (TLS server auth) | ✅ Server presents leaf cert; client validates chain. |
| mTLS (client auth) | ✅ Client has its own cert; server validates client’s chain. |
| Code signing | ✅ Sign binaries with a cert chained to a trusted CA. |
| Email (S/MIME) | ✅ Cert binds identity to key for signing/encryption. |
| Internal services | ✅ Internal CA; install root in service trust stores. |

---

## ⚠️ Common Pitfalls

1. **Incomplete chain** – Server sends only the leaf; client can’t reach a trusted root. Send leaf + intermediates.
2. **Wrong hostname** – Cert for `www.example.com` used for `api.example.com`; add all needed names to SAN.
3. **Expired or not yet valid** – Check Not Before / Not After; renew before expiry.
4. **Ignoring revocation** – Revoked certs (e.g. after key compromise) should be rejected; use OCSP/CRL.
5. **Trusting any cert** – Never disable chain or hostname verification in production.

---

## 🎯 Best Practices

1. **Send full chain** – Configure server with leaf + intermediates in order.
2. **Prefer SAN** – Put all server names in SAN; CN is legacy.
3. **Automate renewal** – Use short validity (e.g. 90 days) and ACME (e.g. Let’s Encrypt) or internal automation.
4. **Check revocation** – Enable OCSP or CRL where your stack supports it; prefer OCSP stapling.
5. **Internal PKI** – For service-to-service, run your own CA and distribute your root to services that need to trust each other.

---

## 🔗 Related Patterns & Topics

| Topic | Relationship |
|-------|--------------|
| **TLS/SSL** | TLS uses certificate chains for server (and mTLS client) authentication. |
| **Public-Key Cryptography** | Certificates contain public keys; signatures use the issuer’s private key. |
| **JWT / OAuth** | JWTs can be signed with a key from a cert (e.g. RS256); OAuth/OIDC servers often use certs for TLS and sometimes for signing. |
| **OCSP** | OCSP (and your OCSP summary) is how revocation status is checked for a certificate. |

---

## 📝 Key Takeaways

1. **PKI** is the system of CAs and certificates that bind identities to public keys; **certificate chain** is leaf → intermediate(s) → trusted root.
2. **Validation** = valid signatures along the chain + trusted root + validity period + hostname match + revocation check (OCSP/CRL).
3. **TLS** uses the chain so the client can verify the server’s identity; **mTLS** uses the same idea for the client.
4. **Send the full chain** (leaf + intermediates) from the server; **never** disable chain or hostname verification in production.
5. **Revocation** (OCSP/CRL) matters when a cert must be invalidated before it expires; **OCSP stapling** reduces latency and privacy exposure.

---

**Date Created:** 2026-03-11  
**Topic Type:** Security / PKI  
**Difficulty:** Intermediate  
**Related:** TLS/SSL, Public-Key Cryptography, OCSP, JWT
