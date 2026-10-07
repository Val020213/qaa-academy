import { diagram } from "./lib.mjs"

const TEXT = {
  "es": {
    "title": "Un worker comparte variables, cada test tiene su contexto",
    "worker": [
      "Worker 1: proceso Node.js",
      [
        "counter empieza en 0"
      ]
    ],
    "a": [
      "Test A: page",
      [
        "counter++ → 1"
      ]
    ],
    "b": [
      "Test B: page",
      [
        "counter++ → 2"
      ]
    ],
    "ca": [
      "Contexto A nuevo",
      [
        "page A",
        "cookies y DOM propios"
      ]
    ],
    "cb": [
      "Contexto B nuevo",
      [
        "page B",
        "cookies y DOM propios"
      ]
    ],
    "server": [
      "Servidor compartido",
      [
        "sus datos no se limpian",
        "al crear un contexto"
      ]
    ],
    "memory": "La variable sigue en el proceso",
    "external": "si la app usa un servidor"
  },
  "en": {
    "title": "One worker shares variables; each test has its own context",
    "worker": [
      "Worker 1: Node.js process",
      [
        "counter starts at 0"
      ]
    ],
    "a": [
      "Test A: page",
      [
        "counter++ → 1"
      ]
    ],
    "b": [
      "Test B: page",
      [
        "counter++ → 2"
      ]
    ],
    "ca": [
      "New context A",
      [
        "page A",
        "its own cookies and DOM"
      ]
    ],
    "cb": [
      "New context B",
      [
        "page B",
        "its own cookies and DOM"
      ]
    ],
    "server": [
      "Shared server",
      [
        "its data is not cleared",
        "when a context is created"
      ]
    ],
    "memory": "The variable stays in the process",
    "external": "if the app uses a server"
  }
}

for (const [lang, t] of Object.entries(TEXT)) {
  const d = diagram(980, 600)
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
  d.label(490,35,[t.title],{size:22,weight:700})
  d.box(230,75,520,80,...t.worker,{fill:"#e7f0ff"})
  d.box(65,210,330,86,...t.a)
  d.box(585,210,330,86,...t.b)
  d.arrow(300,160,230,205); d.arrow(680,160,750,205)
  d.arrow(400,253,580,253)
  d.label(490,325,[t.memory],{size:16})
  d.box(65,350,330,96,...t.ca,{fill:"#e9f7ec"})
  d.box(585,350,330,96,...t.cb,{fill:"#e9f7ec"})
  d.arrow(230,301,230,345); d.arrow(750,301,750,345)
  d.box(300,490,380,88,...t.server,{fill:"#f0f3f5",dashed:true})
  d.arrow(235,451,295,520,{dashed:true}); d.arrow(745,451,685,520,{dashed:true})
  d.label(490,475,[t.external],{size:15})
  d.save(`public/images/03-worker-isolation.${lang}.svg`)
}
