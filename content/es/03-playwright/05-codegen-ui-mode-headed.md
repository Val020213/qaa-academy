---
title: Codegen, modo UI y modo headed
summary: Mira tests ejecutarse en un navegador real, depúralos en modo UI y graba pasos con codegen, y luego limpia el código.
duration: 30 min
---

## Objetivo

- Ejecutar tests con un navegador visible usando `pnpm e2e:headed`.
- Usar el modo UI para mirar, repetir y elegir locators.
- Grabar un primer borrador con codegen y limpiarlo para que siga las reglas del equipo.
- Saber qué hace la extensión Playwright de VS Code.

## Modo headed: mira el navegador

Por defecto, los tests se ejecutan en un navegador **headless**. Headless significa que la ventana del navegador no se muestra. Es rápido, pero no ves nada.

El modo **headed** muestra la ventana real del navegador. Ejecuta:

```bash
pnpm e2e:headed
```

Ves cómo el navegador se abre, escribe y hace clic. Es útil cuando quieres entender qué hace un test. También es lento de mirar, así que úsalo con un solo archivo:

```bash
pnpm e2e:headed e2e/playground.spec.ts
```

> **Consejo:** Las palabras extra después del nombre de un script se pasan a Playwright. Así, la ruta del archivo funciona aquí igual que con `pnpm e2e`.

## Modo UI: la mejor herramienta para aprender

El modo UI es una ventana creada por Playwright. La abres con:

```bash
pnpm e2e:ui
```

A la izquierda ves todos los tests. Presiona el triángulo junto a un test para ejecutarlo. A la derecha ves la página mientras corre el test.

Estas partes te ayudan más.

- **Watch mode** (modo vigilancia). Haz clic en el ícono del ojo junto a un test o a un archivo. El test se ejecuta de nuevo cada vez que guardas el archivo.
- **Time travel** (viaje en el tiempo). La lista de acciones está debajo del test. Haz clic en cualquier acción. La página de la derecha vuelve a como se veía en ese paso. Ves el estado antes y después.
- **Pick locator** (elegir locator). Presiona el botón "Pick locator" y luego haz clic en un elemento de la página. Playwright te muestra un locator para él. Puedes copiarlo. Comprueba que siga la regla del equipo, como explica la siguiente sección.
- **Filters** (filtros). Escribe un nombre en el cuadro de búsqueda para mostrar solo algunos tests. También puedes ocultar los tests que pasaron.

> **Cuidado:** El modo UI ejecuta los tests con la configuración del proyecto. Cierra la ventana con el botón de cerrar, o presiona Ctrl+C en la terminal cuando termines.

## Codegen: graba un primer borrador

**Codegen** escribe código de test mientras usas una página a mano. Haces clic y escribes, y Playwright escribe las líneas.

Codegen necesita que el sitio esté en ejecución. Abre dos terminales. En la primera:

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
4. Usa `getByTestId` donde el elemento tenga un testid. Codegen a menudo encuentra el testid, pero no siempre. Aquí escribió `getByRole` para el botón.
5. Borra los pasos de más, como un `click` antes de un `fill`. `fill` ya enfoca el campo.
6. Agrega aserciones. Codegen graba lo que hiciste. No sabe qué quieres comprobar.
7. Asegúrate de que el test cree sus propios datos y no dependa de otros tests.

Después de esto, el test sigue las mismas convenciones que todos los demás tests del proyecto.

## La extensión de VS Code

La extensión de Playwright para VS Code te permite ejecutar tests sin la terminal. Junto a cada `test(...)` ves un triángulo verde. Haz clic para ejecutar ese test. También puedes marcar "Show browser" (mostrar navegador) para mirar la ejecución.

La extensión también tiene "Pick locator" y "Record new test" (grabar un test nuevo), las mismas herramientas que usaste arriba. Los tests que fallan muestran el error en el editor, en la línea que falla. Para instalarla, abre el panel Extensions (extensiones) de VS Code y busca "Playwright Test for VSCode".

Usa la extensión o la terminal, lo que prefieras. Los tests y la configuración son los mismos.

## Práctica

1. Ejecuta `pnpm e2e:headed e2e/playground.spec.ts`. Mira el navegador.
2. Ejecuta `pnpm e2e:ui`. Ejecuta el test "adds a case and updates the counter". Haz clic en cada acción y mira la página.
3. En el modo UI, usa "Pick locator" y haz clic en el botón "Add" de la lista de casos. Compara el locator con `getByTestId("cases-add")`.
4. Inicia `pnpm dev` en una terminal. En otra terminal, ejecuta `pnpm exec playwright codegen http://localhost:5180/#/practice`.
5. Graba esto: agrega un caso y luego márcalo.
6. Copia el código en un archivo nuevo `e2e/exercises/03-playwright/my-codegen.spec.ts`. Límpialo con la lista de arriba. Agrega una aserción para el texto del contador. Ejecútalo con `pnpm e2e e2e/exercises/03-playwright/my-codegen.spec.ts`.
7. Borra el archivo cuando termines. Si lo conservas, `pnpm e2e` lo ejecutará.

## Comprueba lo que sabes

1. ¿Qué muestra el modo headed?

<details><summary>Respuesta</summary>

La ventana real del navegador, para que veas cómo el test hace clic y escribe.

</details>

2. Nombra dos cosas que te da el modo UI.

<details><summary>Respuesta</summary>

Dos cualesquiera de estas: watch mode, time travel por las acciones, pick locator y filtros.

</details>

3. ¿Por qué limpias el código generado?

<details><summary>Respuesta</summary>

Codegen no conoce las reglas del equipo. Debes corregir el import, el nombre, los locators y la dirección, y agregar aserciones.

</details>

4. ¿Qué debe estar en ejecución antes de usar codegen en la Practice app?

<details><summary>Respuesta</summary>

El sitio, con `pnpm dev`, en otra terminal.

</details>

## Siguiente paso

En la siguiente lección aprendes el *trace viewer*, la herramienta que usas cuando un test falla y no sabes por qué.
