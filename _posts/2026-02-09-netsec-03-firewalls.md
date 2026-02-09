---
layout: post
title: "Firewalls: The Network Gatekeepers (Part 3)"
date: 2026-02-09 18:00:00 +0530
categories: [Cybersecurity, Networking]
tags: [firewall, iptables, network-security, packet-filtering, next-gen-firewall]
image: /assets/images/netsec-bg.jpg
description: "Part 3 of Computer Networks & Security. Understanding firewall architectures, rule configuration, and the evolution to next-generation firewalls."
author: Tharunaditya Anuganti
series: "Computer Networks & Security"
series_order: 3
series_description: "Mastering packet analysis, firewalls, IDS/IPS, and securing modern network infrastructure."
---

# The First Line of Defense

Every packet entering or leaving your network passes a critical checkpoint: the **firewall**. It's the bouncer at the door, checking IDs (IP addresses), verifying invitations (port numbers), and enforcing the guest list (rules).

Firewalls have evolved from simple packet filters to sophisticated security platforms. Understanding how they work—and their limitations—is fundamental to network defense.

---

## What is a Firewall?

A firewall is a network security device that monitors and controls incoming and outgoing traffic based on predetermined security rules.

### Core Functions
1.  **Traffic Filtering**: Allow or block based on criteria.
2.  **Network Segmentation**: Enforce boundaries between zones.
3.  **Logging**: Record traffic for analysis.
4.  **NAT**: Translate between internal and external addresses.

---

## Firewall Generations

### Generation 1: Packet Filters (1988)

The original firewalls examined individual packets against rules.

**Criteria:**
*   Source/Destination IP
*   Source/Destination Port
*   Protocol (TCP/UDP/ICMP)

**Limitations:**
*   No connection state awareness.
*   Can't inspect payload.
*   Easily evaded with fragmented packets.

```
# Simple packet filter rule
ALLOW TCP FROM 192.168.1.0/24 TO ANY PORT 80
DENY ALL
```

### Generation 2: Stateful Inspection (1994)

Stateful firewalls track connection states. They understand that an incoming packet might be a **response** to an outgoing request.

**State Table:**
```
| Source IP | Src Port | Dest IP | Dst Port | Protocol | State |
|-----------|----------|---------|----------|----------|-------|
| 10.0.0.5 | 49152 | 8.8.8.8 | 53 | UDP | ESTABLISHED |
| 10.0.0.10 | 52341 | 93.184.216.34 | 443 | TCP | ESTABLISHED |
```

**Advantage:**
*   Only the initial connection needs explicit rules.
*   Return traffic is automatically allowed if it matches a state.

### Generation 3: Application Layer Firewalls (1999)

Inspect the **content** of packets, not just headers.

**Capabilities:**
*   Block specific HTTP methods (PUT, DELETE).
*   Inspect SQL queries for injection.
*   Filter URLs and content types.

**Limitation:**
*   Performance impact from deep inspection.

### Generation 4: Next-Generation Firewalls (NGFW)

Modern NGFWs combine everything:
*   Stateful inspection
*   Application awareness
*   Intrusion Prevention (IPS)
*   SSL/TLS decryption
*   User identity integration
*   Threat intelligence feeds

**Leading Solutions**: Palo Alto, Fortinet, Cisco Firepower, Check Point.

---

## Firewall Architectures

### Host-Based Firewall
Runs on individual machines. Protects that specific host.

**Examples:**
*   Windows Defender Firewall
*   iptables/nftables (Linux)
*   macOS Application Firewall

### Network-Based Firewall
Dedicated appliance protecting entire network segments.

**Deployment:**
```
[Internet] → [Firewall] → [Internal Network]
                  ↓
              [DMZ Servers]
```

### Cloud Firewalls
*   **Security Groups** (AWS/Azure/GCP)
*   **Web Application Firewalls** (WAF)
*   **Virtual Appliances** (VM-based firewalls)

---

## Firewall Rules: The Language of Security

Rules are evaluated **top-to-bottom** until a match is found.

### Rule Components
*   **Action**: ALLOW, DENY, DROP, REJECT
*   **Source**: IP address, subnet, zone
*   **Destination**: IP address, subnet, zone
*   **Service**: Port number and protocol
*   **Application**: Layer 7 app identification (NGFW)

### Best Practices

1.  **Default Deny**: Last rule should block everything.
2.  **Principle of Least Privilege**: Only allow what's needed.
3.  **Document Everything**: Every rule needs a business justification.
4.  **Regular Review**: Remove stale rules.
5.  **Specific to General**: More specific rules first.

### Example Ruleset

```
# Allow HTTPS to web servers in DMZ
1. ALLOW TCP 0.0.0.0/0 → 203.0.113.10/32 PORT 443

# Allow internal users to browse internet
2. ALLOW TCP 10.0.0.0/8 → 0.0.0.0/0 PORT 80,443

# Allow DNS queries
3. ALLOW UDP 10.0.0.0/8 → 8.8.8.8,8.8.4.4 PORT 53

# Allow admin SSH from jump host only
4. ALLOW TCP 10.0.1.5/32 → 10.0.0.0/8 PORT 22

# Default deny all
5. DENY ANY 0.0.0.0/0 → 0.0.0.0/0
```

---

## Linux Firewalls: iptables

iptables is the classic Linux firewall framework.

### Architecture
```
                    ┌──────────┐
   INCOMING →       │ PREROUTING │
                    └─────┬────┘
                          ↓
                    ┌──────────┐     ┌──────────┐
                    │  INPUT   │ →→→ │ Local    │
                    └──────────┘     │ Process  │
                          ↓          └────┬─────┘
                    ┌──────────┐          ↓
                    │ FORWARD  │     ┌──────────┐
                    └─────┬────┘     │  OUTPUT  │
                          ↓          └────┬─────┘
                    ┌──────────┐          ↓
                    │POSTROUTING│ ←←← ────┘
                    └─────┬────┘
                          ↓
                      OUTGOING
```

### Common Commands

```bash
# List rules
iptables -L -v -n

# Allow SSH
iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# Allow established connections
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# Block an IP
iptables -A INPUT -s 192.168.1.100 -j DROP

# Default deny
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# Save rules (varies by distro)
iptables-save > /etc/iptables/rules.v4
```

### Modern Alternative: nftables

```bash
# nftables syntax (cleaner)
nft add rule inet filter input tcp dport 22 accept
nft add rule inet filter input ct state established,related accept
nft add rule inet filter input drop
```

---

## Windows Firewall

### PowerShell Management

```powershell
# View rules
Get-NetFirewallRule | Where-Object {$_.Enabled -eq 'True'}

# Block an application
New-NetFirewallRule -DisplayName "Block Telnet" -Direction Outbound -Program "C:\Windows\System32\telnet.exe" -Action Block

# Allow port
New-NetFirewallRule -DisplayName "Allow HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow

# Block IP range
New-NetFirewallRule -DisplayName "Block Bad Actors" -Direction Inbound -RemoteAddress 192.168.1.0/24 -Action Block
```

---

## Firewall Evasion Techniques

Understanding evasion helps build better defenses.

### 1. Port Hopping
Use allowed ports (80, 443) for unauthorized protocols.

**Defense**: Application-aware firewalls (NGFW).

### 2. Protocol Tunneling
Encapsulate traffic in allowed protocols (HTTP, DNS).

**Defense**: Deep packet inspection, SSL decryption.

### 3. Fragmentation
Split attacks across packet fragments.

**Defense**: Fragment reassembly before inspection.

### 4. Encrypted Channels
TLS hides payload from inspection.

**Defense**: TLS inspection (with privacy considerations).

---

## Network Zones

Proper zone architecture is essential.

### Common Zones
*   **External/Untrusted**: Internet
*   **DMZ**: Public-facing servers
*   **Internal**: Corporate network
*   **Management**: Admin systems
*   **Guest**: Visitor WiFi

### Zone Rules
```
External → DMZ: HTTPS, DNS only
External → Internal: DENY
DMZ → Internal: Limited services
Internal → External: Web, email
Internal → DMZ: Management ports
Management → All: Allowed
```

---

## Summary

*   Firewalls have evolved from **packet filters** to **NGFWs**.
*   Rules are processed **top-to-bottom**, ending with default deny.
*   **Stateful inspection** tracks connection states.
*   **iptables/nftables** manage Linux firewalls.
*   **Zone architecture** enforces network segmentation.

Firewalls are essential but not sufficient. Attackers find ways around them. That's why we need additional layers.

**Next Part:** **Intrusion Detection and Prevention Systems (IDS/IPS)**—catching what firewalls miss.
