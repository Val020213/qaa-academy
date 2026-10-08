---
title: Cerrar un hueco de cobertura
duration: 80 min
---

## Objetivo

En esta lección conviertes un hueco de `COVERAGE.md` en un spec de edición de productos. Preparas los datos de cada test y compruebas tanto la interfaz como los datos guardados.

- Planificar los escenarios antes de escribir el spec.
- Crear un producto propio para cada test y llegar al formulario desde la lista.
- Comprobar los valores iniciales, el guardado, la validación y la cancelación.
- Demostrar que una aserción detecta un resultado incorrecto y actualizar la cobertura.

## Planifica los escenarios

El hueco es "Editing a product" (editar un producto). Abre la tienda y edita un producto a mano. Escribe los resultados que vas a comprobar:

1. El formulario de edición empieza con los valores actuales del producto.
2. Guardar un nombre y un estado nuevos actualiza la lista.
3. Un precio inválido muestra un error y el producto conserva sus datos anteriores.
4. Cancelar deja el producto sin cambios.

![Cambiar el nombre de un producto y cancelar conserva el nombre original en la lista.](/clips/05-edit-cancel.webm)

Cada escenario será un test. El plan deja fuera otros errores de campo, como un stock inválido o un nombre vacío, porque la suite ya los comprueba en el formulario de creación en `products/products.spec.ts`.

## Decide los datos

Crea un producto nuevo para cada test. Si los cuatro editan el producto de la semilla `SKU-0001`, el cambio de nombre de un test altera los datos que recibe el siguiente.

Prepara ese producto por la API con `createProduct`, porque aquí pruebas el formulario de edición. Así cada test llega a la acción que le interesa sin llenar primero el formulario "New product".

`createProduct(request, overrides)` devuelve el producto con su `id`. Pasa `overrides` para fijar campos, como `{ price: 25 }`.

Si la API de creación falla, también fallan los tests que la usan para preparar sus datos. Conserva el test de creación por el formulario en `products.spec.ts` para comprobar ese recorrido de la interfaz.

## Llega al formulario desde la lista

Puedes abrir `/products/<id>/edit` directamente con `page.goto` o empezar en la lista y hacer clic en **Edit**. La suite usa el segundo recorrido.

La tienda genera el HTML del formulario en el servidor. El navegador puede mostrarlo antes de que React conecte sus manejadores de eventos durante la hidratación. Escribir antes de que existan esos manejadores puede dejar el estado de React sin actualizar; un render posterior puede restaurar ese valor en el campo controlado.

En la lista, las filas vienen de una petición que el navegador envía después de que React corre. El test espera la fila del producto y luego hace clic en **Edit**. Esa fila confirma que React ya cargó la lista. El enlace de Next.js permite navegar al formulario dentro de la aplicación; un enlace visible por sí solo no demuestra que cualquier formulario esté listo.

El producto nuevo está en la página 1 porque la API ordena los productos por id, del más nuevo al más viejo.

## Escribe el spec

Crea el archivo `apps/practice-shop/e2e/products/product-edit.spec.ts`. Reutiliza `createProduct`, `uniqueName` y el Page Object `ProductsPage`.

```ts
import { expect, test } from "../lib/test"
import { createProduct } from "../lib/fixtures/api-client"
import { uniqueName } from "../lib/helpers"
import { ProductsPage } from "../lib/pages/products.page"

test.describe("Edit product", () => {
  test("the form starts with the current values", async ({ page, request }) => {
    const product = await createProduct(request, { price: 25, stock: 4, status: "draft" })
    const products = new ProductsPage(page)
    await products.goto()
    await expect(products.row(product.id)).toBeVisible()

    await page.getByTestId(`products-edit-${product.id}`).click()

    await expect(page.getByTestId("product-form-title")).toHaveText("Edit product")
    await expect(page.getByTestId("product-name")).toHaveValue(product.name)
    await expect(page.getByTestId("product-sku")).toHaveValue(product.sku)
    await expect(page.getByTestId("product-price")).toHaveValue("25")
    await expect(page.getByTestId("product-stock")).toHaveValue("4")
    await expect(page.getByTestId("product-status")).toHaveValue("draft")
  })

  test("saving a new name and status updates the list", async ({ page, request }) => {
    const product = await createProduct(request, { status: "active" })
    const newName = uniqueName("Renamed")
    const products = new ProductsPage(page)
    await products.goto()
    await expect(products.row(product.id)).toBeVisible()

    await page.getByTestId(`products-edit-${product.id}`).click()
    await page.getByTestId("product-name").fill(newName)
    await page.getByTestId("product-status").selectOption("archived")
    await page.getByTestId("product-save").click()

    await expect(page).toHaveURL(/\/products$/)
    await expect(page.getByTestId(`products-name-${product.id}`)).toHaveText(newName)
    await expect(page.getByTestId(`products-status-${product.id}`)).toHaveText("archived")
  })

  test("an invalid price shows an error and keeps the old data", async ({ page, request }) => {
    const product = await createProduct(request, { price: 30 })
    const products = new ProductsPage(page)
    await products.goto()
    await expect(products.row(product.id)).toBeVisible()

    await page.getByTestId(`products-edit-${product.id}`).click()
    await page.getByTestId("product-price").fill("0")
    await page.getByTestId("product-save").click()

    await expect(page.getByTestId("product-price-error")).toHaveText("Price must be greater than 0.")
    await expect(page).toHaveURL(new RegExp(`/products/${product.id}/edit$`))

    const saved = await request.get(`/api/products/${product.id}`)
    expect(((await saved.json()) as { price: number }).price).toBe(30)
  })

  test("cancel leaves the product unchanged", async ({ page, request }) => {
    const product = await createProduct(request)
    const products = new ProductsPage(page)
    await products.goto()
    await expect(products.row(product.id)).toBeVisible()

    await page.getByTestId(`products-edit-${product.id}`).click()
    await page.getByTestId("product-name").fill("Not saved")
    await page.getByTestId("product-cancel").click()

    await expect(page).toHaveURL(/\/products$/)
    await expect(page.getByTestId(`products-name-${product.id}`)).toHaveText(product.name)
  })
})
```

El control Edit es un enlace (`<a>`) que lleva el test id. `click()` también funciona con enlaces. El locator depende del test id, así que cambiar la etiqueta HTML conservando ese id no obliga a cambiarlo.

## Revisa las comprobaciones

La espera de `products.row(product.id)` indica qué producto debe estar disponible antes del clic. El clic también espera a su elemento, pero la aserción permite identificar un fallo al cargar la fila.

El tercer test comprueba el error en pantalla y el precio guardado por la API. El formulario se queda en pantalla después de un error; eso por sí solo no demuestra que el servidor conservó los datos.

El test espera primero el texto del error y después lee la API. Ese texto aparece cuando el servidor ya respondió al intento de guardar.

![El test espera el error del PUT antes de leer el precio guardado por la API.](/images/05-validation-read.es.svg)

Si lees la API inmediatamente después del clic, puedes recibir el precio anterior mientras el guardado sigue pendiente.

## Elige otro hueco

Planifica un hueco a la vez. Usa estas pistas para encontrar los controles y los resultados que debes comprobar:

- Página de detalle del producto: abre el enlace del nombre en la lista. Busca los test ids `product-detail-` y `products-view-<id>`, los datos del producto y el enlace de regreso.
- Eliminar desde la página de detalle: usa el botón Delete del admin y el diálogo de confirmación. Comprueba el destino del navegador y que el producto ya no existe.
- Paginación: revisa `products-page`, `products-next-page` y `products-prev-page`. La semilla tiene 24 productos y otros tests agregan más; evita fijar el número de páginas.
- SKU duplicado: crea un producto por la API e intenta crear otro con el mismo SKU en el formulario. Comprueba el error bajo el campo SKU.
- Pedido enviado: usa un pedido pagado que ningún otro test cambie. Los pedidos pagados de la semilla son 1002, 1006 y 1010. Comprueba el estado final y los botones disponibles.
- Filtro de pedidos vacío: todos los estados tienen pedidos en la semilla y los pedidos solo avanzan. Vaciar un estado puede romper otros tests. Busca cómo responder a la petición con `page.route`.
- Página 404: abre un id inexistente, como `/products/999999`. Localiza su `data-testid` en `components/not-found-card.tsx` y revisa dónde la usan `app/not-found.tsx` y `app/(dashboard)/not-found.tsx`.
- Volver a `?next=` después del login: empieza sin sesión, abre una página protegida e inicia sesión con el formulario. Comprueba el destino del navegador. Mira cómo `auth.spec.ts` empieza sin sesión.

## Profundiza

### Los valores de los campos son texto

El primer test usa `toHaveValue("25")` porque el valor del campo de entrada es texto. Con `toHaveValue(25)`, el verificador de tipos rechaza el argumento numérico.

### Un método para abrir la edición

Las tres acciones repetidas, ir a la lista, esperar la fila y hacer clic en Edit, pueden quedar en el Page Object:

```ts
// Add to the ProductsPage class in lib/pages/products.page.ts
async openEdit(id: number) {
  await this.goto()
  // waitFor is a wait, not an assertion, so the Page Object stays assertion-free.
  await this.row(id).waitFor()
  await this.page.getByTestId(`products-edit-${id}`).click()
}
```

El test usaría `await products.openEdit(product.id)`. Un cambio en ese recorrido se resolvería en un solo método, aunque quien lee el test tendría que abrir el Page Object para ver la espera.

## Práctica

1. Crea `products/product-edit.spec.ts` con el código de arriba.
2. Ejecútalo dos veces: `pnpm --filter practice-shop e2e e2e/products/product-edit.spec.ts`.
3. En `product-edit.spec.ts`, cambia el cuarto test para que haga clic en `product-save` en lugar de `product-cancel`. Ejecútalo, lee el fallo y deshaz el cambio.
4. Actualiza `COVERAGE.md`: agrega una fila de Products para la edición y borra "Editing a product." de los huecos.
5. Elige otro hueco de la lista y escribe sus escenarios en un archivo de texto.

## Reto

Cierra el hueco de **paginación** en `apps/practice-shop/e2e/products/product-pagination.spec.ts`. La lista muestra 10 productos por página. El número de páginas puede crecer cuando otros tests crean productos.

Está terminado cuando:

- La página 1 muestra 10 filas, Previous está deshabilitado, Next está habilitado y el texto empieza con "Page 1 of" sin un total fijo.
- Tras un clic en Next, el texto empieza con "Page 2 of", Previous está habilitado y la primera fila muestra un producto distinto al de la página 1.
- Otro test llega a la última página sin fijar su número en el código y comprueba que Next está deshabilitado.
- El spec pasa dos veces seguidas y cada test pasa solo con `--grep`. Cambias un número esperado a propósito, ejecutas el spec, lees el fallo y deshaces el cambio.

Busca: `playwright toBeDisabled`, `playwright toHaveText regular expression` y `playwright locator textContent`.

## Piénsalo bien

1. Supón que el servidor guarda el precio inválido antes de responder con el error. En el tercer test, ¿qué aserciones pasan y cuál falla?

<details><summary>Respuesta</summary>

Pasan la comprobación del error y la de la URL, porque el formulario muestra el mensaje y permanece en edición. Falla la última aserción: la API devuelve el precio inválido en lugar de 30.

</details>

2. Este final del tercer test puede pasar aunque el servidor guarde el precio inválido. Encuentra el bug.

```ts
await page.getByTestId("product-save").click()
const saved = await request.get(`/api/products/${product.id}`)
expect(((await saved.json()) as { price: number }).price).toBe(30)
await expect(page.getByTestId("product-price-error")).toBeVisible()
```

<details><summary>Respuesta</summary>

La lectura de la API puede terminar antes que el guardado y devolver el precio anterior. Espera primero el error del formulario, que aparece después de la respuesta del servidor, y luego lee el precio guardado.

</details>

3. El equipo cambia la lista para mostrar primero los productos más viejos. ¿Qué se rompe en los cuatro tests y qué cambias?

<details><summary>Respuesta</summary>

El producto nuevo queda fuera de la página 1 y `products.row(product.id)` no llega a ser visible. Busca primero el nombre único con `products.search(product.name)` para mantener el recorrido desde la lista.

</details>

## Siguiente paso

En la siguiente lección pruebas a un segundo usuario, el viewer, que necesita una segunda sesión.
