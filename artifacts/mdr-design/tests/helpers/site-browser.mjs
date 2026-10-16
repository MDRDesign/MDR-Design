import { access, mkdir } from 'node:fs/promises';
import { constants } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { build, preview } from 'vite';

const root = fileURLToPath(new URL('../../', import.meta.url));
export const evidenceDir = resolve(root, '../../generated-artifacts/site-review');

// Same real Vite production build/Chromium setup as the existing reveal suite.
// REVIEW_URL allows a second pass against managed services, including App Storage.
export async function startSiteBrowser() {
  let server;
  let browser;
  let origin = process.env.REVIEW_URL;
  try {
    if (!origin) {
      const previous = { PORT: process.env.PORT, BASE_PATH: process.env.BASE_PATH };
      try {
        process.env.PORT = '5173';
        process.env.BASE_PATH = '/';
        const outDir = resolve(evidenceDir, 'build');
        await build({ root, configFile: resolve(root, 'vite.config.ts'), mode: 'production',
          logLevel: 'warn', build: { outDir } });
        server = await preview({ root, configFile: resolve(root, 'vite.config.ts'),
          build: { outDir }, preview: { host: '127.0.0.1', port: 0, strictPort: false },
          logLevel: 'warn' });
        origin = `http://127.0.0.1:${server.httpServer.address().port}`;
      } finally {
        for (const [key, value] of Object.entries(previous)) {
          if (value === undefined) delete process.env[key];
          else process.env[key] = value;
        }
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
    await access(executablePath, constants.X_OK);
    browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
    await mkdir(evidenceDir, { recursive: true });
    return {
      browser, origin,
      async close() {
        await browser.close();
        if (server) await new Promise((done) => server.httpServer.close(done));
      },
    };
  } catch (error) {
    await browser?.close();
    if (server) await new Promise((done) => server.httpServer.close(done));
    throw error;
  }
}

// Deny all writes, including unknown endpoints, before any page is opened.
export async function safeContext(browser, options = {}) {
  const context = await browser.newContext({ reducedMotion: 'reduce', ...options });
  await context.route('**/*', (route) => {
    if (!['GET', 'HEAD'].includes(route.request().method())) return route.abort('blockedbyclient');
    return route.continue();
  });
  return context;
}
