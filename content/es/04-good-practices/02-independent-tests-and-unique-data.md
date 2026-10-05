---
title: Tests independientes y datos únicos
summary: Escribe tests que pasan solos, en cualquier orden y dos veces seguidas, usando funciones de datos únicos.
duration: 30 min
---

## Objetivo

- Enunciar las tres reglas de un test independiente.
- Explicar por qué la suite de la tienda se ejecuta con un solo worker.
- Usar `uniqueName` y `uniqueSku` para crear tus propios datos.
- Explicar por qué el setup reinicia los datos una sola vez.

## Tres reglas

Un buen *test* es **independiente**. Sigue tres reglas.

1. Pasa cuando lo ejecutas **solo**.
2. Pasa en **cualquier orden** respecto a los demás tests.
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

Un *worker* (trabajador) es un proceso que ejecuta tests. Con `workers: 1`, solo se ejecuta un test a la vez. Con `fullyParallel: false`, los tests de un mismo archivo también se ejecutan uno tras otro.

La razón es simple. Si dos tests se ejecutaran al mismo tiempo, uno podría borrar un producto mientras el otro lo lee.

> **Nota:** Ejecutar tests en paralelo es más rápido. Pero necesita datos que los tests no compartan. Esta tienda no los tiene, así que elige la seguridad.

## Reinicio una sola vez, en el setup

Al inicio de cada ejecución, los datos deben estar en un estado conocido. El test de setup en `apps/practice-shop/e2e/global.setup.ts` lo hace así:

```ts
const reset = await request.post("/api/test/reset")
expect(reset.ok()).toBeTruthy()
```

El reinicio devuelve los datos a los datos semilla: 24 productos y 12 pedidos.

El reinicio ocurre **una vez por ejecución**, no antes de cada test. Reiniciar antes de cada test sería lento. También ocultaría errores: un test que depende de otro test igual pasaría.

## Crea tus propios datos

Cada test crea lo que necesita. No usa un producto que creó otro test.

El archivo `apps/practice-shop/e2e/lib/helpers.ts` tiene dos funciones de ayuda (*helpers*). La primera genera un nombre único:

```ts
/** A name that no other test uses, e.g. "Mouse 3fa9c1d2". */
export function uniqueName(prefix: string): string {
  return `${prefix} ${crypto.randomUUID().slice(0, 8)}`
}
```

La segunda genera un SKU. Un **SKU** es un código que identifica un producto, como `SKU-4821`.

```ts
/** A valid SKU like "SKU-4821" that is not used by the seed data. */
export function uniqueSku(): string {
  const value = nextSku
  nextSku = value >= LAST ? FIRST : value + 1
  return `SKU-${value}`
}
```

Los datos semilla usan `SKU-0001` a `SKU-0024`. La función empieza en un número al azar desde 1000 y va subiendo. Dos tests nunca reciben el mismo SKU.

Este es un test que las usa, de `e2e/products/products.spec.ts`:

```ts
const name = uniqueName("Created")
// ...
await page.getByTestId("product-name").fill(name)
await page.getByTestId("product-sku").fill(uniqueSku())
```

El nombre es único, así que el test puede encontrar su propio producto. No importa cuántos productos hayan creado otros tests.

## Nunca dependas de otro test

Mira el spec de pedidos, `e2e/orders/orders.spec.ts`. El estado de un pedido solo avanza. Cuando un pedido está "paid" (pagado), no puedes volverlo a "pending" (pendiente).

Por eso cada test usa su propio pedido semilla. Un test usa el pedido 1003. El otro usa el 1005. Si ambos usaran el 1005, el segundo test fallaría.

Mira también cómo el primer test de `products.spec.ts` maneja un total que cambia:

```ts
// Other tests add products, so we ask the API for the real total.
const total = ((await (await request.get("/api/products")).json()) as { total: number }).total
```

El test no escribe `24 products`. Otros tests agregan productos, así que primero lee el total real.

## Práctica

1. Abre `apps/practice-shop/e2e/lib/helpers.ts`. Busca las líneas que eligen el primer número de SKU.
2. Abre `apps/practice-shop/e2e/orders/orders.spec.ts`. Busca el comentario que dice qué pedido usa cada test.
3. Inicia la tienda con `pnpm shop:dev` en una terminal.
4. En una segunda terminal, ejecuta un archivo spec solo:

```bash
pnpm shop:e2e products/products.spec.ts
```

5. Ejecuta el mismo archivo otra vez, sin reiniciar:

```bash
pnpm shop:e2e products/products.spec.ts
```

6. Las dos ejecuciones deben pasar. Esto comprueba la regla 3: dos veces seguidas.
7. Ejecuta un solo test con una palabra de su nombre. `-g` significa "grep": ejecuta solo los tests cuyo nombre contiene la palabra.

```bash
pnpm shop:e2e -g cancelling
```

8. Esto comprueba la regla 1: pasa solo.

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

El prefijo, un espacio y ocho caracteres al azar, como `Created 3fa9c1d2`.

</details>

4. ¿Por qué el setup reinicia los datos solo una vez por ejecución?

<details><summary>Respuesta</summary>

Cada test debe crear sus propios datos. Un reinicio antes de cada test ocultaría los problemas de datos compartidos.

</details>

## Siguiente paso

En la siguiente lección aprenderás la regla de nombres de `data-testid` y por qué el equipo la usa.
