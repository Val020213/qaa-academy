import { diagram } from "./lib.mjs"
import { readFileSync, writeFileSync } from "node:fs"

const TEXT = {
  es: { title: "Primero seleccionar objetos, luego leer sus títulos", input: "playlist: 4 objetos", filter: "filter", selected: "Array nuevo: mismos objetos", map: "map", output: "Array nuevo: textos", rule: 'song.artist === "Mia"', read: "song.title", footer: "Estos callbacks dejan playlist sin cambios.", songs: ["Blue · Mia", "Rain Dance · Tomas", "Sunday · Mia", "Echo · Lena"], titles: ['"Blue"', '"Sunday"'] },
  en: { title: "First select objects, then read their titles", input: "playlist: 4 objects", filter: "filter", selected: "New array: same objects", map: "map", output: "New array: strings", rule: 'song.artist === "Mia"', read: "song.title", footer: "These callbacks leave playlist unchanged.", songs: ["Blue · Mia", "Rain Dance · Tomas", "Sunday · Mia", "Echo · Lena"], titles: ['"Blue"', '"Sunday"'] },
}

for (const [lang, t] of Object.entries(TEXT)) {
  const d = diagram(940, 560)
  const shapeBox = d.box
  d.box = (x, y, w, h, title, lines = [], options = {}) => {
    shapeBox(x, y, w, h, "", [], options)
    const top = y + h / 2 - lines.length * 12 + 3
    d.label(x + w / 2, top, [title], { size: 17, weight: 700 })
    lines.forEach((line, i) => d.label(x + w / 2, top + 27 + i * 25, [line], { size: 15 }))
  }
  d.label(470, 40, [t.title], { size: 23, weight: 700 })
  d.box(30, 95, 270, 175, t.input, t.songs, { fill: "#e7f0ff" })
  d.box(340, 115, 260, 105, t.filter, [t.rule])
  d.box(640, 95, 270, 175, t.selected, [t.songs[0], t.songs[2]], { fill: "#e9f7ec" })
  d.arrow(305, 165, 335, 165)
  d.arrow(605, 165, 635, 165)
  d.box(640, 330, 270, 100, t.map, [t.read])
  d.arrow(775, 275, 775, 325)
  d.box(340, 320, 260, 120, t.output, t.titles, { fill: "#e9f7ec" })
  d.arrow(635, 380, 605, 380)
  d.label(470, 505, [t.footer], { size: 18 })
  const file = `public/images/01b-filter-map.${lang}.svg`
  d.save(file)
  const rings = [[25, 90, 280, 185], [335, 90, 580, 185], [335, 315, 580, 130]].map(([x,y,w,h], i) => {
    const ring = diagram(940,560)
    ring.rect(x,y,w,h,{stroke:"#2563eb",strokeWidth:3,roughness:0.8})
    const temp = `.scratch/codex-lessons/media-m1b/filter-ring-${i}.svg`
    ring.save(temp)
    const paths = readFileSync(temp,"utf8").match(/<path[^>]+\/>/g).join("\n")
    return `<g class="step step-${i}">${paths}</g>`
  })
  const style = `<style>
.step { opacity: 1 }
@media (prefers-reduced-motion: no-preference) {
.step { animation: focus 12s steps(1, end) infinite; opacity: 0 }
.step-1 { animation-delay: -8s }
.step-2 { animation-delay: -4s }
@keyframes focus { 0%, 33% { opacity: 1 } 33.334%, 100% { opacity: 0 } }
}
@media (prefers-reduced-motion: reduce) { .step { animation: none; opacity: 1 } }
</style>`
  writeFileSync(file,readFileSync(file,"utf8").replace("</svg>",`${style}\n${rings.join("\n")}\n</svg>`))
}
