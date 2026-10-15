import assert from 'node:assert/strict';
import { test } from 'node:test';

const label = 'Compare the former and published WizFix websites';

async function openComparison(page, deployment, checkVisibleCapture) {
  await page.goto(deployment.origin + deployment.base + 'work/wizfix', { waitUntil: 'networkidle' });
  const slider = page.getByRole('slider', { name: label, exact: true });
  assert.equal(await slider.count(), 1, 'Comparison needs a unique accessible slider name');
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
}

async function tabToSlider(page, slider) {
  for (let step = 0; step < 80; step++) {
    await page.keyboard.press('Tab');
    if (await slider.evaluate((element) => element === document.activeElement)) return;
  }
  assert.fail('Comparison slider is not reachable through keyboard navigation');
}

export function registerComparisonTests({ getBrowser, deployments, checkVisibleCapture }) {
  // Reuse the suite's root and nested production builds.
  for (const base of ['/portfolio-regression/', '/']) {
    for (const width of [1440, 375, 320]) {
      test(`WizFix comparison keyboard, focus and reveal at ${width}px under ${base}`,
        { timeout: 45_000 }, async () => {
          const page = await getBrowser().newPage({ viewport: { width, height: 900 } });
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

    for (const width of [375, 320]) {
      for (const mode of ['pointer', 'touch']) {
        test(`WizFix comparison ${mode} drag reveals both images at ${width}px under ${base}`,
          { timeout: 45_000 }, async () => {
            const page = await getBrowser().newPage({
              viewport: { width, height: 900 }, isMobile: true, hasTouch: true,
            });
            let session;
            try {
              const { slider, frame } = await openComparison(page,
                deployments.find((deployment) => deployment.base === base), checkVisibleCapture);
              await checkReveal(frame, 50);
              const box = await slider.boundingBox();
              assert.ok(box && box.width > 200 && box.height > 100, 'Mobile drag target collapsed');
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
      const page = await getBrowser().newPage({ viewport: { width: 375, height: 900 } });
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
