---
title: HTML y el DOM
summary: Lee etiquetas, atributos y anidamiento de HTML, y entiende el árbol DOM que construye el navegador y que el código puede cambiar.
duration: 75 min
---

## Empieza con un acertijo

Un refugio de perros tiene un sitio web. La página muestra una tarjeta con un nombre grande: "Rex". Haces clic derecho en la página y eliges "View page source" (ver código fuente de la página). Presionas `Ctrl + F` y buscas "Rex".

No se encuentra nada. La palabra "Rex" no está en el código fuente. Pero está en tu pantalla, y puedes hacer clic en "Adopt Rex" (adoptar a Rex).

¿Cómo puede la página mostrar una palabra que no está en su propio código fuente? ¿La página miente, o pasa otra cosa?

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Leer un trozo pequeño de HTML y decir qué elemento es el padre de cuál.
- Predecir qué muestra la página después de que el código agrega o quita un elemento.
- Explicar por qué el archivo HTML y el DOM pueden ser diferentes.
- Decidir cuándo ocultar un elemento y cuándo quitarlo.

## ¿Qué es HTML?

**HTML** es el lenguaje que describe lo que hay en una página web. Dice "aquí hay un título", "aquí hay un botón", "aquí hay un campo de texto".

HTML no es un lenguaje de programación. No toma decisiones. Solo describe la página, como un plano describe una casa.

## Etiquetas, atributos y contenido

HTML está hecho de **elementos**. Un elemento suele tener una etiqueta de apertura, contenido y una etiqueta de cierre. Este es un enlace para un perro:

```html
<a href="/dogs/rex" class="more">See Rex</a>
```

Léelo por partes:

- `<a>` es la **etiqueta** (*tag*) de apertura. Dice qué tipo de elemento es. La letra `a` significa "anchor" (ancla), que es un enlace.
- `See Rex` es el **contenido**. Es el texto que ve la persona usuaria.
- `</a>` es la etiqueta de cierre. Lleva una barra.
- `href="/dogs/rex"` y `class="more"` son **atributos**. Un atributo es información extra sobre el elemento. Tiene un nombre y un valor entre comillas.

Algunos elementos no tienen contenido ni etiqueta de cierre. Un campo para un número es uno de ellos:

```html
<input type="number" name="age" min="0" />
```

## Anidamiento

Los elementos pueden estar dentro de otros elementos. Esto se llama **anidamiento**. El elemento de afuera es el **padre**. Los elementos de adentro son sus **hijos**.

Aquí hay una receta. Mírala y responde dos preguntas antes de seguir. ¿Cuántos hijos tiene el `ol`? ¿Dónde está el `li` con "Salt" (sal)?

```html
<ol>
  <li>Boil the water</li>
  <li>
    Add the pasta and
    <ul>
      <li>Salt</li>
      <li>Oil</li>
    </ul>
  </li>
</ol>
```

El `ol` tiene dos hijos: los dos elementos `li` que están directamente dentro de él. El `li` con "Salt" no es hijo del `ol`. Su padre es el `ul` interno. El `ul` está dentro del segundo `li`, así que "Salt" es nieto de ese `li` y bisnieto del `ol`. Un hijo está solo un nivel más abajo.

La sangría te ayuda a ver el anidamiento. El navegador no la necesita.

Ahora un ejemplo real. Este es el formulario de login de la Practice app, sin las clases largas de estilo. El formulario vive en `src/practice/LoginPanel.tsx`:

```html
<form data-testid="login-form" novalidate>
  <div>
    <label data-slot="label" for="login-email">Email</label>
    <input data-slot="input" id="login-email" type="email" name="email"
           autocomplete="off" data-testid="login-email" />
  </div>
  <div>
    <label data-slot="label" for="login-password">Password</label>
    <input data-slot="input" id="login-password" type="password" name="password"
           data-testid="login-password" />
  </div>
  <button data-slot="button" type="submit" data-testid="login-submit">Sign in</button>
</form>
```

El `form` tiene tres hijos: dos elementos `div` y un `button`. Cada `div` tiene dos hijos: un `label` y un `input`.

## Del HTML al DOM

El navegador lee el HTML y construye un **árbol** en memoria. Un árbol es una estructura donde cada elemento tiene un padre e hijos, como un árbol genealógico. Este árbol es el **DOM**. DOM significa Document Object Model (modelo de objetos del documento).

Para el formulario de arriba, el árbol se ve así:

```text
form
├── div
│   ├── label
│   └── input (email)
├── div
│   ├── label
│   └── input (password)
└── button
```

El DOM no es lo mismo que el archivo HTML. El archivo HTML es el punto de partida. Después de que la página carga, el código puede agregar, quitar y cambiar elementos. El DOM cambia, y el archivo HTML no.

Aquí hay una página pequeña para el refugio. ¿Qué muestra la página? ¿Qué muestra "View page source"?

```html
<ul id="dogs">
  <li>Rex</li>
</ul>
<script>
  const li = document.createElement("li")
  li.textContent = "Luna"
  document.querySelector("#dogs").append(li)
</script>
```

La página muestra dos perros: Rex y Luna. El código fuente muestra solo a Rex dentro del `ul`, más el *script* (programa pequeño). El script creó el segundo `li` después de que la página cargó. Existe solo en el DOM.

### De vuelta al acertijo

La página del refugio hace lo mismo, a mayor escala. El servidor envía un archivo casi vacío y un script. El script pide los perros a un servidor, construye las tarjetas y las agrega al DOM. "Rex" está en el DOM y en tu pantalla. Nunca estuvo en el archivo. La página no miente. Tú miraste el archivo, y la pantalla muestra el DOM.

> **Nota:** El sitio del curso funciona así. Construye sus páginas con código. Si usas "View page source" en él, ves una página casi vacía con un `div` y un script. La página real está en el DOM. Usa el panel Elements (elementos) de las DevTools para verla. Las próximas lecciones explican las DevTools.

## ¿Ocultarlo o quitarlo?

A veces una página tiene un elemento que todavía no debe verse, como el mensaje "Adopted! Thank you." (¡Adoptado! Gracias). Hay dos formas de hacerlo.

La primera forma es mantener el elemento en el DOM y ocultarlo:

```html
<p hidden>Adopted! Thank you.</p>
```

El atributo `hidden` no tiene valor. Le dice al navegador que no muestre el elemento. El elemento sigue en el DOM. Cuando la persona adopta un perro, el código quita `hidden` y el mensaje aparece.

La segunda forma es agregar el elemento al DOM solo cuando se necesita, y quitarlo cuando no.

¿Cuál es mejor? Las dos funcionan. Ocultar es simple y el elemento siempre está ahí para leerlo o cambiarlo. Quitar mantiene el DOM pequeño y no puede dejar contenido viejo. La Practice app usa la primera forma para su error de login:

```html
<div data-slot="alert" role="alert" hidden data-testid="login-error"></div>
```

El elemento existe desde el primer momento, con el atributo `hidden` y sin texto. Cuando escribes una contraseña incorrecta, la app escribe un mensaje en él y quita `hidden`. Una herramienta que mira el DOM debe conocer esta diferencia. Un elemento puede estar en el DOM y no ser visible.

## Profundiza

### Por qué funciona así: el DOM está vivo

El archivo HTML es texto. El DOM es un conjunto de objetos vivos en la memoria del navegador. El código de la página puede cambiar estos objetos en cualquier momento. Playwright no lee tu archivo HTML. Le pregunta al navegador por el DOM vivo. Así que un test ve cómo se ve la página ahora, no lo que decía el archivo al inicio.

### Una idea equivocada común: "si el elemento existe, la persona usuaria puede verlo"

El mensaje de error de la Practice app está en el DOM desde el primer momento, con el atributo `hidden`. Un test que solo comprueba "¿existe?" no prueba nada sobre lo que ve la persona usuaria. Esta es la comprobación correcta, como se verá en el módulo de Playwright:

```ts
await expect(page.getByTestId("login-error")).toBeHidden()
await page.getByTestId("login-submit").click()
await expect(page.getByTestId("login-error")).toBeVisible()
```

El formulario está vacío cuando hacemos clic, así que la app muestra "Enter your email and password." (ingresa tu correo y tu contraseña). Visible y oculto son estados de un elemento que está en el DOM. Prueba el estado que la persona usuaria puede ver.

### Cómo aparece en el trabajo real de QA: elementos que se reemplazan

Abre la Practice app y agrega el caso "One". Luego ejecuta esto en la Console (consola):

```text
> const first = document.querySelector('[data-testid="cases-item"]')
> first.isConnected
true
```

`isConnected` te dice si un elemento sigue en la página. Ahora elige **Passed** en la lista **Show**. El caso está pendiente, así que la app quita su fila. Elige **All** otra vez. La fila vuelve y se ve igual. Ejecuta esto:

```text
> first.isConnected
false
> document.querySelector('[data-testid="cases-item"]') === first
false
```

La fila nueva se ve como la vieja, pero es un elemento distinto. Tu variable `first` todavía apunta al elemento viejo, que ya no está en la página. (Si marcas la casilla en lugar de eso, la fila se queda y `first.isConnected` sigue en `true`. Que un elemento se reemplace depende de cómo esté escrito el código de la página.)

Este es un problema real en el código de los tests. Un test no debe guardar una referencia a un elemento y usarla después. Playwright lo resuelve: un ***locator*** (localizador) no es un elemento. Es una descripción, como "el elemento con este `data-testid`". Playwright busca en el DOM otra vez cada vez que lo usas. Aprenderás los locators en el módulo 3.

Recuerda: la página puede reemplazar elementos mientras una persona los mira, y se ven iguales. Tu test debe describir qué encontrar, y no sostener un elemento.

## Práctica

1. Inicia el sitio del curso en una terminal dentro de VS Code:

```bash
pnpm dev
```

2. Abre `http://localhost:5180/#/practice` en Chrome o Edge.
3. Presiona `F12` para abrir las DevTools. Haz clic en la pestaña **Elements**.
4. Busca la línea `<form ... data-testid="login-form" ...>`. Haz clic en la flecha pequeña para abrirla y cerrarla. Cuenta sus hijos.
5. Haz clic derecho en el campo Email de la página y elige **Inspect** (inspeccionar). Las DevTools seleccionan su línea en la pestaña Elements. ¿Cuáles son su `type` y su `data-testid`? ¿Qué elemento contiene el texto "Email"?
6. En la página, escribe un correo y una contraseña incorrectos, y luego haz clic en **Sign in**. En la pestaña Elements, busca la línea con `data-testid="login-error"`. El atributo `hidden` ya no está, y el elemento tiene texto.
7. Agrega dos casos de prueba en la sección 2. Busca el `ul` con `data-testid="cases-list"`. Ábrelo y cuenta sus hijos `li`.
8. Presiona `Ctrl + U` para abrir "View page source" de la misma página. Busca `login-error`. ¿Está ahí? ¿Por qué sí o por qué no?

## Reto

Construye una página pequeña sobre algo que te guste (un refugio de mascotas, una liga de fútbol, un libro de recetas, una lista de música: elige tu propio mundo). Debe mostrar una lista que el código cambia después de que la página carga, y un mensaje que al inicio está oculto.

Crea el archivo `exercises/challenges/html-and-the-dom.html`. Ábrelo con doble clic, o con clic derecho y "Open with" (abrir con) Chrome o Edge. La página necesita: un título, una lista con tres elementos, un botón y un mensaje oculto al inicio. Cuando haces clic en el botón, el mensaje aparece y se agrega un elemento nuevo a la lista.

Está terminado cuando:

- La página se abre en el navegador, y el panel Elements muestra un elemento anidado al menos tres niveles, por ejemplo `html`, `body`, `ul`, `li`.
- Antes de hacer clic, el mensaje tiene el atributo `hidden` en el panel Elements. Después de hacer clic, el atributo ya no está.
- Después del clic, la lista tiene cuatro elementos en el panel Elements. "View page source" (`Ctrl + U`) sigue mostrando solo los tres elementos originales.
- Tu archivo tiene un comentario de una línea que dice por qué el elemento nuevo no está en el código fuente de la página.

Vas a necesitar algo que esta lección no enseñó: cómo ejecutar código cuando se hace clic en un botón, y cómo mostrar un elemento desde el código. Busca: `addEventListener click`, `element hidden property javascript`, `script tag at end of body`.

## Piénsalo bien

1. Esta página se ejecuta. ¿Qué imprime la Console y por qué?

```html
<ul id="dogs">
  <li>Rex</li>
  <li>Luna</li>
  <li>Bo</li>
</ul>
<script>
  const list = document.querySelector("#dogs")
  console.log(list.children.length)
  list.firstElementChild.remove()
  console.log(list.children.length)
  console.log(list.children[0].textContent)
</script>
```

<details>
<summary>Respuesta</summary>

Imprime `3`, luego `2`, luego `Luna`. La lista empieza con tres hijos. `firstElementChild` es el `li` con Rex, y `remove()` lo saca del DOM. Después, la lista tiene dos hijos, y el primero es Luna. El script cambia el DOM. No cambia el archivo HTML.

</details>

2. No hay ningún error, pero la página se ve mal. El texto "Age: 4" está en negrita, y nadie lo pidió. Encuentra el *bug* (error).

```html
<p>Name: <b>Rex</p>
<p>Age: 4</p>
```

<details>
<summary>Respuesta</summary>

La etiqueta `<b>` nunca se cierra. El navegador no reporta un error. Repara el HTML por sí solo. El navegador termina el primer párrafo, y luego abre la negrita otra vez en el segundo párrafo. Ahora el DOM tiene dos elementos `b`, y "Age: 4" está en negrita. La solución es escribir `<b>Rex</b>`. Esto muestra que el DOM es lo que el navegador entendió, y puede diferir de lo que querías escribir.

</details>

3. Dos versiones del mensaje "Adopted!" funcionan. A) El `p` siempre está en la página con el atributo `hidden`. B) El código agrega el `p` solo después de la adopción. ¿Cuál es mejor aquí y qué te haría elegir la otra?

<details>
<summary>Respuesta</summary>

A es más simple para esta página. El elemento tiene un lugar fijo, el código solo cambia un atributo, y es fácil de encontrar en las DevTools. B es mejor cuando el contenido es grande o tiene muchas partes, porque un bloque oculto sin usar igual cuesta memoria y algunas herramientas igual lo leen. También es mejor cuando el contenido viejo nunca debe quedarse. La elección depende del tamaño de la parte oculta y de qué tan seguido cambia.

</details>

4. Un diseñador mueve el botón Adopt de cada tarjeta de perro a un nuevo `div` envoltorio, solo por el diseño visual. Existen dos comprobaciones. Una encuentra el elemento con el selector `article > button`. La otra encuentra el elemento con `data-testid="adopt-rex"`. ¿Cuál se rompe y por qué?

<details>
<summary>Respuesta</summary>

Se rompe la primera. El selector `article > button` significa "un botón que es hijo directo de un article". Después del cambio, el botón es un nieto, así que el selector no encuentra nada. El `data-testid` no depende de dónde esté el elemento en el árbol, así que la segunda comprobación sigue funcionando. Un selector que depende de la estructura es frágil cuando cambia el diseño.

</details>

5. Explica a un amigo la diferencia entre el archivo HTML y el DOM. Usa tres frases. No uses la palabra "árbol".

<details>
<summary>Respuesta</summary>

Una buena respuesta podría ser: "El archivo HTML es el texto que envía el servidor, como un plano. El navegador lo lee y construye una copia viva de la página en memoria, y esa copia viva es el DOM. El código puede cambiar la copia viva después de que la página carga, así que la página que ves puede diferir del archivo." La idea clave es que el archivo es fijo y el DOM cambia. Si tu respuesta dice que son iguales, revisa el acertijo otra vez.

</details>

6. Hoy el refugio no tiene perros, así que la lista es `<ul id="dogs"></ul>`. Un script ejecuta `document.querySelector("#dogs").firstElementChild.remove()`. ¿Qué pasa?

<details>
<summary>Respuesta</summary>

El script se detiene con un error: `Cannot read properties of null (reading 'remove')`. La lista no tiene hijos, así que `firstElementChild` es `null`, y `null` no tiene un método `remove`. Este es el caso límite de una lista vacía. El código que funciona con tres perros puede fallar con cero. Un script cuidadoso comprueba que el elemento exista antes de usarlo.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Cuál es la diferencia entre un nodo del DOM y un elemento del DOM?**
   - Busca: `DOM node vs element MDN`
   - Pruébalo: abre cualquier página y ejecuta `document.body.childNodes.length` y `document.body.children.length` en la Console. Compara los dos números.
   - Una buena respuesta explica: que el texto y los comentarios también son nodos, y que un elemento es un tipo de nodo.
2. **¿Cuál es la diferencia entre el atributo `hidden` y la regla CSS `display: none`?**
   - Busca: `hidden attribute vs display none`
   - Pruébalo: en el panel Elements, agrega `hidden` a un párrafo. Luego dale el estilo `display: block` en el panel Styles. ¿Aparece otra vez?
   - Una buena respuesta explica: qué hace cada uno, y por qué una regla CSS puede hacer visible otra vez un elemento con `hidden`.
3. **¿Cómo repara un navegador el HTML que tiene errores, como una etiqueta que nunca se cierra?**
   - Busca: `HTML parsing error handling browser recovers`
   - Pruébalo: escribe un archivo pequeño con `<p>One<p>Two` y un `<b>` sin cerrar, ábrelo y mira el resultado en el panel Elements. Compáralo con lo que escribiste.
   - Una buena respuesta explica: que el navegador no se detiene por errores de HTML, una regla que usa para repararlos, y por qué esto hace que el DOM difiera del archivo.

## Siguiente paso

En la próxima lección aprenderás que cada elemento tiene un rol y un nombre, y cómo las herramientas los usan para encontrar elementos.
