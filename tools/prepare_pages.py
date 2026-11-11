"""Stage tracked public website files for GitHub Pages without local work folders."""
from pathlib import Path
import shutil
import subprocess

root = Path.cwd()
destination = root / "_site"
if destination.exists():
    raise SystemExit("_site already exists; use a fresh checkout for publishing.")
public_folders = {"assets", "about", "agency", "contact", "projects", "services"}
root_extensions = {".html", ".css", ".js", ".xml", ".txt", ".png", ".svg", ".ico", ".webp", ".json", ".webmanifest"}
files = subprocess.check_output(["git", "ls-files", "-z"]).decode("utf-8").split("\0")
count = 0
for filename in files:
    if not filename:
        continue
    relative = Path(filename)
    allowed = (len(relative.parts) > 1 and relative.parts[0] in public_folders) or (len(relative.parts) == 1 and (relative.suffix in root_extensions or filename in {"CNAME", ".nojekyll"}))
    if not allowed:
        continue
    source = root / relative
    if source.is_symlink() or not source.is_file():
        raise SystemExit(f"Missing or unsupported public file: {relative}")
    target = destination / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, target)
    count += 1
if not (destination / "index.html").is_file():
    raise SystemExit("Homepage is missing from the publishing artifact.")
print(f"Prepared {count} public files for GitHub Pages.")
