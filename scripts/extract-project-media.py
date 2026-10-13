#!/usr/bin/env python3
"""Extract authentic UI designs from source PDFs for the portfolio galleries.

Usage:
  python3 -m pip install pymupdf pillow
  python3 scripts/extract-project-media.py \
    --aimzo "/path/to/AIMZO (1).pdf" \
    --agrospeak "/path/to/AgroSpeak Connect — Farmer app prototype(1).pdf"
  npm run media:sync

No generated/mock screens: only pixels rendered or extracted from the supplied PDFs.
The original PDFs are not published; only exportable project screens are saved.
"""
import argparse
import io
import sys
from pathlib import Path

try:
    import fitz
    from PIL import Image
except ImportError:
    sys.exit("Install dependencies with: python3 -m pip install pymupdf pillow")

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "projects"
DEFAULT_AIMZO = (0, 1, 2, 3, 4, 5, 8, 10, 13)
DEFAULT_AGROSPEAK = (0, 1, 2, 3, 4, 5, 7, 10, 15, 20, 25, 30)

def export_image(image, destination, max_width, quality):
    if image.mode not in ("RGB", "RGBA"):
        image = image.convert("RGB")
    if image.mode == "RGBA":
        back = Image.new("RGB", image.size, "white")
        back.paste(image, mask=image.getchannel("A"))
        image = back
    image.thumbnail((max_width, 1400), Image.Resampling.LANCZOS)
    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(destination, "WEBP", quality=quality, method=5)
    print(f"  {destination.relative_to(ROOT)} ({destination.stat().st_size // 1024} KB)")

def export_aimzo(pdf, all_pages=False):
    target = OUTPUT / "aimzo"
    document = fitz.open(pdf)
    pages = range(len(document)) if all_pages else DEFAULT_AIMZO
    print(f"AIMZO: {len(document)} PDF pages")
    for page_index in pages:
        if page_index >= len(document): continue
        page = document[page_index]
        # AIMZO exports contain large, flattened design boards. Pull the source
        # image directly instead of expensive, lower-quality raster re-rendering.
        images = sorted(page.get_images(full=True), key=lambda item: item[2]*item[3], reverse=True)
        saved = False
        seen = set()
        for item in images:
            xref, width, height = item[:3][0], item[2], item[3]
            if xref in seen or width < 600 or height < 400: continue
            seen.add(xref)
            try:
                data = document.extract_image(xref)
                raw = Image.open(io.BytesIO(data["image"])).convert("RGB")
                export_image(raw, target / f"page-{page_index+1:02}.webp", 1100, 78)
                saved = True
                break
            except (ValueError, OSError):
                continue
        if not saved:
            # Fallback for vector-based pages; keep the rasterization modest.
            pixels = page.get_pixmap(matrix=fitz.Matrix(.42,.42), alpha=False)
            raw = Image.frombytes("RGB", [pixels.width,pixels.height], pixels.samples)
            export_image(raw, target / f"page-{page_index+1:02}.webp", 1100, 78)
    document.close()

def export_agrospeak(pdf, all_pages=False):
    target = OUTPUT / "agrospeak"
    document = fitz.open(pdf)
    pages = range(len(document)) if all_pages else DEFAULT_AGROSPEAK
    print(f"AgroSpeak: {len(document)} PDF pages")
    for page_index in pages:
        if page_index >= len(document): continue
        page = document[page_index]
        pixels = page.get_pixmap(matrix=fitz.Matrix(1.5,1.5), alpha=False)
        raw = Image.frombytes("RGB", [pixels.width,pixels.height], pixels.samples)
        export_image(raw, target / f"screen-{page_index+1:02}.webp", 550, 78)
    document.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--aimzo", type=Path)
    parser.add_argument("--agrospeak", type=Path)
    parser.add_argument("--all-pages", action="store_true",
                        help="Export every PDF page rather than selected representative screens")
    args = parser.parse_args()
    if not args.aimzo and not args.agrospeak:
        parser.error("Specify --aimzo and/or --agrospeak")
    for path in (args.aimzo,args.agrospeak):
        if path and not path.is_file(): parser.error(f"PDF not found: {path}")
    if args.aimzo: export_aimzo(args.aimzo,args.all_pages)
    if args.agrospeak: export_agrospeak(args.agrospeak,args.all_pages)
    print("Run npm run media:sync to update the portfolio gallery manifest.")
