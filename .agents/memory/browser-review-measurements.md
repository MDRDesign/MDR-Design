---
name: Browser review measurements
description: Reliable enlarged-text geometry and animated-menu focus checks.
---

Wait for document fonts after changing text size before judging clipping.
Viewport breakpoints do not necessarily adapt when root text grows; preserve
normal-size layouts while checking enlarged text with real rendered geometry.

**Why:** Initial geometry passed before the enlarged font finished loading;
subsequent captures exposed real service-column and homepage clipping.

**How to apply:** Measure after font readiness at each size and include narrow
and tablet widths. Treat a pre-font-layout pass as provisional.

Do not assume a panel is focusable merely because its open state was committed
or a single animation frame elapsed. Check actual visibility before moving focus.

**Why:** A transitioning mobile menu ignored its initial focus call while the
first link was still computed hidden, leaving focus outside the modal.

**How to apply:** Verify active focus in the real browser, not just the presence
of a focus call. Defer focus until visible and cancel deferred work on close.
