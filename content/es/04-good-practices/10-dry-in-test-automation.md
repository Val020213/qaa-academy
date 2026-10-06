---
title: DRY en la automatización de tests
summary: Quita el conocimiento repetido de un spec con constantes, helpers, page objects y tablas de datos, y mantén cada test legible.
duration: 80 min
---

## Empieza con un acertijo

Tu equipo tiene 30 tests que llenan el formulario de producto. Dos compañeros discuten.

Ana quiere que cada test escriba los 8 pasos del formulario, para que cada test muestre lo que hizo el usuario.

Ben quiere un solo *helper* (función de ayuda), `fillEverything(page, flags)`, con 6 banderas, para que ningún paso se escriba dos veces.

El próximo mes el formulario recibe un campo obligatorio nuevo. Más tarde, un test falla a las 3 a.m. y tienes que averiguar por qué. Cuenta las ediciones para el campo nuevo a la manera de Ana y a la manera de Ben. Luego pregunta qué test es más fácil de leer a las 3 a.m. ¿Hay una tercera manera que funcione bien en los dos casos?

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Contar lo que cuesta un cambio en un *spec* (archivo de tests) y encontrar el conocimiento repetido que hay detrás.
- Decidir dónde vive cada pieza de conocimiento: configuración, helper, *fixture* (preparación reutilizable), *page object* (clase que agrupa lo de una página) o tabla de datos.
- Explicar por qué un test debe seguir siendo legible, y qué significa DAMP.
- Decidir con tres preguntas cuándo quitar una repetición y cuándo dejarla.

## Un spec que se repite

En el módulo de programación aprendiste DRY (no te repitas): cada pieza de conocimiento vive en un solo lugar. Ahora aplícalo a la suite de la tienda. Aquí hay tres tests. Cada uno crea primero un producto con el formulario.

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

Funciona. Antes de seguir, responde en tu cabeza: ¿qué es lo primero que cambiarías aquí, y por qué? Ahora llega una petición de cambio: el desarrollador renombra `product-save` a `product-submit`. Cuenta las ediciones. El id aparece en 3 tests, así que haces 3 ediciones. La siguiente petición agrega un campo obligatorio, "Category" (Categoría). Son 3 ediciones más. Una suite con 30 tests así necesita 30 ediciones cada vez, y puede que se te pase una.

## Dónde vive cada pieza de conocimiento

El mismo conocimiento aparece una y otra vez. Cada tipo tiene su propio lugar.

**Un valor: una constante o la configuración.** La dirección de la tienda se escribe una sola vez, en `playwright.config.ts`, como `baseURL`. Por eso los tests escriben `page.goto("/products")` y no la dirección completa. Las credenciales viven en una constante en `e2e/lib/fixtures/api-client.ts`:

```ts
export const ADMIN = { email: "admin@qa-shop.test", password: "Admin123!", name: "Ada Admin" }
```

**Preparación repetida: `beforeEach` o un fixture.** Usa `beforeEach` para un paso que necesitan todos los tests de un archivo. Usa un fixture cuando la preparación necesita limpieza o la comparten muchos archivos. La lección 4 explica los dos.

**Creación de datos repetida: un helper de API.** `createProduct(request, overrides)` crea un producto en una sola petición. Los tests dos y tres de arriba no se preocupan por cómo se hizo el producto. Solo necesitan que exista.

**Locators y acciones repetidos de una página: un page object.** `ProductsPage`, en `e2e/lib/pages/products.page.ts`, conoce los ids de la tabla, las filas y el cuadro de búsqueda. Los tests dicen `products.search(name)`.

**Datos únicos: `uniqueName` y `uniqueSku`.** Están en `e2e/lib/helpers.ts`. Todos los tests los llaman, y ninguno inventa su propia forma.

**El mismo escenario con entradas distintas: una tabla de datos y un bucle.** Aquí hay cuatro casos de validación de campos. (El servidor también comprueba que el estado sea válido y que el SKU no lo use otro producto, pero estos cuatro bastan para el ejemplo.) Escribir cuatro copias de un mismo test rompe DRY. Escribe un solo cuerpo de test y una tabla de filas. Estos valores vienen de `lib/validation.ts`, y los ids de error vienen de `components/product-form.tsx`:

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

Aquí están los mismos tres tests después de los cambios. Solo el primer test crea un producto con el formulario, porque ese test trata del formulario. Los otros dos preparan el producto por la API.

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

Ahora cuenta otra vez. Renombrar `product-save` es 1 edición, en el único test sobre el formulario. Un campo obligatorio nuevo son 2 ediciones: una línea en el test del formulario y un valor por defecto en `createProduct`. Con 30 tests, el costo sigue siendo 2.

## Un test se lee más de lo que se escribe

El código se escribe una vez y se lee muchas veces. Un test se lee más cuando falla. Alguien lo abre en un mal momento, quizá un viernes, y necesita entender rápido qué hizo el usuario y qué salió mal.

DRY tiene un compañero: **DAMP**, "frases descriptivas y con significado" (*descriptive and meaningful phrases*). Un test DAMP acepta un poco de repetición cuando eso aclara la historia. La repetición está bien cuando ayuda a quien lee. No está bien cuando solo te cuesta ediciones.

Así que usa esta división.

- **Deja en el test:** los pasos que son el comportamiento bajo prueba, y las aserciones.
- **Esconde en helpers:** la preparación, la navegación, la creación de datos y los locators.

Mira un ejemplo de demasiado escondite. Este test lo hace todo en una sola llamada:

```ts
await runProductScenario(page, request, {
  create: "api",
  openForm: false,
  search: true,
  filter: "draft",
  expectRows: 0,
})
```

Cuando falla, no sabes qué hizo el usuario. Tienes que abrir el helper, leer las banderas e imaginar los pasos. La versión legible es el tercer test de arriba. Muestra el producto, la búsqueda, el filtro y la comprobación. Léelo una vez y conoces la historia.

### De vuelta al acertijo

La tercera manera es dividir según lo que cambia junto. Los pasos del formulario cambian juntos, así que viven en un solo lugar: el helper `createProduct` para los tests que solo necesitan un producto, y un test del formulario para el formulario mismo. El comportamiento de cada test se queda en el test, en pasos simples: buscar, filtrar, comprobar.

La manera de Ana cuesta 30 ediciones por el campo nuevo. La manera de Ben cuesta una edición, pero a las 3 a.m. abres un helper y lees seis banderas para adivinar qué hizo el usuario. El spec reescrito cuesta dos ediciones y cada test sigue leyéndose como una historia corta. Quita la repetición de conocimiento que cambia junto. Conserva la repetición que explica la historia.

## Profundiza

### El costo de una abstracción equivocada

En la lección de programación "No te repitas (DRY)", viste que una abstracción equivocada cuesta más que una copia. En los tests se ve como `runProductScenario` de arriba. Empieza con dos banderas. Cada test nuevo agrega una bandera más y un `if` más. Pronto el helper es más difícil de leer que las copias que reemplazó. Si pasa esto, copia el código de vuelta a los tests y empieza de nuevo.

### El contrapeso: KISS y YAGNI

DRY empuja hacia más helpers. Otras dos ideas empujan de vuelta. **KISS** significa "hazlo simple" (*keep it simple*): la versión sencilla que cualquiera puede leer es mejor que la ingeniosa. **YAGNI** significa "no lo vas a necesitar" (*you are not going to need it*): no construyas para una necesidad que solo imaginas. Un helper con una bandera para "quizá algún día probemos esto" rompe YAGNI. Escribe el helper cuando la tercera copia sea real.

### Una idea equivocada: quitar toda la repetición

Un mensaje como `"Price must be greater than 0."` aparece en la app y en el test. Parece repetido. No lo quites. Imagina que el test importara el mensaje desde la app. Un desarrollador rompe el texto por error. La app y el test cambian juntos, y el test sigue pasando. El texto del test es un segundo testigo, independiente, de lo que el usuario debe ver. DRY es para el conocimiento que mantienes. Una expectativa de un test está hecha para estar separada del código que comprueba.

### Un costo y un beneficio de los bucles

Con un bucle, una fila que falla muestra un solo test que falla. Eso es bueno, si el título es claro. El título incluye la razón, como "the price is zero". Un título como `row 3` te obligaría a contar la tabla.

## Decide dónde vive

Hazte tres preguntas cuando veas repetición.

1. **¿Dónde vive este conocimiento?** Una dirección va a la configuración. Un locator va a un page object. Un producto va a un helper. Una lista de entradas va a una tabla de datos.
2. **¿Es preparación o es el comportamiento?** La preparación se mueve a un helper. El comportamiento se queda en el test.
3. **¿Lo he visto tres veces?** Dos copias pueden quedarse. A la tercera, extráelo.

> **Consejo:** Si no puedes nombrar el helper con una frase clara, quizá estás escondiendo más de una idea.

## Práctica

1. Crea el archivo `apps/practice-shop/e2e/products/dry-practice.spec.ts`. Pega en él el primer spec de esta lección, el repetitivo.
2. Inicia la tienda con `pnpm shop:dev` en una terminal. En una segunda terminal, ejecuta el archivo:

```bash
pnpm shop:e2e products/dry-practice.spec.ts
```

3. Los tres tests deben pasar. Anota cuánto tarda la ejecución.
4. Haz el primer cambio: crea un `ProductsPage` en cada test. Reemplaza `page.getByTestId("products-table")`, `products-new`, `products-search` y `products-status-filter` con el page object. Ejecuta el archivo otra vez.
5. Haz el segundo cambio: en los tests dos y tres, reemplaza los pasos del formulario con `createProduct(request, { ... })`. Recuerda crear el producto antes de abrir la página. Ejecuta el archivo otra vez.
6. Compara tu archivo con el spec reescrito de esta lección. Cuenta cuántas líneas quitaste.
7. Agrega al final de tu archivo el tipo `Values`, la tabla y el bucle de esta lección. Los imports ya están. Ejecuta el archivo. Deberías ver cuatro tests más.
8. Imagina que `product-save` se renombra. Cuenta los lugares que tendrías que editar en tu archivo.
9. Borra el archivo cuando termines, o guárdalo para tus notas.

## Reto

Instrucciones: la página de pedidos deja que un administrador mueva un pedido de un estado al siguiente. Las reglas son las mismas en la página y en la API: un pedido pendiente puede pasar a pagado o cancelado, un pedido pagado puede pasar a enviado o cancelado, y un pedido enviado o cancelado es final. Escribe un spec para estos movimientos con un solo cuerpo de test y una sola tabla de casos, no una copia por caso.

Crea el archivo `apps/practice-shop/e2e/challenges/order-moves.spec.ts`. La tienda no tiene forma de crear un pedido, así que debes usar los pedidos de la semilla. Un movimiento es de un solo sentido, así que cada fila de tu tabla necesita su propio pedido. El `orders.spec.ts` existente ya usa los pedidos 1003 y 1005. No uses esos dos.

Está terminado cuando:

- La tabla tiene al menos 4 filas, y cada fila nombra un pedido distinto de la semilla, el botón al que hay que hacer clic y el estado que debe mostrar después.
- Un bucle crea un test por fila, y cada título dice el movimiento, como "a paid order can be marked as shipped". No hay dos títulos iguales.
- Cada test comprueba el estado nuevo en `orders-status-<id>` y que los botones que el estado nuevo ya no permite desaparecieron. Por ejemplo, después de pendiente a pagado, "Mark as paid" ya no está, pero "Cancel" se queda y "Mark as shipped" aparece.
- Al menos una fila cubre un estado final: el pedido no tiene ningún botón de acción.
- `pnpm shop:e2e challenges/order-moves.spec.ts` pasa. Un comentario en el archivo explica por qué falla ejecutarlo con `--repeat-each 2` (o con `--no-deps`) contra el mismo servidor, y cómo conseguir un inicio limpio. Un segundo comando normal pasa, porque la preparación reinicia la semilla.

Vas a necesitar algo que esta lección no enseñó: cómo averiguar qué pedido de la semilla tiene qué estado, desde el código de la semilla en `apps/practice-shop/lib/store.ts`, y qué movimientos son legales, desde `app/(dashboard)/orders/page.tsx`. Busca: `javascript remainder operator modulo`, `typescript array of objects type`, `playwright toHaveCount 0`.

## Piénsalo bien

1. **Predice.** Dos filas de tu tabla de datos tienen el mismo `title`. El bucle crea un test por cada fila. ¿Qué pasa cuando ejecutas el archivo, y qué te enseña eso sobre la tabla?

<details><summary>Respuesta</summary>

Playwright se niega a ejecutar el archivo y reporta un título de test duplicado. No ejecuta uno de ellos en silencio. Es una protección útil. Cada fila debe decir algo distinto, porque un título igual significa que dos filas probablemente prueban lo mismo. Si las filas de verdad son distintas, la diferencia debe estar en el título.

</details>

2. **Encuentra el bug.** Esta versión del bucle de la lección se ejecuta, y todas las filas pasan. ¿Por qué sigue estando mal?

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

El objeto `values` se crea una sola vez y lo comparten todos los tests. `Object.assign` lo cambia, así que cada fila conserva los fallos de las filas anteriores. La tercera fila envía un nombre malo, un SKU malo y un precio malo, pero solo comprueba el mensaje del precio, así que pasa. Ejecutada sola, con `--grep`, la misma fila envía solo el fallo del precio, así que el resultado depende de qué tests corrieron antes. Cada test debe construir sus propios valores, como hace la lección con `{ ...base, ...row.change }` dentro del test. Además, el SKU es el mismo para todos los tests, porque se genera una sola vez.

</details>

3. **Dos versiones.** Un desarrollador cambia el mensaje a "Name is too short." por error. La versión A del test escribe el mensaje esperado como texto. La versión B importa el mensaje desde el código de la app. ¿Qué versión atrapa el error, y por qué?

<details><summary>Respuesta</summary>

La versión A lo atrapa. Tiene su propia copia de lo que el usuario debería leer, así que el texto en pantalla ya no coincide. La versión B lee la misma fuente que la app, así que los dos cambian juntos y el test pasa. Las expectativas de los tests deben seguir siendo independientes del código que comprueban.

</details>

4. **Qué se rompe si.** El formulario recibe un campo obligatorio nuevo, "Category". Cuenta las ediciones en el primer spec repetitivo, en el spec reescrito y en el spec con tabla de datos. ¿Qué necesita el spec con tabla además del helper?

<details><summary>Respuesta</summary>

El spec repetitivo necesita 3 ediciones, una por test. El spec reescrito necesita 2: una línea en el test del formulario y un valor por defecto en `createProduct`. El spec con tabla de datos llena el formulario de la misma manera que el test del formulario, así que necesita la misma línea, y también necesita una fila nueva si "Category" tiene su propia regla. Una regla nueva es una fila nueva, no un test nuevo. El costo se mantiene pequeño porque el conocimiento está en pocos lugares.

</details>

5. **Explícalo.** Explica la diferencia entre DRY y DAMP a un compañero en tres frases. No uses la palabra "repetir" ni "repetición".

<details><summary>Respuesta</summary>

Una buena respuesta: "DRY dice que una pieza de conocimiento debe vivir en un solo lugar, para que un cambio se haga una vez. DAMP dice que un test debe leerse como una historia clara, aunque algunas líneas se vean iguales en dos tests. Uso DRY para cosas como locators y creación de datos, y DAMP para los pasos y las comprobaciones que cuentan lo que hace el usuario." La idea clave es que ambos tratan del costo: DRY baja el costo de cambiar, y DAMP baja el costo de leer.

</details>

6. **Criterio.** Dos tests comparten las mismas cuatro líneas de preparación. Un compañero quiere un helper ahora mismo. Otro dice que esperes. ¿Quién tiene razón?

<details><summary>Respuesta</summary>

Depende, y los dos pueden tener razón. Dos copias son baratas, así que esperar es seguro. Una tercera copia muestra un patrón real, y entonces extraes. Pero si las cuatro líneas son un paso claro al que puedes ponerle un buen nombre, como "abrir el formulario de producto nuevo", extraer pronto está bien. No extraigas cuando el único nombre que encuentras es uno vago, y no construyas para una necesidad que solo imaginas.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué querían decir los autores de The Pragmatic Programmer con DRY, y por qué trata del conocimiento y no solo de las líneas de código?**
   - Busca: `DRY principle pragmatic programmer duplication of knowledge`
   - Pruébalo: en PowerShell, ejecuta `Get-ChildItem apps/practice-shop -Recurse -Include *.ts,*.tsx,*.md | Select-String "Admin123"`. Escribe qué archivo es el único hogar del conocimiento, qué archivos tienen una copia, y si cada copia es un error.
   - Una buena respuesta explica: la definición original, y un ejemplo de conocimiento repetido en dos formas distintas.

2. **¿Cuál es la diferencia entre DRY y DAMP en los tests, y cuándo gana cada uno?**
   - Busca: `DAMP vs DRY tests descriptive and meaningful phrases`
   - Pruébalo: toma la versión escondida en un helper `runProductScenario(...)` de esta lección y escribe el mismo test con pasos simples. Cuenta las líneas. Luego muestra ambos a un amigo durante 30 segundos cada uno, y pregúntale qué hace el test.
   - Una buena respuesta explica: por qué el código de los tests se juzga por su legibilidad, y un caso donde la repetición es mejor.

3. **¿Cómo generas varios tests a partir de una tabla de datos en Playwright?**
   - Busca: `playwright parameterize tests loop test.describe`
   - Pruébalo: en tu `dry-practice.spec.ts`, agrega un `test.describe` alrededor del bucle y ejecuta el archivo. Luego cambia una fila para que pase cuando debería fallar, y mira cómo el reporte nombra la fila que falla.
   - Una buena respuesta explica: el patrón del bucle, cómo darle a cada test un título claro, y cómo aparece en el reporte una fila que falla.

## Siguiente paso

En la próxima lección, "De casos de prueba a datos de prueba", conviertes los casos de prueba que ya diseñas como tester manual en una tabla de filas y un bucle.
