import { diagram } from "./lib.mjs"

const TEXT = {
  en: {
    title: "A shallow copy shares the nested object",
    separate: "two separate objects",
    shared: "one shared object",
    state: 'after copyOfRex.owner.city = "Cusco";',
    caption: "Both owner properties point to the same object.",
    original: "rex", copy: "copyOfRex", name: 'name: "Rex"', owner: "owner",
    city: 'city: "Cusco"', assignment: "const copyOfRex = { ...rex };",
  },
  es: {
    title: "Una copia superficial comparte el objeto interior",
    separate: "dos objetos separados",
    shared: "un objeto compartido",
    state: 'después de copyOfRex.owner.city = "Cusco";',
    caption: "Las dos propiedades owner apuntan al mismo objeto.",
    original: "rex", copy: "copyOfRex", name: 'name: "Rex"', owner: "owner",
    city: 'city: "Cusco"', assignment: "const copyOfRex = { ...rex };",
  },
}

for (const [lang, t] of Object.entries(TEXT)) {
  const d = diagram(900, 520)
  d.label(450, 48, [t.title], { size: 24, weight: 700 })
  d.label(450, 88, [t.assignment], { size: 21, mono: true })
  d.label(450, 128, [t.separate], { size: 20 })
  const roots = [[65, t.original], [575, t.copy]]
  roots.forEach(([x, name]) => {
    d.rect(x, 167, 260, 135, { fill: "#d9eaff" })
    d.label(x + 130, 197, [name], { size: 22, mono: true, weight: 700 })
    d.label(x + 130, 238, [t.name], { size: 22, mono: true })
    d.label(x + 130, 279, [t.owner], { size: 22, mono: true })
  })
  d.arrow(195, 311, 352, 335)
  d.arrow(705, 311, 548, 335)
  d.rect(320, 345, 260, 79, { fill: "#fff0c9" })
  d.label(450, 394, [t.city], { size: 23, mono: true })
  d.label(700, 397, [t.shared], { size: 18 })
  d.label(450, 461, [t.state], { size: 18 })
  d.label(450, 496, [t.caption], { size: 19 })
  d.save(`public/images/shallow-copy.${lang}.svg`)
}
