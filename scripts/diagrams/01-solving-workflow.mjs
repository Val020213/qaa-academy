import { diagram } from "./lib.mjs"

const TEXT = {
  es: {
    title: "Un ejemplo acompaña los cinco movimientos",
    say: ["1. Dilo", ["70 años, martes", "precio esperado: 5"]],
    hand: ["2. A mano", ["base: 7", "descuento: 2 → precio: 5"]],
    words: ["3. Pasos en palabras", ["elegir precio por edad", "restar el descuento del día"]],
    code: ["4. Un paso de código", ["precio base → ejecutar", "descuento → ejecutar"]],
    check: ["5. Revisar entradas", ["70: caso fácil", "65: límite; -1: incorrecta"]],
    fix: ["Cambiar una sola cosa", ["si un caso falla, revisar", "el paso que lo causa"]],
    easy: "ticketPrice(70, \"Tuesday\") → 5", again: "volver al paso y ejecutar",
  },
  en: {
    title: "One example travels through the five moves",
    say: ["1. Say it", ["age 70, Tuesday", "expected price: 5"]],
    hand: ["2. By hand", ["base: 7", "discount: 2 → price: 5"]],
    words: ["3. Steps in words", ["choose the price by age", "subtract the day's discount"]],
    code: ["4. One code step", ["base price → run", "discount → run"]],
    check: ["5. Check inputs", ["70: easy case", "65: boundary; -1: invalid"]],
    fix: ["Change one thing", ["if a case fails, review", "the step that causes it"]],
    easy: "ticketPrice(70, \"Tuesday\") → 5", again: "return to the step and run",
  },
}

for (const [lang, t] of Object.entries(TEXT)) {
  const d = diagram(960, 430)
  d.label(480, 42, [t.title], { size: 24, weight: 700 })
  d.box(30, 90, 270, 105, ...t.say, { fill: "#e7f0ff" })
  d.box(345, 90, 270, 105, ...t.hand)
  d.box(660, 90, 270, 105, ...t.words)
  d.arrow(308, 142, 337, 142)
  d.arrow(623, 142, 652, 142)
  d.arrow(795, 203, 795, 267)
  d.box(660, 275, 270, 105, ...t.code, { fill: "#e7f0ff" })
  d.box(345, 275, 270, 105, ...t.check, { fill: "#e9f7ec" })
  d.box(30, 275, 270, 105, ...t.fix, { fill: "#fff0ec" })
  d.arrow(652, 327, 623, 327)
  d.arrow(337, 327, 308, 327)
  d.arrow(165, 270, 165, 235, { dashed: true })
  d.arrow(165, 235, 725, 235, { dashed: true })
  d.arrow(725, 235, 725, 267, { dashed: true })
  d.label(445, 225, [t.again], { size: 15 })
  d.label(480, 415, [t.easy], { size: 19, mono: true })
  d.save(`public/images/01-solving-workflow.${lang}.svg`)
}
