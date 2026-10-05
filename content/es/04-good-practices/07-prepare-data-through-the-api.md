---
title: Preparar datos por la API
summary: Usa la API para crear y borrar datos de prueba, y deja la interfaz para el único test que trata de ella.
duration: 30 min
---

## Objetivo

- Explicar por qué los datos de prueba se preparan por la API.
- Leer las funciones de ayuda de `api-client.ts`.
- Explicar cómo `page.request` comparte las cookies del navegador.
- Explicar por qué el endpoint de reinicio existe solo para tests.

## Una regla

Un test trata de una sola cosa. En un test de borrar, esa cosa es el botón de borrar. Crear el producto que se va a borrar no es esa cosa.

Entonces la regla es: **la interfaz se prueba solo en el test que trata de esa interfaz.** Todo lo demás, el test lo prepara por la API.

Una **API** es la forma en que los programas hablan con el servidor, sin pantalla. Una petición a la API es más rápida que hacer clics en un formulario. También tiene menos pasos que pueden fallar.

Para tener un producto que borrar por la interfaz, abres el formulario, llenas cinco campos y haces clic en guardar. Entonces un *bug* (error) en el formulario rompe tu test de borrar. Por la API es una sola petición, y solo la función de borrar puede romper el test.

## Las funciones de ayuda del cliente de API

Abre `apps/practice-shop/e2e/lib/fixtures/api-client.ts`. El comentario de arriba dice:

```ts
// The "request" fixture and "page.request" both carry the cookies of the
// saved admin session, so these helpers work as admin by default.
```

El archivo tiene tres funciones de ayuda. La primera inicia sesión:

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

La segunda crea un producto. Usa `uniqueName` y `uniqueSku`, así que los datos son únicos. Puedes cambiar cualquier campo:

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

La función comprueba que el estado sea `201`. Es el código HTTP que significa "creado". Si la API falla, el test se detiene aquí con un mensaje claro, no más tarde en la pantalla.

La tercera borra un producto:

```ts
export async function deleteProduct(request: APIRequestContext, id: number): Promise<void> {
  const response = await request.delete(`/api/products/${id}`)
  expect(response.status()).toBe(204)
}
```

El estado `204` significa "hecho, nada que devolver".

## Las cookies se comparten

El fixture `request` es un cliente para llamadas a la API. La configuración le carga las cookies guardadas del admin, igual que a `page`. Así, la petición va con la sesión del admin.

`page.request` es el mismo tipo de cliente, pero pertenece a la página. Usa las cookies del contexto de navegador de la página. Cuando una cookie cambia en uno, el otro lo ve.

Ya lo viste en el test de cerrar sesión: `loginViaApi(page.request, ADMIN)` le da al navegador una sesión sin abrir la página de login.

## El test de borrar

Este es el test de borrar de `apps/practice-shop/e2e/products/products.spec.ts`:

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

Léelo en orden.

1. `createProduct(request)` prepara el producto por la API.
2. El test abre la página y espera la fila. Una fila visible significa que la página está lista.
3. Los únicos pasos por la interfaz son los que se prueban: el clic y la confirmación.

El test no necesita limpieza. El propio test borra el producto. Otros tests dejan sus productos. Eso está bien: los nombres son únicos y la siguiente ejecución reinicia los datos.

## El endpoint de reinicio

Mira `apps/practice-shop/app/api/test/reset/route.ts`:

```ts
// Test-only endpoint: puts the data back to its first state.
// A real project would never ship this to production, so it answers 404 there.
export async function POST() {
  if (process.env.NODE_ENV === "production" && !process.env.ENABLE_TEST_API) {
    return new NextResponse(null, { status: 404 })
  }
  resetStore()
  return NextResponse.json({ ok: true })
}
```

Una llamada a este *endpoint* (punto de acceso de la API) devuelve todos los datos a los datos semilla. El test de setup lo usa una vez por ejecución.

Existe solo para tests, así que está bloqueado en producción. Un endpoint que borra todos los datos sería peligroso en un sistema real. En un proyecto real, pide a los desarrolladores una herramienta así solo para tu entorno de pruebas.

> **Cuidado:** Nunca apuntes tus tests a un sistema real de producción. Usa un entorno de pruebas que puedas reiniciar.

## Práctica

1. Abre `apps/practice-shop/e2e/lib/fixtures/api-client.ts`. Busca las tres líneas `expect` que comprueban la respuesta.
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

4. El test nunca abre una página del navegador. Mira qué rápido se ejecuta comparado con los tests de interfaz.
5. Escribe una frase: ¿por qué este test no necesita `uniqueName` en su propio código?

## Comprueba lo que sabes

1. ¿Cuándo se usa la interfaz para crear datos?

<details><summary>Respuesta</summary>

Solo en el test que trata de esa interfaz, como el test del formulario de crear.

</details>

2. ¿Qué comparte `page.request` con la página?

<details><summary>Respuesta</summary>

Las cookies del contexto del navegador.

</details>

3. ¿Por qué `createProduct` comprueba el estado 201?

<details><summary>Respuesta</summary>

Si la API falla, el test se detiene de inmediato con un error claro, no más tarde en la pantalla.

</details>

4. ¿Por qué el endpoint de reinicio responde 404 en producción?

<details><summary>Respuesta</summary>

Borra todos los datos. Debe existir solo para tests.

</details>

## Siguiente paso

En la siguiente lección aprenderás por qué los tests se vuelven inestables y cómo encontrar la causa.
