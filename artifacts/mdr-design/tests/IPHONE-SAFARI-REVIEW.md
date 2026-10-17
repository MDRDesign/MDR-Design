# WizFix comparison — iPhone Safari verification

## Status: closed with limitation — real-device verification unavailable

Access checked on 2026-10-17. No real-device session was started, so this is
not a pass or a failure of the comparison control.

The owner confirmed they currently have no way to check an iPhone. This
review is closed with the device checks below explicitly unverified, not
with an iPhone Safari compatibility approval. The procedure is retained
for when device access becomes available.

The available host is Linux x86_64 (kernel 6.18.57). It has no exposed USB
device bus or installed `xcrun`, `idevice_id`, `ios`, `appium`, or `tidevice`
commands. No iPhone or device-testing service is exposed by the configured
integrations or MCP servers. Integration searches for real iPhone Safari
testing and BrowserStack / Sauce Labs / LambdaTest returned no results.
These observations describe this session, not a claim that remote iPhone
testing is impossible or unsupported generally.

| Required environment detail | Recorded value |
| --- | --- |
| iPhone model | Unavailable — no device session |
| iOS version / build | Unavailable — no device session |
| Safari version / build | Unavailable — no device session |
| Device-service session identifier | Unavailable — no device session |
| External keyboard | Unavailable |

## Coverage boundary

Reviewed `helpers/wizfix-comparison.mjs` and the coverage description in
`README.md`; no browser suite was run for this access check.

The existing helper exercises held mouse dragging in mobile-emulated WebKit
and held-touch input through Chromium CDP. It checks image hit testing,
divider alignment, accessible values, and keyboard focus. Neither profile is
shipping iPhone Safari. Playwright's public WebKit touchscreen API supports
taps, not the required continuous held-touch drag. Synthetic DOM touch events
would not close this gap and were not used.

| Requested check on iPhone Safari | Result |
| --- | --- |
| Continuous finger drag left and right | Not tested — device access unavailable |
| Horizontal drag versus vertical page scrolling | Not tested — device access unavailable |
| Image clipping during and after dragging | Not tested — device access unavailable |
| Divider tracks the reveal boundary | Not tested — device access unavailable |
| External-keyboard focus and range keys | Not tested — keyboard/device unavailable |

The app, design, copy, and automated test behavior remain unchanged.

## Procedure once device access is available

1. Open the accessible portfolio URL at `/work/wizfix` in Safari on a real
   iPhone, or in an authorized real-iPhone device-service session. Record the
   exact URL/build, date, iPhone model, iOS version/build, Safari version/build
   as reported by the device or provider, orientation, and service session
   identifier when applicable. Do not infer versions from an emulated user agent.
2. Scroll to the comparison. Hold a finger on its center thumb and, without
   lifting, drag left, right, and back repeatedly, including near both ends.
   Confirm that updates follow the finger continuously rather than only on
   release, and that dragging still works after lifting and starting again.
3. During horizontal drags, check for unintended page scrolling. Check that
   deliberate vertical swipes over the control and beside it can scroll the
   page without trapping the visitor. Include a diagonal gesture and confirm
   the control remains usable afterward.
4. Watch the image boundary at intermediate positions and near both ends.
   Confirm neither image disappears, stretches, leaves a blank seam, or moves
   independently of the divider. Repeat in portrait and landscape after the
   viewport settles. Record a screen capture if the service/device permits.
5. If an external keyboard is available, record the keyboard-navigation
   settings, navigate to the slider using Tab (and Shift+Tab), and check that
   focus is visible. Check Left/Right, Home, and End where supported; confirm
   the reveal, divider, and accessible value agree. If a key is intercepted by
   Safari or the service, record that limitation instead of calling it a pass.
6. Replace the unavailable entries above with observed versions and per-check
   results. Preserve any remaining limitations, including an unavailable
   external keyboard. Do not mark the real-device verification complete from
   an emulator, screenshot alone, or synthetic DOM events.
