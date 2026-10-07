---
title: Selectores CSS y data-testid
duration: 55 min
---

## Objetivo

En esta lección eliges elementos del DOM con selectores CSS y compruebas sus coincidencias en la consola del navegador.

- Combinar selectores por etiqueta, clase, id y atributo.
- Distinguir elementos descendientes, hijos directos y hermanos.
- Escribir nombres `data-testid` según la convención del equipo.
- Comprobar cuántos elementos encuentra un selector y distinguir una búsqueda sin resultados de un error de sintaxis.

## Los cuatro selectores básicos

Un **selector CSS** describe qué elementos del DOM quieres encontrar. El navegador compara sus condiciones con las etiquetas, los atributos y las relaciones entre elementos.

Este elemento tiene una etiqueta, dos clases, un id y un atributo:

```html
<li class="dog old" id="bo" data-age="old">Bo</li>
```

| Selector | Significado | Encuentra |
| --- | --- | --- |
| `li` | por etiqueta | cada `li` de la página |
| `.dog` | por clase | cada elemento con la clase `dog` |
| `#bo` | por id | cada elemento con `id="bo"` (el id debe ser único) |
| `[data-age="old"]` | por atributo | cada elemento con `data-age="old"` |

Una clase empieza con un punto. Un id empieza con `#`. Un atributo va entre corchetes.

## Combinar selectores

Usaremos esta lista para comparar las coincidencias:

```html
<ul>
  <li class="dog">Rex</li>
  <li class="dog old">Bo</li>
  <li class="cat">Luna</li>
</ul>
```

Sin espacio, las condiciones se aplican al mismo elemento:

```text
li.dog
input[type="password"]
```

El primero encuentra un `li` que también tiene la clase `dog`. El segundo encuentra un `input` cuyo tipo es `password`.

Un espacio indica que el elemento está dentro de otro, a cualquier profundidad:

```text
ul .dog
```

Encuentra los elementos con la clase `dog` dentro de un `ul`. Compara estas tres formas:

```text
.dog
.dog.old
.dog .old
```

`.dog` encuentra a Rex y Bo: dos elementos. `.dog.old` encuentra solo a Bo, que tiene ambas clases. `.dog .old` no encuentra ninguno: Bo tiene ambas clases, pero no está dentro de otro elemento con la clase `dog`.

![Bo coincide con .dog.old; .dog .old no coincide porque exige un descendiente.](/images/02-selector-matches.es.svg)

## Hijos, hermanos y exclusiones

`>` selecciona un hijo directo, un nivel por debajo del padre. El espacio permite cualquier profundidad. `+` selecciona el elemento que viene inmediatamente después de otro y tiene el mismo padre.

```text
.dog + .cat
li:not(.dog)
```

El primero encuentra a `Luna`, porque ese elemento con la clase `cat` viene justo después de uno con la clase `dog`. El segundo también encuentra a `Luna`: `:not(.dog)` excluye los elementos con la clase `dog`.

## Clases y posiciones en un selector

Las clases se usan para dar estilo. Si el equipo renombra `.dog` a `.pet-card`, el selector `.dog` deja de encontrar elementos aunque la funcionalidad siga igual.

Las clases también se repiten. Si quieres un solo control, comprueba que el selector encuentre uno; para contar una lista necesitas varias coincidencias.

Las apps del curso usan Tailwind. Sus clases expresan reglas de estilo, como en el botón Sign in:

```html
<button class="group/button inline-flex shrink-0 items-center ..." data-slot="button"
        type="submit" data-testid="login-submit">Sign in</button>
```

Estas clases pueden cambiar al cambiar el aspecto. El atributo `data-slot="button"` también está en enlaces que parecen botones, así que no identifica una etiqueta `button`.

Un selector basado en la posición puede elegir otro elemento si alguien agrega una fila antes. Por ejemplo, "el tercer `div` dentro del segundo `div`" depende de esa estructura.

Elige atributos que el equipo mantenga estables cuando cambia el diseño. Si el equipo los renombra, tendrás que actualizar el selector.

## data-testid y la convención del equipo

El equipo usa **`data-testid`** para identificar elementos en los tests. Por sí solo no cambia el aspecto, aunque CSS puede seleccionarlo. Es un atributo de datos de HTML: después de `data-` va un nombre válido, no vacío y sin mayúsculas ASCII.

```html
<button type="submit" data-testid="login-submit">Sign in</button>
```

Se busca por su atributo:

```text
[data-testid="login-submit"]
```

Un `data-testid` es una promesa entre quien desarrolla y quien prueba: "este nombre se va a quedar, así que tu test puede confiar en él". Renombrar ese atributo rompe el selector aunque la funcionalidad siga igual; el equipo debe conservar el acuerdo.

El equipo sigue estas reglas:

- Cada elemento interactivo tiene un `data-testid`: botones, campos, enlaces, casillas y selects.
- El nombre empieza por la funcionalidad y termina con el elemento.
- Los nombres van en minúsculas, con las palabras separadas por guiones.

Ejemplos de la Practice app: `login-email`, `login-password`, `login-submit`, `cases-input`, `cases-add`, `report-load`.

Los controles de un caso y las filas de productos llevan el id del dato al final. Las filas de casos comparten `cases-item`, y sus títulos comparten `cases-item-title`:

- `cases-delete-1` es el botón Delete del caso 1.
- `cases-toggle-3` es la casilla del caso 3.
- En la tienda de práctica, `products-row-5` es la fila del producto 5, y `products-delete-5` es su botón Delete.

El id viene de los datos, así que el nombre sigue al caso o producto aunque cambie su posición en la pantalla.

## Prueba selectores en la consola

En la **Console** de las DevTools puedes ejecutar JavaScript sobre el DOM de la página. La salida del botón de abajo omite sus atributos de estilo:

- `document.querySelector("...")` devuelve el primer elemento que coincide, o `null` si no hay coincidencias.
- `document.querySelectorAll("...")` devuelve una lista de todos los elementos que coinciden.

```text
> document.querySelector('[data-testid="login-submit"]')
<button data-slot="button" type="submit" data-testid="login-submit">Sign in</button>

> document.querySelectorAll("button").length
6
```

La página Practice tiene 6 elementos `button` cuando no existe ningún caso: el botón de idioma, el botón de tema, Sign in, Sign out (oculto hasta que inicias sesión), Add y Load report. Cada caso agrega un botón Delete.

Pon el selector completo entre comillas. Usa comillas simples por fuera cuando el selector tiene comillas dobles por dentro.

El operador `^=` busca valores que empiezan con el texto indicado:

```text
document.querySelectorAll('[data-testid^="cases-delete-"]')
```

Encuentra todos los botones Delete de la lista de casos, sin importar el id.

### Sintaxis válida y búsquedas sin resultados

Un selector válido puede encontrar cero elementos. Si la sintaxis es inválida, el navegador lanza un error:

```text
> document.querySelector("###")
Uncaught SyntaxError: Failed to execute 'querySelector' on 'Document': '###' is not a valid selector.
```

Consulta la [documentación de MDN sobre `querySelector`](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector). Busca su entrada, su valor de retorno y sus excepciones: una búsqueda sin coincidencias devuelve `null`; un selector inválido lanza un `SyntaxError`.

## Profundiza

### Los ids generados pueden cambiar

Un `id` debe ser único. Algunas herramientas generan ids, por ejemplo con un contador que cambia al insertar un elemento antes. Un nombre como `:r1:` es ilustrativo: su estabilidad depende de cómo se genera, no de su aspecto. Elige un atributo cuyo valor el equipo mantenga estable.

### Una coincidencia depende de los datos presentes

Este selector encuentra un elemento cuando hay un caso y dos cuando hay dos casos:

```text
[data-testid^="cases-delete-"]
```

El conteo es correcto solo para este momento. Para elegir un caso concreto, usa su id, como `cases-delete-2`. Para contar todos sus botones Delete, el prefijo es adecuado.

## Práctica

1. Abre `http://localhost:5180/#/practice` y recarga para empezar sin casos y con el siguiente id en 1. Presiona `F12` y abre la pestaña **Console**.
2. Ejecuta cada selector y anota cuántos elementos encuentra. Deberías ver 6, un número mayor que 6, 1 y 1. El segundo número incluye enlaces de la barra superior y del menú lateral con `data-slot="button"`:

```text
document.querySelectorAll("button").length
document.querySelectorAll('[data-slot="button"]').length
document.querySelectorAll('[data-testid="login-submit"]').length
document.querySelectorAll('input[type="password"]').length
```

3. Agrega tres casos en la sección 2: "One", "Two" y "Three".
4. Ejecuta esto y comprueba el número de botones Delete:

```text
document.querySelectorAll('[data-testid^="cases-delete-"]').length
```

5. Selecciona el botón Delete del segundo caso, haz clic en él desde la consola y comprueba que desapareció "Two":

```text
document.querySelector('[data-testid="cases-delete-2"]').click()
```

6. Prueba un selector que no existe, como `[data-testid="cases-delete-99"]`. Lee el resultado.
7. Ejecuta `document.querySelector("###")`. Compara el error con el resultado del paso 6.

## Reto

Recarga la página Practice. Agrega tres casos, "One", "Two" y "Three", y marca solo la casilla de "Two". Escribe un selector para cada objetivo:

1. Las casillas que no están marcadas.
2. El botón Delete dentro de la fila marcada.
3. La fila que viene justo después de la fila marcada.
4. El texto del título de la fila marcada.

Crea el archivo `exercises/challenges/css-selectors.txt`. Escribe una línea por objetivo: el selector, el conteo que esperas y el conteo que obtuviste.

Está terminado cuando:

- Ejecutaste cada selector en la Console con `document.querySelectorAll("...").length` y anotaste el conteo real. Los conteos son 2, 1, 1 y 1.
- Ningún selector usa una clase, un número de id como `cases-delete-2`, o una posición como `nth-child`.
- Cada selector sigue funcionando si el caso marcado es "Three" en lugar de "Two" (desmarca "Two", marca "Three" y ejecútalos de nuevo; los conteos son 2, 1, 0 y 1 porque la última fila no tiene una siguiente).

Vas a necesitar algo que esta lección no enseñó: una forma de seleccionar por un estado como marcado. Busca: `css :checked pseudo-class`, `css :not selector` y `css :has selector` para elegir la fila que contiene la casilla marcada. Para "la fila justo después", usa el selector `+` de más arriba en esta lección.

## Piénsalo bien

1. Hay dos casos en la página. ¿Qué imprimen estas líneas y por qué?

```text
document.querySelectorAll('[data-testid="cases-delete"]').length
document.querySelectorAll('[data-testid^="cases-delete"]').length
```

<details>
<summary>Respuesta</summary>

La primera imprime `0`: ningún elemento tiene exactamente el nombre `cases-delete`. La segunda imprime `2`, porque los nombres `cases-delete-1` y `cases-delete-2` empiezan con `cases-delete`.

</details>

2. En una página hipotética cuyo contenedor tiene la clase `cases`, un test busca el botón Delete del caso con id 2. ¿Qué se rompe al borrar el primer caso si usa `.cases li:nth-child(2) button` en lugar de `[data-testid="cases-delete-2"]`?

<details>
<summary>Respuesta</summary>

La posición del segundo `li` cambia al borrar la primera fila, así que el selector puede elegir otro caso o no encontrar ninguno. El nombre `cases-delete-2` sigue al id del dato. Un selector por posición sí puede servir para comprobar qué caso ocupa la segunda fila después de ordenar.

</details>

3. La página no tiene casos. ¿Qué devuelve `document.querySelector('[data-testid="cases-item"]')` y qué ocurre con `document.querySelector('[data-testid="cases-item"]').click()`?

<details>
<summary>Respuesta</summary>

La búsqueda devuelve `null`. La llamada al método de clic falla con un error como `Cannot read properties of null (reading 'click')`, porque intenta usar `null` como si fuera un elemento.

</details>

## Siguiente paso

En la próxima lección harás un recorrido completo por las DevTools: los paneles Elements, Console y Network.
