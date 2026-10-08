---
title: Fixtures
duration: 65 min
---

## Objetivo

Crea fixtures que entregan datos y helpers a los tests y reúnen la preparación y la limpieza en una función.

- Seguir el orden del setup, el test y el teardown.
- Escribir un fixture propio con `test.extend` que crea y borra datos.
- Distinguir un fixture de `beforeEach`.
- Reconocer cuándo un fixture esconde valores que el test necesita mostrar.

## Fixtures incluidos

Un **fixture** es un valor que un test pide por nombre. El runner de Playwright prepara los recursos que necesita y se encarga de su cierre. Ya usas `page`:

```ts
test("shows a loading message first", async ({ page }) => {
```

El nombre entre llaves indica qué fixture necesita el test. Playwright incluye estos cuatro:

- `page`: una pestaña del navegador. Cada test recibe una nueva.
- `request`: un cliente que envía peticiones HTTP al servidor, sin navegador. Lo usas para llamadas a la API.
- `context`: el contexto aislado del navegador que es dueño de la página. Guarda las cookies. Cada test recibe uno nuevo.
- `browser`: el programa del navegador en sí. Rara vez lo necesitas.

En la configuración de la tienda, `use.storageState` carga las cookies guardadas del administrador. Así `page` y `request` ya tienen la sesión iniciada.

## La importación común

Abre `apps/practice-shop/e2e/lib/test.ts`:

```ts
// Every spec imports from this file, never from "@playwright/test".
// Custom fixtures get added here later, so every spec can use them.
export { test, expect } from "@playwright/test"
export type { Page, Locator, APIRequestContext } from "@playwright/test"
```

Los specs importan `test` desde este archivo. Si el equipo agrega fixtures al `test` que exporta, los specs pueden usarlos sin cambiar su importación.

## Preparación y limpieza

La preparación, o **setup**, va antes de entregar el valor al test. La limpieza, o **teardown**, va después. En una función async común, un error puede impedir que se alcance la limpieza:

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

Node.js imprime `A setup`, `C test uses lamp`, `D caught` y `E end`. El error rechaza la promesa de `use`, así que `await use("lamp")` lanza el error y la función termina sin imprimir `B cleanup`. Para ejecutar la limpieza en ese caso, necesitas `try ... finally`.

El runner de Playwright mantiene pendiente `await use(value)` mientras el test usa el valor. Cuando termina el test, el runner permite que el fixture continúe con la limpieza, incluso si registró un fallo del test.

![El runner resuelve la promesa de use al terminar el test y reanuda la limpieza del fixture.](/images/04-fixture-lifetime.es.svg)

Este programa imita esa separación: guarda el error del test sin interrumpir el fixture.

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

En ambos casos se borra el producto. Si el borrado fuera la última línea del cuerpo del test, un error anterior impediría ejecutarlo.

### Dependencias entre fixtures

Un fixture puede pedir otro fixture. El runner prepara primero la dependencia y la desmonta después del fixture que la usa. Este código muestra el orden con un producto que depende de un usuario:

![La preparación sigue las dependencias; la limpieza va en orden inverso.](/images/04-fixture-dependencies.es.svg)

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

El producto se limpia primero para que su limpieza todavía pueda usar al usuario.

## Un fixture propio

`test.extend` recibe un objeto con los nombres y las funciones de los fixtures nuevos. Cada función prepara un valor, lo entrega con `use(value)` y espera en `await use(value)` hasta que puede limpiar.

Este ejemplo crea `productsPage`, un helper de la página de productos, y `product`, un producto preparado por la API:

```ts
import { test as base, expect } from "../test"
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
    // Accept an already-deleted product; other cleanup failures must fail.
    const response = await request.delete(`/api/products/${product.id}`)
    expect([204, 404]).toContain(response.status())
  },
})

export { expect } from "../test"
```

- `base` es el `test` de `lib/test.ts`.
- `extend<ShopFixtures>` le indica al verificador de tipos los nombres y los tipos de los fixtures nuevos.
- `productsPage` pide `page` para construir el helper.
- `product` pide `request` para llamar a `createProduct`, que genera un nombre con sufijo aleatorio y un SKU con el contador del worker.
- Después de `await use(product)`, el fixture envía la petición de borrado. Acepta `204` si lo borró y `404` si el test ya lo había borrado; cualquier otro estado hace fallar la limpieza.

El spec importa el `test` extendido y pide los dos valores:

```ts
import { expect, test } from "../lib/fixtures/products-test"

test("a product made by a fixture is in the list", async ({ productsPage, product }) => {
  await productsPage.goto()

  await expect(productsPage.row(product.id)).toBeVisible()
  await expect(productsPage.row(product.id)).toContainText(product.name)
})
```

### Fixtures que el test pide

> **Nota:** El runner prepara un fixture cuando lo pide el test, un hook o un fixture dependiente. Los fixtures automáticos se preparan sin una petición explícita. En estos dos tests, solo el primero necesita `product`.

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

El segundo test no crea ningún producto. Cada test que pide `product` recibe su propio producto nuevo.

## Fixtures y beforeEach

Usa `beforeEach` para un paso simple que necesitan todos los tests de un archivo, como abrir una página. Usa un fixture para datos o helpers que necesitan limpieza o que comparten varios archivos.

| Punto | `beforeEach` | Fixture |
| --- | --- | --- |
| Limpieza | Un `afterEach` aparte, lejos del setup | La misma función, después de `use` |
| Se ejecuta para | Todos los tests del grupo | Tests o hooks que lo necesitan, sus dependencias y fixtures automáticos |
| Compartir | Variables fuera del test | Un valor con tipo entre llaves |
| Reutilizar en otros archivos | Difícil | Importar `test` |

**KISS**, "Keep It Simple", consiste en elegir la herramienta más simple que hace el trabajo. Un test que solo necesita una línea de setup puede mantenerla en su cuerpo.

## Profundiza

### Valores que pertenecen al test

Un fixture llamado `lowStockProduct` puede esconder el valor que decide el resultado del test. Si el test comprueba el comportamiento con stock 3, deja ese valor visible con `createProduct(request, { stock: 3 })`.

Cada fixture debe tener un solo trabajo. Separar la creación de un producto, un cliente y un pedido permite combinar solo la preparación que necesita cada test.

## Práctica

1. Crea el archivo `apps/practice-shop/e2e/lib/fixtures/products-test.ts`. Copia el código del fixture de esta lección.
2. Crea el archivo `apps/practice-shop/e2e/products/fixture-practice.spec.ts`. Copia el código del spec de esta lección.
3. Inicia la tienda con `pnpm shop:dev` en una terminal.
4. En una segunda terminal, ejecuta tu spec:

```bash
pnpm shop:e2e products/fixture-practice.spec.ts --repeat-each=2
```

5. Comprueba que ambas repeticiones pasan con un solo reinicio de datos en el setup. Dos comandos separados reiniciarían los datos dos veces.
6. Agrega un segundo test en el mismo archivo. Usa solo `{ productsPage }` y comprueba que `productsPage.newButton` es visible después de `goto()`.
7. Cuando termines, borra los dos archivos, o consérvalos para tus propias notas.

## Reto

Escribe un fixture que entregue una página con la sesión iniciada como viewer, el usuario que solo puede leer. Úsalo para comprobar el hueco "viewer role" de `COVERAGE.md`: un viewer no ve los botones New, Edit ni Delete.

Crea `apps/practice-shop/e2e/challenges/viewer-test.ts` para el fixture y `apps/practice-shop/e2e/challenges/viewer-role.spec.ts` para el spec. La cuenta viewer está en `e2e/lib/fixtures/api-client.ts`.

Está terminado cuando:

- El fixture se llama `viewerPage` y extiende el `test` de `lib/test.ts`.
- Un test que usa `viewerPage` comprueba que `user-role` dice `viewer`, que `products-new` no existe y que la fila de un producto que creaste tú mismo es visible. Comprueba que sus controles `products-edit-<id>` y `products-delete-<id>` no existen.
- Un segundo test no pide `viewerPage` y comprueba que `user-role` dice `admin` y que `products-new` es visible.
- Ejecutaste `pnpm shop:e2e challenges/viewer-role.spec.ts` dos veces y ambas ejecuciones pasaron. Los demás specs siguen pasando.

Busca cómo cambiar el usuario solo para un test y cómo comparte cookies `page.request` con `page`, mientras el fixture `request` mantiene las suyas aparte: `playwright context clearCookies`, `playwright page.request shares cookies with context`.

## Piénsalo bien

1. Este fixture tiene un bug. Un test que borra el producto por sí mismo falla, aunque el borrado funcionó. Encuentra el bug.

```ts
product: async ({ request }, use) => {
  const product = await createProduct(request)
  await use(product)
  await deleteProduct(request, product.id)
},
```

<details>
<summary>Respuesta</summary>

`deleteProduct` comprueba que el estado sea `204`. Si el test ya borró el producto, el servidor devuelve `404` en el segundo borrado. La aserción falla durante la limpieza y el runner reporta el test como fallido.

</details>

2. El equipo agrega una regla: un producto que aparece en un pedido no se puede borrar, y el servidor responde `409`. Otro fixture de producto omite la comprobación del estado de su petición de limpieza. ¿Qué se rompe y qué esconde el fixture?

<details>
<summary>Respuesta</summary>

El servidor rechaza el borrado y el producto queda en la tienda. El fixture no comprueba la respuesta, así que el test puede pasar aunque la limpieza haya fallado. La comprobación debería aceptar `204` y `404`, y fallar con cualquier otro estado.

</details>

3. Un test pide `product`, pero la API está caída y `createProduct` lanza un error. ¿Se ejecutan el cuerpo del test y la limpieza después de `use`?

<details>
<summary>Respuesta</summary>

Ninguno se ejecuta: el fixture falla antes de entregar el valor con `use`, y el runner reporta un fallo de preparación. Si un fixture crea dos recursos y falla al crear el segundo, debe manejar la limpieza del primero.

</details>

## Siguiente paso

En la próxima lección lees el Page Object de la tienda y aprendes cuándo construir uno.
