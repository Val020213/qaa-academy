---
title: HTML y el DOM
duration: 60 min
---

## Objetivo

Leerás la estructura de una página y revisarás en el navegador cómo cambia cuando el código agrega, quita u oculta elementos.

- Identificar etiquetas, atributos y contenido.
- Distinguir hijos directos de elementos anidados a más niveles.
- Explicar por qué el archivo HTML y el DOM pueden ser diferentes.
- Distinguir un elemento oculto de uno que ya no está en el DOM.

## Etiquetas, atributos y contenido

**HTML** describe los elementos de una página web: títulos, botones, campos de texto. Un elemento suele tener una etiqueta de apertura, contenido y una etiqueta de cierre. Este es un enlace:

```html
<a href="/dogs/rex" class="more">See Rex</a>
```

- `<a>` es la **etiqueta** de apertura. Indica el tipo de elemento; aquí, un enlace.
- `See Rex` es el **contenido**: el texto que ve la persona usuaria.
- `</a>` es la etiqueta de cierre.
- `href="/dogs/rex"` y `class="more"` son **atributos**. Un atributo es información extra sobre el elemento. En estos ejemplos tiene un nombre y un valor entre comillas; otros atributos, como `hidden`, pueden escribirse sin valor.

Algunos elementos no tienen contenido ni etiqueta de cierre. Un campo para un número es uno de ellos:

```html
<input type="number" name="age" min="0" />
```

## Anidamiento

Los elementos pueden estar dentro de otros elementos. Esto se llama **anidamiento**. El elemento que contiene directamente a otro es su **padre**; el elemento contenido es su **hijo**.

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

El `ol` tiene dos hijos directos: los dos elementos `li`. El padre del `li` con "Salt" es el `ul` interno, que está dentro del segundo `li`. Un hijo está solo un nivel más abajo.

La sangría ayuda a leer el anidamiento; el navegador lo determina por las etiquetas.

Este es el formulario de login de la Practice app, sin las clases largas de estilo. Está en `src/practice/LoginPanel.tsx`:

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

El `form` tiene tres hijos: dos elementos `div` y un `button`. Cada `div` contiene un `label` y un `input`.

## Del HTML al DOM

El navegador analiza el HTML y construye el **DOM** (Document Object Model, modelo de objetos del documento): objetos en memoria organizados en un árbol según el anidamiento. El código de la página puede cambiar esos objetos.

El árbol de elementos del formulario se ve así:

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

El archivo HTML es el punto de partida. El código puede agregar, quitar o cambiar elementos del DOM sin modificar ese archivo:

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

El script crea un elemento de lista, le asigna el texto "Luna", busca la lista y agrega el elemento al final. La página muestra Rex y Luna. "View page source" muestra solo a Rex dentro del `ul`, más el script. El navegador ejecuta este script cuando llega a su etiqueta, durante el análisis del HTML. El segundo `li` existe solo en el DOM.

![El navegador crea el DOM y ejecuta el script durante el análisis; el código fuente conserva solo a Rex en la lista.](/images/02-html-dom.es.svg)

El sitio del curso construye sus páginas con código. "View page source" muestra un archivo con un `div` y scripts; el panel **Elements** de las DevTools muestra el DOM actual.

## Ocultar o quitar elementos

Una página puede mantener un mensaje en el DOM y ocultarlo hasta que se necesite:

```html
<p hidden>Adopted! Thank you.</p>
```

Aquí el atributo `hidden` se escribe sin valor. Le dice al navegador que no muestre el elemento. Cuando la persona adopta un perro, el código quita `hidden` y el mensaje aparece.

Otra opción es agregar el elemento al DOM cuando se necesita y quitarlo después. Ocultar permite leer o cambiar el elemento mientras no se ve. Quitar desconecta el elemento del documento, aunque una variable puede seguir apuntando a él.

La Practice app mantiene su error de login en el DOM:

```html
<div data-slot="alert" role="alert" hidden data-testid="login-error"></div>
```

Al inicio tiene el atributo `hidden` y no tiene texto. Cuando envías credenciales incorrectas, la app escribe el mensaje y quita `hidden`. Que un elemento exista en el DOM no indica que sea visible.

## Profundiza

### Elementos que se reemplazan

El código puede quitar un elemento y crear otro que se vea igual. Una variable que apuntaba al elemento original sigue apuntando a él.

Abre la Practice app y agrega el caso "One". Ejecuta esto en la **Console**:

```text
> const first = document.querySelector('[data-testid="cases-item"]')
> first.isConnected
true
```

`isConnected` indica si el elemento sigue en la página. Elige **Passed** en la lista **Show**. El caso está pendiente, así que la app quita su fila. Elige **All** otra vez y ejecuta esto:

```text
> first.isConnected
false
> document.querySelector('[data-testid="cases-item"]') === first
false
```

La fila que vuelve es un elemento distinto. La variable `first` apunta a la fila anterior, que ya no está en la página. Si marcas la casilla sin filtrar, la fila se mantiene y `first.isConnected` sigue en `true`: el resultado depende de cómo el código actualiza el DOM.

## Práctica

1. Inicia el sitio del curso en una terminal dentro de VS Code:

```bash
pnpm dev
```

2. Abre `http://localhost:5180/#/practice` en Chrome o Edge.
3. Presiona `F12` para abrir las DevTools. Haz clic en la pestaña **Elements**.
4. Busca la línea `<form ... data-testid="login-form" ...>`. Expándela con la flecha y cuenta sus hijos directos.
5. Haz clic derecho en el campo Email y elige **Inspect** (inspeccionar). Lee su `type` y su `data-testid` en Elements. Identifica el elemento que contiene el texto "Email".
6. Escribe un correo y una contraseña incorrectos y haz clic en **Sign in**. En Elements, busca `data-testid="login-error"`. Comprueba que tiene texto y ya no tiene `hidden`.
7. Agrega dos casos de prueba en la sección 2. Busca el `ul` con `data-testid="cases-list"`, expándelo y cuenta sus hijos `li`.
8. Presiona `Ctrl + U` para abrir "View page source". Busca `login-error` y compara el resultado con el DOM que viste en Elements.

## Reto

Crea `exercises/challenges/html-and-the-dom.html` con un título, una lista de tres elementos, un botón y un mensaje oculto. Al hacer clic en el botón, el mensaje debe aparecer y la lista debe recibir un elemento nuevo. Abre el archivo con doble clic o con "Open with" (abrir con) Chrome o Edge.

Está terminado cuando:

- Elements muestra un elemento anidado al menos tres niveles, por ejemplo `html`, `body`, `ul`, `li`.
- El mensaje tiene `hidden` antes del clic y deja de tenerlo después.
- Después del clic, Elements muestra cuatro elementos en la lista. "View page source" (`Ctrl + U`) conserva los tres originales.
- Un comentario de una línea en el archivo dice por qué el elemento nuevo no aparece en el código fuente.

Busca cómo ejecutar código al hacer clic y mostrar un elemento: `addEventListener click`, `element hidden property javascript`, `script tag at end of body`.

## Piénsalo bien

1. ¿Qué imprime la Console y por qué?

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

Imprime `3`, luego `2`, luego `Luna`. `firstElementChild` es el `li` con Rex y `remove()` lo saca del DOM. Quedan dos hijos y el primero es Luna.

</details>

2. El texto "Age: 4" aparece en negrita aunque no debería. Encuentra el bug.

```html
<p>Name: <b>Rex</p>
<p>Age: 4</p>
```

<details>
<summary>Respuesta</summary>

La etiqueta `<b>` nunca se cierra. El navegador termina el primer párrafo y vuelve a aplicar la negrita en el segundo al reparar el HTML. El DOM tiene dos elementos `b`. La solución es escribir `<b>Rex</b>`.

</details>

3. La lista es `<ul id="dogs"></ul>`. Un script ejecuta `document.querySelector("#dogs").firstElementChild.remove()`. ¿Qué pasa?

<details>
<summary>Respuesta</summary>

El script se detiene con `Cannot read properties of null (reading 'remove')`. Como la lista no tiene hijos, `firstElementChild` es `null`. Comprueba que el elemento exista antes de llamar a `remove`.

</details>

## Siguiente paso

En la próxima lección identificarás el rol y el nombre accesible de los controles, y cómo las herramientas los usan.
