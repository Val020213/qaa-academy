---
title: Autenticación con storage state
summary: Inicia sesión una vez, guarda la sesión, reutilízala en cada test y prueba el caso sin sesión.
duration: 45 min
---

## Objetivo

- Explicar por qué iniciar sesión por la interfaz en cada test es un problema.
- Leer `global.setup.ts` y los proyectos de la configuración.
- Probar el comportamiento sin sesión con una sesión vacía.
- Explicar por qué el test de cerrar sesión vuelve a iniciar sesión.

## El problema

Casi todas las páginas de la tienda necesitan un login. Si cada test iniciara sesión por la página de login, cada test haría primero los mismos pasos: abrir la página, escribir el correo, escribir la contraseña y hacer clic.

Eso cuesta tiempo en cada test. También agrega fallos: si la página de login se rompe, todos los tests fallan, y ninguno trata del login.

La solución es iniciar sesión **una vez** y reutilizar el resultado.

## Storage state

Cuando inicias sesión, el servidor le da a tu navegador una **cookie**. Una cookie es un dato pequeño que guarda el navegador. El servidor la lee en cada petición para saber quién eres.

Playwright puede guardar las cookies de un navegador en un archivo. Esto se llama *storage state* (estado de almacenamiento). Un test nuevo puede empezar con ese archivo, y así ya tiene la sesión iniciada.

## El proyecto de preparación

Abre `apps/practice-shop/playwright.config.ts`. Tiene dos **proyectos**. Un proyecto es un grupo de tests con nombre y con su propia configuración.

```ts
projects: [
  {
    name: "setup",
    testMatch: /global\.setup\.ts/,
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

El proyecto `setup` ejecuta solo `global.setup.ts`. El proyecto `chromium` tiene `dependencies: ["setup"]`, así que empieza solo cuando `setup` termina.

El proyecto `setup` usa una sesión vacía a propósito. El comentario de la configuración lo explica: el archivo de sesión por defecto todavía no existe, así que el proyecto de preparación no debe cargarlo.

## El test de preparación

Abre `apps/practice-shop/e2e/global.setup.ts`. Después de llenar el formulario de login y hacer clic en enviar, termina con:

```ts
await page.getByTestId("login-submit").click()
await expect(page).toHaveURL(/\/dashboard/)

// Save the cookies. Every other test starts with this session.
await page.context().storageState({ path: AUTH_FILE })
```

El test espera primero la URL del dashboard. Eso prueba que el login funcionó. Luego guarda las cookies en `e2e/.auth/admin.json`.

El valor por defecto en `use` carga ese archivo:

```ts
// Every test starts already signed in as admin (saved by the setup project).
storageState: "e2e/.auth/admin.json",
```

Así, cada test del proyecto `chromium` empieza con la sesión iniciada como administrador. Un test que visita `/products` va directo a la lista.

## Por qué git ignora .auth

El archivo `e2e/.auth/admin.json` contiene una cookie de sesión activa. Cualquiera que tenga este archivo puede actuar como administrador. Trátalo como una contraseña.

Por eso la carpeta aparece en `apps/practice-shop/e2e/.gitignore`:

```text
.auth/
```

Git omite los archivos ignorados, así que la sesión nunca se sube en un commit. Cada persona y cada ejecución de CI crea una nueva cuando se ejecuta la preparación.

## Probar el comportamiento sin sesión

Algunos tests necesitan un visitante que no ha iniciado sesión. Para quitar la sesión, usa `test.use` con una vacía. `auth.spec.ts` lo hace al inicio del archivo:

```ts
// These tests start signed out: an empty session instead of the saved admin one.
test.use({ storageState: { cookies: [], origins: [] } })
```

Ahora cada test de ese archivo empieza sin sesión. El primer test comprueba la redirección:

```ts
await page.goto("/products")

await expect(page).toHaveURL(/\/login\?next=%2Fproducts/)
await expect(page.getByTestId("login-card")).toBeVisible()
```

## Por qué el test de cerrar sesión vuelve a iniciar sesión

Cerrar sesión borra la sesión en el servidor. Si un test cerrara la sesión compartida del administrador, todos los tests posteriores perderían su login.

Por eso el test de cerrar sesión crea primero su propia sesión:

```ts
// Log in with a NEW session just for this test. Signing out deletes the
// session on the server, so we must not use the shared admin one.
await loginViaApi(page.request, ADMIN)
await page.goto("/dashboard")
```

`loginViaApi` llama a la API de login. La cookie pasa al contexto de navegador propio de este test. La próxima lección explica `page.request`.

> **Cuidado:** Nunca hagas clic en cerrar sesión en un test que usa la sesión compartida del administrador. El `e2e/README.md` repite esta regla.

## Profundiza

### Por qué un archivo de cookies basta para iniciar sesión

La web no tiene memoria. Cada petición es independiente, y el servidor no sabe que iniciaste sesión hace un momento. Una cookie lo resuelve. Después del login, el servidor devuelve una cookie que contiene un token aleatorio. El navegador envía el token con cada petición posterior.

La tienda guarda una lista de tokens en la memoria del servidor. Este es el código real de `lib/session.ts`:

```ts
const token = (await cookies()).get(SESSION_COOKIE)?.value
if (!token) return undefined

const userId = store().sessions.get(token)
```

Así, `admin.json` guarda solo el token, no quién eres. El servidor busca el token en su propia lista. Si el servidor olvida la lista, por ejemplo después de reiniciarse, el archivo sigue existiendo, pero el token ya no significa nada. La siguiente petición se trata como sin sesión. Esta es una razón por la que el proyecto de preparación inicia sesión de nuevo en cada ejecución y no reutiliza un archivo viejo.

### Una idea equivocada común: el storage state evita probar el login

Algunos principiantes piensan que guardar la sesión significa que el login nunca se prueba. Sí se sigue probando. `auth.spec.ts` inicia sesión por la página real, con una sesión vacía. La sesión guardada quita los pasos de login de los tests que tratan de otra cosa. El login sigue bajo prueba en un solo lugar.

Además, el storage state no son solo cookies. También puede guardar `localStorage`, los datos que un sitio conserva en el navegador. El archivo de la tienda no tiene ninguno, así que `origins` está vacío. Un sitio que guarda su token en `localStorage` necesita que esa parte también se guarde.

### Cómo aparece en el trabajo de QA

Los productos reales tienen muchos roles: admin, viewer, customer (cliente). Los equipos suelen crear un test de preparación y un archivo guardado por cada rol. Un test elige su rol con `test.use`. Probarás el rol viewer en el módulo 5. Los pasos para iniciar sesión se escriben una vez en la preparación, no en cada test. Esto es DRY aplicado a un flujo.

### Cuándo no usarlo

No uses una sesión guardada compartida en un test que cambia la propia sesión. Cerrar sesión, cambiar una contraseña y hacer que expire una sesión son ejemplos. El test de cerrar sesión crea su propia sesión con `loginViaApi`. Una buena pregunta: "¿Este test cambia quién tiene la sesión iniciada?" Si la respuesta es sí, dale su propia sesión.

## Práctica

1. Abre `apps/practice-shop/playwright.config.ts`. Encuentra la línea que dice de qué proyecto depende el proyecto `chromium`.
2. En PowerShell, comprueba que el archivo de sesión existe. No lo compartas ni lo pegues en ningún sitio.

```bash
Test-Path apps/practice-shop/e2e/.auth/admin.json
```

3. Crea el archivo `apps/practice-shop/e2e/auth/storage-practice.spec.ts` con este código:

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

4. Inicia la tienda con `pnpm shop:dev`. En otra terminal ejecuta:

```bash
pnpm shop:e2e auth/storage-practice.spec.ts
```

5. Los dos tests deben pasar. Fíjate en que el segundo necesita `test.use` dentro de su grupo.

## Comprueba lo que sabes

1. ¿Qué es el storage state?

<details><summary>Respuesta</summary>

Las cookies de un navegador guardadas en un archivo. Un test puede cargarlo para empezar con la sesión ya iniciada.

</details>

2. ¿Qué hace `dependencies: ["setup"]`?

<details><summary>Respuesta</summary>

El proyecto `chromium` espera a que el proyecto `setup` termine antes de ejecutarse.

</details>

3. ¿Por qué `.auth/` está en `.gitignore`?

<details><summary>Respuesta</summary>

El archivo contiene una sesión activa. No debe subirse en un commit.

</details>

4. ¿Por qué el test de cerrar sesión llama primero a `loginViaApi`?

<details><summary>Respuesta</summary>

Cerrar sesión borra la sesión en el servidor. El test necesita su propia sesión para no romper la sesión compartida del administrador.

</details>

5. Detienes la tienda y la inicias otra vez. El archivo `e2e/.auth/admin.json` sigue en tu disco. ¿Qué pasa si un test usa ese archivo viejo para visitar `/products`? ¿Por qué una ejecución normal sí funciona?

<details><summary>Respuesta</summary>

El archivo contiene un token, y el servidor guardó su lista de tokens en memoria. Después del reinicio, la lista está vacía, así que el token es desconocido. El servidor trata al visitante como sin sesión y lo redirige a la página de login, y el test falla. Una ejecución normal sí funciona porque el proyecto de preparación se ejecuta primero. Inicia sesión de nuevo y escribe un archivo nuevo.

</details>

6. Un compañero agrega un test nuevo. Después de eso, la suite pasa los primeros tests, pero desde cierto punto todos los tests fallan y redirigen a la página de login. El test nuevo pasa solo. ¿Qué tipo de línea buscarías en el test nuevo?

<details><summary>Respuesta</summary>

Busca un clic en el botón de cerrar sesión, o cualquier llamada que termine la sesión. El test nuevo usa la sesión compartida del administrador. Cerrar sesión borra esa sesión en el servidor, así que todos los tests que se ejecutan después pierden su login. El test pasa solo porque nada se ejecuta después de él. La solución es darle a ese test su propia sesión con `loginViaApi`.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué hacen los atributos de cookie `HttpOnly`, `Secure` y `SameSite`?**
   - Busca: `http cookies HttpOnly Secure SameSite MDN`
   - Una buena respuesta explica: qué ataque o riesgo reduce cada atributo.

2. **¿Cómo puede un proyecto de Playwright usar una sesión guardada distinta para cada rol?**
   - Busca: `playwright authentication multiple roles storage state`
   - Una buena respuesta explica: cómo guardar un archivo por rol y cómo un test o un proyecto elige uno.

3. **¿Por qué las contraseñas reales y los archivos de sesión nunca deben subirse en un commit, y dónde guardan los equipos los secretos de test?**
   - Busca: `secrets in git repository environment variables CI`
   - Una buena respuesta explica: el riesgo de un secreto subido y un lugar seguro para guardarlo, como los secretos de CI.

## Siguiente paso

En la próxima lección aprendes a preparar los datos de test por la API en lugar de la interfaz.
