---
title: Las DevTools del navegador
summary: Usa los paneles Elements, Console y Network de Chrome o Edge para mirar dentro de una página e investigar un bug.
duration: 45 min
---

## Objetivo

- Abrir las DevTools y nombrar sus paneles principales.
- Usar el panel Elements y el selector de elementos.
- Leer errores y ejecutar una línea de JavaScript en la Console.
- Ver una petición, su código de estado y su respuesta en el panel Network.
- Seguir una rutina para investigar un bug.

## ¿Qué son las DevTools?

Las **DevTools** (herramientas de desarrollo) están integradas en el navegador. Muestran lo que hay dentro de una página: sus elementos, sus errores y su tráfico de red. Los desarrolladores las usan para construir páginas. Los testers las usan para descubrir por qué una página no funciona.

Las DevTools funcionan igual en Chrome y en Edge. Esta lección usa los nombres que ves en ambos.

## Abre las DevTools

Usa una de estas formas:

- Pulsa `F12`.
- Pulsa `Ctrl + Shift + I`.
- Haz clic derecho en un elemento de la página y elige **Inspect** (Inspeccionar).

Las DevTools se abren al lado o en la parte inferior de la ventana. Arriba hay una fila de pestañas, llamadas **paneles**. Si falta un panel, haz clic en `>>` para ver más.

## El panel Elements

El panel **Elements** (Elementos) muestra el DOM como un árbol. Puedes abrir y cerrar elementos con las flechas pequeñas.

El **selector de elementos** es el icono de flecha en la parte superior izquierda de las DevTools. Haz clic en él y luego haz clic en cualquier cosa de la página. Las DevTools saltan a ese elemento en el árbol. También puedes pulsar `Ctrl + Shift + C`.

Cuando seleccionas un elemento, fíjate en estas cosas:

- Sus atributos, como `data-testid`.
- Su padre y sus hijos.
- El panel **Styles** (Estilos) a la derecha. Muestra el CSS del elemento.

Puedes hacer doble clic en un atributo o en un texto y cambiarlo. El cambio afecta solo a tu navegador, y solo hasta que recargues. Es una forma segura de probar algo.

## El panel Console

La **Console** (consola) muestra mensajes de la página. Los errores salen en rojo. Las advertencias salen en amarillo.

Cuando una página se porta mal, revisa primero la Console. Un error rojo suele señalar la causa. Una línea de error suele tener el nombre del archivo y el número de línea a la derecha.

También puedes escribir una línea de JavaScript en el prompt `>` y pulsar `Enter`. El resultado aparece debajo.

```text
> document.title
'QAA Academy'

> document.querySelectorAll("input").length
3
```

Esto es lo que usaste en la última lección para probar selectores.

## El panel Network

Cada vez que una página carga un archivo o le pide datos a un servidor, el navegador envía una **petición** (*request*). El panel **Network** (Red) las enumera.

Sigue estos pasos:

1. Abre el panel Network **antes** de la acción que quieres estudiar. Solo graba mientras está abierto.
2. Haz la acción en la página, como hacer clic en un botón.
3. Mira la lista. Cada fila es una petición.

Las columnas principales son:

- **Name** (nombre): el final de la dirección.
- **Status** (estado): el código de resultado. `200` significa éxito. Un número desde 400 en adelante significa un problema.
- **Type** (tipo): por ejemplo `document`, `script` o `fetch`.
- **Time** (tiempo): cuánto tardó la petición.

Las páginas cargan muchos archivos, como scripts y estilos. Para ver solo las llamadas de datos, haz clic en el filtro **Fetch/XHR**. Son las peticiones que hace el código de la página.

Haz clic en una petición para ver sus detalles:

- **Headers** (encabezados): la dirección, el método, el estado e información extra.
- **Payload** (carga): los datos que envió la página. Aparece en las peticiones que envían datos.
- **Response** (respuesta): los datos que el servidor devolvió.

> **Consejo:** Activa **Preserve log** (conservar registro) en el panel Network. Sin esto, la lista se borra cuando la página cambia, y pierdes la petición que querías ver.

La próxima lección explica las peticiones y las respuestas en detalle.

## Una rutina para investigar un bug

Cuando algo no funciona, sigue los mismos pasos cada vez:

1. Abre las DevTools. Reproduce el problema con el panel Network abierto.
2. Mira la **Console**. ¿Hay un error rojo?
3. Mira el panel **Network**. ¿Hay una petición con un estado en rojo? Haz clic en ella. Lee la **Response**.
4. Mira el panel **Elements**. ¿Está el elemento? ¿Está oculto? ¿Tiene el atributo que esperas?
5. Anota lo que viste: los pasos, la dirección de la petición, el código de estado y el mensaje.

Con estas notas, un reporte de bug es mucho más útil. Un desarrollador puede empezar a trabajar de inmediato.

## Profundiza

### Una idea equivocada común: "la Console está limpia, así que no hay bug"

La Console muestra errores del código de la página. Muchos bugs no son errores. Una página puede mostrar un número equivocado, y todas las peticiones pueden responder `200`. El código hace lo que se le dijo, pero el resultado es incorrecto. Nada está en rojo.

Una Console limpia es una buena señal, y no una prueba. Aún comparas lo que ves con lo que se espera. Aún lees la respuesta en el panel Network y compruebas que los datos sean correctos.

### Cómo aparece en el trabajo real de QA: de las DevTools a un test

Puedes convertir lo que viste en las DevTools en una comprobación automática. Este test falla si la página Practice lanza un error mientras carga el reporte:

```ts
import { expect, test } from "./lib/test"

test("the practice page has no JavaScript errors", async ({ page }) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))

  await page.goto("/#/practice")
  await page.getByTestId("report-load").click()
  await expect(page.getByTestId("report-result")).toBeVisible()

  expect(errors).toEqual([])
})
```

La línea con `page.on` le dice a Playwright: cuando la página tenga un error, guarda su mensaje en la lista. Al final, la lista debe estar vacía. No necesitas escribir esto ahora. Muestra que las DevTools y Playwright miran el mismo navegador.

Otra acción útil: haz clic derecho en una petición del panel Network y elige **Copy** (Copiar), luego **Copy as cURL**. Obtienes un comando que repite la petición. Puedes añadirlo a un reporte de bug.

### Un equilibrio: las DevTools te ayudan a mirar, pero no dejan rastro

- Los cambios en el panel Elements existen solo en tu pestaña. Una recarga los quita. Úsalos para probar una idea, como "¿y si este texto fuera más largo?". No son una corrección, y una ejecución de tests no los ve.
- Una petición copiada puede incluir tu cookie, y una cookie puede ser una contraseña. Quítala antes de pegarla en un ticket que lean muchas personas.
- El panel Network puede hacer más lenta la conexión. Elige un perfil de limitación (*throttling*) como **Slow 4G**. Esto muestra lo que ve un usuario con mala conexión, por ejemplo si el texto "Loading..." se queda en pantalla.

## Práctica

1. Abre `http://localhost:5180/#/practice`. Pulsa `F12`.
2. Haz clic en el selector de elementos. Haz clic en el botón **Load report** (Cargar reporte). Lee su `data-testid` en el panel Elements.
3. Abre la Console. Ejecuta `document.title`. Luego ejecuta `document.querySelectorAll("input").length`.
4. Ejecuta `nonexistentThing` en la Console. Lee el error rojo. Esto muestra cómo se ve un error.
5. En una segunda terminal, inicia la tienda de práctica:

```bash
pnpm shop:dev
```

6. Abre `http://localhost:5190` en una pestaña nueva. Abre las DevTools y el panel **Network**. Activa **Preserve log**.
7. Escribe el correo `admin@qa-shop.test` y una contraseña incorrecta. Haz clic en **Sign in**.
8. En el panel Network, busca la petición `login`. Lee su **Status**. Haz clic en ella y lee la **Response**.
9. Lee el mensaje de error rojo de la página. Compáralo con la respuesta.
10. Detén la tienda con `Ctrl + C` en su terminal cuando termines.

## Comprueba lo que sabes

1. ¿Cómo abres las DevTools?

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

4. ¿Dónde lees el mensaje que un servidor devolvió?

<details><summary>Respuesta</summary>

En el panel Network: haz clic en la petición y abre la pestaña Response.

</details>

5. Un tester escribe el reporte de bug "Guardar un producto no funciona". Otro escribe "En New product con todos los campos vacíos, la petición `products` es un `POST` y devuelve 422. La respuesta enumera un mensaje por cada campo, pero la página no muestra ningún mensaje". ¿Qué reporte puede usar un desarrollador de inmediato? ¿Por qué?

<details>
<summary>Respuesta</summary>

El segundo. Da los pasos, la petición, el código de estado y lo que se esperaba. El desarrollador puede ver dónde mirar: la página no muestra los mensajes que envió el servidor. El primer reporte solo dice que algo está mal, así que el desarrollador debe descubrir los detalles por su cuenta.

</details>

6. Cambias el texto del botón Sign in a "Pay now" en el panel Elements y luego recargas la página. ¿Qué ves? ¿Un test que se ejecute después vería "Pay now"?

<details>
<summary>Respuesta</summary>

Después de recargar ves "Sign in" otra vez. El panel Elements cambia solo la copia del DOM de tu pestaña. Una recarga construye la página de nuevo desde el código. Un test inicia su propio navegador nuevo, así que nunca ve tu cambio.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Cómo haces más lenta la red en las DevTools de Chrome y por qué lo haría un tester?**
   - Busca: `chrome devtools network throttling`
   - Una buena respuesta explica: los pasos para elegir un perfil y un bug que solo muestra una conexión lenta.
2. **¿Qué es un archivo HAR y por qué puede ser riesgoso compartirlo?**
   - Busca: `HAR file network export`
   - Una buena respuesta explica: qué registra un archivo HAR, cómo se guarda uno y qué datos privados puede contener.
3. **¿Cómo puedes probar una página con el tamaño de un teléfono usando las DevTools?**
   - Busca: `chrome devtools device mode`
   - Una buena respuesta explica: cómo abrir el modo de dispositivo, qué puede simular y una cosa que no puede reemplazar, como un teléfono real.

## Siguiente paso

En la próxima lección aprendes qué contienen una petición y una respuesta, y qué significan los códigos de estado.
