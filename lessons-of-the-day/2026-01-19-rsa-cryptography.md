# RSA Cryptography - Deep Dive

## 📋 Learning Objectives

- [ ] Understand RSA algorithm definition and principles
- [ ] Learn RSA key generation, encryption, and decryption
- [ ] Master the mathematical foundations (modular arithmetic, prime numbers)
- [ ] Recognize RSA security and key size considerations
- [ ] Understand RSA use cases and limitations
- [ ] Learn best practices for RSA implementation

---

## 🎯 Definition

**RSA (Rivest-Shamir-Adleman)** is a public-key cryptosystem that is widely used for secure data transmission. It's based on the mathematical difficulty of factoring large composite numbers into their prime factors.

**Origin:**
- Named after Ron Rivest, Adi Shamir, and Leonard Adleman (1977)
- First practical public-key cryptosystem
- Foundation of modern public-key cryptography
- Still widely used today

**Key Principles:**
- **Public Key** - Used for encryption, can be shared publicly
- **Private Key** - Used for decryption, must be kept secret
- **Asymmetric** - Different keys for encryption and decryption
- **One-Way Function** - Easy to encrypt, hard to decrypt without private key
- **Factoring Problem** - Security based on difficulty of factoring large numbers

**Key Principle:**
> "RSA uses the mathematical properties of prime numbers and modular arithmetic. The security relies on the difficulty of factoring large composite numbers. Anyone can encrypt with the public key, but only the holder of the private key can decrypt."

---

## 🏗️ How RSA Works

### Mathematical Foundation

**Core Concept:**
- Choose two large prime numbers: p and q
- Calculate n = p × q (modulus)
- Calculate φ(n) = (p-1) × (q-1) (Euler's totient function)
- Choose e (public exponent) such that 1 < e < φ(n) and gcd(e, φ(n)) = 1
- Calculate d (private exponent) such that e × d ≡ 1 (mod φ(n))

**Key Components:**
- **Public Key:** (n, e) - modulus and public exponent
- **Private Key:** (n, d) - modulus and private exponent
- **Modulus (n):** Product of two primes
- **Public Exponent (e):** Usually 65537 (0x10001)
- **Private Exponent (d):** Calculated from e and φ(n)

### Key Generation

```typescript
// Simplified RSA Key Generation
export class RSAKeyGenerator {
  generateKeyPair(keySize: number = 2048): { publicKey: RSAPublicKey; privateKey: RSAPrivateKey } {
    // Step 1: Generate two large prime numbers
    const p = this.generateLargePrime(keySize / 2);
    const q = this.generateLargePrime(keySize / 2);
    
    // Step 2: Calculate modulus
    const n = p * q;
    
    // Step 3: Calculate Euler's totient function
    const phiN = (p - 1) * (q - 1);
    
    // Step 4: Choose public exponent (usually 65537)
    const e = 65537;
    
    // Step 5: Calculate private exponent (modular inverse)
    const d = this.modularInverse(e, phiN);
    
    return {
      publicKey: { n, e },
      privateKey: { n, d, p, q } // p and q kept for optimization
    };
  }

  private generateLargePrime(bits: number): bigint {
    // Generate random large prime number
    // In practice, use cryptographically secure random number generator
    // This is simplified - real implementation is more complex
    return this.findPrime(bits);
  }

  private modularInverse(a: bigint, m: bigint): bigint {
    // Extended Euclidean Algorithm
    // Find x such that (a * x) mod m = 1
    // This is simplified - real implementation uses extended Euclidean algorithm
    return this.extendedGCD(a, m).x;
  }
}
```

### Encryption

**Process:**
1. Convert message to number (m)
2. Encrypt: c = m^e mod n
3. Ciphertext is c

```typescript
export class RSAEncryption {
  encrypt(message: string, publicKey: RSAPublicKey): bigint {
    // Convert message to number
    const m = this.messageToNumber(message);
    
    // Encrypt: c = m^e mod n
    const c = this.modularExponentiation(m, publicKey.e, publicKey.n);
    
    return c;
  }

  private messageToNumber(message: string): bigint {
    // Convert string to number (simplified)
    // In practice, use OAEP padding
    return BigInt('0x' + Buffer.from(message, 'utf8').toString('hex'));
  }

  private modularExponentiation(base: bigint, exp: bigint, mod: bigint): bigint {
    // Efficient modular exponentiation (binary method)
    let result = 1n;
    base = base % mod;
    
    while (exp > 0n) {
      if (exp % 2n === 1n) {
        result = (result * base) % mod;
      }
      exp = exp >> 1n;
      base = (base * base) % mod;
    }
    
    return result;
  }
}
```

### Decryption

**Process:**
1. Receive ciphertext (c)
2. Decrypt: m = c^d mod n
3. Convert number back to message

```typescript
export class RSADecryption {
  decrypt(ciphertext: bigint, privateKey: RSAPrivateKey): string {
    // Decrypt: m = c^d mod n
    const m = this.modularExponentiation(ciphertext, privateKey.d, privateKey.n);
    
    // Convert number back to message
    return this.numberToMessage(m);
  }

  private numberToMessage(number: bigint): string {
    // Convert number back to string (simplified)
    // In practice, remove OAEP padding
    const hex = number.toString(16);
    return Buffer.from(hex, 'hex').toString('utf8');
  }

  private modularExponentiation(base: bigint, exp: bigint, mod: bigint): bigint {
    // Same as encryption
    let result = 1n;
    base = base % mod;
    
    while (exp > 0n) {
      if (exp % 2n === 1n) {
        result = (result * base) % mod;
      }
      exp = exp >> 1n;
      base = (base * base) % mod;
    }
    
    return result;
  }
}
```

---

## 🔐 Security

### Key Size Recommendations

**Key Sizes:**
- **1024 bits** - ❌ Deprecated, not secure
- **2048 bits** - ✅ Minimum recommended (until 2030)
- **3072 bits** - ✅ Recommended for long-term security
- **4096 bits** - ✅ High security, slower performance

**Security Level:**
- 2048-bit RSA ≈ 112 bits of security
- 3072-bit RSA ≈ 128 bits of security
- 4096-bit RSA ≈ 140 bits of security

### Security Assumptions

**RSA Security Relies On:**
1. **Factoring Problem** - Difficulty of factoring n = p × q
2. **RSA Problem** - Difficulty of finding m from c = m^e mod n
3. **Large Prime Numbers** - p and q must be large and random

**Attacks:**
- **Factoring Attacks** - Factor n to get p and q
- **Timing Attacks** - Exploit timing differences
- **Side-Channel Attacks** - Power analysis, etc.
- **Small Exponent Attacks** - If e is too small

---

## 💡 Use Cases

### 1. Digital Signatures

**Process:**
- Sign: signature = hash(message)^d mod n
- Verify: hash(message) = signature^e mod n

```typescript
export class RSASignature {
  sign(message: string, privateKey: RSAPrivateKey): bigint {
    // Hash message
    const hash = this.hashMessage(message);
    
    // Sign with private key: signature = hash^d mod n
    const signature = this.modularExponentiation(hash, privateKey.d, privateKey.n);
    
    return signature;
  }

  verify(message: string, signature: bigint, publicKey: RSAPublicKey): boolean {
    // Hash message
    const hash = this.hashMessage(message);
    
    // Verify: hash = signature^e mod n
    const computedHash = this.modularExponentiation(signature, publicKey.e, publicKey.n);
    
    return hash === computedHash;
  }

  private hashMessage(message: string): bigint {
    // Use SHA-256 or similar
    const hash = crypto.createHash('sha256').update(message).digest();
    return BigInt('0x' + hash.toString('hex'));
  }
}
```

### 2. Key Exchange

**Process:**
- Encrypt symmetric key with recipient's public key
- Recipient decrypts with private key
- Use symmetric key for bulk encryption

```typescript
export class RSAKeyExchange {
  encryptSymmetricKey(symmetricKey: Buffer, recipientPublicKey: RSAPublicKey): bigint {
    // Encrypt symmetric key with RSA
    const keyNumber = BigInt('0x' + symmetricKey.toString('hex'));
    return this.modularExponentiation(keyNumber, recipientPublicKey.e, recipientPublicKey.n);
  }

  decryptSymmetricKey(encryptedKey: bigint, privateKey: RSAPrivateKey): Buffer {
    // Decrypt symmetric key
    const keyNumber = this.modularExponentiation(encryptedKey, privateKey.d, privateKey.n);
    const hex = keyNumber.toString(16);
    return Buffer.from(hex, 'hex');
  }
}
```

### 3. Hybrid Cryptosystems

**Common Pattern:**
1. Use RSA to encrypt/exchange symmetric key
2. Use AES (symmetric) for bulk data encryption
3. Best of both worlds: RSA security + AES speed

---

## ⚠️ Limitations and Considerations

### 1. Performance

**Issues:**
- ❌ Slow for large data (encryption/decryption)
- ❌ Computationally expensive
- ❌ Not suitable for bulk encryption

**Solutions:**
- ✅ Use for small data (keys, signatures)
- ✅ Use hybrid cryptosystems (RSA + AES)
- ✅ Use hardware acceleration

### 2. Message Size Limit

**Limitation:**
- Can only encrypt messages smaller than modulus
- For 2048-bit RSA: max ~245 bytes
- Must use padding (OAEP recommended)

**Solution:**
- Use RSA for keys only
- Use symmetric encryption for data
- Hybrid approach

### 3. Padding Requirements

**Why Padding:**
- Prevents certain attacks
- Adds randomness
- Makes encryption secure

**Padding Schemes:**
- **PKCS#1 v1.5** - Older, still used
- **OAEP** - ✅ Recommended (Optimal Asymmetric Encryption Padding)

---

## ✅ Best Practices

### 1. Key Size

✅ **Do:**
- Use at least 2048 bits
- Use 3072 bits for long-term security
- Use 4096 bits for high security

❌ **Don't:**
- Use 1024 bits or less
- Use same key forever
- Share private keys

### 2. Implementation

✅ **Do:**
- Use well-tested libraries (OpenSSL, crypto)
- Use OAEP padding
- Use proper random number generation
- Protect private keys

❌ **Don't:**
- Implement RSA yourself
- Use weak random number generators
- Store private keys insecurely
- Skip padding

### 3. Use Cases

✅ **Do:**
- Use for digital signatures
- Use for key exchange
- Use in hybrid systems
- Use for small data

❌ **Don't:**
- Encrypt large files directly
- Use for bulk encryption
- Use without padding
- Use deprecated key sizes

---

## 🔀 RSA vs Other Cryptosystems

### RSA vs ECC (Elliptic Curve Cryptography)

**RSA:**
- Longer keys needed
- Slower operations
- Widely supported
- Mature technology

**ECC:**
- Shorter keys (256-bit ECC ≈ 3072-bit RSA)
- Faster operations
- Less widely supported
- Newer technology

**Key Difference:** ECC provides same security with smaller keys.

### RSA vs AES

**RSA:**
- Asymmetric (public/private key)
- Slow for large data
- Used for key exchange, signatures

**AES:**
- Symmetric (same key)
- Fast for large data
- Used for bulk encryption

**Key Difference:** RSA is asymmetric, AES is symmetric. Often used together.

---

## 🌍 Real-World Applications

### 1. TLS/SSL

**Usage:**
- RSA key exchange (TLS 1.2)
- RSA signatures for certificates
- Being replaced by ECDHE in TLS 1.3

### 2. Digital Certificates

**Usage:**
- Certificate Authority (CA) signs certificates with RSA
- Browser verifies with CA's public key
- Chain of trust

### 3. Email Encryption (PGP/GPG)

**Usage:**
- RSA for key exchange
- RSA for digital signatures
- Hybrid with symmetric encryption

### 4. Code Signing

**Usage:**
- Sign software with RSA private key
- Users verify with public key
- Ensures software authenticity

---

## 📊 Security Considerations

### Current Status

**RSA Security:**
- ✅ 2048-bit RSA is secure for now
- ⚠️ 1024-bit RSA is broken
- ⚠️ Quantum computers threaten RSA (future)
- ✅ Post-quantum cryptography being developed

### Quantum Threat

**Shor's Algorithm:**
- Can factor large numbers efficiently on quantum computers
- Would break RSA if large quantum computers exist
- Not a current threat (quantum computers not large enough yet)
- Migration to post-quantum cryptography planned

---

## 🎓 Summary

### Key Takeaways

1. **RSA** is a public-key cryptosystem
2. **Public Key** encrypts, **Private Key** decrypts
3. **Security** based on factoring large numbers
4. **Key Size** - Use at least 2048 bits
5. **Use Cases** - Signatures, key exchange, hybrid systems
6. **Limitations** - Slow, message size limits
7. **Best Practice** - Use with AES in hybrid systems
8. **Padding** - Always use OAEP padding

### When to Use

✅ **Use RSA For:**
- Digital signatures
- Key exchange
- Small data encryption
- Hybrid cryptosystems

❌ **Don't Use RSA For:**
- Large file encryption
- Bulk data encryption
- Real-time high-throughput systems
- Without proper padding

### Best Practices

- Use at least 2048-bit keys
- Use OAEP padding
- Use well-tested libraries
- Protect private keys
- Use in hybrid systems with AES
- Rotate keys regularly

### Next Steps

After understanding RSA, consider:
- **Elliptic Curve Cryptography (ECC)** - Modern alternative
- **Digital Signatures** - RSA signature schemes
- **TLS/SSL** - How RSA is used in HTTPS
- **Post-Quantum Cryptography** - Future of cryptography

---

## 📚 Additional Resources

**Original Paper:**
- Rivest, Shamir, Adleman - "A Method for Obtaining Digital Signatures and Public-Key Cryptosystems" (1978)

**Standards:**
- PKCS#1 - RSA Cryptography Standard
- RFC 3447 - Public-Key Cryptography Standards
- FIPS 186-4 - Digital Signature Standard

**Related Topics:**
- Public-Key Cryptography
- Digital Signatures
- Key Exchange Protocols
- Hybrid Cryptosystems

---

