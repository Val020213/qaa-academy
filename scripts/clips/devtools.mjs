// Films a headed Chromium with DevTools open on a VIRTUAL display (Xvfb).
// Run through xvfb-run so DISPLAY is the virtual one; never the real screen.
import { chromium } from "@playwright/test"
import { spawn, execFileSync } from "node:child_process"
import { mkdirSync, rmSync, writeFileSync, statSync } from "node:fs"
import path from "node:path"
import { ROOT, sleep, encode, helpers } from "./lib.mjs"

export async function recordDevtools(name, { panel = "elements", dock = "right" }, fn) {
  const disp = process.env.DISPLAY
  if (!disp || disp === ":0" || disp === ":1") throw new Error("run me with xvfb-run (virtual display), DISPLAY=" + disp)
  const tmp = path.join(ROOT, ".scratch/dt-" + name)
  rmSync(tmp, { recursive: true, force: true })
  mkdirSync(path.join(tmp, "profile/Default"), { recursive: true })
  writeFileSync(path.join(tmp, "profile/Default/Preferences"), JSON.stringify({
    devtools: { preferences: {
      "panel-selectedTab": JSON.stringify(panel),
      currentDockState: JSON.stringify(dock),
      uiTheme: JSON.stringify("default"),
    } },
  }))
  const raw = path.join(tmp, "raw.mkv")
  const ctx = await chromium.launchPersistentContext(path.join(tmp, "profile"), {
    headless: false, devtools: true, viewport: null, env: { ...process.env, WAYLAND_DISPLAY: "", XDG_SESSION_TYPE: "x11" },
    args: ["--window-position=0,0", "--window-size=1280,720", "--ozone-platform=x11", "--auto-open-devtools-for-tabs", "--remote-debugging-port=5188", "--remote-allow-origins=*", "--disable-gpu", "--no-first-run", "--disable-infobars"],
  })
  const first = ctx.pages()[0]
  const page = await ctx.newPage()
  if (first) await first.close()
  await sleep(2500)
  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "x11grab", "-framerate", "25", "-video_size", "1280x720", "-i", disp + ".0+0,0", "-c:v", "libx264", "-preset", "ultrafast", raw], { stdio: ["pipe", "inherit", "inherit"] })
  let markT = 0, t0 = Date.now()
  const mark = () => { markT = (Date.now() - t0) / 1000 }
  const dt = await connectDevtools()
  try { await fn({ page, mark, dt, ...helpers(page) }) }
  finally {
    ff.stdin.write("q"); await new Promise((r) => ff.on("exit", r))
    await ctx.close()
  }
  const out = path.join(ROOT, "public/clips", name + ".webm")
  encode(raw, out, markT)
  rmSync(tmp, { recursive: true, force: true })
  console.log(name, Math.round(statSync(out).size / 1024), "KB")
}

function CURSOR_FN() {
  const add = () => {
    if (document.getElementById("__cur") || !document.documentElement) return
    const d = document.createElement("div"); d.id = "__cur"
    d.style.cssText = "position:fixed;left:0;top:0;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;background:rgba(239,68,68,.85);border:2px solid #fff;pointer-events:none;z-index:2147483647;display:none"
    document.documentElement.appendChild(d)
    addEventListener("mousemove", (e) => { d.style.display = "block"; d.style.left = e.clientX + "px"; d.style.top = e.clientY + "px" }, true)
  }
  add(); document.addEventListener("DOMContentLoaded", add)
}

/** Minimal CDP client for the DevTools front-end page (port 5188). */
async function connectDevtools() {
  let target
  for (let i = 0; i < 40 && !target; i++) {
    const list = await (await fetch("http://127.0.0.1:5188/json/list")).json()
    target = list.find((t) => /devtools/.test(t.url))
    if (!target) await sleep(250)
  }
  if (!target) throw new Error("no DevTools front-end target")
  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j })
  let id = 0; const waiting = new Map()
  ws.onmessage = (m) => { const d = JSON.parse(m.data); waiting.get(d.id)?.(d); waiting.delete(d.id) }
  const send = (method, params = {}) => new Promise((r) => { const n = ++id; waiting.set(n, r); ws.send(JSON.stringify({ id: n, method, params })) })
  const key = async (k, code, vk, modifiers = 0, text) => {
    await send("Input.dispatchKeyEvent", { type: text ? "keyDown" : "rawKeyDown", key: k, code, windowsVirtualKeyCode: vk, modifiers, text })
    await send("Input.dispatchKeyEvent", { type: "keyUp", key: k, code, windowsVirtualKeyCode: vk, modifiers })
  }
  return {
    send,
    /** Click at x,y inside the DevTools window (coordinates of the DevTools viewport). */
    async click(x, y) {
      await send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y })
      await send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 })
      await send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 })
    },
    /** Elements panel: Ctrl+F, type a CSS selector, Enter: selects the first match. */
    async search(text) {
      await key("f", "KeyF", 70, 2)
      await sleep(500)
      for (const ch of text) { await send("Input.insertText", { text: ch }); await sleep(45) }
      await sleep(400)
      await key("Enter", "Enter", 13, 0, "\r")
    },
    async shot(n) { const r = await send("Page.captureScreenshot"); (await import("node:fs")).writeFileSync(ROOT + "/.scratch/clips-check/dbg-" + n + ".png", Buffer.from(r.result.data, "base64")) },
    close: () => ws.close(),
  }
}
