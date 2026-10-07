import { diagram } from "./lib.mjs"

const TEXT = {
  "en": {
    "title": "Restarting the shop restores the seed",
    "steps": [
      [
        "Initial data",
        [
          "24 products",
          "1005: pending"
        ]
      ],
      [
        "Admin changes",
        [
          "25 products",
          "1005: paid"
        ]
      ],
      [
        "Server stops",
        [
          "Changes in memory",
          "are lost"
        ]
      ],
      [
        "Server starts",
        [
          "Seed creates",
          "products and orders"
        ]
      ],
      [
        "Restored data",
        [
          "24 products",
          "1005: pending"
        ]
      ]
    ],
    "note": "The new product is gone. Restarting also loses the in-memory sessions."
  },
  "es": {
    "title": "Reiniciar la tienda restaura la semilla",
    "steps": [
      [
        "Datos iniciales",
        [
          "24 productos",
          "1005: pending"
        ]
      ],
      [
        "Cambios del admin",
        [
          "25 productos",
          "1005: paid"
        ]
      ],
      [
        "Servidor detenido",
        [
          "Los cambios en",
          "memoria se pierden"
        ]
      ],
      [
        "Servidor iniciado",
        [
          "La semilla crea",
          "productos y pedidos"
        ]
      ],
      [
        "Datos restaurados",
        [
          "24 productos",
          "1005: pending"
        ]
      ]
    ],
    "note": "El producto nuevo desaparece. Reiniciar también pierde las sesiones en memoria."
  }
}

for (const [lang, t] of Object.entries(TEXT)) {
  const d = diagram(1000, 300)
  d.label(500, 40, [t.title], { size: 24, weight: 700 })
  t.steps.forEach(([title, lines], i) => {
    const x = 18 + i * 198
    d.box(x, 95, 172, 110, title, lines, { fill: i === 2 ? "#ffe6e2" : "#e9f7ec" })
    if (i) d.arrow(x - 22, 150, x - 4, 150)
  })
  d.label(500, 258, [t.note], { size: 17 })
  d.save(`public/images/05-memory-reset.${lang}.svg`)
}
