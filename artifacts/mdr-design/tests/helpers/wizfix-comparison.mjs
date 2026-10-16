import assert from 'node:assert/strict';
import { test as nodeTest } from 'node:test';

const label = 'Compare the former and published WizFix websites';

async function openComparison(page, deployment, checkVisibleCapture) {
  await page.goto(deployment.origin + deployment.base + 'work/wizfix', { waitUntil: 'networkidle' });
  const slider = page.getByRole('slider', { name: label, exact: true });
  assert.equal(await slider.count(), 1, 'Comparison needs a unique accessible slider name');
  assert.ok(await slider.evaluate((element) =>
    element instanceof HTMLInputElement && element.type === 'range'),
  'Comparison must use a native range input');
  const frame = page.locator('.ba');
  for (const image of await frame.locator('img').all()) await checkVisibleCapture(image);
  assert.equal(await frame.locator('img').count(), 2, 'Both comparison images must be present');
  await slider.scrollIntoViewIfNeeded();
  return { slider, frame };
}

// Inspect painted-layer geometry and browser hit testing, not only React state.
// elementsFromPoint respects clip-path, so the top image must switch across the
// divider. The transparent input and decorative handle are intentionally ignored.
async function checkReveal(frame, expected) {
  const state = await frame.evaluate((element) => {
    const slider = element.querySelector('input');
    const images = [...element.querySelectorAll('img')];
    const bounds = element.getBoundingClientRect();
    const divider = element.querySelector('.ba-divider').getBoundingClientRect();
    const visibleImageAt = (fraction) => {
      const x = bounds.left + bounds.width * fraction;
      const y = bounds.top + bounds.height * 0.35;
      const image = document.elementsFromPoint(x, y).find((node) => images.includes(node));
      return image ? images.indexOf(image) : -1;
    };
    return {
      value: Number(slider.value),
      text: slider.getAttribute('aria-valuetext'),
      divider: (divider.left - bounds.left + 1) / bounds.width * 100,
      leftImage: visibleImageAt(0.1),
      rightImage: visibleImageAt(0.9),
      beforeDivider: visibleImageAt(Math.max(0.02, Number(slider.value) / 100 - 0.05)),
      afterDivider: visibleImageAt(Math.min(0.98, Number(slider.value) / 100 + 0.05)),
      loadedAndVisible: images.every((image) => {
        for (let node = image; node && node !== element.parentElement; node = node.parentElement) {
          const style = getComputedStyle(node);
          if (Number(style.opacity) < 0.99 || style.visibility !== 'visible' ||
              style.display === 'none') return false;
        }
        return image.complete && image.naturalWidth > 0 && image.getBoundingClientRect().width > 20;
      }),
    };
  });
  assert.ok(state.loadedAndVisible, 'Both revealed images must remain decoded and visible');
  assert.equal(state.value, expected, 'Range did not respond to interaction');
  assert.equal(state.text, `${expected}% before shown`, 'Accessible value must follow the reveal');
  assert.ok(Math.abs(state.divider - expected) < 1, `Divider detached from reveal: ${JSON.stringify(state)}`);
  assert.equal(state.leftImage, expected <= 10 ? 1 : 0, 'Wrong image exposed on the left');
  assert.equal(state.rightImage, expected >= 90 ? 0 : 1, 'Wrong image exposed on the right');
  if (expected > 5 && expected < 95) {
    assert.equal(state.beforeDivider, 0, 'Before image must extend to the moving divider');
    assert.equal(state.afterDivider, 1, 'After image must begin at the moving divider');
  }
}

async function tabToSlider(page, slider) {
  for (let step = 0; step < 80; step++) {
    await page.keyboard.press('Tab');
    if (await slider.evaluate((element) => element === document.activeElement)) return;
  }
  assert.fail('Comparison slider is not reachable through keyboard navigation');
}

export function registerComparisonTests({ profile, getRuntime, deployments, checkVisibleCapture }) {
  const { engine, mobile = false } = profile;
  const getBrowser = () => getRuntime().browser;
  const pageOptions = (width, touch = false) => ({
    viewport: { width, height: 900 },
    // Firefox does not support Playwright's isMobile option.
    ...(engine !== 'firefox' ? { isMobile: mobile || touch } : {}),
    hasTouch: mobile || touch,
  });
  const test = (name, options, run) => nodeTest(
    `${engine}${mobile ? ' mobile emulation' : ''}: ${name}`, options, async (context) => {
      const runtime = getRuntime();
      assert.ok(runtime, `Missing runtime setup for ${engine}`);
      if (runtime.unavailable) {
        context.skip(runtime.unavailable);
        return;
      }
      await run();
    });
  // Reuse the suite's root and nested production builds.
  for (const base of ['/portfolio-regression/', '/']) {
    for (const width of mobile ? [375, 320] : [1440, 375, 320]) {
      test(`WizFix comparison keyboard, focus and reveal at ${width}px under ${base}`,
        { timeout: 45_000 }, async () => {
          const page = await getBrowser().newPage(pageOptions(width));
          try {
            const { slider, frame } = await openComparison(page,
              deployments.find((deployment) => deployment.base === base), checkVisibleCapture);
            assert.equal(await slider.getAttribute('min'), '0');
            assert.equal(await slider.getAttribute('max'), '100');
            assert.equal(await slider.getAttribute('step'), '1');
            await checkReveal(frame, 50);
            const unfocusedOutline = await frame.evaluate((element) => getComputedStyle(element).outlineStyle);
            await tabToSlider(page, slider);
            const focus = await frame.evaluate((element) => {
              const style = getComputedStyle(element);
              const rect = element.getBoundingClientRect();
              return {
                visible: element.querySelector('input').matches(':focus-visible'),
                outline: style.outlineStyle, width: parseFloat(style.outlineWidth),
                color: style.outlineColor, background: style.backgroundColor,
                onScreen: rect.left >= 0 && rect.right <= innerWidth &&
                  rect.top >= 0 && rect.bottom <= innerHeight,
              };
            });
            assert.ok(focus.visible && focus.onScreen, 'Keyboard focus must be visible in the viewport');
            assert.notEqual(focus.outline, 'none', 'Transparent range needs a visible frame focus ring');
            assert.notEqual(focus.outline, unfocusedOutline, 'Focus must visibly change the frame');
            assert.ok(focus.width >= 1 && focus.color !== 'rgba(0, 0, 0, 0)' &&
              focus.color !== focus.background, 'Focus outline must be visible');
            for (const [key, expected] of [
              ['ArrowRight', 51], ['ArrowLeft', 50], ['Home', 0], ['End', 100],
            ]) {
              await page.keyboard.press(key);
              await checkReveal(frame, expected);
            }
          } finally { await page.close(); }
        });
    }

    for (const width of mobile ? [375, 320] : [1440, 375, 320]) {
      // CDP touch injection is Chromium-only. Other engines exercise native
      // range dragging through Playwright mouse input, not synthetic DOM events,
      // fill(), or a tap falsely described as a held touch gesture.
      for (const mode of engine === 'chromium' && width < 1440 ? ['pointer', 'touch'] : ['pointer']) {
        test(`WizFix comparison ${mode} drag reveals both images at ${width}px under ${base}`,
          { timeout: 45_000 }, async () => {
            const page = await getBrowser().newPage(pageOptions(width, engine === 'chromium' && width < 1440));
            let session;
            try {
              const { slider, frame } = await openComparison(page,
                deployments.find((deployment) => deployment.base === base), checkVisibleCapture);
              await checkReveal(frame, 50);
              const box = await slider.boundingBox();
              assert.ok(box && box.width > 200 && box.height > 100, 'Native range drag target collapsed');
              const y = box.y + box.height / 2;
              const x = (fraction) => box.x + box.width * fraction;
              if (mode === 'pointer') {
                await page.mouse.move(x(0.5), y);
                await page.mouse.down();
              } else {
                session = await page.context().newCDPSession(page);
                await session.send('Input.dispatchTouchEvent', {
                  type: 'touchStart', touchPoints: [{ x: x(0.5), y }],
                });
              }
              // Keep the contact held while moving in both directions; a tap or
              // programmatic range fill cannot satisfy this drag coverage.
              for (const target of [0.25, 0.75]) {
                if (mode === 'pointer') await page.mouse.move(x(target), y, { steps: 12 });
                else {
                  const start = target === 0.25 ? 0.5 : 0.25;
                  for (let step = 1; step <= 12; step++) {
                    await session.send('Input.dispatchTouchEvent', {
                      type: 'touchMove',
                      touchPoints: [{ x: x(start + (target - start) * step / 12), y }],
                    });
                  }
                }
                const value = Number(await slider.inputValue());
                assert.ok(Math.abs(value - target * 100) <= 4,
                  `${mode} drag did not track the finger/pointer: ${value}`);
                await checkReveal(frame, value);
              }
              if (mode === 'pointer') await page.mouse.up();
              else await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
              await checkReveal(frame, Number(await slider.inputValue()));
            } finally {
              await session?.detach();
              await page.close();
            }
          });
      }
    }
  }

  test('WizFix reveal guard rejects a moving slider with frozen artwork or divider',
    { timeout: 45_000 }, async () => {
      const page = await getBrowser().newPage(pageOptions(375));
      try {
        const { slider, frame } = await openComparison(page, deployments[0], checkVisibleCapture);
        await slider.focus();
        await page.keyboard.press('Home');
        await checkReveal(frame, 0);
        // Freeze only the after layer, without changing the range or divider.
        await frame.locator('[style*="clip-path"]').evaluate((element) => {
          element.style.clipPath = 'inset(0 0 0 50%)';
        });
        await assert.rejects(checkReveal(frame, 0), /Wrong image exposed on the left/);
        await frame.locator('[style*="clip-path"]').evaluate((element) => {
          element.style.clipPath = 'inset(0 0 0 0%)';
        });
        await frame.locator('.ba-divider').evaluate((element) => { element.style.left = '50%'; });
        await assert.rejects(checkReveal(frame, 0), /Divider detached from reveal/);
      } finally { await page.close(); }
    });
}
