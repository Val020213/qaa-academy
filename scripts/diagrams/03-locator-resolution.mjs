import { diagram } from "./lib.mjs"

const TEXT = {
  "es": {
    "title": "La misma búsqueda, un nodo nuevo",
    "locator": [
      "Locator guardado",
      [
        "getByTestId(\"cases-toggle-1\")"
      ]
    ],
    "before": [
      "Primer uso",
      [
        "DOM: casilla A",
        "el caso pendiente está visible"
      ]
    ],
    "removed": [
      "Filtro passed",
      [
        "React retira la fila",
        "la casilla A queda desconectada"
      ]
    ],
    "created": [
      "Filtro all",
      [
        "React crea la fila otra vez",
        "la nueva casilla B conserva el estado"
      ]
    ],
    "after": [
      "Segundo uso",
      [
        "DOM: casilla B",
        "Playwright repite la búsqueda"
      ]
    ],
    "time": "Cambios en el DOM"
  },
  "en": {
    "title": "The same search, a new node",
    "locator": [
      "Stored locator",
      [
        "getByTestId(\"cases-toggle-1\")"
      ]
    ],
    "before": [
      "First use",
      [
        "DOM: checkbox A",
        "the pending case is visible"
      ]
    ],
    "removed": [
      "Filter passed",
      [
        "React removes the row",
        "checkbox A becomes disconnected"
      ]
    ],
    "created": [
      "Filter all",
      [
        "React creates the row again",
        "new checkbox B preserves state"
      ]
    ],
    "after": [
      "Second use",
      [
        "DOM: checkbox B",
        "Playwright repeats the search"
      ]
    ],
    "time": "DOM changes"
  }
}

for (const [lang, t] of Object.entries(TEXT)) {
  const d = diagram(960, 500)
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
  d.label(480, 35, [t.title], { size: 23, weight: 700 })
  d.box(300, 65, 360, 82, ...t.locator, { fill: "#e7f0ff" })
  d.box(40, 210, 360, 94, ...t.before)
  d.box(560, 210, 360, 94, ...t.after)
  d.arrow(330, 152, 220, 205)
  d.arrow(630, 152, 740, 205)
  d.box(40, 365, 360, 94, ...t.removed, { fill: "#fff0ec", dashed: true })
  d.box(560, 365, 360, 94, ...t.created, { fill: "#e9f7ec" })
  d.arrow(220, 309, 220, 360)
  d.arrow(405, 412, 555, 412)
  d.arrow(740, 360, 740, 309)
  d.label(480, 488, [t.time], { size: 16 })
  d.save(`public/images/03-locator-resolution.${lang}.svg`)
}
