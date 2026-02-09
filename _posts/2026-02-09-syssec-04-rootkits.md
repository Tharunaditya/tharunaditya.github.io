---
layout: post
title: "Rootkits: The Art of Hiding (Part 4)"
date: 2026-02-09 23:00:00 +0530
categories: [Cybersecurity, System Security]
tags: [rootkit, malware, kernel-module, persistence, detection]
image: /assets/images/sys-sec-bg.jpg
description: "Part 4 of the System Security Series. Understanding how rootkits hide malicious activity at the kernel level and techniques for detection."
author: Tharunaditya Anuganti
series: "System Security"
series_order: 4
series_description: "Deep dive into OS internals, memory protection, kernel exploitation defense, and secure architecture design."
---

# When the OS Lies to You

You're a system administrator. You run `ps aux`—no suspicious processes. You check `netstat`—no unusual connections. You scan with antivirus—clean.

But your server is exfiltrating data to a foreign IP.

How is this possible? You're the victim of a **rootkit**—malware that manipulates the operating system to hide its presence. When the OS itself is compromised, you can't trust anything it tells you.

---

## What is a Rootkit?

A rootkit is a collection of tools designed to:
1.  Maintain persistent, privileged access.
2.  Hide the attacker's presence.
3.  Evade detection by security tools.

The name comes from "root" (Unix superuser) + "kit" (collection of tools).

---

## Rootkit Types

### 1. User-Mode Rootkits

Operate at the application level (Ring 3).

**Techniques:**
*   Replace system binaries (`ps`, `ls`, `netstat`) with trojanized versions.
*   Hook library functions (LD_PRELOAD on Linux, DLL injection on Windows).
*   Modify process memory.

**Detection:**
*   Compare binary hashes to known good copies.
*   Use tools that read directly from `/proc` instead of `ps`.
*   Boot from trusted media and scan.

### 2. Kernel-Mode Rootkits

Operate at the kernel level (Ring 0). Far more dangerous.

**Techniques:**
*   Loadable Kernel Modules (LKM) on Linux.
*   Device drivers on Windows.
*   Hook system calls.
*   Modify kernel data structures.

**Why Dangerous:**
*   Control everything the OS sees.
*   User-mode tools are useless—the kernel lies to them.
*   Can survive reboots if persistent.

### 3. Bootkits

Infect the boot process—execute before the OS loads.

**Targets:**
*   Master Boot Record (MBR)
*   Volume Boot Record (VBR)
*   UEFI firmware

**Examples:** Alureon, Necurs, Lojax (first UEFI rootkit in the wild).

### 4. Hypervisor Rootkits (Blue Pill)

Create a thin hypervisor beneath the OS. The entire OS runs as a VM without knowing it.

**Theoretical but demonstrated in research.**

### 5. Firmware Rootkits

Infect hardware firmware (BIOS, network cards, hard drive controllers).

**Extremely persistent—survives OS reinstallation.**

---

## Kernel Rootkit Techniques (Linux)

### Loading Malicious Kernel Modules

```c
// Simple LKM rootkit skeleton
#include <linux/module.h>
#include <linux/kernel.h>

static int __init rootkit_init(void) {
    printk(KERN_INFO "Rootkit loaded\n");
    // Hook system calls, hide processes, etc.
    return 0;
}

static void __exit rootkit_exit(void) {
    printk(KERN_INFO "Rootkit unloaded\n");
}

module_init(rootkit_init);
module_exit(rootkit_exit);
MODULE_LICENSE("GPL");
```

```bash
# Compile and load
make
insmod rootkit.ko

# Hide from lsmod by removing from module list
list_del_init(&__this_module.list);
```

### System Call Table Hooking

Intercept system calls like `getdents` (list files) to hide files.

```c
// Original getdents
asmlinkage int (*original_getdents)(unsigned int fd, struct linux_dirent *dirp, unsigned int count);

// Hooked version
asmlinkage int hacked_getdents(unsigned int fd, struct linux_dirent *dirp, unsigned int count) {
    int ret = original_getdents(fd, dirp, count);
    // Filter out entries with "hidden" in the name
    // Return modified result
    return filtered_ret;
}
```

### Direct Kernel Object Manipulation (DKOM)

Modify kernel data structures directly:
*   Remove process from task list (hidden from `ps`).
*   Unlink network connections (hidden from `netstat`).
*   Modify file system cache (hidden from `ls`).

---

## Kernel Rootkit Techniques (Windows)

### Driver-Based Rootkits

Windows kernel-mode code runs as device drivers (.sys files).

**Signing Requirement:**
Windows requires drivers to be signed since Vista x64. Attackers:
*   Steal code signing certificates.
*   Exploit vulnerabilities to load unsigned drivers.
*   Use vulnerable signed drivers to gain arbitrary kernel access.

### SSDT Hooking

System Service Descriptor Table maps syscall numbers to functions.

```c
// Hook NtQueryDirectoryFile to hide files
NTSTATUS HookedNtQueryDirectoryFile(...) {
    NTSTATUS status = OriginalNtQueryDirectoryFile(...);
    // Filter results to hide malicious files
    return status;
}
```

### IRP Hooking

Hook I/O Request Packets to intercept file system operations at the driver level.

### Callback Registration

Register malicious callbacks for:
*   Process creation/termination.
*   Image (DLL/EXE) loading.
*   Object access.

---

## Persistence Mechanisms

### Linux
*   `/etc/modules` or `/etc/modules-load.d/`
*   Initramfs/initrd modification.
*   Cron jobs or systemd services.
*   Modified binaries.

### Windows
*   Registry Run keys.
*   Scheduled Tasks.
*   Services.
*   WMI Event Subscriptions.
*   Bootkit (MBR/VBR/UEFI).

---

## Rootkit Detection

Detecting rootkits is challenging because you can't trust the OS. Strategies:

### 1. Cross-View Detection

Compare views from different sources:
*   User-mode tools vs. direct kernel queries.
*   If `ps` shows 50 processes but walking the task list shows 52, something's hiding.

**Tools:** rkhunter, chkrootkit (Linux), GMER (Windows).

### 2. Integrity Checking

Compare current system files against known good hashes.

```bash
# Tripwire, AIDE
aide --check
```

### 3. Memory Analysis

Analyze raw memory dump from outside the potentially compromised OS.

```bash
# Acquire memory
sudo dd if=/dev/mem of=memdump.raw bs=1M

# Analyze with Volatility
volatility -f memdump.raw --profile=LinuxUbuntu_4.15.0 linux_pslist
volatility -f memdump.raw --profile=LinuxUbuntu_4.15.0 linux_hidden_modules
```

### 4. Boot from Trusted Media

Boot from a known-clean live USB and analyze the filesystem offline.

### 5. Behavior-Based Detection

Look for symptoms:
*   Unexplained network traffic.
*   Disk activity when system should be idle.
*   Time synchronization issues (rootkits sometimes break timekeeping).

---

## Famous Rootkits

### Sony BMG Rootkit (2005)
*   Installed via music CDs.
*   Hid files starting with `$sys$`.
*   Uninstaller created security holes.

### Stuxnet (2010)
*   Nation-state rootkit targeting Iranian nuclear facilities.
*   Used multiple zero-days.
*   Modified PLC code while hiding changes.

### Uroburos/Snake (2014)
*   Sophisticated espionage rootkit.
*   Virtual file system to hide data.
*   Kernel-mode component with anti-forensics.

### Necurs (2012-2020)
*   One of largest botnets.
*   Kernel-mode rootkit component.
*   Used for spam and banking trojans.

---

## Defending Against Rootkits

### Prevention
*   **Secure Boot**: Verify boot chain integrity.
*   **Driver Signing**: Only load signed kernel code.
*   **Least Privilege**: Attackers need root/admin first.
*   **Keep Systems Patched**: Kernel exploits enable rootkits.

### Detection
*   **Memory Forensics**: Regular memory analysis.
*   **Integrity Monitoring**: AIDE, Tripwire, OSSEC.
*   **EDR Solutions**: Endpoint Detection and Response.
*   **Network Monitoring**: Detect C2 communications.

### Response
*   **Assume Compromise**: Once a rootkit is found, assume everything is compromised.
*   **Rebuild, Don't Clean**: Wipe and reinstall from trusted media.
*   **Firmware Check**: Don't forget to verify BIOS/UEFI.

---

## Summary

*   **Rootkits** hide malicious activity by manipulating the OS.
*   **Types**: User-mode, kernel-mode, bootkit, hypervisor, firmware.
*   **Techniques**: System call hooking, DKOM, driver manipulation.
*   **Detection** requires external/cross-view analysis.
*   **Response** often means full system rebuild.

**Next Part:** How do we establish trust in a world where firmware can be compromised? **Secure Boot and Hardware Trust**.
