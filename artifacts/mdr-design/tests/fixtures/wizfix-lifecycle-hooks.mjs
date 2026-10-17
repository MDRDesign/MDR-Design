import { registerHooks } from 'node:module';

// Replace only the real suite's external runtime boundaries. Its before/after
// hooks, engine launch policy, and node:test runner remain unchanged.
const suite = new URL('../wizfix-media.test.mjs', import.meta.url).href;
const runtime = new URL('./wizfix-lifecycle-runtime.mjs', import.meta.url).href;
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (context.parentURL === suite && ['vite', 'playwright-core'].includes(specifier)) {
      return { url: runtime, shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
});
