import { diagram } from "./lib.mjs"

const TEXT = {
  "es": {
    "title": "Un puerto alimenta el servidor y las rutas de los tests",
    "env": [
      "Variable de entorno",
      [
        "process.env.QAA_E2E_PORT"
      ]
    ],
    "port": [
      "PORT",
      [
        "valor de la variable",
        "o \"5180\" si falta"
      ]
    ],
    "base": [
      "BASE_URL",
      [
        "http://localhost:${PORT}"
      ]
    ],
    "command": [
      "Comando del servidor",
      [
        "pnpm dev --port ${PORT}"
      ]
    ],
    "ready": [
      "Dirección de espera",
      [
        "webServer.url = BASE_URL"
      ]
    ],
    "nav": [
      "Navegación relativa",
      [
        "use.baseURL = BASE_URL",
        "page.goto(\"/#/practice\")"
      ]
    ],
    "absolute": "Una dirección absoluta conserva su propio origen."
  },
  "en": {
    "title": "One port feeds the server and relative test URLs",
    "env": [
      "Environment variable",
      [
        "process.env.QAA_E2E_PORT"
      ]
    ],
    "port": [
      "PORT",
      [
        "variable value",
        "or \"5180\" if missing"
      ]
    ],
    "base": [
      "BASE_URL",
      [
        "http://localhost:${PORT}"
      ]
    ],
    "command": [
      "Server command",
      [
        "pnpm dev --port ${PORT}"
      ]
    ],
    "ready": [
      "Readiness address",
      [
        "webServer.url = BASE_URL"
      ]
    ],
    "nav": [
      "Relative navigation",
      [
        "use.baseURL = BASE_URL",
        "page.goto(\"/#/practice\")"
      ]
    ],
    "absolute": "An absolute address keeps its own origin."
  }
}

for (const [lang, t] of Object.entries(TEXT)) {
  const d = diagram(980, 470)
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
  d.box(30,85,280,90,...t.env,{fill:"#e7f0ff"})
  d.box(365,85,240,90,...t.port)
  d.box(670,85,280,90,...t.base)
  d.arrow(315,130,360,130); d.arrow(610,130,665,130)
  d.box(30,300,280,100,...t.command,{fill:"#e9f7ec"})
  d.box(350,300,280,100,...t.ready,{fill:"#e9f7ec"})
  d.box(670,300,280,100,...t.nav,{fill:"#e9f7ec"})
  d.arrow(440,180,175,295)
  d.arrow(735,180,495,295)
  d.arrow(810,180,810,295)
  d.label(490,445,[t.absolute],{size:17})
  d.save(`public/images/03-port-consumers.${lang}.svg`)
}
