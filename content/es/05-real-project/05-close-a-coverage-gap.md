---
title: Cerrar un hueco de cobertura
summary: Planifica un spec nuevo a partir de un hueco de COVERAGE.md, escríbelo paso a paso y luego encárgate tú de los huecos restantes.
duration: 60 min
---

## Objetivo

- Planificar un spec en lenguaje sencillo antes de escribir código.
- Elegir la preparación de datos para cada escenario.
- Escribir un archivo de spec completo para "editar un producto".
- Asumir los huecos restantes como trabajo propio.

## Primero planifica, después programa

No abras primero el editor. Escribe los escenarios en lenguaje sencillo. Cada escenario es un test. Cada uno dice qué ve el usuario.

El hueco es "Editing a product" (editar un producto). Abre la aplicación y edita un producto a mano. Luego escribe:

1. El formulario de edición empieza con los valores actuales del producto.
2. Guardar un nombre y un estado nuevos actualiza la lista.
3. Un precio inválido muestra un error y el producto conserva sus datos anteriores.
4. Cancelar deja el producto sin cambios.

## Decide los datos

Cada test necesita un producto para editar. No edites un producto de los datos iniciales. Otro test o una ejecución posterior puede depender de él. Crea uno nuevo para cada test.

Usa la interfaz solo para lo que se está probando. Aquí lo que se prueba es el formulario de edición. Así que crea el producto por la API con `createProduct`. Es más rápido y más estable que llenar el formulario "New product" (nuevo producto).

`createProduct(request, overrides)` devuelve el producto con su `id`. Pasa `overrides` para fijar campos, como `{ price: 25 }`.

## Decide cómo llegar al formulario

Podrías abrir `/products/<id>/edit` directamente. Pero la página se renderiza primero en el servidor, y React necesita un momento para estar listo. Lo que escribas demasiado pronto puede borrarse. La suite lo resuelve de forma simple. Empieza en la lista, espera la fila y luego hace clic en **Edit** (editar). Un clic se mueve dentro de la aplicación, así que React ya está listo.

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

## Léelo con cuidado

- Cada test crea su propio producto. Ningún test depende de otro.
- Cada test espera `products.row(product.id)` antes de hacer clic. Es la espera *web-first* para "la página está lista".
- El tercer test comprueba los datos por la API, no solo en pantalla. El formulario sigue en pantalla después de un error. La pantalla no te dice si el servidor guardó algo. La API sí.
- No hay ningún `waitForTimeout`.

Ejecútalo dos veces. Luego actualiza `COVERAGE.md`: añade una fila de Products para editar y elimina "Editing a product." de los huecos.

## Tus huecos

Elige un hueco a la vez. Planifica primero los escenarios con palabras. Cada pista es una dirección, no una solución.

- **Página de detalle del producto.** En la lista, el nombre del producto es un enlace. Haz clic y lee la página. Busca los test ids que empiezan con `product-detail-`, y `products-view-<id>` en la lista. ¿Cuáles ve también un viewer? ¿A dónde te lleva el enlace para volver?
- **Eliminar desde la página de detalle.** La página de detalle tiene su propio botón Delete (eliminar) para el admin. Abre el mismo diálogo de confirmación que la lista. Después de confirmar, ¿a dónde va el navegador? ¿Cómo demuestras que el producto ya no existe?
- **Paginación.** Los datos iniciales tienen 24 productos y otros tests añaden más. No fijes en el código el número de páginas. Mira los test ids `products-page`, `products-next-page` y `products-prev-page`. En la página 1, ¿qué botón está deshabilitado?
- **SKU duplicado.** Crea un producto por la API. Luego intenta crear otro con el mismo SKU en el formulario. Encuentra el texto de error bajo el campo SKU.
- **Pedido enviado.** Un pedido pagado puede marcarse como enviado. Los pedidos pagados iniciales son 1002, 1006 y 1010. Comprueba cuáles están libres. ¿Qué botones tiene un pedido enviado?
- **Filtro de pedidos vacío.** Ningún estado está vacío en los datos iniciales, y los pedidos solo avanzan. No puedes vaciar un estado sin romper otros tests. Busca cómo Playwright puede responder él mismo a una petición: el método `page.route`.
- **Página 404.** Abre un id de producto que no existe, como `/products/999999`. La página tiene su propio `data-testid`. Encuéntralo en `app/not-found.tsx`.
- **Volver a `?next=` después del login.** Empieza sin sesión. Abre una página protegida. Inicia sesión por el formulario. ¿Dónde debe terminar el navegador? Mira cómo `auth.spec.ts` empieza sin sesión.

## Profundiza

### Por qué la página necesita un momento: el renderizado en el servidor

La tienda renderiza la página primero en el servidor. El navegador recibe HTML listo y lo muestra de inmediato. Después, se carga el JavaScript de React y conecta sus manejadores de eventos. Este paso se llama **hidratación** (*hydration*). Antes de que termine, la página parece lista pero no reacciona bien a lo que escribes.

Por eso la suite empieza en la lista, espera una fila y hace clic en **Edit**. Puedes entender mejor esta idea leyendo sobre renderizado en el servidor e hidratación. Muchos sitios modernos funcionan así.

### Una idea equivocada: "toHaveValue(25) es lo mismo que toHaveValue('25')"

El primer test comprueba `toHaveValue("25")` con comillas. ¿Por qué un string? Porque el texto de un campo de entrada siempre es texto. El número 25 y el texto "25" son distintos en TypeScript. Si escribes `toHaveValue(25)`, la comprobación de tipos falla. Comprueba lo que la página realmente contiene, no lo que esperas que contenga.

### Cómo aparece en el trabajo real de automatización QA

Mira los cuatro tests. Cada uno empieza con las mismas tres líneas: ir a la lista, esperar la fila, hacer clic en Edit. Un candidato para **DRY** (Don't Repeat Yourself, no te repitas) es un método en el Page Object:

```ts
// Add to the ProductsPage class in lib/pages/products.page.ts
async openEdit(id: number) {
  await this.goto()
  // waitFor is a wait, not an assertion, so the Page Object stays assertion-free.
  await this.row(id).waitFor()
  await this.page.getByTestId(`products-edit-${id}`).click()
}
```

Ahora un test dice `await products.openEdit(product.id)`. Si cambia la forma de llegar al formulario, arreglas un solo lugar. Pero ten en cuenta el costo. El test ya no muestra la espera, y un lector nuevo debe abrir otro archivo para verla. La lección mantiene visibles las tres líneas a propósito, porque esta es una suite de aprendizaje. Un equipo real puede decidir de cualquiera de las dos formas. La regla es: quita la repetición cuando ayude al lector, no solo para acortar el código.

### El costo de preparar datos por la API

Preparar datos con `createProduct` es rápido. Pero tiene un riesgo: si la API falla, fallan todos los tests que la usan, incluso los que tratan del formulario de edición. Por eso conserva un test que cree un producto por el formulario (la suite lo tiene en `products.spec.ts`). Así sabes que el camino por la interfaz funciona, y los demás solo reutilizan el atajo.

## Práctica

1. Crea `products/product-edit.spec.ts` con el código de arriba.
2. Ejecútalo: `pnpm --filter practice-shop e2e e2e/products/product-edit.spec.ts`.
3. Actualiza `COVERAGE.md`.
4. Elige un hueco de tu lista. Escribe sus escenarios con palabras sencillas en un archivo de texto.

## Comprueba lo que sabes

1. ¿Por qué crear el producto por la API?

<details><summary>Respuesta</summary>

El formulario de edición es lo que se está probando. La API es más rápida y más estable para preparar datos.

</details>

2. ¿Por qué cada test empieza en la lista y hace clic en Edit?

<details><summary>Respuesta</summary>

Un clic se mueve dentro de la aplicación, así que React ya está listo. Escribir justo después de cargar la página directamente puede borrarse.

</details>

3. ¿Por qué comprobar el precio por la API en el tercer test?

<details><summary>Respuesta</summary>

Demuestra que el servidor no guardó el valor inválido. La pantalla sola no lo demuestra.

</details>

4. Supón que los cuatro tests de edición usaran el producto inicial SKU-0001 en vez de un producto nuevo, y el segundo test lo renombra. ¿Qué sale mal en los otros tests?

<details><summary>Respuesta</summary>

Después del cambio de nombre, el nombre de SKU-0001 es distinto. El primer test, que comprueba los valores actuales, puede fallar según el orden, y también las ejecuciones siguientes en un servidor sucio. Los tests que comparten datos dependen unos de otros. Crear un producto nuevo por test los mantiene independientes.

</details>

5. Un colega escribe `expect(await page.getByTestId("product-price").inputValue()).toBe("25")` en lugar de `await expect(page.getByTestId("product-price")).toHaveValue("25")`. ¿Cuál es mejor y por qué?

<details><summary>Respuesta</summary>

La segunda. `toHaveValue` es una aserción web-first: vuelve a comprobar hasta que el valor coincide o se acaba el tiempo. `inputValue()` lee el valor una sola vez, en ese instante. Si el formulario aún se está llenando, la primera versión falla por un motivo de tiempo, no por un bug real.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es la hidratación en React y el renderizado en el servidor, y por qué puede hacer flaky a los tests automatizados?**
   - Busca: `react hydration server side rendering explained`
   - Una buena respuesta explica: qué envía el servidor, qué hace React después, y por qué lo que se escribe antes de la hidratación puede perderse

2. **¿Cuál es la diferencia entre crear datos de prueba por la interfaz y por una API?**
   - Busca: `test data setup api vs ui automation`
   - Una buena respuesta explica: una ventaja y un riesgo de cada enfoque, y cuándo elige cada uno un equipo

3. **¿Qué significa un estado HTTP 201 y en qué se diferencia del 200?**
   - Busca: `http status 201 created vs 200 ok`
   - Una buena respuesta explica: qué dice el 201 sobre el resultado de una petición POST, y por qué el helper lo comprueba

## Siguiente paso

En la próxima lección probarás a un segundo usuario, el viewer, que necesita una segunda sesión.
