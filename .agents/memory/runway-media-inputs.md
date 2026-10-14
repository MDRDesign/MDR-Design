---
name: Runway media inputs
description: Distinguishing available image models from supported input modes and usable provider references.
---

Do not assume every available Runway image model accepts text-only generation.

**Why:** A model listed as available rejected a text-only request because it required a reference image. Availability and input capabilities are separate.

**How to apply:** Check current account availability and the selected model's input requirements before submitting. Use a reference-capable workflow for edits and a text-capable model for original artwork.

An image model listed by Runway can still be gated behind a paid plan. Supported aspect ratios also differ by model.

**Why:** A listed image model returned `paid_plan_required`, while a reference-based model remained usable; the latter rejected a portrait ratio accepted by other models.

**How to apply:** Treat the availability list as a catalog, not proof of account access. Check tool responses before assuming image generation is unavailable or asking for an upgrade. Validate the chosen model's ratio rather than transferring another model's options.

A viewable Replit preview asset is not necessarily a usable Runway reference URL.

**Why:** Runway's fetch of a studio image on the development preview returned HTML instead of an image, despite the asset displaying in the app.

**How to apply:** Verify the provider can fetch image content rather than a proxy page. Prefer Runway-hosted asset references or task IDs when reusing generated media; do not reconstruct signed asset URLs.
