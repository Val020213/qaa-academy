---
title: Aserciones que esperan
summary: Usa aserciones expect que reintentan hasta pasar, evita waitForTimeout y lee un fallo de aserción.
duration: 50 min
---

## Objetivo

- Usar las aserciones principales de `expect(locator)`.
- Explicar la diferencia entre las aserciones que esperan y las comprobaciones de valores simples.
- Explicar por qué `page.waitForTimeout` está prohibido.
- Leer el mensaje de un fallo de aserción: esperado, recibido y registro de llamadas.

## El problema: la app no es instantánea

Abre la Practice app (app de práctica) y presiona "Load report" (Cargar reporte). El resultado llega después de cerca de un segundo y medio. Una app real es así: los datos vienen de un servidor, y eso toma tiempo.

Si un test comprueba el resultado de inmediato, el resultado todavía no está. El test falla, pero la app es correcta. ¿Cómo compruebas algo que aún no está listo?

## Aserciones que esperan

Una aserción que empieza con `expect(locator)` no comprueba una sola vez. Comprueba una y otra vez hasta que es verdadera, o hasta que termina el tiempo límite. El tiempo límite por defecto es de 5 segundos. Estas aserciones se llaman **web-first assertions** (aserciones web-first).

```ts
await page.getByTestId("report-load").click()

await expect(page.getByTestId("report-result")).toContainText("12 tests")
```

El test hace clic en el botón. Luego pregunta una y otra vez: "¿el resultado contiene `12 tests`?" Después de cerca de 1,5 segundos la respuesta es sí. El test continúa. No escribiste ninguna espera.

La aserción necesita `await`, como todo paso.

## Las aserciones que más usarás

Visibilidad y estado:

```ts
await expect(page.getByTestId("login-error")).toBeVisible()
await expect(page.getByTestId("report-loading")).toBeHidden()
await expect(page.getByTestId("report-load")).toBeDisabled()
await expect(page.getByTestId("report-load")).toBeEnabled()
await expect(page.getByTestId("cases-toggle-1")).toBeChecked()
```

Texto y valor:

```ts
await expect(page.getByTestId("cases-counter")).toHaveText("0 of 1 passed")
await expect(page.getByTestId("login-welcome")).toContainText("qa@example.com")
await expect(page.getByTestId("login-email")).toHaveValue("qa@example.com")
```

`toHaveText` compara el texto completo. `toContainText` comprueba que una parte del texto esté ahí. `toHaveValue` lee lo que hay dentro de un campo de entrada.

Cuenta, atributo y dirección:

```ts
await expect(page.getByTestId("cases-item")).toHaveCount(2)
await expect(page.getByTestId("cases-item")).toHaveAttribute("data-status", "passed")
await expect(page).toHaveURL(/#\/practice/)
```

`toHaveURL` acepta un texto o una expresión regular. Una **expresión regular** es un patrón entre dos barras. Aquí significa "la dirección contiene `#/practice`".

Para comprobar lo contrario, añade `not`: `await expect(locator).not.toBeVisible()`.

## Las aserciones de valores simples no esperan

`expect` también funciona con valores simples, como números y *strings* (cadenas de texto). Estas aserciones comprueban una sola vez, de inmediato.

```ts
const total = await page.getByTestId("cases-item").count()
expect(total).toBe(2)
```

`count()` da un número. Luego `toBe` comprueba ese número una vez. Si la app necesita 200 milisegundos más para mostrar la segunda fila, el test falla.

Compara con la versión que espera:

```ts
await expect(page.getByTestId("cases-item")).toHaveCount(2)
```

> **Consejo:** Si puedes escribir la comprobación sobre el *locator*, hazlo. Usa una aserción de valor simple solo para valores que ya son finales.

## Por qué waitForTimeout está prohibido

`page.waitForTimeout(2000)` detiene el test durante dos segundos. Es tentador. También es una mala idea.

- Si la app necesita 2,5 segundos en un día lento, el test falla.
- Si la app necesita 0,3 segundos, el test desperdicia 1,7 segundos en cada ejecución.
- Con muchos tests, el desperdicio se vuelve minutos.

Una aserción que espera es tan rápida como la app y tan paciente como el tiempo límite. La regla del equipo es: nada de `page.waitForTimeout`. Espera con aserciones web-first.

## Leer un fallo de aserción

Agrega un caso en la Practice app y luego espera el texto equivocado del contador: `"0 of 2 passed"`. El fallo se ve así:

```text
Error: expect(locator).toHaveText(expected) failed

Locator:  getByTestId('cases-counter')
Expected: "0 of 2 passed"
Received: "0 of 1 passed"
Timeout:  5000ms

Call log:
  - Expect "toHaveText" with timeout 5000ms
  - waiting for getByTestId('cases-counter')
    9 × locator resolved to <p class="counter" data-testid="cases-counter">0 of 1 passed</p>
      - unexpected value "0 of 1 passed"
```

El texto nunca llegó a ser `0 of 2 passed`. Playwright lo intentó 9 veces en 5 segundos y vio `0 of 1 passed` cada vez. Esto te dice que la app es estable pero distinta de lo que esperabas.

Léelo en este orden.

1. La primera línea nombra la aserción que falló.
2. `Locator` es el elemento que miraste.
3. `Expected` es lo que escribiste. `Received` es lo que tenía la página en la última comprobación.
4. `Timeout` es cuánto tiempo lo intentó Playwright.
5. El **call log** (registro de llamadas) es el diario de los intentos. Muestra lo que Playwright vio cada vez. Esto muchas veces muestra la causa.

> **Nota:** Si `Received` está vacío o no se encontró el elemento, la página puede estar en un estado distinto al que crees. Abre la captura de pantalla del test que falló, o usa el *trace viewer*. La lección sobre el *trace* muestra cómo.

## Profundiza

### Por qué una aserción puede esperar

Una aserción que espera no usa magia. Ejecuta un bucle: comprueba, y si la respuesta es no, espera un momento corto y comprueba de nuevo. Se detiene cuando la respuesta es sí, o cuando se acaba el tiempo.

Esta es la idea en TypeScript simple. La "app" está lista después de 300 milisegundos:

```ts
async function retryUntil(check: () => boolean, timeoutMs: number): Promise<boolean> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    if (check()) return true
    await new Promise<void>((resolve) => setTimeout(resolve, 100))
  }
  return false
}

const startedAt = Date.now()
const appIsReady = () => Date.now() - startedAt >= 300

console.log("plain check:", appIsReady())
const found = await retryUntil(appIsReady, 5000)
console.log("retrying check:", found)
console.log("waited at least 300 ms:", Date.now() - startedAt >= 300)
```

Imprime:

```text
plain check: false
retrying check: true
waited at least 300 ms: true
```

La comprobación simple mira una vez y dice no. La comprobación con reintentos dice sí. Playwright es más cuidadoso: espera más entre intentos a medida que pasa el tiempo. La idea es la misma. Hay dos temporizadores. Una aserción espera hasta 5 segundos. Un test completo espera hasta 30 segundos.

### Una idea equivocada común: "toBeHidden prueba que el trabajo terminó"

Después de hacer clic en "Load report", aparece el mensaje "Loading..." (Cargando...) y luego desaparece. Un principiante escribe esto:

```ts
await expect(page.getByTestId("report-loading")).toBeHidden()
```

Esto pasa en dos casos: cuando el mensaje de carga desapareció, y cuando nunca apareció. `toBeHidden` también es verdadero para un elemento que no existe. No prueba que el reporte esté listo. Comprueba el resultado que quieres:

```ts
await expect(page.getByTestId("report-result")).toContainText("12 tests")
```

La misma trampa existe con los errores. Para probar que "no se muestra ningún error", primero espera algo que ocurre después de la acción:

```ts
await page.getByTestId("login-submit").click()
await expect(page.getByTestId("login-welcome")).toBeVisible()
await expect(page.getByTestId("login-error")).toBeHidden()
```

Sin la línea del medio, la última línea podría pasar antes de que la app tuviera tiempo de mostrar un error.

### Cómo aparece en el trabajo real de QA: un paso lento

Algunos pasos son muy lentos, como un reporte grande. Puedes darle más tiempo a una aserción:

```ts
await expect(page.getByTestId("report-result")).toContainText("12 tests", {
  timeout: 10_000,
})
```

Esto es mejor que `waitForTimeout`: el test igual continúa en cuanto el texto está ahí. Si muchas aserciones necesitan 10 segundos, no repitas el número. Defínelo una vez en la configuración con `expect: { timeout: 10_000 }`. Esto es DRY: un número en un solo lugar.

## Práctica

1. Abre `e2e/exercises/03-playwright/04-assertions-that-wait.spec.ts`.
2. Cambia `test.fixme` por `test` en un test a la vez. Escribe los pasos a partir de los comentarios.
3. Ejecuta tu archivo:

```bash
pnpm e2e e2e/exercises/03-playwright/04-assertions-that-wait.spec.ts
```

4. En `e2e/playground.spec.ts`, cambia `"0 of 1 passed"` por `"0 of 2 passed"`. Ejecuta ese archivo y lee Expected, Received y el call log. Luego deshaz el cambio.
5. En una copia del test, reemplaza `toHaveCount(0)` por un `count()` simple y `toBe(0)`. Piensa cuándo esta versión podría fallar.

Compara con `e2e/exercises/03-playwright/solutions/04-assertions-that-wait.spec.ts` cuando termines.

## Comprueba lo que sabes

1. ¿Qué hace `expect(locator).toHaveText(...)` si el texto todavía no es el correcto?

<details><summary>Respuesta</summary>

Comprueba una y otra vez hasta que el texto es correcto o termina el tiempo límite. El tiempo límite por defecto es de 5 segundos.

</details>

2. ¿Por qué `expect(await locator.count()).toBe(2)` es arriesgado?

<details><summary>Respuesta</summary>

Lee la cuenta una vez y comprueba una vez. No espera. Usa `toHaveCount(2)` en su lugar.

</details>

3. ¿Por qué `page.waitForTimeout` está prohibido?

<details><summary>Respuesta</summary>

El tiempo fijo es una suposición. Es muy corto en un día lento y muy largo en un día rápido. Las aserciones que esperan son mejores.

</details>

4. ¿Qué hay en el call log?

<details><summary>Respuesta</summary>

Los intentos que hizo Playwright: qué buscó y qué vio cada vez.

</details>

5. Compara dos versiones de un test, después de un clic en `report-load`. Versión A: `expect(await page.getByTestId("report-result").textContent()).toContain("12 tests")`. Versión B: `await expect(page.getByTestId("report-result")).toContainText("12 tests")`. ¿Cuál es mejor y qué hace A en la Practice app?

<details><summary>Respuesta</summary>

B es mejor. En la Practice app, el elemento `report-result` está en la página desde el inicio, sin texto y oculto. `textContent()` lo lee de inmediato y obtiene un texto vacío, así que A falla y no espera. B reintenta hasta que aparece el texto, cerca de 1,5 segundos después.

</details>

6. Este test tiene un *bug*. Encuéntralo.

```ts
test("report shows the result", async ({ page }) => {
  await page.goto("/#/practice")
  await page.getByTestId("report-load").click()
  expect(page.getByTestId("report-result")).toContainText("12 tests")
})
```

<details><summary>Respuesta</summary>

La última línea no tiene `await`. La aserción empieza, pero la función del test no la espera. El resultado no es predecible. En las ejecuciones que observamos, el test falló de inmediato sin esperar el texto. En otras situaciones, un test puede terminar antes de que la comprobación acabe. De cualquier modo, la solución es `await`. Añade `await` antes de `expect`.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué son las aserciones suaves (*soft assertions*) en Playwright y cuándo usarías una?**
   - Busca: `playwright expect.soft soft assertions`
   - Una buena respuesta explica: en qué se diferencia una aserción suave de una normal cuando falla, y un caso en el que ver todos los fallos en una ejecución ayuda.

2. **¿Qué significa "polling" en programación y en qué se diferencia de esperar un tiempo fijo?**
   - Busca: `polling vs sleep programming`
   - Una buena respuesta explica: el bucle de comprobar y esperar, por qué termina en cuanto la condición es verdadera, y por qué una pausa fija es una suposición.

3. **¿Qué es una condición de carrera (*race condition*) y cómo puede hacer que un test pase en una ejecución y falle en la siguiente?**
   - Busca: `race condition flaky test`
   - Una buena respuesta explica: qué es una condición de carrera con un ejemplo simple, y cómo se relaciona con los tests que comprueban un resultado antes de que la app esté lista.

## Siguiente paso

En la siguiente lección aprendes tres formas de ver cómo se ejecutan tus tests: el modo headed, el modo UI y codegen.
