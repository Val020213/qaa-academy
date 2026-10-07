import { diagram } from "./lib.mjs"

const TEXT = {
  "en": {
    "title": "An HTTP request and its response",
    "browser": [
      "Browser: client",
      [
        "The page asks",
        "for products"
      ]
    ],
    "request": [
      "Request",
      [
        "GET /api/products",
        "Headers",
        "No request body"
      ]
    ],
    "server": [
      "HTTP server",
      [
        "Checks the session",
        "Reads products"
      ]
    ],
    "response": [
      "Response",
      [
        "200 OK",
        "Content-Type: application/json",
        "Body: product data"
      ]
    ],
    "page": [
      "Page code",
      [
        "Reads the response",
        "Updates the DOM"
      ]
    ],
    "out": "request →",
    "back": "← response",
    "note": "Bodies are optional: 204 has no response body"
  },
  "es": {
    "title": "Una petición HTTP y su respuesta",
    "browser": [
      "Navegador: cliente",
      [
        "La página pide",
        "los productos"
      ]
    ],
    "request": [
      "Petición",
      [
        "GET /api/products",
        "Encabezados",
        "Sin cuerpo de petición"
      ]
    ],
    "server": [
      "Servidor HTTP",
      [
        "Comprueba la sesión",
        "Lee los productos"
      ]
    ],
    "response": [
      "Respuesta",
      [
        "200 OK",
        "Content-Type: application/json",
        "Cuerpo: datos de productos"
      ]
    ],
    "page": [
      "Código de la página",
      [
        "Lee la respuesta",
        "Actualiza el DOM"
      ]
    ],
    "out": "petición →",
    "back": "← respuesta",
    "note": "Los cuerpos son opcionales: 204 no tiene cuerpo de respuesta"
  }
}

for (const [lang, t] of Object.entries(TEXT)) {

  const d = diagram(980, 460)
  d.label(490, 38, [t.title], {size:24, weight:700})
  d.box(25, 92, 235, 125, ...t.browser, {fill:'#e7f0ff'})
  d.box(340, 92, 300, 125, ...t.request)
  d.box(720, 92, 235, 125, ...t.server, {fill:'#e9f7ec'})
  d.arrow(268, 153, 330, 153);d.arrow(648, 153, 710, 153)
  d.label(490, 75, [t.out], {size:15})
  d.box(25, 283, 235, 125, ...t.page, {fill:'#e7f0ff'})
  d.box(340, 283, 300, 125, ...t.response)
  d.arrow(839, 225, 839, 345);d.arrow(839, 345, 650, 345);d.arrow(330, 345, 270, 345)
  d.label(490, 263, [t.back], {size:15})
  d.label(490, 443, [t.note], {size:16})

  d.save(`public/images/02-http-exchange.${lang}.svg`)
}
