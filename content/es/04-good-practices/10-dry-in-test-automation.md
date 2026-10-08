---
title: DRY en la automatización de tests
duration: 65 min
---

## Objetivo

En esta lección reduces los lugares que debes editar cuando cambia la tienda, sin esconder lo que comprueba cada test.

- Encontrar el conocimiento repetido en un spec y contar las ediciones que cuesta un cambio.
- Elegir entre configuración, helpers, fixtures, page objects y tablas de datos.
- Mantener los pasos y las aserciones legibles con DAMP.
- Decidir cuándo extraer código y cuándo conservar una copia.

## Un spec que se repite

Estos tres tests crean primero un producto con el formulario, aunque solo el primero comprueba la creación por esa vía.

```ts
import { expect, test } from "../lib/test"
import { uniqueName, uniqueSku } from "../lib/helpers"

test("a new product is at the top of the list", async ({ page }) => {
  const name = uniqueName("Created")
  await page.goto("/products")
  await expect(page.getByTestId("products-table")).toBeVisible()
  await page.getByTestId("products-new").click()
  await page.getByTestId("product-name").fill(name)
  await page.getByTestId("product-sku").fill(uniqueSku())
  await page.getByTestId("product-price").fill("12.50")
  await page.getByTestId("product-stock").fill("7")
  await page.getByTestId("product-save").click()
  await expect(page).toHaveURL(/\/products$/)

  await expect(page.getByTestId(/^products-row-/).first()).toContainText(name)
})

test("a new product can be found by searching", async ({ page }) => {
  const name = uniqueName("Searchable")
  await page.goto("/products")
  await expect(page.getByTestId("products-table")).toBeVisible()
  await page.getByTestId("products-new").click()
  await page.getByTestId("product-name").fill(name)
  await page.getByTestId("product-sku").fill(uniqueSku())
  await page.getByTestId("product-price").fill("12.50")
  await page.getByTestId("product-stock").fill("7")
  await page.getByTestId("product-save").click()
  await expect(page).toHaveURL(/\/products$/)

  await page.getByTestId("products-search").fill(name)

  await expect(page.getByTestId(/^products-row-/)).toHaveCount(1)
  await expect(page.getByTestId(/^products-row-/).first()).toContainText(name)
})

test("the Active filter hides a new draft product", async ({ page }) => {
  const name = uniqueName("Draft")
  await page.goto("/products")
  await expect(page.getByTestId("products-table")).toBeVisible()
  await page.getByTestId("products-new").click()
  await page.getByTestId("product-name").fill(name)
  await page.getByTestId("product-sku").fill(uniqueSku())
  await page.getByTestId("product-price").fill("12.50")
  await page.getByTestId("product-stock").fill("7")
  await page.getByTestId("product-save").click()
  await expect(page).toHaveURL(/\/products$/)
  await page.getByTestId("products-search").fill(name)
  await expect(page.getByTestId(/^products-row-/)).toHaveCount(1)
  await expect(page.getByTestId(/^products-row-/).first()).toContainText(name)

  await page.getByTestId("products-status-filter").selectOption("active")

  await expect(page.getByTestId(/^products-row-/)).toHaveCount(0)
})
```

Si el desarrollador renombra `product-save` a `product-submit`, debes editar los tres tests. Agregar un campo obligatorio, "Category", también exige tres ediciones. Con 30 tests que copian el formulario, cada cambio exige 30 ediciones.

## Dónde vive cada pieza de conocimiento

La configuración reúne los valores que comparten los tests. `playwright.config.ts` define `baseURL`, que Playwright usa para resolver `page.goto("/products")`. Las credenciales están en una constante en `e2e/lib/fixtures/api-client.ts`:

```ts
export const ADMIN = { email: "admin@qa-shop.test", password: "Admin123!", name: "Ada Admin" }
```

Para la preparación que comparten los tests de un archivo, usa `beforeEach`. Un fixture permite compartir esa preparación entre archivos y reunirla con su limpieza.

El helper de API `createProduct(request, overrides)` crea un producto en una petición. Los tests de búsqueda y filtro solo necesitan que el producto exista; pueden usar este helper para prepararlo.

`ProductsPage`, en `e2e/lib/pages/products.page.ts`, reúne los locators y las acciones de la lista de productos. El spec llama a `products.search(name)` y el page object guarda el id del cuadro de búsqueda.

`uniqueName` y `uniqueSku`, en `e2e/lib/helpers.ts`, reúnen la generación de datos únicos. Los tests llaman a esas funciones en vez de mantener una versión propia.

![Cada responsabilidad compartida tiene un lugar; el spec conserva la acción y lo esperado.](/images/04-dry-knowledge.es.svg)

## Un cuerpo de test para varias entradas

Una tabla de datos permite compartir el cuerpo de un test cuando cambian las entradas y el resultado esperado. Estos cuatro casos comprueban la validación de campos. Las reglas y los mensajes están en `lib/validation.ts`; los ids de error, en `components/product-form.tsx`.

```ts
import { expect, test } from "../lib/test"
import { uniqueName, uniqueSku } from "../lib/helpers"
import { ProductsPage } from "../lib/pages/products.page"

type Values = { name: string; sku: string; price: string; stock: string }

// Each row changes ONE field of an otherwise valid form.
// The messages are written out on purpose: they are what the user must read.
const invalidInputs: { title: string; change: Partial<Values>; field: string; message: string }[] = [
  {
    title: "the name is too short",
    change: { name: "ab" },
    field: "name",
    message: "Name must have at least 3 characters.",
  },
  {
    title: "the SKU has the wrong shape",
    change: { sku: "ABC-1" },
    field: "sku",
    message: "SKU must look like SKU-0001.",
  },
  {
    title: "the price is zero",
    change: { price: "0" },
    field: "price",
    message: "Price must be greater than 0.",
  },
  {
    title: "the stock is not a whole number",
    change: { stock: "1.5" },
    field: "stock",
    message: "Stock must be a whole number, 0 or more.",
  },
]

for (const row of invalidInputs) {
  test(`the form shows an error when ${row.title}`, async ({ page }) => {
    const values: Values = {
      name: uniqueName("Valid"),
      sku: uniqueSku(),
      price: "12.50",
      stock: "7",
      ...row.change,
    }
    const products = new ProductsPage(page)
    await products.goto()
    await expect(products.table).toBeVisible()
    await products.newButton.click()
    await page.getByTestId("product-name").fill(values.name)
    await page.getByTestId("product-sku").fill(values.sku)
    await page.getByTestId("product-price").fill(values.price)
    await page.getByTestId("product-stock").fill(values.stock)

    await page.getByTestId("product-save").click()

    await expect(page.getByTestId(`product-${row.field}-error`)).toHaveText(row.message)
  })
}
```

La parte `...row.change` copia solo los campos de esa fila y reemplaza sus valores por defecto en el objeto. Cada fila registra un test con su propio título. Agregar una regla como otra fila crea otro test sin copiar su cuerpo.

El bucle llama a `test` por cada fila cuando Playwright carga el archivo. Después, el runner ejecuta los tests registrados y reporta cada resultado por separado. Un título como "the price is zero" identifica el caso que falló; `row 3` obliga a contar filas.

## El spec reescrito

Solo el primer test conserva los pasos del formulario, porque comprueba la creación por la interfaz. Los otros dos preparan el producto por la API y dejan visibles la búsqueda, el filtro y sus aserciones.

```ts
import { expect, test } from "../lib/test"
import { createProduct } from "../lib/fixtures/api-client"
import { uniqueName, uniqueSku } from "../lib/helpers"
import { ProductsPage } from "../lib/pages/products.page"

test("a new product is at the top of the list", async ({ page }) => {
  const name = uniqueName("Created")
  const products = new ProductsPage(page)
  await products.goto()
  await expect(products.table).toBeVisible()

  await products.newButton.click()
  await page.getByTestId("product-name").fill(name)
  await page.getByTestId("product-sku").fill(uniqueSku())
  await page.getByTestId("product-price").fill("12.50")
  await page.getByTestId("product-stock").fill("7")
  await page.getByTestId("product-save").click()

  await expect(page).toHaveURL(/\/products$/)
  await expect(products.rows.first()).toContainText(name)
})

test("a product can be found by searching", async ({ page, request }) => {
  const product = await createProduct(request, { name: uniqueName("Searchable") })
  const products = new ProductsPage(page)
  await products.goto()
  await expect(products.row(product.id)).toBeVisible()

  await products.search(product.name)

  await expect(products.rows).toHaveCount(1)
  await expect(products.row(product.id)).toBeVisible()
})

test("the Active filter hides a draft product", async ({ page, request }) => {
  const product = await createProduct(request, { name: uniqueName("Draft"), status: "draft" })
  const products = new ProductsPage(page)
  await products.goto()
  await expect(products.row(product.id)).toBeVisible()
  await products.search(product.name)
  await expect(products.rows).toHaveCount(1)
  await expect(products.row(product.id)).toBeVisible()

  await products.filterByStatus("active")

  await expect(products.rows).toHaveCount(0)
})
```

En este spec, renombrar `product-save` exige una edición. Un campo obligatorio nuevo exige dos: una línea en el test del formulario y un valor por defecto en `createProduct`. Los tests que usan el helper comparten ese valor por defecto.

## Mantener el test legible

Cuando un test falla, quien lo revisa necesita ver qué acciones hizo y qué resultado esperaba. **DAMP**, "frases descriptivas y con significado" (*descriptive and meaningful phrases*), acepta algo de repetición cuando facilita esa lectura.

Deja en el test los pasos del comportamiento bajo prueba y las aserciones. Los helpers pueden reunir la preparación, la navegación y los locators. En el spec reescrito, cada test conserva las llamadas que muestran el comportamiento que comprueba.

Esta llamada esconde las acciones y la comprobación detrás de banderas:

```ts
await runProductScenario(page, request, {
  create: "api",
  openForm: false,
  search: true,
  filter: "draft",
  expectRows: 0,
})
```

Para reconstruir los pasos debes abrir el helper y seguir sus condiciones. Si cada escenario nuevo exige otra bandera y otro `if`, el helper puede resultar más difícil de leer que las copias. En ese caso, devuelve el código a los tests y busca qué pasos realmente cambian juntos.

## Criterios para extraer código

Antes de crear un helper, revisa tres cosas:

1. Identifica el conocimiento compartido que debería cambiar en un solo lugar. Dos líneas iguales pueden pertenecer a comportamientos distintos.
2. Separa la preparación del comportamiento bajo prueba. Conserva en el test las acciones y las aserciones que explican ese comportamiento.
3. Busca un patrón real. Dos copias pueden quedarse; una tercera es una señal para evaluar la extracción. Puedes extraer antes si los pasos forman una acción con un nombre claro.

Si el único nombre que encuentras para el helper es vago, revisa si estás reuniendo más de una idea.

## Profundiza

### KISS y YAGNI

**KISS** significa "hazlo simple" (*keep it simple*): elige la versión que se pueda leer y mantener con facilidad. **YAGNI** significa "no lo vas a necesitar" (*you are not going to need it*): implementa lo que los tests actuales necesitan.

Una bandera para un escenario que quizá pruebes algún día agrega una condición que todavía ningún test necesita. Espera a tener ese caso antes de ampliar el helper.

### Expectativas independientes de la app

El mensaje `"Price must be greater than 0."` aparece tanto en la app como en el test. La copia en el test expresa el texto que el usuario debe ver.

Si importas el mensaje desde la app, un cambio accidental altera tanto el texto mostrado como la expectativa, y el test sigue pasando. Mantén la expectativa separada del código que comprueba.

![Una expectativa independiente detecta un cambio accidental del mensaje.](/images/04-independent-expectations.es.svg)

## Práctica

1. Crea `apps/practice-shop/e2e/products/dry-practice.spec.ts` y pega el primer spec de esta lección.
2. Inicia la tienda con `pnpm shop:dev` en una terminal. En otra, ejecuta el archivo y comprueba que pasan los tres tests:

```bash
pnpm shop:e2e products/dry-practice.spec.ts
```

3. Crea un `ProductsPage` en cada test. Reemplaza `page.getByTestId("products-table")`, `products-new`, `products-search` y `products-status-filter` con el page object. Ejecuta el archivo otra vez.
4. En los tests dos y tres, reemplaza los pasos del formulario con `createProduct(request, { ... })`. Crea el producto antes de abrir la página y ejecuta el archivo. Compara el resultado con el spec reescrito.
5. Agrega al final el tipo `Values`, la tabla y el bucle de esta lección. Los imports ya están. Ejecuta el archivo y comprueba que aparecen cuatro tests más.
6. Cuenta los lugares que tendrías que editar si se renombrara `product-save`.
7. Borra el archivo cuando termines, o guárdalo para tus notas.

## Reto

Escribe un spec de movimientos de pedidos con un solo cuerpo de test y una tabla de casos. La página y la API permiten pasar de pendiente a pagado o cancelado, y de pagado a enviado o cancelado. Enviado y cancelado son estados finales.

Crea `apps/practice-shop/e2e/challenges/order-moves.spec.ts`. Usa los pedidos de la semilla: la tienda no permite crear pedidos. Cada fila necesita un pedido distinto porque los movimientos son de un solo sentido. Reserva los pedidos 1003 y 1005 para el `orders.spec.ts` existente.

Está terminado cuando:

- La tabla tiene al menos 4 filas con pedidos distintos, el botón que se debe pulsar y el estado esperado. Un bucle registra un test por fila con un título único que describe el movimiento.
- Cada test comprueba el estado nuevo en `orders-status-<id>` y que desaparecen los botones que el estado nuevo ya no permite. De pendiente a pagado, "Mark as paid" desaparece, "Cancel" permanece y "Mark as shipped" aparece. Al menos una fila llega a un estado final sin botones de acción.
- `pnpm shop:e2e challenges/order-moves.spec.ts` pasa dos veces como comandos normales separados; la preparación reinicia la semilla en cada ejecución.
- Un comentario explica por qué repetir los tests con `--repeat-each 2` o ejecutarlos con `--no-deps` contra el mismo servidor falla, y cómo conseguir un inicio limpio.

Consulta los estados iniciales en `apps/practice-shop/lib/store.ts` y los movimientos permitidos en `app/(dashboard)/orders/page.tsx`. Busca: `javascript remainder operator modulo`, `typescript array of objects type`, `playwright toHaveCount 0`.

## Piénsalo bien

1. Dos filas tienen el mismo `title` y el bucle registra un test por fila. ¿Qué pasa cuando ejecutas el archivo?

<details><summary>Respuesta</summary>

Playwright rechaza el archivo por un título de test duplicado. Cada título debe identificar el caso que representa su fila.

</details>

2. Este fragmento abrevia los pasos del formulario con un comentario. Si esos pasos se completan, las filas pueden pasar a pesar de compartir datos incorrectamente. ¿Dónde está el problema?

```ts
const values = { name: uniqueName("Valid"), sku: uniqueSku(), price: "12.50", stock: "7" }

for (const row of invalidInputs) {
  test(`the form shows an error when ${row.title}`, async ({ page }) => {
    Object.assign(values, row.change)
    // ...open the form, fill it with `values`, click save
    await expect(page.getByTestId(`product-${row.field}-error`)).toHaveText(row.message)
  })
}
```

<details><summary>Respuesta</summary>

El objeto `values` se crea una sola vez y lo comparten todos los tests. `Object.assign` lo cambia, así que cada fila conserva los fallos de las filas anteriores. La tercera fila envía un nombre malo, un SKU malo y un precio malo, pero solo comprueba el mensaje del precio, así que pasa.

Cada test debe construir sus propios valores, como hace la lección al escribir los valores por defecto y luego `...row.change` dentro del test. Además, el SKU es el mismo para todos los tests, porque se genera una sola vez.

</details>

3. Un desarrollador cambia por error el mensaje a "Name is too short." La versión A del test escribe el mensaje esperado como texto. La versión B lo importa desde la app. ¿Qué versión detecta el error y por qué?

<details><summary>Respuesta</summary>

La versión A detecta la diferencia entre el texto esperado y el mostrado. La versión B sigue pasando porque importa el mismo mensaje que muestra la app.

</details>

## Siguiente paso

En la próxima lección, "De casos de prueba a datos de prueba", conviertes los casos de prueba que ya diseñas como tester manual en una tabla de filas y un bucle.
