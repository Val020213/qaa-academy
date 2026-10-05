---
title: El trace viewer
summary: Graba un trace de un test que falló, ábrelo desde el reporte HTML y sigue una rutina para encontrar la causa.
duration: 45 min
---

## Objetivo

- Explicar qué es un *trace*.
- Grabar un *trace* en tu máquina y abrirlo desde el reporte HTML.
- Usar los paneles: acciones, snapshots, consola, red y código fuente.
- Seguir una rutina para diagnosticar un test que falló.

## Qué es un trace

Un ***trace*** (traza) es una grabación de la ejecución de un test. Es un archivo que guarda, para cada paso, una copia de la página, los mensajes de la consola y las llamadas de red.

Con un *trace* puedes mirar un test que falló después de que terminó. Ves cómo se veía la página en cada paso. Es como repetir un video, pero además puedes hacer clic dentro de la página y leer los detalles.

Un *trace* es lo primero que debes abrir cuando un test falla.

## Cuándo graba un trace este proyecto

Abre `playwright.config.ts`. En la sección `use` encuentras esta línea:

```ts
trace: "on-first-retry",
```

Significa: graba un *trace* solo cuando un test se ejecuta de nuevo después de un fallo. Una nueva ejecución se llama **retry** (reintento).

Los reintentos están activados en CI, la ejecución automática en el servidor, y desactivados en tu máquina. Así que en tu máquina esta opción no graba nada. Es a propósito: los *traces* hacen los tests más lentos.

Para obtener un *trace* en local, pídelo en el comando:

```bash
pnpm e2e e2e/playground.spec.ts --trace on
```

La opción `--trace on` graba un *trace* de cada test de esta ejecución. Úsala con un archivo, no con toda la *suite*.

> **Nota:** La configuración también tiene `screenshot: "only-on-failure"`. Un test que falla siempre tiene una captura de la página al final. Un *trace* te da mucho más que esa captura.

## Abre el reporte HTML

Cada ejecución también escribe un reporte HTML. Para abrirlo, ejecuta:

```bash
pnpm e2e:report
```

Playwright inicia un pequeño servidor local y abre el reporte en tu navegador. La terminal queda ocupada. Presiona Ctrl+C en la terminal para detenerlo.

En el reporte ves una lista de tests. Un test que falló tiene una marca roja. Haz clic en él. Ves el mensaje de error, el código y la captura de pantalla. Si se grabó un *trace*, hay una sección "Traces". Haz clic en la imagen del *trace* para abrir el *trace viewer*.

La terminal también imprime el comando para abrir un *trace* directamente. Se ve así:

```text
pnpm exec playwright show-trace test-results/<test-folder>/trace.zip
```

## Los paneles del trace viewer

La ventana tiene varias áreas.

**Actions (acciones).** A la izquierda está la lista de pasos, en orden: `page.goto`, `locator.fill`, `expect.toHaveText` y así. El tiempo de cada paso está al lado. Un paso que falló está en rojo. Haz clic en un paso para ver la página en ese momento.

**Snapshots antes y después.** Arriba ves la página. Unas pestañas te dejan elegir "Before" (Antes) o "After" (Después) de la acción. Un **snapshot** (instantánea) es una copia de la página en un momento. No es una imagen. Puedes abrir las herramientas de desarrollo del navegador sobre él e inspeccionar los elementos.

El elemento resaltado en el *snapshot* es el elemento que usó la acción. Si se resalta el elemento equivocado, tu *locator* está mal.

**Console (consola).** Los mensajes que la página escribió en su consola, y los errores del código de la página.

**Network (red).** Las llamadas que la página hizo a los servidores: dirección, estado y tiempo. Una llamada con un estado de fallo puede explicar una página vacía.

**Source (código fuente).** El código de tu test, con el paso actual marcado. Ves qué línea de tu *spec* hizo esta acción.

Hay otras pestañas, como "Call" (Llamada) y "Errors" (Errores). "Call" muestra el *locator* y el tiempo usado. "Errors" muestra el mensaje del fallo.

## Una rutina para diagnosticar un fallo

Sigue los mismos pasos cada vez. No cambies código antes de saber la causa.

1. Lee el mensaje de error: aserción, *locator*, Expected y Received.
2. Abre el *trace*. Ve al paso rojo.
3. Mira el *snapshot* "Before". ¿La página está en el estado que esperas?
4. Mira el elemento resaltado. ¿Es el que querías?
5. Mira hacia atrás los pasos anteriores. ¿Algún paso hizo algo distinto de lo que pensabas?
6. Revisa la Console por errores de la página y la Network por llamadas fallidas.
7. Decide: ¿es un test equivocado o un *bug* en la app?
8. Corrige el test, o reporta el *bug*. Ejecuta el test de nuevo.

La decisión del paso 7 es la más importante. Un test puede fallar porque la app tiene un *bug*. Esa es la razón por la que existe el test.

## Profundiza

### Por qué un trace es más que un video

Un *trace* es un archivo `.zip`. Dentro, Playwright guarda para cada paso: un *snapshot* de la página, los mensajes de la consola, las llamadas de red y la línea del código del test. No es un video.

Un video solo puede mostrarte cómo se veía la página. Un *snapshot* es una copia del contenido de la página. Por eso el *trace viewer* puede resaltar el elemento que usó tu acción, y puedes abrir las herramientas de desarrollo sobre un momento del pasado. 
El visor trabaja solo con el archivo. No necesita que la app esté corriendo. Puedes enviar un `trace.zip` a un colega, y verá lo mismo.

### Cómo aparece en el trabajo real de QA: un reporte de bug que los desarrolladores creen

Un test que falla puede ser un problema del test o un *bug* de la app. El *trace* te ayuda a decidir, y te ayuda a demostrarlo.

Supón que un test falla porque un reporte nunca muestra su texto. En el *trace* abres la pestaña Network. Ves que la página le pidió el reporte al servidor, y el servidor respondió con el estado 500. Un 500 significa "el servidor tuvo un error". El test y el *locator* estaban bien. La app tiene un *bug*.

Ahora tu reporte de *bug* puede decir: "La petición del reporte devuelve 500. El *trace* está adjunto." El desarrollador abre el *trace* y ve la misma petición. No necesitaste una explicación larga. Un reporte de *bug* con evidencia se corrige mucho más rápido que uno que dice "no funciona".

En la Practice app (app de práctica), el reporte no llama a un servidor, así que este caso exacto no ocurre aquí. En una aplicación real, sí.

### Una decisión con costo: cuándo grabar

Grabar tiene un costo. Hace los tests más lentos y crea archivos grandes. La opción `trace` de la configuración decide cuándo pagar.

```ts
use: {
  trace: "retain-on-failure",
},
```

- `"off"` nunca graba.
- `"on"` graba cada test y guarda cada *trace*. Úsalo con un archivo mientras aprendes.
- `"on-first-retry"` graba solo cuando un test se ejecuta de nuevo. Este proyecto lo usa. Cuesta poco, pero necesita reintentos. En tu máquina los reintentos están desactivados, así que no obtienes ningún *trace*.
- `"retain-on-failure"` graba cada test y borra el *trace* de los tests que pasan. Obtienes un *trace* de cada fallo, sin reintentos. El precio es que cada test es más lento.

No hay una opción mejor. Elige preguntando: ¿con qué frecuencia fallan los tests y cuánto cuesta ejecutarlos dos veces?

## Práctica

1. Haz una copia del test "rejects wrong credentials" en un archivo nuevo `e2e/exercises/03-playwright/trace-practice.spec.ts`. Importa desde `../../lib/test`.
2. Cambia el texto esperado a `"Wrong password."` para que el test falle.
3. Ejecútalo con un *trace*:

```bash
pnpm e2e e2e/exercises/03-playwright/trace-practice.spec.ts --trace on
```

4. Ejecuta `pnpm e2e:report`. Abre el test que falló y abre su *trace*.
5. Haz clic en cada acción. Encuentra el *snapshot* "Before" de la aserción que falla. Abre la pestaña Source.
6. Detén el reporte con Ctrl+C. Borra `trace-practice.spec.ts`.

## Comprueba lo que sabes

1. ¿Qué es un *trace*?

<details><summary>Respuesta</summary>

Una grabación de la ejecución de un test. Guarda *snapshots* de la página, de la consola y de la red para cada paso.

</details>

2. ¿Por qué tu ejecución local no produce un *trace* por defecto?

<details><summary>Respuesta</summary>

La configuración tiene `trace: "on-first-retry"`. Los reintentos están desactivados en tu máquina, así que no se graba ningún *trace*.

</details>

3. ¿Cómo grabas un *trace* en tu máquina?

<details><summary>Respuesta</summary>

Añade `--trace on` al comando, por ejemplo `pnpm e2e e2e/playground.spec.ts --trace on`.

</details>

4. ¿Qué te dice el elemento resaltado en un *snapshot*?

<details><summary>Respuesta</summary>

Muestra qué elemento usó la acción. Si es el equivocado, el *locator* está mal.

</details>

5. En una aplicación real, un test espera una tabla con 5 filas. Falla: `Received` es 0 filas. En el *trace*, la pestaña Network muestra la petición de los datos de la tabla con estado 500, y la captura muestra el mensaje "Something went wrong". ¿Es un *bug* del test o de la app? ¿Qué haces?

<details><summary>Respuesta</summary>

Lo más probable es un *bug* de la app. El test buscó el elemento correcto y esperó un resultado razonable. La página falló porque el servidor devolvió un error. Reportas el *bug* con el *trace* y la petición. No debes cambiar el test para esconder el fallo. Puedes ejecutar el test de nuevo para ver si el error es raro o siempre está.

</details>

6. Ejecutas `pnpm e2e` en tu máquina. Un test falla. Abres el reporte y no hay *trace*. Un compañero dice: "Cambia `trace` en la configuración a `on`." ¿Por qué es un mal primer paso y cuál es uno mejor?

<details><summary>Respuesta</summary>

Cambiar la configuración afecta a todos y hace que cada test sea más lento de ahora en adelante. Un paso mejor es ejecutar solo el test que falla con `--trace on` en el comando. Esto graba un *trace* y no cambia nada en el proyecto. Si el fallo no vuelve, el test puede ser *flaky* (inestable), y `retain-on-failure` puede ayudar a atraparlo más adelante.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué hacen los modos de *trace* de Playwright `on-first-retry` y `retain-on-failure`, y cuándo elegirías cada uno?**
   - Busca: `playwright trace retain-on-failure on-first-retry`
   - Una buena respuesta explica: cuándo graba y guarda el *trace* cada modo, y el costo de cada uno en tiempo y espacio en disco.

2. **¿Qué hace bueno un reporte de bug para un desarrollador?**
   - Busca: `good bug report steps expected actual result`
   - Una buena respuesta explica: las partes principales de un reporte de *bug*, como los pasos, el resultado esperado, el resultado real y la evidencia, y por qué cada una ahorra tiempo.

3. **¿Qué es la consola del navegador y cuál es la diferencia entre un error y una advertencia allí?**
   - Busca: `browser console errors warnings devtools`
   - Una buena respuesta explica: qué tipos de mensajes aparecen en la consola, y por qué un error de la página puede explicar un test que falla sin una razón clara.

## Siguiente paso

En la siguiente lección aprendes a agrupar tests, compartir pasos de preparación y omitir tests de forma segura.
