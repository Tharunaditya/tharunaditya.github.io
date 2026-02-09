---
layout: post
title: "Rowhammer: When Reading Memory Breaks It (Part 5)"
date: 2026-02-09 09:00:00 +0530
categories: [Hardware Security, Microarchitecture]
tags: [rowhammer, dram, memory-attacks, hardware-security, bit-flipping]
image: /assets/images/uploads/microarchitecture.jpg
description: "Part 5 of Microarchitecture Security. Understanding how repeatedly accessing DRAM rows can flip bits in adjacent rows, compromising system integrity."
author: Tharunaditya Anuganti
series: "Microarchitecture Security"
series_order: 5
series_description: "A comprehensive analysis of how modern CPU optimizations like speculative execution and caching are exploited to leak sensitive data."
---

# Breaking Memory Without Touching It

Throughout this series, we have explored attacks that *read* data they shouldn't—Spectre tricks the CPU into revealing secrets, Meltdown bypasses privilege checks, and ZombieLoad samples data from internal buffers. But **Rowhammer** is fundamentally different.

Rowhammer doesn't read data. It **corrupts** it.

Discovered in 2014 by researchers at Carnegie Mellon and Intel Labs, Rowhammer exploits a physical vulnerability in DRAM (Dynamic Random-Access Memory) chips. By rapidly accessing specific memory rows, an attacker can cause electrical interference that flips bits in *adjacent* rows—rows they have no permission to access.

---

## How DRAM Works (And Why It's Vulnerable)

To understand Rowhammer, we need to look at how modern memory is physically constructed.

### The Anatomy of DRAM

DRAM stores each bit as an electrical charge in a tiny capacitor. These capacitors are arranged in a grid of **rows** and **columns**.

*   **Cell**: A single capacitor + transistor storing one bit.
*   **Row**: A horizontal line of cells (typically 8KB of data).
*   **Bank**: A collection of rows sharing the same row buffer.

When the CPU wants to read data:
1.  The **Row** is "activated" (loaded into the row buffer).
2.  The specific **Column** is selected.
3.  Data is returned to the CPU.

### The Physical Flaw

DRAM cells are packed incredibly close together—modern chips have billions of capacitors on a tiny piece of silicon. This density creates a problem:

**Electrical Interference**.

When a row is activated, current flows through the wordline (the wire that controls access to that row). Due to the proximity, this electrical activity can slightly disturb the charges in *neighboring* rows. Normally, this isn't a problem because:
1.  Memory is accessed in diverse patterns.
2.  DRAM has a **Refresh Cycle**—every few milliseconds, all rows are refreshed to restore their charge.

But what if we activate the *same row* thousands of times before the refresh happens?

---

## The Rowhammer Attack

The attack is elegantly brutal in its simplicity.

### Step 1: Identify Aggressor Rows

The attacker allocates memory and identifies memory addresses that map to specific DRAM rows. Two rows that are physically adjacent in DRAM (but not necessarily adjacent in virtual memory) become the "aggressor" rows.

### Step 2: Hammer the Rows

The attacker repeatedly reads from the aggressor rows in a tight loop:

```c
// Conceptual Rowhammer code
while (1) {
    *addr_row_A;  // Read row A
    *addr_row_B;  // Read row B (adjacent to victim row)
    clflush(addr_row_A);  // Flush from cache
    clflush(addr_row_B);  // Flush from cache
}
```

The `clflush` instruction is critical—it forces the CPU to evict the data from cache, ensuring each read goes all the way to DRAM. Without flushing, the CPU would serve the data from cache, and no hammering would occur.

### Step 3: Bit Flips Occur

After millions of accesses (which can happen in milliseconds on modern systems), the cumulative electrical disturbance causes bits in the *victim row* (the row sandwiched between the aggressors) to flip:
*   A `0` becomes a `1`.
*   A `1` becomes a `0`.

### Step 4: Exploit the Corruption

The attacker doesn't control *which* specific bit flips, but they can:
1.  **Spray the target area**: Fill memory with specific patterns to increase the chance a useful bit flips.
2.  **Target critical data structures**: Page tables, permission bits, cryptographic keys.

---

## Real-World Exploits

Rowhammer has been weaponized in several devastating ways:

### 1. Privilege Escalation via Page Table Corruption

In 2015, Google's Project Zero demonstrated "Rowhammer.js"—a Rowhammer attack executed entirely in JavaScript within a web browser.

The attack targeted **Page Table Entries (PTEs)**. If a single bit flips in a PTE, it can:
*   Change the physical address a virtual page points to.
*   Modify permission bits (read-only to read-write).
*   Escalate from user space to kernel space.

### 2. Escaping Virtual Machines

In cloud environments, VMs from different tenants may share the same physical DRAM. An attacker VM can hammer memory and flip bits in a victim VM's memory space, potentially:
*   Crashing the victim.
*   Injecting malicious code.
*   Stealing cryptographic keys.

### 3. RSA Key Corruption

Researchers have shown that flipping a single bit in an RSA private key can allow the attacker to *recover the entire key* using mathematical analysis (fault attacks).

---

## Defenses and Mitigations

Unlike Spectre/Meltdown, Rowhammer is a *hardware* flaw. Software patches can only mitigate, not eliminate it.

### 1. Target Row Refresh (TRR)

Modern DRAM controllers implement TRR, which tracks frequently accessed rows and proactively refreshes their neighbors. However, researchers have bypassed TRR with "TRRespass" attacks using more sophisticated hammering patterns.

### 2. ECC Memory

Error-Correcting Code (ECC) memory can detect and correct single-bit errors. However:
*   Most consumer devices don't have ECC.
*   Multi-bit flips can overwhelm ECC.
*   "ECCploit" showed that even ECC can be bypassed with careful timing.

### 3. Increased Refresh Rate

Refreshing DRAM more frequently reduces the window for hammering. The downside is increased power consumption and reduced performance.

### 4. Physical Isolation

For high-security environments: don't share physical memory with untrusted code. This means no multi-tenancy on cloud servers (expensive) or dedicated hardware.

---

## The Bigger Picture

Rowhammer teaches us a humbling lesson: **physical reality constrains digital security**.

We can write perfect software, design flawless algorithms, and implement every security best practice—but if the hardware beneath us is vulnerable, none of it matters. As transistors shrink and memory density increases, these physical side effects will only get worse.

The attacks we have covered in this series—Spectre, Meltdown, ZombieLoad, and now Rowhammer—represent a paradigm shift in security research. The battlefield has moved from software bugs to silicon physics.

### What's Next?

This concludes the **Microarchitecture Security** series. We have journeyed from speculative execution to DRAM physics, understanding how the very optimizations that make our computers fast also make them vulnerable.

*Tharunaditya's Security Note: If you're running critical infrastructure, consider ECC memory and keep your firmware updated. The next Rowhammer variant is always around the corner.*
