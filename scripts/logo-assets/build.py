"""Build approved MDR artwork, not a raster trace.

Run from the repository root: python3 scripts/logo-assets/build.py
Requires fonttools, skia-pathops and ImageMagick (already used for the review).
Set MDR_LOGO_FONT to an installed DejaVuSans.ttf if it is not in the usual place.
SVG masters and approved source are tracked; PNG/ZIP/proof outputs are ignored.
"""

import base64
import hashlib
import html
import json
import os
from pathlib import Path
import subprocess
import xml.etree.ElementTree as ET
import zipfile

import pathops
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.svgLib.path import parse_path
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[2]
BRAND = ROOT / "branding/mdr-design"
OUT = ROOT / "generated-artifacts/mdr-logos/production"
SOURCE = json.loads((BRAND / "source/approved-geometry.json").read_text())
PALETTE = SOURCE["palette"]
FONT_PATH = Path(os.environ.get(
    "MDR_LOGO_FONT", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
))
if not FONT_PATH.is_file():
    raise SystemExit("DejaVuSans.ttf is required; set MDR_LOGO_FONT. No fallback is used.")
FONT = TTFont(FONT_PATH)
if FONT["name"].getDebugName(1) != "DejaVu Sans" or FONT["name"].getDebugName(2) != "Book":
    raise SystemExit("Use DejaVu Sans Book, the exact face on the approved board.")
GLYPHS = FONT.getGlyphSet()
CMAP = FONT.getBestCmap()
UPM = FONT["head"].unitsPerEm
KERN = {}
if "kern" in FONT:
    for subtable in FONT["kern"].kernTables:
        if subtable.coverage & 1:
            KERN.update(subtable.kernTable)

THEMES = {
    "on-light": (PALETTE["teal"], PALETTE["teal"]),
    "on-dark": (PALETTE["coral"], PALETTE["ivory"]),
    "reversed": (PALETTE["ivory"], PALETTE["ivory"]),
    "ink": (PALETTE["ink"], PALETTE["ink"]),
}
LAYOUTS = {
    "mark": {"viewBox": (580, 340), "small": False, "transform": (1, 0, 0, 1, 20, 20),
             "widths": (128, 256, 512, 1024)},
    "mark-small": {"viewBox": (620, 380), "small": True, "transform": (1, 0, 0, 1, 40, 40),
                   "widths": (32, 48, 64)},
    "lockup": {"viewBox": (600, 450), "small": False, "transform": (1, 0, 0, 1, 17.5, 24),
               "fontSize": 44, "baseline": 412, "widths": (256, 512, 1024, 2048)},
    "lockup-small": {"viewBox": (176, 132), "small": True,
                     "transform": (0.25, 0, 0, 0.25, 17.375, 10),
                     "fontSize": 18, "baseline": 118, "widths": (128, 176, 256)},
}


def outlined_stroke(d, width):
    path = pathops.Path()
    parse_path(d, path.getPen())
    path.stroke(width, pathops.LineCap.ROUND_CAP, pathops.LineJoin.ROUND_JOIN, 4)
    # Skia arcs are rational conics; SVG has no rational-quadratic command.
    path.convertConicsToQuads(0.001)
    return path


def monogram(small=False):
    spec = SOURCE["small" if small else "standard"]
    strokes = [outlined_stroke(d, spec["strokeWidth"]) for d in SOURCE["paths"]]
    knockouts = [outlined_stroke(d, spec["crossingWidth"]) for d in SOURCE["paths"]]
    visible = []
    for i, stroke in enumerate(strokes):
        for foreground in knockouts[i + 1:]:
            stroke = pathops.op(stroke, foreground, pathops.PathOp.DIFFERENCE)
        visible.append(stroke)
    result = visible[0]
    for stroke in visible[1:]:
        result = pathops.op(result, stroke, pathops.PathOp.UNION)
    return result


MARKS = {False: monogram(), True: monogram(True)}


def path_data(path):
    pen = SVGPathPen(None)
    path.draw(pen)
    return pen.getCommands()


def glyph_path(text, size, center, baseline):
    scale = size / UPM
    advance = 0
    previous = None
    positions = []
    for char in text:
        glyph = CMAP[ord(char)]
        advance += KERN.get((previous, glyph), 0)
        positions.append((glyph, advance))
        advance += FONT["hmtx"].metrics[glyph][0]
        previous = glyph
    pen = SVGPathPen(GLYPHS)
    left = center - advance * scale / 2
    for glyph, x in positions:
        GLYPHS[glyph].draw(TransformPen(pen, (scale, 0, 0, -scale, left + x * scale, baseline)))
    return pen.getCommands()


def artwork(layout, theme):
    spec = LAYOUTS[layout]
    width, height = spec["viewBox"]
    mark_color, name_color = THEMES[theme]
    transformed = pathops.Path()
    MARKS[spec["small"]].draw(TransformPen(transformed.getPen(), spec["transform"]))
    paths = f'<path fill="{mark_color}" fill-rule="nonzero" d="{path_data(transformed)}"/>'
    if "fontSize" in spec:
        paths += (f'<path fill="{name_color}" fill-rule="nonzero" '
                  f'd="{glyph_path(SOURCE["name"], spec["fontSize"], width / 2, spec["baseline"])}"/>')
    return paths, width, height


def svg_document(layout, theme):
    paths, width, height = artwork(layout, theme)
    title = f"MDR Design — Layered Monoline — {layout} — {theme}"
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" '
            f'viewBox="0 0 {width} {height}" role="img" aria-labelledby="logo-title">'
            f'<title id="logo-title">{html.escape(title)}</title>'
            '<desc>Approved MDR Design identity. Transparent background. All artwork and '
            'name lettering are outlined vector paths; no fonts, masks or linked images.</desc>'
            f'{paths}</svg>\n')


def render(source, target, width):
    # Rasterize directly at final pixel dimensions, never upscale an existing PNG.
    root = ET.parse(source).getroot()
    vw, vh = [float(n) for n in root.attrib["viewBox"].split()][2:]
    height = round(width * vh / vw)
    subprocess.run(["convert", "-background", "none", "-density", str(width / vw * 96),
                    str(source), "-resize", f"{width}x{height}!",
                    "-strip", f"PNG32:{target}"], check=True, capture_output=True)
    return height


def proof():
    parts = ['<rect width="1600" height="1120" fill="#f4f1ea"/>']

    def text(value, x, y, size=18, color="#082b36", center=False):
        # Even the proof's labels are font-independent paths.
        if not center:
            width = sum(FONT["hmtx"].metrics[CMAP[ord(c)]][0] for c in value) * size / UPM
            x += width / 2
        parts.append(f'<path fill="{color}" d="{glyph_path(value, size, x, y)}"/>')

    def sample(layout, theme, x, y, width):
        paths, vw, _ = artwork(layout, theme)
        parts.append(f'<g transform="translate({x} {y}) scale({width / vw})">{paths}</g>')

    text("MDR Design / Approved Layered Monoline", 60, 65, 30)
    text("Production artwork • outlined vectors • transparent PNG exports", 60, 100, 18)
    parts.append('<rect x="60" y="132" width="730" height="470" fill="#082b36"/>')
    parts.append('<rect x="810" y="132" width="730" height="470" fill="#e8e2d5"/>')
    sample("lockup", "on-dark", 125, 143, 600)
    sample("lockup", "on-light", 875, 143, 600)
    text("For dark backgrounds", 85, 577, 16, "#f4f1ea")
    text("For light backgrounds", 835, 577, 16)
    text("Small-size lockup / name sized independently", 60, 650, 22)
    parts.append('<rect x="60" y="675" width="730" height="235" fill="#082b36"/>')
    parts.append('<rect x="810" y="675" width="730" height="235" fill="#e8e2d5"/>')
    for origin, theme, color in [(60, "on-dark", "#f4f1ea"), (810, "on-light", "#082b36")]:
        for x, width in [(origin + 40, 176), (origin + 300, 128)]:
            sample("lockup-small", theme, x, 700, width)
            text(f"{width}px wide", x, 870, 15, color)
        sample("mark-small", theme, origin + 585, 723, 48)
        text("48px mark", origin + 565, 870, 15, color)
    text("Palette", 60, 960, 20)
    for i, (name, color) in enumerate(PALETTE.items()):
        x = 60 + i * 370
        parts.append(f'<rect x="{x}" y="980" width="40" height="40" fill="{color}" stroke="#c9c4ba"/>')
        text(f"{name.title()}  {color.upper()}", x + 55, 1007, 17)
    text("Use standard lockup at 256px+; compact at 128–255px; mark-only below 128px.", 60, 1060, 17)
    text("Website unchanged. See the included guide for scaling and print limits.", 60, 1090, 16)
    svg = OUT / "MDR-Design-production-proof.svg"
    svg.write_text('<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1120" '
                   'viewBox="0 0 1600 1120">' + "".join(parts) + "</svg>")
    render(svg, OUT / "MDR-Design-production-proof.png", 1600)


def main():
    (BRAND / "svg").mkdir(parents=True, exist_ok=True)
    (OUT / "png").mkdir(parents=True, exist_ok=True)
    entries = []
    for layout, spec in LAYOUTS.items():
        for theme in THEMES:
            stem = f"mdr-design-{layout}-{theme}"
            svg = BRAND / "svg" / f"{stem}.svg"
            svg.write_text(svg_document(layout, theme))
            entries.append(entry(svg, f"svg/{svg.name}", "image/svg+xml", layout, theme))
            for width in spec["widths"]:
                png = OUT / "png" / f"{stem}-{width}w.png"
                height = render(svg, png, width)
                entries.append(entry(png, f"png/{png.name}", "image/png", layout, theme,
                                     width=width, height=height))
    manifest = {"brand": SOURCE["name"], "direction": SOURCE["direction"],
                "palette": PALETTE, "font": "DejaVu Sans Book, outlined; no font needed for use",
                "sourceSha256": hashlib.sha256((BRAND / "source/approved-geometry.json").read_bytes()).hexdigest(),
                "files": entries}
    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    proof()
    preview = base64.b64encode((OUT / "MDR-Design-production-proof.png").read_bytes()).decode()
    guide = (BRAND / "README.md").read_text()
    (OUT / "MDR-Design-logo-guide.html").write_text(
        '<!doctype html><html lang="en"><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width, initial-scale=1">'
        '<title>MDR Design — Logo guide</title><style>'
        'body{margin:0;background:#f4f1ea;color:#082b36;font:17px/1.6 system-ui,sans-serif}'
        'main{max-width:1000px;margin:auto;padding:32px}img{display:block;width:100%;height:auto}'
        'pre{white-space:pre-wrap;font:inherit}h1{line-height:1.2}</style><main>'
        '<h1>MDR Design — Approved logo files</h1>'
        f'<img alt="Approved logo on light and dark backgrounds, with small-size samples" '
        f'src="data:image/png;base64,{preview}"><pre>{html.escape(guide)}</pre></main></html>')
    archive = OUT / "MDR-Design-Layered-Monoline-Logo-Kit.zip"
    with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED) as z:
        for entry_ in entries:
            z.write(ROOT / entry_["workspacePath"], entry_["path"])
        for source in (BRAND / "source").iterdir():
            z.write(source, f"source/{source.name}")
        for name in ("README.md", "FONT-LICENSE.txt"):
            z.write(BRAND / name, name)
        for name in ("manifest.json", "MDR-Design-logo-guide.html",
                     "MDR-Design-production-proof.svg", "MDR-Design-production-proof.png"):
            z.write(OUT / name, name)
    print(json.dumps({"svgMasters": len(list((BRAND / "svg").glob("*.svg"))),
                      "pngExports": len(list((OUT / "png").glob("*.png"))),
                      "archive": str(archive.relative_to(ROOT))}))


def entry(file, path, content_type, layout, theme, **extra):
    data = file.read_bytes()
    return {"path": path, "workspacePath": str(file.relative_to(ROOT)),
            "contentType": content_type, "layout": layout, "theme": theme,
            "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest(), **extra}


if __name__ == "__main__":
    main()
