import { playground } from "./01b-playground.mjs"
await playground("01b-union-choice", 'type Size = "small" | "medium" | "large"\n\nconst size: Size = "Large"\n', async ({ hover, edit }) => {
  await hover(3, 8, 'Type \'"Large"\' is not assignable')
  await edit(3, 21, 3, 26, "large")
  await hover(3, 8, "const size: Size")
})
