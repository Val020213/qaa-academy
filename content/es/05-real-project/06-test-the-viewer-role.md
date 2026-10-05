---
title: Probar el rol viewer
summary: Prueba a un segundo usuario empezando sin sesión y entrando como viewer por la API, dentro del propio spec.
duration: 35 min
---

## Objetivo

- Explicar por qué un segundo usuario necesita una segunda sesión.
- Empezar un spec sin sesión y entrar como viewer.
- Comprobar que faltan controles sin escribir un falso positivo.
- Verificar que la API rechaza al viewer con el estado 403.

## El problema

Todos los tests de la suite empiezan con sesión de admin. La configuración carga `e2e/.auth/admin.json` para todos los tests. Pero el viewer es otro usuario con otra sesión. No puedes ser los dos a la vez en un mismo contexto de navegador.

Un **contexto de navegador** es un perfil de navegador limpio que usa un test. Tiene sus propias cookies. Por eso el viewer necesita un contexto con la cookie del viewer.

## El enfoque más simple

Hazlo dentro del spec, en tres pasos.

1. Reemplaza la sesión del admin por una vacía: `test.use({ storageState: { cookies: [], origins: [] } })`. El test empieza sin sesión. El archivo `auth.spec.ts` también lo hace.
2. En `beforeEach`, llama a `loginViaApi(page.request, VIEWER)`. Envía un POST a `/api/auth/login`.
3. `page.request` comparte las cookies con la página. La cookie de sesión llega al contexto, así que `page.goto` ya ve al viewer con sesión iniciada.

`loginViaApi` y `VIEWER` vienen de `lib/fixtures/api-client.ts`. Un *hook* **`beforeEach`** (gancho que se ejecuta antes de cada test) es código que corre antes de cada test de su grupo.

> **Cuidado:** Pasa `page.request`, no la fixture `request`. La fixture `request` tiene su propio almacén de cookies, no el de la página. Un login con ella no iniciaría sesión en la página.

## Controles ausentes

Quieres comprobar que algo no está. Usa `toHaveCount(0)`.

Hay una trampa. Si la página aún no cargó, también hay cero botones. La aserción pasa por la razón equivocada. Por eso primero espera algo que debe existir: la primera fila. Luego comprueba que la cuenta es 0.

Las filas tienen testid con el id del producto dentro, como `products-edit-12`. Una expresión regular los reconoce todos: `getByTestId(/^products-edit-/)`.

## La comprobación de la API

La interfaz oculta los botones. Pero un botón oculto no es seguridad. Alguien aún puede llamar a la API. El servidor debe rechazar la petición.

`page.request.post(url, { data })` envía una petición POST con la cookie del viewer. La API responde con el estado 403, que significa "forbidden" (prohibido): te conoce, pero no puedes hacer esto. El cuerpo trae un mensaje.

## El spec completo

Crea `apps/practice-shop/e2e/products/viewer.spec.ts`.

```ts
import { expect, test } from "../lib/test"
import { VIEWER, loginViaApi } from "../lib/fixtures/api-client"
import { uniqueName, uniqueSku } from "../lib/helpers"
import { ProductsPage } from "../lib/pages/products.page"

// Start signed out. The saved admin session is not used in this file.
test.use({ storageState: { cookies: [], origins: [] } })

test.describe("Viewer role", () => {
  test.beforeEach(async ({ page }) => {
    // The cookie lands in the browser context, so page.goto sees it too.
    await loginViaApi(page.request, VIEWER)
  })

  test("the viewer sees the products but no New, Edit or Delete", async ({ page }) => {
    const products = new ProductsPage(page)

    await products.goto()

    await expect(page.getByTestId("user-role")).toHaveText("viewer")
    // Wait for the rows first. A "0 buttons" check on an empty page proves nothing.
    await expect(products.rows.first()).toBeVisible()
    await expect(products.newButton).toHaveCount(0)
    await expect(page.getByTestId(/^products-edit-/)).toHaveCount(0)
    await expect(page.getByTestId(/^products-delete-/)).toHaveCount(0)
  })

  test("the API answers 403 when the viewer creates a product", async ({ page }) => {
    const response = await page.request.post("/api/products", {
      data: { name: uniqueName("Blocked"), sku: uniqueSku(), price: 9.5, stock: 1, status: "active" },
    })

    expect(response.status()).toBe(403)
    expect(await response.json()).toEqual({ message: "Your role does not allow this action." })
  })
})
```

El primer test también comprueba `user-role`. Esto demuestra que la página realmente tiene sesión como viewer, y no como un admin que quedó de antes.

## La alternativa

Puedes añadir un segundo test de setup que inicie sesión como viewer y guarde `e2e/.auth/viewer.json`. Entonces los specs del viewer usan `test.use({ storageState: "e2e/.auth/viewer.json" })`, que vale la pena cuando muchos specs necesitan al viewer.

## Práctica

1. Crea `products/viewer.spec.ts` con el código de arriba.
2. Ejecútalo: `pnpm --filter practice-shop e2e e2e/products/viewer.spec.ts`.
3. Para ver que el spec puede fallar, entra temporalmente con `ADMIN` en lugar de `VIEWER` (añade `ADMIN` al import). Ejecútalo. Lee el fallo. Deshaz el cambio.
4. Añade un tercer test: el viewer abre `/orders` y no ve botones `orders-mark-paid-`. Usa una expresión regular y espera antes una fila.
5. Actualiza `COVERAGE.md`: la fila del rol viewer queda cubierta y se quita el hueco.

## Comprueba lo que sabes

1. ¿Por qué el test del viewer necesita `storageState` con cookies vacías?

<details><summary>Respuesta</summary>

Sin eso, el test empieza como admin. El test del viewer debe empezar sin sesión y luego entrar como viewer.

</details>

2. ¿Por qué esperar la primera fila antes de `toHaveCount(0)`?

<details><summary>Respuesta</summary>

En una página que aún no cargó, la cuenta también es 0. El test pasaría sin demostrar nada.

</details>

3. ¿Por qué probar la API y no solo los botones ocultos?

<details><summary>Respuesta</summary>

Un botón oculto no es seguridad. El servidor mismo debe rechazar la petición.

</details>

## Siguiente paso

En la próxima lección llevarás tu trabajo a un pull request.
