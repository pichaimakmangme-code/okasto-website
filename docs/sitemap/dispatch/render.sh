#!/bin/sh
# Render dispatch Mermaid diagrams to PNG with Noto Sans Thai.
# Needs @mermaid-js/mermaid-cli (mmdc) and Google Chrome.
set -e
cd "$(dirname "$0")"
MMDC="${MMDC:-/tmp/mermaid-cli/node_modules/.bin/mmdc}"
OUT="${1:-.}"
mkdir -p "$OUT"
for name in sitemap flow-job flow-onboarding flow-daily; do
  "$MMDC" \
    -i "$name.mmd" \
    -o "$OUT/dispatch-$name.png" \
    -b white \
    -w 1600 \
    -s 2 \
    -c mermaid.config.json \
    -C mermaid.css \
    -p puppeteer.json
done
echo "rendered in $OUT"
