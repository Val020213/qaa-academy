import { playground } from "./01b-playground.mjs"
await playground("01b-type-error", 'const count: number = "five"\n', async ({ hover, edit }) => {
  await hover(1, 9, "Type 'string' is not assignable to type 'number'")
  await edit(1, 23, 1, 29, "5")
  await hover(1, 9, "const count: number")
})
