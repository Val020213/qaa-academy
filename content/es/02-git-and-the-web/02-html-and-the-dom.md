---
title: HTML y el DOM
summary: Lee etiquetas, atributos y anidación de HTML, y entiende el árbol DOM que un test usa para encontrar elementos.
duration: 25 min
---

## Objetivo

- Explicar qué es HTML y leer un fragmento pequeño.
- Nombrar las partes de un elemento: etiqueta, atributos y contenido.
- Explicar qué es el DOM y en qué se diferencia del archivo HTML.
- Decir por qué un test necesita el DOM.

## ¿Qué es HTML?

**HTML** es el lenguaje que describe lo que hay en una página web. Dice "aquí hay un encabezado", "aquí hay un botón", "aquí hay un campo de texto".

HTML no es un lenguaje de programación. No toma decisiones. Solo describe la página.

## Etiquetas, atributos y contenido

HTML se compone de **elementos**. Un elemento suele tener una etiqueta de apertura, un contenido y una etiqueta de cierre.

```html
<button type="submit" data-testid="login-submit">Sign in</button>
```

Léelo por partes:

- `<button>` es la **etiqueta** (*tag*) de apertura. Dice qué tipo de elemento es.
- `Sign in` es el **contenido**. Es el texto que ve el usuario.
- `</button>` es la etiqueta de cierre. Lleva una barra.
- `type="submit"` y `data-testid="login-submit"` son **atributos**. Un atributo es información extra sobre el elemento. Tiene un nombre y un valor entre comillas.

Algunos elementos no tienen contenido ni etiqueta de cierre. El campo de texto es uno de ellos:

```html
<input type="email" name="email" data-testid="login-email" />
```

## Anidación

Los elementos pueden estar dentro de otros elementos. Esto se llama **anidación**. El elemento exterior es el **padre**. Los elementos interiores son sus **hijos**.

Este es el formulario de login de la Practice app. Está copiado de `src/views/playground.ts`:

```html
<form class="form" data-testid="login-form" novalidate>
  <label>Email
    <input type="email" name="email" autocomplete="off" data-testid="login-email" />
  </label>
  <label>Password
    <input type="password" name="password" data-testid="login-password" />
  </label>
  <button type="submit" class="button" data-testid="login-submit">Sign in</button>
</form>
```

El `form` es el padre. Tiene tres hijos: dos elementos `label` y un `button`. Cada `label` tiene un hijo: un `input`.

La sangría te ayuda a ver la anidación. El navegador no la necesita.

## Del HTML al DOM

El navegador lee el HTML y construye un **árbol** en memoria. Un árbol es una estructura donde cada elemento tiene un padre y hijos, como un árbol genealógico. Este árbol es el **DOM**. DOM significa Document Object Model (modelo de objetos del documento).

Para el formulario de arriba, el árbol se ve así:

```text
form
├── label
│   └── input (email)
├── label
│   └── input (password)
└── button
```

El DOM no es lo mismo que el archivo HTML. El archivo HTML es el punto de partida. Cuando la página termina de cargar, el código puede añadir, quitar y cambiar elementos. El DOM cambia, y el archivo HTML no.

La Practice app lo muestra bien. Cuando añades un caso de prueba a la lista, la app crea un elemento `li` nuevo en el DOM. No encontrarás ese `li` en el archivo HTML. Solo existe en el DOM.

> **Nota:** El sitio del curso construye sus páginas con código. Si usas "View page source" (ver código fuente) en el navegador, ves una página casi vacía. La página real está en el DOM. Usa el panel Elements de las DevTools para verla. Las próximas lecciones explican las DevTools.

## Elementos ocultos

La Practice app tiene un mensaje de error que al principio no se ve:

```html
<p class="message message-error" role="alert" data-testid="login-error" hidden></p>
```

El atributo `hidden` no tiene valor. Le dice al navegador que no muestre el elemento. El elemento sigue estando en el DOM. Cuando escribes una contraseña incorrecta, la app quita `hidden` y el mensaje aparece.

Un test debe conocer esta diferencia. Un elemento puede estar en el DOM y no estar visible.

## Por qué le importa a un tester

Un usuario encuentra un botón con los ojos. Un test no puede ver. Un test encuentra un elemento buscando en el árbol DOM.

Playwright hace preguntas como estas:

- Busca el elemento con `data-testid="login-submit"`.
- Busca el botón con el texto "Sign in".
- Busca el input con la etiqueta "Email".

Si el HTML es claro, estas preguntas son fáciles. Si el HTML es desordenado, el test es difícil de escribir. Cuando entiendes el DOM, puedes explicar por qué un test no encuentra un elemento.

## Práctica

1. Inicia el sitio del curso en una terminal dentro de VS Code:

```bash
pnpm dev
```

2. Abre `http://localhost:5180/#/practice` en Chrome o Edge.
3. Pulsa `F12` para abrir las DevTools. Haz clic en la pestaña **Elements**.
4. Busca la línea `<form class="form" data-testid="login-form" ...>`. Haz clic en la flecha pequeña para abrirla y cerrarla.
5. Haz clic derecho en el campo Email de la página y elige **Inspect**. Las DevTools seleccionan su línea en la pestaña Elements. ¿Cuáles son su `type` y su `data-testid`?
6. En la página, escribe un correo y una contraseña incorrectos y haz clic en **Sign in**. En la pestaña Elements, busca la línea con `data-testid="login-error"`. El atributo `hidden` ya no está.
7. Añade dos casos de prueba en la sección 2. Busca el `ul` con `data-testid="cases-list"`. Ábrelo y cuenta sus hijos `li`.

## Comprueba lo que sabes

1. ¿Qué es un atributo? Da un ejemplo.

<details><summary>Respuesta</summary>

Información extra sobre un elemento, escrita como nombre y valor. Ejemplo: `type="submit"`.

</details>

2. ¿Qué es el DOM?

<details><summary>Respuesta</summary>

El árbol de elementos que el navegador construye en memoria a partir del HTML. El código puede cambiarlo después de que la página carga.

</details>

3. Un test añade un caso a la lista. ¿El nuevo `li` está en el archivo HTML?

<details><summary>Respuesta</summary>

No. Solo está en el DOM. La app lo creó después de que la página cargó.

</details>

4. ¿Puede un elemento estar en el DOM pero no estar visible?

<details><summary>Respuesta</summary>

Sí. Por ejemplo, un elemento con el atributo `hidden` está en el DOM, pero el usuario no lo ve.

</details>

## Siguiente paso

En la próxima lección aprenderás que cada elemento tiene un rol y un nombre, y cómo los tests los usan para encontrar elementos.
