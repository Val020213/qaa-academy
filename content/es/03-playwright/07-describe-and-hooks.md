---
title: Describe, hooks y aislamiento
summary: Agrupa tests con describe, comparte la preparación con beforeEach, usa only, skip y fixme con cuidado, y pon buenos nombres a los tests.
duration: 30 min
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

El reporte muestra el nombre del grupo antes del nombre del test, como en `login › rejects wrong credentials`. Usa un grupo por funcionalidad. Lo puedes ver en `e2e/playground.spec.ts`: tiene los grupos `login`, `test case list` y `slow loading`.

## beforeEach: pasos que todo test necesita

Casi todos los tests de la Practice app empiezan con `page.goto("/#/practice")`. Para no escribirlo una y otra vez, usa un ***hook*** (gancho). Un hook es código que Playwright ejecuta en un momento fijo.

`test.beforeEach` se ejecuta antes de cada test:

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

Esto imprime el nombre del test y su resultado, por ejemplo `starts empty: passed`. Rara vez necesitas `afterEach`, porque una página nueva se descarta por ti.

> **Consejo:** Pon en un hook solo pasos de preparación. No pongas aserciones ni las acciones principales de un test. Quien lee un test debe ver qué hace.

## Aislamiento: cada test empieza limpio

Cada test recibe una `page` nueva en un nuevo **browser context** (contexto de navegador). Un browser context es como un perfil de navegador nuevo: sin cookies, sin datos guardados, sin pestañas abiertas por otros tests.

Esto se llama **aislamiento**. Tiene dos resultados.

- Un test no se puede romper por lo que hizo otro test.
- Los tests pueden ejecutarse en paralelo, al mismo tiempo, y en cualquier orden.

Lo puedes ver en la Practice app. Un test agrega un caso. El siguiente test abre la página y la lista vuelve a estar vacía.

De aquí sale la regla del equipo: cada test crea sus propios datos y no depende del orden de los tests. Nunca escribas un test que necesite "el caso del test anterior".

## test.only, test.skip y test.fixme

Tres herramientas cambian qué tests se ejecutan.

`test.only` ejecuta solo este test en la corrida. Los demás no se ejecutan. Sirve para concentrarte en un test mientras trabajas.

```ts
test.only("starts empty", async ({ page }) => {
  // ...
})
```

`test.skip` no ejecuta un test. El reporte lo muestra como omitido (*skipped*). Úsalo para un test que no aplica por ahora.

`test.fixme` también omite un test, pero dice: "esto debería funcionar, y está roto o sin terminar". Los archivos de ejercicios de este curso usan `test.fixme`.

```ts
test.fixme("known bug: counter after delete", async ({ page }) => {
  // ...
})
```

> **Cuidado:** Nunca hagas *commit* de `test.only`. Todos los demás tests quedarían fuera sin avisar, y el build se vería verde. Este proyecto usa `forbidOnly` en `playwright.config.ts`. En CI, un `only` olvidado hace fallar toda la ejecución con el mensaje `item focused with '.only' is not allowed due to the 'forbidOnly' option` y el nombre del test.

En los tests omitidos, escribe una razón en el nombre del test o en un comentario, para que alguien pueda corregirlo después.

## Nombra los tests como comportamientos

El reporte es una lista de lo que hace la app. Escribe los nombres para que la lista se lea como documentación.

- Bien: `rejects wrong credentials`, `adds a case and updates the counter`.
- Mal: `test 1`, `login test`, `check button`.

Un buen nombre dice la situación y el resultado. Usa el nombre del grupo para la funcionalidad. Así no lo repites en el nombre del test.

Un test comprueba un comportamiento. Si el nombre necesita muchas veces la palabra "and", divide el test.

## Práctica

1. Abre `e2e/exercises/03-playwright/07-describe-and-hooks.spec.ts`. Los grupos y los hooks ya están ahí.
2. Cambia `test.fixme` por `test` en un test a la vez. Escribe los pasos a partir de los comentarios.
3. Ejecuta tu archivo:

```bash
pnpm e2e e2e/exercises/03-playwright/07-describe-and-hooks.spec.ts
```

4. Mira el último test del archivo. ¿Por qué pasa aunque otro test agregue un caso?
5. Agrega `.only` a un test y ejecuta el archivo. Luego quítalo. Cuenta cuántos tests se ejecutaron.

Compara con `e2e/exercises/03-playwright/solutions/07-describe-and-hooks.spec.ts` cuando termines.

## Comprueba lo que sabes

1. ¿Qué hace `beforeEach`?

<details><summary>Respuesta</summary>

Ejecuta su código antes de cada test de su alcance. Se usa para la preparación compartida, como abrir la página.

</details>

2. ¿Qué es el aislamiento?

<details><summary>Respuesta</summary>

Cada test recibe una página nueva en un browser context nuevo. Los tests no comparten datos, así que pueden ejecutarse en cualquier orden.

</details>

3. ¿Por qué nunca se debe hacer commit de `test.only`?

<details><summary>Respuesta</summary>

Hace que la ejecución omita todos los demás tests, y el resultado se ve verde. En CI, `forbidOnly` hace fallar la ejecución.

</details>

4. ¿Cuál es la diferencia entre `test.skip` y `test.fixme`?

<details><summary>Respuesta</summary>

Los dos omiten el test. `fixme` dice que el test debería funcionar, pero está roto o sin terminar.

</details>

## Siguiente paso

En la siguiente lección lees `playwright.config.ts` línea por línea.
