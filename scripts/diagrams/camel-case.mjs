import { diagram } from "./lib.mjs"

const TEXT = {
  en: {
    title: "camelCase",
    caption: "each new word starts with a capital letter: a hump",
    name: "ticketPriceTotal",
  },
  es: {
    title: "camelCase",
    caption: "cada palabra nueva empieza con mayúscula: una joroba",
    name: "ticketPriceTotal",
  },
}

export const LETTER_START = 195
export const LETTER_STEP = 30
export const HUMP_CENTERS = [390, 540]

for (const [lang, t] of Object.entries(TEXT)) {
  const d = diagram(900, 600)
  d.label(450, 48, [t.title], { size: 26, weight: 700 })
  const fur = "#f8e5b5"
  const farFur = "#e8cf99"

  // Far legs are behind the body; the hoof tips remain distinct.
  d.polygon([[364, 290], [388, 292], [375, 405], [385, 421], [354, 421]], { fill: farFur })
  d.polygon([[577, 288], [601, 287], [612, 401], [628, 416], [596, 421]], { fill: farFur })
  d.curve([[671, 255], [690, 268], [696, 298]])
  d.ellipse(697, 303, 12, 20, { fill: "#8c6742" })
  d.path("M 310 241 C 287 230 286 206 278 182 C 273 165 258 145 242 142 C 227 130 198 136 184 151 L 172 164 Q 165 179 182 185 L 219 188 C 237 186 244 181 251 191 C 261 210 260 263 279 290 C 294 312 318 326 356 328 L 600 330 Q 660 329 676 291 Q 690 254 660 240 C 633 241 614 230 600 211 C 577 183 562 141 540 141 C 516 141 499 190 480 220 Q 464 240 449 220 C 430 194 412 141 390 141 C 367 141 350 193 331 222 Q 321 238 310 241 Z", { fill: fur })
  d.polygon([[320, 312], [346, 318], [337, 402], [349, 423], [313, 423]], { fill: fur })
  d.polygon([[622, 312], [648, 305], [643, 403], [658, 423], [622, 423]], { fill: fur })
  d.path("M 235 143 Q 229 116 242 116 Q 257 120 249 144 Z", { fill: fur })
  d.ellipse(218, 156, 6, 7, { fill: "#1f2933", roughness: 0.4 })
  d.curve([[180, 174], [192, 179], [201, 174]], { roughness: 0.7 })
  d.ellipse(181, 161, 3, 3, { fill: "#1f2933" })

  // Capital glyph centers and hump peaks share the same x coordinates.
  HUMP_CENTERS.forEach((x) => d.line(x, 153, x, 465, {
    dashed: true, stroke: "#ae6d63", strokeWidth: 1, roughness: 0, disableMultiStroke: true,
  }))
  Array.from(t.name).forEach((letter, i) => d.label(LETTER_START + i * LETTER_STEP + LETTER_STEP / 2, 507, [letter], {
    size: 48, mono: true, weight: 600,
    color: /[A-Z]/.test(letter) ? "#b42318" : "#1f2933",
    id: `letter-${i}`,
  }))
  d.label(450, 562, [t.caption], { size: 20 })
  d.save(`public/images/camel-case.${lang}.svg`)
}
