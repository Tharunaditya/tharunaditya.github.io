---
layout: post
title: "Meltdown Attack Explained: Breaking the User-Kernel Barrier (Part 3)"
date: 2026-01-26 20:00:00 +0530
categories: [Hardware Security, Meltdown]
tags: [meltdown, side-channel, out-of-order-execution, privilege-escalation, microarchitecture]
series: "Microarchitecture Security"
series_order: 3
series_description: "An in-depth look at how Meltdown exploits out-of-order execution to bypass privilege boundaries and read kernel memory from user space."
image: /assets/images/uploads/microarchitecture.jpg
author: Tharunaditya Anuganti
---

## The 7 Steps of a Meltdown Attack

While **Spectre** tricks a victim program into leaking its own secrets, **Meltdown** is far more direct. It allows an unprivileged user program to simply *read* kernel memory (which should be impossible) by exploiting **Out-of-Order Execution**.

The attack follows a similar lifecycle to Spectre but exploits a different optimization flaw: the delay in privilege checking.

---

### Step 1: The Setup
*Preparing the Probe Array*

Just like in Spectre, the attacker sets up a side-channel environment in their own user-space process.
1.  **Allocate Buffer**: Create a `Probe Array` in user memory (e.g., 256 pages x 4KB).
2.  **Flush**: Flush this array from the CPU cache to ensure all future accesses will be slow.
3.  **Target Selection**: The attacker chooses a kernel memory address they want to read (e.g., a password stored in OS memory).

> **Crucial Difference**: In Meltdown, the attacker is running their own code, trying to access memory they *don't own*.

---

### Step 2: The Forbidden Instruction
*Asking for the Impossible*

The attacker's code attempts to load a value from the target kernel address.

```c
// Step 2: Try to read kernel memory
byte secret = *kernel_address;
```

**Architectural (Software) View:**
*   This is an illegal operation.
*   The CPU should check the page tables.
*   It should see the "User/Supervisor" bit is set to Supervisor only.
*   It **must** raise a Segmentation Fault (Page Fault) and crash the program.

**Microarchitectural (CPU) View:**
*   Privilege checks are slow and can be done in parallel.
*   To go fast, the CPU assumes the read *might* be valid and fetches the data **Out-of-Order**.
*   The value of `secret` is retrieved internally while the permission check is still pending.

---

### Step 3: Dependent OOO Operations
*Using the secret before getting caught*

Before the CPU realizes the instruction in Step 2 was illegal, it continues executing the *next* instructions in the pipeline because they depend on the result.

```c
// Step 3: Use the secret value
temp = probe_array[secret * 4096];
```

1.  The CPU has the `secret` value (e.g., 42) in a temporary register.
2.  It uses this value to calculate an offset: `42 * 4096`.
3.  It issues a memory read for `probe_array[offset]`.

This entire sequence happens **speculatively** and **out-of-order**.

---

### Step 4: The Cache Side Effect
*Leaving a footprint*

When the CPU executes the line `probe_array[secret * 4096]`:
1.  It sends a request to memory.
2.  It brings that specific page (Page 42 of the array) into the **L1/L2 Cache**.
3.  **Result**: The cache state is now modified based on the secret value.

> This takes place in the tiny time window *between* the execution of the illegal specific instruction and the retirement of that instruction (where the fault actually triggers).

---

### Step 5: The Exception Verification
*The Law catches up*

Finally, the privilege check completes.
1.  The CPU realizes: *"Wait, this is Kernel memory! The user can't read this!"*
2.  The instruction is marked as "faulting".
3.  **Pipeline Flush**: The CPU destroys all instructions that came after the illegal load.
    *   The register holding `secret` is cleared.
    *   The `temp` calculation is discarded.
4.  **Hardware Exception**: The CPU raises an exception (e.g., `#PF` or `#GP`).

**Architectural State**:
*   The program effectively crashes (or jumps to an exception handler).
*   The register `secret` never officially held the kernel value.

**Microarchitectural State**:
*   The cache line for `probe_array[42 * 4006]` is **still in the cache**.

---

### Step 6: Handling the Crash
*Surviving the error*

For the attack to be useful, the attacker needs to measure the cache *after* the attempted read. They can't do that if their program is dead.
Standard techniques to survive:
1.  **Exception Handling**: Using `try/catch` or signals (`SIGSEGV` handler) to catch the crash and continue.
2.  **Intel TSX (Transactional Synchronization Extensions)**: Wrapping the illegal read in a transaction. When the fault happens, the transaction aborts silently without crashing the app, but the cache effects remain.
3.  **Speculative Handling**: Tricking the CPU into suppressing the exception.

---

### Step 7: Recovering the Secret
*Measuring the echoes*

Once the attacker recovers control (in the exception handler or after the transaction aborts):
1.  They iterate through all 256 pages of the `Probe Array`.
2.  They measure access time for each page.
3.  The page that corresponds to the secret value (e.g., index 42) will be **Fast (Cached)**.
4.  All other pages will be **Slow (Uncached)**.

**Conclusion**: The secret byte value was 42.

### Summary: Meltdown vs Spectre
*   **Spectre**: Mistrains the branch predictor to trick a victim process into leaking its own data.
    *   *Analogy*: Asking a bank teller a confusing question so they accidentally mutter your balance out loud.
*   **Meltdown**: Exploits the gap between "reading data" and "checking permission" to read forbidden data directly.
    *   *Analogy*: Jumping over the bank counter, grabbing a stack of cash, and running back before the security guard can stop you. You get caught (exception), but you already threw the cash (data) to your accomplice (cache).

### Mitigation?
Meltdown was fixed primarily by **KAISER / KPTI (Kernel Page Table Isolation)**. By completely unmapping kernel memory while in user mode, there is simply no data for the CPU to speculatively access, effectively killing the race condition.
