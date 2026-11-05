"""Build a project gallery from an explicitly supplied finished-photo folder.

Originals are read only. WebP exports and a source manifest stay in the project.
"""
from pathlib import Path
from PIL import Image, ImageOps
import argparse
import html
import json
import re

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('project')
    parser.add_argument('source', type=Path)
    parser.add_argument('label')
    parser.add_argument('--heading', default='Full gallery')
    parser.add_argument('--selection', type=Path)
    args = parser.parse_args()
    project = ROOT / 'projects' / args.project
    assert project.is_dir(), project
    sources = sorted(p for p in args.source.iterdir() if p.suffix.lower() in {'.png', '.jpg', '.jpeg', '.tif', '.tiff', '.webp'})
    if args.selection:
        sources = [Path(row['source']) for row in json.loads(args.selection.read_text())]
    assert sources, args.source
    out = project / 'images'
    out.mkdir(exist_ok=True)
    figures, manifest = [], []
    for number, source in enumerate(sources, 1):
        stem = re.sub(r'[^a-z0-9-]+', '-', source.stem.lower()).strip('-')
        with Image.open(source) as original:
            image = ImageOps.exif_transpose(original).convert('RGB')
            full = image.copy()
            full.thumbnail((1920, 1920), Image.Resampling.LANCZOS)
            thumb = image.copy()
            thumb.thumbnail((800, 800), Image.Resampling.LANCZOS)
            full.save(out / f'{stem}.webp', 'WEBP', quality=84, method=6)
            thumb.save(out / f'{stem}-800.webp', 'WEBP', quality=80, method=6)
        base = f'/projects/{args.project}/images/{stem}'
        alt = html.escape(f'{args.label} — photograph {number}', quote=True)
        figures.append(f'<figure><a href="{base}.webp" target="_blank" rel="noopener" aria-label="Open {alt}"><img src="{base}.webp" srcset="{base}-800.webp {thumb.width}w, {base}.webp {full.width}w" sizes="(max-width:760px) 50vw, 33vw" width="{full.width}" height="{full.height}" loading="lazy" decoding="async" alt="{alt}"></a></figure>')
        manifest.append({'source': str(source), 'image': f'images/{stem}.webp', 'thumbnail': f'images/{stem}-800.webp', 'width': full.width, 'height': full.height})
    page = project / 'index.html'
    text = page.read_text(encoding='utf-8')
    gallery = f'<section class="project-full-gallery" aria-label="{html.escape(args.label, quote=True)} gallery"><h2>{html.escape(args.heading)}</h2><p>{len(sources)} photographs</p><div class="seo-gallery project-photo-grid">' + ''.join(figures) + '</div></section>'
    if 'class="project-full-gallery"' in text:
        text = re.sub(r'<section class="project-full-gallery".*?</section>', lambda _: gallery, text, count=1, flags=re.S)
    else:
        text, count = re.subn(r'<div class="seo-gallery">.*?</div>', lambda _: gallery, text, count=1, flags=re.S)
        assert count == 1
    text = re.sub(r'/styles.css\?[^" ]+', '/styles.css?v=project-galleries-20261105', text)
    page.write_text(text, encoding='utf-8')
    (project / 'gallery-manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
    print(f'{args.project}: {len(manifest)} images, {sum(p.stat().st_size for p in out.glob("*.webp"))/1024/1024:.1f} MiB')


if __name__ == '__main__':
    main()
