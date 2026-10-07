---
title: Describe, hooks y aislamiento
duration: 60 min
---

## Objetivo

Organiza tests relacionados y comparte su preparación sin hacer que dependan unos de otros.

- Agrupar tests con `test.describe` y nombrarlos por el comportamiento que comprueban.
- Seguir el orden de `beforeEach`, el test y `afterEach`.
- Distinguir el aislamiento del navegador de las variables compartidas entre tests.
- Usar `test.only`, `test.skip` y `test.fixme`.

## test.describe: agrupa tests

`test.describe` reúne tests relacionados bajo un nombre.

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

El reporte muestra el grupo antes del test, como en `login › rejects wrong credentials`. En `e2e/playground.spec.ts` los grupos son `login`, `test case list` y `slow loading`.

## Hooks: preparación y cierre

Un **hook** es una función que el runner de Playwright ejecuta en un momento del test. `beforeEach` ejecuta la preparación antes de cada test. Si todos necesitan abrir la página Practice, coloca esa navegación en el hook:

```ts
test.beforeEach(async ({ page }) => {
  await page.goto("/#/practice")
})
```

Dentro de un grupo, el hook se aplica a los tests de ese grupo. Fuera de los grupos, se aplica a todos los tests del archivo.

### Orden de beforeEach

Con `--workers=1`, este archivo muestra cómo se combinan los hooks del archivo y del grupo:

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

Antes de cada test, el runner ejecuta el hook externo. Para el test del grupo, ejecuta después el hook interno y luego el cuerpo del test.

### afterEach y el resultado del test

`test.afterEach` se ejecuta después de cada test, incluso cuando el test falla. La función recibe los datos que proporciona Playwright como primer argumento (aquí `{}`, porque no necesita ninguno), y `testInfo` como segundo argumento.

```ts
test.afterEach(async ({}, testInfo) => {
  console.log(`${testInfo.title}: ${testInfo.status}`)
})
```

Esto imprime el nombre y el resultado del test, por ejemplo `starts empty: passed`.

## Aislamiento: cada test empieza limpio

Cada test recibe una `page` nueva en un **browser context** (contexto de navegador) nuevo. Un contexto de navegador es como un perfil de navegador recién creado: sin cookies, sin datos guardados, sin pestañas abiertas por otros tests.

Esto se llama **aislamiento**. Tiene dos resultados.

- Un test no puede romperse por lo que hizo otro test.
- Los tests pueden ejecutarse en paralelo, al mismo tiempo, y en cualquier orden.

En la app Practice, la lista de casos vive en el estado de la página. Cuando otro test abre su página, la lista está vacía. Cada test debe crear los datos que necesita sin depender de otro test.

### Variables compartidas y workers

El aislamiento del navegador no reinicia las variables del archivo. Un *worker* es un proceso que ejecuta tests; cada proceso tiene su propia copia de esas variables.

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

Con `fullyParallel: true` y `--workers=1`, los dos tests corren uno después del otro en el mismo proceso. La salida es `first sees 1` y `second sees 2`. Con `--workers=2`, normalmente cada test corre en un worker distinto, así que los dos imprimen `1`.

Esta dependencia también aparece si un test escribe un valor que otro necesita:

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

Si ejecutas solo el segundo test con `-g "uses the added case"`, la variable sigue en `false` y la aserción falla. También puede fallar en paralelo si el segundo test corre en un worker donde el primero nunca corrió.

## test.only, test.skip y test.fixme

`test.only` selecciona un test para trabajar en él sin ejecutar los demás.

```ts
test.only("starts empty", async ({ page }) => {
  // ...
})
```

`test.skip` omite un test que no aplica ahora. `test.fixme` también lo omite, pero indica que está roto o sin terminar. Los ejercicios del curso usan `test.fixme`.

```ts
test.fixme("known bug: counter after delete", async ({ page }) => {
  // ...
})
```

El reporte muestra los tests omitidos. Escribe la razón en el nombre o en un comentario.

> **Cuidado:** Nunca hagas commit de `test.only`: dejaría fuera los demás tests. Este proyecto usa `forbidOnly` en `playwright.config.ts`. En CI, un `only` olvidado hace fallar la ejecución con el mensaje `item focused with '.only' is not allowed due to the 'forbidOnly' option` y el nombre del test.

## Nombra los tests como comportamientos

Un nombre debe decir la situación y el resultado que comprueba el test.

- Bueno: `rejects wrong credentials`, `adds a case and updates the counter`.
- No bueno: `test 1`, `login test`, `check button`.

Usa el nombre del grupo para la funcionalidad y el del test para un comportamiento. Si un test comprueba varios comportamientos distintos, divídelo.

## Profundiza

### Preparación común y pasos del test

Pon en `beforeEach` los pasos que todos los tests del grupo necesitan. Deja las acciones principales y las aserciones en el test, para que quien lo lea vea qué comprueba.

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

Abrir la página es preparación común. Agregar y borrar un caso son pasos de este test. La función permite reutilizar la acción de agregar un caso cuando solo algunos tests la necesitan.

### El contexto no limpia los datos del servidor

Si la app Practice guardara sus casos en un servidor compartido, un contexto nuevo ya no daría una lista limpia. Dos tests podrían ver los casos del otro y obtener conteos incorrectos. El aislamiento del navegador no separa esos datos.

## Práctica

1. Abre `e2e/exercises/03-playwright/07-describe-and-hooks.spec.ts`. Los grupos y los hooks ya están ahí.
2. Cambia `test.fixme` por `test` en un test a la vez. Escribe los pasos que dicen los comentarios.
3. Ejecuta tu archivo:

```bash
pnpm e2e e2e/exercises/03-playwright/07-describe-and-hooks.spec.ts
```

4. Agrega `.only` a un test y ejecuta el archivo. Cuenta cuántos tests se ejecutaron y luego quítalo.

Compara con `e2e/exercises/03-playwright/solutions/07-describe-and-hooks.spec.ts` cuando termines.

## Reto

Crea `e2e/challenges/07-case-list-rules.spec.ts` para comprobar estas reglas de la página Practice. Encuentra una regla más leyendo `src/practice/CasesPanel.tsx`:

- Un título con solo espacios no se agrega.
- Pulsar Enter en el campo del título agrega el caso, igual que el botón Add.
- Después de borrar el caso 1 y agregar un caso nuevo, el caso nuevo no recibe el id 1.
- El contador cuenta todos los casos, también cuando el filtro oculta algunos.

Importa `test` y `expect` desde `../lib/test`. Usa al menos dos grupos `test.describe` y un `beforeEach`.

Está terminado cuando:

- El archivo tiene al menos cinco tests con nombres que dicen el comportamiento que comprueban.
- Ningún test usa una variable escrita por otro test.
- `pnpm e2e e2e/challenges/07-case-list-rules.spec.ts --repeat-each=5 --workers=4` pasa todas las ejecuciones, y cada test también pasa si lo ejecutas solo.
- Si rompes un valor esperado a propósito, falla exactamente ese test. Luego lo arreglas.

Busca cómo repetir la ejecución de un archivo y elegir cuántos workers usar: `playwright repeat-each workers command line`. Para consultar cómo pulsar Enter: `playwright locator press Enter`.

## Piénsalo bien

1. Este hook tiene un bug. ¿Qué puede pasar con los pasos que vienen después?

```ts
test.beforeEach(async ({ page }) => {
  page.goto("/#/practice")
})
```

<details><summary>Respuesta</summary>

Falta el `await` antes de `page.goto`. El hook termina sin esperar a que se complete la navegación, así que los pasos siguientes pueden empezar demasiado pronto. Las esperas de los locators pueden ocultar el bug en algunas ejecuciones.

</details>

2. La versión A agrega un caso en el `beforeEach` del grupo `test case list`. La versión B llama a `addCase(page, "title")` solo en los tests que necesitan un caso. El grupo incluye un test llamado "starts empty". ¿Qué versión hace fallar ese test?

<details><summary>Respuesta</summary>

La versión A, porque el hook agrega un caso antes de comprobar que la lista está vacía. La versión B deja esa preparación en los tests que la necesitan.

</details>

3. El `beforeEach` de un grupo falla porque `page.goto` no puede llegar al sitio. ¿Se ejecuta el cuerpo del test?

<details><summary>Respuesta</summary>

No. La falla del hook cuenta como una falla del test. Cada test que encuentre esa falla durante su preparación fallará sin ejecutar su cuerpo.

</details>

## Siguiente paso

En la próxima lección lees `playwright.config.ts` línea por línea.
