---
layout: post
title: "Subnetting: Dividing the Network (Part 2)"
date: 2026-02-09 17:00:00 +0530
categories: [Cybersecurity, Networking]
tags: [subnetting, ip-addresses, cidr, networking-fundamentals]
image: /assets/images/netsec-bg.jpg
description: "Part 2 of Computer Networks & Security. Master IP addressing, subnet masks, and CIDR notation—the foundation of network segmentation."
author: Tharunaditya Anuganti
series: "Computer Networks & Security"
series_order: 2
series_description: "Mastering packet analysis, firewalls, IDS/IPS, and securing modern network infrastructure."
---

# The Most Important Skill in Networking

Ask any network administrator or security professional what skill they use daily, and many will say **subnetting**. It's also the concept that makes most students' eyes glaze over.

But here's the truth: subnetting isn't just academic torture. It's the foundation of network segmentation, access control, and understanding attack surfaces. If you can't subnet, you can't secure networks.

---

## IP Addresses: The Basics

Every device on a network needs an address. IPv4 addresses are 32 bits, written as four octets:

```
192.168.1.1
```

Each octet is 8 bits (0-255):
```
192      .  168      .  1        .  1
11000000    10101000    00000001    00000001
```

### Network vs. Host

An IP address has two parts:
*   **Network Portion**: Identifies which network the device is on.
*   **Host Portion**: Identifies the specific device within that network.

But how do we know where the network ends and the host begins? That's where **subnet masks** come in.

---

## Subnet Masks

A subnet mask is a 32-bit number that "masks" the network portion of an IP address.

```
IP Address:   192.168.1.100
Subnet Mask:  255.255.255.0

Binary:
IP:    11000000.10101000.00000001.01100100
Mask:  11111111.11111111.11111111.00000000
       [-------- Network --------][Host]
```

Where the mask has 1s = Network portion
Where the mask has 0s = Host portion

### Common Subnet Masks

| CIDR | Mask | Hosts |
|------|------|-------|
| /8 | 255.0.0.0 | 16,777,214 |
| /16 | 255.255.0.0 | 65,534 |
| /24 | 255.255.255.0 | 254 |
| /25 | 255.255.255.128 | 126 |
| /26 | 255.255.255.192 | 62 |
| /27 | 255.255.255.224 | 30 |
| /28 | 255.255.255.240 | 14 |
| /29 | 255.255.255.248 | 6 |
| /30 | 255.255.255.252 | 2 |

---

## CIDR Notation

**CIDR** (Classless Inter-Domain Routing) is the modern way to express subnets:

```
192.168.1.0/24
```

The `/24` means the first 24 bits are the network portion.

### Calculating Hosts

Number of usable hosts = $2^{(32-\text{prefix})} - 2$

Why -2? 
*   **Network address**: All host bits are 0 (e.g., 192.168.1.0)
*   **Broadcast address**: All host bits are 1 (e.g., 192.168.1.255)

For `/24`: $2^{(32-24)} - 2 = 2^8 - 2 = 254$ hosts

---

## Subnetting in Practice

Let's subnet the network `10.0.0.0/8` into smaller segments.

### Problem: Create 4 Subnets

We need to borrow bits from the host portion.
*   4 subnets requires $2^2 = 4$, so we borrow 2 bits.
*   New prefix: /8 + 2 = /10

**Subnets:**
| Subnet | Network Address | Range | Broadcast |
|--------|-----------------|-------|-----------|
| 1 | 10.0.0.0/10 | 10.0.0.1 - 10.63.255.254 | 10.63.255.255 |
| 2 | 10.64.0.0/10 | 10.64.0.1 - 10.127.255.254 | 10.127.255.255 |
| 3 | 10.128.0.0/10 | 10.128.0.1 - 10.191.255.254 | 10.191.255.255 |
| 4 | 10.192.0.0/10 | 10.192.0.1 - 10.255.255.254 | 10.255.255.255 |

### Problem: Need 50 Hosts Per Subnet

We need at least 50 usable hosts.
*   $2^5 - 2 = 30$ (not enough)
*   $2^6 - 2 = 62$ (sufficient)
*   Host bits needed: 6
*   Prefix: 32 - 6 = /26

For `192.168.1.0/24` split into /26 subnets:

| Subnet | Range | Usable Hosts |
|--------|-------|--------------|
| 192.168.1.0/26 | .1 - .62 | 62 |
| 192.168.1.64/26 | .65 - .126 | 62 |
| 192.168.1.128/26 | .129 - .190 | 62 |
| 192.168.1.192/26 | .193 - .254 | 62 |

---

## The Magic Number Method

For quick subnetting, use the "magic number":

1.  Find the interesting octet (where the mask isn't 0 or 255).
2.  Calculate: $256 - \text{mask value}$ = magic number.
3.  Subnets increment by the magic number.

**Example**: `172.16.0.0/20`
*   Mask: 255.255.240.0 (interesting octet: 3rd)
*   Magic number: $256 - 240 = 16$
*   Subnets: 172.16.0.0, 172.16.16.0, 172.16.32.0, 172.16.48.0...

---

## Private vs. Public IP Addresses

Not all IPs are routable on the internet.

### Private Ranges (RFC 1918)
*   **10.0.0.0/8**: Large enterprises (16M hosts)
*   **172.16.0.0/12**: Medium organizations (1M hosts)
*   **192.168.0.0/16**: Home/small office (65K hosts)

### Special Addresses
*   **127.0.0.0/8**: Loopback (localhost)
*   **169.254.0.0/16**: Link-local (APIPA)
*   **0.0.0.0**: Default route / "any address"
*   **255.255.255.255**: Broadcast

---

## Why Subnetting Matters for Security

### 1. Network Segmentation
Separate sensitive systems (databases, admin networks) from general traffic.

### 2. Access Control
Firewalls rules are subnet-based:
```
ALLOW 192.168.1.0/24 -> 192.168.10.0/24 : TCP 443
DENY 192.168.1.0/24 -> 192.168.20.0/24 : ANY
```

### 3. Blast Radius Reduction
If an attacker compromises one subnet, proper segmentation limits lateral movement.

### 4. Attack Surface Analysis
Understanding subnets helps identify what's exposed:
*   DMZ: 203.0.113.0/24 (public-facing)
*   Internal: 10.0.0.0/8 (behind firewall)

---

## IPv6 Primer

IPv6 addresses are 128 bits (vs. 32 for IPv4):

```
2001:0db8:85a3:0000:0000:8a2e:0370:7334
```

### Key Differences
*   Practically unlimited addresses.
*   No NAT required (every device gets a public IP).
*   Built-in IPsec support.
*   New security considerations (link-local, privacy extensions).

### Security Implications
*   Attackers can't scan all IPv6 addresses (too many).
*   But... many networks have IPv6 enabled by default without security controls.
*   IPv6 tunneling can bypass IPv4-only firewalls.

---

## Practice Problems

**Problem 1**: How many hosts can `172.16.50.0/22` support?
<details>
<summary>Answer</summary>
$2^{(32-22)} - 2 = 2^{10} - 2 = 1022$ hosts
</details>

**Problem 2**: What is the broadcast address for `192.168.100.64/26`?
<details>
<summary>Answer</summary>
Network: 192.168.100.64
Host bits: 6 → Range: .64 to .127
Broadcast: 192.168.100.127
</details>

**Problem 3**: Split `10.0.0.0/16` into 8 equal subnets. What is the new prefix?
<details>
<summary>Answer</summary>
8 subnets = $2^3$ → Borrow 3 bits
New prefix: /16 + 3 = /19
</details>

---

## Summary

*   IP addresses have **network** and **host** portions.
*   **Subnet masks** define the boundary between them.
*   **CIDR notation** (`/24`) is the modern standard.
*   Calculate hosts: $2^{(32-\text{prefix})} - 2$
*   Subnetting enables **security segmentation**.

**Next Part:** We'll implement subnet-based security with **Firewalls**—the gatekeepers of network traffic.
