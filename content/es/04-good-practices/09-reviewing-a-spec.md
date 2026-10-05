---
title: Revisar un spec
summary: Usa una lista de comprobación en tu propio spec antes de la revisión y luego corrige paso a paso un spec deliberadamente malo.
duration: 50 min
---

## Objetivo

- Aplicar una lista de comprobación a tu propio spec antes de pedir una revisión.
- Detectar los problemas comunes en un spec malo.
- Reescribir un spec malo para que siga las convenciones del equipo.

## Por qué revisar primero tu propio spec

El tiempo de un revisor es limitado. Si debe escribir "usa `getByTestId`" por décima vez, no tiene tiempo para hacer la pregunta útil: ¿este test comprueba lo correcto?

Lee tu spec una vez, con una lista de comprobación, antes de pedir revisión. La mayoría de los comentarios desaparecen.

## La lista de comprobación

**Convenciones**

- `test` y `expect` se importan desde `lib/test`, no desde `@playwright/test`.
- Cada elemento se selecciona con `getByTestId`. Sin CSS, sin XPath, sin selectores de texto para lo que se pulsa.
- La URL usa una ruta como `/products`. La configuración define la dirección base.
- El estilo coincide con el del proyecto: comillas dobles, sin punto y coma, 2 espacios.

**Independencia**

- El test pasa solo, en cualquier orden y dos veces seguidas.
- El test crea sus propios datos, con `uniqueName` y `uniqueSku` o `createProduct`.
- El test no cambia datos que usan otros tests, como un registro semilla.

**Esperas**

- No hay `page.waitForTimeout`.
- Cada comprobación usa una aserción web-first: `await expect(locator)...`.
- No hay un `count()` o `textContent()` seguido de un `expect` simple.

**Nombres y legibilidad**

- El nombre del test dice lo que ve el usuario, como "confirming in the dialog removes the product" (confirmar en el diálogo elimina el producto).
- Un comportamiento por test.
- Los pasos van en este orden: preparar, actuar, comprobar. Una línea en blanco los separa.
- El mismo locator, la misma preparación o la misma creación de datos no se repite en muchos tests. Cuando aparece por tercera vez, muévelo a un Page Object, a un fixture o a un helper.

**Limpieza**

- Los datos que no deben quedarse se borran, ya sea por el test o por un fixture.
- El test no cierra la sesión compartida del administrador.

## Un spec malo

Este spec es malo a propósito. Rompe muchas reglas. Léelo y encuentra los problemas antes de leer la lista.

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
3. **URL completas.** `http://localhost:5190/...` está fijo en el test. La configuración tiene `baseURL`, así que usa `/products`.
4. **Login por la interfaz.** La configuración ya inicia la sesión de cada test como administrador. Los pasos de login son lentos y no hacen falta.
5. **Selectores CSS y de texto.** `input[type=email]`, `tr:nth-child(1) .danger` y `text=Delete` se rompen cuando cambia el diseño o las palabras. El equipo usa test ids.
6. **`text=Delete` coincide con muchos elementos.** Cada fila tiene un botón Delete, y el diálogo también tiene uno. Este es el problema del modo estricto.
7. **Esperas fijas.** `waitForTimeout(3000)` y `waitForTimeout(2000)` son lentas y flaky.
8. **Sin comprobación que espere.** `count()` lee una sola vez y el `expect` simple no reintenta. Usa `toHaveCount`.
9. **Borra la primera fila.** Es un dato semilla. Rompe los otros tests que lo usan.
10. **El test 2 depende del test 1.** El test 1 borra la primera fila, que es el producto más nuevo, "Docking Station" con datos nuevos. Luego el test 2 lo busca y espera un `tr`. Ese único `tr` es solo la fila del encabezado, así que el test 2 pasa solo después del test 1. Solo, falla.
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

Compara el resultado con la lista de comprobación. Los dos tests crean su propio producto, usan test ids mediante el Page Object, esperan con aserciones y pasan en cualquier orden.

## Profundiza

### Por qué una lista de comprobación es mejor que la memoria

Ya conoces la mayoría de estas reglas. Aun así, olvidas algunas cuando estás cansado o con prisa. Los pilotos y los cirujanos usan listas de comprobación por la misma razón. Una lista convierte "haz un buen spec" en pequeñas preguntas de sí o no. Cada línea de esta lista viene de un problema que viste en este módulo. Escribir las reglas una vez y leerlas cada vez también es DRY: el conocimiento vive en una lista, no en la cabeza de cada persona.

### Una idea equivocada común: un test que pasa es un buen test

Un test en verde solo dice que ninguna aserción falló. No dice que el test pueda fallar. Mira este final de un test de borrado:

```ts
await products.delete(product.id)

await expect(page.getByTestId("product-row-" + product.id)).toHaveCount(0)
```

El id está mal. El id real es `products-row-`, con una `s`. Ningún elemento tiene nunca el id equivocado, así que el conteo siempre es 0. El test pasa aunque el borrado no haga nada. Una comprobación que no puede fallar es peor que no tener comprobación, porque da una confianza falsa.

Cómo encontrar un test así: haz que falle a propósito. Comenta la línea de borrar, o cambia el valor esperado, y ejecútalo. Si todavía pasa, no comprueba nada. El spec real se protege de otra manera. Primero espera a que `products.row(product.id)` sea visible, así sabes que el id es correcto, y solo entonces borra.

### Cómo aparece en el trabajo de QA: revisa primero la idea

Cuando revisas, lee primero el nombre del test y pregunta: ¿qué riesgo protege? Después pregunta si los pasos y las comprobaciones coinciden con ese nombre. El estilo va en segundo lugar. Un test con un estilo perfecto que no comprueba nada es peor que un test feo que atrapa bugs.

Busca también la duplicación. Cuando tres tests empiezan con las mismas diez líneas, un revisor pedirá un helper, un fixture o un Page Object. La próxima lección muestra cómo elegir, y cuándo dejar la repetición como está.

### Un límite de las listas de comprobación

Una lista de comprobación es un piso, no un techo. Encuentra los problemas que ya conoces. No puede decirte si olvidaste un escenario importante. Úsala, y después usa tu propio criterio como tester.

## Práctica

1. Elige un spec que escribiste en el módulo 3, o uno de este módulo. Recorre la lista de comprobación. Marca cada línea con sí o no.
2. Corrige cada "no".
3. Crea el archivo `apps/practice-shop/e2e/products/review-practice.spec.ts`. Pega en él la versión corregida de arriba.
4. Inicia la tienda con `pnpm shop:dev`. En otra terminal ejecuta:

```bash
pnpm shop:e2e products/review-practice.spec.ts --repeat-each 3
```

5. Los dos tests deben pasar todas las veces. Si no, lee el error y el trace.
6. Escribe un tercer test en el mismo archivo. Usa el estilo corregido para comprobar que el filtro de estado muestra solo los productos archivados. Usa `createProduct(request, { status: "archived" })` y `products.filterByStatus("archived")`.

## Comprueba lo que sabes

1. Nombra tres puntos de la lista sobre las esperas.

<details><summary>Respuesta</summary>

No hay `waitForTimeout`. Cada comprobación es una aserción web-first. No hay un `expect` simple sobre un valor de `count()` o `textContent()`.

</details>

2. ¿Por qué `test("test 1")` es un mal nombre?

<details><summary>Respuesta</summary>

No dice lo que ve el usuario. Cuando falla, nadie sabe qué se rompió.

</details>

3. ¿Por qué es un problema borrar la primera fila de la tabla?

<details><summary>Respuesta</summary>

Es un dato semilla compartido. Otros tests pueden necesitarlo. Un test debe crear y borrar sus propios datos.

</details>

4. ¿Cómo dejas un test listo para revisión?

<details><summary>Respuesta</summary>

Aplica tú mismo la lista de comprobación y corrige cada punto, y luego ejecuta el test solo y varias veces.

</details>

5. Este test pasa. ¿Por qué no puedes confiar en él? ¿Cómo comprobarías tu duda?

```ts
await products.delete(product.id)

await expect(page.getByTestId("product-row-" + product.id)).toHaveCount(0)
```

<details><summary>Respuesta</summary>

El test id tiene un error de escritura: es `product-row-`, pero el real es `products-row-`. Ningún elemento tiene ese id, así que el conteo siempre es 0, incluso cuando el borrado falla. Para comprobarlo, quita la línea `products.delete(...)` y ejecuta el test. Sigue pasando, así que no puede detectar un borrado roto.

</details>

6. Un revisor escribe: "Por favor usa `getByRole` aquí, es mejor para la accesibilidad." La regla del equipo en el README dice que se use `getByTestId`. ¿Qué debes hacer?

<details><summary>Respuesta</summary>

Sigue la regla escrita en este *pull request*, para que el código se mantenga consistente. Luego agradece al revisor e inicia una conversación con el equipo: si todos están de acuerdo en que los roles son mejores, cambien la regla y migren todos los tests juntos. Una mezcla de dos estilos en una suite es más difícil de leer que cualquiera de los dos estilos solo.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué hace que una revisión de código sea útil y respetuosa?**
   - Busca: `code review best practices small changes comments`
   - Una buena respuesta explica: al menos tres hábitos de los buenos revisores y de los buenos autores.

2. **¿Qué son las pruebas de mutación y cómo comprueban que los tests pueden fallar?**
   - Busca: `mutation testing explained`
   - Una buena respuesta explica: cómo la herramienta cambia el código a propósito y qué te dice un mutante que sobrevive.

3. **¿Qué son los test smells (malos olores en los tests), como assertion roulette o mystery guest?**
   - Busca: `test smells assertion roulette mystery guest`
   - Una buena respuesta explica: al menos dos smells con nombre, cómo se ve cada uno y cómo corregirlo.

## Siguiente paso

En la próxima lección aprendes DRY en la automatización de tests: cómo quitar de un spec el conocimiento repetido, y cuándo dejar un poco de repetición para que cada test siga siendo fácil de leer.
