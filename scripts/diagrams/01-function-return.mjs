import { diagram } from "./lib.mjs"

const TEXT = {
  es: {
    title: "El resultado vuelve al código que hizo la llamada",
    call: "Llamada", parameters: "Parámetros", result: "Retorno", stored: "Guardar", print: "Imprimir",
    callCode: "areaOfRectangle(4, 5)", width: "width = 4", height: "height = 5", returned: "return width * height",
    value: "20", variable: "gardenArea = 20", output: "console.log(gardenArea)",
    argument: "argumentos", returnedValue: "valor de la llamada", terminal: "terminal: 20",
    caption: "return entrega 20; console.log lo muestra después.",
  },
  en: {
    title: "The result goes back to the code that made the call",
    call: "Call", parameters: "Parameters", result: "Return", stored: "Store", print: "Print",
    callCode: "areaOfRectangle(4, 5)", width: "width = 4", height: "height = 5", returned: "return width * height",
    value: "20", variable: "gardenArea = 20", output: "console.log(gardenArea)",
    argument: "arguments", returnedValue: "value of the call", terminal: "terminal: 20",
    caption: "return delivers 20; console.log displays it afterwards.",
  },
}

for (const [lang, t] of Object.entries(TEXT)) {
  const d = diagram(960, 435)
  d.label(480, 42, [t.title], { size: 24, weight: 700 })
  d.box(30, 94, 280, 100, t.call, [t.callCode, t.argument], { fill: "#e7f0ff" })
  d.box(360, 94, 240, 100, t.parameters, [t.width, t.height])
  d.box(650, 94, 280, 100, t.result, [t.returned, t.value], { fill: "#e9f7ec" })
  d.arrow(318, 144, 352, 144)
  d.arrow(608, 144, 642, 144)
  d.box(360, 283, 240, 100, t.stored, [t.variable, t.returnedValue], { fill: "#e9f7ec" })
  d.box(30, 283, 280, 100, t.print, [t.output, t.terminal], { fill: "#e7f0ff" })
  d.arrow(790, 202, 790, 333)
  d.arrow(790, 333, 608, 333)
  d.arrow(352, 333, 318, 333)
  d.label(480, 417, [t.caption], { size: 19 })
  d.save(`public/images/01-function-return.${lang}.svg`)
}
