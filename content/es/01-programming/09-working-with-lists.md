---
title: Trabajar con listas
summary: Usa map, filter, find, some, every y spread para trabajar con listas de casos de prueba.
duration: 30 min
---

## Objetivo

- Transformar una lista con `map`.
- Elegir elementos con `filter` y `find`.
- Hacer preguntas de sí o no con `some` y `every`.
- Copiar una lista y añadir un elemento con spread.

## Los datos de prueba

Todos los ejemplos de esta lección usan estos datos. Cópialos al inicio de tu archivo de práctica.

```ts
type Status = "passed" | "failed" | "skipped";

type TestCase = {
  id: number;
  title: string;
  status: Status;
};

const testCases: TestCase[] = [
  { id: 1, title: "Login works", status: "passed" },
  { id: 2, title: "Checkout applies discount", status: "failed" },
  { id: 3, title: "Logout clears session", status: "failed" },
  { id: 4, title: "Order history", status: "skipped" },
];
```

## Funciones callback

Los métodos de esta lección reciben una función como entrada. Esa función se llama **callback**. El método la llama para cada elemento de la lista.

Escribes el callback como una función flecha. La lección 05 mostró las funciones flecha: `(testCase) => ...`.

## map: cambiar cada elemento

`map` crea un array nuevo. Ejecuta tu callback en cada elemento y reúne los resultados.

```ts
const titles = testCases.map((testCase) => testCase.title);
console.log(titles);
```

El programa muestra:

```text
[
  'Login works',
  'Checkout applies discount',
  'Logout clears session',
  'Order history'
]
```

El array nuevo tiene la misma longitud que el anterior. El array original no cambia.

## filter: conservar algunos elementos

`filter` crea un array nuevo solo con los elementos para los que tu callback devuelve `true`.

```ts
const failed = testCases.filter((testCase) => testCase.status === "failed");
console.log(failed.length);
```

El programa muestra `2`.

Puedes encadenar los dos métodos. Obtén los títulos de los casos de prueba fallidos:

```ts
const failedTitles = testCases
  .filter((testCase) => testCase.status === "failed")
  .map((testCase) => testCase.title);

console.log(failedTitles);
```

El programa muestra:

```text
[ 'Checkout applies discount', 'Logout clears session' ]
```

## find: obtener un elemento

`find` devuelve el primer elemento para el que tu callback devuelve `true`. Si nada coincide, devuelve `undefined`.

```ts
const found = testCases.find((testCase) => testCase.id === 3);
console.log(found?.title);

const missing = testCases.find((testCase) => testCase.id === 99);
console.log(missing);
```

El programa muestra:

```text
Logout clears session
undefined
```

El tipo del resultado es `TestCase | undefined`. Debes manejar el caso `undefined`. El `?.` en `found?.title` significa "lee `title` solo si `found` tiene un valor". Si no, el resultado es `undefined`.

## some y every: sí o no

`some` devuelve `true` si al menos un elemento coincide. `every` devuelve `true` si todos los elementos coinciden.

```ts
const hasFailure = testCases.some((testCase) => testCase.status === "failed");
const allPassed = testCases.every((testCase) => testCase.status === "passed");

console.log(hasFailure);
console.log(allPassed);
```

El programa muestra:

```text
true
false
```

> **Cuidado:** `every` en una lista vacía devuelve `true`. Una lista vacía no tiene ningún elemento que falle. Ten esto presente cuando una ejecución de tests no encuentre ningún caso de prueba.

## Spread: copiar una lista

Tres puntos `...` antes de un array significan **spread** (propagar). Pone todos los elementos del array en un lugar nuevo.

```ts
const extended = [...testCases, { id: 5, title: "Search works", status: "passed" as Status }];

console.log(testCases.length);
console.log(extended.length);
```

El programa muestra:

```text
4
5
```

La lista original sigue teniendo 4 elementos. Creaste una lista nueva con 5 elementos. La parte `as Status` le dice a TypeScript que el texto es un `Status` y no un texto cualquiera.

## ¿map o for...of?

Ambos funcionan. Usa esta regla:

- Usa `map`, `filter`, `find`, `some` y `every` cuando quieres un resultado: una lista nueva, un elemento o una respuesta de sí o no.
- Usa `for...of` cuando quieres hacer una acción con cada elemento, como mostrar un texto o hacer clic.

En Playwright a menudo usas `for...of` con `await`. La lección 10 explica por qué.

## Práctica

1. Crea el archivo `exercises/01-programming/lists-practice.ts`.
2. Pega los datos de prueba del inicio de esta lección.
3. Muestra los ids de todos los casos de prueba con `map`.
4. Muestra los títulos de todos los casos de prueba omitidos (`skipped`).
5. Usa `find` para obtener el caso de prueba con id 2 y muestra su estado.
6. Muestra si `some` caso de prueba está omitido.
7. Abre `exercises/01-programming/09-working-with-lists.ts`. Reemplaza cada `// TODO` con código.
8. Ejecuta el archivo del ejercicio con este comando:

```bash
node exercises/01-programming/09-working-with-lists.ts
```

Haz que cada línea diga `OK`.

## Comprueba lo que sabes

1. ¿`map` cambia el array original?

<details><summary>Respuesta</summary>

No. Devuelve un array nuevo. El original queda igual.

</details>

2. ¿Qué devuelve `find` cuando nada coincide?

<details><summary>Respuesta</summary>

Devuelve `undefined`.

</details>

3. ¿Qué método te dice si todos los elementos cumplen una regla?

<details><summary>Respuesta</summary>

`every`.

</details>

4. ¿Qué crea `[...list, item]`?

<details><summary>Respuesta</summary>

Un array nuevo con todos los elementos de `list` y `item` al final.

</details>

## Siguiente paso

En la siguiente lección aprendes a manejar trabajo que toma tiempo, como una página que carga despacio.
