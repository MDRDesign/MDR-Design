import assert from 'node:assert/strict';
import { before, after, test } from 'node:test';
import { access, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { tmpdir } from 'node:os';
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
const note = "Joey — here's the redesign direction for WizFix, all in one place. Repair, IT and printing, presented as the established tech business you already are. Take a look, share it with anyone whose opinion matters, and let me know when you're ready to move forward. — D.C.";
let browser;
let origin;
const deployments = [];

// Build both artifact bases into ignored output; no running workflow required.
before(async () => {
  const previousEnv = { PORT: process.env.PORT, BASE_PATH: process.env.BASE_PATH };
  try {
    process.env.PORT = '5173';
    for (const artifactBase of [base, '/']) {
      process.env.BASE_PATH = artifactBase;
      const outDir = resolve(root, '../../generated-artifacts/wizfix-regression',
        artifactBase === '/' ? 'root' : 'nested');
      await build({
        root,
        configFile: resolve(root, 'vite.config.ts'),
        mode: 'production',
        logLevel: 'warn',
        build: { outDir },
      });
      const instance = await preview({
        root,
        configFile: resolve(root, 'vite.config.ts'),
        build: { outDir },
        preview: { host: '127.0.0.1', port: 0, strictPort: false, open: false },
        logLevel: 'warn',
      });
      deployments.push({
        base: artifactBase,
        server: instance,
        origin: `http://127.0.0.1:${instance.httpServer.address().port}`,
      });
    }
  } finally {
    for (const [key, value] of Object.entries(previousEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
  ({ origin } = deployments[0]);
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
  for (const deployment of deployments) {
    await new Promise((resolveClose, reject) =>
      deployment.server.httpServer.close((error) => error ? reject(error) : resolveClose()));
  }
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

async function checkVisibleCapture(locator, expectedObjectFit = 'contain') {
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
  if (metrics.image) assert.equal(metrics.objectFit, expectedObjectFit, 'Capture changed its intended image fit');
}

async function checkWizfixDeviceImage(capture, deployment) {
  const source = await capture.evaluate((element) => new URL(element.href.baseVal, document.baseURI).href);
  assert.ok(source.startsWith(deployment.origin + deployment.base + 'media/'), `SVG asset escaped artifact base: ${source}`);
  await checkVisibleCapture(capture);
  // SVG images lack naturalWidth: decode the exact href separately.
  await capture.evaluate(async (element) => {
    const image = new Image();
    image.src = element.href.baseVal;
    await image.decode();
  });
}

for (const artifactBase of [base, '/']) {
  for (const [failure, options] of [
    ['missing response', { status: 404, contentType: 'text/plain', body: 'Not found' }],
    ['SPA fallback', { status: 200, contentType: 'text/html', body: '<html>Fallback</html>' }],
    // A plausible signature and MIME type must not substitute for decoding.
    ['corrupt WebP bytes', { status: 200, contentType: 'image/webp', body: 'RIFFxxxxWEBPbroken' }],
  ]) {
    for (const [kind, asset] of [
      ['screenshot', 'wizfix-before.webp'],
      ['device image', 'wizfix-mobile.webp'],
    ]) {
      test(`WizFix ${kind} guard rejects ${failure} under ${artifactBase}`,
        { timeout: 45_000 }, async () => {
          const deployment = deployments.find((entry) => entry.base === artifactBase);
          const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
          const imageUrl = deployment.origin + artifactBase + 'media/' + asset;
          let intercepted = 0;
          try {
            await page.route(imageUrl, async (route) => {
              intercepted++;
              await route.fulfill(options);
            });
            await page.goto(deployment.origin + artifactBase + 'work/wizfix',
              { waitUntil: 'networkidle' });
            const capture = kind === 'screenshot'
              ? page.locator(`img[src$="${asset}"]`)
              : page.locator(`svg image[href$="${asset}"]`);
            assert.equal(await capture.count(), 1, `${asset}: negative control target missing`);
            // APIRequestContext bypasses interception. A healthy public file
            // must not mask the broken image actually rendered by the browser.
            const response = await page.request.get(imageUrl);
            assert.equal(response.status(), 200, `${asset}: control source unavailable`);
            assert.match(response.headers()['content-type'] ?? '', /^image\/webp\b/);
            assert.ok((await response.body()).equals(await readFile(resolve(root, 'public/media', asset))));
            await assert.rejects(
              kind === 'screenshot'
                ? checkVisibleCapture(capture)
                : checkWizfixDeviceImage(capture, deployment),
              /EncodingError.*source image cannot be decoded/,
              `${asset}: ${failure} must fail image decoding, not an unrelated assertion`,
            );
            assert.ok(intercepted > 0, `${asset}: failure response was never requested`);
          } finally { await page.close(); }
        });
    }
  }
}

const armadaAsset = 'armada-desktop.webp';
const armadaPath = resolve(root, 'public/media', armadaAsset);

async function readArmadaAsset(path = armadaPath) {
  const bytes = await readFile(path).catch((error) => {
    throw new Error(`${armadaAsset}: missing or unreadable proof image`, { cause: error });
  });
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', `${armadaAsset}: not WebP`);
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', `${armadaAsset}: not WebP`);
  return bytes;
}

async function checkArmadaProof(page, deployment) {
  const bytes = await readArmadaAsset();
  const expectedUrl = deployment.origin + deployment.base + 'media/' + armadaAsset;
  await page.goto(deployment.origin + deployment.base + 'work/armada-catering',
    { waitUntil: 'networkidle' });
  const capture = page.getByTestId('img-armada-desktop');
  assert.equal(await capture.count(), 1, `${armadaAsset}: published proof missing`);
  await capture.scrollIntoViewIfNeeded();
  const source = await capture.evaluate((image) => image.currentSrc);
  assert.equal(source, expectedUrl, `${armadaAsset}: asset escaped artifact base`);
  const response = await page.request.get(source);
  assert.equal(response.status(), 200, `${armadaAsset}: unsuccessful image response`);
  assert.match(response.headers()['content-type'] ?? '', /^image\/webp\b/,
    `${armadaAsset}: served as non-image (possible SPA fallback)`);
  assert.ok(bytes.equals(await response.body()), `${armadaAsset}: wrong served file`);
  await capture.evaluate(async (image) => {
    try { await image.decode(); }
    catch { throw new Error('armada-desktop.webp: proof image failed to decode'); }
    if (!image.complete || image.naturalWidth <= 0 || image.naturalHeight <= 0) {
      throw new Error('armada-desktop.webp: empty decoded proof image');
    }
  });
  // Armada uses its existing 16:9 cover frame; WizFix retains contain checks.
  await checkVisibleCapture(capture, 'cover');
}

for (const artifactBase of [base, '/']) {
  for (const width of [1440, 375, 320]) {
    test(`Armada proof exists, decodes and stays visible at ${width}px under ${artifactBase}`,
      { timeout: 45_000 }, async () => {
        const deployment = deployments.find((entry) => entry.base === artifactBase);
        const page = await browser.newPage({ viewport: { width, height: 900 } });
        const errors = [];
        page.on('pageerror', (error) => errors.push(error.message));
        try {
          await checkArmadaProof(page, deployment);
          assert.deepEqual(errors, [], 'Armada browser runtime errors');
        } finally { await page.close(); }
      });
  }
}

test('Armada guard rejects missing and corrupt source artwork without changing public files', async () => {
  const directory = await mkdtemp(resolve(tmpdir(), 'armada-media-'));
  const fixture = resolve(directory, armadaAsset);
  try {
    await assert.rejects(readArmadaAsset(fixture), /armada-desktop\.webp: missing or unreadable/);
    await writeFile(fixture, 'corrupt artwork');
    await assert.rejects(readArmadaAsset(fixture), /armada-desktop\.webp: not WebP/);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

for (const [failure, options, message] of [
  ['missing response', { status: 404, contentType: 'text/plain', body: 'Not found' }, /failed to decode/],
  ['SPA fallback', { status: 200, contentType: 'text/html', body: '<html>Fallback</html>' }, /failed to decode/],
  // Keep the real API response intact: the rendered image itself must decode.
  ['corrupt image with WebP header', { status: 200, contentType: 'image/webp', body: 'RIFFxxxxWEBPbroken' }, /failed to decode/],
]) {
  test(`Armada guard rejects ${failure} instead of accepting an img element`, { timeout: 45_000 }, async () => {
    const page = await browser.newPage();
    try {
      await page.route(`**/media/${armadaAsset}`, (route) => route.fulfill(options));
      // APIRequestContext bypasses page routes, so these failures demonstrate
      // that a healthy direct response cannot mask a broken rendered image.
      await assert.rejects(checkArmadaProof(page, deployments[0]), message);
    } finally { await page.close(); }
  });
}

test('Armada guard rejects a media URL that escapes the nested artifact base', { timeout: 45_000 }, async () => {
  const page = await browser.newPage();
  try {
    await page.addInitScript(() => {
      new MutationObserver(() => {
        const image = document.querySelector('[data-testid="img-armada-desktop"]');
        if (image && image.getAttribute('src') !== '/media/armada-desktop.webp') {
          image.setAttribute('src', '/media/armada-desktop.webp');
        }
      }).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['src'] });
    });
    await assert.rejects(checkArmadaProof(page, deployments[0]), /asset escaped artifact base/);
  } finally { await page.close(); }
});

for (const [artifactBase, width] of [base, '/'].flatMap((artifactBase) =>
  [1440, 375, 320].map((width) => [artifactBase, width]))) {
  for (const [route, screenshots, devices] of [
    ['', 1, 0], ['work/wizfix', 4, 1], ['preview/wizfix', 2, 1],
  ]) {
    test(`${artifactBase}${route} preserves real WizFix visuals and content at ${width}px`, { timeout: 45_000 }, async () => {
      const deployment = deployments.find((item) => item.base === artifactBase);
      assert.ok(deployment, `Missing deployment for ${artifactBase}`);
      const { origin } = deployment;
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const pageErrors = [];
      page.on('pageerror', (error) => pageErrors.push(error.message));
      try {
        await page.goto(origin + artifactBase + route, { waitUntil: 'networkidle' });
        if (route === '' || route === 'preview/wizfix') {
          const prefix = route === '' ? 'home' : 'preview';
          await page.getByTestId(`button-${prefix}-prev`).click();
          await page.waitForFunction(() =>
            document.querySelector('[data-testid="slide-project-wizfix"]')?.getAttribute('data-active') === 'true');
          const portfolioCount = await page.getByTestId(`carousel-${prefix}`).locator('[data-testid^="slide-project-"]').count();
          const lastNumber = String(portfolioCount).padStart(2, '0');
          assert.match(await page.getByTestId(`text-${prefix}-number`).textContent(), new RegExp(`${lastNumber} / ${lastNumber}`));
        }
        const captures = page.locator('img[src*="media/wizfix-"]');
        assert.equal(await captures.count(), screenshots, 'Missing screenshot or concept fallback used');
        for (const image of await captures.all()) {
          const rotating = await image.evaluate((element) => Boolean(element.closest('.rot-slide')));
          await checkVisibleCapture(image, rotating ? 'cover' : 'contain');
          const source = await image.evaluate((element) => element.currentSrc);
          assert.ok(source.startsWith(origin + artifactBase + 'media/'), `Asset escaped artifact base: ${source}`);
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
            await checkWizfixDeviceImage(capture, deployment);
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
