---
title: Cerrar un hueco de cobertura
summary: Planifica un spec nuevo a partir de un hueco de COVERAGE.md, predice lo que cuesta cada decisión, escríbelo paso a paso y luego cierra un hueco sin solución dada.
duration: 100 min
---

## Empieza con un acertijo

Maya escribe un test para el formulario de edición de la tienda. Empieza directamente en la página de edición:

```ts
await page.goto(`/products/${product.id}/edit`)
await page.getByTestId("product-name").fill("Renamed")
await page.getByTestId("product-save").click()
await expect(page.getByTestId(`products-name-${product.id}`)).toHaveText("Renamed")
```

Lo ejecuta 20 veces. Pasa 18 veces. Dos veces falla, y la lista sigue mostrando el nombre viejo. La aplicación no tiene ningún bug. Ningún paso muestra un error. Las ejecuciones que fallan se ven igual que las que pasan, hasta la última línea.

¿Qué es distinto en esas dos ejecuciones? ¿Qué línea es la causa?

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Planifica un spec en lenguaje sencillo antes de escribir código.
- Predice lo que te costará más adelante una decisión sobre los datos o sobre la navegación.
- Decide cómo obtiene sus datos cada test, y explica por qué.
- Escribe un spec para un hueco de `COVERAGE.md` y demuestra que puede fallar.

## Primero el plan, después el código

No abras el editor primero. Divide el problema en pasos con palabras simples. Esto se llama **descomposición**. Un plan corto escrito en frases, antes del código real, se llama **pseudocódigo**.

El hueco es "Editing a product" (editar un producto). Abre la tienda y edita un producto a mano. Luego escribe lo que ve el usuario. Cada frase se convertirá en un test.

1. El formulario de edición empieza con los valores actuales del producto.
2. Guardar un nombre y un estado nuevos actualiza la lista.
3. Un precio inválido muestra un error y el producto conserva sus datos anteriores.
4. Cancelar deja el producto sin cambios.

Antes de seguir, encuentra un escenario que falta. Piensa en el campo de stock, el campo SKU y un nombre vacío. ¿Por qué el plan no los incluyó? La respuesta es una decisión: cada test cuesta tiempo para ejecutarlo y para leerlo. La suite de la tienda ya prueba los errores de campo del formulario de creación en `products/products.spec.ts`. Un buen plan dice qué deja fuera, y por qué.

## Decide los datos

Cada test necesita un producto para editar. Imagina que los cuatro tests editan el producto de la semilla `SKU-0001`. ¿Qué esperas cuando el segundo test lo renombra y la próxima semana los tests corren en otro orden?

Dependen unos de otros. Un test deja un producto cambiado para el siguiente. Así que crea un producto nuevo para cada test.

Usa la interfaz solo para lo que estás probando. Aquí lo que se prueba es el formulario de edición. Por eso crea el producto por la API con `createProduct`. Es más rápido y más estable que llenar el formulario "New product" (producto nuevo).

`createProduct(request, overrides)` devuelve el producto con su `id`. Pasa `overrides` para fijar campos, como `{ price: 25 }`.

## Decide cómo llegar al formulario

Tienes dos formas de llegar al formulario de edición:

- A. Abrir `/products/<id>/edit` directamente con `page.goto`.
- B. Empezar en la lista, encontrar la fila y hacer clic en **Edit**.

A es más corta. ¿Cuál esperas que sea más estable? Decídelo antes de leer el siguiente párrafo.

La suite usa B. La tienda dibuja cada página primero en el servidor, y el navegador muestra ese HTML de inmediato. El JavaScript de React se carga un momento después y toma el control del formulario. El texto escrito en ese intervalo puede borrarse. Un clic dentro de la aplicación ocurre cuando React ya está funcionando, así que el formulario está listo.

El producto nuevo es el más reciente, así que está en la página 1 de la lista. La API ordena los productos por id, del más nuevo al más viejo.

### De vuelta al acertijo

Maya usó la opción A. En las dos ejecuciones que fallaron, su `fill` corrió en ese intervalo, antes de que React tomara el control. Entonces React devolvió el campo a su valor inicial. Ella hizo clic en Save con el nombre viejo, y la aplicación guardó el nombre viejo. Ningún paso falló. Solo la última aserción le avisó de que algo andaba mal.

La lección aquí es un método para encontrar este tipo de bug. **Depura como un científico.** Haz una hipótesis ("escribí demasiado pronto"). Haz un experimento pequeño (agrega una comprobación de que el campo tiene el valor nuevo antes de hacer clic). Cambia una sola cosa a la vez. Si los fallos se detienen, la hipótesis era correcta.

## Escribe el spec

Crea el archivo `apps/practice-shop/e2e/products/product-edit.spec.ts`. Fíjate en lo que reutiliza: `createProduct`, `uniqueName` y el *page object* `ProductsPage`. Un test también tiene una forma: **Arrange** (preparar: crear los datos y abrir la página), **Act** (actuar: hacer la acción) y **Assert** (comprobar: revisar lo que ve el usuario). Encuentra las tres partes en cada test.

```ts
import { expect, test } from "../lib/test"
import { createProduct } from "../lib/fixtures/api-client"
import { uniqueName } from "../lib/helpers"
import { ProductsPage } from "../lib/pages/products.page"

test.describe("Edit product", () => {
  test("the form starts with the current values", async ({ page, request }) => {
    const product = await createProduct(request, { price: 25, stock: 4, status: "draft" })
    const products = new ProductsPage(page)
    await products.goto()
    await expect(products.row(product.id)).toBeVisible()

    await page.getByTestId(`products-edit-${product.id}`).click()

    await expect(page.getByTestId("product-form-title")).toHaveText("Edit product")
    await expect(page.getByTestId("product-name")).toHaveValue(product.name)
    await expect(page.getByTestId("product-sku")).toHaveValue(product.sku)
    await expect(page.getByTestId("product-price")).toHaveValue("25")
    await expect(page.getByTestId("product-stock")).toHaveValue("4")
    await expect(page.getByTestId("product-status")).toHaveValue("draft")
  })

  test("saving a new name and status updates the list", async ({ page, request }) => {
    const product = await createProduct(request, { status: "active" })
    const newName = uniqueName("Renamed")
    const products = new ProductsPage(page)
    await products.goto()
    await expect(products.row(product.id)).toBeVisible()

    await page.getByTestId(`products-edit-${product.id}`).click()
    await page.getByTestId("product-name").fill(newName)
    await page.getByTestId("product-status").selectOption("archived")
    await page.getByTestId("product-save").click()

    await expect(page).toHaveURL(/\/products$/)
    await expect(page.getByTestId(`products-name-${product.id}`)).toHaveText(newName)
    await expect(page.getByTestId(`products-status-${product.id}`)).toHaveText("archived")
  })

  test("an invalid price shows an error and keeps the old data", async ({ page, request }) => {
    const product = await createProduct(request, { price: 30 })
    const products = new ProductsPage(page)
    await products.goto()
    await expect(products.row(product.id)).toBeVisible()

    await page.getByTestId(`products-edit-${product.id}`).click()
    await page.getByTestId("product-price").fill("0")
    await page.getByTestId("product-save").click()

    await expect(page.getByTestId("product-price-error")).toHaveText("Price must be greater than 0.")
    await expect(page).toHaveURL(new RegExp(`/products/${product.id}/edit$`))

    const saved = await request.get(`/api/products/${product.id}`)
    expect(((await saved.json()) as { price: number }).price).toBe(30)
  })

  test("cancel leaves the product unchanged", async ({ page, request }) => {
    const product = await createProduct(request)
    const products = new ProductsPage(page)
    await products.goto()
    await expect(products.row(product.id)).toBeVisible()

    await page.getByTestId(`products-edit-${product.id}`).click()
    await page.getByTestId("product-name").fill("Not saved")
    await page.getByTestId("product-cancel").click()

    await expect(page).toHaveURL(/\/products$/)
    await expect(page.getByTestId(`products-name-${product.id}`)).toHaveText(product.name)
  })
})
```

El control Edit es un enlace (`<a>`) que lleva el test id. `click()` funciona igual con un enlace que con un botón. Eliges los elementos por test id, no por etiqueta, así que el marcado puede cambiar sin romper el test.

## Léelo con cuidado

- Cada test crea su propio producto. Ningún test depende de otro.
- Cada test espera `products.row(product.id)` antes de hacer clic. Un clic ya espera a su elemento, así que la espera no es estrictamente necesaria. Pero declara la intención ("la lista está lista") y da un mensaje de fallo más claro que un clic que agota el tiempo.
- El tercer test comprueba los datos por la API, no solo en la pantalla. El formulario se queda en pantalla después de un error. La pantalla no te dice si el servidor guardó algo. La API sí. Mira el orden: el test primero espera el texto del error, y solo después lee la API. El texto del error prueba que el servidor ya respondió.
- No hay ningún `waitForTimeout`.

Ejecútalo dos veces. Luego actualiza `COVERAGE.md`: agrega una fila de Products para la edición y borra "Editing a product." de los huecos.

## Tus huecos

Elige un hueco a la vez. Primero planifica los escenarios con palabras. Cada pista es una dirección, no una solución.

- **Página de detalle del producto.** En la lista, el nombre del producto es un enlace. Haz clic y lee la página. Busca los test ids que empiezan con `product-detail-`, y `products-view-<id>` en la lista. ¿Cuáles ve también un viewer? ¿A dónde te lleva el enlace de regreso?
- **Eliminar desde la página de detalle.** La página de detalle tiene su propio botón Delete para el admin. Abre el mismo diálogo de confirmación que la lista. Después de confirmar, ¿a dónde va el navegador? ¿Cómo demuestras que el producto ya no existe?
- **Paginación.** La semilla tiene 24 productos, y otros tests agregan más. No escribas en el código el número de páginas. Mira los test ids `products-page`, `products-next-page` y `products-prev-page`. En la página 1, ¿qué botón está deshabilitado?
- **SKU duplicado.** Crea un producto por la API. Luego intenta crear otro con el mismo SKU en el formulario. Encuentra el texto del error debajo del campo SKU.
- **Pedido enviado.** Un pedido pagado se puede marcar como enviado. Los pedidos pagados de la semilla son 1002, 1006 y 1010. Revisa cuáles están libres. ¿Qué botones tiene un pedido enviado?
- **Filtro de pedidos vacío.** Ningún estado está vacío en los datos de la semilla, y los pedidos solo avanzan. No puedes vaciar un estado sin romper otros tests. Busca cómo Playwright puede responder una petición por sí mismo: el método `page.route`.
- **Página 404.** Abre un id de producto que no existe, como `/products/999999`. La página tiene su propio `data-testid`. Encuéntralo en `components/not-found-card.tsx`. Dos archivos usan esa tarjeta: `app/not-found.tsx` y `app/(dashboard)/not-found.tsx`. ¿Cuál se muestra para un producto desconocido, y por qué la página sigue teniendo el encabezado?
- **Volver a `?next=` después del login.** Empieza sin sesión. Abre una página protegida. Inicia sesión con el formulario. ¿Dónde debe terminar el navegador? Mira cómo `auth.spec.ts` empieza sin sesión.

## Profundiza

### Por qué la página necesita un momento: el renderizado en el servidor

La tienda dibuja la página primero en el servidor. El navegador recibe el HTML listo y lo muestra de inmediato. Después, el JavaScript de React se carga y conecta sus manejadores de eventos. Este paso se llama **hidratación** (*hydration*). Antes de que termine, la página parece lista pero no reacciona bien a lo que escribes.

Por eso la suite empieza en la lista, espera una fila y hace clic en **Edit**. Las filas de la lista vienen de una petición que el navegador envía después de que React corre. Cuando una fila está en pantalla, React ya está funcionando. Puedes entender mejor esta idea leyendo sobre renderizado en el servidor (*server-side rendering*) e hidratación. Muchos sitios modernos funcionan así.

### Una idea equivocada: "toHaveValue(25) es lo mismo que toHaveValue('25')"

El primer test comprueba `toHaveValue("25")` con comillas. ¿Por qué un *string* (texto)? Porque el texto de un campo de entrada siempre es texto. El número 25 y el texto "25" son distintos en TypeScript. Si escribes `toHaveValue(25)`, la revisión de tipos falla. Comprueba lo que la página realmente contiene, no lo que esperas que contenga.

### Cómo aparece en el trabajo real de automatización QA

Mira los cuatro tests. Cada uno empieza con las mismas tres líneas: ir a la lista, esperar la fila, hacer clic en Edit. Un candidato para **DRY** (*Don't Repeat Yourself*, no te repitas) es un método en el *page object*:

```ts
// Add to the ProductsPage class in lib/pages/products.page.ts
async openEdit(id: number) {
  await this.goto()
  // waitFor is a wait, not an assertion, so the Page Object stays assertion-free.
  await this.row(id).waitFor()
  await this.page.getByTestId(`products-edit-${id}`).click()
}
```

Ahora un test dice `await products.openEdit(product.id)`. Si cambia la forma de llegar al formulario, arreglas un solo lugar. Pero ten en cuenta el costo. El test ya no muestra la espera, y quien lo lee por primera vez debe abrir otro archivo para verla. La lección deja las tres líneas visibles a propósito, porque esta es una suite para aprender. Un equipo real puede decidir en cualquier sentido. La regla es: quita la repetición cuando ayude a quien lee, no solo para acortar el código.

La regla contraria es **YAGNI** (*You Aren't Gonna Need It*, no lo vas a necesitar): no construyas para necesidades que solo imaginas. No escribas un método `editProduct(id, { name, price, stock, status })` con cinco opciones "porque quizá lo necesitemos". Escríbelo cuando el segundo test lo necesite. **KISS** (*keep it simple*, hazlo simple) dice lo mismo: la versión simple que funciona hoy es mejor que la versión flexible que nadie usa.

### El costo de preparar datos por la API

Preparar datos con `createProduct` es rápido. Pero tiene un riesgo: si la API se rompe, fallan todos los tests que la usan, incluso los del formulario de edición. Por eso conserva un test que cree un producto por el formulario (la suite lo tiene en `products.spec.ts`). Así sabes que el camino de la interfaz funciona, y los demás solo reutilizan el atajo.

## Práctica

1. Crea `products/product-edit.spec.ts` con el código de arriba.
2. Ejecútalo: `pnpm --filter practice-shop e2e e2e/products/product-edit.spec.ts`.
3. Demuestra que el cuarto test puede fallar: en `product-edit.spec.ts`, cambia el test de cancelar para que haga clic en `product-save` en lugar de `product-cancel`. Ejecútalo. Lee el fallo. Deshaz el cambio.
4. Actualiza `COVERAGE.md`.
5. Elige un hueco de tu lista. Escribe sus escenarios con palabras sencillas en un archivo de texto.

## Reto

Cierra el hueco de **paginación**. Crea el archivo `apps/practice-shop/e2e/products/product-pagination.spec.ts`. La lista muestra 10 productos por página. La semilla tiene 24 productos, y otros tests agregan más, así que el número de páginas no es fijo. Tus tests deben seguir pasando cuando ese número crezca. Decide cómo demuestras que la página 2 muestra productos distintos a los de la página 1.

Está terminado cuando:

- La página 1 muestra exactamente 10 filas, el botón Previous está deshabilitado, el botón Next está habilitado, y el texto de la página empieza con "Page 1 of" sin un total fijo.
- Después de un clic en Next, el texto de la página empieza con "Page 2 of", Previous está habilitado, y la primera fila es un producto distinto de la primera fila de la página 1.
- Otro test llega a la última página sin un número escrito en tu código, y allí el botón Next está deshabilitado.
- El spec pasa dos veces seguidas, y cada test pasa cuando lo ejecutas solo con `--grep`.
- Cambias un número esperado a propósito, ejecutas el spec, lees el fallo y deshaces el cambio.

Vas a necesitar algo que esta lección no enseñó: cómo comprobar que un botón está deshabilitado, cómo comparar texto con una expresión regular y cómo leer un número de la página para usarlo en tu test. Busca: `playwright toBeDisabled`, `playwright toHaveText regular expression` y `playwright locator textContent`.

## Piénsalo bien

1. Supón que el servidor tiene un bug. Con un precio inválido, responde con el error, pero antes guarda el precio nuevo. Mira el tercer test de esta lección. ¿Qué aserciones pasan y cuál falla? Explica por qué.

<details><summary>Respuesta</summary>

El texto del error pasa, porque el servidor igual lo envía. La comprobación de la URL pasa, porque el formulario se queda en pantalla. La última aserción falla: la API devuelve el precio malo nuevo, no 30. Esto muestra que la pantalla puede verse bien mientras los datos están mal. Solo la lectura de la API puede ver la segunda parte del bug.

</details>

2. Un compañero escribe el final del tercer test así. El test pasa, pero la idea es incorrecta. Encuentra el bug.

```ts
await page.getByTestId("product-save").click()
const saved = await request.get(`/api/products/${product.id}`)
expect(((await saved.json()) as { price: number }).price).toBe(30)
await expect(page.getByTestId("product-price-error")).toBeVisible()
```

<details><summary>Respuesta</summary>

La lectura de la API corre justo después del clic. Puede que el navegador todavía no haya enviado la petición de guardado. Entonces la lectura ve el precio viejo, y el test pasa aunque el servidor guardara el precio malo un momento después. Comprueba primero el texto del error. Aparece solo después de que el servidor respondió, así que la lectura que sigue es segura. El orden de dos comprobaciones puede decidir si un test prueba algo o no.

</details>

3. La versión uno tiene las tres líneas (ir a la lista, esperar la fila, hacer clic en Edit) en cada test. La versión dos las mueve a `products.openEdit(id)`. ¿Cuál es mejor en esta suite, y qué te haría elegir la otra?

<details><summary>Respuesta</summary>

Para cuatro tests, muchos equipos elegirían la versión dos, porque un cambio en la forma de llegar al formulario se hace en un solo lugar. La versión uno mantiene cada test legible por sí solo, y quien aprende ve cada paso. Si el helper crece con opciones y esconde aserciones, o si solo dos tests lo usan, la versión uno es mejor. La decisión depende de qué tan seguido cambia el camino y de quién lee los tests.

</details>

4. El equipo de producto cambia la lista para mostrar primero los productos más viejos. ¿Qué se rompe en tus cuatro tests y qué cambias?

<details><summary>Respuesta</summary>

Se rompen los cuatro tests. El producto nuevo tiene el id más alto, así que ya no está en la página 1. `products.row(product.id)` nunca es visible, y el test agota el tiempo. Hay dos arreglos posibles: buscar primero el nombre único con `products.search(product.name)`, o abrir la página por su dirección. El primero mantiene el clic dentro de la aplicación. El costo es un paso más en cada test, y eso es una razón para moverlo a un helper.

</details>

5. Explica a un compañero, en tres frases, por qué la suite empieza en la lista y hace clic en Edit en lugar de abrir la dirección de edición. No uses la palabra "hidratación".

<details><summary>Respuesta</summary>

Una buena respuesta dice: el servidor envía una página terminada, y el código que la vuelve interactiva se carga un momento después. El texto escrito en ese momento puede borrarse. Un clic dentro de la aplicación ocurre cuando el código ya está funcionando, así que el formulario está listo. Cualquier respuesta que nombre la diferencia entre "visible" y "listo" es correcta.

</details>

6. Un colega dice: "La regla del precio inválido pertenece a un test de API pequeño, no a un test end-to-end. Es más rápido." ¿Estás de acuerdo?

<details><summary>Respuesta</summary>

No hay una única respuesta correcta. Un test de API es más rápido y encuentra una regla rota al instante. Un test end-to-end también prueba que el formulario muestra el mensaje bajo el campo correcto y que el usuario se queda en la página. Muchos equipos hacen las dos cosas: la regla se prueba por la API, y un test end-to-end muestra que el mensaje llega al usuario. La decisión depende de lo que cuesta ejecutar la suite y de qué tan seguido cambian por separado el formulario y la regla.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es la hidratación (hydration) en React y el renderizado en el servidor, y por qué puede hacer que los tests automáticos sean flaky?**
   - Busca: `react hydration server side rendering explained`
   - Pruébalo: abre la página de login de la tienda en Chrome. Abre las DevTools, presiona `Ctrl+Shift+P`, escribe "Disable JavaScript" y ejecútalo, luego recarga. Escribe en los campos y presiona Sign in (iniciar sesión). Anota lo que ves. Vuelve a activar JavaScript.
   - Una buena respuesta explica: qué envía el servidor, qué hace React después y por qué lo que se escribe antes de la hidratación se puede perder

2. **¿Cuál es la diferencia entre crear datos de prueba por la interfaz y por una API?**
   - Busca: `test data setup api vs ui automation`
   - Pruébalo: escribe un test desechable que cree 5 productos con `createProduct`, y otro que cree 5 por el formulario "New product". Ejecuta ambos con el reporter list y compara los tiempos. Borra el archivo.
   - Una buena respuesta explica: una ventaja y un riesgo de cada enfoque, y cuándo elige cada uno un equipo

3. **¿Qué significa el estado HTTP 201, y en qué se diferencia del 200?**
   - Busca: `http status 201 created vs 200 ok`
   - Pruébalo: abre las DevTools y luego la pestaña Network. Crea un producto en la tienda. Encuentra la petición a `/api/products` y lee su estado. Luego guarda una edición y compara el estado de esa petición.
   - Una buena respuesta explica: qué dice el 201 sobre el resultado de una petición POST, y por qué el helper lo comprueba

## Siguiente paso

En la siguiente lección pruebas a un segundo usuario, el viewer, que necesita una segunda sesión.
