#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
# Reuse genuine published-site captures. Only resize/crop; never synthesize site content.
# JPEG is broadly supported by share crawlers; these cards are small, checked-in web assets.
for project in armada-catering wizfix; do
  if [[ "$project" == armada-catering ]]; then
    source=armada-desktop.webp
    title=Armada-Catering
    background='#182529'
    accent='#D7BE80'
    offset=40
  else
    source=wizfix-desktop.webp
    title='WizFix Computers'
    background='#14233B'
    accent='#59D4DF'
    offset=90
  fi
  magick "public/media/$source" -resize 1200x \
    -crop "1200x486+0+$offset" +repage \
    -gravity north -background "$background" -splice 0x144 \
    -gravity northwest -font DejaVu-Sans-Bold -fill white -pointsize 54 \
    -annotate +48+28 "$title" \
    -font DejaVu-Sans -fill "$accent" -pointsize 24 \
    -annotate +50+98 'WEBSITE CASE STUDY  /  MDR DESIGN' \
    -strip -sampling-factor 4:2:0 -quality 86 "public/media/og-$project.jpg"
done
