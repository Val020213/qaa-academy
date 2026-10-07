---
title: Las DevTools del navegador
duration: 60 min
---

## Objetivo

En esta lección usas las DevTools para investigar un bug desde el navegador. Comparas los elementos, los mensajes y las peticiones de una página con lo que esperabas ver.

- Inspeccionar y modificar un elemento en el panel Elements.
- Ejecutar JavaScript y leer errores en la Console.
- Leer una petición, su estado y su respuesta en Network.
- Elegir un panel según el síntoma y guardar evidencia para un reporte de bug.

## Abre las DevTools

Las **DevTools** vienen incluidas en el navegador. Esta lección usa los paneles Elements, Console y Network de Chrome y Edge.

Usa una de estas formas para abrirlas:

- Pulsa `F12`.
- Pulsa `Ctrl + Shift + I`.
- Haz clic derecho sobre un elemento de la página y elige **Inspect** (Inspeccionar).

Las DevTools se abren al lado o abajo de la ventana. Arriba hay una fila de pestañas, llamadas **paneles**. Si falta un panel, haz clic en `>>` para ver más.

## El panel Elements

El panel **Elements** (Elementos) muestra el DOM como un árbol. Puedes abrir y cerrar elementos con las flechas pequeñas.

El **selector de elementos** es el icono de flecha arriba a la izquierda de las DevTools. Haz clic en él y luego en un elemento de la página. Las DevTools seleccionan ese elemento en el árbol. También puedes pulsar `Ctrl + Shift + C`.

Mira cómo las DevTools encuentran el campo de correo y muestran su `data-testid`.

![Elements en las DevTools encuentra el campo de correo y muestra su atributo data-testid. El clip usa el puerto 5186; en la práctica usarás 5180.](/clips/devtools-elements.webm)

Cuando seleccionas un elemento, revisa:

- Sus atributos, como `data-testid`.
- Su padre y sus hijos.
- El panel **Styles** (Estilos) a la derecha, que muestra el CSS del elemento.

Puedes hacer doble clic en un atributo o en un texto y cambiarlo. El cambio existe solo en el DOM de tu pestaña: no modifica los archivos del servidor ni la página de un colega. Al pulsar `F5`, el navegador reconstruye el DOM y tu edición desaparece.

Usa una edición para probar cómo se ve un texto más largo. Para comprobar el flujo completo, crea ese dato mediante el formulario: la edición en Elements se salta el formulario y las reglas del servidor.

## El panel Console

La **Console** (Consola) muestra mensajes de la página. Los errores son rojos y las advertencias son amarillas. Una línea de error normalmente incluye el nombre del archivo y el número de línea al lado derecho.

También puedes escribir JavaScript junto al signo `>` y pulsar `Enter`. El navegador ejecuta el código y la Console muestra el resultado debajo.

En la página Practice del curso, en `http://localhost:5180/#/practice`, sin casos agregados:

```text
> document.title
'QAA Academy'

> document.querySelectorAll("input").length
3
```

Los tres campos son Email, Password y New case. Si agregas un caso en la sección 2 y ejecutas la segunda línea otra vez, obtienes 4. Cada fila agrega una casilla de verificación, que también es un `input`.

Una Console sin errores no prueba que la página sea correcta. El código puede ejecutarse sin fallar y mostrar un número equivocado. Compara el resultado con el requisito y, si viene del servidor, con la respuesta en Network.

## El panel Network

Cuando una página carga un archivo o pide datos a un servidor, el navegador envía una **petición** (*request*). El panel **Network** (Red) muestra una fila por petición. La carga de la página puede incluir peticiones separadas para el documento, los scripts, los estilos y los datos.

1. Abre el panel Network **antes** de la acción que quieres estudiar. Las DevTools registran las peticiones mientras están abiertas y la grabación está activa, aunque cambies de panel.
2. Haz la acción en la página, por ejemplo hacer clic en un botón.
3. Revisa las peticiones de la lista.

Las columnas principales son:

- **Name** (nombre): el final de la dirección.
- **Status** (estado): el código del resultado. `200` significa éxito. Un número desde 400 en adelante significa un problema.
- **Type** (tipo): por ejemplo `document`, `script` o `fetch`.
- **Time** (tiempo): cuánto tardó la petición.

Para ver las llamadas de datos, haz clic en el filtro **Fetch/XHR**. Luego haz clic en una petición para ver sus detalles:

- **Headers** (encabezados): la dirección, el método, el estado y más información.
- **Payload** (carga): los datos que envió la página. Aparece en las peticiones que envían datos.
- **Response** (respuesta): los datos que el servidor devolvió.

Sin **Preserve log** (conservar registro), la lista se borra cuando se carga un documento nuevo, y la petición que querías ya no está. Actívalo antes de iniciar sesión para conservar la petición y su respuesta después de la navegación.

## Investigar un bug con las DevTools

Elige el panel según el síntoma. Si una página no responde a una acción, revisa la Console. Si muestra datos incorrectos, mira Network y compara la Response con la pantalla. Para un problema de aspecto, revisa Elements.

1. Reproduce el problema con las DevTools abiertas y el panel Network preparado.
2. Lee los errores de la **Console**, si los hay.
3. En **Network**, revisa el estado y la **Response** de la petición relacionada con la acción.
4. En **Elements**, comprueba que el elemento exista, sea visible y tenga los atributos esperados.
5. Anota los pasos, la dirección de la petición, el código de estado y el mensaje para el reporte de bug.

## Profundiza

### Copiar una petición

Haz clic derecho en una petición del panel Network, elige **Copy** (Copiar) y luego **Copy as cURL**. Obtienes un comando que repite la petición y que puedes adjuntar a un reporte de bug.

Una petición copiada puede incluir la cookie de sesión. En la tienda contiene un token que permite usar tu sesión. Quítala antes de pegarla en un ticket que lee mucha gente.

### Simular una conexión lenta

En el panel Network, elige un perfil de limitación (*throttling*) como **Slow 4G**. Puedes observar cuánto tarda una petición y si el texto "Loading..." permanece en pantalla durante la espera.

## Práctica

1. Abre `http://localhost:5180/#/practice` sin casos agregados. Pulsa `F12`.
2. Haz clic en el selector de elementos y selecciona el botón **Load report** (cargar reporte). Lee su `data-testid` en el panel Elements.
3. Abre la Console. Ejecuta `document.title`. Luego ejecuta `document.querySelectorAll("input").length`. El resultado es 3.
4. Agrega un caso en la sección 2 y ejecuta la cuenta otra vez. Comprueba que el elemento nuevo es una casilla de verificación.
5. Ejecuta `nonexistentThing` en la Console. Lee el error rojo.
6. En una segunda terminal, inicia la tienda de práctica:

```bash
pnpm shop:dev
```

7. Abre `http://localhost:5190` en una pestaña nueva. Abre las DevTools y el panel **Network**. Activa **Preserve log**.
8. Escribe el correo `admin@qa-shop.test` y una contraseña incorrecta. Haz clic en **Sign in** (iniciar sesión).
9. Busca la petición `login` en Network. Lee su **Status** y su **Response**. Compara la respuesta con el mensaje de error rojo de la página.
10. Detén la tienda con `Ctrl + C` en su terminal cuando termines.

## Reto

Escribe un test de Playwright que abra la página Practice o una página de lección, registre cada petición del navegador e informe lo que vio. El test debe fallar cuando una petición no se completa por un fallo de transporte. Una respuesta HTTP como 404 o 500 no dispara `requestfailed`.

Crea el archivo `e2e/challenges/devtools-network.spec.ts`. Importa `test` y `expect` desde `../lib/test`. No uses `waitForTimeout`.

Está terminado cuando:

1. Ejecutas `pnpm e2e e2e/challenges/devtools-network.spec.ts` y el test pasa.
2. El test imprime una línea por cada tipo de petición con su cantidad, por ejemplo `script: 12`, y una línea con el total.
3. La lista contiene una petición `document`, porque empezaste a escuchar antes de que la página cargara.
4. Agregas una línea que haga que la página llame a una dirección donde nadie escucha. El test falla con un mensaje que nombra esa dirección. Luego quitas la línea.

Busca: `playwright page.on request resourceType`, `playwright requestfailed event` y, para el criterio 4, `playwright page.evaluate fetch`.

## Piénsalo bien

1. La página Practice no tiene casos. Ejecutas `document.querySelectorAll("input").length` y obtienes 3. Agregas dos casos y lo ejecutas otra vez. ¿Qué obtienes y por qué?

<details>
<summary>Respuesta</summary>

Obtienes 5. Cada fila agrega una casilla de verificación, que es un elemento `input`. Los tres campos iniciales siguen ahí.

</details>

2. Sabes que la tienda tiene 24 productos, pero el dashboard muestra "Products 0". La Console está limpia. El panel Network muestra la petición `stats` con estado `200`, y su Response dice `"products": 24`. ¿Dónde está el bug y por qué no viste un error rojo?

<details>
<summary>Respuesta</summary>

El servidor envió el número correcto, así que revisa el código de la página que lo muestra. Ese código puede producir un resultado equivocado sin lanzar un error que aparezca en la Console.

</details>

3. Desactivas **Preserve log**. Inicias sesión en la tienda con una contraseña correcta. La página pasa a `/dashboard`. ¿Qué evidencia pierdes en el panel Network?

<details>
<summary>Respuesta</summary>

La petición `login`, su estado y su respuesta desaparecen de la lista cuando la tienda carga la página nueva.

</details>

## Siguiente paso

En la próxima lección aprenderás qué contienen una petición y una respuesta, y qué significan los códigos de estado.
