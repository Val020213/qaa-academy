---
title: Selectores CSS y data-testid
summary: Escribe selectores CSS simples, entiende por qué los nombres de clase rompen los tests y usa la convención data-testid del equipo.
duration: 45 min
---

## Objetivo

- Leer y escribir selectores de etiqueta, clase, id y atributo.
- Explicar por qué las clases CSS hacen selectores frágiles para los tests.
- Seguir la regla del equipo para los nombres de `data-testid`.
- Probar un selector en la consola de las DevTools.

## ¿Qué es un selector?

Un **selector** es un texto corto que describe qué elementos quieres del DOM. El navegador y Playwright entienden los selectores CSS. CSS es el lenguaje que da estilo a una página, como los colores y los tamaños. Sus selectores también se usan para encontrar elementos.

## Los cuatro selectores básicos

Aquí tienes un elemento de la Practice app (app de práctica):

```html
<button type="submit" class="button" data-testid="login-submit">Sign in</button>
```

| Selector | Significado | Coincide con |
| --- | --- | --- |
| `button` | por etiqueta | todos los `button` de la página |
| `.button` | por clase | todos los elementos con la clase `button` |
| `#login` | por id | el único elemento con `id="login"` |
| `[type="submit"]` | por atributo | todos los elementos con `type="submit"` |

Una clase empieza con un punto. Un id empieza con `#`. Un atributo va entre corchetes.

> **Nota:** La Practice app no tiene atributos `id`. El selector `#` se muestra aquí solo para que lo reconozcas.

## Combinar selectores

Escribe selectores sin espacio para decir "todos estos a la vez":

```text
button.button
input[type="password"]
```

El primero coincide con un `button` que además tiene la clase `button`. El segundo coincide con un `input` cuyo tipo es `password`.

Escribe un espacio para decir "dentro de":

```text
[data-testid="login-form"] button
```

Esto significa: un `button` en algún lugar dentro del elemento con `data-testid="login-form"`. Usa la anidación que aprendiste antes.

## Por qué las clases rompen los tests

Los nombres de clase de la Practice app están ahí para el estilo. `class="button"` hace que el botón se vea como un botón. Un diseñador puede renombrar o quitar una clase cualquier día, y la página funciona igual para el usuario. El test se rompe.

Hay un segundo problema: las clases se repiten. En la Practice app, el selector `.button` coincide con el botón Sign in, el botón Add y el botón Load report. Un selector que coincide con muchos elementos no es seguro para un test.

Los selectores basados en la posición son peores. Un selector como "el tercer `div` dentro del segundo `div`" se rompe cuando alguien añade un elemento.

Un buen selector de test es estable. Cambia solo cuando cambia la funcionalidad, no cuando cambia el diseño.

## data-testid

El atributo **`data-testid`** existe solo para los tests. No tiene efecto en cómo se ve la página. HTML permite cualquier nombre que empiece con `data-`.

```html
<button type="submit" class="button" data-testid="login-submit">Sign in</button>
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

- Cada elemento interactivo tiene un `data-testid`. Los botones, inputs, enlaces, casillas y selects son interactivos.
- El nombre es `<feature>-<element>` (funcionalidad y elemento). La funcionalidad va primero.
- Los nombres van en minúsculas, con las palabras separadas por guiones.

Ejemplos de la Practice app: `login-email`, `login-password`, `login-submit`, `cases-input`, `cases-add`, `report-load`.

Los elementos que se repiten, como las filas, incluyen al final el id de la fila:

- `cases-delete-1` es el botón Delete del caso 1.
- `cases-toggle-3` es la casilla del caso 3.
- En la tienda de práctica, `products-row-5` es la fila del producto 5, y `products-delete-5` es su botón Delete.

El id viene de los datos, así que un test puede encontrar la fila que creó.

## Prueba selectores en la consola

La **Console** (consola) de las DevTools te deja ejecutar una línea de JavaScript en la página. Dos comandos te ayudan a probar selectores:

- `document.querySelector("...")` devuelve el primer elemento que coincide. Devuelve `null` si nada coincide.
- `document.querySelectorAll("...")` devuelve todos los elementos que coinciden, como una lista.

```text
> document.querySelector('[data-testid="login-submit"]')
<button type="submit" class="button" data-testid="login-submit">Sign in</button>

> document.querySelectorAll(".button").length
3
```

Pon todo el selector entre comillas. Usa comillas simples por fuera cuando el selector tenga comillas dobles por dentro.

También hay un patrón para "empieza con". El operador `^=` coincide con el inicio del valor:

```text
document.querySelectorAll('[data-testid^="cases-delete-"]')
```

Esto encuentra todos los botones Delete de la lista de casos, sin importar el id.

Cuando escribas un test, comprueba primero el selector. Si `querySelectorAll` da exactamente un elemento, el selector es seguro. El número de coincidencias es la respuesta.

## Profundiza

### Por qué funciona así: un contrato entre dos personas

Una clase es parte del diseño. El diseñador es su dueño. Un `data-testid` es una promesa entre el desarrollador y el tester: "este nombre se quedará, así que tu test puede confiar en él". El atributo no tiene otro trabajo. Por eso un test que lo usa se rompe solo cuando cambia la funcionalidad.

### Una idea equivocada común: "un id siempre es seguro"

Un `id` debe ser único, y un selector único parece perfecto. Pero algunas herramientas crean ids por su cuenta, con nombres como `:r1:`. Pueden cambiar cuando la página recibe un elemento más antes de ellos. Un nombre estable que una persona eligió, y acordó, es mejor que un nombre que hizo una máquina.

La segunda idea equivocada es "una coincidencia significa un buen selector". Mira este selector en una página con exactamente un caso:

```text
[data-testid^="cases-delete-"]
```

Hoy coincide con un elemento. Coincide con dos cuando hay dos casos. El conteo es correcto solo para este momento. Un buen selector es exacto, como `cases-delete-2`, y sabes por qué coincide.

### Cómo aparece en el trabajo real de QA: nombres escritos muchas veces

Un test usa el string `"cases-delete-2"`. Otro test también lo usa. Cuando el mismo string aparece en veinte lugares, un cambio significa veinte ediciones. Esta es la idea llamada **DRY** (*Don't Repeat Yourself*, no te repitas). La conociste en el módulo 1 y la estudiarás otra vez en el módulo 4, en "DRY en la automatización de tests". Un solo lugar guarda el conocimiento.

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

En un test, podrías escribir entonces `page.getByTestId(caseDelete(2)).click()`.

Ten cuidado. En los tests, una historia clara importa más que quitar todas las repeticiones. `page.getByTestId("cases-delete-2")` en un test es fácil de leer. Un *helper* (función de ayuda) vale la pena cuando muchos tests usan el mismo nombre, o cuando el nombre tiene una regla, como aquí.

## Práctica

1. Abre `http://localhost:5180/#/practice`. Pulsa `F12` y abre la pestaña **Console**.
2. Ejecuta cada selector. Anota cuántos elementos coinciden, usando `.length`. Deberías ver 6, 3, 1 y 1. La página tiene 6 botones, pero solo 3 tienen la clase `button`. El botón Sign out está oculto y tiene otra clase. Los botones de idioma y de tema de la barra superior también tienen su propia clase:

```text
document.querySelectorAll("button").length
document.querySelectorAll(".button").length
document.querySelectorAll('[data-testid="login-submit"]').length
document.querySelectorAll('input[type="password"]').length
```

3. Añade tres casos en la sección 2: "One", "Two" y "Three".
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

## Comprueba lo que sabes

1. ¿Por qué `.button` es un mal selector para un test?

<details><summary>Respuesta</summary>

Las clases son para el estilo, así que cambian a menudo. Además se repiten, así que el selector puede coincidir con muchos elementos.

</details>

2. ¿Qué significa `[data-testid="login-form"] button`?

<details><summary>Respuesta</summary>

Un elemento `button` en cualquier lugar dentro del elemento con `data-testid="login-form"`.

</details>

3. ¿Cuál es la regla del equipo para los nombres de `data-testid`?

<details><summary>Respuesta</summary>

`<feature>-<element>`, en minúsculas y con guiones. Los elementos que se repiten terminan con el id de la fila, por ejemplo `cases-delete-3`.

</details>

4. ¿Qué devuelve `document.querySelector` cuando nada coincide?

<details><summary>Respuesta</summary>

`null`.

</details>

5. Hay dos casos en la página. ¿Qué imprimen estas dos líneas y por qué?

```text
document.querySelectorAll('[data-testid="cases-delete"]').length
document.querySelectorAll('[data-testid^="cases-delete"]').length
```

<details>
<summary>Respuesta</summary>

La primera imprime `0`. El nombre `cases-delete` es exacto, y ningún elemento tiene exactamente ese nombre. Los nombres reales son `cases-delete-1` y `cases-delete-2`. La segunda imprime `2`, porque `^=` significa "empieza con", y ambos nombres empiezan con `cases-delete`.

</details>

6. ¿Qué selector es mejor para el botón Delete del caso con id 2? A) `.cases li:nth-child(2) button` B) `[data-testid="cases-delete-2"]`

<details>
<summary>Respuesta</summary>

B es mejor. En A, el número 2 es una posición. Si se borra el primer caso, o el filtro oculta un caso, el segundo `li` es otro caso. En B, el número 2 es el id del caso, y no se mueve. B también dice con claridad qué encuentra.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es la especificidad en CSS y por qué una regla gana sobre otra?**
   - Busca: `CSS specificity MDN`
   - Una buena respuesta explica: cómo se ordenan los selectores de id, clase y etiqueta, con un ejemplo pequeño.
2. **¿Cuál es la diferencia entre un selector descendiente (un espacio) y un selector hijo (`>`)?**
   - Busca: `CSS combinators descendant child selector`
   - Una buena respuesta explica: ambas formas con un ejemplo pequeño de HTML y con qué elementos coincide cada una.
3. **¿Por qué la documentación de Playwright recomienda locators orientados al usuario en lugar de selectores CSS y cuándo los equipos aún usan `data-testid`?**
   - Busca: `playwright best practices locators`
   - Una buena respuesta explica: la razón del consejo y una situación en la que un test id es la mejor opción.

## Siguiente paso

En la próxima lección haces un recorrido completo por las DevTools: los paneles Elements, Console y Network.
