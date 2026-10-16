# MDR Design — remaining public-page review

## Scope and method

Reviewed Home, Services, Process, Contact, Armada-Catering, Captain’s Galley,
Z-Delivery and the public not-found page. No WizFix page, artwork, comparison,
test suite, project chronology, ordering, claims or attribution was changed.
Unlisted preview rooms, external client-site availability, favicon/share art,
production data and deployment were not part of this review.

Actual Chromium rendering was checked against both the managed development
services and a fresh production build served by Vite preview:

- Every listed route: 1440×900, 768×900, 375×900 and 320×900; 100% and 200% root
  text size, waiting for fonts to load before measuring reflow.
- Initial reduced motion across that matrix; normal-motion scroll/reveal checks
  at 1440 and 375px. Existing Home/Armada and hero-motion checks were reused.
- Phone menu additionally checked with touch emulation at 320×568 and 200% text.
- Desktop/phone menu links, skip link, focus trap, Escape, close-on-navigation,
  same-home wordmark navigation, resize recovery, work anchors, history
  back/forward, direct case entry, case inquiry links and not-found recovery.
- Sampled computed foreground/background contrast of headings, body copy,
  labels and links on the reviewed pages; no below-threshold static samples
  found (4.5:1 normal / 3:1 large). This is not a full accessibility
  certification or an audit of every animated gradient phase, placeholder,
  hover state or alternate theme.

## Page and journey results

| Page | Desktop/tablet and phone result | Relevant journeys |
| --- | --- | --- |
| Home `/` | Reviewed; image and caption visible; text reflows after fixes | Hero inquiry, selected work, project-index case links; normal/reduced-motion coverage reused |
| Services `/services` | Reviewed; cards remain readable as text grows | Brand Starter, Website, Business App and Brand + Website links select the matching contact radio |
| Process `/process` | Reviewed; timeline heading no longer intrudes into adjacent copy | Timeline scroll reveals and final inquiry action |
| Contact `/contact` | Reviewed at all sizes; required controls have accessible feedback | See isolated form checks below |
| Armada `/work/armada-catering` | Reviewed; published desktop capture decodes and has descriptive alt text | Index entry, Brand + Website inquiry, return to selected work |
| Captain’s Galley `/work/captains-galley` | Reviewed; both phone screens and customization image decode | Index entry, Business App inquiry, return to selected work |
| Z-Delivery `/work/z-delivery` | Reviewed; four app screens decode with descriptive alt text/captions | Index entry, Business App inquiry, return to selected work |
| Not-found `/missing-page` | Reviewed; message and home recovery visible | Direct unknown-path entry and Return home |

External website/app links retain their destinations, new-tab disclosure and
safe relationship attributes. Their destination websites, staff sign-in and
third-party ordering flows were **not** exercised.

## Confirmed issues and contained fixes

No critical issue was found within the tested scope.

| Severity | Reproduced behavior | Fix and regression evidence |
| --- | --- | --- |
| Medium | Opening the phone menu left focus on the opener: its first focus call occurred while the animated panel was still computed hidden | Wait for visible panel before moving focus; keyboard trap, Escape and touch tests |
| Medium | Opening the phone menu then resizing to desktop left body scrolling locked | Close on the desktop breakpoint and restore the previous overflow state; resize assertion |
| Medium | At 200% text, phone header controls crowded beyond the usable width and the short fixed menu had unreachable lower content | Allow header wrapping and menu scrolling; 320×568 touch/last-link reachability assertions |
| Medium | A Process timeline heading overflowed its 768px column; loaded enlarged type overflowed service cards and multi-column public content | Wrap long words, use text-relative service sizing and container-query reflow into the existing phone grid. Normal-size composition is retained; WizFix content is not opted into the new reflow rules |
| Medium | At 320px with doubled text, the hero’s seven-column nested grid and inquiry button clipped copy; project-index links also crowded | Use a single mobile hero sub-column, allow button/index-link wrapping; all-route reflow assertions |
| Low | Required fields were indicated visually but not exposed as required; the service radio error lacked per-radio invalid/error association | Add required/invalid/described-by semantics without replacing native radio/select keyboard behavior |
| Low | Inquiry success removed the active submit control and left keyboard focus on the body | Focus the success heading and respect reduced motion when scrolling |
| Low | Header/footer Work navigation from another page scrolled home without keeping `#work` in the destination URL; the special handler also intercepted modified clicks | Keep the anchor in navigation/history and leave modified clicks to the link; anchor and back/forward assertions |

## Isolated contact checks — no delivery

All browser contexts deny non-GET/HEAD requests by default. Form tests intercept
the exact inquiry endpoint locally; no test inquiry reaches the API server,
database or email provider.

- Service/project presets and an invalid `need` query were checked.
- Empty submit produces seven required-field messages and focuses the first
  invalid field. Invalid email does not send.
- Service radio arrow keys, visible chip focus and keyboard selection of both
  selects work. Labels, required states and radio error associations are checked.
- A delayed response exposes “Sending…” and disables the submit button.
  Enter during the pending request does not generate a second send.
- Intercepted 201 shows confirmation and moves focus to its heading.
- Intercepted 503 exposes the server message; simulated network failure exposes
  retry feedback. Both preserve entered details.
- A retry succeeds with the same payload and source. The fixture record is
  `generated-artifacts/site-review/inquiry-isolation.json`.

Real persistence, provider delivery and production form behavior are
deliberately **not** claimed as tested.

## Verification and evidence

Final completed checks:

| Command/check | Result |
| --- | --- |
| `pnpm --filter @workspace/mdr-design test:journeys` | 10 passed; 1 explicit skip (backend-served image unavailable on static preview) |
| Managed-services `site-journeys.test.mjs` filtered to `Public pages\|Backend-served` | 5 passed; includes the real read-only App Storage image and final reflow captures |
| Remaining normal-motion, menu, preset and isolated inquiry checks against managed services | Passed during the review; final production-build suite covers these same journeys |
| `pnpm --filter @workspace/mdr-design test:reveals` | 13 passed |
| `pnpm --filter @workspace/mdr-design test:motion` | 7 passed |
| `pnpm run typecheck` | Passed across the workspace |

The frontend workflow was restarted after the completed code batch. It serves
cleanly; the final phone preview has no application error in its browser log.

Screenshots and small fixture records are generated into ignored
`generated-artifacts/site-review/`, not committed as large assets:

- `before-{1440,768,375,320}-{route}.png`: initial full-page route captures.
- `after-{width}-{1,2}-{route}.png`: final 100% / 200% captures for every reviewed
  page. Slashes are replaced by underscores; Home is `_`, for example
  `after-320-2-_.png` and `after-768-2-_services.png`.
- `services-tablet-enlarged-before.png`: reproduced service-column overflow.
- `menu-enlarged-before.png`: reproduced short-menu overflow.
- `home-final.jpg`: final 375px normal-motion preview.
- `contrast-findings.json`: sampled static text-color check (empty finding list).

Recreate the route evidence with:

```sh
REVIEW_URL=http://127.0.0.1:80 REVIEW_EVIDENCE=1 \
  node --test --test-name-pattern='Public pages|Backend-served' \
  artifacts/mdr-design/tests/site-journeys.test.mjs
```

## Limitations and separate findings

- Firefox and WebKit executable paths were checked and their runtimes are
  missing. No Firefox, Safari/WebKit or physical-device pass is claimed.
  Existing cross-browser and iPhone work remains separate.
- A verified published address was not supplied/established for this review.
  Direct entries on local Vite SPA previews do **not** validate production
  rewrite ordering, published deep-link refreshes, or HTTP 404 status behavior.
- Enlarged-text checks change root font size to 200%; they are not a claim of
  native browser UI zoom, OS accessibility-font testing or screen-reader testing.
- Repeated read-only Galley App Storage requests returned 200, but backend logs
  also emitted `MaxListenersExceededWarning` for `PassThrough` error/close
  listeners. No image failure was observed. Stream-lifecycle investigation is
  separate from this frontend review; no listener limit was raised to hide it.
- Live-link monitoring, date/logo regressions and sharing artwork were left to
  their existing separate tasks. No real inquiry, outbound email, production
  mutation or publication was performed.
