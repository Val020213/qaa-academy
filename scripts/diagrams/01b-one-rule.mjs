import { diagram } from "./lib.mjs"
const TEXT = {
  es: { title: "Todos consultan la misma regla para aprobar", value: "Un valor", rule: "Una regla", calls: "Las flechas significan «usa»", direct: "Consulta directa", describe: "Texto para una estudiante", count: "Conteo de aprobados", valueCode: "PASS_MARK = 60", ruleCode: "hasPassed(score)", comparison: "score >= PASS_MARK", directCode: "hasPassed(55)", describeCode: 'describeStudent("Mia", 55)', countCode: "countPassed([55, 40])" },
  en: { title: "Every caller uses the same passing rule", value: "One value", rule: "One rule", calls: "Arrows mean 'uses'", direct: "Direct check", describe: "Text for a student", count: "Count of passing scores", valueCode: "PASS_MARK = 60", ruleCode: "hasPassed(score)", comparison: "score >= PASS_MARK", directCode: "hasPassed(55)", describeCode: 'describeStudent("Mia", 55)', countCode: "countPassed([55, 40])" },
}
for(const [lang,t] of Object.entries(TEXT)) {
  const d=diagram(980,520)
  const shapeBox = d.box
  d.box = (x, y, w, h, title, lines = [], options = {}) => {
    shapeBox(x, y, w, h, "", [], options)
    const top = y + h / 2 - lines.length * 12 + 3
    d.label(x + w / 2, top, [title], { size: 17, weight: 700 })
    lines.forEach((line, i) => d.label(x + w / 2, top + 27 + i * 25, [line], { size: 15 }))
  }
  d.label(490,40,[t.title],{size:23,weight:700})
  d.label(490,78,[t.calls],{size:17})
  d.box(335,110,310,85,t.value,[t.valueCode],{fill:"#e7f0ff"})
  d.box(335,245,310,90,t.rule,[t.ruleCode,t.comparison])
  d.arrow(490,240,490,200)
  const xs=[25,350,675],ts=[t.direct,t.describe,t.count],cs=[t.directCode,t.describeCode,t.countCode]
  xs.forEach((x,i)=>{
    d.box(x,405,280,80,ts[i],[cs[i]],{fill:"#e9f7ec"})
    d.arrow(x+140,400,i===0?350:i===1?490:630,340)
  })
  d.save(`public/images/01b-one-rule.${lang}.svg`)
}
