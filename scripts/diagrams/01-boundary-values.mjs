import { diagram } from "./lib.mjs"

const TEXT = {
  es: {
    title: "El signo cambia el resultado justo en 50",
    rule: "Envío gratis desde 50", below: "por debajo", boundary: "en el límite", above: "por encima",
    correct: "incluye 50", incorrect: "excluye 50", values: ["49", "50", "51"],
    good: "amount >= 50", bad: "amount > 50", yes: "true", no: "false",
  },
  en: {
    title: "The sign changes the result exactly at 50",
    rule: "Free shipping from 50", below: "just below", boundary: "at the boundary", above: "just above",
    correct: "includes 50", incorrect: "excludes 50", values: ["49", "50", "51"],
    good: "amount >= 50", bad: "amount > 50", yes: "true", no: "false",
  },
}

for (const [lang, t] of Object.entries(TEXT)) {
  const d = diagram(900, 410)
  d.label(450, 40, [t.title], { size: 24, weight: 700 })
  d.label(450, 76, [t.rule], { size: 19 })
  const centers = [430, 605, 780]
  ;[t.below, t.boundary, t.above].forEach((label, i) => {
    d.box(centers[i] - 75, 104, 150, 76, t.values[i], [label], { fill: i === 1 ? "#fff0c9" : "#e7f0ff" })
  })
  d.box(35, 212, 280, 74, t.good, [t.correct], { fill: "#e9f7ec" })
  d.box(35, 312, 280, 74, t.bad, [t.incorrect], { fill: "#fff0ec" })
  ;[t.no, t.yes, t.yes].forEach((value, i) => d.label(centers[i], 258, [value], { size: 24, mono: true }))
  ;[t.no, t.no, t.yes].forEach((value, i) => d.label(centers[i], 357, [value], { size: 24, mono: true, color: i === 1 ? "#b42318" : "#1f2933" }))
  d.save(`public/images/01-boundary-values.${lang}.svg`)
}
