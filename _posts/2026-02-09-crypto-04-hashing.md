---
layout: post
title: "Hashing & MACs: Ensuring Data Integrity (Part 4)"
date: 2026-02-09 11:00:00 +0530
categories: [Cybersecurity, Cryptography]
tags: [hashing, sha256, hmac, integrity, md5]
image: /assets/images/crypto-bg.jpg
description: "Part 4 of the Cryptography Explorer Series. Deep dive into cryptographic hash functions, collision attacks, and Message Authentication Codes."
author: Tharunaditya Anuganti
series: "Cryptography Explorer"
series_order: 4
series_description: "From modern encryption standards (AES/RSA) to Zero-Knowledge Proofs and Post-Quantum Cryptography."
---

# The Fingerprint of Data

We've covered Confidentiality with encryption. But encryption alone doesn't tell us if the data was **modified** in transit. A man-in-the-middle could intercept your encrypted message, flip some bits, and forward the corrupted ciphertext. When you decrypt it, you get garbage—or worse, subtly altered information.

This is where **Hashing** and **Message Authentication Codes (MACs)** come in. They provide **Integrity**—mathematical proof that data hasn't been tampered with.

---

## Cryptographic Hash Functions

A hash function takes input of any size and produces a fixed-size output (the "digest" or "hash").

### Properties of a Good Hash Function

1.  **Deterministic**: Same input always produces same output.
2.  **Fast to Compute**: Hashing a large file should be quick.
3.  **Pre-image Resistance**: Given hash $h$, it's infeasible to find any message $m$ such that $H(m) = h$.
4.  **Second Pre-image Resistance**: Given message $m_1$, it's infeasible to find $m_2 \neq m_1$ where $H(m_1) = H(m_2)$.
5.  **Collision Resistance**: It's infeasible to find any two messages $m_1, m_2$ where $H(m_1) = H(m_2)$.

### The Avalanche Effect

Change one bit in the input, and the entire hash changes unpredictably:

```
SHA-256("Hello World")  = a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e
SHA-256("Hello World.") = f4bb1975bf1f81f76ce824f7536c1e101a8060a632a52289d530a6f600d52c92
```

One period added—completely different hash.

---

## Common Hash Algorithms

### MD5 (Broken)
*   **Output**: 128 bits
*   **Status**: **BROKEN**. Collision attacks demonstrated in 2004. Do not use for security.
*   **Legacy Use**: Still seen in checksums (non-security), but avoid.

### SHA-1 (Deprecated)
*   **Output**: 160 bits
*   **Status**: **DEPRECATED**. Google demonstrated a practical collision ("SHAttered") in 2017.
*   **Use**: Being phased out everywhere.

### SHA-2 Family (Current Standard)
*   **Variants**: SHA-224, SHA-256, SHA-384, SHA-512
*   **Output**: 224-512 bits
*   **Status**: **SECURE**. Widely used in TLS, code signing, blockchain.

```python
import hashlib

message = "Security through cryptography"
hash_sha256 = hashlib.sha256(message.encode()).hexdigest()
print(f"SHA-256: {hash_sha256}")
# Output: SHA-256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
```

### SHA-3 (Keccak)
*   **Output**: 224-512 bits
*   **Status**: **SECURE**. Different internal design than SHA-2 (sponge construction).
*   **Use**: Recommended when SHA-2 compatibility isn't required.

### BLAKE2 / BLAKE3
*   **Status**: **SECURE**. Faster than SHA-3 and MD5.
*   **Use**: Modern applications, password hashing (with proper KDFs).

---

## Hash Attacks

### Collision Attack
Find any two inputs that hash to the same value. This is why MD5 and SHA-1 are broken—collisions can be computed in practical time.

**Real Impact**: In 2008, researchers created a rogue CA certificate by exploiting MD5 collisions, allowing them to impersonate any HTTPS website.

### Length Extension Attack
For Merkle-Damgård hashes (MD5, SHA-1, SHA-2), knowing $H(m)$ allows computing $H(m || padding || extension)$ without knowing $m$.

**Vulnerable**: `hash(secret || message)` can be extended by attacker.
**Safe**: Use HMAC instead.

### Birthday Attack
Based on the birthday paradox: in a room of 23 people, there's a 50% chance two share a birthday. For hashes, finding a collision requires approximately $\sqrt{2^n}$ attempts, not $2^n$.

*   **128-bit hash**: ~$2^{64}$ attempts for collision (feasible)
*   **256-bit hash**: ~$2^{128}$ attempts (infeasible)

---

## Message Authentication Codes (MACs)

Hashes prove integrity, but they don't prove *who* created the hash. Anyone can compute `SHA-256(message)`. We need to bind a secret key to the hash.

### HMAC (Hash-based MAC)

HMAC combines a hash function with a secret key:

$$\text{HMAC}(K, m) = H((K' \oplus opad) \| H((K' \oplus ipad) \| m))$$

Where:
*   $K'$ is the key (padded or hashed to block size)
*   $opad$ and $ipad$ are fixed padding constants

```python
import hmac
import hashlib

key = b"super_secret_key"
message = b"Transfer $1000 to Alice"

mac = hmac.new(key, message, hashlib.sha256).hexdigest()
print(f"HMAC-SHA256: {mac}")
```

### Why HMAC and Not Just `hash(key + message)`?

1.  **Length Extension Attacks**: `hash(key + message)` is vulnerable.
2.  **Key Position**: `hash(message + key)` has other weaknesses.
3.  **HMAC is Proven**: Mathematically analyzed and standardized.

### CMAC (Cipher-based MAC)

Uses a block cipher (AES) instead of a hash function. Produces a fixed-size tag.

### Poly1305

A fast, one-time authenticator often paired with ChaCha20 for AEAD (Authenticated Encryption with Associated Data).

---

## AEAD: Encryption + Authentication in One

Modern cryptography rarely separates encryption and authentication. **AEAD** (Authenticated Encryption with Associated Data) does both:

*   **AES-GCM**: AES in Galois/Counter Mode. Industry standard.
*   **ChaCha20-Poly1305**: Faster on devices without AES hardware acceleration.

```
Encrypt(key, nonce, plaintext, associated_data) → (ciphertext, tag)
Decrypt(key, nonce, ciphertext, tag, associated_data) → plaintext OR ERROR
```

If the tag doesn't match, decryption fails entirely—no partial output, no oracle attacks.

---

## Password Hashing (Special Case)

Regular hash functions are **too fast** for passwords. An attacker with a GPU can try billions of SHA-256 hashes per second.

Password hashing needs:
1.  **Slowness**: Intentionally slow computation.
2.  **Salt**: Random data added to prevent rainbow tables.
3.  **Memory-hardness**: Require significant RAM to prevent GPU attacks.

### Recommended Algorithms

| Algorithm | Recommendation |
|-----------|---------------|
| **Argon2id** | Winner of Password Hashing Competition. Best choice. |
| **bcrypt** | Time-tested. Good fallback. |
| **scrypt** | Memory-hard. Used in cryptocurrency. |
| **PBKDF2** | Acceptable with high iterations (100,000+). |
| MD5/SHA-1 | **NEVER** for passwords. |

```python
from argon2 import PasswordHasher

ph = PasswordHasher()
hash = ph.hash("user_password")
# Verification
try:
    ph.verify(hash, "user_password")
    print("Password correct!")
except:
    print("Invalid password")
```

---

## Summary

*   **Hash Functions** create fixed-size fingerprints of data.
*   **MD5/SHA-1** are broken—use **SHA-256** or **SHA-3**.
*   **HMAC** adds authentication to hashes with a secret key.
*   **AEAD** (AES-GCM) provides encryption + authentication together.
*   **Password hashing** requires slow, memory-hard functions like **Argon2id**.

**Next Part:** We'll explore **Digital Signatures & PKI**—how we prove identity and build chains of trust.
