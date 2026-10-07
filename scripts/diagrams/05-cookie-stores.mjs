import { diagram } from "./lib.mjs"

const TEXT = {
  "en": {
    "title": "Two request clients, two cookie stores",
    "page": [
      "Browser page",
      [
        "page.goto(...)",
        "Uses context cookies"
      ]
    ],
    "shared": [
      "Browser context",
      [
        "One shared cookie store",
        "Viewer after page.request login"
      ]
    ],
    "pageRequest": [
      "page.request",
      [
        "loginViaApi(..., VIEWER)",
        "Updates the shared store"
      ]
    ],
    "request": [
      "request fixture",
      [
        "Independent API client",
        "Starts from storageState"
      ]
    ],
    "separate": [
      "Request cookie store",
      [
        "Separate from the browser",
        "Own login updates only this store"
      ]
    ],
    "note": [
      "A login response updates the cookie store of the client that sent the request.",
      "Signing in with request does not sign in the browser page."
    ]
  },
  "es": {
    "title": "Dos clientes de peticiones, dos almacenes de cookies",
    "page": [
      "Página del navegador",
      [
        "page.goto(...)",
        "Usa las cookies del contexto"
      ]
    ],
    "shared": [
      "Contexto del navegador",
      [
        "Un almacén compartido",
        "Viewer tras login de page.request"
      ]
    ],
    "pageRequest": [
      "page.request",
      [
        "loginViaApi(..., VIEWER)",
        "Actualiza el almacén compartido"
      ]
    ],
    "request": [
      "Fixture request",
      [
        "Cliente de API independiente",
        "Empieza desde storageState"
      ]
    ],
    "separate": [
      "Cookies de request",
      [
        "Separadas del navegador",
        "Su login solo cambia este almacén"
      ]
    ],
    "note": [
      "La respuesta del login actualiza las cookies del cliente que envió la petición.",
      "Iniciar sesión con request no inicia la sesión de la página."
    ]
  }
}

for (const [lang, t] of Object.entries(TEXT)) {
  const d = diagram(1000, 460)
  d.label(500,38,[t.title],{size:24,weight:700})
  d.box(25,85,265,110,...t.page,{fill:"#e7f0ff"})
  d.box(360,85,280,110,...t.shared,{fill:"#e9f7ec"})
  d.box(710,85,265,110,...t.pageRequest,{fill:"#e7f0ff"})
  d.arrow(295,135,355,135);d.arrow(705,135,645,135)
  d.box(25,265,265,110,...t.request,{fill:"#fff7d6"})
  d.box(360,265,280,110,...t.separate,{fill:"#fff7d6"})
  d.arrow(295,320,355,320)
  d.label(500,414,t.note,{size:17})
  d.save(`public/images/05-cookie-stores.${lang}.svg`)
}
