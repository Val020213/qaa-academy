---
title: Acciones
summary: Haz lo que hace un usuario con goto, click, fill, press, check, selectOption y clear, aprende cómo espera Playwright y elige la acción que dice lo que quieres decir.
duration: 75 min
---

## Empieza con un acertijo

Un test necesita que el primer caso de la Practice app (app de práctica) esté marcado. La lista tiene un caso. Un compañero escribe un pequeño *helper* (función de ayuda), y el test lo llama en dos lugares, porque dos pasos necesitan un caso marcado:

```ts
async function markAsPassed(page: Page) {
  await page.getByTestId("cases-toggle-1").click()
}

await markAsPassed(page)
await markAsPassed(page)
await expect(page.getByTestId("cases-counter")).toHaveText("1 of 1 passed")
```

El test falla. Nadie cambió la app. Entonces el compañero reemplaza `click()` por `check()` y el test pasa.

¿Qué muestra el contador después de la primera versión? ¿Por qué una sola palabra hace la diferencia?

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Elegir la acción que dice lo que quieres decir, no solo la acción que funciona hoy.
- Predecir cuánto espera Playwright antes de una acción, y cuándo se rinde.
- Explicar qué no espera Playwright.
- Convertir una lista de entradas en muchos tests sin copiar código.

## Qué es una acción

Una **acción** es algo que hace un usuario: abrir una página, escribir, hacer clic, marcar una casilla. En Playwright, una acción es un método de un locator o de la página.

Toda acción necesita `await`. Aprendiste por qué en la lección de async. Sin él, el test sigue antes de que el paso termine. El resultado es un test *flaky* (inestable).

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

¿Qué esperas? Llenas el campo con "Hello", y luego lo llenas con "World". ¿El campo contiene "HelloWorld" o "World"? Contiene "World". `fill` reemplaza, no agrega al final.

## press

`press` presiona una tecla del teclado. Úsalo para teclas como `Enter`, `Tab` o `Escape`.

```ts
await page.getByTestId("cases-input").fill("Press Enter to add")
await page.getByTestId("cases-input").press("Enter")
```

En la Practice app, `Enter` en el campo envía el formulario, así que se agrega un caso. No hiciste clic en el botón Add (Agregar). Así trabaja un usuario con teclado, por lo que es un test que vale la pena tener.

## check y uncheck

`check` marca una casilla. `uncheck` quita la marca.

```ts
await page.getByTestId("cases-toggle-1").check()
await page.getByTestId("cases-toggle-1").uncheck()
```

Si la casilla ya está marcada, `check` no hace nada. Esto es mejor que `click`, porque `click` quitaría la marca. `check` dice lo que quieres: una casilla marcada.

Una acción puede decir dos cosas. `click` dice "haz este movimiento". `check` dice "haz que esto sea verdad". Cuando te importa el resultado y no el movimiento, usa la acción que nombra el resultado.

### De vuelta al acertijo

`click()` es un movimiento. La primera llamada marca la casilla, y la segunda quita la marca. El contador muestra "0 of 1 passed", así que la aserción falla. `check()` es una meta: "la casilla debe estar marcada". La segunda llamada encuentra la casilla ya marcada y no hace nada. El contador muestra "1 of 1 passed".

Un helper llamado `markAsPassed` promete un resultado. Debe escribirse con la acción que cumple esa promesa, incluso cuando se llama dos veces. Los programadores llaman a un paso así **idempotente**: hacerlo dos veces da el mismo resultado que hacerlo una vez.

## selectOption

`selectOption` elige una opción en una lista desplegable. Le das el `value` de la opción.

```ts
await page.getByTestId("cases-filter").selectOption("passed")
```

En la Practice app, las opciones tienen los valores `all`, `pending` y `passed`. Después de este paso, la lista muestra solo los casos aprobados.

La lista de la Practice app es un elemento `<select>` nativo. `selectOption` funciona solo con este tipo de elemento. Una lista desplegable hecha con elementos `div` necesitaría otros pasos: hacer clic en ella y luego hacer clic en una opción.

## Playwright espera antes de actuar

Nunca escribes "espera hasta que el botón exista". Playwright lo hace por ti.

Antes de una acción, Playwright comprueba que el elemento está listo. Estas comprobaciones se llaman **actionability** (aptitud para la acción). En palabras simples, el elemento debe:

- existir en la página,
- ser visible,
- ser estable, es decir, no estar moviéndose,
- estar habilitado, es decir, no estar deshabilitado,
- no estar tapado por otro elemento.

Si una comprobación falla, Playwright espera y lo intenta de nuevo. Se detiene cuando termina el timeout del test, que por defecto es de 30 segundos. Entonces el test falla y el mensaje te dice qué comprobación no fue verdadera.

Pruébalo. En la Practice app, presiona "Load report" (Cargar reporte). El botón queda deshabilitado durante aproximadamente un segundo y medio. Ahora predice: un test hace clic en `report-load` dos veces, una línea después de la otra, y luego espera el texto "12 tests":

```ts
await page.getByTestId("report-load").click()
await page.getByTestId("report-load").click()
await expect(page.getByTestId("report-result")).toContainText("12 tests")
```

¿El segundo clic falla porque el botón está deshabilitado? No. Playwright espera hasta que el botón esté habilitado, unos 1.5 segundos, y entonces hace clic. El segundo clic inicia un segundo reporte. El texto "12 tests" está listo unos 3 segundos después del primer clic.

> **Cuidado:** Esperar antes de una acción no espera el resultado de la acción. Después de hacer clic, la app puede seguir trabajando. Para esperar un resultado, usa una aserción. La próxima lección muestra cómo.

## Junta todo

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

Para la mayoría de los formularios esto es suficiente, y es rápido. Pero algunas páginas reaccionan a cada tecla, por ejemplo un cuadro de búsqueda que muestra sugerencias después de cada letra. Para un campo así, usa `pressSequentially`. Presiona las teclas una por una:

```ts
await page.getByTestId("cases-input").pressSequentially("Login", { delay: 100 })
```

El `delay` es el tiempo en milisegundos entre dos teclas. Usa esto solo cuando `fill` no activa el comportamiento que quieres probar.

### Una idea equivocada común: "force arregla un clic que no funciona"

A veces un clic espera y luego falla porque otro elemento tapa el botón. Un principiante encuentra la opción `force: true`:

```ts
await page.getByTestId("report-load").click({ force: true })
```

`force` se salta las comprobaciones de actionability. El clic se envía aunque el botón esté tapado o deshabilitado. Pero no promete que tu botón reciba el clic: una capa puede recibirlo, y un botón deshabilitado no hace nada. El test puede ponerse en verde de todos modos. Pero un usuario real no puede hacer clic en un botón tapado. El test ahora esconde un bug real.

Así que cuando un clic falla, lee el mensaje. Dice qué comprobación no fue verdadera. Luego pregunta: ¿un usuario tendría el mismo problema? Si es así, encontraste un bug en la app, y el test cumplió su trabajo.

### Cómo aparece en el trabajo real de QA: un cuerpo, muchas entradas

Un analista de QA a menudo prueba la misma acción con muchas entradas. La Practice app muestra un error para campos vacíos y otro error para una contraseña incorrecta. Sin cuidado, copias el test y cambias dos valores.

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

El límite: esto funciona cuando los pasos son los mismos y solo cambian los datos. Si cada caso necesita pasos distintos, los tests separados son más fáciles de leer. Otro límite es **YAGNI**, "You Aren't Going to Need It" (no lo vas a necesitar): no construyas una tabla y un bucle para una necesidad que solo imaginas. Con dos casos, dos tests simples también están bien. Una tabla vale la pena cuando las filas son muchas, o cuando esperas que la lista crezca.

Las filas de una tabla así no deben ser al azar. Elígelas con un método. Las **clases de equivalencia** son grupos de entradas que la app trata de la misma manera: "todos los correos válidos", "todos los campos vacíos". Toma una entrada de cada grupo. Los **valores límite** son las entradas en el borde de un grupo: el texto más corto, el texto más largo, vacío, un solo carácter. Los bugs viven en los bordes.

## Práctica

1. Abre `e2e/exercises/03-playwright/03-actions.spec.ts`.
2. Cambia `test.fixme` por `test` en un test a la vez. Escribe los pasos a partir de los comentarios.
3. Ejecuta tu archivo:

```bash
pnpm e2e e2e/exercises/03-playwright/03-actions.spec.ts
```

4. En un test, quita un `await` antes de una acción. Ejecuta el archivo y mira el resultado. Vuelve a poner el `await`.

Compara con `e2e/exercises/03-playwright/solutions/03-actions.spec.ts` cuando termines.

## Reto

Crea el archivo `e2e/challenges/03-actions.spec.ts`. La lista de casos de la Practice app recibe un título. Pruébala con una tabla de entradas, y haz un test por cada fila. Elige las filas con las ideas de clases de equivalencia y valores límite. Primero averigua, a mano en el navegador, qué hace la app con cada entrada. Luego escribe lo que esperas, y deja que los tests te digan si tenías razón.

Está terminado cuando:

- El archivo tiene una tabla de al menos cinco entradas y crea un test por fila, con un nombre que dice de qué entrada se trata.
- Las entradas incluyen: un título normal, un título con espacios antes y después, un título con solo espacios, un título vacío y un título muy largo de 300 caracteres. No escribes el título largo a mano.
- Cada test comprueba la cantidad de filas de la lista y el texto del contador `cases-counter`. Cuando se agrega una fila, también comprueba el título que muestra la lista.
- Todos los tests pasan con `pnpm e2e e2e/challenges/03-actions.spec.ts`, y `pnpm e2e e2e/challenges/03-actions.spec.ts --list` muestra un nombre de test por cada fila.
- Cambiaste un valor esperado a propósito y el mensaje de fallo te dijo qué fila falló. Luego lo devolviste a como estaba.

Vas a necesitar algo que esta lección no enseñó: cómo construir un texto largo con código, y cómo comprobar que no se agregó nada. Busca: `javascript string repeat`, `playwright toHaveCount 0`.

## Piénsalo bien

1. Predice el resultado y explica por qué. En la Practice app con la lista vacía:

```ts
await page.getByTestId("cases-input").fill("Login")
await page.getByTestId("cases-input").press("Enter")
await page.getByTestId("cases-input").press("Enter")
await expect(page.getByTestId("cases-item")).toHaveCount(?)
```

¿Qué número va en lugar de `?`, y qué contiene el campo al final?

<details><summary>Respuesta</summary>

La cantidad es 1, y el campo está vacío. El primer Enter envía el formulario, la app agrega el caso y limpia el campo. El segundo Enter envía el formulario otra vez, pero ahora el título está vacío, y la app ignora un título vacío. La segunda acción no estuvo mal. La app simplemente no tenía nada que hacer.

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

3. Dos versiones funcionan. La versión A es una tabla de dos casos de login y un bucle que crea dos tests. La versión B son dos tests separados con los pasos escritos dos veces. ¿Cuál es mejor, y qué te haría elegir la otra?

<details><summary>Respuesta</summary>

Con dos casos, B está bien y es más fácil de leer: toda la historia está en un solo lugar, y un lector nuevo no necesita entender un bucle. Esta es la idea de YAGNI. A es mejor cuando hay muchas filas, o cuando la lista va a crecer, porque un caso nuevo es una línea nueva. Elige A cuando solo cambian los datos. Elige B cuando los casos necesitan pasos o comprobaciones distintos.

</details>

4. ¿Qué se rompe si un desarrollador reemplaza el `<select data-testid="cases-filter">` nativo por una lista desplegable hecha con elementos `div`, con el mismo testid y las mismas opciones visibles?

<details><summary>Respuesta</summary>

`selectOption` falla, porque funciona solo con un elemento `<select>` real. El mensaje dice que el elemento no es un `select`. El usuario no ve ningún cambio, así que la app no está mal, pero el test ahora debe hacer clic en la lista y luego hacer clic en una opción. Además, el comportamiento de teclado de un `div` es un riesgo nuevo que probar. Un control nativo da soporte de teclado y de lector de pantalla gratis, y un control personalizado debe construirlo otra vez.

</details>

5. Explica a un compañero en tres frases qué hace actionability. No uses la palabra "esperar".

<details><summary>Respuesta</summary>

Antes de hacer clic o escribir, Playwright pregunta si un usuario real podría hacerlo ahora: el elemento está ahí, se puede ver, no se está moviendo, no está deshabilitado y nada lo tapa. Si la respuesta es no, pregunta otra vez y otra vez hasta que la respuesta sea sí o se acabe el tiempo. Así tú describes qué hacer, y Playwright se encarga del cuándo.

</details>

6. Un banner de cookies tapa el botón Sign in en una pantalla pequeña de teléfono, así que `click()` falla después de 30 segundos. Un colega propone `click({ force: true })`. Otro propone cerrar primero el banner. Un tercero propone una pantalla más grande para el test. ¿Qué harías?

<details><summary>Respuesta</summary>

No hay una sola respuesta correcta. `force: true` pone el test en verde pero esconde el problema: un usuario real en un teléfono tampoco puede presionar el botón, así que puede ser un bug real. Una pantalla más grande evita el problema pero también evita la prueba del teléfono. Cerrar primero el banner es lo que hace un usuario real, así que es la prueba más honesta. La elección correcta depende del objetivo del test. Si el objetivo es el diseño en teléfono, reporta el botón tapado como un defecto. Si el objetivo es la lógica de login, cierra el banner como un paso de preparación.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Cuál es la diferencia entre `fill()` y `pressSequentially()` en Playwright?**
   - Busca: `playwright fill vs pressSequentially`
   - Pruébalo: En la Practice app, abre las DevTools, y en la Console selecciona el campo `cases-input` en el panel Elements, luego escribe `$0.addEventListener("keydown", (e) => console.log(e.key))`. Escribe tres letras a mano y observa. Luego escribe un test que use `pressSequentially` en el mismo campo y ejecútalo con `pnpm e2e:headed`.
   - Una buena respuesta explica: cómo cada uno introduce el texto, qué eventos recibe la página, y una situación donde `fill` no es suficiente.

2. **¿Cuál es la diferencia entre el atributo HTML `disabled` y `aria-disabled`?**
   - Busca: `html disabled vs aria-disabled button`
   - Pruébalo: En las DevTools, selecciona el botón Load report. Agrega el atributo `aria-disabled="true"` editando el HTML, y haz clic en el botón. Luego quítalo y agrega `disabled`. Compara lo que pasa.
   - Una buena respuesta explica: qué hace cada uno para un usuario de ratón y para un usuario de lector de pantalla, y por qué esto importa cuando pruebas un botón que "no se puede presionar".

3. **¿Qué son las pruebas guiadas por datos (data-driven testing), y cuándo son una buena idea?**
   - Busca: `data-driven testing parameterized tests`
   - Pruébalo: Escribe una tabla de tres filas para el formulario de login en un archivo nuevo, recórrela con un bucle para crear tests, y ejecuta `pnpm e2e <tu archivo> --list`. Lee cómo aparecen los nombres. Luego cambia el nombre de una fila y mira cómo cambia el nombre.
   - Una buena respuesta explica: cómo funciona un test con una tabla de entradas, qué se gana, y cuándo los tests separados son más claros.

## Siguiente paso

En la próxima lección aprendes aserciones que esperan, para que tu test pueda comprobar resultados que toman tiempo.
