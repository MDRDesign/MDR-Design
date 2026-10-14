import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { mockupPreviewPlugin } from "../mockupPreviewPlugin.ts";

test("discovers nested TSX mockups, excluding private and hidden files", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "mockup-discovery-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const mockups = path.join(root, "src/components/mockups");
  const files = [
    "Top.tsx",
    "nested/Example.tsx",
    "_Private.tsx",
    "_internal/Excluded.tsx",
    "nested/_Private.tsx",
    ".hidden.tsx",
    ".hidden/Excluded.tsx",
    "nested/.hidden/Excluded.tsx",
    "Other.jsx",
  ];
  for (const file of files) {
    const destination = path.join(mockups, file);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, "export default function Example() {}");
  }
  const plugin = mockupPreviewPlugin();
  plugin.configResolved({ root });
  await plugin.buildStart();
  const generatedPath = path.join(root, "src/.generated/mockup-components.ts");
  const source = await readFile(generatedPath, "utf8");
  assert.match(source, /"\.\/components\/mockups\/Top\.tsx"/);
  assert.match(source, /import\("\.\.\/components\/mockups\/nested\/Example\.tsx"\)/);
  assert.doesNotMatch(source, /Private|Excluded|hidden|Other/);
  assert.equal((source.match(/: \(\) => import/g) ?? []).length, 2);

  // Rescanning must reflect both additions and removals, as the watcher does.
  await rm(path.join(mockups, "Top.tsx"));
  await writeFile(path.join(mockups, "Added.tsx"), "export default function Added() {}");
  await plugin.buildStart();
  const rescanned = await readFile(generatedPath, "utf8");
  assert.match(rescanned, /Added\.tsx/);
  assert.doesNotMatch(rescanned, /Top\.tsx/);
});

test("an absent mockup directory generates an empty module map", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "mockup-empty-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const plugin = mockupPreviewPlugin();
  plugin.configResolved({ root });
  await plugin.buildStart();
  const source = await readFile(
    path.join(root, "src/.generated/mockup-components.ts"),
    "utf8",
  );
  assert.doesNotMatch(source, /: \(\) => import/);
  assert.match(source, /export const modules: ModuleMap = \{/);
});
