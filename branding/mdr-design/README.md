# MDR Design — Layered Monoline logo kit

## Approved identity

The owner approved the refined Layered Monoline direction for production files on
October 15, 2026. The M and D share a vertical; the R overlaps the D with transparent
crossing gaps. Preserve those letterforms and the exact name “MDR Design”.
The website has NOT been changed by this asset-preparation work.

## Which files to use

- svg/: production vector masters. All letters and strokes are expanded into
  filled paths. No fonts, embedded raster images, masks or external links are needed.
- png/: transparent RGBA exports rendered directly from the vector masters.
  Widths in filenames are actual pixel widths. Never upscale a PNG; use SVG or
  a larger PNG instead.
- source/: approved centerline geometry, palette and optical-size specifications.
- manifest.json: file dimensions, sizes and SHA-256 checksums.
- MDR-Design-production-proof.png: preview sheet; its colored fields are NOT part
  of the transparent assets.

## Background variants

- on-light: dark teal mark and name, for ivory, white or similar light fields.
- on-dark: coral mark with ivory name, for dark teal or similarly dark fields.
- reversed: ivory mark and name, for one-color reversed use on dark fields.
- ink: near-black mark and name, for monochrome use on light fields.

Do not use light artwork on a light background or dark artwork on a dark one.
Do not place the thin mark over busy photography.

## Sizing and optical variants

- lockup: standard stacked mark and name. Minimum display width 256 CSS pixels.
  PNG widths: 256, 512, 1024, 2048.
- lockup-small: compact stacked version with independently enlarged name and
  slightly strengthened monogram strokes. Use at 128–255 CSS pixels wide.
  At 128px the name is approximately 13px, not an unreadable scaled caption.
  PNG widths: 128, 176, 256.
- mark: initials only; use at 128px or wider. PNG widths: 128, 256, 512, 1024.
- mark-small: initials only, optically strengthened for 32–127px use.
  PNG widths: 32, 48, 64. Below 32px, this thin, overlapping identity is not
  recommended; do not force a full name or detailed monogram into a 16px favicon.

For high-density screens choose a PNG at least twice the CSS display width;
SVG is preferred. CSS width, not a PNG's resolution, determines which optical
version is appropriate. For example a compact logo displayed at 128px may use
the 256px PNG.

Maintain the aspect ratio and included transparent margins. Leave at least the
height of the name's capital M as additional clear space around a lockup.
Do not stretch, add outlines or shadows, change stroke weights, fill the crossing
gaps or rearrange the letters.

The small optical master uses the same approved centerlines with 20-unit strokes
instead of 16 and 44-unit crossing knockouts instead of 40. The shape and rhythm
are unchanged. The independently sized name is intentional, not a different logo.

## Palette

- Dark teal: #082B36 — RGB 8, 43, 54
- Soft coral: #E9A48E — RGB 233, 164, 142
- Ivory: #F4F1EA — RGB 244, 241, 234
- Ink: #141414 — RGB 20, 20, 20

These are sRGB digital masters. For print, give the SVG to your printer and request
a proof with their paper/ink profile; no unverified CMYK or Pantone match is claimed.
Start at 35mm wide for the standard lockup or 25mm for compact and confirm the name
and crossing gaps on the physical proof. Minimum sizes are recommendations, not a
guarantee on every paper, embroidery process or reproduction method.

## Name lettering and licensing

The name uses the exact DejaVu Sans Book face shown on the approved refinement
board, now converted to outlines to prevent font substitution. The monogram is
custom drawn geometry, not a typed font or an automatic trace of a raster concept.
See FONT-LICENSE.txt for the name typeface's license. No font installation is needed
to use the supplied masters or PNGs.

## Regenerating and durable storage

From the repository root run:
  python3 scripts/logo-assets/build.py
  python3 scripts/logo-assets/verify.py

Build dependencies are listed in pyproject.toml. ImageMagick must support SVG.
Set MDR_LOGO_FONT to DejaVuSans.ttf if it is installed elsewhere. The build fails
rather than silently substituting a typeface.

The tracked masters live in branding/mdr-design/. Generated PNGs, proofs and ZIP
are excluded from Git and deployment in generated-artifacts/mdr-logos/production/.
The logo kit is also uploaded to App Storage under a content-addressed prefix.
storage-manifest.json records the relative public object names and checksums.
It contains no credentials or signed URLs.

Uploading the kit does not wire it into the existing website. The current media
route has a strict filename allowlist; adding a future logo route or website
integration requires a separate change. Do not overwrite the provisional homepage
asset while preparing or uploading this kit.
