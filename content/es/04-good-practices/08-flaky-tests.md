---
title: Tests inestables (flaky)
summary: Reconoce los tests inestables, encuentra su causa como un científico, arregla las causas comunes y mira por qué los reintentos esconden el problema.
duration: 80 min
---

## Empieza con un acertijo

Tu equipo tiene 100 tests *end-to-end* (de extremo a extremo). Cada test es "99 por ciento estable": en un día normal, falla por puro azar 1 vez de cada 100. El código de los tests está bien y la tienda no tiene ningún bug.

Ejecutas toda la suite una vez. ¿Qué tan probable es que todos los tests salgan verdes?

Elige una opción antes de calcular: cerca de 99 por ciento, cerca de 90 por ciento o cerca de 40 por ciento.

Luego piensa en esto. ¿Qué significa un build rojo para el equipo después de un mes así?

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Predecir cómo se suman los fallos pequeños y aleatorios en una suite completa.
- Nombrar seis causas comunes de tests inestables y la solución de cada una.
- Investigar un test inestable con una hipótesis y un experimento pequeño a la vez.
- Explicar por qué los reintentos y los tiempos de espera más largos esconden un problema y no lo resuelven.

## Qué es un test inestable

Un test **flaky** (inestable) pasa y falla sin ningún cambio en el código. Lo ejecutas dos veces y obtienes dos resultados.

Los tests inestables hacen daño. El equipo deja de confiar en un resultado rojo. Un test inestable siempre tiene una causa. Encuéntrala.

### De vuelta al acertijo

La probabilidad de que un test salga verde es 0.99. Los 100 deben salir verdes, así que multiplicas 0.99 por sí mismo 100 veces. El resultado es cerca de 0.37. La suite sale verde en unas 37 ejecuciones de cada 100. La mejor respuesta era "cerca de 40 por ciento", y la mayoría de la gente adivina demasiado alto.

Después de un mes, un build rojo significa "ejecútalo otra vez". Ese es el costo real. Cuando la gente deja de creer en el rojo, un bug real puede esconderse en el ruido. La inestabilidad no empeora la suite un poco. Hace que el resultado no valga nada.

## Depura como un científico

Antes de las causas, aprende el método. Funciona para cualquier test inestable.

1. **Mira los hechos.** ¿Cuándo falla? ¿Siempre o a veces? ¿Solo o en el grupo?
2. **Haz una hipótesis.** "Creo que el test lee el número antes de que llegue."
3. **Haz un experimento pequeño** que pueda demostrar que la hipótesis es falsa. Cambia **una sola cosa**.
4. **Reduce el caso que falla.** Borra pasos hasta que quede el test más corto que todavía falla. La causa está en lo que queda.

Si cambias tres cosas y el test pasa, no sabes cuál ayudó. Un cambio, una ejecución.

Ten este método en mente mientras lees las seis causas.

## Causa 1: esperas fijas

Una espera fija detiene el test por un tiempo definido:

```ts
await page.waitForTimeout(2000)
```

La página puede necesitar tres segundos en un día lento. Entonces el test falla. O necesita un segundo, y el test pierde tiempo. El equipo nunca usa `waitForTimeout`.

**Solución:** espera lo que necesitas. Una aserción *web-first* (que espera sola) espera hasta que la condición sea verdadera. Mira `e2e/dashboard.spec.ts`:

```ts
// The numbers come from a slow endpoint (about 1.2 seconds).
// We never sleep: the assertions wait for us.
// ...
await expect(page.getByTestId("dashboard-stats")).toBeVisible()
```

## Causa 2: escribir antes de que la página esté lista

La tienda dibuja la página primero en el servidor. Después React arranca en el navegador. Este arranque se llama **hidratación** (*hydration*). El texto escrito antes de la hidratación puede borrarse.

La solución está en `e2e/global.setup.ts`. Usa el patrón `toPass`:

```ts
await expect(async () => {
  await page.getByTestId("login-email").fill(ADMIN.email)
  await page.getByTestId("login-password").fill(ADMIN.password)
  await expect(page.getByTestId("login-email")).toHaveValue(ADMIN.email)
  await expect(page.getByTestId("login-password")).toHaveValue(ADMIN.password)
}).toPass()
```

`toPass` ejecuta el bloque una y otra vez hasta que cada línea pase. El bloque escribe, y luego comprueba que el valor se quedó. Si React lo borró, el bloque lo intenta de nuevo.

**Solución:** usa `toPass` solo para este caso. En otros tests, el equipo espera algo visible. Por ejemplo, `products.spec.ts` espera una fila de producto antes de escribir en el cuadro de búsqueda.

Fíjate en lo que hace difícil esta causa: el fallo depende de la velocidad. En tu computadora rápida, React está listo antes de que el test escriba. En una máquina lenta de CI, no.

## Causa 3: datos compartidos

Dos tests cambian el mismo registro. Uno pasa solo cuando el otro no corrió antes.

**Solución:** cada test crea sus propios datos con `createProduct`, `uniqueName` y `uniqueSku`. La lección "Tests independientes y datos únicos" lo explica.

## Causa 4: dependencia del orden

El test B usa un producto que creó el test A. En el orden normal pasa. Si lo ejecutas solo, o después de otro test, falla.

**Solución:** ejecuta el test solo. Si falla, mueve la preparación que falta dentro del test.

## Causa 5: valores que todavía están cargando

Una página puede mostrar un valor temporal y después el valor real. Una comprobación que lee el valor demasiado pronto ve el valor temporal.

Aquí hay un test. ¿Qué esperas?

```ts
await page.goto("/dashboard")

const text = await page.getByTestId("stat-products").textContent()
```

`textContent` espera hasta que el elemento exista, y luego lee el texto una sola vez. En el dashboard real el elemento aparece junto con el número, así que esta línea funciona por casualidad. Ahora imagina una página que muestra `0` primero y el número real un segundo después. La misma línea lee `0`, y el test pasa o falla según la velocidad. Leer una sola vez es el riesgo, y una página puede cambiar en cualquier momento para volverlo real.

**Solución:** usa una aserción que espere el valor final, como hace el test real del dashboard:

```ts
await expect(page.getByTestId("stat-products")).toHaveText(/^\d+$/)
```

Lo mismo aplica a `locator.count()`. Lee una sola vez. Usa `toHaveCount` en su lugar.

## Causa 6: un selector que coincide con más de un elemento

Playwright es estricto. Si un locator coincide con muchos elementos y haces clic en él, el test falla con un error de **violación del modo estricto** (*strict mode violation*).

La tabla de productos muestra 10 filas en la primera página. `page.getByTestId(/^products-row-/)` coincide con todas. Eso es correcto para `toHaveCount(10)`. Es incorrecto para un clic.

**Solución:** sé específico. Usa el id de la fila, como `products.row(product.id)`. O reduce la lista con un nombre único, como hace `rowByName`. No escondas el problema con `.first()`, a menos que el orden sea lo que pruebas.

¿Por qué esta es una causa de inestabilidad y no solo un error común? Por `.first()`. La lista está ordenada de lo más nuevo a lo más viejo, así que "la primera fila" es lo que haya creado el último test. Un test que hace clic en `.first()` pasa o falla según qué test corrió antes.

## Cómo investigar

Usa el método científico de arriba.

1. **Repite el test.** Ejecuta un test muchas veces:

```bash
pnpm shop:e2e products/products.spec.ts --repeat-each 5
```

`--repeat-each 5` ejecuta cada test cinco veces. Si una ejecución falla, el test es inestable.

2. **Ejecútalo solo.** Si pasa solo pero falla en el grupo, busca datos compartidos.
3. **Redúcelo.** Quita pasos uno por uno. Quédate con la versión más corta que todavía falla.
4. **Lee el trace.** La configuración guarda un *trace* (grabación del test) para los tests que fallan (`trace: "retain-on-failure"`). Un trace es una grabación del test: cada paso, la página y la red. Abre el reporte HTML:

```bash
pnpm --filter practice-shop exec playwright show-report
```

Haz clic en el test que falló y luego abre su trace. Encuentra el primer paso que difiere de lo que esperabas.

## Los reintentos esconden la inestabilidad

Un **reintento** (*retry*) ejecuta de nuevo un test que falló. La configuración dice:

```ts
// Retry only on CI, so a flaky test is never hidden on your machine.
retries: process.env.CI ? 2 : 0,
```

Un reintento pone el build en verde. No arregla la causa. Un test inestable que pasa en el segundo intento sigue siendo inestable. Playwright lo reporta como "flaky" en la salida. Trata esa palabra como un bug por arreglar.

## Profundiza

### Por qué los tests inestables son una carrera

Un test de navegador son dos programas que corren al mismo tiempo: tu test y la aplicación. Cada uno tiene su propia velocidad. Un test pasa cuando la aplicación está lista antes de que el test mire. Falla cuando el test mira primero. Esto es una **carrera** (*race*). El resultado cambia de una ejecución a otra.

Los números son peores de lo que se siente. Este código muestra qué le hace a una suite un fallo de 1 por ciento:

```ts
const chance = 0.01
for (const tests of [10, 50, 100, 200]) {
  console.log(tests, ((1 - (1 - chance) ** tests) * 100).toFixed(1) + "%")
}
```

Imprime `10 9.6%`, `50 39.5%`, `100 63.4%` y `200 86.6%`. Con 100 tests que son cada uno 99 por ciento estables, la suite falla unas 63 veces de cada 100 ejecuciones. La inestabilidad pequeña se acumula rápido.

### Una idea equivocada común: un tiempo de espera más largo lo arregla

Cuando un test es inestable, un principiante sube el timeout. A veces ayuda. Pero una espera más larga no puede arreglar una condición equivocada. Mira esta comprobación:

```ts
await expect(products.count).toHaveText("24 products")
```

Otros tests agregan productos, así que el texto pasa a `25 products`. La aserción nunca será verdadera. Esperar 60 segundos solo hace el fallo más lento. Descubre por qué falla el test antes de cambiar un número.

### Cómo aparece en el trabajo de QA: cuarentena, luego arreglo

A veces no puedes arreglar un test inestable hoy. No lo borres, y no dejes que ponga el build en rojo para todos. Márcalo y anota quién lo va a arreglar:

```ts
test.fixme("the status filter shows only archived products", async ({ page }) => {
  // TODO: flaky on CI, see ticket. Fix the cause, then change this to test(...).
})
```

`test.fixme` le dice a Playwright que salte el test. El reporte lo lista, así que el equipo lo ve. Una cuarentena debe tener una fecha de fin cercana. Un test que se queda en cuarentena por meses es un hueco escondido en tu cobertura.

### DRY aquí, y un límite honesto

El bloque `toPass` que escribe el formulario de login aparece dos veces: en `global.setup.ts` y en `fillLoginForm` en `auth.spec.ts`. El comentario en `auth.spec.ts` dice que es "the same idea". Es conocimiento repetido. El equipo vive con dos copias, porque son solo dos, y el archivo de setup es un tipo distinto de archivo. La lección "DRY en la automatización de tests" explica la regla de tres.

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

2. Escribe tu predicción: de 10 ejecuciones, ¿cuántas van a fallar? Anota el número.
3. Inicia la tienda con `pnpm shop:dev`. En otra terminal ejecútalo diez veces:

```bash
pnpm shop:e2e flaky-practice.spec.ts --repeat-each 10
```

4. Cuenta cuántas ejecuciones fallan. Los números llegan unos 1.2 segundos después de que React inicia la petición, y ese momento es posterior a la carga de la página. El test espera 1.2 segundos desde la carga de la página, así que casi siempre mira demasiado pronto. Espera que fallen la mayoría de las ejecuciones o todas. El número exacto depende de tu máquina. Compáralo con tu predicción.
5. Cambia una sola cosa: reemplaza la última línea (la línea `expect(...)`) por una aserción web-first:

```ts
await expect(page.getByTestId("dashboard-stats")).toBeVisible()
```

6. Ejecútalo otras diez veces. Debe pasar todas las veces, y todavía tiene la espera fija. Ahora cambia la segunda cosa: quita la línea `waitForTimeout` y ejecuta de nuevo. Fíjate en que el test es más rápido y sigue en verde.
7. Ejecuta el spec completo de productos cinco veces con `--repeat-each 5`.

## Reto

Encargo: un líder del equipo dice: "Tenemos reintentos en CI, así que los tests inestables no son un problema". Quieres mostrar al equipo lo que de verdad hacen los reintentos. Construye un test que falla en su primer intento y pasa en el segundo, a propósito, y sin ningún valor aleatorio. Luego ejecútalo con reintentos y sin ellos, y lee lo que dice el reporte.

Crea el archivo `apps/practice-shop/e2e/challenges/retry-demo.spec.ts`.

Está terminado cuando:

- El test abre `/dashboard`. Falla en el intento 1 y pasa en el intento 2, decidido por el número de intento y no por azar. No tiene `waitForTimeout` ni valor aleatorio.
- `pnpm shop:e2e challenges/retry-demo.spec.ts` (sin reintentos en tu máquina) termina en rojo.
- El mismo comando con 2 reintentos termina en verde, y la línea de resumen dice `1 flaky`.
- Al inicio del archivo, un comentario de dos frases responde: ¿qué pierde un equipo cuando CI reintenta 2 veces y nadie lee la palabra "flaky"?

Vas a necesitar algo que esta lección no enseñó: cómo un test puede saber en qué intento está, y cómo definir el número de reintentos desde la línea de comandos. Busca: `playwright testInfo.retry`, `playwright test --retries command line`, `playwright test.info`.

## Piénsalo bien

1. **Predice.** Una suite tiene 200 tests. Cada uno falla por azar 1 vez de cada 200, sin ninguna razón en el código. ¿Aproximadamente qué porcentaje de las ejecuciones tiene al menos un test en rojo? Explica por qué en dos frases.

<details><summary>Respuesta</summary>

Alrededor de 63 por ciento. Un test sale verde con probabilidad 199 de 200, que es 0.995. Los 200 deben salir verdes, así que multiplicas 0.995 por sí mismo 200 veces, que da cerca de 0.37. Entonces cerca de 37 por ciento de las ejecuciones salen completamente verdes y cerca de 63 por ciento tienen un test en rojo. Cada test es muy estable, y aun así la suite está en rojo la mayor parte del tiempo. El tamaño es el enemigo.

</details>

2. **Encuentra el bug.** El código se ejecuta, pero el test es inestable. Nombra dos causas en él.

```ts
test("searching by name shows one product", async ({ page, request }) => {
  const product = await createProduct(request, { name: uniqueName("Searchable") })
  await page.goto("/products")
  await page.getByTestId("products-search").fill(product.name)

  expect(await page.getByTestId(/^products-row-/).count()).toBe(1)
})
```

<details><summary>Respuesta</summary>

Primero, el test escribe en el cuadro de búsqueda sin esperar a que la página esté lista. Si React no está listo, el texto puede borrarse. Esperar primero a que `products.row(product.id)` sea visible lo resuelve. Segundo, `count()` lee el número una sola vez y un `expect` simple no espera. Justo después de escribir, la lista todavía puede mostrar las 10 filas, así que el conteo es 10, no 1. Usa `await expect(products.rows).toHaveCount(1)`, que espera hasta que el filtro se haya aplicado.

</details>

3. **Dos versiones.** Para no escribir demasiado pronto, la versión A envuelve la escritura en `toPass`. La versión B espera una fila de producto visible antes de escribir. Las dos funcionan. ¿Cuál es mejor en un test de productos y qué te haría elegir la otra?

<details><summary>Respuesta</summary>

La versión B es mejor en los tests de productos. Espera algo que el usuario también espera, una lista cargada, y se lee como una historia. La versión A repite acciones hasta que se quedan, y puede esconder un bug real donde el campo pierde texto para un usuario real. Elige la versión A cuando no hay nada visible que esperar, como en la página de login, donde el formulario se ve igual antes y después de que React arranca.

</details>

4. **Qué se rompe si.** Los desarrolladores hacen más lento el endpoint de estadísticas, 3 segundos en vez de 1.2. ¿Cuáles de estos tests se rompen: uno con `waitForTimeout(1200)` antes de una comprobación, uno con `toBeVisible()`, y uno con `toBeVisible()` cuando el endpoint tarda 6 segundos?

<details><summary>Respuesta</summary>

La espera fija se rompe primero. Mira después de 1.2 segundos y no hay nada, y se rompería con cualquier valor demasiado pequeño. El test con `toBeVisible()` sigue funcionando a los 3 segundos, porque el timeout por defecto de `expect` es de 5 segundos y la aserción termina apenas aparecen las estadísticas. A los 6 segundos también falla, porque se alcanza el límite. La solución honesta es darle a esa aserción un `timeout` más largo, y no cambiar la configuración global para todos los tests.

</details>

5. **Explícalo.** Explica a un compañero por qué un build verde después de "el test pasó en el segundo intento" no es una buena noticia. Usa tres frases y no uses la palabra "reintento".

<details><summary>Respuesta</summary>

Una buena respuesta: "El test falló una vez y pasó una vez con el mismo código, así que algo en él depende de la suerte. Ejecutarlo otra vez solo escondió la suerte. Tarde o temprano la suerte será mala en todos los intentos, o la misma causa esconderá un bug real." La idea clave es que un pase después de un fallo es un síntoma. La causa sigue ahí.

</details>

6. **Criterio.** Un test del flujo de pago falla más o menos 1 vez de cada 20. La versión sale el viernes. Puedes borrar el test, marcarlo con `test.fixme` o mantenerlo y dejar que CI lo ejecute otra vez cuando falle. ¿Qué haces?

<details><summary>Respuesta</summary>

No hay una respuesta perfecta. Borrarlo quita el riesgo del ruido y también quita la protección del flujo más importante. Mantenerlo con intentos extra conserva la protección, pero enseña al equipo a ignorar el rojo. Marcarlo con `fixme`, con un responsable y una fecha, es honesto, pero el flujo queda sin protección hasta el arreglo. Depende de cuánto cuesta un bug en el pago, qué tan pronto puedes encontrar la causa y si alguien revisa ese flujo a mano mientras tanto. Un buen punto de partida es mantenerlo corriendo y hacer de encontrar la causa la primera tarea después de la versión.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué comprobaciones hace Playwright antes de hacer clic en un elemento?**
   - Busca: `playwright auto-waiting actionability checks`
   - Pruébalo: en un spec de borrador, abre `/products` e intenta `await page.getByTestId("products-prev-page").click({ timeout: 2000 })`. El botón está deshabilitado en la página 1. Lee el error y las líneas que dicen qué estaba esperando Playwright.
   - Una buena respuesta explica: la lista de comprobaciones, como visible, estable y habilitado, y por qué reducen los tests inestables.

2. **¿Cuáles son las causas más comunes de tests inestables en proyectos grandes?**
   - Busca: `flaky tests causes async wait order dependency`
   - Pruébalo: toma un spec que escribiste en el módulo 3 y ejecútalo con `--repeat-each 10`. Cuenta los fallos. Di qué te dice un resultado de cero fallos y qué no te dice.
   - Una buena respuesta explica: al menos tres causas y cuáles de ellas coinciden con las seis causas de esta lección.

3. **¿Cómo ponen los equipos en cuarentena los tests inestables sin olvidarlos?**
   - Busca: `quarantine flaky tests CI policy`
   - Pruébalo: en tu archivo de práctica, cambia un test a `test.fixme(...)` y ejecuta el archivo. Encuentra cómo lo muestra el reporte. Luego escribe el comentario que dejarías en el código para que la próxima persona sepa quién lo arregla y para cuándo.
   - Una buena respuesta explica: cómo se le da seguimiento a un test en cuarentena, quién es su responsable y cuándo debe arreglarse o eliminarse.

## Siguiente paso

En la próxima lección usas una lista de verificación para revisar tu propio spec antes de pedirle a otra persona que lo lea.
