import { record } from "./lib.mjs"
import { playground, placeCursor, run, evidence } from "./01-playground.mjs"

await record("01-comment-out", async ({ page, mark, click, pause }) => {
  await playground(page, 'console.log("Fill the water bowls")\nconsole.log("Feed the cats")', { logs: true })
  const before = await run(page, click)
  if (!before.includes("Fill the water bowls") || !before.includes("Feed the cats")) throw new Error("Missing original output")
  await pause(1400)
  mark()
  await pause(2500)
  await placeCursor(page, 2, 1)
  await page.keyboard.type("// ", { delay: 180 })
  await pause(2200)
  const after = await run(page, click)
  if (!after.includes("Fill the water bowls") || after.includes("Feed the cats")) throw new Error("Commented line still printed")
  await evidence(page, "comment-out")
  await pause(3500)
})
