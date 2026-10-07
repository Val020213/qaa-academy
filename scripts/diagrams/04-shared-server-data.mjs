import { diagram } from "./lib.mjs"
const TEXT = {
  en: { title: "Separate tests, shared server data", a: ["Test A", ["creates Keyboard"]], post: ["POST /api/products", ["server adds a product"]], store: ["Server memory", ["products", "Mouse, Keyboard"]], get: ["GET /api/products", ["server reads products"]], b: ["Test B", ["sees the product A left"]], note: ["A fresh browser context does not reset the server's data."] },
  es: { title: "Tests separados, datos compartidos en el servidor", a: ["Test A", ["crea Keyboard"]], post: ["POST /api/products", ["el servidor agrega el producto"]], store: ["Memoria del servidor", ["products", "Mouse, Keyboard"]], get: ["GET /api/products", ["el servidor lee los productos"]], b: ["Test B", ["ve el producto que dejó A"]], note: ["Un contexto nuevo del navegador no reinicia los datos del servidor."] },
}
for (const [lang,t] of Object.entries(TEXT)) {
 const d=diagram(980,440)
 d.label(490,42,[t.title],{size:23,weight:700})
 d.box(30,85,230,100,...t.a,{fill:"#e7f0ff"})
 d.box(315,85,270,100,...t.post)
 d.box(650,180,300,100,...t.store,{fill:"#e9f7ec"})
 d.box(315,280,270,100,...t.get)
 d.box(30,280,230,100,...t.b,{fill:"#e7f0ff"})
 d.arrow(265,135,307,135);d.arrow(590,145,640,215)
 d.arrow(642,250,593,315);d.arrow(307,330,265,330)
 d.note(490,414,t.note)
 d.save(`public/images/04-shared-server-data.${lang}.svg`)
}
