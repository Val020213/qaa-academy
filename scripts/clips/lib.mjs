// Shared helper for the clip scripts. See README.md.
import { chromium } from "@playwright/test"
import { spawn, execFileSync } from "node:child_process"
import { mkdirSync, rmSync, readdirSync, renameSync, statSync, existsSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
export const SITE = "http://localhost:5186"
export const SHOP = "http://localhost:5196"
const RAW = path.join(ROOT, ".scratch/raw")
const OUT = path.join(ROOT, "public/clips")

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function up(url) {
  try { const r = await fetch(url); return r.status < 500 } catch { return false }
}

/** Starts a dev server if nothing answers on `url`. Returns a stop() function. */
export async function ensureServer({ url, args, cwd, timeout = 120000 }) {
  if (await up(url)) return () => {}
  const child = spawn("pnpm", args, { cwd, stdio: "ignore", detached: true })
  const t0 = Date.now()
  while (!(await up(url))) {
    if (Date.now() - t0 > timeout) throw new Error("server did not start: " + url)
    await sleep(500)
  }
  return () => { try { process.kill(-child.pid) } catch {} }
}

const CURSOR = `
(() => {
  const add = () => {
    if (document.getElementById("__cur")) return
    const d = document.createElement("div")
    d.id = "__cur"
    d.style.cssText = "position:fixed;left:0;top:0;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;background:rgba(239,68,68,.85);border:2px solid #fff;box-shadow:0 0 6px rgba(0,0,0,.5);pointer-events:none;z-index:2147483647;transition:transform .12s;display:none"
    document.documentElement.appendChild(d)
    const move = (e) => { d.style.display = "block"; d.style.left = e.clientX + "px"; d.style.top = e.clientY + "px" }
    addEventListener("mousemove", move, true)
    addEventListener("mousedown", (e) => { move(e); d.style.transform = "scale(.55)" }, true)
    addEventListener("mouseup", () => { d.style.transform = "scale(1)"
      const r = document.createElement("div")
      r.style.cssText = "position:fixed;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;border:3px solid rgba(239,68,68,.9);pointer-events:none;z-index:2147483646;transition:all .5s ease-out;left:" + d.style.left + ";top:" + d.style.top
      document.documentElement.appendChild(r)
      requestAnimationFrame(() => { r.style.width = "50px"; r.style.height = "50px"; r.style.margin = "-25px 0 0 -25px"; r.style.opacity = "0" })
      setTimeout(() => r.remove(), 600) }, true)
  }
  if (document.documentElement) add(); else document.addEventListener("DOMContentLoaded", add)
  document.addEventListener("DOMContentLoaded", add)
})()
`

/**
 * Records one clip. `fn({ page, ctx, mark, helpers })` runs the scenario.
 * Call `mark()` when the part that matters starts: everything before it is cut.
 * Optional `end` seconds can be trimmed with opts.tail (cut last N seconds).
 */
export async function record(name, fn, opts = {}) {
  const dir = path.join(RAW, name)
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch({ headless: true, ...(opts.launch ?? {}) })
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir, size: { width: 1280, height: 720 } },
    colorScheme: "light",
    ...(opts.context ?? {}),
  })
  await ctx.addInitScript(CURSOR)
  const page = await ctx.newPage()
  const t0 = Date.now()
  let markAt = 0
  let markWall = 0, endWall = 0
  const mark = () => { markWall = Date.now() }
  try {
    await fn({ page, ctx, mark, ...helpers(page) })
  } finally {
    endWall = Date.now()
    await page.close()
    await ctx.close()
    await browser.close()
  }
  const webm = readdirSync(dir).find((f) => f.endsWith(".webm"))
  const raw = path.join(dir, webm)
  const out = path.join(OUT, name + ".webm")
  // The video's start is not aligned with wall-clock, its end is: cut from the end.
  const rawDur = parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", raw]).toString())
  const keep = (endWall - (markWall || t0)) / 1000 + 0.6
  markAt = Math.max(0, rawDur - keep)
  encode(raw, out, markAt)
  rmSync(dir, { recursive: true, force: true })
  const kb = Math.round(statSync(out).size / 1024)
  console.log(`${name}: ${kb} KB`)
  return out
}

export function encode(raw, out, start = 0, crf = 34) {
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-ss", String(start), "-i", raw,
    "-vf", "scale=1280:720,fps=25", "-c:v", "libvpx-vp9", "-crf", String(crf), "-b:v", "0",
    "-an", "-row-mt", "1", "-deadline", "good", "-cpu-used", "2", out])
}

export function helpers(page) {
  const pause = (ms = 900) => sleep(ms)
  /** Smooth mouse move to the centre of a locator. */
  async function moveTo(loc, { steps = 28 } = {}) {
    await loc.scrollIntoViewIfNeeded()
    const b = await loc.boundingBox()
    if (!b) throw new Error("no box")
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps })
  }
  async function click(loc) {
    await moveTo(loc)
    await sleep(250)
    await page.mouse.down(); await sleep(70); await page.mouse.up()
  }
  async function type(loc, text, delay = 60) {
    await click(loc)
    await page.keyboard.type(text, { delay })
  }
  return { pause, moveTo, click, type }
}
