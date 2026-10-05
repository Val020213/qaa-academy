---
title: Fixtures
summary: Entiende qué son los fixtures, cuáles vienen incluidos y escribe un fixture propio que crea y limpia un producto.
duration: 35 min
---

## Objetivo

- Explicar qué es un fixture.
- Nombrar los cuatro fixtures incluidos.
- Escribir un fixture propio con `test.extend`.
- Elegir entre un fixture y `beforeEach`.

## Qué es un fixture

Un *fixture* (elemento preparado de antemano) es algo que un test pide por su nombre. Playwright lo prepara antes del test y lo elimina después.

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

En la configuración de la tienda, `use.storageState` pone las cookies guardadas del admin en el contexto. Por eso `page` y `request` ya tienen la sesión iniciada. La lección 6 (Autenticación con storage state) lo explica.

## Por qué los specs importan desde lib/test.ts

Abre `apps/practice-shop/e2e/lib/test.ts`:

```ts
// Every spec imports from this file, never from "@playwright/test".
// Custom fixtures get added here later, so every spec can use them.
export { test, expect } from "@playwright/test"
```

Todos los *specs* (archivos de tests) importan `test` desde aquí. Esto le da al equipo un solo lugar para hacer cambios. Si agregas un fixture a este archivo, todos los specs lo reciben, y ningún spec necesita cambiar su importación.

## Un fixture propio

Muchos tests necesitan las mismas dos cosas: un producto que exista y una ayuda para la página de productos. Un fixture propio las entrega por nombre.

Lo construyes con `test.extend`. Recibe un objeto. Cada clave es el nombre de un fixture. Cada valor es una función.

La función hace tres cosas: prepara, llama a `use` y limpia. La llamada a `use(value)` entrega el valor al test. Cuando el test termina, se ejecuta el código que está después de `use`.

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
- `extend<ShopFixtures>` le dice a TypeScript los nombres y tipos de los fixtures nuevos.
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

El cuerpo del test no tiene líneas de preparación. Los nombres entre llaves dicen qué necesita.

> **Nota:** Un fixture se ejecuta solo cuando un test lo pide. Un test que no lista `product` no crea uno.

## Fixtures frente a beforeEach

`beforeEach` ejecuta código antes de cada test de un grupo. También funciona, pero en la mayoría de los casos los fixtures son mejores.

| Punto | `beforeEach` | Fixture |
| --- | --- | --- |
| Limpieza | Un `afterEach` aparte, lejos de la preparación | La misma función, después de `use` |
| Se ejecuta para | Todos los tests del grupo | Solo los tests que lo piden |
| Compartir | Variables fuera del test | Un valor con tipo entre llaves |
| Reutilizar en otros archivos | Difícil | Importar `test` |

Usa `beforeEach` para un paso simple que todos los tests de un archivo necesitan, como abrir una página. Usa un fixture para datos o ayudas que necesitan limpieza o que muchos archivos comparten.

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
8. Cuando termines, borra los dos archivos, o guárdalos como tus notas.

## Comprueba lo que sabes

1. ¿Qué es un fixture?

<details><summary>Respuesta</summary>

Algo que un test pide por su nombre. Playwright lo prepara antes del test y lo limpia después.

</details>

2. ¿Qué fixture incluido envía peticiones a la API sin navegador?

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

## Siguiente paso

En la siguiente lección leerás el Page Object de la tienda y aprenderás cuándo construir uno.
