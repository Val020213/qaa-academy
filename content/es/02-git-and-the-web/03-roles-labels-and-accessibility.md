---
title: Roles, etiquetas y accesibilidad
summary: Aprende que cada elemento tiene un rol y un nombre accesible, cómo se conectan las etiquetas con los campos, y por qué un div no es un botón.
duration: 75 min
---

## Empieza con un acertijo

El sitio de un refugio de perros tiene un rectángulo verde con esquinas redondas que dice "Adopt Rex" (adoptar a Rex). Un desarrollador lo construyó así:

```html
<div class="green-button" onclick="adopt('rex')">Adopt Rex</div>
```

En la página se ve perfecto. Ahora prueba cuatro formas de usarlo. A) Hacer clic con el mouse. B) Presionar la tecla `Tab` hasta seleccionarlo. C) Seleccionarlo y presionar `Enter`. D) Preguntarle a un lector de pantalla, un programa que lee la página en voz alta, "¿qué es esto?"

¿Cuáles de las cuatro funcionan? ¿Qué esperarías con un `<button>` real en lugar del `div`?

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Predecir el rol y el nombre accesible de un elemento a partir de su HTML.
- Conectar una etiqueta con un campo de dos maneras, y encontrar el error cuando no está conectada.
- Explicar por qué un `div` con un manejador de clic no es un botón.
- Decidir cuándo un texto visible y un `aria-label` deben ser iguales.

## Dos formas de encontrar un elemento

Una persona encuentra el botón "Sign in" mirando la página. Ve un botón con el texto "Sign in" (iniciar sesión).

Un lector de pantalla no puede mirar la página. Le hace dos preguntas al navegador sobre cada elemento: qué es y cómo se llama. Piensa en una puerta de un edificio grande. Un visitante que ve distingue el dibujo de un baño en ella. Un visitante ciego necesita un letrero en Braille, o alguien que se lo diga.

Las respuestas son el **rol** y el **nombre accesible**. Una herramienta que controla la página, como Playwright, hace las mismas dos preguntas.

## Roles

Un **rol** dice qué tipo de cosa es un elemento. El navegador le da un rol a la mayoría de los elementos HTML por sí mismo. Tú no lo escribes.

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

Un rol también dice cómo funciona un elemento. Las personas que usan teclado saben que un botón reacciona a `Enter` y `Space`. Saben que un enlace va a otra página. Ambos aparecen en la pantalla como texto de color, pero son cosas distintas.

> **Nota:** El campo de contraseña, `<input type="password">`, es un caso especial. El estándar HTML no le da ningún rol, y Chrome y Edge pueden mostrarlo de forma distinta. Un `div` o un `span` no tiene un rol útil.

### De vuelta al acertijo

El clic del mouse (A) funciona con el `div`, porque el desarrollador escribió un manejador de clic. Las otras tres no funcionan. Un `div` no está en el recorrido de `Tab`, así que B falla, y C también. Un lector de pantalla no encuentra ningún rol, así que dice solo "Adopt Rex" como texto simple, y no dice "button" (D). Un `<button>` real pasa las cuatro pruebas sin código extra. El navegador le da foco, manejo del teclado y el rol. El `div` parece un botón, pero nada más es cierto. Por eso la regla es: usa primero el elemento real.

## El nombre accesible

El **nombre accesible** es el texto que identifica un elemento. Para un botón o un enlace, suele ser su texto. Mira estos tres botones. Di el nombre de cada uno antes de seguir.

```html
<button>Adopt</button>
<button aria-label="Close">X</button>
<button><svg aria-hidden="true" width="16" height="16"></svg></button>
```

El primer botón se llama "Adopt". El segundo se llama "Close". El atributo `aria-label` da un nombre a mano, y gana sobre el texto "X". El tercero no tiene ningún nombre. Solo contiene un dibujo. Un lector de pantalla dice "button" y nada más. La persona usuaria no puede saber qué hace.

La Practice app tiene un botón que solo tiene un ícono. El botón de cambio de tema tiene este nombre:

```html
<button data-slot="button" type="button" aria-label="Switch to dark theme"
        title="Switch to dark theme" data-testid="theme-toggle">...</button>
```

Muestra un ícono de luna, y su nombre accesible es "Switch to dark theme" (cambiar al tema oscuro). El `title` también puede dar un nombre. Si quitaras `aria-label` y `title`, sería un botón vacío.

Para un campo, el nombre suele venir de su etiqueta.

## Etiquetas para los campos

Una **etiqueta** (*label*) es el texto que dice para qué sirve un campo. Una buena etiqueta hace dos cosas: las personas usuarias la ven, y el navegador la enlaza con el campo.

Hay dos formas de enlazarlos. La primera es hacer coincidir el valor `for` de la etiqueta con el `id` del campo. Así funciona ahora el login de la Practice app:

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

Aquí la casilla tiene el rol checkbox y el nombre "One". Las dos formas dan el mismo resultado.

Predice qué pasa cuando haces clic en el texto "Email" de la página, y cuando haces clic en el texto "One". Luego pruébalo en la Practice. Hacer clic en una etiqueta mueve el foco a su campo, o marca la casilla. Esta es una prueba visible de que el enlace existe. Una etiqueta que no está enlazada no hace nada cuando le haces clic.

Un placeholder no es una etiqueta. Un **placeholder** (texto de ayuda) es un texto gris dentro de un campo vacío. Desaparece cuando escribes. No lo uses como único nombre de un campo.

## Roles que no son automáticos

A veces un desarrollador escribe un rol a mano con el atributo `role`. La Practice app lo hace con sus mensajes:

```html
<div data-slot="alert" role="alert" hidden data-testid="login-error"></div>
<div data-slot="alert" role="status" hidden data-testid="login-welcome">...</div>
```

Un `div` no tiene un rol especial. `role="alert"` les dice a las herramientas de asistencia: "esto es importante, léelo ahora". `role="status"` dice: "esto es información, léela cuando la persona no esté ocupada". Un error necesita el primero. Una nota de "iniciaste sesión" encaja con el segundo.

Un rol no cambia cómo funciona un elemento. Solo cambia lo que se les dice a las herramientas.

## Profundiza

### Por qué funciona así: un segundo árbol

El navegador construye el DOM a partir del HTML. A partir del DOM, construye otro árbol para las herramientas de asistencia. Este es el **árbol de accesibilidad**. Guarda solo lo que importa a una persona que no puede ver: el rol, el nombre y el estado de cada elemento, como marcado o deshabilitado. Un `div` que solo sirve para el diseño visual se deja fuera.

El panel Accessibility de las DevTools muestra este árbol. Los buscadores de Playwright como `getByRole` usan la misma idea. El rol y el nombre se calculan a partir del HTML. Nadie los escribe en un test.

### Una idea equivocada común: "puedo agregar `role=button` a un `div`"

Puedes. Entonces un buscador verá un botón. Pero un `button` real hace más:

```html
<div role="button">Sign in</div>
<button type="button">Sign in</button>
```

Al `button` real se llega con la tecla `Tab`, y funciona con `Enter` y `Space`. El `div` no hace nada de esto a menos que un desarrollador escriba código extra. Un rol solo cambia lo que se le dice a la herramienta. No cambia cómo funciona el elemento. Una buena regla es: usa primero el elemento HTML real.

### Un equilibrio: rol y nombre, o `data-testid`

Un buscador por rol y nombre prueba lo que la persona usuaria ve. También tiene un costo, porque el nombre es texto:

```ts
await page.getByRole("button", { name: "Sign in" }).click()
await page.getByTestId("login-submit").click()
```

Si el texto del botón cambia a "Log in", la primera línea falla. Si el sitio recibe otro idioma, falla otra vez. La segunda línea sigue funcionando, porque `data-testid` no cambia con el texto.

Por eso el equipo pone `data-testid` en cada elemento interactivo, y usa `getByTestId` como la forma normal de encontrarlo. Un buscador por rol es una buena opción cuando el nombre es lo que quieres comprobar. Por ejemplo, puedes comprobar que un campo tiene la etiqueta correcta, porque un test con `getByLabel("Email")` falla cuando la etiqueta se quita.

Por defecto, un nombre coincide con una parte del texto, y no distingue mayúsculas de minúsculas. Así que `{ name: "sign" }` también encuentra "Sign in". Esto puede encontrar demasiados elementos. Aprenderás a ser exacto en el módulo 3.

## Práctica

1. Asegúrate de que `pnpm dev` esté ejecutándose. Abre `http://localhost:5180/#/practice` en Chrome o Edge.
2. Presiona `F12`. En la pestaña Elements, haz clic derecho en el botón **Sign in** de la página y elige **Inspect**.
3. Busca el panel **Accessibility**. Está en el lado derecho de la pestaña Elements, y puede estar detrás de un menú `>>`. Ábrelo.
4. Lee el **Name** y el **Role** del botón. Deberías ver "Sign in" y "button".
5. Haz lo mismo con el campo Email. ¿Cuáles son su nombre y su rol? Haz clic en el texto "Email" de la página. ¿Qué pasa?
6. Haz lo mismo con el campo Password. ¿Qué rol ves? Puede ser distinto del de Email, o estar vacío.
7. Inspecciona la casilla de un caso de prueba. Primero agrega un caso en la sección 2. ¿Cuál es su nombre? Haz clic en el texto del caso. ¿Qué pasa?
8. Inspecciona el botón redondo con ícono de la barra superior que tiene la luna o el sol. ¿Cuáles son su nombre y su rol? No muestra texto. ¿De dónde viene el nombre?
9. Escribe una lista corta: cinco elementos de la página, con rol y nombre.

## Reto

Construye un formulario de registro para un mundo que elijas: un carnet de biblioteca, una solicitud de adopción de mascota, un pedido de pizza, un club de fútbol. Debe ser un formulario que pueda usar una persona con solo un teclado y un lector de pantalla.

Crea el archivo `exercises/challenges/roles-and-labels.html`. El formulario necesita: dos campos de texto, un `select`, una casilla, un grupo de tres botones de opción (radio) que respondan una pregunta, un botón de envío y un botón pequeño con solo un ícono que cierre el formulario (basta con una "✕" simple). Abre el archivo en Chrome o Edge.

Está terminado cuando:

- Cada campo de texto, el `select` y la casilla tienen una etiqueta visible. Cuando haces clic en el texto de la etiqueta, el foco pasa al control.
- En el panel Accessibility, el botón "✕" tiene el nombre "Close", y los otros controles muestran el nombre de su etiqueta.
- Puedes llenar y enviar todo el formulario usando solo `Tab`, `Space`, las flechas y `Enter`. Nunca tocas el mouse.
- Inspecciona el grupo de botones de opción. La pregunta es su nombre, no solo el texto de cada respuesta.
- Las primeras líneas de tu archivo son un comentario que lista cada control con el rol y el nombre que muestran las DevTools.

Vas a necesitar algo que esta lección no enseñó: cómo dar nombre a un grupo de botones de opción. Nombra el botón "✕" como se nombra el botón de cambio de tema de arriba. Busca: `fieldset legend radio group`, `chrome devtools accessibility pane computed properties`.

## Piénsalo bien

1. ¿Qué esperas como rol y nombre de cada uno de estos tres elementos? Predice y luego explica de dónde viene cada nombre.

```html
<label for="age">Age</label>
<input id="age" type="number" />

<button aria-label="Close">X</button>

<a href="/dogs">See all dogs</a>
```

<details>
<summary>Respuesta</summary>

El campo numérico es un spinbutton (un campo de número con pasos de subir y bajar) con el nombre "Age". El nombre viene de la etiqueta, porque `for="age"` coincide con `id="age"`. El botón es un button con el nombre "Close", que viene de `aria-label`. El `aria-label` gana sobre la "X" visible. El enlace es un link con el nombre "See all dogs", que viene de su propio texto. Si escribiste "textbox" para el primero, recuerda que el rol depende del tipo de campo.

</details>

2. Este formulario se ve correcto. Hacer clic en el texto "Pet name" no hace nada, y un lector de pantalla dice solo "edit text". Encuentra el *bug* (error).

```html
<label for="pet-name">Pet name</label>
<input id="petname" type="text" />
```

<details>
<summary>Respuesta</summary>

El valor de `for` es `pet-name`, pero el `id` es `petname`. Difieren por un guion, así que el navegador no encuentra ningún campo para la etiqueta. La etiqueta es solo texto junto a un campo. No hay mensaje de error, porque HTML no se queja. La solución es hacer que ambos valores sean idénticos. Puedes encontrar este tipo de error haciendo clic en el texto de la etiqueta, o leyendo el nombre en el panel Accessibility.

</details>

3. Un botón de cerrar puede ser `<button aria-label="Close">X</button>` o `<button>Close</button>`. Los dos dan el nombre accesible "Close". ¿Cuál es mejor aquí y qué te haría elegir el otro?

<details>
<summary>Respuesta</summary>

El segundo es mejor cuando hay espacio para la palabra. Todos ven "Close", y una persona que controla la computadora con la voz puede decir "click Close". Con el primero, el texto visible es "X" y el nombre es "Close", así que el comando de voz puede fallar. El `aria-label` es la opción correcta cuando el diseño solo permite un ícono. Entonces el dibujo visible y el nombre deben significar lo mismo.

</details>

4. Una página tiene dos campos por error, ambos con `id="email"`. Cada uno tiene su propia etiqueta con `for="email"`. ¿Qué se rompe y para quién?

<details>
<summary>Respuesta</summary>

Un `id` debe ser único. El navegador enlaza cada `for="email"` con el primer elemento que tiene ese id. Entonces la etiqueta del segundo campo apunta al primer campo. Un clic en ella mueve el foco al campo equivocado, y un lector de pantalla le da al segundo campo el nombre equivocado o ninguno. Una persona que escribe en él se confunde, y nada muestra un error. Arreglarlo significa usar dos ids distintos.

</details>

5. Explica a un compañero qué es un nombre accesible. Usa tres frases. No uses la palabra "etiqueta".

<details>
<summary>Respuesta</summary>

Una buena respuesta podría ser: "El nombre accesible es el texto corto que una herramienta usa para decir cómo se llama un elemento. Viene del texto dentro de un botón, de un texto junto a un campo, o de un atributo escrito a mano. Una persona que no puede ver la página lo escucha, y un test puede buscarlo." El razonamiento es que un nombre es la respuesta a "¿cómo se llama?" para alguien que no ve la página. No es un estilo ni el nombre de una etiqueta HTML.

</details>

6. Una lista muestra tres perros. Cada fila tiene un botón que dice solo "Delete". Una persona que usa lector de pantalla pasa de botón en botón y escucha "Delete, button" tres veces. ¿Cuál es el problema y cuáles son dos formas de resolverlo?

<details>
<summary>Respuesta</summary>

La persona no puede saber qué perro borra cada botón. Los tres tienen el mismo nombre. Una solución es darle a cada botón un nombre más exacto con `aria-label`, como "Delete Rex". Otra es poner el nombre del perro en el texto visible del botón. Para un test, un `data-testid` con el id de la fila, como `products-delete-5` en la tienda, también distingue los botones. La mejor opción depende de quién debe distinguirlos: una persona, una herramienta o ambas.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es el árbol de accesibilidad y en qué se diferencia del DOM?**
   - Busca: `accessibility tree MDN`
   - Pruébalo: en las DevTools, selecciona un `div` que solo sirve para el diseño visual, y un `button`. Mira ambos en el panel Accessibility. ¿Cuál falta en el árbol o no tiene rol?
   - Una buena respuesta explica: qué contiene el árbol, quién lo usa, y un ejemplo de un elemento que aparece en el DOM pero no en este árbol.
2. **¿Cuál es la primera regla de ARIA?**
   - Busca: `first rule of ARIA use native HTML`
   - Pruébalo: escribe un `div role="button"` en un archivo pequeño. Intenta llegar a él con `Tab` y presiona `Enter`. Cuenta cuántas líneas de código necesitas para que se comporte como un botón real.
   - Una buena respuesta explica: la regla con tus propias palabras, y por qué un `button` real es mejor que un `div` con `role="button"`.
3. **¿Qué problemas de accesibilidad puede encontrar un test automatizado y cuáles necesitan a una persona?**
   - Busca: `automated accessibility testing limitations axe`
   - Pruébalo: en las DevTools de Chrome, abre el panel **Lighthouse** y ejecuta una auditoría de Accessibility en la página Practice. Anota tres resultados. Para cada uno, di si debe juzgarlo una herramienta o una persona.
   - Una buena respuesta explica: un problema que una herramienta encuentra con facilidad, como una etiqueta que falta, y un problema que no puede juzgar, como si una etiqueta es clara.

## Siguiente paso

En la próxima lección aprenderás los selectores CSS y el atributo `data-testid`, la otra forma de encontrar un elemento.
