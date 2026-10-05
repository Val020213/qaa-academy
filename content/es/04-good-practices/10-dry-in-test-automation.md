---
title: DRY en la automatización de tests
summary: Quita el conocimiento repetido de un spec con constantes, helpers, Page Objects y tablas de datos, y mantén cada test legible.
duration: 45 min
---

## Objetivo

- Encontrar conocimiento repetido en un spec y contar lo que cuesta un cambio.
- Mover cada pieza de conocimiento a su lugar correcto: configuración, helper, fixture, Page Object o tabla de datos.
- Explicar por qué un test debe seguir siendo legible y qué significa DAMP.
- Decidir con tres preguntas cuándo quitar la repetición y cuándo dejarla.

## Un spec que se repite

En el módulo de programación aprendiste DRY (no te repitas): cada pieza de conocimiento vive en un solo lugar. Ahora aplícalo a la suite de la tienda. Aquí hay tres tests. Cada uno crea primero un producto por el formulario.

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

  await page.getByTestId("products-status-filter").selectOption("active")

  await expect(page.getByTestId(/^products-row-/)).toHaveCount(0)
})
```

Funciona. Ahora llega una solicitud de cambio: el desarrollador cambia el nombre de `product-save` a `product-submit`. Cuenta las ediciones. El id aparece en 3 tests, así que haces 3 ediciones. La siguiente solicitud agrega un campo obligatorio, "Category" (categoría). Son 3 ediciones más. Una suite con 30 tests así necesita 30 ediciones cada vez, y puedes olvidar una.

## Dónde vive cada pieza de conocimiento

El mismo conocimiento aparece una y otra vez. Cada tipo tiene su propio lugar.

**Un valor: una constante o la configuración.** La dirección de la tienda se escribe una vez, en `playwright.config.ts`, como `baseURL`. Por eso los tests escriben `page.goto("/products")` y no la dirección completa. Las credenciales viven en una constante en `e2e/lib/fixtures/api-client.ts`:

```ts
export const ADMIN = { email: "admin@qa-shop.test", password: "Admin123!", name: "Ada Admin" }
```

**Preparación repetida: `beforeEach` o un fixture.** Usa `beforeEach` para un paso que necesitan todos los tests de un archivo. Usa un fixture cuando la preparación necesita limpieza o la comparten muchos archivos. La lección 4 explica ambos.

**Creación de datos repetida: un helper de API.** `createProduct(request, overrides)` crea un producto en una sola petición. Los tests dos y tres de arriba no se preocupan por cómo se creó el producto. Solo necesitan que exista.

**Locators y acciones repetidos de una página: un Page Object.** `ProductsPage` en `e2e/lib/pages/products.page.ts` conoce los ids de la tabla, las filas y el cuadro de búsqueda. Los tests dicen `products.search(name)`.

**Datos únicos: `uniqueName` y `uniqueSku`.** Están en `e2e/lib/helpers.ts`. Todos los tests los llaman, y ninguno inventa su propia forma.

**El mismo escenario con entradas distintas: una tabla de datos y un bucle.** Aquí hay cuatro casos de validación de campos. (El servidor también comprueba que el estado sea válido y que el SKU no lo use otro producto, pero estos cuatro bastan para el ejemplo.) Escribir cuatro copias de un mismo test rompe DRY. Escribe un solo cuerpo de test y una tabla de filas. Estos valores vienen de `lib/validation.ts`, y los ids de error de `components/product-form.tsx`:

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

La parte `...row.change` copia todos los campos y luego reemplaza el de la fila. Cada fila se convierte en un test con su propio título. Una regla nueva es una fila nueva, no un test nuevo.

## El spec reescrito

Estos son los mismos tres tests después de los cambios. Solo el primer test crea un producto por el formulario, porque ese test trata del formulario. Los otros dos preparan el producto por la API.

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
})

test("the Active filter hides a draft product", async ({ page, request }) => {
  const product = await createProduct(request, { name: uniqueName("Draft"), status: "draft" })
  const products = new ProductsPage(page)
  await products.goto()
  await expect(products.row(product.id)).toBeVisible()
  await products.search(product.name)
  await expect(products.rows).toHaveCount(1)

  await products.filterByStatus("active")

  await expect(products.rows).toHaveCount(0)
})
```

Ahora cuenta otra vez. Cambiar el nombre de `product-save` es 1 edición, en el único test que trata del formulario. Un campo obligatorio nuevo son 2 ediciones: una línea en el test del formulario y un valor por defecto en `createProduct`. Con 30 tests, el costo sigue siendo 2.

## Un test se lee más de lo que se escribe

El código se escribe una vez y se lee muchas veces. Un test se lee más cuando falla. Alguien lo abre en un mal momento, quizás un viernes, y debe entender rápido qué hizo el usuario y qué salió mal.

DRY tiene un compañero: **DAMP**, "descriptive and meaningful phrases" (frases descriptivas y con sentido). Un test DAMP acepta un poco de repetición cuando eso aclara la historia. La repetición está bien cuando ayuda a quien lee. No está bien cuando solo te cuesta ediciones.

Por eso usa esta división.

- **Deja en el test:** los pasos que son el comportamiento bajo prueba, y las aserciones.
- **Esconde en helpers:** la preparación, la navegación, la creación de datos y los locators.

Mira un caso de demasiado escondite. Este test lo hace todo en una sola llamada:

```ts
await runProductScenario(page, request, {
  create: "api",
  openForm: false,
  search: true,
  filter: "draft",
  expectRows: 0,
})
```

Cuando falla, no sabes qué hizo el usuario. Debes abrir el helper, leer las banderas e imaginar los pasos. La versión legible es el tercer test de arriba. Muestra el producto, la búsqueda, el filtro y la comprobación. Léelo una vez y conoces la historia.

## Profundiza

### El costo de una abstracción equivocada

En la lección de programación "No te repitas (DRY)" viste que una abstracción equivocada cuesta más que una copia. En los tests se ve como `runProductScenario` de arriba. Empieza con dos banderas. Cada test nuevo agrega una bandera más y un `if` más. Pronto el helper es más difícil de leer que las copias que reemplazó. Si esto pasa, copia el código de vuelta en los tests y empieza de nuevo.

### Una idea equivocada: quitar toda la repetición

Un mensaje como `"Price must be greater than 0."` aparece en la aplicación y en el test. Parece repetido. No lo quites. Imagina que el test importara el mensaje desde la aplicación. Un desarrollador rompe el texto por error. La aplicación y el test cambian juntos, y el test sigue pasando. El texto del test es un segundo testigo independiente de lo que el usuario debe ver. DRY es para el conocimiento que mantienes. Lo que un test espera debe estar separado del código que comprueba.

### Un equilibrio de los bucles

Con un bucle, una fila que falla muestra un solo test fallido. Eso es bueno, si el título es claro. El título incluye la razón, como "the price is zero" (el precio es cero). Un título como `row 3` te obligaría a contar las filas de la tabla.

## Decide dónde vive

Hazte tres preguntas cuando veas repetición.

1. **¿Dónde vive este conocimiento?** Una dirección va a la configuración. Un locator va a un Page Object. Un producto va a un helper. Una lista de entradas va a una tabla de datos.
2. **¿Es preparación o es el comportamiento?** La preparación se mueve a un helper. El comportamiento se queda en el test.
3. **¿Lo he visto tres veces?** Dos copias pueden quedarse. A la tercera, extráelo.

> **Consejo:** Si no puedes nombrar el helper con una frase clara, quizás estás escondiendo más de una idea.

## Práctica

1. Crea el archivo `apps/practice-shop/e2e/products/dry-practice.spec.ts`. Pega en él el primer spec de esta lección, el repetitivo.
2. Inicia la tienda con `pnpm shop:dev` en una terminal. En una segunda terminal, ejecuta el archivo:

```bash
pnpm shop:e2e products/dry-practice.spec.ts
```

3. Los tres tests deben pasar. Anota cuánto tarda la ejecución.
4. Haz el primer cambio: crea un `ProductsPage` en cada test. Reemplaza `page.getByTestId("products-table")`, `products-new`, `products-search` y `products-status-filter` con el Page Object. Ejecuta el archivo otra vez.
5. Haz el segundo cambio: en los tests dos y tres, reemplaza los pasos del formulario con `createProduct(request, { ... })`. Recuerda crear el producto antes de abrir la página. Ejecuta el archivo otra vez.
6. Compara tu archivo con el spec reescrito de esta lección. Cuenta cuántas líneas quitaste.
7. Agrega al final de tu archivo el tipo `Values`, la tabla y el bucle de esta lección. Las importaciones ya están. Ejecuta el archivo. Deberías ver cuatro tests más.
8. Imagina que `product-save` cambia de nombre. Cuenta los lugares que debes editar en tu archivo.
9. Borra el archivo cuando termines, o guárdalo para tus notas.

## Comprueba lo que sabes

1. Nombra cuatro lugares donde puede vivir el conocimiento de los tests, en lugar de repetirse en cada test.

<details><summary>Respuesta</summary>

La configuración o una constante, un helper de API como `createProduct`, un Page Object como `ProductsPage`, y una tabla de datos con un bucle. También los fixtures y `beforeEach` para la preparación repetida.

</details>

2. ¿Dónde vive la dirección de la tienda y por qué funciona `page.goto("/products")`?

<details><summary>Respuesta</summary>

Vive en `playwright.config.ts` como `baseURL`. Playwright la agrega a una ruta que empieza con una barra.

</details>

3. ¿Qué significa DAMP?

<details><summary>Respuesta</summary>

"Descriptive and meaningful phrases" (frases descriptivas y con sentido). Significa que un test puede repetir un poco si eso aclara la historia a quien lo lee.

</details>

4. ¿Qué se queda en el test y qué va a los helpers?

<details><summary>Respuesta</summary>

El comportamiento bajo prueba y las aserciones se quedan en el test. La preparación, la navegación, la creación de datos y los locators van a los helpers.

</details>

5. Un desarrollador cambia el mensaje a "Name is too short." por error. La versión A del test escribe el mensaje esperado como texto. La versión B importa el mensaje desde el código de la aplicación. ¿Qué versión detecta el error y por qué?

<details><summary>Respuesta</summary>

La versión A lo detecta. Tiene su propia copia de lo que el usuario debe leer, así que el texto en pantalla ya no coincide. La versión B lee de la misma fuente que la aplicación, así que ambas cambian juntas y el test pasa. Lo que esperan los tests debe mantenerse independiente del código que comprueban.

</details>

6. Dos tests comparten las mismas cuatro líneas de preparación. Un compañero quiere un helper ahora mismo. Otro dice que esperes. ¿Quién tiene razón?

<details><summary>Respuesta</summary>

Depende, y ambos pueden tener razón. Dos copias son baratas, así que esperar es seguro. Una tercera copia muestra un patrón real, y entonces extraes. Pero si las cuatro líneas son un paso claro al que puedes ponerle un buen nombre, como "abrir el formulario de producto nuevo", extraer pronto está bien. No extraigas cuando el único nombre que encuentras es uno vago.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué querían decir los autores de The Pragmatic Programmer con DRY y por qué trata del conocimiento y no solo de líneas de código?**
   - Busca: `DRY principle pragmatic programmer duplication of knowledge`
   - Una buena respuesta explica: la definición original y un ejemplo de conocimiento repetido en dos formas distintas.

2. **¿Cuál es la diferencia entre DRY y DAMP en los tests y cuándo gana cada uno?**
   - Busca: `DAMP vs DRY tests descriptive and meaningful phrases`
   - Una buena respuesta explica: por qué el código de test se juzga por su legibilidad y un caso donde es mejor repetir.

3. **¿Cómo generas varios tests a partir de una tabla de datos en Playwright?**
   - Busca: `playwright parameterize tests loop test.describe`
   - Una buena respuesta explica: el patrón del bucle, cómo dar a cada test un título claro y cómo aparece una fila que falla en el reporte.

## Siguiente paso

Terminaste las buenas prácticas. En el próximo módulo, "Proyecto real", usas estas habilidades en la suite completa de la QA Shop, la ejecutas, lees un reporte y cierras un hueco de cobertura.
