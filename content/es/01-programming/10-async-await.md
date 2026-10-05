---
title: async y await
summary: Maneja el trabajo que toma tiempo, evita el bug del await olvidado y lee cómo espera el código de Playwright.
duration: 45 min
---

## Objetivo

- Explicar por qué algunas tareas toman tiempo y por qué el código debe esperarlas.
- Usar `async` y `await` correctamente.
- Detectar el *bug* del `await` olvidado.
- Manejar un fallo con `try` y `catch`.

## Algunas tareas toman tiempo

Hasta ahora, cada línea de código terminaba al instante. El trabajo real es más lento.

- Cargar datos desde un servidor toma tiempo.
- Abrir una página web en un navegador toma tiempo.
- Hacer clic en un botón y esperar la respuesta toma tiempo.

Playwright hace todas estas cosas. La computadora no se detiene a esperar por sí sola. Tú debes indicarle a tu código dónde esperar.

## Promise

Una **Promise** (promesa) es un valor que todavía no está listo. Es la promesa de que un resultado llegará más tarde. El resultado puede ser un éxito o un fallo.

El tipo `Promise<string>` significa "un *string* (texto) que llegará más tarde".

Aquí hay un *helper* (función auxiliar) que simula trabajo lento. Espera unos milisegundos. Un milisegundo es una milésima de segundo.

```ts
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

Por ahora no necesitas entender el interior de esta función. Úsala como herramienta. `Promise<void>` significa "no llegará ningún valor, pero terminará más tarde".

## async y await

Pon `await` antes de una Promise para decir: "espera aquí hasta que esté lista y dame el resultado".

Solo puedes usar `await` dentro de una función marcada con `async`. Una función `async` siempre devuelve una Promise.

```ts
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadStatus(): Promise<string> {
  await wait(500);
  return "passed";
}

async function main(): Promise<void> {
  console.log("Loading...");
  const status = await loadStatus();
  console.log(`Status: ${status}`);
}

main();
```

El programa muestra `Loading...`. Después de medio segundo muestra:

```text
Status: passed
```

Lee `await loadStatus()` como "espera a que loadStatus termine". La variable `status` es un `string` normal, no una Promise.

## El bug del await olvidado

Este es el bug número uno de quienes empiezan con Playwright. Mira este código. Falta el `await`.

```ts
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadStatus(): Promise<string> {
  await wait(500);
  return "passed";
}

async function main(): Promise<void> {
  const status = loadStatus();
  console.log(`Status: ${status}`);
}

main();
```

El programa muestra:

```text
Status: [object Promise]
```

La variable `status` guarda la Promise, no el resultado. El programa no esperó. Mostró el texto demasiado pronto.

En un *test* real, este bug es peor. El test sigue adelante antes de que la página esté lista. A veces falla y a veces pasa. A un test así se le llama *flaky* (inestable).

> **Consejo:** Cuando un valor se vea como `[object Promise]`, o un test se comporte distinto en cada ejecución, revisa primero si falta un `await`.

## try y catch

Una Promise puede fallar. Un servidor puede estar caído. Un botón puede no existir. Cuando una Promise con `await` falla, lanza un error.

Usa `try` y `catch` para manejar el error. El código dentro de `try` se ejecuta primero. Si lanza un error, se ejecuta el código de `catch`.

```ts
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadTitle(id: number): Promise<string> {
  await wait(100);
  if (id !== 1) {
    throw new Error(`Test case ${id} not found`);
  }
  return "Login works";
}

async function main(): Promise<void> {
  try {
    const title = await loadTitle(2);
    console.log(title);
  } catch (error) {
    console.log("Something went wrong:", error instanceof Error ? error.message : error);
  }
}

main();
```

El programa muestra:

```text
Something went wrong: Test case 2 not found
```

La comprobación `error instanceof Error` asegura que el error tenga un `message`. TypeScript no sabe qué tipo de valor se lanzó, así que debes comprobarlo.

## Usar await en un bucle

Puedes usar `await` dentro de un bucle `for...of`. Cada paso termina antes de que empiece el siguiente.

```ts
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  const ids = [1, 2, 3];
  for (const id of ids) {
    await wait(100);
    console.log(`Test case ${id} done`);
  }
}

main();
```

El programa muestra tres líneas, una cada 100 milisegundos.

## Vista previa: cómo se lee Playwright

Esta es una muestra de código de Playwright. Todavía no lo ejecutas.

```ts
await page.goto("https://example.com/login");
await page.getByLabel("Email").fill("ana@example.com");
await page.getByRole("button", { name: "Log in" }).click();
```

Léelo como los pasos de una prueba manual: abrir la página, escribir el correo, hacer clic en el botón. Cada paso toma tiempo, así que cada paso lleva `await`.

## Profundiza

### Por qué el código no espera por sí solo

JavaScript hace una sola cosa a la vez. Cuando empieza un trabajo lento, como un temporizador o una petición, no se queda quieto. Entrega el trabajo y sigue con la línea siguiente. Cuando el trabajo lento termina, vuelve a él.

`await` pausa solo la función que lo contiene. Mira este código, donde falta `await` en `main`:

```ts
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function slowLog(): Promise<void> {
  await wait(100);
  console.log("slow done");
}

async function main(): Promise<void> {
  slowLog();
  console.log("main done");
}

main();
```

El programa muestra:

```text
main done
slow done
```

Una idea equivocada es "sin `await` la función no se ejecuta". Sí se ejecuta. Solo que no la esperas.

### Una tras otra, o juntas

Cada `await` seguido espera al anterior. Cuando las tareas no dependen una de otra, puedes empezarlas juntas con `Promise.all`.

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

Usa la función `wait` de arriba. La primera línea muestra unos 300 ms y la segunda unos 100 ms (en una ejecución real: 300 ms y 101 ms). En un test, los pasos suelen depender uno de otro, así que los esperas uno por uno.

### Cómo aparece en el trabajo de automatización QA

Un `await` olvidado en una comprobación es peligroso. Mira esta línea:

```ts
expect(page.getByTestId("report-result")).toContainText("12 tests");
```

La comprobación devuelve una Promise y nadie la espera. Lo que pasa no es predecible. En las ejecuciones que observamos, el test falló al instante, sin esperar el texto. En otras situaciones, un test puede terminar antes de que la comprobación acabe. De cualquier modo, la solución es la misma: escribe siempre `await expect(...)`.

Este es el test correcto. Espera el reporte lento y no usa una pausa fija como `waitForTimeout`:

```ts
import { expect, test } from "./lib/test";

test("shows the report when loading ends", async ({ page }) => {
  await page.goto("/#/practice");
  await page.getByTestId("report-load").click();

  await expect(page.getByTestId("report-result")).toContainText("12 tests");
});
```

`expect` lo intenta una y otra vez hasta que aparece el texto o se acaba el tiempo. Una pausa fija es muy corta, y el test falla, o muy larga, y la *suite* (conjunto de tests) se vuelve lenta.

## Práctica

1. Crea el archivo `exercises/01-programming/async-practice.ts`.
2. Copia el primer ejemplo con `wait` de la sección "async y await". Ejecútalo con `node exercises/01-programming/async-practice.ts`.
3. Quita el `await` antes de `loadStatus()` y ejecútalo otra vez. Lee la salida.
4. Vuelve a poner el `await`.
5. Abre `exercises/01-programming/10-async-await.ts`. Reemplaza cada `// TODO` con código.
6. Ejecuta el archivo del ejercicio con este comando:

```bash
node exercises/01-programming/10-async-await.ts
```

Haz que cada línea diga `OK`.

## Comprueba lo que sabes

1. ¿Qué es una Promise?

<details><summary>Respuesta</summary>

Un valor que todavía no está listo. El resultado llegará más tarde.

</details>

2. ¿Dónde puedes escribir `await`?

<details><summary>Respuesta</summary>

Dentro de una función marcada con `async`.

</details>

3. ¿Qué es el bug del await olvidado?

<details><summary>Respuesta</summary>

Llamas a una función async sin `await`. El código no espera y obtienes una Promise en lugar del resultado.

</details>

4. ¿Qué pasa en `catch`?

<details><summary>Respuesta</summary>

Se ejecuta cuando el código de `try` lanza un error. Ahí manejas el error.

</details>

5. ¿Qué muestra este programa y por qué?

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

Muestra `finished` primero. Luego muestra `done 1`, `done 2` y `done 3`, unos 100 ms después. `forEach` no espera los callbacks async. Los inicia los tres y sigue adelante. Para esperar cada uno, usa un bucle `for...of` con `await` dentro.

</details>

6. Este código tiene un bug. Encuéntralo.

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

Falta el `await` antes de `isLoaded()`. El `if` recibe una Promise, y para un `if` una Promise siempre es "verdadera". Así que el programa siempre muestra `loaded`, aunque la función devuelve `false`. TypeScript informa un error: la condición siempre será verdadera. Escribe `if (await isLoaded())`.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es el event loop y por qué JavaScript puede esperar sin congelarse?**
   - Busca: `javascript event loop explained`
   - Una buena respuesta explica: qué son la pila de llamadas (*call stack*) y la cola, por qué el callback de un temporizador se ejecuta después y por qué un bucle largo puede congelar una página.

2. **¿Cuál es la diferencia entre `Promise.all` y `Promise.allSettled`?**
   - Busca: `promise.all vs promise.allsettled`
   - Una buena respuesta explica: qué devuelve cada una cuando una Promise falla y un ejemplo de cuándo elegirías cada una.

3. **¿Por qué una espera fija es una mala forma de esperar en un test de interfaz y qué hace Playwright en su lugar?**
   - Busca: `playwright auto-waiting actionability`
   - Una buena respuesta explica: qué comprueba Playwright antes de hacer clic, cómo reintentan las aserciones y por qué una pausa fija vuelve los tests flaky o lentos.

## Siguiente paso

En la siguiente lección aprendes a dividir el código en archivos y a compartirlo con `export` e `import`.
