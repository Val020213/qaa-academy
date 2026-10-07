// Hand-drawn diagrams for the lessons, as SVG files in public/images/.
// Shapes come from Rough.js (the library behind Excalidraw's look); text stays
// in a plain font so it is easy to read. Run one diagram with:
//   node scripts/diagrams/<name>.mjs
import { mkdirSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"
import rough from "roughjs"

const INK = "#1f2933"
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

export function diagram(width, height) {
  const gen = rough.generator({ options: { seed: 7, roughness: 1.3, bowing: 1.2, stroke: INK, strokeWidth: 1.6 } })
  const out = []
  const draw = (d, dashed = false) => {
    for (const p of gen.toPaths(d)) {
      // Only the outline is dashed, never the fill.
      const dash = dashed && p.stroke !== "none" ? ' stroke-dasharray="7 6"' : ""
      out.push(`<path d="${p.d}" stroke="${p.stroke}" stroke-width="${p.strokeWidth}" fill="${p.fill ?? "none"}"${dash} stroke-linecap="round" stroke-linejoin="round"/>`)
    }
  }
  const text = (x, y, lines, { size = 17, weight = 400, color = INK, anchor = "middle", mono = false, id } = {}) => {
    lines.forEach((line, i) => {
      out.push(`<text${id ? ` id="${esc(id)}"` : ""} x="${x}" y="${y + i * size * 1.3}" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}"${mono ? ' font-family="monospace"' : ""}>${esc(line)}</text>`)
    })
  }
  return {
    path(data, opts = {}) {
      draw(gen.path(data, { fillStyle: "solid", ...opts }))
    },
    curve(points, opts = {}) {
      draw(gen.curve(points, opts))
    },
    ellipse(x, y, w, h, opts = {}) {
      draw(gen.ellipse(x, y, w, h, { fillStyle: "solid", ...opts }))
    },
    polygon(points, opts = {}) {
      draw(gen.polygon(points, { fillStyle: "solid", ...opts }))
    },
    line(x1, y1, x2, y2, { dashed = false, ...opts } = {}) {
      draw(gen.line(x1, y1, x2, y2, opts), dashed)
    },
    rect(x, y, w, h, opts = {}) {
      draw(gen.rectangle(x, y, w, h, { fillStyle: "solid", ...opts }))
    },
    /** A box with a bold title and smaller lines under it. */
    box(x, y, w, h, title, lines = [], { fill = "#fff7d6", dashed = false } = {}) {
      draw(gen.rectangle(x, y, w, h, { fill, fillStyle: "solid" }), dashed)
      const top = y + h / 2 - (lines.length * 20) / 2 + 3
      text(x + w / 2, top, [title], { weight: 700 })
      text(x + w / 2, top + 23, lines, { size: 15 })
    },
    /** An arrow from one point to another. */
    arrow(x1, y1, x2, y2, { dashed = false } = {}) {
      draw(gen.line(x1, y1, x2, y2), dashed)
      const a = Math.atan2(y2 - y1, x2 - x1)
      for (const s of [-1, 1]) {
        draw(gen.line(x2, y2, x2 - 11 * Math.cos(a + s * 0.45), y2 - 11 * Math.sin(a + s * 0.45)))
      }
    },
    note(x, y, lines, opts = {}) {
      text(x, y, lines, { size: 15, color: "#b42318", ...opts })
    },
    label(x, y, lines, opts = {}) {
      text(x, y, lines, opts)
    },
    save(path) {
      mkdirSync(dirname(path), { recursive: true })
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif">\n<rect width="${width}" height="${height}" fill="#ffffff"/>\n${out.join("\n")}\n</svg>\n`
      writeFileSync(path, svg)
      console.log("wrote", path)
    },
  }
}
