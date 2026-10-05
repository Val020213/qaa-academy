---
title: Formularios, eventos y estado
summary: Entiende los inputs, los eventos y el estado, y ve qué conserva o pierde una recarga entre la memoria, localStorage y las cookies.
duration: 30 min
---

## Objetivo

- Explicar los inputs, `value` y el envío de un formulario.
- Nombrar los cuatro eventos que más encontrarás: click, input, change y submit.
- Explicar qué es el estado y dónde puede guardarlo una página.
- Predecir qué conserva y qué pierde una recarga.
- Explicar por qué esto importa para los tests independientes.

## Formularios e inputs

Un **formulario** es un grupo de campos y un botón que los envía. Un **input** es un campo donde el usuario escribe o elige algo.

El texto dentro de un input es su **valor** (*value*). El valor es una propiedad del elemento. Una **propiedad** es un dato que guarda un elemento, y el código puede leerla o cambiarla.

El formulario de login de la Practice app tiene dos inputs y un botón de envío. Puedes leer un valor en la Console:

```text
> document.querySelector('[data-testid="login-email"]').value
'qa@example.com'
```

El `value` cambia mientras el usuario escribe. El atributo HTML no cambia. El atributo solo guarda el valor inicial. Un test lee el valor en vivo, no el atributo.

## Eventos

Un **evento** es algo que ocurre en la página, como un clic. El código puede escuchar un evento y reaccionar. El código que reacciona se llama **manejador de eventos** (*event handler*).

Cuatro eventos son los más importantes para los testers:

| Evento | Cuándo ocurre |
| --- | --- |
| `click` | El usuario hace clic en un elemento |
| `input` | El usuario cambia el texto de un campo, con cada tecla |
| `change` | El usuario termina un cambio, como elegir una opción en un `select` o marcar una casilla |
| `submit` | El usuario envía un formulario, al hacer clic en el botón de envío o al pulsar `Enter` |

En la Practice app, el formulario de login reacciona a `submit`, el filtro de casos a `change` y el botón Delete a `click`. Cuando Playwright hace clic o rellena un campo, ocurren los eventos reales, y la página reacciona igual que con una persona.

## Estado

El **estado** es lo que la página recuerda en este momento. Algunos ejemplos son la lista de casos, el texto de un campo y si el usuario ha iniciado sesión.

El estado tiene que vivir en algún lugar. El lugar decide cuánto dura.

## Dónde vive el estado

| Lugar | Vive hasta | Ejemplo |
| --- | --- | --- |
| Memoria | Recargas o cierras la página | La lista de casos de la Practice app |
| URL | Cambias la dirección | La dirección `#/practice`, o `?next=%2Fproducts` en la tienda |
| `localStorage` | Lo borras. Se conserva tras una recarga y tras cerrar el navegador | Las lecciones que marcaste como completadas |
| Cookie | Expira o la borras. El navegador la envía con cada petición al servidor | El inicio de sesión de la tienda |

**Memoria** significa las variables dentro del código de la página en ejecución. Desaparecen al recargar.

**`localStorage`** es un pequeño almacén en tu navegador. Guarda texto bajo un nombre. Solo lo tiene este navegador. Otro navegador u otra computadora no lo ven.

Una **cookie** es un dato pequeño que el servidor le pide al navegador que guarde. El navegador la devuelve con cada petición. La tienda usa una cookie llamada `shop_session` para saber quién eres.

> **Nota:** La cookie de la tienda está marcada como `HttpOnly`. El código de la página no puede leerla, pero tú puedes verla en las DevTools, en el panel **Application**.

## Qué conserva y qué pierde una recarga

Recarga la página. Luego pregunta: ¿dónde estaba este dato?

- La lista de casos de la Practice app está en memoria. Una recarga la pierde.
- El login de la Practice app también está solo en memoria. Una recarga muestra el formulario de login otra vez.
- Las marcas de completado están en `localStorage`. Se conservan.
- El inicio de sesión de la tienda está en una cookie. Una recarga te mantiene con la sesión iniciada.

## Por qué importa para los tests

Un test no debe depender de lo que dejó un test anterior. El estado es la razón.

- El estado en memoria empieza vacío en cada página nueva.
- `localStorage` y las cookies permanecen en el navegador. Si un test deja una cookie, el siguiente test puede empezar ya con la sesión iniciada. Puede pasar o fallar por la razón equivocada.
- Cada test crea sus propios datos y no depende del orden de los tests. Es una regla del equipo.

Playwright da a cada test un contexto de navegador nuevo, sin cookies y con un `localStorage` vacío. Un contexto es como una ventana privada nueva del navegador. Cuando un test necesita un usuario con sesión iniciada, un paso de preparación inicia sesión a propósito y guarda la sesión en un archivo. La suite de la tienda hace esto en `apps/practice-shop/e2e/global.setup.ts`.

Cuando pruebas a mano, tu navegador conserva el estado. Si un bug aparece solo para ti, borra las cookies y el `localStorage` y vuelve a intentarlo.

## Práctica

1. Inicia el sitio del curso con `pnpm dev`. Abre `http://localhost:5180/#/practice` y pulsa `F12`.
2. Escribe `qa@example.com` en el campo Email, pero no lo envíes. En la Console ejecuta esto y lee el resultado:

```text
document.querySelector('[data-testid="login-email"]').value
```

3. Ejecuta esto y compara. Lee el atributo, no el valor. El resultado es `null`, porque el HTML no tiene un atributo `value`:

```text
document.querySelector('[data-testid="login-email"]').getAttribute("value")
```

4. En la sección 2, añade los casos "One" y "Two". Pulsa `F5` para recargar. La lista está vacía. Los datos estaban en memoria.
5. Abre esta lección en el curso. Haz clic en **Marcar como completada**.
6. En las DevTools, abre el panel **Application**. Abre **Local storage** y luego `http://localhost:5180`. Busca la clave `qaa-academy:completed`. Lee su valor. Es una lista de rutas de lecciones.
7. Pulsa `F5`. El botón sigue diciendo **Completada ✓**. Haz clic otra vez para deshacerlo.
8. Inicia la tienda con `pnpm shop:dev`. Abre `http://localhost:5190` e inicia sesión como `admin@qa-shop.test` con `Admin123!`.
9. En el panel **Application**, abre **Cookies** y luego `http://localhost:5190`. Busca `shop_session`. Pulsa `F5`. Sigues con la sesión iniciada.
10. Borra la cookie `shop_session` en las DevTools. Pulsa `F5`. ¿Qué pasa?
11. Detén la tienda con `Ctrl + C`.

## Comprueba lo que sabes

1. ¿Cuál es la diferencia entre un atributo y un valor?

<details><summary>Respuesta</summary>

El atributo es el texto inicial escrito en el HTML. El valor es el texto en vivo del campo. Cambia mientras el usuario escribe.

</details>

2. ¿Qué evento ocurre cuando un usuario elige una opción en un `select`?

<details><summary>Respuesta</summary>

El evento `change`.

</details>

3. La lista de casos está vacía después de una recarga. ¿Dónde estaba guardada?

<details><summary>Respuesta</summary>

En memoria. La memoria se pierde al recargar.

</details>

4. ¿Por qué una cookie puede hacer que los tests dependan unos de otros?

<details><summary>Respuesta</summary>

Una cookie permanece en el navegador. Si un test la deja, el siguiente test puede empezar ya con la sesión iniciada.

</details>

## Siguiente paso

En el próximo módulo empezarás con Playwright y escribirás tus primeros tests con las ideas que aprendiste aquí.
