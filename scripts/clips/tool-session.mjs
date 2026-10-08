// Each tool clip owns its app and tool servers, including cleanup on failure.
import { spawn, execFileSync } from "node:child_process"
import { createRequire } from "node:module"
import { mkdtempSync, rmSync, readFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import net from "node:net"
import { ROOT, record, sleep } from "./lib.mjs"

const require = createRequire(import.meta.url)
const playwright = require.resolve("@playwright/test/cli")

async function portAvailable(port) {
  const socket = net.createServer()
  await new Promise((resolve, reject) => {
    socket.once("error", reject)
    socket.listen(port, () => socket.close(resolve))
  })
}

export async function recordTool(name, scenario) {
  if (ROOT !== "/tmp/qaa-academy") throw new Error("Copy the project to /tmp/qaa-academy first (see README.md)")
  const owned = []
  const work = mkdtempSync(path.join(tmpdir(), "qaa-tool-"))
  const env = { ...process.env, NEXT_TELEMETRY_DISABLED: "1", QAA_E2E_PORT: "5186" }
  delete env.DISPLAY
  const start = async (args, port, cwd = ROOT) => {
    await portAvailable(port)
    const child = spawn(process.execPath, args, { cwd, env, stdio: "inherit" })
    owned.push(child)
    const exited = new Promise(resolve => child.once("exit", resolve))
    child.exited = exited
    child.once("error", error => { child.startError = error })
    console.log(`${name}: owns server PID ${child.pid} on port ${port}`)
    const deadline = Date.now() + 180000
    while (Date.now() < deadline) {
      if (child.startError) throw child.startError
      if (child.exitCode !== null || child.signalCode !== null) throw new Error(`Server PID ${child.pid} exited during startup`)
      try {
        const response = await fetch(`http://localhost:${port}/`, { signal: AbortSignal.timeout(2000) })
        if (response.status < 500) return
      } catch {}
      await sleep(300)
    }
    throw new Error(`Server PID ${child.pid} did not start on port ${port}`)
  }
  try {
    const shop = name.startsWith("04-") || name.startsWith("05-")
    if (shop) {
      const shopRoot = path.join(ROOT, "apps/practice-shop")
      const shopRequire = createRequire(path.join(shopRoot, "package.json"))
      await start([shopRequire.resolve("next/dist/bin/next"), "dev", "--port", "5196"], 5196, shopRoot)
    } else {
      const vite = path.join(path.dirname(require.resolve("vite/package.json")), "bin/vite.js")
      await start([vite, "--port", "5186", "--strictPort"], 5186)
    }
    {
      const ui = name === "ui-mode"
      const demo = path.join(ROOT, "scripts/clips", shop ? "report-demo" : "trace-demo")
      const out = path.join(work, "out"), report = path.join(work, "report"), summary = path.join(work, "summary.json")
      const testEnv = { ...env, TRACE_OUT: out, REPORT_OUT: report, PLAYWRIGHT_HTML_OUTPUT_DIR: report, PLAYWRIGHT_JSON_OUTPUT_FILE: summary }
      const args = ui
        ? ["test", "--grep", "accepts the test credentials", "--workers", "1", "--trace", "on", "--output", out, "--reporter", "json,html"]
        : ["test", "-c", path.join(demo, "playwright.config.ts")]
      let status = 0
      try {
        execFileSync(process.execPath, [playwright, ...args], { cwd: ROOT, env: testEnv, stdio: "inherit" })
      } catch (error) { status = error.status }
      const result = JSON.parse(readFileSync(summary, "utf8"))
      if (status !== (ui ? 0 : 1) || result.stats.unexpected !== (ui ? 0 : shop ? 2 : 1) || result.stats.expected !== (ui || shop ? 1 : 3) || result.stats.skipped || result.stats.flaky || result.errors.length) {
        throw new Error("Demo did not produce the intended failures and passes")
      }
      execFileSync("python3", [path.join(ROOT, "scripts/clips/inspect-artifacts.py"), out, report], { stdio: "inherit" })
      if (ui) {
        await start([playwright, "test", "--output", path.join(work, "ui-out"), "--ui-host", "127.0.0.1", "--ui-port", "5188"], 5188)
      } else if (name === "trace-viewer") {
        await start([playwright, "show-trace", "--host", "127.0.0.1", "--port", "5187", path.join(out, "demo-rejects-wrong-credentials-chromium/trace.zip")], 5187)
      } else {
        await start([playwright, "show-report", "--host", "127.0.0.1", "--port", "5189", report], 5189)
      }
    }
    await record(name, scenario)
    if (name === "ui-mode") {
      execFileSync("python3", [path.join(ROOT, "scripts/clips/inspect-artifacts.py"), path.join(work, "ui-out")], { stdio: "inherit" })
    }
  } finally {
    for (const child of owned.reverse()) {
      if (child.exitCode !== null || child.signalCode !== null) continue
      child.kill("SIGTERM")
      const timer = setTimeout(() => child.kill("SIGKILL"), 5000)
      await child.exited
      clearTimeout(timer)
      console.log(`${name}: stopped owned server PID ${child.pid}`)
    }
    rmSync(work, { recursive: true, force: true })
  }
}
