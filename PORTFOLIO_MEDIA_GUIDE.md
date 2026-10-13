# Portfolio V2: adding projects, images, and exhibitions

All projects, zones and galleries are **data-driven**. Existing white 3D world
geometry and the CovianHive color palette remain unchanged.

## Add a project
Edit `src/data/site-data.json` under `portfolio.projects` and add:
```json
{
  "id": "new-project",
  "title": "Real project name",
  "zoneId": "design",
  "discipline": "UI/UX",
  "strapline": "Verified one-line description",
  "status": "Prototype",
  "role": "Verified contribution",
  "problem": "What needed to be solved",
  "contribution": "What was actually completed",
  "details": ["Verified step"],
  "tech": ["Figma"],
  "link": "https://example.com/public-case-study",
  "linkLabel": "View case study",
  "media": {"placeholder": true, "label": "Original media pending"}
}
```
There are no source-code edits needed in `World.jsx`, `Zone.jsx`, or
`Terminal.jsx`. Project cards appear automatically in their zone. Three
projects are visible at a time; extra projects use the in-world pager.

A project may set `published: false` to hide it from public discovery.
Use only accurately documented claims and approved client media.

## Add or change a 3D area
Edit `src/data/site-data.json` under `zones`, specifying `id`,
`label`, `short`, `description`, `color` and optional
`position: [x,0,z]`. Without a position, a new area receives an outer-ring
position automatically. The six original areas retain their saved coordinates.

## Add real screenshots without touching the components
Copy authorized screenshots to:

```
public/projects/aimzo/overview.webp
public/projects/aimzo/customer.webp
public/projects/aimzo/provider.webp
public/projects/agrospeak/screen-01.webp
public/projects/agrospeak/screen-02.webp
```

The directory name must match the project's `id`. PNG, JPEG, WebP, AVIF
and SVG assets are supported. Run:

```bash
npm run media:sync
npm run check
```

This builds `src/data/project-media.json`. Screens then appear
automatically in **both** the 3D hover preview and case-study gallery.
One-finger cursor points or clicks; a two-finger touchpad gesture over the
3D world moves through the world. A two-finger gesture **over the gallery**
changes screenshots. Touchscreen users swipe gallery images directly.

## Extract images from the supplied project PDFs
Install locally:
```bash
python3 -m pip install pymupdf pillow
```
Then run:
```bash
python3 scripts/extract-project-media.py \
  --aimzo "/path/to/AIMZO (1).pdf" \
  --agrospeak "/path/to/AgroSpeak Connect — Farmer app prototype(1).pdf"
npm run media:sync
```

Add `--all-pages` to export all pages (may take time for the 82-page
AIMZO document). The script extracts genuine source artwork where possible,
and renders original page pixels otherwise. It **never creates mockups**.

The source PDFs are not copied to a public repository automatically.
Check client/publication permissions and examine exported screens for private
information before committing.

## Update captions
Edit `src/data/project-media.json`: each image supports `src`, `alt`,
`caption` and `kind`. `npm run media:sync` preserves existing captions
for matching filenames.

## Usage and QA
- Hover or focus a project terminal to inspect its screenshot gallery.
- Swipe or use the gallery's **left/right arrows** without entering details.
- Click the separate **View project** control to open the full case study.
- Full project details use the same data-driven gallery.
- `npm run check` validates project/zone references, gallery wiring,
  session behavior, and the production build.
- All changes are developed on `port-v2`; do not modify `main`.
