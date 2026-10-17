import { access } from 'node:fs/promises';
import { constants } from 'node:fs';

const engines = ['chromium', 'firefox', 'webkit'];

export function parseRequiredBrowsers(value = '') {
  if (!value.trim()) return new Set();
  const names = value.split(',').map((name) => name.trim());
  for (const name of names) {
    if (!engines.includes(name)) {
      throw new Error(`Invalid WIZFIX_REQUIRED_BROWSERS entry ${JSON.stringify(name)}. ` +
        `Use a comma-separated list of: ${engines.join(', ')}.`);
    }
  }
  return new Set(names);
}

// Chromium is always required by the media suite. This helper handles the
// additional comparison engines and exposes unavailable runtimes to its skips.
export async function launchComparisonBrowser(engine, {
  required = false,
  env = process.env,
  checkExecutable = (path) => access(path, constants.X_OK),
} = {}) {
  const name = engine.name();
  const override = `${name.toUpperCase()}_PATH`;
  const path = env[override] || engine.executablePath();
  const setup = `Set ${override} to a compatible Playwright executable or run ` +
    `pnpm --filter @workspace/mdr-design exec playwright-core install ${name}; ` +
    `install the Playwright host dependencies for ${name} on the runner too.`;

  function unavailable(reason, cause) {
    const message = `${name} runtime unavailable: ${reason} ${setup}`;
    if (required) {
      throw new Error(`Required browser ${name} cannot launch ` +
        `(WIZFIX_REQUIRED_BROWSERS); refusing to skip. ${message}`, { cause });
    }
    return { unavailable: message };
  }

  try {
    await checkExecutable(path);
  } catch (error) {
    return unavailable(`no executable at ${path}.`, error);
  }
  try {
    return { browser: await engine.launch({ executablePath: path }) };
  } catch (error) {
    // Optional does not mean ignoring crashes or other unexpected launch errors.
    if (!/Host system is missing dependencies|error while loading shared libraries|cannot open shared object file|ENOENT/.test(error.message)) {
      throw error;
    }
    return unavailable(error.message, error);
  }
}
