import { record } from "./lib.mjs"
import { playground, placeCursor, typeCode, run, evidence } from "./01-playground.mjs"

const code = `function ticketPrice(age: number, day: string): number {
  let price = 10
  if (age < 12) {
    price = 6
  } else if (age >= 65) {
    price = 7
  }
  return price
}
console.log(ticketPrice(8, "Tuesday"))
console.log(ticketPrice(30, "Monday"))`

await record("01-code-one-step", async ({ page, mark, click, pause }) => {
  await playground(page, code, { logs: true, fontSize: 25 })
  const before = await run(page, click)
  if (!/6\s+10/.test(before.replaceAll("[LOG]:", ""))) throw new Error(`Unexpected base prices: ${before}`)
  await pause(1400)
  mark()
  await pause(2200)
  await placeCursor(page, 8, 1)
  await typeCode(page, '  if (day === "Tuesday") {\n    price = price - 2\n  }\n')
  await pause(1800)
  await evidence(page, "code-one-step-before-run")
  const finalCode = await page.evaluate(() => window.monaco.editor.getModels()[0].getValue())
  if (finalCode !== code.replace("  return price", '  if (day === "Tuesday") {\n    price = price - 2\n  }\n  return price')) throw new Error(`Unexpected code after typing: ${finalCode}`)
  const after = await run(page, click)
  if (!/4\s+10/.test(after.replaceAll("[LOG]:", ""))) throw new Error(`Unexpected discounted prices: ${after}`)
  await evidence(page, "code-one-step")
  await pause(3000)
})
