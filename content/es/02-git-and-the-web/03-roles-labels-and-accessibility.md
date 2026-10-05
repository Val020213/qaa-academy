---
title: Roles, etiquetas y accesibilidad
summary: Aprende que cada elemento tiene un rol y un nombre accesible, y cómo Playwright los usa para encontrar elementos.
duration: 25 min
---

## Objetivo

- Explicar qué es un rol y nombrar cinco roles comunes.
- Explicar qué es un nombre accesible.
- Conectar una etiqueta con un input.
- Explicar por qué los roles y los nombres importan para las pruebas.

## Dos maneras de encontrar un elemento

Una persona encuentra el botón "Sign in" mirando la página. Ve un botón con el texto "Sign in".

Un lector de pantalla es una herramienta que lee la página en voz alta para personas que no pueden ver. No puede mirar la página. Le hace dos preguntas al navegador sobre cada elemento: qué es y cómo se llama.

Las respuestas son el **rol** y el **nombre accesible**. Playwright hace las mismas dos preguntas.

## Roles

Un **rol** dice qué tipo de cosa es un elemento. El navegador asigna un rol automáticamente a la mayoría de los elementos HTML. Tú no lo escribes.

| HTML | Rol |
| --- | --- |
| `<button>` | button (botón) |
| `<a href="...">` | link (enlace) |
| `<input type="text">` o `<input type="email">` | textbox (cuadro de texto) |
| `<input type="checkbox">` | checkbox (casilla) |
| `<select>` | combobox (lista desplegable) |
| `<h1>` a `<h6>` | heading (encabezado) |
| `<ul>` | list (lista) |
| `<li>` | listitem (elemento de lista) |

Los roles son más útiles que los nombres de las etiquetas. Un tester dice "el botón Sign in", no "la etiqueta button".

> **Nota:** El campo de contraseña, `<input type="password">`, es un caso especial. El estándar HTML no le da ningún rol, y Chrome y Edge pueden mostrarlo de forma distinta. Un `div` o un `span` no tiene un rol útil. Un tester no puede encontrar ese tipo de elemento por rol.

## El nombre accesible

El **nombre accesible** es el texto que identifica un elemento. En un botón, suele ser su texto. En un enlace, es su texto.

```html
<button type="button" data-testid="report-load">Load report</button>
```

Este elemento es un botón con el nombre "Load report".

En un campo, el nombre suele venir de su etiqueta.

## Etiquetas para los inputs

Una **etiqueta** (*label*) es el texto que dice para qué sirve un input. Una buena etiqueta hace dos cosas: los usuarios la ven y el navegador la vincula con el input.

La Practice app envuelve cada input dentro de su etiqueta:

```html
<label>Email
  <input type="email" name="email" autocomplete="off" data-testid="login-email" />
</label>
```

Como el `input` está dentro del `label`, el navegador los vincula. El input tiene el rol textbox y el nombre "Email".

Otra forma es usar los atributos `for` e `id`. El valor de `for` debe coincidir con el `id` del input:

```html
<label for="email">Email</label>
<input id="email" type="email" />
```

Un placeholder no es una etiqueta. Un **placeholder** es un texto gris de ayuda dentro de un input vacío. Desaparece cuando escribes. No lo uses como único nombre de un campo.

## Por qué importa para las pruebas

Cuando un campo no tiene etiqueta, un usuario de lector de pantalla solo oye "edit text". No sabe qué escribir. Es un bug de accesibilidad. Además, un test no puede encontrar el campo por su etiqueta.

Una buena página HTML es más fácil de usar y más fácil de probar. Playwright tiene buscadores que usan roles y nombres. Los usarás en el módulo de Playwright:

```ts
page.getByRole("button", { name: "Sign in" })
page.getByLabel("Email")
```

La primera línea significa: busca el botón llamado "Sign in". La segunda significa: busca el input cuya etiqueta es "Email". Estas líneas son solo un adelanto. No las ejecutas ahora.

Un buscador como `getByRole` prueba lo que ve el usuario. Si un desarrollador quita la etiqueta, el test falla y señala un problema real.

Convención del equipo: el equipo también pone un `data-testid` en cada elemento interactivo. Lo verás en la próxima lección. Los roles y `data-testid` trabajan juntos.

## Roles que no son automáticos

A veces un desarrollador escribe un rol a mano con el atributo `role`. La Practice app lo hace en el mensaje de error:

```html
<p class="message message-error" role="alert" data-testid="login-error" hidden></p>
```

Un `p` normalmente no tiene un rol especial. `role="alert"` le dice a las herramientas de asistencia: "este mensaje es importante, léelo ahora". Es una buena forma de mostrar un error.

## Práctica

1. Asegúrate de que `pnpm dev` está en ejecución. Abre `http://localhost:5180/#/practice` en Chrome o Edge.
2. Pulsa `F12`. En la pestaña Elements, haz clic derecho en el botón **Sign in** de la página y elige **Inspect**.
3. Busca el panel **Accessibility**. Está en el lado derecho de la pestaña Elements y puede estar detrás de un menú `>>`. Ábrelo.
4. Lee el **Name** y el **Role** del botón. Deberías ver "Sign in" y "button".
5. Haz lo mismo con el campo Email. ¿Cuáles son su nombre y su rol?
6. Haz lo mismo con el campo Password. ¿Qué rol ves? Puede ser distinto al de Email, o estar vacío.
7. Inspecciona la casilla de un caso de prueba. Primero añade un caso en la sección 2. ¿Cuál es su nombre?
8. Escribe una lista corta: cinco elementos de la página, con su rol y su nombre.

## Comprueba lo que sabes

1. ¿Cuáles son las dos preguntas que un lector de pantalla hace sobre un elemento?

<details><summary>Respuesta</summary>

Qué es (el rol) y cómo se llama (el nombre accesible).

</details>

2. ¿Qué rol tiene `<input type="email">`?

<details><summary>Respuesta</summary>

Textbox.

</details>

3. ¿Cómo vincula el navegador una etiqueta con un input?

<details><summary>Respuesta</summary>

O el input está dentro del label, o el label tiene un valor de `for` que coincide con el `id` del input.

</details>

4. ¿Por qué un placeholder no es una buena etiqueta?

<details><summary>Respuesta</summary>

Desaparece cuando el usuario escribe, y puede que no sea un nombre fiable para las herramientas de asistencia.

</details>

## Siguiente paso

En la próxima lección aprenderás los selectores CSS y el atributo `data-testid`, la otra forma de encontrar un elemento.
