---
title: Aserciones que esperan
duration: 55 min
---

## Objetivo

En esta lección compruebas resultados que tardan en aparecer y eliges aserciones que detecten el bug que quieres probar.

- Usar aserciones web-first para esperar un estado de la página.
- Distinguir una aserción sobre un locator de una comprobación sobre un valor ya leído.
- Elegir un timeout para un paso lento sin agregar pausas fijas.
- Leer un fallo de aserción y comprobar que tu test puede fallar.

## Aserciones que esperan

Después de una acción, la página puede tardar en mostrar el resultado. En la Practice app, el botón "Load report" (Cargar reporte) simula esa demora: el reporte aparece después de aproximadamente 1.5 segundos.

Las **aserciones web-first** reintentan la comprobación hasta que se cumple o vence el timeout. En cada intento, Playwright busca de nuevo con el locator y comprueba el estado actual del DOM. El timeout por defecto es de 5 segundos.

```ts
await page.getByTestId("report-load").click()

await expect(page.getByTestId("report-result")).toContainText("12 tests")
```

Después del clic, Playwright vuelve a comprobar el texto de `report-result` hasta encontrar `12 tests`. En esta app, la aserción pasa después de aproximadamente 1.5 segundos; si el texto no aparece dentro del timeout, falla.

![Después del clic el botón se deshabilita y dice Loading, luego aparece el resultado.](/clips/auto-wait-report.webm)

Estas aserciones son asíncronas y necesitan `await` para que la función del test espere su resultado.

## Las aserciones que más vas a usar

Los siguientes ejemplos muestran comprobaciones independientes. Elige las que correspondan al estado que quieres probar.

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

`toHaveText` compara el texto completo. `toContainText` comprueba que contiene una parte. `toHaveValue` comprueba el valor de un campo de entrada.

Cantidad, atributo y dirección:

```ts
await expect(page.getByTestId("cases-item")).toHaveCount(2)
await expect(page.getByTestId("cases-item")).toHaveAttribute("data-status", "passed")
await expect(page).toHaveURL(/#\/practice/)
```

`toHaveCount` comprueba cuántos elementos coinciden con el locator. `toHaveAttribute` comprueba el valor del atributo indicado.

`toHaveURL` acepta un texto o una expresión regular. Una **expresión regular** describe un patrón; en el ejemplo, está escrita entre barras y busca `#/practice` en la dirección.

Para comprobar lo contrario, agrega `not`: `await expect(locator).not.toBeVisible()`.

## Las aserciones de valores simples no esperan

Una comprobación sobre un valor ya leído no vuelve a consultar la página.

```ts
const total = await page.getByTestId("cases-item").count()
expect(total).toBe(2)
```

`count()` devuelve la cantidad de elementos en ese momento. `toBe` compara el número guardado en `total` una sola vez. Si la segunda fila aparece 200 milisegundos después, esta comprobación falla.

La versión que espera vuelve a contar con el locator:

```ts
await expect(page.getByTestId("cases-item")).toHaveCount(2)
```

Lo mismo ocurre al leer texto. El elemento `report-result` existe desde el inicio, oculto y vacío. Una llamada a `await page.getByTestId("report-result").textContent()` justo después de `goto` obtiene ese texto vacío; no espera a que llegue el reporte.

Usa una aserción sobre el locator cuando el valor de la página todavía puede cambiar. Las comprobaciones de valores simples sirven cuando ya tienes el resultado final, por ejemplo para comprobar una suma calculada con datos del reporte.

## Esperar una condición en lugar de una pausa fija

`page.waitForTimeout(2000)` detiene el test durante dos segundos, sin comprobar el estado de la página.

- Si el resultado necesita 2.5 segundos, la pausa termina antes de que esté listo.
- Si necesita 0.3 segundos, la pausa desperdicia 1.7 segundos.

La regla del equipo es no usar `page.waitForTimeout`. Una aserción web-first continúa cuando detecta la condición esperada y falla si no la encuentra dentro del timeout.

## Comprobar el resultado de la acción

`toBeHidden` pasa si el elemento está oculto o no existe. Por eso, la ausencia de un mensaje de carga no demuestra que el reporte esté listo.

Supón que un desarrollador deja el reporte oculto al terminar la carga:

```tsx
setLoading(false)
setReady(false) // the correct line is setReady(true)
```

Este test pasa aunque el reporte nunca aparezca:

```ts
await page.getByTestId("report-load").click()
await expect(page.getByTestId("report-loading")).toBeHidden()
```

El código de la app oculta el mensaje de carga después de aproximadamente 1.5 segundos, y eso satisface `toBeHidden`. Para detectar el bug del reporte, comprueba su resultado con `toContainText`, como en el primer ejemplo.

Para comprobar que no hay un error después de iniciar sesión, espera primero la señal de éxito:

```ts
await page.getByTestId("login-submit").click()
await expect(page.getByTestId("login-welcome")).toBeVisible()
await expect(page.getByTestId("login-error")).toBeHidden()
```

Si omites la comprobación del mensaje de bienvenida en un login asíncrono, la última línea podría pasar antes de que la app mostrara un error.

## Leer un fallo de aserción

Si agregas un caso y esperas el texto incorrecto del contador, `"0 of 2 passed"`, el fallo se ve así:

```text
Error: expect(locator).toHaveText(expected) failed

Locator:  getByTestId('cases-counter')
Expected: "0 of 2 passed"
Received: "0 of 1 passed"
Timeout:  5000ms

Call log:
  - Expect "toHaveText" with timeout 5000ms
  - waiting for getByTestId('cases-counter')
    9 × locator resolved to <p data-testid="cases-counter" class="font-mono ...">0 of 1 passed</p>
      - unexpected value "0 of 1 passed"
```

El registro muestra 9 comprobaciones con el texto `0 of 1 passed`; ninguna encontró `0 of 2 passed`. El número de intentos puede variar entre ejecuciones.

1. La primera línea nombra la aserción que falló.
2. `Locator` muestra la búsqueda usada para encontrar el elemento.
3. `Expected` es el valor esperado. `Received` es el valor recibido en la comprobación.
4. `Timeout` muestra el límite de tiempo de la aserción.
5. El **call log** (registro de llamadas) muestra los intentos y los valores que Playwright observó.

Si `Received` está vacío o Playwright no encontró el elemento, revisa si la página llegó al estado que esperabas.

## Profundiza

### Un bucle de reintentos

El mecanismo consiste en comprobar una condición, esperar un intervalo si todavía no se cumple y volver a comprobarla. Este ejemplo modela una app lista después de 300 milisegundos:

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

En una ejecución sin pausas externas, imprime:

```text
plain check: false
retrying check: true
waited at least 300 ms: true
```

`retryUntil` espera 100 milisegundos entre comprobaciones y devuelve `false` si vence el plazo. Playwright también reintenta, pero aumenta el intervalo entre intentos hasta un límite.

El timeout de una aserción y el del test completo son límites distintos. Por defecto son 5 y 30 segundos, respectivamente. El runner puede detener el test si vence su límite mientras una aserción sigue esperando.

### Más tiempo para un paso lento

Puedes darle más tiempo a una aserción concreta:

```ts
await expect(page.getByTestId("report-result")).toContainText("12 tests", {
  timeout: 10_000,
})
```

La aserción continúa en cuanto encuentra el texto, aunque tenga un límite de 10 segundos. Si el texto nunca aparece, ese límite también retrasa el fallo. Da más tiempo al paso que lo necesita y conserva el valor por defecto para el resto.

## Práctica

1. Abre `e2e/exercises/03-playwright/04-assertions-that-wait.spec.ts`.
2. Cambia `test.fixme` por `test` en un test a la vez. Escribe los pasos a partir de los comentarios.
3. Ejecuta tu archivo:

```bash
pnpm e2e e2e/exercises/03-playwright/04-assertions-that-wait.spec.ts
```

4. En `e2e/playground.spec.ts`, cambia `"0 of 1 passed"` por `"0 of 2 passed"`. Ejecuta ese archivo y lee Expected, Received y el call log. Luego deshaz el cambio.

Compara con `e2e/exercises/03-playwright/solutions/04-assertions-that-wait.spec.ts` cuando termines.

## Reto

Crea el archivo `e2e/challenges/04-assertions-that-wait.spec.ts`. Escribe un test que cargue el reporte de la Practice app y compruebe que los aprobados más los fallidos suman el número de tests. Lee los tres números desde la página; no los escribas en la comprobación.

Está terminado cuando:

- El test pasa con `pnpm e2e e2e/challenges/04-assertions-that-wait.spec.ts`.
- La primera aserción después del clic espera el reporte con una aserción web-first, antes de leer texto. El test no usa `page.waitForTimeout`.
- Los tres números se leen de la página y se convierten en números. La comprobación funciona con cualquier número, no solo con 12, 11 y 1.
- Cambiaste la suma a propósito para que estuviera mal, leíste el número esperado y el recibido en el fallo y restauraste la comprobación.

Vas a necesitar algo que esta lección no enseñó: cómo tomar partes de un texto con una expresión regular, y cómo convertir un texto en un número. Busca: `javascript regex capture groups match`, `playwright locator textContent`, `javascript Number parseInt`.

## Piénsalo bien

1. En el ejemplo de "Un bucle de reintentos", cambias la llamada por `retryUntil(appIsReady, 200)`. ¿Qué imprimen las dos primeras líneas si las llamadas se ejecutan sin pausas externas?

<details><summary>Respuesta</summary>

Imprime `plain check: false` y `retrying check: false`. El plazo de 200 milisegundos vence antes de que la condición se cumpla a los 300.

</details>

2. Este test tiene un bug. La función del test no espera a que termine la comprobación. Encuéntralo.

```ts
test("report shows the result", async ({ page }) => {
  await page.goto("/#/practice")
  await page.getByTestId("report-load").click()
  expect(page.getByTestId("report-result")).toContainText("12 tests")
})
```

<details><summary>Respuesta</summary>

La última línea no tiene `await`. La función del test puede terminar mientras la aserción sigue esperando. Agrega `await` antes de `expect`.

</details>

3. Después de un clic en `report-load`, la versión A usa `expect(await page.getByTestId("report-result").textContent()).toContain("12 tests")`. La versión B usa `await expect(page.getByTestId("report-result")).toContainText("12 tests")`. ¿Qué hace cada una si el resultado todavía está vacío?

<details><summary>Respuesta</summary>

A compara el texto vacío ya leído y falla. B vuelve a comprobar el texto hasta que contiene lo esperado o vence el timeout.

</details>

## Siguiente paso

En la próxima lección aprendes tres formas de ver correr tus tests: el modo headed, el modo UI y codegen.
