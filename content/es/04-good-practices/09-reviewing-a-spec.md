---
title: Revisar un spec
summary: Usa una lista de comprobación en tu propio spec antes de la revisión y luego corrige, paso a paso, un spec deficiente a propósito.
duration: 35 min
---

## Objetivo

- Aplicar una lista de comprobación a tu propio spec antes de pedir una revisión.
- Detectar los problemas comunes de un spec deficiente.
- Reescribir un spec deficiente para que siga las convenciones del equipo.

## Por qué revisar primero tu propio spec

El tiempo de quien revisa es limitado. Si tiene que escribir "usa `getByTestId`" por décima vez, no le queda tiempo para la pregunta útil: ¿este test comprueba lo correcto?

Lee tu spec una vez, con una lista de comprobación, antes de pedir la revisión. Así desaparece la mayoría de los comentarios.

## La lista de comprobación

**Convenciones**

- `test` y `expect` se importan desde `lib/test`, no desde `@playwright/test`.
- Todo elemento se selecciona con `getByTestId`. Sin CSS, sin XPath, sin selectores de texto para lo que se hace clic.
- La URL usa una ruta como `/products`. La configuración define la dirección base.
- El estilo coincide con el del proyecto: comillas dobles, sin punto y coma, 2 espacios.

**Independencia**

- El test pasa solo, en cualquier orden y dos veces seguidas.
- El test crea sus propios datos, con `uniqueName` y `uniqueSku` o `createProduct`.
- El test no cambia datos que usan otros tests, como un registro semilla.

**Esperas**

- No hay `page.waitForTimeout`.
- Cada comprobación usa una aserción web-first: `await expect(locator)...`.
- No hay `count()` ni `textContent()` seguido de un `expect` simple.

**Nombres y legibilidad**

- El nombre del test dice lo que ve el usuario, como "confirming in the dialog removes the product".
- Un comportamiento por test.
- Los pasos van en este orden: preparar, actuar, comprobar. Una línea en blanco los separa.

**Limpieza**

- Los datos que no deben quedar se borran, ya sea por el test o por un fixture.
- El test no cierra la sesión compartida del admin.

## Un spec deficiente

Este spec es deficiente a propósito. Rompe muchas reglas. Léelo y busca los problemas antes de leer la lista.

```ts
import { test, expect } from "@playwright/test"

test("test 1", async ({ page }) => {
  await page.goto("http://localhost:5190/login")
  await page.fill("input[type=email]", "admin@qa-shop.test")
  await page.fill("input[type=password]", "Admin123!")
  await page.click("button[type=submit]")
  await page.waitForTimeout(3000)
  await page.goto("http://localhost:5190/products")
  await page.click("tr:nth-child(1) .danger")
  await page.click("text=Delete")
  await page.waitForTimeout(2000)
  const rows = await page.locator("tr").count()
  expect(rows).toBe(10)
})

test("test 2", async ({ page }) => {
  await page.goto("http://localhost:5190/products")
  await page.fill("input[type=search]", "Docking Station")
  expect(await page.locator("tr").count()).toBe(1)
})
```

## Los problemas

1. **Importación incorrecta.** Usa `@playwright/test`. El equipo importa desde `../lib/test`.
2. **Nombres malos.** "test 1" y "test 2" no dicen nada. El nombre debe decir lo que ve el usuario.
3. **URLs completas.** `http://localhost:5190/...` está fija en el test. La configuración tiene `baseURL`, así que usa `/products`.
4. **Login por la interfaz.** La configuración ya inicia sesión como admin en todos los tests. Los pasos de login son lentos y no hacen falta.
5. **Selectores CSS y de texto.** `input[type=email]`, `tr:nth-child(1) .danger` y `text=Delete` se rompen cuando cambian el diseño o las palabras. El equipo usa test ids.
6. **`text=Delete` coincide con muchos elementos.** Cada fila tiene un botón Delete, y el diálogo también tiene uno. Es el problema del modo estricto (*strict mode*).
7. **Esperas fijas.** `waitForTimeout(3000)` y `waitForTimeout(2000)` son lentas y flaky.
8. **Sin una comprobación que espere.** `count()` lee una sola vez y el `expect` simple no reintenta. Usa `toHaveCount`.
9. **Borra la primera fila.** Esos son datos semilla. Rompe los otros tests que los usan.
10. **El test 2 depende del test 1.** El test 1 borra la primera fila, que es el producto más nuevo, "Docking Station" con datos nuevos. El test 2 luego lo busca y espera un `tr`. Ese único `tr` es solo la fila del encabezado, así que el test 2 pasa solo después del test 1. Solo, falla.
11. **Comprobaciones débiles.** `count()` cuenta también la fila del encabezado. En el test 1, el número 10 no dice nada sobre el producto borrado.

## La versión corregida

```ts
import { expect, test } from "../lib/test"
import { createProduct } from "../lib/fixtures/api-client"
import { uniqueName } from "../lib/helpers"
import { ProductsPage } from "../lib/pages/products.page"

test("confirming in the dialog removes the product", async ({ page, request }) => {
  const product = await createProduct(request)
  const products = new ProductsPage(page)
  await products.goto()
  await expect(products.row(product.id)).toBeVisible()

  await products.delete(product.id)

  await expect(products.row(product.id)).toHaveCount(0)
})

test("searching by name shows only that product", async ({ page, request }) => {
  const product = await createProduct(request, { name: uniqueName("Searchable") })
  const products = new ProductsPage(page)
  await products.goto()
  await expect(products.row(product.id)).toBeVisible()

  await products.search(product.name)

  await expect(products.rows).toHaveCount(1)
})
```

Compara el resultado con la lista de comprobación. Los dos tests crean su propio producto, usan test ids por medio del Page Object, esperan con aserciones y pasan en cualquier orden.

## Práctica

1. Elige un spec que escribiste en el módulo 3, o uno de este módulo. Recorre la lista de comprobación. Marca cada línea con sí o no.
2. Corrige cada "no".
3. Crea el archivo `apps/practice-shop/e2e/products/review-practice.spec.ts`. Pega en él la versión corregida de arriba.
4. Inicia la tienda con `pnpm shop:dev`. En otra terminal ejecuta:

```bash
pnpm shop:e2e products/review-practice.spec.ts --repeat-each 3
```

5. Los dos tests deben pasar todas las veces. Si no, lee el error y la trace.
6. Escribe un tercer test en el mismo archivo. Usa el estilo corregido para comprobar que el filtro de estado muestra solo los productos archivados. Usa `createProduct(request, { status: "archived" })` y `products.filterByStatus("archived")`.

## Comprueba lo que sabes

1. Nombra tres puntos de la lista de comprobación sobre las esperas.

<details><summary>Respuesta</summary>

No hay `waitForTimeout`. Cada comprobación es una aserción web-first. No hay un `expect` simple sobre un valor de `count()` o `textContent()`.

</details>

2. ¿Por qué `test("test 1")` es un mal nombre?

<details><summary>Respuesta</summary>

No dice lo que ve el usuario. Cuando falla, nadie sabe qué se rompió.

</details>

3. ¿Por qué es un problema borrar la primera fila de la tabla?

<details><summary>Respuesta</summary>

Son datos semilla compartidos. Otros tests pueden necesitarlos. Un test debe crear y borrar sus propios datos.

</details>

4. ¿Cómo dejas un test listo para la revisión?

<details><summary>Respuesta</summary>

Aplica tú mismo la lista de comprobación y corrige cada punto. Luego ejecuta el test solo y varias veces.

</details>

## Siguiente paso

Terminaste las buenas prácticas. En el siguiente módulo usarás estas habilidades en un proyecto real.
