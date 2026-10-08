import { playground } from "./01b-playground.mjs"
await playground("01b-object-property", 'const square = { side: 4, color: "red" }\n\nconsole.log(square.size)\n', async ({ hover, edit }) => {
  await hover(3, 22, "Property 'size' does not exist")
  await edit(3, 20, 3, 24, "side")
  await hover(3, 22, "side: number")
})
