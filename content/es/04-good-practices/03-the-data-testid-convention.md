---
title: La convención data-testid
summary: Aprende la regla del equipo para los test ids, por qué los ids de fila llevan el id del registro y cómo juzgar cuándo un test id es la herramienta correcta.
duration: 75 min
---

## Empieza con un acertijo

Un test encuentra el botón de borrar con `page.getByText("Delete")` y hace clic en él. Durante tres semanas el test pasa. Luego falla con este mensaje:

```text
Error: strict mode violation: getByText('Delete') resolved to 10 elements
```

Nadie editó el test. Nadie editó el código de la página. El test corrió en el mismo servidor de antes.

¿Qué cambió? ¿Y el test está mal, o la página está mal?

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Nombrar un test id con la regla `<feature>-<element>`.
- Predecir cuántos elementos encuentra un locator antes de ejecutarlo.
- Encontrar el bug en un id de fila construido con una posición, y no con un registro.
- Decidir cuándo un test id es la herramienta correcta, y cuándo es mejor un rol o una etiqueta.

## Qué es data-testid

Un **test id** es un atributo del HTML de la página que existe solo para los tests. Su nombre es `data-testid`. Los usuarios no lo ven.

Playwright encuentra un elemento por su test id con `getByTestId`:

```ts
await page.getByTestId("products-search").fill("mouse")
```

El test id no cambia cuando cambia el texto, el color o el diseño de la página. Por eso el test sigue funcionando.

### De vuelta al acertijo

El código de la página y el test no cambiaron, así que cambiaron los datos. Durante tres semanas la página mostró un producto, así que `getByText("Delete")` encontraba un botón. Luego alguien agregó productos, y la página mostró 10 filas, cada una con un botón "Delete". Playwright es estricto: un clic sobre un *locator* (localizador de elementos) que encuentra muchos elementos falla.

El test siempre fue débil. Funcionaba solo porque la página era pequeña. La página no está mal: diez filas con la misma palabra es normal. La lección es que un texto que se repite no es una forma segura de encontrar una sola cosa. El arreglo es un id que nombre la fila, como `products-delete-12`. Verás por qué a continuación.

## La regla

Cada elemento interactivo tiene un `data-testid` con esta forma:

```text
<feature>-<element>
```

El **feature** (funcionalidad) es la página o el área. El **element** (elemento) es lo que es la cosa. Estos son ids reales de la tienda:

- `login-email`, `login-password`, `login-submit`
- `products-search`, `products-status-filter`, `products-new`
- `product-name`, `product-sku`, `product-save`
- `orders-status-filter`

Todas las palabras van en minúscula, con un guion entre ellas. Puedes leer el id y saber dónde está el elemento.

> **Nota:** "Interactivo" significa que le haces clic, escribes en él o eliges algo de él. En esta tienda, los elementos que solo lees, como un conteo o un mensaje de error, también tienen ids, porque los tests los comprueban.

### Un experimento: ¿cuántos elementos coinciden?

Una regla es fácil de decir. Pruébala con una pregunta. Aquí hay siete ids de la tienda. Antes de ejecutar nada, adivina cuántos encuentra cada patrón.

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

El primer patrón es exacto. El segundo es demasiado amplio: recoge nombres, botones y conteos. El tercero es demasiado suelto: también atrapa los pedidos. Una regla de nombres hace posible un buen patrón. Una regla descuidada lo haría imposible.

## Los ids de fila incluyen el id del registro

Una tabla tiene muchas filas. Todas se ven igual, así que el id debe decir cuál fila es. El id del registro va al final.

Este es el código real de `apps/practice-shop/app/(dashboard)/products/page.tsx`:

```tsx
<TableRow key={product.id} data-testid={`products-row-${product.id}`}>
  <TableCell data-testid={`products-name-${product.id}`}>
```

Para el producto con id 12, los ids son `products-row-12` y `products-name-12`. El botón de borrar es igual:

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

Este botón tiene el id `products-delete-12` para el producto 12. En un test construyes el id con el id que conoces:

```ts
await page.getByTestId(`products-delete-${product.id}`).click()
```

### ¿Por qué no usar la posición?

Un principiante podría construir los ids de fila con la posición en la lista. Mira esta idea y encuentra qué está mal antes de seguir leyendo:

```tsx
<TableRow data-testid={`products-row-${index}`}>
```

La tienda ordena primero lo más nuevo. Cuando un test agrega un producto, todas las filas bajan una posición. El id `products-row-0` ahora apunta a otro producto. Un test que hace clic en `products-delete-0` puede borrar la fila equivocada, y ningún error te avisa.

Este programa pequeño muestra el mismo efecto:

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

El id del registro es estable. El producto 12 es `products-row-12` hoy y mañana. Usa algo que pertenezca al registro, nunca a su lugar en la pantalla.

## Un diálogo compartido, un id compartido

Algunos elementos existen una sola vez en la página a la vez. El diálogo de confirmación es uno de ellos. La tienda usa un solo diálogo para todos los borrados, también en la página de detalle del producto. Sus botones siempre tienen los mismos ids: `confirm-delete-button` y `confirm-delete-cancel`.

Mira qué pasa con la fila cuando cancelas, y cuando confirmas.

![Delete abre un diálogo. Cancelar conserva la fila; confirmar la quita y muestra un mensaje.](/clips/shop-delete-dialog.webm)

Puedes verlo en `apps/practice-shop/components/confirm-delete-dialog.tsx`. Un comentario al inicio lo explica. El diálogo está construido sobre el `AlertDialog` de shadcn. Se dibuja al final de la página, fuera de la tabla, con el rol `alertdialog`.

Entonces el flujo de borrado tiene dos pasos con dos tipos de ids. El primer clic usa un id de fila. El segundo clic usa el id compartido.

Piensa en esto: el diálogo está fuera de la fila de la tabla. Si escribes `page.getByTestId("products-row-12").getByTestId("confirm-delete-button")`, ¿cuántos elementos esperas encontrar? Cero. La fila no contiene el diálogo. Busca siempre el diálogo compartido desde `page`, no desde una fila.

## Cuando falta un id

A veces necesitas un elemento que no tiene test id. No uses un selector frágil, como una clase CSS o la posición de un elemento.

Tienes dos opciones.

1. **Pregúntale al desarrollador.** Dile qué elemento, qué página y qué nombre sugieres, como `products-export`.
2. **Agrégalo tú.** Es un atributo en el JSX. Por ejemplo, el enlace de producto nuevo se ve así:

```tsx
<Button asChild>
  <Link href="/products/new" data-testid="products-new">
    New product
  </Link>
</Button>
```

Mira con atención. `Button asChild` significa que el estilo del botón se le da al `Link` de adentro. Entonces el elemento real es una etiqueta `<a>`, y el test id está en ese `<a>`. Lo mismo ocurre con el enlace Edit de cada fila: es un enlace, no un `<button>`. Un test que busca `getByRole("button", { name: "Edit" })` no encuentra nada. Los test ids esconden esta diferencia, y eso es útil. Pero es un recordatorio de que debes saber qué estás pulsando.

Agregar `data-testid` no cambia cómo funciona ni cómo se ve la página. Si no estás seguro de poder cambiar el archivo, pregunta primero.

## Test ids contra roles y etiquetas

Playwright tiene otras formas de encontrar elementos. `getByRole` encuentra un elemento por su significado, como un botón. `getByLabel` encuentra un campo de formulario por su etiqueta visible. `getByText` lo encuentra por las palabras en pantalla.

Muchos equipos prefieren roles y etiquetas, porque también comprueban que la página sea accesible. Este equipo eligió test ids. La regla en `apps/practice-shop/e2e/README.md` dice:

```text
Select with `page.getByTestId(...)`. No CSS, no XPath, no text selectors for things you click.
```

Las razones son prácticas.

- El texto cambia. Un botón llamado "Delete" puede pasar a ser "Remove". Todos los tests que usan el texto se romperían.
- El texto puede aparecer dos veces. En la tabla de productos, cada fila tiene un botón "Delete".
- Un id es un contrato. Un desarrollador que ve `data-testid` sabe que un test depende de él.

El costo es que los desarrolladores deben agregar los ids. Por eso la regla se aplica a todos los elementos.

Como ahora la tienda usa etiquetas reales, `page.getByLabel("Search")` también encuentra el cuadro de búsqueda. En el código, la etiqueta está junto al campo, unida con el atributo `htmlFor`. Esto funciona porque `<Label htmlFor="products-search">` y el campo tienen ids que coinciden. Las dos formas son válidas. ¿Cuál es mejor? Depende de qué quieres que demuestre el test, y lo pensarás en las preguntas.

### Prueba lo que ve el usuario, no cómo está construido el código

Los locators por rol y por etiqueta dicen lo que ve una persona: "un botón llamado Sign in". Un test id dice cómo marcaron el código los desarrolladores. Cuando un locator por rol falla, muchas veces señala un problema real para el usuario: falta la etiqueta. Un test id nunca falla por esa razón. Usa test ids para lo que no tiene un buen nombre, como una fila de una tabla, y usa roles y etiquetas donde la página tiene nombres reales.

## Profundiza

### Por qué `getByTestId` es solo una búsqueda por atributo

`getByTestId` no es magia. Busca un elemento cuyo atributo `data-testid` tenga ese valor. Estas dos líneas hacen el mismo trabajo:

```ts
await page.getByTestId("products-search").fill("mouse")
await page.locator('[data-testid="products-search"]').fill("mouse")
```

La segunda línea es un selector CSS de atributo. La primera es más corta y más fácil de leer. El nombre `data-testid` es solo el valor por defecto. Si tu equipo ya usa otro nombre, como `data-qa`, una línea en la configuración lo cambia, y la aplicación no cambia:

```ts
use: { testIdAttribute: "data-qa" },
```

Los atributos que empiezan con `data-` están reservados por HTML para tu propia información. El navegador los ignora. Por eso son seguros para los tests.

### Cómo ayuda la regla en el trabajo real

Un nombre consistente permite seleccionar grupos. El Page Object usa esta línea:

```ts
this.rows = page.getByTestId(/^products-row-/)
```

La parte `/^products-row-/` es una **expresión regular**: un patrón que coincide con texto. Significa "empieza con `products-row-`". Coincide con las 10 filas, y no coincide con `products-name-5`, porque el feature y el elemento son distintos. Una regla de nombres descuidada haría esto imposible.

Esto también es DRY en acción. El texto del id se escribe una vez en la aplicación y una vez en el Page Object. Los specs no lo repiten.

### Un límite de los test ids

Un test id no dice nada sobre el usuario. Un botón puede tener `data-testid="products-new"` y aun así no tener un nombre legible para un lector de pantalla. El test pasa. Un usuario real con un lector de pantalla no puede usarlo. Los test ids hacen los tests estables. No demuestran que la página sea accesible.

## Práctica

1. Abre `apps/practice-shop/app/(dashboard)/products/page.tsx`.
2. Encuentra cada `data-testid` del archivo. Anota tres que incluyan un id de registro.
3. Abre `apps/practice-shop/e2e/lib/pages/products.page.ts`. Encuentra dónde se usa `products-search`.
4. Inicia la tienda con `pnpm shop:dev`. Abre http://localhost:5190 e inicia sesión como `admin@qa-shop.test` con la contraseña `Admin123!`.
5. Abre la página de productos. En tu navegador, haz clic derecho en un botón Delete y elige **Inspect** (Inspeccionar).
6. Encuentra el atributo `data-testid` del botón. Comprueba que el número coincide con el producto.
7. Haz lo mismo con el cuadro de búsqueda de la página. Luego inspecciona un enlace Edit: ¿es un `<button>` o un `<a>`?

## Reto

Escribe un test que audite los test ids de una página. Lee cada id de la página y comprueba que cada uno sigue la regla.

Crea el archivo `apps/practice-shop/e2e/challenges/testid-audit.spec.ts`. Elige tu mundo: audita la página de productos (`/products`) o la de pedidos (`/orders`).

Está terminado cuando:

- El primer test abre tu página, espera a que la tabla sea visible y luego recoge todos los valores de `data-testid` de la página.
- La regla es una función `isGoodTestId(id: string): boolean` que escribes tú. Acepta palabras en minúscula unidas con guiones, con un número opcional al final.
- Si un id rompe la regla, el mensaje de fallo lista los ids malos. Un mensaje que dice solo "expected true" no cuenta.
- Un segundo test no necesita navegador. Llama a tu función con al menos tres ids buenos y cuatro malos, como `Products-New`, `products_new`, `new` y `products-row-`, para que veas que la regla puede fallar.
- Ejecutaste el spec y leíste el resultado. Si un id de la página real rompe tu regla, escribe en un comentario qué decidiste: ¿la regla es demasiado estricta, o el id está mal?

Vas a necesitar algo que esta lección no enseñó: cómo leer un atributo de muchos elementos a la vez, y cómo escribir un patrón que acepte un número solo al final. Busca: `playwright locator evaluateAll`, `playwright locator all getAttribute`, `regex lowercase letters hyphen digits`.

## Piénsalo bien

1. Mira estos siete ids y estos tres patrones. ¿Cuántos ids encuentra cada patrón?

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
// patterns: /^products-row-/   /^products-/   /row/
```

<details><summary>Respuesta</summary>

El primero encuentra 1 (`products-row-12`). El segundo encuentra 5: todos los ids que empiezan con `products-`, que son la fila, el nombre, el botón de borrar, el cuadro de búsqueda y el conteo. El tercero encuentra 2: `products-row-12` y `orders-row-1003`, porque busca la palabra en cualquier lugar. El prefijo debe ser específico para elegir solo el grupo que quieres, y el `^` evita que un patrón coincida con el medio de otros ids.

</details>

2. Un desarrollador construye los ids de fila con la posición en la lista. Este test siempre pasa, pero otro test de la suite a veces falla después de él. Encuentra el bug.

```ts
test("deleting the lamp shows a message", async ({ page }) => {
  await page.goto("/products")
  await page.getByTestId("products-delete-0").click()
  await page.getByTestId("confirm-delete-button").click()
  await expect(page.getByTestId("products-message")).toBeVisible()
})
```

<details><summary>Respuesta</summary>

El id usa la posición, y la tienda ordena primero lo más nuevo. El test se escribió cuando la lámpara estaba en la fila 0. Cuando otro test acaba de agregar un producto, la fila 0 es ese producto nuevo, así que el test borra el equivocado. La única comprobación es que aparece un mensaje, así que pasa de todos modos. El producto que otro test necesita ya no está, y ese test falla más tarde sin un vínculo claro. Usa ids construidos con el id del registro, crea la lámpara dentro del test para conocer su id, y comprueba que desaparece la fila correcta.

</details>

3. Las dos líneas encuentran el cuadro de búsqueda de la página de productos. ¿Cuál es mejor aquí y qué te haría elegir la otra?

```ts
await page.getByTestId("products-search").fill("mouse")
await page.getByLabel("Search").fill("mouse")
```

<details><summary>Respuesta</summary>

La línea del test id es estable: no cambia cuando cambia el texto de la etiqueta, y la regla del equipo lo pide. La línea de la etiqueta demuestra otra cosa: una persona real ve un campo llamado "Search", y un lector de pantalla puede nombrarlo. Si faltara la etiqueta, la segunda línea fallaría, y eso sería un bug real de accesibilidad. Un equipo que se preocupa por la accesibilidad puede usar la versión con etiqueta, o usar las dos: test ids para los pasos, y un test que compruebe que las etiquetas existen. La elección depende de lo que quieras que demuestre el test.

</details>

4. La tienda se traduce al español y el botón Delete ahora dice "Eliminar". ¿Cuáles de estos locators siguen funcionando: `getByText("Delete")`, `getByRole("button", { name: "Delete" })`, `getByTestId("products-delete-12")`? ¿Qué dice tu respuesta sobre la regla del equipo?

<details><summary>Respuesta</summary>

Solo el test id sigue funcionando. El texto y el nombre del rol usan la palabra "Delete", y la palabra cambió. Esta es la razón por la que el equipo eligió test ids para lo que se pulsa. El precio es que un test id no notaría que falta la traducción, o que un botón no tiene ningún nombre. Si el producto tiene varios idiomas, puedes agregar a propósito algunos tests basados en roles, para comprobar que los nombres son correctos.

</details>

5. Explícale a un compañero nuevo, en tres frases y sin la palabra "selector", por qué el botón de borrar del producto 12 tiene el id `products-delete-12` y no solo `delete`.

<details><summary>Respuesta</summary>

Una buena respuesta dice: la tabla muestra diez filas, y cada una tiene su propio botón de borrar. Si todos tuvieran el id `delete`, un test no podría decir cuál quiere, y Playwright se detendría con un error de strict mode. El número al final es el id del registro, así que el id apunta a un solo producto, y no cambia cuando cambia el orden de la lista.

</details>

6. El usuario busca una palabra que no coincide con ningún producto. ¿Qué encuentra `page.getByTestId(/^products-row-/)`? ¿Qué pasa si el test luego llama a `.first().click()` sobre eso? ¿Qué elemento le muestra al usuario que la lista está vacía?

<details><summary>Respuesta</summary>

Encuentra cero elementos. Un clic sobre `.first()` de una coincidencia vacía espera un elemento que nunca llega, y el test termina con un error de timeout, no con un mensaje claro. La página tiene el id `products-empty` para el mensaje de lista vacía. Un buen test para este caso comprueba que el conteo de filas es 0 con `toHaveCount(0)` y que `products-empty` es visible. Nunca hace clic en una fila que puede no existir.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué son los atributos `data-*` en HTML y para qué sirven?**
   - Busca: `html data-* attributes custom data`
   - Pruébalo: abre la tienda en tu navegador, presiona F12 y abre la Console (Consola). Ejecuta `document.querySelector('[data-testid="products-search"]').dataset`. Lee lo que devuelve y luego prueba `.dataset.testid`.
   - Una buena respuesta explica: cómo escribir uno, cómo lo puede leer JavaScript y por qué el navegador lo ignora al mostrar la página.

2. **¿Qué recomienda la documentación de Playwright para encontrar elementos y por qué?**
   - Busca: `playwright locators best practices getByRole`
   - Pruébalo: elige tres elementos de la página de login. Escribe el locator de cada uno en el orden que prefiere la documentación. Comprueba cada uno en el inspector de Playwright o en un spec corto.
   - Una buena respuesta explica: el orden de preferencia de los locators y la razón por la que se prefieren los que usan lo que ve el usuario.

3. **¿Por qué los selectores de clase CSS y de XPath se llaman frágiles en la automatización de tests?**
   - Busca: `brittle selectors XPath CSS test automation`
   - Pruébalo: en las DevTools del navegador, haz clic derecho en el botón Delete de la primera fila, elige Copy (Copiar), y copia el selector CSS y el XPath. Compáralos con `products-delete-12`. Escribe qué parte de cada uno se rompería si un desarrollador cambiara el diseño.
   - Una buena respuesta explica: qué cambia en una página que rompe esos selectores, y cuál es una alternativa estable.

## Siguiente paso

En la próxima lección aprendes qué es un fixture y cómo escribir el tuyo.
