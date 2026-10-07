import { diagram } from "./lib.mjs"

const TEXT = {
  "en": {
    "title": "CI skips later tests after a failed step",
    "steps": [
      [
        "Type check",
        [
          "pnpm typecheck"
        ]
      ],
      [
        "Browser install",
        [
          "Chromium + libraries"
        ]
      ],
      [
        "Course suite",
        [
          "pnpm e2e"
        ]
      ],
      [
        "Shop suite",
        [
          "pnpm shop:e2e"
        ]
      ]
    ],
    "failure": [
      "A normal step fails",
      [
        "Later normal steps skip",
        "Example: course suite fails"
      ]
    ],
    "upload": [
      "Upload available reports",
      [
        "if: !cancelled()",
        "No reports means no artifact"
      ]
    ],
    "failLabel": "Failure example",
    "success": "On success",
    "note": "The upload step can run after failure. A cancelled run can skip it."
  },
  "es": {
    "title": "CI omite tests posteriores tras un paso fallido",
    "steps": [
      [
        "Revisión de tipos",
        [
          "pnpm typecheck"
        ]
      ],
      [
        "Instala el navegador",
        [
          "Chromium + bibliotecas"
        ]
      ],
      [
        "Suite del curso",
        [
          "pnpm e2e"
        ]
      ],
      [
        "Suite de la tienda",
        [
          "pnpm shop:e2e"
        ]
      ]
    ],
    "failure": [
      "Un paso normal falla",
      [
        "Omite pasos normales siguientes",
        "Ejemplo: falla la suite del curso"
      ]
    ],
    "upload": [
      "Sube reportes disponibles",
      [
        "if: !cancelled()",
        "Sin reportes no hay artefacto"
      ]
    ],
    "failLabel": "Ejemplo de fallo",
    "success": "Si pasa",
    "note": "La subida puede correr después de un fallo. Si se cancela la ejecución, puede omitirse."
  }
}

for (const [lang, t] of Object.entries(TEXT)) {
  const d = diagram(1000, 420)
  d.label(500,38,[t.title],{size:24,weight:700})
  t.steps.forEach(([title,lines],i)=>{
    const x=20+i*245
    d.box(x,90,210,90,title,lines,{fill:"#e7f0ff"})
    if(i)d.arrow(x-30,135,x-5,135)
  })
  d.box(280,265,290,100,...t.failure,{fill:"#ffe6e2",dashed:true})
  d.box(690,265,290,100,...t.upload,{fill:"#e9f7ec"})
  d.arrow(565,185,450,260,{dashed:true})
  d.note(450,216,[t.failLabel],{anchor:"end",size:16})
  d.arrow(860,185,860,260)
  d.label(878,226,[t.success],{size:16,anchor:"start"})
  d.arrow(575,315,685,315)
  d.label(500,401,[t.note],{size:17})
  d.save(`public/images/05-ci-failure-flow.${lang}.svg`)
}
