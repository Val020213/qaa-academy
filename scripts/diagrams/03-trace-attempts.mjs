import { diagram } from "./lib.mjs"

const TEXT = {
  "es": {
    "title": "Qué intento graba cada modo de trace",
    "initial": [
      "Ejecución inicial",
      [
        "retry: 0",
        "falla en este ejemplo"
      ]
    ],
    "one": [
      "Primer reintento",
      [
        "retry: 1",
        "vuelve a fallar"
      ]
    ],
    "two": [
      "Segundo reintento",
      [
        "retry: 2",
        "pasa en este ejemplo"
      ]
    ],
    "on": [
      "on",
      [
        "graba los tres intentos",
        "conserva los tres traces"
      ]
    ],
    "first": [
      "on-first-retry",
      [
        "graba solo retry: 1",
        "conserva ese trace"
      ]
    ],
    "retain": [
      "retain-on-failure",
      [
        "graba los tres intentos",
        "conserva solo los dos fallidos"
      ]
    ],
    "note": "Si el primer reintento pasa, no hay un segundo reintento."
  },
  "en": {
    "title": "Which attempt each trace mode records",
    "initial": [
      "Initial attempt",
      [
        "retry: 0",
        "fails in this example"
      ]
    ],
    "one": [
      "First retry",
      [
        "retry: 1",
        "fails again"
      ]
    ],
    "two": [
      "Second retry",
      [
        "retry: 2",
        "passes in this example"
      ]
    ],
    "on": [
      "on",
      [
        "records all three attempts",
        "keeps all three traces"
      ]
    ],
    "first": [
      "on-first-retry",
      [
        "records only retry: 1",
        "keeps that trace"
      ]
    ],
    "retain": [
      "retain-on-failure",
      [
        "records all three attempts",
        "keeps only the two failed ones"
      ]
    ],
    "note": "If the first retry passes, there is no second retry."
  }
}

for (const [lang, t] of Object.entries(TEXT)) {
  const d = diagram(980, 420)
  // Keep separate lines clear of the font's full bounding box.
  const label = d.label
  d.label = (x, y, lines, options = {}) => lines.forEach((line, i) =>
    label(x, y + i * (options.size ?? 17) * 1.6, [line], options))
  const shapeBox = d.box
  d.box = (x, y, w, h, title, lines = [], { fill = "#fff7d6", dashed = false } = {}) => {
    shapeBox(x, y, w, h, "", [], { fill, dashed })
    const top = y + h / 2 - lines.length * 12 + 3
    d.label(x + w / 2, top, [title], { size: 17, weight: 700 })
    d.label(x + w / 2, top + 27, lines, { size: 15 })
  }
  d.label(490,35,[t.title],{size:23,weight:700})
  const xs=[30,355,680]
  ;[t.initial,t.one,t.two].forEach((v,i)=>d.box(xs[i],80,270,100,...v,{fill:i===2?"#e9f7ec":"#fff0ec"}))
  d.arrow(305,130,350,130); d.arrow(630,130,675,130)
  ;[t.on,t.first,t.retain].forEach((v,i)=>d.box(xs[i],245,270,100,...v,{fill:"#e7f0ff"}))
  d.label(490,392,[t.note],{size:17})
  d.save(`public/images/03-trace-attempts.${lang}.svg`)
}
