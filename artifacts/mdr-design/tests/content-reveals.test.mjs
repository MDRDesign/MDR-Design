import assert from 'node:assert/strict';
import { before, after, test } from 'node:test';
import { access } from 'node:fs/promises';
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
    const outDir = resolve(root, '../../generated-artifacts/content-reveals');
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
        executablePath = execFileSync('which', [command], {
          encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
        }).trim();
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

const routes = [
  {
    path: '/',
    sections: [
      { label: 'Approach', heading: 'The best brief', body: 'We start with a conversation' },
      { label: 'Belief', heading: 'Good local businesses', body: '— D.C., MDR Design' },
      { cta: 'link-cta-contact', heading: 'Have a business', body: 'Let’s talk' },
    ],
  },
  {
    path: '/work/armada-catering',
    sections: [
      { label: 'What I heard', heading: null, body: null },
      { label: 'What I built', heading: null, body: null },
      { cta: 'link-case-contact', heading: 'Planning a fresh', body: 'Let’s talk' },
    ],
  },
];

function sectionFor(page, spec) {
  return spec.cta
    ? page.locator('section').filter({ has: page.getByTestId(spec.cta) })
    : page.locator('section').filter({ has: page.locator('.label').filter({ hasText: spec.label }) });
}

// Playwright's isVisible() alone accepts opacity:0 and text translated outside
// overflow:hidden lines. Inspect text AND its ancestors, not just .is-in.
async function unreadable(section) {
  return section.evaluate((root) => {
    const targets = [...root.querySelectorAll('.line > span, p, h2, h3, blockquote, a')]
      .filter((el) => el.textContent.trim());
    if (!targets.length) return ['No text targets found'];
    const problems = [];
    for (const target of targets) {
      const text = target.textContent.trim().slice(0, 70);
      const box = target.getBoundingClientRect();
      if (box.width <= 0 || box.height <= 0) problems.push(`${text}: empty bounds`);
      for (let el = target; el; el = el.parentElement) {
        const style = getComputedStyle(el);
        if (style.display === 'none' || style.visibility !== 'visible' || Number(style.opacity) < 0.99) {
          problems.push(`${text}: hidden by ${el.tagName}.${el.className}`);
        }
        if (el.matches('.line > span, .fade') && style.transform !== 'none') {
          const m = new DOMMatrixReadOnly(style.transform);
          if (!m.isIdentity) problems.push(`${text}: reveal still transformed (${style.transform})`);
        }
        if (style.clipPath !== 'none' && style.clipPath !== 'inset(0px 0px 0px)') {
          problems.push(`${text}: clipped (${style.clipPath})`);
        }
      }
    }
    return problems;
  });
}

async function readable(section, message) {
  // Poll real computed styles through the longest staggered CSS transition.
  const deadline = Date.now() + 6000;
  let problems;
  do {
    problems = await unreadable(section);
    if (!problems.length) return;
    await new Promise((done) => setTimeout(done, 60));
  } while (Date.now() < deadline);
  assert.deepEqual(problems, [], message);
}

async function frames(page) {
  await page.evaluate(() => new Promise((done) =>
    requestAnimationFrame(() => requestAnimationFrame(done))));
}

async function enter(section) {
  // Align the section's beginning, not its center: phone sections can be taller
  // than the viewport. Native scrolling and the real IntersectionObserver run.
  await section.evaluate((el) => window.scrollTo({
    top: el.getBoundingClientRect().top + window.scrollY - 100, behavior: 'instant',
  }));
  await section.page().waitForFunction((el) => el.classList.contains('is-in'), await section.elementHandle());
}

for (const viewport of [{ width: 1440, height: 1000 }, { width: 375, height: 812 }]) {
  for (const route of routes) {
    for (const mode of ['normal', 'initial reduced', 'live reduced']) {
      test(`${route.path} ${viewport.width}px: ${mode} content remains readable`, { timeout: 60_000 }, async () => {
        const page = await browser.newPage({
          viewport, reducedMotion: mode === 'initial reduced' ? 'reduce' : 'no-preference',
        });
        const errors = [];
        page.on('pageerror', (error) => errors.push(error.message));
        try {
          await page.goto(`${origin}${route.path}`, { waitUntil: 'networkidle' });
          const sections = route.sections.map((spec) => sectionFor(page, spec));
          for (const [i, section] of sections.entries()) {
            assert.equal(await section.count(), 1, `Unique section: ${JSON.stringify(route.sections[i])}`);
            assert.equal(await section.evaluate((el) => el.classList.contains('is-in')), false,
              'Fixture must start below the fold, before observer activation');
            assert.ok(await section.locator('.fade').count(), 'Exercise faded body/container text');
            if (i !== 1 || route.path === '/') {
              assert.ok(await section.locator('.line > span').count(), 'Exercise clipped line text');
            }
            const spec = route.sections[i];
            if (spec.heading) assert.ok((await section.textContent()).includes(spec.heading));
            if (spec.body) assert.ok((await section.textContent()).includes(spec.body));
          }

          if (mode === 'normal' || mode === 'live reduced') {
            for (const section of sections) {
              assert.ok((await unreadable(section)).length > 0, 'Unseen normal-motion reveal starts hidden');
            }
          }
          if (mode === 'live reduced') {
            await page.emulateMedia({ reducedMotion: 'reduce' });
            await frames(page);
          }
          if (mode !== 'normal') {
            // Check before scrolling: reduced-motion CSS must reveal untouched
            // content without depending on observer state.
            for (const section of sections) {
              assert.deepEqual(await unreadable(section), [], 'Reduced motion exposes unvisited content immediately');
            }
          }

          for (const section of sections) {
            await enter(section);
            await readable(section, 'Heading and body must reveal after scrolling');
            // Read actual heading/body positions even in tall phone sections.
            for (const selector of ['.line > span, h3', '.fade p, p.fade, .fade a']) {
              const text = section.locator(selector).first();
              if (await text.count()) {
                await text.scrollIntoViewIfNeeded();
                assert.ok(await text.evaluate((el) => {
                  const b = el.getBoundingClientRect();
                  return b.bottom > 0 && b.top < innerHeight && b.right > 0 && b.left < innerWidth;
                }), 'Reading target reaches the viewport');
              }
            }
            await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
            await frames(page);
            assert.equal(await section.evaluate((el) => el.getBoundingClientRect().top >= innerHeight), true,
              'Scroll-away must really leave the viewport');
            assert.equal(await section.evaluate((el) => el.classList.contains('is-in')), true,
              'One-time reveal retains observer state offscreen');
            assert.deepEqual(await unreadable(section), [], 'One-time content must not hide offscreen');
            await enter(section);
            // No polling here: a reveal that restarts on re-entry must fail.
            assert.deepEqual(await unreadable(section), [], 'No replay/hiding on return');
          }

          if (mode === 'live reduced') {
            // Also switch while content is already revealed, then restore the
            // original preference. Neither change may hide visited content.
            await page.emulateMedia({ reducedMotion: 'no-preference' });
            await frames(page);
            for (const section of sections) assert.deepEqual(await unreadable(section), []);
            await page.emulateMedia({ reducedMotion: 'reduce' });
            await frames(page);
            for (const section of sections) assert.deepEqual(await unreadable(section), []);
          }
          assert.deepEqual(errors, [], 'No browser runtime errors');
        } finally {
          await page.close();
        }
      });
    }
  }
}

test('readability guard rejects hidden, translated and clipped text ancestors', async () => {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  try {
    await page.goto(origin, { waitUntil: 'networkidle' });
    const section = sectionFor(page, routes[0].sections[0]);
    assert.deepEqual(await unreadable(section), []);
    for (const [selector, style] of [
      ['.fade', 'opacity: 0 !important'],
      ['.line > span', 'transform: translateY(105%) !important'],
      ['.fade', 'clip-path: inset(0 0 100% 0) !important'],
    ]) {
      const node = section.locator(selector).first();
      const original = await node.getAttribute('style');
      await node.evaluate((el, style) => { el.style.cssText = style; }, style);
      assert.ok((await unreadable(section)).length > 0, `Guard must reject ${style}`);
      await node.evaluate((el, original) => {
        if (original === null) el.removeAttribute('style');
        else el.setAttribute('style', original);
      }, original);
      assert.deepEqual(await unreadable(section), []);
    }
  } finally {
    await page.close();
  }
});
