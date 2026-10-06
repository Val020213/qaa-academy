---
title: Fixtures
summary: Entiende los fixtures y la limpieza, escribe un fixture propio con test.extend y juzga cuándo un fixture ayuda y cuándo esconde demasiado.
duration: 85 min
---

## Empieza con un acertijo

Lee este TypeScript simple. No es Playwright. Una función prepara una lámpara, se la entrega a un test y limpia después. El test lanza un error a propósito.

```ts
async function withLamp(use: (item: string) => Promise<void>) {
  console.log("A setup")
  await use("lamp")
  console.log("B cleanup")
}

try {
  await withLamp(async (item) => {
    console.log("C test uses", item)
    throw new Error("boom")
  })
} catch {
  console.log("D caught")
}
console.log("E end")
```

¿Qué letras se imprimen y en qué orden? ¿Está entre ellas la línea de limpieza `B`?

Luego piensa: un *fixture* (preparación reutilizable que un test pide por nombre) de Playwright se ve igual, y Playwright dice que limpia también cuando un test falla. ¿Cómo puede ser?

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Predecir el orden en que se ejecutan el setup, el test y la limpieza.
- Escribir un fixture propio con `test.extend` que crea y borra datos.
- Explicar por qué la limpieza después de `use` es más segura que la limpieza al final de un test.
- Decidir cuándo un fixture ayuda y cuándo esconde de qué trata el test.

## Qué es un fixture

Un **fixture** es algo que un test pide por nombre. Playwright lo prepara antes del test y lo quita después.

Ya usas uno. En esta línea, `page` es un fixture:

```ts
test("shows a loading message first", async ({ page }) => {
```

Escribes el nombre entre llaves. Playwright te da una página de navegador nueva y lista. Tú no la creaste.

## Los fixtures incluidos

Playwright te da estos cuatro. Pides solo los que necesitas.

- `page`: una pestaña del navegador. Cada test recibe una nueva.
- `request`: un cliente que envía peticiones HTTP al servidor, sin navegador. Lo usas para llamadas a la API.
- `context`: el perfil del navegador que es dueño de la página. Guarda las cookies. Un test recibe un contexto.
- `browser`: el programa del navegador en sí. Rara vez lo necesitas.

En la configuración de la tienda, `use.storageState` pone las cookies guardadas del administrador en el contexto. Así `page` y `request` ya tienen la sesión iniciada. La lección 6 lo explica.

## Por qué los specs importan desde lib/test.ts

Abre `apps/practice-shop/e2e/lib/test.ts`:

```ts
// Every spec imports from this file, never from "@playwright/test".
// Custom fixtures get added here later, so every spec can use them.
export { test, expect } from "@playwright/test"
export type { Page, Locator, APIRequestContext } from "@playwright/test"
```

Todos los specs importan `test` desde aquí. Esto le da al equipo un solo lugar para cambiar. Si agregas un fixture a este archivo, todos los specs lo reciben, y ningún spec necesita cambiar su importación.

## La idea en código simple: dos mitades

### De vuelta al acertijo

El TypeScript simple imprime `A setup`, `C test uses lamp`, `D caught` y `E end`. La línea `B cleanup` nunca se imprime. Cuando el test lanza el error, este viaja de vuelta por `await use(...)`, y la función se detiene ahí. Por eso, en código simple debes escribir `try ... finally` para tener una limpieza que siempre se ejecute.

Playwright hace este trabajo por ti. Llama a tu fixture y ejecuta tu test con el valor. Cuando el test falla, Playwright registra el fallo, y aun así deja que tu fixture continúe después de `use`. Así la limpieza se ejecuta. Este programa pequeño lo imita, con un ejecutor que guarda el error aparte:

```ts
type Use<T> = (value: T) => Promise<void>
const database = new Set<string>()

async function productFixture(use: Use<string>) {
  database.add("product-1")
  await use("product-1")
  database.delete("product-1")
}

async function runTest(name: string, body: (product: string) => Promise<void>) {
  let failure: unknown
  await productFixture(async (value) => {
    try {
      await body(value)
    } catch (error) {
      failure = error
    }
  })
  console.log(name, failure ? "FAILED" : "passed", "| rows left:", database.size)
}

await runTest("good test", async () => {})
await runTest("bad test", async () => {
  throw new Error("assertion failed")
})
```

Imprime:

```text
good test passed | rows left: 0
bad test FAILED | rows left: 0
```

Incluso el test que falló no deja nada atrás. Compáralo con una limpieza escrita como la última línea del cuerpo del test: esa línea nunca se alcanza cuando una línea anterior lanza un error, y el producto se queda en la tienda.

### ¿Qué pasa con dos fixtures?

Un fixture puede pedir otro fixture. ¿En qué orden esperas el setup y el teardown (desmontaje) cuando un producto necesita un usuario? Adivina, y luego lee el resultado de este código simple, donde una función contiene a la otra:

```ts
type Use<T> = (value: T) => Promise<void>

async function user(use: Use<string>) {
  console.log("setup user")
  await use("Ada")
  console.log("teardown user")
}

async function product(owner: string, use: Use<string>) {
  console.log("setup product for", owner)
  await use("lamp")
  console.log("teardown product for", owner)
}

await user(async (owner) => {
  await product(owner, async (item) => {
    console.log("test:", owner, item)
  })
})
```

Imprime:

```text
setup user
setup product for Ada
test: Ada lamp
teardown product for Ada
teardown user
```

Lo último que se prepara es lo primero que se quita. Este es el orden correcto: no puedes quitar un usuario mientras el producto todavía le pertenece. Playwright desmonta los fixtures en el mismo orden inverso.

## Un fixture propio

Muchos tests necesitan las mismas dos cosas: un producto que exista y un helper de la página de productos. Un fixture propio las entrega por nombre.

Lo construyes con `test.extend`. Recibe un objeto. Cada clave es el nombre de un fixture. Cada valor es una función.

La función hace tres cosas: preparar, llamar a `use` y limpiar. La llamada `use(value)` le entrega el valor al test. Cuando el test termina, se ejecuta el código que viene después de `use`.

Aquí hay un ejemplo completo. Crea dos fixtures: `productsPage` y `product`.

```ts
import { test as base } from "../test"
import { createProduct } from "./api-client"
import type { Product } from "./api-client"
import { ProductsPage } from "../pages/products.page"

type ShopFixtures = {
  productsPage: ProductsPage
  product: Product
}

export const test = base.extend<ShopFixtures>({
  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page))
  },

  product: async ({ request }, use) => {
    const product = await createProduct(request)
    await use(product)
    // Cleanup. The test may have deleted the product already,
    // so we do not check the status here.
    await request.delete(`/api/products/${product.id}`)
  },
})

export { expect } from "../test"
```

Léelo paso a paso.

- `base` es el `test` normal de `lib/test.ts`.
- `extend<ShopFixtures>` le dice a TypeScript los nombres y los tipos de los fixtures nuevos.
- El fixture `product` pide `request`. Los fixtures pueden usar otros fixtures.
- `createProduct` crea un producto por la API con un nombre y un SKU únicos.
- Después del test, la última línea borra el producto.

Ahora un spec puede usar los dos:

```ts
import { expect, test } from "../lib/fixtures/products-test"

test("a product made by a fixture is in the list", async ({ productsPage, product }) => {
  await productsPage.goto()

  await expect(productsPage.row(product.id)).toBeVisible()
  await expect(productsPage.row(product.id)).toContainText(product.name)
})
```

El cuerpo del test no tiene líneas de setup. Los nombres entre llaves dicen lo que necesita.

> **Nota:** Un fixture se ejecuta solo cuando un test lo pide. Un test que no lista `product` no crea uno.

Comprueba esa afirmación con un experimento. Pon `console.log("fixture: creating a product")` antes de la línea de `createProduct`. Escribe dos tests en el mismo archivo: uno que lista `product` y otro que lista solo `page`. ¿Qué esperas ver en la terminal después de una ejecución? Deberías ver la línea una sola vez, solo para el primer test.

## Fixtures contra beforeEach

`beforeEach` ejecuta código antes de cada test de un grupo. También funciona, pero en la mayoría de los casos los fixtures son mejores.

| Punto | `beforeEach` | Fixture |
| --- | --- | --- |
| Limpieza | Un `afterEach` aparte, lejos del setup | La misma función, después de `use` |
| Se ejecuta para | Todos los tests del grupo | Solo los tests que lo piden |
| Compartir | Variables fuera del test | Un valor con tipo entre llaves |
| Reutilizar en otros archivos | Difícil | Importar `test` |

Usa `beforeEach` para un paso simple que necesitan todos los tests de un archivo, como abrir una página. Usa un fixture para datos o helpers que necesitan limpieza o que comparten muchos archivos.

La herramienta más simple que hace el trabajo es la mejor. Esto es **KISS**, "Keep It Simple" (mantenlo simple). No escribas un fixture para un test que necesita una línea de setup.

## Profundiza

### Por qué un fixture tiene dos mitades

Una función fixture hace algo raro: se detiene en el medio. Corre hasta `await use(value)`, espera ahí y luego sigue. Puedes ver la idea en TypeScript simple, sin Playwright:

```ts
async function productFixture(use: (value: string) => Promise<void>) {
  console.log("1 setup")
  await use("a product")
  console.log("3 cleanup")
}

await productFixture(async (value) => {
  console.log("2 the test uses:", value)
})
```

Imprime `1 setup`, luego `2 the test uses: a product`, luego `3 cleanup`. Playwright hace lo mismo. Llama a tu fixture, y cuando tu código llega a `use`, Playwright ejecuta el test con el valor. Cuando el test termina, Playwright deja que tu función termine. Ejecuta la limpieza también cuando el test falla, así que un test fallido no deja datos atrás.

### Una idea equivocada común: un fixture se ejecuta antes de cada test

Los principiantes leen `test.extend` y piensan que cada test recibe cada fixture. No es así. Un fixture se crea solo para un test que lo nombra. Mira estos dos tests:

```ts
test("asks for a product", async ({ page, product }) => {
  await page.goto("/products")
  await expect(page.getByTestId(`products-row-${product.id}`)).toBeVisible()
})

test("does not ask for a product", async ({ page }) => {
  await page.goto("/products")
  await expect(page.getByTestId("products-table")).toBeVisible()
})
```

El segundo test no crea ningún producto, porque no lista `product` entre las llaves. Cada test que pide `product` además recibe su propio producto nuevo. Dos tests nunca comparten uno.

### Cómo aparece en el trabajo de QA

Mira `products.spec.ts`. La línea `const products = new ProductsPage(page)` está escrita en los 7 tests. Eso es repetición del mismo conocimiento: cómo construir el helper de la página. El fixture `productsPage` de esta lección lo escribe una sola vez, y cada test solo pide `productsPage`. Esta es la idea llamada DRY, del módulo de programación.

### Cuándo no usar un fixture

Un fixture está mal cuando esconde algo de lo que trata el test. Imagina un fixture llamado `lowStockProduct`. El test lee `product.stock`, pero el número 3 está escondido dentro del fixture. Quien lee debe abrir otro archivo para entender el test. Si el valor importa para el comportamiento, escríbelo en el test con `createProduct(request, { stock: 3 })`. Usa fixtures para el setup que es igual en todas partes, y deja visibles los valores importantes.

Un fixture también debe tener **un solo trabajo**. Un fixture que crea un producto, un cliente, un pedido y inicia sesión con un usuario es difícil de nombrar y difícil de reutilizar. Cuatro fixtures pequeños que hacen cada uno una sola cosa son fáciles de combinar.

## Práctica

1. Abre `apps/practice-shop/e2e/lib/test.ts` y léelo.
2. Crea el archivo `apps/practice-shop/e2e/lib/fixtures/products-test.ts`. Copia el código del fixture de esta lección.
3. Crea el archivo `apps/practice-shop/e2e/products/fixture-practice.spec.ts`. Copia el código del spec de esta lección.
4. Inicia la tienda con `pnpm shop:dev` en una terminal.
5. En una segunda terminal, ejecuta tu spec:

```bash
pnpm shop:e2e products/fixture-practice.spec.ts
```

6. El test debe pasar. Ejecútalo una segunda vez para comprobar que es independiente.
7. Agrega un segundo test en el mismo archivo. Usa solo `{ productsPage }` y comprueba que `productsPage.newButton` es visible después de `goto()`.
8. Cuando termines, borra los dos archivos, o consérvalos para tus propias notas.

## Reto

Escribe un fixture que le dé a un test una página con la sesión iniciada como viewer, el usuario que solo puede leer. Luego úsalo para comprobar el hueco "viewer role" de `COVERAGE.md`: un viewer no ve los botones New, Edit ni Delete.

Crea estos archivos: `apps/practice-shop/e2e/challenges/viewer-test.ts` para el fixture y `apps/practice-shop/e2e/challenges/viewer-role.spec.ts` para el spec.

La cuenta viewer está en `e2e/lib/fixtures/api-client.ts`. Cada test empieza con la sesión iniciada como administrador, así que tu fixture debe cambiar eso solo para su propio test.

Está terminado cuando:

- El fixture se llama `viewerPage`, extiende el `test` de `lib/test.ts` y tiene un comentario corto que dice lo que hace.
- Un test que usa `viewerPage` muestra que el elemento `user-role` dice `viewer`, que `products-new` no existe, y que el botón de borrar de un producto que creaste tú mismo no existe.
- Un segundo test en el mismo archivo no pide `viewerPage`, y aun así muestra al administrador: `user-role` dice `admin` y `products-new` es visible.
- Ejecutaste el archivo dos veces, con `pnpm shop:e2e challenges/viewer-role.spec.ts`, y las dos ejecuciones pasaron. Los demás archivos spec siguen pasando, porque ningún test cerró la sesión del administrador.

Vas a necesitar algo que esta lección no enseñó: cómo reemplazar al usuario con sesión iniciada dentro de un solo test, y cómo se comparten (o no) las cookies entre `page` y el fixture `request`. Busca: `playwright context clearCookies`, `playwright page.request shares cookies with context`. Lee la página de Playwright sobre fixtures como lo haría un ingeniero: encuentra la firma de `test.extend`, copia el ejemplo más pequeño y mira la parte sobre teardown.

> **Consejo:** Puedes pedirle ayuda a un asistente de IA con este reto. Ejecuta cada línea que te dé, y explica cada una con tus propias palabras antes de conservarla. Si no puedes explicar una línea, no es tuya.

## Piénsalo bien

1. Predice la salida de este código simple, y di por qué la última línea de setup es la primera entre las líneas de teardown.

```ts
type Use<T> = (value: T) => Promise<void>

async function user(use: Use<string>) {
  console.log("setup user")
  await use("Ada")
  console.log("teardown user")
}

async function product(owner: string, use: Use<string>) {
  console.log("setup product for", owner)
  await use("lamp")
  console.log("teardown product for", owner)
}

await user(async (owner) => {
  await product(owner, async (item) => {
    console.log("test:", owner, item)
  })
})
```

<details><summary>Respuesta</summary>

Imprime `setup user`, `setup product for Ada`, `test: Ada lamp`, `teardown product for Ada`, `teardown user`. El producto depende del usuario, así que se quita primero. Si el usuario se quitara primero, el producto apuntaría a algo que ya no existe, y la limpieza del producto podría fallar. Un fixture que depende de otro siempre se desmonta antes que aquel del que depende.

</details>

2. Este fixture tiene un bug. Un test que borra el producto por sí mismo falla, aunque el borrado funcionó. Encuentra el bug.

```ts
product: async ({ request }, use) => {
  const product = await createProduct(request)
  await use(product)
  await deleteProduct(request, product.id)
},
```

<details><summary>Respuesta</summary>

`deleteProduct` comprueba que el estado sea `204`. Si el test ya borró el producto, el segundo borrado devuelve `404`, y la comprobación falla durante la limpieza. Entonces el test se reporta como fallido. La lección usa `request.delete(...)` sin comprobación, porque el producto puede haber desaparecido ya.

</details>

3. Un archivo tiene tres tests que necesitan un producto. La versión uno usa `test.beforeEach` con una variable `let product`. La versión dos usa un fixture `product`. Las dos funcionan. ¿Cuál eliges para este archivo y qué te haría cambiar de opinión?

<details><summary>Respuesta</summary>

Para un archivo y tres tests, `beforeEach` es simple y suficiente, y sigue KISS. El fixture empieza a ganar cuando un segundo archivo necesita el mismo producto, cuando la limpieza debe ir emparejada con el setup, o cuando algunos tests del archivo no necesitan el producto. La elección depende de en cuántos lugares se usa el setup, y de si necesita limpieza.

</details>

4. Hoy la tienda deja borrar cualquier producto. El equipo de producto agrega una regla: un producto que aparece en un pedido no se puede borrar, y el servidor responde `409`. El fixture `product` de esta lección ignora el estado de su petición de limpieza. ¿Qué se rompe y qué esconde el fixture?

<details><summary>Respuesta</summary>

Nada se pone en rojo. La limpieza envía un borrado, el servidor lo rechaza y el fixture no mira la respuesta. El producto se queda en la tienda después de cada ejecución, y los datos se llenan poco a poco de sobras. Ignorar el estado fue una buena decisión para el caso "el test ya lo borró", pero también esconde fallos reales. Un fixture mejor acepta `204` y `404` y falla con cualquier otro estado. El cambio en el requisito muestra el costo de una limpieza silenciosa.

</details>

5. Explícale a un compañero, en tres frases y sin la palabra "antes", qué es un fixture y por qué es mejor que copiar líneas de setup en cada test.

<details><summary>Respuesta</summary>

Una buena respuesta dice: un fixture es una pieza de setup con nombre que un test pide en sus parámetros. Playwright lo crea cuando empieza el test y lo quita cuando termina, incluso si el test falla. Copiar el setup en cada test repite el conocimiento y olvida la limpieza. Un fixture mantiene el setup y la limpieza en una sola función, así que no pueden separarse.

</details>

6. Un test pide `product`, pero la API está caída cuando se ejecuta el fixture, y `createProduct` lanza un error. ¿Qué pasa con el cuerpo del test? ¿Se ejecuta la línea de limpieza después de `use`?

<details><summary>Respuesta</summary>

El cuerpo del test nunca se ejecuta. El test se reporta como fallido, con un error del setup del fixture. La línea de limpieza después de `use` tampoco se ejecuta, porque la función se detuvo antes de llegar a `use`. Aquí está bien: no se creó nada, así que no hay nada que quitar. El caso límite importa cuando un fixture crea dos cosas: si la segunda creación falla, la primera queda abandonada, y tú debes manejarlo con `try ... catch`.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es un fixture con alcance de worker en Playwright y en qué se diferencia de uno con alcance de test?**
   - Busca: `playwright fixtures scope worker test`
   - Pruébalo: en un spec de prueba, escribe un fixture que imprima `created` y luego llame a `use(1)`, y dale la opción `{ scope: "worker" }`. La documentación muestra cómo declarar fixtures de worker en `test.extend`. Usa el fixture en dos tests y ejecuta el archivo. Cuenta cuántas veces se imprime `created`. Luego quita la opción `scope` y cuenta otra vez.
   - Una buena respuesta explica: con qué frecuencia se crea cada tipo, y un ejemplo donde el alcance de worker es útil.

2. **¿Qué son el setup y el teardown en testing, y por qué es importante la limpieza?**
   - Busca: `test fixture setup teardown xUnit pattern`
   - Pruébalo: escribe un test que cree un producto con `createProduct` y no tenga limpieza. Ejecútalo tres veces. Abre `/api/products` en el navegador y cuenta cuántos productos sobrantes hay.
   - Una buena respuesta explica: qué hace cada paso, y qué puede salir mal cuando un test deja datos atrás.

3. **¿Qué es un fixture automático en Playwright?**
   - Busca: `playwright automatic fixtures auto true`
   - Pruébalo: escribe un fixture con `{ auto: true }` que imprima el título del test cuando empieza cada test. Ejecuta dos tests que no lo listan, y mira si aun así se imprime.
   - Una buena respuesta explica: en qué se diferencia de un fixture normal, y un caso donde encaja, como guardar logs cuando un test falla.

## Siguiente paso

En la próxima lección lees el Page Object de la tienda y aprendes cuándo construir uno.
