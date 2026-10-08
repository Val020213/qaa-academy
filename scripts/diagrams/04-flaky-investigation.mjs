import { diagram } from "./lib.mjs"

const TEXT = {
  "en": {
    "title": "Test one hypothesis against the failure",
    "nodes": [
      [
        "Repeat",
        [
          "collect passing and failing runs"
        ]
      ],
      [
        "Run alone",
        [
          "look for shared-data effects"
        ]
      ],
      [
        "Read the trace",
        [
          "first unexpected step"
        ]
      ],
      [
        "Form a hypothesis",
        [
          "name the suspected cause"
        ]
      ],
      [
        "Change one thing",
        [
          "test the hypothesis"
        ]
      ],
      [
        "Run again",
        [
          "compare the evidence"
        ]
      ]
    ],
    "footer": "A green retry is evidence to investigate, not a fix"
  },
  "es": {
    "title": "Comprueba una hipótesis contra el fallo",
    "nodes": [
      [
        "Repetir",
        [
          "reúne ejecuciones verdes y rojas"
        ]
      ],
      [
        "Ejecutar solo",
        [
          "busca efectos de datos compartidos"
        ]
      ],
      [
        "Leer el trace",
        [
          "primer paso inesperado"
        ]
      ],
      [
        "Formar una hipótesis",
        [
          "nombra la causa que sospechas"
        ]
      ],
      [
        "Cambiar una cosa",
        [
          "comprueba la hipótesis"
        ]
      ],
      [
        "Ejecutar otra vez",
        [
          "compara la evidencia"
        ]
      ]
    ],
    "footer": "Un reintento verde aporta evidencia; no corrige la causa"
  }
}
const NAME = "04-flaky-investigation"

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

    const n=nodes.length
    for(let i=0;i<n;i++) {
      const c=i<3?i:5-i, row=i<3?0:1
      box(i,30+c*310,100+row*230,280,105,i===n-1?"#e9f7ec":"#e7f0ff")
      if(i===0 || i===1) d.arrow(315+c*310,153,335+c*310,153)
      if(i===2) d.arrow(790,210,790,325)
      if(i===3 || i===4) {if(i<n-1)d.arrow(25+c*310,383,5+c*310,383)}
    }
    d.label(480,582,[t.footer],{size:17,color:"#52606d"})
  const file=`public/images/${NAME}.${lang}.svg`
  d.save(file)

}
