---
title: El Page Object Model
summary: Lee el Page Object de productos, úsalo en un spec y aprende las reglas y los límites del patrón.
duration: 45 min
---

## Objetivo

- Explicar qué es un *Page Object* (objeto de página).
- Leer `products.page.ts` y usarlo en un spec.
- Aplicar las reglas: sin aserciones dentro y uno por vista.
- Saber cuándo no construir uno.

## El problema

Imagina cinco specs para la página de productos. Cada uno escribe `page.getByTestId("products-search")`. Un día el desarrollador cambia el nombre de ese id. Debes corregir cinco specs.

Un **Page Object** resuelve esto. Es una clase que guarda los locators y las acciones de una página. Una **clase** es un bloque de código que agrupa datos y funciones bajo un nombre. Los specs usan la clase en lugar de escribir ellos mismos los ids.

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

El spec crea el objeto con `new ProductsPage(page)`. Después se lee como un test manual: ir a la página, borrar el producto, comprobar que la fila desapareció.

Fíjate en que `expect` está en el spec. Esta es la primera regla.

## Las reglas

1. **Sin aserciones dentro del Page Object.** Describe la página. El spec decide qué es correcto. El mismo locator `message` puede usarse para comprobar que un mensaje existe en un test y que no existe en otro.
2. **Un Page Object por vista.** Una vista es una página o una pantalla. La lista de productos es una. El formulario de producto es otra.
3. **No lo construyas demasiado pronto.** Construye un Page Object cuando varios specs usen la misma página. Con un solo spec, las líneas simples de `getByTestId` son más claras.
4. **Las acciones son lo que hace un usuario.** Usa `search`, `delete`. No copies cada clic en un método.

> **Nota:** Hoy solo `products.spec.ts` importa `ProductsPage`. Los specs de pedidos y del dashboard usan `getByTestId` simple. La tienda incluye `ProductsPage` como modelo para leer. En un proyecto real, la regla 3 dice que esperes hasta que un segundo spec lo necesite.

## Cuándo no ayuda

Un Page Object es una herramienta, no una regla para todo. No ayuda en estos casos.

- Una página se usa en un solo spec. La clase agrega un archivo y ningún beneficio.
- Una página cambia por completo cada mes. Reescribes la clase cada vez.
- La clase crece hasta 40 métodos. Se vuelve difícil de leer. Divide la vista.
- Esconde demasiado. Si `deleteAndCheck` hace clic y también comprueba, el spec ya no muestra qué se comprueba.
- Un flujo pequeño como el login. Una función helper como `fillLoginForm` en `auth.spec.ts` es suficiente.

## Profundiza

### Por qué un locator creado antes sigue funcionando después

El constructor de `ProductsPage` crea muchos locators. Puede preocuparte que encuentren elementos demasiado pronto, antes de que la página esté lista. Todavía no encuentran nada. Un **locator** es una receta: "el elemento con este test id". Playwright sigue la receta solo cuando actúas o compruebas, y la sigue de nuevo cada vez.

```ts
const product = await createProduct(request)
const products = new ProductsPage(page)
const row = products.row(product.id)

await products.goto()
await expect(row).toBeVisible()
```

La variable `row` existe antes de que se abra la página. Aun así funciona, porque la búsqueda ocurre en la línea del `expect`, con la página tal como está en ese momento. Algunas herramientas más antiguas devuelven un elemento ya encontrado, y ese elemento queda obsoleto cuando la página cambia. Un locator de Playwright no puede quedar obsoleto.

### Una idea equivocada común: un Page Object elimina todos los cambios en los tests

La gente dice que un Page Object protege los tests de los cambios en la interfaz. Solo mueve el cambio a un lugar. Si un desarrollador cambia el nombre de `products-search`, editas una línea. Si un desarrollador agrega un nuevo paso obligatorio para borrar, como un campo de motivo, el método `delete` cambia, y un test que comprueba el texto del diálogo también puede cambiar. El beneficio es real, pero pequeño y local. Esto es DRY: el locator se escribe una vez.

### Cómo aparece en el trabajo de QA: un segundo Page Object

Imagina que los tests de creación y un nuevo spec de validación usan ambos el formulario de producto. Son dos specs sobre una vista, así que la regla 3 dice que ahora vale la pena un Page Object. Este no está en la tienda. Puedes agregarlo como `apps/practice-shop/e2e/lib/pages/product-form.page.ts`:

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

Entonces un spec se lee `await form.fill({ name: "ab" })`, `await form.save.click()` y `await expect(form.nameError).toBeVisible()`.

### Un equilibrio

Cada Page Object es más código que leer y mantener. El método `fill` acepta valores parciales, así que un test puede llenar solo el campo que le importa. Pero si haces que `fill` reciba 12 opciones con banderas, has construido un segundo test oculto. Mantén las acciones pequeñas y con el nombre de lo que hace un usuario.

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

5. El test de abajo crea `row` antes de abrir la página. ¿Funciona? Explica por qué.

```ts
const product = await createProduct(request)
const products = new ProductsPage(page)
const row = products.row(product.id)

await products.goto()
await expect(row).toBeVisible()
```

<details><summary>Respuesta</summary>

Funciona. `row(...)` devuelve un locator, que es solo una receta. Playwright busca el elemento cuando se ejecuta `expect`, después de que la página se abrió, y vuelve a buscar mientras espera. El orden en que creas el locator no importa. Sí importa crear el producto antes de `goto`, porque la lista se carga una vez cuando se abre la página.

</details>

6. Un compañero agrega el método `deleteAndCheckGone(id)` a `ProductsPage`. Borra el producto y comprueba que la fila desapareció. ¿Es mejor que `delete(id)` seguido de un `expect` en el spec? Da dos razones.

<details><summary>Respuesta</summary>

Es peor. Primero, la aserción queda escondida, así que quien lee el spec no ve qué comprueba el test. Segundo, el Page Object ahora decide qué es correcto, así que el método no puede reutilizarse en un test que espera que el borrado falle, como el de un usuario viewer. Deja la acción en el Page Object y la aserción en el spec.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es el principio de responsabilidad única y un page object con 40 métodos lo rompe?**
   - Busca: `single responsibility principle explained`
   - Una buena respuesta explica: el principio en una frase y cómo podrías dividir un page object grande.

2. **¿Qué es un component object y cuándo es mejor que un solo page object grande?**
   - Busca: `page object component object pattern test automation`
   - Una buena respuesta explica: qué es un componente, como un menú o un diálogo, y por qué compartirlo entre páginas ayuda.

3. **¿Por qué algunos testers dicen que un page object no debe contener aserciones, mientras otros no están de acuerdo?**
   - Busca: `page object assertions Martin Fowler PageObject`
   - Una buena respuesta explica: el argumento de cada lado y qué regla sigue tu equipo.

## Siguiente paso

En la próxima lección aprendes cómo la suite inicia sesión una sola vez y reutiliza la sesión en cada test.
