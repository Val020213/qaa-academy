---
title: El Page Object Model
summary: Lee el Page Object de productos, úsalo en un spec y aprende las reglas y los límites del patrón.
duration: 30 min
---

## Objetivo

- Explicar qué es un Page Object.
- Leer `products.page.ts` y usarlo en un spec.
- Aplicar las reglas: sin aserciones dentro, uno por vista.
- Saber cuándo no construir uno.

## El problema

Imagina cinco specs para la página de productos. Cada uno escribe `page.getByTestId("products-search")`. Un día el desarrollador cambia ese id. Tienes que corregir cinco specs.

Un **Page Object** (objeto de página) resuelve esto. Es una clase que guarda los locators y las acciones de una página. Una **clase** es un bloque de código que agrupa datos y funciones bajo un nombre. Los specs usan la clase en lugar de escribir los ids ellos mismos.

## Lee el real

Abre `apps/practice-shop/e2e/lib/pages/products.page.ts`. Empieza así:

```ts
// Page Object for the products list. It knows WHERE things are and HOW to
// click them. It never asserts: the specs decide what is correct.
export class ProductsPage {
  readonly page: Page
  readonly table: Locator
  readonly rows: Locator
  readonly searchInput: Locator
```

La clase tiene tres partes. La palabra `readonly` significa que el valor se asigna una vez y nunca cambia.

**Locators.** El constructor los crea una sola vez. El constructor es la función que se ejecuta cuando escribes `new ProductsPage(page)`.

```ts
constructor(page: Page) {
  this.page = page
  this.table = page.getByTestId("products-table")
  this.rows = page.getByTestId(/^products-row-/)
  this.searchInput = page.getByTestId("products-search")
```

**Locators que necesitan un valor.** Un **método** es una función dentro de una clase. Una fila depende del id del producto, así que es un método:

```ts
row(id: number): Locator {
  return this.page.getByTestId(`products-row-${id}`)
}
```

**Acciones.** Una acción es algo que hace un usuario:

```ts
async search(text: string) {
  await this.searchInput.fill(text)
}

/** Deletes a product: row button, then the shared confirm button. */
async delete(id: number) {
  await this.openDeleteDialog(id)
  await this.confirmDeleteButton.click()
}
```

La acción `delete` esconde dos clics. El spec solo dice `delete`.

## Úsalo en un spec

Este es un test real de `apps/practice-shop/e2e/products/products.spec.ts`:

```ts
test("confirming in the dialog removes the product", async ({ page, request }) => {
  const product = await createProduct(request)
  const products = new ProductsPage(page)
  await products.goto()
  await expect(products.row(product.id)).toBeVisible()

  await products.delete(product.id)

  await expect(products.row(product.id)).toHaveCount(0)
  await expect(products.message).toContainText(product.name)
})
```

El spec crea el objeto con `new ProductsPage(page)`. Después se lee como un test manual: ir a la página, borrar el producto, comprobar que la fila ya no está.

Fíjate en que `expect` está en el spec. Esa es la primera regla.

## Las reglas

1. **Sin aserciones dentro del Page Object.** Describe la página. El spec decide qué es correcto. El mismo locator `message` sirve para comprobar que un mensaje existe en un test y que no existe en otro.
2. **Un Page Object por vista.** Una vista es una página o una pantalla. La lista de productos es una. El formulario de producto es otra.
3. **No construyas uno demasiado pronto.** Construye un Page Object cuando varios specs usan la misma página. Con un solo spec, las líneas simples con `getByTestId` son más claras.
4. **Las acciones son lo que hace un usuario.** Usa `search`, `delete`. No copies cada clic en un método.

> **Nota:** Hoy solo `products.spec.ts` importa `ProductsPage`. Los specs de pedidos y del dashboard usan `getByTestId` directamente. La tienda incluye `ProductsPage` como modelo para leer. En un proyecto real, la regla 3 dice que esperes hasta que un segundo spec lo necesite.

## Cuándo no ayuda

Un Page Object es una herramienta, no una regla para todo. No ayuda en estos casos.

- Una página se usa en un solo spec. La clase agrega un archivo y ningún beneficio.
- Una página cambia por completo cada mes. Reescribes la clase cada vez.
- La clase crece hasta 40 métodos. Se vuelve difícil de leer. Divide la vista.
- Esconde demasiado. Si `deleteAndCheck` hace clic y además comprueba, el spec ya no muestra qué se comprueba.
- Un flujo pequeño como el login. Una función de ayuda como `fillLoginForm` en `auth.spec.ts` es suficiente.

## Práctica

1. Abre `apps/practice-shop/e2e/lib/pages/products.page.ts`. Busca los tres métodos que reciben un id de producto.
2. Averigua qué archivos spec importan `ProductsPage`. En PowerShell, desde la raíz del repositorio, ejecuta:

```bash
Get-ChildItem apps/practice-shop/e2e -Recurse -Filter *.ts | Select-String "ProductsPage"
```

3. Cuenta en cuántos lugares se escribe el id `products-search`:

```bash
Get-ChildItem apps/practice-shop/e2e -Recurse -Filter *.ts | Select-String "products-search"
```

4. Crea el archivo `apps/practice-shop/e2e/products/pom-practice.spec.ts` con este código:

```ts
import { expect, test } from "../lib/test"
import { createProduct } from "../lib/fixtures/api-client"
import { uniqueName } from "../lib/helpers"
import { ProductsPage } from "../lib/pages/products.page"

test("the Page Object finds a product by name", async ({ page, request }) => {
  const product = await createProduct(request, { name: uniqueName("Practice") })
  const products = new ProductsPage(page)
  await products.goto()
  await expect(products.row(product.id)).toBeVisible()

  await products.search(product.name)

  await expect(products.rows).toHaveCount(1)
  await expect(products.count).toHaveText("1 product")
})
```

5. Inicia la tienda con `pnpm shop:dev`. En otra terminal ejecuta:

```bash
pnpm shop:e2e products/pom-practice.spec.ts
```

6. Escribe una frase: ¿qué líneas de tu spec cambiarían si cambiara el id del cuadro de búsqueda?

## Comprueba lo que sabes

1. ¿Qué guarda un Page Object?

<details><summary>Respuesta</summary>

Los locators y las acciones de una página.

</details>

2. ¿Por qué un Page Object no debe contener aserciones?

<details><summary>Respuesta</summary>

Solo describe la página. El spec decide qué es correcto, así que un mismo locator puede usarse para comprobaciones distintas.

</details>

3. ¿Cuándo no debes construir un Page Object?

<details><summary>Respuesta</summary>

Cuando solo un spec usa la página, o cuando la página cambia todo el tiempo.

</details>

4. ¿Por qué `row(id)` es un método y no una propiedad?

<details><summary>Respuesta</summary>

Necesita un id de producto para construir el locator. Un método puede recibir un valor.

</details>

## Siguiente paso

En la siguiente lección aprenderás cómo la suite inicia sesión una sola vez y reutiliza la sesión en todos los tests.
