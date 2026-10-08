import { diagram } from "./lib.mjs"
const TEXT = {
  es: { title: "Un import con nombre solo puede pedir lo exportado", source: "_shapes.ts", exports: "Con export", private: "Sin export", available: "Disponibles para importar", blocked: "No disponible por import", consumer: "use-shapes.ts", names: ["unit", "squareArea", "circleArea"], secret: "secret", request: 'from "./_shapes.ts"' },
  en: { title: "A named import can only request exported names", source: "_shapes.ts", exports: "With export", private: "Without export", available: "Available to import", blocked: "Unavailable through import", consumer: "use-shapes.ts", names: ["unit", "squareArea", "circleArea"], secret: "secret", request: 'from "./_shapes.ts"' },
}
for(const [lang,t] of Object.entries(TEXT)) {
  const d=diagram(940,480)
  const shapeBox = d.box
  d.box = (x, y, w, h, title, lines = [], options = {}) => {
    shapeBox(x, y, w, h, "", [], options)
    const top = y + h / 2 - lines.length * 12 + 3
    d.label(x + w / 2, top, [title], { size: 17, weight: 700 })
    lines.forEach((line, i) => d.label(x + w / 2, top + 27 + i * 25, [line], { size: 15 }))
  }
  d.label(470,40,[t.title],{size:23,weight:700})
  d.rect(35,80,340,340,{fill:"#f0f3f5"})
  d.label(205,113,[t.source],{weight:700,size:20,mono:true})
  d.box(65,145,280,130,t.exports,t.names,{fill:"#e7f0ff"})
  d.box(65,310,280,80,t.private,[t.secret],{fill:"#fff0ec"})
  d.box(485,145,400,130,t.consumer,[t.names.join(", "),t.request],{fill:"#e9f7ec"})
  d.arrow(350,205,480,205)
  d.label(680,118,[t.available],{size:17})
  d.line(350,350,450,350,{dashed:true})
  d.line(445,338,460,361,{stroke:"#b42318",strokeWidth:3})
  d.line(460,338,445,361,{stroke:"#b42318",strokeWidth:3})
  d.note(485,356,[t.blocked],{size:18,anchor:"start"})
  d.save(`public/images/01b-module-exports.${lang}.svg`)
}
