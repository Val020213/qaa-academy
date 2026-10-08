---
title: Preparar datos por la API
duration: 50 min
---

## Objetivo

Prepara los datos de un test por la API y usa la interfaz para comprobar el comportamiento que estás probando. En esta lección trabajas con los helpers de la tienda y sus respuestas.

- Elegir cuándo preparar datos por la API y cuándo usar la interfaz.
- Leer las respuestas a datos válidos e inválidos.
- Distinguir las cookies de `page.request` y del fixture `request`.
- Reconocer para qué sirve el endpoint de reinicio de los tests.

## Preparar, actuar y comprobar

En un test de borrado, crear el producto es preparación. El clic en borrar y la confirmación son las acciones que quieres probar. Preparar el producto por la API evita que un bug en el formulario de creación haga fallar ese test.

La API prepara el producto en una petición, sin depender del formulario de creación. La preparación, la autenticación o la carga de la lista todavía pueden hacer fallar el test.

El formulario envía `POST /api/products` al guardar un producto nuevo. El helper de preparación envía la misma petición sin abrir el formulario ni llenar sus campos. El servidor procesa los datos por la misma ruta.

![Con una sesión admin válida, el formulario y el helper llegan a la misma validación del servidor.](/images/04-api-preparation.es.svg)

Si el test comprueba la creación desde el formulario, usa la interfaz para crear el producto. Si tu entorno no ofrece una API para preparar datos, usa la interfaz y mantén esa preparación corta.

## Los helpers del cliente de API

Abre `apps/practice-shop/e2e/lib/fixtures/api-client.ts`. El comentario de arriba dice:

```ts
// The "request" fixture and "page.request" both carry the cookies of the
// saved admin session, so these helpers work as admin by default.
```

El archivo tiene tres helpers. El primero inicia sesión:

```ts
export async function loginViaApi(
  request: APIRequestContext,
  user: { email: string; password: string }
): Promise<void> {
  const response = await request.post("/api/auth/login", {
    data: { email: user.email, password: user.password },
  })
  expect(response.ok()).toBeTruthy()
}
```

`loginViaApi` envía las credenciales y comprueba que la respuesta sea exitosa. El segundo helper crea un producto con valores por defecto:

```ts
export async function createProduct(
  request: APIRequestContext,
  overrides: Partial<Omit<Product, "id">> = {}
): Promise<Product> {
  const response = await request.post("/api/products", {
    data: {
      name: uniqueName("Product"),
      sku: uniqueSku(),
      price: 19.99,
      stock: 10,
      status: "active",
      ...overrides,
    },
  })
  expect(response.status()).toBe(201)
  return (await response.json()) as Product
}
```

`uniqueName` y `uniqueSku` generan el nombre y el SKU. Los valores de `overrides` se colocan al final, así que reemplazan los valores por defecto de los campos que indiques.

La aserción comprueba el estado `201` antes de devolver el producto. Si el servidor rechaza los datos, el helper falla durante la preparación.

El tercero borra un producto:

```ts
export async function deleteProduct(request: APIRequestContext, id: number): Promise<void> {
  const response = await request.delete(`/api/products/${id}`)
  expect(response.status()).toBe(204)
}
```

El estado `204` indica que el servidor completó el borrado sin devolver un cuerpo.

### Los límites que acepta la API

Las reglas están en `apps/practice-shop/lib/validation.ts`. El stock debe ser un número entero, 0 o más. El precio debe ser mayor que 0. Con los demás campos válidos, las respuestas son:

- `createProduct(request, { stock: 0 })`: el servidor responde `201`.
- `createProduct(request, { stock: -1 })`: el servidor responde `422` y falla la aserción del helper.
- `createProduct(request, { price: 0.001 })`: el servidor responde `201`, porque no hay un precio mínimo positivo por encima de cero.

Una respuesta `422` identifica el campo inválido y su mensaje:

```json
{ "errors": { "stock": "Stock must be a whole number, 0 or more." } }
```

Tanto el helper como el formulario envían los datos a la API. La ruta del servidor llama a `validateProduct` y devuelve `422` para un precio de 0; el formulario muestra el error recibido.

Para probar cómo muestra la lista un precio pequeño, usa un valor permitido como `0.01`. Para probar el mensaje del formulario con precio 0, introduce ese valor desde la interfaz.

## Las cookies de cada cliente

La configuración carga las cookies guardadas del admin tanto en el fixture `request` como en el contexto del navegador de `page`. Los dos empiezan con esa sesión, pero tienen almacenes de cookies separados.

`page.request` comparte las cookies del contexto del navegador de la página. Playwright envía esas cookies con las peticiones de ese cliente y actualiza las del navegador cuando el servidor devuelve una cookie. Por eso `loginViaApi(page.request, ADMIN)` inicia sesión también en el navegador del test.

El fixture `request` guarda sus propias cookies. Un login a través de ese fixture cambia su sesión, sin cambiar las cookies del navegador.

## El test de borrado

Este test de `apps/practice-shop/e2e/products/products.spec.ts` prepara el producto por la API y lo borra desde la interfaz:

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

El test crea el producto antes de abrir la lista. La aserción espera a que su fila sea visible; luego el Page Object hace clic en borrar y confirma el diálogo. Las dos aserciones finales comprueban que la fila desapareció y que el mensaje contiene el nombre del producto.

![La respuesta de la API llega antes de que la navegación pida la lista.](/images/04-prepare-before-navigation.es.svg)

Si el test termina correctamente, el propio borrado limpia el producto. Otros tests dejan datos que el setup reinicia en la próxima ejecución. En un entorno que no se reinicia, o si esos datos afectan un conteo posterior, necesitas limpiar los productos que creaste.

Si la API cambia y exige un campo nuevo, los tests que usan `createProduct` fallan durante la preparación. Agregar el valor por defecto en el helper actualiza esa preparación en un solo lugar.

## El endpoint de reinicio

Mira `apps/practice-shop/app/api/test/reset/route.ts`:

```ts
// Restores the seed products and orders; keeps existing sessions.
// In production it answers 404 unless ENABLE_TEST_API is a nonempty string.
export async function POST() {
  if (process.env.NODE_ENV === "production" && !process.env.ENABLE_TEST_API) {
    return new NextResponse(null, { status: 404 })
  }
  resetStore()
  return NextResponse.json({ ok: true })
}
```

El test de `global.setup.ts` llama a este endpoint al inicio de cada ejecución para restaurar los datos iniciales.

Es una herramienta de tests. En producción responde `404` si `ENABLE_TEST_API` está ausente o vacío; cualquier texto no vacío, incluso `"false"`, permite el reinicio. Un endpoint que borra todos los datos sería peligroso en un sistema real. En un proyecto real, pide a los desarrolladores una herramienta así solo para tu entorno de pruebas.

> **Cuidado:** Nunca apuntes tus tests a un sistema real de producción. Usa un entorno de pruebas que puedas reiniciar.

## Profundiza

### Dejar visible el dato que importa

Un test puede usar los valores por defecto del helper y cambiar solo el campo que determina el caso:

```ts
import { expect, test } from "../lib/test"
import { createProduct } from "../lib/fixtures/api-client"
import { ProductsPage } from "../lib/pages/products.page"

test("an archived product shows the archived badge", async ({ page, request }) => {
  const product = await createProduct(request, { status: "archived" })
  const products = new ProductsPage(page)
  await products.goto()
  await expect(products.row(product.id)).toBeVisible()

  await expect(page.getByTestId(`products-status-${product.id}`)).toHaveText("archived")
})
```

El test muestra `status: "archived"`, que es el dato necesario para comprobar la etiqueta. El helper reúne el resto de la preparación.

### Comprobar el cuerpo de la respuesta

`createProduct` comprueba el estado `201`, pero no compara cada campo devuelto con el que envió. Un servidor que devolviera ese estado con un precio incorrecto pasaría la aserción del helper. Como el helper devuelve el producto, el test puede comprobar `product.price` cuando el precio forme parte del caso.

## Práctica

1. Abre `apps/practice-shop/e2e/lib/fixtures/api-client.ts`. Encuentra las tres líneas `expect` que comprueban la respuesta.
2. Crea el archivo `apps/practice-shop/e2e/products/api-practice.spec.ts` con este código:

```ts
import { expect, test } from "../lib/test"
import { createProduct, deleteProduct } from "../lib/fixtures/api-client"

test("a product made through the API can be read, then deleted", async ({ request }) => {
  const product = await createProduct(request)

  const found = await request.get(`/api/products/${product.id}`)
  expect(found.status()).toBe(200)

  await deleteProduct(request, product.id)

  const gone = await request.get(`/api/products/${product.id}`)
  expect(gone.status()).toBe(404)
})
```

3. Inicia la tienda con `pnpm shop:dev`. En otra terminal ejecuta:

```bash
pnpm shop:e2e products/api-practice.spec.ts
```

4. Agrega esta línea al inicio del archivo: `import { uniqueSku } from "../lib/helpers"`. Luego agrega este test al mismo archivo y ejecútalo:

```ts
test("the API answers the edge cases", async ({ request }) => {
  for (const change of [{ stock: 0 }, { stock: -1 }, { price: 0.001 }]) {
    const response = await request.post("/api/products", {
      data: { name: "Edge case", sku: uniqueSku(), price: 5, stock: 5, status: "draft", ...change },
    })
    console.log(JSON.stringify(change), response.status(), await response.text())
  }
})
```

5. Comprueba que la salida muestra los estados `201`, `422` y `201`, en ese orden. Revisa que el cuerpo del `422` contiene el error de stock mostrado en la lección.

## Reto

Prepara por la API un total de productos que sea múltiplo exacto de 10, creando solo los productos que falten. Luego recorre todas las páginas de la lista para comprobar que no aparece una página extra vacía.

Crea el archivo `apps/practice-shop/e2e/challenges/pagination-edge.spec.ts`.

Está terminado cuando:

- El test lee el total real con `GET /api/products` y crea solo los productos necesarios con `createProduct`.
- `products-page` muestra `Page 1 of N`, donde N es el total dividido entre 10. El test hace clic en `products-next-page` hasta la última página y comprueba el texto de `products-page` después de cada clic.
- En la última página, `products-next-page` está deshabilitado y la página muestra 10 filas.
- `pnpm shop:e2e challenges/pagination-edge.spec.ts --repeat-each 2` pasa las dos veces.

Busca: `playwright APIResponse json`, `javascript remainder operator`, `playwright toBeDisabled`, `playwright toHaveText regular expression`.

## Piénsalo bien

1. Los datos iniciales tienen 24 productos. Un test llama `createProduct(request, { stock: 0, price: 0.01 })` una vez y abre `/products`. ¿Qué muestran `products-count` y `products-page`? ¿Qué cambia si crea 6 productos en vez de 1?

<details><summary>Respuesta</summary>

Con un producto nuevo, el conteo muestra "25 products" y la página muestra "Page 1 of 3". Con seis, muestra "30 products" y "Page 1 of 3". La última página pasa de tener 5 filas a tener 10.

</details>

2. Este test a veces pasa y a veces falla. ¿Qué está mal en el orden de preparación?

```ts
test("the new product is in the list", async ({ page, request }) => {
  const products = new ProductsPage(page)
  await products.goto()
  const product = await createProduct(request)

  await expect(products.row(product.id)).toBeVisible()
})
```

<details><summary>Respuesta</summary>

Al abrir la página, React inicia la carga de la lista desde la API. En este ejemplo no hay otra acción que vuelva a cargarla. El test crea el producto después de `goto`, así que hay una carrera (*race*). Si el servidor atiende la petición de la lista antes de crear el producto, la fila no aparece. Crea primero el producto y luego abre la página.

</details>

3. Los desarrolladores agregan un campo obligatorio, `category`, al producto. ¿Dónde fallan los tests que usan `createProduct` y cuántos lugares debes editar para actualizar su preparación?

<details><summary>Respuesta</summary>

La API responde `422` y falla la aserción del helper que espera `201`. Agrega una `category` por defecto en `createProduct`. Los tests que crean productos desde el formulario necesitan actualizar su preparación por separado.

</details>

## Siguiente paso

En la próxima lección aprendes por qué los tests se vuelven inestables y cómo encontrar la causa.
