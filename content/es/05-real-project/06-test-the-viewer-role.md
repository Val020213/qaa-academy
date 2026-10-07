---
title: Probar el rol viewer
duration: 60 min
---

## Objetivo

Vas a probar que el viewer puede leer productos y pedidos, pero no modificarlos. El spec comprobará los controles de la interfaz y el rechazo de una petición por la API.

- Iniciar un spec sin la sesión guardada del admin y entrar como viewer.
- Esperar datos antes de comprobar que faltan controles.
- Comprobar el estado y el mensaje de una petición rechazada.
- Verificar que un cambio rechazado deja el pedido sin modificar.

## Preparar la sesión del viewer

La configuración carga `e2e/.auth/admin.json` por defecto. Para probar al viewer, reemplaza ese estado e inicia su sesión dentro del spec:

1. Usa `test.use({ storageState: { cookies: [], origins: [] } })` para empezar sin sesión, como hace `auth.spec.ts`.
2. En `beforeEach`, llama a `loginViaApi(page.request, VIEWER)`. El helper envía un POST a `/api/auth/login`.
3. El servidor devuelve la cookie de sesión. Como `page.request` comparte las cookies con el contexto del navegador, `page.goto` abre la página con la sesión del viewer.

`loginViaApi` y `VIEWER` vienen de `lib/fixtures/api-client.ts`. El fixture `request` tiene un almacén de cookies separado: iniciar sesión con él no inicia la sesión de la página.

## Comprobar controles ausentes

`toHaveCount(0)` pasa en cuanto el locator encuentra cero elementos. Si encuentra alguno, Playwright repite la comprobación hasta que el conteo sea cero o se agote el tiempo. La aserción puede pasar antes de que lleguen los datos: una tabla vacía tampoco tiene controles Edit ni Delete.

Espera primero la primera fila. En esta tienda, las filas aparecen cuando el navegador recibe los productos de la API y React los muestra. Así, la ausencia de controles se comprueba sobre una lista con datos.

![El viewer ve productos y pedidos, pero no tiene botones New, Edit, Delete ni de acciones.](/clips/shop-viewer-role.webm)

Los test ids de los controles incluyen el id del producto, como `products-edit-12`. Usa `getByTestId(/^products-edit-/)` para encontrar los que empiezan con ese prefijo.

Ejecuta el spec una vez como admin para comprobar que detecta al usuario equivocado. Después restaura el login del viewer.

## Comprobar permisos por la API

La página de productos y la de pedidos leen el rol del usuario. Para el viewer, React omite los controles y la columna Actions, incluido su encabezado.

El servidor comprueba el rol por separado, porque una petición puede llegar sin usar esos controles. `page.request.post(url, { data })` envía el POST con la cookie del viewer. Al intentar crear un producto, la API devuelve 403 y el mensaje de rechazo.

## Escribe el spec

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

La comprobación de `user-role` confirma que el encabezado muestra viewer. La espera de la primera fila comprueba que hay productos antes de buscar los controles ausentes. El segundo test verifica el rechazo directamente en la API, con su estado y su mensaje.

## Reutilizar una sesión del viewer

Si varios specs necesitan al viewer, puedes agregar otro test de preparación que guarde `e2e/.auth/viewer.json`. Esos specs usarían `test.use({ storageState: "e2e/.auth/viewer.json" })`.

Para los dos tests de este spec, `beforeEach` mantiene el login en el mismo archivo. Una sesión guardada evita repetir la petición de login, pero requiere preparar otro archivo de estado.

## Profundiza

### Comprobar el acceso sin sesión

El test de 403 comprueba una restricción del rol. Este otro test comprueba el acceso sin sesión: con el estado vacío, el fixture `request` no envía una cookie de usuario y la API devuelve 401.

```ts
import { expect, test } from "../lib/test"

// Start signed out, with no cookie at all.
test.use({ storageState: { cookies: [], origins: [] } })

test("the API answers 401 when nobody is signed in", async ({ request }) => {
  const response = await request.get("/api/products")

  expect(response.status()).toBe(401)
  expect(await response.json()).toEqual({ message: "You must sign in." })
})
```

## Práctica

1. Crea `products/viewer.spec.ts` con el código de arriba.
2. Ejecútalo: `pnpm --filter practice-shop e2e e2e/products/viewer.spec.ts`.
3. Inicia sesión temporalmente con `ADMIN` en lugar de `VIEWER` (agrega `ADMIN` al import). Ejecuta el spec y lee el fallo. Deshaz el cambio.
4. Agrega un tercer test: el viewer abre `/orders` y no ve botones `orders-mark-paid-`. Usa una expresión regular y espera primero una fila.
5. Actualiza `COVERAGE.md`: marca la fila del rol viewer como cubierta y quita ese hueco.

## Reto

Prueba al viewer en pedidos. Crea `apps/practice-shop/e2e/orders/orders-viewer.spec.ts` y comprueba que un cambio rechazado no modifica el pedido. Elige el pedido para la comprobación por la API. Recuerda que los pedidos de la semilla los usan otros specs. Los pedidos pendientes son 1001, 1005 y 1009.

Está terminado cuando:

- Un test de interfaz inicia sesión como viewer, espera una fila y comprueba que faltan el encabezado Actions y los controles con ids que empiezan con `orders-mark-paid-`, `orders-mark-shipped-` y `orders-cancel-`.
- Un test de API envía como viewer el cambio de estado `paid` para tu pedido pendiente y espera 403 y el mensaje "Your role does not allow this action."
- El mismo test inicia sesión como admin en una sesión aparte, lee la lista de pedidos por la API y comprueba que tu pedido sigue en `pending`.
- El spec pasa dos veces. Luego inicias sesión en el primer test como `ADMIN`, lo ves fallar y deshaces el cambio.

Busca: `playwright APIResponse json`, `typescript array find` y `playwright getByRole columnheader`. Puedes usar el fixture `request` para la sesión aparte del admin, sin cambiar la del viewer en `page.request`.

## Piénsalo bien

1. Cambias el spec para iniciar sesión como `ADMIN` y quitas las comprobaciones del rol y de la primera fila. El test solo hace `products.goto()` y luego `toHaveCount(0)` sobre los controles Delete. ¿Puede pasar antes de que aparezcan las filas?

<details><summary>Respuesta</summary>

Sí. Si la lista todavía no cargó, el locator encuentra cero controles Delete y la aserción pasa. Cuando lleguen las filas del admin, el test puede haber terminado.

</details>

2. Un compañero agrega este test al archivo del viewer. Pasa. Encuentra el bug.

```ts
test("the viewer cannot create a product", async ({ request }) => {
  const response = await request.post("/api/products", {
    data: { name: uniqueName("Blocked"), sku: uniqueSku(), price: 9.5, stock: 1, status: "active" },
  })
  expect(response.ok()).toBeFalsy()
})
```

<details><summary>Respuesta</summary>

El login del `beforeEach` usa `page.request`, pero el test envía la petición con `request`, que sigue sin sesión. El servidor responde 401 y `ok()` devuelve falso. La misma aserción aceptaría un error 500. Usa `page.request` y comprueba `status()` contra 403.

</details>

3. El negocio cambia una regla: el viewer puede editar un producto, pero no crear ni eliminar. ¿Qué comprobaciones deben cambiar para detectar una interfaz que ofrece Edit mientras el servidor todavía rechaza la edición?

<details><summary>Respuesta</summary>

Comprueba que Edit está presente y que una petición PUT del viewer tiene éxito. Conserva las comprobaciones de New y Delete ausentes y el rechazo de POST con 403. Si el servidor sigue rechazando PUT, el test de API detectará el fallo aunque la interfaz muestre Edit.

</details>

## Siguiente paso

En la siguiente lección llevas tu trabajo a un pull request.
