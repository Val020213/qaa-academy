---
title: Tests inestables (flaky)
summary: Reconoce los tests inestables, corrige sus causas comunes e investiga con ejecuciones repetidas y el trace.
duration: 50 min
---

## Objetivo

- Definir qué es un test *flaky* (inestable).
- Nombrar las causas comunes y la solución de cada una.
- Investigar con `--repeat-each` y el *trace*.
- Explicar por qué los reintentos esconden la inestabilidad.

## Qué es flaky

Un test **flaky** pasa y falla sin ningún cambio en el código. Lo ejecutas dos veces y obtienes dos resultados.

Los tests flaky hacen daño. El equipo deja de confiar en un resultado rojo. Un test flaky siempre tiene una causa. Encuéntrala.

## Causa 1: esperas fijas

Una espera fija detiene el test durante un tiempo establecido:

```ts
await page.waitForTimeout(2000)
```

Un día lento, la página puede necesitar tres segundos. Entonces el test falla. O necesita un segundo, y el test pierde tiempo. El equipo nunca usa `waitForTimeout`.

**Solución:** espera lo que necesitas. Una aserción web-first espera hasta que la condición sea verdadera. Mira `e2e/dashboard.spec.ts`:

```ts
// The numbers come from a slow endpoint (about 1 second).
// We never sleep: the assertions wait for us.
await expect(page.getByTestId("dashboard-stats")).toBeVisible()
```

## Causa 2: escribir antes de que la página esté lista

La tienda dibuja primero la página en el servidor. Luego React arranca en el navegador. Este arranque se llama **hidratación** (*hydration*). El texto escrito antes de la hidratación puede borrarse.

La solución está en `e2e/global.setup.ts`. Usa el patrón `toPass`:

```ts
await expect(async () => {
  await page.getByTestId("login-email").fill(ADMIN.email)
  await page.getByTestId("login-password").fill(ADMIN.password)
  await expect(page.getByTestId("login-email")).toHaveValue(ADMIN.email)
  await expect(page.getByTestId("login-password")).toHaveValue(ADMIN.password)
}).toPass()
```

`toPass` ejecuta el bloque una y otra vez hasta que todas las líneas pasan. El bloque escribe y luego comprueba que el valor quedó. Si React lo borró, el bloque lo intenta de nuevo.

**Solución:** usa `toPass` solo para este caso. En los demás tests, el equipo espera algo visible. Por ejemplo, `products.spec.ts` espera una fila de producto antes de escribir en el cuadro de búsqueda.

## Causa 3: datos compartidos

Dos tests cambian el mismo registro. Uno pasa solo cuando el otro no se ejecutó antes.

**Solución:** cada test crea sus propios datos con `createProduct`, `uniqueName` y `uniqueSku`. La lección 2 lo explica.

## Causa 4: dependencia del orden

El test B usa un producto que creó el test A. En el orden habitual pasa. Ejecútalo solo, o después de otro test distinto, y falla.

**Solución:** ejecuta el test solo. Si falla, mueve la preparación que falta dentro del test.

## Causa 5: valores que aún se están cargando

Una página puede mostrar un marcador de posición y luego el valor real. Una comprobación que lee el valor demasiado pronto ve el marcador.

Aquí el número se lee una sola vez, sin esperar:

```ts
const text = await page.getByTestId("stat-products").textContent()
```

`textContent` devuelve lo que hay ahora. Puede estar vacío o ser un texto de carga.

**Solución:** usa una aserción que espera, como hace el test real del dashboard:

```ts
await expect(page.getByTestId("stat-products")).toHaveText(/^\d+$/)
```

Lo mismo se aplica a `locator.count()`. Lee una sola vez. Usa `toHaveCount` en su lugar.

## Causa 6: un selector que coincide con más de un elemento

Playwright es estricto. Si un locator coincide con muchos elementos y haces clic en él, el test falla con un error sobre una **strict mode violation** (violación del modo estricto).

La tabla de productos tiene 10 filas. `page.getByTestId(/^products-row-/)` coincide con todas. Eso es correcto para `toHaveCount(10)`. Es incorrecto para un clic.

**Solución:** sé específico. Usa el id de la fila, como `products.row(product.id)`. O reduce la lista con un nombre único, como hace `rowByName`. No escondas el problema con `.first()`, a menos que el orden sea lo que pruebas.

## Cómo investigar

1. **Repite el test.** Ejecuta un test muchas veces:

```bash
pnpm shop:e2e products/products.spec.ts --repeat-each 5
```

`--repeat-each 5` ejecuta cada test cinco veces. Si una ejecución falla, el test es flaky.

2. **Ejecútalo solo.** Si pasa solo pero falla en el grupo, busca datos compartidos.
3. **Lee el trace.** La configuración guarda un trace de los tests fallidos (`trace: "retain-on-failure"`). Un trace es una grabación del test: cada paso, la página y la red. Abre el reporte HTML:

```bash
pnpm --filter practice-shop exec playwright show-report
```

Haz clic en el test fallido y luego abre su trace. Encuentra el primer paso que difiere de lo que esperabas.

## Los reintentos esconden la inestabilidad

Un **reintento** (*retry*) ejecuta de nuevo un test fallido. La configuración dice:

```ts
// Retry only on CI, so a flaky test is never hidden on your machine.
retries: process.env.CI ? 2 : 0,
```

Un reintento pone el build en verde. No corrige la causa. Un test flaky que pasa en el segundo intento sigue siendo flaky. Playwright lo reporta como "flaky" en la salida. Trata esa palabra como un bug que hay que corregir.

## Profundiza

### Por qué los tests flaky son una carrera

Un test de navegador son dos programas que se ejecutan al mismo tiempo: tu test y la aplicación. Cada uno tiene su propia velocidad. Un test pasa cuando la aplicación está lista antes de que el test mire. Falla cuando el test mira primero. Esto es una **carrera** (*race*). El resultado cambia de una ejecución a otra.

Los números son peores de lo que parece. Digamos que cada test falla por azar 1 vez de cada 100. Este código muestra qué le hace eso a una suite:

```ts
const chance = 0.01
for (const tests of [10, 50, 100, 200]) {
  console.log(tests, ((1 - (1 - chance) ** tests) * 100).toFixed(1) + "%")
}
```

Imprime `10 9.6%`, `50 39.5%`, `100 63.4%` y `200 86.6%`. Con 100 tests que son 99 por ciento estables cada uno, la suite falla unas 63 veces de cada 100 ejecuciones. Una pequeña inestabilidad se acumula rápido.

### Una idea equivocada común: un timeout más largo lo arregla

Cuando un test es flaky, un principiante sube el timeout. A veces ayuda. Pero una espera más larga no puede arreglar una condición equivocada. Mira esta comprobación:

```ts
await expect(products.count).toHaveText("24 products")
```

Otros tests agregan productos, así que el texto pasa a ser `25 products`. La aserción nunca será verdadera. Esperar 60 segundos solo hace el fallo más lento. Averigua por qué falla el test antes de cambiar un número.

### Cómo aparece en el trabajo de QA: cuarentena y luego corregir

A veces no puedes corregir un test flaky hoy. No lo borres, y no dejes que ponga el build en rojo para todos. Márcalo y anota quién lo va a corregir:

```ts
test.fixme("the status filter shows only archived products", async ({ page }) => {
  // TODO: flaky on CI, see ticket. Fix the cause, then change this to test(...).
})
```

`test.fixme` le dice a Playwright que omita el test. El reporte lo lista, así que el equipo lo ve. Una cuarentena debe tener una fecha de fin cercana. Un test que se queda en cuarentena durante meses es un hueco escondido en tu cobertura.

### DRY aquí, y un límite honesto

El bloque `toPass` que escribe el formulario de login aparece dos veces: en `global.setup.ts` y en `fillLoginForm` dentro de `auth.spec.ts`. El comentario de `auth.spec.ts` dice que es "la misma idea". Es conocimiento repetido. El equipo vive con dos copias, porque solo hay dos, y el archivo de preparación es un tipo de archivo distinto. La lección 10 explica la regla de tres.

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

3. Cuenta cuántas ejecuciones fallan. Los números llegan después de unos 1,2 segundos, y ese tiempo empieza solo cuando la página ya cargó. El test espera 1,2 segundos desde la carga de la página, así que casi siempre mira demasiado pronto. Espera que fallen la mayoría de las ejecuciones o todas. El número exacto depende de tu máquina.
4. Reemplaza la última línea (la línea `expect(...)`) con una aserción web-first:

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

Un reintento solo ejecuta el test otra vez hasta que pasa. La causa sigue ahí, y el test todavía falla de vez en cuando.

</details>

5. Una suite tiene 50 tests. Cada uno falla por azar 2 veces de cada 100, sin ninguna razón en el código. ¿Qué tan probable es que al menos un test falle en una ejecución? ¿Cerca de 6 por ciento, 36 por ciento o 64 por ciento?

<details><summary>Respuesta</summary>

Cerca de 64 por ciento. La probabilidad de que un test pase es 0,98. La probabilidad de que pasen los 50 es 0,98 multiplicado por sí mismo 50 veces, que es cerca de 0,36. Entonces la probabilidad de que falle al menos uno es cerca de 0,64. Una tasa pequeña de inestabilidad en cada test hace que toda la suite falle en la mayoría de las ejecuciones.

</details>

6. ¿Qué versión de esta comprobación es mejor, y por qué?

```ts
// Version A
await page.waitForTimeout(10_000)
await expect(page.getByTestId("dashboard-stats")).toBeVisible()

// Version B
await expect(page.getByTestId("dashboard-stats")).toBeVisible({ timeout: 10_000 })
```

<details><summary>Respuesta</summary>

La versión B. El número en `timeout` es solo un límite. La aserción termina en cuanto el elemento es visible, lo que en la tienda tarda unos 1,2 segundos. La versión A siempre espera los 10 segundos completos, y el test es lento todas las veces. Además, las dos versiones esperan un tiempo total distinto. La versión A espera 10 segundos y luego recibe otros 5 segundos del timeout por defecto de `expect`, así que todavía puede pasar si la página necesita 11 segundos. La versión B se detiene a los 10 segundos. Aun así B es la mejor opción, porque no agrega una demora fija.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué comprobaciones hace Playwright antes de hacer clic en un elemento?**
   - Busca: `playwright auto-waiting actionability checks`
   - Una buena respuesta explica: la lista de comprobaciones, como visible, estable y habilitado, y por qué reducen los tests flaky.

2. **¿Cuáles son las causas más comunes de tests flaky en proyectos grandes?**
   - Busca: `flaky tests causes async wait order dependency`
   - Una buena respuesta explica: al menos tres causas y cuáles de ellas coinciden con las seis causas de esta lección.

3. **¿Cómo ponen los equipos en cuarentena los tests flaky sin olvidarlos?**
   - Busca: `quarantine flaky tests CI policy`
   - Una buena respuesta explica: cómo se da seguimiento a un test en cuarentena, quién es responsable y cuándo debe corregirse o eliminarse.

## Siguiente paso

En la próxima lección aprendes una lista de comprobación para revisar tu propio spec antes de pedirle a alguien que lo lea.
