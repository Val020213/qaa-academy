// Why an index starts at 0: how C lays out an array in memory. Used in 01-programming/06-arrays-and-loops.
import { diagram } from "./lib.mjs"

const TEXT = {
  en: {
    title: "An array in memory, in a language like C",
    variable: "the variable holds a pointer:", where: "the address of the first slot",
    address: "address", index: "index",
    formula: "address = start + index × slot size",
    example: "example addresses; each 8-byte slot holds a reference to a text",
  },
  es: {
    title: "Un array en memoria, en un lenguaje como C",
    variable: "la variable guarda un puntero:", where: "la dirección de la primera casilla",
    address: "dirección", index: "índice",
    formula: "dirección = inicio + índice × tamaño de la casilla",
    example: "direcciones de ejemplo; cada casilla de 8 bytes guarda la referencia a un texto",
  },
}
const DOGS = ['"Rex"', '"Mimi"', '"Luna"']
const START = 1000, SLOT = 8

for (const [lang, t] of Object.entries(TEXT)) {
  const d = diagram(980, 480)
  d.label(490, 46, [t.title], { size: 25, weight: 700 })

  // The variable and its pointer.
  d.rect(40, 150, 190, 96, { fill: "#d9eaff" })
  d.label(135, 190, ["dogs"], { size: 23, mono: true, weight: 700 })
  d.label(135, 224, [`→ ${START}`], { size: 21, mono: true })
  d.label(40, 280, [t.variable], { size: 17, anchor: "start" })
  d.label(40, 303, [t.where], { size: 17, anchor: "start" })
  d.arrow(236, 198, 322, 198)

  // Three slots side by side.
  const w = 180, x0 = 330, y = 150, h = 96
  DOGS.forEach((dog, i) => {
    const x = x0 + i * w, cx = x + w / 2
    d.rect(x, y, w, h, { fill: i === 0 ? "#fff0c9" : "#fff7e3" })
    d.label(cx, y + 58, [dog], { size: 24, mono: true })
    d.label(x + 6, y - 14, [String(START + i * SLOT)], { size: 19, mono: true, color: "#52606d", anchor: "start" })
    d.label(cx, y + h + 44, [String(i)], { size: 30, mono: true, weight: 700 })
    d.label(cx, y + h + 84, [`${START} + ${i} × ${SLOT}`], { size: 18, mono: true, color: "#52606d" })
  })
  d.label(x0 + 3 * w + 14, y - 14, [t.address], { size: 16, anchor: "start", color: "#52606d" })
  d.label(x0 + 3 * w + 14, y + h + 40, [t.index], { size: 16, anchor: "start" })

  d.label(490, 410, [t.formula], { size: 21, weight: 700 })
  d.label(490, 448, [t.example], { size: 16, color: "#52606d" })
  d.save(`public/images/zero-index.${lang}.svg`)
}
