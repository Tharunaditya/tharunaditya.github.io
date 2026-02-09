---
layout: post
title: "Secure Boot and Hardware Trust: The Foundation of Security (Part 5)"
date: 2026-02-09 23:30:00 +0530
categories: [Cybersecurity, System Security]
tags: [secure-boot, uefi, tpm, trusted-computing, firmware-security]
image: /assets/images/sys-sec-bg.jpg
description: "Part 5 of the System Security Series. Understanding Secure Boot, TPM, measured boot, and establishing hardware-rooted trust."
author: Tharunaditya Anuganti
series: "System Security"
series_order: 5
series_description: "Deep dive into OS internals, memory protection, kernel exploitation defense, and secure architecture design."
---

# Trust Must Start Somewhere

Throughout this series, we've explored attacks at every level—buffer overflows, privilege escalation, rootkits. But all our defenses assume one thing: the operating system itself is trustworthy.

What if it isn't? What if a bootkit modifies the OS before it even loads? What if firmware is compromised?

**Secure Boot** and **Hardware Trust** address this fundamental question: How do we establish a chain of trust from the first instruction?

---

## The Boot Process

Before understanding Secure Boot, we need to understand what happens when you press the power button.

### Legacy BIOS Boot
```
[Power On]
    ↓
[BIOS] (Firmware)
    ↓
[MBR] (Master Boot Record - first 512 bytes of disk)
    ↓
[Bootloader] (GRUB, Windows Boot Manager)
    ↓
[OS Kernel]
    ↓
[User Space]
```

**Problem**: No verification at any step. Malware can infect MBR or bootloader.

### UEFI Boot
```
[Power On]
    ↓
[UEFI Firmware]
    ↓
[EFI System Partition] (FAT32 partition with bootloaders)
    ↓
[Bootloader] (.efi executable)
    ↓
[OS Kernel]
    ↓
[User Space]
```

UEFI is more sophisticated, but still doesn't verify integrity by default.

---

## Secure Boot

Secure Boot uses cryptographic signatures to verify each boot component before execution.

### How It Works

1.  **Platform Key (PK)**: Root of trust, typically OEM's key.
2.  **Key Exchange Keys (KEK)**: Can modify signature database.
3.  **Signature Database (db)**: Allowed signatures/hashes.
4.  **Forbidden Signature Database (dbx)**: Blocked signatures.

### Boot Verification Process
```
[UEFI Firmware]
    |
    | "Is bootloader signed by key in db?"
    ↓
[Verify Signature] ──No──→ BOOT BLOCKED
    |
   Yes
    ↓
[Bootloader Executes]
    |
    | "Is kernel signed?"
    ↓
[Verify Signature] ──No──→ BOOT BLOCKED
    |
   Yes
    ↓
[Kernel Executes]
```

### Certificate Chain
```
Platform Key (PK)
    ↓ Signs
Key Exchange Key (KEK)
    ↓ Signs
Signature Database Entry (db)
    ↓ Contains
Microsoft Windows Production CA
    ↓ Signs
Windows Boot Manager
```

---

## Linux and Secure Boot

Linux distributions support Secure Boot through **shim**—a small bootloader signed by Microsoft.

### The Shim Process
```
[UEFI] → [Shim (Microsoft signed)]
              ↓
         [GRUB (Distribution signed)]
              ↓
         [Kernel (Distribution signed)]
```

### Enrolling Custom Keys

For custom kernels or distributions:
```bash
# Generate your own keys
openssl req -new -x509 -newkey rsa:2048 -keyout MOK.key -out MOK.crt -days 365

# Sign kernel
sbsign --key MOK.key --cert MOK.crt --output vmlinuz-signed vmlinuz

# Enroll Machine Owner Key
mokutil --import MOK.crt
# Reboot and complete enrollment in MOK Manager
```

---

## Trusted Platform Module (TPM)

The **TPM** is a dedicated security chip that provides hardware-based security functions.

### TPM Capabilities

1.  **Secure Key Storage**: Private keys never leave the TPM.
2.  **Platform Configuration Registers (PCRs)**: Measure boot components.
3.  **Random Number Generation**: True hardware RNG.
4.  **Sealing/Unsealing**: Encrypt data bound to platform state.

### Platform Configuration Registers

PCRs store cryptographic hashes of boot components:

| PCR | Measures |
|-----|----------|
| 0 | BIOS/UEFI firmware |
| 1 | BIOS/UEFI configuration |
| 2-3 | Option ROMs |
| 4 | MBR/Boot Manager |
| 5 | GPT/Partition Table |
| 7 | Secure Boot State |
| 8-15 | OS-defined |

### Measured Boot

Unlike Secure Boot (which blocks unauthorized code), Measured Boot **records** what runs without blocking.

```
[UEFI Firmware]
    ↓ Extend PCR[0] with hash of firmware
[Bootloader]
    ↓ Extend PCR[4] with hash of bootloader
[Kernel]
    ↓ Extend PCR[8] with hash of kernel
[Result: PCR values reflect exact boot path]
```

### Remote Attestation

A remote server can verify your system's integrity:

1.  Your system sends TPM quote (signed PCR values).
2.  Server compares against known-good values.
3.  If PCRs match expected values → system is trustworthy.
4.  If PCRs differ → something changed (potentially compromised).

---

## BitLocker and TPM

Windows BitLocker uses TPM to protect disk encryption keys.

### TPM-Only Mode
```
[Boot] → [TPM verifies PCRs]
              ↓ PCRs match expected
         [TPM releases encryption key]
              ↓
         [Disk decrypted, OS loads]
```

If a bootkit modifies the boot process, PCR values change, and the TPM refuses to release the key.

### TPM + PIN
Adds a PIN requirement for additional security.

---

## Attacks Against Secure Boot and TPM

### 1. Secure Boot Bypass (BootHole - CVE-2020-10713)

Vulnerability in GRUB2 allowed arbitrary code execution in Secure Boot mode.

**Impact**: Attacker with local access could install a bootkit.

**Mitigation**: Update GRUB2, add vulnerable GRUB to dbx.

### 2. Evil Maid Attack

Physical access attack:
1.  Boot from USB.
2.  Install bootkit on target disk.
3.  Bootkit captures BitLocker PIN on next boot.
4.  Return and retrieve captured PIN.

**Mitigation**: Pre-boot authentication, tamper-evident seals.

### 3. TPM Reset Attacks

On some systems, TPM can be reset without clearing PCRs, leading to invalid attestation.

### 4. Cold Boot Attack

RAM retains data briefly after power off. Freeze RAM to extend retention, then dump.

**Mitigation**: Memory encryption (AMD SME, Intel TME).

### 5. UEFI Vulnerabilities

Firmware has bugs too. Exploited to persist across OS reinstalls.

**Examples:** Hacking Team UEFI rootkit, Lojax.

**Mitigation**: Keep firmware updated, check vendor advisories.

---

## Intel Boot Guard

Hardware enforcement of Secure Boot at the CPU level.

### How It Works
1.  OEM fuses their public key hash into CPU.
2.  First instruction executed is verified against this key.
3.  Cannot be modified—permanent at manufacturing.

**Advantage**: Even firmware updates can't disable.
**Disadvantage**: Only OEM can sign firmware—no custom firmware.

---

## AMD Platform Secure Boot (PSB)

AMD's equivalent to Intel Boot Guard.

*   Uses AMD Secure Processor.
*   Verifies firmware signature before CPU executes.
*   OEM-controlled keys.

---

## Modern Security Features

### Intel TXT (Trusted Execution Technology)
Creates a measured, verified execution environment.

### AMD SEV (Secure Encrypted Virtualization)
Encrypts VM memory—even hypervisor can't read it.

### ARM TrustZone
Separates "secure world" from "normal world" at hardware level.

### Confidential Computing
Protect data in use with hardware-based Trusted Execution Environments (TEE).

---

## Implementing Secure Boot (Practical)

### Verifying Secure Boot Status

**Linux:**
```bash
mokutil --sb-state
# SecureBoot enabled

# Check enrolled keys
mokutil --list-enrolled
```

**Windows:**
```powershell
Confirm-SecureBootUEFI
# True

# Check Secure Boot policy
Get-SecureBootPolicy
```

### Checking TPM

**Linux:**
```bash
# TPM 2.0
cat /sys/class/tpm/tpm0/device/description

# Check PCR values
tpm2_pcrread
```

**Windows:**
```powershell
Get-Tpm
# TpmPresent: True
# TpmReady: True
# TpmEnabled: True
```

---

## Best Practices

### For Organizations
1.  **Enable Secure Boot** on all systems.
2.  **Deploy TPM-based** disk encryption.
3.  **Implement measured boot** with remote attestation.
4.  **Keep firmware updated**—include in patch management.
5.  **Physical security** for high-value assets.

### For Developers
1.  **Sign your bootloaders** and kernels.
2.  **Use TPM for key storage** where possible.
3.  **Leverage hardware security** (TEE, SGX, SEV).

---

## Summary

*   **Secure Boot** cryptographically verifies boot components.
*   **TPM** provides hardware-rooted trust through measurement and key storage.
*   **Measured Boot** records the boot chain for later attestation.
*   **Attacks exist** but hardware trust raises the bar significantly.
*   **Defense in depth**: Combine Secure Boot + TPM + disk encryption + firmware updates.

This concludes the **System Security** series. We've journeyed from protection rings through buffer overflows, privilege escalation, rootkits, and now hardware trust. Understanding these fundamentals is essential for any security professional.

*Tharunaditya's Security Note: Hardware security isn't magic—it's just a higher bar. But that higher bar matters. When attackers need physical access or zero-days in firmware, you've already filtered out most threats.*
