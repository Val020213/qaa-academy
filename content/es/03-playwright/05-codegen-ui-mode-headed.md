---
title: Codegen, modo UI y modo headed
summary: Mira tests ejecutarse en un navegador real, depuralos en modo UI y graba pasos con codegen, y luego limpia el código.
duration: 45 min
---

## Objetivo

- Ejecutar tests con un navegador visible usando `pnpm e2e:headed`.
- Usar el modo UI para mirar, repetir y elegir *locators*.
- Grabar un primer borrador con *codegen* y limpiarlo para que siga las reglas del equipo.
- Saber qué hace la extensión de Playwright para VS Code.

## Modo headed: mira el navegador

Por defecto, los tests se ejecutan en un navegador **headless** (sin cabeza). Headless significa que la ventana del navegador no se muestra. Es rápido, pero no ves nada.

El modo **headed** muestra la ventana real del navegador. Ejecuta:

```bash
pnpm e2e:headed
```

Ves cómo el navegador se abre, escribe y hace clic. Es útil cuando quieres entender qué hace un test. También es lento de mirar, así que úsalo con un solo archivo:

```bash
pnpm e2e:headed e2e/playground.spec.ts
```

> **Consejo:** Las palabras extra después del nombre de un script van a Playwright. Así la ruta del archivo funciona aquí igual que con `pnpm e2e`.

## Modo UI: la mejor herramienta para aprender

El modo UI es una ventana hecha por Playwright. La abres con:

```bash
pnpm e2e:ui
```

A la izquierda ves todos los tests. Presiona el triángulo junto a un test para ejecutarlo. A la derecha ves la página mientras corre el test.

Estas partes te ayudan más.

- **Watch mode (modo vigilancia).** Haz clic en el ícono del ojo junto a un test o un archivo. El test se ejecuta de nuevo cada vez que guardas el archivo.
- **Time travel (viaje en el tiempo).** La lista de acciones está debajo del test. Haz clic en cualquier acción. La página de la derecha vuelve a como se veía en ese paso. Ves el estado antes y después.
- **Pick locator (elegir locator).** Presiona el botón "Pick locator" y luego haz clic en un elemento de la página. Playwright muestra un *locator* para él. Puedes copiarlo. Comprueba que siga la regla del equipo, como explica la siguiente sección.
- **Filtros.** Escribe un nombre en el cuadro de búsqueda para mostrar solo algunos tests. También puedes ocultar los tests aprobados.

> **Cuidado:** El modo UI ejecuta los tests con la configuración del proyecto. Cierra la ventana con el botón de cerrar, o presiona Ctrl+C en la terminal cuando termines.

## Codegen: graba un primer borrador

**Codegen** (generador de código) escribe código de test mientras usas una página a mano. Haces clic y escribes, y Playwright escribe las líneas.

Codegen necesita que el sitio esté corriendo. Abre dos terminales. En la primera:

```bash
pnpm dev
```

En la segunda:

```bash
pnpm exec playwright codegen http://localhost:5180/#/practice
```

Se abren dos ventanas. Una es el navegador. La otra es el Playwright Inspector, que muestra el código. Haz un *login* con una contraseña incorrecta. Copia el código del Inspector.

## Limpia el código generado

Codegen es un borrador, no un resultado. No conoce las reglas de tu equipo. El código generado puede verse así:

```ts
import { test, expect } from "@playwright/test"

test("test", async ({ page }) => {
  await page.goto("http://localhost:5180/#/practice")
  await page.getByTestId("login-email").click()
  await page.getByTestId("login-email").fill("qa@example.com")
  await page.getByRole("button", { name: "Sign in" }).click()
})
```

Las líneas exactas dependen de lo que hagas clic y de la versión de Playwright. Cambia siempre estas cosas.

1. Importa `test` y `expect` del archivo del proyecto `e2e/lib/test`, no de `@playwright/test`.
2. Dale al test un nombre que describa un comportamiento. `"test"` no dice nada.
3. Usa una ruta como `"/#/practice"`, no la dirección completa. La configuración tiene el inicio.
4. Usa `getByTestId` donde el elemento tenga un *testid*. Codegen muchas veces encuentra el *testid*, pero no siempre. Aquí escribió `getByRole` para el botón.
5. Borra los pasos de más, como un `click` antes de un `fill`. `fill` ya enfoca el campo.
6. Añade aserciones. Codegen graba lo que hiciste. No sabe qué quieres comprobar.
7. Asegúrate de que el test cree sus propios datos y no dependa de otros tests.

Después de esto, el test sigue las mismas convenciones que cualquier otro test del proyecto.

## La extensión de VS Code

La extensión de Playwright para VS Code te permite ejecutar tests sin la terminal. Junto a cada `test(...)` ves un triángulo verde. Haz clic en él para ejecutar ese test. También puedes marcar "Show browser" (Mostrar navegador) para mirar la ejecución.

La extensión también tiene "Pick locator" y "Record new test" (Grabar test nuevo), las mismas herramientas que usaste arriba. Los tests que fallan muestran el error en el editor, en la línea que falla. Para instalarla, abre el panel de extensiones de VS Code y busca "Playwright Test for VSCode".

Usa la extensión o la terminal, la que prefieras. Los tests y la configuración son los mismos.

## Profundiza

### Por qué el modo UI puede viajar en el tiempo

El modo UI no reproduce un video. Mientras corre un test, Playwright guarda un **snapshot** (instantánea) de la página por cada acción: una copia del contenido de la página en ese momento. Cuando haces clic en una acción, el modo UI te muestra esa copia.

Por eso puedes inspeccionar elementos del pasado, y por eso el *trace viewer* usa después los mismos datos. Las ejecuciones headed y headless usan el mismo motor de navegador. La única diferencia es la ventana. Así que un resultado casi siempre es el mismo en ambos.

### Una idea equivocada común: "codegen escribe mis tests"

Codegen graba lo que hiciste. No sabe por qué lo hiciste. No puede saber qué debe mostrar la app, así que no añade comprobaciones por sí mismo. Sus herramientas de aserción pueden grabar una comprobación, pero tú debes elegirla. También repite pasos. Si grabas tres tests, cada uno tiene los mismos pasos de *login*.

Un test grabado suele necesitar una pasada de limpieza. Mira los pasos repetidos. Muévelos a una sola función:

```ts
import { expect, test, type Page } from "./lib/test"

async function signIn(page: Page): Promise<void> {
  await page.goto("/#/practice")
  await page.getByTestId("login-email").fill("qa@example.com")
  await page.getByTestId("login-password").fill("Playwright123")
  await page.getByTestId("login-submit").click()
}

test("shows the signed-in message", async ({ page }) => {
  await signIn(page)

  await expect(page.getByTestId("login-welcome")).toContainText("qa@example.com")
})

test("signing out shows the form again", async ({ page }) => {
  await signIn(page)
  await page.getByTestId("login-logout").click()

  await expect(page.getByTestId("login-form")).toBeVisible()
})
```

Esto es DRY, "Don't Repeat Yourself" (no te repitas): los pasos de *login* viven en un solo lugar. Si el formulario de *login* cambia, corriges una función. El límite: el nombre `signIn` debe decir exactamente lo que hace, para que el lector siga entendiendo cada test.

### Una decisión con costo: elige la herramienta correcta para el momento

Cada herramienta tiene un precio.

- **El modo headed** sirve para entender un test. Es lento y debes mirarlo. No lo uses para toda la *suite*.
- **El modo UI** sirve mientras escribes y depuras. Usa tu pantalla y tu atención. No es para CI.
- **Codegen** sirve para encontrar un *locator* o empezar un borrador. Es malo como forma de producir el test final.
- **El modo headless** es el de por defecto. Es rápido y sirve para CI, donde nadie mira una ventana.

No uses una herramienta solo porque es agradable de ver. Si un test pasa en headless, no necesitas mirarlo. Usa las herramientas visibles cuando necesites entender algo.

## Práctica

1. Ejecuta `pnpm e2e:headed e2e/playground.spec.ts`. Mira el navegador.
2. Ejecuta `pnpm e2e:ui`. Ejecuta el test "adds a case and updates the counter". Haz clic en cada acción y mira la página.
3. En el modo UI, usa "Pick locator" y haz clic en el botón "Add" de la lista de casos. Compara el *locator* con `getByTestId("cases-add")`.
4. Inicia `pnpm dev` en una terminal. En otra terminal, ejecuta `pnpm exec playwright codegen http://localhost:5180/#/practice`.
5. Graba esto: agrega un caso y luego márcalo.
6. Copia el código en un archivo nuevo `e2e/exercises/03-playwright/my-codegen.spec.ts`. Límpialo con la lista de arriba. Añade una aserción para el texto del contador. Ejecútalo con `pnpm e2e e2e/exercises/03-playwright/my-codegen.spec.ts`.
7. Borra el archivo cuando termines. Si lo dejas, `pnpm e2e` lo ejecutará.

## Comprueba lo que sabes

1. ¿Qué muestra el modo headed?

<details><summary>Respuesta</summary>

La ventana real del navegador, para que puedas ver cómo el test hace clic y escribe.

</details>

2. Nombra dos cosas que te da el modo UI.

<details><summary>Respuesta</summary>

Cualquiera de estas dos: el modo vigilancia, el viaje en el tiempo por las acciones, elegir *locator* y los filtros.

</details>

3. ¿Por qué limpias el código generado?

<details><summary>Respuesta</summary>

Codegen no conoce las reglas del equipo. Debes corregir el import, el nombre, los *locators* y la dirección, y añadir aserciones.

</details>

4. ¿Qué debe estar corriendo antes de usar codegen en la Practice app?

<details><summary>Respuesta</summary>

El sitio, con `pnpm dev`, en otra terminal.

</details>

5. Un test pasa en tu máquina en modo headed pero falla en CI, que corre en headless. Da dos razones posibles que no dependan de la opción headed o headless.

<details><summary>Respuesta</summary>

Muchas respuestas son correctas. Dos ejemplos: CI empieza con datos limpios, mientras que tu máquina ya tenía datos que el test necesitaba, así que el test no es independiente. O CI ejecuta los tests en paralelo en una máquina más lenta, así que aparece un problema de tiempos que nunca habías visto. No culpes primero al modo. Abre el *trace* del fallo en CI y busca la causa.

</details>

6. Grabas "agregar un caso y luego marcarlo". Codegen escribe `await page.getByRole("checkbox").check()`. El test pasa. Más tarde, alguien agrega un segundo caso en el mismo test, y la línea falla. ¿Por qué?

<details><summary>Respuesta</summary>

Cada fila de caso tiene una casilla. Con un caso, `getByRole("checkbox")` coincide con un elemento. Con dos casos, coincide con dos, y el modo estricto se niega a elegir. El *locator* era demasiado amplio desde el principio. Un *locator* con el *testid* de la fila, como `cases-toggle-1`, dice exactamente qué casilla quieres.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es un navegador headless y por qué lo usan los servidores de CI?**
   - Busca: `headless browser what is testing`
   - Una buena respuesta explica: qué significa "headless", por qué lo necesita un servidor sin pantalla, y una cosa que puede ser distinta de una ventana de navegador normal.

2. **¿Qué es el Playwright Inspector y cómo te ayuda `page.pause()` a depurar un test?**
   - Busca: `playwright inspector page.pause debug`
   - Una buena respuesta explica: cómo detener un test en una línea, qué puedes hacer mientras está detenido, y en qué se diferencia del modo UI.

3. **¿Cuáles son los puntos débiles de las herramientas de grabar y reproducir pruebas?**
   - Busca: `record and playback test automation drawbacks`
   - Una buena respuesta explica: al menos tres problemas, como las comprobaciones que debes añadir a mano, los *locators* frágiles y los pasos repetidos, y cuándo una herramienta así sigue siendo útil.

## Siguiente paso

En la siguiente lección aprendes el *trace viewer*, la herramienta que usas cuando un test falla y no sabes por qué.
