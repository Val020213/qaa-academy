---
title: La convención data-testid
duration: 60 min
---

## Objetivo

En esta lección aplicas la convención de test ids de la tienda a controles, filas y diálogos. Revisas cómo elegir el registro correcto aunque cambie el orden de la tabla.

- Nombrar un test id con la regla `<feature>-<element>`.
- Construir ids de fila con el id del registro.
- Seleccionar grupos por su prefijo y buscar un diálogo fuera de la fila.
- Distinguir lo que comprueba un test id de lo que comprueba un locator por rol o etiqueta.

## La regla de nombres

La tienda usa esta forma para los ids de sus elementos interactivos:

```text
<feature>-<element>
```

`feature` nombra la página o el área; `element` nombra el control. Las palabras van en minúsculas, separadas por guiones. Estos son ids reales de la tienda:

- `login-email`, `login-password`, `login-submit`
- `products-search`, `products-status-filter`, `products-new`
- `product-name`, `product-sku`, `product-save`
- `orders-status-filter`

Los conteos y mensajes de error también tienen ids porque los tests los comprueban.

Si una tabla muestra diez productos, `page.getByText("Delete")` encuentra diez botones. Al intentar hacer clic, Playwright exige una sola coincidencia y falla. La primera línea del error es:

```text
locator.click: Error: strict mode violation: getByText('Delete') resolved to 10 elements:
```

Para elegir el botón de un producto, el test necesita identificar el registro.

## Los ids de fila incluyen el id del registro

En `apps/practice-shop/app/(dashboard)/products/page.tsx`, cada fila y su celda de nombre incluyen el id del producto:

```tsx
<TableRow key={product.id} data-testid={`products-row-${product.id}`}>
  <TableCell data-testid={`products-name-${product.id}`}>
```

Para el producto con id 12, los ids son `products-row-12` y `products-name-12`. El botón de borrar sigue la misma regla:

```tsx
<Button
  variant="ghost"
  size="sm"
  className="text-destructive hover:text-destructive"
  type="button"
  onClick={() => setToDelete(product)}
  data-testid={`products-delete-${product.id}`}
>
  Delete
</Button>
```

En el test construyes el id del botón con el id del producto:

```ts
await page.getByTestId(`products-delete-${product.id}`).click()
```

### La posición puede apuntar a otro producto

Un id construido con la posición depende del orden de la lista:

```tsx
<TableRow data-testid={`products-row-${index}`}>
```

La tienda ordena primero lo más nuevo. Al agregar un producto al principio, las filas anteriores cambian de posición. Un test que pulsa `products-delete-0` puede borrar otro producto sin que Playwright detecte el error.

Este programa muestra el cambio:

```ts
type Product = { id: number; name: string }

let products: Product[] = [
  { id: 12, name: "Desk Lamp" },
  { id: 11, name: "Webcam" },
  { id: 10, name: "Cable" },
]

function rowIdByPosition(position: number) {
  return `products-row-${position}`
}
function rowIdByRecord(product: Product) {
  return `products-row-${product.id}`
}

const lampBefore = products[0]
console.log("before:", rowIdByPosition(0), rowIdByRecord(lampBefore!))

products = [{ id: 13, name: "New Mouse" }, ...products]

console.log("after: ", rowIdByPosition(0), "is now", products[0]?.name)
console.log("after: ", rowIdByRecord(lampBefore!), "is still", lampBefore?.name)
```

Imprime:

```text
before: products-row-0 products-row-12
after:  products-row-0 is now New Mouse
after:  products-row-12 is still Desk Lamp
```

`products-row-0` pasa a identificar el producto nuevo. `products-row-12` conserva la identidad de la lámpara porque se construye con su id de registro.

## Seleccionar grupos por prefijo

En `apps/practice-shop/e2e/lib/pages/products.page.ts`, esta línea selecciona las filas de productos:

```ts
this.rows = page.getByTestId(/^products-row-/)
```

La expresión regular `/^products-row-/` busca ids que empiezan con `products-row-`. El prefijo permite elegir filas sin incluir sus botones ni las filas de pedidos.

Compara tres patrones sobre los mismos ids:

```ts
const ids = [
  "products-row-12",
  "products-name-12",
  "products-delete-12",
  "products-search",
  "products-count",
  "product-name",
  "orders-row-1003",
]

for (const pattern of [/^products-row-/, /^products-/, /row/]) {
  console.log(String(pattern), "matches", ids.filter((id) => pattern.test(id)).length)
}
```

El resultado es:

```text
/^products-row-/ matches 1
/^products-/ matches 5
/row/ matches 2
```

El primer patrón selecciona solo el prefijo de las filas de productos, no un id completo. El segundo es demasiado amplio: recoge nombres, botones y conteos. El tercero también incluye filas de pedidos.

## Un diálogo compartido, un id compartido

La tienda reutiliza el diálogo de confirmación en la lista y en la página de detalle del producto. Sus botones tienen los ids `confirm-delete-button` y `confirm-delete-cancel`.

![Delete abre un diálogo. Cancelar conserva la fila; confirmar la quita y muestra un mensaje.](/clips/shop-delete-dialog.webm)

El componente está en `apps/practice-shop/components/confirm-delete-dialog.tsx`. Usa el `AlertDialog` de shadcn, con el rol `alertdialog`, fuera de la tabla en el DOM.

![Árbol simplificado del DOM: el botón de confirmación está fuera de la fila.](/images/04-dialog-scope.es.svg)

El clic en el botón de una fila abre el diálogo; el clic en el botón compartido confirma el borrado. La búsqueda `page.getByTestId("products-row-12").getByTestId("confirm-delete-button")` encuentra cero elementos porque busca dentro de la fila. Busca el botón del diálogo desde `page`.

## Cuando falta un id

Pide al desarrollador que agregue el atributo e indica el elemento, la página y el nombre sugerido, como `products-export`. También puedes agregarlo tú si tienes permiso para cambiar el archivo.

El enlace de producto nuevo muestra dónde colocarlo:

```tsx
<Button asChild>
  <Link href="/products/new" data-testid="products-new">
    New product
  </Link>
</Button>
```

`Button asChild` aplica el estilo al `Link` que contiene. El elemento del DOM es un `<a>` y el test id queda en ese enlace. Lo mismo ocurre con Edit en cada fila: `getByRole("button", { name: "Edit" })` no encuentra ese enlace.

Por sí solo, `data-testid` no agrega estilo ni comportamiento. El JavaScript y el CSS de la app sí pueden leerlo o seleccionarlo.

## Test ids, roles y etiquetas

Los locators por rol y etiqueta buscan el rol o nombre accesible del elemento. Encontrarlo no demuestra que toda la página sea accesible. Este equipo eligió test ids. La regla en `apps/practice-shop/e2e/README.md` dice:

```text
Select with `page.getByTestId(...)`. No CSS, no XPath, no text selectors for things you click.
```

El equipo usa los ids como un contrato entre desarrollo y QA: el nombre se conserva aunque cambien el texto o el estilo. Los desarrolladores deben agregar y mantener esos atributos.

En la tienda, `page.getByLabel("Search")` también encuentra el cuadro de búsqueda. La etiqueta `<Label htmlFor="products-search">` apunta al campo cuyo atributo `id` tiene el mismo valor. Esa asociación es distinta del atributo `data-testid`.

## Profundiza

### El atributo que busca Playwright

Estas dos líneas seleccionan el mismo campo:

```ts
await page.getByTestId("products-search").fill("mouse")
await page.locator('[data-testid="products-search"]').fill("mouse")
```

La segunda usa un selector CSS de atributo. `getByTestId` usa `data-testid` por defecto. Si la aplicación ya usa `data-qa`, esta opción hace que Playwright busque ese atributo:

```ts
use: { testIdAttribute: "data-qa" },
```

Los atributos que empiezan con `data-` están reservados por HTML para tu propia información. El navegador los conserva en el DOM y los expone al JavaScript mediante `dataset`; no les asigna una acción ni un estilo propios.

### El alcance de un test id

Un botón puede tener `data-testid="products-new"` y aun así carecer de un nombre accesible. Encontrarlo por su test id no comprueba ese nombre.

En esta tienda, sigue la convención de test ids para las acciones. Otro equipo puede elegir roles y etiquetas para controles con nombres accesibles y test ids para registros sin un nombre que los identifique.

## Práctica

1. Abre `apps/practice-shop/app/(dashboard)/products/page.tsx`. Anota tres `data-testid` que incluyan un id de registro.
2. Abre `apps/practice-shop/e2e/lib/pages/products.page.ts`. Encuentra dónde se usa `products-search`.
3. Inicia la tienda con `pnpm shop:dev`. Abre http://localhost:5190 e inicia sesión como `admin@qa-shop.test` con la contraseña `Admin123!`.
4. Abre la página de productos. Haz clic derecho en un botón Delete y elige **Inspect** (Inspeccionar).
5. Encuentra el atributo `data-testid` del botón. Comprueba que el número coincide con el producto.
6. Inspecciona el cuadro de búsqueda y comprueba su test id. Luego inspecciona un enlace Edit y verifica si su etiqueta es `<button>` o `<a>`.

## Reto

Crea `apps/practice-shop/e2e/challenges/testid-audit.spec.ts` para auditar los test ids de la página de productos (`/products`) o de pedidos (`/orders`).

Está terminado cuando:

- El primer test espera a que la tabla sea visible y recoge todos los valores de `data-testid` de la página. Si alguno incumple la regla, el mensaje de fallo lista los ids malos.
- Tu función `isGoodTestId(id: string): boolean` acepta palabras en minúscula unidas con guiones, con un número opcional al final.
- Un segundo test, sin navegador, prueba al menos tres ids buenos y cuatro malos, como `Products-New`, `products_new`, `new` y `products-row-`.
- Ejecutaste el spec y leíste el resultado. Si un id real incumple tu regla, un comentario indica si la regla es demasiado estricta o el id está mal.

Necesitarás leer un atributo de muchos elementos a la vez y escribir un patrón que acepte un número solo al final. Busca: `playwright locator evaluateAll`, `playwright locator all getAttribute`, `regex lowercase letters hyphen digits`.

## Piénsalo bien

1. Un desarrollador construye los ids con la posición en la lista. Tras agregar un producto al principio, este test pasa aunque ya no borra la lámpara. ¿Dónde está el bug y qué comprobación lo oculta?

```ts
test("deleting the lamp shows a message", async ({ page }) => {
  await page.goto("/products")
  await page.getByTestId("products-delete-0").click()
  await page.getByTestId("confirm-delete-button").click()
  await expect(page.getByTestId("products-message")).toBeVisible()
})
```

<details><summary>Respuesta</summary>

`products-delete-0` elige el producto nuevo, que ahora ocupa la primera posición. La aserción solo comprueba que aparece un mensaje. Crea la lámpara dentro del test para conocer su id, úsalo en el locator y comprueba que desaparece su fila.

</details>

2. El botón Delete ahora dice "Eliminar" y conserva su test id. ¿Cuáles de estos locators siguen encontrándolo: `getByText("Delete")`, `getByRole("button", { name: "Delete" })`, `getByTestId("products-delete-12")`?

<details><summary>Respuesta</summary>

Solo `getByTestId("products-delete-12")`. Los otros dos buscan la palabra "Delete", que cambió. El test id tampoco detectaría que falta una traducción o un nombre accesible.

</details>

3. Una búsqueda no devuelve productos. ¿Cuántos elementos encuentra `page.getByTestId(/^products-row-/)` y qué pasa al llamar a `.first().click()` sobre ese locator?

<details><summary>Respuesta</summary>

Encuentra cero elementos. Playwright sigue buscando una primera coincidencia hasta agotar el timeout. Para comprobar este estado, usa `toHaveCount(0)` sobre las filas y comprueba que `products-empty` sea visible.

</details>

## Siguiente paso

En la próxima lección aprendes qué es un fixture y cómo escribir el tuyo.
