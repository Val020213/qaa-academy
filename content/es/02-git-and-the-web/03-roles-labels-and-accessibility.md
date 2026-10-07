---
title: Roles, etiquetas y accesibilidad
duration: 60 min
---

## Objetivo

En esta lección identificas el rol y el nombre accesible de los controles de una página. También compruebas que sus etiquetas están conectadas y que se pueden usar con el teclado.

- Reconocer el rol y el nombre accesible de un elemento a partir de su HTML.
- Conectar una etiqueta con un campo de dos maneras y detectar un enlace incorrecto.
- Distinguir el comportamiento de un botón HTML del de un `div` con un rol o un manejador de clic.
- Elegir entre texto visible y `aria-label` para dar nombre a un botón.

## Roles

Un **rol** indica el tipo de elemento: botón, enlace, campo de texto o casilla. El navegador obtiene el rol del HTML y lo comunica a las herramientas de asistencia, como los lectores de pantalla que leen la página en voz alta.

El navegador asigna estos roles sin que tengas que escribirlos:

| HTML | Rol |
| --- | --- |
| `<button>` | button |
| `<a href="...">` | link |
| `<input type="text">` o `<input type="email">` | textbox |
| `<input type="checkbox">` | checkbox |
| `<select>` | combobox |
| `<h1>` a `<h6>` | heading |
| `<ul>` | list |
| `<li>` | listitem |

El rol permite reconocer cómo se usa un control. Un botón responde a `Enter` y `Space`; un enlace lleva a otra página.

> **Nota:** El campo de contraseña, `<input type="password">`, es un caso especial. No tiene un rol ARIA implícito en HTML, pero Chromium lo expone como textbox en su árbol de accesibilidad. Un `div` o un `span` de diseño puede aparecer como generic, sin la función de un control.

## Usa el botón HTML

Este elemento tiene un manejador de clic y puede tener el aspecto de un botón:

```html
<div class="green-button" onclick="adopt('rex')">Adopt Rex</div>
```

El clic del mouse funciona porque ejecuta el manejador. El navegador no incluye este `div` en el recorrido de `Tab` ni lo activa con `Enter` o `Space`. El elemento contiene el texto "Adopt Rex", pero no tiene el rol button.

Agregar un rol tampoco agrega el comportamiento de un botón:

```html
<div role="button">Sign in</div>
<button type="button">Sign in</button>
```

El navegador permite llegar al `button` con `Tab` y activarlo con `Enter` y `Space`. El `div` con `role="button"` comunica el rol, pero necesita código extra para recibir el foco y responder al teclado. Usa primero el elemento HTML real.

## El nombre accesible

El **nombre accesible** es el texto que identifica un elemento para las herramientas de asistencia. En un botón o un enlace suele venir del texto del elemento:

```html
<button>Adopt</button>
<button aria-label="Close">X</button>
<button><svg aria-hidden="true" width="16" height="16"></svg></button>
```

El primer botón se llama "Adopt". El segundo se llama "Close": `aria-label` da un nombre explícito que tiene prioridad sobre el texto "X". El tercero no tiene nombre, porque su único contenido es un dibujo oculto a las herramientas de asistencia. Las herramientas de asistencia reciben el rol button sin un nombre que indique qué hace.

Cuando hay espacio, `<button>Close</button>` muestra el mismo nombre que escucha la persona que usa un lector de pantalla. Con `<button aria-label="Close">X</button>`, el texto visible y el nombre difieren, así que un comando de voz puede fallar. Usa `aria-label` cuando el diseño solo permite un ícono, y haz que el dibujo y el nombre signifiquen lo mismo.

Con el sitio en inglés y el tema claro activo, el botón de cambio de tema tiene este HTML:

```html
<button data-slot="button" type="button" aria-label="Switch to dark theme"
        title="Switch to dark theme" data-testid="theme-toggle">...</button>
```

Muestra un ícono de luna y su nombre accesible es "Switch to dark theme". El `title` también puede dar un nombre. Si quitaras `aria-label` y `title`, seguiría mostrando el ícono, pero no tendría nombre accesible.

El nombre también debe permitir distinguir controles. Si tres filas de perros tienen botones que dicen "Delete", un lector de pantalla anuncia el mismo nombre tres veces. Puedes incluir el nombre del perro en el texto visible o dar un nombre más preciso con `aria-label`, como "Delete Rex".

## Etiquetas para los campos

Una **etiqueta** (*label*) indica para qué sirve un campo. Además de mostrar el texto, el navegador debe enlazarla con el control para darle su nombre accesible.

La primera forma es hacer coincidir el valor `for` de la etiqueta con el `id` del campo. El login de la Practice app lo hace así:

```html
<label data-slot="label" for="login-email">Email</label>
<input data-slot="input" id="login-email" type="email" name="email"
       autocomplete="off" data-testid="login-email" />
```

El campo tiene el rol textbox y el nombre "Email".

La segunda forma es poner el campo dentro de la etiqueta. La Practice app lo hace con la casilla de cada caso:

```html
<label>
  <input type="checkbox" data-testid="cases-toggle-1" />
  <span data-testid="cases-item-title">One</span>
</label>
```

La casilla tiene el rol checkbox y el nombre "One". Hacer clic en una etiqueta conectada mueve el foco al campo o marca la casilla. Una etiqueta sin conectar no hace nada al hacer clic en ella.

Un **placeholder** es el texto de ayuda dentro de un campo vacío. Desaparece cuando escribes, así que no lo uses como único nombre de un campo.

## Roles explícitos

El atributo `role` permite escribir un rol cuando el elemento no lo tiene automáticamente. La Practice app lo usa en sus mensajes:

```html
<div data-slot="alert" role="alert" hidden data-testid="login-error"></div>
<div data-slot="alert" role="status" hidden data-testid="login-welcome">...</div>
```

`role="alert"` da prioridad de anuncio urgente a los cambios del mensaje; `role="status"` pide anunciarlos sin interrumpir la lectura actual. La app usa el primero para el error de login y el segundo para confirmar la sesión. Elige la prioridad según la urgencia, no solo porque sea un error.

## Profundiza

### El árbol de accesibilidad

A partir del DOM, el navegador construye el **árbol de accesibilidad** para las herramientas de asistencia. Expone roles, nombres y estados, como marcado o deshabilitado, para lectores de pantalla y otras herramientas de asistencia. Puede incluir contenedores genéricos; no reproduce cada nodo del DOM.

![Tres controles del HTML y los roles, nombres y estado que el navegador expone a las herramientas de asistencia.](/images/02-dom-accessibility.es.svg)

El panel Accessibility de las DevTools muestra este árbol. El navegador calcula el rol y el nombre a partir del HTML.

## Práctica

1. Asegúrate de que `pnpm dev` esté ejecutándose. Abre `http://localhost:5180/#/practice` en Chrome o Edge.
2. Presiona `F12`. Haz clic derecho en el botón **Sign in** de la página y elige **Inspect** para verlo en la pestaña Elements.
3. Abre el panel **Accessibility**, en el lado derecho de Elements. Puede estar detrás del menú `>>`.
4. Lee el **Name** y el **Role** del botón. Deberías ver "Sign in" y "button".
5. Inspecciona el campo Email y lee su nombre y su rol. Haz clic en el texto "Email" y comprueba que el campo recibe el foco.
6. Inspecciona el campo Password y lee su rol. En Chromium aparece como textbox, con el nombre "Password"; otros navegadores pueden exponerlo de otra forma.
7. Agrega un caso en la sección 2 e inspecciona su casilla. Lee el nombre y haz clic en el texto del caso para comprobar que cambia la casilla.
8. Inspecciona el botón con la luna o el sol en la barra superior. Lee su nombre y su rol, y localiza el atributo que le da nombre.
9. Escribe una lista de cinco elementos de la página con su rol y su nombre.

## Reto

Construye un formulario de registro que pueda usarse con teclado y lector de pantalla. Elige el tema: un carnet de biblioteca, una adopción de mascota, un pedido de pizza o un club de fútbol.

Crea `exercises/challenges/roles-and-labels.html` con dos campos de texto, un `select`, una casilla, tres botones de opción que respondan una pregunta, un botón de envío y un botón con el ícono "✕" para cerrar. Ábrelo en Chrome o Edge.

Está terminado cuando:

- Cada campo de texto, el `select` y la casilla tienen una etiqueta visible que lleva el foco al control al hacer clic.
- En Accessibility, el botón "✕" se llama "Close" y los demás controles muestran el nombre de su etiqueta. El grupo de botones de opción tiene como nombre la pregunta.
- Puedes llenar y enviar el formulario usando solo `Tab`, `Space`, las flechas y `Enter`.
- Un comentario al inicio del archivo lista cada control con el rol y el nombre que muestran las DevTools.

Vas a necesitar algo que esta lección no enseñó: cómo dar nombre a un grupo de botones de opción. Nombra el botón "✕" como se nombra el botón de cambio de tema de arriba. Busca: `fieldset legend radio group`, `chrome devtools accessibility pane computed properties`.

## Piénsalo bien

1. ¿Qué rol y nombre tiene cada elemento, y de dónde viene cada nombre?

```html
<label for="age">Age</label>
<input id="age" type="number" />

<button aria-label="Close">X</button>

<a href="/dogs">See all dogs</a>
```

<details>
<summary>Respuesta</summary>

El campo numérico tiene el rol spinbutton y el nombre "Age", porque `for="age"` coincide con `id="age"`. El botón tiene el rol button y el nombre "Close", que viene de `aria-label`. El enlace tiene el rol link y el nombre "See all dogs", que viene de su texto. El tipo del campo determina su rol.

</details>

2. Hacer clic en "Pet name" no hace nada y el campo no tiene nombre accesible. Encuentra el bug.

```html
<label for="pet-name">Pet name</label>
<input id="petname" type="text" />
```

<details>
<summary>Respuesta</summary>

El valor de `for` es `pet-name`, pero el `id` es `petname`. El navegador no encuentra el campo para la etiqueta porque los valores difieren por un guion. Haz que ambos sean idénticos. Puedes detectar el error haciendo clic en la etiqueta o leyendo el nombre en Accessibility.

</details>

3. Una página tiene dos campos con `id="email"`. Cada uno tiene su propia etiqueta con `for="email"`. ¿Qué se rompe y para quién?

<details>
<summary>Respuesta</summary>

El navegador enlaza ambas etiquetas con el primer elemento que tiene ese id. Un clic en la segunda etiqueta lleva el foco al campo equivocado, y el segundo campo recibe un nombre incorrecto o ninguno. Usa dos ids distintos para que cada etiqueta apunte a su campo.

</details>

## Siguiente paso

En la próxima lección aprenderás los selectores CSS y el atributo `data-testid`, la otra forma de encontrar un elemento.
