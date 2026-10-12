"""Snapshot tracked nonblank source lines; includes tests, config and comments.
Run: python3 scripts/update-source-lines.py [desktop-directory]
Excludes dependencies, generated outputs, model/data artifacts and generated Next.js declarations.
"""
from pathlib import Path
import datetime
import json
import subprocess
import sys

roots = {'session-shelf': 'projects/personal', 'ti-oracle': 'model2/dota_2', 'Gaz': 'projects/Gaz', 'wc26': 'model'}
extensions = {'.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.py', '.dart', '.sql', '.prisma', '.css', '.html'}
excluded = {'node_modules', 'dist', 'build', '.next', 'release', 'data', 'models', 'artifacts'}
base = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.home() / 'Desktop'
counts = {}
for repo, folder in roots.items():
    root = base / folder
    files = subprocess.check_output(['git', 'ls-files', '-z'], cwd=root).decode().split('\0')
    total = 0
    for filename in files:
        path = Path(filename)
        if path.suffix not in extensions or path.name == 'next-env.d.ts' or excluded.intersection(path.parts):
            continue
        total += sum(bool(line.strip()) for line in (root / path).read_text(errors='replace').splitlines())
    counts[repo] = total
output = Path(__file__).resolve().parents[1] / 'lib/source-lines.json'
output.write_text(json.dumps({'measuredOn': datetime.date.today().isoformat(), 'counts': counts}, indent=2) + '\n')
print(json.dumps(counts, indent=2))
