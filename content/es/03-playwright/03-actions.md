---
title: Acciones
summary: Haz lo que hace un usuario con goto, click, fill, press, check, selectOption y clear, y aprende cómo espera Playwright.
duration: 30 min
---

## Objetivo

- Usar las acciones principales: `goto`, `click`, `fill`, `press`, `check`, `uncheck`, `selectOption` y `clear`.
- Explicar con palabras simples cómo espera Playwright antes de una acción.
- Escribir siempre `await` antes de una acción.

## Qué es una acción

Una **acción** es algo que hace un usuario: abrir una página, escribir, hacer clic, marcar una casilla. En Playwright, una acción es un método de un *locator* o de la página.

Toda acción necesita `await`. Aprendiste por qué en la lección sobre async. Sin él, el test sigue antes de que termine el paso. El resultado es un test *flaky* (inestable).

## goto

`goto` abre una dirección.

```ts
await page.goto("/#/practice")
```

El inicio de la dirección viene de `baseURL` en la configuración. Así, `/#/practice` se convierte en `http://localhost:5180/#/practice`.

## click

`click` hace clic en un elemento.

```ts
await page.getByTestId("login-submit").click()
```

## fill y clear

`fill` pone un texto en un campo. Reemplaza lo que había antes en el campo.

```ts
await page.getByTestId("login-email").fill("qa@example.com")
```

`clear` vacía un campo.

```ts
await page.getByTestId("login-email").clear()
```

## press

`press` presiona una tecla del teclado. Úsalo para teclas como `Enter`, `Tab` o `Escape`.

```ts
await page.getByTestId("cases-input").fill("Press Enter to add")
await page.getByTestId("cases-input").press("Enter")
```

En la Practice app, `Enter` en el campo envía el formulario, así que se agrega un caso. No hiciste clic en el botón Add.

## check y uncheck

`check` marca una casilla. `uncheck` quita la marca.

```ts
await page.getByTestId("cases-toggle-1").check()
await page.getByTestId("cases-toggle-1").uncheck()
```

Si la casilla ya está marcada, `check` no hace nada. Esto es mejor que `click`, porque `click` quitaría la marca. `check` dice lo que quieres: una casilla marcada.

## selectOption

`selectOption` elige una opción en una lista desplegable. Le das el `value` (valor) de la opción.

```ts
await page.getByTestId("cases-filter").selectOption("passed")
```

En la Practice app, las opciones tienen los valores `all`, `pending` y `passed`. Después de este paso, la lista muestra solo los casos aprobados.

## Playwright espera antes de actuar

Nunca escribes "espera hasta que el botón exista". Playwright lo hace por ti.

Antes de una acción, Playwright comprueba que el elemento esté listo. Estas comprobaciones se llaman **actionability** (aptitud para la acción). En palabras simples, el elemento debe:

- existir en la página,
- ser visible,
- ser estable, es decir, no estar en movimiento,
- estar habilitado, es decir, no estar deshabilitado,
- no estar tapado por otro elemento.

Si una comprobación falla, Playwright espera y vuelve a intentar. Se detiene cuando termina el *timeout* (tiempo límite) del test, que es de 30 segundos por defecto. Entonces el test falla y el mensaje te dice qué comprobación no se cumplió.

Pruébalo. En la Practice app, presiona "Load report" (cargar reporte). El botón queda deshabilitado durante cerca de un segundo y medio. Si un test hace clic otra vez, Playwright espera hasta que el botón esté habilitado.

> **Cuidado:** Esperar antes de una acción no espera el resultado de la acción. Después del clic, la app puede seguir trabajando. Para esperar un resultado, usa una aserción. La siguiente lección muestra cómo.

## Todo junto

Este test usa cuatro acciones y una aserción:

```ts
import { expect, test } from "../../lib/test"

test("signs in with the test credentials", async ({ page }) => {
  await page.goto("/#/practice")

  await page.getByTestId("login-email").fill("qa@example.com")
  await page.getByTestId("login-password").fill("Playwright123")
  await page.getByTestId("login-submit").click()

  await expect(page.getByTestId("login-welcome")).toBeVisible()
})
```

Léelo como un caso de prueba manual: abre la página, escribe el correo, escribe la contraseña, haz clic en Sign in (iniciar sesión), comprueba el mensaje de bienvenida.

## Práctica

1. Abre `e2e/exercises/03-playwright/03-actions.spec.ts`.
2. Cambia `test.fixme` por `test` en un test a la vez. Escribe los pasos a partir de los comentarios.
3. Ejecuta tu archivo:

```bash
pnpm e2e e2e/exercises/03-playwright/03-actions.spec.ts
```

4. En un test, quita un `await` antes de una acción. Ejecuta el archivo y mira el resultado. Vuelve a poner el `await`.

Compara con `e2e/exercises/03-playwright/solutions/03-actions.spec.ts` cuando termines.

## Comprueba lo que sabes

1. ¿Qué hace `fill` con el texto que ya está en el campo?

<details><summary>Respuesta</summary>

Lo reemplaza. El campo solo tiene el texto nuevo.

</details>

2. ¿Por qué usar `check` y no `click` en una casilla?

<details><summary>Respuesta</summary>

`check` se asegura de que la casilla quede marcada. `click` solo hace clic, así que puede quitar una marca que ya estaba.

</details>

3. ¿Qué es actionability?

<details><summary>Respuesta</summary>

Las comprobaciones que hace Playwright antes de una acción: el elemento existe, es visible, es estable, está habilitado y no está tapado. Espera hasta que se cumplan.

</details>

4. ¿Playwright espera el resultado de un clic?

<details><summary>Respuesta</summary>

No. Solo espera a que el elemento esté listo para el clic. Para esperar un resultado, usa una aserción.

</details>

## Siguiente paso

En la siguiente lección aprendes aserciones que esperan, para que tu test pueda comprobar resultados que tardan.
