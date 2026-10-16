import assert from 'node:assert/strict';
import { before, after, test } from 'node:test';
import { writeFile } from 'node:fs/promises';
import { startSiteBrowser, safeContext, evidenceDir } from './helpers/site-browser.mjs';

let runtime;
before(async () => { runtime = await startSiteBrowser(); }, { timeout: 120_000 });
after(async () => { await runtime?.close(); });
const routes = ['/', '/services', '/process', '/contact', '/work/armada-catering',
  '/work/captains-galley', '/work/z-delivery', '/missing-page'];
const go = (page, path) => page.goto(runtime.origin + path);
const tick = (page) => page.waitForTimeout(100);
async function focused(locator) {
  await locator.page().waitForFunction((e) => e === document.activeElement, await locator.elementHandle(), { timeout: 2000 });
  assert.ok(await locator.evaluate((e) => e === document.activeElement), 'Expected keyboard focus');
}
async function fillInquiry(page) {
  for (const [key, value] of Object.entries({
    name: 'Review Fixture', business: 'Fictional Review Studio', email: 'review@example.invalid',
    message: 'An isolated browser fixture. Never deliver this inquiry.',
  })) await page.getByTestId(`input-${key}`).fill(value);
  await page.getByTestId('radio-need-2').locator('..').click();
  await page.getByTestId('select-budget').selectOption({ index: 1 });
  await page.getByTestId('select-timeline').selectOption({ index: 1 });
}

for (const width of [1440, 768, 375, 320]) {
  test(`Public pages: loaded imagery, text reflow and reduced motion at ${width}px`,
    { timeout: 120_000 }, async () => {
      const context = await safeContext(runtime.browser, { viewport: { width, height: 900 } });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      try {
        for (const path of routes) {
          await go(page, path);
          await page.locator('main h1').waitFor();
          await page.evaluate(() => document.fonts.ready);
          for (const section of await page.locator('main section, main article > header').all()) {
            await section.scrollIntoViewIfNeeded();
          }
          for (const image of await page.locator('main img').all()) {
            const src = await image.getAttribute('src');
            // Homepage logo masters and inactive projects have separate suites.
            if (!/\/(media|api)\//.test(src) || !(await image.isVisible()) ||
                await image.evaluate((e) => !!e.closest('[aria-hidden="true"]'))) continue;
            if (src.includes('/api/') && !process.env.REVIEW_URL) continue;
            await image.scrollIntoViewIfNeeded();
            await image.evaluate((e) => e.decode());
            assert.ok(await image.evaluate((e) => e.naturalWidth > 0 && e.alt.trim().length > 0), src);
          }
          for (const scale of [1, 2]) {
            await page.evaluate((scale) => document.documentElement.style.fontSize = `${scale * 100}%`, scale);
            await page.evaluate(() => document.fonts.ready);
            await tick(page);
            const problems = await page.evaluate(() => {
              return [...document.querySelectorAll('header.chrome-ink > div:first-of-type a, header.chrome-ink > div:first-of-type button, main h1, main h2, main h3, main p, main dd, main a, footer a, footer p')]
                .filter((e) => !e.closest('[aria-hidden="true"]'))
                .filter((e) => {
                  const r = e.getBoundingClientRect();
                  return r.width && (r.right > innerWidth + 2 || r.left < -2 || e.scrollWidth > e.clientWidth + 3);
                }).map((e) => e.textContent.trim().slice(0, 80));
            });
            assert.deepEqual(problems, [], `${path}, ${width}px, ${scale * 100}% text`);
            assert.ok(await page.locator('main h1').evaluate((e) => {
              for (let node = e; node; node = node.parentElement) {
                const s = getComputedStyle(node);
                if (s.visibility === 'hidden' || Number(s.opacity) === 0) return false;
              }
              return true;
            }));
            if (process.env.REVIEW_EVIDENCE) {
              await page.screenshot({ path: `${evidenceDir}/after-${width}-${scale}-${path.replaceAll('/', '_')}.png`, fullPage: true });
            }
          }
          await page.evaluate(() => document.documentElement.style.fontSize = '');
        }
        assert.deepEqual(errors, []);
      } finally { await context.close(); }
    });
}

test('Desktop and phone menus, focus trap, Escape, resize and Work history', async () => {
  const context = await safeContext(runtime.browser, { viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  try {
    await go(page, '/services');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await focused(page.locator('#main'));
    await page.getByTestId('button-menu-open').click();
    await focused(page.getByTestId('link-mobile-home'));
    await page.keyboard.press('Shift+Tab');
    await focused(page.getByTestId('link-mobile-contact'));
    await page.keyboard.press('Tab');
    await focused(page.getByTestId('link-mobile-home'));
    await page.keyboard.press('Escape');
    await focused(page.getByTestId('button-menu-open'));
    assert.equal(await page.evaluate(() => document.body.style.overflow), '');
    await page.getByTestId('button-menu-open').click();
    await page.getByTestId('link-mobile-process').click();
    assert.ok(page.url().endsWith('/process'));
    assert.equal(await page.getByTestId('button-menu-open').getAttribute('aria-expanded'), 'false');
    await page.getByTestId('button-menu-open').click();
    await page.setViewportSize({ width: 1024, height: 900 });
    await tick(page);
    assert.equal(await page.evaluate(() => document.body.style.overflow), '', 'Resize must release scroll lock');
    await page.getByTestId('link-nav-work').click();
    await tick(page);
    assert.ok(page.url().endsWith('/#work'), 'Work destination must be bookmarkable');
    assert.ok(Math.abs(await page.locator('#work').evaluate((e) => e.getBoundingClientRect().top)) < 3);
    await page.goBack();
    assert.ok(page.url().endsWith('/process'));
    await page.goForward();
    assert.ok(page.url().endsWith('/#work'));
    await page.getByTestId('link-nav-contact').click();
    await page.getByTestId('link-nav-services').click();
    assert.ok(page.url().endsWith('/services'));
    await page.getByTestId('link-nav-process').click();
    await page.getByTestId('link-footer-work').click();
    assert.ok(page.url().endsWith('/#work'));
    await page.setViewportSize({ width: 320, height: 700 });
    await page.getByTestId('button-menu-open').click();
    await page.getByTestId('link-mobile-services').click();
    await page.getByTestId('button-menu-open').click();
    await page.getByTestId('link-mobile-contact').click();
    assert.ok(page.url().endsWith('/contact'));
    await page.getByTestId('button-menu-open').click();
    await page.getByTestId('button-menu-close').click();
    await focused(page.getByTestId('button-menu-open'));
    await page.getByTestId('button-menu-open').click();
    await page.getByTestId('link-mobile-work').click();
    await tick(page);
    assert.ok(page.url().endsWith('/#work'));
    assert.ok(Math.abs(await page.locator('#work').evaluate((e) => e.getBoundingClientRect().top)) < 3);
  } finally { await context.close(); }
});

test('Service and project inquiry presets, case entry, back-to-work and 404 recovery', async () => {
  const context = await safeContext(runtime.browser);
  const page = await context.newPage();
  try {
    for (const [id, expected] of [
      ['link-inquire-0', 'Brand Starter'], ['link-inquire-1', 'Website'],
      ['link-inquire-2', 'Business App'], ['link-inquire-bundle', 'Brand + Website'],
    ]) {
      await go(page, '/services');
      await page.getByTestId(id).click();
      assert.equal(await page.locator('input[name=need]:checked').inputValue(), expected);
    }
    for (const slug of ['armada-catering', 'captains-galley', 'z-delivery']) {
      await go(page, '/#work');
      await page.getByTestId(`link-index-case-${slug}`).click();
      assert.ok(page.url().endsWith(`/work/${slug}`));
      await page.getByTestId('link-case-contact').click();
      assert.equal(await page.locator('input[name=need]:checked').inputValue(),
        slug === 'armada-catering' ? 'Brand + Website' : 'Business App');
      await page.goBack();
      await page.getByTestId('link-back-work').click();
      await tick(page);
      assert.ok(Math.abs(await page.locator('#work').evaluate((e) => e.getBoundingClientRect().top)) < 3);
    }
    await go(page, '/process');
    await page.getByTestId('link-process-contact').click();
    assert.ok(page.url().endsWith('/contact'));
    await go(page, '/contact?need=invalid');
    assert.equal(await page.locator('input[name=need]:checked').count(), 0);
    await go(page, '/missing-page');
    await page.getByTestId('link-404-home').click();
    assert.equal(new URL(page.url()).pathname, '/');
  } finally { await context.close(); }
});

test('Phone touch menu stays reachable at 200% text in a short viewport', async () => {
  const context = await safeContext(runtime.browser, { viewport: { width: 320, height: 568 }, hasTouch: true });
  const page = await context.newPage();
  try {
    await go(page, '/contact');
    await page.evaluate(() => document.documentElement.style.fontSize = '200%');
    const open = page.getByTestId('button-menu-open');
    const wordmark = page.getByTestId('link-home');
    const a = await open.boundingBox(), b = await wordmark.boundingBox();
    assert.ok(a.x >= b.x + b.width || a.y >= b.y + b.height, 'Header controls overlap');
    assert.ok(a.x + a.width <= 320, 'Menu must stay inside viewport');
    await open.tap();
    await focused(page.getByTestId('link-mobile-home'));
    const panel = page.locator('#mobile-menu');
    assert.equal(await panel.evaluate((e) => getComputedStyle(e).overflowY), 'auto');
    await page.getByTestId('link-mobile-contact').scrollIntoViewIfNeeded();
    const link = await page.getByTestId('link-mobile-contact').boundingBox();
    assert.ok(link.y >= 0 && link.y + link.height <= 568, 'Last menu item must be reachable');
    await page.getByTestId('link-mobile-contact').tap();
    assert.equal(await open.getAttribute('aria-expanded'), 'false');
    await open.tap();
    await page.getByTestId('link-mobile-home').tap();
    assert.equal(await open.getAttribute('aria-expanded'), 'false');
    assert.equal(new URL(page.url()).pathname, '/');
    if (process.env.REVIEW_EVIDENCE) await page.screenshot({ path: `${evidenceDir}/menu-enlarged-after.png` });
  } finally { await context.close(); }
});

test('Remaining page reveals are readable after real scrolling in normal motion', { timeout: 120_000 }, async () => {
  for (const width of [1440, 375]) {
    const context = await safeContext(runtime.browser, { viewport: { width, height: 900 }, reducedMotion: 'no-preference' });
    const page = await context.newPage();
    try {
      // Home and Armada scroll reveals are already covered by test:reveals.
      for (const path of routes.filter((p) => p !== '/' && p !== '/work/armada-catering')) {
        await go(page, path);
        for (const section of await page.locator('main > header, main > section:not([aria-label=Timeline]), main article > header, main article > section, main section[aria-label=Timeline] > ol > li').all()) {
          await section.scrollIntoViewIfNeeded();
          await page.waitForFunction((element) => [...element.querySelectorAll('.line > span, .fade')].every((e) => {
            const style = getComputedStyle(e);
            return Number(style.opacity) >= .99 && (style.transform === 'none' || new DOMMatrixReadOnly(style.transform).isIdentity);
          }), await section.elementHandle(), { timeout: 5000 });
        }
      }
    } finally { await context.close(); }
  }
});

test('Required feedback, keyboard radio/select use and success focus', async () => {
  const context = await safeContext(runtime.browser);
  let sent = 0;
  await context.route('**/api/inquiries', async (route) => {
    sent++;
    await route.fulfill({ status: 201, json: { message: 'Isolated review received. — D.C.' } });
  });
  const page = await context.newPage();
  try {
    await go(page, '/contact');
    await page.getByTestId('button-submit').click();
    await focused(page.getByTestId('input-name'));
    assert.equal(sent, 0);
    assert.equal(await page.locator('form [role=alert]').count(), 7);
    assert.equal(await page.getByTestId('input-name').getAttribute('aria-required'), 'true');
    assert.equal(await page.getByTestId('radio-need-0').getAttribute('aria-invalid'), 'true');
    await page.getByTestId('input-email').fill('invalid');
    await page.getByTestId('button-submit').click();
    assert.equal(await page.getByTestId('input-email').getAttribute('aria-invalid'), 'true');
    await page.getByTestId('radio-need-0').focus();
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.getByTestId('radio-need-1').isChecked(), true);
    const ring = await page.locator('input[name=need]:checked + span').evaluate((e) => getComputedStyle(e).outlineStyle);
    assert.notEqual(ring, 'none');
    await page.getByTestId('select-budget').focus();
    await page.keyboard.press('ArrowDown');
    assert.notEqual(await page.getByTestId('select-budget').inputValue(), '');
    await page.getByTestId('select-timeline').focus();
    await page.keyboard.press('ArrowDown');
    assert.notEqual(await page.getByTestId('select-timeline').inputValue(), '');
    await fillInquiry(page);
    await page.getByTestId('button-submit').click();
    await page.getByTestId('text-success').waitFor();
    assert.equal(sent, 1);
    await focused(page.locator('main h1'));
  } finally { await context.close(); }
});

test('Backend-served Galley customization image decodes', {
  skip: !process.env.REVIEW_URL && 'Requires REVIEW_URL pointing to managed web/API services; static preview has no App Storage route',
}, async () => {
  const context = await safeContext(runtime.browser);
  try {
    const page = await context.newPage();
    await go(page, '/work/captains-galley');
    await page.getByTestId('img-galley-mobile-2').evaluate((e) => e.decode());
  } finally { await context.close(); }
});

test('Pending sends, server rejection, offline error, preserved data and retry are isolated', async () => {
  const context = await safeContext(runtime.browser, { viewport: { width: 320, height: 900 } });
  let sent = 0;
  let release;
  let pendingRequest;
  const requestSeen = new Promise((done) => { pendingRequest = done; });
  const gate = new Promise((done) => { release = done; });
  const payloads = [];
  await context.route('**/api/inquiries', async (route) => {
    sent++;
    payloads.push(route.request().postDataJSON());
    if (sent === 1) {
      pendingRequest();
      await gate;
      return route.fulfill({ status: 503, json: { error: 'Fixture temporarily unavailable. Retry.' } });
    }
    if (sent === 2) return route.abort('failed');
    return route.fulfill({ status: 201, json: { message: 'Isolated retry received. — D.C.' } });
  });
  const page = await context.newPage();
  try {
    await go(page, '/contact?need=Website&source=review-fixture');
    await fillInquiry(page);
    await page.getByTestId('button-submit').click();
    await requestSeen;
    assert.equal(await page.getByTestId('button-submit').isDisabled(), true);
    assert.match(await page.getByTestId('button-submit').textContent(), /Sending/);
    await page.getByTestId('input-name').focus();
    await page.keyboard.press('Enter');
    assert.equal(sent, 1, 'Enter while pending must not duplicate a send');
    release();
    await page.getByTestId('text-error').waitFor();
    assert.equal(await page.getByTestId('text-error').textContent(), 'Fixture temporarily unavailable. Retry.');
    assert.equal(await page.getByTestId('input-name').inputValue(), 'Review Fixture');
    await page.getByTestId('button-submit').click();
    await page.waitForFunction(() => document.querySelector('[data-testid=text-error]')?.textContent.includes('Something went wrong'));
    assert.equal(await page.getByTestId('input-message').inputValue(), payloads[0].message);
    await page.getByTestId('button-submit').click();
    await page.getByTestId('text-success').waitFor();
    assert.equal(sent, 3);
    assert.deepEqual(payloads[0], payloads[2]);
    assert.equal(payloads[0].source, 'review-fixture');
    await writeFile(`${evidenceDir}/inquiry-isolation.json`, JSON.stringify({
      intercepted: sent, persisted: 0, emails: 0, scenarios: ['503', 'network failure', '201 retry'],
    }, null, 2));
  } finally { release(); await context.close(); }
});
