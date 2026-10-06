---
title: Leer un spec y ampliarlo
summary: Lee el spec de pedidos línea por línea, predice qué ofrece la página, agrega el test "un admin cancela un pedido pendiente" y actualiza COVERAGE.md.
duration: 90 min
---

## Empieza con un acertijo

Un compañero escribió la semana pasada un test para el dashboard: "la tarjeta Pending orders (pedidos pendientes) muestra 3". En los datos iniciales, los pedidos 1001, 1005 y 1009 están pendientes, así que el test pasa.

Hoy la suite ya contiene un test que marca el pedido 1005 como pagado. Estás por agregar un test que cancela el pedido 1001. Lo agregas, lo ejecutas y pasa.

Ahora piensa en el test del dashboard. ¿Seguirá pasando? ¿Depende de qué archivo se ejecuta primero? ¿Y quién es responsable si falla: tú, porque agregaste el test nuevo, o tu compañero, porque el test era frágil?

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Leer un spec existente y explicar cada parte.
- Predecir qué controles ofrece una página a partir de su código, antes de ejecutar nada.
- Elegir datos que ningún otro test usa, y decir por qué.
- Agregar un test nuevo junto a los existentes y actualizar `COVERAGE.md`.

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

El primer test (el filtro de estado) sigue la misma forma. Mira la forma de este: **Arrange, Act, Assert** (preparar, actuar, comprobar).

- Arrange: abre `/orders` y comprueba que el pedido está `pending`.
- Act: haz clic en el botón.
- Assert: el estado es `paid` y el botón ya no está.

La primera aserción es una **guarda**. Demuestra que los datos son los que esperas antes de actuar.

Fíjate en lo que el test no dice. No dice qué clase CSS tiene el botón, ni qué componente dibuja la tabla. Describe lo que ve un usuario: un estado, un botón, un estado que cambió. Esta es la regla **prueba lo que ve el usuario, no cómo está construido el código**. La página se reconstruyó con componentes nuevos, y estos tests no cambiaron, porque los test ids y los textos se mantuvieron.

## De dónde vienen los botones

Antes de escribir el test nuevo, predice: ¿qué acciones tiene un pedido pendiente? ¿Uno pagado? ¿Uno enviado? Escribe tus respuestas. Ahora lee la regla real en `apps/practice-shop/app/(dashboard)/orders/page.tsx`:

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

Cada botón recibe el test id `${step.testId}-${order.id}`. Así que el botón de cancelar del pedido 1001 es `orders-cancel-1001`. Un pedido pendiente tiene dos botones, uno pagado tiene dos, y los pedidos enviados o cancelados no tienen ninguno. Leer código así es una habilidad: encuentras la regla en un solo lugar y tus tests no tienen que adivinar.

## Por qué importan los ids de los pedidos

El estado de un pedido solo avanza. Después de que un test marca un pedido como pagado, no puede volver a ser pendiente. Por eso cada test necesita su propio pedido. El comentario al inicio del spec lo dice.

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

Planea primero el test con palabras simples, antes de programar. Esto es **pseudocódigo**: pasos en tu propio idioma.

**Paso 1.** Escribe el nombre del test como una frase que diría un usuario: "an admin cancels a pending order" (un admin cancela un pedido pendiente).

**Paso 2.** Abre la página y pon la guarda. El pedido 1001 debe estar `pending`.

**Paso 3.** Haz clic en el botón. El test id es `orders-cancel-1001`.

**Paso 4.** Comprueba el resultado. El estado es `cancelled`. Los dos botones ya no están, porque un pedido cancelado es final.

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

### De vuelta al acertijo

El test del dashboard es frágil. La tarjeta `stat-pending-orders` cuenta los pedidos que están pendientes. Cada test de pedidos la baja en uno: 3 en los datos iniciales, 2 después de pagar el 1005, 1 después de cancelar el 1001. El test "el dashboard muestra 3" pasa solo si se ejecuta antes que los tests de pedidos. Playwright ejecuta los archivos en un orden fijo, así que puede pasar durante meses y fallar el día que alguien renombre una carpeta.

Entonces, ¿quién es responsable? Nadie tiene que cargar con la culpa. La lección real es que un test que lee datos compartidos depende de cada test que los escribe. El mejor test comprueba lo que controla: por ejemplo, que la tarjeta muestre un número, como hace `dashboard.spec.ts` con `/^\d+$/`. Si tienes que comprobar un número exacto, crea los datos dentro del test.

## Profundiza

### Por qué existe la línea de guarda

Mira la primera aserción del test de cancelar: el estado del 1001 es `pending`. Imagina que la quitas. Si una ejecución anterior dejó el 1001 cancelado, el clic fallaría con "element not found" para `orders-cancel-1001`. Ese error no dice por qué. La guarda lo convierte en un mensaje claro: se esperaba `pending`, se recibió `cancelled`. Un buen test te dice qué está mal, no solo que algo está mal.

### Una idea equivocada: "más aserciones hacen un mejor test"

Los principiantes suelen comprobar todo lo que ven. Entonces un cambio pequeño e inofensivo rompe diez tests. Comprueba de qué trata el test. El test de cancelar comprueba el estado, y que los dos botones ya no están, porque esa es la regla. No comprueba el color de la insignia ni el encabezado de la tabla.

### Cómo aparece esto en el trabajo real de automatización QA

El test del filtro comprueba un estado. Quizá quieras comprobarlos todos. Podrías copiar el test tres veces. En cambio, escribe el cuerpo del test una vez y recorre una lista de datos con un bucle:

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

Esto es **DRY**: Don't Repeat Yourself (no te repitas). Un cuerpo de test, muchas entradas. El bucle es la idea que aprendiste como "bucles y arrays de datos". Cada test necesita un nombre distinto, por eso el nombre usa `status`. Otros tests nunca cambian estos pedidos, así que son seguros. Las filas de datos salen de las **clases de equivalencia**: un ejemplo por cada grupo de entradas que deben comportarse igual.

### El límite de DRY

En un test, una historia clara importa más que el código más corto. Si el cuerpo del bucle empieza a llenarse de líneas con `if`, detente. Dos tests simples son mejores que un test ingenioso que nadie puede leer. Usa un bucle cuando los pasos son los mismos y solo cambian los datos. Esto es **KISS** en acción: mantenlo simple.

## Práctica

1. Busca `1001` en todos los specs. Confirma que ningún test lo usa.
2. Agrega el test a `orders/orders.spec.ts`. Actualiza el comentario.
3. Ejecuta solo tu test:

```bash
pnpm --filter practice-shop e2e e2e/orders/orders.spec.ts -g "cancels"
```

4. Ejecuta el archivo completo. Luego ejecuta toda la suite dos veces. Las dos ejecuciones deben pasar.
5. Actualiza `COVERAGE.md` como se describió.

> **Cuidado:** Ejecuta el archivo dos veces. Cada ejecución reinicia los datos, así que el test debe volver a pasar con datos frescos.

## Reto

La tienda dice que un viewer es de solo lectura. Conoces dos lugares donde esta regla debe cumplirse: la página y la API. Tu tarea: escribir un test que compruebe ambos para la página de pedidos.

Crea `apps/practice-shop/e2e/orders/orders-viewer.spec.ts` con un test. El test entra como viewer y abre `/orders`. Comprueba que el pedido 1009 es visible, que no tiene botón **Mark as paid** ni **Cancel** (cancelar), y que una petición directa para cambiar este pedido es rechazada por el servidor con el código de estado que usa la tienda para "usuario conocido, sin permiso". El test no debe cerrar la sesión compartida del admin, y no debe cambiar ningún dato.

Está terminado cuando:

- El test pasa, y pasa cuando ejecutas el archivo dos veces seguidas.
- El test nunca cierra sesión. El texto `logout-button` no aparece en tu archivo.
- La petición rechazada se envía desde dentro del test, y el test comprueba tanto el código de estado como que el pedido 1009 sigue `pending` en la página después.
- Ejecutaste el mismo test una vez como admin a propósito, viste que fallaba, y luego volviste a poner el viewer. Un test que nunca has visto fallar es un test en el que no puedes confiar.
- Usaste el pedido 1009 y no el 1005 ni el 1001, y puedes decir por qué en una frase en un comentario.

Vas a necesitar algo que esta lección no enseñó: cómo ser un usuario distinto dentro de un test, y cómo enviar una petición desde el propio test. Busca: `playwright override storageState in a test`, `playwright page.request patch`, `playwright apirequestcontext cookies shared with page`. Mira `loginViaApi` en `lib/fixtures/api-client.ts` y el test de cerrar sesión en `auth/auth.spec.ts` para tener pistas.

> **Consejo:** Puedes pedir ayuda a un asistente de IA. Pero debes ejecutar el código, y debes poder explicar cada línea a un compañero. Nunca conserves código que no puedas explicar. Pídele al asistente que explique lo que escribió y luego compáralo con la documentación.

## Piénsalo bien

1. Encuentra el bug. Este test de cancelar se ejecuta y pasa, pero no comprueba nada.

```ts
test("an admin cancels a pending order", async ({ page }) => {
  await page.goto("/orders")
  await page.getByTestId("orders-cancel-1001").click()
  expect(page.getByTestId("orders-status-1001")).toHaveText("cancelled")
})
```

<details><summary>Respuesta</summary>

Falta el `await` antes de `expect`. La aserción devuelve una promesa que nadie espera. Sin `await`, la comprobación no queda unida al test. Puede empezar a reintentar, pero el test no la espera. Entonces la comprobación falla cuando el test termina y se limpia, o simplemente no se reporta en el lugar correcto. Por eso un estado incorrecto puede no hacer fallar el test de forma clara. Una regla de lint puede detectar este error, pero solo si el equipo la activa. Escribe siempre `await expect(...)` en las aserciones web-first. El código parece correcto, y por eso este bug es peligroso.

</details>

2. Versión A: tres tests separados para el filtro (paid, shipped, cancelled). Versión B: un bucle sobre una lista. ¿Cuál es mejor aquí, y qué te haría elegir A?

<details><summary>Respuesta</summary>

B es mejor aquí porque los pasos son los mismos y solo cambian los datos, y un estado nuevo necesita una sola línea nueva. Elegirías A si los tres casos necesitaran pasos distintos, por ejemplo si `cancelled` necesitara comprobar un mensaje de lista vacía. Entonces el bucle se llenaría de líneas con `if`, y los tests simples son más fáciles de leer. Los nombres de los tests en el reporte también importan: con B, cada nombre debe llevar los datos, o no sabrás qué fila falló.

</details>

3. ¿Qué se rompe si el negocio cambia la regla: "un pedido cancelado puede reabrirse como pendiente"?

<details><summary>Respuesta</summary>

El comentario al inicio del spec se vuelve falso. La tabla de pedidos sigue siendo un buen punto de partida, pero la regla "cada test necesita su propio pedido" ya no es necesaria para el test de cancelar, porque el test podría reabrir el pedido al final. La aserción `toHaveCount(0)` de los botones de un pedido cancelado fallaría, ya que existiría un botón nuevo. La línea de guarda seguiría siendo útil. Cuando una regla cambia, los tests que describen la regla vieja deben cambiar primero, y un test que falla es la forma de encontrarlos.

</details>

4. Dos admins pulsan **Cancel** en el pedido 1001 casi al mismo tiempo, en dos ventanas del navegador. Predice qué ve el segundo admin y por qué.

<details><summary>Respuesta</summary>

La primera petición cambia el pedido a `cancelled`. La segunda petición llega para un pedido que ya está cancelado, y el servidor responde 409 con el mensaje "An order that is cancelled cannot become cancelled." La página captura este error y lo muestra en el mensaje rojo con el test id `orders-error`. Nada se rompe, pero el segundo admin ve un error por algo que ya hizo lo que quería. Es un buen *caso límite* para un test nuevo, ya que usa la API para cancelar primero y la página después.

</details>

5. Explica la línea de guarda a un compañero en tres frases. No uses las palabras "comprobar" ni "verificar".

<details><summary>Respuesta</summary>

Antes de actuar, el test lee el estado del pedido y lo compara con lo que necesita. Si los datos ya son distintos, el test se detiene con un mensaje que nombra el problema real. Sin ella, el clic fallaría más tarde con un mensaje vago sobre un elemento que falta. La línea cuesta una fila de código y ahorra minutos de búsqueda.

</details>

6. ¿Debería el test de cancelar también leer el pedido desde la API después del clic, para confirmar que el servidor lo guardó? No hay una única respuesta correcta.

<details><summary>Respuesta</summary>

Si la página vuelve a leer los datos del servidor después del cambio, el nuevo estado en pantalla ya demuestra que el servidor lo guardó. En la tienda, `load()` se ejecuta otra vez después del PATCH, así que la interfaz basta. Una lectura extra de la API probaría lo mismo dos veces y ataría el test a la forma de la API. Sería útil si la página mostrara el nuevo estado sin preguntar al servidor, porque entonces la pantalla podría estar equivocada. La elección depende de lo que realmente hace la página y de cuánto cuesta un guardado perdido.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es el patrón Arrange, Act, Assert en las pruebas?**
   - Busca: `arrange act assert pattern unit testing`
   - Pruébalo: abre `e2e/products/products.spec.ts`. Elige un test y agrega los comentarios `// Arrange`, `// Act` y `// Assert` antes de las líneas que corresponden. Encuentra un test donde la parte Arrange esté escondida dentro de un helper.
   - Una buena respuesta explica: las tres partes de un test y por qué mantenerlas separadas hace que un test sea más fácil de leer.

2. **¿Qué son las pruebas guiadas por datos y cuándo son mejores que escribir tests separados?**
   - Busca: `data-driven testing parameterized tests`
   - Pruébalo: copia el ejemplo del bucle de esta lección en un archivo temporal `e2e/orders/filter-loop.spec.ts`. Ejecútalo, lee los nombres de los tests en el reporte, luego agrega una cuarta fila tuya y ejecuta otra vez. Borra el archivo cuando termines.
   - Una buena respuesta explica: cómo un cuerpo de test se ejecuta con muchas entradas, y un caso donde los tests separados son más claros.

3. **¿Por qué los testers dicen que cada test debe ser independiente de los demás?**
   - Busca: `test independence isolation automation`
   - Pruébalo: ejecuta tu test de cancelar, luego abre `/dashboard` y lee la tarjeta Pending orders. Ejecuta `fetch("/api/test/reset", { method: "POST" }).then((r) => r.json())` en la Console del navegador, recarga el dashboard y compara los dos números.
   - Una buena respuesta explica: qué puede salir mal cuando los tests dependen unos de otros, y una forma de hacer independiente a un test.

## Siguiente paso

En la próxima lección planeas un spec completamente nuevo a partir de un hueco: editar un producto.
