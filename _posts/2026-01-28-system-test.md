---
layout: post
title: "System Test: SecBot & Notifications"
date: 2026-01-28 12:00:00 +0530
categories: [Announcements]
tags: [test, automation, bot]
image: /assets/images/logo.png
description: "A live test to verify the automated push notification system and the AI chatbot's context awareness."
author: Tharunaditya
series: "Site Updates"
series_order: 1
series_description: "Tracking the technical evolution of this portfolio."
---

# Testing Systems

**Hello World!**

This is a generated test post to verify two major upgrades to the **Tharunaditya Security** platform:

1.  **Automated Notifications**: If you are reading this, it likely means you received a push notification instantly when this post was deployed. This system uses a custom GitHub Action workflow to interface with the OneSignal API securely.
2.  **SecBot Context**: Our AI assistant (bottom right) should now be aware of this specific article.

### How to Verify

 Open **SecBot** and ask:
> "Summarize this article."

If the system is working, it should reply that this is a **"live test of the notification and AI context systems"**, rather than hallucinating or giving a generic answer.

### Technical Details

The notification pipeline works as follows:
1.  Developer pushes `_posts/*.md` to `main`.
2.  GitHub Actions triggers `notify_subscribers.yml`.
3.  A Python script parses the Frontmatter (Title & Description).
4.  OneSignal API broadcasts the message to all subscribed browsers.

*End of Test Transmission.*
