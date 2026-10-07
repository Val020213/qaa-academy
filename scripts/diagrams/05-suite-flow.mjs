import { diagram } from "./lib.mjs"

const TEXT = {
  "en": {
    "title": "From configuration to test results",
    "steps": [
      [
        "Configuration",
        [
          "playwright.config.ts",
          "projects + webServer"
        ]
      ],
      [
        "Server",
        [
          "Start if unavailable",
          "Reuse locally if available"
        ]
      ],
      [
        "Setup",
        [
          "Reset data, sign in",
          "global.setup.ts"
        ]
      ],
      [
        "Saved session",
        [
          "e2e/.auth/admin.json",
          "Written by setup"
        ]
      ],
      [
        "Chromium specs",
        [
          "Wait for setup to pass",
          "Admin state by default"
        ]
      ],
      [
        "Results",
        [
          "playwright-report/",
          "test-results/"
        ]
      ]
    ],
    "failure": "If setup fails, Chromium specs do not run.",
    "local": "Reuse requires empty or absent CI; SHOP_E2E_PORT can change port 5190.",
    "override": "auth.spec.ts overrides the saved state with empty cookies and origins."
  },
  "es": {
    "title": "De la configuración a los resultados",
    "steps": [
      [
        "Configuración",
        [
          "playwright.config.ts",
          "projects + webServer"
        ]
      ],
      [
        "Servidor",
        [
          "Inicia si no responde",
          "Reutiliza en local si responde"
        ]
      ],
      [
        "Setup",
        [
          "Reinicia datos, entra",
          "global.setup.ts"
        ]
      ],
      [
        "Sesión guardada",
        [
          "e2e/.auth/admin.json",
          "El setup la escribe"
        ]
      ],
      [
        "Specs de Chromium",
        [
          "Esperan que pase setup",
          "Estado del admin por defecto"
        ]
      ],
      [
        "Resultados",
        [
          "playwright-report/",
          "test-results/"
        ]
      ]
    ],
    "failure": "Si setup falla, los specs de Chromium no corren.",
    "local": "Reutilizar requiere CI vacía o ausente; SHOP_E2E_PORT puede cambiar el puerto 5190.",
    "override": "auth.spec.ts reemplaza el estado guardado con cookies y orígenes vacíos."
  }
}

for (const [lang, t] of Object.entries(TEXT)) {
  const d = diagram(1000, 500)
  d.label(500, 38, [t.title], { size: 24, weight: 700 })
  const positions = [[30,80],[370,80],[710,80],[710,270],[370,270],[30,270]]
  t.steps.forEach(([title, lines], i) => d.box(...positions[i], 260, 100, title, lines, { fill: i === 2 ? "#fff7d6" : "#e7f0ff" }))
  d.arrow(295,130,365,130); d.arrow(635,130,705,130)
  d.arrow(840,185,840,265); d.arrow(705,320,635,320); d.arrow(365,320,295,320)
  d.note(450,218,[t.failure],{size:16})
  d.label(500,422,[t.local],{size:16})
  d.label(500,457,[t.override],{size:16})
  d.save(`public/images/05-suite-flow.${lang}.svg`)
}
