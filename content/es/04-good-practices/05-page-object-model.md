---
title: El Page Object Model
summary: Lee el Page Object de productos, aprende por qué los locators creados antes siguen funcionando y decide cuándo el patrón ayuda y cuándo esconde demasiado.
duration: 85 min
---

## Empieza con un acertijo

Mira las primeras líneas de la clase `ProductsPage` de la tienda:

```ts
constructor(page: Page) {
  this.page = page
  this.table = page.getByTestId("products-table")
  this.rows = page.getByTestId(/^products-row-/)
  this.searchInput = page.getByTestId("products-search")
  // ...
}
```

Un *spec* (archivo de pruebas) ejecuta `const products = new ProductsPage(page)` en su primera línea. En ese momento el navegador todavía no abrió `/products`. La tabla, las filas y el cuadro de búsqueda no existen en ningún lugar.

Aun así, la línea no falla con "element not found" (elemento no encontrado). ¿Por qué no? ¿Y qué esperarías si la clase guardara los elementos ya encontrados?

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Explicar por qué un Page Object puede describir elementos que todavía no existen.
- Leer `products.page.ts` y usarlo en un spec.
- Juzgar un Page Object: dónde van las aserciones y cuándo es demasiado.
- Decidir cuándo no construir uno.

## El problema

Imagina cinco specs para la página de productos. Cada uno escribe `page.getByTestId("products-search")`. Un día el desarrollador cambia ese id. Debes arreglar cinco specs.

Un *Page Object* (objeto de página) resuelve esto. Es una clase que guarda los *locators* (la forma de encontrar un elemento) y las acciones de una página. Una **clase** es un bloque de código que agrupa datos y funciones bajo un mismo nombre. Los specs usan la clase en vez de escribir los ids ellos mismos.

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

La clase tiene tres partes. La palabra `readonly` significa que el valor se define una vez y nunca cambia.

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

// ...

/** Deletes a product: row button, then the shared confirm button. */
async delete(id: number) {
  await this.openDeleteDialog(id)
  await this.confirmDeleteButton.click()
}
```

La acción `delete` esconde dos clics. El spec solo dice `delete`. El segundo clic va a `confirmDeleteButton`, que el constructor construye desde `page`, no desde una fila. El diálogo de confirmación se dibuja al final de la página, fuera de la tabla. Por eso un locator que parte de una fila no lo podría encontrar.

### De vuelta al acertijo

Un **locator** es una receta: "el elemento con este test id". No es el elemento. Playwright sigue la receta solo cuando actúas sobre ella o haces una aserción, y la sigue de nuevo cada vez. Así el constructor puede escribir doce recetas antes de que exista la página. Todavía no se busca nada.

Aquí está la diferencia en código simple. Una receta es una función que busca de nuevo cada vez. Un elemento encontrado es una copia tomada una sola vez. ¿Qué esperas que imprima cada uno cuando la página cambia?

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

Imprime:

```text
same object as before: false
recipe finds the new one: true
```

La copia apunta a un objeto que la página tiró. Eso es un elemento **obsoleto** (*stale*), y algunas herramientas antiguas sufren por eso. La receta busca de nuevo y encuentra el objeto nuevo. Si el constructor guardara elementos encontrados, fallaría en una página vacía, o tendría copias muertas cuando la página se redibuja. Guardar recetas evita los dos problemas.

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

El spec crea el objeto con `new ProductsPage(page)`. Después se lee como una prueba manual: ir a la página, borrar el producto, comprobar que la fila ya no está.

Fíjate en la forma del test. **Prepara** sus datos (`createProduct`, abrir la página), **actúa** (`delete`) y **comprueba** (las dos líneas `expect`). Esto es *Arrange, Act, Assert* (preparar, actuar, comprobar). Un Page Object sirve a los dos primeros pasos y deja el tercero al spec.

## Las reglas

1. **Sin aserciones dentro del Page Object.** Describe la página. El spec decide qué es correcto. El mismo locator `message` sirve para comprobar que un mensaje existe en un test y que no existe en otro.
2. **Un Page Object por vista.** Una vista es una página o una pantalla. La lista de productos es una. El formulario de producto es otra.
3. **No lo construyas demasiado pronto.** Construye un Page Object cuando varios specs usan la misma página. Con un solo spec, las líneas simples de `getByTestId` son más claras.
4. **Las acciones son lo que hace un usuario.** Usa `search`, `delete`. No copies cada clic en un método.

> **Nota:** Hoy solo `products.spec.ts` importa `ProductsPage`. Los specs de pedidos y del dashboard usan `getByTestId` directo. La tienda incluye `ProductsPage` como un modelo para leer. En un proyecto real, la regla 3 dice que esperes hasta que un segundo spec lo necesite.

La regla 1 se ve mejor cuando se rompe. Mira este locator y piensa qué tiene de malo antes de seguir leyendo:

```ts
this.rows = page.getByTestId("products-row")
```

`getByTestId` con un string simple busca el valor completo. Ningún elemento tiene el id `products-row` solo: los ids son `products-row-12`, `products-row-13` y así. Entonces `rows` no encuentra nada. Un test que pide `expect(products.rows).toHaveCount(0)` después de borrar pasa, y pasaría aunque el borrado nunca ocurriera. El código se ejecuta y da una respuesta falsa. Lo vas a encontrar de nuevo en las preguntas.

## Cuándo no ayuda

Un Page Object es una herramienta, no una regla para todo. No ayuda en estos casos.

- Una página se usa en un solo spec. La clase agrega un archivo y ningún beneficio.
- Una página cambia por completo cada mes. Reescribes la clase cada vez.
- La clase crece hasta 40 métodos. Se vuelve difícil de leer. Divide la vista.
- Esconde demasiado. Si `deleteAndCheck` hace clic y también comprueba, el spec ya no muestra qué se verifica.
- Un flujo pequeño como el login. Una función *helper* (ayudante) como `fillLoginForm` en `auth.spec.ts` es suficiente.

## Profundiza

### Por qué un locator creado antes funciona después

El constructor de `ProductsPage` crea muchos locators. Quizás te preocupe que encuentren elementos demasiado pronto, antes de que la página esté lista. Todavía no encuentran nada. Un locator es una receta, como viste arriba, y Playwright la sigue de nuevo cada vez.

```ts
const product = await createProduct(request)
const products = new ProductsPage(page)
const row = products.row(product.id)

await products.goto()
await expect(row).toBeVisible()
```

La variable `row` existe antes de que se abra la página. Aun así funciona, porque la búsqueda ocurre en la línea del `expect`, con la página tal como está en ese momento. Un locator de Playwright no puede quedar obsoleto.

### Una idea equivocada común: un Page Object elimina todos los cambios en los tests

Se dice que un Page Object protege los tests de los cambios en la interfaz. Solo mueve el cambio a un único lugar. Si un desarrollador renombra `products-search`, editas una línea. Si agrega un paso obligatorio nuevo para borrar, como un campo de motivo, el método `delete` cambia, y un test que revisa el texto del diálogo también puede cambiar. El beneficio es real, pero pequeño y local. Esto es *DRY* (no te repitas): el locator se escribe una sola vez.

Cuando la tienda pasó a componentes shadcn, el marcado de la tabla, los botones y el diálogo cambió, y ningún test id cambió. Los specs que usan el Page Object y los specs simples que usan los mismos ids siguieron funcionando. Los ids son el contrato. El Page Object agrega un lugar para editar cuando el contrato mismo cambia.

### Cómo aparece en el trabajo de QA: un segundo Page Object

Imagina que los tests de crear y un nuevo spec de validación usan el formulario de producto. Son dos specs sobre una vista, así que la regla 3 dice que ahora sí vale la pena un Page Object. Este no está en la tienda. Puedes agregarlo como `apps/practice-shop/e2e/lib/pages/product-form.page.ts`:

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

Un spec entonces se lee `await form.fill({ name: "ab" })`, `await form.save.click()` y `await expect(form.nameError).toBeVisible()`.

### Un equilibrio

Cada Page Object es más código para leer y mantener. El método `fill` acepta valores parciales, así que un test puede llenar solo el campo que le importa. Pero si haces que `fill` reciba 12 opciones con banderas, has construido un segundo test escondido. Mantén las acciones pequeñas y nómbralas por lo que hace un usuario. Una clase donde cada método hace un solo trabajo, y cada nombre dice para qué sirve, es fácil de confiar. Esta es la idea de **responsabilidad única** (*single responsibility*).

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

## Reto

Construye un Page Object para la página de detalle del producto y úsalo en un spec. Esto cierra el hueco "The product detail page: open it from the list, check its data, go back" de `COVERAGE.md`.

Crea estos archivos: `apps/practice-shop/e2e/challenges/pages/product-detail.page.ts` y `apps/practice-shop/e2e/challenges/product-detail.spec.ts`.

La página de detalle está en `/products/<id>`. Lee `apps/practice-shop/components/product-detail.tsx` para ver los test ids.

Está terminado cuando:

- El Page Object tiene un locator para el título, el SKU, el precio, el stock y el estado, un locator para el enlace de volver y una acción `backToList()`. El archivo no contiene la palabra `expect`. En PowerShell, `Select-String "expect" apps/practice-shop/e2e/challenges/pages/product-detail.page.ts` no imprime nada.
- El spec crea su propio producto con `createProduct`, con un precio y un stock que tú eliges. Abre la página de detalle haciendo clic en el enlace con el nombre del producto en la lista, y no escribiendo la dirección.
- El spec comprueba el título, el SKU, el precio, el stock y el estado, usando los valores del objeto del producto. Los test ids de la página de detalle aparecen solo en el Page Object, no en el spec.
- Después de `backToList()`, la dirección de la página termina en `/products`.
- Ejecutaste el spec dos veces seguidas y las dos pasaron.

Vas a necesitar algo que esta lección no enseñó: cómo comprobar una dirección de página que contiene un número, y cómo la página muestra el dinero. Busca: `playwright toHaveURL regex`, `javascript number toFixed two decimals`. El archivo `apps/practice-shop/lib/api.ts` muestra cómo la página da formato a un precio.

## Piénsalo bien

1. Predice qué imprime este código simple y explica por qué la segunda línea es `true`.

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

page = [{ id: 7, name: "Desk Lamp" }]

console.log("same object as before:", found === page[0])
console.log("recipe finds the new one:", recipe() === page[0])
```

<details><summary>Respuesta</summary>

Imprime `same object as before: false` y `recipe finds the new one: true`. La variable `found` guarda el objeto viejo, que la "página" tiró cuando lo reemplazó por un array nuevo con un objeto nuevo. La receta es una función, así que busca de nuevo en la página actual cada vez. Un locator de Playwright funciona como la receta, y por eso un locator que hiciste antes de que cargara la página sigue funcionando después.

</details>

2. Un compañero escribe este locator en el Page Object. El código se ejecuta sin errores, y un test de borrado que lo usa pasa. Encuentra el bug.

```ts
this.rows = page.getByTestId("products-row")
// in the spec, after products.delete(id):
await expect(products.rows).toHaveCount(0)
```

<details><summary>Respuesta</summary>

`getByTestId` con un string busca el valor completo, y ningún elemento tiene el id `products-row`. Los ids llevan el id del registro, como `products-row-12`. Entonces `rows` siempre encuentra cero elementos, y `toHaveCount(0)` siempre pasa, incluso si el borrado no ocurrió. El locator real usa un patrón, `/^products-row-/`, o un método `row` con el id del producto. Una buena revisión también prueba que el test puede fallar: ejecútalo una vez sin el borrado y mira cómo se pone en rojo.

</details>

3. Dos versiones funcionan. La versión uno es una clase `ProductsPage` con `delete(id)`. La versión dos es un archivo con funciones simples, `deleteProduct(page, id)`, `searchProducts(page, text)`, y sin clase. ¿Cuál eliges aquí y qué te haría cambiar de opinión?

<details><summary>Respuesta</summary>

Para una suite pequeña, las funciones simples son más sencillas y siguen *KISS* (mantenlo simple). Una clase ayuda cuando la página tiene muchos locators que varias acciones comparten, porque los locators se crean una vez y el autocompletado muestra lo que ofrece la página. Elige la clase cuando la página tiene unos cinco locators o más y más de un spec los usa. Elige funciones cuando tienes una o dos acciones y ningún estado compartido. Los hábitos del equipo también importan: elige lo que el equipo pueda leer sin una guía.

</details>

4. El equipo de producto cambia el borrado: el diálogo ahora tiene un cuadro de texto "Reason" (motivo), y el botón de confirmar queda deshabilitado hasta que el cuadro tenga texto. ¿Qué archivos debes cambiar si usas `ProductsPage.delete(id)`, y cuáles si cada spec hace los clics por su cuenta? ¿Qué todavía puede romperse en los specs que usan el Page Object?

<details><summary>Respuesta</summary>

Con el Page Object cambias un método: `delete` debe llenar el motivo antes del clic de confirmar. Con specs simples cambias cada test que borra. El Page Object no protege a los specs que abren el diálogo y cancelan, porque nunca llegan al motivo, así que siguen funcionando. Un spec que revisa el texto del diálogo puede necesitar una actualización. El Page Object hace el cambio pequeño y local, pero no lo elimina.

</details>

5. `rowByName(name)` usa `this.rows.filter({ hasText: name })`. Existen dos productos: "Mouse Pad" y "Wireless Mouse". ¿Qué pasa cuando un test llama `products.rowByName("Mouse")` y luego hace clic? ¿Qué pasa cuando la tienda tiene dos productos con exactamente el mismo nombre?

<details><summary>Respuesta</summary>

`hasText` coincide con una parte del texto, así que "Mouse" coincide con las dos filas. Un clic sobre un locator que coincide con dos elementos falla con un error de *strict mode* (modo estricto). Dos productos con el mismo nombre exacto dan el mismo resultado. El test debe buscar un nombre único, como hace `uniqueName` en la suite, o usar la fila con el id del producto. El método es seguro solo cuando el nombre que le pasas es único.

</details>

6. Un compañero quiere el nuevo `ProductFormPage` ya, aunque hoy solo un spec usa el formulario. Otro dice que se espere al segundo spec. ¿Quién tiene razón?

<details><summary>Respuesta</summary>

No hay una única respuesta correcta. Esperar sigue *YAGNI* (no lo vas a necesitar) y mantiene el código pequeño, y la clase es fácil de extraer después porque los locators ya están en el spec. Construirlo ahora es mejor si sabes que un segundo spec llega esta semana, porque evita la primera copia de los ids. También depende de qué tan estable es el formulario: un formulario que cambia seguido es una buena razón para tener un solo lugar donde editar. El costo de equivocarse es pequeño en los dos casos, así que decide rápido y sigue.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es el principio de responsabilidad única y lo rompe un page object con 40 métodos?**
   - Busca: `single responsibility principle explained`
   - Pruébalo: cuenta los métodos de `ProductsPage`. Agrúpalos en "dónde están las cosas", "qué hace un usuario" y "otros". Escribe qué grupo separarías primero si la clase creciera a 40 métodos.
   - Una buena respuesta explica: el principio en una frase y cómo podrías dividir un page object grande.

2. **¿Qué es un component object y cuándo es mejor que un page object grande?**
   - Busca: `page object component object pattern test automation`
   - Pruébalo: el diálogo de confirmación aparece en la página de lista y en la de detalle. En un archivo de borrador, escribe una clase pequeña `ConfirmDialog` con `confirm()` y `cancel()`, y úsala desde dos page objects en tu cabeza o en papel. Escribe qué código duplicado elimina.
   - Una buena respuesta explica: qué es un componente, como un menú o un diálogo, y por qué compartirlo entre páginas ayuda.

3. **¿Por qué algunos testers dicen que un page object no debe tener aserciones, mientras otros no están de acuerdo?**
   - Busca: `page object assertions Martin Fowler PageObject`
   - Pruébalo: toma el test de borrado de esta lección. Escribe una segunda versión donde `deleteAndCheckGone(id)` esté en el Page Object. Pon las dos versiones lado a lado y marca cuál le dice más a un lector nuevo sobre lo que se comprueba.
   - Una buena respuesta explica: el argumento de cada lado y qué regla sigue tu equipo.

## Siguiente paso

En la próxima lección aprendes cómo la suite inicia sesión una sola vez y reutiliza la sesión en cada test.
