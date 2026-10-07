import { diagram } from "./lib.mjs"
const TEXT={
 en:{title:"A single read can precede the browser update",request:["Browser",["starts a request"]],response:["Server",["returns the result"]],dom:["Browser",["updates the DOM"]],once:["Test: single read",["sees the temporary text"]],retry:["Test: assertion",["checks the expected text"]],success:["Assertion passes",["expected text is present"]],time:"time",note:["Repeated checks wait for the condition, up to the assertion's timeout."]},
 es:{title:"Una lectura puede adelantarse a la actualización",request:["Navegador",["inicia una petición"]],response:["Servidor",["devuelve el resultado"]],dom:["Navegador",["actualiza el DOM"]],once:["Test: lectura única",["ve el texto temporal"]],retry:["Test: aserción",["comprueba el texto esperado"]],success:["La aserción pasa",["el texto esperado ya está"]],time:"tiempo",note:["Las comprobaciones se repiten hasta cumplir la condición o agotar el timeout."]},
}
for(const [lang,t] of Object.entries(TEXT)){
 const d=diagram(1000,480)
 d.label(500,40,[t.title],{size:23,weight:700})
 d.box(25,100,250,82,...t.request,{fill:"#e7f0ff"})
 d.box(380,100,250,82,...t.response)
 d.box(725,100,250,82,...t.dom,{fill:"#e7f0ff"})
 d.arrow(281,141,373,141);d.arrow(636,141,718,141)
 d.box(25,270,250,100,...t.once,{fill:"#ffe8e5"})
 d.box(380,270,270,100,...t.retry)
 d.box(725,270,250,100,...t.success,{fill:"#e9f7ec"})
 d.arrow(150,264,150,190,{dashed:true})
 d.arrow(655,320,718,320);d.arrow(850,190,850,264,{dashed:true})
 d.curve([[475,264],[475,220],[560,220],[560,256]])
 d.arrow(560,246,560,264)
 d.arrow(30,408,964,408);d.label(500,434,[t.time],{size:15})
 d.note(500,464,t.note)
 d.save(`public/images/04-race-and-wait.${lang}.svg`)
}
