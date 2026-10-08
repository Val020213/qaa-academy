import { diagram } from "./lib.mjs"
const TEXT = {
  es: { title: "Bisección: localizar el primer paso que falla", assumption: "Conoces el estado correcto y el error sigue visible después de aparecer.", start: "Buscar en los pasos 1 a 8", four: "Comprobar después del paso 4", wrong: "Estado incorrecto", right: "Estado correcto", left: "Buscar en los pasos 1 a 4", rightRange: "Buscar en los pasos 5 a 8", repeat: "Comprobar el punto medio de esa mitad", footer: "8 candidatos → 4 → 2 → 1, con esas condiciones" },
  en: { title: "Bisection: locate the first failing step", assumption: "You know the correct state and the error stays visible after it appears.", start: "Search steps 1 to 8", four: "Check after step 4", wrong: "Incorrect state", right: "Correct state", left: "Search steps 1 to 4", rightRange: "Search steps 5 to 8", repeat: "Check the midpoint of that half", footer: "8 candidates → 4 → 2 → 1, under those conditions" },
}
for(const [lang,t] of Object.entries(TEXT)) {
  const d=diagram(940,540)
  const shapeBox = d.box
  d.box = (x, y, w, h, title, lines = [], options = {}) => {
    shapeBox(x, y, w, h, "", [], options)
    const top = y + h / 2 - lines.length * 12 + 3
    d.label(x + w / 2, top, [title], { size: 17, weight: 700 })
    lines.forEach((line, i) => d.label(x + w / 2, top + 27 + i * 25, [line], { size: 15 }))
  }
  d.label(470,38,[t.title],{size:23,weight:700})
  d.label(470,76,[t.assumption],{size:17})
  d.box(290,105,360,65,t.start,[],{fill:"#e7f0ff"})
  d.box(290,210,360,65,t.four)
  d.arrow(470,175,470,205)
  d.box(45,330,350,65,t.left,[],{fill:"#fff0ec"})
  d.box(545,330,350,65,t.rightRange,[],{fill:"#e9f7ec"})
  d.arrow(350,280,220,325)
  d.arrow(590,280,720,325)
  d.note(120,308,[t.wrong],{size:17})
  d.label(820,308,[t.right],{size:17})
  d.box(220,430,500,65,t.repeat,[],{fill:"#f0f3f5"})
  d.arrow(220,400,330,425)
  d.arrow(720,400,610,425)
  d.label(470,525,[t.footer],{size:17})
  d.save(`public/images/01b-bisect.${lang}.svg`)
}
