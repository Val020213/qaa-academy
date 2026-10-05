---
title: Preparar datos por la API
summary: Usa la API para crear y borrar datos de test, y deja la interfaz solo para el test que trata de esa interfaz.
duration: 45 min
---

## Objetivo

- Explicar por qué los datos de test se preparan por la API.
- Leer los helpers de `api-client.ts`.
- Explicar cómo `page.request` comparte las cookies del navegador.
- Explicar por qué el endpoint de reinicio existe solo para los tests.

## Una regla

Un test trata de una sola cosa. En un test de borrado, esa cosa es el botón de borrar. Crear el producto que se va a borrar no es esa cosa.

Entonces la regla es: **la interfaz está bajo prueba solo en el test que trata de esa interfaz.** Todo lo demás, el test lo prepara por la API.

Una **API** es la forma en que los programas hablan con el servidor, sin pantalla. Una petición a la API es más rápida que hacer clics en un formulario. También tiene menos pasos que pueden fallar.

Para conseguir un producto que borrar por la interfaz, abres el formulario, llenas cinco campos y pulsas guardar. Un error en el formulario rompe entonces tu test de borrado. Por la API es una sola petición, y solo la función de borrar puede romper el test.

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

El segundo crea un producto. Usa `uniqueName` y `uniqueSku`, así que los datos son únicos. Puedes cambiar cualquier campo:

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

El helper comprueba que el estado sea `201`. Es el código HTTP para "creado". Si la API falla, el test se detiene aquí con un mensaje claro, y no más tarde en la pantalla.

El tercero borra un producto:

```ts
export async function deleteProduct(request: APIRequestContext, id: number): Promise<void> {
  const response = await request.delete(`/api/products/${id}`)
  expect(response.status()).toBe(204)
}
```

El estado `204` significa "hecho, no hay nada que devolver".

## Las cookies se comparten

El fixture `request` es un cliente para llamadas a la API. La configuración carga en él las cookies guardadas del administrador, igual que en `page`. Así la petición tiene la sesión iniciada como administrador.

`page.request` es el mismo tipo de cliente, pero pertenece a la página. Usa las cookies del contexto de navegador de la página. Cuando una cookie cambia en uno, el otro lo ve.

Lo viste en el test de cerrar sesión: `loginViaApi(page.request, ADMIN)` le da una sesión al navegador sin abrir la página de login.

## El test de borrado

Este es el test de borrado de `apps/practice-shop/e2e/products/products.spec.ts`:

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
3. Los únicos pasos de interfaz son los que están bajo prueba: el clic y la confirmación.

El test no necesita limpieza. El propio test borra el producto. Otros tests dejan sus productos. No pasa nada: los nombres son únicos y la próxima ejecución reinicia los datos.

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

Una llamada a este endpoint devuelve todos los datos a los datos semilla. El test de preparación lo usa una vez por ejecución.

Existe solo para los tests, así que está bloqueado en producción. Un endpoint que borra todos los datos sería peligroso en un sistema real. En un proyecto real, pide a los desarrolladores una herramienta así solo para tu entorno de pruebas.

> **Cuidado:** Nunca apuntes tus tests a un sistema de producción real. Usa un entorno de pruebas que puedas reiniciar.

## Profundiza

### Por qué la API es más rápida y la interfaz es una capa encima

El formulario de la tienda no habla con el servidor de una forma especial. Cuando haces clic en Save (guardar), la página envía esta petición: `POST /api/products`. Es la misma petición que envía `createProduct`. El servidor hace el mismo trabajo para ambas.

Por eso el camino de la interfaz tiene pasos extra. El navegador carga la página, React arranca, se escriben cinco campos, se pulsa el botón, la página pasa a la lista y la lista se carga otra vez. Cualquiera de estos pasos puede ser lento o romperse. El camino de la API tiene un solo paso. Cuando solo necesitas que exista un producto, un paso es mejor que ocho.

### Una idea equivocada común: los datos de la API hacen el test menos real

Algunas personas dicen que un test es falso si los datos no vinieron de la pantalla. Esto no es cierto. Un test debe ser real en aquello que comprueba. El test de borrado comprueba el flujo de borrado. No necesita probar que el formulario de crear funciona. Otro test, "a new product appears at the top of the list" (un producto nuevo aparece al inicio de la lista), lo hace.

Una segunda idea equivocada es la contraria: "la API acepta cualquier cosa". No es así. La API aplica las mismas reglas que el formulario. Piensa en esto: ¿qué pasa cuando un test llama a `createProduct(request, { price: 0 })`? El servidor responde `422`, porque el precio debe ser mayor que 0. El helper espera `201`, así que el test se detiene en la línea del helper con un mensaje claro. Nunca escribes directamente en los datos saltándote las reglas.

### Cómo aparece en el trabajo de QA: pon el estado en un override

`createProduct` tiene valores por defecto y acepta *overrides* (valores que reemplazan a los de por defecto). Un test indica solo el campo que importa:

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

El cuerpo del producto, con nombre, SKU, precio y stock, se escribe una vez en el helper. El test muestra solo `status: "archived"`, así que quien lee ve qué tiene de especial. Esto es DRY, y además mantiene el test legible.

### Un equilibrio

El helper de API ata tus tests a la API. Si la API cambia, por ejemplo con un nuevo campo obligatorio, `createProduct` se rompe, y también todos los tests que lo usan. Lo arreglas en un solo lugar. Es un buen trato. Pero solo funciona cuando la API es estable y tu equipo te da acceso. Si no hay API, usa la interfaz para la preparación y manténla corta.

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

4. El test nunca abre una página del navegador. Fíjate en lo rápido que se ejecuta comparado con los tests de interfaz.
5. Escribe una frase: ¿por qué este test no necesita `uniqueName` en su propio código?

## Comprueba lo que sabes

1. ¿Cuándo se usa la interfaz para crear datos?

<details><summary>Respuesta</summary>

Solo en el test que trata de esa interfaz, como el test del formulario de crear.

</details>

2. ¿Qué comparte `page.request` con la página?

<details><summary>Respuesta</summary>

Las cookies del contexto de navegador.

</details>

3. ¿Por qué `createProduct` comprueba el estado 201?

<details><summary>Respuesta</summary>

Si la API falla, el test se detiene de inmediato con un error claro, y no más tarde en la pantalla.

</details>

4. ¿Por qué el endpoint de reinicio responde 404 en producción?

<details><summary>Respuesta</summary>

Borra todos los datos. Debe existir solo para los tests.

</details>

5. ¿Qué pasa cuando un test ejecuta `createProduct(request, { price: 0 })`? Nombra el código de estado y di dónde se detiene el test.

<details><summary>Respuesta</summary>

El servidor rechaza el precio, porque la regla dice que debe ser mayor que 0. Responde `422`. El helper espera `201`, así que la comprobación dentro de `createProduct` falla. El test se detiene en la línea de `createProduct`, antes de abrir cualquier página. El error muestra `422` frente a `201`.

</details>

6. Este test falla a veces, porque el producto nuevo no está en la lista. Encuentra el error.

```ts
test("the new product is in the list", async ({ page, request }) => {
  const products = new ProductsPage(page)
  await products.goto()
  const product = await createProduct(request)

  await expect(products.row(product.id)).toBeVisible()
})
```

<details><summary>Respuesta</summary>

La página carga la lista una vez, cuando se abre. El producto se crea después, así que la lista en pantalla no lo incluye. El test espera una fila que nunca llega. Crea primero el producto y luego abre la página. Así la lista que se carga ya contiene el producto.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué significan los códigos de estado HTTP 201, 204, 401, 403, 404 y 422?**
   - Busca: `HTTP status codes MDN 422 403`
   - Una buena respuesta explica: el significado de cada código en una frase y cuáles devuelve la tienda para cada problema.

2. **¿Qué hacen los métodos HTTP GET, POST, PUT y DELETE en una API REST?**
   - Busca: `REST API methods GET POST PUT DELETE`
   - Una buena respuesta explica: qué hace cada método y cuál usa la tienda para crear, cambiar y borrar un producto.

3. **¿Por qué los equipos construyen endpoints solo para tests, como un reinicio, y qué riesgos traen?**
   - Busca: `test-only endpoints security risk production`
   - Una buena respuesta explica: por qué el endpoint ayuda a los tests y cómo un equipo lo mantiene lejos de producción.

## Siguiente paso

En la próxima lección aprendes por qué los tests se vuelven inestables (*flaky*) y cómo encontrar la causa.
