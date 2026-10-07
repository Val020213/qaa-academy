import { diagram } from "./lib.mjs"
const TEXT = {
 en: {title:"The confirmation dialog is outside the row",root:["Page DOM",["body"]],table:["Products table",["products-table"]],row:["Product row",["products-row-12"]],remove:["Row Delete button",["products-delete-12"]],dialog:["Shared dialog",["confirm-delete-dialog"]],confirm:["Confirm button",["confirm-delete-button"]],note:["Searching inside products-row-12 cannot reach the confirm button."]},
 es: {title:"El diálogo de confirmación está fuera de la fila",root:["DOM de la página",["body"]],table:["Tabla de productos",["products-table"]],row:["Fila del producto",["products-row-12"]],remove:["Botón Delete de la fila",["products-delete-12"]],dialog:["Diálogo compartido",["confirm-delete-dialog"]],confirm:["Botón de confirmación",["confirm-delete-button"]],note:["Buscar dentro de products-row-12 no alcanza el botón de confirmación."]},
}
for(const [lang,t] of Object.entries(TEXT)){
 const d=diagram(960,560)
 d.label(480,40,[t.title],{size:23,weight:700})
 d.box(340,70,280,72,...t.root,{fill:"#e7f0ff"})
 d.box(100,190,300,74,...t.table)
 d.box(100,308,300,74,...t.row)
 d.box(100,426,300,74,...t.remove)
 d.box(560,190,300,74,...t.dialog,{fill:"#e9f7ec"})
 d.box(560,308,300,74,...t.confirm,{fill:"#e9f7ec"})
 d.arrow(400,147,253,183);d.arrow(560,147,707,183)
 d.arrow(250,269,250,302);d.arrow(250,387,250,420);d.arrow(710,269,710,302)
 d.note(480,535,t.note)
 d.save(`public/images/04-dialog-scope.${lang}.svg`)
}
