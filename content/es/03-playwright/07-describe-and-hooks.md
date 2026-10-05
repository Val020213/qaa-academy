---
title: Describe, hooks y aislamiento
summary: Agrupa tests con describe, comparte la preparación con beforeEach, usa only, skip y fixme con cuidado, y nombra bien los tests.
duration: 45 min
---

## Objetivo

- Agrupar tests con `test.describe`.
- Compartir pasos con `beforeEach` y `afterEach`.
- Usar `test.only`, `test.skip` y `test.fixme`, y saber por qué `only` nunca debe subirse con un *commit*.
- Explicar el aislamiento de los tests y escribir nombres de tests que se lean como comportamientos.

## test.describe: agrupar tests

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

El reporte muestra el nombre del grupo antes del nombre del test, como en `login › rejects wrong credentials`. Usa un grupo por funcionalidad. Puedes verlo en `e2e/playground.spec.ts`: tiene los grupos `login`, `test case list` y `slow loading`.

## beforeEach: pasos que todo test necesita

Casi todos los tests de la Practice app (app de práctica) empiezan con `page.goto("/#/practice")`. Para no escribirlo una y otra vez, usa un ***hook*** (gancho). Un *hook* es código que Playwright ejecuta en un momento fijo.

`test.beforeEach` se ejecuta antes de cada test:

```ts
test.beforeEach(async ({ page }) => {
  await page.goto("/#/practice")
})
```

Dentro de un grupo, el *hook* se aplica solo a los tests de ese grupo. Al inicio de un archivo, se aplica a todos los tests del archivo.

`test.afterEach` se ejecuta después de cada test, incluso cuando el test falla. Su función recibe primero las *fixtures* (aquí `{}`, porque no necesita ninguna) y un segundo valor, `testInfo`, con datos sobre el test.

```ts
test.afterEach(async ({}, testInfo) => {
  console.log(`${testInfo.title}: ${testInfo.status}`)
})
```

Esto imprime el nombre del test y su resultado, por ejemplo `starts empty: passed`. Rara vez necesitas `afterEach`, porque una página nueva se descarta por ti.

> **Consejo:** Pon en un *hook* solo pasos de preparación. No pongas allí aserciones ni las acciones principales de un test. Quien lee un test debe ver qué hace el test.

## Aislamiento: cada test empieza limpio

Cada test recibe una `page` nueva en un **contexto de navegador** nuevo. Un contexto de navegador es como un perfil de navegador recién creado: sin *cookies*, sin datos guardados, sin pestañas abiertas de otros tests.

Esto se llama **aislamiento** (*isolation*). Tiene dos resultados.

- Un test no puede romperse por lo que hizo otro test.
- Los tests pueden ejecutarse en paralelo, al mismo tiempo, y en cualquier orden.

Puedes verlo en la Practice app. Un test agrega un caso. El siguiente test abre la página y la lista vuelve a estar vacía.

De aquí sale la regla del equipo: cada test crea sus propios datos y no depende del orden de los tests. Nunca escribas un test que necesite "el caso del test anterior".

## test.only, test.skip y test.fixme

Tres herramientas cambian qué tests se ejecutan.

`test.only` ejecuta solo este test en la corrida. Los demás tests no se ejecutan. Sirve para concentrarte en un test mientras trabajas.

```ts
test.only("starts empty", async ({ page }) => {
  // ...
})
```

`test.skip` no ejecuta un test. El reporte lo muestra como omitido. Úsalo para un test que no aplica por ahora.

`test.fixme` también omite un test, pero dice: "esto debería funcionar, y está roto o sin terminar". Los archivos de ejercicios de este curso usan `test.fixme`.

```ts
test.fixme("known bug: counter after delete", async ({ page }) => {
  // ...
})
```

> **Cuidado:** Nunca subas `test.only` con un *commit*. Todos los demás tests quedarían fuera en silencio, y la compilación se vería en verde. Este proyecto usa `forbidOnly` en `playwright.config.ts`. En CI, un `only` olvidado hace que toda la ejecución falle con el mensaje `item focused with '.only' is not allowed due to the 'forbidOnly' option` y el nombre del test.

Para los tests omitidos, escribe una razón en el nombre del test o en un comentario, para que alguien pueda arreglarlo después.

## Nombra los tests como comportamientos

El reporte es una lista de lo que hace la app. Escribe los nombres para que la lista se lea como documentación.

- Bien: `rejects wrong credentials`, `adds a case and updates the counter`.
- Mal: `test 1`, `login test`, `check button`.

Un buen nombre dice la situación y el resultado. Usa el nombre del grupo para la funcionalidad. Así no la repites en el nombre del test.

Un test comprueba un comportamiento. Si el nombre necesita la palabra "y" muchas veces, divide el test.

## Profundiza

### Por qué los hooks se ejecutan en un orden fijo

Playwright ejecuta los *hooks* en un orden claro. Un `beforeEach` fuera de un grupo se ejecuta primero. Después se ejecuta el `beforeEach` dentro del grupo. Luego el test.

```ts
import { test } from "./lib/test"

test.beforeEach(async () => {
  console.log("outer beforeEach")
})

test.describe("login", () => {
  test.beforeEach(async () => {
    console.log("inner beforeEach")
  })

  test("shows the form", async () => {
    console.log("test body")
  })
})
```

La terminal muestra las tres líneas en este orden: `outer beforeEach`, `inner beforeEach`, `test body`. Así que el *hook* exterior es el lugar correcto para los pasos que todo test necesita, como abrir la página.

### Una idea equivocada común: "puedo compartir una variable entre tests"

Un principiante escribe esto para no repetir un paso. Es un mal ejemplo:

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

Esto funciona solo por suerte. Con `fullyParallel`, Playwright ejecuta los tests en varios *workers* (procesos de trabajo). Cada *worker* es un proceso separado con su propia copia del archivo y sus propias variables. El segundo test puede ejecutarse en un *worker* donde el primer test nunca corrió. También puede ejecutarse primero. La variable es `false`, y el test falla.

El aislamiento no es una regla para molestarte. Es la razón por la que los tests pueden ejecutarse en paralelo. Un test que necesita datos los crea para sí mismo.

### Una decisión con costo: no escondas la historia en un hook

`beforeEach` es DRY (no te repitas): los pasos se escriben una vez. Pero un *hook* que hace demasiado esconde de qué trata el test. Compara:

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

Abrir la página es igual para todos los tests, así que va en el *hook*. Agregar un caso es un paso de este test, así que se queda en el test, como una llamada a una función con un nombre claro. El lector ve la historia completa sin subir en la pantalla.

Usa un *hook* para lo que necesita todo test del grupo. Usa una función para los pasos que solo necesitan algunos tests. Las *fixtures*, en el módulo 4, son el siguiente paso para la preparación compartida.

## Práctica

1. Abre `e2e/exercises/03-playwright/07-describe-and-hooks.spec.ts`. Los grupos y los *hooks* ya están allí.
2. Cambia `test.fixme` por `test` en un test a la vez. Escribe los pasos a partir de los comentarios.
3. Ejecuta tu archivo:

```bash
pnpm e2e e2e/exercises/03-playwright/07-describe-and-hooks.spec.ts
```

4. Mira el último test del archivo. ¿Por qué pasa aunque otro test agrega un caso?
5. Añade `.only` a un test y ejecuta el archivo. Luego quítalo. Cuenta cuántos tests se ejecutaron.

Compara con `e2e/exercises/03-playwright/solutions/07-describe-and-hooks.spec.ts` cuando termines.

## Comprueba lo que sabes

1. ¿Qué hace `beforeEach`?

<details><summary>Respuesta</summary>

Ejecuta su código antes de cada test de su alcance. Se usa para la preparación compartida, como abrir la página.

</details>

2. ¿Qué es el aislamiento?

<details><summary>Respuesta</summary>

Cada test recibe una página nueva en un contexto de navegador nuevo. Los tests no comparten datos, así que pueden ejecutarse en cualquier orden.

</details>

3. ¿Por qué `test.only` nunca debe subirse con un *commit*?

<details><summary>Respuesta</summary>

Hace que la corrida omita todos los demás tests, y el resultado se ve en verde. En CI, `forbidOnly` hace que la ejecución falle.

</details>

4. ¿Cuál es la diferencia entre `test.skip` y `test.fixme`?

<details><summary>Respuesta</summary>

Los dos omiten el test. `fixme` dice que el test debería funcionar pero está roto o sin terminar.

</details>

5. El `beforeEach` de un grupo falla porque `page.goto` no puede llegar al sitio. ¿Qué pasa con los tests de ese grupo?

<details><summary>Respuesta</summary>

Cada test del grupo falla, y el cuerpo del test no se ejecuta. Un *hook* que falla cuenta como un fallo del test. Esto es útil: ves un solo error claro, y no muchos confusos. También muestra que un *hook* debe contener solo pasos de preparación que de verdad deben funcionar.

</details>

6. Este *hook* tiene un *bug*. ¿Cuál es y por qué puede ser difícil de ver?

```ts
test.beforeEach(async ({ page }) => {
  page.goto("/#/practice")
})
```

<details><summary>Respuesta</summary>

No hay `await` antes de `page.goto`. El *hook* termina antes de que la página esté abierta. La navegación corre por su cuenta, y los pasos siguientes pueden empezar demasiado pronto. El test muchas veces igual funciona, porque los pasos siguientes esperan a sus elementos, pero eso es suerte. Si la dirección está mal, el test puede fallar con un error de navegación, pero también puede fallar más tarde con un mensaje sobre un elemento que falta, y no sobre la causa real.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué significan "setup" y "teardown" en las pruebas automatizadas?**
   - Busca: `test setup teardown pattern`
   - Una buena respuesta explica: qué hace cada uno y por qué un test debe dejar las cosas como las encontró, y cómo se compara esto con `beforeEach` y `afterEach`.

2. **¿Por qué los tests que dependen del orden son un problema para un equipo de QA?**
   - Busca: `order dependent tests flaky test independence`
   - Una buena respuesta explica: qué es un test que depende del orden, cómo se rompe cuando los tests corren en paralelo o en otro orden, y cómo corregirlo.

3. **¿Qué hace `test.describe.configure({ mode: "serial" })` en Playwright y por qué la documentación lo desaconseja?**
   - Busca: `playwright serial mode describe configure`
   - Una buena respuesta explica: cómo el modo serial cambia la forma en que se ejecutan los tests, qué pasa cuando un test falla, y por qué los tests independientes son mejores.

## Siguiente paso

En la siguiente lección lees `playwright.config.ts` línea por línea.
