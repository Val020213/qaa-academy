---
title: Codegen, modo UI y modo headed
duration: 60 min
---

## Objetivo

En esta lección usas las herramientas visuales de Playwright para ejecutar tests, inspeccionar acciones y revisar código generado.

- Elegir entre modo headed, modo UI, codegen y modo headless según lo que necesitas hacer.
- Inspeccionar la página antes y después de una acción en el modo UI.
- Convertir un borrador de codegen en un test con las convenciones del proyecto y aserciones sobre el resultado.

## Modo headed: mira el navegador

Por defecto, Playwright ejecuta los tests en modo *headless*, sin mostrar una ventana del navegador. El modo *headed* muestra la ventana durante la ejecución:

```bash
pnpm e2e:headed e2e/playground.spec.ts
```

Las palabras después del nombre del script van a Playwright. Por eso puedes indicar la ruta del archivo igual que con `pnpm e2e`.

El archivo tiene cuatro tests y la configuración activa `fullyParallel`. Playwright puede ejecutarlos en paralelo, así que puedes ver varias ventanas a la vez. El modo headed sirve para observar el flujo de un test; seguir varios al mismo tiempo es más difícil.

En este proyecto, ambos modos usan Chromium, pero Playwright elige binarios distintos: `chromium` en headed y `chromium-headless-shell` en headless. También cambian las opciones de inicio; si un fallo aparece solo en un modo, compruébalo en ese modo.

## Modo UI: ejecuta e inspecciona

El modo UI reúne la lista de tests y los detalles de cada ejecución en una ventana:

```bash
pnpm e2e:ui
```

A la izquierda ves los tests. Pulsa el triángulo junto a uno para ejecutarlo. Selecciona una acción para ver la página en ese momento.

![En el modo UI ejecutas un test y luego haces clic en cada acción para ver la página en ese momento.](/clips/ui-mode.webm)

- **Watch mode (modo vigilancia).** Haz clic en el icono del ojo junto a un test o un archivo para volver a ejecutarlo cuando guardes cambios.
- **Instantáneas.** Playwright guarda copias del DOM durante las acciones. Al seleccionar una acción, el modo UI muestra el contenido guardado y permite inspeccionar sus elementos.
- **Pick locator (elegir locator).** Pulsa "Pick locator" y luego haz clic en un elemento de la página para obtener un locator.
- **Filtros.** Usa el cuadro de búsqueda para mostrar tests por nombre o los filtros de estado para ocultar los que pasaron.

Ejecuta "adds a case and updates the counter" y selecciona la acción `click` sobre `cases-add`. Las pestañas "Before" y "After" muestran la página antes y después del clic: la fila nueva y el contador actualizado aparecen después.

Usa "Pick locator" sobre el botón Add. Compara el locator que muestra con `getByTestId("cases-add")`. Un locator por rol como `getByRole('button', { name: 'Add' })` también encuentra un solo elemento en esta página. Si otro panel agrega un botón llamado "Add", el locator por rol coincide con ambos; el testid sigue identificando el botón de la lista.

El modo UI usa la configuración del proyecto. Cierra la ventana cuando termines o pulsa Ctrl+C en la terminal.

## Codegen: graba un primer borrador

**Codegen** escribe código de test mientras haces clic y escribes en una página. Necesita que el sitio esté corriendo. Abre dos terminales. En la primera:

```bash
pnpm dev
```

En la segunda:

```bash
pnpm exec playwright codegen http://localhost:5180/#/practice
```

Se abren el navegador y el Playwright Inspector, que muestra el código generado. El Inspector tiene botones para grabar aserciones; codegen agrega una cuando tú la eliges.

## Limpia el código generado

Un borrador para agregar un caso y marcarlo puede verse así. El tuyo puede ser distinto según la versión de Playwright y las acciones que grabes.

```ts
import { test, expect } from "@playwright/test"

test("test", async ({ page }) => {
  await page.goto("http://localhost:5180/#/practice")
  await page.getByRole("textbox", { name: "New case" }).click()
  await page.getByRole("textbox", { name: "New case" }).fill("Buy milk")
  await page.getByRole("button", { name: "Add" }).click()
  await page.getByRole("checkbox", { name: "Buy milk" }).check()
})
```

Revisa el borrador antes de usarlo como test del proyecto:

1. Cambia el import de `@playwright/test` para usar `test` y `expect` desde `e2e/lib/test`, con la ruta relativa que corresponda al archivo.
2. Sustituye el nombre `"test"` por uno que describa el comportamiento.
3. Usa `"/#/practice"` en lugar de la dirección completa, porque la configuración tiene `baseURL`.
4. Quita el `click` antes de `fill`: `fill` ya pone el foco en el campo.
5. Usa `getByTestId` cuando exista un testid, según la convención del proyecto. El locator de la casilla depende del título `"Buy milk"`; si cambias ese dato, revisa también el locator.
6. No hay ninguna aserción sobre el resultado. Las acciones pueden fallar, pero no detectan por sí solas un contador incorrecto.
7. Comprueba que el test crea sus propios datos y no necesita otro test.

El borrador nunca lee el contador, así que puede pasar aunque muestre `NaN of 1 passed`. Si sus acciones terminan sin error, este test pasa sin comprobar el valor del contador.

Agrega una comprobación del texto que debe mostrar el contador:

```ts
await expect(page.getByTestId("cases-counter")).toHaveText("1 of 1 passed")
```

Con esta aserción, el contador incorrecto hace fallar el test.

## La extensión de VS Code

La extensión de Playwright permite ejecutar tests desde el editor. Para instalarla, busca "Playwright Test for VSCode" en el panel de extensiones.

Junto a cada `test(...)` aparece un triángulo para ejecutarlo. Marca "Show browser" para ver el navegador. La extensión también incluye "Pick locator" y "Record new test". Usa los mismos tests y la misma configuración que la terminal.

## Profundiza

### Pasos compartidos en el borrador

Si grabas varios tests con los mismos pasos de login, puedes reunir esos pasos en una función y llamarla desde cada test:

```ts
import { expect, test, type Page } from "./lib/test"

async function signIn(page: Page): Promise<void> {
  await page.goto("/#/practice")
  await page.getByTestId("login-email").fill("qa@example.com")
  await page.getByTestId("login-password").fill("Playwright123")
  await page.getByTestId("login-submit").click()
}

test("shows the signed-in message", async ({ page }) => {
  await signIn(page)

  await expect(page.getByTestId("login-welcome")).toContainText("qa@example.com")
})

test("signing out shows the form again", async ({ page }) => {
  await signIn(page)
  await page.getByTestId("login-logout").click()

  await expect(page.getByTestId("login-form")).toBeVisible()
})
```

La función `signIn` contiene los pasos de login. Cada test conserva las acciones y aserciones del comportamiento que comprueba.

## Práctica

1. Ejecuta `pnpm e2e:headed e2e/playground.spec.ts`. Mira el navegador.
2. Ejecuta `pnpm e2e:ui`. Ejecuta el test "adds a case and updates the counter". Selecciona la acción que agrega el caso y compara las pestañas "Before" y "After".
3. En el modo UI, usa "Pick locator" y haz clic en el botón "Add" de la lista de casos. Compara el locator con `getByTestId("cases-add")`.
4. Cierra el modo UI. Inicia `pnpm dev` en una terminal. En otra terminal, ejecuta `pnpm exec playwright codegen http://localhost:5180/#/practice`.
5. Graba cómo agregas un caso y lo marcas.
6. Copia el código en un archivo nuevo `e2e/exercises/03-playwright/my-codegen.spec.ts`. Límpialo con la lista de arriba. Agrega una aserción para el texto del contador. Ejecútalo con `pnpm e2e e2e/exercises/03-playwright/my-codegen.spec.ts`.
7. Borra el archivo cuando termines. Si lo dejas, `pnpm e2e` lo va a ejecutar.

## Reto

Crea `e2e/challenges/05-codegen-filter.spec.ts` a partir de un borrador de codegen. En la página Practice, agrega tres casos con títulos distintos, marca solo el segundo y filtra los casos aprobados. Comprueba que la lista muestra solo ese caso y que el contador sigue diciendo `1 of 3 passed`.

Está terminado cuando:

- El test importa desde `../lib/test` y no tiene ninguna dirección completa en el código.
- El test tiene al menos dos aserciones: una sobre las filas visibles y otra sobre el contador.
- `pnpm e2e e2e/challenges/05-codegen-filter.spec.ts --repeat-each=5` pasa las cinco ejecuciones.
- Si cambias un título esperado en el test, el test falla. Pruébalo y luego devuélvelo.

Para el filtro, usa `selectOption`, que ya viste en la lección de acciones. Consulta cómo comprobar el texto de varias filas visibles. Busca: `playwright selectOption`, `playwright toHaveText array of strings`.

## Piénsalo bien

1. Un borrador contiene `await page.getByRole("button", { name: "Delete" }).click()`, grabado cuando había un solo caso. Lo ejecutas con tres casos en la lista. ¿Qué pasa?

<details><summary>Respuesta</summary>

Falla porque el locator coincide con tres botones "Delete" y Playwright exige un solo elemento para el clic. Un testid con el id del caso, como `cases-delete-2`, identifica la fila que quieres borrar.

</details>

2. Este test pasa aunque el contador muestre un número incorrecto. Encuentra el error.

```ts
test("ticking a case updates the counter", async ({ page }) => {
  await page.goto("/#/practice")
  await page.getByTestId("cases-input").fill("Buy milk")
  await page.getByTestId("cases-add").click()
  await page.getByTestId("cases-toggle-1").check()

  await expect(page.getByTestId("cases-counter")).toBeVisible()
})
```

<details><summary>Respuesta</summary>

La aserción de visibilidad solo comprueba que el contador sea visible. Para detectar un número incorrecto, la aserción debe comprobar el texto `"1 of 1 passed"`.

</details>

3. ¿Qué perderías si el modo UI guardara solo un video de la ejecución en vez de instantáneas del DOM?

<details><summary>Respuesta</summary>

Podrías ver la ejecución, pero no inspeccionar los elementos de la página en ese momento. El video guarda píxeles; la instantánea conserva la estructura del DOM.

</details>

## Siguiente paso

En la próxima lección aprendes el trace viewer, la herramienta que usas cuando un test falla y no sabes por qué.
