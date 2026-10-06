---
title: Ejecutar la suite y leer el reporte
summary: Ejecuta todos los tests, un archivo o un solo test, usa el modo UI y luego investiga un test fallido con el reporte y el trace como un científico.
duration: 80 min
---

## Empieza con un acertijo

El lunes a las 10:00 ejecutas toda la suite. Resultado: `17 passed`. A las 10:20, con el mismo código, la misma configuración y el mismo comando, un test falla:

```text
Expected: "pending"
Received: "paid"
```

Es el test del pedido 1005. Nadie cambió la aplicación ni el test. Ejecutas la suite otra vez. Ahora pasan los 17.

¿Qué es lo más probable: un bug en la aplicación, un test equivocado, datos equivocados o una computadora lenta? ¿Y qué pudo hacer alguien en la misma tienda en marcha mientras tu suite se ejecutaba?

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Ejecutar toda la suite, un archivo o un solo test.
- Usar el modo UI y el modo *headed* (con navegador visible) para ver un test.
- Abrir el reporte HTML y el trace, y encontrar con ellos la causa de un fallo.
- Depurar con disciplina: una hipótesis, un experimento pequeño, un cambio a la vez.

## Ejecuta todo

Desde la raíz del repositorio, ejecuta:

```bash
pnpm shop:e2e
```

Si la tienda no está en marcha, Playwright la arranca. Si está en marcha en el puerto 5190, Playwright la reutiliza. La salida lista cada test:

```text
  ✓  1 [setup] › e2e/global.setup.ts:6:5 › sign in as admin (2.0s)
  ✓  2 [chromium] › e2e/dashboard.spec.ts:7:7 › Dashboard › shows a loading message first (1.4s)
  ...
  17 passed (23.2s)
```

La suite tiene 17 tests, contando el test de setup. Tus tiempos serán distintos.

## Ejecuta un archivo

`pnpm --filter practice-shop e2e` ejecuta el script `e2e` de la tienda. Agrega una ruta después para elegir un archivo:

```bash
pnpm --filter practice-shop e2e e2e/orders/orders.spec.ts
```

La ruta empieza en `apps/practice-shop`. El test de setup también se ejecuta, porque los specs dependen de él.

## Ejecuta un test

Usa `-g`. Significa "grep": ejecuta solo los tests cuyo nombre contiene este texto.

```bash
pnpm --filter practice-shop e2e -g "marks a pending order as paid"
```

Combina ambos para ser preciso:

```bash
pnpm --filter practice-shop e2e e2e/orders/orders.spec.ts -g "paid"
```

Antes de ejecutar el segundo comando, predice: ¿cuántos tests se ejecutarán en el proyecto `chromium`, y cuál? Mira los nombres de los tests en el archivo. Luego ejecútalo y compara con tu lista.

## Modo UI y modo headed

El **modo UI** es una ventana donde eliges tests, los ejecutas y recorres cada acción paso a paso. El **modo headed** ejecuta el navegador de forma visible, para que veas los clics.

```bash
pnpm shop:e2e:ui
pnpm --filter practice-shop e2e:headed
```

Usa el modo UI cuando escribes un test. Usa el comando normal antes de hacer *push* (subir tus cambios).

## El reporte HTML

Cada ejecución escribe un reporte en `apps/practice-shop/playwright-report`. La configuración tiene `open: "never"`, así que no se abre solo. Ábrelo desde la carpeta de la tienda:

```bash
cd apps/practice-shop
pnpm exec playwright show-report
```

Se abre una página en tu navegador. Lista cada test con su resultado. Haz clic en un test fallido para ver el error, la línea de código y la captura de pantalla.

Pulsa `Ctrl+C` en la terminal para detener el servidor del reporte. Luego vuelve a la raíz con `cd ../..`.

## Traces

Un **trace** es una grabación de un test. Tiene cada acción, una copia de la página en cada paso y las llamadas de red. Puedes avanzar y retroceder en el tiempo.

Mira esta parte de `playwright.config.ts`:

```ts
use: {
  baseURL,
  // Keep the trace and the screenshot only when a test fails.
  trace: "retain-on-failure",
  screenshot: "only-on-failure",
```

`retain-on-failure` significa: graba cada test, pero conserva el archivo solo si el test falla. Los tests que pasan no dejan trace.

## Rompe un test a propósito

Vas a provocar un fallo para practicar cómo se lee. Primero escribe tu predicción: ¿cuánto tardará en fallar y qué dirá el error?

1. Abre `apps/practice-shop/e2e/orders/orders.spec.ts`.
2. En el test "an admin marks a pending order as paid", cambia `toHaveText("paid")` por `toHaveText("payed")`.
3. Ejecútalo:

```bash
pnpm --filter practice-shop e2e e2e/orders/orders.spec.ts -g "paid"
```

El test espera 5 segundos y luego falla. El error muestra lo que Playwright esperaba y lo que recibió:

```text
Expected: "payed"
Received: "paid"
```

El final de la salida imprime la ruta del trace y el comando para abrirlo. Se ve así:

```bash
pnpm exec playwright show-trace test-results/<folder-name>/trace.zip
```

Ejecútalo desde `apps/practice-shop` (usa primero `cd apps/practice-shop`). Copia la ruta real de tu propia salida. En la ventana del trace, haz clic en la última acción de la izquierda. La copia de la página muestra el estado `paid`. Ves la causa sin volver a ejecutar el test.

Ahora deshaz tu cambio. Comprueba con `git status` que `orders.spec.ts` no aparece como modificado.

> **Cuidado:** Deshaz siempre un fallo provocado a propósito. Un cambio olvidado hará fallar el build de todo el equipo.

### De vuelta al acertijo

La causa más probable son los datos. Setup reinicia los datos al inicio de cada ejecución, pero la tienda es un único programa compartido. Si un colega usó la misma tienda en marcha durante tu ejecución, por ejemplo marcó el pedido 1005 como pagado a mano en el navegador, tu test se encontró con un estado que no esperaba. Cuando esa persona termina, una nueva ejecución lo reinicia todo, y el fallo desaparece.

La clave está en la pista del mensaje: `Received: "paid"` para un pedido que debe estar `pending`. Un test equivocado fallaría siempre. Un bug en la aplicación fallaría siempre. Un fallo que aparece una vez y desaparece tras una nueva ejecución apunta al estado. No puedes demostrarlo solo con el mensaje. El trace muestra la página, las llamadas de red y el tiempo, y esa es la evidencia que necesitas.

## Profundiza

### Por qué el test fallido espera 5 segundos

Cuando escribiste `payed`, el test no falló de inmediato. Playwright revisa la página una y otra vez hasta que el texto coincide o se acaba el tiempo. La configuración tiene `expect: { timeout: 5_000 }`. Esto se llama **reintento automático**. Por eso no necesitas `waitForTimeout`. La página puede necesitar un momento para actualizarse, y Playwright espera solo lo necesario.

El costo es que un fallo real tarda 5 segundos en mostrarse. Es un buen trato. Una espera fija de 5 segundos haría más lento cada test que pasa.

### Una idea equivocada: "un test en rojo significa un bug en la aplicación"

Un test que falla tiene al menos cuatro causas posibles:

1. La aplicación tiene un bug. Este es el que esperas encontrar.
2. El test está mal. Por ejemplo, un error de escritura como `payed`.
3. Los datos no son los que el test espera.
4. El entorno está lento o roto.

Lee el trace antes de decidir. Solo la causa 1 es un reporte de bug. Las otras son arreglos a tu propio trabajo. Reportar un error del test como un bug de la aplicación le cuesta tiempo a un desarrollador y le cuesta credibilidad a ti.

### Depura como un científico

Cuando un test falla, no cambies cinco cosas y ejecutes otra vez. Sigue este ciclo:

1. Haz **una hipótesis** sobre la causa. Dila en una frase.
2. Diseña **un experimento pequeño** que pueda demostrar que la hipótesis es falsa.
3. Ejecútalo y cambia **una sola cosa** a la vez.
4. Si puedes, **reduce el caso que falla**: ejecuta un test en lugar de toda la suite, un archivo en lugar de todos los archivos.

Por ejemplo, una compañera dice: "el test pasa en mi máquina pero falla cuando ejecuto toda la suite". Hipótesis: otro test cambia primero los datos. Experimento: ejecuta el test solo, y luego todo el archivo.

```bash
pnpm --filter practice-shop e2e e2e/orders/orders.spec.ts -g "paid"
pnpm --filter practice-shop e2e e2e/orders/orders.spec.ts
```

Si pasa solo y falla con los demás, los tests comparten datos. Eso no es azar. Es una pista.

### El costo de grabar traces

Un trace ayuda mucho, pero usa espacio en disco y tiempo. La configuración usa `retain-on-failure`: graba siempre, conserva solo los fallos. Otra opción es `on-first-retry`, que graba solo cuando un test se ejecuta de nuevo. Es más barata, pero no ves nada del primer fallo. La tienda es pequeña, así que elige más información.

La configuración también tiene `retries: process.env.CI ? 2 : 0`. En tu máquina un test que falla no se vuelve a ejecutar, así que un test *flaky* (inestable) no puede esconderse.

### Por qué importan las ejecuciones repetibles

Una buena suite de tests es **FIRST**: rápida (Fast), independiente (Independent), repetible (Repeatable), autoverificable (Self-checking) y oportuna (Timely). El test del acertijo rompió "Repeatable": el mismo comando dio dos respuestas. Un test que no es repetible enseña al equipo a ignorar los resultados en rojo. Eso cuesta más que un test lento.

## Práctica

1. Ejecuta `pnpm shop:e2e` y comprueba que ves `17 passed`.
2. Ejecuta solo `e2e/dashboard.spec.ts`.
3. Ejecuta solo el test "shows the numbers when they arrive" con `-g`.
4. Abre el reporte HTML: ve a `apps/practice-shop` y ejecuta `pnpm exec playwright show-report`.
5. Rompe la aserción como se describió arriba, abre el trace y luego deshaz el cambio.

## Reto

Un test que funciona una vez no siempre es un buen test. Tu tarea: construir un test que pasa la primera vez y falla la segunda, descubrir por qué con las herramientas de esta lección y luego quitarlo.

Escribe un spec nuevo con un test. Usa el pedido pendiente 1009. Comprueba que el pedido está `pending`, hace clic en **Mark as paid** (marcar como pagado) de ese pedido y comprueba que el estado es `paid`. Luego ejecútalo de forma que Playwright repita el mismo test tres veces en un solo comando, sin ningún reinicio entre las repeticiones. Lee el resultado, abre el trace de un fallo y escribe una nota con tus propias palabras sobre lo que viste.

Crea el archivo `apps/practice-shop/e2e/orders/repeat-me.spec.ts`. Cuando termines, bórralo.

Está terminado cuando:

- El test pasa cuando lo ejecutas una vez.
- Cuando lo ejecutas con la opción de repetir de Playwright, una repetición pasa y las otras fallan, y el error dice `Expected: "pending"` y `Received: "paid"`.
- En el trace de una repetición fallida, puedes señalar el paso donde la página ya muestra `paid` antes de tu clic.
- Puedes explicar en una frase por qué la suite normal no muestra este fallo. Escríbelo como comentario al inicio del archivo.
- El archivo está borrado, y `git status` no lo lista.

Vas a necesitar algo que esta lección no enseñó: la opción de línea de comandos que repite cada test varias veces. Leer la lista de opciones del ejecutor de tests es una habilidad en sí misma: busca el nombre de la opción, el ejemplo y los límites. Busca: `playwright test command line options repeat-each`, `playwright cli reference`.

## Piénsalo bien

1. Ejecutas el test de pagar dos veces, una tras otra, con una opción que omite el proyecto setup (`--no-deps`). Predice qué ves en cada ejecución y por qué.

<details><summary>Respuesta</summary>

La primera ejecución pasa si los datos estaban frescos, porque el pedido 1005 está pendiente. La segunda ejecución falla en la línea de guarda con `Expected: "pending"` y `Received: "paid"`. Sin setup, nada reinicia los datos entre las ejecuciones, y un estado solo avanza. Por eso el comando normal siempre ejecuta setup primero. También muestra que `pending` es un estado de la tienda, no un hecho del test.

</details>

2. Un compañero dice: "La suite era flaky, así que puse `retries: 3` en cada ejecución de mi máquina. Ahora siempre está en verde". Encuentra el problema.

<details><summary>Respuesta</summary>

La suite no está arreglada. Un test que falla y luego pasa sigue siendo flaky, y ahora nadie lo ve. La configuración de la tienda reintenta solo en CI, así que un fallo en tu máquina se ve cuando ocurre. Los reintentos sirven para que un build siga avanzando, no son una cura. Cuando un test pasa en un reintento, el reporte lo marca como flaky, y esa marca debería llevar a una investigación.

</details>

3. La versión A graba cada test y conserva el trace solo de los fallos (`retain-on-failure`). La versión B graba solo cuando un test se ejecuta de nuevo (`on-first-retry`). ¿Cuál es mejor para la tienda, y qué te haría elegir B?

<details><summary>Respuesta</summary>

A es mejor para la tienda, porque en una máquina local no hay reintentos y quieres un trace del primer fallo. B sería más barata para una suite con miles de tests donde grabar cada test hace lenta la ejecución y llena el disco. B solo funciona si los reintentos están activados. La elección depende del tamaño de la suite, de la velocidad de las computadoras y de si puedes vivir sin un trace del primer fallo.

</details>

4. ¿Qué se rompe si bajas `expect: { timeout: 5_000 }` a `500` en la configuración?

<details><summary>Respuesta</summary>

El test del dashboard "shows the numbers when they arrive" fallaría. Los números vienen de un *endpoint* (dirección de la API) que espera 1.2 segundos a propósito, y un límite de medio segundo termina antes de que aparezcan. Los tests que esperan cosas lentas necesitan un límite suficientemente largo. Un límite corto hace que los fallos se muestren más rápido, pero crea falsas alarmas. El valor correcto es un poco más largo que la espera normal más lenta.

</details>

5. Ejecutas la suite con la variable de entorno `CI` definida, pero la tienda ya está en marcha en el puerto 5190 en otra terminal. ¿Qué esperas y por qué?

<details><summary>Respuesta</summary>

Playwright se detiene con un error que dice que la dirección ya está en uso. La configuración tiene `reuseExistingServer: !process.env.CI`, así que con `CI` definida no reutiliza un servidor en marcha. En una máquina de CI esto es intencional: cada ejecución debe arrancar un servidor limpio. En tu propia computadora, la solución es detener la tienda en la otra terminal, o quitar la variable `CI`. Es un buen ejemplo de un ajuste que se comporta distinto en dos lugares.

</details>

6. Un test falla dos veces por semana sin motivo claro. La líder del equipo dice: "Márcalo como omitido para que el build siga en verde". ¿Es buena idea? No hay una única respuesta correcta.

<details><summary>Respuesta</summary>

Omitirlo mantiene el build en verde, pero esconde un riesgo. Si el test comprueba algo importante, ahora no tienes ninguna comprobación para eso. Un mejor camino es omitirlo por poco tiempo, anotar la causa que sospechas y fijar una fecha para arreglarlo. La respuesta depende de qué tan importante es la funcionalidad comprobada, cuánto confía el equipo en los otros tests y cuánto durará la omisión. Una omisión sin responsable y sin fecha suele volverse permanente.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es un test flaky y cuáles son las causas más comunes?**
   - Busca: `flaky tests causes test automation`
   - Pruébalo: ejecuta `pnpm --filter practice-shop e2e e2e/dashboard.spec.ts --repeat-each=5` y anota el resultado. Luego explica por qué este archivo se repite bien, mientras que el archivo de pedidos no.
   - Una buena respuesta explica: al menos tres causas, como el tiempo, los datos compartidos y el entorno, y por qué los tests flaky dañan a un equipo.

2. **¿Qué muestra el trace viewer de Playwright en sus pestañas Actions, Network y Console?**
   - Busca: `playwright trace viewer actions network console`
   - Pruébalo: rompe el test de pagar como en esta lección y abre su trace. En la pestaña Network, encuentra la petición a `/api/orders`. Anota su método y su código de estado.
   - Una buena respuesta explica: qué muestra cada pestaña y cómo usarlas para encontrar la causa de un fallo.

3. **¿Qué es un código de salida de un proceso y cómo lo usa un sistema de CI para decidir si pasó o falló?**
   - Busca: `process exit code 0 non-zero ci powershell lastexitcode`
   - Pruébalo: en PowerShell, ejecuta `pnpm --filter practice-shop e2e e2e/dashboard.spec.ts` y luego escribe `$LASTEXITCODE`. Repite con un test que rompiste a propósito. Compara los dos números.
   - Una buena respuesta explica: que 0 significa éxito y otros números significan fallo, y que el comando de tests devuelve un código distinto de cero cuando hay tests que fallan.

## Siguiente paso

En la próxima lección lees un spec con atención y le agregas tu primer test.
