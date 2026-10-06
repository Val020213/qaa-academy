---
title: Las DevTools del navegador
summary: Usa los paneles Elements, Console y Network de Chrome o Edge para mirar dentro de una página, probar tus hipótesis e investigar un bug.
duration: 75 min
---

## Empieza con un acertijo

Una pizzería tiene una página web. Muestra "Margarita, $12". Abres las DevTools, haces doble clic en el precio y escribes "$1". Luego haces clic en **Pedir**.

Dos preguntas. ¿Qué precio recibe la cocina? Y en otra página, una receta dice "Rinde: -2 personas", pero la Console no muestra ningún error rojo. ¿Cómo puede una página estar mal sin ningún error?

Todavía no puedes responder, pero sí puedes adivinar. Piensa de quién es el precio: de tu navegador o de la tienda.

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Predecir qué hace un cambio en el panel Elements y qué no hace.
- Decidir qué panel abrir primero según el síntoma.
- Explicar por qué una Console limpia no prueba que la página esté bien.
- Leer una petición, su código de estado y su respuesta en el panel Network.
- Investigar un problema con una hipótesis y un experimento pequeño a la vez.

## ¿Qué son las DevTools?

Las **DevTools** (herramientas de desarrollo) vienen incluidas en el navegador. Muestran lo que hay dentro de una página: sus elementos, sus errores y su tráfico de red. Los desarrolladores las usan para construir páginas. Los testers las usan para descubrir por qué una página no funciona.

Las DevTools funcionan igual en Chrome y en Edge. Esta lección usa los nombres que ves en ambos.

Cualquier página sirve para tu primera mirada. Abre un sitio del clima o de recetas y sigue la lección. Todavía no necesitas las apps del curso.

## Abre las DevTools

Usa una de estas formas:

- Pulsa `F12`.
- Pulsa `Ctrl + Shift + I`.
- Haz clic derecho sobre un elemento de la página y elige **Inspect** (Inspeccionar).

Las DevTools se abren al lado o abajo de la ventana. Arriba hay una fila de pestañas, llamadas **paneles**. Si falta un panel, haz clic en `>>` para ver más.

## El panel Elements

El panel **Elements** (Elementos) muestra el DOM como un árbol. El DOM es la copia de la página que el navegador guarda en memoria. Puedes abrir y cerrar elementos con las flechas pequeñas.

El **selector de elementos** es el icono de flecha arriba a la izquierda de las DevTools. Haz clic en él y luego en cualquier cosa de la página. Las DevTools saltan a ese elemento en el árbol. También puedes pulsar `Ctrl + Shift + C`.

Mira cómo las DevTools encuentran el campo de correo y muestran su `data-testid`.

![Elements en las DevTools encuentra el campo de correo y muestra su atributo data-testid.](/clips/devtools-elements.webm)

Cuando seleccionas un elemento, fíjate en estas cosas:

- Sus atributos, como `data-testid`.
- Su padre y sus hijos.
- El panel **Styles** (Estilos) a la derecha. Muestra el CSS del elemento.

Puedes hacer doble clic en un atributo o en un texto y cambiarlo.

Detente y adivina. Cambias un texto en el panel Elements y luego pulsas `F5`. ¿Qué esperas ver? Ahora, un colega abre la misma página en otro computador. ¿Qué ve tu colega?

La respuesta: después de `F5` vuelve el texto viejo. Tu colega nunca vio tu cambio. Editaste la copia de la página que tiene el navegador, no el archivo de la página que está en el servidor. Al recargar, se construye una copia nueva desde el servidor. Así, el panel Elements es un buen lugar para probar ideas y un mal lugar para demostrar algo.

## El panel Console

La **Console** (Consola) muestra mensajes de la página. Los errores son rojos. Las advertencias son amarillas.

Cuando una página se porta mal, revisa la Console. Un error rojo suele señalar la causa. Una línea de error normalmente trae el nombre del archivo y el número de línea al lado derecho.

También puedes escribir una línea de JavaScript en el prompt `>` y pulsar `Enter`. El resultado aparece debajo.

Prueba esto en la página Practice del curso, en `http://localhost:5180/#/practice`. Primero adivina: ¿cuántos elementos `input` tiene la página? Cuenta los campos que puedes ver.

```text
> document.title
'QAA Academy'

> document.querySelectorAll("input").length
3
```

Ves tres campos: Email, Password y New case. Ahora agrega un caso en la sección 2 y ejecuta la segunda línea otra vez. Adivina primero. La respuesta es 4. Una casilla de verificación también es un `input`, y cada fila de caso tiene una. Tu cuenta de "campos" y la cuenta de elementos `input` del navegador son cosas distintas. Cuando un número te sorprenda, pregunta qué es lo que cuenta el código.

## El panel Network

Cada vez que una página carga un archivo o le pide datos a un servidor, el navegador envía una **petición** (*request*). El panel **Network** (Red) las lista. Piensa en una página del clima. La página misma es una petición. La temperatura llega en otra, cuando la página ya está en pantalla.

Sigue estos pasos:

1. Abre el panel Network **antes** de la acción que quieres estudiar. Solo graba mientras está abierto.
2. Haz la acción en la página, por ejemplo hacer clic en un botón.
3. Mira la lista. Cada fila es una petición.

Las columnas principales son:

- **Name** (nombre): el final de la dirección.
- **Status** (estado): el código del resultado. `200` significa éxito. Un número desde 400 en adelante significa un problema.
- **Type** (tipo): por ejemplo `document`, `script` o `fetch`.
- **Time** (tiempo): cuánto tardó la petición.

Las páginas cargan muchos archivos, como scripts y estilos. Para ver solo las llamadas de datos, haz clic en el filtro **Fetch/XHR**. Son las peticiones que hace el código de la página.

Haz clic en una petición para ver sus detalles:

- **Headers** (encabezados): la dirección, el método, el estado y más información.
- **Payload** (carga): los datos que envió la página. Aparece en las peticiones que envían datos.
- **Response** (respuesta): los datos que el servidor devolvió.

Ahora la regla que se rompe. Abres el panel Network después de hacer clic en un botón que inicia sesión, y la página pasa a una dirección nueva. ¿Qué esperas encontrar? Sin **Preserve log** (conservar registro), la lista se borra cuando la página cambia, y la petición que querías ya no está.

> **Consejo:** Activa **Preserve log** en el panel Network antes de empezar.

La próxima lección explica las peticiones y las respuestas en detalle.

## Una rutina para investigar un bug

**Depura como un científico.** Haz una hipótesis sobre la causa. Haz un experimento pequeño que pueda demostrar que la hipótesis es falsa. Cambia una sola cosa a la vez. Si el problema es grande, redúcelo: busca los pasos más cortos que todavía muestren el bug.

Las DevTools te dan los experimentos. Una buena rutina es:

1. Abre las DevTools. Reproduce el problema con el panel Network abierto.
2. Mira la **Console**. ¿Hay un error rojo?
3. Mira el panel **Network**. ¿Hay una petición con un estado rojo? Haz clic en ella. Lee la **Response**.
4. Mira el panel **Elements**. ¿Está el elemento? ¿Está oculto? ¿Tiene el atributo que esperas?
5. Escribe lo que viste: los pasos, la dirección de la petición, el código de estado y el mensaje.

El panel que abres primero depende del síntoma. Una página que no hace nada: Console. Datos incorrectos: Network, y luego compara la respuesta con la pantalla. Aspecto incorrecto: Elements.

### De vuelta al acertijo

El precio en la pantalla es solo una imagen de los datos. Una tienda bien hecha no toma el precio de la página. El navegador envía qué pizza quieres, y el servidor busca el precio por su cuenta. Así que la cocina sigue recibiendo $12. Tu edición cambió solo tu copia.

La receta con "Rinde: -2" enseña lo mismo, pero al revés. La Console muestra los errores del código de la página. El código se ejecutó sin ningún error y aun así produjo un número incorrecto. Que no haya una línea roja no significa que no haya un bug.

## Profundiza

### Una idea equivocada común: "la Console está limpia, así que no hay bug"

La Console muestra los errores del código de la página. Muchos bugs no son errores. Una página puede mostrar un número incorrecto, y todas las peticiones pueden responder `200`. El código hace lo que se le dijo, pero el resultado está mal. Nada está en rojo.

Una Console limpia es una buena señal, pero no es una prueba. Aun así comparas lo que ves con lo que se espera. Aun así lees la respuesta en el panel Network y compruebas que los datos sean correctos.

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

Podrías guardarlo como `e2e/practice-no-errors.spec.ts` en el repositorio del curso. La línea con `page.on` le dice a Playwright: cuando la página tenga un error, guarda su mensaje en la lista. Al final, la lista debe estar vacía. No necesitas escribir esto ahora. Solo muestra que las DevTools y Playwright miran el mismo navegador.

Otra acción útil: haz clic derecho en una petición del panel Network, elige **Copy** (Copiar) y luego **Copy as cURL**. Obtienes un comando que repite la petición. Puedes agregarlo a un reporte de bug.

### Un equilibrio: las DevTools te ayudan a mirar, pero no dejan huella

- Los cambios en el panel Elements existen solo en tu pestaña. Una recarga los borra. Úsalos para probar una idea, como "¿qué pasa si este texto fuera más largo?". No son una solución, y una ejecución de tests no los ve.
- Una petición copiada puede incluir tu cookie, y una cookie puede ser una contraseña. Quítala antes de pegarla en un ticket que lee mucha gente.
- El panel Network puede hacer más lenta la conexión. Elige un perfil de limitación (*throttling*) como **Slow 4G**. Esto muestra lo que ve un usuario con mala conexión, por ejemplo si el texto "Loading..." se queda en pantalla.

## Práctica

1. Abre `http://localhost:5180/#/practice`. Pulsa `F12`.
2. Haz clic en el selector de elementos. Haz clic en el botón **Load report** (cargar reporte). Lee su `data-testid` en el panel Elements.
3. Abre la Console. Ejecuta `document.title`. Luego ejecuta `document.querySelectorAll("input").length`. El resultado es 3.
4. Agrega un caso en la sección 2 y ejecuta la cuenta otra vez. Explica el número nuevo.
5. Ejecuta `nonexistentThing` en la Console. Lee el error rojo. Así se ve un error.
6. En una segunda terminal, inicia la tienda de práctica:

```bash
pnpm shop:dev
```

7. Abre `http://localhost:5190` en una pestaña nueva. Abre las DevTools y el panel **Network**. Activa **Preserve log**.
8. Escribe el correo `admin@qa-shop.test` y una contraseña incorrecta. Haz clic en **Sign in** (iniciar sesión).
9. En el panel Network, busca la petición `login`. Lee su **Status**. Haz clic en ella y lee la **Response**.
10. Lee el mensaje de error rojo de la página. Compáralo con la respuesta.
11. Detén la tienda con `Ctrl + C` en su terminal cuando termines.

## Reto

Haz que Playwright haga lo que hace el panel Network. Escribe un test que abra una página del sitio del curso, registre cada petición que envía el navegador e informe lo que vio. Elige tú la página: la página Practice o cualquier página de lección. El test también debe fallar cuando una petición falla.

**Está terminado cuando:**

1. Ejecutas `pnpm e2e e2e/challenges/devtools-network.spec.ts` y el test pasa.
2. El test imprime una línea por cada tipo de petición con su cantidad, por ejemplo `script: 12`, y una línea con el total.
3. La lista contiene una petición `document`, así sabes que empezaste a escuchar antes de que la página cargara.
4. Demuestras que el test puede fallar: agrega una línea que haga que la página llame a una dirección donde nadie escucha, ejecuta el test, mira que falle con un mensaje que nombre esa dirección y luego quita la línea.
5. Comparas tu total con el panel Network después de recargar con la caché desactivada. Escribes una frase en un comentario sobre por qué los dos números pueden ser distintos.

Vas a necesitar algo que esta lección no enseñó: cómo escuchar cada petición, cómo leer el tipo de una petición y cómo notar una petición que falló. Busca: `playwright page.on request resourceType` y `playwright requestfailed event`. Para el criterio 4, busca también: `playwright page.evaluate fetch`.

Crea tú mismo el archivo `e2e/challenges/devtools-network.spec.ts`. Importa `test` y `expect` desde `../lib/test`. No uses `waitForTimeout`.

## Piénsalo bien

1. La página Practice no tiene casos. Ejecutas `document.querySelectorAll("input").length` y obtienes 3. Agregas dos casos y lo ejecutas otra vez. ¿Qué obtienes y por qué?

<details>
<summary>Respuesta</summary>

Obtienes 5. Cada fila de caso tiene una casilla de verificación, y una casilla es un elemento `input`. Dos casos suman dos. Los tres campos de texto siguen ahí. La lección de la pregunta: un número de la Console cuenta elementos de un tipo, y debes saber qué encuentra realmente el selector.

</details>

2. El dashboard de la tienda muestra "Products 0". La Console está limpia. El panel Network muestra la petición `stats` con estado `200`, y su Response dice `"products": 24`. ¿Dónde está el bug y por qué no viste un error rojo?

<details>
<summary>Respuesta</summary>

El servidor envió el número correcto, así que el bug está en el código de la página que lo muestra. El código se ejecutó sin fallar, así que la Console no tenía nada que reportar. Es un bug de lógica, no un error. La pestaña Response es la prueba que necesitas: muestra que los datos eran correctos cuando salieron del servidor.

</details>

3. Quieres saber cómo se ve en la tabla el nombre de un producto con 80 letras. Versión A: editar el texto en el panel Elements. Versión B: crear un producto con un nombre largo usando el formulario. Las dos dan una imagen. ¿Cuál eliges primero y qué te haría usar la otra?

<details>
<summary>Respuesta</summary>

La versión A es más rápida, úsala para una primera mirada al diseño. Pero se salta el formulario, el servidor y las reglas, así que puede mostrar una imagen falsa. Por ejemplo, el servidor puede cortar o rechazar un nombre de 80 letras. Usa la versión B cuando el resultado vaya a un reporte de bug o a un test, porque son datos reales por el camino real.

</details>

4. Desactivas **Preserve log**. Inicias sesión con una contraseña correcta. La página pasa a `/dashboard`. ¿Qué ves en el panel Network y qué te cuesta eso?

<details>
<summary>Respuesta</summary>

La lista muestra solo las peticiones de la página nueva. La petición `login` desapareció, porque el cambio de página borró la lista. Si el inicio de sesión tuvo un problema, perdiste la mejor prueba: el estado y la respuesta. Activa **Preserve log** antes de cualquier acción que cambie de página.

</details>

5. Explica a un colega, en tres frases y sin usar la palabra "DOM", por qué tu edición en el panel Elements desaparece cuando recargas.

<details>
<summary>Respuesta</summary>

Una respuesta modelo: El navegador guarda una copia de trabajo de la página, y el panel Elements edita esa copia. Al recargar, el navegador le pregunta de nuevo al servidor y construye una copia nueva con lo que el servidor envía. Tu edición nunca se envió al servidor, así que se pierde. Una buena respuesta dice dónde vive la verdad (el servidor) y dónde vivió tu cambio (solo tu pestaña).

</details>

6. Un colega dice: "Siempre adjunta el Copy as cURL completo a cada reporte de bug". ¿Estás de acuerdo?

<details>
<summary>Respuesta</summary>

Hay un equilibrio. Un comando completo permite al desarrollador repetir la petición de inmediato, lo que ahorra tiempo. Pero puede contener una cookie o un token, y un ticket puede ser leído por mucha gente. Depende de quién lee el ticket y de cuánto dura la sesión. Un buen hábito: adjunta el comando con las partes secretas reemplazadas y escribe los pasos con palabras.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Cómo se hace más lenta la red en las DevTools de Chrome y por qué lo haría un tester?**
   - Busca: `chrome devtools network throttling`
   - Pruébalo: abre el dashboard de la tienda. Anota el **Time** de la petición `stats` sin limitación. Elige **Slow 4G**, recarga y anota el tiempo otra vez.
   - Una buena respuesta explica: los pasos para elegir un perfil, los dos tiempos que mediste y un bug que solo se ve con una conexión lenta.
2. **¿Qué es un archivo HAR y por qué puede ser riesgoso compartirlo?**
   - Busca: `HAR file network export`
   - Pruébalo: inicia sesión en la tienda con una contraseña incorrecta, exporta el archivo HAR desde el panel Network, ábrelo en un editor de texto y busca la palabra `password`.
   - Una buena respuesta explica: qué registra un archivo HAR, cómo se guarda uno y qué datos privados puede contener.
3. **¿Cómo puedes probar una página con el tamaño de un teléfono usando las DevTools?**
   - Busca: `chrome devtools device mode`
   - Pruébalo: abre la página Practice en el modo dispositivo. Haz el ancho más pequeño poco a poco y encuentra el ancho en que el menú del curso pasa debajo del contenido.
   - Una buena respuesta explica: cómo abrir el modo dispositivo, qué puede simular, el ancho que encontraste y una cosa que no puede reemplazar, como un teléfono real.

## Siguiente paso

En la próxima lección aprenderás qué contienen una petición y una respuesta, y qué significan los códigos de estado.
