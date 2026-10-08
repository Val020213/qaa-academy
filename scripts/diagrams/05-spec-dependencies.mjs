import { diagram } from "./lib.mjs"

const TEXT = {
  "en": {
    "title": "Follow imports to see what a product spec shares",
    "nodes": [
      [
        "products/products.spec.ts",
        [
          "actions + assertions"
        ]
      ],
      [
        "lib/test.ts",
        [
          "test + expect"
        ]
      ],
      [
        "lib/helpers.ts",
        [
          "uniqueName + uniqueSku"
        ]
      ],
      [
        "fixtures/api-client.ts",
        [
          "createProduct"
        ]
      ],
      [
        "pages/products.page.ts",
        [
          "ProductsPage"
        ]
      ],
      [
        "COVERAGE.md",
        [
          "records covered behaviors"
        ]
      ]
    ],
    "footer": "The coverage document describes the suite; it is not imported by the spec"
  },
  "es": {
    "title": "Sigue los imports del spec de productos",
    "nodes": [
      [
        "products/products.spec.ts",
        [
          "acciones + aserciones"
        ]
      ],
      [
        "lib/test.ts",
        [
          "test + expect"
        ]
      ],
      [
        "lib/helpers.ts",
        [
          "uniqueName + uniqueSku"
        ]
      ],
      [
        "fixtures/api-client.ts",
        [
          "createProduct"
        ]
      ],
      [
        "pages/products.page.ts",
        [
          "ProductsPage"
        ]
      ],
      [
        "COVERAGE.md",
        [
          "registra comportamientos cubiertos"
        ]
      ]
    ],
    "footer": "El documento de cobertura describe la suite; el spec no lo importa"
  }
}
const NAME = "05-spec-dependencies"

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
