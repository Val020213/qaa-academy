import { diagram } from "./lib.mjs"

const TEXT = {
  en: {
    title: "Where a path starts",
    absolute: "Absolute: start at the drive",
    relative: "Relative: start where you are",
    current: "you are here",
    caption: "Both paths reach the same projects folder.",
    drive: "C:", users: "Users", user: "you", projects: "projects",
    fullPath: "C:/Users/you/projects", shortPath: "projects",
  },
  es: {
    title: "Dónde empieza una ruta",
    absolute: "Absoluta: desde la unidad",
    relative: "Relativa: desde donde estás",
    current: "estás aquí",
    caption: "Las dos rutas llegan a la misma carpeta projects.",
    drive: "C:", users: "Users", user: "you", projects: "projects",
    fullPath: "C:/Users/you/projects", shortPath: "projects",
  },
}

for (const [lang, t] of Object.entries(TEXT)) {
  const d = diagram(900, 580)
  d.label(450, 47, [t.title], { size: 25, weight: 700 })
  const folders = [[65, 100, t.drive], [165, 205, t.users], [265, 310, t.user], [365, 415, t.projects]]
  folders.slice(0, -1).forEach(([x, y], i) => {
    const [nextX, nextY] = folders[i + 1]
    d.line(x + 35, y + 65, x + 35, nextY + 28, { stroke: "#61758b" })
    d.arrow(x + 35, nextY + 28, nextX - 9, nextY + 28)
  })
  folders.forEach(([x, y, name], i) => {
    d.path(`M ${x} ${y + 11} L ${x} ${y} L ${x + 45} ${y} L ${x + 56} ${y + 11} L ${x + 147} ${y + 11} L ${x + 147} ${y + 64} L ${x} ${y + 64} Z`, {
      fill: i === 2 ? "#d9eaff" : "#fff0c9",
    })
    d.label(x + 73, y + 44, [name], { size: 22, mono: true })
  })
  d.label(452, 355, [t.current], { size: 18, color: "#205493", anchor: "start" })
  d.line(416, 345, 441, 345, { stroke: "#205493", roughness: 0.5 })
  d.rect(545, 105, 320, 114, { fill: "#f1f6ff" })
  d.label(705, 143, [t.absolute], { size: 19, weight: 700 })
  d.label(705, 186, [t.fullPath], { size: 20, mono: true })
  d.rect(545, 405, 320, 114, { fill: "#e9f7ec" })
  d.label(705, 443, [t.relative], { size: 19, weight: 700 })
  d.label(705, 487, [t.shortPath], { size: 23, mono: true })
  d.label(450, 554, [t.caption], { size: 19 })
  d.save(`public/images/folder-paths.${lang}.svg`)
}
