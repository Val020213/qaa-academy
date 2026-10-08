import { playground } from "./01b-playground.mjs"
const code = `type Song = {
  title: string
  artist: string
  seconds: number
  liked: boolean
}
const playlist: Song[] = [
  { title: "Blue", artist: "Mia", seconds: 215, liked: true },
]
const found = playlist.find((song) => song.artist === "Tomas")
console.log(found.title)
`
await playground("01b-find-guard", code, async ({ hover, edit }) => {
  await hover(11, 15, "possibly 'undefined'")
  await edit(11, 1, 11, 1, 'if (found !== undefined) {\n  ')
  await edit(12, 27, 12, 27, '\n}')
  await hover(12, 17, "const found: Song")
})
