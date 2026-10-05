---
title: Acciones
summary: Haz lo que hace un usuario con goto, click, fill, press, check, selectOption y clear, y aprende cómo espera Playwright.
duration: 45 min
---

## Objetivo

- Usar las acciones principales: `goto`, `click`, `fill`, `press`, `check`, `uncheck`, `selectOption` y `clear`.
- Explicar con palabras simples cómo espera Playwright antes de una acción.
- Escribir siempre `await` antes de una acción.

## Qué es una acción

Una **acción** es algo que hace un usuario: abrir una página, escribir, hacer clic, marcar una casilla. En Playwright, una acción es un método de un *locator* o de la página.

Toda acción necesita `await`. Aprendiste por qué en la lección sobre async. Sin él, el test sigue adelante antes de que termine el paso. El resultado es un test *flaky* (inestable).

## goto

`goto` abre una dirección.

```ts
await page.goto("/#/practice")
```

El inicio de la dirección viene de `baseURL` en la configuración. Así `/#/practice` se convierte en `http://localhost:5180/#/practice`.

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

En la Practice app (app de práctica), `Enter` en el campo envía el formulario, así que se agrega un caso. No hiciste clic en el botón Add (Agregar).

## check y uncheck

`check` marca una casilla. `uncheck` quita la marca.

```ts
await page.getByTestId("cases-toggle-1").check()
await page.getByTestId("cases-toggle-1").uncheck()
```

Si la casilla ya está marcada, `check` no hace nada. Esto es mejor que `click`, porque `click` quitaría la marca. `check` dice lo que quieres: una casilla marcada.

## selectOption

`selectOption` elige una opción en una lista desplegable. Das el `value` (valor) de la opción.

```ts
await page.getByTestId("cases-filter").selectOption("passed")
```

En la Practice app, las opciones tienen los valores `all`, `pending` y `passed`. Después de este paso, la lista muestra solo los casos aprobados.

## Playwright espera antes de actuar

Nunca escribes "espera hasta que el botón exista". Playwright lo hace por ti.

Antes de una acción, Playwright comprueba que el elemento esté listo. Estas comprobaciones se llaman **actionability** (aptitud para la acción). Con palabras simples, el elemento debe:

- existir en la página,
- ser visible,
- ser estable, es decir, no estar moviéndose,
- estar habilitado, es decir, no estar deshabilitado,
- no estar tapado por otro elemento.

Si una comprobación falla, Playwright espera y lo intenta de nuevo. Se detiene cuando termina el tiempo límite del test, que por defecto es de 30 segundos. Entonces el test falla y el mensaje te dice qué comprobación no se cumplió.

Pruébalo. En la Practice app, presiona "Load report" (Cargar reporte). El botón está deshabilitado durante cerca de un segundo y medio. Si un test vuelve a hacer clic en él, Playwright espera hasta que el botón esté habilitado.

> **Cuidado:** Esperar antes de una acción no espera el resultado de la acción. Después de hacer clic, la app puede seguir trabajando. Para esperar un resultado, usa una aserción. La siguiente lección muestra cómo.

## Júntalo todo

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

Léelo como un caso de prueba manual: abre la página, escribe el correo, escribe la contraseña, haz clic en Sign in (Iniciar sesión), comprueba el mensaje de bienvenida.

## Profundiza

### Por qué fill no es lo mismo que escribir

Cuando una persona escribe, el navegador recibe un evento de tecla por cada tecla. `fill` no hace esto. Pone todo el texto en el campo de una vez y avisa a la página que el valor cambió.

Para la mayoría de los formularios esto basta, y es rápido. Pero algunas páginas reaccionan a cada tecla, por ejemplo un cuadro de búsqueda que muestra sugerencias después de cada letra. Para un campo así, usa `pressSequentially`. Presiona las teclas una por una:

```ts
await page.getByTestId("cases-input").pressSequentially("Login", { delay: 100 })
```

El `delay` es el tiempo en milisegundos entre dos teclas. Úsalo solo cuando `fill` no activa el comportamiento que quieres probar.

### Una idea equivocada común: "force arregla un clic que no funciona"

A veces un clic espera y luego falla porque otro elemento tapa el botón. Un principiante encuentra la opción `force: true`:

```ts
await page.getByTestId("report-load").click({ force: true })
```

`force` se salta las comprobaciones de *actionability*. El clic se envía aunque el botón esté tapado o deshabilitado. Pero no garantiza que tu botón reciba el clic: una capa encima puede recibirlo, y un botón deshabilitado no hace nada. El test puede ponerse en verde igual. Pero un usuario real no puede hacer clic en un botón tapado. Ahora el test esconde un *bug* real.

Por eso, cuando un clic falla, lee el mensaje. Dice qué comprobación no se cumplió. Luego pregunta: ¿tendría un usuario el mismo problema? Si es así, encontraste un *bug* en la app, y el test hizo su trabajo.

### Cómo aparece en el trabajo real de QA: un cuerpo, muchas entradas

Un analista de QA suele probar la misma acción con muchas entradas. La Practice app muestra un error para campos vacíos y otro error para una contraseña incorrecta. Sin cuidado, copias el test y cambias dos valores.

DRY significa "Don't Repeat Yourself" (no te repitas). Escribe los pasos una vez y recorre los datos con un bucle:

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

Playwright crea dos tests con dos nombres. Un caso nuevo necesita un objeto nuevo, no un test nuevo.

El límite: esto funciona cuando los pasos son los mismos y solo cambian los datos. Si cada caso necesita pasos distintos, los tests separados son más fáciles de leer.

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

2. ¿Por qué usar `check` y no `click` para una casilla?

<details><summary>Respuesta</summary>

`check` se asegura de que la casilla quede marcada. `click` solo hace clic, así que puede quitar una marca que ya estaba.

</details>

3. ¿Qué es *actionability*?

<details><summary>Respuesta</summary>

Las comprobaciones que hace Playwright antes de una acción: el elemento existe, es visible, es estable, está habilitado y no está tapado. Espera hasta que sean verdaderas.

</details>

4. ¿Espera Playwright el resultado de un clic?

<details><summary>Respuesta</summary>

No. Solo espera hasta que el elemento esté listo para el clic. Para esperar un resultado, usa una aserción.

</details>

5. La Practice app no tiene casos. Un test ejecuta `await page.getByTestId("cases-input").press("Enter")` en el campo vacío y luego espera que `cases-item` tenga una cuenta de 1. ¿Qué pasa y por qué?

<details><summary>Respuesta</summary>

El test falla. Presionar Enter envía el formulario, pero la app ignora un título vacío: el código termina antes de agregar un caso. Así que la cuenta se queda en 0. La aserción espera 5 segundos y luego informa la diferencia entre 1 y 0.

</details>

6. Un test llama a `check()` sobre `cases-toggle-1`, pero antes no se agregó ningún caso. Nada en el test está mal salvo este paso que falta. ¿Cuánto tarda el test en fallar y qué dice el mensaje?

<details><summary>Respuesta</summary>

Espera el tiempo límite por defecto del test, 30 segundos, y luego falla. Playwright no puede hacer la acción, así que sigue esperando a que el elemento exista. El mensaje dice que el test superó el tiempo límite y que esperaba el *locator* `getByTestId('cases-toggle-1')`. Un paso de preparación que falta parece un fallo lento, no uno rápido.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Cuál es la diferencia entre `fill()` y `pressSequentially()` en Playwright?**
   - Busca: `playwright fill vs pressSequentially`
   - Una buena respuesta explica: cómo cada uno introduce texto, qué eventos recibe la página, y una situación en la que `fill` no basta.

2. **¿Cuál es la diferencia entre el atributo HTML `disabled` y `aria-disabled`?**
   - Busca: `html disabled vs aria-disabled button`
   - Una buena respuesta explica: qué hace cada uno para un usuario de mouse y para un usuario de lector de pantalla, y por qué importa cuando pruebas un botón que "no se puede presionar".

3. **¿Qué son las pruebas basadas en datos (*data-driven testing*) y cuándo son una buena idea?**
   - Busca: `data-driven testing parameterized tests`
   - Una buena respuesta explica: cómo funciona un test con una tabla de entradas, qué se gana, y cuándo los tests separados son más claros.

## Siguiente paso

En la siguiente lección aprendes las aserciones que esperan, para que tu test pueda comprobar resultados que tardan.
