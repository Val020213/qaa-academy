---
title: Las DevTools del navegador
summary: Usa los paneles Elements, Console y Network de Chrome o Edge para mirar dentro de una página e investigar un bug.
duration: 30 min
---

## Objetivo

- Abrir las DevTools y nombrar sus paneles principales.
- Usar el panel Elements y el selector de elementos.
- Leer errores y ejecutar una línea de JavaScript en la Console.
- Ver una petición, su código de estado y su respuesta en el panel Network.
- Seguir una rutina para investigar un bug.

## ¿Qué son las DevTools?

Las **DevTools** (herramientas de desarrollo) son herramientas integradas en el navegador. Muestran lo que hay dentro de una página: sus elementos, sus errores y su tráfico de red. Los desarrolladores las usan para construir páginas. Los testers las usan para averiguar por qué una página no funciona.

Las DevTools funcionan igual en Chrome y en Edge. Esta lección usa los nombres que ves en ambos.

## Abrir las DevTools

Usa una de estas formas:

- Pulsa `F12`.
- Pulsa `Ctrl + Shift + I`.
- Haz clic derecho en un elemento de la página y elige **Inspect**.

Las DevTools se abren al lado o en la parte inferior de la ventana. Arriba hay una fila de pestañas, llamadas **paneles**. Si falta un panel, haz clic en `>>` para ver más.

## El panel Elements

El panel **Elements** muestra el DOM como un árbol. Puedes abrir y cerrar elementos con las flechas pequeñas.

El **selector de elementos** (*element picker*) es el icono de flecha en la parte superior izquierda de las DevTools. Haz clic en él y luego haz clic en cualquier cosa de la página. Las DevTools saltan a ese elemento en el árbol. También puedes pulsar `Ctrl + Shift + C`.

Cuando seleccionas un elemento, fíjate en estas cosas:

- Sus atributos, como `data-testid`.
- Su padre y sus hijos.
- El panel **Styles** a la derecha. Muestra el CSS del elemento.

Puedes hacer doble clic en un atributo o en un texto y cambiarlo. El cambio afecta solo a tu navegador, y solo hasta que recargues. Es una forma segura de probar algo.

## El panel Console

La **Console** muestra mensajes de la página. Los errores salen en rojo. Las advertencias salen en amarillo.

Cuando una página se comporta mal, revisa primero la Console. Un error en rojo suele señalar la causa. Una línea de error normalmente tiene el nombre del archivo y el número de línea a la derecha.

También puedes escribir una línea de JavaScript en el prompt `>` y pulsar `Enter`. El resultado aparece debajo.

```text
> document.title
'QAA Academy'

> document.querySelectorAll("input").length
3
```

Esto es lo que usaste en la lección anterior para probar selectores.

## El panel Network

Cada vez que una página carga un archivo o le pide datos a un servidor, el navegador envía una **petición** (*request*). El panel **Network** las enumera.

Sigue estos pasos:

1. Abre el panel Network **antes** de la acción que quieres estudiar. Solo graba mientras está abierto.
2. Haz la acción en la página, por ejemplo hacer clic en un botón.
3. Mira la lista. Cada fila es una petición.

Las columnas principales son:

- **Name**: el final de la dirección.
- **Status**: el código de resultado. `200` significa éxito. Un número de 400 en adelante significa un problema.
- **Type**: por ejemplo `document`, `script` o `fetch`.
- **Time**: cuánto tardó la petición.

Las páginas cargan muchos archivos, como scripts y estilos. Para ver solo las llamadas de datos, haz clic en el filtro **Fetch/XHR**. Son las peticiones que hace el código de la página.

Haz clic en una petición para ver sus detalles:

- **Headers**: la dirección, el método, el estado e información extra.
- **Payload**: los datos que envió la página. Aparece en las peticiones que envían datos.
- **Response**: los datos que el servidor devolvió.

> **Consejo:** Activa **Preserve log** en el panel Network. Sin esa opción, la lista se borra cuando la página cambia y pierdes la petición que quieres ver.

La próxima lección explica las peticiones y las respuestas con detalle.

## Una rutina para investigar un bug

Cuando algo no funciona, sigue los mismos pasos cada vez:

1. Abre las DevTools. Reproduce el problema con el panel Network abierto.
2. Mira la **Console**. ¿Hay un error en rojo?
3. Mira el panel **Network**. ¿Hay una petición con un estado en rojo? Haz clic en ella. Lee la **Response**.
4. Mira el panel **Elements**. ¿Está el elemento? ¿Está oculto? ¿Tiene el atributo que esperas?
5. Anota lo que viste: los pasos, la dirección de la petición, el código de estado y el mensaje.

Con estas notas, un reporte de bug es mucho más útil. Un desarrollador puede empezar a trabajar de inmediato.

## Práctica

1. Abre `http://localhost:5180/#/practice`. Pulsa `F12`.
2. Haz clic en el selector de elementos. Haz clic en el botón **Load report**. Lee su `data-testid` en el panel Elements.
3. Abre la Console. Ejecuta `document.title`. Luego ejecuta `document.querySelectorAll("input").length`.
4. Ejecuta `nonexistentThing` en la Console. Lee el error en rojo. Así se ve un error.
5. En una segunda terminal, inicia la tienda de práctica:

```bash
pnpm shop:dev
```

6. Abre `http://localhost:5190` en una pestaña nueva. Abre las DevTools y el panel **Network**. Activa **Preserve log**.
7. Escribe el correo `admin@qa-shop.test` y una contraseña incorrecta. Haz clic en **Sign in**.
8. En el panel Network, busca la petición `login`. Lee su **Status**. Haz clic en ella y lee la **Response**.
9. Lee el mensaje de error en rojo de la página. Compáralo con la respuesta.
10. Cuando termines, detén la tienda con `Ctrl + C` en su terminal.

## Comprueba lo que sabes

1. ¿Cómo se abren las DevTools?

<details><summary>Respuesta</summary>

Pulsa `F12`, o pulsa `Ctrl + Shift + I`, o haz clic derecho en un elemento y elige Inspect.

</details>

2. ¿Qué hace el selector de elementos?

<details><summary>Respuesta</summary>

Haces clic en un elemento de la página y las DevTools lo muestran en el panel Elements.

</details>

3. ¿Por qué abrir el panel Network antes de la acción?

<details><summary>Respuesta</summary>

Solo graba mientras está abierto. Si lo abres después, pierdes la petición.

</details>

4. ¿Dónde lees el mensaje que devolvió un servidor?

<details><summary>Respuesta</summary>

En el panel Network: haz clic en la petición y abre la pestaña Response.

</details>

## Siguiente paso

En la próxima lección aprenderás qué contienen una petición y una respuesta, y qué significan los códigos de estado.
