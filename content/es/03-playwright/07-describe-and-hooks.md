---
title: Describe, hooks y aislamiento
summary: Agrupa tests, comparte la preparación con hooks y entiende por qué cada test debe valerse por sí solo.
duration: 90 min
---

## Empieza con un acertijo

Mira este archivo. Tiene dos tests y una variable compartida.

```ts
import { test } from "./lib/test"

let counter = 0

test("first", async () => {
  counter++
  console.log("first sees", counter)
})

test("second", async () => {
  counter++
  console.log("second sees", counter)
})
```

La configuración tiene `fullyParallel: true`. Ejecutas el archivo dos veces: una con `--workers=1` y otra con `--workers=2`. Un *worker* (trabajador) es un proceso que ejecuta tests.

¿Qué esperas que imprima cada ejecución?

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Predecir en qué orden se ejecutan los *hooks* y los tests.
- Decidir qué va en un hook y qué va en el test.
- Explicar por qué un test que depende de otro se rompe, y cómo demostrar que tus tests son independientes.
- Elegir entre `test.only`, `test.skip` y `test.fixme`, y decir por qué `only` nunca debe subirse al repositorio.

## test.describe: agrupa tests

`test.describe` pone tests relacionados en un grupo. El grupo tiene un nombre.

```ts
test.describe("login", () => {
  test("rejects wrong credentials", async ({ page }) => {
    // ...
  })

  test("accepts the test credentials", async ({ page }) => {
    // ...
  })
})
```

El reporte muestra el nombre del grupo antes del nombre del test, como en `login › rejects wrong credentials`. Usa un grupo para cada funcionalidad. En `e2e/playground.spec.ts` los grupos son `login`, `test case list` y `slow loading`.

## beforeEach: pasos que todos los tests necesitan

Casi todos los tests de la app Practice empiezan con `page.goto("/#/practice")`. Para no escribirlo una y otra vez, usa un **hook** (gancho). Un hook es código que Playwright ejecuta en un momento fijo.

```ts
test.beforeEach(async ({ page }) => {
  await page.goto("/#/practice")
})
```

Dentro de un grupo, el hook se aplica solo a los tests de ese grupo. Al inicio de un archivo, se aplica a todos los tests del archivo.

`test.afterEach` se ejecuta después de cada test, incluso cuando el test falla. Su función recibe primero los *fixtures* (aquí `{}`, porque no necesita ninguno) y un segundo valor, `testInfo`, con datos sobre el test.

```ts
test.afterEach(async ({}, testInfo) => {
  console.log(`${testInfo.title}: ${testInfo.status}`)
})
```

Esto imprime el nombre del test y su resultado, por ejemplo `starts empty: passed`.

> **Consejo:** Pon en un hook solo pasos de preparación. No pongas ahí aserciones ni las acciones principales de un test. Quien lee el test debe ver qué hace el test.

### Experimento: el orden de los hooks

Lee este archivo y escribe las líneas exactas que esperas, en orden, cuando lo ejecutas con `--workers=1`.

```ts
import { test } from "./lib/test"

test.beforeEach(async () => {
  console.log("outer")
})

test("a", async () => {
  console.log("test a")
})

test.describe("group", () => {
  test.beforeEach(async () => {
    console.log("inner")
  })

  test("b", async () => {
    console.log("test b")
  })
})
```

La terminal muestra esto:

```text
outer
test a
outer
inner
test b
```

El hook externo se ejecuta antes de cada test del archivo. El hook interno se ejecuta solo para los tests de su grupo, y después del externo. Así que el hook externo es el lugar correcto para los pasos que todos los tests necesitan, como abrir la página.

## Aislamiento: cada test empieza limpio

Cada test recibe una `page` nueva en un **browser context** (contexto de navegador) nuevo. Un contexto de navegador es como un perfil de navegador recién creado: sin cookies, sin datos guardados, sin pestañas abiertas por otros tests.

Esto se llama **aislamiento**. Tiene dos resultados.

- Un test no puede romperse por lo que hizo otro test.
- Los tests pueden ejecutarse en paralelo, al mismo tiempo, y en cualquier orden.

En la app Practice, un test agrega un caso. El siguiente test abre la página y la lista vuelve a estar vacía.

De aquí sale la regla del equipo: cada test crea sus propios datos y no depende del orden de los tests.

### Experimento: rompe la regla a propósito

Aquí hay dos tests que comparten una variable. Es un mal ejemplo.

```ts
let caseWasAdded = false

test("adds a case", async ({ page }) => {
  // ...adds a case in the page
  caseWasAdded = true
})

test("uses the added case", async ({ page }) => {
  expect(caseWasAdded).toBe(true)
})
```

Predice: ¿el segundo test pasa cuando ejecutas todo el archivo? ¿Pasa cuando ejecutas solo el segundo test, con `-g "uses the added case"`? Ejecuta ambos y comprueba.

### De vuelta al acertijo

Con `--workers=1`, los dos tests corren uno después del otro en el mismo proceso. La salida es `first sees 1` y `second sees 2`. Con `--workers=2`, cada worker es un proceso separado con su propia copia del archivo y de la variable. Normalmente cada test corre en un worker distinto, así que los dos imprimen `1`.

Lo mismo rompe la variable compartida de arriba. El segundo test puede correr en un worker donde el primero nunca corrió. El aislamiento es la razón por la que los tests pueden correr en paralelo. Un test que necesita datos los crea para sí mismo.

## test.only, test.skip y test.fixme

Tres herramientas cambian qué tests se ejecutan.

`test.only` ejecuta solo este test. Sirve para concentrarte en un test mientras trabajas.

```ts
test.only("starts empty", async ({ page }) => {
  // ...
})
```

`test.skip` no ejecuta un test. El reporte lo muestra como omitido. Úsalo para un test que no aplica ahora.

`test.fixme` también omite un test, pero dice: "esto debería funcionar, y está roto o sin terminar". Los archivos de ejercicios de este curso usan `test.fixme`.

```ts
test.fixme("known bug: counter after delete", async ({ page }) => {
  // ...
})
```

> **Cuidado:** Nunca hagas commit de `test.only`. Todos los demás tests quedarían fuera sin avisar, y el build se vería verde. Este proyecto usa `forbidOnly` en `playwright.config.ts`. En CI, un `only` olvidado hace fallar toda la ejecución con el mensaje `item focused with '.only' is not allowed due to the 'forbidOnly' option` y el nombre del test.

Para los tests omitidos, escribe la razón en el nombre del test o en un comentario, para que alguien pueda arreglarlo después.

## Nombra los tests como comportamientos

El reporte es una lista de lo que hace la app. Escribe los nombres de modo que la lista se lea como documentación.

- Bueno: `rejects wrong credentials`, `adds a case and updates the counter`.
- No bueno: `test 1`, `login test`, `check button`.

Un buen nombre dice la situación y el resultado. Usa el nombre del grupo para la funcionalidad, así no la repites en el nombre del test.

Sigue la regla de **un trabajo por test**, igual que un trabajo por función. Si el nombre necesita la palabra "y" muchas veces, divide el test.

## Profundiza

### Por qué los hooks se ejecutan en un orden fijo

Playwright ejecuta los hooks en un orden claro. Primero corre un `beforeEach` que está fuera de un grupo. Luego corre el `beforeEach` dentro del grupo. Luego el test. Lo viste en el experimento de arriba.

### Una idea equivocada común: "puedo compartir una variable entre tests"

Un principiante escribe variables compartidas para no repetir un paso. Funciona solo por suerte. Con `fullyParallel`, Playwright ejecuta los tests en varios workers. Cada worker es un proceso separado con su propia copia del archivo y sus propias variables. El segundo test puede correr en un worker donde el primero nunca corrió. También puede correr primero. La variable es `false` y el test falla.

### Un compromiso: no escondas la historia en un hook

`beforeEach` es DRY, "Don't Repeat Yourself" (no te repitas): los pasos se escriben una vez. Pero un hook que hace demasiado esconde de qué trata el test. Compara:

```ts
import { expect, test, type Page } from "./lib/test"

async function addCase(page: Page, title: string): Promise<void> {
  await page.getByTestId("cases-input").fill(title)
  await page.getByTestId("cases-add").click()
}

test.beforeEach(async ({ page }) => {
  await page.goto("/#/practice")
})

test("deleting a case updates the counter", async ({ page }) => {
  await addCase(page, "Check the login")
  await page.getByTestId("cases-delete-1").click()

  await expect(page.getByTestId("cases-counter")).toHaveText("0 of 0 passed")
})
```

Abrir la página es igual para todos los tests, así que va en el hook. Agregar un caso es un paso de este test, así que se queda en el test, como una llamada a una función con un nombre claro. El lector ve la historia completa sin subir en el archivo.

Usa un hook para lo que todos los tests del grupo necesitan. Usa una función para los pasos que solo algunos tests necesitan. Los fixtures, en el módulo 4, son el siguiente paso para la preparación compartida.

## Práctica

1. Abre `e2e/exercises/03-playwright/07-describe-and-hooks.spec.ts`. Los grupos y los hooks ya están ahí.
2. Cambia `test.fixme` por `test` en un test a la vez. Escribe los pasos que dicen los comentarios.
3. Ejecuta tu archivo:

```bash
pnpm e2e e2e/exercises/03-playwright/07-describe-and-hooks.spec.ts
```

4. Mira el último test del archivo. ¿Por qué pasa aunque otro test agrega un caso?
5. Agrega `.only` a un test y ejecuta el archivo. Luego quítalo. Cuenta cuántos tests se ejecutaron.

Compara con `e2e/exercises/03-playwright/solutions/07-describe-and-hooks.spec.ts` cuando termines.

## Reto

Escribe un spec que pruebe las reglas de la lista de casos, y demuestra que los tests no dependen unos de otros.

Crea el archivo `e2e/challenges/07-case-list-rules.spec.ts`. Prueba estas reglas de la página Practice, y encuentra una regla más por tu cuenta leyendo `src/practice/CasesPanel.tsx`:

- Un título con solo espacios no se agrega.
- Pulsar Enter en el campo del título agrega el caso, igual que el botón Add.
- Después de borrar el caso 1 y agregar un caso nuevo, el caso nuevo no recibe el id 1.
- El contador cuenta todos los casos, también cuando el filtro oculta algunos.

Importa `test` y `expect` desde `../lib/test`. Usa al menos dos grupos `test.describe` y un `beforeEach`. Usa tus propios títulos de casos de un mundo que te guste: un zoológico, una cocina, una escuela.

Está terminado cuando:

- El archivo tiene al menos cinco tests, y cada test tiene un nombre que dice un comportamiento.
- Ningún test usa una variable escrita por otro test.
- `pnpm e2e e2e/challenges/07-case-list-rules.spec.ts --repeat-each=5 --workers=4` pasa todas las ejecuciones.
- Ejecutar un test solo, con `-g "<parte de su nombre>"`, también pasa.
- Si rompes un valor esperado a propósito, falla exactamente ese test. Luego lo arreglas.

Vas a necesitar algo que esta lección no enseñó: cómo pulsar una tecla en un campo y cómo ejecutar un archivo muchas veces a la vez. Busca: `playwright locator press Enter`, `playwright repeat-each workers command line`.

## Piénsalo bien

1. Predice el orden de la salida con `--workers=1`. Explica por qué.

```ts
test.beforeEach(async () => { console.log("outer") })

test.describe("zoo", () => {
  test.beforeEach(async () => { console.log("inner") })
  test("feeds the lion", async () => { console.log("lion") })
})

test("opens the gate", async () => { console.log("gate") })
```

<details><summary>Respuesta</summary>

Los tests se ejecutan en el orden en que están en el archivo, así que el grupo va primero. La salida es `outer`, `inner`, `lion`, `outer`, `gate`. El hook externo se ejecuta antes de cada uno de los dos tests. El hook interno es parte del grupo `zoo`, así que no se ejecuta para `gate`.

</details>

2. Este hook tiene un bug. El código corre. ¿Qué está mal y por qué puede ser difícil de ver?

```ts
test.beforeEach(async ({ page }) => {
  page.goto("/#/practice")
})
```

<details><summary>Respuesta</summary>

Falta el `await` antes de `page.goto`. El hook termina antes de que la página esté abierta, y la navegación corre por su cuenta. Los pasos siguientes pueden empezar demasiado pronto. A menudo el test funciona igual, porque los pasos siguientes esperan a sus elementos, pero es suerte. Si la dirección está mal, la falla puede aparecer más tarde como un mensaje sobre un elemento que falta, no sobre la causa real.

</details>

3. Dos versiones. Versión A: un `beforeEach` agrega un caso en cada test del grupo `test case list`. Versión B: los tests llaman a `addCase(page, "title")` cuando necesitan un caso. El grupo tiene un test llamado "starts empty". ¿Qué versión es mejor aquí y qué te haría elegir la otra?

<details><summary>Respuesta</summary>

La versión B es mejor aquí. En la versión A, el test "starts empty" no se puede escribir, porque el hook ya agregó un caso. Además, quien lee cada test no ve de dónde salió el caso. Si todos los tests del grupo necesitaran exactamente el mismo caso, y nada más, la versión A sería más corta y estaría bien. La elección depende de cuántos tests necesitan los mismos datos.

</details>

4. ¿Qué se rompe si la app Practice guardara sus casos en un servidor que todos los tests comparten, y no en la página?

<details><summary>Respuesta</summary>

Un contexto de navegador nuevo ya no da una lista limpia, porque los datos están en el servidor. Dos tests que corren al mismo tiempo pueden ver los casos del otro. Conteos como `1 of 1 passed` se vuelven incorrectos, y las fallas cambian de una ejecución a otra. Ahora debes hacer los datos únicos por test, por ejemplo con un título que incluya una parte aleatoria, y comprobar solo tus propias filas. O debes limpiar los datos por medio del servidor antes de cada test.

</details>

5. Un compañero te pregunta qué es el aislamiento. Explícalo en tres oraciones sin usar las palabras "contexto" ni "independiente".

<details><summary>Respuesta</summary>

Ejemplo: "Cada test recibe un navegador nuevo, sin memoria de los otros tests. Así un test no puede dejar algo que cambie el resultado de otro. Por eso los tests pueden correr al mismo tiempo y en cualquier orden." Tus palabras pueden ser distintas. Una buena respuesta dice con qué empieza cada test y qué permite eso.

</details>

6. El `beforeEach` de un grupo falla porque `page.goto` no puede llegar al sitio. ¿Qué pasa con los tests de ese grupo y qué te enseña eso sobre qué poner en un hook?

<details><summary>Respuesta</summary>

Cada test del grupo falla, y el cuerpo del test no se ejecuta. Un hook que falla cuenta como una falla del test. Esto es útil: ves un error claro, y no muchos confusos. También muestra que un hook debe contener solo pasos de preparación que tienen que funcionar. Si un hook hace trabajo opcional que puede fallar, muchos tests fallan por una razón que no tiene que ver con ellos.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué significan "setup" y "teardown" en la automatización de tests?**
   - Busca: `test setup teardown pattern`
   - Pruébalo: En un spec de prueba, agrega un `beforeEach` y un `afterEach` que impriman `testInfo.title`. Haz que un test falle a propósito. ¿El `afterEach` se ejecuta igual para el test que falló?
   - Una buena respuesta explica: qué hace cada uno, por qué un test debe dejar las cosas como las encontró y cómo se compara esto con `beforeEach` y `afterEach`.

2. **¿Por qué los tests que dependen del orden son un problema para un equipo de QA?**
   - Busca: `order dependent tests flaky test independence`
   - Pruébalo: Ejecuta el ejemplo de la variable compartida de esta lección con `--workers=1`, luego con `--workers=4`, y luego solo el segundo test con `-g`. Escribe el resultado de cada ejecución.
   - Una buena respuesta explica: qué es un test que depende del orden, cómo se rompe cuando los tests corren en paralelo o en otro orden y cómo arreglarlo.

3. **¿Qué hace `test.describe.configure({ mode: "serial" })` en Playwright y por qué la documentación lo desaconseja?**
   - Busca: `playwright serial mode describe configure`
   - Pruébalo: Pon tres tests en un grupo serial. Haz que el primero falle. Ejecuta el archivo. ¿Qué pasa con los otros dos? Luego quita la línea serial y ejecuta otra vez.
   - Una buena respuesta explica: cómo el modo serial cambia la forma en que corren los tests, qué pasa cuando un test falla y por qué los tests independientes son mejores.

## Siguiente paso

En la próxima lección lees `playwright.config.ts` línea por línea.
