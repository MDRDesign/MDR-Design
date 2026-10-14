import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile, mkdtemp, writeFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { build } from "esbuild";

const root = path.resolve(import.meta.dirname, "..");
const routeSource = await readFile(path.join(root, "src/routes/inquiries.ts"), "utf8");
const temp = await mkdtemp(path.join(tmpdir(), "mdr-inquiry-unit-"));
const compiled = await build({
  stdin: {
    contents: `${routeSource}\nexport { saved, order } from "@workspace/db";\nexport { notificationState } from "../lib/inquiry-notifications";`,
    loader: "ts",
    resolveDir: path.join(root, "src/routes"),
  },
  bundle: true,
  platform: "node",
  format: "cjs",
  write: false,
  plugins: [{
    name: "inquiry-test-doubles",
    setup(builder) {
      builder.onResolve({ filter: /^@workspace\/db$/ }, () => ({ path: "database", namespace: "test-double" }));
      builder.onResolve({ filter: /^\.\.\/lib\/inquiry-notifications$/ }, () => ({ path: "notification", namespace: "test-double" }));
      builder.onLoad({ filter: /.*/, namespace: "test-double" }, ({ path: module }) => ({
        contents: module === "database" ? `
          export const saved = [];
          export const order = [];
          export const inquiriesTable = {id: "id"};
          export const db = { insert() { return { values(data) { return { returning() {
            order.push("save");
            saved.push(data);
            return Promise.resolve([{id: saved.length}]);
          } }; } }; } };
        ` : `
          import {order} from "@workspace/db";
          export const notificationState = {mode: "throw", calls: 0};
          export async function sendInquiryNotification() {
            order.push("notify");
            notificationState.calls++;
            if (notificationState.mode === "throw") throw new Error("Simulated provider timeout");
            if (notificationState.mode === "reject") return {ok: false, status: 403, reason: "validation_error"};
            return {ok: true, emailId: "test-email"};
          }
        `,
        loader: "js",
      }));
    },
  }],
});
const bundlePath = path.join(temp, "route.cjs");
await writeFile(bundlePath, compiled.outputFiles[0].text);
const { default: router, saved, order, notificationState } = createRequire(import.meta.url)(bundlePath);
const handler = router.stack.find((layer) => layer.route?.path === "/inquiries").route.stack[0].handle;
await rm(temp, { recursive: true, force: true });

const input = {
  name: "Test owner", business: "Test business", email: "test@example.com",
  website: "example.com", need: "Website", budget: "Let's discuss",
  timeline: "Just exploring", message: "Unit verification only.", source: "unit-test",
};

for (const mode of ["throw", "reject", "accept"]) {
  test(`saved inquiry returns success when notification outcome is ${mode}`, async () => {
    notificationState.mode = mode;
    const before = saved.length;
    order.length = 0;
    const result = {};
    const req = { ip: `unit-${mode}`, body: input, log: { info() {}, warn() {}, error() {} } };
    const res = {
      status(code) { result.status = code; return this; },
      json(body) { result.body = body; return this; },
      set() { return this; },
    };
    await handler(req, res);
    assert.equal(result.status, 201);
    assert.match(result.body.message, /safely received/);
    assert.equal(saved.length, before + 1);
    assert.equal(saved.at(-1).email, input.email);
    assert.equal(saved.at(-1).website, "https://example.com/");
    assert.deepEqual(order, ["save", "notify"]);
  });
}

test("invalid inquiries neither save nor send", async () => {
  const before = saved.length;
  const calls = notificationState.calls;
  const result = {};
  await handler(
    { ip: "unit-invalid", body: { name: "" }, log: { info() {}, warn() {}, error() {} } },
    { status(code) { result.status = code; return this; }, json() { return this; }, set() { return this; } },
  );
  assert.equal(result.status, 400);
  assert.equal(saved.length, before);
  assert.equal(notificationState.calls, calls);
});
