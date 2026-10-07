---
title: El trace viewer
duration: 60 min
---

## Objetivo

En esta lección grabas la ejecución de un test y revisas la evidencia de una falla en el trace viewer.

- Grabar un trace en tu máquina y abrirlo desde el reporte HTML.
- Leer las acciones, los snapshots, la consola, la red y el código fuente.
- Distinguir un error del test de un bug de la app.
- Elegir cuándo grabar traces según el costo y la evidencia que necesitas.

## Qué guarda un trace

Un **trace** (traza) es una grabación de la ejecución de un test. El archivo guarda las acciones, snapshots del DOM para las operaciones que los admiten, mensajes de consola y actividad de red de la ejecución. No todos los pasos tienen un snapshot.

El trace viewer muestra esos datos después de que terminó el test, para revisar la página y los pasos que llevaron a la falla.

## Cuándo este proyecto graba un trace

Abre `playwright.config.ts`. En la sección `use` encuentras:

```ts
trace: "on-first-retry",
```

Significa: graba un trace únicamente en el primer **retry** (reintento), la segunda ejecución tras una falla. La ejecución inicial y el segundo reintento no se graban con este modo.

El proyecto activa los reintentos en CI y los desactiva en tu máquina. Con esta configuración, una ejecución local no graba traces. Para grabarlos sin cambiar el archivo de configuración:

```bash
pnpm e2e e2e/playground.spec.ts --trace on
```

La opción `--trace on` graba un trace de cada test en esta ejecución. Limita la grabación al archivo que estás revisando.

> **Nota:** La configuración también tiene `screenshot: "only-on-failure"`. Playwright intenta capturar las páginas de un test que falló. Puede faltar la imagen si no había una página o la captura falló. Un trace aporta también las acciones y el DOM guardado.

## Abre el reporte HTML

Cada ejecución escribe un reporte HTML. Para abrirlo, ejecuta:

```bash
pnpm e2e:report
```

Playwright inicia un servidor local y abre el reporte en tu navegador. La terminal queda ocupada hasta que pulses Ctrl+C para detenerlo.

En el reporte, un test que falló tiene una marca roja. Haz clic en él para ver el mensaje de error, el código y la captura de pantalla. Si se grabó un trace, aparece la sección "Traces". Haz clic en la imagen del trace para abrir el trace viewer.

![El reporte lista los tests que pasaron y los que fallaron. Abre el que falló para ver el error y el trace.](/clips/html-report.webm)

También puedes abrir un trace directamente con este comando:

```text
pnpm exec playwright show-trace test-results/<test-folder>/trace.zip
```

## Los paneles del trace viewer

**Actions (acciones).** A la izquierda está la lista de pasos en orden: `page.goto`, `locator.fill`, `expect.toHaveText` y así. Un paso que falló aparece en rojo. Haz clic en un paso para ver la página en ese momento.

**Snapshots de antes y después.** Las pestañas "Before" (antes) y "After" (después) muestran la página alrededor de la acción. El visor muestra el DOM guardado, que puedes inspeccionar con las herramientas de desarrollo del navegador. Para una aserción, revisa el estado previo en "Before" y el destino observado en "After" y "Call"; "Before" puede no tenerlo resaltado porque Playwright lo marca al ejecutar la comprobación.

**Console (consola).** Muestra los mensajes que la página escribió en su consola y los errores del código de la página.

**Network (red).** Muestra las llamadas que la página hizo a servidores: dirección, estado y tiempo.

**Source (código fuente).** Muestra el código de tu test, con el paso actual marcado.

La pestaña "Call" muestra el locator y el tiempo usado. "Errors" muestra el mensaje de la falla.

![Haz clic en cada acción para ver la página y luego abre Errors para leer por qué falló el test.](/clips/trace-viewer.webm)

### Una espera sin petición de red

El test "shows the report when loading ends" de `e2e/playground.spec.ts` pulsa el botón `report-load`. El código de la página espera 1,5 segundos antes de mostrar el resultado; no llama a un servidor. Esa espera no produce una petición nueva en Network.

## Diagnostica una falla

Revisa la evidencia antes de cambiar el test:

1. Lee el mensaje de error: aserción, locator, Expected y Received.
2. Abre el trace y selecciona el paso en rojo.
3. Revisa el estado previo en "Before"; luego consulta "After" y "Call" para revisar el destino y el resultado observado.
4. Revisa los pasos anteriores para encontrar una acción inesperada.
5. Busca errores de la página en Console y llamadas fallidas en Network.
6. Compara el resultado con el requisito para decidir si debes corregir el test o reportar un bug. Después de corregirlo, ejecuta el test otra vez.

Por ejemplo, un test hace clic en "Load report" (cargar reporte) y espera el texto `12 tests`. Tienes dos sospechas. Primera: la app nunca mostró el reporte. Segunda: el test miró el elemento equivocado. Ambos casos pueden causar un fallo de la misma aserción; el locator y el valor recibido ayudan a distinguirlos.

Revisa el destino en "After" y el locator en "Call". Si apuntan a otro elemento, corrige el locator. Si el destino es correcto pero no muestra `12 tests`, solo sabes que la comprobación no encontró ese texto dentro del plazo. Compara el estado final observado y el timeout con el requisito antes de atribuirlo a la app. Console puede mostrar errores; en esta carga simulada no hay una petición de reporte que revisar en Network.

## Profundiza

### Compartir el archivo

Playwright guarda el trace en un archivo `.zip`. El visor usa los snapshots y los datos guardados para mostrar la ejecución sin que la app esté corriendo. Puedes enviar un `trace.zip` a un colega para que lo revise.

### El costo de grabar

Grabar traces añade trabajo durante la ejecución y ocupa espacio en disco. La opción `trace` decide cuándo grabar y qué archivos conservar:

```ts
use: {
  trace: "retain-on-failure",
},
```

- `"off"` nunca graba.
- `"on"` graba cada test y guarda cada trace.
- `"on-first-retry"` graba solo el primer reintento y conserva ese trace aunque el reintento pase. Este proyecto la usa; necesita reintentos.
- `"retain-on-failure"` graba cada test y borra el trace de los tests que pasan. Obtienes un trace de cada falla, sin reintentos.

Conservar la ejecución que falló ayuda cuando la falla es difícil de repetir. Grabar solo un reintento reduce el trabajo de grabación, pero deja la primera ejecución sin trace.

![Tres intentos del mismo test: cada modo graba y conserva traces distintos.](/images/03-trace-attempts.es.svg)

## Práctica

1. Haz una copia del test "rejects wrong credentials" en un archivo nuevo `e2e/exercises/03-playwright/trace-practice.spec.ts`. Importa desde `../../lib/test`. Antes de llenar los campos, agrega `await page.goto("/#/practice")`: la navegación del archivo original está fuera del test.
2. Cambia el texto esperado a `"Wrong password."` para que el test falle.
3. Ejecútalo con un trace:

```bash
pnpm e2e e2e/exercises/03-playwright/trace-practice.spec.ts --trace on
```

4. Ejecuta `pnpm e2e:report`. Abre el test que falló y abre su trace.
5. Haz clic en cada acción. Encuentra el snapshot "Before" de la aserción que falla. Abre la pestaña Source.
6. Detén el reporte con Ctrl+C. Borra `trace-practice.spec.ts`.

## Reto

Crea el archivo `e2e/challenges/06-three-failures.spec.ts` con tres tests de la página Practice que fallen por causas distintas. El primero debe tener un texto esperado incorrecto; el segundo, un locator que coincida con más de un elemento. El tercero debe fallar aunque la app y el texto esperado estén bien. Demuestra cada causa con el trace.

Está terminado cuando:

- Ejecutar `pnpm e2e e2e/challenges/06-three-failures.spec.ts --trace on` reporta `3 failed`.
- Encima de cada test, un comentario de dos líneas dice qué panel del trace mostró la causa y qué viste ahí.
- Los tres mensajes de error son distintos entre sí.
- Después de cambiar una cosa en cada test, el mismo comando reporta `3 passed`.

Vas a necesitar saber cómo reporta Playwright un locator que coincide con muchos elementos y cómo darle a una aserción un límite de tiempo más corto. Busca: `playwright strict mode violation`, `playwright expect timeout option`.

## Piénsalo bien

1. En CI, un test falla en la primera ejecución y pasa en el reintento. La configuración tiene `trace: "on-first-retry"` y `retries: 2`. ¿Qué ejecución graba el trace y qué evidencia te falta?

<details><summary>Respuesta</summary>

Graba el primer reintento, la segunda ejecución. La ejecución que falló no tiene trace, así que no puedes revisar directamente su causa. El reporte marca el test como *flaky* (inestable).

</details>

2. Un compañero ve el paso en rojo en el trace y agrega esta espera. Ahora el test pasa. ¿Qué problema deja el cambio?

```ts
await page.getByTestId("report-load").click()
await page.waitForTimeout(3000)
await expect(page.getByTestId("report-result")).toContainText("12 tests")
```

<details><summary>Respuesta</summary>

El cambio no identifica la causa de la falla. La espera fija añade tres segundos aunque el resultado llegue antes, y puede ser insuficiente en otra ejecución. La aserción ya espera y reintenta; revisa el locator y el tiempo de espera en el trace. La regla del equipo prohíbe `waitForTimeout`.

</details>

3. Un test falla en su primera acción, `page.goto("/#/practice")`. El snapshot está en blanco. ¿Qué puede mostrar todavía el trace?

<details><summary>Respuesta</summary>

Errors muestra el mensaje, por ejemplo que la conexión fue rechazada. Network permite revisar si la petición recibió alguna respuesta. Comprueba si el sitio está corriendo y si `QAA_E2E_PORT` apunta al puerto correcto.

</details>

## Siguiente paso

En la próxima lección aprendes a agrupar tests, compartir pasos de preparación y omitir tests de forma segura.
