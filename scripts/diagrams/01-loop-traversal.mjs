import { readFileSync, writeFileSync } from "node:fs"
import { diagram } from "./lib.mjs"

const TEXT = {
  es: {
    title: "El índice avanza; la condición se revisa antes de cada vuelta",
    header: "for (let i = 0; i < dogs.length; i++)", array: "dogs", index: "índice", item: "dogs[i]", output: "salida de console.log",
    dogs: ['"Rex"', '"Mimi"', '"Luna"'], rows: ['0: Walking Rex', '1: Walking Mimi', '2: Walking Luna'],
    end: "i = 3 → 3 < 3 es false", stop: "termina el bucle; no lee dogs[3]",
    steps: ["i = 0: leer Rex, imprimir y aumentar i", "i = 1: leer Mimi, imprimir y aumentar i", "i = 2: leer Luna, imprimir y aumentar i", "i = 3: la condición es falsa; terminar"],
  },
  en: {
    title: "The index advances; the condition is checked before each turn",
    header: "for (let i = 0; i < dogs.length; i++)", array: "dogs", index: "index", item: "dogs[i]", output: "console.log output",
    dogs: ['"Rex"', '"Mimi"', '"Luna"'], rows: ['0: Walking Rex', '1: Walking Mimi', '2: Walking Luna'],
    end: "i = 3 → 3 < 3 is false", stop: "the loop ends; it does not read dogs[3]",
    steps: ["i = 0: read Rex, print and increase i", "i = 1: read Mimi, print and increase i", "i = 2: read Luna, print and increase i", "i = 3: the condition is false; finish"],
  },
}

for (const [lang, t] of Object.entries(TEXT)) {
  const d = diagram(980, 650)
  d.label(490, 38, [t.title], { size: 23, weight: 700 })
  d.label(490, 78, [t.header], { size: 21, mono: true })
  d.label(95, 159, [t.array], { size: 21, mono: true })
  t.dogs.forEach((dog, i) => {
    d.box(215 + i * 225, 110, 190, 85, dog, [String(i)], { fill: "#fff0c9" })
  })
  d.label(145, 244, [t.index], { size: 18, weight: 700 })
  d.label(395, 244, [t.item], { size: 18, mono: true, weight: 700 })
  d.label(700, 244, [t.output], { size: 18, weight: 700 })
  t.dogs.forEach((dog, i) => {
    const y = 267 + i * 78
    d.rect(60, y, 860, 62, { fill: "#e7f0ff" })
    d.label(145, y + 40, [`i = ${i}`], { size: 23, mono: true })
    d.label(395, y + 40, [dog], { size: 23, mono: true })
    d.label(700, y + 40, [t.rows[i]], { size: 23, mono: true })
  })
  d.box(160, 518, 660, 80, t.end, [t.stop], { fill: "#e9f7ec" })
  const out = `public/images/01-loop-traversal.${lang}.svg`
  d.save(out)
  const overlays = t.steps.map((text, i) => {
    const p = diagram(980, 650)
    if (i < 3) {
      p.rect(208 + i * 225, 103, 204, 99, { fill: "none", stroke: "#b45309", strokeWidth: 3 })
      p.rect(53, 260 + i * 78, 874, 76, { fill: "none", stroke: "#b45309", strokeWidth: 3 })
    } else p.rect(153, 511, 674, 94, { fill: "none", stroke: "#b45309", strokeWidth: 3 })
    p.label(490, 633, [text], { size: 20, weight: 700, color: "#92400e" })
    const work = `.scratch/codex-lessons/media-m1a/loop-${lang}-${i}.svg`
    p.save(work)
    return `<g class="phase p${i}">${readFileSync(work, 'utf8').split('\n').slice(2, -2).join('\n')}</g>`
  }).join('\n')
  const css = `<style>
    .phase { opacity: 0; animation: visit 12s steps(1, end) infinite; }
    .p0 { animation-delay: 0s; } .p1 { animation-delay: -9s; }
    .p2 { animation-delay: -6s; } .p3 { animation-delay: -3s; }
    @keyframes visit { 0% { opacity: 1; } 25%, 100% { opacity: 0; } }
    @media (prefers-reduced-motion: reduce) { .phase { animation: none; display: none; } }
  </style>`
  writeFileSync(out, readFileSync(out, 'utf8').replace('</svg>', `${css}\n${overlays}\n</svg>`))
}
