import { diagram } from "./lib.mjs"
const TEXT = {
 en:{title:"The runner resumes fixture cleanup",setup:["Setup",["create the product"]],use:["await use(value)",["provide the value;","promise pending"]],test:["Test body",["use the product;","pass or fail"]],release:["Runner",["record the result;","resolve use"]],cleanup:["Teardown",["fixture resumes;","delete the product"]],note:["A test assertion failure does not reject the fixture's use promise."]},
 es:{title:"El runner reanuda la limpieza del fixture",setup:["Preparación",["crear el producto"]],use:["await use(value)",["entregar el valor;","promesa pendiente"]],test:["Cuerpo del test",["usar el producto;","pasar o fallar"]],release:["Runner",["registrar el resultado;","resolver use"]],cleanup:["Limpieza",["reanudar el fixture;","borrar el producto"]],note:["Una aserción fallida del test no rechaza la promesa use del fixture."]},
}
for(const [lang,t] of Object.entries(TEXT)){
 const d=diagram(1000,330)
 d.label(500,42,[t.title],{size:23,weight:700})
 const cards=[t.setup,t.use,t.test,t.release,t.cleanup]
 cards.forEach((card,i)=>{const x=22+i*196;d.box(x,100,172,128,...card,{fill:i===2?"#e7f0ff":i===4?"#e9f7ec":"#fff7d6"});if(i)d.arrow(x-20,164,x-5,164)})
 d.note(500,286,t.note)
 d.save(`public/images/04-fixture-lifetime.${lang}.svg`)
}
