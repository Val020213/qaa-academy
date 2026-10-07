import { diagram } from "./lib.mjs"
const TEXT={
 en:{title:"The form and helper use the same server validation",form:["Browser form",["send the field values"]],helper:["API helper",["send product data"]],route:["POST /api/products",["valid admin session"]],validator:["validateProduct",["server checks the fields"]],store:["Valid data",["store product; return 201"]],errors:["Invalid data",["return 422 + field errors"]],note:["For a form request, the browser displays the returned field errors."]},
 es:{title:"Formulario y helper usan la misma validación del servidor",form:["Formulario del navegador",["enviar los valores"]],helper:["Helper de API",["enviar datos del producto"]],route:["POST /api/products",["sesión admin válida"]],validator:["validateProduct",["el servidor revisa los campos"]],store:["Datos válidos",["guardar producto; devolver 201"]],errors:["Datos inválidos",["devolver 422 + errores"]],note:["Si la petición vino del formulario, el navegador muestra los errores recibidos."]},
}
for(const [lang,t] of Object.entries(TEXT)){
 const d=diagram(1000,490)
 d.label(500,40,[t.title],{size:23,weight:700})
 d.box(25,88,280,90,...t.form,{fill:"#e7f0ff"})
 d.box(25,270,280,90,...t.helper,{fill:"#e7f0ff"})
 d.box(360,178,270,90,...t.route)
 d.box(705,178,270,90,...t.validator)
 d.box(360,355,270,90,...t.store,{fill:"#e9f7ec"})
 d.box(705,355,270,90,...t.errors,{fill:"#ffe8e5"})
 d.arrow(310,135,353,207);d.arrow(310,315,353,242);d.arrow(635,223,697,223)
 d.arrow(820,274,577,349);d.arrow(840,274,840,349)
 d.note(500,474,t.note)
 d.save(`public/images/04-api-preparation.${lang}.svg`)
}
