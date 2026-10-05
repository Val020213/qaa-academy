---
title: Aserciones que esperan
summary: Usa aserciones expect que reintentan hasta pasar, evita waitForTimeout y lee el fallo de una aserción.
duration: 35 min
---

## Objetivo

- Usar las aserciones principales de `expect(locator)`.
- Explicar la diferencia entre las aserciones que esperan y las comprobaciones simples de valores.
- Explicar por qué `page.waitForTimeout` está prohibido.
- Leer el mensaje de fallo de una aserción: esperado, recibido y call log.

## El problema: la app no es instantánea

Abre la Practice app y presiona "Load report" (cargar reporte). El resultado llega después de cerca de un segundo y medio. Una app real es así: los datos vienen de un servidor y toman tiempo.

Si un test comprueba el resultado de inmediato, el resultado todavía no está. El test falla, pero la app es correcta. ¿Cómo compruebas algo que aún no está listo?

## Aserciones que esperan

Una aserción que empieza con `expect(locator)` no comprueba una sola vez. Comprueba una y otra vez hasta que es verdadera, o hasta que termina el *timeout* (tiempo límite). El timeout por defecto es de 5 segundos. Estas aserciones se llaman **web-first assertions** (aserciones orientadas a la web).

```ts
await page.getByTestId("report-load").click()

await expect(page.getByTestId("report-result")).toContainText("12 tests")
```

El test hace clic en el botón. Luego pregunta una y otra vez: "¿el resultado contiene `12 tests`?" Después de cerca de 1,5 segundos la respuesta es sí. El test continúa. No escribiste ninguna espera.

La aserción necesita `await`, como todos los pasos.

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

`toHaveText` compara el texto completo. `toContainText` comprueba que una parte del texto esté presente. `toHaveValue` lee lo que hay dentro de un campo de entrada.

Cantidad, atributo y dirección:

```ts
await expect(page.getByTestId("cases-item")).toHaveCount(2)
await expect(page.getByTestId("cases-item")).toHaveAttribute("data-status", "passed")
await expect(page).toHaveURL(/#\/practice/)
```

`toHaveURL` acepta un texto o una expresión regular. Una **expresión regular** es un patrón entre dos barras. Aquí significa "la dirección contiene `#/practice`".

Para comprobar lo contrario, agrega `not`: `await expect(locator).not.toBeVisible()`.

## Las aserciones de valores simples no esperan

`expect` también funciona con valores simples, como números y *strings* (cadenas de texto). Estas aserciones comprueban una sola vez, de inmediato.

```ts
const total = await page.getByTestId("cases-item").count()
expect(total).toBe(2)
```

`count()` da un número. Luego `toBe` comprueba ese número una vez. Si la app necesita 200 milisegundos más para mostrar la segunda fila, el test falla.

Compáralo con la versión que espera:

```ts
await expect(page.getByTestId("cases-item")).toHaveCount(2)
```

> **Consejo:** Si puedes escribir la comprobación sobre el locator, hazlo. Usa una aserción de valor simple solo para valores que ya son finales.

## Por qué waitForTimeout está prohibido

`page.waitForTimeout(2000)` detiene el test dos segundos. Es tentador. También es una mala idea.

- Si la app necesita 2,5 segundos en un día lento, el test falla.
- Si la app necesita 0,3 segundos, el test pierde 1,7 segundos en cada ejecución.
- Con muchos tests, la pérdida se vuelve minutos.

Una aserción que espera es tan rápida como la app y tan paciente como el timeout. La regla del equipo es: nada de `page.waitForTimeout`. Espera con web-first assertions.

## Leer el fallo de una aserción

Agrega un caso en la Practice app y luego espera un texto de contador incorrecto: `"0 of 2 passed"`. El fallo se ve así:

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

El texto nunca llegó a ser `0 of 2 passed`. Playwright lo intentó 9 veces en 5 segundos y vio `0 of 1 passed` cada vez. Esto te dice que la app es estable, pero distinta de lo que esperabas.

Léelo en este orden.

1. La primera línea nombra la aserción que falló.
2. `Locator` es el elemento que miraste.
3. `Expected` es lo que escribiste. `Received` es lo que tenía la página en la última comprobación.
4. `Timeout` es cuánto tiempo lo intentó Playwright.
5. El **call log** (registro de llamadas) es el diario de los intentos. Muestra lo que Playwright vio cada vez. Muchas veces esto revela la causa.

> **Nota:** Si `Received` está vacío o no se encontró el elemento, la página puede estar en otro estado del que crees. Abre la captura de pantalla del test fallido, o usa el *trace viewer*. La lección del trace muestra cómo.

## Práctica

1. Abre `e2e/exercises/03-playwright/04-assertions-that-wait.spec.ts`.
2. Cambia `test.fixme` por `test` en un test a la vez. Escribe los pasos a partir de los comentarios.
3. Ejecuta tu archivo:

```bash
pnpm e2e e2e/exercises/03-playwright/04-assertions-that-wait.spec.ts
```

4. En `e2e/playground.spec.ts`, cambia `"0 of 1 passed"` por `"0 of 2 passed"`. Ejecuta ese archivo y lee Expected, Received y el call log. Luego deshaz el cambio.
5. En una copia del test, reemplaza `toHaveCount(0)` por un `count()` simple y `toBe(0)`. Piensa en cuándo esta versión podría fallar.

Compara con `e2e/exercises/03-playwright/solutions/04-assertions-that-wait.spec.ts` cuando termines.

## Comprueba lo que sabes

1. ¿Qué hace `expect(locator).toHaveText(...)` si el texto todavía no es el correcto?

<details><summary>Respuesta</summary>

Comprueba una y otra vez hasta que el texto es correcto o termina el timeout. El timeout por defecto es de 5 segundos.

</details>

2. ¿Por qué `expect(await locator.count()).toBe(2)` es arriesgado?

<details><summary>Respuesta</summary>

Lee la cantidad una vez y comprueba una vez. No espera. Usa `toHaveCount(2)`.

</details>

3. ¿Por qué `page.waitForTimeout` está prohibido?

<details><summary>Respuesta</summary>

El tiempo fijo es una suposición. Es muy corto en un día lento y muy largo en un día rápido. Las aserciones que esperan son mejores.

</details>

4. ¿Qué hay en el call log?

<details><summary>Respuesta</summary>

Los intentos que hizo Playwright: qué buscó y qué vio cada vez.

</details>

## Siguiente paso

En la siguiente lección aprendes tres formas de ver tus tests en ejecución: el modo headed, el modo UI y codegen.
