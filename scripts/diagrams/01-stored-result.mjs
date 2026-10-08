import { diagram } from "./lib.mjs"

const TEXT = {
  es: {
    title: "Cambiar side no vuelve a calcular area",
    first: "1. Calcular y guardar", next: "2. Cambiar solo side",
    side4: "side = 4", calculation: "4 × 4", area: "area = 16", side5: "side = 5",
    once: "side * side se evalúa aquí", kept: "el resultado sigue guardado",
    noCalculation: "no se ejecuta otra cuenta", summary: "area guarda un número, no una fórmula que se actualiza.",
  },
  en: {
    title: "Changing side does not recalculate area",
    first: "1. Calculate and store", next: "2. Change only side",
    side4: "side = 4", calculation: "4 × 4", area: "area = 16", side5: "side = 5",
    once: "side * side is evaluated here", kept: "the result stays stored",
    noCalculation: "no calculation runs again", summary: "area stores a number, not a formula that updates.",
  },
}

for (const [lang, t] of Object.entries(TEXT)) {
  const d = diagram(940, 440)
  d.label(470, 42, [t.title], { size: 25, weight: 700 })
  d.label(35, 88, [t.first], { size: 18, anchor: "start" })
  d.box(35, 110, 230, 90, t.side4, [], { fill: "#e7f0ff" })
  d.box(335, 110, 270, 90, t.calculation, [t.once])
  d.box(675, 110, 230, 90, t.area, [], { fill: "#e9f7ec" })
  d.arrow(273, 155, 327, 155)
  d.arrow(613, 155, 667, 155)
  d.label(335, 254, [t.next], { size: 18, anchor: "start" })
  d.box(35, 277, 230, 90, t.side5, [], { fill: "#e7f0ff" })
  d.box(335, 277, 270, 90, t.noCalculation, [], { dashed: true, fill: "#f0f3f5" })
  d.box(675, 277, 230, 90, t.area, [t.kept], { fill: "#e9f7ec" })
  d.arrow(150, 208, 150, 269)
  d.arrow(790, 208, 790, 269)
  d.label(470, 413, [t.summary], { size: 19 })
  d.save(`public/images/01-stored-result.${lang}.svg`)
}
