---
title: async y await
summary: Maneja el trabajo que toma tiempo, evita el bug del await olvidado y lee cómo espera el código de Playwright.
duration: 30 min
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

Aquí hay una función auxiliar que simula trabajo lento. Espera unos milisegundos. Un milisegundo es una milésima de segundo.

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

## Siguiente paso

En la siguiente lección aprendes a dividir el código en archivos y a compartirlo con `export` e `import`.
