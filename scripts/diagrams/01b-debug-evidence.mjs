import { diagram } from "./lib.mjs"
const TEXT = {
  es: { title: "Cada experimento descarta una explicación", first: "Hipótesis: se salta a Leo", prediction: ["Predicción: Leo no aparece"], visits: "El registro incluye a Leo", output: ["row: Mia · row: Leo · row: Zoe"], reject: "Hipótesis descartada", second: "Hipótesis: points es number", compare: ["Predicción: 10 > 9 da true"], observed: "La comparación da false", result: ["Leo 10 9 false"], inspect: "Comprobar el tipo real", values: ['typeof row.points → "string"', '"10" > "9" → false', '10 > 9 → true'], cause: "Causa: points llegó como texto" },
  en: { title: "Each experiment rules out an explanation", first: "Hypothesis: Leo is skipped", prediction: ["Prediction: Leo is absent"], visits: "The log includes Leo", output: ["row: Mia · row: Leo · row: Zoe"], reject: "Hypothesis rejected", second: "Hypothesis: points is number", compare: ["Prediction: 10 > 9 gives true"], observed: "The comparison gives false", result: ["Leo 10 9 false"], inspect: "Check the actual type", values: ['typeof row.points → "string"', '"10" > "9" → false', '10 > 9 → true'], cause: "Cause: points arrived as strings" },
}
for(const [lang,t] of Object.entries(TEXT)) {
  const d=diagram(980,590)
  const shapeBox = d.box
  d.box = (x, y, w, h, title, lines = [], options = {}) => {
    shapeBox(x, y, w, h, "", [], options)
    const top = y + h / 2 - lines.length * 12 + 3
    d.label(x + w / 2, top, [title], { size: 17, weight: 700 })
    lines.forEach((line, i) => d.label(x + w / 2, top + 27 + i * 25, [line], { size: 15 }))
  }
  d.label(490,40,[t.title],{size:23,weight:700})
  d.box(35,90,410,95,t.first,t.prediction)
  d.box(535,90,410,95,t.visits,t.output,{fill:"#e7f0ff"})
  d.arrow(450,138,530,138)
  d.note(740,218,[t.reject],{size:17})
  d.box(35,260,410,95,t.second,t.compare)
  d.box(535,260,410,95,t.observed,t.result,{fill:"#fff0ec"})
  d.arrow(450,308,530,308)
  d.box(280,405,420,130,t.inspect,t.values,{fill:"#e9f7ec"})
  d.arrow(740,360,740,467)
  d.arrow(735,467,705,467)
  d.label(490,567,[t.cause],{size:19,weight:700})
  d.save(`public/images/01b-debug-evidence.${lang}.svg`)
}
