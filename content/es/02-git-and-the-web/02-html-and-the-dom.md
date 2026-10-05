---
title: HTML y el DOM
summary: Lee etiquetas, atributos y anidación de HTML, y entiende el árbol DOM que un test usa para encontrar elementos.
duration: 40 min
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

HTML está hecho de **elementos**. Un elemento suele tener una etiqueta de apertura, contenido y una etiqueta de cierre.

```html
<button type="submit" data-testid="login-submit">Sign in</button>
```

Léelo por partes:

- `<button>` es la **etiqueta** de apertura. Dice qué tipo de elemento es.
- `Sign in` es el **contenido**. Es el texto que ve el usuario.
- `</button>` es la etiqueta de cierre. Lleva una barra.
- `type="submit"` y `data-testid="login-submit"` son **atributos**. Un atributo es información extra sobre el elemento. Tiene un nombre y un valor entre comillas.

Algunos elementos no tienen contenido ni etiqueta de cierre. El campo de texto es uno de ellos:

```html
<input type="email" name="email" data-testid="login-email" />
```

## Anidación

Los elementos pueden estar dentro de otros elementos. Esto se llama **anidación**. El elemento exterior es el **padre**. Los elementos interiores son sus **hijos**.

Este es el formulario de login de la Practice app (app de práctica). Está copiado de `src/views/playground.ts`:

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

El navegador lee el HTML y construye un **árbol** en memoria. Un árbol es una estructura donde cada elemento tiene un padre y hijos, como un árbol genealógico. Este árbol es el **DOM**. DOM significa *Document Object Model* (modelo de objetos del documento).

Para el formulario de arriba, el árbol se ve así:

```text
form
├── label
│   └── input (email)
├── label
│   └── input (password)
└── button
```

El DOM no es lo mismo que el archivo HTML. El archivo HTML es el punto de partida. Después de que la página carga, el código puede añadir, quitar y cambiar elementos. El DOM cambia, y el archivo HTML no.

La Practice app lo muestra bien. Cuando añades un caso de prueba a la lista, la app crea un elemento `li` nuevo en el DOM. No encontrarás ese `li` en el archivo HTML. Existe solo en el DOM.

> **Nota:** El sitio del curso construye sus páginas con código. Si usas "View page source" (ver código fuente de la página) en el navegador, ves una página casi vacía. La página real está en el DOM. Usa el panel Elements de las DevTools para verla. Las próximas lecciones explican las DevTools.

## Elementos ocultos

La Practice app tiene un mensaje de error que al principio no se ve:

```html
<p class="message message-error" role="alert" data-testid="login-error" hidden></p>
```

El atributo `hidden` no tiene valor. Le dice al navegador que no muestre el elemento. El elemento sigue estando en el DOM. Cuando escribes una contraseña incorrecta, la app quita `hidden` y el mensaje aparece.

Un test debe conocer esta diferencia. Un elemento puede estar en el DOM y no ser visible.

## Por qué importa a los testers

Un usuario encuentra un botón con los ojos. Un test no puede ver. Un test encuentra un elemento buscando en el árbol DOM.

Playwright hace preguntas como estas:

- Encuentra el elemento con `data-testid="login-submit"`.
- Encuentra el botón con el texto "Sign in".
- Encuentra el input con la etiqueta "Email".

Si el HTML es claro, estas preguntas son fáciles. Si el HTML es confuso, el test es difícil de escribir. Cuando entiendes el DOM, puedes explicar por qué un test no encuentra un elemento.

## Profundiza

### Por qué funciona así: el DOM está vivo

El archivo HTML es texto. El DOM es un conjunto de objetos vivos en la memoria del navegador. El código de la página puede cambiar estos objetos en cualquier momento. Playwright no lee tu archivo HTML. Le pregunta al navegador por el DOM vivo. Así, un test ve cómo se ve la página ahora, no lo que decía el archivo al principio.

### Una idea equivocada común: "si el elemento existe, el usuario puede verlo"

El mensaje de error de la Practice app está en el DOM desde el primer momento, con el atributo `hidden`. Un test que solo comprueba "¿existe?" no prueba nada sobre lo que ve el usuario. Esta es la comprobación correcta, tal como se verá en el módulo de Playwright:

```ts
await expect(page.getByTestId("login-error")).toBeHidden()
await page.getByTestId("login-submit").click()
await expect(page.getByTestId("login-error")).toBeVisible()
```

El formulario está vacío cuando hacemos clic, así que la app muestra "Enter your email and password." (Escribe tu correo y tu contraseña). Visible y oculto son estados de un elemento que está en el DOM. Prueba el estado que el usuario puede ver.

### Cómo aparece en el trabajo real de QA: elementos que se reemplazan

Abre la Practice app, añade un caso y ejecuta esto en la Console (consola):

```text
> const first = document.querySelector('[data-testid="cases-item"]')
> document.querySelector('[data-testid="cases-toggle-1"]').click()
> first.isConnected
false
```

`isConnected` te dice si un elemento sigue en la página. Es `false`. Cuando marcas la casilla, la app redibuja toda la lista. Quita los elementos `li` viejos y crea otros nuevos que se ven igual. Tu variable `first` sigue apuntando al elemento viejo, que ya no está en la página.

Esto es un problema real en el código de los tests. Un test no debe guardar una referencia a un elemento y usarla después. Playwright lo resuelve: un *locator* (localizador) no es un elemento. Es una descripción, como "el elemento con este `data-testid`". Playwright busca en el DOM otra vez cada vez que lo usas. Aprenderás los locators en el módulo 3.

Recuerda: la página puede reemplazar elementos mientras un usuario los mira, y se ven iguales. Tu test debe describir qué encontrar, y no guardar un elemento.

## Práctica

1. Inicia el sitio del curso en una terminal dentro de VS Code:

```bash
pnpm dev
```

2. Abre `http://localhost:5180/#/practice` en Chrome o Edge.
3. Pulsa `F12` para abrir las DevTools. Haz clic en la pestaña **Elements**.
4. Busca la línea `<form class="form" data-testid="login-form" ...>`. Haz clic en la flecha pequeña para abrirla y cerrarla.
5. Haz clic derecho en el campo Email de la página y elige **Inspect** (Inspeccionar). Las DevTools seleccionan su línea en la pestaña Elements. ¿Cuáles son su `type` y su `data-testid`?
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

4. ¿Puede un elemento estar en el DOM pero no ser visible?

<details><summary>Respuesta</summary>

Sí. Por ejemplo, un elemento con el atributo `hidden` está en el DOM, pero el usuario no lo ve.

</details>

5. Un test abre la Practice app y comprueba que el elemento `login-error` existe en el DOM. La comprobación pasa. ¿Prueba que el usuario ve un mensaje de error? ¿Por qué?

<details>
<summary>Respuesta</summary>

No. El elemento está en el DOM desde el inicio, con el atributo `hidden`. Existe, pero el usuario no puede verlo. La comprobación pasa incluso cuando no se mostró ningún error. Un buen test comprueba que el elemento es visible, y comprueba su texto.

</details>

6. Mira este HTML. ¿Cuántos hijos tiene el `ul` exterior? ¿Dónde está `C`?

```html
<ul>
  <li>A</li>
  <li>B
    <ul>
      <li>C</li>
    </ul>
  </li>
</ul>
```

<details>
<summary>Respuesta</summary>

El `ul` exterior tiene dos hijos: el `li` con A y el `li` con B. El `li` con C es hijo del `ul` interior, así que es bisnieto del `ul` exterior (el camino es `ul`, `li`, `ul`, `li`). Los hijos son solo los elementos directamente dentro de un padre, no los que están más adentro.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Cuál es la diferencia entre un nodo DOM y un elemento DOM?**
   - Busca: `DOM node vs element MDN`
   - Una buena respuesta explica: que el texto y los comentarios también son nodos, y que un elemento es un tipo de nodo.
2. **¿Cuál es la diferencia entre el atributo `hidden` y la regla CSS `display: none`?**
   - Busca: `hidden attribute vs display none`
   - Una buena respuesta explica: qué hace cada uno y por qué una regla CSS puede hacer visible otra vez un elemento `hidden`.
3. **¿Cómo decide Playwright que un elemento es "visible" antes de hacer clic en él?**
   - Busca: `playwright actionability visible`
   - Una buena respuesta explica: las comprobaciones que Playwright hace antes de una acción y por qué un elemento que está en el DOM aún puede fallarlas.

## Siguiente paso

En la próxima lección aprendes que cada elemento tiene un rol y un nombre, y cómo los tests los usan para encontrar elementos.
