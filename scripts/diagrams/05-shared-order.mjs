import { diagram } from "./lib.mjs"

const TEXT = {
  "en": {
    "title": "Two execution orders, the same shared order",
    "first": "Cancel runs first",
    "second": "Payment runs first",
    "steps": [
      [
        "Fresh seed",
        [
          "1001: pending"
        ]
      ],
      [
        "Cancel test passes",
        [
          "1001: cancelled"
        ]
      ],
      [
        "Payment guard fails",
        [
          "Expected: pending",
          "Received: cancelled"
        ]
      ],
      [
        "Fresh seed",
        [
          "1001: pending"
        ]
      ],
      [
        "Payment test passes",
        [
          "1001: paid"
        ]
      ],
      [
        "Cancel guard fails",
        [
          "Expected: pending",
          "Received: paid"
        ]
      ]
    ],
    "note": "The second test fails before clicking. Reserve a different seeded id for each mutation."
  },
  "es": {
    "title": "Dos órdenes de ejecución, el mismo pedido compartido",
    "first": "Cancelar corre primero",
    "second": "Pagar corre primero",
    "steps": [
      [
        "Semilla fresca",
        [
          "1001: pending"
        ]
      ],
      [
        "Cancelar pasa",
        [
          "1001: cancelled"
        ]
      ],
      [
        "Guarda de pagar falla",
        [
          "Expected: pending",
          "Received: cancelled"
        ]
      ],
      [
        "Semilla fresca",
        [
          "1001: pending"
        ]
      ],
      [
        "Pagar pasa",
        [
          "1001: paid"
        ]
      ],
      [
        "Guarda de cancelar falla",
        [
          "Expected: pending",
          "Received: paid"
        ]
      ]
    ],
    "note": "El segundo test falla antes del clic. Reserva un id distinto de la semilla para cada cambio."
  }
}

for (const [lang, t] of Object.entries(TEXT)) {
  const d = diagram(1000, 455)
  d.label(500,38,[t.title],{size:24,weight:700})
  d.label(30,80,[t.first],{size:17,anchor:"start",weight:700})
  d.label(30,245,[t.second],{size:17,anchor:"start",weight:700})
  t.steps.forEach(([title,lines],i)=>{
    const col=i%3, y=i<3?100:265, x=30+col*340
    d.box(x,y,260,100,title,lines,{fill:col===2?"#ffe6e2":"#e9f7ec"})
    if(col) d.arrow(x-75,y+50,x-5,y+50)
  })
  d.label(500,416,[t.note],{size:17})
  d.save(`public/images/05-shared-order.${lang}.svg`)
}
