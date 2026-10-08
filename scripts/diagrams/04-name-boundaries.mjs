import { diagram } from "./lib.mjs"

const TEXT = {
  "en": {
    "title": "Trimming happens before the length decision",
    "nodes": [
      [
        "\"  ab  \"",
        [
          "trim() → \"ab\""
        ]
      ],
      [
        "length 2",
        [
          "rejected"
        ]
      ],
      [
        "\"abc\"",
        [
          "trim() → \"abc\""
        ]
      ],
      [
        "length 3",
        [
          "accepted"
        ]
      ],
      [
        "\"abcd\"",
        [
          "trim() → \"abcd\""
        ]
      ],
      [
        "length 4",
        [
          "accepted"
        ]
      ]
    ],
    "footer": "Boundary: 3 characters after trimming; other fields must also be valid"
  },
  "es": {
    "title": "Primero se quitan los espacios; después se mide",
    "nodes": [
      [
        "\"  ab  \"",
        [
          "trim() → \"ab\""
        ]
      ],
      [
        "longitud 2",
        [
          "rechazado"
        ]
      ],
      [
        "\"abc\"",
        [
          "trim() → \"abc\""
        ]
      ],
      [
        "longitud 3",
        [
          "aceptado"
        ]
      ],
      [
        "\"abcd\"",
        [
          "trim() → \"abcd\""
        ]
      ],
      [
        "longitud 4",
        [
          "aceptado"
        ]
      ]
    ],
    "footer": "Límite: 3 caracteres tras trim(); los otros campos deben ser válidos"
  }
}
const NAME = "04-name-boundaries"

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
