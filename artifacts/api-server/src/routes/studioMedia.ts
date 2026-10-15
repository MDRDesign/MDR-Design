import { Router, type IRouter } from "express";
import { findStudioAsset } from "../lib/studioStorage";

const router: IRouter = Router();
const assetName = /^(mdr-street-film-[a-f0-9]{12}\.(mp4|webm|webp)|(?:captains-galley-order-options|mdr-monogram)-[a-f0-9]{12}\.webp)$/;

router.get("/studio-media/:filename", async (req, res) => {
  const filename = String(req.params.filename);
  if (!assetName.test(filename)) {
    res.status(404).end();
    return;
  }
  try {
    const asset = await findStudioAsset(filename);
    if (!asset) {
      res.status(404).end();
      return;
    }
    const size = Number(asset.metadata.size);
    if (!Number.isSafeInteger(size) || size <= 0) throw new Error("Invalid asset size");
    res.set({
      "Content-Type": filename.endsWith(".mp4") ? "video/mp4" : filename.endsWith(".webm") ? "video/webm" : "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Accept-Ranges": "bytes",
      "X-Content-Type-Options": "nosniff",
    });
    let start = 0;
    let end = size - 1;
    if (req.headers.range) {
      const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      const invalid = () => res.status(416).set({ "Content-Range": `bytes */${size}`, "Cache-Control": "no-store" }).end();
      if (!range || (!range[1] && !range[2])) { invalid(); return; }
      if (!range[1]) {
        const suffix = Number(range[2]);
        if (!Number.isSafeInteger(suffix) || suffix <= 0) { invalid(); return; }
        start = Math.max(0, size - suffix);
      } else {
        start = Number(range[1]);
        if (range[2]) end = Math.min(Number(range[2]), size - 1);
      }
      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start >= size || end < start) {
        invalid(); return;
      }
      res.status(206).set("Content-Range", `bytes ${start}-${end}/${size}`);
    }
    res.set("Content-Length", String(end - start + 1));
    if (req.method === "HEAD") { res.end(); return; }
    const stream = asset.file.createReadStream({ start, end, validation: false });
    stream.on("error", (error) => {
      req.log.error({ err: error }, "Studio asset stream failed");
      if (!res.headersSent) {
        res.removeHeader("Content-Length");
        res.removeHeader("Content-Range");
        res.removeHeader("Cache-Control");
        res.status(503).end();
      }
      else res.destroy();
    });
    res.on("close", () => stream.destroy());
    stream.pipe(res);
  } catch (error) {
    req.log.error({ err: error }, "Could not serve studio media");
    res.removeHeader("Cache-Control");
    res.status(503).end();
  }
});

export default router;
