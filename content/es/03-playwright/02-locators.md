---
title: Locators
summary: Encuentra elementos con getByTestId y los otros locators, maneja la regla estricta y mira dentro de una fila.
duration: 35 min
---

## Objetivo

- Explicar qué es un *locator* (localizador) y cuándo se ejecuta.
- Encontrar elementos con `getByTestId`, y leer `getByRole`, `getByLabel` y `getByText`.
- Corregir un error de modo estricto con `first()`, `nth()` o `filter()`.
- Encadenar locators para buscar dentro de una fila.

## Qué es un locator

Un **locator** describe cómo encontrar un elemento en la página. No es el elemento en sí.

```ts
const email = page.getByTestId("login-email")
```

Esta línea no toca la página. Solo guarda una descripción: "el elemento con el *testid* `login-email`".

Playwright busca el elemento en el momento en que usas el locator, por ejemplo en `fill` o en `expect`. Si la página cambió, el locator encuentra el elemento nuevo. Por eso puedes crear un locator una vez y usarlo muchas veces.

## getByTestId: el valor por defecto del equipo

Cada elemento interactivo de nuestras apps tiene un atributo llamado `data-testid`. Su valor sigue la regla `<feature>-<element>`. Por ejemplo, `login-email` o `cases-add`.

```ts
await page.getByTestId("login-email").fill("qa@example.com")
await page.getByTestId("login-submit").click()
```

Usamos `getByTestId` por defecto. El testid no cambia cuando un diseñador cambia el texto o los colores. El test se mantiene estable.

## Otros locators que vas a leer

Otras personas escriben tests con otros estilos. Debes poder leerlos.

**getByRole** encuentra un elemento por su rol: lo que es para un usuario. Un botón, un enlace, una casilla. Agregas el nombre visible.

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

Estos locators se parecen a lo que ve un usuario. Se rompen cuando cambia el texto, por ejemplo cuando se traduce la app. Por eso el equipo prefiere los testid.

## Modo estricto

Agrega dos casos en la Practice app. Cada caso es una fila con el testid `cases-item`. Ahora mira esta línea:

```ts
await page.getByTestId("cases-item").click()
```

Falla. Un locator que coincide con más de un elemento no está permitido en una acción. Esta regla se llama **modo estricto** (*strict mode*). El mensaje dice:

```text
Error: locator.click: Error: strict mode violation: getByTestId('cases-item') resolved to 2 elements:
```

Playwright se niega a adivinar a cuál te refieres. Esto te protege de hacer clic en el elemento equivocado.

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

## Encadenar: mirar dentro de una fila

Puedes llamar un método de locator sobre otro locator. La segunda búsqueda se hace solo dentro de la primera coincidencia.

```ts
const row = page.getByTestId("cases-item").filter({ hasText: "Second case" })
await row.getByRole("checkbox").check()
```

Léelo así: "busca la fila con el texto Second case, luego busca la casilla dentro de ella, luego márcala."

Así se manejan las listas. Todas las filas tienen los mismos botones, así que primero eliges la fila. Luego buscas dentro de ella.

> **Consejo:** En la Practice app, una fila también lleva su id en el testid, como `cases-toggle-1`. La regla del equipo dice que los elementos de una fila incluyen el id. Puedes usarlo cuando conoces el id.

## Práctica

1. Inicia el sitio con `pnpm dev`. Abre `http://localhost:5180/#/practice`.
2. Agrega dos casos a mano. Mira la página en las herramientas de desarrollo del navegador (F12). Busca `data-testid="cases-item"`.
3. Abre `e2e/exercises/03-playwright/02-locators.spec.ts`.
4. Cambia `test.fixme` por `test` en un test a la vez. Escribe los pasos a partir de los comentarios.
5. Ejecuta tu archivo:

```bash
pnpm e2e e2e/exercises/03-playwright/02-locators.spec.ts
```

6. A propósito, quita `.first()` de un locator que coincide con dos filas y úsalo en `click()`. Lee el mensaje de strict mode. Vuelve a poner `.first()`.

Compara con `e2e/exercises/03-playwright/solutions/02-locators.spec.ts` cuando termines.

## Comprueba lo que sabes

1. ¿Cuándo busca Playwright el elemento?

<details><summary>Respuesta</summary>

Cuando usas el locator en una acción o en una aserción. Crear el locator no toca la página.

</details>

2. ¿Por qué el equipo prefiere `getByTestId`?

<details><summary>Respuesta</summary>

El testid no cambia cuando cambian el texto o el diseño. El test se mantiene estable.

</details>

3. ¿Qué es una violación de strict mode?

<details><summary>Respuesta</summary>

Una acción usó un locator que coincide con más de un elemento. Playwright se niega a elegir.

</details>

4. ¿Cómo haces clic en la casilla dentro de una fila?

<details><summary>Respuesta</summary>

Elige primero la fila, por ejemplo con `filter({ hasText })`. Luego encadena `getByRole("checkbox")` y actúa sobre él.

</details>

## Siguiente paso

En la siguiente lección usas locators para hacer cosas: hacer clic, escribir, elegir y marcar.
