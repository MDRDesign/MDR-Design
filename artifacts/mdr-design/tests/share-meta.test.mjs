import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, createServer, preview } from 'vite';

const root = fileURLToPath(new URL('../', import.meta.url));
const cases = {
  '/work/wizfix': '/media/og-wizfix.jpg',
  '/work/armada-catering': '/media/og-armada-catering.jpg',
};
const attr = (html, key) => html.match(new RegExp(`<meta (?:property|name)="${key}" content="([^"]*)"`))?.[1];
const title = (html) => html.match(/<title>(.*?)<\/title>/)?.[1];

function checkMeta(html, route, base, siteUrl = '') {
  const image = `${siteUrl}${base.slice(0, -1)}${cases[route]}`;
  assert.equal(attr(html, 'og:image'), image);
  assert.equal(attr(html, 'twitter:image'), image);
  assert.equal(attr(html, 'og:image:width'), '1200');
  assert.equal(attr(html, 'og:image:height'), '630');
  assert.equal(attr(html, 'twitter:card'), 'summary_large_image');
  assert.equal(title(html), attr(html, 'og:title'));
  assert.equal(title(html), attr(html, 'twitter:title'));
  assert.equal(attr(html, 'description'), attr(html, 'og:description'));
  assert.equal(attr(html, 'description'), attr(html, 'twitter:description'));
  assert.equal(attr(html, 'robots'), 'index, follow');
  assert.equal((html.match(/property="og:image"/g) ?? []).length, 1);
}

test('case shares: initial HTML, static shells, base paths, images and unlisted rooms', async () => {
  const saved = { PORT: process.env.PORT, BASE_PATH: process.env.BASE_PATH, VITE_SITE_URL: process.env.VITE_SITE_URL };
  try {
    process.env.PORT = '5173';
    for (const base of ['/', '/portfolio-regression/']) {
      process.env.BASE_PATH = base;
      // Reserved example origin is a fixture, never a production address.
      const siteUrl = base === '/' ? '' : 'https://portfolio.example';
      process.env.VITE_SITE_URL = siteUrl;
      const outDir = resolve(root, '../../generated-artifacts/share-meta', base === '/' ? 'root' : 'nested');
      const config = { root, configFile: resolve(root, 'vite.config.ts'), logLevel: 'error' };
      const dev = await createServer({ ...config, server: { port: 0, strictPort: false, host: '127.0.0.1' } });
      try {
        await dev.listen();
        const origin = `http://127.0.0.1:${dev.httpServer.address().port}`;
        const { metaForPath, seoUrl } = await dev.ssrLoadModule('/src/data/routeMeta.ts');
        for (const [route, image] of Object.entries(cases)) {
          const response = await fetch(`${origin}${base.slice(0, -1)}${route}?share=1`);
          assert.equal(response.status, 200);
          const html = await response.text();
          checkMeta(html, route, base, siteUrl);
          assert.equal(attr(html, 'og:image'), seoUrl(metaForPath(route).image, base, siteUrl));
          assert.equal(metaForPath(route).image, image);
        }
        const html = await (await fetch(`${origin}${base}preview/unknown-room`)).text();
        assert.equal(attr(html, 'robots'), 'noindex, nofollow');
        assert.ok(!html.includes('rel="canonical"'));
      } finally { await dev.close(); }

      await build({ ...config, build: { outDir } });
      const server = await preview({ ...config, build: { outDir }, preview: { port: 0, host: '127.0.0.1', strictPort: false } });
      try {
        const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
        for (const [route, image] of Object.entries(cases)) {
          const shell = await readFile(resolve(outDir, `.${route}/index.html`), 'utf8');
          checkMeta(shell, route, base, siteUrl);
          // Vite preview does not implement Replit's static rewrites. Request
          // their explicit destination, and check the production rules below.
          const response = await fetch(`${origin}${base.slice(0, -1)}${route}/index.html`);
          assert.equal(response.status, 200);
          checkMeta(await response.text(), route, base, siteUrl);
          const asset = await fetch(`${origin}${base.slice(0, -1)}${image}`);
          assert.equal(asset.status, 200);
          assert.match(asset.headers.get('content-type'), /image\/jpeg/);
          const bytes = Buffer.from(await asset.arrayBuffer());
          assert.deepEqual([...bytes.subarray(0, 3)], [0xff, 0xd8, 0xff]);
          assert.ok(bytes.length < 150_000, 'share image stays compact');
          // JPEG SOF0 stores the real dimensions, independent of metadata tags.
          const sof = bytes.indexOf(Buffer.from([0xff, 0xc0]));
          assert.ok(sof > 0);
          assert.equal(bytes.readUInt16BE(sof + 5), 630);
          assert.equal(bytes.readUInt16BE(sof + 7), 1200);
        }
        for (const room of ['preview', 'preview/wizfix']) {
          const html = await readFile(resolve(outDir, room, 'index.html'), 'utf8');
          assert.equal(attr(html, 'robots'), 'noindex, nofollow');
          assert.ok(!html.includes('rel="canonical"'));
        }
      } finally { await new Promise((done) => server.httpServer.close(done)); }
    }
  } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test('production case rewrites precede the SPA fallback; unknown preview rooms stay unlisted', async () => {
  const toml = await readFile(resolve(root, '.replit-artifact/artifact.toml'), 'utf8');
  const rules = [...toml.matchAll(/\[\[services\.production\.rewrites\]\]\s*from = "([^"]+)"\s*to = "([^"]+)"/g)]
    .map(([, from, to]) => ({ from, to }));
  for (const route of Object.keys(cases)) {
    for (const suffix of ['', '/']) {
      const index = rules.findIndex((r) => r.from === route + suffix);
      assert.ok(index >= 0);
      assert.equal(rules[index].to, `${route}/index.html`);
      assert.ok(index < rules.findIndex((r) => r.from === '/*'));
    }
  }
  assert.equal(rules.find((r) => r.from === '/preview/*')?.to, '/preview/index.html');
  assert.ok(rules.findIndex((r) => r.from === '/preview/*') < rules.findIndex((r) => r.from === '/*'));
});
