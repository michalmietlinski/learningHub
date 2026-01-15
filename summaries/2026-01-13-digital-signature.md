https://en.wikipedia.org/wiki/Digital_signature

## Related Summaries & Subjects
- [Public-Key Cryptography](../summaries/2026-01-12-public-key-cryptography.md) - Digital signatures are a type of public-key cryptography; uses private key to sign, public key to verify
- [Online Certificate Status Protocol (OCSP)](../summaries/2026-01-08-online-certificate-status-protocol.md) - Uses digital signatures to sign OCSP responses, ensuring authenticity
- [Symmetric-Key Algorithm](../summaries/2026-01-12-symmetric-key-algorithm.md) - Digital signatures provide authentication and non-repudiation that symmetric crypto cannot provide alone

# Digital Signature - Summary

---

## 📚 Basic Summary

### What is a Digital Signature?

A **digital signature** is a mathematical scheme that proves the authenticity and integrity of a digital message or document. It's like a handwritten signature on paper, but it's cryptographically bound to the content, making it impossible to forge or copy to another document.

**Simple Analogy:**
- Like a wax seal on a letter: proves it came from the sender and wasn't opened
- Like a notary stamp: provides legal proof of authenticity
- Like a tamper-evident seal: any modification invalidates the signature

### Key Concepts

**1. How It Works:**
- **Signing**: You create a signature using your **private key** + the message
- **Verification**: Anyone can verify the signature using your **public key**
- **Binding**: Signature is mathematically bound to the message content
- **Unforgeable**: Only you can create valid signatures (you have the private key)

**2. Three Main Properties:**

**A. Authentication:**
- Proves the message came from the claimed sender
- Public key serves as identity

**B. Integrity:**
- Detects if the message was modified
- Any change invalidates the signature

**C. Non-Repudiation:**
- Signer cannot deny signing (only they have the private key)
- Provides legal proof of authorship

**3. Digital Signature vs Electronic Signature:**
- **Digital Signature**: Cryptographic scheme (mathematical proof)
- **Electronic Signature**: Any electronic data indicating intent to sign (broader term)
- All digital signatures are electronic signatures, but not all electronic signatures use digital signatures

### Real-World Examples

**1. Software Distribution:**
- Software publishers sign code with private key
- Users verify signature with public key
- Ensures software hasn't been tampered with
- Examples: Windows updates, Linux packages, mobile apps

**2. Email Security (S/MIME, PGP):**
- Sign emails with private key
- Recipients verify with public key
- Proves email authenticity and integrity

**3. Legal Documents:**
- Digitally sign contracts, agreements
- Legally binding in many jurisdictions
- Provides proof of signing and document integrity

**4. Blockchain/Cryptocurrency:**
- Transactions signed with private key
- Public key verifies transaction authenticity
- Proves ownership and prevents double-spending

**5. Code Signing:**
- Developers sign software with private key
- Operating systems verify signatures before installation
- Prevents malware and tampering

**6. Certificate Authorities:**
- CAs sign certificates with their private key
- Browsers verify signatures with CA's public key
- Establishes trust chain for HTTPS

### Why It Matters

- **Security**: Prevents forgery and tampering
- **Trust**: Proves authenticity of digital content
- **Legal Validity**: Legally binding in many countries
- **Non-Repudiation**: Signer cannot deny signing
- **Foundation of PKI**: Enables trust on the internet

---

## 🔬 Extended Summary

### How Digital Signatures Work

**Mathematical Foundation:**
- Based on **public-key cryptography**
- Uses **one-way functions** (easy one way, hard to reverse)
- Security relies on computational difficulty
- Private key creates signature, public key verifies

**Signature Process:**
```
1. Alice wants to sign a message
2. Alice creates hash of the message (SHA-256, etc.)
3. Alice encrypts hash with her private key → signature
4. Alice sends message + signature to Bob
5. Bob receives message + signature
6. Bob creates hash of received message
7. Bob decrypts signature with Alice's public key → original hash
8. Bob compares hashes: match = valid, mismatch = invalid
```

**Key Insight:**
- Signature is created from message content (hash)
- Any change to message changes hash
- Invalid hash = invalid signature
- Signature is mathematically bound to message

### Digital Signature Scheme Components

**Three Algorithms:**

**1. Key Generation (G):**
- Generates public/private key pair
- Private key kept secret
- Public key distributed openly

**2. Signing Algorithm (S):**
- Input: Message + Private key
- Output: Digital signature
- Creates signature bound to message

**3. Verification Algorithm (V):**
- Input: Message + Public key + Signature
- Output: Accept or Reject
- Verifies signature authenticity

**Security Properties:**

**Correctness:**
- Valid signatures always verify correctly
- Signature created with private key verifies with public key

**Security (EUF-CMA):**
- Existential Unforgeability under Chosen Message Attack
- Computationally infeasible to forge signatures
- Even with access to signing oracle, cannot forge new signatures

### Common Digital Signature Algorithms

**RSA Signatures:**
- Based on RSA public-key algorithm
- Widely used, well-understood
- Key sizes: 2048-4096 bits
- Used in: SSL/TLS certificates, code signing, email

**DSA (Digital Signature Algorithm):**
- Signature-only (not encryption)
- Based on discrete logarithm
- Used in: Government, enterprise
- Key sizes: 1024-3072 bits

**ECDSA (Elliptic Curve Digital Signature Algorithm):**
- Based on elliptic curve cryptography
- Smaller keys for same security (256-bit ECDSA ≈ 3072-bit RSA)
- Faster than RSA
- Used in: Bitcoin, modern TLS, mobile devices

**EdDSA (Edwards-Curve Digital Signature Algorithm):**
- Modern, efficient elliptic curve algorithm
- Deterministic (same message = same signature)
- Fast and secure
- Used in: Modern applications, SSH, TLS

**Schnorr Signatures:**
- Efficient, supports signature aggregation
- Used in: Some blockchain applications
- Allows multiple signatures to be combined

### Security Notions

**Attack Models:**

**1. Key-Only Attack:**
- Attacker only knows public key
- Weakest attack model
- Most schemes must resist this

**2. Known Message Attack:**
- Attacker sees message-signature pairs
- Cannot choose messages
- Must resist signature forgery

**3. Chosen Message Attack (CMA):**
- Attacker can request signatures on chosen messages
- Stronger attack model
- Modern schemes must resist this

**4. Adaptive Chosen Message Attack:**
- Attacker can adaptively choose messages based on previous signatures
- Strongest attack model
- EUF-CMA security required

**Security Goals:**

**1. Existential Unforgeability:**
- Cannot forge signature for any message
- Even random message-signature pair is hard to forge

**2. Strong Unforgeability:**
- Cannot forge signature for known message
- Even if message is known, cannot create different valid signature

**3. Non-Repudiation:**
- Signer cannot deny signing
- Provides legal proof

### Applications

**1. Authentication:**
- Proves identity of sender
- Public key serves as identity
- Used in: Email, software distribution, certificates

**Limitations:**
- Requires public key distribution/verification
- Public key must be trusted (PKI)
- Key compromise breaks authentication

**2. Non-Repudiation:**
- Signer cannot deny signing
- Legal proof of authorship
- Used in: Contracts, legal documents, financial transactions

**Requirements:**
- Private key must be kept secret
- Key compromise breaks non-repudiation
- Timestamping may be needed

**3. Integrity Verification:**
- Detects message modification
- Any change invalidates signature
- Used in: Software updates, file verification, data integrity

**4. Code Signing:**
- Software publishers sign code
- Operating systems verify before installation
- Prevents malware and tampering
- Examples: Windows Authenticode, macOS Gatekeeper, Linux package signing

**5. Certificate Signing:**
- Certificate authorities sign certificates
- Browsers verify CA signatures
- Establishes trust chain
- Foundation of HTTPS security

**6. Blockchain Transactions:**
- Transactions signed with private key
- Public key verifies transaction
- Proves ownership and prevents double-spending
- Used in: Bitcoin, Ethereum, most cryptocurrencies

**7. Email Security:**
- Sign emails with private key
- Recipients verify with public key
- Proves email authenticity
- Used in: S/MIME, PGP/GPG

### Additional Security Precautions

**1. Smart Cards:**
- Store private key on hardware token
- Key never leaves card
- Requires PIN to use
- Prevents key theft from compromised computer

**2. Separate Keyboards:**
- Use dedicated keyboard for PIN entry
- Prevents keyloggers from stealing PIN
- Used in: Banking, high-security applications

**3. Trusted Applications:**
- Only use signatures with trusted software
- Prevents malicious software from signing unauthorized documents
- Application whitelisting

**4. Hardware Security Modules (HSMs):**
- Dedicated hardware for key storage
- Key operations performed in secure hardware
- Used in: Certificate authorities, high-security systems

**5. WYSIWYS (What You See Is What You Sign):**
- Ensure document displayed is what gets signed
- Prevents hidden content or modifications
- Critical for legal validity

**6. Network-Attached HSMs:**
- HSMs accessible over network
- Centralized key management
- Used in: Enterprise, cloud services

### Digital Signatures vs Ink Signatures

**Advantages of Digital:**
- ✅ Cryptographically secure (mathematically bound to content)
- ✅ Cannot be copied to other documents
- ✅ Detects any modification
- ✅ Can be verified automatically
- ✅ Non-repudiation (cannot deny signing)
- ✅ Works for any digital content

**Advantages of Ink:**
- ✅ Familiar, widely accepted
- ✅ No technology required
- ✅ Works offline
- ✅ Legal precedent established

**Key Difference:**
- **Ink signature**: Can be copied, doesn't detect modification
- **Digital signature**: Cryptographically bound, detects modification

### Industry Standards

**PKCS#1 (RSA):**
- Standard for RSA signatures
- Defines padding schemes (PSS, PKCS#1 v1.5)
- Widely implemented

**PKCS#7/CMS:**
- Cryptographic Message Syntax
- Standard format for signed data
- Used in: S/MIME, code signing

**X.509:**
- Certificate standard
- Includes digital signature format
- Used in: SSL/TLS, PKI

**PAdES (PDF Advanced Electronic Signatures):**
- Standard for PDF signatures
- Long-term validation
- Legal validity in EU

**XML-DSig:**
- XML Signature standard
- Signs XML documents
- Used in: Web services, SOAP

**Separate Key Pairs:**
- **Signing key**: Used only for signatures (long-term)
- **Encryption key**: Used only for encryption (can be rotated)
- **Best Practice**: Separate keys for different purposes
- Prevents key compromise from affecting both functions

### Historical Development

**1976:**
- Whitfield Diffie and Martin Hellman described concept
- Conjectured existence based on trapdoor one-way functions

**1978:**
- RSA algorithm invented (could produce signatures)
- First practical implementation
- "Plain" RSA signatures not secure (needs padding)

**1988:**
- Shafi Goldwasser, Silvio Micali, Ronald Rivest defined security requirements
- Introduced GMR signature scheme
- First provably secure signature scheme

**1989:**
- Lotus Notes 1.0 first widely marketed software with digital signatures
- Used RSA algorithm

**1990s-2000s:**
- DSA standardized (1991)
- ECDSA developed (elliptic curve variant)
- Widespread adoption in certificates, code signing

**2000s-Present:**
- EdDSA developed (modern, efficient)
- Post-quantum signature schemes researched
- Legal recognition in many countries

### Security Considerations

**1. Key Management:**
- Private key must be kept secret
- Key compromise breaks all security properties
- Use HSMs or secure key storage
- Implement key rotation policies

**2. Hash Function Security:**
- Signatures typically sign hash of message
- Hash function must be secure (SHA-256, SHA-3)
- Weak hash functions (MD5, SHA-1) break signature security

**3. Padding Schemes:**
- RSA signatures require padding (PSS, PKCS#1 v1.5)
- Incorrect padding can be insecure
- Use standardized, secure padding

**4. Random Number Generation:**
- Some schemes (ECDSA) require random nonces
- Weak randomness breaks security
- Use cryptographically secure RNG

**5. Timestamping:**
- Signatures prove authenticity, not time
- Timestamping services provide time proof
- Important for long-term validity

**6. Revocation:**
- Compromised keys must be revoked
- Certificate revocation lists (CRLs) or OCSP
- Important for PKI systems

**7. Quantum Resistance:**
- Current algorithms (RSA, ECDSA) vulnerable to quantum computers
- Post-quantum signature schemes being developed
- NIST standardizing post-quantum algorithms

### Real-World Implementation

**TLS/HTTPS:**
- Server certificates signed by CAs
- Browsers verify CA signatures
- Establishes trust for secure connections

**Code Signing:**
- Software signed by publishers
- Operating systems verify before installation
- Prevents malware distribution

**Email (S/MIME, PGP):**
- Emails signed with sender's private key
- Recipients verify with sender's public key
- Proves email authenticity

**Blockchain:**
- Transactions signed with private key
- Network verifies with public key
- Prevents double-spending and fraud

**Document Signing:**
- Legal documents signed digitally
- Provides legal proof of signing
- Legally binding in many jurisdictions

### Best Practices

**For Signers:**
- Protect private key (use HSMs, smart cards)
- Use strong key sizes (2048+ bits RSA, 256+ bits ECC)
- Use secure hash functions (SHA-256, SHA-3)
- Implement key rotation
- Use timestamping for long-term validity
- Verify what you're signing (WYSIWYS)

**For Verifiers:**
- Verify public key authenticity (PKI, certificates)
- Check signature validity
- Verify message integrity
- Check for key revocation
- Use trusted verification software

**For Developers:**
- Use standardized algorithms and padding
- Implement proper key management
- Use cryptographically secure RNG
- Follow security best practices
- Test signature verification thoroughly

---

## 🎯 Key Takeaways

**For Beginners:**
- Digital signatures prove authenticity, integrity, and provide non-repudiation
- Created with private key, verified with public key
- Mathematically bound to message content (any change invalidates signature)
- Like a handwritten signature but cryptographically secure
- Used in: Software distribution, email, legal documents, blockchain
- Cannot be copied or forged like handwritten signatures

**For Experienced Developers:**
- Digital signatures are a type of public-key cryptography (sign with private key, verify with public key)
- Security based on EUF-CMA (Existential Unforgeability under Chosen Message Attack)
- Common algorithms: RSA, DSA, ECDSA, EdDSA
- Typically sign hash of message (not message directly) for efficiency
- Requires secure key management (private key must be secret)
- Separate key pairs recommended for signing vs encryption
- Vulnerable to quantum computers (post-quantum schemes in development)
- Industry standards: PKCS#1, PKCS#7/CMS, X.509, XML-DSig
- Security depends on: algorithm security, key size, hash function, padding, key management

---

## 🔗 Related Subjects

- **Public-Key Cryptography**: Understanding the cryptographic foundation that digital signatures are built upon
- **Public Key Infrastructure (PKI)**: How certificate authorities and digital certificates provide trust for public keys used in signature verification

---

*Summary created: 2026-01-13*



