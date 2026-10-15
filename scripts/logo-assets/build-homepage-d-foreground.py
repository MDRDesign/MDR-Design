"""Export the approved D-in-front homepage revision without altering the old kit."""

import hashlib
import importlib.util
from pathlib import Path
import xml.etree.ElementTree as ET

SPEC = importlib.util.spec_from_file_location(
    "d_foreground_review", Path(__file__).with_name("preview-d-foreground.py")
)
review = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(review)
BRAND = review.build.BRAND
OUT = BRAND / "homepage/d-foreground"
NS = "{http://www.w3.org/2000/svg}"


def main():
    protected = list((BRAND / "svg").glob("*.svg")) + [
        BRAND / "source/approved-geometry.json",
        BRAND / "storage-manifest.json",
    ]
    before = {p: hashlib.sha256(p.read_bytes()).hexdigest() for p in protected}
    OUT.mkdir(parents=True, exist_ok=True)
    for layout in ("lockup", "lockup-small"):
        width, height = review.build.LAYOUTS[layout]["viewBox"]
        svg = (
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" '
            f'viewBox="0 0 {width} {height}" role="img" aria-labelledby="logo-title">'
            f'<title id="logo-title">MDR Design — D-in-front homepage revision — {layout}</title>'
            '<desc>Owner-approved D-over-R crossings. Original letterforms, optical sizing '
            'and outlined MDR Design name preserved. Transparent background.</desc>'
            + review.artwork(layout, proposed=True) + "</svg>\n"
        )
        root = ET.fromstring(svg)
        original = ET.parse(BRAND / f"svg/mdr-design-{layout}-on-dark.svg").getroot()
        paths = root.findall(f"{NS}path")
        old_paths = original.findall(f"{NS}path")
        assert root.attrib["viewBox"] == original.attrib["viewBox"]
        assert len(paths) == 2
        assert paths[0].attrib["d"] != old_paths[0].attrib["d"]
        assert paths[1].attrib == old_paths[1].attrib, "Name lettering must not change"
        file = OUT / f"mdr-design-{layout}-on-dark.svg"
        file.write_text(svg)
        print(file.relative_to(review.build.ROOT))
    assert all(hashlib.sha256(p.read_bytes()).hexdigest() == digest for p, digest in before.items())
    print("Verified: original kit unchanged; only foreground order differs from its masters.")


if __name__ == "__main__":
    main()
