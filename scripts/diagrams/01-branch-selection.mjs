import { readFileSync, writeFileSync } from "node:fs"
import { diagram } from "./lib.mjs"

const TEXT = {
  es: {
    title: "Node.js toma la primera rama verdadera",
    input: "temperature = 12", first: "temperature < 0", second: "temperature < 15",
    false: "false: probar la siguiente", true: "true: ejecutar esta rama",
    output: "console.log(\"jacket\")", printed: "salida: jacket",
    skipped: "else", notVisited: "no se ejecuta para 12", continue: "Continuar después de la cadena",
    steps: ["1. Leer temperature", "2. 12 < 0 es false", "3. 12 < 15 es true", "4. Imprimir jacket; saltar else"],
  },
  en: {
    title: "Node.js takes the first true branch",
    input: "temperature = 12", first: "temperature < 0", second: "temperature < 15",
    false: "false: try the next one", true: "true: run this branch",
    output: "console.log(\"jacket\")", printed: "output: jacket",
    skipped: "else", notVisited: "does not run for 12", continue: "Continue after the chain",
    steps: ["1. Read temperature", "2. 12 < 0 is false", "3. 12 < 15 is true", "4. Print jacket; skip else"],
  },
}

for (const [lang, t] of Object.entries(TEXT)) {
  const d = diagram(940, 640)
  d.label(470, 38, [t.title], { size: 25, weight: 700 })
  d.box(65, 80, 310, 70, t.input, [], { fill: "#e7f0ff" })
  d.box(65, 200, 310, 85, t.first, [t.false])
  d.box(65, 335, 310, 85, t.second, [t.true], { fill: "#e9f7ec" })
  d.box(535, 335, 335, 85, t.output, [t.printed], { fill: "#e9f7ec" })
  d.box(65, 490, 310, 85, t.skipped, [t.notVisited], { fill: "#f0f3f5", dashed: true })
  d.box(535, 490, 335, 85, t.continue, [], { fill: "#e7f0ff" })
  d.arrow(220, 158, 220, 192)
  d.arrow(220, 293, 220, 327)
  d.arrow(383, 377, 527, 377)
  d.line(220, 428, 220, 482, { dashed: true, stroke: "#9aa5b1" })
  d.arrow(702, 428, 702, 482)
  const out = `public/images/01-branch-selection.${lang}.svg`
  d.save(out)
  const stages = [[65, 80, 310, 70], [65, 200, 310, 85], [65, 335, 310, 85], [535, 335, 335, 85]]
  const overlays = stages.map(([x, y, w, h], i) => {
    const p = diagram(940, 640)
    p.rect(x - 7, y - 7, w + 14, h + 14, { fill: "none", stroke: "#b45309", strokeWidth: 3 })
    p.label(470, 616, [t.steps[i]], { size: 20, weight: 700, color: "#92400e" })
    const work = `.scratch/codex-lessons/media-m1a/branch-${lang}-${i}.svg`
    p.save(work)
    const body = readFileSync(work, "utf8").split('\n').slice(2, -2).join('\n')
    return `<g class="phase p${i}">${body}</g>`
  }).join('\n')
  const css = `<style>
    .phase { opacity: 0; animation: visit 12s steps(1, end) infinite; }
    .p0 { animation-delay: 0s; } .p1 { animation-delay: -9s; }
    .p2 { animation-delay: -6s; } .p3 { animation-delay: -3s; }
    @keyframes visit { 0% { opacity: 1; } 25%, 100% { opacity: 0; } }
    @media (prefers-reduced-motion: reduce) { .phase { animation: none; display: none; } }
  </style>`
  writeFileSync(out, readFileSync(out, "utf8").replace('</svg>', `${css}\n${overlays}\n</svg>`))
}
