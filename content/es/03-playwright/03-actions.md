---
title: Acciones
duration: 60 min
---

## Objetivo

En esta lección usas locators para interactuar con la Practice app y eliges la acción según el resultado que necesitas. También distingues la espera antes de actuar de la espera por un resultado.

- Navegar, hacer clic y usar los controles de un formulario.
- Marcar una casilla sin cambiarla por error al repetir el paso.
- Entender las comprobaciones de Playwright antes de una acción.
- Crear un test por cada entrada de una tabla de datos.

## goto y click

`goto` abre una dirección. Con el `baseURL` de la configuración, `/#/practice` se convierte en `http://localhost:5180/#/practice`.

```ts
await page.goto("/#/practice")
```

`click` hace clic en el elemento que encuentra el locator.

```ts
await page.getByTestId("login-submit").click()
```

## fill y clear

`fill` reemplaza el texto que había en el campo.

```ts
await page.getByTestId("login-email").fill("qa@example.com")
```

`clear` vacía el campo.

```ts
await page.getByTestId("login-email").clear()
```

## press

`press` presiona una tecla del teclado. Úsalo para teclas como `Enter`, `Tab` o `Escape`.

```ts
await page.getByTestId("cases-input").fill("Press Enter to add")
await page.getByTestId("cases-input").press("Enter")
```

En la Practice app, el navegador envía el formulario al presionar `Enter` en el campo. La app agrega el caso, igual que al hacer clic en Add.

## check y uncheck

`check` marca una casilla. `uncheck` quita la marca.

```ts
await page.getByTestId("cases-toggle-1").check()
await page.getByTestId("cases-toggle-1").uncheck()
```

Si la casilla ya está marcada, `check` no cambia su estado. Un clic cambia la marca cada vez que lo repites. Este test llama dos veces al mismo helper con un caso en la lista:

```ts
async function markAsPassed(page: Page) {
  await page.getByTestId("cases-toggle-1").click()
}

await markAsPassed(page)
await markAsPassed(page)
await expect(page.getByTestId("cases-counter")).toHaveText("1 of 1 passed")
```

El primer clic marca la casilla y el segundo quita la marca. El contador muestra "0 of 1 passed", así que la aserción falla.

Al reemplazar `click()` por `check()`, la segunda llamada deja la casilla marcada y el contador muestra "1 of 1 passed". La operación es **idempotente**: repetirla produce el mismo resultado que ejecutarla una vez.

## selectOption

`selectOption` elige una opción en una lista desplegable. Le das el `value` de la opción.

```ts
await page.getByTestId("cases-filter").selectOption("passed")
```

En la Practice app, las opciones tienen los valores `all`, `pending` y `passed`. Después de este paso, la lista muestra solo los casos aprobados.

El control es un elemento `<select>` nativo. `selectOption` funciona solo con este tipo de elemento. Una lista desplegable hecha con elementos `div` necesita hacer clic en ella y luego en una opción.

## Playwright espera antes de actuar

Antes de una acción, Playwright comprueba que el elemento está listo. Estas comprobaciones se llaman **actionability** (aptitud para la acción). En palabras simples, el elemento debe:

- existir en la página,
- ser visible,
- ser estable, es decir, no estar moviéndose,
- estar habilitado, es decir, no estar deshabilitado,
- no estar tapado por otro elemento.

Si una comprobación falla, Playwright espera y lo intenta de nuevo. Se detiene cuando termina el timeout del test, que por defecto es de 30 segundos. Entonces el test falla y el mensaje te dice qué comprobación no fue verdadera.

En la Practice app, Load report deshabilita el botón durante aproximadamente un segundo y medio. Este test intenta hacer clic dos veces seguidas:

```ts
await page.getByTestId("report-load").click()
await page.getByTestId("report-load").click()
await expect(page.getByTestId("report-result")).toContainText("12 tests")
```

Playwright espera hasta que el botón esté habilitado, unos 1.5 segundos, y entonces hace clic. El segundo clic inicia un segundo reporte. El texto "12 tests" está listo unos 3 segundos después del primer clic.

La app puede seguir trabajando después de que termine el clic. La aserción comprueba el resultado del reporte.

## Un test de login

Este test abre la página, llena los campos y hace clic en Sign in. La aserción comprueba que aparece el mensaje de bienvenida.

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

## Una tabla de entradas

La Practice app muestra un error para campos vacíos y otro para una contraseña incorrecta. Cuando los pasos son iguales y solo cambian los datos, puedes escribir los pasos una vez y recorrer las entradas:

```ts
import { expect, test } from "./lib/test"

const invalidLogins = [
  {
    name: "empty fields",
    email: "",
    password: "",
    message: "Enter your email and password.",
  },
  {
    name: "a wrong password",
    email: "qa@example.com",
    password: "wrong",
    message: "Wrong email or password.",
  },
]

for (const { name, email, password, message } of invalidLogins) {
  test(`login rejects ${name}`, async ({ page }) => {
    await page.goto("/#/practice")
    await page.getByTestId("login-email").fill(email)
    await page.getByTestId("login-password").fill(password)
    await page.getByTestId("login-submit").click()

    await expect(page.getByTestId("login-error")).toHaveText(message)
  })
}
```

Al cargar el archivo, el runner de Playwright registra un test por cada llamada a `test`. El bucle registra dos tests con nombres distintos; cada uno usa los datos de su fila.

Si los casos necesitan pasos distintos, los tests separados son más fáciles de leer. Con dos casos, dos tests simples también están bien. Usa una tabla cuando las filas justifiquen compartir los pasos.

Elige las entradas por **clases de equivalencia**: grupos de valores que la app trata de la misma manera, como los títulos vacíos o con solo espacios. Prueba una entrada de cada grupo.

Incluye también **valores límite**, como un texto vacío o uno de un solo carácter. Si el campo tiene un límite de longitud, prueba un texto que alcance ese límite.

## Profundiza

### Eventos de teclado con pressSequentially

Cuando una persona escribe, el navegador recibe eventos de teclado para cada tecla. `fill` reemplaza el texto del campo y avisa a la página que el valor cambió, sin reproducir cada tecla.

Si el comportamiento que pruebas depende de eventos de teclado, usa `pressSequentially`:

```ts
await page.getByTestId("cases-input").pressSequentially("Login", { delay: 100 })
```

El `delay` es el tiempo en milisegundos entre dos teclas. Usa esta acción cuando `fill` no activa el comportamiento que quieres probar.

### Los límites de force

Si otro elemento tapa el botón, un clic puede esperar y fallar. La opción `force: true` permite forzar el clic:

```ts
await page.getByTestId("report-load").click({ force: true })
```

`force` se salta las comprobaciones de actionability. El clic se envía aunque el botón esté tapado o deshabilitado. Pero no promete que tu botón reciba el clic: una capa puede recibirlo, y un botón deshabilitado no hace nada. El test puede ponerse en verde de todos modos. Pero un usuario real no puede hacer clic en un botón tapado. El test ahora esconde un bug real.

Lee el mensaje de fallo antes de forzar una acción. Si un usuario tampoco puede usar el botón, revisa el problema en la app.

## Práctica

1. Abre `e2e/exercises/03-playwright/03-actions.spec.ts`.
2. Cambia `test.fixme` por `test` en un test a la vez. Escribe los pasos a partir de los comentarios.
3. Ejecuta tu archivo:

```bash
pnpm e2e e2e/exercises/03-playwright/03-actions.spec.ts
```

Compara con `e2e/exercises/03-playwright/solutions/03-actions.spec.ts` cuando termines.

## Reto

Crea `e2e/challenges/03-actions.spec.ts`. Prueba los títulos de la lista de casos con una tabla de entradas y un test por fila. Comprueba primero en el navegador qué hace la Practice app con cada entrada y usa ese resultado en tus aserciones.

Está terminado cuando:

- La tabla tiene al menos cinco entradas: un título normal, uno con espacios antes y después, uno con solo espacios, uno vacío y uno de 300 caracteres generado con código.
- El archivo crea un test por fila, con un nombre que identifica la entrada.
- Cada test comprueba la cantidad de filas y el texto de `cases-counter`. Si agrega una fila, también comprueba el título que muestra la lista.
- Todos los tests pasan con `pnpm e2e e2e/challenges/03-actions.spec.ts`, y `pnpm e2e e2e/challenges/03-actions.spec.ts --list` muestra un nombre de test por cada fila.

Busca cómo construir un texto largo con código y comprobar que no se agregó nada: `javascript string repeat`, `playwright toHaveCount 0`.

## Piénsalo bien

1. En la Practice app con la lista vacía, ¿qué número va en lugar de `?` y qué contiene el campo al final?

```ts
await page.getByTestId("cases-input").fill("Login")
await page.getByTestId("cases-input").press("Enter")
await page.getByTestId("cases-input").press("Enter")
await expect(page.getByTestId("cases-item")).toHaveCount(?)
```

<details><summary>Respuesta</summary>

La cantidad es 1 y el campo está vacío. El primer Enter envía el formulario; la app agrega el caso y limpia el campo. El segundo Enter envía un título vacío, que la app ignora.

</details>

2. Este test pasa, pero puede pasar por la razón equivocada. Encuentra la debilidad y arréglala.

```ts
test("ignores a title with only spaces", async ({ page }) => {
  await page.goto("/#/practice")
  await page.getByTestId("cases-input").fill("   ")
  await page.getByTestId("cases-add").click()
  await expect(page.getByTestId("cases-item")).toHaveCount(0)
})
```

<details><summary>Respuesta</summary>

La aserción dice que no existe nada. Eso es cierto al inicio, así que puede pasar antes de que la app haya reaccionado. Si la app agregara una fila 200 milisegundos después, el test estaría en verde y el bug pasaría. Para probar que el clic fue procesado, agrega una segunda acción que tenga un resultado visible. Por ejemplo, agrega un caso real después de los espacios y comprueba que la cantidad es 1, y no 2. Una comprobación de "no pasó nada" es fuerte solo cuando después viene algo observable.

</details>

3. ¿Qué se rompe si un desarrollador reemplaza el `<select data-testid="cases-filter">` nativo por una lista desplegable hecha con elementos `div`, con el mismo testid y las mismas opciones visibles?

<details><summary>Respuesta</summary>

`selectOption` falla porque requiere un elemento `<select>` real. El test debe hacer clic en la lista y luego en una opción. El control personalizado también necesita implementar el comportamiento de teclado y la accesibilidad que ofrece el control nativo.

</details>

## Siguiente paso

En la próxima lección aprendes aserciones que esperan, para que tu test pueda comprobar resultados que toman tiempo.
