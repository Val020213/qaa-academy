import { diagram } from './lib.mjs'

const TEXT = {
  en: {
    title: 'Two imports, one counter in this run',
    main: ['bakery.ts', ['serveCustomer() × 2', 'showNextTicket()']],
    till: ['_till.ts', ['serveCustomer()', 'calls nextTicket()']],
    screen: ['_screen.ts', ['showNextTicket()', 'calls nextTicket()']],
    shared: ['_tickets.ts', ['initialized once', 'count: 0 → 1 → 2 → 3']],
    output: ['Output', ['ticket machine loaded', '3']],
    imports: 'both import the same file',
  },
  es: {
    title: 'Dos imports, un contador en esta ejecución',
    main: ['bakery.ts', ['serveCustomer() × 2', 'showNextTicket()']],
    till: ['_till.ts', ['serveCustomer()', 'llama a nextTicket()']],
    screen: ['_screen.ts', ['showNextTicket()', 'llama a nextTicket()']],
    shared: ['_tickets.ts', ['se inicializa una vez', 'count: 0 → 1 → 2 → 3']],
    output: ['Salida', ['ticket machine loaded', '3']],
    imports: 'ambos importan el mismo archivo',
  },
}

for (const [lang, t] of Object.entries(TEXT)) {
  const d = diagram(1000, 420)
  const box = (x, y, w, h, title, lines, options) => {
    d.box(x, y, w, h, '', [], options)
    d.label(x + w / 2, y + 30, [title], { size: 17, weight: 700 })
    lines.forEach((line, index) => d.label(x + w / 2, y + 57 + index * 26, [line], { size: 16 }))
  }
  d.label(500, 40, [t.title], { size: 23, weight: 700 })
  box(20, 160, 215, 110, ...t.main, { fill: '#e7f0ff' })
  box(280, 75, 215, 110, ...t.till)
  box(280, 275, 215, 110, ...t.screen)
  box(550, 160, 210, 110, ...t.shared, { fill: '#e9f7ec' })
  box(790, 160, 195, 110, ...t.output)
  d.arrow(239, 193, 272, 132)
  d.arrow(239, 238, 272, 327)
  d.arrow(500, 131, 541, 193)
  d.arrow(500, 327, 541, 238)
  d.arrow(764, 215, 783, 215)
  d.label(650, 316, [t.imports], { size: 15 })
  d.save(`public/images/01-module-counter.${lang}.svg`)
}
