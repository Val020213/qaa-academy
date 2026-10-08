import { diagram } from "./lib.mjs"

const TEXT = {
  "en": {
    "title": "A local passing test can still be missing from a commit",
    "nodes": [
      [
        "Tracked COVERAGE.md",
        [
          "modified on disk"
        ]
      ],
      [
        "git commit -am",
        [
          "includes the tracked edit"
        ]
      ],
      [
        "New spec",
        [
          "untracked on disk"
        ]
      ],
      [
        "git commit -am",
        [
          "does not include the new file"
        ]
      ],
      [
        "git add <new-spec>",
        [
          "stage the new spec explicitly"
        ]
      ],
      [
        "git diff --staged",
        [
          "review what enters the commit"
        ]
      ]
    ],
    "footer": "Playwright reads files from disk; reviewers see the committed files"
  },
  "es": {
    "title": "Un test local verde puede quedar fuera del commit",
    "nodes": [
      [
        "COVERAGE.md rastreado",
        [
          "modificado en disco"
        ]
      ],
      [
        "git commit -am",
        [
          "incluye la edición rastreada"
        ]
      ],
      [
        "Spec nuevo",
        [
          "sin rastrear en disco"
        ]
      ],
      [
        "git commit -am",
        [
          "no incluye el archivo nuevo"
        ]
      ],
      [
        "git add <new-spec>",
        [
          "prepara el spec explícitamente"
        ]
      ],
      [
        "git diff --staged",
        [
          "revisa qué entra al commit"
        ]
      ]
    ],
    "footer": "Playwright lee el disco; el revisor ve los archivos del commit"
  }
}
const NAME = "05-commit-inclusion"

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
