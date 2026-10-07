---
title: Locators
duration: 65 min
---

## Objetivo

En esta lección eliges locators para encontrar controles y filas en la Practice app. Aprendes cuándo Playwright busca sus coincidencias y cómo evitar una búsqueda ambigua.

- Distinguir entre crear un locator, contar sus coincidencias y usarlo en una acción.
- Elegir entre `getByTestId`, `getByRole`, `getByLabel` y `getByText`.
- Resolver un error de strict mode sin esconder un duplicado.
- Filtrar una fila y buscar un control dentro de ella.

## Crear y usar un locator

Un **locator** describe cómo encontrar un elemento del DOM. Guarda la búsqueda, no una referencia al elemento.

```ts
const email = page.getByTestId("login-email")
```

Esta línea guarda la búsqueda del elemento con el testid `login-email`, sin consultar la página. Playwright busca las coincidencias cuando ejecutas una acción o una aserción con el locator. Si el DOM cambió, busca en el DOM actual.

![El mismo locator vuelve a buscar y encuentra una casilla nueva cuando React recrea la fila.](/images/03-locator-resolution.es.svg)

Con la lista de casos vacía, este código permite distinguir la creación, el conteo y la acción:

```ts
const rows = page.getByTestId("cases-item")
console.log(await rows.count())
await rows.click()
```

La primera línea crea el locator aunque no exista ninguna fila. La segunda imprime `0`: `count()` devuelve el número de coincidencias actuales, sin esperar a que aparezcan filas. La tercera espera a que Playwright encuentre un elemento para hacer clic.

El test tiene un límite total de 30 segundos por defecto. El clic usa el tiempo que queda después de los pasos anteriores; si no aparece una fila antes de ese límite, el test falla mientras espera el locator.

## getByTestId: el valor por defecto del equipo

En las apps del curso usamos `getByTestId` por defecto. Busca el valor del atributo `data-testid`, con nombres como `login-email` o `cases-add`.

```ts
await page.getByTestId("login-email").fill("qa@example.com")
await page.getByTestId("login-submit").click()
```

El testid no cambia cuando cambia el texto o el color del control. Así, una traducción o un cambio de estilo puede conservar el mismo locator.

## Otros locators

**getByRole** encuentra un elemento por su rol, como botón, enlace o casilla. Puedes agregar el nombre accesible, que Playwright calcula a partir del texto o de atributos como `aria-label`. Puede ser distinto del texto visible.

```ts
await page.getByRole("button", { name: "Sign in" }).click()
```

**getByLabel** encuentra un campo de formulario por el texto de su etiqueta. En el login de la Practice app, la etiqueta apunta a su campo con el atributo `for`, que tiene el mismo valor que el `id` del campo. Las casillas de la lista están dentro de su etiqueta y no necesitan esa asociación. Por ejemplo, `<label for="login-email">Email</label>` apunta a `<input id="login-email">`.

```ts
await page.getByLabel("Email").fill("qa@example.com")
```

**getByText** encuentra un elemento por su texto:

```ts
await expect(page.getByText("There are no cases yet.")).toBeVisible()
```

Los locators que buscan un nombre, una etiqueta o un texto dependen de esas palabras. Si la app las traduce, el test debe buscar el texto del idioma correspondiente.

### Contar los botones

Un locator por rol y un selector por etiqueta pueden encontrar cantidades distintas. Para comprobarlo con la lista vacía y sin iniciar sesión, escribe este test en `e2e/challenges/scratch.spec.ts`:

```ts
import { expect, test } from "../lib/test"

test("counts the buttons", async ({ page }) => {
  await page.goto("/#/practice")
  await expect(page.getByTestId("login-submit")).toBeVisible()

  console.log("by role:", await page.getByRole("button").count())
  console.log("by tag:", await page.locator("button").count())
})
```

Deberías ver `by role: 5` y `by tag: 6`. Los seis botones son el cambio de idioma, el cambio de tema, Sign in (Iniciar sesión), Sign out (Cerrar sesión), Add (Agregar) y Load report (Cargar reporte). El botón Sign out está dentro de un elemento con el atributo `hidden` hasta que inicias sesión. Por defecto, `getByRole` omite los elementos excluidos del árbol de accesibilidad, como ese botón. `locator("button")` cuenta cada etiqueta `<button>`.

La aserción inicial espera a que el botón Sign in sea visible antes de contar. Sin ella, `count()` podría consultar el DOM antes de que React haya mostrado los controles.

## La regla estricta

Con dos casos en la lista, esta acción coincide con dos filas:

```ts
await page.getByTestId("cases-item").click()
```

Playwright exige una sola coincidencia para hacer clic. Si encuentra varias, lanza un error de **strict mode** (modo estricto):

```text
Error: locator.click: Error: strict mode violation: getByTestId('cases-item') resolved to 2 elements:
```

El error indica que debes precisar cuál de las filas quieres usar.

![Tres filas comparten el mismo testid, así que un locator coincide con las tres.](/clips/strict-mode-rows.webm)

`toHaveCount` acepta varias coincidencias porque comprueba cuántos elementos hay.

## Elegir un elemento

`first()` elige la primera coincidencia. `nth()` elige por posición; `nth(1)` es la segunda.

```ts
await expect(page.getByTestId("cases-item-title").first()).toHaveText("First case")
await expect(page.getByTestId("cases-item-title").nth(1)).toHaveText("Second case")
```

Estas búsquedas sirven cuando quieres comprobar el orden. Si quieres un caso por su título, usa `filter()`:

```ts
const rows = page.getByTestId("cases-item")
await expect(rows.filter({ hasText: "Logout" })).toHaveCount(1)
```

`hasText: "Logout"` conserva las filas cuyo texto contiene "Logout". El filtro también examina el texto de sus descendientes. Filtrar por "Login" conserva tanto "Login" como "Login with a blocked user", así que no garantiza una sola coincidencia.

### first() puede ocultar un duplicado

Si esperas una sola fila y la app muestra dos, esta acción puede pasar:

```ts
// The app should show one row for this case. It shows two. This line does not notice.
await page.getByTestId("cases-item").first().click()
```

Comprueba la cantidad esperada antes de elegir por posición:

```ts
await expect(page.getByTestId("cases-item")).toHaveCount(1)
```

Usa `first()` o `nth()` cuando la posición forme parte de lo que quieres comprobar o cuando elegir esa coincidencia sea intencional.

## Encadenar locators dentro de una fila

Puedes llamar un método de locator sobre otro locator. La segunda búsqueda corre dentro de todas las coincidencias del locator exterior. Para marcar una sola casilla, el filtro debe identificar una sola fila.

```ts
const row = page.getByTestId("cases-item").filter({ hasText: "Second case" })
await row.getByRole("checkbox").check()
```

El filtro elige la fila con "Second case". Dentro de esa fila, `getByRole` encuentra la casilla. Esto permite distinguir controles iguales en filas distintas.

Cuando conoces el id del caso, también puedes buscar su casilla con un testid como `cases-toggle-1`.

### Reutilizar una búsqueda

Si usas la misma búsqueda en varios pasos, puedes guardarla en una función que devuelve un `Locator`:

```ts
import { expect, test, type Locator, type Page } from "./lib/test"

function caseRow(page: Page, title: string): Locator {
  return page.getByTestId("cases-item").filter({ hasText: title })
}

test("ticks the second case", async ({ page }) => {
  await page.goto("/#/practice")
  for (const title of ["First case", "Second case"]) {
    await page.getByTestId("cases-input").fill(title)
    await page.getByTestId("cases-add").click()
  }

  await caseRow(page, "Second case").getByRole("checkbox").check()

  await expect(page.getByTestId("cases-counter")).toHaveText("1 of 2 passed")
})
```

`caseRow` concentra el criterio para encontrar una fila por su título. El test encadena la búsqueda de la casilla sobre el locator que devuelve la función.

## Profundiza

### Una fila que desaparece y vuelve

Agrega un caso pendiente y elige `passed` en `cases-filter`. React quita su fila del DOM porque no cumple el filtro. Al elegir `all`, React crea otra fila y otra casilla a partir del estado de la app.

El locator `page.getByTestId("cases-toggle-1")` encuentra la casilla nueva al usarlo otra vez. Una referencia guardada al elemento anterior seguiría apuntando al nodo que React quitó.

### Lo que comprueba la elección del locator

Un test que usa `getByTestId` puede pasar aunque el botón no tenga un nombre legible. El testid identifica el control sin comprobar su nombre.

`getByRole("button", { name: "Sign in" })` exige que el control tenga ese rol y ese nombre. Elegir este locator añade una comprobación sobre cómo las herramientas de accesibilidad identifican el botón, pero también hace que el test dependa del nombre.

## Práctica

1. Inicia el sitio con `pnpm dev`. Abre `http://localhost:5180/#/practice`.
2. Agrega dos casos a mano. En las DevTools (F12), encuentra `data-testid="cases-item"` en ambas filas.
3. Abre `e2e/exercises/03-playwright/02-locators.spec.ts`.
4. Cambia `test.fixme` por `test` en un test a la vez. Escribe los pasos a partir de los comentarios.
5. Ejecuta tu archivo:

```bash
pnpm e2e e2e/exercises/03-playwright/02-locators.spec.ts
```

6. Quita `.first()` de un locator que coincide con dos filas y úsalo en `click()`. Lee el mensaje de strict mode. Vuelve a poner `.first()`.

Compara con `e2e/exercises/03-playwright/solutions/02-locators.spec.ts` cuando termines.

## Reto

Crea `e2e/challenges/02-locators.spec.ts`. Agrega los casos "Login", "Login with a blocked user" y "Logout". Escribe un test que marque solo el título exacto "Login". Puedes elegir otros títulos si uno es el comienzo de otro.

Está terminado cuando:

- El test pasa con `pnpm e2e e2e/challenges/02-locators.spec.ts`, sin errores de strict mode, y `cases-counter` muestra "1 of 3 passed".
- Compruebas `data-status` en cada fila por su título: una `passed` y dos `pending`.
- El test no usa `first()`, `last()`, `nth()`, ni un testid con un número.
- Al cambiar la acción para marcar "Logout", el test falla con un mensaje claro. Luego restauras la acción correcta.

Vas a necesitar una coincidencia de texto exacta. Busca: `playwright getByText exact true`, `playwright locator filter has`.

## Piénsalo bien

1. Agregas "First case" y "Second case" y marcas "Second case". Eliges el filtro `pending` y luego `all`. ¿Pasa esta aserción?

```ts
await expect(page.getByTestId("cases-toggle-2")).toBeChecked()
```

<details><summary>Respuesta</summary>

Pasa. La app conserva el estado del caso al filtrar. React crea la nueva casilla marcada, y el locator la encuentra al ejecutar la aserción.

</details>

2. Los casos se agregaron en este orden: "Login works", "Logout works", "Reset password". El test se llama "ticks Reset password". ¿Qué ocurre si la app empieza a mostrar el caso más nuevo arriba?

```ts
await page.getByTestId("cases-item").last().getByRole("checkbox").check()
await expect(page.getByTestId("cases-counter")).toHaveText("1 of 3 passed")
```

<details><summary>Respuesta</summary>

El test marca "Login works" y sigue pasando: el contador comprueba la cantidad, sin identificar el caso marcado. Elige la fila con `filter({ hasText: "Reset password" })` y comprueba que su `data-status` es `passed`.

</details>

3. Agregas un caso con el título "Delete" y ejecutas `page.getByText("Delete").click()` para borrarlo. ¿Qué ocurre y qué locator usarías?

<details><summary>Respuesta</summary>

Falla por strict mode: coinciden el título y el botón Delete. Usa `cases-delete-1` si conoces el id, o busca `getByRole("button", { name: "Delete" })` dentro de la fila elegida.

</details>

## Siguiente paso

En la próxima lección usas locators para hacer cosas: hacer clic, escribir, elegir y marcar.
