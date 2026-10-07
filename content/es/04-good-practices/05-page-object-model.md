---
title: El Page Object Model
duration: 65 min
---

## Objetivo

En esta lección usas el Page Object de productos para compartir locators y acciones entre tests. También decides qué debe mostrar el spec para que se entienda lo que comprueba.

- Leer `products.page.ts` y usarlo en un spec.
- Entender qué guarda el constructor y por qué puedes ejecutarlo antes de abrir la página.
- Separar las acciones de la página de las aserciones del test.
- Decidir cuándo extraer un Page Object y cuándo basta una función.

## Compartir locators y acciones

Si cinco specs escriben `page.getByTestId("products-search")`, cambiar ese id exige editar los cinco. Un **Page Object** reúne los locators y las acciones de una página para que los specs los compartan.

La tienda lo implementa con una **clase**, que agrupa propiedades y funciones. Cada test crea un objeto de esa clase y lo usa con su propia `page`.

## Leer ProductsPage

Abre `apps/practice-shop/e2e/lib/pages/products.page.ts`:

```ts
// Page Object for the products list. It knows WHERE things are and HOW to
// click them. It never asserts: the specs decide what is correct.
export class ProductsPage {
  readonly page: Page
  readonly table: Locator
  readonly rows: Locator
  readonly searchInput: Locator
```

Con `readonly`, el verificador de tipos permite asignar la propiedad en su declaración o dentro del constructor, y rechaza la reasignación fuera de él. No congela el objeto guardado.

El **constructor** se ejecuta cuando escribes `new ProductsPage(page)`. Guarda la página recibida y crea los locators:

```ts
constructor(page: Page) {
  this.page = page
  this.table = page.getByTestId("products-table")
  this.rows = page.getByTestId(/^products-row-/)
  this.searchInput = page.getByTestId("products-search")
  // ...
}
```

Una función dentro de una clase se llama **método**. El método `row` recibe el id del producto y devuelve el locator de su fila:

```ts
row(id: number): Locator {
  return this.page.getByTestId(`products-row-${id}`)
}
```

Otros métodos reúnen las acciones:

```ts
async search(text: string) {
  await this.searchInput.fill(text)
}

// ...

/** Deletes a product: row button, then the shared confirm button. */
async delete(id: number) {
  await this.openDeleteDialog(id)
  await this.confirmDeleteButton.click()
}
```

`delete` ejecuta dos clics: abre el diálogo y confirma el borrado. El constructor crea `confirmDeleteButton` desde `page`, porque el diálogo está fuera de la tabla. Un locator que partiera de una fila no lo encontraría.

### Crear locators antes de navegar

El constructor guarda las búsquedas que Playwright ejecutará al usar los locators. Por eso puedes crear `ProductsPage` y pedirle una fila antes de abrir la página:

```ts
const product = await createProduct(request)
const products = new ProductsPage(page)
const row = products.row(product.id)

await products.goto()
await expect(row).toBeVisible()
```

Playwright busca la fila cuando la aserción comprueba su visibilidad. Si el DOM cambia, el locator vuelve a buscar en el DOM actual. El locator no conserva una referencia al nodo anterior. Su criterio aún puede dejar de coincidir o seleccionar otro elemento si cambia el DOM.

Este ejemplo compara buscar una vez con guardar una función que vuelve a buscar. Aquí, `findNow` devuelve una referencia al objeto encontrado, no una copia; esa referencia conserva el objeto anterior cuando se reemplaza el array.

```ts
type Row = { id: number; name: string }
let page: Row[] = [{ id: 7, name: "Desk Lamp" }]

function findNow(id: number): Row | undefined {
  return page.find((row) => row.id === id)
}
function locator(id: number) {
  return () => page.find((row) => row.id === id)
}

const found = findNow(7)
const recipe = locator(7)

// The page redraws: same product, new object.
page = [{ id: 7, name: "Desk Lamp" }]

console.log("same object as before:", found === page[0])
console.log("recipe finds the new one:", recipe() === page[0])
```

Node.js imprime:

```text
same object as before: false
recipe finds the new one: true
```

`found` conserva el objeto anterior; `recipe()` busca en el array nuevo. El constructor del Page Object guarda locators para que Playwright vuelva a buscar cuando el test los use.

## Usarlo en un spec

Este test está en `apps/practice-shop/e2e/products/products.spec.ts`:

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

El spec prepara el producto, abre la lista y comprueba que la fila esté visible antes de borrar. Después de `delete`, comprueba que la fila desaparezca y que el mensaje contenga el nombre del producto.

Las aserciones quedan en el spec. El Page Object expone `row` y `message`, y cada test decide qué resultado espera de esos locators.

## Decidir qué extraer

Usa estas reglas al extraer un Page Object:

1. Mantén las aserciones en el spec. Si `deleteAndCheck` también comprueba el resultado, el lector debe abrir otro archivo para saber qué verifica el test.
2. Organiza cada Page Object alrededor de una vista: la lista de productos y el formulario tienen locators y acciones distintos.
3. Espera a que varios specs necesiten la misma página antes de extraer la clase. Para un flujo pequeño puede bastar una función, como `fillLoginForm` en `auth.spec.ts`.
4. Nombra los métodos por lo que hace el usuario, como `search` o `delete`. Evita crear un método para cada clic.

Solo `products.spec.ts` importa `ProductsPage` en la tienda. Los specs de pedidos y del dashboard usan `getByTestId` directo; la clase de productos es el ejemplo del patrón que estudias aquí.

## Profundiza

### Un Page Object para el formulario

Si varios specs usan el formulario de producto, puedes reunir sus locators en `apps/practice-shop/e2e/lib/pages/product-form.page.ts`. Esta clase es una propuesta, no un archivo de la tienda:

```ts
import type { Locator, Page } from "../test"

// Page Object for the product form. Locators and actions only, no assertions.
export class ProductFormPage {
  readonly name: Locator
  readonly sku: Locator
  readonly price: Locator
  readonly stock: Locator
  readonly save: Locator
  readonly nameError: Locator

  constructor(page: Page) {
    this.name = page.getByTestId("product-name")
    this.sku = page.getByTestId("product-sku")
    this.price = page.getByTestId("product-price")
    this.stock = page.getByTestId("product-stock")
    this.save = page.getByTestId("product-save")
    this.nameError = page.getByTestId("product-name-error")
  }

  async fill(values: { name?: string; sku?: string; price?: string; stock?: string }) {
    if (values.name !== undefined) await this.name.fill(values.name)
    if (values.sku !== undefined) await this.sku.fill(values.sku)
    if (values.price !== undefined) await this.price.fill(values.price)
    if (values.stock !== undefined) await this.stock.fill(values.stock)
  }
}
```

`fill` acepta valores parciales: el test puede cambiar solo el campo que necesita. Un spec puede escribir `await form.fill({ name: "ab" })`, `await form.save.click()` y `await expect(form.nameError).toBeVisible()`.

Cada Page Object agrega código que debes mantener. Mantén los métodos centrados en una acción; si `fill` acumula opciones para decidir qué escenario ejecutar, parte del test queda escondida en la clase.

### Los cambios siguen necesitando revisión

Si cambia `products-search`, editas su locator en el Page Object. Si el borrado exige un motivo, cambia el método `delete`. Un spec que comprueba el texto del diálogo también puede necesitar una actualización.

El Page Object concentra los locators y las acciones compartidas. Los resultados esperados siguen siendo responsabilidad de cada spec.

## Práctica

1. Abre `apps/practice-shop/e2e/lib/pages/products.page.ts`. Encuentra los tres métodos que reciben un id de producto.
2. Encuentra qué archivos de spec importan `ProductsPage`. En PowerShell, desde la raíz del repositorio, ejecuta:

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
  await expect(products.row(product.id)).toBeVisible()
  await expect(products.count).toHaveText("1 product")
})
```

5. Inicia la tienda con `pnpm shop:dev`. En otra terminal ejecuta:

```bash
pnpm shop:e2e products/pom-practice.spec.ts
```

## Reto

Construye un Page Object para la página de detalle del producto y úsalo en un spec. Cubre el hueco "The product detail page: open it from the list, check its data, go back" de `COVERAGE.md`.

Crea `apps/practice-shop/e2e/challenges/pages/product-detail.page.ts` y `apps/practice-shop/e2e/challenges/product-detail.spec.ts`.

La página de detalle está en `/products/<id>`. Lee `apps/practice-shop/components/product-detail.tsx` para ver los test ids.

Está terminado cuando:

- El Page Object tiene locators para el título, el SKU, el precio, el stock, el estado y el enlace de volver, y una acción `backToList()`. El archivo no contiene `expect`: `Select-String "expect" apps/practice-shop/e2e/challenges/pages/product-detail.page.ts` no imprime nada en PowerShell.
- El spec crea su producto con `createProduct`, con un precio y un stock que tú eliges. Abre el detalle haciendo clic en el enlace con el nombre del producto en la lista.
- El spec comprueba el título, el SKU, el precio, el stock y el estado usando los valores del producto. Los test ids del detalle aparecen solo en el Page Object.
- Después de `backToList()`, la dirección termina en `/products`. Ejecutaste el spec dos veces seguidas y ambas pasaron.

Busca: `playwright toHaveURL regex`, `javascript number toFixed two decimals`. El archivo `apps/practice-shop/lib/api.ts` muestra cómo la página da formato a un precio.

## Piénsalo bien

1. Este test de borrado pasa aunque el producto siga en la lista. Encuentra el bug.

```ts
this.rows = page.getByTestId("products-row")
// in the spec, after products.delete(id):
await expect(products.rows).toHaveCount(0)
```

<details><summary>Respuesta</summary>

`getByTestId` con un string busca el valor completo. Las filas tienen ids como `products-row-12`, así que `rows` encuentra cero elementos incluso antes de borrar. El Page Object real usa `/^products-row-/` para todas las filas o `row` con el id de un producto. Comprueba que la fila exista antes del borrado y que desaparezca después.

</details>

2. El diálogo de borrado agrega un campo "Reason" y deshabilita la confirmación hasta que tenga texto. ¿Qué debes cambiar si los tests usan `ProductsPage.delete(id)`? ¿Qué cambia si cada spec hace los clics directamente?

<details><summary>Respuesta</summary>

El método `delete` debe llenar el motivo antes de confirmar. Con los clics escritos directamente, debes actualizar cada spec que borra. Los tests que comprueban el texto del diálogo también pueden necesitar cambios.

</details>

3. `rowByName(name)` usa `this.rows.filter({ hasText: name })`. Hay productos llamados "Mouse Pad" y "Wireless Mouse". ¿Qué pasa al hacer clic en `products.rowByName("Mouse")`? ¿Y si dos productos tienen exactamente el mismo nombre?

<details><summary>Respuesta</summary>

`hasText` coincide con una parte del texto, así que el locator encuentra ambas filas y el clic falla por strict mode. Dos productos con el mismo nombre también producen varias coincidencias. Usa un nombre que identifique una sola fila o el id del producto.

</details>

## Siguiente paso

En la próxima lección aprendes cómo la suite inicia sesión una sola vez y reutiliza la sesión en cada test.
