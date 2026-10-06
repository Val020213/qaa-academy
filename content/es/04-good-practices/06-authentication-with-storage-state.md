---
title: Autenticación con storage state
summary: Inicia sesión una vez, guarda la sesión, reutilízala en cada test y aprende qué tests nunca deben compartirla.
duration: 75 min
---

## Empieza con un acertijo

Dos tests parten del mismo archivo de sesión guardada. El test A abre el dashboard y hace clic en "Sign out" (cerrar sesión). El test B abre `/products` y revisa el título de la página.

Ejecutado solo, cada test pasa. Si ejecutas A primero y luego B, el test B falla: el navegador está en la página de login. El código de B no tiene ningún error. El archivo guardado no cambió en tu disco. Ni un byte.

¿Qué cambió el test A y dónde vive ese cambio?

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Predecir qué le pasa a un test cuando su sesión guardada deja de ser válida.
- Decidir qué tests pueden compartir una sesión y cuáles necesitan la suya.
- Explicar por qué un archivo de sesión guarda un token y no "quién eres".
- Leer los projects `setup` y `chromium` y decir qué se rompe si los cambias.

## El problema: los mismos cuatro pasos, una y otra vez

Casi cada página de la tienda necesita un login. Supón que cada test iniciara sesión por la página de login. Cada test repetiría los mismos pasos: abrir la página, escribir el correo, escribir la contraseña, hacer clic.

Piensa en dos números antes de seguir leyendo. Tu suite tiene 60 tests. Iniciar sesión toma 3 segundos. ¿Cuánto tiempo se va solo en iniciar sesión? Y si la página de login se rompe, ¿cuántos tests se ponen rojos? ¿Cuántos de ellos tratan del login?

Las respuestas son 3 minutos, 60 tests y uno. Eso es desperdicio y ruido. La solución es iniciar sesión **una vez** y reutilizar el resultado.

## Storage state

Cuando inicias sesión, el servidor le da a tu navegador una **cookie**. Una cookie es un dato pequeño que el navegador guarda. El navegador la envía con cada petición, y así el servidor sabe quién pregunta.

Playwright puede guardar las cookies de un navegador en un archivo. Esto se llama *storage state* (estado de almacenamiento). Un test nuevo puede empezar con ese archivo, y así ya tiene la sesión iniciada.

Mira la tienda. Su cookie de sesión se llama `shop_session`. El servidor la crea en `app/api/auth/login/route.ts`, con `httpOnly: true`. Esa opción oculta la cookie al JavaScript de la página. Playwright aun así puede leerla, porque habla con el navegador desde fuera de la página.

## El project setup

Abre `apps/practice-shop/playwright.config.ts`. Tiene dos **projects**. Un project es un grupo de tests con nombre y con sus propias opciones.

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

El project `setup` ejecuta solo `global.setup.ts`. El project `chromium` tiene `dependencies: ["setup"]`, así que empieza solo cuando setup termina.

Detente y predice. Dos cambios, uno a la vez:

1. Borras la línea `dependencies: ["setup"]`.
2. Pones la línea de vuelta y borras `use: { storageState: ... }` del project `setup`.

¿Qué pasa en cada caso? Piensa y luego sigue leyendo.

En el caso 1, nada obliga a Playwright a ejecutar el setup primero. Cuando ejecutas un solo archivo, como `pnpm shop:e2e products/products.spec.ts`, solo se eligen los tests que coinciden, y `global.setup.ts` no coincide. En un repositorio recién clonado `e2e/.auth/admin.json` no existe, así que todos los tests fallan porque no pueden leer el archivo.

En el caso 2, el project setup hereda el `storageState: "e2e/.auth/admin.json"` por defecto. En un repositorio recién clonado ese archivo todavía no existe, así que setup falla antes de poder crearlo. La sesión vacía no es decoración. Rompe un círculo: el setup necesita el archivo, y el archivo necesita el setup.

## El test de setup

Abre `apps/practice-shop/e2e/global.setup.ts`. Después de llenar el formulario de login y hacer clic en enviar, termina con:

```ts
await page.getByTestId("login-submit").click()
await expect(page).toHaveURL(/\/dashboard/)

// Save the cookies. Every other test starts with this session.
await page.context().storageState({ path: AUTH_FILE })
```

El test espera primero la URL del dashboard. Eso prueba que el login funcionó. Después guarda las cookies en `e2e/.auth/admin.json`.

La opción por defecto en `use` carga ese archivo:

```ts
// Every test starts already signed in as admin (saved by the setup project).
storageState: "e2e/.auth/admin.json",
```

Así, cada test del project `chromium` empieza con la sesión iniciada como admin. Un test que visita `/products` va directo a la lista.

## Por qué git ignora .auth

El archivo `e2e/.auth/admin.json` guarda una cookie de sesión activa. Cualquiera con este archivo puede actuar como el admin. Trátalo como una contraseña.

Por eso la carpeta está en la lista de `apps/practice-shop/e2e/.gitignore`:

```text
.auth/
```

Git salta los archivos ignorados, así que la sesión nunca se sube en un *commit* (confirmación de cambios). Cada persona y cada ejecución de CI crea una nueva cuando corre el setup.

## Probar el comportamiento sin sesión

Algunos tests necesitan un visitante que no inició sesión. Para quitar la sesión, usa `test.use` con una sesión vacía. `auth.spec.ts` lo hace al inicio del archivo:

```ts
// These tests start signed out: an empty session instead of the saved admin one.
test.use({ storageState: { cookies: [], origins: [] } })
```

Ahora cada test de ese archivo empieza sin sesión. El primer test revisa la redirección:

```ts
await page.goto("/products")

await expect(page).toHaveURL(/\/login\?next=%2Fproducts/)
await expect(page.getByTestId("login-card")).toBeVisible()
```

## Por qué el test de cerrar sesión inicia sesión de nuevo

Aquí está la segunda mitad del acertijo. Cerrar sesión borra la sesión en el servidor. Si un test cerrara la sesión compartida del admin, todos los tests siguientes perderían su login.

Por eso el test de cerrar sesión crea primero su propia sesión:

```ts
// Log in with a NEW session just for this test. Signing out deletes the
// session on the server, so we must not use the shared admin one.
await loginViaApi(page.request, ADMIN)
await page.goto("/dashboard")
```

`loginViaApi` llama a la API de login. El servidor envía una cookie nueva, y esta entra al navegador propio de este test. La próxima lección explica `page.request`.

> **Cuidado:** Nunca hagas clic en cerrar sesión en un test que usa la sesión compartida del admin. El archivo `e2e/README.md` repite esta regla.

### De vuelta al acertijo

El test A hizo clic en "Sign out". El navegador le pide al servidor que borre el token de sesión, en `app/api/auth/logout/route.ts`. El servidor guarda su lista de tokens en memoria. El archivo `admin.json` solo guarda el token, así que no cambió. Pero el token ya no está en la lista del servidor.

El test B envía el mismo token, y el servidor no lo conoce. El servidor trata a B como un visitante y lo redirige a la página de login. El cambio vive en el servidor, no en el archivo ni en B. Por eso el fallo se ve raro: nada en B está mal, y la causa es un test que corrió antes.

## Profundiza

### Por qué un archivo de cookies basta para iniciar sesión

La web no tiene memoria. Cada petición es separada, y el servidor no sabe que iniciaste sesión hace un momento. Una cookie lo arregla. Después del login, el servidor devuelve una cookie con un token al azar. El navegador envía el token en cada petición posterior.

La tienda guarda una lista de tokens en la memoria del servidor. Este es el código real de `lib/session.ts`:

```ts
const token = (await cookies()).get(SESSION_COOKIE)?.value
if (!token) return undefined

const userId = store().sessions.get(token)
```

Entonces `admin.json` guarda solo el token, no quién eres. El servidor busca el token en su propia lista. Si el servidor olvida la lista, por ejemplo después de reiniciarse, el archivo sigue existiendo, pero el token ya no significa nada. La siguiente petición se trata como sin sesión. Esta es una razón por la que el project setup inicia sesión de nuevo en cada ejecución y no reutiliza un archivo viejo.

Un detalle más. El *endpoint* (punto de acceso de la API) de reinicio devuelve los datos a los datos iniciales, pero conserva las sesiones. El comentario en `lib/store.ts` dice por qué: "Sessions are kept, so logged-in tests stay logged in."

### Una idea equivocada común: el storage state evita probar el login

Algunos principiantes piensan que guardar la sesión significa que el login nunca se prueba. Sí se sigue probando. `auth.spec.ts` inicia sesión por la página real, con una sesión vacía. La sesión guardada quita los pasos de login de los tests que tratan de otra cosa. El login sigue bajo prueba en un solo lugar.

Además, el storage state no son solo cookies. También puede guardar `localStorage`, los datos que un sitio guarda en el navegador. El archivo de la tienda no tiene ninguno, así que `origins` está vacío. Un sitio que guarda su token en `localStorage` necesita guardar también esa parte.

### Cómo aparece en el trabajo de QA

Los productos reales tienen muchos roles: admin, viewer, cliente. Los equipos suelen hacer un test de setup y un archivo guardado por cada rol. Un test elige su rol con `test.use`. Vas a probar el rol viewer en el módulo 5. Los pasos para iniciar sesión se escriben una vez en el setup, no en cada test. Esto es *DRY* aplicado a un flujo.

### Cuándo no usarlo

No uses una sesión guardada compartida en un test que cambia la sesión misma. Cerrar sesión, cambiar una contraseña y hacer que una sesión expire son ejemplos. El test de cerrar sesión crea su propia sesión con `loginViaApi`. Una buena pregunta: "¿Este test cambia quién tiene la sesión iniciada?". Si sí, dale su propia sesión.

## Práctica

1. Abre `apps/practice-shop/playwright.config.ts`. Encuentra la línea que dice de qué project depende el project `chromium`.
2. En PowerShell, comprueba que el archivo de sesión existe. No lo compartas ni lo pegues en ningún lado.

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
6. Ahora prueba tu predicción sobre el círculo. En el grupo `Signed out`, cambia la sesión vacía por un archivo que no existe: `test.use({ storageState: "e2e/.auth/nothing.json" })`. Ejecuta el archivo otra vez y lee el error. Después deshaz el cambio.

## Reto

Encargo: la tienda tiene un segundo rol, el viewer. Un viewer puede ver productos pero no puede crearlos. Debes probarlo con un test que tiene su propia sesión. El test inicia sesión como viewer, guarda esa sesión en un archivo y abre un navegador desde ese archivo. La sesión compartida del admin debe quedar intacta.

Crea el archivo `apps/practice-shop/e2e/challenges/viewer-session.spec.ts`. La cuenta es `VIEWER` en `e2e/lib/fixtures/api-client.ts`.

Está terminado cuando:

- Tu código, no tus manos, escribe la sesión del viewer en `e2e/.auth/viewer.json`. Si borras ese archivo y ejecutas de nuevo, el test sigue pasando.
- El test abre `/products` como viewer. La insignia `user-role` dice `viewer`, y no hay enlace `products-new`.
- En el mismo contexto de navegador, un `POST` a `/api/products` recibe como respuesta el estado 403.
- El test nunca hace clic en cerrar sesión, y `pnpm shop:e2e auth/auth.spec.ts` sigue pasando después de que corrió tu spec.

Vas a necesitar algo que esta lección no enseñó: cómo crear un cliente de API sin la sesión guardada de la configuración, guardar sus cookies en un archivo y crear un contexto de navegador nuevo desde ese archivo. Busca: `playwright request.newContext`, `playwright APIRequestContext storageState path`, `playwright browser.newContext storageState`, `playwright test.beforeAll`.

## Piénsalo bien

1. **Predice.** Un compañero quita `dependencies: ["setup"]` del project `chromium`, luego clona el repositorio en una computadora nueva y ejecuta la suite por primera vez. Di qué pasa, y di qué pasaría en la segunda ejecución en la misma computadora.

<details><summary>Respuesta</summary>

Sin la dependencia, Playwright no promete que el setup corra antes de tus tests. Si ejecutas un solo archivo de spec, el archivo de setup ni siquiera se elige, y `admin.json` nunca se escribe. En una computadora nueva el archivo no existe. Cada test que usa la sesión guardada del admin falla con un error de archivo faltante, no con un error de la tienda. Un test que empieza con almacenamiento vacío y inicia sesión por sí mismo todavía puede pasar. En la segunda ejecución el archivo existe de la primera ejecución completa, así que la suite puede pasar, pero con una sesión que el servidor quizás ya olvidó. El peligro es que el problema aparece y desaparece. La línea `dependencies` convierte el orden en una regla y no en cuestión de suerte.

</details>

2. **Encuentra el bug.** Este test de cerrar sesión pasa. ¿Por qué sigue estando mal?

```ts
test("signing out returns to the login page", async ({ page, request }) => {
  await loginViaApi(request, ADMIN)
  await page.goto("/dashboard")
  await expect(page.getByTestId("dashboard-stats")).toBeVisible()

  await page.getByTestId("logout-button").click()

  await expect(page).toHaveURL(/\/login/)
})
```

<details><summary>Respuesta</summary>

El test inicia sesión con el *fixture* (recurso preparado) `request`, que tiene sus propias cookies, separadas de la página. El navegador todavía lleva la cookie compartida del admin del archivo guardado. El clic en "Sign out" entonces borra la sesión compartida del admin en el servidor, y cada test posterior pierde su login. La solución es `loginViaApi(page.request, ADMIN)`, porque `page.request` comparte las cookies con la página. El test pasa en las dos versiones, y por eso el bug es peligroso.

</details>

3. **Dos versiones.** `global.setup.ts` inicia sesión por la página de login real. Podría llamar a `loginViaApi` y guardar el estado en su lugar. ¿Cuál es mejor aquí y qué te haría elegir la otra?

<details><summary>Respuesta</summary>

La versión con API es más rápida y no tiene bloque `toPass`, así que tiene menos formas de ser *flaky* (inestable). La versión con UI prueba una vez por ejecución que una persona real puede iniciar sesión, y eso también te avisa pronto si la página de login está rota. Aquí los tests dedicados de `auth.spec.ts` ya cubren la página de login, así que la versión con API sería suficiente. Elige la versión con UI cuando tu suite no tiene otro test de login, o cuando el login tiene pasos que una llamada a la API saltaría, como un código enviado por correo.

</details>

4. **Qué se rompe si.** Un requisito cambia: la tienda debe terminar cada sesión después de 5 minutos. Tu suite tarda 20 minutos. ¿Qué se rompe, qué tests fallan primero y cuáles son dos formas de arreglarlo?

<details><summary>Respuesta</summary>

El token guardado se crea una vez al inicio. Después de 5 minutos el servidor lo rechaza, así que cada test que empieza después de ese momento es enviado a la página de login. Los tests fallan en la segunda mitad de la ejecución, y cada uno pasa si lo ejecutas solo y temprano. Una solución es hacer que la sesión dure más, solo en el entorno de pruebas. Una segunda solución es iniciar sesión de nuevo por la API al comienzo de cada archivo de test, para que ninguna sesión tenga más de unos minutos.

</details>

5. **Explícalo.** Explica el storage state a un compañero nuevo en tres frases. No uses las palabras "cookie" ni "token".

<details><summary>Respuesta</summary>

Una buena respuesta: "Cuando inicias sesión, el servidor le da a tu navegador un pequeño secreto que dice que tienes permiso para entrar. Playwright puede copiar ese secreto a un archivo al inicio de la ejecución. Cada test empieza entonces con una copia del archivo, así que arranca con la sesión iniciada y se salta la pantalla de login." Las ideas clave son que el secreto es lo que prueba quién eres, que se guarda una vez y que muchos tests lo reutilizan. Una respuesta débil dice solo "guarda el login", porque esconde qué se guarda.

</details>

6. **Criterio.** Un compañero dice que la sesión compartida del admin es riesgosa y que cada test debería iniciar sesión por su cuenta con la API. ¿Estás de acuerdo?

<details><summary>Respuesta</summary>

No hay una única respuesta correcta. Una sesión por test elimina el problema de cerrar sesión, porque ningún test puede dañar a otro, y cuesta una petición rápida por test. Una sesión compartida es más rápida y más simple, y falla solo para los pocos tests que cambian la sesión misma. La elección depende de cuántos tests cambian la sesión, cuántos tests tienes y cuánto cuesta una petición extra. En la tienda solo un test cierra sesión, así que una sesión compartida más una excepción es una elección razonable. Si muchos tests cambiaran sesiones, las sesiones por test serían mejores.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué hacen los atributos de cookie `HttpOnly`, `Secure` y `SameSite`?**
   - Busca: `http cookies HttpOnly Secure SameSite MDN`
   - Pruébalo: inicia sesión en la tienda en tu navegador. Abre DevTools, luego Application, luego Cookies, y encuentra `shop_session`. Anota qué casillas están marcadas. Luego abre la pestaña Console y escribe `document.cookie`. Mira si la cookie de sesión aparece.
   - Una buena respuesta explica: qué ataque o riesgo reduce cada atributo y por qué `document.cookie` no muestra una cookie `HttpOnly`.

2. **¿Cómo decide un servidor que un token de sesión no es válido?**
   - Busca: `session token validation server side session store`
   - Pruébalo: abre tu propio `e2e/.auth/admin.json` en un editor, y no lo compartas. Copia el objeto de la cookie en un spec nuevo como `test.use({ storageState: { cookies: [...], origins: [] } })` en línea, cambia solo el `value` a `"abc"` y abre `/products`. Anota lo que ves.
   - Una buena respuesta explica: dónde busca el servidor un token, por qué un valor inventado falla y una razón por la que un token real deja de ser válido.

3. **¿Por qué nunca se deben subir al repositorio los archivos de sesión ni las contraseñas, y dónde guardan los equipos los secretos de las pruebas?**
   - Busca: `secrets in git repository environment variables CI`
   - Pruébalo: en PowerShell ejecuta `git check-ignore -v apps/practice-shop/e2e/.auth/admin.json` y lee qué regla ignora el archivo. Luego quita esa línea de una copia de la regla en tu cabeza y di qué mostraría `git status`.
   - Una buena respuesta explica: el riesgo de un secreto subido al repositorio y un lugar seguro para guardarlo, como los secretos de CI.

## Siguiente paso

En la próxima lección preparas datos de prueba por la API en vez de por la interfaz.
