# OKASTO website sitemap v2

Proposal for CEO review (26 Oct 2026). Exports:

- `okasto-sitemap-v2.png` – full diagram (7680 px wide)
- `okasto-sitemap-v2-preview.png` – 1600 px preview
- `okasto-sitemap-v2.pdf` – 18-page A4 document: cover, overview + zooms, structure summary, page-by-page spec, journeys, benchmark, roadmap, assumptions

## Rebuild

```sh
cd docs/sitemap/src && ./make.sh ..   # needs python3 + Pillow, Playwright (pwtool) and Chrome
```

All page data lives in `src/data.py` (one entry per page: group, level, URL, status, key content, CTA, index).
`build.py` generates `diagram.html` and `doc.html`; `render.js` renders PNG/PDF; `crops.py` makes zooms + preview.
Fonts load from `../../../fonts` (repo fonts folder).

Rules: no bank details, no hotline number, partners as text only (no logos), payment online via Beam only.

The dispatch demo (`/dispatch`, driver app, freelancer sign-up, dispatch desk) is included as built pages. Those URLs are `noindex`, example data, and are not linked from the public site. Do not list them in a future `sitemap.xml`.
