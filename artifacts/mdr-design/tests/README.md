# WizFix visual regression checks

Run from the workspace root:

```sh
pnpm --filter @workspace/mdr-design test:wizfix
```

Requires Chromium on `PATH`, a Playwright-installed Chromium, or an explicit
`CHROMIUM_PATH`. If no browser is installed, run
`pnpm --filter @workspace/mdr-design exec playwright-core install chromium`.
Missing browser setup fails the checks rather than silently skipping them.

The suite builds the actual app once, serves it temporarily on a local ephemeral
port, and closes the server and browser afterward. Output goes to the ignored
`generated-artifacts/wizfix-regression/` directory. It does not need the API,
credentials, external client websites, or a running development workflow.

Checks cover all WizFix WebPs (file signature, HTTP status/type/body and browser
decoding), the homepage, case study and unlisted preview at 1440px, 375px and
320px, responsive screenshot sources, real reveal styles, frame dimensions,
desktop/phone SVG capture bounds and decoding, the exact preview note, and
absence of unmeasured results and sample testimonials.

The before-and-after comparison now uses real owner-supplied/published captures,
so it must not carry concept labels. Only the unused illustrative fallback
artwork retains its explicit concept labels. The checks preserve this distinction;
they do not recreate the former website or invent client results.
