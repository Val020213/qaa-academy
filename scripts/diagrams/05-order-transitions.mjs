import { diagram } from "./lib.mjs"

const TEXT = {
  "en": {
    "title": "Only forward order moves are allowed",
    "nodes": [
      [
        "pending",
        [
          "Mark as paid / Cancel"
        ]
      ],
      [
        "paid",
        [
          "Mark as shipped / Cancel"
        ]
      ],
      [
        "shipped",
        [
          "no action buttons"
        ]
      ],
      [
        "cancelled",
        [
          "no action buttons"
        ]
      ],
      [
        "Admin action",
        [
          "PATCH, then reload orders"
        ]
      ],
      [
        "Separate order per test",
        [
          "a move cannot be undone"
        ]
      ]
    ],
    "footer": "The page and API enforce the same allowed moves"
  },
  "es": {
    "title": "Los cambios de estado de pedidos solo avanzan",
    "nodes": [
      [
        "pending",
        [
          "Mark as paid / Cancel"
        ]
      ],
      [
        "paid",
        [
          "Mark as shipped / Cancel"
        ]
      ],
      [
        "shipped",
        [
          "sin botones de acción"
        ]
      ],
      [
        "cancelled",
        [
          "sin botones de acción"
        ]
      ],
      [
        "Acción del admin",
        [
          "PATCH y recarga de pedidos"
        ]
      ],
      [
        "Un pedido por test",
        [
          "el cambio no se puede deshacer"
        ]
      ]
    ],
    "footer": "La página y la API aplican los mismos cambios permitidos"
  }
}
const NAME = "05-order-transitions"

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

    box(0,35,110,280,95,"#e7f0ff");box(1,355,110,280,95,"#fff7d6");box(2,675,110,250,95,"#e9f7ec")
    box(3,355,335,280,95,"#e9f7ec")
    d.arrow(320,155,350,155);d.arrow(640,155,670,155)
    d.line(175,210,175,382);d.arrow(175,382,350,382);d.arrow(495,210,495,330)
    box(4,35,475,420,85,"#f0f3f5");box(5,505,475,420,85,"#f0f3f5")
    d.label(480,582,[t.footer],{size:17,color:"#52606d"})
  const file=`public/images/${NAME}.${lang}.svg`
  d.save(file)

}
