import { diagram } from "./lib.mjs"

const TEXT = {
  "en": {
    "title": "Actions are shared; expectations stay in each spec",
    "nodes": [
      [
        "Spec",
        [
          "prepares its product"
        ]
      ],
      [
        "ProductsPage",
        [
          "goto(), search(), delete()"
        ]
      ],
      [
        "ProductsPage",
        [
          "locators for the current page"
        ]
      ],
      [
        "Playwright",
        [
          "resolves them against the DOM"
        ]
      ],
      [
        "Spec",
        [
          "expects its row to disappear"
        ]
      ],
      [
        "Playwright assertion",
        [
          "waits for that result"
        ]
      ]
    ],
    "footer": "ProductsPage exposes row(id) and message; it does not import expect"
  },
  "es": {
    "title": "Las acciones se comparten; cada spec decide qué espera",
    "nodes": [
      [
        "Spec",
        [
          "prepara su producto"
        ]
      ],
      [
        "ProductsPage",
        [
          "goto(), search(), delete()"
        ]
      ],
      [
        "ProductsPage",
        [
          "locators de la página actual"
        ]
      ],
      [
        "Playwright",
        [
          "los resuelve contra el DOM"
        ]
      ],
      [
        "Spec",
        [
          "espera que desaparezca su fila"
        ]
      ],
      [
        "Aserción de Playwright",
        [
          "espera ese resultado"
        ]
      ]
    ],
    "footer": "ProductsPage expone row(id) y message; no importa expect"
  }
}
const NAME = "04-pom-responsibilities"

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

    for(let row=0;row<3;row++) {
      box(row*2,40,100+row*140,390,95,"#e7f0ff")
      box(row*2+1,530,100+row*140,390,95,row===2?"#e9f7ec":"#fff7d6")
      d.arrow(440,148+row*140,520,148+row*140)
    }
    d.label(480,582,[t.footer],{size:17,color:"#52606d"})
  const file=`public/images/${NAME}.${lang}.svg`
  d.save(file)

}
