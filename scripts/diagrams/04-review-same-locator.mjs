import { diagram } from "./lib.mjs"

const TEXT = {
  "en": {
    "title": "An absence check needs a known starting row",
    "nodes": [
      [
        "Create",
        [
          "get product.id"
        ]
      ],
      [
        "One locator",
        [
          "products.row(product.id)"
        ]
      ],
      [
        "Guard",
        [
          "toBeVisible()"
        ]
      ],
      [
        "Action",
        [
          "delete(product.id)"
        ]
      ],
      [
        "Check that same row",
        [
          "toHaveCount(0)"
        ]
      ],
      [
        "Skip the action",
        [
          "the final check must fail"
        ]
      ]
    ],
    "footer": "A misspelled locator can be empty before and after deletion"
  },
  "es": {
    "title": "Para comprobar ausencia, conoce la fila inicial",
    "nodes": [
      [
        "Crear",
        [
          "obtén product.id"
        ]
      ],
      [
        "Un locator",
        [
          "products.row(product.id)"
        ]
      ],
      [
        "Guarda",
        [
          "toBeVisible()"
        ]
      ],
      [
        "Acción",
        [
          "delete(product.id)"
        ]
      ],
      [
        "Comprobar la misma fila",
        [
          "toHaveCount(0)"
        ]
      ],
      [
        "Omitir la acción",
        [
          "debe fallar la aserción final"
        ]
      ]
    ],
    "footer": "Un locator mal escrito puede estar vacío antes y después de borrar"
  }
}
const NAME = "04-review-same-locator"

for (const [lang, t] of Object.entries(TEXT)) {
  const d = diagram(960, 600)
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

  box(0,30,100,280,105,"#e7f0ff")
  box(1,340,100,280,105,"#e7f0ff")
  box(2,650,100,280,105,"#e7f0ff")
  box(3,650,340,280,105,"#e7f0ff")
  box(4,340,340,280,105,"#e9f7ec")
  box(5,30,340,280,105,"#fff0ec")
  d.arrow(315,153,335,153)
  d.arrow(625,153,645,153)
  d.arrow(790,210,790,335)
  d.arrow(645,393,625,393)
  d.arrow(315,393,335,393)
  d.line(790,250,170,250,{dashed:true})
  d.arrow(170,250,170,335,{dashed:true})
    d.label(480,582,[t.footer],{size:17,color:"#52606d"})
  const file=`public/images/${NAME}.${lang}.svg`
  d.save(file)

}
