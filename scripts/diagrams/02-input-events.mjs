import { diagram } from "./lib.mjs"

const TEXT = {
  "en": {
    "title": "Changing the value does not always fire an input event",
    "user": [
      "User edit",
      [
        "Types or pastes",
        "into the field"
      ]
    ],
    "value": [
      "The value changes",
      [
        "box.value → \"hello\""
      ]
    ],
    "listener": [
      "input listener runs",
      [
        "() => n++",
        "n increases"
      ]
    ],
    "script": [
      "Script assignment",
      [
        "box.value = \"hello\""
      ]
    ],
    "scriptValue": [
      "The value changes",
      [
        "box.value → \"hello\""
      ]
    ],
    "none": [
      "No input event",
      [
        "Listener does not run",
        "n stays at 0"
      ]
    ],
    "note": "Separate examples, each starting with n = 0"
  },
  "es": {
    "title": "Cambiar el valor no siempre genera un evento input",
    "user": [
      "Edición del usuario",
      [
        "Escribe o pega",
        "en el campo"
      ]
    ],
    "value": [
      "El valor cambia",
      [
        "box.value → \"hello\""
      ]
    ],
    "listener": [
      "Se ejecuta el manejador input",
      [
        "() => n++",
        "n aumenta"
      ]
    ],
    "script": [
      "Asignación del script",
      [
        "box.value = \"hello\""
      ]
    ],
    "scriptValue": [
      "El valor cambia",
      [
        "box.value → \"hello\""
      ]
    ],
    "none": [
      "Sin evento input",
      [
        "El manejador no se ejecuta",
        "n sigue en 0"
      ]
    ],
    "note": "Ejemplos separados, cada uno empieza con n = 0"
  }
}

for (const [lang, t] of Object.entries(TEXT)) {

  const d = diagram(1000, 390)
  d.label(500, 38, [t.title], {size:23, weight:700})
  const xs=[25,360,695]
  ;[t.user,t.value,t.listener].forEach((v,i)=>{d.box(xs[i], 85, 280, 100, ...v, {fill:'#e9f7ec'});if(i) d.arrow(xs[i-1]+288,135,xs[i]-9,135)})
  ;[t.script,t.scriptValue,t.none].forEach((v,i)=>{d.box(xs[i], 230, 280, 100, ...v, {fill:i===2?'#ffe9e6':'#e7f0ff'});if(i) d.arrow(xs[i-1]+288,280,xs[i]-9,280)})
  d.label(500, 368, [t.note], {size:16})

  d.save(`public/images/02-input-events.${lang}.svg`)
}
