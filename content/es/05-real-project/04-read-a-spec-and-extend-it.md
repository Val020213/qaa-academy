---
title: Leer un spec y ampliarlo
duration: 75 min
---

## Objetivo

Vas a ampliar el spec de pedidos con un test de cancelación y registrar la nueva cobertura.

- Leer la preparación, la acción y las aserciones de un test existente.
- Identificar las acciones disponibles a partir del código de la página.
- Elegir un pedido que ningún otro test modifica.
- Agregar el test y actualizar `COVERAGE.md`.

## Lee el spec

Abre `apps/practice-shop/e2e/orders/orders.spec.ts`. Tiene dos tests; aquí se muestra el segundo.

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

En este test, **Arrange, Act, Assert** queda así:

- Arrange: abre `/orders` y comprueba que el pedido está `pending`.
- Act: haz clic en el botón.
- Assert: el estado es `paid` y el botón ya no está.

La primera aserción es una **guarda**: comprueba el estado que necesita el test antes del clic. Si una ejecución anterior dejó el pedido pagado, el test falla ahí y muestra el estado inesperado.

Sin la guarda, Playwright esperaría el botón que ya no existe hasta agotar el timeout de la acción; el clic fallaría con un error de timeout.

Las aserciones comprueban el comportamiento visible: el estado cambia y desaparece la acción que ya no está permitida. Un cambio en los componentes puede conservar estos tests si mantiene los test ids y los textos.

## De dónde vienen los botones

Lee la regla en `apps/practice-shop/app/(dashboard)/orders/page.tsx`:

```tsx
const NEXT_STEPS: Record<OrderStatus, { status: OrderStatus; label: string; testId: string }[]> = {
  pending: [
    { status: "paid", label: "Mark as paid", testId: "orders-mark-paid" },
    { status: "cancelled", label: "Cancel", testId: "orders-cancel" },
  ],
  paid: [
    { status: "shipped", label: "Mark as shipped", testId: "orders-mark-shipped" },
    { status: "cancelled", label: "Cancel", testId: "orders-cancel" },
  ],
  shipped: [],
  cancelled: [],
}
```

La página recorre la lista del estado de cada pedido para mostrar las acciones al admin. Un pedido pendiente tiene dos botones, uno pagado tiene dos, y los pedidos enviados o cancelados no tienen ninguno.

Cada botón recibe el test id `${step.testId}-${order.id}`. El botón de cancelar del pedido 1001 es `orders-cancel-1001`.

Después del clic, la página envía el cambio al servidor con PATCH y vuelve a consultar los pedidos con `load()`. El estado que comprueba el test viene de esa nueva lectura.

![Los pedidos pendientes y pagados se pueden cancelar; enviados y cancelados son finales.](/images/05-order-transitions.es.svg)

## Elige el pedido

El estado de un pedido solo avanza. Después de marcarlo como pagado, la API no permite devolverlo a pendiente. Reserva un pedido distinto para cada test que cambie su estado.

Los datos iniciales tienen los pedidos 1001 a 1012:

| Estado | Ids de pedido |
| --- | --- |
| pending | 1001, 1005, 1009 |
| paid | 1002, 1006, 1010 |
| shipped | 1003, 1007, 1011 |
| cancelled | 1004, 1008, 1012 |

Los tests existentes usan 1003 y 1004 para el filtro y 1005 para marcar como pagado. El pedido 1001 está pendiente y disponible para cancelar.

Antes de elegirlo, busca `1001` en todos los specs con `Ctrl+Shift+F` en VS Code. El comentario del spec debe registrar qué test lo usa.

### El efecto en el dashboard

La tarjeta `stat-pending-orders` cuenta los pedidos pendientes: 3 en los datos iniciales, 2 después de pagar el 1005 y 1 después de cancelar el 1001. Un test que espere siempre 3 depende de ejecutarse antes de esos cambios.

Esta suite usa un solo worker y descubre los archivos ordenados por nombre. Un test que dependa de ese orden puede pasar hasta que cambien los nombres o la configuración.

`dashboard.spec.ts` comprueba que la tarjeta muestre un número con `/^\d+$/`. Si necesitas comprobar un total exacto, prepara los datos que determinan ese total dentro del test.

## Paso a paso

Escribe el pseudocódigo del test antes de agregarlo al archivo.

**Paso 1.** Usa el nombre "an admin cancels a pending order".

**Paso 2.** Abre la página y comprueba que el pedido 1001 está `pending`.

**Paso 3.** Haz clic en `orders-cancel-1001`.

**Paso 4.** Comprueba que el estado es `cancelled` y que los dos botones desaparecieron. El test debe comprobar la regla de cancelación; el color de la insignia y el encabezado de la tabla quedan fuera de ese comportamiento.

![Cancelar el pedido 1001 cambia pending a cancelled y quita los dos botones de acción.](/clips/05-order-cancel.webm)

**Paso 5.** Actualiza el comentario del inicio para reservar el pedido 1001.

## El spec completo

Este es el archivo después de agregar el test:

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

Abre `apps/practice-shop/e2e/COVERAGE.md` para registrar el comportamiento que ahora prueba la suite.

En la tabla, cambia la fila de Orders para que diga: "Status filter, admin marks a pending order as paid, admin cancels a pending order".

En "Not covered yet", borra la línea "Cancelling an order."

## Profundiza

### Amplía el filtro con una tabla de datos

Puedes ampliar la cobertura del filtro con los mismos pasos para varios estados. Este ejemplo usa pedidos que los tests existentes y el nuevo test de cancelación no modifican:

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

Cada fila indica el estado elegido, un pedido que debe quedar visible y otro que debe desaparecer. El nombre incluye `status` para identificar el caso en el reporte.

### Mantén los pasos comunes

Usa un bucle mientras solo cambien los datos. Si los casos necesitan acciones distintas y el cuerpo se llena de líneas con `if`, escribe tests separados para que cada secuencia se pueda leer completa.

## Práctica

1. Busca `1001` en todos los specs. Confirma que ningún test lo usa.
2. Agrega el test a `orders/orders.spec.ts`. Actualiza el comentario.
3. Ejecuta solo tu test:

```bash
pnpm --filter practice-shop e2e e2e/orders/orders.spec.ts -g "cancels"
```

4. Ejecuta el archivo completo. Luego ejecuta toda la suite dos veces. Las dos ejecuciones deben pasar; el setup reinicia los datos al inicio de cada ejecución.
5. Actualiza `COVERAGE.md` como se describió.

## Reto

Comprueba que un viewer no puede cambiar pedidos desde la página ni desde la API.

Crea `apps/practice-shop/e2e/orders/orders-viewer.spec.ts` con un test. Entra como viewer y abre `/orders`. Comprueba que el pedido 1009 es visible, sin botones **Mark as paid** ni **Cancel**. Comprueba primero que `user-role` muestra `viewer`; después envía una petición para cambiarlo y comprueba que el servidor la rechaza por falta de permiso. El test no debe cambiar datos ni cerrar la sesión compartida del admin.

Está terminado cuando:

- El test pasa al ejecutar el archivo dos veces seguidas.
- El test nunca cierra sesión. El texto `logout-button` no aparece en tu archivo.
- La petición se envía desde el test, que comprueba el código de estado y que el pedido 1009 sigue `pending` en la página después. Un comentario explica por qué usas 1009 y no 1005 ni 1001.
- Ejecutaste el mismo test una vez como admin a propósito y falló en la comprobación del rol antes de enviar la petición. Luego volviste a poner el viewer.

Busca: `playwright override storageState in a test`, `playwright page.request patch`, `playwright apirequestcontext cookies shared with page`. Mira `loginViaApi` en `lib/fixtures/api-client.ts` y el test de cerrar sesión en `auth/auth.spec.ts`.

## Piénsalo bien

1. Encuentra el bug. Este test inicia una aserción asíncrona, pero no espera su resultado.

```ts
test("an admin cancels a pending order", async ({ page }) => {
  await page.goto("/orders")
  await page.getByTestId("orders-cancel-1001").click()
  expect(page.getByTestId("orders-status-1001")).toHaveText("cancelled")
})
```

<details>
<summary>Respuesta</summary>

Falta el `await` antes de `expect`. La aserción empieza y devuelve una promesa que nadie espera. El cuerpo del test puede terminar y Playwright puede cerrar la página mientras la aserción sigue pendiente. No está garantizado que el test pase ni que termine de comprobar el estado. Escribe siempre `await expect(...)` en las aserciones web-first.

</details>

2. Dos admins pulsan **Cancel** en el pedido 1001 casi al mismo tiempo, en dos ventanas del navegador. Predice qué ve el segundo admin y por qué.

<details>
<summary>Respuesta</summary>

La primera petición cambia el pedido a `cancelled`. La segunda petición llega para un pedido que ya está cancelado, y el servidor responde 409 con el mensaje "An order that is cancelled cannot become cancelled." La página captura este error y lo muestra en el mensaje rojo con el test id `orders-error`.

</details>

## Siguiente paso

En la próxima lección planeas un spec completamente nuevo a partir de un hueco: editar un producto.
