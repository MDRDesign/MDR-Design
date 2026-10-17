import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

for (const closeFailures of ['', 'chromium', 'chromium,preview:/portfolio-regression/']) {
  test(`late required engine failure cleans up the actual suite (close failures: ${closeFailures || 'none'})`,
    { timeout: 20_000 }, async () => {
      const directory = await mkdtemp(join(tmpdir(), 'wizfix-lifecycle-'));
      const log = join(directory, 'events.jsonl');
      try {
        // A new runner must not inherit the parent's test-worker context.
        const env = { ...process.env };
        delete env.NODE_TEST_CONTEXT;
        const result = spawnSync(process.execPath, [
          '--import', fileURLToPath(new URL('./fixtures/wizfix-lifecycle-hooks.mjs', import.meta.url)),
          // Keep handles in the direct child so a timeout cannot orphan a worker.
          '--test', '--test-isolation=none', '--test-reporter=tap',
          fileURLToPath(new URL('./wizfix-media.test.mjs', import.meta.url)),
        ], {
          encoding: 'utf8',
          timeout: 15_000,
          maxBuffer: 2 * 1024 * 1024,
          env: {
            ...env,
            CHROMIUM_PATH: process.execPath,
            FIREFOX_PATH: process.execPath,
            WEBKIT_PATH: process.execPath,
            WIZFIX_REQUIRED_BROWSERS: 'firefox,webkit',
            WIZFIX_LIFECYCLE_LOG: log,
            WIZFIX_LIFECYCLE_CLOSE_FAILURES: closeFailures,
          },
        });
        const output = result.stdout + result.stderr;
        assert.ifError(result.error); // A leaked handle times out, not a passing failure.
        assert.equal(result.signal, null, output);
        assert.equal(result.status, 1, output);
        const events = (await readFile(log, 'utf8')).trim().split('\n').map(JSON.parse);
        const resources = ['preview:/portfolio-regression/', 'preview:/', 'chromium', 'firefox'];
        assert.deepEqual(events.filter(({ event }) => event === 'started')
          .map(({ resource }) => resource), resources);
        assert.deepEqual(events.filter(({ event }) => event === 'launch')
          .map(({ resource }) => resource), ['chromium', 'firefox', 'webkit']);
        for (const resource of resources) {
          for (const event of ['close requested', 'closed']) {
            assert.equal(events.filter((entry) => entry.resource === resource && entry.event === event).length,
              1, `${resource}: expected exactly one ${event}`);
          }
        }
        assert.match(output, /Required browser webkit cannot launch/);
        assert.match(output, /simulated required WebKit engine failure/);
        assert.doesNotMatch(output, /Media test body must not run/);
        if (closeFailures) {
          assert.match(output, /WizFix resource cleanup failed/);
          for (const resource of closeFailures.split(',')) {
            assert.ok(output.includes(`simulated close failure: ${resource}`), output);
          }
        } else {
          assert.doesNotMatch(output, /WizFix resource cleanup failed|after.*hook failed/);
        }
      } finally {
        await rm(directory, { recursive: true, force: true });
      }
    });
}
