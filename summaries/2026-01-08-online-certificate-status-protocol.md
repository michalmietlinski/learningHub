https://en.wikipedia.org/wiki/Online_Certificate_Status_Protocol

## Related Summaries & Subjects
- [Forward Secrecy](../summaries/2026-01-04-forward-secrecy.md) - HTTPS/TLS security features, certificate-based authentication
- [Internet Information Services](../summaries/2026-01-04-internet-information-services.md) - IIS supports OCSP stapling for certificate validation

# Online Certificate Status Protocol (OCSP) - Summary

## What is OCSP?

**Online Certificate Status Protocol (OCSP)** is an Internet protocol used to check whether a digital certificate (like an SSL/TLS certificate for HTTPS) has been revoked or is still valid. Instead of downloading a large list of all revoked certificates, OCSP lets you ask a server "Is this specific certificate still good?" and get a quick yes/no answer.

**Analogy**: Like calling a store to check if a gift card is still valid, rather than reading through a printed list of all invalid cards.

## Basic Summary

### Core Problem It Solves

**Without OCSP (Using Certificate Revocation Lists - CRLs):**
- Must download entire list of all revoked certificates
- Lists can be very large (thousands of entries, MBs for large CAs)
- Slow to download and parse
- Must check list periodically for updates
- Wastes bandwidth and processing power

**With OCSP:**
- Ask about one specific certificate
- Get quick yes/no answer: "good", "revoked", or "unknown"
- Smaller data transfer (just one certificate status)
- Real-time revocation checking
- More efficient for clients

### How It Works

1. **Client** receives a certificate (e.g., when visiting HTTPS website)
2. **Client** creates OCSP request with certificate's serial number
3. **Client** sends request to **OCSP responder** (server run by Certificate Authority)
4. **OCSP responder** checks its database for certificate status
5. **OCSP responder** returns signed response: "good", "revoked", or "unknown"
6. **Client** verifies the response signature and trusts the result
7. **Client** proceeds or blocks based on certificate status

### Real-World Analogy

Imagine you're a bouncer checking IDs:
- **CRL approach**: You have a printed list of all invalid IDs (thousands of pages) and must search through it
- **OCSP approach**: You call a hotline, give them the ID number, and they tell you "valid" or "invalid" immediately

### Why It Matters

- **Certificate Revocation**: Detects when certificates are compromised or invalid
- **Security**: Prevents use of stolen or compromised certificates
- **Efficiency**: Faster than downloading full revocation lists
- **Real-Time**: Get current status immediately
- **HTTPS Security**: Part of the certificate validation process for secure websites

### Common Use Cases

- **HTTPS Certificate Validation**: Browsers checking if website certificates are valid
- **Code Signing**: Verifying software hasn't been signed with revoked certificates
- **Email Security**: Validating S/MIME certificates
- **PKI Systems**: Any system using X.509 certificates

### Current Status (2025-2026)

- **Browser Support**: Firefox, Safari, Internet Explorer support it; Chrome disabled it by default (2012) due to privacy/latency concerns
- **CA/Browser Forum**: OCSP is now **optional** (since July 2023), CRLs are required again
- **Let's Encrypt**: Announced OCSP shutdown (August 2025) due to privacy concerns
- **OCSP Stapling**: Preferred solution that addresses privacy issues

## Extended Summary

### OCSP vs Certificate Revocation Lists (CRLs)

| Aspect | CRL | OCSP |
|--------|-----|------|
| **Data Size** | Large (MBs) | Small (single status) |
| **Network** | Periodic download | Per-request query |
| **Offline** | Works after download | Requires network |
| **Lookup** | Local search | Server query |
| **Use Case** | Batch validation | Real-time checking |
| **Advantages** | Works offline, no per-request network calls | Efficient for single checks, real-time status, smaller data |
| **Disadvantages** | Large downloads, periodic updates, slower lookup | Requires network, privacy concerns, latency |

### Protocol Details

**Request Format:**
- Contains certificate serial number
- Optionally includes nonce (random number) to prevent replay attacks
- Encoded in ASN.1 format
- Usually sent over HTTP (though HTTPS is recommended)

**Response Format:**
- Signed by OCSP responder (proves authenticity)
- Contains status: "good", "revoked", or "unknown"
- Includes validity period (how long response is valid, typically 1-7 days)
- May include revocation reason and time
- Encoded in ASN.1 format

**Response Types:**
- **Good**: Certificate is valid and not revoked
- **Revoked**: Certificate has been revoked (compromised, expired, etc.)
- **Unknown**: OCSP responder doesn't know about this certificate

### OCSP Stapling (TLS Certificate Status Request)

**Problem with Standard OCSP:**
- Client must contact CA's OCSP server
- Reveals which websites user is visiting (privacy issue)
- Adds latency (extra network request)
- CA can track user browsing behavior

**OCSP Stapling Solution:**
- **Server** fetches OCSP response from CA periodically
- **Server** "staples" (includes) OCSP response in TLS handshake
- **Client** gets certificate + OCSP status together
- **No direct client-to-CA communication**
- **Benefits**: Privacy preserved, faster (no extra request), server controls caching

**How It Works:**
1. Server periodically requests OCSP response from CA
2. Server caches OCSP response (typically 1-7 days)
3. During TLS handshake, server includes cached OCSP response
4. Client validates both certificate and stapled OCSP response
5. No privacy leak - CA doesn't know which client requested which site

### Security Considerations

**Replay Attacks:**
- **Problem**: Attacker captures valid "good" response and replays it later after certificate is revoked
- **Solution**: Use nonces (random numbers) in requests that must be echoed in responses
- **Reality**: Most OCSP responders don't use nonces due to performance; they use presigned responses with validity periods

**Man-in-the-Middle (MITM) Attacks:**
- **Problem**: Attacker who compromised server's private key can also block OCSP requests
- **Limitation**: OCSP doesn't effectively protect against MITM attackers
- **Reality**: Most clients silently fail open (allow connection if OCSP times out)
- **Better For**: Code signing, certificates issued in error (non-MITM scenarios)
- **Mitigation**: OCSP stapling with MustStaple extension requires stapled response

**Privacy Concerns:**
- **Problem**: OCSP requests reveal which websites users visit to the CA
- **Impact**: CA can track user browsing behavior
- **Solution**: OCSP stapling (server fetches, not client)
- **Recent Development**: Let's Encrypt shutting down OCSP due to privacy concerns

**Network Access Requirements:**
- Clients must have internet access to OCSP responders
- Problematic for internal servers, air-gapped systems
- OCSP stapling helps (server can have internet, clients don't need it)

### Delegation & Hierarchy

**OCSP Responder Delegation:**
- Certificate issuer can delegate OCSP signing to another authority
- Delegated responder must have certificate issued by original CA
- Certificate must include OCSP signing extension (extended key usage)
- Allows CAs to distribute OCSP load across multiple servers

**Multi-Level CA Support:**
- OCSP can work with certificate chains (intermediate CAs)
- Requests can be chained between peer responders
- Each responder validates against appropriate CA in chain

### Browser Implementation

- **Firefox**: Enabled by default (since Firefox 3), can be configured in preferences
- **Chrome**: Disabled by default (since 2012), uses Chrome's own update mechanism (CRLSet) instead, cites latency and privacy issues as reasons
- **Safari (macOS)**: Enabled by default (since macOS 10.7 Lion), previously required manual activation
- **Internet Explorer**: Supported via Windows CryptoAPI, available since IE 7 on Windows Vista, not available on Windows XP
- **Opera**: Supported since version 8.0, continues support in current versions

### Performance & Scalability

**OCSP Responder Load:**
- Must handle requests for every certificate validation
- High traffic websites generate many OCSP requests
- Solutions: Caching, CDN distribution, presigned responses

**Latency Impact:**
- Adds network round-trip time to certificate validation
- Can slow down HTTPS connection establishment
- OCSP stapling eliminates this latency

**Caching Strategies:**
- Clients cache OCSP responses based on validity period
- Reduces repeated requests for same certificate
- Typical validity: 1-7 days

### Limitations & Criticisms

**Effectiveness Against Key Compromise:**
- **Criticism**: Doesn't effectively protect against MITM attackers
- **Reason**: Attacker who can impersonate server can also block OCSP requests
- **Reality**: Most clients silently fail open (allow connection if OCSP times out)
- **Better For**: Code signing, certificates issued in error (non-MITM scenarios)

**MustStaple Extension:**
- Certificate extension that requires OCSP stapling
- Prevents silent failure (connection fails if no stapled response)
- Better security but requires server support

**Network Dependency:**
- Requires clients to have internet access
- Problematic for internal/air-gapped systems
- OCSP stapling helps (only server needs internet)

**Privacy Issues:**
- CAs can track which websites users visit
- Major privacy concern
- Led to Let's Encrypt shutting down OCSP service
- OCSP stapling addresses this

### Alternatives & Complementary Technologies

**Certificate Revocation Lists (CRLs):**
- Traditional method, still required by CA/Browser Forum
- Works offline after download
- Better for some use cases

**Certificate Transparency (CT):**
- Public log of all certificates
- Helps detect unauthorized certificate issuance
- Complements revocation checking

**Short-Lived Certificates:**
- Certificates that expire quickly (days/weeks)
- Reduces need for revocation checking
- Used by Let's Encrypt (90-day validity)

**OCSP Stapling:**
- Best of both worlds: real-time status + privacy
- Server handles OCSP fetching
- Client gets status without contacting CA

### Implementation Details

**Protocol Specification:**
- Defined in RFC 6960 (current version)
- RFC 9654 (updates)
- ASN.1 encoding
- Typically over HTTP (port 80) or HTTPS (port 443)
- Introduced: February 4, 2002
- Status: Optional since July 2023

**OCSP Responder Setup:**
- Run by Certificate Authority or delegated authority
- Maintains database of certificate status
- Signs responses with OCSP signing certificate
- Must be highly available (critical infrastructure)

**Client Implementation:**
- Built into browsers and TLS libraries
- Can be configured to require, prefer, or disable OCSP
- Fallback behavior when OCSP unavailable

## Key Takeaway

OCSP provides a real-time method to check certificate revocation status, offering efficiency advantages over traditional CRLs. However, it faces challenges including privacy concerns (CAs can track browsing), limited effectiveness against MITM attacks, and latency issues. OCSP stapling addresses many of these problems by having servers fetch and cache OCSP responses, preserving privacy while maintaining security. The protocol's future is uncertain, with major CAs like Let's Encrypt moving away from it, but it remains an important tool in the PKI ecosystem for certificate validation, particularly useful for code signing and non-MITM scenarios.

## Related Subjects

- **Public Key Infrastructure (PKI)**: Understanding certificate authorities, certificate chains, and the broader certificate ecosystem
- **HTTPS/TLS Handshake**: How certificate validation fits into the TLS connection establishment process and security negotiation




