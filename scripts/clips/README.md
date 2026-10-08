# Lesson clips

One script per clip. Finished files are `public/clips/<name>.webm`, served at
`/clips/<name>.webm`.

## Recording rules

- 1280x720, light theme, no sound, 8-30 seconds, under 1.5 MB.
- A red dot follows the mouse; Playwright video does not draw the cursor.
- Type slowly and pause after each change.
- Call `mark()` after loading to trim the beginning.
- Use a real project copy at `/tmp/qaa-academy` for tool clips. Both the project
  and its installed dependencies must resolve inside that copy.

## Prepare the copy

Requirements: Node.js 24 or newer, pnpm, Python 3, ffmpeg/ffprobe, and Playwright Chromium.
Run this from the source repository root. It includes tracked and new untracked
files, refuses source symlinks, and refuses to overwrite an existing copy.

```bash
export CLIPS_OUT="$PWD/public/clips"
python3 - <<'PY'
from pathlib import Path
import shutil
import subprocess

source = Path.cwd()
target = Path('/tmp/qaa-academy')
if target.exists() or target.is_symlink():
    raise SystemExit('The recording copy already exists; inspect it first.')
excluded = {'node_modules', 'dist', 'test-results', 'playwright-report', '.git', '.' + 'scratch'}
files = set(subprocess.check_output([
    'git', 'ls-files', '-co', '--exclude-standard', '-z'
]).decode().split('\0'))
files = [Path(name) for name in files if name and not any(
    part in excluded for part in Path(name).parts
)]
for relative in files:
    if any(part.is_symlink() for part in (source / relative, *(source / relative).parents)):
        raise SystemExit(f'Source symlink: {relative}')
target.mkdir()
for relative in files:
    destination = target / relative
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source / relative, destination)
PY
cd /tmp/qaa-academy
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
```

Never link the source repository or its `node_modules` into the copy. Install
only in the copy. `CLIPS_OUT` sends the Playwright recordings back to the source repository;
without it, recordings stay in the copy. `CLIPS_WORK` optionally changes the
temporary evidence directory (default `/tmp/qaa-clips-work`).

## Reproduce the five tool clips

Run these **sequentially from `/tmp/qaa-academy`**, keeping `CLIPS_OUT` exported:

```bash
env -u DISPLAY node scripts/clips/html-report.mjs
env -u DISPLAY node scripts/clips/trace-viewer.mjs
env -u DISPLAY node scripts/clips/ui-mode.mjs
env -u DISPLAY node scripts/clips/04-review-mutation.mjs
env -u DISPLAY node scripts/clips/05-order-report.mjs
```

Each script starts its own servers, logs their PIDs, waits for readiness, and
stops those PIDs in `finally`, including when recording fails. It refuses an
occupied port. Do not start additional servers for these five commands.

| Clip | App server | Tool server | Demo |
| --- | --- | --- | --- |
| `html-report` | Course 5186 | HTML report 5189 | `trace-demo` |
| `trace-viewer` | Course 5186 | Trace Viewer 5187 | `trace-demo` |
| `ui-mode` | Course 5186 | UI mode 5188 | `e2e/playground.spec.ts` |
| `04-review-mutation` | Shop 5196 | HTML report 5189 | `report-demo` |
| `05-order-report` | Shop 5196 | HTML report 5189 | `report-demo` |

`tool-session.mjs` runs Playwright directly with `DISPLAY` unset. It generates
temporary reports and traces and checks them with `inspect-artifacts.py` before
opening a tool for filming. The scanner reads trace ZIP members and decodes the
ZIP embedded in the HTML report; it rejects private directory prefixes and the
current home directory basename.

The intentional failures are part of the lesson:

- `trace-demo/demo.spec.ts`: three passes and one failure. The error expects
  “Incorrect email or password.” while the app says “Wrong email or password.”
- `report-demo/recording.spec.ts`: one pass and two failures. The skipped delete
  incorrectly passes with `product-row-`, fails with `products-row-`, and an
  order assertion expects `payed` while the app returns `paid`.

`report-demo/package.json` keeps the original CommonJS setting so the unchanged
spec can import the shop's test helpers.

The helper checks these totals before filming. UI mode first runs the selected
login test with tracing enabled and scans its report and trace. It runs that test
again on camera and scans the UI trace afterward. Generated artifacts are removed
after each recording. UI mode also writes its normal HTML report inside the
copy; remove that with the copy during cleanup.

## Other app clips

These scripts need the relevant app running on the ports above. Start the course
or shop in a separate terminal **inside the copy**, and stop it with Ctrl+C when
finished:

```bash
pnpm exec vite --port 5186 --strictPort
# In another terminal, only if recording shop clips:
cd /tmp/qaa-academy/apps/practice-shop
pnpm exec next dev --port 5196
```

Warm shop pages before filming. From the copy root, for example:

```bash
env -u DISPLAY node scripts/clips/practice-app-tour.mjs
env -u DISPLAY node scripts/clips/shop-tour.mjs
```

Shop scripts reset the demo database before and after recording. Do not use
ports 5180, 5190, 5281, or 5291; those may belong to other projects. Never stop
processes by port or by matching their command names.

## DevTools clips

These also require the course server and `xvfb-run`. DevTools uses port 5188,
so stop UI mode first. From the copy root:

```bash
env -u WAYLAND_DISPLAY XDG_SESSION_TYPE=x11 xvfb-run -a -s "-screen 0 1280x720x24" node scripts/clips/devtools-elements.mjs
env -u WAYLAND_DISPLAY XDG_SESSION_TYPE=x11 xvfb-run -a -s "-screen 0 1280x720x24" node scripts/clips/devtools-network.mjs
```

`devtools.mjs` refuses a real display and films the virtual screen using ffmpeg
`x11grab`. `dt.click(x, y)` uses DevTools coordinates; `dt.search(text)` searches
the Elements panel.

## Inspect and clean up

From the source root, `node scripts/clips/check.mjs` checks the five replacement
videos' dimensions, duration, size, and audio, then extracts full-size frames:
one per second for the five tool clips and one per two seconds for all others.
Frames and `summary.json` go to `/tmp/qaa-clips-work/checks/`. Inspect **every**
frame, including Errors and Source views, for private paths or the machine
owner's username. Sampling cannot prove the absence of text between frames;
inspect the generated data as well.

Once all recording scripts have exited and no terminal or process uses the copy,
remove only `/tmp/qaa-academy` if you created it for this run. Keep the source
repository and its dependencies intact.
