import { diagram } from "./lib.mjs"

const TEXT = {
  "en": {
    "title": "An app change must not rewrite the test’s expectation",
    "nodes": [
      [
        "App message changes",
        [
          "accidental wording change"
        ]
      ],
      [
        "Rendered message",
        [
          "now contains the wrong text"
        ]
      ],
      [
        "Import from the app",
        [
          "expectation changes with it"
        ]
      ],
      [
        "Same wrong text on both sides",
        [
          "test can still pass"
        ]
      ],
      [
        "Literal expectation in the test",
        [
          "retains the required wording"
        ]
      ],
      [
        "Compare with rendered text",
        [
          "difference makes the test fail"
        ]
      ]
    ],
    "footer": "Keep the expected message independent of the code under test"
  },
  "es": {
    "title": "Cambiar la app no debe cambiar lo esperado por el test",
    "nodes": [
      [
        "Cambia el mensaje de la app",
        [
          "cambio accidental del texto"
        ]
      ],
      [
        "Mensaje mostrado",
        [
          "ahora contiene el texto incorrecto"
        ]
      ],
      [
        "Importar desde la app",
        [
          "también cambia lo esperado"
        ]
      ],
      [
        "Mismo error en ambos lados",
        [
          "el test puede seguir pasando"
        ]
      ],
      [
        "Texto esperado en el test",
        [
          "conserva el texto requerido"
        ]
      ],
      [
        "Comparar con la pantalla",
        [
          "la diferencia hace fallar el test"
        ]
      ]
    ],
    "footer": "Conserva el mensaje esperado separado del código que compruebas"
  }
}
const NAME = "04-independent-expectations"

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
