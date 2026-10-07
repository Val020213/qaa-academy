import { diagram } from "./lib.mjs"

const TEXT = {
  "en": {
    "title": "Read saved data after the validation response",
    "steps": [
      [
        "Test clicks Save",
        [
          "product-save",
          "price = 0"
        ]
      ],
      [
        "Browser sends PUT",
        [
          "/api/products/<id>",
          "The request is pending"
        ]
      ],
      [
        "Server responds 422",
        [
          "Validation rejects 0",
          "Saved price stays 30"
        ]
      ],
      [
        "React shows error",
        [
          "Price must be",
          "greater than 0."
        ]
      ],
      [
        "Test waits for error",
        [
          "await expect(...)",
          "toHaveText(...)"
        ]
      ],
      [
        "Test reads saved data",
        [
          "GET /api/products/<id>",
          "price === 30"
        ]
      ]
    ],
    "race": [
      "Reading the API before the PUT response",
      "can return the old price while saving is still pending."
    ]
  },
  "es": {
    "title": "Lee los datos después de la respuesta de validación",
    "steps": [
      [
        "El test pulsa Save",
        [
          "product-save",
          "price = 0"
        ]
      ],
      [
        "Navegador envía PUT",
        [
          "/api/products/<id>",
          "La petición está pendiente"
        ]
      ],
      [
        "Servidor responde 422",
        [
          "La validación rechaza 0",
          "El precio guardado sigue en 30"
        ]
      ],
      [
        "React muestra error",
        [
          "Price must be",
          "greater than 0."
        ]
      ],
      [
        "El test espera el error",
        [
          "await expect(...)",
          "toHaveText(...)"
        ]
      ],
      [
        "El test lee los datos",
        [
          "GET /api/products/<id>",
          "price === 30"
        ]
      ]
    ],
    "race": [
      "Leer la API antes de la respuesta del PUT",
      "puede devolver el precio anterior mientras el guardado sigue pendiente."
    ]
  }
}

for (const [lang, t] of Object.entries(TEXT)) {
  const d = diagram(1000, 470)
  d.label(500,38,[t.title],{size:24,weight:700})
  const positions = [[30,75],[370,75],[710,75],[710,255],[370,255],[30,255]]
  t.steps.forEach(([title,lines],i)=>d.box(...positions[i],260,105,title,lines,{fill:i===2?"#ffe6e2":"#e9f7ec"}))
  d.arrow(295,127,365,127);d.arrow(635,127,705,127);d.arrow(840,185,840,250);d.arrow(705,307,635,307);d.arrow(365,307,295,307)
  d.note(500,412,t.race,{size:17})
  d.save(`public/images/05-validation-read.${lang}.svg`)
}
