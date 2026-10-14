# Portfolio media regression checks

Run from the workspace root:

```sh
pnpm --filter @workspace/mdr-design test:wizfix
```

Requires Chromium on `PATH`, a Playwright-installed Chromium, or an explicit
`CHROMIUM_PATH`. If no browser is installed, run
`pnpm --filter @workspace/mdr-design exec playwright-core install chromium`.
Missing browser setup fails the checks rather than silently skipping them.

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
