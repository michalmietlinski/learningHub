https://en.wikipedia.org/wiki/Symmetric-key_algorithm

## Related Summaries & Subjects
- [Advanced Encryption Standard (AES)](../summaries/2026-01-14-advanced-encryption-standard.md) - AES is the most widely used symmetric-key algorithm and the current encryption standard
- [Public-Key Cryptography](../summaries/2026-01-12-public-key-cryptography.md) - Symmetric and public-key cryptography are complementary; public-key is often used to exchange symmetric keys
- [Forward Secrecy](../summaries/2026-01-04-forward-secrecy.md) - Uses symmetric encryption with ephemeral keys exchanged via public-key cryptography (Diffie-Hellman)

# Symmetric-Key Algorithm - Summary

---

## 📚 Basic Summary

### What is Symmetric-Key Cryptography?

**Symmetric-key cryptography** (also called **secret-key** or **shared-key** cryptography) uses the **same key** for both encryption and decryption. Both the sender and receiver must have the same secret key to communicate securely. It's the traditional form of encryption and is much faster than public-key cryptography.

**Simple Analogy:**
- Like a padlock where the same key locks and unlocks
- Like a safe where the same combination opens and closes
- Like a diary with the same password to encrypt and decrypt entries

### Key Concepts

**1. Shared Secret:**
- Both parties must have the **same key**
- Key must be kept secret from everyone else
- Key exchange is the main challenge (how to securely share the key)

**2. How It Works:**
- **Encryption**: Plaintext + Key → Ciphertext
- **Decryption**: Ciphertext + Key → Plaintext
- Same key used for both operations

**3. Two Main Types:**

**A. Stream Ciphers:**
- Encrypt data one byte/bit at a time
- Like a continuous stream
- Examples: ChaCha20, Salsa20, RC4

**B. Block Ciphers:**
- Encrypt data in fixed-size blocks (e.g., 128 bits)
- Must pad data to fit block size
- Examples: AES, DES, 3DES, Blowfish

**4. Key Characteristics:**
- **Fast**: 100-1000x faster than public-key cryptography
- **Efficient**: Smaller key sizes (128-256 bits)
- **Bulk Encryption**: Perfect for encrypting large amounts of data
- **Key Management Challenge**: Must securely share keys beforehand

### Real-World Examples

**1. HTTPS/TLS:**
- Uses symmetric encryption for actual data transfer
- Public-key crypto only used to exchange the symmetric key
- All web traffic encrypted with symmetric algorithms (AES)

**2. File Encryption:**
- Encrypting files on disk (BitLocker, FileVault)
- Database encryption
- Full disk encryption

**3. Wi-Fi (WPA2/WPA3):**
- Uses symmetric encryption (AES) for wireless traffic
- Key exchanged during authentication

**4. VPNs:**
- Bulk data encrypted with symmetric algorithms
- Fast enough for real-time traffic

**5. Messaging Apps:**
- End-to-end encryption uses symmetric keys
- Keys exchanged via public-key cryptography

### Why It Matters

- **Performance**: Fast enough for real-time, bulk data encryption
- **Efficiency**: Small key sizes, low computational overhead
- **Foundation**: Most encryption systems use symmetric crypto for actual data
- **Hybrid Systems**: Combined with public-key crypto for best of both worlds

---

## 🔬 Extended Summary

### Types of Symmetric Ciphers

**1. Stream Ciphers:**

**How They Work:**
- Generate a keystream (pseudo-random stream of bits)
- XOR each plaintext bit/byte with keystream bit/byte
- Encryption and decryption are identical operations (XOR is reversible)

**Characteristics:**
- Process data one bit/byte at a time
- No padding needed
- Can encrypt data of any length
- Must never reuse key with same initialization vector (IV)

**Examples:**
- **ChaCha20**: Modern, fast, secure (used in TLS 1.3)
- **Salsa20**: Similar to ChaCha20
- **RC4**: Older, now considered insecure (deprecated)
- **A5/1**: Used in GSM (now broken)

**Use Cases:**
- Real-time communication (voice, video)
- Network protocols
- When data length is unknown

**2. Block Ciphers:**

**How They Work:**
- Divide plaintext into fixed-size blocks (typically 128 bits)
- Encrypt each block independently or in modes (CBC, GCM, etc.)
- Padding required if data doesn't fit block size

**Characteristics:**
- Process data in fixed-size chunks
- Padding needed for partial blocks
- Various modes of operation (ECB, CBC, CTR, GCM)
- More secure than stream ciphers (generally)

**Examples:**
- **AES (Advanced Encryption Standard)**: Most widely used, 128/192/256-bit keys
- **DES**: Old standard, now insecure (56-bit key)
- **3DES**: Triple DES, legacy support (112-bit effective security)
- **Blowfish**: Fast, variable key length
- **Twofish**: AES finalist, still secure
- **Serpent**: AES finalist, very secure

**Use Cases:**
- File encryption
- Database encryption
- Disk encryption
- Most general-purpose encryption

**Block Cipher Modes:**

**ECB (Electronic Codebook):**
- Each block encrypted independently
- ❌ Insecure: Identical plaintext blocks produce identical ciphertext
- Not recommended for use

**CBC (Cipher Block Chaining):**
- Each block XORed with previous ciphertext before encryption
- Requires initialization vector (IV)
- ✅ More secure than ECB
- Used in TLS 1.2

**CTR (Counter):**
- Uses counter + nonce to generate keystream
- Can be parallelized
- ✅ Fast and secure
- Used in many modern applications

**GCM (Galois/Counter Mode):**
- Combines encryption with authentication
- Provides authenticated encryption (AEAD)
- ✅ Fast, secure, built-in integrity
- Used in TLS 1.3, modern applications

### Common Algorithms

**AES (Advanced Encryption Standard):**
- **Key Sizes**: 128, 192, 256 bits
- **Block Size**: 128 bits
- **Status**: Current standard, widely used, very secure
- **Performance**: Fast, hardware-accelerated on modern CPUs
- **Use**: HTTPS, VPNs, disk encryption, most modern applications

**ChaCha20:**
- **Type**: Stream cipher
- **Key Size**: 256 bits
- **Status**: Modern, secure, fast
- **Performance**: Very fast, especially on devices without AES hardware acceleration
- **Use**: TLS 1.3, modern messaging apps

**3DES (Triple DES):**
- **Key Size**: 168 bits (112 bits effective security)
- **Block Size**: 64 bits
- **Status**: Legacy, being phased out
- **Use**: Legacy systems, backward compatibility

**Blowfish:**
- **Key Size**: 32-448 bits (variable)
- **Block Size**: 64 bits
- **Status**: Still secure but superseded by AES
- **Use**: Some legacy applications

### Security Properties

**Confidentiality:**
- Only parties with the key can decrypt
- Strength depends on key size and algorithm security
- Key must be kept secret

**Key Size vs Security:**
- **128 bits**: Currently secure (AES-128)
- **256 bits**: Very secure, quantum-resistant (AES-256)
- **56 bits**: Insecure (DES)
- **112 bits**: Legacy security (3DES)

**Attack Resistance:**
- Resistant to known-plaintext attacks (with proper implementation)
- Resistant to chosen-plaintext attacks (with proper modes)
- Vulnerable if key is compromised
- Vulnerable if key is reused incorrectly

### Key Management Challenges

**The Key Exchange Problem:**
- Both parties need the same key
- How to securely share the key?
- Traditional solution: Physical exchange, secure channel
- Modern solution: Use public-key cryptography to exchange symmetric keys

**Key Distribution:**
- **N users need N keys** in traditional systems
- Each pair needs a unique key
- Becomes unmanageable with many users
- Public-key crypto solves this (1 public key per user)

**Key Storage:**
- Keys must be stored securely
- Hardware security modules (HSMs) for high-security applications
- Key derivation from passwords (PBKDF2, Argon2)
- Key rotation policies

**Key Lifecycle:**
- Generate strong random keys
- Distribute securely
- Rotate periodically
- Revoke compromised keys
- Archive for decryption of old data

### Hybrid Cryptosystems

**Why Hybrid?**
- Public-key crypto: Secure key exchange, but slow
- Symmetric crypto: Fast encryption, but key exchange problem
- **Solution**: Combine both

**How It Works:**
1. Use public-key cryptography to securely exchange a symmetric key
2. Use symmetric cryptography to encrypt actual data
3. Best of both worlds: security + performance

**Example (TLS/HTTPS):**
```
1. Client and server use public-key crypto (RSA/ECDH) to agree on session key
2. All HTTP data encrypted with fast symmetric encryption (AES) using session key
3. Session key is ephemeral (discarded after connection)
4. New session = new key exchange
```

**Benefits:**
- Fast bulk encryption (symmetric)
- Secure key exchange (public-key)
- Scalable (public-key for key exchange)
- Forward secrecy (ephemeral keys)

### Security Considerations

**1. Key Reuse:**
- ❌ **Never reuse keys** with same IV/nonce
- Stream ciphers: Reusing key+IV allows decryption
- Block ciphers: Reusing key in ECB mode reveals patterns
- **Solution**: Use unique IVs/nonces for each encryption

**2. Initialization Vectors (IVs):**
- Must be unique for each encryption with same key
- Should be random/unpredictable
- Can be public (doesn't need to be secret)
- Prevents identical plaintexts from producing identical ciphertexts

**3. Padding:**
- Block ciphers need padding for partial blocks
- PKCS#7 padding is standard
- Padding oracle attacks possible with improper implementation
- Authenticated encryption (GCM) prevents padding attacks

**4. Side-Channel Attacks:**
- Timing attacks (measure encryption time)
- Power analysis (measure power consumption)
- Cache attacks (observe memory access patterns)
- **Mitigation**: Constant-time implementations, hardware acceleration

**5. Quantum Resistance:**
- Grover's algorithm halves effective key size
- AES-128 → 64-bit security against quantum computers
- AES-256 → 128-bit security (quantum-resistant)
- **Recommendation**: Use AES-256 for long-term security

### Performance Characteristics

**Speed Comparison:**
- **Symmetric (AES)**: ~1-10 GB/s (hardware-accelerated)
- **Public-key (RSA-2048)**: ~10-100 MB/s
- **Ratio**: Symmetric is 100-1000x faster

**Why Symmetric is Faster:**
- Simpler mathematical operations
- Can be parallelized easily
- Hardware acceleration available (AES-NI instructions)
- Less computational overhead

**Resource Usage:**
- Low CPU usage (with hardware acceleration)
- Low memory footprint
- Suitable for embedded devices
- Efficient for bulk data

### Construction Methods

**Feistel Networks:**
- Construction method for block ciphers
- Splits block into two halves
- Applies round function to one half
- Swaps halves, repeats
- Makes non-invertible functions invertible
- Used in DES, Blowfish, Twofish

**Substitution-Permutation Networks (SPN):**
- Alternative construction method
- Applies substitutions (S-boxes) and permutations
- Used in AES
- Generally more secure than Feistel networks

**Reciprocal Ciphers:**
- Encryption and decryption use same algorithm
- Just reverse the key schedule or process
- Simplifies implementation (one algorithm for both)
- Examples: XOR cipher, many stream ciphers, Feistel-based ciphers

### Use as Cryptographic Primitives

**Beyond Encryption:**
- **Message Authentication Codes (MACs)**: HMAC uses hash functions, but can be built from block ciphers
- **Hash Functions**: Can construct hash functions from block ciphers (Davies-Meyer, Matyas-Meyer-Oseas)
- **Pseudorandom Number Generators**: Can use ciphers in counter mode
- **Key Derivation**: Can derive multiple keys from one master key

**Authenticated Encryption:**
- Combines encryption with authentication
- Ensures confidentiality AND integrity
- Modes: GCM, CCM, OCB
- Prevents tampering and chosen-ciphertext attacks

### Historical Context

**Early Cryptography:**
- All cryptography was symmetric until 1970s
- Caesar cipher, substitution ciphers
- Required secure channel for key exchange
- Limited scalability

**Modern Era:**
- DES (1977): First standardized block cipher
- AES (2001): Current standard, replaced DES
- Stream ciphers: RC4 (now deprecated), ChaCha20 (modern)
- Hybrid systems: Combine with public-key crypto

**Current Status:**
- AES is the de facto standard
- ChaCha20 gaining popularity (especially for mobile)
- Legacy algorithms (DES, 3DES) being phased out
- Post-quantum symmetric algorithms being researched

### Comparison: Symmetric vs Public-Key

| Aspect | Symmetric | Public-Key |
|--------|-----------|------------|
| **Keys** | Same key for both parties | Different keys (public/private) |
| **Key Exchange** | Must share secret securely | Public key can be shared openly |
| **Speed** | Very fast (100-1000x faster) | Slow |
| **Key Size** | Small (128-256 bits) | Large (2048-4096 bits) |
| **Use Case** | Bulk data encryption | Key exchange, signatures, small data |
| **Scalability** | N keys for N users | 1 public key per user |
| **Security** | Key must be secret | Only private key must be secret |

**Best Practice:** Use hybrid approach - public-key for key exchange, symmetric for data encryption.

### Real-World Applications

**1. Transport Layer Security (TLS/HTTPS):**
- Symmetric encryption (AES, ChaCha20) for HTTP data
- Public-key crypto (RSA, ECDH) for key exchange
- All web traffic protected

**2. Virtual Private Networks (VPNs):**
- Bulk traffic encrypted with symmetric algorithms
- Fast enough for real-time communication
- Keys exchanged via IKE (uses public-key crypto)

**3. Disk Encryption:**
- Full disk encryption (BitLocker, FileVault, LUKS)
- File system encryption
- Database encryption
- All use symmetric algorithms (AES)

**4. Wireless Security (Wi-Fi):**
- WPA2/WPA3 use AES for encryption
- Keys exchanged during authentication
- Fast enough for wireless communication

**5. Messaging Apps:**
- End-to-end encryption uses symmetric keys
- Keys exchanged via public-key cryptography
- Fast enough for real-time messaging

**6. Cloud Storage:**
- Data encrypted at rest with symmetric algorithms
- Keys managed by cloud provider or customer
- Efficient for large amounts of data

### Best Practices

**Algorithm Selection:**
- ✅ Use AES-256 for long-term security
- ✅ Use AES-128 for current applications
- ✅ Use ChaCha20 for devices without AES hardware
- ❌ Avoid DES, 3DES (legacy, insecure)
- ❌ Avoid RC4 (broken)

**Key Management:**
- Generate keys using cryptographically secure random number generators
- Use unique IVs/nonces for each encryption
- Rotate keys periodically
- Store keys securely (HSMs for high-security)
- Never reuse keys with same IV

**Implementation:**
- Use authenticated encryption (GCM mode) when possible
- Use proper padding (PKCS#7) for block ciphers
- Implement constant-time algorithms to prevent side-channel attacks
- Use hardware acceleration when available (AES-NI)

**Security:**
- Use appropriate key sizes (128+ bits)
- Protect keys from compromise
- Use forward secrecy (ephemeral keys)
- Monitor for key compromise

---

## 🎯 Key Takeaways

**For Beginners:**
- Symmetric-key cryptography uses the same key to encrypt and decrypt
- Much faster than public-key cryptography (100-1000x)
- Two types: stream ciphers (byte-by-byte) and block ciphers (fixed blocks)
- Main challenge: securely sharing the key between parties
- Most encryption systems use symmetric crypto for actual data
- AES is the current standard, ChaCha20 is modern alternative

**For Experienced Developers:**
- Symmetric ciphers are 100-1000x faster than public-key, making them essential for bulk encryption
- Hybrid cryptosystems combine public-key (key exchange) + symmetric (data encryption)
- Key management is critical: never reuse keys with same IV, use unique IVs/nonces
- AES-256 is quantum-resistant (Grover's algorithm halves key size, so 256-bit → 128-bit security)
- Use authenticated encryption (GCM) to prevent tampering and padding attacks
- Side-channel attacks are real threats; use constant-time implementations
- Stream ciphers process data continuously; block ciphers process fixed-size chunks
- Feistel networks and SPN are common construction methods for block ciphers

---

## 🔗 Related Subjects

- **Public-Key Cryptography**: Understanding how symmetric and public-key cryptography complement each other in hybrid systems
- **Key Exchange Protocols**: How symmetric keys are securely exchanged using public-key cryptography (Diffie-Hellman, RSA)

---

*Summary created: 2026-01-12*

