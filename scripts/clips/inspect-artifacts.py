"""Check report payloads and trace members before they are shown in a clip."""
import base64
import io
import os
from pathlib import Path
import re
import sys
import zipfile

forbidden = [f"/{name}/".encode() for name in ("data", "home")]
owner = Path(os.environ.get("HOME", "")).name
if owner:
    forbidden.append(owner.encode())
checked = 0

def inspect(data, label):
    global checked
    checked += 1
    for needle in forbidden:
        if needle in data:
            raise SystemExit(f"Private path or user name found in {label}")
    if zipfile.is_zipfile(io.BytesIO(data)):
        with zipfile.ZipFile(io.BytesIO(data)) as archive:
            for member in archive.namelist():
                inspect(member.encode(), f"{label}: member name")
                inspect(archive.read(member), f"{label}:{member}")
    for payload in re.findall(rb'data:application/zip;base64,([A-Za-z0-9+/=]+)', data):
        inspect(base64.b64decode(payload), f"{label}: embedded report ZIP")

if not sys.argv[1:]:
    raise SystemExit("Pass a report or trace directory to inspect")
for argument in sys.argv[1:]:
    source = Path(argument)
    if not source.exists():
        raise SystemExit(f"Missing artifact path: {source}")
    paths = sorted(source.rglob("*")) if source.is_dir() else [source]
    for path in paths:
        if path.is_file():
            inspect(path.read_bytes(), str(path))
if not checked:
    raise SystemExit("No artifacts found to inspect")
print(f"Privacy scan passed: {checked} files, ZIP members, and member names checked")
