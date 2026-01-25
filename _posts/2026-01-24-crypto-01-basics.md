---
layout: post
title: "Cryptography: It's Not Just About Secrecy"
date: 2026-01-24 12:00:00
author: Tharunaditya Anuganti
categories: [Cybersecurity, Cryptography]
tags: [crypto, encryption, hashing]
excerpt: "Part 1 of the Applied Cryptography Series. Formatting the groundwork with CIA Triad, Symmetric vs Asymmetric encryption, and Hashing."
series: "Complete Cryptography"
series_order: 1
series_description: "From modern encryption standards (AES/RSA) to Zero-Knowledge Proofs and Post-Quantum Cryptography."
image: /assets/images/crypto-bg.jpg
---

# The Art of Secret Writing

Cryptography is the backbone of digital trust. It ensures that your bank transactions, emails, and passwords remain secure.

## The Three Pillars

Modern cryptography solves three main problems:

1.  **Confidentiality**: Only authorized parties can read the data (Encryption).
2.  **Integrity**: The data has not been altered (Hashing/MACs).
3.  **Authentication**: Proving who sent the data (Digital Signatures).

## Symmetric vs. Asymmetric

> [!TIP]
> **Symmetric**: Same key for locking and unlocking. Fast, but key exchange is hard. (AES, ChaCha20)
> **Asymmetric**: Public key to lock, Private key to unlock. Slower, but solves key exchange. (RSA, ECC)

## Hashing is NOT Encryption

A common misconception in security is confusing hashing with encryption.

*   **Encryption** is reversible (with a key).
*   **Hashing** is one-way (irreversible).

```python
import hashlib

data = "SecretPassword"
hash_object = hashlib.sha256(data.encode())
print(hash_object.hexdigest())
# Output: e0c9... (Deterministic, fixed size)
```

In Part 2, we will break down **AES (Advanced Encryption Standard)** and block cipher modes.
