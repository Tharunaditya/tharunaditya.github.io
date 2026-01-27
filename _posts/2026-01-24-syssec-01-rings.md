---
layout: post
title: "System Security: Understanding the Ring Model"
date: 2026-01-24 11:00:00
author: Tharunaditya Anuganti
categories: [Cybersecurity, System Security]
tags: [os-security, kernel, protection-rings]
excerpt: "Part 1 of the System Security Series. Deep dive into OS architecture, Protection Rings, and how User Mode interacts with Kernel Mode."
series: "System Security"
series_order: 1
series_description: "Deep dive into OS internals, memory protection, kernel exploitation defense, and secure architecture design."
image: /assets/images/sys-sec-bg.jpg
---

# The Foundation of System Security

To secure a system, you must first understand how it manages resources and privileges.

## Protection Rings

x86 architecture uses a concept called **Protection Rings** to isolate the Operating System from untrusted user applications.

*   **Ring 0 (Kernel Mode)**: The most privileged level. Direct access to hardware/memory.
*   **Ring 1 & 2**: Generally unused in modern OS (device drivers).
*   **Ring 3 (User Mode)**: Least privileged. Applications run here.

### User Mode vs. Kernel Mode

When your browser wants to write a file to disk, it cannot do so directly. It must ask the Kernel via a **System Call (syscall)**.

```c
// Example of a syscall in C
#include <unistd.h>

int main() {
    write(1, "Hello from Ring 3!\n", 19);
    return 0;
}
```

## Memory Protection

We will explore mechanisms that prevent unauthorized memory access:

| Mechanism | Description |
| :--- | :--- |
| **DEP / NX** | Data Execution Prevention. Marks memory as non-executable. |
| **ASLR** | Address Space Layout Randomization. Randomizes memory locations. |
| **Canary** | Stack cookies to detect buffer overflows. |

### What's Coming Next?

In the next part, we will explore **Buffer Overflows** and how they bypass these protections.
