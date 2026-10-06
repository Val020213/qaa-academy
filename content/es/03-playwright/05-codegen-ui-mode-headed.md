---
title: Codegen, modo UI y modo headed
summary: Mira los tests en un navegador real, viaja al pasado en el modo UI y convierte un borrador grabado en un test que de verdad puede fallar.
duration: 90 min
---

## Empieza con un acertijo

Abres la página Practice. Grabas tres pasos con *codegen* (generador de código): escribes "Buy milk" en la lista de casos, pulsas Add y marcas la casilla. Codegen te da un test. Lo ejecutas. Pasa.

Ahora un desarrollador comete un error. El contador debajo de la lista muestra `NaN of 1 passed` en vez de `1 of 1 passed`. Cualquier usuario ve que eso está mal.

Ejecutas otra vez tu test grabado. ¿Pasa o falla? Piensa qué es lo que el test realmente mira.

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Elegir entre modo headed, modo UI, codegen y modo headless según la pregunta que tengas.
- Predecir qué puede detectar un test grabado y qué no.
- Convertir un borrador de codegen en un test que sigue las reglas del equipo y puede fallar por la razón correcta.
- Explicar por qué el modo UI puede mostrar la página en el pasado.

## Modo headed: mira el navegador

Por defecto, los tests se ejecutan en un navegador *headless* (sin ventana). Headless significa que la ventana del navegador no se muestra. Es rápido, pero no ves nada.

El modo *headed* (con ventana) muestra la ventana real del navegador:

```bash
pnpm e2e:headed e2e/playground.spec.ts
```

> **Consejo:** Las palabras después del nombre de un *script* (guion de comandos) van a Playwright. Por eso la ruta del archivo funciona aquí igual que con `pnpm e2e`.

Antes de ejecutarlo, adivina. El archivo tiene cuatro tests y `fullyParallel` está activado. ¿Cuántas ventanas del navegador esperas ver al mismo tiempo? Ejecútalo y cuéntalas. La configuración no define `workers`, así que Playwright elige un número según tu procesador. ¿Qué te dice esto sobre mirar una suite completa?

## Modo UI: la mejor herramienta para aprender

El modo UI es una ventana hecha por Playwright. Ábrela con:

```bash
pnpm e2e:ui
```

A la izquierda ves todos los tests. Pulsa el triángulo junto a un test para ejecutarlo. A la derecha ves la página mientras el test corre.

Mira cómo cambia la página cuando haces clic en cada acción.

![En el modo UI ejecutas un test y luego haces clic en cada acción para ver la página en ese momento.](/clips/ui-mode.webm)

Estas partes te ayudan más.

- **Watch mode (modo vigilancia).** Haz clic en el icono del ojo junto a un test o un archivo. El test se ejecuta otra vez cada vez que guardas el archivo.
- **Viaje en el tiempo.** La lista de acciones está debajo del test. Haz clic en cualquier acción. La página vuelve a verse como estaba en ese paso.
- **Pick locator (elegir locator).** Pulsa "Pick locator" y luego haz clic en un elemento de la página. Playwright te muestra un *locator* (localizador) para ese elemento.
- **Filtros.** Escribe un nombre en el cuadro de búsqueda para mostrar solo algunos tests. También puedes ocultar los tests que pasaron.

> **Cuidado:** El modo UI usa la configuración del proyecto. Cierra la ventana cuando termines, o pulsa Ctrl+C en la terminal.

### Experimento: antes y después

Ejecuta "adds a case and updates the counter" en el modo UI. Haz clic en la acción `click` sobre `cases-add`.

¿Qué esperas ver en la pestaña "Before" y qué en la pestaña "After"? Escribe dos respuestas cortas. Luego mira. ¿Qué partes de la página cambiaron? ¿Cuáles no?

### Experimento: elegir un locator

Usa "Pick locator" sobre el botón Add. Playwright puede mostrar `getByRole('button', { name: 'Add' })`. El test usa `getByTestId("cases-add")`. Hoy los dos encuentran un solo elemento.

Ahora piensa: un desarrollador agrega un segundo botón con el texto "Add" en otro panel. ¿Cuál de los dos locators sigue encontrando un solo elemento? Explica por qué.

## Codegen: graba un primer borrador

**Codegen** escribe código de test mientras usas una página a mano. Tú haces clic y escribes, y Playwright escribe las líneas.

Codegen necesita que el sitio esté corriendo. Abre dos terminales. En la primera:

```bash
pnpm dev
```

En la segunda:

```bash
pnpm exec playwright codegen http://localhost:5180/#/practice
```

Se abren dos ventanas. Una es el navegador. La otra es el Playwright Inspector, que muestra el código. El Inspector tiene botones para grabar también aserciones. Codegen escribe una aserción solo cuando tú la eliges.

## Limpia el código generado

Codegen es un borrador. No conoce las reglas de tu equipo. Un borrador para "agregar un caso y marcarlo" puede verse así. El tuyo puede ser distinto, porque depende de la versión de Playwright y de lo que pulses.

```ts
import { test, expect } from "@playwright/test"

test("test", async ({ page }) => {
  await page.goto("http://localhost:5180/#/practice")
  await page.getByRole("textbox", { name: "New case" }).click()
  await page.getByRole("textbox", { name: "New case" }).fill("Buy milk")
  await page.getByRole("button", { name: "Add" }).click()
  await page.getByRole("checkbox", { name: "Buy milk" }).check()
})
```

Antes de leer la lista de abajo, encuentra al menos cuatro problemas en este borrador. Escríbelos. Luego compara.

1. El import viene de `@playwright/test`. El equipo importa `test` y `expect` desde `e2e/lib/test`.
2. El nombre `"test"` no dice nada. Un nombre debe describir un comportamiento.
3. La dirección completa está en el código. La configuración tiene `baseURL`, así que usa `"/#/practice"`.
4. El `click` antes de `fill` sobra. `fill` ya pone el foco en el campo.
5. Los locators funcionan, pero el equipo usa `getByTestId` cuando existe un *testid*. El nombre de la casilla `"Buy milk"` también es el dato de prueba. Si el dato cambia, el locator se rompe.
6. No hay ninguna aserción. El test no puede fallar cuando la app está mal. Este es el problema del acertijo.
7. Comprueba que el test crea sus propios datos y no necesita otro test.

### De vuelta al acertijo

El test grabado pasa. Escribe, hace clic y marca. Nunca lee el contador, así que el texto `NaN of 1 passed` no le importa. Un test falla solo por lo que comprueba. Un test sin aserciones solo comprueba que la página no se cayó.

Por eso agregas una línea, por ejemplo:

```ts
await expect(page.getByTestId("cases-counter")).toHaveText("1 of 1 passed")
```

Ahora el contador roto hace fallar el test.

> **Consejo:** Prueba lo que el usuario ve, no cómo está construido el código. El texto del contador es lo que el usuario lee. Es una buena cosa para comprobar.

## La extensión de VS Code

La extensión de Playwright para VS Code te deja ejecutar tests sin la terminal. Junto a cada `test(...)` ves un triángulo verde. Puedes marcar "Show browser" para ver la ejecución. También tiene "Pick locator" y "Record new test", las mismas herramientas de arriba. Para instalarla, busca "Playwright Test for VSCode" en el panel de extensiones.

Los tests y la configuración son los mismos en la extensión y en la terminal.

## Profundiza

### Por qué el modo UI puede volver al pasado

El modo UI no reproduce un video. Mientras un test corre, Playwright guarda un **snapshot** (instantánea) de la página por cada acción: una copia del contenido de la página en ese momento. Cuando haces clic en una acción, el modo UI muestra esa copia.

Por eso puedes inspeccionar elementos en el pasado, y por eso el *trace viewer* (visor de trazas) usa los mismos datos. Las ejecuciones headed y headless usan el mismo motor de navegador. La única diferencia es la ventana. Así que el resultado casi siempre es el mismo en ambas.

### Una idea equivocada común: "codegen escribe mis tests"

Codegen graba lo que hiciste. No sabe por qué lo hiciste, así que no decide qué debe mostrar la app. Además repite pasos. Si grabas tres tests, cada uno tiene los mismos pasos de login.

Después de grabar, busca pasos repetidos y muévelos a una sola función:

```ts
import { expect, test, type Page } from "./lib/test"

async function signIn(page: Page): Promise<void> {
  await page.goto("/#/practice")
  await page.getByTestId("login-email").fill("qa@example.com")
  await page.getByTestId("login-password").fill("Playwright123")
  await page.getByTestId("login-submit").click()
}

test("shows the signed-in message", async ({ page }) => {
  await signIn(page)

  await expect(page.getByTestId("login-welcome")).toContainText("qa@example.com")
})

test("signing out shows the form again", async ({ page }) => {
  await signIn(page)
  await page.getByTestId("login-logout").click()

  await expect(page.getByTestId("login-form")).toBeVisible()
})
```

Esto es *DRY*, "Don't Repeat Yourself" (no te repitas): los pasos de login viven en un solo lugar. El límite: el nombre `signIn` debe decir exactamente lo que hace. No construyas un *helper* (función de ayuda) para un paso que usa un solo test. Eso rompería **YAGNI**, "You Aren't Gonna Need It" (no lo vas a necesitar): no construyas para necesidades que solo imaginas.

### Un compromiso: elige la herramienta correcta para cada momento

Cada herramienta tiene un precio.

- **El modo headed** sirve para entender un test. Es lento y tienes que mirarlo.
- **El modo UI** sirve mientras escribes y depuras. Usa tu pantalla y tu atención. No es para CI.
- **Codegen** sirve para encontrar un locator o empezar un borrador. Es malo como forma de producir el test final.
- **El modo headless** es el predeterminado. Es rápido y bueno para CI, donde nadie mira una ventana.

Usa las herramientas visibles cuando necesites entender algo, no porque sea agradable verlas.

## Práctica

1. Ejecuta `pnpm e2e:headed e2e/playground.spec.ts`. Mira el navegador.
2. Ejecuta `pnpm e2e:ui`. Ejecuta el test "adds a case and updates the counter". Haz clic en cada acción y mira la página.
3. En el modo UI, usa "Pick locator" y haz clic en el botón "Add" de la lista de casos. Compara el locator con `getByTestId("cases-add")`.
4. Inicia `pnpm dev` en una terminal. En otra terminal, ejecuta `pnpm exec playwright codegen http://localhost:5180/#/practice`.
5. Graba esto: agrega un caso y luego márcalo.
6. Copia el código en un archivo nuevo `e2e/exercises/03-playwright/my-codegen.spec.ts`. Límpialo con la lista de arriba. Agrega una aserción para el texto del contador. Ejecútalo con `pnpm e2e e2e/exercises/03-playwright/my-codegen.spec.ts`.
7. Borra el archivo cuando termines. Si lo dejas, `pnpm e2e` lo va a ejecutar.

## Reto

Graba un flujo más largo y conviértelo en un test en el que confiarías. En la página Practice, agrega tres casos. Marca solo el segundo. Muestra solo los casos aprobados con el filtro. Comprueba que la lista muestra exactamente ese caso, y que el contador sigue diciendo `1 of 3 passed`.

Elige tus propios títulos de casos. Usa el mundo que quieras: un refugio de mascotas, un equipo de fútbol, una receta.

Crea el archivo `e2e/challenges/05-codegen-filter.spec.ts`. Usa codegen para el primer borrador. Puedes pedir ayuda a un asistente de IA, pero debes ejecutar el código y poder explicar cada línea. Nunca dejes una línea que no puedas explicar.

Está terminado cuando:

- El test importa desde `../lib/test` y no tiene ninguna dirección completa en el código.
- El test tiene al menos dos aserciones: una sobre las filas visibles y otra sobre el contador.
- `pnpm e2e e2e/challenges/05-codegen-filter.spec.ts --repeat-each=5` pasa las cinco ejecuciones.
- Si cambias un título esperado en el test, el test falla. Pruébalo y luego devuélvelo.

Vas a necesitar algo que esta lección no enseñó: cómo comprobar el texto de las filas visibles y cómo elegir una opción en un select. Busca: `playwright selectOption`, `playwright toHaveText array of strings`.

## Piénsalo bien

1. Grabas "agregar un caso" en la página Practice y no marcas nada. Más tarde la lista tiene tres casos. El borrador contiene `await page.getByRole("button", { name: "Delete" }).click()`, grabado cuando había un solo caso. Lo ejecutas con tres casos en la lista. ¿Pasa? Explica por qué.

<details><summary>Respuesta</summary>

Falla. Cada fila tiene un botón con el texto "Delete", así que con tres casos el locator coincide con tres elementos. El *strict mode* (modo estricto) de Playwright se niega a elegir uno y reporta un error. El locator solo servía porque la lista tenía una fila. Un testid con el id del caso, como `cases-delete-2`, dice exactamente qué fila quieres.

</details>

2. Este test pasa, pero no es un buen test. Encuentra el error.

```ts
test("ticking a case updates the counter", async ({ page }) => {
  await page.goto("/#/practice")
  await page.getByTestId("cases-input").fill("Buy milk")
  await page.getByTestId("cases-add").click()
  await page.getByTestId("cases-toggle-1").check()

  await expect(page.getByTestId("cases-counter")).toBeVisible()
})
```

<details><summary>Respuesta</summary>

La aserción no puede fallar por el comportamiento que dice el nombre. El contador está visible antes y después de marcar, y también cuando muestra un número equivocado. El test debería comprobar el texto, `"1 of 1 passed"`. Un test que no puede fallar da una confianza falsa, y eso es peor que no tener test.

</details>

3. Debes probar un flujo de 30 pasos en tres páginas. Versión A: grabar todo con codegen y limpiarlo. Versión B: escribirlo a mano, usando el modo UI solo para elegir locators. ¿Cuál eliges y qué te haría elegir la otra?

<details><summary>Respuesta</summary>

La versión A ahorra escritura y te da un mapa de los pasos, pero también te da pasos repetidos y locators débiles en 30 lugares. La versión B es más lenta, y cada línea es una decisión tuya. Para un flujo largo, mucha gente graba, y luego limpia y divide en funciones. Elige B cuando el flujo es corto o cuando quieres aprender la página, y A cuando el flujo es largo y vas a revisar cada línea.

</details>

4. ¿Qué se rompe si el modo UI guardara un video de la ejecución en vez de una instantánea por cada acción?

<details><summary>Respuesta</summary>

Todavía podrías ver lo que pasó, pero no podrías hacer clic dentro de la página del pasado. No podrías inspeccionar un elemento, copiar un locator de ese momento ni ver qué elemento usó una acción. Un video muestra píxeles. Una instantánea es una copia del contenido de la página, así que conserva la estructura.

</details>

5. Un compañero te pregunta por qué un test grabado es solo un borrador. Explícalo en tres oraciones sin usar la palabra "grabar".

<details><summary>Respuesta</summary>

Ejemplo: "La herramienta anota lo que hice con las manos, no lo que la app debe hacer. No sabe qué resultado importa, así que no agrega comprobaciones. Yo todavía debo elegir las comprobaciones, los nombres y los datos." Tus palabras pueden ser distintas. Una buena respuesta dice que la herramienta captura acciones y que la persona agrega el significado.

</details>

6. Un gerente dice: "Codegen hace tests malos, así que hay que prohibirlo". ¿Estás de acuerdo?

<details><summary>Respuesta</summary>

No hay una sola respuesta correcta. Una prohibición quita una herramienta muy buena para encontrar locators y para empezar desde un archivo vacío, sobre todo para quien es nuevo en la página. Pero si la gente hace commit del resultado sin limpiarlo, los tests son débiles. Una regla mejor puede ser: codegen se permite, pero la revisión comprueba la misma lista que para cualquier test. Depende de qué tan fuerte sea la revisión en tu equipo.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es un navegador headless y por qué lo usan los servidores de CI?**
   - Busca: `headless browser what is testing`
   - Pruébalo: En un spec de prueba, agrega `console.log(await page.evaluate(() => navigator.userAgent))` después de `page.goto`. Ejecútalo una vez en headless y otra con `--headed`. Compara las dos líneas.
   - Una buena respuesta explica: qué significa "headless", por qué lo necesita un servidor sin pantalla y una cosa que puede ser distinta de una ventana normal.

2. **¿Qué es el Playwright Inspector y cómo te ayuda `page.pause()` a depurar un test?**
   - Busca: `playwright inspector page.pause debug`
   - Pruébalo: Agrega `await page.pause()` después del `click` sobre `cases-add` en un test de prueba. Ejecútalo con `--headed`. Mientras está en pausa, escribe un locator en el Inspector y mira qué resalta.
   - Una buena respuesta explica: cómo detener un test en una línea, qué puedes hacer mientras está detenido y en qué se diferencia del modo UI.

3. **¿Cuáles son los puntos débiles de las herramientas de grabar y reproducir tests?**
   - Busca: `record and playback test automation drawbacks`
   - Pruébalo: Graba el mismo flujo dos veces, con clics distintos para llegar al mismo resultado. Compara los dos borradores línea por línea.
   - Una buena respuesta explica: al menos tres problemas, como comprobaciones que debes agregar a mano, locators frágiles y pasos repetidos, y cuándo una herramienta así todavía sirve.

## Siguiente paso

En la próxima lección aprendes el trace viewer, la herramienta que usas cuando un test falla y no sabes por qué.
