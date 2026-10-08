---
title: Tests independientes y datos únicos
duration: 60 min
---

## Objetivo

En esta lección revisas cómo los datos que deja un test afectan a los demás. Usas nombres y SKU propios para que cada test encuentre y modifique sus registros.

- Comprobar que un test pasa solo, en cualquier orden y dos veces seguidas.
- Encontrar dependencias entre tests que comparten datos.
- Usar los helpers de la tienda para crear datos propios.
- Distinguir los límites de los valores aleatorios y de un contador.

## Tres reglas

Un test independiente y repetible cumple estas reglas:

1. Pasa cuando lo ejecutas **solo**.
2. Pasa en **cualquier orden** con los demás tests.
3. Pasa **dos veces seguidas**, sin reiniciar nada.

En este programa, el test A cambia la lista que consulta el test B:

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

Imprime `A then B: true true` y luego `B alone: false`. La línea `products.length = 1` devuelve la lista a su estado inicial. B no prepara sus datos: pasa porque A agregó un producto. Esto es **dependencia de orden**.

Con el orden B, A, B:

```ts
const products: string[] = ["Mouse"]
function testA() { products.push("Keyboard"); return products.length === 2 }
function testB() { return products.length === 2 }
console.log("B, A, B:", testB(), testA(), testB())
```

Imprime `B, A, B: false true true`. La primera llamada a B encuentra un producto; la segunda encuentra dos, porque A cambió la lista entre ambas.

## Datos compartidos en la tienda

La tienda de práctica guarda sus datos en la memoria del servidor. Los tests consultan y modifican esos mismos datos.

![Ejemplo de dos tests que crean y leen productos en el mismo servidor.](/images/04-shared-server-data.es.svg)

Un test que crea un producto con el valor fijo `SKU-5000` falla si vuelve a crearlo sin borrar el anterior ni reiniciar los datos. El servidor responde "This SKU is already used by another product." porque el SKU ya está ocupado.

Otro test puede esperar una sola fila al buscar "Lamp" y encontrar dos si un test anterior dejó otro producto con esa palabra. La búsqueda depende de todos los nombres guardados, aunque el test no los haya creado.

### Un solo worker

La configuración de `apps/practice-shop/playwright.config.ts` evita que dos tests modifiquen la tienda al mismo tiempo:

```ts
// The app keeps its data in memory and every test shares it,
// so tests run one at a time, in one worker.
fullyParallel: false,
workers: 1,
```

Con `workers: 1`, Playwright ejecuta un test a la vez. Con `fullyParallel: false`, los tests de un mismo archivo también corren uno tras otro. Esto evita que un test borre un producto mientras otro lo lee, pero los datos que deja siguen disponibles para el siguiente.

## Reinicia una vez, en el setup

El test de setup en `apps/practice-shop/e2e/global.setup.ts` pide al servidor que reinicie los datos:

```ts
const reset = await request.post("/api/test/reset")
expect(reset.ok()).toBeTruthy()
```

El reinicio restaura los datos semilla: 24 productos y 12 pedidos. En una ejecución normal, el setup lo pide una vez antes de los tests de Chromium, no antes de cada test. Un reintento del setup puede repetirlo.

Reiniciar antes de cada test agrega una petición por test y puede ocultar dependencias de una tienda limpia. Por ejemplo, una búsqueda que espera una sola coincidencia nunca se encuentra con el producto que dejó otro test. En esta suite, cada test debe convivir con los datos que agregan los demás.

## Crea tus propios datos

Cada test prepara los registros que necesita. El archivo `apps/practice-shop/e2e/lib/helpers.ts` contiene dos helpers para generar sus valores.

`uniqueName` agrega un sufijo aleatorio al nombre:

```ts
/** A name with a random suffix, e.g. "Mouse 3fa9c1d2". */
export function uniqueName(prefix: string): string {
  return `${prefix} ${crypto.randomUUID().slice(0, 8)}`
}
```

`uniqueSku` genera el código que identifica el producto, como `SKU-4821`:

```ts
/** A valid SKU like "SKU-4821" that is not used by the seed data. */
export function uniqueSku(): string {
  const value = nextSku
  nextSku = value >= LAST ? FIRST : value + 1
  return `SKU-${value}`
}
```

La semilla usa de `SKU-0001` a `SKU-0024`. El helper empieza en un número al azar desde 1000 y va contando hacia arriba. En un mismo proceso worker, las primeras 9,000 llamadas producen SKU distintos; después el contador repite valores.

El test de creación en `e2e/products/products.spec.ts` usa ambos helpers:

```ts
const name = uniqueName("Created")
// ...
await page.getByTestId("product-name").fill(name)
await page.getByTestId("product-sku").fill(uniqueSku())
```

El nombre generado permite buscar el producto que creó el test, en lugar de una palabra que puede aparecer en otros productos.

![Cada test usa la identidad de su producto aunque comparta el servidor.](/images/04-data-identities.es.svg)

## Registros y totales que cambian

En `e2e/orders/orders.spec.ts`, el estado de un pedido solo avanza. Cuando está "paid" (pagado), no puede volver a "pending" (pendiente).

El filtro consulta el pedido 1003, que ya está enviado, y el test de pago modifica el 1005, que está pendiente. Si dos tests intentaran pagar el 1005, el segundo encontraría que ya está pagado. Repetir ese test sin reiniciar la semilla también falla.

El primer test de `products.spec.ts` necesita comprobar el total de productos, que cambia cuando otros tests crean o borran registros:

```ts
// Other tests add products, so we ask the API for the real total.
const total = ((await (await request.get("/api/products")).json()) as { total: number }).total
```

El test lee el total de `/api/products` antes de abrir la lista. Así compara el texto mostrado con los datos actuales, en vez de esperar siempre `24 products`.

## Profundiza

### Valores aleatorios y contadores

Elegir un valor al azar no garantiza que sea distinto de los anteriores. Este programa simula 20,000 ejecuciones que eligen 100 SKU entre los 9,000 valores de `SKU-1000` a `SKU-9999`:

```ts
const pool = 9000
const picks = 100
const trials = 20000
let clashes = 0

for (let trial = 0; trial < trials; trial++) {
  const seen = new Set<number>()
  for (let i = 0; i < picks; i++) {
    const value = 1000 + Math.floor(Math.random() * pool)
    if (seen.has(value)) {
      clashes++
      break
    }
    seen.add(value)
  }
}
console.log(`${((clashes / trials) * 100).toFixed(0)} percent of runs had a clash`)
```

Imprime cerca de `42 percent of runs had a clash`. El resultado varía porque Node.js ejecuta la simulación con números aleatorios. El `Set` guarda los valores elegidos y `seen.has(value)` detecta una repetición.

Los ocho caracteres del sufijo de `uniqueName` tienen 16 opciones cada uno: 4,294,967,296 valores posibles. La probabilidad de un choque entre 1,000 nombres es cercana a 1 en 8,600. El espacio de los SKU es mucho menor.

Contar hacia arriba produce 9,000 SKU distintos antes de repetir el primero. El contador de `uniqueSku` vive en un proceso worker; no garantiza valores distintos entre workers ni entre ejecuciones. Los reintentos y `--repeat-each` pueden iniciar otro proceso, con un contador nuevo, aunque `workers: 1` limite la ejecución a un proceso a la vez.

```ts
let next = 9998
function sku() {
  const value = next
  next = value >= 9999 ? 1000 : value + 1
  return `SKU-${value}`
}
console.log(sku(), sku(), sku())
```

Esto imprime `SKU-9998 SKU-9999 SKU-1000`. Al llegar al final, el contador vuelve a 1000 y mantiene el formato válido del SKU.

## Práctica

1. Abre `apps/practice-shop/e2e/lib/helpers.ts`. Encuentra las líneas que eligen el primer número de SKU.
2. Abre `apps/practice-shop/e2e/orders/orders.spec.ts`. Encuentra el comentario que dice qué pedido usa cada test.
3. Inicia la tienda con `pnpm shop:dev` en una terminal.
4. En una segunda terminal, ejecuta un solo archivo spec:

```bash
pnpm shop:e2e products/products.spec.ts
```

5. Ejecuta dos repeticiones dentro de una ejecución:

```bash
pnpm shop:e2e products/products.spec.ts --repeat-each=2
```

El setup reinicia los datos una vez antes de las repeticiones. Comprueba ambas sin otro reinicio; dos comandos separados volverían a ejecutar el setup. Cada repetición usa otro worker, así que el contador de SKU empieza de nuevo y aún puede chocar con datos existentes.

6. Ejecuta un solo test por una palabra de su nombre. Con `-g`, Playwright filtra los tests por su nombre:

```bash
pnpm shop:e2e -g cancelling
```

Comprueba que pasa solo.

## Reto

Cubre el hueco "Duplicate SKU error when creating a product" de `COVERAGE.md` en `apps/practice-shop/e2e/challenges/duplicate-sku.spec.ts`.

Crea un producto por la API. Abre el formulario de producto nuevo, llénalo con valores válidos y el SKU de ese producto, y guarda. Comprueba que muestra el error y no crea un segundo producto.

Está terminado cuando:

- El test obtiene el SKU de su propio producto, sin un valor fijo como `SKU-0001` ni un id de la semilla.
- Después de guardar, `product-sku-error` muestra el texto exacto del servidor y la dirección sigue terminando en `/products/new`.
- El total de `/api/products` es el mismo antes y después de guardar.
- `pnpm shop:e2e challenges/duplicate-sku.spec.ts --repeat-each=3` pasa las tres repeticiones.

Busca: `playwright repeat-each`, `playwright hydration fill input erased react`. Lee el comentario en `products.spec.ts` sobre `newButton.click()`: ese clic por sí solo no demuestra que el formulario de destino esté listo para escribir.

## Piénsalo bien

1. Un test crea un producto con `createProduct`. Otro busca una fila con el texto "Created", pero no crea nada. En el orden uno, dos, pasa. ¿Qué ocurre si ejecutas el segundo solo en un servidor nuevo o antes del primero?

<details><summary>Respuesta</summary>

Falla: la semilla no tiene ese nombre. Debe crear su propio producto con `uniqueName("Created")` y buscar ese nombre completo.

</details>

2. Este test pasa en una ejecución nueva. En la segunda ejecución falla. Encuentra el bug.

```ts
test("deleting Mouse Pad removes its row", async ({ page }) => {
  const products = new ProductsPage(page)
  await products.goto()

  await products.delete(23)

  await expect(products.row(23)).toHaveCount(0)
})
```

<details><summary>Respuesta</summary>

La primera ejecución borra el producto 23, "Mouse Pad", de la semilla. Con `--repeat-each 2`, la segunda copia usa los mismos datos y no encuentra el botón de borrar. Un segundo comando normal `pnpm shop:e2e` pasa porque el setup reinicia la semilla. El test debería crear su propio producto con `createProduct` y borrar ese.

</details>

3. ¿Qué devuelve `uniqueSku` en la llamada 9,001? ¿Qué ocurre si el producto de la primera llamada todavía existe?

<details><summary>Respuesta</summary>

Devuelve el mismo SKU que la llamada 1. El servidor rechaza la creación con "This SKU is already used by another product." porque el contador agotó sus 9,000 valores.

</details>

## Siguiente paso

En la próxima lección aprendes la regla de nombres para `data-testid` y por qué el equipo la usa.
