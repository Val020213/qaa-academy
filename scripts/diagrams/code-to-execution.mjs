// What Node.js does with a .ts file. Used in 01-programming/01-what-is-programming.
import { diagram } from "./lib.mjs"

const TEXT = {
  en: {
    file: ["Your file", ["hello.ts", "(text)"]],
    parse: ["Parse", ["check the grammar,", "remove the types"]],
    js: ["JavaScript", ["no type", "annotations"]],
    bytecode: ["V8: bytecode", ["parse again,", "build the tree"]],
    run: ["Execution", ["one instruction", "at a time (+ JIT)"]],
    node: "Node.js",
    check: ["Type checker", ["VS Code, pnpm typecheck"]],
    apart: ["a separate tool:", "Node.js does not check types"],
    syntax: ["a syntax error", "stops everything here"],
    runtime: ["other errors", "appear here"],
  },
  es: {
    file: ["Tu archivo", ["hello.ts", "(texto)"]],
    parse: ["Análisis", ["revisa la gramática,", "quita los tipos"]],
    js: ["JavaScript", ["sin anotaciones", "de tipos"]],
    bytecode: ["V8: bytecode", ["analiza otra vez,", "construye el árbol"]],
    run: ["Ejecución", ["una instrucción", "a la vez (+ JIT)"]],
    node: "Node.js",
    check: ["Verificador de tipos", ["VS Code, pnpm typecheck"]],
    apart: ["una herramienta aparte:", "Node.js no verifica los tipos"],
    syntax: ["un error de sintaxis", "detiene todo aquí"],
    runtime: ["los demás errores", "aparecen aquí"],
  },
}

for (const [lang, t] of Object.entries(TEXT)) {
  const d = diagram(1000, 410)
  const y = 70, w = 164, h = 104, gap = 30
  const x = (i) => 30 + i * (w + gap)
  const steps = [t.file, t.parse, t.js, t.bytecode, t.run]
  steps.forEach(([title, lines], i) => {
    d.box(x(i), y, w, h, title, lines, { fill: i === 0 ? "#e7f0ff" : "#fff7d6" })
    if (i > 0) d.arrow(x(i - 1) + w + 4, y + h / 2, x(i) - 5, y + h / 2)
  })
  // Everything after the file happens inside Node.js.
  d.label(x(1), y - 22, [t.node], { weight: 700, anchor: "start", size: 16 })
  d.arrow(x(1), y - 14, x(4) + w, y - 14)
  d.note(x(1) + w / 2, y + h + 28, t.syntax)
  d.note(x(4) + w / 2, y + h + 28, t.runtime)
  // The type checker is a side branch from the file.
  const cy = 300
  d.arrow(x(0) + w / 2, y + h + 6, x(0) + w / 2, cy - 6, { dashed: true })
  d.box(x(0), cy, w + 90, 84, t.check[0], t.check[1], { fill: "#e9f7ec", dashed: true })
  d.label(x(0) + w + 112, cy + 36, t.apart, { anchor: "start", size: 15 })
  d.save(`public/images/code-to-execution.${lang}.svg`)
}
