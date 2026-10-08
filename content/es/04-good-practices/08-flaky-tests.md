---
title: Tests inestables (flaky)
duration: 60 min
---

## Objetivo

En esta lección identificas qué hace que un test pase y falle con el mismo código. Usas la evidencia de sus ejecuciones para encontrar la causa y comprobar el arreglo.

- Reconocer seis causas comunes de inestabilidad y elegir una solución.
- Investigar con un trace, una hipótesis y un cambio a la vez.
- Calcular cómo se acumulan los fallos en una suite.
- Distinguir un arreglo de un reintento o una cuarentena.

## Tests inestables y carreras

Un test **flaky** (inestable) pasa y falla sin ningún cambio en el código. Cuando el equipo empieza a repetir cualquier ejecución en rojo, puede pasar por alto un bug real.

El runner ejecuta el test mientras la aplicación trabaja en el navegador. Si el test comprueba un resultado antes de que la aplicación lo muestre, el resultado depende de cuál llega primero. Esto es una **carrera** (*race*).

![Una lectura toma el texto temporal; la aserción repite la comprobación mientras llega la actualización.](/images/04-race-and-wait.es.svg)

## El efecto en una suite

Si los resultados son independientes y cada uno de 100 tests pasa con probabilidad 0.99, la probabilidad de que todos pasen es 0.99 multiplicado por sí mismo 100 veces: cerca de 0.37. La suite sale verde en unas 37 ejecuciones de cada 100.

Este código calcula la probabilidad de al menos un fallo cuando cada test falla un 1 por ciento de las veces:

```ts
const chance = 0.01
for (const tests of [10, 50, 100, 200]) {
  console.log(tests, ((1 - (1 - chance) ** tests) * 100).toFixed(1) + "%")
}
```

Imprime `10 9.6%`, `50 39.5%`, `100 63.4%` y `200 86.6%`.

## Causa 1: esperas fijas

Una espera fija detiene el test por un tiempo definido:

```ts
await page.waitForTimeout(2000)
```

Si la página necesita tres segundos, el test continúa demasiado pronto. Si necesita uno, espera un segundo de más. La regla del equipo es no usar `waitForTimeout`.

Espera la condición que necesitas, como hace `e2e/dashboard.spec.ts`:

```ts
// The numbers come from a slow endpoint (about 1.2 seconds).
// We never sleep: the assertions wait for us.
// ...
await expect(page.getByTestId("dashboard-stats")).toBeVisible()
```

Playwright vuelve a buscar con el locator y comprueba la visibilidad hasta que la aserción pasa o vence su timeout. El test continúa cuando aparecen las estadísticas.

## Causa 2: escribir antes de que la página esté lista

La tienda genera el HTML en el servidor. Después React conecta la página con su código en el navegador; este proceso se llama **hidratación** (*hydration*). El texto escrito antes puede borrarse.

En `e2e/global.setup.ts`, el formulario de login se llena con `toPass`:

```ts
await expect(async () => {
  await page.getByTestId("login-email").fill(ADMIN.email)
  await page.getByTestId("login-password").fill(ADMIN.password)
  await expect(page.getByTestId("login-email")).toHaveValue(ADMIN.email)
  await expect(page.getByTestId("login-password")).toHaveValue(ADMIN.password)
}).toPass()
```

`toPass` repite el bloque si alguna línea falla. El bloque llena los campos y comprueba sus valores. Si React borró el texto y la comprobación falla, Playwright vuelve a llenar el formulario. Después del primer bloque que pasa, `toPass` termina; no detecta un borrado posterior.

En esta tienda, usa ese patrón para el login. En `products.spec.ts`, espera una fila de producto visible antes de escribir en el cuadro de búsqueda. Esa fila aparece después de que React haya iniciado la petición y recibido los productos.

Repetir acciones puede esconder un bug donde el campo pierde texto después de estar listo. Prefiere una señal visible de que la página está lista cuando exista.

## Causa 3: datos compartidos

Dos tests cambian el mismo registro. Uno puede fallar porque el otro lo modificó o borró.

Cada test crea sus propios datos con `createProduct`, `uniqueName` y `uniqueSku`, como en la lección de tests independientes y datos únicos.

## Causa 4: dependencia del orden

El test B usa un producto que creó el test A. Pasa después de A, pero falla si lo ejecutas solo.

Ejecuta B solo para detectar esa dependencia. Mueve la preparación que falta dentro de B para que cree los datos que necesita.

## Causa 5: valores que todavía están cargando

Una página puede mostrar un valor temporal antes del resultado real. Leerlo una sola vez puede dar resultados distintos según la velocidad de carga:

```ts
await page.goto("/dashboard")

const text = await page.getByTestId("stat-products").textContent()
```

`textContent` espera hasta que el elemento exista y luego lee el texto una sola vez. En el dashboard, el elemento aparece junto con el número. En una página que muestre `0` primero, la misma línea puede leer ese valor temporal.

El test real del dashboard espera texto numérico. Allí el elemento solo aparece cuando llegan las estadísticas:

```ts
await expect(page.getByTestId("stat-products")).toHaveText(/^\d+$/)
```

El patrón también acepta un `0` temporal. Si la página muestra ese valor antes de cargar, espera el número esperado o una señal de que terminó la carga.

Lo mismo aplica a `locator.count()`: lee el número de elementos una sola vez. Usa `toHaveCount` para que Playwright repita la comprobación mientras la lista cambia.

## Causa 6: un selector que coincide con más de un elemento

Si un locator coincide con varios elementos y haces clic en él, Playwright falla con un error de **violación del modo estricto** (*strict mode violation*).

La primera página de productos muestra 10 filas. `page.getByTestId(/^products-row-/)` coincide con todas: sirve para `toHaveCount(10)`, pero un clic necesita una sola coincidencia.

Usa el id de la fila con `products.row(product.id)` o un nombre único con `rowByName`. Reserva `.first()` para tests donde el orden sea parte de lo que compruebas.

La lista está ordenada de lo más nuevo a lo más viejo. Si usas `.first()` para elegir un producto cualquiera, otro test puede crear una fila y cambiar cuál seleccionas.

## Cómo investigar

1. Repite las ejecuciones para reunir evidencia:

```bash
pnpm shop:e2e products/products.spec.ts --repeat-each 5
```

`--repeat-each 5` ejecuta cada test cinco veces. Si el mismo test pasa y falla sin cambios en el código ni en las condiciones previstas, hay evidencia de inestabilidad. Si siempre falla, investiga un fallo constante.

2. Ejecuta el test solo. Si pasa solo pero falla en el grupo, revisa qué datos cambian los otros tests.
3. Lee el trace del fallo. La configuración usa `trace: "retain-on-failure"`. Abre el reporte HTML:

```bash
pnpm --filter practice-shop exec playwright show-report
```

Haz clic en el test que falló y abre su trace. Busca el primer paso que difiere de lo esperado; revisa el DOM y la red en ese momento.

4. Formula una hipótesis concreta, por ejemplo: "El test lee el número antes de que llegue". Quita pasos hasta tener el caso más corto que todavía falla.
5. Cambia una sola cosa que permita comprobar la hipótesis y vuelve a ejecutar el test. Si cambias varias cosas juntas, no sabes cuál resolvió el fallo.

![La investigación conecta el trace, la hipótesis y la comprobación del cambio.](/images/04-flaky-investigation.es.svg)

## Los reintentos esconden la inestabilidad

El runner puede ejecutar de nuevo un test que falló. La configuración de la tienda permite dos reintentos en CI y ninguno en local:

```ts
// Retry only on CI, so a flaky test is never hidden on your machine.
retries: process.env.CI ? 2 : 0,
```

Si un intento posterior pasa, el build puede salir verde aunque la causa siga ahí. Playwright reporta ese test como "flaky". Investiga ese resultado igual que un fallo.

## Profundiza

### Un timeout más largo no corrige una condición equivocada

Mira esta comprobación:

```ts
await expect(products.count).toHaveText("24 products")
```

Si otros tests agregan productos, el texto pasa a `25 products` y la aserción nunca será verdadera. Esperar 60 segundos solo retrasa el fallo. Antes de subir el timeout, comprueba si el valor esperado corresponde a los datos actuales.

### Cuarentena con responsable y fecha

Si el equipo necesita apartar temporalmente un test inestable, puede usar `test.fixme`:

```ts
test.fixme("the status filter shows only archived products", async ({ page }) => {
  // TODO: flaky on CI, see ticket. Fix the cause, then change this to test(...).
})
```

Playwright salta el test y lo lista en el reporte. Anota un responsable y una fecha cercana para arreglarlo. Mientras esté en cuarentena, ese test no comprueba el comportamiento de la aplicación.

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

3. Registra cuántas ejecuciones pasan y fallan. El servidor espera 1.2 segundos al atender la petición; eso no fija su orden respecto al evento de carga que espera `goto`. La pausa del test empieza después de `goto`, así que debes observar si los datos ya llegaron al comprobar el conteo.
4. Reemplaza solo la última línea (la línea `expect(...)`) por esta aserción web-first:

```ts
await expect(page.getByTestId("dashboard-stats")).toBeVisible()
```

5. Ejecútalo otras diez veces. Debe pasar todas las veces, aunque todavía tiene la espera fija. Después quita la línea `waitForTimeout` y ejecuta de nuevo para comprobar el resultado sin esa pausa.
6. Ejecuta el spec completo de productos cinco veces con `--repeat-each 5`.

## Reto

Crea `apps/practice-shop/e2e/challenges/retry-demo.spec.ts` con un test que falle en su primer intento y pase en el segundo. Ejecútalo con reintentos y sin ellos, y revisa el reporte.

Está terminado cuando:

- El test abre `/dashboard` y decide si falla según el número de intento. No usa `waitForTimeout` ni valores aleatorios.
- `pnpm shop:e2e challenges/retry-demo.spec.ts` termina en rojo sin reintentos locales.
- El mismo comando con 2 reintentos termina en verde y el resumen dice `1 flaky`.
- Un comentario de dos frases al inicio del archivo indica qué pierde el equipo si nadie revisa los resultados "flaky".

Busca: `playwright testInfo.retry`, `playwright test --retries command line`, `playwright test.info`.

## Piénsalo bien

1. Una suite tiene 200 tests. Cada uno falla por azar 1 vez de cada 200, con resultados independientes. ¿Aproximadamente qué porcentaje de las ejecuciones tiene al menos un test en rojo?

<details><summary>Respuesta</summary>

Alrededor de 63 por ciento. La probabilidad de que todos pasen es 0.995 multiplicado por sí mismo 200 veces, cerca de 0.37. La probabilidad de al menos un fallo es el resto, cerca de 0.63.

</details>

2. Este test es inestable. Encuentra dos causas.

```ts
test("searching by name shows one product", async ({ page, request }) => {
  const product = await createProduct(request, { name: uniqueName("Searchable") })
  await page.goto("/products")
  await page.getByTestId("products-search").fill(product.name)

  expect(await page.getByTestId(/^products-row-/).count()).toBe(1)
})
```

<details><summary>Respuesta</summary>

El test escribe antes de tener una señal de que React está listo; espera primero a que `products.row(product.id)` sea visible. Además, `count()` lee una sola vez y el `expect` simple compara ese número sin reintentar. Usa `await expect(products.rows).toHaveCount(1)` para esperar a que se aplique el filtro.

</details>

3. El endpoint de estadísticas tarda 3 segundos en vez de 1.2. ¿Qué falla: una espera fija de `waitForTimeout(1200)` antes de comprobar las estadísticas o una aserción `toBeVisible()`? ¿Qué cambia si tarda 6 segundos?

<details><summary>Respuesta</summary>

La espera fija falla si las estadísticas aún no llegaron cuando termina la pausa. `toBeVisible()` espera hasta 5 segundos desde que se llama, no desde que empezó la petición. Un endpoint de 3 o 6 segundos solo causa timeout si la espera restante supera ese límite. Si esa espera es aceptable, aumenta el `timeout` de la aserción.

</details>

## Siguiente paso

En la próxima lección usas una lista de verificación para revisar tu propio spec antes de pedirle a otra persona que lo lea.
