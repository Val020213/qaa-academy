import { diagram } from "./lib.mjs"

const TEXT = {
  "en": {
    "title": "The source stays the same; the DOM changes",
    "file": [
      "HTML source",
      [
        "<ul id=\"dogs\">",
        "  <li>Rex</li>",
        "</ul> + <script>…</script>"
      ]
    ],
    "parser": [
      "HTML parser",
      [
        "Creates elements",
        "in the document"
      ]
    ],
    "before": [
      "DOM before the script",
      [
        "ul → li \"Rex\""
      ]
    ],
    "script": [
      "The browser runs the script",
      [
        "createElement(\"li\")",
        "textContent = \"Luna\"",
        "append(li)"
      ]
    ],
    "after": [
      "DOM after the script",
      [
        "ul → li \"Rex\"",
        "   → li \"Luna\""
      ]
    ],
    "loading": "During HTML parsing",
    "same": "The script does not rewrite the HTML source"
  },
  "es": {
    "title": "El código fuente queda igual; el DOM cambia",
    "file": [
      "Código fuente HTML",
      [
        "<ul id=\"dogs\">",
        "  <li>Rex</li>",
        "</ul> + <script>…</script>"
      ]
    ],
    "parser": [
      "Analizador HTML",
      [
        "Crea elementos",
        "en el documento"
      ]
    ],
    "before": [
      "DOM antes del script",
      [
        "ul → li \"Rex\""
      ]
    ],
    "script": [
      "El navegador ejecuta el script",
      [
        "createElement(\"li\")",
        "textContent = \"Luna\"",
        "append(li)"
      ]
    ],
    "after": [
      "DOM después del script",
      [
        "ul → li \"Rex\"",
        "   → li \"Luna\""
      ]
    ],
    "loading": "Durante el análisis del HTML",
    "same": "El script no reescribe el código fuente HTML"
  }
}

for (const [lang, t] of Object.entries(TEXT)) {

  const d = diagram(980, 480)
  d.label(490, 38, [t.title], {size:24, weight:700})
  d.box(25, 90, 285, 145, ...t.file, {fill:'#e7f0ff'})
  d.box(365, 90, 240, 145, ...t.parser)
  d.box(660, 90, 285, 145, ...t.before)
  d.arrow(318, 162, 355, 162); d.arrow(613, 162, 650, 162)
  d.box(355, 295, 305, 130, ...t.script)
  d.box(710, 295, 235, 130, ...t.after, {fill:'#e9f7ec'})
  d.arrow(803, 242, 803, 271); d.arrow(803, 271, 505, 271); d.arrow(505, 271, 505, 288)
  d.label(493, 255, [t.loading], {size:15})
  d.arrow(667, 360, 700, 360)
  d.label(490, 460, [t.same], {size:17})

  d.save(`public/images/02-html-dom.${lang}.svg`)
}
