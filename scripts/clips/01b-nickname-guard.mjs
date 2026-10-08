import { playground } from "./01b-playground.mjs"
const code = `type Dog = {
  name: string
  age: number
  nickname?: string
}

function callName(dog: Dog): string {
  return dog.nickname.toUpperCase()
}
`
await playground("01b-nickname-guard", code, async ({ hover, edit }) => {
  await hover(8, 16, "possibly 'undefined'")
  await edit(8, 1, 8, 1, '  if (dog.nickname === undefined) {\n    return dog.name\n  }\n')
  await hover(11, 16, "nickname?: string")
})
