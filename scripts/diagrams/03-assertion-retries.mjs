import { diagram } from "./lib.mjs"

const TEXT = {
  "es": {
    "title": "El locator vuelve al DOM; un valor guardado no",
    "read": [
      "Buscar y leer",
      [
        "Playwright resuelve el locator",
        "y lee el estado actual"
      ]
    ],
    "compare": [
      "¿Cumple la condición?",
      [
        "compara con lo esperado"
      ]
    ],
    "ok": [
      "Continuar",
      [
        "la aserción pasa"
      ]
    ],
    "budget": [
      "¿Queda tiempo?",
      [
        "límite de la aserción",
        "y límite del test"
      ]
    ],
    "wait": [
      "Esperar un intervalo",
      [
        "después, buscar otra vez"
      ]
    ],
    "fail": [
      "Fallar",
      [
        "la condición no se cumplió",
        "antes del límite"
      ]
    ],
    "value": [
      "Valor ya leído",
      [
        "count() → total",
        "expect(total).toBe(2): una comparación"
      ]
    ],
    "yes": "sí",
    "no": "no"
  },
  "en": {
    "title": "A locator returns to the DOM; a stored value does not",
    "read": [
      "Find and read",
      [
        "Playwright resolves the locator",
        "and reads the current state"
      ]
    ],
    "compare": [
      "Does it match?",
      [
        "compare with the expectation"
      ]
    ],
    "ok": [
      "Continue",
      [
        "the assertion passes"
      ]
    ],
    "budget": [
      "Time left?",
      [
        "assertion deadline",
        "and test deadline"
      ]
    ],
    "wait": [
      "Wait for an interval",
      [
        "then search again"
      ]
    ],
    "fail": [
      "Fail",
      [
        "the condition was not met",
        "before the deadline"
      ]
    ],
    "value": [
      "Value already read",
      [
        "count() → total",
        "expect(total).toBe(2): one comparison"
      ]
    ],
    "yes": "yes",
    "no": "no"
  }
}

for (const [lang, t] of Object.entries(TEXT)) {
  const d = diagram(980, 590)
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
  d.label(490, 35, [t.title], { size: 22, weight: 700 })
  d.box(35, 90, 285, 100, ...t.read, {fill:"#e7f0ff"})
  d.box(365, 90, 245, 100, ...t.compare)
  d.box(700, 90, 245, 100, ...t.ok, {fill:"#e9f7ec"})
  d.arrow(325,140,360,140); d.arrow(615,140,695,140)
  d.label(655,122,[t.yes],{size:15})
  d.box(365,270,245,105,...t.budget)
  d.arrow(487,195,487,265); d.label(510,234,[t.no],{size:15})
  d.box(35,270,285,105,...t.wait)
  d.arrow(360,322,325,322); d.label(342,302,[t.yes],{size:15})
  d.arrow(177,265,177,195)
  d.box(700,270,245,105,...t.fail,{fill:"#fff0ec"})
  d.arrow(615,322,695,322); d.label(655,302,[t.no],{size:15})
  d.box(190,450,600,100,...t.value,{fill:"#f0f3f5",dashed:true})
  d.save(`public/images/03-assertion-retries.${lang}.svg`)
}
