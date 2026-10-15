// Upload immutable production artwork without changing any website asset or route.
// Run from repo root: pnpm --filter @workspace/scripts exec tsx ../scripts/logo-assets/upload.mjs
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { studioStorage } from "../../artifacts/api-server/src/lib/studioStorage.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const output = path.join(root, "generated-artifacts/mdr-logos/production");
const manifest = JSON.parse(await readFile(path.join(output, "manifest.json"), "utf8"));
const publicRoot = (process.env.PUBLIC_OBJECT_SEARCH_PATHS ?? "").split(",")[0]?.trim();
if (!publicRoot) throw new Error("Public App Storage is not configured");
const [bucketName, ...base] = publicRoot.replace(/^\/+/, "").split("/");
if (!bucketName) throw new Error("Public App Storage path is invalid");
const manifestBytes = await readFile(path.join(output, "manifest.json"));
const version = createHash("sha256").update(manifestBytes).digest("hex").slice(0, 16);
const prefix = `media/mdr-design-logo/layered-monoline-${version}`;
const files = manifest.files.map((item) => ({
  local: path.join(root, item.workspacePath),
  name: item.path,
  contentType: item.contentType,
  sha256: item.sha256,
}));
for (const [name, contentType] of [
  ["manifest.json", "application/json"],
  ["verification.json", "application/json"],
  ["MDR-Design-logo-guide.html", "text/html"],
  ["MDR-Design-production-proof.png", "image/png"],
  ["MDR-Design-Layered-Monoline-Logo-Kit.zip", "application/zip"],
]) files.push({ local: path.join(output, name), name, contentType });
for (const name of ["README.md", "FONT-LICENSE.txt"])
  files.push({ local: path.join(root, "branding/mdr-design", name), name, contentType: "text/plain" });

const stored = [];
// Limit concurrent work; verify downloads so metadata alone cannot hide bad bytes.
for (let i = 0; i < files.length; i += 4) {
  await Promise.all(files.slice(i, i + 4).map(async (item) => {
    const bytes = await readFile(item.local);
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    if (item.sha256 && sha256 !== item.sha256) throw new Error(`Local checksum mismatch: ${item.name}`);
    const publicObjectName = `${prefix}/${item.name}`;
    const file = studioStorage.bucket(bucketName).file([...base, publicObjectName].join("/"));
    await file.save(bytes, { resumable: false, metadata: {
      contentType: item.contentType, cacheControl: "public, max-age=31536000, immutable",
      metadata: { sha256, identity: "MDR Design Layered Monoline" },
    } });
    const [download] = await file.download();
    if (createHash("sha256").update(download).digest("hex") !== sha256)
      throw new Error(`Storage checksum mismatch: ${item.name}`);
    stored.push({ path: item.name, publicObjectName, contentType: item.contentType,
                  bytes: bytes.length, sha256, verified: true });
  }));
}
stored.sort((a, b) => a.path.localeCompare(b.path));
const result = { identity: "MDR Design Layered Monoline", prefix,
  note: "Relative public object names, not signed URLs. Website routes unchanged.",
  files: stored };
const serialized = JSON.stringify(result, null, 2) + "\n";
await writeFile(path.join(output, "storage-manifest.json"), serialized);
await writeFile(path.join(root, "branding/mdr-design/storage-manifest.json"), serialized);
console.log(JSON.stringify({ uploaded: stored.length, verified: stored.length, prefix }));
