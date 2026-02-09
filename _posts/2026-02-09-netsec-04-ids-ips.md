---
layout: post
title: "IDS/IPS: Detecting and Preventing Intrusions (Part 4)"
date: 2026-02-09 19:00:00 +0530
categories: [Cybersecurity, Networking]
tags: [ids, ips, snort, suricata, intrusion-detection, siem]
image: /assets/images/netsec-bg.jpg
description: "Part 4 of Computer Networks & Security. Understanding Intrusion Detection and Prevention Systems, signature vs. anomaly detection, and building effective SOC workflows."
author: Tharunaditya Anuganti
series: "Computer Networks & Security"
series_order: 4
series_description: "Mastering packet analysis, firewalls, IDS/IPS, and securing modern network infrastructure."
---

# Seeing the Attack in Progress

Firewalls are gatekeepers—they allow or deny based on rules. But what about attacks that look like legitimate traffic? What about the insider threat using approved channels?

**Intrusion Detection Systems (IDS)** and **Intrusion Prevention Systems (IPS)** go deeper. They analyze traffic patterns, compare against known attack signatures, and detect anomalies that firewalls miss.

---

## IDS vs. IPS: Detection vs. Prevention

### Intrusion Detection System (IDS)
*   **Passive**: Monitors and alerts.
*   **Out-of-band**: Receives copy of traffic (span port/tap).
*   **Action**: Generates alerts for human review.

```
[Traffic] → [Switch] → [Destination]
                ↓ (mirror)
              [IDS] → ALERT!
```

### Intrusion Prevention System (IPS)
*   **Active**: Monitors and blocks.
*   **Inline**: Traffic flows through the device.
*   **Action**: Drops malicious packets in real-time.

```
[Traffic] → [IPS] → [Destination]
              ↓
           BLOCK!
```

### Choosing Between IDS and IPS

| Factor | IDS | IPS |
|--------|-----|-----|
| Risk of blocking legitimate traffic | None | Possible (false positives) |
| Response time | Delayed (human) | Immediate (automated) |
| Network impact | None | Latency (inline) |
| Use case | Monitoring, forensics | Real-time protection |

**Best Practice**: Deploy IPS on critical segments, IDS for visibility everywhere.

---

## Detection Methods

### 1. Signature-Based Detection

Compares traffic against database of known attack patterns.

```
alert tcp $EXTERNAL_NET any -> $HOME_NET 445 (
    msg:"ET EXPLOIT MS17-010 SMB RCE";
    content:"|00 00 00 00 ff 53 4d 42|";
    sid:2024218;
)
```

**Pros:**
*   Fast and accurate for known threats.
*   Low false positive rate.

**Cons:**
*   Cannot detect zero-days or novel attacks.
*   Requires constant signature updates.

### 2. Anomaly-Based Detection

Establishes baseline of "normal" and alerts on deviations.

**Examples:**
*   User normally accesses 10 files/day; suddenly accesses 10,000.
*   Server typically receives 1 Mbps; suddenly hit with 100 Mbps.
*   HTTP traffic on port 443 (should be HTTPS).

**Pros:**
*   Can detect unknown/zero-day attacks.
*   Adapts to environment.

**Cons:**
*   High false positive rate during baseline.
*   Sophisticated attackers can slowly shift the baseline.

### 3. Protocol Analysis

Verifies traffic follows protocol specifications.

**Example**: An HTTP request that doesn't follow HTTP RFC is suspicious.

### 4. Heuristic/Behavioral Analysis

Machine learning models trained on attack behavior patterns.

---

## Open-Source IDS/IPS Solutions

### Snort

The original open-source IDS (1998). Now owned by Cisco.

```bash
# Run Snort in IDS mode
snort -A console -q -c /etc/snort/snort.conf -i eth0

# Alert output example
[**] [1:1000001:1] Potential SQL Injection [**]
[Priority: 1]
07/15-14:32:01.234567 192.168.1.100:52341 -> 10.0.0.5:3306
TCP TTL:64 TOS:0x0 ID:12345 IpLen:20 DgmLen:120
```

### Suricata

Modern, multi-threaded alternative to Snort (compatible with Snort rules).

```yaml
# suricata.yaml configuration
af-packet:
  - interface: eth0
    threads: auto
    defrag: yes

outputs:
  - eve-log:
      enabled: yes
      filetype: regular
      filename: eve.json
```

```bash
# Run Suricata
suricata -c /etc/suricata/suricata.yaml -i eth0
```

### Zeek (formerly Bro)

Not just detection—comprehensive network monitoring and logging.

*   Generates detailed logs (connections, HTTP, DNS, files).
*   Scripting language for custom analysis.
*   Excellent for forensics and threat hunting.

```bash
# Example Zeek logs
cat conn.log | zeek-cut id.orig_h id.resp_h id.resp_p proto service
```

---

## Writing IDS Rules

### Snort/Suricata Rule Structure

```
action protocol source_ip source_port direction dest_ip dest_port (options)
```

### Example Rules

```snort
# Detect SSH brute force
alert tcp any any -> $HOME_NET 22 (
    msg:"Possible SSH Brute Force";
    flow:to_server,established;
    threshold:type both,track by_src,count 5,seconds 60;
    sid:1000001; rev:1;
)

# Detect SQL Injection attempt
alert http any any -> $HOME_NET any (
    msg:"SQL Injection Attempt";
    content:"' OR '1'='1";
    nocase;
    http_uri;
    sid:1000002; rev:1;
)

# Detect Cobalt Strike beacon
alert tcp $HOME_NET any -> $EXTERNAL_NET any (
    msg:"Cobalt Strike C2 Beacon";
    content:"|00 00 be ef|";
    sid:1000003; rev:1;
)
```

### Rule Tuning

*   **Whitelist false positives**: Known good traffic triggering alerts.
*   **Threshold**: Aggregate multiple events into one alert.
*   **Suppress**: Hide alerts from specific sources.

---

## IDS/IPS Deployment Architectures

### Network-Based (NIDS/NIPS)
Monitors traffic at network level.

**Placement:**
*   Perimeter (between firewall and internet)
*   DMZ ingress/egress
*   Internal network segments
*   Data center east-west traffic

### Host-Based (HIDS/HIPS)
Monitors individual hosts.

**Examples:**
*   OSSEC
*   Wazuh
*   Sysmon + SIEM

**Monitors:**
*   File integrity
*   Process execution
*   Registry changes
*   Log anomalies

### Hybrid Approach

Most organizations deploy both:
*   **NIDS/NIPS**: Network visibility
*   **HIDS**: Endpoint visibility
*   **SIEM**: Correlate all alerts

---

## Integration with SIEM

IDS alerts feed into Security Information and Event Management (SIEM) systems.

### Workflow
```
[IDS/IPS Alerts]
      ↓
[Log Aggregation] (Logstash/Fluentd)
      ↓
[SIEM Platform] (Splunk/Elastic/Wazuh)
      ↓
[Correlation Rules]
      ↓
[SOC Analyst Dashboard]
      ↓
[Incident Response]
```

### Correlation Example

Single IDS alert: *Suspicious*
+ Failed logins from same IP: *More suspicious*
+ After-hours access: *Investigate*
+ Data exfiltration pattern: **Incident**

---

## Evasion Techniques

### 1. Fragmentation
Split attack across TCP fragments to evade pattern matching.

**Defense**: Reassemble before inspection.

### 2. Encoding
URL encode, Base64, or Unicode obfuscation.

**Defense**: Normalize/decode before matching.

### 3. Encryption
TLS hides attack payload.

**Defense**: TLS inspection (where appropriate).

### 4. Polymorphism
Malware changes signature each execution.

**Defense**: Behavioral/anomaly detection.

### 5. Slow and Low
Attack over long periods to avoid thresholds.

**Defense**: Long-term behavioral analysis.

---

## Best Practices

1.  **Keep signatures updated**: Subscribe to threat intelligence feeds.
2.  **Tune aggressively**: False positives cause alert fatigue.
3.  **Log everything**: Even unalerted traffic is valuable for forensics.
4.  **Segment deployment**: IPS inline on critical paths, IDS everywhere else.
5.  **Test regularly**: Red team exercises validate detection.
6.  **Integrate with response**: Alerts without action are useless.

---

## Summary

*   **IDS** detects and alerts; **IPS** detects and blocks.
*   **Signature-based** catches known threats; **Anomaly-based** catches unknowns.
*   **Snort/Suricata** for network; **OSSEC/Wazuh** for hosts.
*   **SIEM integration** enables correlation and response.

Detection is only half the battle. When alerts fire, someone needs to investigate.

**Next Part:** **VPNs and Secure Tunneling**—protecting data in transit across untrusted networks.
