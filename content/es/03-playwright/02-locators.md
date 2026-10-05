---
title: Locators
summary: Encuentra elementos con getByTestId y los demás locators, maneja la regla estricta y mira dentro de una fila.
duration: 50 min
---

## Objetivo

- Explicar qué es un *locator* y cuándo se ejecuta.
- Encontrar elementos con `getByTestId`, y leer `getByRole`, `getByLabel` y `getByText`.
- Corregir un error de modo estricto con `first()`, `nth()` o `filter()`.
- Encadenar *locators* para mirar dentro de una fila.

## Qué es un locator

Un ***locator*** (localizador) describe cómo encontrar un elemento en la página. No es el elemento en sí.

```ts
const email = page.getByTestId("login-email")
```

Esta línea no toca la página. Solo guarda una descripción: "el elemento con el *testid* `login-email`".

Playwright busca el elemento en el momento en que usas el *locator*, por ejemplo en `fill` o en `expect`. Si la página cambió, el *locator* encuentra el elemento nuevo. Así puedes crear un *locator* una vez y usarlo muchas veces.

## getByTestId: la opción por defecto del equipo

Todo elemento interactivo de nuestras apps tiene un atributo llamado `data-testid`. Su valor sigue la regla `<feature>-<element>`. Por ejemplo, `login-email` o `cases-add`.

```ts
await page.getByTestId("login-email").fill("qa@example.com")
await page.getByTestId("login-submit").click()
```

Usamos `getByTestId` por defecto. El *testid* no cambia cuando un diseñador cambia el texto o los colores. El test se mantiene estable.

## Otros locators que vas a leer

Otras personas escriben tests con otros estilos. Debes poder leerlos.

**getByRole** encuentra un elemento por su rol: para qué sirve para un usuario. Un botón, un enlace, una casilla. Añades el nombre visible.

```ts
await page.getByRole("button", { name: "Sign in" }).click()
```

**getByLabel** encuentra un campo de formulario por el texto de su etiqueta.

```ts
await page.getByLabel("Email").fill("qa@example.com")
```

**getByText** encuentra un elemento por el texto que muestra.

```ts
await expect(page.getByText("There are no cases yet.")).toBeVisible()
```

Estos *locators* están cerca de lo que ve un usuario. Se rompen cuando cambia el texto, por ejemplo cuando se traduce la app. Por eso el equipo prefiere los *testids*.

## Modo estricto

Agrega dos casos en la Practice app (app de práctica). Cada caso es una fila con el *testid* `cases-item`. Ahora mira esta línea:

```ts
await page.getByTestId("cases-item").click()
```

Falla. Un *locator* que coincide con más de un elemento no se permite en una acción. Esta regla se llama **modo estricto** (*strict mode*). El mensaje dice:

```text
Error: locator.click: Error: strict mode violation: getByTestId('cases-item') resolved to 2 elements:
```

Playwright se niega a adivinar cuál quieres. Esto te protege de hacer clic en el elemento equivocado.

> **Nota:** `toHaveCount` es la excepción. Está hecho para contar muchos elementos, así que acepta un *locator* con muchas coincidencias.

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

## Encadenar: mirar dentro de una fila

Puedes llamar un método de *locator* sobre otro *locator*. La segunda búsqueda se ejecuta solo dentro de la primera coincidencia.

```ts
const row = page.getByTestId("cases-item").filter({ hasText: "Second case" })
await row.getByRole("checkbox").check()
```

Léelo así: "encuentra la fila con el texto Second case, luego encuentra la casilla dentro de ella, luego márcala."

Así se manejan las listas. Todas las filas tienen los mismos botones, así que primero eliges la fila. Después miras dentro de ella.

> **Consejo:** En la Practice app, una fila también lleva su id en el *testid*, como `cases-toggle-1`. La regla del equipo dice que los elementos de una fila incluyen el id. Puedes usarlo cuando conoces el id.

## Profundiza

### Por qué un locator sobrevive a los cambios en la página

Cada vez que usas un *locator*, Playwright busca en la página de nuevo. El *locator* guarda la descripción, no el elemento.

Esto importa en la Practice app. Cuando marcas una casilla, el código llama a `paint()`. Esta función reemplaza todas las filas de la lista por elementos nuevos. Los elementos viejos desaparecen. Pero `page.getByTestId("cases-toggle-1")` sigue funcionando después, porque busca de nuevo y encuentra la casilla nueva.

Otras herramientas te dan el elemento en sí. Después de una actualización de la página, ese elemento guardado puede apuntar a algo que ya se eliminó. Selenium lo llama "stale element" (elemento obsoleto). Los *locators* evitan el problema.

### Una idea equivocada común: "first() arregla el error de modo estricto"

El error es molesto, así que un principiante añade `first()`. El error desaparece. Pero mira lo que pasó:

```ts
// The app should show one row for this case. It shows two. This line does not notice.
await page.getByTestId("cases-item").first().click()
```

El error de modo estricto era una advertencia. Tal vez la app tiene un *bug* y la lista muestra un caso dos veces. `first()` esconde el *bug*. Primero pregunta qué esperas. Si esperas una fila, dilo:

```ts
await expect(page.getByTestId("cases-item")).toHaveCount(1)
```

Usa `first()` o `nth()` solo cuando tener muchas coincidencias es normal.

### Una decisión con costo: ¿testid o rol?

La opción por defecto del equipo es `getByTestId`. Es estable. Pero tiene un costo. Un *testid* es invisible para el usuario. Un test con `getByTestId` puede pasar cuando el botón no tiene un nombre legible, lo cual es un problema para una persona que usa un lector de pantalla.

`getByRole("button", { name: "Sign in" })` es más estricto. Usa lo que ven el usuario y las herramientas de accesibilidad. Se rompe cuando cambia el texto, por ejemplo en otro idioma.

Ninguno es siempre el correcto. Elegimos *testids* para tener tests estables. Podemos añadir unas pocas comprobaciones basadas en roles donde el objetivo es la accesibilidad.

Cuando usas la misma fila muchas veces, escribe la búsqueda una sola vez. Esto es DRY, "Don't Repeat Yourself" (no te repitas), aplicado a los *locators*:

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

Un *page object* (objeto de página), en el módulo 4, lleva esta idea más lejos.

## Práctica

1. Inicia el sitio con `pnpm dev`. Abre `http://localhost:5180/#/practice`.
2. Agrega dos casos a mano. Mira la página en las herramientas de desarrollo del navegador (F12). Encuentra `data-testid="cases-item"`.
3. Abre `e2e/exercises/03-playwright/02-locators.spec.ts`.
4. Cambia `test.fixme` por `test` en un test a la vez. Escribe los pasos a partir de los comentarios.
5. Ejecuta tu archivo:

```bash
pnpm e2e e2e/exercises/03-playwright/02-locators.spec.ts
```

6. A propósito, quita `.first()` de un *locator* que coincide con dos filas y úsalo en `click()`. Lee el mensaje de modo estricto. Vuelve a poner `.first()`.

Compara con `e2e/exercises/03-playwright/solutions/02-locators.spec.ts` cuando termines.

## Comprueba lo que sabes

1. ¿Cuándo busca Playwright el elemento?

<details><summary>Respuesta</summary>

Cuando usas el *locator* en una acción o en una aserción. Crear el *locator* no toca la página.

</details>

2. ¿Por qué el equipo prefiere `getByTestId`?

<details><summary>Respuesta</summary>

El *testid* no cambia cuando cambia el texto o el diseño. El test se mantiene estable.

</details>

3. ¿Qué es una violación del modo estricto?

<details><summary>Respuesta</summary>

Una acción usó un *locator* que coincide con más de un elemento. Playwright se niega a elegir.

</details>

4. ¿Cómo haces clic en la casilla dentro de una fila?

<details><summary>Respuesta</summary>

Elige primero la fila, por ejemplo con `filter({ hasText })`. Luego encadena `getByRole("checkbox")` y actúa sobre él.

</details>

5. La Practice app tiene dos casos: "Login" y "Login with a blocked user". Tu test usa `page.getByTestId("cases-item").filter({ hasText: "Login" })` y luego hace clic en la casilla dentro de la fila. ¿Qué pasa y por qué?

<details><summary>Respuesta</summary>

El test falla con una violación del modo estricto. `hasText` coincide con una parte del texto, así que las dos filas contienen "Login". El filtro conserva dos filas, y una acción necesita exactamente una. Usa un texto más exacto, como "Login with a blocked user", o usa el id de la fila en el *testid*.

</details>

6. Agregas los casos "First case" y "Second case" y marcas "Second case". Luego eliges el filtro `passed` en `cases-filter`. ¿Qué encuentra `page.getByTestId("cases-item-title").nth(1)`?

<details><summary>Respuesta</summary>

Nada. El filtro muestra solo los casos aprobados, así que queda una sola fila. `nth(0)` es "Second case". `nth(1)` es la segunda coincidencia, y no existe. Una aserción sobre ella espera 5 segundos y luego falla. Los *locators* basados en la posición se rompen cuando cambia la lista.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es un "stale element" en Selenium y por qué Playwright no tiene este problema?**
   - Busca: `selenium StaleElementReferenceException`
   - Una buena respuesta explica: qué causa el error, con un ejemplo simple de una página que se vuelve a dibujar, y cómo lo evita un *locator* que busca de nuevo.

2. **¿Qué es el árbol de accesibilidad y cómo lo usa `getByRole`?**
   - Busca: `accessibility tree roles browser`
   - Una buena respuesta explica: qué son un rol y un nombre accesible, y por qué un *locator* por rol también comprueba que la página se pueda usar con un lector de pantalla.

3. **¿Por qué algunos testers dicen que un *locator* atado a clases CSS o a la estructura de la página es frágil?**
   - Busca: `fragile locators css xpath test automation`
   - Una buena respuesta explica: qué tipos de cambios en la página rompen esos *locators*, y qué ofrece en cambio un *testid* o un rol.

## Siguiente paso

En la siguiente lección usas *locators* para hacer cosas: hacer clic, escribir, elegir y marcar.
