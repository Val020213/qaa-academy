---
title: Formularios, eventos y estado
duration: 60 min
---

## Objetivo

En esta lección lees el valor actual de un campo y sigues los eventos que actualizan el estado de una página. También distingues qué datos conserva una recarga y dónde están guardados.

- Distinguir la propiedad `value` del atributo HTML.
- Relacionar una acción con su evento y su manejador.
- Identificar el estado en memoria, en la URL, en `localStorage` y en una cookie.
- Comprobar qué cambia al recargar una página.

## El valor de un campo

La propiedad `value` de un input contiene el texto actual del campo. El formulario de login de la app Practice tiene dos inputs y un botón de envío. Después de escribir el correo, puedes leerlo en la Console:

```text
> document.querySelector('[data-testid="login-email"]').value
'qa@example.com'
```

El atributo HTML y la propiedad pueden tener valores distintos. Este ejemplo crea un input con un valor inicial y luego cambia su propiedad:

```text
> const dog = document.createElement("input")
> dog.setAttribute("value", "Rex")
> dog.value = "Luna"
> [dog.value, dog.getAttribute("value")]
(2) ['Luna', 'Rex']
```

La propiedad contiene "Luna", mientras que el atributo conserva "Rex". Para leer lo que escribió el usuario, usa la propiedad `value`.

La app Practice está hecha con React, y en estos campos de correo y contraseña React sincroniza el atributo con el valor que guarda en su estado. En la página Practice, después de escribir, ambas lecturas muestran el texto escrito.

## Eventos y manejadores

El navegador genera **eventos** cuando interactúas con la página. El código puede registrar una función para responder a un evento; esa función es un **manejador de eventos** (*event handler*).

| Evento | Cuándo ocurre |
| --- | --- |
| `click` | El usuario hace clic en un elemento o activa un botón con `Enter` o `Space` |
| `input` | El usuario modifica el valor de un campo, por ejemplo al escribir o pegar |
| `change` | El usuario confirma un cambio: elige una opción en un `select`, marca una casilla o sale de un campo de texto que editó |
| `submit` | El usuario envía un formulario, haciendo clic en el botón de envío o pulsando `Enter` |

En la app Practice, el manejador de `submit` comprueba el correo y la contraseña. El filtro de casos responde a `change`, y el botón Delete a `click`.

Cambiar una propiedad desde un script no genera el evento que produciría la interacción del usuario:

```text
> let n = 0
> const box = document.createElement("input")
> box.addEventListener("input", () => n++)
> box.value = "hello"
> n
0
```

`addEventListener` registra una función que incrementa `n` cuando el navegador genera un evento `input`. La asignación cambia el texto del campo, pero no genera ese evento, así que `n` sigue en 0.

![Una edición del usuario genera input; asignar box.value desde un script cambia el valor sin ejecutar ese manejador.](/images/02-input-events.es.svg)

## Dónde vive el estado

El **estado** son los datos que la página usa en este momento: el texto de los campos, la lista de casos o si el usuario inició sesión. El lugar donde la página los guarda determina cuánto duran.

| Lugar | Vive hasta que | Ejemplo |
| --- | --- | --- |
| Memoria | Recargas o cierras la página | La lista de casos de la app Practice |
| URL | Cambias la dirección | La dirección `#/practice`, o `?next=%2Fproducts` en la tienda |
| `localStorage` | Lo borras. Sigue ahí después de recargar y de cerrar el navegador | Las lecciones que marcaste como completadas |
| Cookie | Expira o la borras; una cookie de sesión puede terminar al cerrar la sesión del navegador. Se envía con peticiones que cumplen sus reglas | El inicio de sesión de la tienda |

La app Practice guarda la lista de casos, el filtro y el login en variables en **memoria**. Al recargar, el navegador ejecuta de nuevo el código de la página con sus valores iniciales.

El curso guarda las lecciones completadas como texto en `localStorage`, bajo la clave `qaa-academy:completed`. Cuando la página carga de nuevo, el código lee ese texto y recupera las marcas. Los datos pertenecen al origen de la página en ese perfil del navegador; otro navegador u otra computadora no los comparte.

La tienda usa una cookie llamada `shop_session` para saber quién eres. La cookie contiene un token que el servidor asocia con un usuario. El navegador la envía a ese host y a rutas permitidas, según las reglas de la cookie; no a cualquier servidor.

> **Nota:** La cookie de la tienda está marcada como `HttpOnly`. El código de la página no puede leerla, pero tú puedes verla en las DevTools, en el panel **Application** (Aplicación).

## El estado al probar

Una prueba puede dar un resultado distinto según el estado inicial. Si una cookie mantiene la sesión iniciada, abrir la tienda otra vez no te lleva al mismo punto que abrirla sin sesión.

Antes de reproducir un bug, identifica qué datos necesita el caso. Una recarga reinicia los datos en memoria, pero conserva `localStorage` y las cookies. Si necesitas probar sin esos datos, bórralos en las DevTools.

## Práctica

1. Inicia el sitio del curso con `pnpm dev`. Abre `http://localhost:5180/#/practice` y pulsa `F12`.
2. Escribe `qa@example.com` en el campo Email, pero no lo envíes. En la Console ejecuta esto y lee el resultado:

```text
document.querySelector('[data-testid="login-email"]').value
```

3. Ejecuta esto y compara el atributo con la propiedad:

```text
document.querySelector('[data-testid="login-email"]').getAttribute("value")
```

4. En la sección 2, agrega los casos "One" y "Two". Pulsa `F5` para comprobar que la lista queda vacía.
5. Abre esta lección en el curso. Haz clic en **Marcar como completada**.
6. En las DevTools, abre el panel **Application**. Abre **Local storage** y luego `http://localhost:5180`. Busca la clave `qaa-academy:completed` y lee la lista de rutas de lecciones.
7. Pulsa `F5` y comprueba que el botón sigue diciendo **Completada**. Haz clic otra vez para deshacer.
8. Inicia la tienda con `pnpm shop:dev`. Abre `http://localhost:5190` e inicia sesión como `admin@qa-shop.test` con `Admin123!`.
9. En el panel **Application**, abre **Cookies** y luego `http://localhost:5190`. Busca `shop_session`. Pulsa `F5` y comprueba que sigues con la sesión iniciada.
10. Borra la cookie `shop_session` en las DevTools. Pulsa `F5` y comprueba que la tienda pide iniciar sesión.
11. Detén la tienda con `Ctrl + C`.

## Reto

Crea la carpeta `exercises/challenges` si no existe. Crea `exercises/challenges/07-forms-events-and-state.ts`. El programa recibe un elemento por la línea de comandos y lo agrega a una lista en memoria y a otra guardada en un archivo. Luego imprime ambas cantidades. Cada ejecución inicia una lista en memoria nueva y recupera la lista del archivo.

Está terminado cuando:

- Ejecutas `node exercises/challenges/07-forms-events-and-state.ts "Blue Moon"` y el programa imprime `memory: 1 | file: 1`.
- Lo ejecutas con otro elemento e imprime `memory: 1 | file: 2`.
- Si borras el archivo de datos, la siguiente ejecución empieza en `file: 1`. Si contiene `not json`, el programa informa que está dañado y empieza de nuevo sin fallar.
- Sin un elemento, el programa imprime cómo usarlo y no cambia el archivo.

No uses `enum` ni propiedades de parámetro, porque Node ejecuta el archivo directamente. Para leer argumentos y archivos, busca: `node process.argv` y `node fs readFileSync writeFileSync`. Para el archivo dañado, busca: `JSON.parse try catch`.

## Piénsalo bien

1. Haces cuatro cosas y luego pulsas `F5`. ¿Cuáles sobreviven? (a) Agregas dos casos a la lista de la app Practice. (b) Eliges "Passed" en su filtro **Show**. (c) Marcas una lección como completada en el curso. (d) Tienes la sesión iniciada en la tienda. Di dónde vivía cada dato.

<details>
<summary>Respuesta</summary>

(a) y (b) se pierden porque viven en la memoria de la página. (c) sobrevive porque el curso recupera las marcas de `localStorage`. (d) sobrevive porque el navegador conserva la cookie y la envía con la petición de la página.

</details>

## Siguiente paso

En el próximo módulo empezarás con Playwright y escribirás tus primeros tests con las ideas que aprendiste aquí.
