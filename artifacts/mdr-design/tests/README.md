# Portfolio media regression checks

## Public navigation and safe inquiry journeys

```sh
pnpm --filter @workspace/mdr-design test:journeys
```

Uses the existing suites' real production-build / ephemeral Vite preview /
installed Chromium approach. Covers the non-WizFix public routes, navigation,
service and project inquiry presets, validation, keyboard controls, pending sends,
success, server/network failure and retry. Layout checks run at 1440, 768, 375
and 320px, at 100% and 200% root text size after fonts finish loading. A separate
320×568 touch-emulation check covers the enlarged phone menu. Normal-motion
scroll checks supplement, rather than replace, the existing Home/Armada reveal
and hero-motion suites.

**Safety:** each browser context blocks every non-GET/HEAD request before opening
a page. Inquiry tests override only `/api/inquiries` with local responses or
network aborts. No inquiry request may reach storage or email delivery. Do not
remove this guard or replace fixtures with real submissions.

The static preview has no App Storage API. Its backend-image check explicitly
skips; it must not be treated as a passing media check. To check the managed
web/API services (both workflows must be running):

```sh
REVIEW_URL=http://127.0.0.1:80 pnpm --filter @workspace/mdr-design test:journeys
```

Set `REVIEW_EVIDENCE=1` to save page screenshots, or limit a repeat capture with
Node's `--test-name-pattern`. Builds and evidence stay under ignored
`generated-artifacts/site-review/`. These are local SPA deep-route checks,
**not** verification of published rewrite rules. Chromium phone/touch emulation
is not physical iPhone Safari. See [the public-page review](PUBLIC-PAGE-REVIEW.md)
for findings, evidence filenames, command results and untested behavior.

## Content reveal visibility

```sh
pnpm --filter @workspace/mdr-design test:reveals
```

Builds the production app at `/` into the ignored
`generated-artifacts/content-reveals/` directory and serves it on an ephemeral
port. Uses the Chromium setup below; no API, credentials or external websites
are needed. Browser pages, browser and server are closed after failures too.

At 1440×1000 and 375×812, checks homepage Approach, Belief and CTA plus Armada's
What I heard, What I built and next-step sections. Real scrolling and
IntersectionObserver exercise `Reveal` / `useInView` and production CSS.
Checks require headings and body text (including text inside faded parents)
to have visible opacity, nonzero bounds, no reveal translation or clipping.
One-time reveals must stay readable offscreen and immediately on return.
Initial reduced motion and live preference changes expose even unvisited
content; restoring normal motion must not hide visited sections. Controlled
opacity, translation and clipping failures verify the readability guard itself.
This suite deliberately does not check hero logos or image/video decoding.

## Homepage motion

```sh
pnpm --filter @workspace/mdr-design test:motion
```

Uses the same Chromium setup described below, builds the actual production app
at `/`, and serves it on an ephemeral local port. No API, secrets or external
client websites are needed. Build output stays in the ignored
`generated-artifacts/hero-motion/` directory; the browser and server are closed
even after failures.

At desktop and phone sizes, checks exercise keyboard pause/resume, actual
IntersectionObserver scrolling, both CSS animation timelines and changing
color/line styles, visibility changes, and initial/live reduced-motion settings.
Headless background-tab behavior is simulated only at the `document.hidden` /
`visibilitychange` boundary; the application hooks and animations are real.
Returning to a tab/viewport or switching motion preferences must not override
an explicit user pause. Reduced motion must remove both animations, hide the
pattern and remove the unnecessary motion button.

At 1440px, 375px and 320px the suite requires the exact approved D-in-front
Layered Monoline SVG masters (including the compact variant), not the old raster
identity. It checks decoding, visibility, size and the matching motion mask.
Pixel comparisons at three animation phases and against the unoverlaid master
keep the outlined MDR Design name static and unobscured.

For the social-share metadata checks (no browser required), run:

```sh
pnpm --filter @workspace/mdr-design test:seo
```

This checks both case routes in development HTML and built static shells at root
and nested artifact bases, with and without a configured site origin. It checks
matching Open Graph/Twitter titles, descriptions and images, actual JPEG dimensions,
image response types and size, and noindex/no-canonical for preview shells.
The reserved example origin is a test fixture only. Set `VITE_SITE_URL` to a verified
published origin when one is available; no guessed/development origin is embedded.
Regenerate the two 1200×630 cards from the genuine captures with
`bash artifacts/mdr-design/scripts/share-images.sh` (requires ImageMagick).

Run from the workspace root:

```sh
pnpm --filter @workspace/mdr-design test:wizfix
```

Requires Chromium on `PATH`, a Playwright-installed Chromium, or an explicit
`CHROMIUM_PATH`. If no browser is installed, run
`pnpm --filter @workspace/mdr-design exec playwright-core install chromium`.
Missing browser setup fails the checks rather than silently skipping them.

### Cross-browser comparison

The comparison helper runs keyboard navigation (arrows, Home and End), visible
focus, native range dragging, image hit-testing on both sides of the moving
clip boundary, and deliberately frozen-image/divider guards in Chromium,
Firefox and WebKit. Desktop profiles use 1440px, 375px and 320px viewports;
an additional mobile-emulated WebKit profile uses 375px and 320px with
`isMobile` and `hasTouch`. Every profile checks both artifact bases.

Firefox and WebKit use Playwright-managed runtimes by default. Install them with:

```sh
pnpm --filter @workspace/mdr-design exec playwright-core install firefox webkit
```

Alternatively set `FIREFOX_PATH` or `WEBKIT_PATH` to compatible Playwright
executables (an ordinary system Firefox/Safari executable is not a substitute).
Missing executables or host libraries produce explicit, engine-labelled skipped
tests with the setup reason; they are **not** successful cross-browser checks.
Unexpected launch errors and interaction failures fail the suite. All launched
browsers are closed during teardown, including after setup/test failures.

Pointer drags hold the native range thumb while moving in both directions.
Chromium also retains held-touch dragging via CDP at phone sizes. Playwright's
public touch API only supports taps outside Chromium, so the mobile WebKit
profile uses native mouse dragging in a touch-capable mobile context, not
synthetic DOM touch events. This is WebKit engine/mobile emulation coverage,
not verification on a physical iPhone or the shipping Safari app.

The suite builds the actual app at root and nested artifact bases, serves each
temporarily on local ephemeral ports, and closes the servers and browser
afterward. Required `PORT` and `BASE_PATH` build values are set temporarily and
restored after setup. Output goes to the ignored
`generated-artifacts/wizfix-regression/` directory. It does not need the API,
credentials, external client websites, or a running development workflow.

Checks cover all WizFix WebPs (file signature, HTTP status/type/body and browser
decoding), the homepage, case study and unlisted preview at 1440px, 375px and
320px, responsive screenshot sources, real reveal styles, frame dimensions,
desktop/phone SVG capture bounds and decoding, the exact preview note, and
absence of unmeasured results and sample testimonials.

The same command also checks Armada's published desktop proof at 1440px, 375px
and 320px under both `/` and `/portfolio-regression/`. It requires the source
WebP, verifies the exact resolved media URL, HTTP status/type/body, actual
browser decoding and positive natural dimensions, and checks visible frame
bounds. Controlled failures prove the guard rejects missing/corrupt source
files, missing image responses, SPA fallback HTML, corrupt image bytes with a
WebP header, and URLs that escape the nested artifact base. These checks use
temporary fixtures and browser interception, never modify public artwork,
and do not contact Armada's external website.

The before-and-after comparison now uses real owner-supplied/published captures,
so it must not carry concept labels. Only the unused illustrative fallback
artwork retains its explicit concept labels. The checks preserve this distinction;
they do not recreate the former website or invent client results.
