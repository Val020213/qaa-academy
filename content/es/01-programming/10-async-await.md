---
title: async y await
summary: Predice el orden del trabajo lento, evita el bug del await olvidado y decide cuándo las tareas corren una por una o juntas.
duration: 75 min
---

## Empieza con un acertijo

Preparas té. Este programa describe los pasos. El temporizador de la tetera está en cero milisegundos. Eso significa "lista al instante".

```ts
console.log("Put the kettle on");
setTimeout(() => console.log("Kettle is ready"), 0);
console.log("Get a cup");
```

`setTimeout` ejecuta una función después de un tiempo. Aquí el tiempo es 0.

¿En qué orden se imprimen las tres líneas? ¿Cero milisegundos es de verdad "al instante"?

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Predecir en qué orden se imprimen las líneas de código lento y de código rápido.
- Usar `async` y `await` para que tu código espere donde debe.
- Detectar el *bug* del `await` olvidado, que no da ningún mensaje de error.
- Decidir cuándo las tareas deben correr una tras otra y cuándo juntas.

## Algunas tareas toman tiempo

Hasta ahora, cada línea de código terminaba al instante. El trabajo real es más lento.

- Un teléfono le pide a un servidor el clima de mañana.
- Una app de música carga una canción desde internet.
- Un temporizador de cocina cuenta diez minutos.
- Un navegador abre una página.

La computadora no se detiene a esperar por sí sola. Tú debes decirle a tu código dónde esperar.

## Promise

Una **Promise** (promesa) es un valor que todavía no está listo. Es como el ticket que recibes en el mostrador de una panadería. Aún no tienes el pan, pero tienes la promesa del pan. El resultado puede ser un éxito o un fallo.

El tipo `Promise<string>` significa "un *string* (texto) que llegará más tarde".

Aquí hay un *helper* (ayudante) que simula trabajo lento. Espera unos milisegundos. Un milisegundo es una milésima de segundo.

```ts
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

Por ahora no necesitas entender el interior de este *helper*. Úsalo como una herramienta. `Promise<void>` significa "no llegará ningún valor, pero terminará más tarde".

## async y await

Pon `await` antes de una Promise para decir: "espera aquí hasta que esté lista y dame el resultado".

Puedes usar `await` dentro de una función marcada con `async`. También puedes usarlo en el nivel superior de un módulo. Una función `async` siempre devuelve una Promise.

```ts
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadForecast(): Promise<string> {
  await wait(500);
  return "sunny";
}

async function main(): Promise<void> {
  console.log("Asking for the forecast...");
  const forecast = await loadForecast();
  console.log(`Forecast: ${forecast}`);
}

main();
```

El programa imprime `Asking for the forecast...`. Medio segundo después imprime:

```text
Forecast: sunny
```

Lee `await loadForecast()` como "espera a que loadForecast termine". La variable `forecast` es un `string` normal, no una Promise.

## ¿Y si falta el await?

Antes de seguir, mira el mismo programa con un cambio. Ya no está el `await` antes de `loadForecast()`.

```ts
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadForecast(): Promise<string> {
  await wait(500);
  return "sunny";
}

async function main(): Promise<void> {
  const forecast = loadForecast();
  console.log(`Forecast: ${forecast}`);
}

main();
```

¿Qué esperas? ¿Imprimirá `sunny`, nada o un error?

El programa imprime:

```text
Forecast: [object Promise]
```

La variable `forecast` guarda la Promise, no el resultado. El programa no esperó. Imprimió demasiado pronto. No hay ningún mensaje de error. Este es el tipo difícil de *bug*.

> **Consejo:** Cuando un valor se vea como `[object Promise]`, o un programa se comporte distinto en cada ejecución, revisa primero si falta un `await`.

Ahora un caso más difícil. Falta el `await`, y la función no imprime el resultado. Imprime un mensaje más tarde.

```ts
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function slowLog(): Promise<void> {
  await wait(100);
  console.log("pasta is ready");
}

async function main(): Promise<void> {
  slowLog();
  console.log("table is set");
}

main();
```

Adivina el orden de las dos líneas. Luego lee el resultado:

```text
table is set
pasta is ready
```

Una idea equivocada es "sin `await`, la función no se ejecuta". Sí se ejecuta. Solo que no la esperas. `await` pausa únicamente la función que lo contiene.

### De vuelta al acertijo

La salida es:

```text
Put the kettle on
Get a cup
Kettle is ready
```

JavaScript hace una sola cosa a la vez. Cuando llega a `setTimeout`, entrega el temporizador y sigue con la línea siguiente. Incluso con 0 milisegundos, la función del temporizador espera a que termine el código actual. "Cero" significa "en cuanto estés libre", no "ahora". El trabajo lento siempre termina después del código que ya se está ejecutando.

## try y catch

Una Promise puede fallar. Un servidor puede estar caído. Una canción puede no existir. Cuando una Promise con `await` falla, lanza un error.

Usa `try` y `catch` para manejar el error. El código de `try` se ejecuta primero. Si lanza un error, se ejecuta el código de `catch`.

```ts
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadSong(id: number): Promise<string> {
  await wait(100);
  if (id !== 1) {
    throw new Error(`Song ${id} not found`);
  }
  return "Blue in Green";
}

async function main(): Promise<void> {
  try {
    const title = await loadSong(2);
    console.log(title);
  } catch (error) {
    console.log("Something went wrong:", error instanceof Error ? error.message : error);
  }
}

main();
```

El programa imprime:

```text
Something went wrong: Song 2 not found
```

La comprobación `error instanceof Error` asegura que el error tenga un `message`. TypeScript no sabe qué tipo de valor se lanzó, así que tú debes comprobarlo.

## Await dentro de un bucle

Puedes usar `await` dentro de un bucle `for...of`. Cada paso termina antes de que empiece el siguiente.

```ts
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  const songs = ["Intro", "Chorus", "Outro"];
  for (const song of songs) {
    await wait(100);
    console.log(`${song} loaded`);
  }
}

main();
```

El programa imprime tres líneas, una cada 100 milisegundos.

## Una tras otra, o juntas

Cada `await` seguido espera al anterior. Tres canciones de 100 ms cada una necesitan 300 ms. ¿Es esa la mejor forma? Si la canción 2 no necesita a la canción 1, puedes empezar las tres a la vez con `Promise.all`.

Adivina los dos tiempos antes de ejecutar esto. Usa la función `wait` de arriba.

```ts
async function main(): Promise<void> {
  const startOne = Date.now();
  await wait(100);
  await wait(100);
  await wait(100);
  console.log(`One by one: ${Date.now() - startOne} ms`);

  const startAll = Date.now();
  await Promise.all([wait(100), wait(100), wait(100)]);
  console.log(`Together: ${Date.now() - startAll} ms`);
}

main();
```

La primera línea marca unos 300 ms y la segunda unos 100 ms (en una ejecución real: 302 ms y 101 ms). Juntas es más rápido, pero solo cuando las tareas no dependen unas de otras. No puedes servir el té antes de que el agua esté caliente.

## Profundiza

### Por qué el código no espera por sí solo

JavaScript hace una sola cosa a la vez. Cuando empieza un trabajo lento, como un temporizador o una petición, no se queda quieto. Entrega el trabajo y continúa con la línea siguiente. Cuando el trabajo lento termina, vuelve a él. Por eso la tetera del acertijo se imprimió al final.

### Una idea equivocada: forEach espera al código async

El método `forEach` inicia una función async por cada elemento. No espera a ninguna. Usa `for...of` con `await` cuando necesites esperar cada paso. Las preguntas de abajo muestran el resultado.

### Cómo aparece en el trabajo de automatización QA

Aquí tienes una muestra de código de Playwright. Todavía no lo ejecutes.

```ts
await page.goto("https://example.com/login");
await page.getByLabel("Email").fill("ana@example.com");
await page.getByRole("button", { name: "Log in" }).click();
```

Léelo como los pasos de una prueba manual: abrir la página, escribir el correo, hacer clic en el botón. Cada paso toma tiempo, así que cada paso lleva `await`.

Un `await` olvidado en una comprobación es peligroso. Mira esta línea:

```ts
expect(page.getByTestId("report-result")).toContainText("12 tests");
```

La comprobación devuelve una Promise y nadie la espera. Lo que pasa no es predecible. En las ejecuciones que observamos, el *test* falló al instante, sin esperar el texto. En otras situaciones, un *test* puede terminar antes de que la comprobación acabe. De cualquier forma, la solución es la misma: escribe siempre `await expect(...)`.

Este es el *test* correcto. Espera el reporte lento y no usa una pausa fija como `waitForTimeout`:

```ts
import { expect, test } from "./lib/test";

test("shows the report when loading ends", async ({ page }) => {
  await page.goto("/#/practice");
  await page.getByTestId("report-load").click();

  await expect(page.getByTestId("report-result")).toContainText("12 tests");
});
```

`expect` lo intenta una y otra vez hasta que aparece el texto o se acaba el tiempo. Una pausa fija o es demasiado corta, y el *test* falla, o es demasiado larga, y la *suite* (el conjunto de tests) se vuelve lenta.

## Práctica

1. Crea el archivo `exercises/01-programming/async-practice.ts`.
2. Copia el primer ejemplo de `wait` de la sección "async y await". Ejecútalo con `node exercises/01-programming/async-practice.ts`.
3. Quita el `await` antes de `loadForecast()` y ejecútalo de nuevo. Lee la salida.
4. Vuelve a poner el `await`.
5. Abre `exercises/01-programming/10-async-await.ts`. Reemplaza cada `// TODO` con código.
6. Ejecuta el archivo del ejercicio con este comando:

```bash
node exercises/01-programming/10-async-await.ts
```

Haz que cada línea diga `OK`.

## Reto

Tres tiendas reportan su inventario: una panadería, una lechería y un puesto de fruta. Cada reporte es una función async lenta. La panadería tarda 200 ms, la lechería 300 ms y el puesto de fruta 100 ms. La lechería siempre falla con un error. Escribe un programa que consulte a las tres tiendas al mismo tiempo e imprima una línea por cada tienda. Una tienda que falla no debe detener a las otras dos. Puedes elegir otro mundo: tres estaciones del clima, tres servicios de música, tres ligas de fútbol.

Crea el archivo `exercises/challenges/10-async-await.ts`.

Está terminado cuando:

- Ejecutas `node exercises/challenges/10-async-await.ts` e imprime una línea con etiqueta por cada tienda, por ejemplo `dairy: failed, fridge is offline`.
- El programa no se rompe, aunque una tienda falle.
- El programa imprime el tiempo total, y el total está cerca de 300 ms, no de 600 ms.
- Ninguna línea imprime `[object Promise]`, y no usas `forEach` con `async`.

Vas a necesitar algo que esta lección no enseñó: una forma de esperar muchas Promises y conservar tanto los éxitos como los fallos. `Promise.all` se detiene en el primer fallo. Busca: `promise.allsettled status fulfilled rejected`.

## Piénsalo bien

1. ¿Qué imprime este programa y en qué orden? ¿Por qué?

```ts
async function main(): Promise<void> {
  const ids = [1, 2, 3];
  ids.forEach(async (id) => {
    await wait(100);
    console.log(`done ${id}`);
  });
  console.log("finished");
}

main();
```

Usa la función `wait` de esta lección.

<details><summary>Respuesta</summary>

Imprime `finished` primero. Después imprime `done 1`, `done 2` y `done 3`, unos 100 ms más tarde. `forEach` no espera a las funciones async. Inicia las tres y sigue, así que `finished` se imprime antes de que termine cualquiera de ellas. Para esperar cada una, usa un bucle `for...of` con `await` dentro.

</details>

2. Este código tiene un *bug*. Se ejecuta, pero hace lo incorrecto. Encuéntralo.

```ts
async function isLoaded(): Promise<boolean> {
  await wait(100);
  return false;
}

async function main(): Promise<void> {
  if (isLoaded()) {
    console.log("loaded");
  } else {
    console.log("not loaded");
  }
}

main();
```

<details><summary>Respuesta</summary>

Falta el `await` antes de `isLoaded()`. El `if` recibe una Promise, y para un `if` una Promise siempre es "verdadera". Así que el programa siempre imprime `loaded`, aunque la función devuelva `false`. Con la configuración estricta, TypeScript reporta un error: "This condition will always return true since this 'Promise<boolean>' is always defined." Escribe `if (await isLoaded())`.

</details>

3. Cargas tres canciones para una lista de reproducción. La versión A usa un bucle `for...of` con `await`. La versión B usa `Promise.all`. Ambas dan la lista correcta. ¿Cuál es mejor aquí y qué te haría elegir la otra?

<details><summary>Respuesta</summary>

La versión B es mejor cuando las tres canciones no dependen unas de otras, porque el tiempo total es el de la canción más lenta, no la suma. La versión A es mejor cuando el orden importa, por ejemplo cuando la canción 2 necesita el resultado de la canción 1. También es mejor cuando el servidor permite una sola petición a la vez, o cuando quieres detenerte en el primer fallo y no empezar más trabajo. La elección depende de dos cosas: si las tareas dependen unas de otras y si el servidor acepta muchas peticiones a la vez.

</details>

4. En este programa se quitó el `await` antes de `loadSong(2)`. La función `loadSong` lanza un error para todos los ids excepto el 1. ¿Qué esperas que pase y qué se rompe?

```ts
async function main(): Promise<void> {
  try {
    const title = loadSong(2);
    console.log(title);
  } catch (error) {
    console.log("Something went wrong");
  }
  console.log("end of main");
}

main();
```

Usa `loadSong` de la sección "try y catch".

<details><summary>Respuesta</summary>

Imprime `Promise { <pending> }` y `end of main`. Después Node se cierra con el error "Song 2 not found", y `catch` nunca se ejecuta. Sin `await`, el error no ocurre dentro del bloque `try`. Ocurre más tarde, dentro de la Promise, cuando nadie escucha. Así que un `await` faltante no solo da un valor incorrecto. También hace inútiles a `try` y `catch`.

</details>

5. Explícale a un compañero qué hace `await`, en tres frases, sin usar la palabra "esperar".

<details><summary>Respuesta</summary>

No hay un único texto correcto, pero una buena respuesta tiene tres ideas. Primero, `await` pausa la función donde está, hasta que el trabajo lento tiene un resultado. Segundo, te da el valor real, no la Promise. Tercero, el otro código fuera de esta función puede seguir ejecutándose mientras ella está en pausa. Si tu respuesta no dice que la pausa es solo para esta función, no está completa.

</details>

6. ¿Qué pasa con `await Promise.all([])`, una lista sin tareas? ¿El programa se detiene, se queda colgado para siempre o continúa? ¿Por qué importa esto cuando la lista viene de una búsqueda que no encuentra nada?

<details><summary>Respuesta</summary>

Continúa al instante, y el resultado es un *array* vacío `[]`. No hay Promises que esperar, así que "todas están terminadas" ya es verdad. Esto es útil: una búsqueda que no encuentra nada no necesita un caso especial. Pero aun así debes decidir qué mostrarle al usuario, por ejemplo el mensaje "sin resultados", porque `[]` no es un error.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es el event loop (bucle de eventos) y por qué JavaScript puede esperar sin congelarse?**
   - Busca: `javascript event loop explained`
   - Pruébalo: escribe un bucle que cuente hasta 3 mil millones y pon un `console.log` después de un `setTimeout` de 0 ms. Ejecútalo y observa cuándo aparece el log.
   - Una buena respuesta explica: qué son la pila de llamadas y la cola, por qué la función de un temporizador se ejecuta más tarde y por qué un bucle largo puede congelar una página.

2. **¿Por qué la función de una Promise se ejecuta antes que un temporizador de 0 ms?**
   - Busca: `microtask queue vs macrotask javascript`
   - Pruébalo: agrega la línea `Promise.resolve().then(() => console.log("promise"));` entre las dos primeras líneas del acertijo. Predice el nuevo orden y luego ejecútalo.
   - Una buena respuesta explica: qué es una microtarea, qué cola se ejecuta primero y por qué esto rara vez es un problema en el trabajo diario.

3. **¿Por qué una pausa fija es una mala forma de esperar en un test de UI, y qué hace Playwright en su lugar?**
   - Busca: `playwright auto-waiting actionability`
   - Pruébalo: en la Practice app (app de práctica), haz clic en "Load report" (cargar reporte) y mide cuánto tiempo se queda el texto "Loading…" (cargando). Luego di qué haría aquí un *test* con una pausa fija de 1000 ms, y qué haría si el reporte tardara 5 segundos.
   - Una buena respuesta explica: qué comprueba Playwright antes de hacer clic, cómo reintentan las aserciones y por qué una pausa fija vuelve los *tests* *flaky* (inestables) o lentos.

## Siguiente paso

En la siguiente lección aprendes a dividir el código en archivos y a compartirlo con `export` e `import`.
