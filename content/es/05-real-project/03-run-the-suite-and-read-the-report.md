---
title: Ejecutar la suite y leer el reporte
duration: 55 min
---

## Objetivo

En esta lección ejecutas la suite de la QA Shop y provocas un fallo para investigar su causa con el reporte y el trace.

- Ejecutar toda la suite, un archivo o un solo test.
- Usar los scripts de modo UI y modo headed de la tienda.
- Leer el error, la captura y el trace de un test fallido.
- Reconocer un estado inesperado y deshacer los cambios de prueba.

## Ejecuta todo

Desde la raíz del repositorio, ejecuta:

```bash
pnpm shop:e2e
```

Playwright usa el puerto 5190 por defecto; `SHOP_E2E_PORT` puede cambiarlo. Si la tienda no responde, la arranca. Si responde, la reutiliza solo con `CI` ausente o vacía; con `CI` no vacía, falla. Este ejemplo abreviado muestra cómo se lista cada test:

```text
  ✓  1 [setup] › e2e/global.setup.ts:6:5 › sign in as admin (2.0s)
  ✓  2 [chromium] › e2e/dashboard.spec.ts:7:7 › Dashboard › shows a loading message first (1.4s)
  ...
  17 passed (23.2s)
```

La suite original tiene 17 tests, contando el setup. Los specs que agregaste aumentan ese total. Tus tiempos serán distintos.

## Ejecuta un archivo

`pnpm --filter practice-shop e2e` ejecuta el script `e2e` de la tienda. Agrega una ruta después para elegir un archivo:

```bash
pnpm --filter practice-shop e2e e2e/orders/orders.spec.ts
```

La ruta empieza en `apps/practice-shop`. El test de setup también se ejecuta, porque el proyecto `chromium` depende de setup.

## Ejecuta un test

Usa `-g` (grep): Playwright interpreta el valor como una expresión regular y lo compara con el nombre completo, incluidos el proyecto, el archivo y los grupos del test.

```bash
pnpm --filter practice-shop e2e -g "marks a pending order as paid"
```

Combina la ruta y el filtro de nombre para seleccionar el test dentro de un archivo:

```bash
pnpm --filter practice-shop e2e e2e/orders/orders.spec.ts -g "paid"
```

## Modo UI y modo headed

Estos scripts abren el modo UI y ejecutan la suite con el navegador visible, respectivamente:

```bash
pnpm shop:e2e:ui
pnpm --filter practice-shop e2e:headed
```

Usa el modo UI para revisar las acciones de un test. Ejecuta el comando normal antes de hacer push.

## El reporte HTML

Playwright escribe el reporte en `apps/practice-shop/playwright-report`. La configuración tiene `open: "never"`, así que debes abrirlo desde la carpeta de la tienda:

```bash
cd apps/practice-shop
pnpm exec playwright show-report
```

El reporte lista cada test con su resultado. Haz clic en un test fallido para ver el error, la línea de código y la captura de pantalla.

Pulsa `Ctrl+C` en la terminal para detener el servidor del reporte. Luego vuelve a la raíz con `cd ../..`.

## Traces

La tienda conserva traces de los fallos con esta configuración de `playwright.config.ts`:

```ts
use: {
  baseURL,
  // Keep the trace and the screenshot only when a test fails.
  trace: "retain-on-failure",
  screenshot: "only-on-failure",
```

Con `retain-on-failure`, Playwright graba cada test y elimina el trace si pasa. La configuración tiene `retries: process.env.CI ? 2 : 0`, así que una ejecución local conserva el trace del fallo sin necesitar un reintento.

## Rompe un test a propósito

Provoca un fallo para revisar la evidencia:

1. Abre `apps/practice-shop/e2e/orders/orders.spec.ts`.
2. En el test "an admin marks a pending order as paid", cambia `toHaveText("paid")` por `toHaveText("payed")`.
3. Ejecútalo:

```bash
pnpm --filter practice-shop e2e e2e/orders/orders.spec.ts -g "paid"
```

La aserción tiene un timeout de 5 segundos, definido por `expect: { timeout: 5_000 }`. Playwright vuelve a buscar el elemento con el locator y compara su texto hasta que coincide o vence el timeout. Como el estado es `paid`, la aserción falla:

```text
Expected: "payed"
Received: "paid"
```

El final de la salida imprime la ruta del trace y un comando como este:

```bash
pnpm exec playwright show-trace test-results/<folder-name>/trace.zip
```

Ejecútalo desde `apps/practice-shop` (usa primero `cd apps/practice-shop`). Copia la ruta real de tu salida. En el trace, selecciona la aserción fallida en la lista de la izquierda. El snapshot muestra `paid`: el error está en el texto esperado que escribiste.

Deshaz el cambio y comprueba con `git status` que `orders.spec.ts` no aparece como modificado.

## Un estado inesperado

Si falla la aserción inicial del pedido 1005, podrías ver:

```text
Expected: "pending"
Received: "paid"
```

El setup reinicia los datos al inicio de cada ejecución, pero otra persona puede cambiarlos mientras corren los tests. Si un colega marca el pedido 1005 como pagado en la misma tienda, el test encuentra `paid` donde espera `pending`.

El mensaje por sí solo no demuestra la causa. Revisa en el trace el estado de la página y las llamadas de red antes de decidir si falló la aplicación, el test, los datos o el entorno.

## Práctica

1. Ejecuta `pnpm shop:e2e` y comprueba que todos pasan: `17 passed` para la suite original, o más si agregaste specs.
2. Ejecuta solo `e2e/dashboard.spec.ts`.
3. Ejecuta solo el test "shows the numbers when they arrive" con `-g`.
4. Abre el reporte HTML: ve a `apps/practice-shop` y ejecuta `pnpm exec playwright show-report`.
5. Rompe la aserción como se describió arriba, abre el trace y luego deshaz el cambio.

## Reto

Crea `apps/practice-shop/e2e/orders/repeat-me.spec.ts` con un test que compruebe que el pedido 1009 está `pending`, haga clic en **Mark as paid** y compruebe que queda `paid`.

Selecciona solo `e2e/orders/repeat-me.spec.ts` y ejecuta el test tres veces en un solo comando. Así el setup corre una vez, sin reiniciar los datos entre las repeticiones. Abre el trace de un fallo. Cuando termines, borra el archivo.

Está terminado cuando:

- El test pasa cuando lo ejecutas una vez.
- Al repetirlo, una repetición pasa y las otras fallan con `Expected: "pending"` y `Received: "paid"`.
- En el trace de una repetición fallida, señalas el paso donde la página ya muestra `paid` antes de tu clic.
- Escribiste un comentario al inicio del archivo que explica por qué la suite normal no muestra este fallo. Después borraste el archivo y comprobaste que `git status` no lo lista.

Busca la opción que repite cada test: `playwright test command line options repeat-each`, `playwright cli reference`.

## Piénsalo bien

1. Ejecutas el test de pagar dos veces, una tras otra, con una opción que omite el proyecto setup (`--no-deps`). ¿Qué ocurre en cada ejecución si la tienda se mantiene en marcha, la sesión guardada es válida y el pedido 1005 estaba pendiente al principio?

<details><summary>Respuesta</summary>

La primera pasa y deja el pedido pagado. La segunda falla en la aserción inicial con `Expected: "pending"` y `Received: "paid"`, porque sin setup nadie reinicia los datos entre las ejecuciones.

</details>

2. ¿Qué se rompe si bajas `expect: { timeout: 5_000 }` a `500` en la configuración?

<details><summary>Respuesta</summary>

La aserción que espera los números puede fallar si siguen pendientes al vencer sus 500 ms. La API demora 1.2 segundos, pero el timeout empieza cuando comienza la aserción, no cuando se envía la petición. Si los números llegan dentro de ese plazo, pasa.

</details>

3. Ejecutas la suite con la variable de entorno `CI` no vacía, pero la tienda ya está en marcha en el puerto 5190 en otra terminal. ¿Qué ocurre y por qué?

<details><summary>Respuesta</summary>

Playwright se detiene con un error que dice que la dirección ya está en uso. La configuración tiene `reuseExistingServer: !process.env.CI`, así que con `CI` no vacía no reutiliza un servidor en marcha.

</details>

## Siguiente paso

En la próxima lección lees un spec con atención y le agregas tu primer test.
