---
layout: post
title: "Spectre Attack Explained: How Time Reveals Secrets (Part 2)"
date: 2026-01-27 12:00:00 +0530
categories: [Hardware Security, Spectre]
tags: [spectre, side-channel, speculative-execution, cache-attacks, microarchitecture]
series: "Microarchitecture Attacks"
series_order: 2
series_description: "A step-by-step breakdown of the Spectre attack lifecycle, from training the branch predictor to extracting secrets via cache timing."
image: /assets/images/uploads/microarchitecture.jpg
author: Tharunaditya Anuganti
---

## The 7 Steps of a Spectre Attack

In Part 1, we learned that **Spectre** exploits the CPU's optimization features—specifically **Speculative Execution** and **Branch Prediction**—to leak data. But how exactly does this happen?

The attack lifecycle can be broken down into 7 precise steps.

---

### Step 1: Baseline Preparation
*The "Calm Before the Storm"*

Before the attack begins, the attacker must prepare the microarchitectural state to ensure any changes are detectable.
1.  **Flush the Cache**: The attacker removes certain cache lines related to the target memory from the CPU cache.
2.  **Establish Timing Reference**:
    *   Because the data is not in the cache, accessing it now would be **slow**.
    *   This creates a known "baseline." If any of these locations become **fast** later, it means something (the victim) touched them.

> **Note**: The attacker is not touching the victim's memory yet; they are only preparing the shared state.

---

### Step 2: Training the Branch Predictor
*Teaching the CPU bad habits*

The attacker needs the CPU to make a specific "wrong guess" later. To do this, they must deceive the **Branch Predictor**.
1.  The attacker repeatedly runs code with a conditional branch that **always takes the same direction** (e.g., `True`).
2.  The Branch Predictor **learns this pattern**.
3.  The CPU builds a strong expectation: *"When I see this branch, it will go this way."*

This step shapes the **CPU prediction state** but does not involve any secrets yet.

---

### Step 3: Victim Execution & Speculation
*The Trap is Sprung*

The victim program runs and encounters a **secret-dependent condition**, such as:
*   `if (is_index_valid)`
*   `if (is_access_allowed)`

**Architectural (Software) View:**
*   Input is invalid or out of bounds.
*   The condition evaluates to **FALSE**.
*   The protected code **should NOT run**.
*   **Safety**: Complete.

**Microarchitectural (CPU) View:**
*   The CPU explicitly **does not wait** for the condition result.
*   It asks: *"What usually happens here?"*
*   Because of Step 2 (Training), it guesses the condition will be **TRUE**.
*   **Result**: It starts **Speculatively Executing** the protected code before knowing the real answer.

> The victim runs the correct code, but the CPU guesses the outcome of a secret-dependent check and speculatively executes code that should not run.

---

### Step 4: The Secret-Dependent Memory Touch
*The Leak happens here*

Inside the speculatively executed block (which shouldn't be running), the code typically uses a secret value to access an array:

```c
// Example Logical flow
value = secret_array[secret_byte * 4096];
```

1.  **Secret as Index**: The CPU uses the **secret value** (e.g., a key byte) as an index or offset.
2.  **Touch Memory**: It accesses a specific memory address based on that secret.
3.  **Cache Side Effect**: This memory location is automatically loaded into the **Cache**.

**The Observation Point:**
*   One specific cache line becomes **FAST**.
*   **Which** line becomes fast depends entirely on the **secret**.

This is the first real leak. The temporary memory touch changes the cache state.

---

### Step 5: The Rollback
*Cleaning up the crime scene (mostly)*

While speculation was happening, the CPU was calculating the actual condition in parallel.
1.  **Realization**: The CPU finishes the check and realizes the guess was wrong (Access should be denied).
2.  **Discard**: It discards all speculative results (register values, temporary calculations).
3.  **Restore**: The program state is rolled back to exactly where it was before the branch.

**The catch:**
*   **Program State**: Correct (Authentication fails).
*   **Cache State**: **NOT Rolled Back**.

> "Spectre does NOT break program correctness."

Because the cache is a "performance structure" and not part of the "program-visible state," the CPU does not clear it. Clearing would be too slow.
*   **Architectural State** $\rightarrow$ Correct
*   **Secret-Dependent Cache Trace** $\rightarrow$ Remains

This makes Spectre **silent, subtle, and dangerous**.

---

### Step 6: The Measurement
*Reading the traces*

Now the attacker moves to extraction.
1.  The attacker accesses the memory locations (Probe Array) that correspond to possible secret values.
2.  **Measure Time**:
    *   Location A $\rightarrow$ Slow (Cache miss)
    *   Location B $\rightarrow$ **Fast** (Cache Hit!)
    *   Location C $\rightarrow$ Slow
3.  **Inference**: Since Location B is fast, the victim's secret must have been `B` (or the value corresponding to index B).

> In Step 6, the attacker measures memory access times to detect which cache line was loaded during speculative execution, revealing secret-dependent information.

---

### Step 7: Reconstruction & Repetition
*Filtering out the noise*

A single measurement can be noisy due to other system activity. To get a reliable secret (like a full password key):
1.  **Repeat** Steps 1–6 many times.
2.  **Collect** timing results.
3.  **Filter**: Look for consistent patterns. If Location B is fast 99% of the time, it is the secret.
4.  **Reconstruct**: Byte by byte, the entire secret is recovered.

### Summary of the Leakage Flow
1.  **Baseline** established.
2.  **Victim runs** code.
3.  **Speculation** incorrectly executes protected code.
4.  **Secret chooses** a memory address.
5.  **Address is cached** (Physical Trace).
6.  **Speculation is cancelled** (Logical Trace removed).
7.  **Attacker measures time** to find the cached address.
