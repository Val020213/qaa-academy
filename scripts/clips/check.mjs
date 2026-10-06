// Extracts start/middle/end frames of every clip into .scratch/clips-check/
import { execFileSync } from "node:child_process"
import { readdirSync, mkdirSync } from "node:fs"
import { ROOT } from "./lib.mjs"
const out = ROOT + "/.scratch/clips-check"; mkdirSync(out, { recursive: true })
for (const f of readdirSync(ROOT + "/public/clips").filter((f) => f.endsWith(".webm"))) {
  const p = ROOT + "/public/clips/" + f
  const d = parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]).toString())
  console.log(f, d.toFixed(1) + "s")
  ;[["a", 0.3], ["b", d / 2], ["c", Math.max(0, d - 0.6)]].forEach(([k, t]) =>
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-ss", String(t), "-i", p, "-frames:v", "1", "-vf", "scale=640:-1", `${out}/${f.replace(".webm", "")}-${k}.png`]))
}
