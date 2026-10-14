# MDR Design

Danielle Crowder’s web design and branding portfolio for local businesses that deserve to look established.

## Product direction

- This site is the studio’s most important sales tool. The intended reaction is: “This person understands my business and makes brands look expensive.”
- The studio listens, then designs. Case studies should show what the client said, what Danielle heard, and what she built.
- The goal is always to boost exposure and build the client’s brand to Danielle’s best ability.
- Prioritize a polished Home page and WizFix case study over additional features.
- The user wants sophisticated, classy, clean-lined editorial and architectural design, not a generic modern template.
- Preserve ivory/ink/stone/hairline with sparse oxblood, Instrument Serif and Instrument Sans, square corners, strict grids and deliberate motion.
- Avoid gradient blobs, glassmorphism, neon/purple gradients, bubbly cards, stock-photo people, emoji, icon grids, generic SaaS heroes and carousels.
- Never present sample quotes, concept before/after images or placeholder results as verified client testimonials or measured outcomes.
- Preview rooms are unlisted and noindex, not access-controlled confidential pages. Do not add them to public navigation.

## Run & operate

- Managed frontend workflow: `artifacts/mdr-design: web`
- Managed backend workflow: `artifacts/api-server: API Server`
- `pnpm run typecheck` — full workspace check
- `pnpm --filter @workspace/api-spec run codegen` — regenerate contracts
- `pnpm --filter @workspace/db run push` — development schema only
- Inquiry submissions are saved in PostgreSQL. No public read endpoint exposes personal inquiry information.

## Media & launch

The user will supply Runway-generated files. Upload them to `artifacts/mdr-design/public/media/`:

- `hero-loop.mp4`
- `process-texture.mp4`
- `wizfix-film.mp4`
- `wizfix-mockup.jpg`

Retain the designed fallback artwork until media exists. Compress video before adding it. The portfolio does not generate video or call Runway at runtime.

`VITE_SITE_URL` may be set to the verified published URL before building to produce absolute canonical URLs, social-image URLs and a sitemap. Never substitute a development or guessed production domain.

## Stack

React/Vite frontend, Express backend, PostgreSQL/Drizzle inquiry storage, and OpenAPI-generated mutation hooks. Use the configured managed workflows rather than starting replacement servers.
