"""Preview D-over-R crossings without changing approved masters or the website."""

import hashlib
import importlib.util
from pathlib import Path
import xml.etree.ElementTree as ET

import pathops
from fontTools.pens.transformPen import TransformPen

SPEC = importlib.util.spec_from_file_location("logo_build", Path(__file__).with_name("build.py"))
build = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(build)
OUT = build.ROOT / "generated-artifacts/mdr-logos/d-foreground-review"


def d_foreground(small):
    spec = build.SOURCE["small" if small else "standard"]
    # Preserve M < D at their shared stem; reverse only D/R foreground order.
    paths = [build.SOURCE["paths"][i] for i in (0, 2, 1)]
    strokes = [build.outlined_stroke(d, spec["strokeWidth"]) for d in paths]
    knockouts = [build.outlined_stroke(d, spec["crossingWidth"]) for d in paths]
    visible = []
    for i, stroke in enumerate(strokes):
        for foreground in knockouts[i + 1:]:
            stroke = pathops.op(stroke, foreground, pathops.PathOp.DIFFERENCE)
        visible.append(stroke)
    result = visible[0]
    for stroke in visible[1:]:
        result = pathops.op(result, stroke, pathops.PathOp.UNION)
    return result


def artwork(layout, proposed):
    spec = build.LAYOUTS[layout]
    width, _ = spec["viewBox"]
    mark = d_foreground(spec["small"]) if proposed else build.MARKS[spec["small"]]
    transformed = pathops.Path()
    mark.draw(TransformPen(transformed.getPen(), spec["transform"]))
    return (
        f'<path fill="#e9a48e" fill-rule="nonzero" d="{build.path_data(transformed)}"/>'
        f'<path fill="#f4f1ea" fill-rule="nonzero" '
        f'd="{build.glyph_path(build.SOURCE["name"], spec["fontSize"], width / 2, spec["baseline"])}"/>'
    )


def main():
    # Verify that this review does not alter production artwork or its source.
    protected = list((build.BRAND / "svg").glob("*.svg")) + [
        build.BRAND / "source/approved-geometry.json",
        build.BRAND / "storage-manifest.json",
    ]
    before = {p: hashlib.sha256(p.read_bytes()).hexdigest() for p in protected}
    OUT.mkdir(parents=True, exist_ok=True)
    parts = [
        '<rect width="1440" height="970" fill="#082b36"/>',
        '<g font-family="DejaVu Sans, sans-serif" fill="#f4f1ea">',
        '<text x="60" y="62" font-size="30">MDR Design — overlap review</text>',
        '<text x="60" y="99" font-size="17">Same letterforms and spacing. Only which letter crosses in front changes.</text>',
        '<path d="M720 140 V860" stroke="#38535b"/>',
    ]
    for proposed, x in [(False, 60), (True, 780)]:
        label = "PROPOSED — D IN FRONT" if proposed else "CURRENT — R IN FRONT"
        parts.append(f'<text x="{x}" y="164" font-size="19" fill="#e9a48e">{label}</text>')
        parts.append(f'<g transform="translate({x + 60} 190) scale(.8)">{artwork("lockup", proposed)}</g>')
        parts.append(f'<text x="{x}" y="623" font-size="16">Compact master at 176px</text>')
        parts.append(f'<g transform="translate({x + 212} 663)">{artwork("lockup-small", proposed)}</g>')
    parts.extend([
        '<text x="60" y="907" font-size="18">Review only — the homepage and approved production files are unchanged.</text>',
        '<text x="60" y="938" font-size="16" fill="#e9a48e">The D is continuous in the proposal; the R breaks at the crossings.</text>',
        '</g>',
    ])
    svg = OUT / "MDR-Design-D-in-front-comparison.svg"
    svg.write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="970" viewBox="0 0 1440 970">'
        '<title>MDR Design: current R foreground and proposed D foreground</title>'
        + "".join(parts) + "</svg>\n"
    )
    ET.parse(svg)
    png = OUT / "MDR-Design-D-in-front-comparison.png"
    build.render(svg, png, 1440)
    assert all(hashlib.sha256(p.read_bytes()).hexdigest() == digest for p, digest in before.items())
    assert build.path_data(d_foreground(False)) != build.path_data(build.MARKS[False])
    print(png.relative_to(build.ROOT))
    print("Verified: production masters, approved geometry and storage manifest unchanged.")


if __name__ == "__main__":
    main()
