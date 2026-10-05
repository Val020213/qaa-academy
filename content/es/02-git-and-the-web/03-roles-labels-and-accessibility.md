---
title: Roles, etiquetas y accesibilidad
summary: Aprende que cada elemento tiene un rol y un nombre accesible, y cómo Playwright los usa para encontrar elementos.
duration: 40 min
---

## Objetivo

- Explicar qué es un rol y nombrar cinco roles comunes.
- Explicar qué es un nombre accesible.
- Conectar una etiqueta (*label*) con un input.
- Explicar por qué los roles y los nombres importan para las pruebas.

## Dos formas de encontrar un elemento

Una persona encuentra el botón "Sign in" mirando la página. Ve un botón con el texto "Sign in".

Un lector de pantalla es una herramienta que lee la página en voz alta para personas que no pueden ver. No puede mirar la página. Le hace dos preguntas al navegador sobre cada elemento: ¿qué es? y ¿cómo se llama?

Las respuestas son el **rol** y el **nombre accesible**. Playwright hace las mismas dos preguntas.

## Roles

Un **rol** dice qué tipo de cosa es un elemento. El navegador le da un rol a la mayoría de los elementos HTML de forma automática. Tú no lo escribes.

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

Los roles son más útiles que los nombres de las etiquetas. Un tester dice "el botón Sign in", no "la etiqueta button".

> **Nota:** El campo de contraseña, `<input type="password">`, es un caso especial. El estándar HTML no le da ningún rol, y Chrome y Edge pueden mostrarlo de forma distinta. Un `div` o un `span` no tiene un rol útil. Un tester no puede encontrar ese tipo de elemento por rol.

## El nombre accesible

El **nombre accesible** es el texto que identifica un elemento. En un botón, suele ser su texto. En un enlace, es su texto.

```html
<button type="button" data-testid="report-load">Load report</button>
```

Este elemento es un botón con el nombre "Load report" (Cargar reporte).

En un campo, el nombre suele venir de su etiqueta.

## Etiquetas para los inputs

Una **etiqueta** (*label*) es el texto que dice para qué sirve un input. Una buena etiqueta hace dos cosas: los usuarios la ven y el navegador la une al input.

La Practice app envuelve cada input dentro de su etiqueta:

```html
<label>Email
  <input type="email" name="email" autocomplete="off" data-testid="login-email" />
</label>
```

Como el `input` está dentro del `label`, el navegador los une. El input tiene el rol textbox y el nombre "Email".

Otra forma es usar los atributos `for` e `id`. El valor de `for` debe coincidir con el `id` del input:

```html
<label for="email">Email</label>
<input id="email" type="email" />
```

Un placeholder no es una etiqueta. Un **placeholder** (texto de ayuda) es un texto gris dentro de un input vacío. Desaparece cuando escribes. No lo uses como único nombre de un campo.

## Por qué importa para las pruebas

Cuando un campo no tiene etiqueta, quien usa un lector de pantalla oye solo "edit text". No sabe qué escribir. Es un bug de accesibilidad. Además, un test no puede encontrar el campo por su etiqueta.

Una buena página HTML es más fácil de usar y más fácil de probar. Playwright tiene buscadores que usan roles y nombres. Los usarás en el módulo de Playwright:

```ts
page.getByRole("button", { name: "Sign in" })
page.getByLabel("Email")
```

La primera línea significa: busca el botón llamado "Sign in". La segunda significa: busca el input cuya etiqueta es "Email". Estas líneas son solo un adelanto. No las ejecutes ahora.

Un buscador como `getByRole` prueba lo que ve el usuario. Si un desarrollador quita la etiqueta, el test falla y señala un problema real.

Convención del equipo: el equipo también pone un `data-testid` en cada elemento interactivo. Lo verás en la próxima lección. Los roles y `data-testid` trabajan juntos.

## Roles que no son automáticos

A veces un desarrollador escribe un rol a mano con el atributo `role`. La Practice app lo hace en el mensaje de error:

```html
<p class="message message-error" role="alert" data-testid="login-error" hidden></p>
```

Un `p` normalmente no tiene un rol especial. `role="alert"` les dice a las herramientas de apoyo: "este mensaje es importante, léelo ahora". Es una buena forma de mostrar un error.

## Profundiza

### Por qué funciona así: un segundo árbol

El navegador construye el DOM a partir del HTML. Del DOM construye otro árbol para las herramientas de apoyo. Es el **árbol de accesibilidad**. Guarda solo lo que importa a un usuario que no puede ver: el rol, el nombre y el estado de cada elemento, como marcado o deshabilitado. Un `div` que solo sirve para el diseño se deja fuera.

El panel Accessibility (Accesibilidad) de las DevTools muestra este árbol. Los buscadores de Playwright como `getByRole` usan la misma idea. El rol y el nombre se calculan a partir del HTML. Nadie los escribe en un test.

### Una idea equivocada común: "puedo añadir `role=button` a un `div`"

Puedes. Un buscador verá entonces un botón. Pero un `button` real hace más:

```html
<div role="button">Sign in</div>
<button type="button">Sign in</button>
```

Al `button` real se llega con la tecla `Tab`, y funciona con `Enter` y `Space`. El `div` no hace nada de esto, a menos que un desarrollador escriba código extra. Un rol solo cambia lo que se les dice a las herramientas. No cambia cómo funciona el elemento. Una buena regla es: usa primero el elemento HTML real.

### Un equilibrio: rol y nombre, o `data-testid`

Un buscador por rol y nombre prueba lo que ve el usuario. También tiene un costo, porque el nombre es texto:

```ts
await page.getByRole("button", { name: "Sign in" }).click()
await page.getByTestId("login-submit").click()
```

Si el texto del botón cambia a "Log in", la primera línea falla. Si el sitio recibe otro idioma, vuelve a fallar. La segunda línea sigue funcionando, porque `data-testid` no cambia con el texto.

Por eso el equipo pone `data-testid` en cada elemento interactivo y usa `getByTestId` como la forma normal de encontrarlo. Un buscador por rol es buena opción cuando el nombre es lo que quieres comprobar. Por ejemplo, puedes comprobar que un campo tiene la etiqueta correcta, porque un test con `getByLabel("Email")` falla cuando se quita la etiqueta.

Por defecto, un nombre coincide con una parte del texto y no distingue mayúsculas de minúsculas. Así, `{ name: "sign" }` también encuentra "Sign in". Esto puede encontrar demasiados elementos. Aprenderás a ser exacto en el módulo 3.

## Práctica

1. Asegúrate de que `pnpm dev` esté en ejecución. Abre `http://localhost:5180/#/practice` en Chrome o Edge.
2. Pulsa `F12`. En la pestaña Elements, haz clic derecho en el botón **Sign in** de la página y elige **Inspect** (Inspeccionar).
3. Busca el panel **Accessibility**. Está en el lado derecho de la pestaña Elements y puede estar detrás de un menú `>>`. Ábrelo.
4. Lee el **Name** (nombre) y el **Role** (rol) del botón. Deberías ver "Sign in" y "button".
5. Haz lo mismo con el campo Email. ¿Cuáles son su nombre y su rol?
6. Haz lo mismo con el campo Password. ¿Qué rol ves? Puede ser distinto del de Email, o estar vacío.
7. Inspecciona la casilla de un caso de prueba. Antes, añade un caso en la sección 2. ¿Cuál es su nombre?
8. Escribe una lista corta: cinco elementos de la página, con rol y nombre.

## Comprueba lo que sabes

1. ¿Cuáles son las dos preguntas que hace un lector de pantalla sobre un elemento?

<details><summary>Respuesta</summary>

Qué es (el rol) y cómo se llama (el nombre accesible).

</details>

2. ¿Qué rol tiene `<input type="email">`?

<details><summary>Respuesta</summary>

Textbox.

</details>

3. ¿Cómo une el navegador una etiqueta con un input?

<details><summary>Respuesta</summary>

O el input está dentro de la etiqueta, o la etiqueta tiene un valor `for` que coincide con el `id` del input.

</details>

4. ¿Por qué un placeholder no es una buena etiqueta?

<details><summary>Respuesta</summary>

Desaparece cuando el usuario escribe y puede no ser un nombre confiable para las herramientas de apoyo.

</details>

5. Este campo tiene un bug para los usuarios de un lector de pantalla. Encuéntralo.

```html
<input type="email" placeholder="Email" data-testid="login-email" />
```

<details>
<summary>Respuesta</summary>

El campo no tiene etiqueta. El placeholder desaparece cuando el usuario escribe, y es solo una pista. Quien usa un lector de pantalla puede oír solo "edit text". La solución es añadir una etiqueta, por ejemplo `<label>Email <input ... /></label>`. Entonces `getByLabel("Email")` también puede encontrarlo.

</details>

6. ¿Qué versión es mejor y por qué? A) `<label>Email</label><input id="email" />` B) `<label for="email">Email</label><input id="email" />`

<details>
<summary>Respuesta</summary>

B es mejor. El valor de `for` coincide con el `id`, así que el navegador une la etiqueta con el input. Un clic en el texto de la etiqueta mueve el cursor al input, y el input recibe el nombre "Email". En A, la etiqueta y el input son solo dos elementos uno al lado del otro, y nada los une.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es el árbol de accesibilidad y en qué se diferencia del DOM?**
   - Busca: `accessibility tree MDN`
   - Una buena respuesta explica: qué contiene el árbol, quién lo usa y un ejemplo de un elemento que aparece en el DOM pero no en este árbol.
2. **¿Cuál es la primera regla de ARIA?**
   - Busca: `first rule of ARIA use native HTML`
   - Una buena respuesta explica: la regla con tus propias palabras y por qué un `button` real es mejor que un `div` con `role="button"`.
3. **¿Qué problemas de accesibilidad puede encontrar un test automatizado y cuáles necesitan a una persona?**
   - Busca: `automated accessibility testing limitations axe`
   - Una buena respuesta explica: un problema que una herramienta encuentra con facilidad, como una etiqueta que falta, y uno que no puede juzgar, como si una etiqueta es clara.

## Siguiente paso

En la próxima lección aprendes los selectores CSS y el atributo `data-testid`, la otra forma de encontrar un elemento.
