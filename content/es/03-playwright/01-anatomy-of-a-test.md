---
title: Anatomía de un test
summary: Lee un test real de Playwright línea por línea, ejecútalo, mira cómo se ve un fallo y descubre por qué un test en verde puede no probar nada.
duration: 75 min
---

## Empieza con un acertijo

Aquí hay tres tests. Cada uno escribe primero una contraseña incorrecta y hace clic en "Sign in" (Iniciar sesión) en la Practice app (app de práctica).

- El test A no tiene ninguna comprobación después del clic.
- El test B comprueba que el elemento `login-error` es visible.
- El test C comprueba que el elemento `login-welcome` está oculto.

Ahora un desarrollador borra una línea de la app: la que pone el mensaje "Wrong email or password." El error nunca aparece.

¿Cuáles de los tres tests se ponen en rojo? ¿Cuáles siguen en verde? Una de tus respuestas puede sorprenderte.

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Predecir si un test pasa o falla solo mirando su código.
- Nombrar las partes de un test de Playwright: el import, `test()`, `page`, una acción y una aserción.
- Ejecutar un archivo y un solo test, y leer el resultado de una ejecución que pasa y de una que falla.
- Explicar por qué un test en verde puede no probar nada.

## Qué es un test end-to-end

Ya ejecutas pruebas manuales. Abres la app, haces unos pasos y comparas el resultado con lo que esperas.

Un *test end-to-end* (de extremo a extremo, también llamado test E2E) hace lo mismo, pero lo hace un programa. Abre un navegador real, usa la app como un usuario y comprueba el resultado.

**Playwright** es la herramienta que controla el navegador. Tu código de test da las órdenes.

## El objetivo: la Practice app

Los tests de este módulo se ejecutan contra la Practice app. Es una página dentro del sitio del curso. Inicia el sitio en una terminal:

```bash
pnpm dev
```

Abre `http://localhost:5180/#/practice` en tu navegador. Verás un formulario de login, una lista de casos de prueba y un reporte lento. Pruébalos primero a mano. Busca las tres cosas que un test va a necesitar: dónde escribes, en qué haces clic y dónde aparece el resultado.

Mira cómo una persona usa la Practice app a mano.

![Uso manual de la Practice app: iniciar sesión, agregar casos, marcar uno, cargar el reporte.](/clips/practice-app-tour.webm)

> **Nota:** No necesitas `pnpm dev` para ejecutar los tests. Playwright inicia el sitio por sí solo. La lección sobre el archivo de configuración explica por qué.

## Leer un test real

Abre `e2e/playground.spec.ts`. Un archivo que termina en `.spec.ts` es un *spec* (un archivo con tests). Este es uno de sus tests:

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

Antes de leer la explicación, toma un lápiz. Marca cada palabra de este archivo cuyo significado puedas adivinar. Luego compara con las partes de abajo.

### El import

`import { expect, test } from "./lib/test"` trae dos herramientas. `test` declara un test. `expect` comprueba un resultado.

La regla del equipo: impórtalas desde el archivo del proyecto `e2e/lib/test.ts`, nunca desde `@playwright/test`. Hoy ese archivo solo pasa las dos herramientas. Más adelante el equipo puede agregar sus propias herramientas ahí, y ningún spec tiene que cambiar.

### test()

`test("rejects wrong credentials", async ({ page }) => { ... })` declara un test. Tiene dos argumentos.

- El primero es el nombre. Escríbelo como un comportamiento: lo que hace la app.
- El segundo es una función. Playwright la ejecuta cuando corre el test.

### async y page

La función es `async`, porque cada paso toma tiempo. Esto lo aprendiste en la lección de async.

Playwright le da a la función un `page`. Es una pestaña nueva del navegador, solo para este test. Escribes `{ page }` para tomarla del objeto que Playwright pasa. Como cada test recibe su propia pestaña, un test no puede dejar desorden para el siguiente.

### goto

`await page.goto("/#/practice")` abre una dirección. El inicio de la dirección (`http://localhost:5180`) viene del archivo de configuración, así que solo escribes el final. En este archivo, `test.beforeEach` lo ejecuta antes de cada test. `test.describe` pone los tests en un grupo con nombre. La lección 7 explica ambos.

### Una acción

`fill` escribe en un campo. `click` hace clic en un botón. Estos pasos son **acciones**: cosas que hace un usuario. Cada una lleva `await`.

### Una aserción

`await expect(...).toHaveText(...)` es una **aserción**: una comprobación. Si la comprobación es falsa, el test falla. Un test sin aserción no prueba nada.

La forma de todo test es la misma: abrir, actuar, comprobar.

## Ejecutar un archivo

Usa el script `e2e` de la raíz y escribe la ruta de un archivo. Primero, predice. El archivo tiene cuatro tests. ¿Cuántos van a pasar? ¿Las líneas se imprimen en el orden del archivo?

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

Los números y los tiempos cambian en cada ejecución. El primer número de cada línea no es el orden del archivo. Los tests corren al mismo tiempo, en varios "workers" (procesos separados), y cada línea se imprime cuando termina su test. Por eso un test nunca debe depender de que otro test corra antes.

## Ejecutar un solo test

Agrega `-g` y una parte del nombre del test. `-g` significa "grep": ejecuta solo los tests cuyo nombre contiene ese texto.

```bash
pnpm e2e e2e/playground.spec.ts -g "adds a case"
```

Solo corre un test.

Mira los pasos del test de login, con la línea de código que corresponde a cada paso.

![El test de login se ejecuta paso a paso, con cada línea de código debajo.](/clips/test-run-headed.webm)

## Cómo se ve un fallo

Un test que falla no es un problema. Es información. Provoca uno a propósito. En el test de arriba, espera un texto incorrecto:

```ts
await expect(page.getByTestId("login-error")).toHaveText("Wrong password.")
```

Antes de ejecutarlo, escribe qué crees que contendrá el mensaje. ¿Qué dos textos mostrará? ¿Cuánto tiempo crees que Playwright lo intenta antes de rendirse?

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

Léelo desde arriba. La aserción `toHaveText` falló. El *locator* (el selector que encuentra el elemento) es `login-error`. Esperabas un texto y recibiste otro. Playwright lo intentó durante 5 segundos antes de rendirse.

El **call log** (registro de llamadas) lista cada intento. Debajo ves las líneas de tu código con una flecha `>` en la línea que falla. Las próximas lecciones explican el resto del mensaje.

> **Consejo:** Lee siempre primero las líneas "Expected" y "Received". Te dicen qué fue diferente.

Trata un fallo como un científico. Tienes una hipótesis ("el texto es distinto"), y el mensaje es el resultado de un pequeño experimento. Cambia una cosa y ejecuta de nuevo. Si cambias tres cosas a la vez, no sabrás cuál lo arregló.

### De vuelta al acertijo

Solo el test B se pone en rojo. La línea borrada deja el elemento de error vacío y oculto, así que `toBeVisible` falla. El test A no tiene comprobación, así que nunca puede fallar. El test C comprueba que el mensaje de bienvenida está oculto. Eso también es cierto cuando la app tiene el bug, así que sigue en verde.

Una comprobación sirve solo si sería falsa cuando la app está mal. Hazte esta pregunta con cada aserción que escribas: "¿Qué bug pondría esto en rojo?"

## Profundiza

### Por qué un test pasa o falla

Un test de Playwright es una función normal. Playwright la llama. Si la función termina sin error, el test pasa. Si algo lanza un error, el test falla.

Una aserción es una comprobación que lanza un error cuando es falsa. Aquí está la misma idea en TypeScript simple, sin navegador:

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

Tu código de test corre en Node.js, en tu computadora. El navegador es otro programa. Cada `await` envía una orden al navegador y espera la respuesta. Por eso un `console.log` en un test se imprime en tu terminal, no en el navegador.

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

Pasa. Pero solo prueba que el campo y el botón existen y se pueden usar. Si el botón Add agregara el texto equivocado, o no agregara nada, el test seguiría pasando. Agrega una aserción sobre el resultado, como `toHaveCount(1)`. Un test en verde es tan fuerte como sus comprobaciones.

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

Los testers llaman a esta forma **Arrange, Act, Assert** (preparar, actuar, comprobar). En `e2e/playground.spec.ts`, el `goto` se escribe una sola vez en `beforeEach`, no en cada test. Esta es la idea llamada DRY, "Don't Repeat Yourself" (no te repitas). La estudiaste al final del módulo de programación. El límite también es importante: un test debe seguir leyéndose como una historia clara de arriba abajo.

Cada test de aquí crea su propio caso. No depende de un caso de otro test. Una buena suite de tests es **independiente** y **repetible**: puedes ejecutar cualquier test solo, en cualquier orden, muchas veces, y obtener la misma respuesta.

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

## Reto

Crea el archivo `e2e/challenges/01-anatomy-of-a-test.spec.ts`. Elige un comportamiento de la Practice app que `e2e/playground.spec.ts` no pruebe. Buenas opciones: cerrar sesión después de iniciar sesión, borrar un caso, o la regla de que un título de caso vacío no agrega nada. Escribe un test para ese comportamiento, con la forma Arrange, Act, Assert. Divide el test en pasos con nombre. Luego demuestra que tu test puede fallar: rómpelo a propósito y lee el mensaje.

Está terminado cuando:

- El archivo tiene exactamente un test, y `pnpm e2e e2e/challenges/01-anatomy-of-a-test.spec.ts` lo muestra como aprobado.
- El test tiene tres pasos con nombre para Arrange, Act y Assert, y la salida de la ejecución muestra los nombres de los pasos cuando lo haces fallar.
- Cambiaste un valor esperado a propósito, viste fallar el test, y el mensaje de fallo señaló tu paso Assert. Luego lo devolviste a como estaba.
- El test tiene al menos una aserción que sería falsa si el comportamiento estuviera roto. Puedes decir en una frase qué bug la pone en rojo.
- El test no usa `page.waitForTimeout`.

Vas a necesitar algo que esta lección no enseñó: cómo agrupar líneas de un test en pasos con nombre. Busca: `playwright test.step`.

> **Consejo:** Puedes pedir ayuda a un asistente de IA. Pero debes ejecutar el código, y debes poder explicar cada línea a un compañero. Nunca conserves código que no puedes explicar.

## Piénsalo bien

1. Predice la salida y explica por qué. Usa `runTest` y `check` de "Profundiza".

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

Imprime `step 1`, `step 2`, y luego `failed: two checks (expected "bird" but got "cat")`. El texto `step 3` nunca se imprime. El segundo `check` lanza un error, y un error detiene la función en esa línea. Playwright funciona igual: la primera aserción que falla termina el test, así que las líneas siguientes no se ejecutan.

</details>

2. Este test se ejecuta y pasa, pero hace mal su trabajo. Encuentra el bug.

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

El test comprueba que no se muestra ningún error. Eso también es cierto cuando la app no hace nada, o cuando se congela. La comprobación pasaría incluso antes del clic. Comprueba lo que demuestra el éxito: `login-welcome` es visible y contiene el correo. El nombre del test dice "accepts" (acepta), así que la aserción debe probar una aceptación.

</details>

3. Dos versiones de un spec funcionan. La versión A llama a `page.goto` una vez en `test.beforeEach`. La versión B escribe `page.goto` como primera línea de cada test. ¿Cuál es mejor aquí, y qué te haría elegir la otra?

<details><summary>Respuesta</summary>

En `e2e/playground.spec.ts`, A es mejor. Todos los tests empiezan en la misma página, así que la línea repetida es ruido, y un cambio de dirección se hace en un solo lugar. B es mejor cuando algunos tests empiezan en otro lugar, o cuando un lector debe ver el estado inicial sin subir al inicio del archivo. El test debe leerse como una historia, así que elige la versión donde la historia queda clara.

</details>

4. ¿Qué se rompe si un desarrollador cambia `data-testid="login-error"` por `data-testid="auth-error"`, y el texto del mensaje es el mismo? ¿Cómo se ve el fallo, y es un bug de la app?

<details><summary>Respuesta</summary>

Todo test que usa `getByTestId("login-error")` falla después de unos 5 segundos. El mensaje dice que el locator no encontró un elemento, así que no hay texto `Received`. Un usuario no ve ninguna diferencia, así que no es un bug de la app. Es un cambio del contrato entre la app y los tests. La solución es hablar con el desarrollador y actualizar los tests en el mismo cambio.

</details>

5. Explica a un compañero en tres frases por qué un test sin comprobaciones puede pasar. No uses la palabra "aserción".

<details><summary>Respuesta</summary>

Un test falla solo cuando algo lanza un error. Pasos como escribir y hacer clic lanzan un error solo cuando falta el elemento. Una comprobación es la parte del código que compara la página con lo que esperas, y un test sin comprobación nunca compara nada, así que nunca puede estar mal.

</details>

6. Un colega dice: "Una aserción por test es la regla." Otro dice: "Cinco aserciones en un test está bien." ¿Quién tiene razón?

<details><summary>Respuesta</summary>

No hay una sola respuesta correcta. Una aserción por test da un mensaje de fallo claro y un nombre preciso. Pero cada test repite la preparación, y eso es lento cuando la preparación es larga. Varias aserciones sobre un mismo resultado de un mismo comportamiento están bien, por ejemplo texto, cantidad y contador después de "agregar un caso". Varias aserciones sobre comportamientos distintos en un test no están bien, porque el primer fallo esconde el resto. Depende de una pregunta: si este test falla, ¿sabré de inmediato qué comportamiento está roto?

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Cuál es la diferencia entre un test unitario, un test de integración y un test end-to-end?**
   - Busca: `test pyramid unit integration end-to-end`
   - Pruébalo: Toma el botón Add de la lista de casos. Escribe una frase para cada tipo de test: qué comprobarías y qué necesitarías para ejecutarlo.
   - Una buena respuesta explica: qué comprueba cada tipo de test, cuál es el más rápido, y por qué los equipos suelen escribir más tests rápidos que lentos.

2. **¿Qué es un test flaky (inestable) y cuáles son las causas más comunes?**
   - Busca: `flaky test causes automation`
   - Pruébalo: Ejecuta `pnpm e2e e2e/playground.spec.ts --repeat-each=10` y mira el resultado. Luego busca en la documentación de Playwright para qué sirve `--repeat-each`.
   - Una buena respuesta explica: qué significa "flaky", da al menos tres causas como tiempos, datos compartidos y un entorno inestable, y dice por qué un test flaky es dañino para un equipo.

3. **¿Qué es el mutation testing (pruebas de mutación) y cómo se conecta con la pregunta "¿qué bug pondría esto en rojo?"**
   - Busca: `mutation testing explained`
   - Pruébalo: Cambia una línea de `src/practice/LoginPanel.tsx` a propósito, por ejemplo el texto del error. Ejecuta tus tests y anota cuáles fallan. Deshaz el cambio.
   - Una buena respuesta explica: cómo se usa un pequeño bug deliberado para medir la fuerza de los tests, y por qué un test que sigue en verde es una señal de alerta.

## Siguiente paso

En la próxima lección aprendes los locators: cómo un test encuentra un elemento en la página.
