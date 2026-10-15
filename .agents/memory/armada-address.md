---
name: Armada public address
description: Why the Armada portfolio reference must retain its www hostname.
---

Use https://www.armada-catering.com/ for the Armada-Catering portfolio reference.

**Why:** The user explicitly confirmed this public address. On 2026-10-13, the www site rendered Armada Catering Company successfully, while the bare domain failed DNS resolution.

**How to apply:** Do not strip www when normalizing portfolio URLs. Recheck live resolution before changing the host. External DNS changes require the owner's access and consent.

Armada's DNS is managed through GoDaddy.

**Why:** The user confirmed GoDaddy DNS.

**How to apply:** Inspect the existing zone and forwarding settings before proposing changes. Keep the working www host and email records intact.

GoDaddy's incoming HTTPS forwarding and the destination URL's protocol are separate settings. Retain www as the canonical portfolio address even when bare-domain forwarding works.

**Why:** Enabling forwarding initially saved an HTTP destination, while incoming HTTPS remained unavailable during certificate provisioning. A saved rule alone did not establish that HTTPS worked.

**How to apply:** Explicitly select an HTTPS destination and verify the live 301 response, hostname-valid certificate, and final successful page independently. Do not repeatedly edit correct settings while certificate provisioning is pending.
