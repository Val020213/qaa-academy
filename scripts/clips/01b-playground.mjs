import { mkdirSync, writeFileSync, readFileSync, existsSync, statSync } from "node:fs"
import { record, WORK as CLIP_WORK } from "./lib.mjs"
import { createHash } from "node:crypto"

const WORK = `${CLIP_WORK}/playground-b`

export async function playground(name, code, scenario) {
  mkdirSync(WORK, { recursive: true })
  const evidence = { name, initialCode: code, hovers: [], states: [] }
  await record(name, async ({ page, mark, pause }) => {
    // Cache unchanged public CDN responses so all clips use the same actual editor assets.
    const cache = `${WORK}/cdn-cache`
    mkdirSync(cache, { recursive: true })
    await page.route("https://playgroundcdn.typescriptlang.org/**", async route => {
      const key = createHash("sha256").update(route.request().url()).digest("hex")
      const data = `${cache}/${key}`
      if (existsSync(data) && statSync(data).size > 0 && existsSync(data + ".json")) {
        const headers = JSON.parse(readFileSync(data + ".json", "utf8"))
        delete headers["content-encoding"]
        delete headers["transfer-encoding"]
        delete headers["content-length"]
        await route.fulfill({ status: 200, headers, body: readFileSync(data) })
        return
      }
      try {
        const response = await route.fetch({ timeout: 60000 })
        const body = await response.body()
        if (response.ok() && body.length > 0) {
          writeFileSync(data, body)
          writeFileSync(data + ".json", JSON.stringify(response.headers()))
        }
        if (response.ok() && body.length === 0) {
          await route.continue()
          return
        }
        const headers = response.headers()
        delete headers["content-encoding"]
        delete headers["transfer-encoding"]
        delete headers["content-length"]
        await route.fulfill({ status: response.status(), headers, body })
      } catch {
        await route.continue()
      }
    })
    let ready = false
    for (let attempt = 0; attempt < 3 && !ready; attempt++) {
      await page.goto("https://www.typescriptlang.org/play/?#code/", { waitUntil: "domcontentloaded", timeout: 60000 })
      try {
        await page.waitForFunction(() => window.monaco?.editor.getModels().length > 0, null, { timeout: 45000 })
        ready = true
      } catch {
        console.log(`${name}: retrying editor load`)
      }
    }
    if (!ready) throw new Error("Playground editor did not load")
    await page.addStyleTag({ content: `
      #top-menu, #cookie-banner { display: none !important }
      .monaco-editor { position: fixed !important; left: 0 !important; top: 0 !important;
        width: 1280px !important; height: 720px !important; z-index: 500 !important }
      .monaco-hover { font-size: 26px !important }
    ` })
    evidence.version = await page.evaluate((code) => {
      window.monaco.editor.setTheme("vs")
      const editor = window.monaco.editor.getEditors()[0]
      editor.updateOptions({ fontSize: 26, lineHeight: 38, minimap: { enabled: false },
        autoIndent: "none", autoClosingBrackets: "never", autoClosingQuotes: "never", formatOnType: false,
        scrollBeyondLastLine: false, wordWrap: "on", padding: { top: 32 }, hover: { delay: 300 } })
      editor.layout({ width: 1280, height: 720 })
      if (!window.sandbox.getCompilerOptions().strictNullChecks) throw new Error("Strict null checks required")
      editor.getModel().setValue(code)
      return window.ts.version
    }, code)
    const state = async () => {
      await pause(1800)
      const result = await page.evaluate(() => ({
        code: window.monaco.editor.getModels()[0].getValue(),
        markers: window.monaco.editor.getModelMarkers({}).map(({ code, message, startLineNumber, startColumn }) =>
          ({ code, message, startLineNumber, startColumn })),
      }))
      evidence.states.push(result)
      return result
    }
    const hover = async (lineNumber, column, expected) => {
      const pos = await page.evaluate(({ lineNumber, column }) => {
        const editor = window.monaco.editor.getEditors()[0]
        editor.revealPosition({ lineNumber, column })
        return editor.getScrolledVisiblePosition({ lineNumber, column })
      }, { lineNumber, column })
      await page.mouse.move(pos.left + 5, pos.top + pos.height / 2, { steps: 25 })
      await page.evaluate(({ lineNumber, column }) => {
        const editor = window.monaco.editor.getEditors()[0]
        editor.setPosition({ lineNumber, column })
        editor.trigger("keyboard", "editor.action.showHover", {})
      }, { lineNumber, column })
      try {
        await page.waitForFunction(expected => [...document.querySelectorAll(".monaco-hover")]
          .some(e => e.textContent.includes(expected) && e.getBoundingClientRect().height > 0), expected, { timeout: 10000 })
      } catch (error) {
        await page.screenshot({ path: `${WORK}/${name}-failed.png` })
        console.log(await page.locator(".monaco-hover").allInnerTexts())
        console.log(await state())
        throw error
      }
      const texts = await page.locator(".monaco-hover").allInnerTexts()
      evidence.hovers.push({ lineNumber, column, expected, text: texts.join("\n") })
      await pause(3400)
    }
    const edit = async (lineNumber, startColumn, endLineNumber, endColumn, text) => {
      await page.mouse.move(70, 650, { steps: 20 })
      await page.keyboard.press("Escape")
      await page.evaluate(({ lineNumber, startColumn, endLineNumber, endColumn }) => {
        const editor = window.monaco.editor.getEditors()[0]
        editor.focus()
        editor.setSelection({ startLineNumber: lineNumber, startColumn, endLineNumber, endColumn })
      }, { lineNumber, startColumn, endLineNumber, endColumn })
      for (const character of text) {
        await page.keyboard.insertText(character)
        await pause(65)
      }
      await state()
    }
    await pause(6000)
    await state()
    mark()
    await pause(1500)
    await scenario({ page, hover, edit, state, pause })
    const final = await state()
    if (final.markers.length) throw new Error("Final code still has diagnostics: " + JSON.stringify(final.markers))
    await page.mouse.move(70, 650, { steps: 20 })
    await page.keyboard.press("Escape")
    await pause(1500)
  })
  writeFileSync(`${WORK}/${name}.json`, JSON.stringify(evidence, null, 2) + "\n")
}
