---
title: Anatomía de un test
duration: 60 min
---

## Objetivo

En esta lección lees un test de Playwright, lo ejecutas y usas el mensaje de fallo para encontrar qué resultado no coincide con lo esperado.

- Reconocer el import, `test()`, `page`, las acciones y las aserciones.
- Organizar un test en preparar, actuar y comprobar.
- Ejecutar un archivo o un solo test y leer su resultado.
- Detectar un test que pasa sin comprobar el comportamiento que nombra.

## Tests end-to-end

Un **test end-to-end** (E2E) usa un navegador real para recorrer la app y comprobar el resultado. Playwright controla el navegador con las instrucciones de tu test; su ejecutor llama a la función que contiene esas instrucciones.

## La Practice app

Los tests de este módulo usan la Practice app, una página del sitio del curso. Para probarla a mano, inicia el sitio en una terminal:

```bash
pnpm dev
```

Abre `http://localhost:5180/#/practice`. Verás un formulario de login, una lista de casos de prueba y un reporte lento. Identifica los campos, los botones y dónde aparece cada resultado.

![Uso manual de la Practice app: iniciar sesión, agregar casos, marcar uno, cargar el reporte.](/clips/practice-app-tour.webm)

> **Nota:** No necesitas `pnpm dev` para ejecutar los tests. El ejecutor de Playwright inicia el sitio según la configuración del proyecto.

## Leer un test real

Abre `e2e/playground.spec.ts`. La terminación `.spec.ts` identifica un *spec*, un archivo con tests. Este es uno de ellos:

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

### El import

`import { expect, test } from "./lib/test"` trae las herramientas para declarar un test y comprobar su resultado.

En este proyecto se importan desde `e2e/lib/test.ts`, nunca desde `@playwright/test`. Ese archivo reexporta las herramientas y permite centralizar los cambios del equipo.

### test()

`test("rejects wrong credentials", async ({ page }) => { ... })` recibe dos argumentos: el nombre del comportamiento y la función que el ejecutor de Playwright llama para probarlo.

### async y page

La función usa `async` para esperar las operaciones del navegador con `await`.

Playwright le da a la función un `page`. Es una pestaña nueva del navegador, solo para este test. Escribes `{ page }` para tomarla del objeto que Playwright pasa. Como cada test recibe su propia pestaña, un test no puede dejar desorden para el siguiente.

### goto

`await page.goto("/#/practice")` abre la página. La parte inicial de la dirección, `http://localhost:5180`, viene de la configuración del proyecto.

En este archivo, `test.beforeEach` ejecuta la navegación antes de cada test. `test.describe` agrupa los tests bajo el nombre de login.

### Las acciones

`fill` escribe en un campo y `click` hace clic en el botón. Cada acción lleva `await` para que termine antes de continuar con la siguiente línea.

### La aserción

`await expect(...).toHaveText(...)` comprueba el texto del elemento. El locator busca el elemento por su identificador `login-error`; la aserción compara su texto con el esperado.

Si el texto todavía no coincide, Playwright vuelve a buscar el elemento y comprobarlo hasta que coincida o se agote el tiempo de espera. En ese caso, la aserción lanza un error y el test falla.

## Preparar, actuar y comprobar

La estructura **Arrange, Act, Assert** separa la preparación, la acción que pruebas y la comprobación del resultado. En este ejemplo, agregar un caso prepara el estado necesario para probar que marcarlo cambia el contador:

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

El test crea su propio caso. No necesita que otro test lo haya creado antes. Debes poder ejecutar cada test solo y repetirlo con el mismo resultado.

## Ejecutar un archivo

Desde la raíz del proyecto, usa el script `e2e` con la ruta del archivo:

```bash
pnpm e2e e2e/playground.spec.ts
```

La salida muestra el resultado de los cuatro tests:

```text
Running 4 tests using 4 workers

  ✓  4 [chromium] › e2e/playground.spec.ts:12:3 › login › rejects wrong credentials (1.9s)
  ✓  2 [chromium] › e2e/playground.spec.ts:22:3 › login › accepts the test credentials (2.0s)
  ✓  1 [chromium] › e2e/playground.spec.ts:34:3 › test case list › adds a case and updates the counter (2.0s)
  ✓  3 [chromium] › e2e/playground.spec.ts:44:3 › slow loading › shows the report when loading ends (3.8s)

  4 passed (5.1s)
```

La marca de verificación indica que el test pasó. `chromium` es el navegador. Luego aparecen el archivo, el número de línea, el grupo, el nombre del test y su duración.

Este proyecto ejecuta los tests en paralelo, en varios **workers** (procesos separados). Cada línea se imprime cuando termina su test, por eso la lista puede tener un orden distinto al del archivo. Los números, la cantidad de workers y los tiempos pueden cambiar entre ejecuciones.

## Ejecutar un solo test

Agrega `-g` y una parte del nombre para seleccionar el test:

```bash
pnpm e2e e2e/playground.spec.ts -g "adds a case"
```

Este comando ejecuta solo el test que agrega un caso. El siguiente clip muestra los pasos de otro test, el de login, junto con su código:

![El test de login se ejecuta paso a paso, con cada línea de código debajo.](/clips/test-run-headed.webm)

## Leer un fallo

Para provocar un fallo, cambia el texto esperado en la aserción del test de credenciales incorrectas:

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
    9 × locator resolved to <div role="alert" data-slot="alert" ...>Wrong email or password.</div>
      - unexpected value "Wrong email or password."
```

`Expected` muestra el texto esperado y `Received` el que encontró Playwright. La aserción buscó el elemento con `getByTestId('login-error')` y comprobó su texto durante 5 segundos antes de fallar.

El **call log** (registro de llamadas) muestra los intentos. Debajo aparecen las líneas del test con una flecha `>` en la línea del fallo. Usa esos datos para revisar la expectativa o el comportamiento de la app y vuelve a ejecutar tras cambiar una sola cosa.

## Profundiza

### El resultado de la función del test

El ejecutor de Playwright llama a la función del test. Si termina sin error, el test pasa; si lanza un error, falla. Una aserción lanza un error cuando su comprobación no se cumple.

Este ejemplo reproduce la idea en TypeScript, sin navegador:

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

El primer test pasa porque imprimir un mensaje no comprueba que sea el esperado. En el segundo, `check` compara los textos y lanza el error que captura `runTest`.

Tu código de test corre en Node.js, en tu computadora. El navegador es otro programa. Cada `await` envía una orden al navegador y espera la respuesta. Por eso un `console.log` en un test se imprime en tu terminal, no en el navegador.

### Un test sin comprobación del resultado

Este test tiene el nombre de un comportamiento, pero termina después del clic:

```ts
import { test } from "./lib/test"

test("adds a case", async ({ page }) => {
  await page.goto("/#/practice")
  await page.getByTestId("cases-input").fill("Check the login")
  await page.getByTestId("cases-add").click()
})
```

Pasa si Playwright puede completar las acciones. Si el botón Add no agregara nada o agregara un texto incorrecto, el test seguiría pasando. Una aserción sobre la cantidad de casos, como `toHaveCount(1)`, detectaría que no se agregó ninguno.

## Práctica

1. Inicia el sitio con `pnpm dev` y prueba el formulario de login a mano.
2. En una segunda terminal, ejecuta `pnpm e2e e2e/playground.spec.ts`. Lee los resultados.
3. Ejecuta un solo test: `pnpm e2e e2e/playground.spec.ts -g "rejects wrong credentials"`.
4. En `e2e/playground.spec.ts`, cambia el texto `"Wrong email or password."` por `"Wrong password."`. Ejecuta el archivo, lee el fallo y deshaz el cambio.
5. Abre `e2e/exercises/03-playwright/01-anatomy-of-a-test.spec.ts`. Cambia `test.fixme` por `test` en cada test y escribe los pasos indicados en los comentarios.
6. Ejecuta solo tu archivo:

```bash
pnpm e2e e2e/exercises/03-playwright/01-anatomy-of-a-test.spec.ts
```

Compara tu código con `e2e/exercises/03-playwright/solutions/01-anatomy-of-a-test.spec.ts`.

## Reto

Crea `e2e/challenges/01-anatomy-of-a-test.spec.ts` con un test de un comportamiento que `e2e/playground.spec.ts` no pruebe: cerrar sesión, borrar un caso o impedir que un título vacío agregue un caso. Organízalo en pasos con nombre para Arrange, Act y Assert.

Está terminado cuando:

- El archivo tiene exactamente un test, `pnpm e2e e2e/challenges/01-anatomy-of-a-test.spec.ts` lo muestra como aprobado y no usa `page.waitForTimeout`.
- El test tiene tres pasos con nombre para Arrange, Act y Assert.
- Cambiaste un valor esperado, viste fallar el test y el mensaje señaló el paso Assert. Luego restauraste el valor.
- Al menos una aserción sería falsa si el comportamiento estuviera roto. Puedes nombrar el bug que detecta.

Para agrupar líneas del test en pasos con nombre, busca: `playwright test.step`.

## Piénsalo bien

1. ¿Qué imprime este código y qué línea impide que llegue al último mensaje? Usa `runTest` y `check` de "Profundiza".

```ts
await runTest("two checks", async () => {
  console.log("step 1")
  check("dog", "dog")
  console.log("step 2")
  check("cat", "bird")
  console.log("step 3")
})
```

<details><summary>Respuesta</summary>

Imprime `step 1`, `step 2` y `failed: two checks (expected "bird" but got "cat")`. El segundo `check` lanza un error y detiene la función antes de imprimir `step 3`.

</details>

2. Este test pasa incluso si el clic no inicia sesión. ¿Qué le falta comprobar?

```ts
test("accepts the test credentials", async ({ page }) => {
  await page.goto("/#/practice")
  await page.getByTestId("login-email").fill("qa@example.com")
  await page.getByTestId("login-password").fill("Playwright123")
  await page.getByTestId("login-submit").click()

  await expect(page.getByTestId("login-error")).toBeHidden()
})
```

<details><summary>Respuesta</summary>

`login-error` también está oculto antes del clic y cuando la app no hace nada. Para demostrar que aceptó las credenciales, comprueba que `login-welcome` es visible y contiene el correo.

</details>

## Siguiente paso

En la próxima lección aprendes los locators: cómo un test encuentra un elemento en la página.
