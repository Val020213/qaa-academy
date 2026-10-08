import { diagram } from "./lib.mjs"

const TEXT = {
  "en": {
    "title": "Choose the level for the risk",
    "nodes": [
      [
        "E2E",
        [
          "UI + server"
        ]
      ],
      [
        "Integration / API",
        [
          "server + connected pieces"
        ]
      ],
      [
        "Unit",
        [
          "one small piece of code"
        ]
      ],
      [
        "Many inputs",
        [
          "rule checks below"
        ]
      ],
      [
        "Important journeys",
        [
          "browser checks above"
        ]
      ]
    ],
    "footer": "Relative counts, not measured execution times"
  },
  "es": {
    "title": "Elige el nivel según el riesgo",
    "nodes": [
      [
        "E2E",
        [
          "interfaz + servidor"
        ]
      ],
      [
        "Integración / API",
        [
          "servidor + piezas conectadas"
        ]
      ],
      [
        "Unitarios",
        [
          "una pieza pequeña de código"
        ]
      ],
      [
        "Muchas entradas",
        [
          "reglas en los niveles inferiores"
        ]
      ],
      [
        "Recorridos importantes",
        [
          "navegador en el nivel superior"
        ]
      ]
    ],
    "footer": "Cantidades relativas, no tiempos de ejecución medidos"
  }
}
const NAME = "04-test-pyramid"

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

    d.polygon([[380,90],[490,235],[270,235]],{fill:"#e7f0ff"})
    d.polygon([[270,240],[490,240],[605,390],[155,390]],{fill:"#fff7d6"})
    d.polygon([[155,395],[605,395],[715,540],[45,540]],{fill:"#e9f7ec"})
    const layers = [[380,185],[380,305],[380,458]]
    layers.forEach(([x,y],i)=>{
      d.label(x,y,[nodes[i][0]],{size:21,weight:700});d.label(x,y+30,nodes[i][1],{size:17})
    })
    box(3,640,110,285,95);box(4,640,280,285,95)
    d.line(635,160,620,160)
    d.line(620,160,620,460)
    d.arrow(620,460,590,460)
    d.arrow(635,310,460,185)
    d.label(480,582,[t.footer],{size:17,color:"#52606d"})
  const file=`public/images/${NAME}.${lang}.svg`
  d.save(file)

}
