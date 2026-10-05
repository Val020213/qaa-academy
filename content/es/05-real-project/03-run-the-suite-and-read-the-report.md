---
title: Ejecutar la suite y leer el reporte
summary: Ejecuta todos los tests, un archivo o un solo test, usa el modo UI y abre el reporte y el trace de un test que falló.
duration: 35 min
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

La ruta empieza en `apps/practice-shop`. El test de setup también se ejecuta, porque los specs dependen de él.

## Ejecuta un solo test

Usa `-g`. Significa "grep": ejecuta solo los tests cuyo nombre contiene este texto.

```bash
pnpm --filter practice-shop e2e -g "marks a pending order as paid"
```

Combina ambos para ser preciso:

```bash
pnpm --filter practice-shop e2e e2e/orders/orders.spec.ts -g "paid"
```

## Modo UI y modo headed

El **modo UI** es una ventana donde eliges tests, los ejecutas y recorres cada acción paso a paso. El **modo headed** ejecuta el navegador de forma visible, así ves los clics.

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

Se abre una página en tu navegador. Lista cada test con su resultado. Haz clic en un test que falló para ver el error, la línea de código y la captura de pantalla.

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

Vas a provocar un fallo para practicar cómo se lee.

1. Abre `apps/practice-shop/e2e/orders/orders.spec.ts`.
2. En el test "an admin marks a pending order as paid", cambia `toHaveText("paid")` por `toHaveText("payed")`.
3. Ejecútalo:

```bash
pnpm --filter practice-shop e2e e2e/orders/orders.spec.ts -g "paid"
```

El test espera 5 segundos y luego falla. El error muestra qué esperaba Playwright y qué recibió:

```text
Expected: "payed"
Received: "paid"
```

Al final de la salida se imprime la ruta del trace y el comando para abrirlo. Se ve así:

```bash
pnpm exec playwright show-trace test-results/<folder-name>/trace.zip
```

Ejecútalo desde `apps/practice-shop` (usa antes `cd apps/practice-shop`). Copia la ruta real de tu propia salida. En la ventana del trace, haz clic en la última acción de la izquierda. La instantánea de la página muestra el estado `paid`. Ves la causa sin ejecutar el test otra vez.

Ahora deshaz tu cambio. Comprueba con `git status` que `orders.spec.ts` no aparece como modificado.

> **Cuidado:** Deshaz siempre un cambio que hiciste a propósito. Un cambio olvidado hará fallar el build de todo el equipo.

## Práctica

1. Ejecuta `pnpm shop:e2e` y comprueba que ves `17 passed`.
2. Ejecuta solo `e2e/dashboard.spec.ts`.
3. Ejecuta solo el test "shows the numbers when they arrive" con `-g`.
4. Abre el reporte HTML: ve a `apps/practice-shop` y ejecuta `pnpm exec playwright show-report`.
5. Rompe la aserción como se describe arriba, abre el trace y deshaz el cambio.

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

4. ¿Qué dos cosas te muestra una aserción que falla?

<details><summary>Respuesta</summary>

El valor que esperaba y el valor que recibió.

</details>

## Siguiente paso

En la próxima lección leerás un spec con atención y le añadirás tu primer test.
