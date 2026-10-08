import { diagram } from "./lib.mjs"

const TEXT = {
  "en": {
    "title": "Share knowledge without hiding the test’s purpose",
    "nodes": [
      [
        "Spec",
        [
          "action + expected result"
        ]
      ],
      [
        "Config",
        [
          "baseURL"
        ]
      ],
      [
        "API helper",
        [
          "product defaults"
        ]
      ],
      [
        "Page Object",
        [
          "locators + page actions"
        ]
      ],
      [
        "Data helpers",
        [
          "name + SKU generation"
        ]
      ],
      [
        "Fixture",
        [
          "setup + cleanup"
        ]
      ]
    ],
    "footer": "Extract what changes together; keep scenario-specific values in the spec"
  },
  "es": {
    "title": "Comparte conocimiento sin esconder el propósito",
    "nodes": [
      [
        "Spec",
        [
          "acción + resultado esperado"
        ]
      ],
      [
        "Configuración",
        [
          "baseURL"
        ]
      ],
      [
        "Helper de API",
        [
          "valores iniciales del producto"
        ]
      ],
      [
        "Page Object",
        [
          "locators + acciones de la página"
        ]
      ],
      [
        "Helpers de datos",
        [
          "generación de nombre y SKU"
        ]
      ],
      [
        "Fixture",
        [
          "preparación + limpieza"
        ]
      ]
    ],
    "footer": "Extrae lo que cambia junto; conserva en el spec los datos propios del caso"
  }
}
const NAME = "04-dry-knowledge"

for (const [lang, t] of Object.entries(TEXT)) {
  const d = diagram(960, 700)
  d.label(480, 42, [t.title], { size: 24, weight: 700 })
  const nodes = t.nodes
  const boxes=[]
  function wrap(text,limit) {
    const words=text.split(" "), result=[]
    for(const word of words){if(!result.length || result.at(-1).length+word.length+1>limit)result.push(word);else result[result.length-1]+=" "+word}
    return result
  }
  function box(i,x,y,w=390,h=95,fill="#fff7d6") {
    const [title,lines]=nodes[i]
    d.rect(x,y,w,h,{fill})
    d.label(x+w/2,y+32,[title],{size:17,weight:700})
    d.label(x+w/2,y+58,lines.flatMap(line=>wrap(line,Math.floor((w-30)/8.5))),{size:17})
    boxes.push([x,y,w,h])
  }

    box(0,285,260,390,90,"#e7f0ff")
    // Four imported concerns surround the spec; the fifth is an external record or fixture.
    box(1,30,90,390,90);box(2,540,90,390,90)
    box(3,30,420,390,90);box(4,540,420,390,90)
    box(5,285,540,390,90,"#f0f3f5")
    d.arrow(285,276,220,190);d.arrow(675,276,735,190)
    d.arrow(285,334,220,410);d.arrow(675,334,735,410)
    d.line(480,355,480,515,{dashed:true})
    d.label(480,680,[t.footer],{size:17,color:"#52606d"})
  const file=`public/images/${NAME}.${lang}.svg`
  d.save(file)

}
