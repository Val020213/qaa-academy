import { diagram } from "./lib.mjs"

const TEXT = {
  "en": {
    "title": "Classes on one element versus a descendant",
    "ul": [
      "Parent",
      [
        "ul"
      ]
    ],
    "rex": [
      "Rex",
      [
        "li class=\"dog\""
      ]
    ],
    "bo": [
      "Bo",
      [
        "li class=\"dog old\""
      ]
    ],
    "luna": [
      "Luna",
      [
        "li class=\"cat\""
      ]
    ],
    "dog": [
      ".dog",
      [
        "Rex, Bo: 2 matches"
      ]
    ],
    "both": [
      ".dog.old",
      [
        "Bo: 1 match"
      ]
    ],
    "inside": [
      ".dog .old",
      [
        "0 matches"
      ]
    ],
    "note": [
      "Bo has both classes.",
      "Bo is not inside another .dog element."
    ]
  },
  "es": {
    "title": "Clases en un elemento frente a un descendiente",
    "ul": [
      "Padre",
      [
        "ul"
      ]
    ],
    "rex": [
      "Rex",
      [
        "li class=\"dog\""
      ]
    ],
    "bo": [
      "Bo",
      [
        "li class=\"dog old\""
      ]
    ],
    "luna": [
      "Luna",
      [
        "li class=\"cat\""
      ]
    ],
    "dog": [
      ".dog",
      [
        "Rex, Bo: 2 coincidencias"
      ]
    ],
    "both": [
      ".dog.old",
      [
        "Bo: 1 coincidencia"
      ]
    ],
    "inside": [
      ".dog .old",
      [
        "0 coincidencias"
      ]
    ],
    "note": [
      "Bo tiene ambas clases.",
      "Bo no está dentro de otro elemento .dog."
    ]
  }
}

for (const [lang, t] of Object.entries(TEXT)) {

  const d = diagram(940, 470)
  d.label(470, 38, [t.title], {size:23, weight:700})
  d.box(345, 68, 250, 65, ...t.ul)
  const xs=[25,345,665]
  for(const x of xs) d.arrow(470, 141, x+125, 178)
  ;[t.rex,t.bo,t.luna].forEach((v,i)=>d.box(xs[i], 185, 250, 75, ...v, {fill:i<2?'#e7f0ff':'#fff7d6'}))
  ;[t.dog,t.both,t.inside].forEach((v,i)=>d.box(xs[i], 302, 250, 75, ...v, {fill:i===2?'#ffe9e6':'#e9f7ec'}))
  d.label(470, 418, t.note, {size:17})

  d.save(`public/images/02-selector-matches.${lang}.svg`)
}
