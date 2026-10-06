---
title: Aserciones que esperan
summary: Usa aserciones expect que reintentan hasta pasar, evita waitForTimeout, lee un fallo de aserción y comprueba que una aserción realmente puede fallar.
duration: 80 min
---

## Empieza con un acertijo

Un desarrollador comete un error en el código del reporte lento de la Practice app (app de práctica). Cuando termina la carga, el código oculta el mensaje de carga, pero olvida mostrar el resultado. El reporte nunca aparece. Esta es la parte rota:

```tsx
setLoading(false)
setReady(false) // the correct line is setReady(true)
```

Un tester tiene este test:

```ts
await page.getByTestId("report-load").click()
await expect(page.getByTestId("report-loading")).toBeHidden()
```

El reporte está roto. ¿El test está en verde o en rojo? ¿Cuánto tarda? ¿Qué prueba el test?

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Predecir cuándo una aserción pasa, cuándo falla y cuánto tarda.
- Elegir una aserción que fallaría si la app estuviera mal.
- Explicar por qué `page.waitForTimeout` está prohibido, y qué usar en su lugar.
- Leer el mensaje de un fallo de aserción: esperado, recibido y call log (registro de llamadas).

## El problema: la app no es instantánea

Abre la Practice app y presiona "Load report" (Cargar reporte). El resultado llega después de aproximadamente un segundo y medio. Una app real es así: los datos vienen de un servidor, y eso toma tiempo.

Si un test comprueba el resultado de inmediato, el resultado todavía no está. El test falla, pero la app está bien. ¿Cómo compruebas algo que no está listo?

## Aserciones que esperan

Una aserción que empieza con `expect(locator)` no comprueba solo una vez. Comprueba una y otra vez hasta que es verdadera, o hasta que termina el timeout. El timeout por defecto es de 5 segundos. Estas aserciones se llaman **web-first assertions** (aserciones web-first).

```ts
await page.getByTestId("report-load").click()

await expect(page.getByTestId("report-result")).toContainText("12 tests")
```

El test hace clic en el botón. Luego pregunta una y otra vez: "¿el resultado contiene `12 tests`?" Después de unos 1.5 segundos la respuesta es sí. El test continúa. No escribiste ninguna espera.

Mira qué hace el botón mientras el reporte carga.

![Después del clic el botón se deshabilita y dice Loading, luego aparece el resultado.](/clips/auto-wait-report.webm)

La aserción necesita `await`, como todo paso.

## Las aserciones que más vas a usar

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

`toHaveText` compara el texto completo. `toContainText` comprueba que una parte del texto está ahí. `toHaveValue` lee lo que hay dentro de un campo de entrada.

Cantidad, atributo y dirección:

```ts
await expect(page.getByTestId("cases-item")).toHaveCount(2)
await expect(page.getByTestId("cases-item")).toHaveAttribute("data-status", "passed")
await expect(page).toHaveURL(/#\/practice/)
```

`toHaveURL` acepta un texto o una expresión regular. Una **expresión regular** es un patrón entre dos barras. Aquí significa "la dirección contiene `#/practice`".

Para comprobar lo contrario, agrega `not`: `await expect(locator).not.toBeVisible()`.

> **Consejo:** Leer la documentación es una habilidad. Cuando encuentres una aserción nueva, revisa su página en tres pasos. Primero, lee la firma: lo que le pasas y lo que devuelve. Segundo, lee el primer ejemplo. Tercero, busca las opciones y las notas sobre casos límite, como `timeout` o `ignoreCase`. Hazlo ahora con `toContainText`, y mira qué encuentras que esta lección no dijo.

## Las aserciones de valores simples no esperan

`expect` también funciona con valores simples, como números y strings (cadenas de texto). Estas aserciones comprueban una sola vez, de inmediato.

```ts
const total = await page.getByTestId("cases-item").count()
expect(total).toBe(2)
```

`count()` da un número. Luego `toBe` comprueba ese número una sola vez. Si la app necesita 200 milisegundos más para mostrar la segunda fila, el test falla.

Compara con la versión que espera:

```ts
await expect(page.getByTestId("cases-item")).toHaveCount(2)
```

> **Consejo:** Si puedes escribir la comprobación sobre el locator, hazlo. Usa una aserción de valor simple solo para valores que ya son finales.

### Experimento: el resultado vacío

Antes de ejecutar nada, responde. En la Practice app, el elemento `report-result` está en la página desde el principio. ¿Cuál es el texto de ese elemento antes de hacer clic en "Load report"? ¿Es "Report ready..." o un texto vacío? ¿Qué devuelve `await page.getByTestId("report-result").textContent()` si lo llamas justo después de `goto`?

Devuelve un texto vacío. El elemento existe, pero está oculto y no tiene texto hasta que el reporte está listo. Por eso una lectura simple no espera nada, y por eso la aserción que reintenta es la herramienta correcta.

## Por qué waitForTimeout está prohibido

`page.waitForTimeout(2000)` detiene el test durante dos segundos. Es tentador. También es una mala idea.

- Si la app necesita 2.5 segundos en un día lento, el test falla.
- Si la app necesita 0.3 segundos, el test desperdicia 1.7 segundos en cada ejecución.
- Con muchos tests, el desperdicio se vuelve minutos.

Una aserción que espera es tan rápida como la app y tan paciente como el timeout. La regla del equipo es: nada de `page.waitForTimeout`. Espera con aserciones web-first. Una buena suite es **rápida** y **autoverificable**: no necesita que una persona decida si la ejecución salió bien. Una pausa fija hace la suite más lenta y agrega una suposición.

## Leer un fallo de aserción

Agrega un caso en la Practice app, luego espera el texto incorrecto del contador: `"0 of 2 passed"`. Antes de ejecutarlo, escribe qué esperas ver en el mensaje. El fallo se ve así:

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

El texto nunca llegó a ser `0 of 2 passed`. Playwright lo intentó 9 veces en 5 segundos y vio `0 of 1 passed` cada vez. Esto te dice que la app es estable pero distinta de lo que esperabas.

Léelo en este orden.

1. La primera línea nombra la aserción que falló.
2. `Locator` es el elemento que miraste.
3. `Expected` es lo que escribiste. `Received` es lo que tenía la página en la última comprobación.
4. `Timeout` es cuánto tiempo lo intentó Playwright.
5. El **call log** es el diario de los intentos. Muestra lo que Playwright vio cada vez. Esto a menudo muestra la causa.

> **Nota:** Si `Received` está vacío o no se encontró el elemento, la página puede estar en otro estado del que crees. Abre la captura de pantalla del test que falló, o usa el *trace viewer* (visor de trazas). La lección del trace explica cómo.

### De vuelta al acertijo

El test está en verde. Después del clic, aparece el mensaje de carga. Unos 1.5 segundos después desaparece, y `toBeHidden` se cumple. El resultado nunca se muestra, pero el test no mira el resultado. Tarda unos 1.5 segundos y no prueba nada sobre el reporte.

El test comprueba el efecto secundario (un mensaje desapareció) y no la meta (el reporte se muestra). Pregúntate qué bug pondría cada aserción en rojo. Si no puedes nombrar uno, la aserción es demasiado débil.

## Profundiza

### Por qué una aserción puede esperar

Una aserción que espera no usa magia. Ejecuta un bucle: comprueba, y si la respuesta es no, espera un momento corto y comprueba de nuevo. Se detiene cuando la respuesta es sí, o cuando se acaba el tiempo.

Aquí está la idea en TypeScript simple. La "app" está lista después de 300 milisegundos:

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

La comprobación simple mira una vez y dice no. La comprobación que reintenta dice sí. Playwright es más cuidadoso: espera más entre intentos a medida que pasa el tiempo. La idea es la misma. Hay dos temporizadores. Una aserción espera hasta 5 segundos. Un test completo espera hasta 30 segundos.

### Una idea equivocada común: "toBeHidden prueba que el trabajo terminó"

Después de hacer clic en "Load report", el mensaje "Loading..." aparece y luego desaparece. Un principiante escribe esto:

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

Algunos pasos son realmente lentos, como un reporte grande. Puedes darle más tiempo a una aserción:

```ts
await expect(page.getByTestId("report-result")).toContainText("12 tests", {
  timeout: 10_000,
})
```

Esto es mejor que `waitForTimeout`: el test igual continúa en cuanto el texto está ahí. Si muchas aserciones necesitan 10 segundos, no repitas el número. Defínelo una vez en la configuración con `expect: { timeout: 10_000 }`. Esto es DRY: un número en un solo lugar. Pero un timeout grande también hace que los fallos reales tarden en mostrarse. Da más tiempo al único paso lento, y deja el valor por defecto para el resto.

## Práctica

1. Abre `e2e/exercises/03-playwright/04-assertions-that-wait.spec.ts`.
2. Cambia `test.fixme` por `test` en un test a la vez. Escribe los pasos a partir de los comentarios.
3. Ejecuta tu archivo:

```bash
pnpm e2e e2e/exercises/03-playwright/04-assertions-that-wait.spec.ts
```

4. En `e2e/playground.spec.ts`, cambia `"0 of 1 passed"` por `"0 of 2 passed"`. Ejecuta ese archivo y lee Expected, Received y el call log. Luego deshaz el cambio.
5. En una copia del test, reemplaza `toHaveCount(0)` por un `count()` simple y `toBe(0)`. Piensa en cuándo podría fallar esta versión.

Compara con `e2e/exercises/03-playwright/solutions/04-assertions-that-wait.spec.ts` cuando termines.

## Reto

Crea el archivo `e2e/challenges/04-assertions-that-wait.spec.ts`. El reporte lento de la Practice app muestra una frase con tres números: tests, aprobados y fallidos. Escribe un test que cargue el reporte y compruebe que los números son coherentes: aprobados más fallidos debe ser igual al número de tests. Lee los números desde la página. No los escribas en tu comprobación.

Está terminado cuando:

- El test pasa con `pnpm e2e e2e/challenges/04-assertions-that-wait.spec.ts`.
- La primera aserción después del clic es una aserción web-first que espera el reporte, antes de que leas cualquier texto.
- Los tres números se leen de la página y se convierten en números en tu código. Tu comprobación de la suma funciona con cualquier número, no solo con 12, 11 y 1.
- Cambiaste la comprobación de la suma a propósito para que estuviera mal (por ejemplo, suma 1), y el mensaje de fallo mostró el número esperado y el recibido. Luego lo devolviste a como estaba.
- El test no usa `page.waitForTimeout`.

Vas a necesitar algo que esta lección no enseñó: cómo tomar partes de un texto con una expresión regular, y cómo convertir un texto en un número. Busca: `javascript regex capture groups match`, `playwright locator textContent`, `javascript Number parseInt`.

## Piénsalo bien

1. Predice la salida y explica por qué. Toma el código de "Por qué una aserción puede esperar", pero llama a `retryUntil(appIsReady, 200)` y no a 5000. ¿Qué imprimen las dos primeras líneas?

<details><summary>Respuesta</summary>

Imprime `plain check: false` y `retrying check: false`. La app está lista después de 300 milisegundos, pero el bucle de reintento se detiene a los 200. El bucle se rinde antes de que la app esté lista, así que la respuesta es "no". Esto es lo que hace una aserción de Playwright cuando el timeout es más corto de lo que la app necesita. La app estaba bien. El límite de tiempo era demasiado pequeño.

</details>

2. Este test tiene un bug. El código se ejecuta, pero la comprobación no hace su trabajo. Encuéntralo.

```ts
test("report shows the result", async ({ page }) => {
  await page.goto("/#/practice")
  await page.getByTestId("report-load").click()
  expect(page.getByTestId("report-result")).toContainText("12 tests")
})
```

<details><summary>Respuesta</summary>

La última línea no tiene `await`. La aserción empieza, pero la función del test no la espera, así que el test puede terminar antes de que la comprobación acabe. El resultado no es predecible: el test puede pasar aunque el texto nunca aparezca, o puede reportar un error más tarde. Veas lo que veas, la solución es la misma. Agrega `await` antes de `expect`.

</details>

3. Compara dos versiones de un test, después de un clic en `report-load`. Versión A: `expect(await page.getByTestId("report-result").textContent()).toContain("12 tests")`. Versión B: `await expect(page.getByTestId("report-result")).toContainText("12 tests")`. ¿Cuál es mejor, y qué hace A en la Practice app?

<details><summary>Respuesta</summary>

B es mejor. En la Practice app, el elemento `report-result` está en la página desde el inicio, sin texto y oculto. `textContent()` lo lee de inmediato y obtiene un texto vacío, así que A falla y no espera. B reintenta hasta que el texto aparece, unos 1.5 segundos después.

</details>

4. ¿Qué se rompe si el reporte tarda 8 segundos y no 1.5, por ejemplo en un servidor lento? Un colega propone `await page.waitForTimeout(8000)` antes de la aserción. Otro propone un timeout de 10 segundos en esa aserción. ¿Qué pasa con cada uno?

<details><summary>Respuesta</summary>

Con el timeout por defecto de 5 segundos, la aserción falla a los 5 segundos, y el mensaje muestra un `Received` vacío. La espera fija de 8 segundos hace que el test pase, pero siempre cuesta 8 segundos, y vuelve a fallar un día en que el servidor necesite 9. El timeout de 10 segundos en una aserción pasa en cuanto aparece el texto, así que toma 8 segundos solo cuando la app está así de lenta. La segunda forma es mejor. Pero primero haz la pregunta que importa: ¿8 segundos es un bug de la app?

</details>

5. Explica a un compañero en tres frases por qué `toBeHidden` sobre el mensaje de carga no prueba que el reporte funciona. No uses la palabra "carga".

<details><summary>Respuesta</summary>

Un mensaje que desaparece solo te dice que la app dejó de mostrarlo. No te dice qué muestra la app en su lugar. La misma comprobación pasaría si el reporte fallara, o si el mensaje nunca apareciera. Para probar que el reporte funciona, comprueba aquello a lo que vino el usuario: el texto del resultado.

</details>

6. El equipo debate el timeout global de las aserciones. Una persona dice: "Súbelo de 5 segundos a 30 segundos, y los fallos flaky se acaban." Otra dice: "Deja 5 segundos." ¿Quién tiene razón?

<details><summary>Respuesta</summary>

No hay una sola respuesta correcta. Un timeout grande esconde el comportamiento lento e inestable, y cada fallo real tarda 30 segundos en aparecer, así que una suite con muchos fallos se vuelve muy lenta. Un timeout pequeño muestra los problemas pronto pero puede fallar en una máquina lenta en CI. Depende de qué causa los fallos. Si la app es realmente lenta en un paso, da más tiempo a ese paso. Si la app es rápida y los fallos son aleatorios, un timeout más grande solo esconde una condición de carrera que deberías encontrar.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué son las aserciones suaves (soft assertions) en Playwright, y cuándo usarías una?**
   - Busca: `playwright expect.soft soft assertions`
   - Pruébalo: Escribe un test que abra la Practice app y tenga dos líneas `expect.soft` con textos incorrectos. Ejecútalo y cuenta cuántos fallos muestra el reporte. Luego cambia ambas a `expect` normal y compara.
   - Una buena respuesta explica: en qué se diferencia una aserción suave de una normal cuando falla, y un caso donde ver todos los fallos en una sola ejecución ayuda.

2. **¿Qué significa "polling" (sondeo) en programación, y en qué se diferencia de esperar un tiempo fijo?**
   - Busca: `polling vs sleep programming`
   - Pruébalo: En un test, agrega dos casos, y luego escribe `await expect.poll(async () => page.getByTestId("cases-item").count()).toBe(2)`. Cambia el número a 3 y lee el mensaje de fallo.
   - Una buena respuesta explica: el bucle de comprobar y esperar, por qué termina en cuanto la condición es verdadera, y por qué una pausa fija es una suposición.

3. **¿Qué es una condición de carrera (race condition), y cómo puede hacer que un test pase en una ejecución y falle en la siguiente?**
   - Busca: `race condition flaky test`
   - Pruébalo: En un archivo simple de TypeScript, escribe dos funciones async que lean cada una un número compartido, esperen un tiempo aleatorio y luego escriban el número más uno. Ejecuta ambas al mismo tiempo, diez veces, y mira los números finales.
   - Una buena respuesta explica: qué es una condición de carrera con un ejemplo simple, y cómo se conecta con los tests que comprueban un resultado antes de que la app esté lista.

## Siguiente paso

En la próxima lección aprendes tres formas de ver correr tus tests: el modo headed, el modo UI y codegen.
