import { diagram } from './lib.mjs'

const TEXT = {
  en: {
    title: 'await lets the caller continue',
    main: ['main starts', ['slowLog()']],
    pause: ['slowLog pauses', ['await wait(100)']],
    caller: ['main continues', ['"table is set"']],
    timer: ['Node.js timer', ['wait(100)', 'fulfills the Promise']],
    resume: ['slowLog resumes', ['"pasta is ready"']],
    later: 'after about 100 ms, when the thread is free',
  },
  es: {
    title: 'await permite que siga quien llama',
    main: ['main empieza', ['slowLog()']],
    pause: ['slowLog se pausa', ['await wait(100)']],
    caller: ['main sigue', ['"table is set"']],
    timer: ['Temporizador de Node.js', ['wait(100)', 'cumple la Promise']],
    resume: ['slowLog se reanuda', ['"pasta is ready"']],
    later: 'tras unos 100 ms, cuando el hilo está libre',
  },
}

for (const [lang, t] of Object.entries(TEXT)) {
  const d = diagram(940, 430)
  const box = (x, y, w, h, title, lines, options) => {
    d.box(x, y, w, h, '', [], options)
    d.label(x + w / 2, y + 30, [title], { size: 17, weight: 700 })
    lines.forEach((line, index) => d.label(x + w / 2, y + 57 + index * 26, [line], { size: 16 }))
  }
  d.label(470, 40, [t.title], { size: 23, weight: 700 })
  box(30, 85, 245, 95, ...t.main, { fill: '#e7f0ff' })
  box(345, 85, 245, 95, ...t.pause)
  box(660, 85, 245, 95, ...t.caller, { fill: '#e9f7ec' })
  d.arrow(279, 132, 337, 132)
  d.arrow(594, 132, 652, 132)
  box(345, 275, 245, 110, ...t.timer, { dashed: true, fill: '#e7f0ff' })
  box(660, 275, 245, 110, ...t.resume, { fill: '#e9f7ec' })
  d.arrow(467, 185, 467, 268, { dashed: true })
  d.arrow(594, 328, 652, 328)
  d.label(680, 238, [t.later], { size: 15 })
  d.save(`public/images/01-await-caller.${lang}.svg`)
}
