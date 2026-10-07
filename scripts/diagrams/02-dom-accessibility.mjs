import { diagram } from "./lib.mjs"

const TEXT = {
  "en": {
    "title": "HTML becomes accessible roles, names and states",
    "dom": "DOM controls (examples from this lesson)",
    "ax": "Accessible representation of these controls",
    "email": [
      "Email field",
      [
        "label: Email",
        "for=\"login-email\" → input",
        "id=\"login-email\", type=\"email\""
      ]
    ],
    "button": [
      "Sign-in button",
      [
        "<button>Sign in</button>"
      ]
    ],
    "check": [
      "Case checkbox",
      [
        "label → input + \"One\"",
        "<input type=\"checkbox\">"
      ]
    ],
    "emailAx": [
      "Email",
      [
        "role: textbox",
        "name: Email"
      ]
    ],
    "buttonAx": [
      "Sign in",
      [
        "role: button",
        "name: Sign in"
      ]
    ],
    "checkAx": [
      "One",
      [
        "role: checkbox",
        "name: One",
        "checked: false"
      ]
    ],
    "note": "A view of three controls, not the whole accessibility tree"
  },
  "es": {
    "title": "El HTML aporta roles, nombres y estados accesibles",
    "dom": "Controles del DOM (ejemplos de esta lección)",
    "ax": "Representación accesible de estos controles",
    "email": [
      "Campo Email",
      [
        "label: Email",
        "for=\"login-email\" → input",
        "id=\"login-email\", type=\"email\""
      ]
    ],
    "button": [
      "Botón de login",
      [
        "<button>Sign in</button>"
      ]
    ],
    "check": [
      "Casilla de un caso",
      [
        "label → input + \"One\"",
        "<input type=\"checkbox\">"
      ]
    ],
    "emailAx": [
      "Email",
      [
        "role: textbox",
        "name: Email"
      ]
    ],
    "buttonAx": [
      "Sign in",
      [
        "role: button",
        "name: Sign in"
      ]
    ],
    "checkAx": [
      "One",
      [
        "role: checkbox",
        "name: One",
        "checked: false"
      ]
    ],
    "note": "Vista de tres controles, no del árbol de accesibilidad completo"
  }
}

for (const [lang, t] of Object.entries(TEXT)) {

  const d = diagram(1000, 530)
  d.label(500, 38, [t.title], {size:23, weight:700})
  d.label(500, 80, [t.dom], {size:17})
  const x = [25, 365, 705]
  const upper = [t.email, t.button, t.check], lower = [t.emailAx, t.buttonAx, t.checkAx]
  upper.forEach((v,i)=>{d.box(x[i], 102, 270, 132, ...v, {fill:'#e7f0ff'}); d.arrow(x[i]+135, 242, x[i]+135, 302)})
  d.label(500, 470, [t.ax], {size:17})
  lower.forEach((v,i)=>d.box(x[i], 310, 270, 136, ...v, {fill:'#e9f7ec'}))
  d.label(500, 511, [t.note], {size:15})

  d.save(`public/images/02-dom-accessibility.${lang}.svg`)
}
