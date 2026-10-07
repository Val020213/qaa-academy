import { diagram } from "./lib.mjs"

const TEXT = {
  "es": {
    "title": "Esperar para hacer clic y esperar el resultado",
    "a": [
      "Primer clic",
      [
        "Playwright: botón habilitado",
        "click()"
      ]
    ],
    "b": [
      "Primera carga",
      [
        "App: botón deshabilitado",
        "espera unos 1.5 s"
      ]
    ],
    "c": [
      "Segundo clic espera",
      [
        "Playwright espera",
        "que se habilite el botón"
      ]
    ],
    "d": [
      "Segundo clic",
      [
        "Playwright envía el clic",
        "inicia otra carga"
      ]
    ],
    "e": [
      "Segunda carga",
      [
        "App: botón deshabilitado",
        "otros 1.5 s aproximadamente"
      ]
    ],
    "f": [
      "Aserción del resultado",
      [
        "Playwright reintenta",
        "hasta encontrar 12 tests"
      ]
    ],
    "time": [
      "El resultado de la segunda carga aparece",
      "unos 3 s después del primer clic."
    ]
  },
  "en": {
    "title": "Waiting to click and waiting for the result",
    "a": [
      "First click",
      [
        "Playwright: button enabled",
        "click()"
      ]
    ],
    "b": [
      "First load",
      [
        "App: button disabled",
        "waits about 1.5 s"
      ]
    ],
    "c": [
      "Second click waits",
      [
        "Playwright waits",
        "for the button to be enabled"
      ]
    ],
    "d": [
      "Second click",
      [
        "Playwright sends the click",
        "starts another load"
      ]
    ],
    "e": [
      "Second load",
      [
        "App: button disabled",
        "about another 1.5 s"
      ]
    ],
    "f": [
      "Result assertion",
      [
        "Playwright retries",
        "until it finds 12 tests"
      ]
    ],
    "time": [
      "The second load's result appears",
      "about 3 s after the first click."
    ]
  }
}

for (const [lang, t] of Object.entries(TEXT)) {
  const d = diagram(980, 450)
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
  d.label(490, 35, [t.title], { size: 23, weight: 700 })
  const xs = [30, 355, 680]
  ;[t.a,t.b,t.c].forEach((v,i)=>d.box(xs[i], 80, 270, 104, ...v, {fill:i===1?"#fff7d6":"#e7f0ff"}))
  ;[t.f,t.e,t.d].forEach((v,i)=>d.box(xs[i], 255, 270, 104, ...v, {fill:i===1?"#fff7d6":"#e9f7ec"}))
  d.arrow(305,132,350,132); d.arrow(630,132,675,132)
  d.arrow(815,189,815,250)
  d.arrow(675,307,630,307); d.arrow(350,307,305,307)
  d.label(490, 403, t.time, { size: 17 })
  d.save(`public/images/03-click-and-result.${lang}.svg`)
}
