import { diagram } from "./lib.mjs"
const TEXT = {
  es: { title: "Dos valores iguales pueden ser reglas independientes", pizza: "Regla de la pizzería", titles: "Regla de los títulos", first: "MAX_TOPPINGS = 10", second: "MAX_TITLE_LENGTH = 10", change: "La pizzería permite más", changed: "MAX_TOPPINGS = 12", stays: "El límite del título sigue igual", effect: "Hasta 12 ingredientes", unchanged: "Hasta 10 caracteres", footer: "Un cambio de ingredientes no cambia los títulos." },
  en: { title: "Equal values can belong to independent rules", pizza: "Pizza shop rule", titles: "Playlist title rule", first: "MAX_TOPPINGS = 10", second: "MAX_TITLE_LENGTH = 10", change: "The pizza shop allows more", changed: "MAX_TOPPINGS = 12", stays: "The title limit stays the same", effect: "Up to 12 toppings", unchanged: "Up to 10 characters", footer: "A topping change does not change playlist titles." },
}
for(const [lang,t] of Object.entries(TEXT)) {
  const d=diagram(940,520)
  const shapeBox = d.box
  d.box = (x, y, w, h, title, lines = [], options = {}) => {
    shapeBox(x, y, w, h, "", [], options)
    const top = y + h / 2 - lines.length * 12 + 3
    d.label(x + w / 2, top, [title], { size: 17, weight: 700 })
    lines.forEach((line, i) => d.label(x + w / 2, top + 27 + i * 25, [line], { size: 15 }))
  }
  d.label(470,40,[t.title],{size:23,weight:700})
  d.box(55,100,370,90,t.pizza,[t.first],{fill:"#e7f0ff"})
  d.box(515,100,370,90,t.titles,[t.second],{fill:"#fff7d6"})
  d.label(240,245,[t.change],{size:17})
  d.label(700,245,[t.stays],{size:17})
  d.arrow(90,195,90,290)
  d.arrow(555,195,555,290)
  d.box(55,295,370,90,t.changed,[t.effect],{fill:"#e9f7ec"})
  d.box(515,295,370,90,t.second,[t.unchanged],{fill:"#fff7d6"})
  d.label(470,465,[t.footer],{size:18})
  d.save(`public/images/01b-independent-limits.${lang}.svg`)
}
