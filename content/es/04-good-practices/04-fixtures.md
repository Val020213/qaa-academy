---
title: Fixtures
summary: Entiende qué son los fixtures y los integrados, y escribe un fixture propio que crea y limpia un producto.
duration: 50 min
---

## Objetivo

- Explicar qué es un *fixture* (elemento de preparación que un test pide por su nombre).
- Nombrar los cuatro fixtures integrados.
- Escribir un fixture propio con `test.extend`.
- Elegir entre un fixture y `beforeEach`.

## Qué es un fixture

Un **fixture** es algo que un test pide por su nombre. Playwright lo prepara antes del test y lo elimina después.

Ya usas uno. En esta línea, `page` es un fixture:

```ts
test("shows a loading message first", async ({ page }) => {
```

Escribes el nombre entre llaves. Playwright te da una página de navegador nueva y lista. Tú no la creaste.

## Los fixtures integrados

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
```

Todos los specs importan `test` desde aquí. Esto le da al equipo un solo lugar para hacer cambios. Si agregas un fixture a este archivo, todos los specs lo reciben, y ningún spec necesita cambiar su importación.

## Un fixture propio

Muchos tests necesitan las mismas dos cosas: un producto que exista y un helper de la página de productos. Un fixture propio las entrega por su nombre.

Lo construyes con `test.extend`. Recibe un objeto. Cada clave es el nombre de un fixture. Cada valor es una función.

La función hace tres cosas: preparar, llamar a `use` y limpiar. La llamada a `use(value)` entrega el valor al test. Cuando el test termina, se ejecuta el código que está después de `use`.

Este es un ejemplo completo. Crea dos fixtures: `productsPage` y `product`.

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
- `extend<ShopFixtures>` le dice a TypeScript los nombres y los tipos de los nuevos fixtures.
- El fixture `product` pide `request`. Los fixtures pueden usar otros fixtures.
- `createProduct` crea un producto por la API con un nombre y un SKU únicos.
- Después del test, la última línea borra el producto.

Ahora un spec puede usar ambos:

```ts
import { expect, test } from "../lib/fixtures/products-test"

test("a product made by a fixture is in the list", async ({ productsPage, product }) => {
  await productsPage.goto()

  await expect(productsPage.row(product.id)).toBeVisible()
  await expect(productsPage.row(product.id)).toContainText(product.name)
})
```

El cuerpo del test no tiene líneas de preparación. Los nombres entre llaves dicen lo que necesita.

> **Nota:** Un fixture se ejecuta solo cuando un test lo pide. Un test que no lista `product` no crea uno.

## Fixtures frente a beforeEach

`beforeEach` ejecuta código antes de cada test de un grupo. También funciona, pero en la mayoría de los casos los fixtures son mejores.

| Punto | `beforeEach` | Fixture |
| --- | --- | --- |
| Limpieza | Un `afterEach` aparte, lejos de la preparación | La misma función, después de `use` |
| Se ejecuta para | Todos los tests del grupo | Solo los tests que lo piden |
| Compartir | Variables fuera del test | Un valor con tipo entre llaves |
| Reutilizar en otros archivos | Difícil | Importar `test` |

Usa `beforeEach` para un paso simple que todos los tests de un archivo necesitan, como abrir una página. Usa un fixture para datos o helpers que necesitan limpieza o que muchos archivos comparten.

## Profundiza

### Por qué un fixture tiene dos mitades

Una función de fixture hace algo extraño: se detiene a la mitad. Se ejecuta hasta `await use(value)`, espera ahí y luego continúa. Puedes ver la idea en TypeScript simple, sin Playwright:

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

Imprime `1 setup`, luego `2 the test uses: a product` y luego `3 cleanup`. Playwright hace lo mismo. Llama a tu fixture y, cuando tu código llega a `use`, Playwright ejecuta el test con el valor. Cuando el test termina, Playwright deja que tu función termine. Ejecuta la limpieza también cuando el test falla, así que un test fallido no deja datos atrás.

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

El segundo test no crea ningún producto, porque no lista `product` entre llaves. Además, cada test que pide `product` recibe su propio producto nuevo. Dos tests nunca comparten uno.

### Cómo aparece en el trabajo de QA

Mira `products.spec.ts`. La línea `const products = new ProductsPage(page)` está escrita en los 7 tests. Eso es repetir el mismo conocimiento: cómo construir el helper de la página. El fixture `productsPage` de esta lección lo escribe una vez, y cada test solo pide `productsPage`. Esta es la idea llamada DRY (no te repitas), del módulo de programación.

### Cuándo no usar un fixture

Un fixture es una mala idea cuando oculta algo sobre lo que trata el test. Imagina un fixture llamado `lowStockProduct`. El test lee `product.stock`, pero el número 3 está escondido dentro del fixture. Un lector debe abrir otro archivo para entender el test. Si el valor importa para el comportamiento, escríbelo en el test con `createProduct(request, { stock: 3 })`. Usa fixtures para la preparación que es igual en todas partes y deja visibles los valores importantes.

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
8. Cuando termines, borra los dos archivos, o guárdalos para tus propias notas.

## Comprueba lo que sabes

1. ¿Qué es un fixture?

<details><summary>Respuesta</summary>

Algo que un test pide por su nombre. Playwright lo prepara antes del test y lo limpia después.

</details>

2. ¿Qué fixture integrado envía peticiones a la API sin un navegador?

<details><summary>Respuesta</summary>

`request`.

</details>

3. ¿Qué hace `await use(product)` dentro de un fixture?

<details><summary>Respuesta</summary>

Entrega el valor al test. Cuando el test termina, el código que está después de `use` se ejecuta como limpieza.

</details>

4. Nombra una ventaja de un fixture sobre `beforeEach`.

<details><summary>Respuesta</summary>

La limpieza está en la misma función que la preparación. Además, se ejecuta solo para los tests que lo piden.

</details>

5. ¿Qué imprime este código, en orden? ¿Por qué un fixture pone la limpieza después de `use` y no al final del cuerpo del test?

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

<details><summary>Respuesta</summary>

Imprime `1 setup`, `2 the test uses: a product` y `3 cleanup`. En Playwright, el código que está después de `use` se ejecuta incluso cuando el test falla. La limpieza al final del cuerpo de un test se omite si falla una línea anterior. Así, un fixture no deja datos atrás.

</details>

6. Este fixture tiene un error. Un test que borra el producto por sí mismo falla, aunque el borrado funcionó. Encuentra el error.

```ts
product: async ({ request }, use) => {
  const product = await createProduct(request)
  await use(product)
  await deleteProduct(request, product.id)
},
```

<details><summary>Respuesta</summary>

`deleteProduct` comprueba que el estado sea `204`. Si el test ya borró el producto, el segundo borrado devuelve `404` y la comprobación falla durante la limpieza. Entonces el test se reporta como fallido. La lección usa `request.delete(...)` sin comprobación, porque el producto puede haber desaparecido ya.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es un fixture de alcance worker en Playwright y en qué se diferencia de uno de alcance test?**
   - Busca: `playwright fixtures scope worker test`
   - Una buena respuesta explica: cuántas veces se crea cada tipo y un ejemplo donde el alcance worker es útil.

2. **¿Qué son setup y teardown en las pruebas y por qué es importante la limpieza?**
   - Busca: `test fixture setup teardown xUnit pattern`
   - Una buena respuesta explica: qué hace cada paso y qué puede salir mal cuando un test deja datos atrás.

3. **¿Qué es un fixture automático en Playwright?**
   - Busca: `playwright automatic fixtures auto true`
   - Una buena respuesta explica: en qué se diferencia de un fixture normal y un caso donde encaja, como guardar logs cuando un test falla.

## Siguiente paso

En la próxima lección lees el Page Object de la tienda y aprendes cuándo construir uno.
