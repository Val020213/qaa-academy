---
title: Ejecutar la suite y leer el reporte
summary: Ejecuta todos los tests, un archivo o un solo test, usa el modo UI y abre el reporte y el trace de un test que falla.
duration: 50 min
---

## Objetivo

- Ejecutar toda la suite, un archivo o un solo test.
- Usar el modo UI y el modo headed para ver un test.
- Abrir el reporte HTML.
- Romper una aserción a propósito y leer su trace.

## Ejecuta todo

Desde la raíz del repositorio, ejecuta:

```bash
pnpm shop:e2e
```

Si la tienda no está en marcha, Playwright la inicia. Si ya corre en el puerto 5190, Playwright la reutiliza. La salida lista cada test:

```text
  ✓  1 [setup] › e2e/global.setup.ts:6:5 › sign in as admin (2.0s)
  ✓  2 [chromium] › e2e/dashboard.spec.ts:7:7 › Dashboard › shows a loading message first (1.4s)
  ...
  17 passed (23.2s)
```

La suite tiene 17 tests, incluido el test de setup. Tus tiempos serán distintos.

## Ejecuta un archivo

`pnpm --filter practice-shop e2e` ejecuta el script `e2e` de la tienda. Añade una ruta después para elegir un archivo:

```bash
pnpm --filter practice-shop e2e e2e/orders/orders.spec.ts
```

La ruta parte de `apps/practice-shop`. El test de setup también se ejecuta, porque los specs dependen de él.

## Ejecuta un solo test

Usa `-g`. Significa "grep" (buscar): ejecuta solo los tests cuyo nombre contiene este texto.

```bash
pnpm --filter practice-shop e2e -g "marks a pending order as paid"
```

Combina ambos para ser preciso:

```bash
pnpm --filter practice-shop e2e e2e/orders/orders.spec.ts -g "paid"
```

## Modo UI y modo headed

El **modo UI** es una ventana donde eliges tests, los ejecutas y avanzas por cada acción paso a paso. El **modo headed** ejecuta el navegador de forma visible, así ves los clics.

```bash
pnpm shop:e2e:ui
pnpm --filter practice-shop e2e:headed
```

Usa el modo UI cuando escribas un test. Usa el comando normal antes de hacer *push* (subir tus cambios).

## El reporte HTML

Cada ejecución escribe un reporte en `apps/practice-shop/playwright-report`. La configuración tiene `open: "never"`, así que no se abre solo. Ábrelo desde la carpeta de la tienda:

```bash
cd apps/practice-shop
pnpm exec playwright show-report
```

Se abre una página en tu navegador. Lista cada test con su resultado. Haz clic en un test fallido para ver el error, la línea de código y la captura de pantalla.

Pulsa `Ctrl+C` en la terminal para detener el servidor del reporte. Luego vuelve a la raíz con `cd ../..`.

## Traces

Un **trace** es una grabación de un test. Tiene cada acción, una instantánea de la página en cada paso y las llamadas de red. Puedes moverte atrás y adelante en el tiempo.

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

Vas a provocar un fallo para practicar cómo leerlo.

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

Ejecútalo desde `apps/practice-shop` (usa primero `cd apps/practice-shop`). Copia la ruta real de tu propia salida. En la ventana del trace, haz clic en la última acción de la izquierda. La instantánea de la página muestra el estado `paid`. Ves la causa sin volver a ejecutar el test.

Ahora deshaz tu cambio. Comprueba con `git status` que `orders.spec.ts` no aparece como modificado.

> **Cuidado:** Deshaz siempre un fallo provocado a propósito. Un cambio olvidado hará fallar el build de todo el equipo.

## Profundiza

### Por qué el test fallido espera 5 segundos

Cuando escribiste `payed`, el test no falló de inmediato. Playwright revisa la página una y otra vez hasta que el texto coincide o se acaba el tiempo. La configuración tiene `expect: { timeout: 5_000 }`. Esto se llama **reintento automático** (*auto-retrying*). Por eso no necesitas `waitForTimeout`. La página puede tardar un momento en actualizarse, y Playwright espera solo lo necesario.

El costo es que un fallo real tarda 5 segundos en mostrarse. Es un buen trato. Una espera fija de 5 segundos haría más lento cada test que pasa.

### Una idea equivocada: "un test en rojo significa un bug en la aplicación"

Un test que falla tiene al menos cuatro causas posibles:

1. La aplicación tiene un bug. Es el que esperas encontrar.
2. El test está mal. Por ejemplo, un error de escritura como `payed`.
3. Los datos no son los que el test espera.
4. El entorno está lento o roto.

Lee el trace antes de decidir. Solo la causa 1 es un reporte de bug. Las otras son arreglos de tu propio trabajo. Reportar un error del test como bug de la aplicación le cuesta tiempo a un desarrollador y te cuesta credibilidad.

### Cómo aparece en el trabajo real de automatización QA

Un compañero dice: "el test pasa en mi máquina pero falla cuando ejecuto toda la suite." Ejecuta el test solo y luego el archivo completo:

```bash
pnpm --filter practice-shop e2e e2e/orders/orders.spec.ts -g "paid"
pnpm --filter practice-shop e2e e2e/orders/orders.spec.ts
```

Si pasa solo y falla con los demás, los tests comparten datos. Otro test cambió algo antes. Eso no es azar. Es una pista. Un buen hábito: cuando un test falla, cambia primero una sola cosa, como ejecutarlo solo, y observa qué cambia.

### El costo de grabar traces

Un trace ayuda mucho, pero usa espacio en disco y tiempo. La configuración usa `retain-on-failure`: graba siempre y conserva solo los fallos. Otra opción es `on-first-retry`, que graba solo cuando un test se ejecuta de nuevo. Es más barata, pero no ves nada del primer fallo. La tienda es pequeña, así que elige tener más información.

La opción `-g` también es una pequeña idea DRY: no escribes un script nuevo para cada test. Un comando, una opción, muchos usos.

## Práctica

1. Ejecuta `pnpm shop:e2e` y comprueba que ves `17 passed`.
2. Ejecuta solo `e2e/dashboard.spec.ts`.
3. Ejecuta solo el test "shows the numbers when they arrive" con `-g`.
4. Abre el reporte HTML: ve a `apps/practice-shop` y ejecuta `pnpm exec playwright show-report`.
5. Rompe la aserción como se describe arriba, abre el trace y luego deshaz el cambio.

## Comprueba lo que sabes

1. ¿Cómo ejecutas un solo test por su nombre?

<details><summary>Respuesta</summary>

Añade `-g "parte del nombre"` al comando.

</details>

2. ¿Dónde está el reporte HTML?

<details><summary>Respuesta</summary>

En `apps/practice-shop/playwright-report`. Ábrelo con `pnpm exec playwright show-report` desde `apps/practice-shop`.

</details>

3. ¿Qué hace `trace: "retain-on-failure"`?

<details><summary>Respuesta</summary>

Graba cada test y conserva el trace solo de los tests que fallan.

</details>

4. ¿Qué dos cosas te muestra una aserción fallida?

<details><summary>Respuesta</summary>

El valor que esperaba y el valor que recibió.

</details>

5. Cambias `toHaveText("paid")` por `toHaveText("payed")` y ejecutas el test. ¿Cuánto tarda más o menos en fallar y por qué no es instantáneo?

<details><summary>Respuesta</summary>

Unos 5 segundos, más el tiempo de abrir la página. El timeout de `expect` en la configuración es de 5 segundos. Playwright revisa una y otra vez durante ese tiempo, por si el texto cambia. Solo cuando se acaba el tiempo reporta el fallo.

</details>

6. Un test pasa cuando lo ejecutas solo con `-g`, pero falla en la ejecución completa. Da dos causas probables.

<details><summary>Respuesta</summary>

Otro test puede cambiar los datos antes, por ejemplo marca el mismo pedido como pagado. El test también puede depender de un estado que solo existe cuando se ejecuta primero, como un servidor recién iniciado. Ambas causas vienen de los datos compartidos o del orden, no de la aplicación.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es un test flaky y cuáles son las causas más comunes?**
   - Busca: `flaky tests causes test automation`
   - Una buena respuesta explica: al menos tres causas, como el momento, los datos compartidos y el entorno, y por qué los tests flaky dañan a un equipo

2. **¿Qué muestra el trace viewer de Playwright en sus pestañas Actions, Network y Console?**
   - Busca: `playwright trace viewer actions network console`
   - Una buena respuesta explica: qué muestra cada pestaña y cómo usarlas para encontrar la causa de un fallo

3. **¿Qué es un código de salida de un proceso y cómo lo usa un sistema de CI para decidir si pasa o falla?**
   - Busca: `process exit code 0 non-zero ci`
   - Una buena respuesta explica: que 0 significa éxito y otros números significan fallo, y que el comando de tests devuelve un código distinto de cero cuando fallan tests

## Siguiente paso

En la próxima lección leerás un spec con atención y le añadirás tu primer test.
