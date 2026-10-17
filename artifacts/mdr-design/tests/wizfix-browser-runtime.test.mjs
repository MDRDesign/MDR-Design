import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { launchComparisonBrowser, parseRequiredBrowsers } from './helpers/wizfix-browser-runtime.mjs';

test('required engines are opt-in, selected explicitly, and validated', () => {
  assert.deepEqual([...parseRequiredBrowsers()], []);
  assert.deepEqual([...parseRequiredBrowsers('  ')], []);
  assert.deepEqual([...parseRequiredBrowsers(' firefox, webkit,firefox ')], ['firefox', 'webkit']);
  assert.deepEqual([...parseRequiredBrowsers('chromium')], ['chromium']);
  for (const value of ['safari', 'Firefox', 'firefox,', 'firefox webkit', 'all']) {
    assert.throws(() => parseRequiredBrowsers(value), /Invalid WIZFIX_REQUIRED_BROWSERS/);
  }
});

for (const name of ['firefox', 'webkit']) {
  function engine(launch = async () => ({ close() {} })) {
    return { name: () => name, executablePath: () => `/managed/${name}`, launch };
  }

  test(`${name}: selected required engine launches with its override`, async () => {
    const browser = { close() {} };
    const path = `/override/${name}`;
    const runtime = await launchComparisonBrowser(engine(async (options) => {
      assert.equal(options.executablePath, path);
      return browser;
    }), {
      required: parseRequiredBrowsers(name).has(name),
      env: { [`${name.toUpperCase()}_PATH`]: path },
      checkExecutable: async (actual) => assert.equal(actual, path),
    });
    assert.equal(runtime.browser, browser);
  });

  test(`${name}: non-selected engines remain optional`, async () => {
    const runtime = await launchComparisonBrowser(engine(), {
      required: parseRequiredBrowsers(name === 'firefox' ? 'webkit' : 'firefox').has(name),
      env: {},
      checkExecutable: async () => { throw new Error('ENOENT'); },
    });
    assert.match(runtime.unavailable, new RegExp(`${name} runtime unavailable`));
    assert.match(runtime.unavailable, new RegExp(`${name.toUpperCase()}_PATH`));
    assert.match(runtime.unavailable, new RegExp(`install ${name}`));
  });

  for (const required of [false, true]) {
    test(`${name}: unexpected launch errors fail even when required=${required}`, async () => {
      const error = new Error('browser crashed unexpectedly');
      await assert.rejects(launchComparisonBrowser(engine(async () => { throw error; }), {
        required, env: {}, checkExecutable: async () => {},
      }), (actual) => actual === error);
    });
  }

  // Real node:test subprocesses verify exit status and skip reporting, not just
  // the helper's return shape. Fake engines avoid depending on installed browsers.
  for (const failure of ['missing executable', 'missing host libraries']) {
    for (const required of [false, true]) {
      test(`${name}: ${failure}, required=${required} produces ${required ? 'failure' : 'skip'}`, () => {
        const moduleUrl = new URL('./helpers/wizfix-browser-runtime.mjs', import.meta.url).href;
        const script = `
          import { test } from 'node:test';
          import { launchComparisonBrowser, parseRequiredBrowsers } from ${JSON.stringify(moduleUrl)};
          const required = parseRequiredBrowsers(${JSON.stringify(required ? name : '')});
          test('runtime availability', async (t) => {
            const runtime = await launchComparisonBrowser({
              name: () => ${JSON.stringify(name)},
              executablePath: () => '/missing/browser',
              launch: async () => { throw new Error('Host system is missing dependencies: libfixture.so'); },
            }, {
              required: required.has(${JSON.stringify(name)}),
              env: {},
              checkExecutable: async () => {
                if (${JSON.stringify(failure)} === 'missing executable') throw new Error('ENOENT');
              },
            });
            if (runtime.unavailable) t.skip(runtime.unavailable);
          });
        `;
        const result = spawnSync(process.execPath, ['--test-reporter=tap', '--input-type=module', '--eval', script], {
          encoding: 'utf8', timeout: 10_000,
          env: { ...process.env, NODE_TEST_CONTEXT: '' },
        });
        assert.ifError(result.error);
        const output = result.stdout + result.stderr;
        assert.equal(result.status, required ? 1 : 0, output);
        assert.match(output, new RegExp(`${name} runtime unavailable`));
        assert.match(output, failure === 'missing executable'
          ? /no executable at \/missing\/browser/ : /libfixture\.so/);
        if (required) {
          assert.match(output, new RegExp(`Required browser ${name} cannot launch`));
          assert.match(output, /refusing to skip/);
          assert.match(output, /# skipped 0/);
        } else {
          assert.match(output, /# SKIP/);
          assert.match(output, /# skipped 1/);
        }
      });
    }
  }
}
