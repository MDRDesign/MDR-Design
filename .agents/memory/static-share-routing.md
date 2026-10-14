---
name: Static share routing
description: Why local static previews are insufficient to validate production social-share route handling.
---

Vite preview can return the homepage SPA fallback for an extensionless case-study URL even when a deep-route HTML shell exists. It does not apply Replit's production rewrite rules.

**Why:** A local HTTP check of a case URL returned the generic homepage image despite the correctly generated case shell. Replit's static rewrite rules run in order, so route-specific destinations must precede the general SPA fallback.

**How to apply:** Check generated deep-route HTML via its explicit index-file URL, check production rewrite destinations separately, and confirm the extensionless links on the actual published site once a verified production URL is available. Unknown preview rooms must use a noindex shell rather than the homepage fallback.
