---
title: Revisar un spec
duration: 65 min
---

## Objetivo

En esta lección revisas un spec antes de pedir una revisión y compruebas que sus aserciones detectan un comportamiento roto.

- Aplicar una lista de control al spec.
- Encontrar los problemas de un spec y comparar su versión corregida.
- Hacer fallar un test a propósito para comprobar qué detecta.
- Resolver comentarios de revisión según el comportamiento y las convenciones del equipo.

## La lista de control

Lee primero el nombre del test y comprueba que sus pasos y aserciones cubren ese comportamiento. Después revisa las convenciones y la preparación de datos con esta lista.

**Convenciones**

- `test` y `expect` se importan desde `lib/test`, no desde `@playwright/test`.
- Los elementos se eligen con `getByTestId`. Sin CSS, sin XPath, sin selectores de texto para lo que haces clic.
- La URL usa una ruta como `/products`. La configuración define la dirección base.
- El estilo coincide con el del proyecto: comillas dobles, sin punto y coma, 2 espacios.

**Independencia**

- El test pasa solo, en cualquier orden y dos veces seguidas.
- El test crea sus propios datos, con `uniqueName` y `uniqueSku` o `createProduct`.
- El test no cambia datos que usan otros tests, como un registro de la semilla.

**Esperas**

- No hay `page.waitForTimeout`.
- Las comprobaciones sobre el estado de la página usan aserciones que esperan: `await expect(locator)...`.
- No hay un `count()` o `textContent()` seguido de un `expect` simple.

**Nombres y legibilidad**

- El nombre del test dice lo que ve el usuario, como "confirming in the dialog removes the product".
- Un comportamiento por test.
- Los pasos van en este orden: preparar, actuar, comprobar. Una línea en blanco los separa.
- Cuando un locator o una preparación se repite por tercera vez, muévelo a un page object, un fixture o un helper.

**Detección de fallos**

- Probaste que el test se pone rojo cuando el comportamiento que comprueba deja de ocurrir.

**Limpieza**

- Los datos que no deben quedarse se borran, ya sea en el test o en un fixture.
- El test no cierra la sesión compartida del administrador.

Comprueba el resultado visible de la acción. `toHaveText("Name must have at least 3 characters.")` verifica el mensaje que lee el usuario. Una aserción sobre `text-destructive` depende de una clase de estilo que puede cambiar aunque la validación siga funcionando.

La lista ayuda a encontrar errores conocidos; revisar los escenarios que faltan sigue siendo parte de tu trabajo como tester.

## Un spec malo

Este spec rompe las convenciones y usa datos compartidos:

```ts
import { test, expect } from "@playwright/test"

test("test 1", async ({ page }) => {
  await page.goto("http://localhost:5190/login")
  await page.fill("input[type=email]", "admin@qa-shop.test")
  await page.fill("input[type=password]", "Admin123!")
  await page.click("button[type=submit]")
  await page.waitForTimeout(3000)
  await page.goto("http://localhost:5190/products")
  await page.click("tbody tr:first-child .text-destructive")
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

1. Importa desde `@playwright/test`. El equipo importa desde `../lib/test`.
2. Los nombres "test 1" y "test 2" no indican qué comportamiento comprueban.
3. `http://localhost:5190/...` fija la dirección en el test. La configuración tiene `baseURL`, así que usa `/products`.
4. La configuración ya carga la sesión del administrador en cada test. El login por la interfaz es innecesario aquí.
5. `input[type=email]`, `.text-destructive` y `text=Delete` dependen del diseño o del texto. El equipo usa test ids.
6. `text=Delete` coincide con los botones de las filas y el del diálogo. `page.click` toma la primera coincidencia, un botón de fila. `page.getByText("Delete")` fallaría por modo estricto al encontrar varias coincidencias.
7. `waitForTimeout(3000)` y `waitForTimeout(2000)` esperan un tiempo fijo, aunque la página esté lista antes o necesite más tiempo.
8. `count()` lee una sola vez y el `expect` simple no reintenta. `toHaveCount` vuelve a consultar el locator hasta que coincide el conteo o se agota su timeout.
9. Borra la primera fila, un producto de la semilla que otros tests pueden necesitar.
10. El test 2 depende del test 1: con datos nuevos, el primer producto es "Docking Station". Si se borra, la búsqueda deja solo el encabezado y el conteo de `tr` da 1. Solo, el test 2 falla. El spec puede fallar antes: `/login` redirige al administrador al dashboard, y `text=Delete` puede seleccionar un botón detrás del diálogo. Para observar la dependencia, el test 1 necesita un navegador sin sesión y confirmar con `confirm-delete-button`.
11. `count()` incluye el encabezado. Con 10 productos en la página, `locator("tr")` encuentra 11, así que el número 10 es incorrecto. Aun con el número correcto, la aserción no identifica el producto borrado.

## La versión corregida

Los tests crean sus propios productos y usan el page object para actuar sobre sus ids:

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

Las aserciones esperan a que aparezca la fila antes de actuar. La comprobación del borrado usa el mismo locator para confirmar que esa fila desaparece.

## Comprueba que el test puede fallar

Este test puede pasar aunque el botón Delete no borre el producto:

```ts
test("confirming in the dialog removes the product", async ({ page, request }) => {
  const product = await createProduct(request)
  const products = new ProductsPage(page)
  await products.goto()
  await expect(products.row(product.id)).toBeVisible()

  await products.delete(product.id)

  await expect(page.getByTestId("product-row-" + product.id)).toHaveCount(0)
})
```

La última línea busca `product-row-` más el id. El test id real es `products-row-`, con una `s`. Playwright encuentra cero elementos con el id equivocado, así que `toHaveCount(0)` pasa sin comprobar el borrado.

La comprobación inicial usa `products.row(product.id)`, pero la final usa otro locator. Comprueba que la fila estaba visible y que desaparece con el mismo locator, como en la versión corregida.

Para probar que el test detecta el fallo, comenta la línea de borrar o cambia el valor esperado y ejecútalo. Si aún pasa, no comprueba nada. Esta es una versión pequeña y hecha a mano de las **pruebas de mutación** (*mutation testing*): cambias un poco el código y ves si los tests lo notan. Restaura el cambio después de la prueba.

## Profundiza

### Una promesa en lugar del resultado

Esta aserción recibe una promesa porque falta `await`:

```ts
await products.delete(product.id)

expect(products.row(product.id).isVisible()).toBeFalsy()
```

`isVisible()` devuelve una promesa, que es un objeto truthy. Por eso `toBeFalsy()` falla de inmediato. Si lo cambias a `toBeTruthy()`, pasa aunque la fila no esté visible: la aserción evalúa la promesa, no su resultado.

### Resolver comentarios de revisión

Un comentario útil indica qué línea tiene un problema, qué comportamiento afecta y qué cambio propone. Corrige un bug en las comprobaciones antes de discutir el estilo.

Si alguien pide `getByRole` y la regla escrita del equipo exige `getByTestId`, sigue la convención en ese cambio y conversa con el equipo sobre modificarla. Si el comentario descubre un bug de accesibilidad, repórtalo aparte.

## Práctica

1. Elige un spec que escribiste en el módulo 3 o en este módulo. Recorre la lista de control y marca cada línea con sí o no.
2. Arregla cada "no".
3. Crea el archivo `apps/practice-shop/e2e/products/review-practice.spec.ts` y pega la versión corregida.
4. Inicia la tienda con `pnpm shop:dev`. En otra terminal ejecuta:

```bash
pnpm shop:e2e products/review-practice.spec.ts --repeat-each 3
```

Los dos tests deben pasar todas las veces. Si no, lee el error y el trace.

5. Pon dos barras al inicio de la línea `await products.delete(product.id)` y ejecuta de nuevo. El primer test debe ponerse rojo. Quita las barras.
6. Escribe un tercer test en el mismo archivo para comprobar que el filtro de estado muestra solo los productos archivados. Usa `createProduct(request, { status: "archived" })` y `products.filterByStatus("archived")`.

## Reto

Escribe un test para el botón Cancel del diálogo de borrar. Crea tres copias rotas, llamadas mutantes, que cambien una sola cosa cada una. Márcalas como fallos esperados para demostrar que las aserciones detectan esos cambios.

Crea el archivo `apps/practice-shop/e2e/challenges/review-cancel.spec.ts`.

Está terminado cuando:

- El test real abre el diálogo de borrar de un producto creado por la API, cancela y comprueba que el diálogo desaparece y la fila sigue ahí.
- Hay tres tests mutantes marcados como fallo esperado. Cada uno cambia exactamente una cosa y su título indica cuál.
- Al menos un mutante usa un test id equivocado y tiene que fallar.
- `pnpm shop:e2e challenges/review-cancel.spec.ts` termina con 5 passed: los cuatro tests y el setup. Quita temporalmente la marca de fallo esperado de un mutante y comprueba que se pone rojo.

Necesitarás marcar un test como fallo esperado en Playwright. Busca: `playwright test.fail annotation`, `mutation testing explained`.

## Piénsalo bien

1. Este test puede pasar aunque el filtro esté roto. Encuentra el bug.

```ts
test("the Active filter hides an archived product", async ({ page, request }) => {
  const product = await createProduct(request, { status: "archived" })
  const products = new ProductsPage(page)
  await products.goto()
  await products.filterByStatus("active")

  await expect(products.row(product.id)).toHaveCount(0)
})
```

<details><summary>Respuesta</summary>

Si la tabla aún no ha cargado, `toHaveCount(0)` ya es verdadero. Espera primero a que `products.row(product.id)` sea visible; después filtra y comprueba que desaparece.

</details>

2. Juntas tres tests independientes en uno con tres comprobaciones. La primera aserción falla. ¿Qué resultados pierdes?

<details><summary>Respuesta</summary>

La aserción fallida detiene ese test, así que las otras dos comprobaciones no se ejecutan. Como tests separados, los otros comportamientos pueden ejecutarse y mostrar sus propios resultados.

</details>

3. Los desarrolladores renombran los test ids de las filas de `products-row-<id>` a `product-row-<id>`. ¿Qué pasa con los tests que comprueban visibilidad y con los que solo comprueban ausencia?

<details><summary>Respuesta</summary>

Los tests que esperan a que `products.row(id)` sea visible fallan porque el locator ya no encuentra la fila. Los que solo comprueban `toHaveCount(0)` sobre el id anterior siguen verdes, aunque la fila exista con el nombre nuevo.

</details>

## Siguiente paso

En la próxima lección aprendes DRY en la automatización de tests: cómo quitar el conocimiento repetido de un spec, y cuándo dejar un poco de repetición para que cada test siga siendo fácil de leer.
