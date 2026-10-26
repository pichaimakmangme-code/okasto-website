#!/bin/sh
# Rebuild everything: python3 build.py -> diagram PNG -> crops/preview -> PDF
set -e; cd "$(dirname "$0")"; OUT=${1:-..}
python3 build.py
node render.js diagram "$OUT/okasto-sitemap-v2.png"
python3 crops.py "$OUT/okasto-sitemap-v2.png" "$OUT/okasto-sitemap-v2-preview.png"
node render.js pdf "$OUT/okasto-sitemap-v2.pdf"
