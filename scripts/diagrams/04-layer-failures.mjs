import { diagram } from "./lib.mjs"

const TEXT = {
  "en": {
    "title": "The same price rule, three possible defects",
    "nodes": [
      [
        "Validation function",
        [
          "accepts 0"
        ]
      ],
      [
        "A + B + C fail",
        [
          "rule is wrong"
        ]
      ],
      [
        "Server route",
        [
          "does not call validation"
        ]
      ],
      [
        "B + C fail",
        [
          "A still passes"
        ]
      ],
      [
        "Form message",
        [
          "does not show the rejection"
        ]
      ],
      [
        "Only C fails",
        [
          "A and B still pass"
        ]
      ]
    ],
    "footer": "A: unit · B: API · C: browser (the lesson’s examples)"
  },
  "es": {
    "title": "La misma regla de precio, tres defectos posibles",
    "nodes": [
      [
        "Función de validación",
        [
          "acepta 0"
        ]
      ],
      [
        "Fallan A + B + C",
        [
          "la regla está mal"
        ]
      ],
      [
        "Ruta del servidor",
        [
          "no llama a la validación"
        ]
      ],
      [
        "Fallan B + C",
        [
          "A todavía pasa"
        ]
      ],
      [
        "Mensaje del formulario",
        [
          "no muestra el rechazo"
        ]
      ],
      [
        "Solo falla C",
        [
          "A y B todavía pasan"
        ]
      ]
    ],
    "footer": "A: unitario · B: API · C: navegador (ejemplos de la lección)"
  }
}
const NAME = "04-layer-failures"

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
