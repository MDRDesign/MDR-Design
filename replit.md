# MDR Design

Danielle Crowder’s web design and branding portfolio for local businesses that deserve to look established.

## Product direction

- This site is the studio’s most important sales tool. The intended reaction is: “This person understands my business and makes brands look expensive.”
- The studio listens, then designs. Case studies should show what the client said, what Danielle heard, and what she built.
- The goal is always to boost exposure and build the client’s brand to Danielle’s best ability.
- Prioritize a polished Home page and WizFix case study over additional features.
- The user wants sophisticated, classy, clean-lined editorial design that is sharp, high-impact and attention-demanding, like a confident art-gallery or fashion-house identity—not a quiet template.
- The latest refinement is deliberate and restrained: the user found the accumulated effects “too obnoxious and a bit messy.” Do not equate visual impact with more effects or oversized typography.
- Designjoy is a reference for clarity, directness and hierarchy—not a design to copy. Keep MDR's own identity and project-based studio positioning; do not borrow subscription pricing, claims or graphics.
- Favor immediate access to the offer, real work and inquiry action over intro screens and route-covering animations.
- Colored backgrounds should dominate; ivory is a breather. The user clarified that “bold” means design, typography and the location of wording across the site, not excessively large fonts.
- Dial back the electric blue to dark blue-teal with subtle color shifts and a restrained heartbeat-like highlight passing across the MDR Design name. This supersedes the Klein Blue direction.
- Retain ink #0E0E0E, ivory #F4F1EA and crimson #B3261E alongside dark blue-teal. Reduce typography sizes overall while keeping strong weight and thoughtful composition.
- Pair heavy condensed Archivo caps with Instrument Serif italics; retain Instrument Sans for body text, square corners, strict grids and deliberate motion.
- Hero imagery should remain dimensional but less rigid and more recognizable than the architectural model: thoughtful, not whimsical or confusing.
- The opening should have a more technical design feel and a focused pop of color. The owner chose Runway-generated still artwork plus lightweight website animation; do not describe it as a Runway-generated video.
- Portfolio chronology: Armada-Catering (first, built and sold) and Captain’s Coffee Roasting are 2025 projects; WizFix Computers, Captain’s Galley, Z-Delivery and Prime Your Move are 2026 projects. Show 2025 before 2026.
- Captain’s Coffee Roasting is a premium coffee roasting subscription; Captain’s Galley is a local food pickup ordering app; Prime Your Move is a workout and health tracking app for people over 40.
- Captain’s Galley, Z-Delivery and Prime Your Move each list Web Design + Web App + Brand Direction as their services, as specified by the owner.
- Armada's case study covers Web Design + Brand Direction for a small Southern California catering company seeking a fresh direction for branding and networking. Ground it in the owner's brief and published website; do not invent results, testimonials or historical screenshots. Do not describe WizFix as sold without confirmation.
- Avoid gradient blobs, glassmorphism, neon/purple gradients, bubbly cards, stock-photo people, emoji, icon grids, generic SaaS heroes and carousels.
- Never present sample quotes, concept before/after images or placeholder results as verified client testimonials or measured outcomes.
- WizFix needed a major redesign appropriate for the tech industry. The client has seen and likes the redesign direction; do not describe the sales-pitch stage publicly.
- Preserve existing design, styling and motion during content-only polish passes. The subsequent bold visual upgrade is an explicit exception.
- Preview rooms are unlisted and noindex, not access-controlled confidential pages. Do not add them to public navigation.

## Run & operate

- Managed frontend workflow: `artifacts/mdr-design: web`
- Managed backend workflow: `artifacts/api-server: API Server`
- `pnpm run typecheck` — full workspace check
- `pnpm --filter @workspace/api-spec run codegen` — regenerate contracts
- `pnpm --filter @workspace/db run push` — development schema only
- Inquiry submissions are saved in PostgreSQL. No public read endpoint exposes personal inquiry information.
- Inquiry email notifications use the connected Resend integration after saving. Failure to send must never change a successful database submission into an error.
- `node --test artifacts/api-server/tests/inquiry-notifications.test.mjs` — isolated tests for notification success, provider rejection, timeout, and validation.
- `pnpm --filter @workspace/mdr-design test:wizfix` — self-contained production-build checks for WizFix image assets, desktop/phone visibility and truthful labels; requires Chromium (see `artifacts/mdr-design/tests/README.md`).

## Media & launch

The user will supply Runway-generated files. Upload them to `artifacts/mdr-design/public/media/`:

- `hero-loop.mp4`
- `process-texture.mp4`
- `wizfix-film.mp4`
- `wizfix-mockup.jpg`

Retain the designed fallback artwork until media exists. Compress video before adding it. The portfolio does not generate video or call Runway at runtime.

`VITE_SITE_URL` may be set to the verified published URL before building to produce absolute canonical URLs, social-image URLs and a sitemap. Never substitute a development or guessed production domain.

The Resend connection is sending-only. Its default `onboarding@resend.dev` sender is limited to the account owner's email. To notify another address, use `INQUIRY_EMAIL_FROM` with a sender on a verified domain; do not impersonate a Gmail sender.

## Stack

React/Vite frontend, Express backend, PostgreSQL/Drizzle inquiry storage, and OpenAPI-generated mutation hooks. Use the configured managed workflows rather than starting replacement servers.
