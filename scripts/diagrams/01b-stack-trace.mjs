import { diagram } from "./lib.mjs"
import { readFileSync, writeFileSync } from "node:fs"

const TEXT = {
  es: { title: "De la caída a quien llamó", frames: ["getName · demo.ts:6:16", "printName · demo.ts:10:15", "demo.ts:13:1"], details: ["return found.name", "console.log(getName(id))", "printName(2)"], notes: ["Caída: found es undefined", "Llamó a getName con id = 2", "Pide un id que no está en dogs"], cause: "Revisar también la línea 5", explanation: ["find devuelve undefined", "as Dog oculta esa posibilidad"], footer: "Leer de arriba abajo; manejar un id ausente en getName." },
  en: { title: "From the crash to the caller", frames: ["getName · demo.ts:6:16", "printName · demo.ts:10:15", "demo.ts:13:1"], details: ["return found.name", "console.log(getName(id))", "printName(2)"], notes: ["Crash: found is undefined", "Called getName with id = 2", "Requests an id absent from dogs"], cause: "Also inspect line 5", explanation: ["find returns undefined", "as Dog hides that possibility"], footer: "Read from top to bottom; handle a missing id in getName." },
}

for (const [lang,t] of Object.entries(TEXT)) {
  const d = diagram(940,580)
  const shapeBox = d.box
  d.box = (x, y, w, h, title, lines = [], options = {}) => {
    shapeBox(x, y, w, h, "", [], options)
    const top = y + h / 2 - lines.length * 12 + 3
    d.label(x + w / 2, top, [title], { size: 17, weight: 700 })
    lines.forEach((line, i) => d.label(x + w / 2, top + 27 + i * 25, [line], { size: 15 }))
  }
  d.label(470,40,[t.title],{size:24,weight:700})
  for(let i=0;i<3;i++) {
    const y = 95 + i*135
    d.box(45,y,395,100,t.frames[i],[t.details[i]],{fill:i===0?"#fff0ec":"#e7f0ff"})
    d.label(485,y+(i===2?40:58),[t.notes[i]],{anchor:"start",size:18})
    if(i<2) d.arrow(240,y+105,240,y+130)
  }
  d.box(500,440,395,85,t.cause,t.explanation,{fill:"#fff7d6",dashed:true})
  d.arrow(455,147,480,147,{dashed:true})
  d.label(470,553,[t.footer],{size:17})
  const file=`public/images/01b-stack-trace.${lang}.svg`
  d.save(file)
  const rings = [0,1,2].map(i=>{
    const ring=diagram(940,580)
    ring.rect(40,90+i*135,405,110,{stroke:"#2563eb",strokeWidth:3,roughness:0.8})
    const temp=`.scratch/codex-lessons/media-m1b/stack-ring-${i}.svg`
    ring.save(temp)
    return `<g class="step step-${i}">${readFileSync(temp,"utf8").match(/<path[^>]+\/>/g).join("\n")}</g>`
  })
  const style=`<style>
.step { opacity: 1 }
@media (prefers-reduced-motion: no-preference) {
.step { animation: trace 12s steps(1, end) infinite; opacity: 0 }
.step-1 { animation-delay: -8s }
.step-2 { animation-delay: -4s }
@keyframes trace { 0%, 33% { opacity: 1 } 33.334%, 100% { opacity: 0 } }
}
@media (prefers-reduced-motion: reduce) { .step { animation: none; opacity: 1 } }
</style>`
  writeFileSync(file,readFileSync(file,"utf8").replace("</svg>",`${style}\n${rings.join("\n")}\n</svg>`))
}
