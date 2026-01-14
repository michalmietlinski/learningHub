https://en.wikipedia.org/wiki/Public-key_cryptography

## Related Summaries & Subjects
- [Symmetric-Key Algorithm](../summaries/2026-01-12-symmetric-key-algorithm.md) - Public-key and symmetric cryptography are complementary; public-key is often used to exchange symmetric keys in hybrid systems
- [Forward Secrecy](../summaries/2026-01-04-forward-secrecy.md) - Uses Diffie-Hellman key exchange (public-key cryptography) for ephemeral session keys
- [Online Certificate Status Protocol (OCSP)](../summaries/2026-01-08-online-certificate-status-protocol.md) - Uses public-key cryptography for certificate validation and digital signatures
- [NP-Hardness](../summaries/2026-01-05-np-hardness.md) - Public-key cryptography security relies on computational problems that are believed to be hard (like factoring large numbers)

# Public-Key Cryptography - Summary

---

## 📚 Basic Summary

### What is Public-Key Cryptography?

**Public-key cryptography** (also called **asymmetric cryptography**) is a cryptographic system that uses **pairs of related keys**: a **public key** (shared openly) and a **private key** (kept secret). Unlike traditional symmetric cryptography where both parties need the same secret key, public-key cryptography allows secure communication without sharing secrets beforehand.

**Simple Analogy:**
- Like a mailbox: anyone can drop mail in (public key encrypts), but only you have the key to open it (private key decrypts)
- Like a padlock: you give away copies of the lock (public key), but only you have the key (private key)
- Like a safe deposit box: anyone can put things in using the public combination, but only you can retrieve them with the private combination

### Key Concepts

**1. Key Pairs:**
- **Public Key**: Can be shared openly, used to encrypt messages or verify signatures
- **Private Key**: Must be kept secret, used to decrypt messages or create signatures
- **Mathematically Related**: Keys are generated together and mathematically linked, but you can't derive the private key from the public key

**2. Two Main Uses:**

**A. Encryption (Confidentiality):**
- Anyone can encrypt a message using your public key
- Only you can decrypt it using your private key
- Example: Secure email, HTTPS

**B. Digital Signatures (Authentication & Integrity):**
- You sign a message with your private key
- Anyone can verify the signature using your public key
- Proves the message came from you and wasn't modified

**3. How It Works:**
- Keys are generated using mathematical problems that are easy one way but hard to reverse
- Public key is distributed widely (like on a website or in software)
- Private key stays secret on your device
- Security depends on keeping the private key secret

### Real-World Examples

**1. HTTPS/SSL/TLS:**
- Website has public/private key pair
- Browser uses website's public key to encrypt data
- Only website can decrypt with its private key

**2. Email Encryption (PGP/S/MIME):**
- Encrypt emails with recipient's public key
- Only recipient can decrypt with their private key

**3. Digital Signatures:**
- Software publisher signs code with private key
- Users verify signature with public key
- Ensures software hasn't been tampered with

**4. Bitcoin/Cryptocurrency:**
- Wallet address = public key
- Private key controls the wallet
- Lose private key = lose access forever

### Why It Matters

- **No Pre-Shared Secret**: Don't need to securely exchange keys beforehand
- **Scalability**: One public key can be used by unlimited people
- **Digital Signatures**: Prove authenticity and integrity
- **Foundation of Internet Security**: Powers HTTPS, SSH, digital certificates

---

## 🔬 Extended Summary

### How Public-Key Cryptography Works

**Mathematical Foundation:**
- Based on **one-way functions** - easy to compute in one direction, hard to reverse
- Examples: Factoring large numbers (RSA), discrete logarithm (Diffie-Hellman, ECC)
- Security relies on computational difficulty, not secrecy of algorithm

**Key Generation:**
1. Generate large random numbers
2. Use mathematical operations to create key pair
3. Public key can be derived from private key (one-way)
4. Private key cannot be derived from public key (computationally infeasible)

**Encryption Process:**
```
1. Alice wants to send secret message to Bob
2. Alice gets Bob's public key (from website, directory, etc.)
3. Alice encrypts message with Bob's public key
4. Alice sends encrypted message to Bob
5. Bob decrypts with his private key (only he has it)
```

**Digital Signature Process:**
```
1. Alice wants to sign a message
2. Alice creates signature using her private key + message
3. Alice sends message + signature to Bob
4. Bob verifies signature using Alice's public key
5. If signature is valid, message is authentic and unmodified
```

### Types of Public-Key Cryptography

**1. Public-Key Encryption:**
- **Purpose**: Confidentiality (only intended recipient can read)
- **Process**: Encrypt with public key, decrypt with private key
- **Algorithms**: RSA, ElGamal, ECIES
- **Use Cases**: Secure email, encrypted messaging, file encryption

**2. Digital Signatures:**
- **Purpose**: Authentication (proves sender) and Integrity (proves message unchanged)
- **Process**: Sign with private key, verify with public key
- **Algorithms**: RSA signatures, DSA, ECDSA, EdDSA
- **Use Cases**: Code signing, document signing, blockchain transactions

**3. Key Exchange (Diffie-Hellman):**
- **Purpose**: Establish shared secret key between two parties
- **Process**: Both parties generate temporary key pairs, exchange public keys, compute shared secret
- **Algorithms**: Diffie-Hellman, Elliptic Curve Diffie-Hellman (ECDH)
- **Use Cases**: TLS handshake, SSH key exchange, forward secrecy

**4. Key Encapsulation:**
- **Purpose**: Securely transmit symmetric keys
- **Process**: Encapsulate symmetric key in public-key encrypted package
- **Algorithms**: RSA-KEM, ECIES-KEM
- **Use Cases**: Hybrid cryptosystems, key distribution

### Hybrid Cryptosystems

**Why Hybrid?**
- Public-key cryptography is **slow** (100-1000x slower than symmetric)
- Symmetric cryptography is **fast** but requires shared secret
- **Solution**: Combine both

**How It Works:**
1. Use public-key cryptography to securely exchange a **symmetric key**
2. Use the symmetric key for actual data encryption (fast)
3. Best of both worlds: security + performance

**Example (TLS/HTTPS):**
```
1. Client and server use public-key crypto to agree on session key
2. All data encrypted with fast symmetric encryption using session key
3. Session key is ephemeral (discarded after connection)
```

### Security Properties

**Confidentiality:**
- Only holder of private key can decrypt
- Public key can be shared openly without compromising security

**Authentication:**
- Digital signatures prove message came from private key holder
- Public key serves as identity

**Integrity:**
- Digital signatures detect any message modification
- Invalid signature = message was tampered with

**Non-Repudiation:**
- Signer cannot deny signing (only they have private key)
- Important for legal/contractual purposes

### Weaknesses & Limitations

**1. Algorithm Vulnerabilities:**
- Quantum computers threaten current algorithms (RSA, ECC)
- Post-quantum cryptography being developed
- Older algorithms may have discovered weaknesses

**2. Key Management:**
- Private key must be kept secret (hardware security modules, key storage)
- Key loss = permanent data loss
- Key compromise = security breach

**3. Public Key Infrastructure (PKI):**
- Need to verify public keys belong to correct person
- Certificate authorities (CAs) provide trust
- Man-in-the-middle attacks if PKI compromised

**4. Unencrypted Metadata:**
- Public-key crypto encrypts content, not metadata
- Attackers can see who communicates with whom, when, how much data
- Traffic analysis still possible

**5. Performance:**
- Much slower than symmetric cryptography
- Not suitable for bulk data encryption
- Usually used only for key exchange or small data

### Historical Development

**Anticipation (Pre-1970s):**
- 1874: William Stanley Jevons noted one-way functions in mathematics
- Concept existed but no practical implementation

**Classified Discovery (1970-1976):**
- **1970**: James H. Ellis (GCHQ, UK) conceived idea of "non-secret encryption"
- **1973**: Clifford Cocks (GCHQ) developed RSA algorithm (kept secret)
- **1974**: Malcolm J. Williamson (GCHQ) developed Diffie-Hellman key exchange (kept secret)
- **Classified until 1997**: British government kept discoveries secret

**Public Discovery (1976-1978):**
- **1976**: Whitfield Diffie and Martin Hellman published "New Directions in Cryptography"
- Introduced public-key cryptography concept publicly
- Described Diffie-Hellman key exchange
- **1978**: Ron Rivest, Adi Shamir, Leonard Adleman published RSA algorithm
- Named after their initials (RSA)

**Impact:**
- Revolutionized cryptography
- Enabled secure communication over insecure channels
- Foundation of modern internet security

### Common Algorithms

**RSA (Rivest-Shamir-Adleman):**
- Based on factoring large numbers
- Most widely used public-key algorithm
- Used for encryption and signatures
- Key sizes: 2048-4096 bits (recommended)

**Elliptic Curve Cryptography (ECC):**
- Based on elliptic curve discrete logarithm
- Smaller keys for same security (256-bit ECC ≈ 3072-bit RSA)
- Faster than RSA
- Algorithms: ECDSA (signatures), ECDH (key exchange), EdDSA

**Diffie-Hellman:**
- Key exchange protocol
- Not encryption, just establishes shared secret
- Variants: DHE (ephemeral), ECDHE (elliptic curve)
- Used in TLS for forward secrecy

**Digital Signature Algorithm (DSA):**
- Signature-only (not encryption)
- Based on discrete logarithm
- Used in government/enterprise

### Real-World Applications

**1. Transport Layer Security (TLS/HTTPS):**
- Websites use public-key crypto for authentication
- Key exchange uses Diffie-Hellman or RSA
- Enables secure web browsing

**2. Secure Shell (SSH):**
- Server authentication with public keys
- Key-based login (no passwords)
- Encrypted remote access

**3. Email Security (PGP/S/MIME):**
- Encrypt emails with recipient's public key
- Sign emails with sender's private key
- End-to-end email security

**4. Code Signing:**
- Software publishers sign code with private key
- Users verify signatures with public key
- Prevents tampering and malware

**5. Blockchain/Cryptocurrency:**
- Wallet addresses derived from public keys
- Transactions signed with private keys
- Cryptographic proof of ownership

**6. Digital Certificates (PKI):**
- Certificates bind public keys to identities
- Certificate authorities sign certificates
- Foundation of trust on the internet

**7. Secure Messaging:**
- Signal, WhatsApp use public-key crypto
- End-to-end encryption
- Forward secrecy for past messages

### Comparison: Public-Key vs Symmetric Cryptography

| Aspect | Symmetric | Public-Key |
|--------|----------|------------|
| **Keys** | Same key for both parties | Different keys (public/private) |
| **Key Exchange** | Must share secret securely | Public key can be shared openly |
| **Speed** | Very fast | Slow (100-1000x slower) |
| **Use Case** | Bulk data encryption | Key exchange, signatures, small data |
| **Scalability** | N keys for N users | 1 public key per user |
| **Security** | Key must be secret | Only private key must be secret |

**Best Practice:** Use hybrid approach - public-key for key exchange, symmetric for data encryption.

### Key Management Best Practices

**Private Key Protection:**
- Store in hardware security modules (HSMs)
- Use secure key storage (keychain, keystore)
- Never share private keys
- Use strong passphrases for encrypted private keys
- Regular key rotation

**Public Key Distribution:**
- Publish on websites, directories
- Include in certificates (PKI)
- Use key servers (PGP keyservers)
- Verify authenticity (fingerprints, certificates)

**Key Lifecycle:**
- Generate strong random keys
- Rotate keys periodically
- Revoke compromised keys immediately
- Archive old keys (for decryption of old data)

---

## 🎯 Key Takeaways

**For Beginners:**
- Public-key cryptography uses two keys: public (shared) and private (secret)
- Public key encrypts, private key decrypts
- Private key signs, public key verifies
- No need to share secrets beforehand
- Powers HTTPS, email encryption, digital signatures
- Much slower than symmetric crypto, so usually used for key exchange

**For Experienced Developers:**
- Based on one-way mathematical functions (factoring, discrete log)
- Security depends on computational difficulty, not algorithm secrecy
- Hybrid cryptosystems combine public-key (key exchange) + symmetric (data encryption)
- Key management is critical: protect private keys, verify public keys
- Quantum computers threaten current algorithms; post-quantum crypto in development
- Performance trade-off: use for authentication/signatures/key exchange, not bulk encryption
- PKI provides trust infrastructure for public key verification
- Forward secrecy uses ephemeral public-key key exchange (Diffie-Hellman)

---

## 🔗 Related Subjects

- [Digital Signature](../summaries/2026-01-13-digital-signature.md): One of the main applications of public-key cryptography, providing authentication, integrity, and non-repudiation
- **Symmetric Cryptography**: Understanding traditional encryption methods that public-key cryptography complements
- **Public Key Infrastructure (PKI)**: How certificate authorities and digital certificates provide trust for public keys

---

*Summary created: 2026-01-12*

