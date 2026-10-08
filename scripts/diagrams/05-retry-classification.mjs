import { diagram } from "./lib.mjs"

const TEXT = {
  "en": {
    "title": "Two retries allow up to three attempts",
    "nodes": [
      [
        "Attempt 0",
        [
          "initial execution"
        ]
      ],
      [
        "Passes immediately",
        [
          "passed"
        ]
      ],
      [
        "Fails",
        [
          "runner can retry"
        ]
      ],
      [
        "Attempt 1, then 2",
        [
          "stop at the first pass"
        ]
      ],
      [
        "A retry passes",
        [
          "flaky"
        ]
      ],
      [
        "All attempts fail",
        [
          "failed"
        ]
      ],
      [
        "Read the failed trace",
        [
          "investigate even if CI is green"
        ]
      ]
    ],
    "footer": "Playwright retries the test; it does not repair the cause"
  },
  "es": {
    "title": "Dos reintentos permiten hasta tres intentos",
    "nodes": [
      [
        "Intento 0",
        [
          "ejecución inicial"
        ]
      ],
      [
        "Pasa de inmediato",
        [
          "passed"
        ]
      ],
      [
        "Falla",
        [
          "el runner puede reintentar"
        ]
      ],
      [
        "Intento 1 y luego 2",
        [
          "se detiene en el primer éxito"
        ]
      ],
      [
        "Pasa un reintento",
        [
          "flaky"
        ]
      ],
      [
        "Fallan todos",
        [
          "failed"
        ]
      ],
      [
        "Lee el trace del fallo",
        [
          "investiga aunque CI salga verde"
        ]
      ]
    ],
    "footer": "Playwright repite el test; no corrige la causa"
  }
}
const NAME = "05-retry-classification"

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

    box(0,30,90,270,85,"#e7f0ff");box(1,660,90,270,85,"#e9f7ec");box(2,30,245,270,85,"#fff0ec")
    box(3,345,245,270,85);box(4,660,245,270,85,"#fff7d6")
    box(5,345,405,270,85,"#fff0ec");box(6,660,405,270,100,"#f0f3f5")
    d.arrow(305,132,655,132);d.arrow(165,180,165,240);d.arrow(305,286,340,286);d.arrow(620,286,655,286)
    d.arrow(480,335,480,400);d.arrow(795,335,795,400)
    d.label(480,582,[t.footer],{size:17,color:"#52606d"})
  const file=`public/images/${NAME}.${lang}.svg`
  d.save(file)

}
