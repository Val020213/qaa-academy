import { record } from "./lib.mjs"
import { playground, placeCursor, evidence } from "./01-playground.mjs"

await record("01-type-error", async ({ page, mark, pause }) => {
  await playground(page, 'const dogAge: number = "three"')
  await page.waitForFunction(() => window.monaco.editor.getModelMarkers({}).some(m => String(m.code) === "2322"))
  mark()
  await pause(1400)
  const position = await page.evaluate(() => window.monaco.editor.getEditors()[0].getScrolledVisiblePosition({ lineNumber: 1, column: 9 }))
  const box = await page.locator("#monaco-editor-embed").boundingBox()
  await page.mouse.move(box.x + position.left, box.y + position.top + 14, { steps: 30 })
  await page.locator(".monaco-hover").filter({ hasText: "Type 'string' is not assignable to type 'number'." }).waitFor()
  await evidence(page, "type-error-before")
  await pause(4500)
  await page.mouse.move(1150, 300, { steps: 20 })
  await page.evaluate(() => {
    const e = window.monaco.editor.getEditors()[0]
    e.setSelection({ startLineNumber: 1, startColumn: 24, endLineNumber: 1, endColumn: 31 })
    e.focus()
  })
  await page.keyboard.type("3", { delay: 120 })
  await pause(1800)
  const value = await page.evaluate(() => window.monaco.editor.getModels()[0].getValue())
  if (value !== "const dogAge: number = 3") throw new Error(`Wrong correction: ${value}`)
  await page.waitForFunction(() => window.monaco.editor.getModelMarkers({}).length === 0)
  await placeCursor(page, 1, 23)
  await evidence(page, "type-error-after")
  await pause(3600)
})
