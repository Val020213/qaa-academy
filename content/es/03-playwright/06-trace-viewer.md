---
title: El trace viewer
summary: Graba un trace de un test que falló, ábrelo desde el reporte HTML y úsalo para distinguir un test equivocado de un bug real.
duration: 90 min
---

## Empieza con un acertijo

Un test falla. El mensaje dice que `expect(locator).toContainText(expected)` falló después de un tiempo límite de 5000 ms.

El test hace clic en "Load report" (cargar reporte) y espera el texto `12 tests`. Tienes dos sospechas. Primera: la app nunca mostró el reporte. Segunda: el test miró el elemento equivocado. El mensaje de error es el mismo en los dos casos.

Puedes abrir un solo panel de una grabación de la ejecución. ¿Qué panel o paneles te permiten decidir en menos de un minuto? ¿Qué buscas exactamente en cada uno?

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Decidir si una falla es un *bug* del test o un bug de la app, usando la evidencia de un *trace*.
- Grabar un trace en tu máquina y abrirlo desde el reporte HTML.
- Leer los paneles: acciones, snapshots, consola, red y código fuente.
- Elegir cuándo un proyecto debe grabar traces y decir qué cuesta cada opción.

## Qué es un trace

Un **trace** (traza) es una grabación de la ejecución de un test. Es un archivo que guarda, para cada paso, una copia de la página, los mensajes de la consola y las llamadas de red.

Con un trace puedes mirar un test que falló después de que terminó. Puedes hacer clic dentro de la página y leer los detalles. Un trace es lo primero que abres cuando un test falla.

## Cuándo este proyecto graba un trace

Abre `playwright.config.ts`. En la sección `use` encuentras:

```ts
trace: "on-first-retry",
```

Significa: graba un trace solo cuando un test se ejecuta otra vez después de una falla. Una nueva ejecución así es un **retry** (reintento).

Los reintentos están activados en CI, la ejecución automática en un servidor, y desactivados en tu máquina. Así que en tu máquina esta opción no graba nada. Antes de seguir, adivina: ¿cómo obtendrías un trace en tu máquina sin cambiar el archivo de configuración? Luego compara:

```bash
pnpm e2e e2e/playground.spec.ts --trace on
```

La opción `--trace on` graba un trace de cada test en esta ejecución. Úsala en un solo archivo, no en toda la suite.

> **Nota:** La configuración también tiene `screenshot: "only-on-failure"`. Un test que falló siempre tiene una imagen de la página al final. Un trace te da mucho más.

## Abre el reporte HTML

Cada ejecución escribe un reporte HTML. Para abrirlo, ejecuta:

```bash
pnpm e2e:report
```

Playwright inicia un pequeño servidor local y abre el reporte en tu navegador. La terminal queda ocupada. Pulsa Ctrl+C para detenerlo.

En el reporte, un test que falló tiene una marca roja. Haz clic en él. Ves el mensaje de error, el código y la captura de pantalla. Si se grabó un trace, hay una sección "Traces". Haz clic en la imagen del trace para abrir el trace viewer.

Mira cómo se ve un test que falló en el reporte.

![El reporte lista los tests que pasaron y los que fallaron. Abre el que falló para ver el error y el trace.](/clips/html-report.webm)

La terminal también imprime un comando para abrir un trace directamente:

```text
pnpm exec playwright show-trace test-results/<test-folder>/trace.zip
```

## Los paneles del trace viewer

**Actions (acciones).** A la izquierda está la lista de pasos en orden: `page.goto`, `locator.fill`, `expect.toHaveText` y así. Un paso que falló aparece en rojo. Haz clic en un paso para ver la página en ese momento.

**Snapshots de antes y después.** Arriba ves la página. Las pestañas te dejan elegir "Before" (antes) o "After" (después) de la acción. Un **snapshot** (instantánea) es una copia de la página en un momento. No es una imagen. Puedes abrir las herramientas de desarrollo del navegador sobre él e inspeccionar elementos. El elemento resaltado es el que usó la acción.

**Console (consola).** Los mensajes que la página escribió en su consola, y los errores del código de la página.

**Network (red).** Las llamadas que la página hizo a servidores: dirección, estado y tiempo.

**Source (código fuente).** El código de tu test, con el paso actual marcado.

Hay otras pestañas, como "Call" (el locator y el tiempo usado) y "Errors" (el mensaje de la falla).

Mira cómo cada acción muestra la página, y cómo Errors te dice por qué falló el test.

![Haz clic en cada acción para ver la página y luego abre Errors para leer por qué falló el test.](/clips/trace-viewer.webm)

### Experimento: ¿qué muestra la pestaña Network?

Toma el test "shows the report when loading ends" de `e2e/playground.spec.ts`. El botón `report-load` espera 1,5 segundos en el código de la página. No llama a un servidor.

Predice: cuando hagas clic en la acción de `report-load`, ¿la pestaña Network mostrará una petición nueva? Escribe tu respuesta. Ejecuta el archivo con `--trace on`, abre el trace y comprueba. ¿Qué te dice tu resultado sobre dónde se van los 1,5 segundos?

## Una rutina para diagnosticar una falla

Depura como un científico: una hipótesis, un experimento pequeño, un cambio a la vez. No cambies el código antes de saber la causa.

1. Lee el mensaje de error: aserción, locator, Expected y Received.
2. Abre el trace. Ve al paso en rojo.
3. Mira el snapshot "Before". ¿La página está en el estado que esperas?
4. Mira el elemento resaltado. ¿Es el que querías?
5. Mira los pasos anteriores. ¿Algún paso hizo algo distinto de lo que pensabas?
6. Revisa la consola por errores de la página y la red por llamadas fallidas.
7. Decide: ¿es un test equivocado o un bug de la app?
8. Arregla el test, o reporta el bug. Ejecuta el test otra vez.

La decisión del paso 7 es la más importante. Un test puede fallar porque la app tiene un bug. Esa es la razón de que el test exista.

### De vuelta al acertijo

Dos paneles responden la pregunta. En el snapshot, mira el elemento resaltado. Si es el elemento equivocado, la segunda sospecha es cierta: tu locator está mal. Si es el elemento correcto y aun así muestra solo `Loading…` o nada, la primera sospecha es cierta. Entonces las pestañas Console y Network pueden decirte por qué: un error de la página, o una petición con un estado malo.

El texto del error solo te dice qué esperaba el test. El trace te muestra lo que la página hizo de verdad.

## Profundiza

### Por qué un trace es más que un video

Un trace es un archivo `.zip`. Dentro, Playwright guarda por cada paso: un snapshot de la página, los mensajes de la consola, las llamadas de red y la línea de código del test. No es un video.

Un video solo puede mostrar cómo se veía la página. Un snapshot es una copia del contenido de la página. Por eso el visor puede resaltar el elemento que usó tu acción, y puedes abrir las herramientas de desarrollo sobre un momento pasado. El visor trabaja solo con el archivo. No necesita que la app esté corriendo. Puedes enviar un `trace.zip` a un colega y verá lo mismo que tú.

### Cómo aparece en el trabajo real de QA: un reporte de bug que los desarrolladores creen

Un test que falló puede ser un problema del test o un bug de la app. El trace te ayuda a decidir, y te ayuda a demostrarlo.

Imagina que un test falla porque un reporte nunca muestra su texto. En el trace abres la pestaña Network. La página le pidió el reporte al servidor, y el servidor respondió con el estado 500. Un 500 significa "el servidor tuvo un error". El test y el locator estaban bien. La app tiene un bug.

Ahora tu reporte de bug puede decir: "La petición del reporte devuelve 500. Adjunto el trace". Un reporte de bug con evidencia se arregla mucho más rápido que uno que dice "no funciona".

En la app Practice, el reporte no llama a un servidor, así que este caso exacto no ocurre aquí. En una aplicación real, sí.

### Un compromiso: cuándo grabar

Grabar hace los tests más lentos y crea archivos grandes. La opción `trace` de la configuración decide cuándo pagar ese costo.

```ts
use: {
  trace: "retain-on-failure",
},
```

- `"off"` nunca graba.
- `"on"` graba cada test y guarda cada trace. Úsala en un solo archivo mientras aprendes.
- `"on-first-retry"` graba solo cuando un test se ejecuta otra vez. Este proyecto la usa. Cuesta poco, pero necesita reintentos.
- `"retain-on-failure"` graba cada test y borra el trace de los tests que pasan. Obtienes un trace de cada falla, sin reintentos. Cada test es más lento.

No hay una opción mejor. Pregúntate: ¿con qué frecuencia fallan los tests y cuánto cuesta ejecutarlos dos veces?

## Práctica

1. Haz una copia del test "rejects wrong credentials" en un archivo nuevo `e2e/exercises/03-playwright/trace-practice.spec.ts`. Importa desde `../../lib/test`.
2. Cambia el texto esperado a `"Wrong password."` para que el test falle.
3. Ejecútalo con un trace:

```bash
pnpm e2e e2e/exercises/03-playwright/trace-practice.spec.ts --trace on
```

4. Ejecuta `pnpm e2e:report`. Abre el test que falló y abre su trace.
5. Haz clic en cada acción. Encuentra el snapshot "Before" de la aserción que falla. Abre la pestaña Source.
6. Detén el reporte con Ctrl+C. Borra `trace-practice.spec.ts`.

## Reto

Haz tres tests que fallen cada uno por una razón distinta, y luego demuestra cada causa solo con el trace.

Crea el archivo `e2e/challenges/06-three-failures.spec.ts`. Usa la página Practice. El primer test debe fallar porque el texto esperado está mal. El segundo debe fallar porque un locator coincide con más de un elemento. El tercero debe fallar aunque la app esté bien y el texto esperado esté bien. Elige tú qué parte de la página Practice usa cada test.

Está terminado cuando:

- Ejecutar `pnpm e2e e2e/challenges/06-three-failures.spec.ts --trace on` reporta `3 failed`.
- Encima de cada test, un comentario de dos líneas dice qué panel del trace mostró la causa y qué viste ahí.
- Los tres mensajes de error son distintos entre sí.
- Después de cambiar una cosa en cada test, el mismo comando reporta `3 passed`.

Vas a necesitar algo que esta lección no enseñó: cómo reporta Playwright un locator que coincide con muchos elementos y cómo darle a una aserción un límite de tiempo más corto. Busca: `playwright strict mode violation`, `playwright expect timeout option`.

## Piénsalo bien

1. En CI, un test falla en la primera ejecución y pasa en el reintento. La configuración tiene `trace: "on-first-retry"` y `retries: 2`. ¿Qué ejecución graba el trace y qué problema te causa esto?

<details><summary>Respuesta</summary>

El trace graba el reintento, que es la segunda ejecución. La primera ejecución, la que falló, no tiene trace. Así que el trace que abres muestra una ejecución que pasó, y la causa de la primera falla no está en él. Esta es una razón por la que `retain-on-failure` es útil para tests que fallan pocas veces. El reporte también marcará el test como *flaky* (inestable).

</details>

2. Un compañero ve el paso en rojo en el trace y arregla el test así. Ahora el test pasa. ¿Qué tiene de malo el arreglo?

```ts
await page.getByTestId("report-load").click()
await page.waitForTimeout(3000)
await expect(page.getByTestId("report-result")).toContainText("12 tests")
```

<details><summary>Respuesta</summary>

El test pasa, pero el arreglo esconde la razón por la que falló. Una espera fija es demasiado larga, y entonces cada ejecución pierde tiempo, o demasiado corta, y entonces el test vuelve a fallar en una máquina lenta. La aserción ya espera y reintenta durante unos segundos. El trace debió decirle al compañero si la espera era muy corta o si el elemento estaba mal. La regla del equipo prohíbe `waitForTimeout`.

</details>

3. Tu equipo tiene 400 tests. Más o menos 2 de cada 100 fallan en un día normal. ¿Eliges `on-first-retry` o `retain-on-failure`, y qué te haría elegir la otra?

<details><summary>Respuesta</summary>

Con `on-first-retry` pagas un poco en cada ejecución, pero necesitas reintentos y solo ves el reintento. Con `retain-on-failure` cada test graba, así que la ejecución es más lenta, pero cada falla tiene un trace de la ejecución que falló. Si la suite es rápida y las fallas son raras y difíciles de repetir, elige `retain-on-failure`. Si el tiempo de CI es caro y las fallas suelen ser fáciles de repetir, `on-first-retry` basta. Depende del costo del tiempo y del espacio en disco.

</details>

4. Envías `trace.zip` a un colega que no tiene la app corriendo. ¿Qué se rompe y qué sigue funcionando?

<details><summary>Respuesta</summary>

Nada se rompe en el visor. El archivo tiene las copias de la página, la consola y las llamadas de red, así que el visor solo necesita el archivo. Lo que no funciona es ejecutar el test otra vez o probar un locator nuevo en la página en vivo. Para eso, el colega necesita la app.

</details>

5. Explícale a un desarrollador, en tres oraciones y sin usar la palabra "captura de pantalla", por qué adjuntas un trace a un reporte de bug.

<details><summary>Respuesta</summary>

Ejemplo: "El trace muestra cada paso, así que ves cómo la página llegó al estado malo. También tiene las llamadas de red y la consola, así que puedes ver la petición que falló. Puedes abrirlo sin ejecutar la app." Una buena respuesta dice qué recibe el desarrollador que una imagen fija no puede dar: los pasos antes de la falla y los datos ocultos.

</details>

6. Un test falla en su primera acción, `page.goto("/#/practice")`. Abres el trace. El snapshot está en blanco. ¿Qué te puede decir todavía el trace?

<details><summary>Respuesta</summary>

Los snapshots "Before" y "After" están en blanco porque no se cargó ninguna página. La pestaña Errors muestra el mensaje, por ejemplo que la conexión fue rechazada. La pestaña Network muestra si la petición recibió alguna respuesta. Una causa común es que el sitio no está corriendo o que `QAA_E2E_PORT` apunta a otro puerto. El trace no te da una página, pero igual te da la causa.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué hacen los modos de trace `on-first-retry` y `retain-on-failure` de Playwright, y cuándo elegirías cada uno?**
   - Busca: `playwright trace retain-on-failure on-first-retry`
   - Pruébalo: Ejecuta un archivo con un test que pasa y uno que falla, primero con `--trace on` y luego con `--trace retain-on-failure`. Mira la carpeta `test-results` después de cada ejecución. ¿Cuáles ejecuciones dejaron un `trace.zip` para el test que pasa?
   - Una buena respuesta explica: cuándo graba y conserva el trace cada modo, y el costo de cada uno en tiempo y espacio en disco.

2. **¿Qué hace bueno a un reporte de bug para un desarrollador?**
   - Busca: `good bug report steps expected actual result`
   - Pruébalo: Escribe un reporte de bug para este bug inventado: "el contador muestra `NaN of 1 passed`". Dáselo a un compañero de clase. Pídele que encuentre el bug en la página Practice usando solo tu texto, sin preguntarte nada.
   - Una buena respuesta explica: las partes principales de un reporte de bug, como pasos, resultado esperado, resultado actual y evidencia, y por qué cada una ahorra tiempo.

3. **¿Qué es la consola del navegador y cuál es la diferencia entre un error y una advertencia ahí?**
   - Busca: `browser console errors warnings devtools`
   - Pruébalo: En un test de prueba, agrega `await page.evaluate(() => console.error("my own error"))`. Ejecútalo con `--trace on` y encuentra el mensaje en la pestaña Console del trace.
   - Una buena respuesta explica: qué tipos de mensajes aparecen en la consola y por qué un error de la página puede explicar un test que falla sin una razón clara.

## Siguiente paso

En la próxima lección aprendes a agrupar tests, compartir pasos de preparación y omitir tests de forma segura.
