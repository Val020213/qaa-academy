---
title: Revisar un spec
summary: Revisa tu propio spec con una lista de control, demuestra que un test puede fallar y arregla paso a paso un spec malo hecho a propósito.
duration: 80 min
---

## Empieza con un acertijo

Este *test* (prueba automática) lleva seis meses en verde. La semana pasada un desarrollador rompió la función de borrar: el botón Delete (Borrar) no hace nada. El test sigue en verde. Nadie lo saltó y no tiene errores de sintaxis.

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

Un test verde que no puede ponerse rojo es peor que no tener test. Mira la última línea. ¿Por qué no puede fallar?

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Revisar tu propio *spec* (archivo de tests) con una lista de control antes de pedir una revisión.
- Demostrar que un test puede fallar y encontrar tests que no pueden.
- Reescribir un spec malo para que siga las convenciones del equipo.
- Juzgar un comentario de revisión: arreglarlo ya, hablarlo o dejarlo.

## Por qué revisar primero tu propio spec

El tiempo de quien revisa es limitado. Si tiene que escribir "usa `getByTestId`" por décima vez, no le queda tiempo para la pregunta útil: ¿este test comprueba lo correcto?

Lee tu spec una vez, con una lista de control, antes de pedir la revisión. La mayoría de los comentarios desaparecen.

## La lista de control

**Convenciones**

- `test` y `expect` se importan desde `lib/test`, no desde `@playwright/test`.
- Cada elemento se elige con `getByTestId`. Sin CSS, sin XPath, sin selectores de texto para lo que haces clic.
- La URL usa una ruta como `/products`. La configuración define la dirección base.
- El estilo coincide con el del proyecto: comillas dobles, sin punto y coma, 2 espacios.

**Independencia**

- El test pasa solo, en cualquier orden y dos veces seguidas.
- El test crea sus propios datos, con `uniqueName` y `uniqueSku` o `createProduct`.
- El test no cambia datos que usan otros tests, como un registro de la semilla (*seed*).

**Esperas**

- No hay `page.waitForTimeout`.
- Cada comprobación usa una aserción que espera (*web-first*): `await expect(locator)...`.
- No hay un `count()` o `textContent()` seguido de un `expect` simple.

**Nombres y legibilidad**

- El nombre del test dice lo que ve el usuario, como "confirming in the dialog removes the product".
- Un comportamiento por test.
- Los pasos van en este orden: preparar, actuar, comprobar. Una línea en blanco los separa.
- El mismo *locator* (forma de encontrar un elemento), la misma preparación o la misma creación de datos no se repite en muchos tests. Cuando aparece por tercera vez, muévela a un *page object* (clase que agrupa lo de una página), un *fixture* (preparación reutilizable) o un *helper* (función de ayuda).

**¿Puede fallar?**

- Si la función se rompiera, este test se pondría rojo. Lo sabes porque lo probaste.

**Limpieza**

- Los datos que no deben quedarse se borran, ya sea en el test o en un fixture.
- El test no cierra la sesión compartida del administrador.

## Un spec malo

Este spec es malo a propósito. Rompe muchas reglas. Antes de leer la lista, toma un lápiz y encuentra todos los problemas que puedas. Cuéntalos. Luego compara.

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

1. **Importación equivocada.** Usa `@playwright/test`. El equipo importa desde `../lib/test`.
2. **Nombres malos.** "test 1" y "test 2" no dicen nada. El nombre debe decir lo que ve el usuario.
3. **URL completas.** `http://localhost:5190/...` está fija en el test. La configuración tiene `baseURL`, así que usa `/products`.
4. **Login por la interfaz.** La configuración ya inicia sesión como administrador en cada test. Los pasos de *login* (inicio de sesión) son lentos y no hacen falta.
5. **Selectores CSS y de texto.** `input[type=email]`, `.text-destructive` y `text=Delete` se rompen cuando cambia el diseño o las palabras. La clase `.text-destructive` es una clase de estilo: es un color, no un significado. El equipo usa test ids.
6. **`text=Delete` coincide con muchos elementos.** Cada fila tiene un botón Delete, y el diálogo también tiene uno. `page.click` no se queja: toma en silencio la primera coincidencia, que es un botón de una fila y no el botón de confirmar del diálogo. En cambio, un locator como `page.getByText("Delete")` se detendría con un error de modo estricto (*strict mode*). Ese error es útil: te dice que el selector es demasiado amplio.
7. **Esperas fijas.** `waitForTimeout(3000)` y `waitForTimeout(2000)` son lentas y *flaky* (inestables).
8. **Sin comprobación que espere.** `count()` lee una sola vez y un `expect` simple no reintenta. Usa `toHaveCount`.
9. **Borra la primera fila.** Son datos de la semilla. Rompe los otros tests que los usan.
10. **El test 2 depende del test 1.** El test 1 borra la primera fila, que es el producto más nuevo, "Docking Station" con datos nuevos. El test 2 luego lo busca y espera un `tr`. Ese único `tr` es solo la fila del encabezado, así que el test 2 pasa solo después del test 1. Solo, falla. (Si ejecutas este spec malo tal cual, quizá ni llegues ahí. La configuración ya te inicia sesión, así que `/login` envía al test 1 directo al *dashboard* (panel) y el llenado del correo se agota por tiempo. Además, `text=Delete` puede darle a un botón de fila que está detrás del diálogo abierto. Para ver el problema de datos, empieza el test 1 en un navegador sin sesión y haz clic en `confirm-delete-button`.)
11. **Comprobaciones débiles.** `count()` cuenta también la fila del encabezado. Con 10 productos en la página, `locator("tr")` encuentra 11, así que el número 10 es incorrecto. Aun con el número correcto, no dice nada sobre el producto borrado.

¿Cuántos encontraste? Si encontraste ocho o más por tu cuenta, la lista ya está en tu cabeza. Encontrar menos es normal. Usa la lista en cada spec hasta que sea un hábito.

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

Revisa el resultado con la lista de control. Los dos tests crean su propio producto, usan test ids a través del page object, esperan con aserciones y pasan en cualquier orden.

### De vuelta al acertijo

La última línea busca `product-row-` más el id. El test id real es `products-row-`, con una `s`. Ningún elemento tiene nunca el id equivocado, así que la cuenta siempre es 0. El test pasa aunque borrar no haga nada.

El spec real se protege de una segunda forma. Primero espera a que `products.row(product.id)` sea visible. Eso prueba que el id es correcto, porque la fila se encontró. Solo entonces borra y comprueba que la fila ya no está. Una comprobación de "ya no está" necesita antes una comprobación de "estaba".

## Profundiza

### Por qué una lista de control vence a la memoria

Ya conoces la mayoría de estas reglas. Aun así, olvidas algunas cuando estás cansado o con prisa. Los pilotos y los cirujanos usan listas de control por la misma razón. Una lista convierte "haz un buen spec" en preguntas pequeñas de sí o no. Cada línea de esta lista viene de un problema que viste en este módulo. Escribir las reglas una vez y leerlas cada vez también es DRY (no te repitas): el conocimiento vive en una lista, no en la cabeza de cada persona.

### Una idea equivocada común: un test que pasa es un buen test

Un test verde solo dice que ninguna aserción falló. No dice que el test pueda fallar. El acertijo mostró una forma. Aquí hay otra, con una causa distinta:

```ts
await products.delete(product.id)

expect(products.row(product.id).isVisible()).toBeFalsy()
```

No hay `await`. `isVisible()` devuelve una promesa, y una promesa es un objeto. Un objeto es verdadero (*truthy*), así que aquí `toBeFalsy()` falla de inmediato y el test está rojo. Cámbialo a `toBeTruthy()` y el test siempre está verde. Los dos errores enseñan la misma lección: una comprobación que no puede fallar da una falsa confianza.

Cómo encontrar un test así: haz que falle a propósito. Comenta la línea de borrar, o cambia el valor esperado, y ejecútalo. Si aún pasa, no comprueba nada. Esta es una versión pequeña y hecha a mano de las **pruebas de mutación** (*mutation testing*): cambias un poco el código y ves si los tests lo notan.

### Cómo aparece en el trabajo de QA: revisa primero la idea

Cuando revisas, lee primero el nombre del test y pregunta: ¿qué riesgo protege? Luego pregunta si los pasos y las comprobaciones coinciden con ese nombre. El estilo va después. Un test con un estilo perfecto que no comprueba nada es peor que un test feo que atrapa bugs.

Busca también la duplicación. Cuando tres tests empiezan con las mismas diez líneas, quien revisa pedirá un helper, un fixture o un page object. La próxima lección muestra cómo elegir, y cuándo dejar la repetición como está.

### Prueba lo que ve el usuario, no cómo está construido el código

Una buena revisión también pregunta: ¿esto comprueba algo que un usuario puede ver? `toHaveText("Name must have at least 3 characters.")` es lo que el usuario lee. Una comprobación sobre una clase CSS como `text-destructive` es cómo está construido el código. Si los desarrolladores cambian el color, la clase cambia y el test falla, pero el usuario no ve nada raro. Prefiere lo visible.

### Revisar con un asistente de IA

Puedes pedirle a un asistente de IA que revise un spec o que sugiera una versión mejor. Es un segundo par de ojos rápido. Úsalo con una regla: debes ejecutar el código y debes poder explicar cada línea a un compañero. Nunca pegues código que no puedas explicar. Un asistente puede escribir un test que pasa y que no puede fallar, igual que el del acertijo. Tu trabajo es descubrirlo.

### Un límite de las listas de control

Una lista de control es un piso, no un techo. Encuentra los problemas que ya conoces. No puede decirte si olvidaste un escenario importante. Úsala, y después usa tu propio criterio como tester.

## Práctica

1. Elige un spec que escribiste en el módulo 3, o uno de este módulo. Recorre la lista de control. Marca cada línea con sí o no.
2. Arregla cada "no".
3. Crea el archivo `apps/practice-shop/e2e/products/review-practice.spec.ts`. Pega en él la versión corregida de arriba.
4. Inicia la tienda con `pnpm shop:dev`. En otra terminal ejecuta:

```bash
pnpm shop:e2e products/review-practice.spec.ts --repeat-each 3
```

5. Los dos tests deben pasar todas las veces. Si no, lee el error y el *trace* (registro paso a paso de la ejecución).
6. Comprueba que el primer test puede fallar. Pon dos barras al inicio de la línea `await products.delete(product.id)` y ejecuta de nuevo. Debe ponerse rojo. Quita las barras.
7. Escribe un tercer test en el mismo archivo. Usa el estilo corregido para comprobar que el filtro de estado muestra solo los productos archivados. Usa `createProduct(request, { status: "archived" })` y `products.filterByStatus("archived")`.

## Reto

Instrucciones: un test solo vale lo que dice su nombre si puede fallar. Vas a escribir un test para el botón Cancel (Cancelar) del diálogo de borrar, y luego vas a demostrar que puede fallar. Para la prueba, escribes tres copias rotas del test, llamadas mutantes. Cada mutante cambia una sola cosa. Cada mutante debe ponerse rojo, y le dices a Playwright que lo espere.

Crea el archivo `apps/practice-shop/e2e/challenges/review-cancel.spec.ts`.

Está terminado cuando:

- Un test real abre el diálogo de borrar de un producto que creó por la API, cancela, y comprueba que el diálogo ya no está y que la fila sigue ahí.
- Existen tres tests mutantes, cada uno marcado como fallo esperado, y cada uno cambia exactamente una cosa del test real. El título de cada uno dice qué cambia.
- Al menos un mutante usa un test id equivocado, como en el acertijo, y aun así tiene que fallar.
- `pnpm shop:e2e challenges/review-cancel.spec.ts` termina con 5 passed: tus cuatro tests y el test de preparación (*setup*). Luego quita temporalmente la marca de fallo esperado de un mutante y míralo ponerse rojo.

Vas a necesitar algo que esta lección no enseñó: cómo marcar un test como "se espera que falle" en Playwright, de modo que la ejecución quede en verde solo cuando el test falla. Busca: `playwright test.fail annotation`, `mutation testing explained`.

## Piénsalo bien

1. **Predice.** Ejecuta solo el "test 2" malo de esta lección, con datos nuevos. ¿Pasa? Explica por qué, en dos frases.

<details><summary>Respuesta</summary>

Falla. `count()` lee una sola vez. Justo después de escribir, puede ver toda la lista, 10 filas y un encabezado, o sea 11. Cuando el filtro ya funcionó, ve una fila de datos y una fila de encabezado, o sea 2. Nunca devuelve 1. El test solo pasa por casualidad en el orden original, porque el test 1 borró antes "Docking Station". Entonces la búsqueda muestra cero filas de datos y solo queda la fila del encabezado, así que la cuenta es 1. El test está verde por la razón equivocada, y eso es peor que estar rojo.

</details>

2. **Encuentra el bug.** El código se ejecuta sin errores. Puede pasar aunque el filtro esté roto. ¿Por qué?

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

Justo después de `goto`, la tabla aún no ha cargado, así que no existe ninguna fila y `toHaveCount(0)` ya es verdadero. El test puede pasar antes de que el filtro haga algo. Pasaría con un filtro roto. La solución es esperar primero a que `products.row(product.id)` sea visible, luego filtrar y después comprobar que ya no está. Una comprobación de "ya no está" necesita antes una comprobación de "estaba".

</details>

3. **Dos versiones.** Quien revisa dice: "Tus tres tests crean cada uno un producto y abren la página. Júntalos en un solo test con tres comprobaciones, para ahorrar tiempo." Las dos versiones funcionan. ¿Cuál es mejor, y qué te haría elegir la otra?

<details><summary>Respuesta</summary>

Tres tests son mejores en la mayoría de los casos. Cuando uno falla, el título dice qué comportamiento se rompió, y los otros dos siguen corriendo y muestran su resultado. Un solo test largo se detiene en la primera comprobación que falla y oculta el resto. Júntalos cuando la preparación sea muy lenta, por ejemplo una importación de datos que tarda minutos, y todas las comprobaciones miren el mismo estado. Aquí la preparación es una sola llamada rápida a la API, así que el ahorro es mínimo.

</details>

4. **Qué se rompe si.** Los desarrolladores renombran los test ids de las filas de `products-row-<id>` a `product-row-<id>`. ¿Qué tests de los tuyos se ponen rojos, cuáles siguen verdes, y qué grupo es más peligroso?

<details><summary>Respuesta</summary>

Los tests que esperan a que `products.row(id)` sea visible se ponen rojos, porque no se encuentra la fila. Los tests que solo comprueban `toHaveCount(0)` sobre una fila, sin una comprobación de visible antes, siguen verdes, y seguirán verdes para siempre. El grupo verde es el más peligroso. Muestra justo por qué compruebas "estaba" antes de "ya no está", y por qué intentas hacer fallar un test al menos una vez.

</details>

5. **Explícalo.** Explica a un compañero nuevo por qué pasas la lista de control por tu propio spec antes de la revisión. Usa tres frases y no uses la palabra "regla".

<details><summary>Respuesta</summary>

Una buena respuesta: "Quien revisa tiene poco tiempo, así que yo quito primero los problemas pequeños. Así puede dedicar su tiempo a la pregunta que importa: si el test protege algo real. También me enseña a mí, porque cada línea de la lista viene de un error que alguien ya cometió." La idea es que proteges la atención de quien revisa y además aprendes de la lista.

</details>

6. **Criterio.** Quien revisa escribe: "Por favor usa `getByRole` aquí, es mejor para la accesibilidad." La regla del equipo en el README dice que se use `getByTestId`. ¿Qué haces?

<details><summary>Respuesta</summary>

Hay más de una buena respuesta. Sigue la regla escrita en este cambio, para que el código se mantenga consistente, y agradece a quien revisa. Luego abre una conversación con el equipo: si están de acuerdo en que los roles son mejores, cambien la regla y muevan todos los tests juntos. Una mezcla de dos estilos en una suite es más difícil de leer que cualquiera de los dos solo. Lo que hagas depende de qué tan fuerte sea el motivo y de cuánto trabajo sería cambiar toda la suite. Si el motivo es un bug real de accesibilidad en la app, repórtalo como un issue aparte.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué hace que una revisión de código sea útil y respetuosa?**
   - Busca: `code review best practices small changes comments`
   - Pruébalo: toma un spec que escribiste y redacta tres comentarios de revisión sobre él, como si fueras quien revisa. Cada comentario tiene tres partes: lo que ves, por qué importa y lo que sugieres.
   - Una buena respuesta explica: al menos tres hábitos de buenos revisores y buenos autores.

2. **¿Qué son las pruebas de mutación y cómo comprueban que los tests pueden fallar?**
   - Busca: `mutation testing explained`
   - Pruébalo: en `review-practice.spec.ts`, cambia `toHaveCount(0)` por `toHaveCount(1)` en el test de borrar y ejecútalo. Luego devuélvelo, y cambia `products.delete` por `products.openDeleteDialog`. Escribe cuál cambio atrapó el test.
   - Una buena respuesta explica: cómo la herramienta cambia el código a propósito, y qué te dice un mutante que sobrevive.

3. **¿Qué son los *test smells* (malos olores en los tests), como assertion roulette o mystery guest?**
   - Busca: `test smells assertion roulette mystery guest`
   - Pruébalo: abre `e2e/products/products.spec.ts` y busca un olor de tu búsqueda. Escribe la línea y el nombre del olor, o escribe por qué no encontraste ninguno.
   - Una buena respuesta explica: al menos dos olores con nombre, cómo se ve cada uno y cómo arreglarlo.

## Siguiente paso

En la próxima lección aprendes DRY en la automatización de tests: cómo quitar el conocimiento repetido de un spec, y cuándo dejar un poco de repetición para que cada test siga siendo fácil de leer.
