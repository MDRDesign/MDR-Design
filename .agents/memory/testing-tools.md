---
name: Testing tool availability
description: Handling a mismatch between the testing skill and available runtime callbacks.
---

The testing skill documented a subagent with `$kind: "testing"`, but the runtime rejected it with `Unknown config kind: testing`. Do not assume every documented agent kind is enabled in this environment.

**Why:** A requested desktop/mobile render check could not launch the documented browser tester, while direct screenshots remained available.

**How to apply:** For public-page render verification, use direct app screenshots and API/unit checks if the testing agent is unavailable. Tool availability may change; this is not a permanent platform limitation. Do not claim interaction testing from a static screenshot.
