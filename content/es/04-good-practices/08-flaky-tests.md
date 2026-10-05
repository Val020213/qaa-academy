---
title: Tests inestables (flaky)
summary: Reconoce los tests flaky, corrige sus causas comunes e investiga con ejecuciones repetidas y trazas.
duration: 35 min
---

## Objetivo

- Definir un test flaky.
- Nombrar las causas comunes y la solución de cada una.
- Investigar con `--repeat-each` y la *trace* (traza).
- Explicar por qué los reintentos ocultan la inestabilidad.

## Qué es flaky

Un test **flaky** (inestable) pasa y falla sin ningún cambio en el código. Lo ejecutas dos veces y obtienes dos resultados.

Los tests flaky hacen daño. El equipo deja de confiar en un resultado rojo. Un test flaky siempre tiene una causa. Búscala.

## Causa 1: esperas fijas

Una espera fija detiene el test durante un tiempo determinado:

```ts
await page.waitForTimeout(2000)
```

Un día lento, la página puede necesitar tres segundos. Entonces el test falla. O necesita un segundo, y el test pierde tiempo. El equipo nunca usa `waitForTimeout`.

**Solución:** espera lo que necesitas. Una aserción *web-first* (que espera por sí sola) espera hasta que la condición sea verdadera. Mira `e2e/dashboard.spec.ts`:

```ts
// The numbers come from a slow endpoint (about 1 second).
// We never sleep: the assertions wait for us.
await expect(page.getByTestId("dashboard-stats")).toBeVisible()
```

## Causa 2: escribir antes de que la página esté lista

La tienda dibuja primero la página en el servidor. Después React arranca en el navegador. Este arranque se llama **hidratación**. El texto escrito antes de la hidratación puede borrarse.

La solución está en `e2e/global.setup.ts`. Usa el patrón `toPass`:

```ts
await expect(async () => {
  await page.getByTestId("login-email").fill(ADMIN.email)
  await page.getByTestId("login-password").fill(ADMIN.password)
  await expect(page.getByTestId("login-email")).toHaveValue(ADMIN.email)
  await expect(page.getByTestId("login-password")).toHaveValue(ADMIN.password)
}).toPass()
```

`toPass` ejecuta el bloque una y otra vez hasta que todas las líneas pasan. El bloque escribe y luego comprueba que el valor se quedó. Si React lo borró, el bloque lo intenta de nuevo.

**Solución:** usa `toPass` solo para este caso. En otros tests, el equipo espera algo visible. Por ejemplo, `products.spec.ts` espera una fila de producto antes de escribir en el cuadro de búsqueda.

## Causa 3: datos compartidos

Dos tests cambian el mismo registro. Uno pasa solo cuando el otro no se ejecutó antes.

**Solución:** cada test crea sus propios datos con `createProduct`, `uniqueName` y `uniqueSku`. La lección 2 (Tests independientes y datos únicos) lo explica.

## Causa 4: dependencia del orden

El test B usa un producto que creó el test A. En el orden habitual pasa. Si lo ejecutas solo, o después de otro test, falla.

**Solución:** ejecuta el test solo. Si falla, mueve la preparación que falta dentro del test.

## Causa 5: valores que aún están cargando

Una página puede mostrar un marcador de posición y luego el valor real. Una comprobación que lee el valor demasiado pronto ve el marcador.

Aquí el número se lee una vez, sin esperar:

```ts
const text = await page.getByTestId("stat-products").textContent()
```

`textContent` devuelve lo que hay en ese momento. Puede estar vacío o ser un texto de carga.

**Solución:** usa una aserción que espera, como hace el test real del dashboard:

```ts
await expect(page.getByTestId("stat-products")).toHaveText(/^\d+$/)
```

Lo mismo aplica a `locator.count()`. Lee una sola vez. Usa `toHaveCount` en su lugar.

## Causa 6: un selector que coincide con más de un elemento

Playwright es estricto. Si un locator coincide con muchos elementos y haces clic en él, el test falla con un error sobre una **strict mode violation** (violación del modo estricto).

La tabla de productos tiene 10 filas. `page.getByTestId(/^products-row-/)` coincide con todas. Eso es correcto para `toHaveCount(10)`. Es incorrecto para un clic.

**Solución:** sé específico. Usa el id de la fila, como `products.row(product.id)`. O reduce la lista con un nombre único, como hace `rowByName`. No ocultes el problema con `.first()`, salvo que el orden sea justo lo que pruebas.

## Cómo investigar

1. **Repite el test.** Ejecuta un test muchas veces:

```bash
pnpm shop:e2e products/products.spec.ts --repeat-each 5
```

`--repeat-each 5` ejecuta cada test cinco veces. Si una ejecución falla, el test es flaky.

2. **Ejecútalo solo.** Si pasa solo pero falla en el grupo, busca datos compartidos.
3. **Lee la trace.** La configuración guarda una trace de los tests que fallan (`trace: "retain-on-failure"`). Una trace es una grabación del test: cada paso, la página y la red. Abre el reporte HTML:

```bash
pnpm --filter practice-shop exec playwright show-report
```

Haz clic en el test que falló y abre su trace. Busca el primer paso que difiere de lo que esperabas.

## Los reintentos ocultan la inestabilidad

Un **reintento** ejecuta de nuevo un test que falló. La configuración dice:

```ts
// Retry only on CI, so a flaky test is never hidden on your machine.
retries: process.env.CI ? 2 : 0,
```

Un reintento pone el build en verde. No corrige la causa. Un test flaky que pasa en el segundo intento sigue siendo flaky. Playwright lo marca como "flaky" en la salida. Trata esa palabra como un bug por corregir.

## Práctica

1. Crea el archivo `apps/practice-shop/e2e/flaky-practice.spec.ts` con este código. Tiene una espera fija a propósito:

```ts
import { expect, test } from "./lib/test"

test("the dashboard has stats after a fixed wait", async ({ page }) => {
  await page.goto("/dashboard")
  await page.waitForTimeout(1200)

  expect(await page.getByTestId("dashboard-stats").count()).toBe(1)
})
```

2. Inicia la tienda con `pnpm shop:dev`. En otra terminal ejecútalo diez veces:

```bash
pnpm shop:e2e flaky-practice.spec.ts --repeat-each 10
```

3. Cuenta cuántas ejecuciones fallan. Los números llegan después de cerca de 1.2 segundos, y ese tiempo empieza solo cuando la página terminó de cargar. El test espera 1.2 segundos desde la carga de la página, así que casi siempre llega demasiado pronto. Espera que fallen la mayoría de las ejecuciones o todas. El número exacto depende de tu computadora.
4. Reemplaza la última línea (la línea `expect(...)`) por una aserción web-first:

```ts
await expect(page.getByTestId("dashboard-stats")).toBeVisible()
```

5. Quita la línea `waitForTimeout`. Ejecútalo diez veces otra vez. Debe pasar todas las veces.
6. Ejecuta todo el spec de productos cinco veces con `--repeat-each 5`.

## Comprueba lo que sabes

1. ¿Qué es un test flaky?

<details><summary>Respuesta</summary>

Un test que pasa y falla sin un cambio en el código.

</details>

2. ¿Por qué `page.waitForTimeout(2000)` es una mala solución?

<details><summary>Respuesta</summary>

El tiempo correcto cambia de una ejecución a otra. El test es demasiado lento en los días buenos y falla en los días malos.

</details>

3. ¿Qué hace `--repeat-each 5`?

<details><summary>Respuesta</summary>

Ejecuta cada test seleccionado cinco veces, para que puedas ver si el resultado cambia.

</details>

4. ¿Por qué los reintentos no corrigen un test flaky?

<details><summary>Respuesta</summary>

Un reintento solo ejecuta el test de nuevo hasta que pasa. La causa sigue ahí, y el test todavía falla algunas veces.

</details>

## Siguiente paso

En la última lección aprenderás una lista de comprobación para revisar tu propio spec antes de pedir a otra persona que lo lea.
