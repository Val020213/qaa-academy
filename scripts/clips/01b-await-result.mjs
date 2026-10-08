import { playground } from "./01b-playground.mjs"
const code = `function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function loadForecast(): Promise<string> {
  await wait(500)
  return "sunny"
}

async function main(): Promise<void> {
  const forecast = loadForecast()
  console.log(forecast)
}

main()
`
await playground("01b-await-result", code, async ({ hover, edit }) => {
  await hover(11, 13, "const forecast: Promise<string>")
  await edit(11, 20, 11, 20, "await ")
  await hover(11, 13, "const forecast: string")
})
