---
title: Locators
summary: Encuentra elementos con getByTestId y los demás locators, maneja la regla estricta, mira dentro de una fila y elige un locator con intención.
duration: 80 min
---

## Empieza con un acertijo

Abre la Practice app (app de práctica) con la lista de casos vacía. Un test ejecuta estas tres líneas:

```ts
const rows = page.getByTestId("cases-item")
console.log(await rows.count())
await rows.click()
```

No hay filas. Ni un solo `cases-item` existe en la página.

¿Cuál de las tres líneas lanza un error? ¿Cuándo ocurre: de inmediato, después de 5 segundos o después de 30 segundos? ¿Qué imprime la segunda línea?

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Predecir qué encuentra un *locator* (localizador: la descripción de cómo encontrar un elemento) y cuándo lo busca.
- Elegir entre `getByTestId`, `getByRole`, `getByLabel` y `getByText`, y defender tu elección.
- Arreglar un error de regla estricta sin esconder un bug.
- Elegir una fila de una lista y actuar dentro de ella.

## Qué es un locator

Un **locator** describe cómo encontrar un elemento en la página. No es el elemento en sí.

```ts
const email = page.getByTestId("login-email")
```

Esta línea no toca la página. Solo guarda una descripción: "el elemento con el testid `login-email`".

Playwright busca el elemento en el momento en que usas el locator, por ejemplo en `fill` o en `expect`. Si la página cambió, el locator encuentra el elemento nuevo. Por eso puedes crear un locator una vez y usarlo muchas veces.

Piensa en la dirección de una calle en una carta. La dirección no es la casa. Si la casa se reconstruye, la misma dirección sigue llevando a la casa nueva.

## getByTestId: el valor por defecto del equipo

Cada elemento interactivo de nuestras apps tiene un atributo llamado `data-testid`. Su valor sigue la regla `<feature>-<element>`. Por ejemplo, `login-email` o `cases-add`.

```ts
await page.getByTestId("login-email").fill("qa@example.com")
await page.getByTestId("login-submit").click()
```

Usamos `getByTestId` por defecto. El *testid* (identificador de test) no cambia cuando un diseñador cambia el texto o los colores. El test se mantiene estable.

## Otros locators que vas a leer

Otras personas escriben tests con otros estilos. Debes poder leerlos.

**getByRole** encuentra un elemento por su rol: para qué sirve para un usuario. Un botón, un enlace, una casilla. Agregas el nombre visible.

```ts
await page.getByRole("button", { name: "Sign in" }).click()
```

**getByLabel** encuentra un campo de formulario por el texto de su etiqueta. En la Practice app, cada campo tiene un `<label>` real. La etiqueta apunta a su campo con el atributo `for`, que tiene el mismo valor que el `id` del campo. Por ejemplo, `<label for="login-email">Email</label>` apunta a `<input id="login-email">`.

```ts
await page.getByLabel("Email").fill("qa@example.com")
```

**getByText** encuentra un elemento por el texto que muestra.

```ts
await expect(page.getByText("There are no cases yet.")).toBeVisible()
```

Estos locators están cerca de lo que ve un usuario. Se rompen cuando el texto cambia, por ejemplo cuando se traduce la app. Por eso el equipo prefiere los testids.

### Experimento: cuenta los botones

Antes de ejecutar nada, responde. La Practice app, con la lista de casos vacía, tiene algunos botones. ¿Crees que `page.getByRole("button")` y `page.locator("button")` dan el mismo número?

Escribe este test de prueba en un archivo tuyo, por ejemplo `e2e/challenges/scratch.spec.ts`:

```ts
import { expect, test } from "../lib/test"

test("counts the buttons", async ({ page }) => {
  await page.goto("/#/practice")
  await expect(page.getByTestId("login-submit")).toBeVisible()

  console.log("by role:", await page.getByRole("button").count())
  console.log("by tag:", await page.locator("button").count())
})
```

Deberías ver `by role: 5` y `by tag: 6`. Los seis botones son el cambio de idioma, el cambio de tema, Sign in (Iniciar sesión), Sign out (Cerrar sesión), Add (Agregar) y Load report (Cargar reporte). El botón Sign out está en la página, pero tiene el atributo `hidden` hasta que inicias sesión. `getByRole` omite los elementos ocultos, porque un usuario no puede usarlos. `locator("button")` cuenta cada etiqueta `<button>`.

El primer `expect` está ahí a propósito. `count()` no espera. Sin esa línea, podrías contar antes de que la página se dibuje.

## La regla estricta

Agrega dos casos en la Practice app. Cada caso es una fila con el testid `cases-item`. Ahora mira esta línea:

```ts
await page.getByTestId("cases-item").click()
```

¿Qué esperas que pase? Dos filas coinciden. ¿Playwright hará clic en la primera?

Falla. Un locator que coincide con más de un elemento no se permite en una acción. Esta regla se llama **strict mode** (modo estricto). El mensaje dice:

```text
Error: locator.click: Error: strict mode violation: getByTestId('cases-item') resolved to 2 elements:
```

Playwright se niega a adivinar a cuál te refieres. Esto te protege de hacer clic en el elemento equivocado.

Mira cuántas filas comparten el mismo testid.

![Tres filas comparten el mismo testid, así que un locator coincide con las tres.](/clips/strict-mode-rows.webm)

> **Nota:** `toHaveCount` es la excepción. Está hecho para contar muchos elementos, así que acepta un locator con muchas coincidencias.

## Elegir un elemento

Tienes tres herramientas.

`first()` toma la primera coincidencia. `nth()` toma una coincidencia por posición. La cuenta empieza en 0, así que `nth(1)` es la segunda.

```ts
await expect(page.getByTestId("cases-item-title").first()).toHaveText("First case")
await expect(page.getByTestId("cases-item-title").nth(1)).toHaveText("Second case")
```

`filter()` conserva solo las coincidencias que cumplen una regla. Aquí la regla es el texto dentro del elemento:

```ts
const rows = page.getByTestId("cases-item")
await expect(rows.filter({ hasText: "Logout" })).toHaveCount(1)
```

Prefiere `filter()`. La posición puede cambiar. El texto dice lo que quieres decir.

Cuidado con una trampa. `hasText: "Logout"` coincide con cualquier fila cuyo texto contiene "Logout". Es una prueba de "contiene", no de "es exactamente". ¿Qué pasa con las filas "Login" y "Login with a blocked user" si filtras por "Login"? Piensa la respuesta y luego pruébala.

## Encadenar: mirar dentro de una fila

Puedes llamar un método de locator sobre otro locator. La segunda búsqueda corre solo dentro de la primera coincidencia.

```ts
const row = page.getByTestId("cases-item").filter({ hasText: "Second case" })
await row.getByRole("checkbox").check()
```

Léelo así: "encuentra la fila con el texto Second case, luego encuentra la casilla dentro de ella, luego márcala."

Así se manejan las listas. Todas las filas tienen los mismos botones, así que primero eliges la fila. Luego buscas dentro de ella.

> **Consejo:** En la Practice app, una fila también lleva su id en el testid, como `cases-toggle-1`. La regla del equipo dice que los elementos de una fila incluyen el id. Puedes usarlo cuando conoces el id.

### De vuelta al acertijo

La línea 1 no hace nada. Un locator es solo una descripción, así que no falla cuando no existe ningún elemento. La línea 2 imprime `0` de inmediato. Contar filas que no existen es una pregunta normal con una respuesta normal. La línea 3 espera. Playwright sigue buscando un elemento para hacer clic, y después de 30 segundos (el timeout del test) el test falla. El mensaje dice que estaba esperando el locator.

Así que un locator nunca falla por sí solo. Falla la acción o la aserción que lo usa. Y "ningún elemento" y "demasiados elementos" son dos fallos distintos.

## Profundiza

### Por qué un locator sobrevive a los cambios de la página

Cada vez que usas un locator, Playwright busca de nuevo en la página. El locator guarda la descripción, no el elemento.

Esto importa en la Practice app. Agrega un caso. Luego elige el filtro `passed` en `cases-filter`. La página ahora muestra solo los casos aprobados, así que React quita de la página la fila del caso pendiente. Elige `all` otra vez, y React crea una fila nueva con una casilla nueva. La casilla vieja ya no existe. Pero `page.getByTestId("cases-toggle-1")` sigue funcionando, porque busca de nuevo y encuentra la casilla nueva.

Otras herramientas te dan el elemento en sí. Después de una actualización de la página, ese elemento guardado puede apuntar a algo que ya se quitó. Selenium llama a esto un "stale element" (elemento obsoleto). Los locators evitan el problema.

### Una idea equivocada común: "first() arregla el error de strict mode"

El error es molesto, así que un principiante agrega `first()`. El error desaparece. Pero mira lo que pasó:

```ts
// The app should show one row for this case. It shows two. This line does not notice.
await page.getByTestId("cases-item").first().click()
```

El error de strict mode era una advertencia. Quizás la app tiene un bug, y la lista muestra un caso dos veces. `first()` esconde el bug. Primero pregunta qué esperas. Si esperas una fila, dilo:

```ts
await expect(page.getByTestId("cases-item")).toHaveCount(1)
```

Usa `first()` o `nth()` solo cuando tener muchas coincidencias es normal.

### Un compromiso: ¿testid o rol?

El valor por defecto del equipo es `getByTestId`. Es estable. Pero tiene un costo. Un testid es invisible para el usuario. Un test con `getByTestId` puede pasar cuando el botón no tiene un nombre legible, lo cual es un problema para una persona que usa un lector de pantalla.

`getByRole("button", { name: "Sign in" })` es más estricto. Usa lo que ven el usuario y las herramientas de accesibilidad. Se rompe cuando el texto cambia, por ejemplo en otro idioma.

Ninguno es siempre el correcto. Elegimos testids para tener tests estables. Podemos agregar unas pocas comprobaciones basadas en roles donde el objetivo sea la accesibilidad.

Un buen hábito es **probar lo que ve el usuario, no cómo está construido el código**. Un usuario no sabe que existe `cases-item`. Un usuario ve una fila con un título y una casilla. Los testids son un puente: apuntan a cosas que un usuario ve, y no cambian cuando se reconstruye el código que las rodea. Un locator que depende de la estructura de la página, como "el tercer `div` dentro del segundo `div`", es lo contrario.

Cuando usas la misma fila muchas veces, escribe la búsqueda una sola vez. Esto es DRY, "Don't Repeat Yourself" (no te repitas), aplicado a los locators:

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

La función tiene un solo trabajo y un nombre que dice para qué sirve: encuentra una fila por su título. Un *page object* (objeto de página), en el módulo 4, lleva esta idea más lejos.

## Práctica

1. Inicia el sitio con `pnpm dev`. Abre `http://localhost:5180/#/practice`.
2. Agrega dos casos a mano. Mira la página en las herramientas de desarrollo del navegador (F12). Encuentra `data-testid="cases-item"`.
3. Abre `e2e/exercises/03-playwright/02-locators.spec.ts`.
4. Cambia `test.fixme` por `test` en un test a la vez. Escribe los pasos a partir de los comentarios.
5. Ejecuta tu archivo:

```bash
pnpm e2e e2e/exercises/03-playwright/02-locators.spec.ts
```

6. A propósito, quita `.first()` de un locator que coincide con dos filas y úsalo en `click()`. Lee el mensaje de strict mode. Vuelve a poner `.first()`.

Compara con `e2e/exercises/03-playwright/solutions/02-locators.spec.ts` cuando termines.

## Reto

Crea el archivo `e2e/challenges/02-locators.spec.ts`. En la Practice app, agrega tres casos: "Login", "Login with a blocked user" y "Logout". Puedes elegir tus propios tres títulos, pero un título debe ser el comienzo de otro. Escribe un test que marque solo el caso con el título exacto "Login" (o tu título corto), y que demuestre que los otros dos no se marcaron.

Está terminado cuando:

- El test pasa con `pnpm e2e e2e/challenges/02-locators.spec.ts`, y Playwright no muestra ningún error de strict mode.
- El contador `cases-counter` tiene el texto "1 of 3 passed".
- Compruebas el atributo `data-status` de cada una de las tres filas por su título: una `passed` y dos `pending`.
- El test no usa `first()`, `last()`, `nth()`, ni un testid con un número.
- Cambiaste el test para marcar "Logout" por error, y el test falló con un mensaje claro. Luego lo arreglaste.

Vas a necesitar algo que esta lección no enseñó: cómo coincidir con un texto exacto, y no como parte de un texto más largo. Busca: `playwright getByText exact true`, `playwright locator filter has`.

## Piénsalo bien

1. Predice el resultado y explica por qué. Agregas "First case" y "Second case" y marcas "Second case". Eliges el filtro `pending`, y luego eliges `all` otra vez. ¿Esta línea pasa?

```ts
await expect(page.getByTestId("cases-toggle-2")).toBeChecked()
```

<details><summary>Respuesta</summary>

Pasa. La marca se guarda en el estado de la app, no en el elemento de la casilla. Cuando el filtro oculta la fila, React quita el elemento. Cuando la fila vuelve, React crea una casilla nueva a partir del estado guardado, y está marcada. El locator busca de nuevo en el momento de la aserción, así que encuentra el elemento nuevo. Una referencia guardada a un elemento estaría obsoleta aquí.

</details>

2. Este test pasa. También tiene una debilidad oculta. Encuéntrala. Los casos se agregaron en este orden: "Login works", "Logout works", "Reset password". El test se llama "ticks Reset password".

```ts
await page.getByTestId("cases-item").last().getByRole("checkbox").check()
await expect(page.getByTestId("cases-counter")).toHaveText("1 of 3 passed")
```

<details><summary>Respuesta</summary>

El test nunca nombra la fila que quiere. Marca la última fila, y el contador solo dice que un caso está marcado, no cuál. Si el orden de las filas cambia (por ejemplo, el caso más nuevo pasa arriba), el test marca otro caso y sigue pasando. Elige la fila por su título con `filter({ hasText: "Reset password" })`. Luego comprueba que esa fila tiene `data-status` igual a `passed`.

</details>

3. Dos versiones funcionan. Versión A: `page.getByLabel("Email")`. Versión B: `page.getByTestId("login-email")`. ¿Cuál es mejor en la Practice app, y qué te haría elegir la otra?

<details><summary>Respuesta</summary>

Para el equipo, B es mejor como valor por defecto: no cambia cuando el texto de la etiqueta cambia o se traduce. A es mejor cuando el objetivo es probar lo que ve un usuario. También falla si falta la etiqueta o no está unida al campo, lo que significa que una persona con lector de pantalla tampoco podría encontrar el campo. Elige A en unas pocas comprobaciones de accesibilidad, o cuando pruebas una app que no tiene testids y no puedes cambiarla.

</details>

4. ¿Qué se rompe si el product owner pide que el caso más nuevo se muestre arriba de la lista? Mira estas tres formas de encontrar "Second case": `nth(1)`, `filter({ hasText: "Second case" })` y `getByTestId("cases-toggle-2")`.

<details><summary>Respuesta</summary>

Solo se rompe la primera. La posición de "Second case" cambia, así que `nth(1)` encuentra otra fila. El texto no cambió, así que el filtro sigue funcionando. El id tampoco cambió (el id se asigna cuando se crea el caso), así que la tercera sigue funcionando. Por eso preferimos un locator que dice lo que queremos decir sobre uno que dice dónde está.

</details>

5. Explica a un compañero en tres frases por qué Playwright se niega a hacer clic cuando dos elementos coinciden. No uses la palabra "estricto".

<details><summary>Respuesta</summary>

Cuando dos elementos coinciden, el test no puede saber cuál quieres. Una suposición equivocada haría clic en otra cosa, y el test podría pasar por la razón equivocada. Por eso Playwright se detiene con un error y te pide que digas lo que quieres. El error también es una alarma gratis: puede mostrar que la página tiene un duplicado que no debería estar.

</details>

6. Caso límite. Un usuario agrega un caso con el título "Delete". Luego tu test llama a `page.getByText("Delete").click()` para borrar una fila. ¿Qué pasa, y qué locator usarías en su lugar?

<details><summary>Respuesta</summary>

La llamada falla con una violación de strict mode. La palabra "Delete" aparece dos veces en la fila: en el título del caso y en el botón Delete. El texto que viene de los usuarios puede parecerse al texto de la interfaz, así que `getByText` es arriesgado en las listas. Usa el testid `cases-delete-1` o `getByRole("button", { name: "Delete" })`, que encuentra solo botones. Si la lista tiene muchas filas, elige primero la fila y busca el botón dentro de ella.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es un "stale element" en Selenium, y por qué Playwright no tiene este problema?**
   - Busca: `selenium StaleElementReferenceException`
   - Pruébalo: Abre la Practice app, agrega un caso, y en las DevTools (F12) haz clic derecho en su casilla y elige Inspect (Inspeccionar). Cambia el filtro a `passed` y de vuelta a `all`. Mira qué pasa con el nodo resaltado.
   - Una buena respuesta explica: qué causa el error, con un ejemplo simple de una página que se redibuja, y cómo lo evita un locator que busca de nuevo.

2. **¿Qué es el árbol de accesibilidad, y cómo lo usa `getByRole`?**
   - Busca: `accessibility tree roles browser`
   - Pruébalo: En un test de prueba, escribe `console.log(await page.getByTestId("login").ariaSnapshot())` después de `goto` y lee la salida. Encuentra el rol y el nombre del botón Sign in.
   - Una buena respuesta explica: qué son un rol y un nombre accesible, y por qué un locator por rol también comprueba que la página se puede usar con un lector de pantalla.

3. **¿Por qué algunos testers dicen que un locator atado a clases CSS o a la estructura de la página es frágil?**
   - Busca: `fragile locators css xpath test automation`
   - Pruébalo: En las DevTools, haz clic derecho en el elemento `cases-counter`, elige Copy (Copiar) y luego Copy selector. Compara el resultado con `getByTestId("cases-counter")`. Imagina tres cambios que un diseñador podría hacer, y di cuáles rompen cada locator.
   - Una buena respuesta explica: qué tipos de cambios en la página rompen esos locators, y qué da en su lugar un testid o un rol.

## Siguiente paso

En la próxima lección usas locators para hacer cosas: hacer clic, escribir, elegir y marcar.
