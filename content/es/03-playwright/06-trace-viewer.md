---
title: El trace viewer
summary: Graba un trace de un test fallido, ábrelo desde el reporte HTML y sigue una rutina para encontrar la causa.
duration: 30 min
---

## Objetivo

- Explicar qué es un *trace* (traza).
- Grabar un trace en tu máquina y abrirlo desde el reporte HTML.
- Usar los paneles: acciones, snapshots, consola, red y código fuente.
- Seguir una rutina para diagnosticar un test fallido.

## Qué es un trace

Un **trace** es una grabación de la ejecución de un test. Es un archivo que guarda, para cada paso, una imagen de la página, los mensajes de la consola y las llamadas de red.

Con un trace puedes mirar un test fallido después de que terminó. Ves cómo se veía la página en cada paso. Es como repetir un video, pero además puedes hacer clic dentro de la página y leer los detalles.

Un trace es lo primero que abres cuando un test falla.

## Cuándo graba un trace este proyecto

Abre `playwright.config.ts`. En la sección `use` encuentras esta línea:

```ts
trace: "on-first-retry",
```

Significa: graba un trace solo cuando un test se ejecuta de nuevo después de un fallo. Volver a ejecutar se llama **retry** (reintento).

Los retries están activados en CI, la ejecución automática en un servidor, y desactivados en tu máquina. Así que en tu máquina esta opción no graba nada. Es a propósito: los traces hacen los tests más lentos.

Para obtener un trace en local, pídelo en el comando:

```bash
pnpm e2e e2e/playground.spec.ts --trace on
```

La opción `--trace on` graba un trace de cada test de esta ejecución. Úsala en un solo archivo, no en toda la *suite*.

> **Nota:** La configuración también tiene `screenshot: "only-on-failure"`. Un test fallido siempre tiene una imagen de la página al final. Un trace te da mucho más que esa imagen.

## Abre el reporte HTML

Cada ejecución también escribe un reporte HTML. Para abrirlo, ejecuta:

```bash
pnpm e2e:report
```

Playwright inicia un pequeño servidor local y abre el reporte en tu navegador. La terminal queda ocupada. Presiona Ctrl+C en la terminal para detenerlo.

En el reporte ves una lista de tests. Un test fallido tiene una marca roja. Haz clic en él. Ves el mensaje de error, el código y la captura de pantalla. Si se grabó un trace, hay una sección "Traces". Haz clic en la imagen del trace para abrir el trace viewer.

La terminal también imprime el comando para abrir un trace directamente. Se ve así:

```text
pnpm exec playwright show-trace test-results/<test-folder>/trace.zip
```

## Los paneles del trace viewer

La ventana tiene varias áreas.

**Actions** (acciones). A la izquierda está la lista de pasos, en orden: `page.goto`, `locator.fill`, `expect.toHaveText` y así. El tiempo de cada paso está al lado. Un paso que falló aparece en rojo. Haz clic en un paso para ver la página en ese momento.

**Before y after snapshots** (instantáneas antes y después). Arriba ves la página. Unas pestañas te dejan elegir "Before" o "After" de la acción. Un **snapshot** es una copia de la página en un momento. No es una imagen. Puedes abrir las herramientas de desarrollo del navegador en él e inspeccionar los elementos.

El elemento resaltado en el snapshot es el que usó la acción. Si se resalta el elemento equivocado, tu locator está mal.

**Console** (consola). Los mensajes que la página escribió en su consola, y los errores del código de la página.

**Network** (red). Las llamadas que la página hizo a servidores: dirección, estado y tiempo. Una llamada con un estado de fallo puede explicar una página vacía.

**Source** (código fuente). El código de tu test, con el paso actual marcado. Ves qué línea de tu spec hizo esta acción.

Hay otras pestañas, como "Call" y "Errors". "Call" muestra el locator y el tiempo usado. "Errors" muestra el mensaje del fallo.

## Una rutina para diagnosticar un fallo

Sigue los mismos pasos cada vez. No cambies el código antes de conocer la causa.

1. Lee el mensaje de error: aserción, locator, Expected y Received.
2. Abre el trace. Ve al paso rojo.
3. Mira el snapshot "Before". ¿La página está en el estado que esperas?
4. Mira el elemento resaltado. ¿Es el que querías?
5. Mira hacia atrás los pasos anteriores. ¿Algún paso hizo algo distinto de lo que pensabas?
6. Revisa la Console por errores de la página y la Network por llamadas fallidas.
7. Decide: ¿es un test equivocado o un *bug* en la app?
8. Corrige el test o reporta el bug. Vuelve a ejecutar el test.

La decisión del paso 7 es la más importante. Un test puede fallar porque la app tiene un bug. Para eso existe el test.

## Práctica

1. Haz una copia del test "rejects wrong credentials" en un archivo nuevo `e2e/exercises/03-playwright/trace-practice.spec.ts`. Importa desde `../../lib/test`.
2. Cambia el texto esperado por `"Wrong password."` para que el test falle.
3. Ejecútalo con un trace:

```bash
pnpm e2e e2e/exercises/03-playwright/trace-practice.spec.ts --trace on
```

4. Ejecuta `pnpm e2e:report`. Abre el test fallido y abre su trace.
5. Haz clic en cada acción. Encuentra el snapshot "Before" de la aserción que falla. Abre la pestaña Source.
6. Detén el reporte con Ctrl+C. Borra `trace-practice.spec.ts`.

## Comprueba lo que sabes

1. ¿Qué es un trace?

<details><summary>Respuesta</summary>

Una grabación de la ejecución de un test. Guarda snapshots de la página, de la consola y de la red en cada paso.

</details>

2. ¿Por qué tu ejecución local no produce un trace por defecto?

<details><summary>Respuesta</summary>

La configuración tiene `trace: "on-first-retry"`. Los retries están desactivados en tu máquina, así que no se graba ningún trace.

</details>

3. ¿Cómo grabas un trace en tu máquina?

<details><summary>Respuesta</summary>

Agrega `--trace on` al comando, por ejemplo `pnpm e2e e2e/playground.spec.ts --trace on`.

</details>

4. ¿Qué te dice el elemento resaltado en un snapshot?

<details><summary>Respuesta</summary>

Muestra qué elemento usó la acción. Si es el equivocado, el locator está mal.

</details>

## Siguiente paso

En la siguiente lección aprendes a agrupar tests, compartir pasos de preparación y omitir tests de forma segura.
