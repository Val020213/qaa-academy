import { execFileSync } from "node:child_process"
import { readdirSync, mkdirSync, statSync, rmSync, writeFileSync } from "node:fs"
import path from "node:path"
import { WORK, OUT } from "./lib.mjs"

const targets = new Set(["html-report", "trace-viewer", "ui-mode", "04-review-mutation", "05-order-report"])
const out = path.join(WORK, "checks")
mkdirSync(out, { recursive: true })
const results = []
for (const file of readdirSync(OUT).filter(file => file.endsWith(".webm")).sort()) {
  const input = path.join(OUT, file)
  const name = file.slice(0, -5)
  const metadata = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", input]))
  const video = metadata.streams.find(stream => stream.codec_type === "video")
  const duration = Number(metadata.format.duration)
  const bytes = statSync(input).size
  if (targets.has(name) && (video.width !== 1280 || video.height !== 720 || duration < 8 || duration > 30 || bytes >= 1500000 || metadata.streams.some(stream => stream.codec_type === "audio"))) {
    throw new Error(`Clip rules failed: ${file}`)
  }
  const folder = path.join(out, name)
  rmSync(folder, { recursive: true, force: true })
  mkdirSync(folder)
  const fps = targets.has(name) ? "1" : "1/2"
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", input, "-vf", `fps=${fps}`, "-fps_mode", "vfr", path.join(folder, "%03d.png")])
  const frames = readdirSync(folder).length
  results.push({ clip: file, duration, bytes, width: video.width, height: video.height, fps, frames })
  console.log(`${file}: ${duration.toFixed(2)}s, ${bytes} bytes, ${frames} frames (${fps}/s)`)
}
writeFileSync(path.join(out, "summary.json"), JSON.stringify(results, null, 2) + "\n")
console.log(`Inspect all frames in ${out}; extraction does not verify privacy.`)
