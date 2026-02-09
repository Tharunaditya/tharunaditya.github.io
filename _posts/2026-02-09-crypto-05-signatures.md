---
layout: post
title: "Digital Signatures & PKI: Building Trust on the Internet (Part 5)"
date: 2026-02-09 12:00:00 +0530
categories: [Cybersecurity, Cryptography]
tags: [digital-signatures, pki, certificates, x509, tls]
image: /assets/images/crypto-bg.jpg
description: "Part 5 of the Cryptography Explorer Series. Understanding how digital signatures prove identity and how PKI creates the trust infrastructure of the internet."
author: Tharunaditya Anuganti
series: "Cryptography Explorer"
series_order: 5
series_description: "From modern encryption standards (AES/RSA) to Zero-Knowledge Proofs and Post-Quantum Cryptography."
---

# Proving Who You Are

We've learned to keep secrets (encryption) and verify data hasn't changed (hashing). But there's a third pillar of cryptography we haven't fully addressed: **Authentication**—proving identity.

When you visit `https://yourbank.com`, how do you know you're actually talking to your bank and not an attacker? When you download software, how do you know the developer actually published it?

The answer lies in **Digital Signatures** and the **Public Key Infrastructure (PKI)** that makes the internet's trust model possible.

---

## Digital Signatures: The Cryptographic Notary

A digital signature is like a handwritten signature, but mathematically unforgeable. It provides:

1.  **Authentication**: Proof of who signed the document.
2.  **Integrity**: Proof the document wasn't modified.
3.  **Non-repudiation**: The signer cannot deny signing.

### How Digital Signatures Work

Remember asymmetric encryption? We flip the process:

*   **Encryption**: Public key encrypts, private key decrypts.
*   **Signing**: Private key signs, public key verifies.

#### The Signing Process

1.  **Hash the Message**: Compute $H(m)$ using SHA-256.
2.  **Sign the Hash**: Encrypt the hash with your private key: $\sigma = Sign(H(m), PrivateKey)$
3.  **Attach Signature**: Send $(m, \sigma)$ together.

#### The Verification Process

1.  **Hash the Message**: Compute $H(m)$ from the received message.
2.  **Verify Signature**: Decrypt $\sigma$ using the sender's public key.
3.  **Compare**: If decrypted hash matches computed hash, signature is valid.

```python
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa, padding

# Generate key pair
private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
public_key = private_key.public_key()

# Sign
message = b"I authorize this transaction"
signature = private_key.sign(
    message,
    padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
    hashes.SHA256()
)

# Verify
public_key.verify(
    signature, message,
    padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
    hashes.SHA256()
)
print("Signature valid!")
```

---

## Signature Algorithms

### RSA Signatures
*   **PKCS#1 v1.5**: Legacy, still widely used.
*   **RSA-PSS**: Modern, probabilistic. Recommended.

### ECDSA (Elliptic Curve Digital Signature Algorithm)
*   Smaller signatures than RSA (64 bytes vs 256+ bytes).
*   Used in Bitcoin, Ethereum, TLS.
*   **Caution**: Nonce reuse is catastrophic (PlayStation 3 hack).

### EdDSA (Edwards-curve Digital Signature Algorithm)
*   **Ed25519**: Fast, secure, deterministic (no nonce issues).
*   Used in SSH, Signal, Tor.
*   Recommended for new applications.

---

## The Trust Problem

Digital signatures prove a message came from whoever holds the private key. But how do you know the *public key* belongs to who they claim to be?

If I claim to be "Bank of America" and give you my public key, you have no way to verify I'm not an impostor.

This is where **Public Key Infrastructure (PKI)** comes in.

---

## PKI: The Chain of Trust

PKI creates a hierarchy of trusted entities that vouch for identity.

### The Components

1.  **Certificate Authority (CA)**: A trusted organization that issues certificates.
    *   Examples: DigiCert, Let's Encrypt, Comodo.
2.  **Certificate**: A document binding a public key to an identity.
3.  **Root CA**: The top of the trust hierarchy. Pre-installed in your browser/OS.
4.  **Intermediate CA**: Signed by Root CA, issues end-entity certificates.
5.  **End-Entity Certificate**: The certificate for a website or person.

### How It Works

1.  Bank of America generates a key pair.
2.  They send their public key + proof of identity to DigiCert (a CA).
3.  DigiCert verifies their identity (domain ownership, legal documents).
4.  DigiCert signs Bank of America's public key with DigiCert's private key.
5.  This signature is packaged into a **Certificate**.
6.  Your browser trusts DigiCert (pre-installed root), so it trusts Bank of America's certificate.

```
[Your Browser]
     |
     | Trusts (Pre-installed)
     v
[Root CA: DigiCert]
     |
     | Signs
     v
[Intermediate CA]
     |
     | Signs
     v
[bankofamerica.com Certificate]
```

---

## X.509 Certificates

The standard format for certificates is **X.509**. A certificate contains:

*   **Subject**: Who the certificate is for (e.g., `CN=bankofamerica.com`)
*   **Issuer**: Who signed it (e.g., `CN=DigiCert`)
*   **Public Key**: The subject's public key
*   **Validity Period**: Not Before / Not After dates
*   **Serial Number**: Unique identifier
*   **Signature**: CA's digital signature
*   **Extensions**: Additional constraints (key usage, SANs, etc.)

### Viewing a Certificate

```bash
openssl s_client -connect google.com:443 2>/dev/null | openssl x509 -text -noout
```

---

## Certificate Validation

When your browser connects to `https://example.com`:

1.  **Chain Building**: Build the chain from end-entity to root.
2.  **Signature Verification**: Each certificate's signature is verified with parent's public key.
3.  **Validity Check**: Is the current time within the validity period?
4.  **Revocation Check**: Is the certificate revoked (CRL/OCSP)?
5.  **Name Check**: Does the certificate's subject match the domain?
6.  **Root Trust**: Is the root CA in the trusted store?

If any check fails, the browser shows a security warning.

---

## Certificate Revocation

What if a private key is compromised? We need to invalidate the certificate before it expires.

### CRL (Certificate Revocation List)
*   CA publishes a list of revoked serial numbers.
*   Clients download and cache the list.
*   **Problem**: Lists get large; updates are delayed.

### OCSP (Online Certificate Status Protocol)
*   Client asks CA in real-time: "Is this certificate valid?"
*   **Problem**: Privacy (CA sees what sites you visit), availability.

### OCSP Stapling
*   Server fetches its own OCSP response and "staples" it to the TLS handshake.
*   Best of both worlds: fresh revocation data without privacy issues.

---

## PKI Attacks and Weaknesses

### CA Compromise
If a CA is compromised, attackers can issue fake certificates. This happened with DigiNotar (2011)—they were removed from all browsers.

### Misissued Certificates
CAs can make mistakes. Certificate Transparency (CT) logs provide public auditability.

### Self-Signed Certificates
No CA signature—your browser will warn you. Fine for development, not production.

---

## Beyond Web PKI

### Code Signing
Software developers sign executables. Windows/macOS verify before running.

### S/MIME
Email encryption and signing using PKI certificates.

### Document Signing
PDFs and contracts with legally binding digital signatures.

### mTLS (Mutual TLS)
Both client and server present certificates. Used in zero-trust architectures.

---

## Summary

*   **Digital Signatures** prove authenticity and integrity using private/public keys.
*   **PKI** creates chains of trust through Certificate Authorities.
*   **X.509 Certificates** bind public keys to identities.
*   **Certificate Validation** involves chain verification, revocation checks, and trust anchors.

This concludes the **Cryptography Explorer** series. We've journeyed from basic encryption to the trust infrastructure that secures global commerce. The math protects your data; the infrastructure protects your identity.

*Tharunaditya's Security Note: Always check the padlock icon—but understand what it really means. HTTPS proves you're talking to the server securely; it doesn't prove the server is trustworthy.*
