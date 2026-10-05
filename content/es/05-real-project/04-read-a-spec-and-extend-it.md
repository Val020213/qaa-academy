---
title: Leer un spec y ampliarlo
summary: Lee el spec de pedidos línea por línea, añade el test "an admin cancels a pending order" y actualiza COVERAGE.md.
duration: 40 min
---

## Objetivo

- Leer un spec existente y explicar cada parte.
- Elegir datos que ningún otro test usa.
- Añadir un test nuevo junto a los existentes.
- Actualizar `COVERAGE.md` como parte del trabajo.

## Lee el spec

Abre `apps/practice-shop/e2e/orders/orders.spec.ts`. Tiene dos tests. Lee primero el segundo. Aquí se omite el primero.

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

El estado de un pedido solo avanza. Cuando un test marca un pedido como pagado, ya no puede volver a ser pendiente. Por eso cada test necesita su propio pedido. El comentario al inicio del spec lo dice.

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

**Paso 3.** Haz clic en el botón. El testid es `orders-cancel-1001`. La página lo construye como `orders-cancel-` más el id del pedido.

**Paso 4.** Comprueba el resultado. El estado es `cancelled`. Los dos botones ya no están, porque un pedido cancelado es definitivo.

**Paso 5.** Actualiza el comentario del inicio, para que la siguiente persona sepa que el 1001 está ocupado.

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

Un test sin nota de cobertura está a medias. Abre `apps/practice-shop/e2e/COVERAGE.md`.

En la tabla, cambia la fila de Orders para que diga: "Status filter, admin marks a pending order as paid, admin cancels a pending order".

En "Not covered yet", borra la línea "Cancelling an order." El hueco ya está cerrado.

## Práctica

1. Busca `1001` en todos los specs. Confirma que ningún test lo usa.
2. Añade el test a `orders/orders.spec.ts`. Actualiza el comentario.
3. Ejecuta solo tu test:

```bash
pnpm --filter practice-shop e2e e2e/orders/orders.spec.ts -g "cancels"
```

4. Ejecuta el archivo completo. Luego ejecuta toda la suite dos veces. Ambas ejecuciones deben pasar.
5. Actualiza `COVERAGE.md` como se describe.

> **Cuidado:** Ejecuta el archivo dos veces. Cada ejecución reinicia los datos, así que el test debe volver a pasar con datos nuevos.

## Comprueba lo que sabes

1. ¿Por qué dos tests no pueden usar el mismo pedido pendiente?

<details><summary>Respuesta</summary>

Un cambio de estado solo avanza. Después del primer test, el pedido ya no está pendiente.

</details>

2. ¿Para qué sirve la línea de guarda?

<details><summary>Respuesta</summary>

Demuestra que el pedido está `pending` antes de hacer clic. Si los datos están mal, el fallo apunta a la causa.

</details>

3. ¿Qué testid cancela el pedido 1009?

<details><summary>Respuesta</summary>

`orders-cancel-1009`.

</details>

4. ¿Qué cambias en `COVERAGE.md`?

<details><summary>Respuesta</summary>

Añades el test nuevo a la fila de Orders y quitas "Cancelling an order." de los huecos.

</details>

## Siguiente paso

En la próxima lección planificarás un spec nuevo completo a partir de un hueco: editar un producto.
