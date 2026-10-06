---
title: Selectores CSS y data-testid
summary: Escribe selectores CSS, mira por qué los nombres de clase son una mala elección y sigue la convención data-testid del equipo.
duration: 80 min
---

## Empieza con un acertijo

La página de un refugio de perros tiene esta lista:

```html
<ul>
  <li class="dog">Rex</li>
  <li class="dog old">Bo</li>
  <li class="cat">Luna</li>
</ul>
```

Tres selectores van a buscar en esta página. ¿Cuántos elementos encuentra cada uno?

```text
.dog
.dog.old
.dog .old
```

Los dos últimos se diferencian solo por un espacio. Los números no son todos iguales.

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Predecir cuántos elementos encuentra un selector antes de ejecutarlo.
- Elegir un selector estable y explicar por qué una clase o una posición es frágil.
- Escribir un nombre `data-testid` que siga la regla del equipo.
- Comprobar un selector en la Console de las DevTools, y leer el error cuando es incorrecto.

## ¿Qué es un selector?

Un **selector** es un trozo corto de texto que describe qué elementos quieres en el DOM. El navegador y Playwright entienden los selectores CSS. CSS es el lenguaje que da estilo a una página, como colores y tamaños. Sus selectores también sirven para encontrar elementos.

Piensa en una escuela. Las frases "todos los estudiantes", "todos los estudiantes del grupo 5B" y "el estudiante con el número 17" son tres selectores distintos. Cada uno elige un grupo diferente de personas de la misma escuela.

## Los cuatro selectores básicos

Aquí hay un elemento de la lista del refugio:

```html
<li class="dog old" id="bo" data-age="old">Bo</li>
```

| Selector | Significado | Encuentra |
| --- | --- | --- |
| `li` | por etiqueta | cada `li` de la página |
| `.dog` | por clase | cada elemento con la clase `dog` |
| `#bo` | por id | el único elemento con `id="bo"` |
| `[data-age="old"]` | por atributo | cada elemento con `data-age="old"` |

Una clase empieza con un punto. Un id empieza con `#`. Un atributo va entre corchetes.

## Combinar selectores

Ahora puedes responder el acertijo. Escribe selectores sin espacio para decir "todos estos a la vez":

```text
li.dog
input[type="password"]
```

El primero encuentra un `li` que además tiene la clase `dog`. El segundo encuentra un `input` cuyo tipo es `password`. Entonces `.dog.old` significa "un elemento que tiene ambas clases". Encuentra solo a Bo. La respuesta para `.dog` es 2 (Rex y Bo).

Escribe un espacio para decir "dentro de":

```text
ul .dog
```

Esto significa: un elemento con la clase `dog` en alguna parte dentro de un `ul`. Entonces `.dog .old` significa "un elemento con la clase `old` que está dentro de un elemento con la clase `dog`". Bo tiene `old` él mismo, pero no está dentro de otro `dog`. Ningún elemento coincide. La tercera respuesta es 0.

### De vuelta al acertijo

Las respuestas son 2, 1 y 0. Un espacio, o no tenerlo, cambia el significado de "ambos a la vez" a "dentro de". En un test, un conteo incorrecto no siempre da un mensaje de error. Un selector con un error puede no encontrar nada, o encontrar demasiado, y nada te avisa.

## Dos símbolos más

Dos símbolos pequeños son comunes. El `>` significa "un hijo directo". El `+` significa "el siguiente hermano". Un hermano es un elemento con el mismo padre. Intenta predecir cuántos elementos encuentra cada uno de estos en la lista del refugio:

```text
.dog + .cat
li:not(.dog)
```

El primero encuentra a `Luna`, porque el gato viene justo después de un perro. El segundo también encuentra a `Luna`, porque `:not(.dog)` significa "sin la clase `dog`". Las dos respuestas son 1. Puedes probarlos en la Console.

## Por qué se rompen las clases

Los nombres de clase están ahí para dar estilo. Un diseñador puede renombrar o quitar una clase cualquier día, y la página funciona igual para la persona usuaria. El test se rompe. Imagina que el diseñador renombra `.dog` a `.pet-card`. El selector `.dog` no encuentra nada.

Hay un segundo problema: las clases se repiten. Un selector que encuentra muchos elementos no es seguro.

Un tercer problema está en las apps reales de este curso. Usan Tailwind, una herramienta que escribe el estilo en la propia clase. La clase del botón Sign in empieza así:

```html
<button class="group/button inline-flex shrink-0 items-center ..." data-slot="button"
        type="submit" data-testid="login-submit">Sign in</button>
```

Estas clases no son nombres de una funcionalidad. Son palabras de estilo como "inline flex" y "shrink-0". Cambian cuando alguien cambia el aspecto. El atributo `data-slot="button"` también es para el estilo. Está también en enlaces que parecen botones, así que no significa "este es un elemento `button`".

Los selectores basados en la posición son peores. Un selector como "el tercer `div` dentro del segundo `div`" se rompe cuando alguien agrega un elemento.

Un buen selector es estable. Cambia solo cuando cambia la funcionalidad, no cuando cambia el diseño.

## data-testid

El atributo **`data-testid`** existe solo para los tests. No tiene ningún efecto en el aspecto de la página. HTML permite cualquier nombre que empiece con `data-`.

```html
<button type="submit" data-testid="login-submit">Sign in</button>
```

El selector es:

```text
[data-testid="login-submit"]
```

Playwright tiene una forma corta de escribir esto. La aprenderás en el módulo de Playwright:

```ts
page.getByTestId("login-submit")
```

## La convención del equipo

El equipo sigue estas reglas:

- Cada elemento interactivo tiene un `data-testid`. Los botones, campos, enlaces, casillas y selects son interactivos.
- El nombre es `<funcionalidad>-<elemento>`. La funcionalidad va primero.
- Los nombres van en minúsculas, con las palabras separadas por guiones.

Ejemplos de la Practice app: `login-email`, `login-password`, `login-submit`, `cases-input`, `cases-add`, `report-load`.

Los elementos que se repiten, como las filas, llevan el id de la fila al final:

- `cases-delete-1` es el botón Delete del caso 1.
- `cases-toggle-3` es la casilla del caso 3.
- En la tienda de práctica, `products-row-5` es la fila del producto 5, y `products-delete-5` es su botón Delete.

El id viene de los datos, así que el nombre sigue a los datos y no a la posición en la pantalla.

## Prueba selectores en la consola

La **Console** de las DevTools te deja ejecutar una línea de JavaScript en la página. Dos comandos ayudan a probar selectores:

- `document.querySelector("...")` devuelve el primer elemento que coincide. Devuelve `null` si nada coincide.
- `document.querySelectorAll("...")` devuelve todos los elementos que coinciden, como una lista.

```text
> document.querySelector('[data-testid="login-submit"]')
<button data-slot="button" type="submit" data-testid="login-submit">Sign in</button>

> document.querySelectorAll("button").length
6
```

La página Practice tiene 6 elementos `button` cuando no existe ningún caso: el botón de idioma, el botón de tema, Sign in, Sign out (oculto hasta que inicias sesión), Add y Load report. Cada caso agrega un botón Delete.

Pon el selector completo entre comillas. Usa comillas simples por fuera cuando el selector tiene comillas dobles por dentro.

También hay un patrón para "empieza con". El operador `^=` coincide con el inicio del valor:

```text
document.querySelectorAll('[data-testid^="cases-delete-"]')
```

Esto encuentra cada botón Delete de la lista de casos, sin importar el id.

Cuando escribes un test, comprueba primero el selector. Si `querySelectorAll` da exactamente un elemento, el selector encuentra un elemento. Pero "uno hoy" no es "correcto para siempre". Pregunta también por qué coincide.

### Lee la documentación como un escáner

No necesitas leer una página de documentación completa. Escanéala buscando tres cosas. Primero, la **firma**: el nombre y la entrada, como `querySelector(selectors)`. Segundo, el **valor de retorno**: lo que recibes de vuelta. Tercero, los **casos límite**: qué pasa cuando algo sale mal.

Abre la página de MDN para `querySelector`. Encuentra las tres partes. Luego comprueba un caso límite con un experimento:

```text
> document.querySelector("###")
Uncaught SyntaxError: Failed to execute 'querySelector' on 'Document': '###' is not a valid selector.
```

Un selector válido que no encuentra nada da `null`. Un selector que no es válido es otra cosa: se detiene con un `SyntaxError`.

## Profundiza

### Por qué funciona así: un contrato entre dos personas

Una clase es parte del diseño. La dueña es la persona que diseña. Un `data-testid` es una promesa entre quien desarrolla y quien prueba: "este nombre se va a quedar, así que tu test puede confiar en él". El atributo no tiene otro trabajo. Por eso un test que lo usa se rompe solo cuando cambia la funcionalidad.

### Una idea equivocada común: "un id siempre es seguro"

Un `id` debe ser único, y un selector único suena perfecto. Pero algunas herramientas crean ids por sí solas, con nombres como `:r1:`. Pueden cambiar cuando la página recibe un elemento más antes. Un nombre estable que una persona eligió, y sobre el que hubo acuerdo, es mejor que un nombre hecho por una máquina.

La segunda idea equivocada es "una coincidencia significa un buen selector". Mira este selector en una página con exactamente un caso:

```text
[data-testid^="cases-delete-"]
```

Encuentra un elemento hoy. Encuentra dos cuando hay dos casos. El conteo es correcto solo para este momento. Un buen selector es exacto, como `cases-delete-2`, y sabes por qué coincide.

### Cómo aparece en el trabajo real de QA: nombres escritos muchas veces

Un test usa el texto `"cases-delete-2"`. Otro test también lo usa. Cuando el mismo texto aparece en veinte lugares, un cambio significa veinte ediciones. Esta es la idea llamada ***DRY*** (no te repitas), "Don't Repeat Yourself". La conociste en el módulo 1, y la estudiarás otra vez en el módulo 4 en "DRY en la automatización de tests". Un solo lugar guarda el conocimiento.

Puedes escribir la regla del nombre una vez, en una función:

```ts
function caseDelete(id: number): string {
  return `cases-delete-${id}`
}

console.log(caseDelete(3))
```

```text
cases-delete-3
```

En un test, entonces podrías escribir `page.getByTestId(caseDelete(2)).click()`.

Ten cuidado. DRY tiene un contrapeso: ***KISS*** (mantenlo simple), "Keep It Simple", y ***YAGNI*** ("You Aren't Gonna Need It": no construyas para necesidades que solo imaginas). Una función genérica como `testId(feature, element, id?, suffix?)` que puede construir cualquier nombre es demasiado. No la necesitas hoy. En los tests, una historia clara importa más que quitar cada repetición. `page.getByTestId("cases-delete-2")` en un test es fácil de leer. Un *helper* (función de ayuda) vale la pena cuando muchos tests usan el mismo nombre, o cuando el nombre sigue una regla, como aquí.

## Práctica

1. Abre `http://localhost:5180/#/practice`. Presiona `F12` y abre la pestaña **Console**.
2. Predice y luego ejecuta cada selector. Anota cuántos elementos encuentra, usando `.length`. Deberías ver 6, un número mayor que 6, 1 y 1. La página tiene 6 elementos `button`. El segundo número es mayor porque los enlaces de la barra superior y del menú lateral también llevan `data-slot="button"`:

```text
document.querySelectorAll("button").length
document.querySelectorAll('[data-slot="button"]').length
document.querySelectorAll('[data-testid="login-submit"]').length
document.querySelectorAll('input[type="password"]').length
```

3. Agrega tres casos en la sección 2: "One", "Two" y "Three".
4. Ejecuta esto y lee el resultado:

```text
document.querySelectorAll('[data-testid^="cases-delete-"]').length
```

5. Selecciona el botón Delete del segundo caso y haz clic en él desde la consola:

```text
document.querySelector('[data-testid="cases-delete-2"]').click()
```

6. Mira la lista. ¿Qué caso desapareció?
7. Prueba un selector que no existe, como `[data-testid="cases-delete-99"]`. Lee el resultado.
8. Ejecuta `document.querySelector("###")`. Lee el error. Compáralo con el paso 7.

## Reto

La página Practice tiene una lista de casos, y puedes marcarlos. Tu tarea es escribir selectores que elijan exactamente los elementos de abajo, usando solo un selector (sin contar en JavaScript, sin números de posición).

Primero agrega tres casos, "One", "Two" y "Three", y marca la casilla de "Two". Luego escribe un selector para cada una de estas metas:

1. Solo las casillas que **no** están marcadas.
2. Solo el botón Delete dentro de la fila marcada.
3. Solo la fila que viene **justo después** de la fila marcada.
4. Solo el texto del título de la fila marcada.

Crea el archivo `exercises/challenges/css-selectors.txt`. Escribe una línea por meta: el selector, el conteo que esperas y el conteo que obtuviste.

Está terminado cuando:

- Ejecutaste cada selector en la Console con `document.querySelectorAll("...").length` y anotaste el conteo real. Los conteos son 2, 1, 1 y 1.
- Ningún selector usa una clase, un número de id como `cases-delete-2`, o una posición como `nth-child`.
- Cada selector sigue funcionando si el caso marcado es "Three" en lugar de "Two" (marca otro y ejecútalos de nuevo; los conteos siguen correctos para ese nuevo estado).
- Debajo de las cuatro líneas, escribiste dos frases que explican en cuál de tus selectores confías menos, y por qué.

Vas a necesitar algo que esta lección no enseñó: una forma de seleccionar por un estado como marcado. Busca: `css :checked pseudo-class` y `css :not selector`. Para "la fila justo después", usa el selector `+` de más arriba en esta lección.

## Piénsalo bien

1. Hay dos casos en la página. Predice qué imprimen estas dos líneas, y di por qué.

```text
document.querySelectorAll('[data-testid="cases-delete"]').length
document.querySelectorAll('[data-testid^="cases-delete"]').length
```

<details>
<summary>Respuesta</summary>

La primera imprime `0`. El nombre `cases-delete` es exacto, y ningún elemento tiene exactamente este nombre. Los nombres reales son `cases-delete-1` y `cases-delete-2`. La segunda imprime `2`, porque `^=` significa "empieza con", y ambos nombres empiezan con `cases-delete`. Una diferencia pequeña en el símbolo cambia el significado de "es igual a" a "empieza con".

</details>

2. Se escribe un selector para la lista del refugio. Se ejecuta sin error y encuentra un elemento, pero es el equivocado. Encuentra el *bug* (error).

```html
<ul>
  <li class="dog">Rex</li>
  <li class="dog old">Bo</li>
</ul>
```

```text
.dog:first-child
```

La meta: el perro viejo.

<details>
<summary>Respuesta</summary>

El selector significa "el primer hijo que tiene la clase `dog`". Ese es Rex, no Bo. La meta necesitaba la clase `old`, o el atributo `data-age="old"`. El selector `.dog.old` encontraría a Bo. El error es que el selector depende de la posición. Si se agrega un perro nuevo arriba, el mismo selector da un perro distinto. Un selector que encuentra un elemento no es lo mismo que un selector que encuentra el elemento correcto.

</details>

3. Para el botón Delete del caso con id 2, ¿qué selector es mejor? A) `.cases li:nth-child(2) button` B) `[data-testid="cases-delete-2"]`. Di qué te haría elegir el otro.

<details>
<summary>Respuesta</summary>

B es mejor. En A, el número 2 es una posición. Si se borra el primer caso, o el filtro oculta un caso, el segundo `li` es un caso distinto. En B, el número 2 es el id del caso, y no se mueve. A puede ser correcto cuando la pregunta real es "la segunda fila en la pantalla", por ejemplo en un test de ordenamiento. La elección depende de si te importan los datos o el lugar.

</details>

4. El equipo decide cambiar cada `data-testid` del estilo `login-submit` a camelCase, como `loginSubmit`. ¿Qué se rompe y qué muestra esto sobre el nombre?

<details>
<summary>Respuesta</summary>

Se rompe cada test que usa los nombres viejos, y nada en la página se ve distinto. El nombre es una promesa entre quien desarrolla y quien prueba, así que cambiarlo rompe la promesa. También muestra por qué el equipo fija pronto las reglas de los nombres, y por qué los tests usan un solo lugar para los nombres que se repiten. Un cambio de nombre no es incorrecto, pero debe ser una decisión del equipo y un cambio en todos los lugares a la vez.

</details>

5. Explica a un compañero por qué una clase como `.button` es una mala opción para un test. Usa tres frases. No uses la palabra "diseño".

<details>
<summary>Respuesta</summary>

Una buena respuesta podría ser: "Una clase está ahí para que la página se vea bien, y alguien puede cambiarla cualquier día sin cambiar lo que hace la página. Muchos elementos pueden compartir la misma clase, así que el selector puede encontrar demasiado. Un `data-testid` no tiene otro propósito, así que cambia solo cuando cambia la funcionalidad." El razonamiento tiene dos partes: la clase cambia por razones que no tienen relación, y la clase no es única.

</details>

6. Una página todavía no tiene ningún caso. ¿Qué devuelve `document.querySelector('[data-testid="cases-item"]')`? ¿Y qué hace esta línea: `document.querySelector('[data-testid="cases-item"]').click()`?

<details>
<summary>Respuesta</summary>

La primera línea devuelve `null`, porque nada coincide. La segunda línea se detiene con un error como `Cannot read properties of null (reading 'click')`. La lista vacía es un caso límite. `querySelector` no da un error cuando no encuentra nada. El error llega un paso después, cuando el código usa el `null` como si fuera un elemento. Cuando un script se rompe así, pregunta primero: ¿el selector encontró algo?

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es la especificidad de CSS y por qué una regla gana sobre otra?**
   - Busca: `CSS specificity MDN`
   - Pruébalo: en un archivo HTML pequeño, escribe una regla con `p` y otra con `.note`, ambas definiendo el color. Dale a un párrafo la clase `note`. ¿Qué color gana? Luego agrega `#top` al párrafo y una regla para él. Mira el panel Styles para ver las reglas tachadas.
   - Una buena respuesta explica: cómo se ordenan los selectores de id, de clase y de etiqueta, con un ejemplo pequeño.
2. **¿Cuál es la diferencia entre un selector descendiente (un espacio) y un selector de hijo (`>`)?**
   - Busca: `CSS combinators descendant child selector`
   - Pruébalo: en un archivo HTML pequeño, pon un `ul` con un `ul` anidado. Cuenta en la Console los elementos `li` que encuentran `ul li` y `ul > li`.
   - Una buena respuesta explica: ambas formas con un ejemplo HTML pequeño, y qué elementos encuentra cada una.
3. **¿Por qué la documentación de Playwright recomienda los locators orientados a la persona usuaria en lugar de los selectores CSS, y cuándo los equipos siguen usando `data-testid`?**
   - Busca: `playwright best practices locators`
   - Pruébalo: en la página Practice, encuentra el botón Sign in de tres formas en la Console: por `data-testid`, por su texto con `[...document.querySelectorAll("button")].find((b) => b.textContent === "Sign in")`, y por `button[type="submit"]`. Cambia el texto del botón en el panel Elements. ¿Qué formas siguen funcionando?
   - Una buena respuesta explica: la razón del consejo, y una situación donde un test id es la mejor opción.

## Siguiente paso

En la próxima lección harás un recorrido completo por las DevTools: los paneles Elements, Console y Network.
