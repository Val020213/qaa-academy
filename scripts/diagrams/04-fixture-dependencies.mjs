import { diagram } from "./lib.mjs"
import { readFileSync, writeFileSync } from "node:fs"

const TEXT = {
  "en": {
    "title": "A dependency outlives the fixture that uses it",
    "nodes": [
      [
        "1. Setup user",
        [
          "user is available"
        ]
      ],
      [
        "2. Setup product",
        [
          "product needs user"
        ]
      ],
      [
        "3. Test",
        [
          "uses both values"
        ]
      ],
      [
        "4. Teardown product",
        [
          "user is still available"
        ]
      ],
      [
        "5. Teardown user",
        [
          "after product cleanup"
        ]
      ]
    ],
    "footer": "Shown when setup reaches use(); cleanup reverses the dependency order"
  },
  "es": {
    "title": "La dependencia vive más que el fixture que la usa",
    "nodes": [
      [
        "1. Preparar usuario",
        [
          "usuario disponible"
        ]
      ],
      [
        "2. Preparar producto",
        [
          "necesita al usuario"
        ]
      ],
      [
        "3. Test",
        [
          "usa ambos valores"
        ]
      ],
      [
        "4. Limpiar producto",
        [
          "usuario aún disponible"
        ]
      ],
      [
        "5. Limpiar usuario",
        [
          "tras limpiar el producto"
        ]
      ]
    ],
    "footer": "Si el setup llega a use(), la limpieza invierte el orden de dependencias"
  }
}
const NAME = "04-fixture-dependencies"

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
  {
    const numbered=[]
    boxes.forEach(([x,y,w,h],i)=>{
      const part=diagram(960,600)
      part.rect(x-5,y-5,w+10,h+10,{stroke:"#2563eb",strokeWidth:3,fill:"none"})
      const temp=`.scratch/codex-lessons/media-m45/${NAME}-${lang}-outline-${i}.svg`
      part.save(temp)
      const body=readFileSync(temp,"utf8").split('\n').slice(2,-2).join('\n')
      numbered.push(`<g class="focus focus-${i}">${body}</g>`)
    })
    const css=`<style>.focus{opacity:0;animation:visit 10s linear infinite}.focus-0{animation-delay:0s}.focus-1{animation-delay:2s}.focus-2{animation-delay:4s}.focus-3{animation-delay:6s}.focus-4{animation-delay:8s}@keyframes visit{0%,19.9%{opacity:1}20%,100%{opacity:0}}@media(prefers-reduced-motion:reduce){.focus{animation:none;opacity:0}.focus-4{opacity:1}}</style>`
    writeFileSync(file,readFileSync(file,"utf8").replace('</svg>',css+numbered.join('\n')+'</svg>'))
  }
}
