import { appendFileSync } from 'node:fs';
import { createServer } from 'node:http';

function record(event, resource) {
  appendFileSync(process.env.WIZFIX_LIFECYCLE_LOG, JSON.stringify({ event, resource }) + '\n');
}

// Real, referenced handles make a missed close hang the child command. Nothing
// here uses an installed browser, Vite build, or the managed preview workflows.
async function start(resource) {
  const server = createServer((_request, response) => response.end('lifecycle fixture'));
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  record('started', resource);
  server.once('close', () => record('closed', resource));
  return server;
}

function cleanupError(resource) {
  return process.env.WIZFIX_LIFECYCLE_CLOSE_FAILURES.split(',').includes(resource)
    ? new Error(`simulated close failure: ${resource}`) : undefined;
}

export async function build() {}

export async function preview() {
  const resource = `preview:${process.env.BASE_PATH}`;
  const httpServer = await start(resource);
  const close = httpServer.close.bind(httpServer);
  httpServer.close = (callback) => {
    record('close requested', resource);
    return close((error) => callback(error || cleanupError(resource)));
  };
  return { httpServer };
}

function engine(name) {
  return {
    name: () => name,
    executablePath: () => process.execPath,
    async launch() {
      record('launch', name);
      if (name === 'webkit') {
        throw new Error('Host system is missing dependencies: simulated required WebKit engine failure');
      }
      const server = await start(name);
      return {
        async close() {
          record('close requested', name);
          await new Promise((resolve, reject) =>
            server.close((error) => error ? reject(error) : resolve()));
          const error = cleanupError(name);
          if (error) throw error;
        },
        newPage() {
          throw new Error('Media test body must not run after setup failure');
        },
      };
    },
  };
}

export const chromium = engine('chromium');
export const firefox = engine('firefox');
export const webkit = engine('webkit');
