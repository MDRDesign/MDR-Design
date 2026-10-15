import assert from 'node:assert/strict';
import { before, after, test } from 'node:test';
import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright-core';
import { build, preview } from 'vite';

const root = fileURLToPath(new URL('../', import.meta.url));
let browser;
let server;
let origin;

before(async () => {
  const previous = { PORT: process.env.PORT, BASE_PATH: process.env.BASE_PATH };
  try {
    process.env.PORT = '5173';
    process.env.BASE_PATH = '/';
    const outDir = resolve(root, '../../generated-artifacts/hero-motion');
    await build({
      root, configFile: resolve(root, 'vite.config.ts'), mode: 'production',
      logLevel: 'warn', build: { outDir },
    });
    server = await preview({
      root, configFile: resolve(root, 'vite.config.ts'), build: { outDir },
      preview: { host: '127.0.0.1', port: 0, strictPort: false, open: false },
      logLevel: 'warn',
    });
    origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
  let executablePath = process.env.CHROMIUM_PATH;
  if (!executablePath) {
    for (const command of ['chromium', 'chromium-browser', 'google-chrome']) {
      try {
        executablePath = execFileSync('which', [command], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
        break;
      } catch { /* Try the next installed browser. */ }
    }
  }
  executablePath ??= chromium.executablePath();
  await access(executablePath, constants.X_OK).catch(() => {
    throw new Error('Chromium is required. Set CHROMIUM_PATH or run pnpm exec playwright-core install chromium.');
  });
  browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
}, { timeout: 120_000 });

after(async () => {
  await browser?.close();
  if (server) await new Promise((done, reject) =>
    server.httpServer.close((error) => error ? reject(error) : done()));
});

const color = '.hero-identity-color';
const lines = '.hero-identity-pattern g';

async function openHome(width, reducedMotion = 'no-preference') {
  const page = await browser.newPage({ viewport: { width, height: 1100 }, reducedMotion });
  page.on('pageerror', (error) => page.errors.push(error.message));
  page.errors = [];
  await page.goto(origin, { waitUntil: 'networkidle' });
  await page.getByTestId('hero-monogram').scrollIntoViewIfNeeded();
  return page;
}

async function state(page, running, reduced = false) {
  await page.waitForFunction(({ running, reduced, color, lines }) => {
    const root = document.querySelector('[data-testid="hero-monogram"]');
    return root?.dataset.running === String(running) && [color, lines].every((selector) => {
      const style = getComputedStyle(document.querySelector(selector));
      return reduced ? style.animationName === 'none' :
        style.animationPlayState === (running ? 'running' : 'paused');
    });
  }, { running, reduced, color, lines });
}

async function sample(page) {
  return page.evaluate(({ color, lines }) => [color, lines].map((selector) => {
    const el = document.querySelector(selector);
    const style = getComputedStyle(el);
    return {
      time: el.getAnimations()[0]?.currentTime,
      color: style.backgroundColor,
      transform: style.transform,
    };
  }), { color, lines });
}

async function advances(page, running) {
  // CSS pause changes settle on an animation frame. Sample only after the
  // pending pause task, and avoid the rounded color plateau at the eased start.
  await page.evaluate(async ({ running, color, lines }) => {
    const animations = [color, lines].map((selector) =>
      document.querySelector(selector).getAnimations()[0]);
    await Promise.all(animations.map((animation) => animation.ready));
    if (running) for (const animation of animations) animation.currentTime = 3000;
    await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
  }, { running, color, lines });
  const before = await sample(page);
  await page.waitForTimeout(180);
  const after = await sample(page);
  for (let i = 0; i < 2; i++) {
    assert.equal(typeof before[i].time, 'number', 'CSS animation is missing');
    if (running) assert.ok(after[i].time > before[i].time + 40, `Animation ${i} did not advance`);
    else assert.deepEqual(after[i], before[i], `Animation ${i} changed while paused`);
  }
  if (running) {
    assert.notEqual(after[0].color, before[0].color, 'Fill color did not change');
    assert.notEqual(after[1].transform, before[1].transform, 'Internal lines did not move');
  }
}

async function toggle(page, paused) {
  const button = page.getByTestId('button-hero-motion');
  assert.equal(await button.getAttribute('aria-label'),
    paused ? 'Pause hero animation' : 'Resume hero animation');
  // Keyboard activation verifies the actual accessible control, not React state.
  await button.focus();
  await button.press('Space');
  assert.equal(await button.getAttribute('data-paused'), String(paused));
  assert.equal(await button.textContent(), paused ? 'Resume motion' : 'Pause motion');
  assert.equal(await button.getAttribute('aria-label'),
    paused ? 'Resume hero animation' : 'Pause hero animation');
  await page.getByTestId('hero-monogram').scrollIntoViewIfNeeded();
}

async function visibility(page, hidden) {
  // Headless tabs do not reliably become backgrounded. Drive the browser's
  // visibility event contract explicitly; do not fake animation/React state.
  await page.evaluate((hidden) => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
    Object.defineProperty(document, 'visibilityState', {
      configurable: true, get: () => hidden ? 'hidden' : 'visible',
    });
    document.dispatchEvent(new Event('visibilitychange'));
  }, hidden);
}

for (const width of [1440, 375]) {
  test(`pause/resume, intersection and tab visibility gate BOTH animations at ${width}px`,
    { timeout: 45_000 }, async () => {
      const page = await openHome(width);
      try {
        await state(page, true);
        await advances(page, true);
        await toggle(page, true);
        await state(page, false);
        await advances(page, false);
        await toggle(page, false);
        await state(page, true);
        await advances(page, true);

        // Real scrolling exercises IntersectionObserver, not a mocked hook.
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await state(page, false);
        await advances(page, false);
        await page.getByTestId('hero-monogram').scrollIntoViewIfNeeded();
        await state(page, true);

        await visibility(page, true);
        await state(page, false);
        await advances(page, false);
        await visibility(page, false);
        await state(page, true);
        await advances(page, true);

        // Returning to the viewport/tab must not override a user's pause.
        await toggle(page, true);
        await visibility(page, true);
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await visibility(page, false);
        await page.getByTestId('hero-monogram').scrollIntoViewIfNeeded();
        await state(page, false);
        await advances(page, false);
        await toggle(page, false);
        await state(page, true);
        assert.deepEqual(page.errors, []);
      } finally { await page.close(); }
    });

  test(`initial and live reduced-motion preferences remove animation and pattern at ${width}px`,
    { timeout: 45_000 }, async () => {
      const page = await openHome(width, 'reduce');
      try {
        const assertReduced = async () => {
          await state(page, false, true);
          assert.equal(await page.getByTestId('button-hero-motion').count(), 0);
          assert.equal(await page.locator('.hero-identity-pattern').evaluate((el) =>
            getComputedStyle(el).display), 'none');
          assert.deepEqual(await page.locator('.hero-identity-motion').evaluate((el) =>
            el.getAnimations({ subtree: true }).length), 0);
        };
        await assertReduced();
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await state(page, true);
        assert.notEqual(await page.locator('.hero-identity-pattern').evaluate((el) =>
          getComputedStyle(el).display), 'none');
        await advances(page, true);
        await toggle(page, true);
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await assertReduced();
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await state(page, false);
        assert.equal(await page.getByTestId('button-hero-motion').getAttribute('data-paused'), 'true');
        await toggle(page, false);
        await state(page, true);
        // Enter reduce while actively running as well as while manually paused.
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await assertReduced();
        assert.deepEqual(page.errors, []);
      } finally { await page.close(); }
    });
}

for (const width of [1440, 375, 320]) {
  test(`approved outlined D-in-front lockup remains static and legible at ${width}px`,
    { timeout: 45_000 }, async () => {
      const page = await openHome(width);
      try {
        await state(page, true);
        assert.equal(await page.getByRole('img', {
          name: 'MDR Design — Layered Monoline monogram', exact: true,
        }).count(), 1);
        const compact = width <= 480;
        const image = page.locator(compact ? '.hero-identity-compact' : '.hero-identity-standard');
        const hidden = page.locator(compact ? '.hero-identity-standard' : '.hero-identity-compact');
        assert.equal(await hidden.isVisible(), false);
        await image.evaluate((el) => el.decode());
        const source = await image.getAttribute('src');
        const response = await page.request.get(new URL(source, origin).href);
        assert.equal(response.status(), 200);
        const master = await readFile(resolve(root,
          '../../branding/mdr-design/homepage/d-foreground',
          compact ? 'mdr-design-lockup-small-on-dark.svg' : 'mdr-design-lockup-on-dark.svg'));
        assert.ok(master.equals(await response.body()), 'Not the approved D-in-front SVG master');
        assert.doesNotMatch(master.toString(), /<(?:text|image)\b/, 'Identity must remain outlined vector artwork');
        const mask = await page.locator('.hero-identity-motion').evaluate((el) => getComputedStyle(el).maskImage);
        assert.ok(mask.includes(source), 'Motion mask differs from the visible approved master');

        const rect = await image.boundingBox();
        assert.ok(rect.width >= 160 && rect.height > 100, 'Lockup is too small or collapsed');
        assert.equal(await image.evaluate((el) => {
          for (let node = el; node instanceof Element; node = node.parentElement) {
            const style = getComputedStyle(node);
            if (style.visibility === 'hidden' || style.display === 'none' || Number(style.opacity) < .99) return false;
          }
          return true;
        }), true, 'Identity is hidden or faded');
        // The bottom 22% holds the outlined name. Compare actual pixels at
        // distinct animation phases and against the unoverlaid master.
        // Freeze the independently animated teal backdrop, not the monogram.
        await image.evaluate((el) => {
          for (const animation of el.closest('section').getAnimations()) animation.pause();
        });
        // Round inward so a fractional clipping edge cannot include animated
        // monogram pixels just above the name's region.
        const top = Math.ceil(rect.y + rect.height * .78) + 1;
        const clip = {
          x: Math.ceil(rect.x), y: top,
          width: Math.floor(rect.width) - 1, height: Math.floor(rect.y + rect.height) - top,
        };
        const phases = [];
        for (const time of [0, 6800, 13600]) {
          await page.locator('.hero-identity-motion').evaluate((el, time) => {
            for (const animation of el.getAnimations({ subtree: true })) {
              animation.pause();
              animation.currentTime = time;
            }
          }, time);
          phases.push(await page.screenshot({ clip, animations: 'allow' }));
        }
        assert.ok(phases[0].equals(phases[1]) && phases[0].equals(phases[2]),
          'Animation leaked into the outlined MDR Design name');
        await page.locator('.hero-identity-motion').evaluate((el) => { el.style.display = 'none'; });
        assert.ok(phases[0].equals(await page.screenshot({ clip })),
          'Motion overlay changes or obscures the outlined name');
        assert.deepEqual(page.errors, []);
      } finally { await page.close(); }
    });
}
