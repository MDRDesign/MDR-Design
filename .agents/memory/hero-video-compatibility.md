---
name: Hero video compatibility
description: Why studio films need verification across the actual preview capture browser and local Chromium.
---

Deliver VP9 WebM with an H.264 MP4 fallback for studio films, and verify both the actual preview capture and native browser playback.

**Why:** The H.264 film played correctly in local Chromium, but desktop and mobile preview captures displayed the unavailable-film fallback. Supplying VP9 WebM resolved playback in both captures. Local playback alone did not reveal the difference.

**How to apply:** When a film works locally but fails in preview captures, check codec compatibility before changing its imagery or story. Preserve a still poster and reduced-motion behavior, and verify browser resource selection after adding another format.
