---
title: Anatomía de un test
summary: Lee un test real de Playwright línea por línea, ejecútalo y mira cómo se ve un fallo.
duration: 45 min
---

## Objetivo

- Explicar qué es un test end-to-end.
- Nombrar las partes de un test de Playwright: import, `test()`, `page`, una acción y una aserción.
- Ejecutar un archivo y un solo test.
- Leer la salida de una ejecución que pasa y de una que falla.

## Qué es un test end-to-end

Ya ejecutas pruebas manuales. Abres la app, haces unos pasos y comparas el resultado con lo que esperas.

Un ***test* end-to-end (de extremo a extremo)** (también llamado test E2E) hace lo mismo, pero lo hace un programa. Abre un navegador real, usa la app como un usuario y comprueba el resultado.

**Playwright** es la herramienta que controla el navegador. Tu código de test le da las órdenes.

## El objetivo: la Practice app

Los tests de este módulo se ejecutan contra la Practice app (app de práctica). Es una página de este sitio del curso. Inicia el sitio en una terminal:

```bash
pnpm dev
```

Abre `http://localhost:5180/#/practice` en tu navegador. Verás un formulario de *login* (inicio de sesión), una lista de casos de prueba y un reporte lento. Pruébalos primero a mano.

> **Nota:** No necesitas `pnpm dev` para ejecutar los tests. Playwright inicia el sitio por sí mismo. La lección sobre el archivo de configuración explica por qué.

## Leer un test real

Abre `e2e/playground.spec.ts`. Un archivo que termina en `.spec.ts` es un ***spec*** (especificación): un archivo con tests. Este es uno de sus tests:

```ts
import { expect, test } from "./lib/test"

test.beforeEach(async ({ page }) => {
  await page.goto("/#/practice")
})

test.describe("login", () => {
  test("rejects wrong credentials", async ({ page }) => {
    await page.getByTestId("login-email").fill("qa@example.com")
    await page.getByTestId("login-password").fill("wrong")
    await page.getByTestId("login-submit").click()

    await expect(page.getByTestId("login-error")).toHaveText(
      "Wrong email or password."
    )
  })
})
```

Revísalo parte por parte.

### El import

`import { expect, test } from "./lib/test"` trae dos herramientas. `test` declara un test. `expect` comprueba un resultado.

La regla del equipo: impórtalas del archivo del proyecto `e2e/lib/test.ts`, nunca de `@playwright/test`.

### test()

`test("rejects wrong credentials", async ({ page }) => { ... })` declara un test. Tiene dos argumentos.

- El primero es el nombre. Escríbelo como un comportamiento: lo que hace la app.
- El segundo es una función. Playwright la ejecuta cuando corre el test.

### async y page

La función es `async`, porque cada paso toma tiempo. Esto lo aprendiste en la lección sobre async.

Playwright le da a la función una `page`. Es una pestaña nueva del navegador, solo para este test. Escribes `{ page }` para tomarla del objeto que Playwright pasa.

### goto

`await page.goto("/#/practice")` abre una dirección. El inicio de la dirección (`http://localhost:5180`) viene del archivo de configuración, así que solo escribes el final. En este archivo, `test.beforeEach` la ejecuta antes de cada test. `test.describe` pone tests en un grupo con nombre. La lección 7 explica ambos.

### Una acción

`fill` escribe en un campo. `click` hace clic en un botón. Estos pasos son **acciones**: cosas que hace un usuario. Cada una lleva `await`.

### Una aserción

`await expect(...).toHaveText(...)` es una **aserción** (*assertion*): una comprobación. Si la comprobación es falsa, el test falla. Un test sin aserción no prueba nada.

La forma de todo test es la misma: abrir, actuar, comprobar.

## Ejecutar un archivo

Usa el script `e2e` de la raíz y da la ruta de un archivo:

```bash
pnpm e2e e2e/playground.spec.ts
```

La salida es una lista:

```text
Running 4 tests using 4 workers

  ✓  4 [chromium] › e2e/playground.spec.ts:12:3 › login › rejects wrong credentials (1.9s)
  ✓  2 [chromium] › e2e/playground.spec.ts:22:3 › login › accepts the test credentials (2.0s)
  ✓  1 [chromium] › e2e/playground.spec.ts:34:3 › test case list › adds a case and updates the counter (2.0s)
  ✓  3 [chromium] › e2e/playground.spec.ts:44:3 › slow loading › shows the report when loading ends (3.8s)

  4 passed (5.1s)
```

Cada línea es un test. La marca de verificación significa que pasó. `chromium` es el navegador. Después ves el archivo, el número de línea, el grupo, el nombre del test y el tiempo.

Los números y los tiempos cambian en cada ejecución.

## Ejecutar un solo test

Agrega `-g` y una parte del nombre del test. `-g` significa "grep": ejecuta solo los tests cuyo nombre contiene ese texto.

```bash
pnpm e2e e2e/playground.spec.ts -g "adds a case"
```

Solo se ejecuta un test.

## Cómo se ve un fallo

Un test que falla no es un problema. Es información. Provoca uno a propósito. En el test de arriba, espera un texto incorrecto:

```ts
await expect(page.getByTestId("login-error")).toHaveText("Wrong password.")
```

La ejecución imprime un mensaje como este:

```text
Error: expect(locator).toHaveText(expected) failed

Locator:  getByTestId('login-error')
Expected: "Wrong password."
Received: "Wrong email or password."
Timeout:  5000ms

Call log:
  - Expect "toHaveText" with timeout 5000ms
  - waiting for getByTestId('login-error')
    9 × locator resolved to <p role="alert" data-testid="login-error" ...>Wrong email or password.</p>
      - unexpected value "Wrong email or password."
```

Léelo desde arriba. La aserción `toHaveText` falló. El *locator* (localizador) es `login-error`. Esperabas un texto y recibiste otro. Playwright lo intentó durante 5 segundos antes de rendirse.

El **call log** (registro de llamadas) lista cada intento. Debajo ves las líneas de tu código con una flecha `>` en la línea que falla. Las próximas lecciones explican el resto del mensaje.

> **Consejo:** Lee siempre primero las líneas "Expected" y "Received". Te dicen qué fue diferente.

## Profundiza

### Por qué un test pasa o falla

Un test de Playwright es una función normal. Playwright la llama. Si la función termina sin error, el test pasa. Si algo lanza un error, el test falla.

Una aserción es una comprobación que lanza un error cuando es falsa. Esta es la misma idea en TypeScript simple, sin navegador:

```ts
async function runTest(name: string, body: () => Promise<void>): Promise<void> {
  try {
    await body()
    console.log(`passed: ${name}`)
  } catch (error) {
    console.log(`failed: ${name} (${(error as Error).message})`)
  }
}

function check(actual: string, expected: string): void {
  if (actual !== expected) {
    throw new Error(`expected "${expected}" but got "${actual}"`)
  }
}

await runTest("no check at all", async () => {
  console.log("Wrong email or password.")
})

await runTest("with a check", async () => {
  check("Wrong email or password.", "Wrong password.")
})
```

Imprime:

```text
Wrong email or password.
passed: no check at all
failed: with a check (expected "Wrong password." but got "Wrong email or password.")
```

El primer test pasa porque nada lanzó un error. No probó nada.

Tu código de test se ejecuta en Node.js, en tu computadora. El navegador es otro programa. Cada `await` envía una orden al navegador y espera la respuesta. Por eso un `console.log` en un test imprime en tu terminal, no en el navegador.

### Una idea equivocada común: "el test está en verde, así que la app funciona"

Mira este test:

```ts
import { test } from "./lib/test"

test("adds a case", async ({ page }) => {
  await page.goto("/#/practice")
  await page.getByTestId("cases-input").fill("Check the login")
  await page.getByTestId("cases-add").click()
})
```

Pasa. Pero solo prueba que el campo y el botón existen y se pueden usar. Si el botón Add (Agregar) agregara el texto equivocado, o no agregara nada, el test pasaría igual. Agrega una aserción sobre el resultado, como `toHaveCount(1)`. Un test en verde es tan fuerte como sus comprobaciones.

### Cómo aparece en el trabajo real de QA

Un buen test se lee como un caso de prueba manual: preparar, hacer, comprobar. Aquí el test tiene tres pasos:

```ts
import { expect, test } from "./lib/test"

test("ticking a case updates the counter", async ({ page }) => {
  await page.goto("/#/practice")

  // Prepare: a case exists.
  await page.getByTestId("cases-input").fill("Check the login")
  await page.getByTestId("cases-add").click()

  // Do: tick it.
  await page.getByTestId("cases-toggle-1").check()

  // Check: the counter changed.
  await expect(page.getByTestId("cases-counter")).toHaveText("1 of 1 passed")
})
```

Los testers llaman a esta forma Arrange, Act, Assert (preparar, actuar, comprobar). En `e2e/playground.spec.ts`, el `goto` se escribe una vez en `beforeEach`, no en cada test. Esta es la idea llamada DRY, "Don't Repeat Yourself" (no te repitas). La estudiaste al final del módulo de programación. El límite también es importante: un test debe seguir leyéndose como una historia clara de arriba abajo.

## Práctica

1. Inicia el sitio con `pnpm dev` y prueba el formulario de login a mano.
2. En una segunda terminal, ejecuta `pnpm e2e e2e/playground.spec.ts`. Lee la lista.
3. Ejecuta un solo test: `pnpm e2e e2e/playground.spec.ts -g "rejects wrong credentials"`.
4. En `e2e/playground.spec.ts`, cambia el texto `"Wrong email or password."` por `"Wrong password."`. Ejecuta el archivo. Lee el fallo. Luego deshaz el cambio.
5. Abre `e2e/exercises/03-playwright/01-anatomy-of-a-test.spec.ts`. Cambia `test.fixme` por `test` en cada test y escribe los pasos a partir de los comentarios.
6. Ejecuta solo tu archivo:

```bash
pnpm e2e e2e/exercises/03-playwright/01-anatomy-of-a-test.spec.ts
```

Cuando termines, compara tu código con `e2e/exercises/03-playwright/solutions/01-anatomy-of-a-test.spec.ts`.

## Comprueba lo que sabes

1. ¿Qué es una aserción?

<details><summary>Respuesta</summary>

Una comprobación. Compara lo que muestra la app con lo que esperas. Si son distintos, el test falla.

</details>

2. ¿Qué hace `-g`?

<details><summary>Respuesta</summary>

Ejecuta solo los tests cuyo nombre contiene el texto que das.

</details>

3. ¿Por qué cada paso de un test lleva `await`?

<details><summary>Respuesta</summary>

Cada paso toma tiempo. `await` hace que el test espere a que el paso termine antes del siguiente.

</details>

4. ¿Qué líneas de un mensaje de fallo lees primero?

<details><summary>Respuesta</summary>

Las líneas "Expected" y "Received". Muestran la diferencia.

</details>

5. Un test abre la Practice app, llena `login-email` y `login-password` con valores incorrectos y hace clic en `login-submit`. No tiene aserción. ¿Pasa? ¿Es un test útil?

<details><summary>Respuesta</summary>

Pasa, porque los campos y el botón existen y nada lanza un error. No es útil. También pasaría si la app no mostrara ningún error, o mostrara el error equivocado. El test necesita una aserción sobre `login-error`.

</details>

6. Un test usa `page.getByTestId("login-erorr")` con una errata, y espera el texto `"Wrong email or password."`. La app funciona bien. ¿Qué hace el test y cuánto tarda?

<details><summary>Respuesta</summary>

Falla después de unos 5 segundos. Ningún elemento tiene el test id con la errata. Playwright sigue buscando hasta que termina el tiempo límite de la aserción, y luego informa que no encontró el elemento. Un test que falla no siempre significa un *bug* en la app. Este es un *bug* en el test.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Cuál es la diferencia entre un test unitario, un test de integración y un test end-to-end?**
   - Busca: `test pyramid unit integration end-to-end`
   - Una buena respuesta explica: qué comprueba cada tipo de test, cuál es el más rápido, y por qué los equipos suelen escribir más tests rápidos que lentos.

2. **¿Qué es el patrón Arrange, Act, Assert y por qué lo usan los testers?**
   - Busca: `arrange act assert pattern testing`
   - Una buena respuesta explica: las tres partes de un test, con un ejemplo pequeño, y cómo el patrón hace que un test sea más fácil de leer.

3. **¿Qué es un test *flaky* (inestable) y cuáles son las causas más comunes?**
   - Busca: `flaky test causes automation`
   - Una buena respuesta explica: qué significa "flaky", da al menos tres causas como el tiempo, los datos compartidos y un entorno inestable, y dice por qué un test flaky daña a un equipo.

## Siguiente paso

En la siguiente lección aprendes los *locators*: cómo un test encuentra un elemento en la página.
