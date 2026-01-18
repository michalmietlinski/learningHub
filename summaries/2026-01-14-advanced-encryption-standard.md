https://en.wikipedia.org/wiki/Advanced_Encryption_Standard

## Related Summaries & Subjects
- [Symmetric-Key Algorithm](../summaries/2026-01-12-symmetric-key-algorithm.md) - AES is the most widely used symmetric-key algorithm and the current encryption standard
- [Public-Key Cryptography](../summaries/2026-01-12-public-key-cryptography.md) - AES is often used in hybrid cryptosystems where public-key crypto exchanges AES keys
- [Forward Secrecy](../summaries/2026-01-04-forward-secrecy.md) - AES is commonly used with ephemeral keys for forward secrecy in TLS/HTTPS

# Advanced Encryption Standard (AES) - Summary

---

## 📚 Basic Summary

### What is AES?

**Advanced Encryption Standard (AES)** is the most widely used encryption algorithm in the world. It's a symmetric block cipher that encrypts data in 128-bit blocks using keys of 128, 192, or 256 bits. AES was selected by the U.S. National Institute of Standards and Technology (NIST) in 2001 to replace the aging DES (Data Encryption Standard).

**Simple Analogy:**
- Like a high-security safe that scrambles your data into unreadable form
- Like a sophisticated lock that requires the exact key to unlock
- Like a digital vault protecting your information

### Key Concepts

**1. Block Cipher:**
- Encrypts data in fixed 128-bit blocks
- Must pad data that doesn't fit block size
- Processes data in chunks, not continuously

**2. Key Sizes:**
- **AES-128**: 128-bit key (fastest, widely used)
- **AES-192**: 192-bit key (moderate security)
- **AES-256**: 256-bit key (highest security, quantum-resistant)

**3. How It Works:**
- Takes plaintext (128 bits) + key (128/192/256 bits)
- Applies multiple rounds of substitution and permutation
- Produces ciphertext (128 bits)
- Same key encrypts and decrypts

**4. Security:**
- Currently considered unbreakable with proper implementation
- No known practical attacks
- Used by governments, banks, and security-critical systems

### Real-World Examples

**1. HTTPS/TLS:**
- All secure web traffic encrypted with AES
- Used in TLS 1.2 and TLS 1.3
- Protects your browsing, online banking, shopping

**2. Wi-Fi Security (WPA2/WPA3):**
- Wireless networks use AES for encryption
- Protects your Wi-Fi traffic from eavesdroppers

**3. Disk Encryption:**
- BitLocker (Windows), FileVault (macOS), LUKS (Linux)
- Full disk encryption uses AES
- Protects data if device is stolen

**4. VPNs:**
- Virtual private networks use AES
- Encrypts all traffic between you and VPN server
- Protects privacy and security

**5. File Encryption:**
- Encrypting individual files or folders
- Database encryption
- Cloud storage encryption

**6. Messaging Apps:**
- End-to-end encryption often uses AES
- Protects messages from interception

### Why It Matters

- **Industry Standard**: Most widely adopted encryption algorithm
- **Government Approved**: Used by NSA for top-secret information
- **Fast**: Hardware-accelerated on modern processors
- **Secure**: No known practical attacks
- **Universal**: Supported everywhere (browsers, operating systems, devices)

---

## 🔬 Extended Summary

### History & Development

**1997: DES Replacement Needed**
- DES (Data Encryption Standard) was aging
- 56-bit key size becoming insecure
- NIST announced competition for new standard

**1998-2000: AES Competition**
- 15 algorithms submitted
- 5 finalists selected: MARS, RC6, Rijndael, Serpent, Twofish
- Public evaluation and cryptanalysis
- Open, transparent selection process

**2000: Rijndael Selected**
- Designed by Belgian cryptographers: Joan Daemen and Vincent Rijmen
- Named after their surnames (Rijndael = Rijn + Daemen)
- Selected for combination of security, performance, and flexibility

**2001: Standardization**
- Published as FIPS 197 (Federal Information Processing Standard)
- Became official U.S. government standard
- Replaced DES and 3DES

**2003: NSA Approval**
- NSA approved AES for classified information
- AES-256 approved for top-secret data
- Highest level of government confidence

### Technical Details

**Algorithm Structure:**

**Substitution-Permutation Network (SPN):**
- Uses S-boxes (substitution boxes) for non-linear transformation
- Uses permutations for linear transformation
- Multiple rounds provide security

**Key Rounds:**
- **AES-128**: 10 rounds
- **AES-192**: 12 rounds
- **AES-256**: 14 rounds
- More rounds = more security (but slower)

**Operations Per Round:**

**1. SubBytes:**
- Non-linear substitution using S-box
- Each byte replaced with another byte
- Provides confusion (makes relationship between key and ciphertext complex)

**2. ShiftRows:**
- Cyclically shifts rows of state matrix
- Provides diffusion (spreads influence of each input bit)

**3. MixColumns:**
- Mixes columns using matrix multiplication
- Further diffusion
- Not applied in final round

**4. AddRoundKey:**
- XORs state with round key
- Key schedule generates round keys from main key

**Key Schedule:**
- Expands main key into round keys
- Each round uses different key
- Derived deterministically from main key

### Security Analysis

**Current Security Status:**
- ✅ **No known practical attacks** on full AES
- ✅ **Extensively analyzed** by cryptographers worldwide
- ✅ **Government approved** for classified information
- ✅ **Industry standard** for 20+ years

**Attack Resistance:**

**1. Brute Force:**
- **AES-128**: 2^128 possible keys (practically impossible)
- **AES-192**: 2^192 possible keys (extremely difficult)
- **AES-256**: 2^256 possible keys (computationally infeasible)
- Even with all computers on Earth, would take billions of years

**2. Cryptanalytic Attacks:**
- **Differential Cryptanalysis**: Resistant
- **Linear Cryptanalysis**: Resistant
- **Related-Key Attacks**: Some theoretical attacks on reduced rounds, but not practical
- **Side-Channel Attacks**: Possible if implementation is flawed (timing, power analysis)

**3. Quantum Computing:**
- **Grover's Algorithm**: Can halve effective key size
- **AES-128**: Would have 64-bit security (vulnerable)
- **AES-256**: Would have 128-bit security (quantum-resistant)
- **Recommendation**: Use AES-256 for long-term security against quantum computers

**Known Weaknesses:**
- Some theoretical attacks on reduced-round versions (not full AES)
- Side-channel attacks possible with poor implementation
- Related-key attacks on AES-192 and AES-256 (theoretical, not practical)
- No practical attacks on properly implemented AES

### Performance Characteristics

**Speed:**
- **Software**: ~100-500 MB/s (depending on CPU)
- **Hardware (AES-NI)**: ~1-10 GB/s (very fast)
- **Mobile Devices**: ~50-200 MB/s

**AES-NI (AES New Instructions):**
- Hardware acceleration built into modern CPUs (Intel, AMD)
- Special CPU instructions for AES operations
- 10-100x faster than software implementation
- Available since 2010 (Intel Westmere, AMD Bulldozer)

**Resource Usage:**
- **Memory**: Low (small lookup tables)
- **CPU**: Moderate (without hardware acceleration)
- **Power**: Efficient (especially with hardware acceleration)
- **Latency**: Low (suitable for real-time applications)

**Comparison with Other Algorithms:**
- **Faster than**: DES, 3DES, RSA, ECC
- **Similar speed to**: ChaCha20 (software), Twofish
- **Slower than**: Some stream ciphers (but more secure)

### Modes of Operation

**ECB (Electronic Codebook):**
- Each block encrypted independently
- ❌ **Insecure**: Identical blocks produce identical ciphertext
- ❌ **Not recommended** for use
- Reveals patterns in data

**CBC (Cipher Block Chaining):**
- Each block XORed with previous ciphertext
- Requires initialization vector (IV)
- ✅ **Secure** with proper IV usage
- Used in TLS 1.2

**CTR (Counter):**
- Uses counter + nonce to generate keystream
- Can be parallelized
- ✅ **Fast and secure**
- Used in many modern applications

**GCM (Galois/Counter Mode):**
- Combines CTR mode with authentication
- Provides authenticated encryption (AEAD)
- ✅ **Recommended**: Fast, secure, built-in integrity
- Used in TLS 1.3, modern applications

**XTS (XEX-based Tweaked Codebook):**
- Designed for disk encryption
- Handles sector-level encryption
- Used in: BitLocker, FileVault, LUKS

**Other Modes:**
- **CCM**: Counter with CBC-MAC (authenticated encryption)
- **OCB**: Offset Codebook (authenticated encryption, patented)
- **CFB**: Cipher Feedback (stream cipher mode)
- **OFB**: Output Feedback (stream cipher mode)

### Implementation Considerations

**1. Key Management:**
- Generate keys using cryptographically secure random number generator
- Never reuse keys with same IV
- Store keys securely (HSMs, key management systems)
- Rotate keys periodically

**2. Initialization Vectors (IVs):**
- Must be unique for each encryption with same key
- Should be random/unpredictable
- Can be public (doesn't need to be secret)
- Prevents identical plaintexts from producing identical ciphertexts

**3. Padding:**
- Required for data that doesn't fit 128-bit blocks
- PKCS#7 padding is standard
- Padding oracle attacks possible with improper implementation
- Authenticated encryption (GCM) prevents padding attacks

**4. Side-Channel Resistance:**
- Use constant-time implementations
- Avoid data-dependent branches
- Use hardware acceleration (AES-NI) when available
- Protect against timing attacks, power analysis

**5. Hardware Acceleration:**
- Use AES-NI instructions when available
- 10-100x performance improvement
- More secure (hardware implementation)
- Check CPU support before using

### Real-World Applications

**1. Transport Layer Security (TLS/HTTPS):**
- **TLS 1.2**: AES in CBC or GCM mode
- **TLS 1.3**: AES in GCM mode only
- All HTTPS traffic encrypted with AES
- Most common: AES-128-GCM

**2. Wi-Fi Security:**
- **WPA2**: Uses AES-CCMP (AES in CCM mode)
- **WPA3**: Uses AES-GCMP (AES in GCM mode)
- Protects wireless network traffic

**3. Disk Encryption:**
- **BitLocker**: AES-128 or AES-256 in XTS mode
- **FileVault**: AES-128 or AES-256 in XTS mode
- **LUKS**: AES-256 in XTS mode
- Full disk encryption

**4. VPN Protocols:**
- **IPsec**: AES in various modes
- **OpenVPN**: AES-128 or AES-256
- **WireGuard**: ChaCha20 (but AES also supported)

**5. Database Encryption:**
- Encrypting database files
- Transparent data encryption (TDE)
- Column-level encryption

**6. Cloud Storage:**
- Encrypting data at rest
- Client-side encryption
- Server-side encryption

**7. Messaging & Communication:**
- Signal, WhatsApp use AES (with other algorithms)
- Email encryption (S/MIME)
- Secure file transfer

**8. Government & Military:**
- Classified information protection
- Secure communications
- Data at rest encryption

### Best Practices

**Key Size Selection:**
- ✅ **AES-128**: Current applications, good security
- ✅ **AES-256**: Long-term security, quantum-resistant, high-security applications
- ❌ **AES-192**: Rarely used (not much benefit over AES-128, slower than AES-256)

**Mode Selection:**
- ✅ **GCM**: Recommended for most applications (authenticated encryption)
- ✅ **CTR**: Good for parallel processing
- ✅ **CBC**: Legacy support (use GCM if possible)
- ❌ **ECB**: Never use (insecure)

**Implementation:**
- Use hardware acceleration (AES-NI) when available
- Use constant-time implementations
- Generate keys securely (CSPRNG)
- Use unique IVs for each encryption
- Implement proper error handling

**Security:**
- Protect keys from compromise
- Use authenticated encryption (GCM) when possible
- Rotate keys periodically
- Monitor for key compromise
- Use AES-256 for long-term security

### Comparison with Other Algorithms

**AES vs DES/3DES:**
- ✅ **AES**: Modern, secure, fast
- ❌ **DES/3DES**: Legacy, slower, less secure
- **Status**: DES/3DES being phased out

**AES vs ChaCha20:**
- **AES**: Hardware-accelerated, widely supported
- **ChaCha20**: Faster in software, good for mobile
- **Use**: AES when hardware available, ChaCha20 for software-only

**AES vs RSA:**
- **AES**: Symmetric, fast, for bulk encryption
- **RSA**: Asymmetric, slow, for key exchange
- **Use**: Both together (hybrid cryptosystem)

**AES vs Twofish/Serpent:**
- **AES**: Standardized, widely supported
- **Twofish/Serpent**: AES finalists, secure but less common
- **Status**: AES is de facto standard

### Future Considerations

**Post-Quantum Cryptography:**
- AES-256 is quantum-resistant (128-bit security against quantum)
- NIST standardizing post-quantum algorithms
- AES will remain important (hybrid approach likely)

**Ongoing Analysis:**
- Cryptographers continue analyzing AES
- No practical attacks found in 20+ years
- Confidence remains high

**Standardization:**
- FIPS 197 (current standard)
- ISO/IEC 18033-3 (international standard)
- Widely adopted and standardized

---

## 🎯 Key Takeaways

**For Beginners:**
- AES is the most widely used encryption algorithm in the world
- Encrypts data in 128-bit blocks using 128, 192, or 256-bit keys
- Currently unbreakable with proper implementation
- Used everywhere: HTTPS, Wi-Fi, disk encryption, VPNs
- AES-128 is fast and secure for current use
- AES-256 provides highest security and quantum-resistance

**For Experienced Developers:**
- AES is a substitution-permutation network (SPN) block cipher
- 10/12/14 rounds for AES-128/192/256 respectively
- Use GCM mode for authenticated encryption (recommended)
- Hardware acceleration (AES-NI) provides 10-100x speedup
- Side-channel attacks are possible with poor implementation (use constant-time code)
- AES-256 recommended for long-term security (quantum-resistant: 128-bit security vs quantum)
- Key management is critical: never reuse keys with same IV, use secure RNG
- Proper implementation: constant-time, hardware acceleration, authenticated encryption

---

## 🔗 Related Subjects

- **Symmetric-Key Algorithms**: Understanding the broader category of block ciphers that AES belongs to
- **Block Cipher Modes of Operation**: How AES is used in different modes (CBC, GCM, CTR) for various applications

---

*Summary created: 2026-01-14*




