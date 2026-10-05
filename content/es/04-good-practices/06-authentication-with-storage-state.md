---
title: Autenticación con storage state
summary: Inicia sesión una vez, guarda la sesión, reutilízala en todos los tests y prueba el caso sin sesión.
duration: 30 min
---

## Objetivo

- Explicar por qué iniciar sesión por la interfaz en cada test es un problema.
- Leer `global.setup.ts` y los projects de la configuración.
- Probar el comportamiento sin sesión con una sesión vacía.
- Explicar por qué el test de cerrar sesión vuelve a iniciar sesión.

## El problema

Casi todas las páginas de la tienda necesitan un *login* (inicio de sesión). Si cada test iniciara sesión por la página de login, cada uno haría primero los mismos pasos: abrir la página, escribir el correo, escribir la contraseña, hacer clic.

Eso cuesta tiempo en cada test. También agrega fallos: si la página de login se rompe, todos los tests fallan, y ninguno trata del login.

La solución es iniciar sesión **una sola vez** y reutilizar el resultado.

## Storage state

Cuando inicias sesión, el servidor le da a tu navegador una **cookie**. Una cookie es un dato pequeño que el navegador guarda. El servidor la lee en cada petición para saber quién eres.

Playwright puede guardar las cookies de un navegador en un archivo. Esto se llama *storage state* (estado de almacenamiento). Un test nuevo puede empezar con ese archivo, y así ya tiene la sesión iniciada.

## El project de setup

Abre `apps/practice-shop/playwright.config.ts`. Tiene dos **projects**. Un project es un grupo de tests con nombre y con su propia configuración.

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

El project `setup` ejecuta solo `global.setup.ts`. El project `chromium` tiene `dependencies: ["setup"]`, así que empieza solo cuando el setup termina.

El project de setup usa una sesión vacía a propósito. El comentario de la configuración lo explica: el archivo de sesión por defecto todavía no existe, así que el setup no debe cargarlo.

## El test de setup

Abre `apps/practice-shop/e2e/global.setup.ts`. Después de llenar el formulario de login y hacer clic en enviar, termina con:

```ts
await page.getByTestId("login-submit").click()
await expect(page).toHaveURL(/\/dashboard/)

// Save the cookies. Every other test starts with this session.
await page.context().storageState({ path: AUTH_FILE })
```

El test espera primero la URL del dashboard. Eso prueba que el login funcionó. Después guarda las cookies en `e2e/.auth/admin.json`.

El valor por defecto en `use` carga ese archivo:

```ts
// Every test starts already signed in as admin (saved by the setup project).
storageState: "e2e/.auth/admin.json",
```

Así, todos los tests del project `chromium` empiezan con la sesión de admin iniciada. Un test que visita `/products` va directo a la lista.

## Por qué git ignora .auth

El archivo `e2e/.auth/admin.json` guarda una cookie de sesión activa. Cualquiera que tenga este archivo puede actuar como el admin. Trátalo como una contraseña.

Por eso la carpeta aparece en `apps/practice-shop/e2e/.gitignore`:

```text
.auth/
```

Git omite los archivos ignorados, así que la sesión nunca se sube en un *commit*. Cada persona y cada ejecución de CI crea una nueva cuando se ejecuta el setup.

## Probar el comportamiento sin sesión

Algunos tests necesitan un visitante que no ha iniciado sesión. Para quitar la sesión, usa `test.use` con una sesión vacía. `auth.spec.ts` lo hace al inicio del archivo:

```ts
// These tests start signed out: an empty session instead of the saved admin one.
test.use({ storageState: { cookies: [], origins: [] } })
```

Ahora todos los tests de ese archivo empiezan sin sesión. El primer test comprueba la redirección:

```ts
await page.goto("/products")

await expect(page).toHaveURL(/\/login\?next=%2Fproducts/)
await expect(page.getByTestId("login-card")).toBeVisible()
```

## Por qué el test de cerrar sesión vuelve a iniciar sesión

Cerrar sesión borra la sesión en el servidor. Si un test cerrara la sesión compartida del admin, todos los tests siguientes perderían su sesión.

Por eso el test de cerrar sesión crea primero su propia sesión:

```ts
// Log in with a NEW session just for this test. Signing out deletes the
// session on the server, so we must not use the shared admin one.
await loginViaApi(page.request, ADMIN)
await page.goto("/dashboard")
```

`loginViaApi` llama a la API de login. La cookie va al contexto de navegador propio de este test. La siguiente lección explica `page.request`.

> **Cuidado:** Nunca hagas clic en cerrar sesión en un test que usa la sesión compartida del admin. El `e2e/README.md` repite esta regla.

## Práctica

1. Abre `apps/practice-shop/playwright.config.ts`. Busca la línea que dice de qué project depende el project `chromium`.
2. En PowerShell, comprueba que el archivo de sesión existe. No lo compartas ni lo pegues en ningún lugar.

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

El project `chromium` espera a que el project `setup` termine antes de ejecutarse.

</details>

3. ¿Por qué `.auth/` está en `.gitignore`?

<details><summary>Respuesta</summary>

El archivo guarda una sesión activa. No debe subirse en un commit.

</details>

4. ¿Por qué el test de cerrar sesión llama primero a `loginViaApi`?

<details><summary>Respuesta</summary>

Cerrar sesión borra la sesión en el servidor. El test necesita su propia sesión para no romper la sesión compartida del admin.

</details>

## Siguiente paso

En la siguiente lección aprenderás a preparar datos de prueba por la API en lugar de la interfaz.
