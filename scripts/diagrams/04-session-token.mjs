import { diagram } from "./lib.mjs"
const TEXT={
 en:{title:"Separate contexts can use the same server session",setup:["Setup login",["server creates token T"]],file:["admin.json",["saved cookie: token T"]],a:["Context A",["cookie: token T"]],b:["Context B",["cookie: token T"]],server:["Server sessions",["T → admin"]],logout:["Logout from A",["server removes T → admin"]],note:["The file and B's cookie still contain T, but the server rejects it."]},
 es:{title:"Contextos separados pueden usar la misma sesión",setup:["Login del setup",["el servidor crea el token T"]],file:["admin.json",["cookie guardada: token T"]],a:["Contexto A",["cookie: token T"]],b:["Contexto B",["cookie: token T"]],server:["Sesiones del servidor",["T → admin"]],logout:["Logout desde A",["el servidor elimina T → admin"]],note:["El archivo y la cookie de B aún contienen T, pero el servidor lo rechaza."]},
}
for(const [lang,t] of Object.entries(TEXT)){
 const d=diagram(1000,530)
 d.label(500,42,[t.title],{size:23,weight:700})
 d.box(25,90,250,82,...t.setup)
 d.box(340,90,300,82,...t.file,{fill:"#e7f0ff"})
 d.box(340,240,245,82,...t.a,{fill:"#e7f0ff"})
 d.box(340,390,245,82,...t.b,{fill:"#e7f0ff"})
 d.box(695,240,280,82,...t.server,{fill:"#e9f7ec"})
 d.box(695,390,280,82,...t.logout,{fill:"#ffe8e5"})
 d.arrow(280,131,332,131);d.arrow(462,178,462,234)
 d.line(360,178,325,200);d.line(325,200,325,431);d.arrow(325,431,335,431)
 d.arrow(590,281,689,281);d.arrow(590,431,686,308)
 d.arrow(835,328,835,384)
 d.note(500,510,t.note)
 d.save(`public/images/04-session-token.${lang}.svg`)
}
