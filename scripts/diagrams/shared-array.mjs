import { diagram } from "./lib.mjs"

const TEXT = {
  en: {
    title: "Two names, one list",
    state: "after b.push(\"y\")",
    list: "one array",
    caption: "Both names point to the same array.",
    first: "a", second: "b", assignment: "const b = a;", values: '["x", "y"]',
  },
  es: {
    title: "Dos nombres, una sola lista",
    state: "después de b.push(\"y\")",
    list: "un solo array",
    caption: "Los dos nombres apuntan al mismo array.",
    first: "a", second: "b", assignment: "const b = a;", values: '["x", "y"]',
  },
}

for (const [lang, t] of Object.entries(TEXT)) {
  const d = diagram(900, 450)
  d.label(450, 49, [t.title], { size: 25, weight: 700 })
  d.label(450, 91, [t.assignment], { size: 22, mono: true })
  d.rect(135, 151, 100, 72, { fill: "#d9eaff" })
  d.label(185, 199, [t.first], { size: 29, mono: true })
  d.rect(135, 279, 100, 72, { fill: "#e9f7ec" })
  d.label(185, 327, [t.second], { size: 29, mono: true })
  d.arrow(247, 187, 527, 229)
  d.arrow(247, 315, 527, 271)
  d.rect(540, 190, 250, 124, { fill: "#fff0c9" })
  d.label(665, 173, [t.list], { size: 20 })
  d.label(665, 262, [t.values], { size: 29, mono: true })
  d.label(665, 352, [t.state], { size: 18 })
  d.label(450, 411, [t.caption], { size: 20 })
  d.save(`public/images/shared-array.${lang}.svg`)
}
