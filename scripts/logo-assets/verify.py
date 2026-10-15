"""Validate production SVGs, raster transparency, dimensions and archive integrity."""

import hashlib
import json
from pathlib import Path
import subprocess
import tempfile
import xml.etree.ElementTree as ET
import zipfile

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "generated-artifacts/mdr-logos/production"
BRAND = ROOT / "branding/mdr-design"
SVG_NS = "{http://www.w3.org/2000/svg}"


def verify():
    manifest = json.loads((OUT / "manifest.json").read_text())
    assert manifest["brand"] == "MDR Design"
    source = BRAND / "source/approved-geometry.json"
    assert hashlib.sha256(source.read_bytes()).hexdigest() == manifest["sourceSha256"]
    svgs = []
    rasters = []
    for item in manifest["files"]:
        file = ROOT / item["workspacePath"]
        data = file.read_bytes()
        assert len(data) == item["bytes"], file
        assert hashlib.sha256(data).hexdigest() == item["sha256"], file
        if item["contentType"] == "image/svg+xml":
            root = ET.fromstring(data)
            assert root.attrib["viewBox"].startswith("0 0 ")
            assert "MDR Design" in root.find(f"{SVG_NS}title").text
            assert len(root.findall(f"{SVG_NS}path")) == (2 if item["layout"].startswith("lockup") else 1)
            for node in root.iter():
                assert node.tag.removeprefix(SVG_NS) in ("svg", "path", "title", "desc"), file
                assert not any(key.rsplit("}", 1)[-1] in ("href", "mask", "stroke", "style")
                               for key in node.attrib), file
            svgs.append(file)
        else:
            image = cv2.imread(str(file), cv2.IMREAD_UNCHANGED)
            assert image is not None and image.shape[2] == 4, file
            h, w, _ = image.shape
            assert (w, h) == (item["width"], item["height"]), file
            alpha = image[:, :, 3]
            # Subpixel-width curves in the smallest marks can be antialiased
            # everywhere; requiring an exactly opaque pixel would reject them.
            assert alpha.min() == 0 and alpha.max() >= 192, file
            assert np.count_nonzero(alpha) > 10, file
            # Resampling can leave a faint (< 7%) halo at the edge of the 32px
            # export. No substantive artwork may touch the canvas boundary.
            assert max(alpha[0, :].max(), alpha[-1, :].max(),
                       alpha[:, 0].max(), alpha[:, -1].max()) <= 16, file
            # Count visible ink, not every near-transparent resampling fringe.
            assert np.count_nonzero(alpha >= 128) / alpha.size < 0.5, file
            rasters.append(file)
    assert len(svgs) == 16 and len(rasters) == 56
    archive = OUT / "MDR-Design-Layered-Monoline-Logo-Kit.zip"
    with zipfile.ZipFile(archive) as z:
        assert z.testzip() is None
        for item in manifest["files"]:
            assert hashlib.sha256(z.read(item["path"])).hexdigest() == item["sha256"]
    # An independent shape regression checks that expanding strokes and boolean
    # knockouts preserved the approved draft, rather than tracing the raster.
    # The reference comes from approved centerlines, not from the built fill paths.
    spec = json.loads(source.read_text())
    paths = spec["paths"]
    def stroke(d, width, color):
        return (f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{width}" '
                'stroke-linecap="round" stroke-linejoin="round"/>')
    reference = ['<svg xmlns="http://www.w3.org/2000/svg" width="580" height="340" '
                 'viewBox="0 0 580 340"><g transform="translate(20 20)">']
    for i, path in enumerate(paths):
        reference += [f'<mask id="layer-{i}" maskUnits="userSpaceOnUse" x="-60" y="-60" '
                      'width="800" height="420"><rect x="-60" y="-60" width="800" '
                      'height="420" fill="white"/>']
        reference.extend(stroke(d, 40, "black") for d in paths[i + 1:])
        reference += [f'</mask><g mask="url(#layer-{i})">', stroke(path, 16, "#082b36"), '</g>']
    reference.append('</g></svg>')
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        (tmp / "reference.svg").write_text("".join(reference))
        for src, dest in [(tmp / "reference.svg", tmp / "reference.png"),
                          (BRAND / "svg/mdr-design-mark-on-light.svg", tmp / "master.png")]:
            subprocess.run(["convert", "-background", "none", str(src),
                            f"PNG32:{dest}"], check=True, capture_output=True)
        before = cv2.imread(str(tmp / "reference.png"), cv2.IMREAD_UNCHANGED)[:, :, 3] > 127
        after = cv2.imread(str(tmp / "master.png"), cv2.IMREAD_UNCHANGED)[:, :, 3] > 127
        similarity = np.count_nonzero(before & after) / np.count_nonzero(before | after)
        assert similarity > 0.99, f"Approved-shape regression: {similarity:.4f}"
    result = {"svgMasters": len(svgs), "transparentPngs": len(rasters),
              "approvedShapeIoU": round(float(similarity), 6),
              "archiveIntegrity": "passed", "result": "passed"}
    (OUT / "verification.json").write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps(result))


if __name__ == "__main__":
    verify()
