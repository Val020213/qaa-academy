import { mkdirSync, writeFileSync } from "node:fs"

import { WORK } from "./lib.mjs"

// Keep the real editor, checker and Logs tab; change only their framing.
export async function playground(page, code, { logs = false, fontSize = 28 } = {}) {
  await page.goto("https://www.typescriptlang.org/play/?ts=5.9.3#code/", { waitUntil: "domcontentloaded", timeout: 60000 })
  await page.waitForFunction(() => window.monaco?.editor?.getModels().length && window.sandbox, null, { timeout: 180000 })
  const version = await page.evaluate(() => window.ts.version)
  if (version !== "5.9.3") throw new Error(`Expected TypeScript 5.9.3, got ${version}`)
  await page.addStyleTag({ content: `
    #top-menu, #site-content > .navbar-sub, #site-footer, #cookie-banner { display: none !important; }
    html, body { margin: 0 !important; overflow: hidden !important; background: white !important; }
    #playground-container { position: fixed !important; inset: 0 !important; height: 720px !important; flex-direction: column !important; }
    #editor-container { width: 1280px !important; height: ${logs ? 530 : 720}px !important; flex: none !important; }
    #editor-toolbar { height: 44px !important; font-size: 19px !important; }
    #monaco-editor-embed { height: ${logs ? 486 : 676}px !important; }
    .playground-dragbar { display: none !important; }
    .playground-sidebar { ${logs ? "width: 1280px !important; min-width: 1280px !important; max-width: none !important; height: 190px !important; flex: none !important; border-top: 1px solid #ccc;" : "display: none !important;"} }
    .playground-plugin-tabview { height: 36px !important; font-size: 18px !important; }
    .playground-plugin-container { height: 154px !important; max-height: none !important; overflow: hidden !important; font-size: 27px !important; line-height: 1.25 !important; }
    #log-container { height: 118px !important; max-height: none !important; overflow: auto !important; }
    #log { padding: 6px 12px !important; font-size: 27px !important; line-height: 1.25 !important; }
    #log-tools { height: 30px !important; min-height: 30px !important; }
    .monaco-hover { font-size: 24px !important; line-height: 1.35 !important; }
    .monaco-hover .hover-row { font-size: 24px !important; line-height: 1.35 !important; }
  ` })
  await page.evaluate(({ code, fontSize }) => {
    const editor = window.monaco.editor.getEditors()[0]
    window.monaco.editor.setTheme("vs")
    editor.updateOptions({ fontSize, lineHeight: fontSize + 5, minimap: { enabled: false }, scrollBeyondLastLine: false, padding: { top: 20 }, wordWrap: "off", hover: { delay: 300 }, automaticLayout: true, autoClosingBrackets: "never", autoClosingQuotes: "never", autoSurround: "never", autoIndent: "none", formatOnType: false })
    editor.getModel().setValue(code)
    editor.layout({ width: 1280, height: document.getElementById("monaco-editor-embed").clientHeight })
    editor.focus()
  }, { code, fontSize })
  if (logs) await page.locator("#playground-plugin-tab-logs").click()
  await page.waitForTimeout(2200)
}

export async function placeCursor(page, lineNumber, column) {
  await page.evaluate(({ lineNumber, column }) => {
    const editor = window.monaco.editor.getEditors()[0]
    editor.setPosition({ lineNumber, column })
    editor.focus()
  }, { lineNumber, column })
}

export async function typeCode(page, text, delay = 75) {
  // Insert literal characters in the real model, without editor auto-indentation.
  for (const character of text) {
    await page.evaluate(character => {
      const editor = window.monaco.editor.getEditors()[0]
      const p = editor.getPosition()
      editor.executeEdits("clip", [{ range: new window.monaco.Range(p.lineNumber, p.column, p.lineNumber, p.column), text: character }])
      editor.setPosition(character === "\n" ? { lineNumber: p.lineNumber + 1, column: 1 } : { lineNumber: p.lineNumber, column: p.column + 1 })
    }, character)
    await page.waitForTimeout(delay)
  }
}

export async function run(page, click) {
  if ((await page.locator("#log").innerText()).trim()) {
    await click(page.locator("#clear-logs-button"))
    await page.waitForTimeout(450)
  }
  await click(page.locator("#run-button"))
  await page.waitForFunction(() => document.getElementById("log")?.textContent.includes("[LOG]"), null, { timeout: 20000 })
  await page.waitForTimeout(600)
  return page.locator("#log").innerText()
}

export async function evidence(page, name) {
  mkdirSync(`${WORK}/playground`, { recursive: true })
  writeFileSync(`${WORK}/playground/${name}.json`, JSON.stringify(await page.evaluate(() => ({
    version: window.ts.version,
    code: window.monaco.editor.getModels()[0].getValue(),
    markers: window.monaco.editor.getModelMarkers({}).map(({ code, message, startLineNumber }) => ({ code, message, startLineNumber })),
    logs: document.querySelector(".playground-plugin-container")?.innerText,
  })), null, 2))
}
