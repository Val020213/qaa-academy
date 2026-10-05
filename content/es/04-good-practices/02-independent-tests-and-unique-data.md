---
title: Tests independientes y datos únicos
summary: Escribe tests que pasan solos, en cualquier orden y dos veces seguidas, usando helpers de datos únicos.
duration: 45 min
---

## Objetivo

- Enunciar las tres reglas de un test independiente.
- Explicar por qué la suite de la tienda se ejecuta con un solo *worker* (proceso de ejecución).
- Usar `uniqueName` y `uniqueSku` para crear tus propios datos.
- Explicar por qué la preparación reinicia los datos una sola vez.

## Tres reglas

Un buen test es **independiente**. Sigue tres reglas.

1. Pasa cuando lo ejecutas **solo**.
2. Pasa en **cualquier orden** con los demás tests.
3. Pasa **dos veces seguidas**, sin reiniciar nada.

Un test que rompe una de estas reglas es peligroso. Puede pasar hoy y fallar mañana, y nadie sabe por qué.

## Datos compartidos en la tienda

La tienda de práctica no tiene base de datos. Guarda sus datos en la memoria del servidor. Todos los tests usan la misma memoria.

Piensa en un cuaderno compartido. Si un test escribe en él, el siguiente test puede leerlo. Este es el origen de la mayoría de los problemas.

Mira el comentario al inicio de `apps/practice-shop/playwright.config.ts`:

```ts
// The app keeps its data in memory and every test shares it,
// so tests run one at a time, in one worker.
fullyParallel: false,
workers: 1,
```

Un **worker** es un proceso que ejecuta tests. Con `workers: 1`, solo se ejecuta un test a la vez. Con `fullyParallel: false`, los tests de un mismo archivo también se ejecutan uno tras otro.

La razón es simple. Si dos tests se ejecutaran al mismo tiempo, uno podría borrar un producto mientras el otro lo lee.

> **Nota:** Ejecutar tests en paralelo es más rápido. Necesita datos que los tests no compartan. Esta tienda no los tiene, así que elige la seguridad.

## Reinicia una vez, en la preparación

Al inicio de cada ejecución, los datos deben estar en un estado conocido. El test de preparación (*setup*) de `apps/practice-shop/e2e/global.setup.ts` lo hace así:

```ts
const reset = await request.post("/api/test/reset")
expect(reset.ok()).toBeTruthy()
```

El reinicio devuelve los datos a los datos semilla (*seed*): 24 productos y 12 pedidos.

El reinicio ocurre **una vez por ejecución**, no antes de cada test. Un reinicio antes de cada test sería lento. También ocultaría errores: un test que depende de otro test seguiría pasando.

## Crea tus propios datos

Cada test crea lo que necesita. No usa un producto que creó otro test.

El archivo `apps/practice-shop/e2e/lib/helpers.ts` tiene dos *helpers* (funciones de ayuda). El primero crea un nombre único:

```ts
/** A name that no other test uses, e.g. "Mouse 3fa9c1d2". */
export function uniqueName(prefix: string): string {
  return `${prefix} ${crypto.randomUUID().slice(0, 8)}`
}
```

El segundo crea un SKU. Un **SKU** es un código que identifica un producto, como `SKU-4821`.

```ts
/** A valid SKU like "SKU-4821" that is not used by the seed data. */
export function uniqueSku(): string {
  const value = nextSku
  nextSku = value >= LAST ? FIRST : value + 1
  return `SKU-${value}`
}
```

Los datos semilla usan de `SKU-0001` a `SKU-0024`. El helper empieza en un número aleatorio desde 1000 y va sumando. Dos tests nunca reciben el mismo SKU.

Este es un test que los usa, de `e2e/products/products.spec.ts`:

```ts
const name = uniqueName("Created")
// ...
await page.getByTestId("product-name").fill(name)
await page.getByTestId("product-sku").fill(uniqueSku())
```

El nombre es único, así que el test puede encontrar su propio producto. No importa cuántos productos hayan creado otros tests.

## Nunca dependas de otro test

Mira el spec de pedidos, `e2e/orders/orders.spec.ts`. El estado de un pedido solo avanza. Cuando un pedido está "paid" (pagado), no puedes volver a ponerlo en "pending" (pendiente).

Por eso cada test usa su propio pedido semilla. Un test usa el pedido 1003. El otro usa el 1005. Si ambos usaran el 1005, el segundo test fallaría.

Mira también cómo el primer test de `products.spec.ts` maneja un total que cambia:

```ts
// Other tests add products, so we ask the API for the real total.
const total = ((await (await request.get("/api/products")).json()) as { total: number }).total
```

El test no escribe `24 products`. Otros tests agregan productos, así que primero lee el total real.

## Profundiza

### Por qué los datos compartidos rompen un test que parece correcto

Una variable fuera de una función vive mientras el programa se ejecuta. Todas las funciones pueden cambiarla. Los datos de test compartidos funcionan igual. Este programa pequeño muestra el problema:

```ts
const products: string[] = ["Mouse"]

function testA() {
  products.push("Keyboard")
  return products.length === 2
}
function testB() {
  return products.length === 2
}

console.log("A then B:", testA(), testB())
products.length = 1
console.log("B alone:", testB())
```

Imprime `A then B: true true`, y luego `B alone: false`. La línea `products.length = 1` devuelve la lista a su inicio, como lo haría una ejecución nueva. El test B nunca agrega nada. Solo pasa porque el test A se ejecutó primero y cambió la lista.

Esto es dependencia del orden. El código del test B no está mal. Sus datos no son suyos.

### Una idea equivocada común: único significa aleatorio

`uniqueName` usa caracteres aleatorios. Por eso puedes pensar que aleatorio siempre es el camino. Pero mira `uniqueSku`. No elige números al azar. Cuenta hacia arriba.

La razón es el tamaño del espacio. Un nombre tiene ocho caracteres con 16 opciones cada uno. Son 4.294.967.296 valores posibles. Un choque entre 1.000 nombres es muy improbable, de aproximadamente 1 en 8.600. Un SKU tiene solo cuatro dígitos. El formato permite 10.000 valores, y el helper usa 9.000 de ellos, de `SKU-1000` a `SKU-9999`. Si eligieras 100 SKU al azar, la probabilidad de que al menos dos sean iguales es de cerca del 42 por ciento. Contar hacia arriba da 9.000 SKU distintos antes de que el contador dé la vuelta y repita el primero. Es mucho más de lo que necesita una ejecución. No es una garantía entre workers ni entre ejecuciones.

```ts
let next = 9998
function sku() {
  const value = next
  next = value >= 9999 ? 1000 : value + 1
  return `SKU-${value}`
}
console.log(sku(), sku(), sku())
```

Esto imprime `SKU-9998 SKU-9999 SKU-1000`. Cuando el contador llega al final, vuelve a 1000, así que el SKU sigue siendo válido.

### Cómo aparece en el trabajo de QA

Las ejecuciones en paralelo son el siguiente problema. Si un equipo quiere que los tests corran al mismo tiempo, cada worker necesita datos que no comparta. Los tests que ya crean sus propios datos únicos están listos para este paso. Los tests que dependen de registros compartidos deben reescribirse primero.

Fíjate también en una idea de DRY. El conocimiento de "cómo esta suite crea datos únicos" vive solo en `helpers.ts`. Ningún spec inventa su propia forma de crear un nombre.

## Práctica

1. Abre `apps/practice-shop/e2e/lib/helpers.ts`. Encuentra las líneas que eligen el primer número de SKU.
2. Abre `apps/practice-shop/e2e/orders/orders.spec.ts`. Encuentra el comentario que dice qué pedido usa cada test.
3. Inicia la tienda con `pnpm shop:dev` en una terminal.
4. En una segunda terminal, ejecuta un solo archivo de spec:

```bash
pnpm shop:e2e products/products.spec.ts
```

5. Ejecuta el mismo archivo otra vez, sin reiniciar:

```bash
pnpm shop:e2e products/products.spec.ts
```

6. Las dos ejecuciones deben pasar. Esto demuestra la regla 3: dos veces seguidas.
7. Ejecuta un solo test por una palabra de su nombre. `-g` significa "grep": ejecuta solo los tests cuyo nombre contiene la palabra.

```bash
pnpm shop:e2e -g cancelling
```

8. Esto demuestra la regla 1: pasa solo.

## Comprueba lo que sabes

1. ¿Cuáles son las tres reglas de un test independiente?

<details><summary>Respuesta</summary>

Pasa solo, en cualquier orden y dos veces seguidas.

</details>

2. ¿Por qué la configuración de la tienda usa `workers: 1`?

<details><summary>Respuesta</summary>

La tienda guarda sus datos en memoria y todos los tests los comparten. Dos tests al mismo tiempo podrían cambiar los mismos datos.

</details>

3. ¿Qué devuelve `uniqueName("Created")`?

<details><summary>Respuesta</summary>

El prefijo, un espacio y ocho caracteres aleatorios, como `Created 3fa9c1d2`.

</details>

4. ¿Por qué la preparación reinicia los datos solo una vez por ejecución?

<details><summary>Respuesta</summary>

Cada test debe crear sus propios datos. Un reinicio antes de cada test ocultaría los problemas de datos compartidos.

</details>

5. El contador del ejemplo anterior empieza en 9998. ¿Qué devuelven tres llamadas a `sku()`, y por qué la tercera no es `SKU-10000`?

<details><summary>Respuesta</summary>

Devuelven `SKU-9998`, `SKU-9999` y `SKU-1000`. La regla del SKU exige exactamente cuatro dígitos, y `SKU-10000` tiene cinco, así que el servidor lo rechazaría. El helper vuelve a 1000 cuando llega a 9999. Los datos semilla usan de `SKU-0001` a `SKU-0024`, así que 1000 sigue libre.

</details>

6. Este test pasa en una ejecución nueva. En la segunda ejecución falla. Encuentra el error.

```ts
test("deleting Mouse Pad removes its row", async ({ page }) => {
  const products = new ProductsPage(page)
  await products.goto()

  await products.delete(23)

  await expect(products.row(23)).toHaveCount(0)
})
```

<details><summary>Respuesta</summary>

El producto 23 es un dato semilla, "Mouse Pad". La primera ejecución lo borra. La segunda ejecución no reinicia los datos, así que el producto 23 no existe y no hay botón de borrar para pulsar. El test rompe la regla 3: pasar dos veces seguidas. Debería crear su propio producto con `createProduct` y borrar ese.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Cómo evita Playwright que un test afecte a otro?**
   - Busca: `playwright test isolation browser context`
   - Una buena respuesta explica: qué es un contexto de navegador y qué recibe nuevo cada test.

2. **¿Qué es un UUID y por qué uno aleatorio casi nunca se repite?**
   - Busca: `UUID version 4 collision probability`
   - Una buena respuesta explica: cómo se ve un UUID, cuántos valores existen y por qué un choque no es una preocupación práctica.

3. **¿Cómo mantienen los equipos separados los datos de test cuando muchos tests se ejecutan al mismo tiempo?**
   - Busca: `test data isolation parallel tests`
   - Una buena respuesta explica: al menos dos estrategias, como datos únicos por test o una base de datos separada por worker.

## Siguiente paso

En la próxima lección aprendes la regla de nombres para `data-testid` y por qué el equipo la usa.
