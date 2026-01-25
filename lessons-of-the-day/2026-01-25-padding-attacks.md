# Padding Attacks - Deep Dive

## 📋 Learning Objectives

- [ ] Understand padding in cryptographic systems
- [ ] Learn different padding schemes (PKCS#7, PKCS#5, etc.)
- [ ] Master padding oracle attacks
- [ ] Recognize padding-related vulnerabilities
- [ ] Understand how to prevent padding attacks
- [ ] Learn best practices for secure padding

---

## 🎯 Definition

**Padding Attacks** are cryptographic attacks that exploit vulnerabilities in how data is padded before encryption. The most common type is the **Padding Oracle Attack**, where an attacker can decrypt ciphertext by exploiting error messages that reveal information about padding validity.

**Origin:**
- Padding Oracle Attack discovered by Serge Vaudenay in 2002
- Related to block cipher modes (CBC, etc.)
- Exploits error handling in decryption
- Common in web applications

**Key Concepts:**
- **Padding** - Adding data to make plaintext fit block size
- **Padding Oracle** - System that reveals padding validity
- **CBC Mode** - Cipher Block Chaining (vulnerable to padding attacks)
- **Error Messages** - Can leak information about padding

**Key Principle:**
> "Padding oracle attacks exploit systems that reveal whether padding is valid or invalid during decryption. By systematically modifying ciphertext and observing error responses, attackers can decrypt data without knowing the encryption key."

---

## 🏗️ How Padding Works

### Block Cipher Padding

**Problem:** Block ciphers (like AES) encrypt data in fixed-size blocks (e.g., 128 bits). Plaintext must be padded to fit block boundaries.

**Example:**
```
Plaintext: "Hello" (5 bytes)
Block size: 16 bytes (AES)

After padding (PKCS#7):
"Hello" + 11 bytes of padding (value 11)
Result: "Hello" + [11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11]
```

### PKCS#7 Padding

**Format:** Add N bytes, each with value N

**Examples:**
```
1 byte needed:  [01]
2 bytes needed: [02, 02]
3 bytes needed: [03, 03, 03]
...
15 bytes:      [0F, 0F, 0F, 0F, 0F, 0F, 0F, 0F, 0F, 0F, 0F, 0F, 0F, 0F, 0F]
16 bytes:      [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10]
```

**Validation:**
- Check last byte value (N)
- Verify last N bytes all equal N
- Reject if invalid

---

## 🔍 Padding Oracle Attack

### Attack Scenario

**Setup:**
1. Attacker has ciphertext (encrypted data)
2. System reveals if padding is valid/invalid
3. Attacker can modify ciphertext
4. System responds with different errors for invalid padding vs invalid data

**Attack Process:**

```
1. Attacker intercepts ciphertext: C1, C2, C3, ...
2. For each block:
   a. Modify previous ciphertext block (C1)
   b. Send modified ciphertext to system
   c. Observe error response:
      - "Invalid padding" → Padding is wrong, try different value
      - "Decryption error" → Padding is valid, but data is wrong (SUCCESS!)
   d. Use this information to decrypt one byte
   e. Repeat for all bytes in block
3. Decrypt all blocks
```

### Example Attack

```typescript
// Vulnerable Server
export class VulnerableServer {
  async decrypt(ciphertext: Buffer): Promise<string> {
    try {
      const plaintext = this.aesDecrypt(ciphertext);
      
      // ❌ VULNERABILITY: Different errors reveal padding validity
      if (!this.isValidPadding(plaintext)) {
        throw new Error('Invalid padding'); // ❌ Reveals padding is invalid
      }
      
      return plaintext.toString();
    } catch (error) {
      // ❌ Different error for decryption failure
      throw new Error('Decryption error'); // ❌ Reveals padding was valid
    }
  }
}

// Attacker
export class PaddingOracleAttacker {
  constructor(private server: VulnerableServer) {}

  async decryptBlock(ciphertext: Buffer, blockIndex: number): Promise<Buffer> {
    const blockSize = 16;
    const previousBlock = this.getPreviousBlock(ciphertext, blockIndex);
    const decrypted = Buffer.alloc(blockSize);

    // Decrypt byte by byte, starting from the end
    for (let bytePos = blockSize - 1; bytePos >= 0; bytePos--) {
      const paddingValue = blockSize - bytePos; // Expected padding value
      
      // Set up padding for bytes we've already decrypted
      for (let i = blockSize - 1; i > bytePos; i--) {
        previousBlock[i] = decrypted[i] ^ paddingValue;
      }

      // Try all possible byte values
      for (let guess = 0; guess < 256; guess++) {
        previousBlock[bytePos] = guess;
        
        try {
          await this.server.decrypt(this.createModifiedCiphertext(previousBlock));
          // If no "Invalid padding" error, we found the right byte!
          decrypted[bytePos] = guess ^ paddingValue;
          break;
        } catch (error) {
          if (error.message === 'Invalid padding') {
            continue; // Wrong guess, try next
          }
          // "Decryption error" means padding was valid!
          decrypted[bytePos] = guess ^ paddingValue;
          break;
        }
      }
    }

    return decrypted;
  }
}
```

---

## 💡 Attack Vectors

### 1. Error Message Differences

**Vulnerability:** Different error messages for invalid padding vs invalid data.

**Example:**
```typescript
// ❌ VULNERABLE
try {
  const plaintext = decrypt(ciphertext);
  if (!isValidPadding(plaintext)) {
    return { error: 'Invalid padding' }; // ❌ Reveals padding issue
  }
  return { data: plaintext };
} catch (error) {
  return { error: 'Decryption failed' }; // ❌ Different error
}
```

### 2. Timing Attacks

**Vulnerability:** Different processing time for invalid padding vs invalid data.

**Example:**
```typescript
// ❌ VULNERABLE: Different code paths = different timing
if (!isValidPadding(plaintext)) {
  return error; // Fast path
}
processData(plaintext); // Slow path - timing difference!
```

### 3. HTTP Status Codes

**Vulnerability:** Different HTTP status codes reveal padding validity.

**Example:**
```typescript
// ❌ VULNERABLE
if (!isValidPadding(plaintext)) {
  return res.status(400).json({ error: 'Bad request' }); // 400
}
return res.status(500).json({ error: 'Server error' }); // 500 - Different!
```

---

## 🛡️ Prevention

### 1. Constant-Time Validation

**Solution:** Always perform full decryption, then validate.

```typescript
// ✅ SECURE: Always decrypt, then validate
export class SecureServer {
  async decrypt(ciphertext: Buffer): Promise<string> {
    try {
      const plaintext = this.aesDecrypt(ciphertext);
      
      // Always validate padding (constant time)
      if (!this.isValidPadding(plaintext)) {
        // Still decrypt and validate, but return generic error
        throw new GenericError();
      }
      
      return plaintext.toString();
    } catch (error) {
      // ✅ Same error for all failures
      throw new GenericError(); // Generic error, no information leak
    }
  }

  private isValidPadding(data: Buffer): boolean {
    // Constant-time padding validation
    const paddingValue = data[data.length - 1];
    if (paddingValue === 0 || paddingValue > 16) {
      return false;
    }

    let isValid = true;
    for (let i = data.length - paddingValue; i < data.length; i++) {
      isValid = isValid && (data[i] === paddingValue);
    }
    return isValid;
  }
}
```

### 2. Generic Error Messages

**Solution:** Always return the same error message.

```typescript
// ✅ SECURE: Generic error
try {
  const plaintext = decrypt(ciphertext);
  if (!isValidPadding(plaintext)) {
    throw new Error('Decryption failed'); // ✅ Same error
  }
  return plaintext;
} catch (error) {
  throw new Error('Decryption failed'); // ✅ Same error
}
```

### 3. Use Authenticated Encryption

**Solution:** Use modes that provide authentication (AEAD).

```typescript
// ✅ SECURE: Use AES-GCM (authenticated encryption)
import { createCipheriv, createDecipheriv } from 'crypto';

export class SecureEncryption {
  encrypt(plaintext: Buffer, key: Buffer, iv: Buffer): { ciphertext: Buffer; tag: Buffer } {
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const ciphertext = Buffer.concat([
      cipher.update(plaintext),
      cipher.final()
    ]);
    const tag = cipher.getAuthTag();
    return { ciphertext, tag };
  }

  decrypt(ciphertext: Buffer, key: Buffer, iv: Buffer, tag: Buffer): Buffer {
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([
      decipher.update(ciphertext),
      decipher.final()
    ]);
    // ✅ GCM automatically validates - no padding needed!
  }
}
```

**AEAD Modes:**
- **AES-GCM** - Galois/Counter Mode (recommended)
- **AES-CCM** - Counter with CBC-MAC
- **ChaCha20-Poly1305** - Stream cipher with authentication

### 4. Constant-Time Comparison

**Solution:** Use constant-time functions for all comparisons.

```typescript
// ✅ SECURE: Constant-time comparison
function constantTimeEquals(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i]; // XOR all differences
  }
  return result === 0; // Only true if all bytes match
}
```

---

## ⚠️ Common Vulnerabilities

### 1. Different Error Messages

**❌ Vulnerable:**
```typescript
if (invalidPadding) {
  return 'Invalid padding error';
}
return 'Decryption error';
```

**✅ Secure:**
```typescript
// Always return same error
return 'Decryption failed';
```

### 2. Timing Differences

**❌ Vulnerable:**
```typescript
if (invalidPadding) {
  return error; // Fast
}
processData(); // Slow - timing leak!
```

**✅ Secure:**
```typescript
// Always perform same operations
const isValid = validatePadding(data);
processData(data); // Always execute
if (!isValid) throw error;
```

### 3. HTTP Status Code Leaks

**❌ Vulnerable:**
```typescript
if (invalidPadding) return res.status(400);
return res.status(500);
```

**✅ Secure:**
```typescript
// Always return same status
return res.status(400).json({ error: 'Request failed' });
```

---

## ✅ Best Practices

### 1. Use Authenticated Encryption

✅ **Do:**
- Use AES-GCM or ChaCha20-Poly1305
- No padding needed
- Built-in authentication
- Prevents padding attacks

❌ **Don't:**
- Use CBC mode without authentication
- Rely on padding alone
- Skip authentication

### 2. Generic Error Handling

✅ **Do:**
- Return same error for all failures
- Don't reveal error type
- Log details server-side only
- Use generic messages

❌ **Don't:**
- Different errors for different failures
- Reveal padding validity
- Leak information in errors

### 3. Constant-Time Operations

✅ **Do:**
- Use constant-time comparisons
- Avoid early returns
- Same code paths
- Constant-time validation

❌ **Don't:**
- Early returns on errors
- Different code paths
- Timing-dependent operations

---

## 🔀 Padding Attacks vs Other Attacks

### Padding Oracle vs Timing Attacks

**Padding Oracle:**
- Exploits error message differences
- Observes error responses
- Can decrypt without key
- Related to padding validation

**Timing Attacks:**
- Exploits time differences
- Observes response times
- Can leak information
- More general attack

**Key Difference:** Padding oracle is a specific type of timing/information leak attack focused on padding.

### Padding Oracle vs Side-Channel Attacks

**Padding Oracle:**
- Information leak through errors
- Specific to padding
- Can be prevented with proper error handling

**Side-Channel Attacks:**
- Information leak through physical channels
- Timing, power consumption, etc.
- More general category

**Key Difference:** Padding oracle is a type of side-channel attack.

---

## 🌍 Real-World Examples

### 1. ASP.NET Padding Oracle (2010)

**Vulnerability:** ASP.NET revealed padding validity through error messages.

**Impact:** Attackers could decrypt ViewState data, leading to authentication bypass.

**Fix:** Microsoft patched to return generic errors.

### 2. TLS/SSL Padding Oracle

**Vulnerability:** Some TLS implementations vulnerable to padding oracle attacks.

**Impact:** Could decrypt TLS traffic.

**Fix:** Use authenticated encryption (AEAD modes).

---

## 📊 Impact and Severity

### Impact

**High Severity:**
- Can decrypt encrypted data
- No key needed
- Can be automated
- Affects confidentiality

**Attack Requirements:**
- Ability to modify ciphertext
- System reveals padding validity
- Multiple requests needed
- Observable error differences

### Mitigation Priority

**Critical:**
- Use authenticated encryption (AES-GCM)
- Generic error messages
- Constant-time validation

**Important:**
- Proper error handling
- Security testing
- Code reviews

---

## 🎓 Summary

### Key Takeaways

1. **Padding Attacks** exploit padding validation to decrypt data
2. **Padding Oracle** reveals if padding is valid through errors
3. **CBC Mode** is vulnerable without authentication
4. **Error Messages** can leak information about padding
5. **Prevention** - Use authenticated encryption (AES-GCM)
6. **Generic Errors** - Always return same error message
7. **Constant-Time** - Use constant-time validation
8. **AEAD Modes** - Best defense (no padding needed)

### Prevention Checklist

✅ Use authenticated encryption (AES-GCM, ChaCha20-Poly1305)
✅ Return generic error messages
✅ Use constant-time validation
✅ Avoid CBC mode without authentication
✅ Test for padding oracle vulnerabilities
✅ Code review for error handling
✅ Security testing

### Next Steps

After understanding padding attacks, consider:
- **Authenticated Encryption** - AES-GCM deep dive
- **TLS/SSL Security** - Protocol security
- **Cryptographic Attacks** - Other attack vectors
- **Security Best Practices** - General security

---

## 📚 Additional Resources

**Original Research:**
- Serge Vaudenay - "Security Flaws Induced by CBC Padding" (2002)

**Related Topics:**
- Authenticated Encryption (AEAD)
- Block Cipher Modes
- Cryptographic Attacks
- TLS/SSL Security

**Standards:**
- PKCS#7 - Padding standard
- NIST SP 800-38A - Block cipher modes
- RFC 5116 - Authenticated Encryption

---

