# Lesson clips

Short screen recordings used in the lessons. One script per clip. The finished
files go to `public/clips/<name>.webm` (served at `/clips/<name>.webm`).

## Rules for every clip

- 1280x720, light theme, no sound, 8-30 seconds, one idea, under 1.5 MB.
- A red dot follows the mouse (Playwright video does not draw the mouse).
- Slow typing (about 60 ms per key) and a pause after each change.
- `mark()` in a script cuts everything before it, so there is no loading at the start.

## Requirements

- `ffmpeg`, plus `xvfb-run` for the two DevTools clips.
- Ports: course site 5186, shop 5196, trace viewer 5187, UI mode 5188,
  HTML report 5189 (5188 is also used by the DevTools clips, one at a time).
- Do not use 5180, 5190, 5281, 5291 (other projects).

## Start the apps

```bash
pnpm exec vite --port 5186 --strictPort                              # from the repo root
cd apps/practice-shop && pnpm exec next dev --port 5196              # then open every page once (first load is slow)
```

Stop them when you finish (by process id, or `fuser -k 5186/tcp`).

## Clips that only need the apps

```bash
cd scripts/clips
for n in practice-app-tour test-run-headed auto-wait-report strict-mode-rows \
         theme-and-language shop-tour shop-delete-dialog shop-form-validation shop-viewer-role; do
  node $n.mjs
done
```

The shop scripts call `POST /api/test/reset` before (and after) so the data is clean.

## Tool clips (trace viewer, HTML report, UI mode)

`trace-demo/` holds a copy of four Practice app tests where one fails on purpose.

```bash
# 1. make the trace and the report in a temp folder (nothing goes to e2e/ or playwright-report/)
cd scripts/clips/trace-demo
TRACE_OUT=/tmp/qaa-trace/out REPORT_OUT=/tmp/qaa-trace/report QAA_E2E_PORT=5186 \
  pnpm exec playwright test -c playwright.config.ts            # 1 failed, 3 passed is expected

# 2. serve them (env -u DISPLAY: never open a window on your screen)
env -u DISPLAY pnpm exec playwright show-trace  --host 127.0.0.1 --port 5187 /tmp/qaa-trace/out/demo-rejects-wrong-credentials-chromium/trace.zip &
env -u DISPLAY pnpm exec playwright show-report --host 127.0.0.1 --port 5189 /tmp/qaa-trace/report &
# (from the repo root) UI mode:
QAA_E2E_PORT=5186 env -u DISPLAY pnpm exec playwright test --ui-host 127.0.0.1 --ui-port 5188 &

# 3. film
node trace-viewer.mjs; node html-report.mjs; node ui-mode.mjs
```

Stop the three servers with `fuser -k 5187/tcp 5188/tcp 5189/tcp`.

## DevTools clips (virtual display)

`devtools.mjs` opens a headed Chromium with DevTools docked, on an Xvfb screen,
and films that screen with ffmpeg `x11grab`. It refuses to run on a real display.
Unset the Wayland variables so Chromium cannot open a window on your desktop:

```bash
env -u WAYLAND_DISPLAY XDG_SESSION_TYPE=x11 xvfb-run -a -s "-screen 0 1280x720x24" node devtools-elements.mjs
env -u WAYLAND_DISPLAY XDG_SESSION_TYPE=x11 xvfb-run -a -s "-screen 0 1280x720x24" node devtools-network.mjs
```

DevTools is driven through the DevTools protocol (remote debugging on port 5188):
`dt.click(x, y)` uses the coordinates of the DevTools page, `dt.search(text)` is
Ctrl+F in the Elements panel.

## Check the result

`node check.mjs` writes three frames per clip to `.scratch/clips-check/`. Look at them.
