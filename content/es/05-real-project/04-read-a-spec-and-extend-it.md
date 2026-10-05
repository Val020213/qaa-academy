---
title: Leer un spec y ampliarlo
summary: Lee el spec de pedidos línea por línea, luego añade el test "an admin cancels a pending order" y actualiza COVERAGE.md.
duration: 55 min
---

## Objetivo

- Leer un spec existente y explicar cada parte.
- Elegir datos que ningún otro test usa.
- Añadir un test nuevo junto a los existentes.
- Actualizar `COVERAGE.md` como parte del trabajo.

## Lee el spec

Abre `apps/practice-shop/e2e/orders/orders.spec.ts`. Tiene dos tests. Lee primero el segundo. Aquí se omite el primer test.

```ts
import { expect, test } from "../lib/test"

// Seeded orders 1001 to 1012 cycle: pending, paid, shipped, cancelled.
// A status change is one-way, so each test uses its own order:
//   1003 (shipped) for the filter, 1005 (pending) for "mark as paid".
test.describe("Orders", () => {
  // ... the status filter test is here ...
  test("an admin marks a pending order as paid", async ({ page }) => {
    await page.goto("/orders")
    await expect(page.getByTestId("orders-status-1005")).toHaveText("pending")

    await page.getByTestId("orders-mark-paid-1005").click()

    await expect(page.getByTestId("orders-status-1005")).toHaveText("paid")
    await expect(page.getByTestId("orders-mark-paid-1005")).toHaveCount(0)
  })
})
```

El primer test (el filtro por estado) sigue la misma forma. Fíjate en la forma de este: **preparar, actuar, comprobar** (*arrange, act, assert*).

- Preparar: abre `/orders` y comprueba que el pedido está `pending`.
- Actuar: haz clic en el botón.
- Comprobar: el estado es `paid` y el botón ya no está.

La primera aserción es una **guarda**. Demuestra que los datos son los que esperas antes de actuar.

## Por qué importan los ids de los pedidos

El estado de un pedido solo avanza. Después de que un test marca un pedido como pagado, ya no puede volver a estar pendiente. Por eso cada test necesita su propio pedido. El comentario al inicio del spec lo dice.

Los datos iniciales tienen los pedidos 1001 a 1012. Se repiten en ciclo: pending, paid, shipped, cancelled.

| Estado | Ids de pedido |
| --- | --- |
| pending | 1001, 1005, 1009 |
| paid | 1002, 1006, 1010 |
| shipped | 1003, 1007, 1011 |
| cancelled | 1004, 1008, 1012 |

Los tests existentes usan 1003 y 1004 (el test del filtro) y 1005 (marcar como pagado). Busca `1001` en el spec. No aparece. El pedido 1001 está pendiente y libre, así que tu test lo usará.

> **Consejo:** Antes de elegir datos, busca el id en todos los specs. Pulsa `Ctrl+Shift+F` en VS Code.

## Paso a paso

**Paso 1.** Escribe el nombre del test como una frase que diría un usuario: "an admin cancels a pending order".

**Paso 2.** Abre la página y pon la guarda. El pedido 1001 debe estar `pending`.

**Paso 3.** Haz clic en el botón. El test id es `orders-cancel-1001`. La página lo construye como `orders-cancel-` más el id del pedido.

**Paso 4.** Comprueba el resultado. El estado es `cancelled`. Los dos botones ya no están, porque un pedido cancelado es definitivo.

**Paso 5.** Actualiza el comentario del inicio, para que la siguiente persona sepa que 1001 está ocupado.

## El spec completo

Este es el archivo entero después de tu cambio.

```ts
import { expect, test } from "../lib/test"

// Seeded orders 1001 to 1012 cycle: pending, paid, shipped, cancelled.
// A status change is one-way, so each test uses its own order:
//   1003 (shipped) for the filter, 1005 (pending) for "mark as paid",
//   1001 (pending) for "cancel".
test.describe("Orders", () => {
  test("the status filter shows only orders with that status", async ({ page }) => {
    await page.goto("/orders")
    await expect(page.getByTestId("orders-row-1003")).toBeVisible()
    await expect(page.getByTestId("orders-row-1004")).toBeVisible()

    await page.getByTestId("orders-status-filter").selectOption("shipped")

    await expect(page.getByTestId("orders-row-1003")).toBeVisible()
    await expect(page.getByTestId("orders-row-1004")).toHaveCount(0)
    await expect(page.getByTestId("orders-status-1003")).toHaveText("shipped")
  })

  test("an admin marks a pending order as paid", async ({ page }) => {
    await page.goto("/orders")
    await expect(page.getByTestId("orders-status-1005")).toHaveText("pending")

    await page.getByTestId("orders-mark-paid-1005").click()

    await expect(page.getByTestId("orders-status-1005")).toHaveText("paid")
    await expect(page.getByTestId("orders-mark-paid-1005")).toHaveCount(0)
  })

  test("an admin cancels a pending order", async ({ page }) => {
    await page.goto("/orders")
    await expect(page.getByTestId("orders-status-1001")).toHaveText("pending")

    await page.getByTestId("orders-cancel-1001").click()

    await expect(page.getByTestId("orders-status-1001")).toHaveText("cancelled")
    await expect(page.getByTestId("orders-cancel-1001")).toHaveCount(0)
    await expect(page.getByTestId("orders-mark-paid-1001")).toHaveCount(0)
  })
})
```

## Actualiza COVERAGE.md

Un test sin nota de cobertura está a medio hacer. Abre `apps/practice-shop/e2e/COVERAGE.md`.

En la tabla, cambia la fila de Orders para que diga: "Status filter, admin marks a pending order as paid, admin cancels a pending order".

En "Not covered yet", elimina la línea "Cancelling an order." El hueco ya está cerrado.

## Profundiza

### Por qué existe la línea de guarda

Mira la primera aserción del test de cancelar: el estado de 1001 es `pending`. Imagina que la quitaras. Si una ejecución anterior dejó 1001 cancelado, el clic fallaría con "element not found" para `orders-cancel-1001`. Ese error no dice por qué. La guarda lo convierte en un mensaje claro: se esperaba `pending`, se recibió `cancelled`. Un buen test te dice qué está mal, no solo que algo está mal.

### Una idea equivocada: "más aserciones hacen un mejor test"

Los principiantes suelen comprobar todo lo que ven. Entonces un cambio pequeño e inofensivo rompe diez tests. Comprueba aquello de lo que trata el test. El test de cancelar comprueba el estado y que los dos botones ya no están, porque esa es la regla. No comprueba el color de la insignia ni el encabezado de la tabla.

### Cómo aparece en el trabajo real de automatización QA

El test del filtro comprueba un estado. Quizá quieras comprobarlos todos. Podrías copiar el test tres veces. En su lugar, escribe el cuerpo del test una vez y recorre una lista de datos con un bucle:

```ts
import { expect, test } from "../lib/test"

// status to filter by, one order that must stay, one that must go
const cases = [
  { status: "paid", shown: 1002, hidden: 1003 },
  { status: "shipped", shown: 1003, hidden: 1002 },
  { status: "cancelled", shown: 1004, hidden: 1003 },
]

test.describe("Orders filter by status", () => {
  for (const { status, shown, hidden } of cases) {
    test(`filtering by ${status} keeps order ${shown} and hides ${hidden}`, async ({ page }) => {
      await page.goto("/orders")
      await expect(page.getByTestId(`orders-row-${hidden}`)).toBeVisible()

      await page.getByTestId("orders-status-filter").selectOption(status)

      await expect(page.getByTestId(`orders-row-${shown}`)).toBeVisible()
      await expect(page.getByTestId(`orders-row-${hidden}`)).toHaveCount(0)
    })
  }
})
```

Esto es **DRY** (Don't Repeat Yourself, no te repitas): un cuerpo de test, muchas entradas. El bucle es la idea que aprendiste como "bucles y arrays de datos". Cada test necesita un nombre distinto, por eso el nombre usa `status`. Otros tests nunca cambian estos pedidos, así que es seguro.

### El límite de DRY

En un test, una historia clara importa más que el código más corto. Si el cuerpo del bucle empieza a llenarse de líneas `if`, detente. Dos tests simples son mejores que un test ingenioso que nadie puede leer. Usa un bucle cuando los pasos son los mismos y solo cambian los datos.

## Práctica

1. Busca `1001` en todos los specs. Confirma que ningún test lo usa.
2. Añade el test a `orders/orders.spec.ts`. Actualiza el comentario.
3. Ejecuta solo tu test:

```bash
pnpm --filter practice-shop e2e e2e/orders/orders.spec.ts -g "cancels"
```

4. Ejecuta el archivo completo. Luego ejecuta toda la suite dos veces. Ambas ejecuciones deben pasar.
5. Actualiza `COVERAGE.md` como se describe.

> **Cuidado:** Ejecuta el archivo dos veces. Cada ejecución reinicia los datos, así que el test debe pasar de nuevo con datos nuevos.

## Comprueba lo que sabes

1. ¿Por qué dos tests no pueden usar el mismo pedido pendiente?

<details><summary>Respuesta</summary>

El cambio de estado es en un solo sentido. Después del primer test, el pedido ya no está pendiente.

</details>

2. ¿Para qué sirve la línea de guarda?

<details><summary>Respuesta</summary>

Demuestra que el pedido está `pending` antes de hacer clic. Si los datos están mal, el fallo apunta a la causa.

</details>

3. ¿Qué test id cancela el pedido 1009?

<details><summary>Respuesta</summary>

`orders-cancel-1009`.

</details>

4. ¿Qué cambias en `COVERAGE.md`?

<details><summary>Respuesta</summary>

Añade el test nuevo a la fila de Orders y quita "Cancelling an order." de los huecos.

</details>

5. Dos tests empiezan con `expect(page.getByTestId("orders-status-1005")).toHaveText("pending")` y luego marcan 1005 como pagado. Ambos pasan cuando se ejecutan solos. ¿Qué pasa si ejecutas los dos en una misma ejecución y por qué?

<details><summary>Respuesta</summary>

El segundo test falla en la guarda. Recibe `paid`, porque el primer test ya cambió el pedido, y un estado solo avanza. La guarda hace fácil ver la causa. La solución es dar a cada test su propio pedido.

</details>

6. ¿Cuál test de cancelar es mejor? La versión A no tiene línea de guarda. La versión B comprueba primero que 1001 está `pending`. Los datos se reinician antes de cada ejecución.

<details><summary>Respuesta</summary>

La versión B es mejor. Con los datos reiniciados, ambas pasan hoy. Pero si los datos o algún otro test cambian después, la versión A falla con un vago "element not found". La versión B falla con "expected pending, received cancelled", que señala la causa de inmediato. Una línea extra cuesta poco.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es el patrón Arrange, Act, Assert en las pruebas?**
   - Busca: `arrange act assert pattern unit testing`
   - Una buena respuesta explica: las tres partes de un test y por qué mantenerlas separadas hace el test más fácil de leer

2. **¿Qué son las pruebas guiadas por datos y cuándo son mejores que escribir tests separados?**
   - Busca: `data-driven testing parameterized tests`
   - Una buena respuesta explica: cómo un cuerpo de test se ejecuta con muchas entradas, y un caso en que los tests separados son más claros

3. **¿Por qué los testers dicen que cada test debe ser independiente de los demás?**
   - Busca: `test independence isolation automation`
   - Una buena respuesta explica: qué puede salir mal cuando los tests dependen unos de otros, y una forma de hacer un test independiente

## Siguiente paso

En la próxima lección planearás un spec completamente nuevo a partir de un hueco: editar un producto.
