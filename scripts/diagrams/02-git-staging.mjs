import { diagram } from "./lib.mjs"

const TEXT = {
  "en": {
    "title": "One file, three Git states",
    "head": [
      "Last commit",
      [
        "Boil water."
      ]
    ],
    "index": [
      "Staging area",
      [
        "Boil water.",
        "Add a little salt."
      ]
    ],
    "folder": [
      "Working folder",
      [
        "Boil water.",
        "Add a little salt.",
        "Add black pepper."
      ]
    ],
    "new": [
      "New commit",
      [
        "Boil water.",
        "Add a little salt."
      ]
    ],
    "remaining": [
      "Working folder",
      [
        "Pepper remains unstaged"
      ]
    ],
    "add": [
      "git add soup.txt",
      "before adding pepper"
    ],
    "commit": "git commit -m \"Add salt\"",
    "staged": "staged changes",
    "unstaged": "unstaged changes"
  },
  "es": {
    "title": "Un archivo, tres estados de Git",
    "head": [
      "Último commit",
      [
        "Boil water."
      ]
    ],
    "index": [
      "Área de preparación",
      [
        "Boil water.",
        "Add a little salt."
      ]
    ],
    "folder": [
      "Carpeta de trabajo",
      [
        "Boil water.",
        "Add a little salt.",
        "Add black pepper."
      ]
    ],
    "new": [
      "Commit nuevo",
      [
        "Boil water.",
        "Add a little salt."
      ]
    ],
    "remaining": [
      "Carpeta de trabajo",
      [
        "La pimienta sigue sin preparar"
      ]
    ],
    "add": [
      "git add soup.txt",
      "antes de agregar la pimienta"
    ],
    "commit": "git commit -m \"Add salt\"",
    "staged": "cambios preparados",
    "unstaged": "cambios sin preparar"
  }
}

for (const [lang, t] of Object.entries(TEXT)) {

  const d = diagram(960, 490)
  d.label(480, 40, [t.title], {size:24, weight:700})
  d.box(30, 125, 255, 132, ...t.head)
  d.box(350, 125, 255, 132, ...t.index)
  d.box(675, 125, 255, 132, ...t.folder)
  d.arrow(669, 103, 612, 103)
  d.label(650, 68, t.add, {size:15})
  d.label(320, 289, [t.staged], {size:15})
  d.line(160, 267, 160, 297); d.line(160, 297, 475, 297); d.line(475, 297, 475, 267)
  d.label(705, 319, [t.unstaged], {size:15})
  d.line(500, 267, 500, 325); d.line(500, 325, 805, 325); d.line(805, 325, 805, 267)
  d.arrow(420, 335, 420, 363)
  d.label(263, 351, [t.commit], {size:15, mono:true})
  d.box(290, 370, 270, 95, ...t.new, {fill:'#e9f7ec'})
  d.box(650, 370, 280, 95, ...t.remaining, {fill:'#e7f0ff'})

  d.save(`public/images/02-git-staging.${lang}.svg`)
}
