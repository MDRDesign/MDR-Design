import assert from 'node:assert/strict';
import { before, after, test } from 'node:test';
import { access, readdir, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright-core';
import { build, preview } from 'vite';

const root = fileURLToPath(new URL('../', import.meta.url));
const base = '/portfolio-regression/';
const expectedAssets = [
  'wizfix-before.webp', 'wizfix-desktop.webp', 'wizfix-desktop-960.webp',
  'wizfix-detail.webp', 'wizfix-mobile.webp',
];
const note = "Joey — here's the redesign direction for WizFix, all in one place. Repair, IT and printing, presented as the established tech business you already are. Take a look, share it with anyone whose opinion matters, and let me know when you're ready to move forward. — Danielle";
let server;
let browser;
let origin;

// Build once into ignored output; no running workflow or network services required.
before(async () => {
  process.env.PORT = '5173';
  process.env.BASE_PATH = base;
  await build({
    root,
    configFile: resolve(root, 'vite.config.ts'),
    mode: 'production',
    logLevel: 'warn',
    build: { outDir: resolve(root, '../../generated-artifacts/wizfix-regression') },
  });
  server = await preview({
    root,
    configFile: resolve(root, 'vite.config.ts'),
    build: { outDir: resolve(root, '../../generated-artifacts/wizfix-regression') },
    preview: { host: '127.0.0.1', port: 0, strictPort: false, open: false },
    logLevel: 'warn',
  });
  origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  let executablePath = process.env.CHROMIUM_PATH;
  if (!executablePath) {
    for (const command of ['chromium', 'chromium-browser', 'google-chrome']) {
      try {
        executablePath = execFileSync('which', [command], { encoding: 'utf8' }).trim();
        break;
      } catch { /* Try the next browser name, then Playwright's installed browser. */ }
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
  if (server) await new Promise((resolveClose, reject) =>
    server.httpServer.close((error) => error ? reject(error) : resolveClose()));
});

test('all WizFix WebPs exist, resolve as images, and decode (not SPA fallback HTML)', async () => {
  const files = (await readdir(resolve(root, 'public/media'))).filter((name) => /^wizfix-.*\.webp$/.test(name));
  for (const name of expectedAssets) assert.ok(files.includes(name), `Missing ${name}`);
  const page = await browser.newPage();
  try {
    await page.goto(origin + base);
    for (const name of files) {
      const bytes = await readFile(resolve(root, 'public/media', name));
      assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', `${name}: not WebP`);
      assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', `${name}: not WebP`);
      const response = await page.request.get(origin + base + 'media/' + name);
      assert.equal(response.status(), 200, name);
      assert.match(response.headers()['content-type'], /^image\/webp\b/, `${name}: served as non-image`);
      assert.ok(bytes.equals(await response.body()), `${name}: wrong served file`);
      const size = await page.evaluate(async (url) => {
        const image = new Image();
        image.src = url;
        await image.decode();
        return [image.naturalWidth, image.naturalHeight];
      }, origin + base + 'media/' + name);
      assert.ok(size[0] > 0 && size[1] > 0, `${name}: empty decoded image`);
    }
  } finally { await page.close(); }
});

async function checkVisibleCapture(locator) {
  await locator.scrollIntoViewIfNeeded();
  // Test real reveal styles, not just a successful request or a class name.
  await locator.page().waitForFunction((element) => {
    for (let node = element; node instanceof Element; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (Number(style.opacity) < 0.99 || style.visibility === 'hidden' ||
          style.display === 'none') return false;
      // The comparison intentionally clips its after layer; reveal wipes must finish.
      if (node.classList.contains('wipe') && style.clipPath !== 'none' &&
          !/^inset\(0(?:px|%)?(?: 0(?:px|%)?){0,3}\)$/.test(style.clipPath)) return false;
    }
    return true;
  }, await locator.elementHandle(), { timeout: 10_000 });
  if (await locator.evaluate((element) => element instanceof HTMLImageElement)) {
    await locator.evaluate((image) => image.decode());
  }
  const metrics = await locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const frame = element.closest('.frame').getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      width: rect.width, height: rect.height, frameWidth: frame.width, frameHeight: frame.height,
      onScreen: rect.right > 0 && rect.left < innerWidth && rect.bottom > 0 && rect.top < innerHeight,
      inFrame: rect.left >= frame.left - 1 && rect.right <= frame.right + 1 &&
        rect.top >= frame.top - 1 && rect.bottom <= frame.bottom + 1,
      objectFit: style.objectFit,
      image: element instanceof HTMLImageElement,
      loaded: !(element instanceof HTMLImageElement) || (element.complete && element.naturalWidth > 0),
    };
  });
  assert.ok(metrics.width > 20 && metrics.height > 20, `Capture collapsed: ${JSON.stringify(metrics)}`);
  assert.ok(metrics.frameWidth > 20 && metrics.frameHeight > 20, 'Frame collapsed');
  assert.ok(metrics.onScreen && metrics.inFrame && metrics.loaded, `Hidden/clipped capture: ${JSON.stringify(metrics)}`);
  if (metrics.image) assert.equal(metrics.objectFit, 'contain', 'Capture should not crop at phone widths');
}

for (const width of [1440, 375, 320]) {
  for (const [route, screenshots, devices] of [
    ['', 1, 0], ['work/wizfix', 4, 1], ['preview/wizfix', 1, 1],
  ]) {
    test(`/${route} preserves real WizFix visuals and content at ${width}px`, { timeout: 45_000 }, async () => {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const pageErrors = [];
      page.on('pageerror', (error) => pageErrors.push(error.message));
      try {
        await page.goto(origin + base + route, { waitUntil: 'networkidle' });
        const captures = page.locator('img[src*="media/wizfix-"]');
        assert.equal(await captures.count(), screenshots, 'Missing screenshot or concept fallback used');
        for (const image of await captures.all()) {
          await checkVisibleCapture(image);
          const source = await image.evaluate((element) => element.currentSrc);
          assert.ok(source.startsWith(origin + base + 'media/'), `Asset escaped artifact base: ${source}`);
        }
        const deviceFrames = page.locator('svg[aria-label="Published WizFix Computers website at desktop and phone screen sizes"]');
        assert.equal(await deviceFrames.count(), devices, 'Device captures missing');
        for (const frame of await deviceFrames.all()) {
          await checkVisibleCapture(frame);
          const images = frame.locator('image');
          assert.equal(await images.count(), 2, 'Desktop or phone SVG image missing');
          for (const name of ['wizfix-desktop.webp', 'wizfix-mobile.webp']) {
            const capture = frame.locator(`image[href$="${name}"]`);
            assert.equal(await capture.count(), 1, name);
            await checkVisibleCapture(capture);
            // SVG images lack naturalWidth: decode the exact href separately.
            await capture.evaluate(async (element) => {
              const image = new Image();
              image.src = element.href.baseVal;
              await image.decode();
            });
          }
        }
        // Authentic screenshots must never be labelled as concepts.
        assert.equal(await page.getByText(/concept/i).count(), 0);
        assert.equal(await page.locator('[aria-label*="Concept placeholder"]').count(), 0);
        assert.equal(await page.locator('[data-testid^="text-result-"]').count(), 0,
          'Unmeasured WizFix results must stay hidden');
        if (route === 'work/wizfix') {
          assert.equal(await page.locator('blockquote').count(), 0, 'Sample WizFix testimonials must stay hidden');
          assert.equal(await page.getByText('Before — former site', { exact: true }).count(), 1);
          assert.equal(await page.getByText('After — published site', { exact: true }).count(), 1);
        }
        if (route === 'preview/wizfix') {
          assert.equal(await page.getByTestId('text-preview-note').textContent(), note);
          assert.equal(await page.getByText('Unlisted project preview', { exact: true }).count(), 1);
        }
        assert.deepEqual(pageErrors, [], 'Browser runtime errors');
      } finally { await page.close(); }
    });
  }
}

test('unused illustrative artwork retains explicit concept labels', async () => {
  // These fallback drawings are not published screenshots or historical evidence.
  const art = await readFile(resolve(root, 'src/components/Art.tsx'), 'utf8');
  for (const label of [
    'Concept placeholder: refined WizFix Computers homepage direction',
    'Concept placeholder: generic cluttered starting point, not a real screenshot',
    'Concept placeholder: WizFix design shown on a laptop and a phone',
  ]) assert.ok(art.includes(`aria-label="${label}"`), `Illustrative artwork lost its label: ${label}`);
});
