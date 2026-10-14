---
name: Media frame CSS cascade
description: Preventing blank framed images caused by Tailwind and unlayered CSS precedence.
---

Unlayered component CSS outranks Tailwind's layered utilities. A positioning utility can appear on an element while its computed position is still relative.

**Why:** The hero media disappeared twice after layout changes because a generic frame rule overrode absolute positioning, collapsing the containing element despite a correctly loaded image.

**How to apply:** Use an explicit component variant for fill-positioned frames and verify computed position and height when media is blank. A valid image URL and the expected utility class alone do not prove that the frame can display it.
