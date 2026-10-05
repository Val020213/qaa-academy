---
title: Probar el rol viewer
summary: Prueba a un segundo usuario empezando sin sesión e iniciando sesión como viewer por la API, dentro del propio spec.
duration: 50 min
---

## Objetivo

- Explicar por qué un segundo usuario necesita una segunda sesión.
- Empezar un spec sin sesión e iniciar sesión como viewer.
- Comprobar que faltan controles sin escribir un falso éxito.
- Verificar que la API rechaza al viewer con el estado 403.

## El problema

Todos los tests de la suite empiezan con la sesión de admin abierta. La configuración carga `e2e/.auth/admin.json` para todos los tests. Pero el viewer es otro usuario con otra sesión. No puedes ser los dos a la vez en un mismo contexto del navegador.

Un **contexto del navegador** (*browser context*) es un perfil de navegador limpio que usa un test. Tiene sus propias cookies. Así que el viewer necesita un contexto con la cookie del viewer.

## El enfoque más simple

Hazlo dentro del spec, en tres pasos.

1. Reemplaza la sesión de admin por una vacía: `test.use({ storageState: { cookies: [], origins: [] } })`. El test empieza sin sesión. El archivo `auth.spec.ts` también lo hace.
2. En `beforeEach`, llama a `loginViaApi(page.request, VIEWER)`. Envía un POST a `/api/auth/login`.
3. `page.request` comparte cookies con la página. La cookie de sesión llega al contexto, así que `page.goto` ya ve al viewer con la sesión iniciada.

`loginViaApi` y `VIEWER` vienen de `lib/fixtures/api-client.ts`. Un hook **`beforeEach`** es código que se ejecuta antes de cada test de su grupo.

> **Cuidado:** Pasa `page.request`, no el fixture `request`. El fixture `request` tiene su propio almacén de cookies, no el de la página. Un login en él no iniciaría la sesión de la página.

## Controles ausentes

Quieres comprobar que algo no está. Usa `toHaveCount(0)`.

Hay una trampa. Si la página aún no cargó, también hay cero botones. La aserción pasa por la razón equivocada. Así que primero espera algo que debe existir: la primera fila. Luego comprueba que la cantidad es 0.

Las filas tienen test ids con el id del producto dentro, como `products-edit-12`. Una expresión regular los encuentra todos: `getByTestId(/^products-edit-/)`.

## La comprobación de la API

La interfaz oculta los botones. Pero un botón oculto no es seguridad. Alguien todavía puede llamar a la API. El servidor debe rechazar la petición.

`page.request.post(url, { data })` envía una petición POST con la cookie del viewer. La API responde con el estado 403, que significa "prohibido": te conoce, pero no puedes hacer esto. El cuerpo trae un mensaje.

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

El primer test también comprueba `user-role`. Esto demuestra que la página realmente tiene la sesión del viewer, y no la de un admin que quedó de antes.

## La alternativa

Puedes añadir un segundo test de setup que inicie sesión como viewer y guarde `e2e/.auth/viewer.json`. Entonces los specs del viewer usan `test.use({ storageState: "e2e/.auth/viewer.json" })`, lo que vale la pena cuando muchos specs necesitan al viewer.

## Profundiza

### Por qué dos peticiones pueden tener cookies distintas

Una **cookie** es un pequeño texto que el navegador guarda y envía con cada petición al mismo sitio. Cuando inicias sesión, el servidor crea un id de sesión y lo devuelve como la cookie `shop_session`. El servidor guarda en memoria una lista: este id pertenece a este usuario. En cada petición, lee la cookie y encuentra al usuario.

Playwright guarda las cookies en un **contexto del navegador**. `page.request` usa las cookies del contexto de la página. El fixture `request` tiene las suyas. Por eso la lección dice que pases `page.request`.

### Una idea equivocada: "403 y 401 son lo mismo"

Los dos significan "no permitido", pero son distintos. En la tienda:

- **401** significa que el servidor no sabe quién eres. No tienes una sesión válida.
- **403** significa que el servidor te conoce, pero tu rol no puede hacer esto.

El viewer recibe 403. Un visitante sin cookie recibe 401. Es un buen test extra, porque comprueba otra regla:

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

### Cómo aparece en el trabajo real de automatización QA

Los bugs de seguridad suelen verse así: un desarrollador oculta el botón Delete para un viewer, pero olvida comprobar el rol en el servidor. La página se ve bien, y un test que solo usa la interfaz pasa. El test de API de esta lección es el que falla. En QA, este tipo de problema se llama **control de acceso roto** (*broken access control*), y es uno de los bugs graves más comunes.

### DRY y su costo

El `beforeEach` inicia sesión como viewer antes de cada test del grupo. Eso es **DRY** (Don't Repeat Yourself, no te repitas). Un **fixture** en Playwright es algo preparado que recibe un test; una sesión guardada en `viewer.json` es parecida, y quita el login de cada spec. El costo es más archivos de preparación y una cosa más que explicar a un compañero nuevo. Con dos tests, `beforeEach` es más simple. Con veinte, gana la sesión guardada.

## Práctica

1. Crea `products/viewer.spec.ts` con el código de arriba.
2. Ejecútalo: `pnpm --filter practice-shop e2e e2e/products/viewer.spec.ts`.
3. Para ver que el spec puede fallar, inicia sesión temporalmente con `ADMIN` en lugar de `VIEWER` (añade `ADMIN` al import). Ejecútalo. Lee el fallo. Deshaz el cambio.
4. Añade un tercer test: el viewer abre `/orders` y no ve botones `orders-mark-paid-`. Usa una expresión regular y espera primero una fila.
5. Actualiza `COVERAGE.md`: la fila del rol viewer queda cubierta y se quita el hueco.

## Comprueba lo que sabes

1. ¿Por qué el test del viewer necesita `storageState` con cookies vacías?

<details><summary>Respuesta</summary>

Sin eso, el test empieza como admin. El test del viewer necesita empezar sin sesión y luego iniciar sesión como viewer.

</details>

2. ¿Por qué esperar la primera fila antes de `toHaveCount(0)`?

<details><summary>Respuesta</summary>

En una página que aún no cargó, la cantidad también es 0. El test pasaría sin demostrar nada.

</details>

3. ¿Por qué probar la API y no solo los botones ocultos?

<details><summary>Respuesta</summary>

Un botón oculto no es seguridad. El servidor debe rechazar la petición por sí mismo.

</details>

4. En `beforeEach` usas `loginViaApi(request, VIEWER)` con el fixture `request` en lugar de `page.request`. ¿Qué le pasa al primer test y por qué?

<details><summary>Respuesta</summary>

El login funciona, pero la cookie va al almacén de cookies propio del fixture `request`, no a la página. La página abre `/products` sin sesión, así que la aplicación la envía a la página de login. La comprobación de `user-role` entonces falla. Esto muestra por qué la lección dice que uses `page.request`.

</details>

5. Un desarrollador quita la comprobación de rol de `POST /api/products` pero mantiene ocultos los botones. ¿Cuál de los dos tests del viewer falla y por qué?

<details><summary>Respuesta</summary>

El segundo, el test de la API. La petición del viewer ahora tiene éxito con el estado 201, no 403. El primer test sigue pasando, porque los botones siguen ocultos. Por eso necesitas ambos tests: el test de la interfaz comprueba lo que ve el usuario, y el test de la API comprueba lo que permite el servidor.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Cuál es la diferencia entre los estados HTTP 401 y 403?**
   - Busca: `http 401 unauthorized vs 403 forbidden`
   - Una buena respuesta explica: qué significa cada código y un ejemplo en que una API debe devolver cada uno

2. **¿Qué es el control de acceso basado en roles (RBAC)?**
   - Busca: `role based access control rbac explained`
   - Una buena respuesta explica: cómo los roles se relacionan con los permisos, y cómo un tester puede comprobar que un rol está limitado correctamente

3. **¿Qué es el control de acceso roto y por qué está en la lista OWASP Top 10?**
   - Busca: `owasp top 10 broken access control`
   - Una buena respuesta explica: cuál es el riesgo, un ejemplo, y cómo puede probarlo un ingeniero de QA

## Siguiente paso

En la próxima lección llevarás tu trabajo a un pull request.
