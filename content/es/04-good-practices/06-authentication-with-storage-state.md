---
title: Autenticación con storage state
duration: 60 min
---

## Objetivo

Guarda una sesión al inicio de la ejecución y úsala en los tests que necesitan autenticación. Distingue el estado del navegador de la sesión que mantiene el servidor.

- Leer la dependencia entre los projects `setup` y `chromium`.
- Guardar y cargar una sesión con storage state.
- Iniciar tests sin sesión o con una sesión propia.
- Reconocer cuándo un token guardado deja de ser válido.

## Reutilizar la autenticación

Si cada test inicia sesión por la interfaz, repite los pasos de login aunque pruebe otra página. Una sesión guardada permite quitar esos pasos de los tests de productos. `auth.spec.ts` sigue probando el formulario de login con una sesión vacía.

Después del login, el servidor de la tienda devuelve una cookie con un token de sesión. El navegador guarda la cookie y la envía en las peticiones a la tienda. El servidor busca ese token para identificar al usuario.

Playwright puede guardar las cookies del contexto del navegador en un archivo de **storage state** (estado de almacenamiento). Cada test recibe un contexto nuevo que carga esos datos: los contextos están separados, pero usan el mismo token de sesión.

La cookie de la tienda se llama `shop_session`. El servidor la crea en `app/api/auth/login/route.ts` con `httpOnly: true`, que impide al JavaScript de la página leerla. Playwright puede guardarla porque accede al navegador desde fuera de la página.

El storage state también puede guardar `localStorage`. La tienda no lo usa para autenticar al usuario, así que `origins` está vacío en su archivo de sesión.

## El project setup

Abre `apps/practice-shop/playwright.config.ts`:

```ts
projects: [
  {
    name: "setup",
    testMatch: /global\.setup\.ts/,
    // ...
    use: { storageState: { cookies: [], origins: [] } },
  },
  {
    name: "chromium",
    use: { ...devices["Desktop Chrome"] },
    // Wait for the setup project to finish before running any test.
    dependencies: ["setup"],
  },
],
```

El project `setup` ejecuta `global.setup.ts`. La dependencia `dependencies: ["setup"]` hace que el runner ejecute ese project antes de los tests de `chromium`.

Si quitas la dependencia y ejecutas un solo archivo, como `pnpm shop:e2e products/products.spec.ts`, el runner selecciona los tests que coinciden con ese archivo. `global.setup.ts` no coincide. En un repositorio recién clonado `e2e/.auth/admin.json` no existe, así que todos los tests fallan porque no pueden leer el archivo.

El almacenamiento vacío de `setup` evita que herede `storageState: "e2e/.auth/admin.json"` de la configuración general. Sin esa opción, el setup intentaría leer el archivo antes de poder crearlo.

## Guardar la sesión en el setup

Abre `apps/practice-shop/e2e/global.setup.ts`. Después de llenar el formulario, el test termina con:

```ts
await page.getByTestId("login-submit").click()
await expect(page).toHaveURL(/\/dashboard/)

// Save the cookies. Every other test starts with this session.
await page.context().storageState({ path: AUTH_FILE })
```

La aserción espera la URL del dashboard antes de guardar el estado. Así el archivo `e2e/.auth/admin.json` contiene la cookie que recibió el navegador después del login.

La opción general de `use` carga ese archivo:

```ts
// Every test starts already signed in as admin (saved by the setup project).
storageState: "e2e/.auth/admin.json",
```

Los tests que conservan esa opción empiezan con la sesión del admin. Pueden abrir `/products` directamente, sin pasar por el formulario de login.

## Proteger el archivo de sesión

El archivo `e2e/.auth/admin.json` contiene una cookie de sesión activa. Quien tenga el archivo puede usar esa sesión como admin mientras el servidor la acepte. Trátalo como una contraseña.

La carpeta está en `apps/practice-shop/e2e/.gitignore`:

```text
.auth/
```

Git salta los archivos ignorados, así que la sesión nunca se sube en un *commit* (confirmación de cambios). Cada persona y cada ejecución de CI crea una nueva cuando corre el setup.

## Probar sin sesión

Para probar el acceso de un visitante, cambia la opción con `test.use`. `auth.spec.ts` usa almacenamiento vacío al inicio del archivo:

```ts
// These tests start signed out: an empty session instead of the saved admin one.
test.use({ storageState: { cookies: [], origins: [] } })
```

Cada test de ese archivo empieza sin sesión. El primer test comprueba la redirección al login:

```ts
await page.goto("/products")

await expect(page).toHaveURL(/\/login\?next=%2Fproducts/)
await expect(page.getByTestId("login-card")).toBeVisible()
```

También puedes aplicar la opción dentro de un grupo de `test.describe`, como en la práctica.

## Dar una sesión propia al test de logout

Cerrar sesión borra el token en el servidor mediante `app/api/auth/logout/route.ts`. Si un test cierra la sesión compartida, los demás contextos conservan la cookie, pero el servidor ya no reconoce su token. El archivo `admin.json` no cambia: el cambio está en la lista de sesiones del servidor.

Los tests que cierran sesión o invalidan la sesión necesitan una propia. El test de logout de la tienda inicia sesión de nuevo antes de abrir el dashboard:

```ts
// Log in with a NEW session just for this test. Signing out deletes the
// session on the server, so we must not use the shared admin one.
await loginViaApi(page.request, ADMIN)
await page.goto("/dashboard")
```

`loginViaApi` llama a la API de login. El servidor devuelve una cookie nueva. Como `page.request` comparte las cookies con la página, el navegador de ese test recibe la nueva sesión.

El fixture `request` tiene sus propias cookies, separadas de la página. Iniciar sesión con ese fixture no reemplaza la cookie del navegador.

## Profundiza

### Un archivo guardado puede contener una sesión inválida

La tienda guarda en memoria la relación entre cada token y un usuario. `lib/session.ts` consulta esa relación:

```ts
const token = (await cookies()).get(SESSION_COOKIE)?.value
if (!token) return undefined

const userId = store().sessions.get(token)
```

Si el servidor se reinicia y pierde las sesiones en memoria, el archivo sigue existiendo, pero su token deja de ser válido. Por eso el setup inicia sesión de nuevo en cada ejecución.

El reinicio de datos de prueba conserva las sesiones. `lib/store.ts` lo indica en su comentario: "Sessions are kept, so logged-in tests stay logged in."

## Práctica

1. Abre `apps/practice-shop/playwright.config.ts` y encuentra la dependencia del project `chromium`.
2. Crea `apps/practice-shop/e2e/auth/storage-practice.spec.ts` con este código:

```ts
import { expect, test } from "../lib/test"

test.describe("Signed in by default", () => {
  test("the products page opens without a login", async ({ page }) => {
    await page.goto("/products")

    await expect(page.getByTestId("products-title")).toBeVisible()
  })
})

test.describe("Signed out", () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test("the products page sends a visitor to the login page", async ({ page }) => {
    await page.goto("/products")

    await expect(page).toHaveURL(/\/login\?next=%2Fproducts/)
  })
})
```

3. Inicia la tienda con `pnpm shop:dev`. En otra terminal ejecuta:

```bash
pnpm shop:e2e auth/storage-practice.spec.ts
```

4. Comprueba que los dos tests pasan y que el segundo usa `test.use` dentro de su grupo. En PowerShell, comprueba que el setup creó el archivo de sesión. No lo compartas ni lo pegues en ningún lado.

```bash
Test-Path apps/practice-shop/e2e/.auth/admin.json
```

5. En el grupo `Signed out`, cambia la sesión vacía por un archivo que no existe: `test.use({ storageState: "e2e/.auth/nothing.json" })`. Ejecuta el spec, lee el error de archivo faltante y deshaz el cambio.

## Reto

Escribe un test que inicie sesión como viewer, guarde esa sesión y abra un contexto de navegador desde el archivo. El viewer puede ver productos, pero no crearlos. Conserva la sesión compartida del admin.

Crea `apps/practice-shop/e2e/challenges/viewer-session.spec.ts`. La cuenta es `VIEWER` en `e2e/lib/fixtures/api-client.ts`.

Está terminado cuando:

- El test escribe `e2e/.auth/viewer.json` y pasa aunque borres ese archivo antes de ejecutarlo.
- Abre `/products` como viewer: `user-role` dice `viewer` y no hay enlace `products-new`.
- En el mismo contexto de navegador, un `POST` a `/api/products` recibe el estado 403.
- El test nunca hace clic en cerrar sesión y `pnpm shop:e2e auth/auth.spec.ts` sigue pasando después de ejecutar tu spec.

Busca cómo crear un cliente de API sin la sesión guardada de la configuración, guardar sus cookies y crear un contexto de navegador desde ese archivo: `playwright request.newContext`, `playwright APIRequestContext storageState path`, `playwright browser.newContext storageState`, `playwright test.beforeAll`.

## Piénsalo bien

1. Quitas `dependencies: ["setup"]` del project `chromium` y ejecutas `pnpm shop:e2e products/products.spec.ts` en un repositorio recién clonado. ¿Qué falla antes de abrir la página de productos?

<details>
<summary>Respuesta</summary>

El runner no selecciona `global.setup.ts`, porque no coincide con el archivo pedido y ya no es una dependencia. Los tests que cargan `e2e/.auth/admin.json` fallan al crear el contexto: el archivo todavía no existe.

</details>

2. Este test usa la configuración general con la sesión guardada del admin. Pasa, pero puede hacer fallar otros tests. Encuentra el bug.

```ts
test("signing out returns to the login page", async ({ page, request }) => {
  await loginViaApi(request, ADMIN)
  await page.goto("/dashboard")
  await expect(page.getByTestId("dashboard-stats")).toBeVisible()

  await page.getByTestId("logout-button").click()

  await expect(page).toHaveURL(/\/login/)
})
```

<details>
<summary>Respuesta</summary>

`loginViaApi` crea una sesión en el fixture `request`, que no comparte las cookies con la página. El navegador conserva la sesión compartida del admin y el logout la borra en el servidor. Usa `loginViaApi(page.request, ADMIN)` para que el navegador reciba una sesión propia antes de cerrar sesión.

</details>

3. Un requisito cambia: la tienda debe terminar cada sesión después de 5 minutos. Tu suite tarda 20 minutos. ¿Qué tests fallan y cuáles son dos formas de arreglarlo?

<details>
<summary>Respuesta</summary>

El token guardado se crea una vez al inicio. Después de 5 minutos el servidor lo rechaza, así que todo test que empiece después de ese momento se envía a la página de login. Los tests fallan en la segunda mitad de la ejecución, y cada uno pasa si lo ejecutas solo y temprano. Una solución es hacer que la sesión dure más solo en el entorno de pruebas. Una segunda solución es iniciar sesión de nuevo por la API al inicio de cada archivo de tests, para que ninguna sesión tenga más de unos minutos.

</details>

## Siguiente paso

En la próxima lección preparas datos de prueba por la API en vez de por la interfaz.
