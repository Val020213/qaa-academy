---
title: Cerrar un hueco de cobertura
summary: Planifica un spec nuevo a partir de un hueco de COVERAGE.md, escríbelo paso a paso y luego encárgate tú de los huecos restantes.
duration: 45 min
---

## Objetivo

- Planificar un spec en lenguaje simple antes de escribir código.
- Elegir cómo preparar los datos en cada escenario.
- Escribir un archivo de spec completo para "editar un producto".
- Tomar los huecos restantes como trabajo propio.

## Primero el plan, después el código

No abras primero el editor. Escribe los escenarios en lenguaje simple. Cada escenario es un test. Cada uno dice qué ve el usuario.

El hueco es "Editing a product" (editar un producto). Abre la aplicación y edita un producto a mano. Luego escribe:

1. El formulario de edición empieza con los valores actuales del producto.
2. Guardar un nombre y un estado nuevos actualiza la lista.
3. Un precio inválido muestra un error y el producto conserva sus datos anteriores.
4. Cancelar deja el producto sin cambios.

## Decide los datos

Cada test necesita un producto para editar. No edites un producto de los datos iniciales. Otro test o una ejecución posterior puede depender de él. Crea uno nuevo para cada test.

Usa la interfaz solo para lo que estás probando. Aquí lo que se prueba es el formulario de edición. Por eso crea el producto por la API con `createProduct`. Es más rápido y más estable que llenar el formulario "New product".

`createProduct(request, overrides)` devuelve el producto con su `id`. Pasa `overrides` para fijar campos, como `{ price: 25 }`.

## Decide cómo llegar al formulario

Podrías abrir `/products/<id>` directamente. Pero la página se renderiza primero en el servidor y React necesita un momento para estar listo. Si escribes demasiado pronto, el texto puede borrarse. La suite lo resuelve de forma simple. Empieza en la lista, espera la fila y luego hace clic en **Edit** (editar). Un clic se mueve dentro de la aplicación, así que React ya está listo.

El producto nuevo es el más reciente, así que está en la página 1 de la lista.

## Escribe el spec

Crea el archivo `apps/practice-shop/e2e/products/product-edit.spec.ts`. Fíjate en lo que reutiliza: `createProduct`, `uniqueName` y el Page Object `ProductsPage`.

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
    await expect(page).toHaveURL(new RegExp(`/products/${product.id}$`))

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

## Léelo con cuidado

- Cada test crea su propio producto. Ningún test depende de otro.
- Cada test espera `products.row(product.id)` antes de hacer clic. Es la espera *web-first* (la aserción espera hasta que la página esté lista).
- El tercer test comprueba los datos por la API, no solo en pantalla. El formulario sigue en pantalla después de un error. La pantalla no te dice si el servidor guardó algo. La API sí.
- No hay ningún `waitForTimeout`.

Ejecútalo dos veces. Luego actualiza `COVERAGE.md`: añade una fila de Products para la edición y borra "Editing a product." de los huecos.

## Tus huecos

Elige un hueco a la vez. Planifica primero los escenarios con palabras. Cada pista es una dirección, no una solución.

- **Paginación.** Los datos iniciales tienen 24 productos y otros tests añaden más. No fijes en el código el número de páginas. Mira los testid `products-page`, `products-next-page` y `products-prev-page`. En la página 1, ¿qué botón está deshabilitado?
- **SKU duplicado.** Crea un producto por la API. Luego intenta crear otro con el mismo SKU en el formulario. Busca el texto del error debajo del campo SKU.
- **Pedido enviado.** Un pedido pagado se puede marcar como enviado. Los pedidos pagados de los datos iniciales son 1002, 1006 y 1010. Comprueba cuáles están libres. ¿Qué botones tiene un pedido enviado?
- **Filtro de pedidos vacío.** Ningún estado está vacío en los datos iniciales, y los pedidos solo avanzan. No puedes vaciar un estado sin romper otros tests. Busca cómo Playwright puede responder él mismo una petición: el método `page.route`.
- **Página 404.** Abre un id de producto que no existe, como `/products/999999`. La página tiene su propio `data-testid`. Búscalo en `app/not-found.tsx`.
- **Volver a `?next=` después del login.** Empieza sin sesión. Abre una página protegida. Inicia sesión por el formulario. ¿A dónde debe llegar el navegador? Mira cómo `auth.spec.ts` empieza sin sesión.

## Práctica

1. Crea `products/product-edit.spec.ts` con el código de arriba.
2. Ejecútalo: `pnpm --filter practice-shop e2e e2e/products/product-edit.spec.ts`.
3. Actualiza `COVERAGE.md`.
4. Elige un hueco de tu lista. Escribe sus escenarios con palabras simples en un archivo de texto.

## Comprueba lo que sabes

1. ¿Por qué crear el producto por la API?

<details><summary>Respuesta</summary>

El formulario de edición es lo que se prueba. La API es más rápida y más estable para preparar datos.

</details>

2. ¿Por qué cada test empieza en la lista y hace clic en Edit?

<details><summary>Respuesta</summary>

Un clic se mueve dentro de la aplicación, así que React ya está listo. Escribir justo después de cargar la página directamente puede borrarse.

</details>

3. ¿Por qué comprobar el precio por la API en el tercer test?

<details><summary>Respuesta</summary>

Demuestra que el servidor no guardó el valor inválido. La pantalla sola no lo demuestra.

</details>

## Siguiente paso

En la próxima lección probarás a un segundo usuario, el viewer, que necesita una segunda sesión.
