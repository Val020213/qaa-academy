---
title: Objetos
summary: Agrupa valores relacionados bajo nombres y guarda una lista de casos de prueba como objetos.
duration: 25 min
---

## Objetivo

- Crear un objeto que agrupa valores relacionados.
- Leer y cambiar una propiedad de un objeto.
- Guardar muchos objetos en un array y recorrerlos con un bucle.
- Leer una línea corta de desestructuración.

## Por qué necesitamos objetos

Un caso de prueba tiene un id, un título y un estado. Estos tres valores van juntos.

Podrías usar tres variables separadas:

```ts
const testCaseId = 1;
const testCaseTitle = "Login works";
const testCaseStatus = "passed";
```

Esto se vuelve confuso cuando tienes diez casos de prueba. Un **objeto** lo resuelve. Un objeto es un valor que contiene varios valores con nombre.

## Crear un objeto

Escribes un objeto con llaves `{ }`. Dentro, escribes pares de `nombre: valor`, separados por comas.

```ts
const testCase = {
  id: 1,
  title: "Login works",
  status: "passed",
};

console.log(testCase);
```

Una **propiedad** es un par `nombre: valor` dentro de un objeto. Este objeto tiene tres propiedades: `id`, `title` y `status`.

El programa muestra:

```text
{ id: 1, title: 'Login works', status: 'passed' }
```

## Leer una propiedad

Escribe el nombre del objeto, un punto y el nombre de la propiedad.

```ts
const testCase = {
  id: 1,
  title: "Login works",
  status: "passed",
};

console.log(testCase.title);
console.log(testCase.status);
```

El programa muestra:

```text
Login works
passed
```

Si escribes el nombre de una propiedad que no existe, TypeScript la subraya en rojo. Esto te ayuda a encontrar errores de escritura a tiempo.

## Cambiar una propiedad

Puedes asignar un valor nuevo a una propiedad con `=`.

```ts
const testCase = {
  id: 1,
  title: "Login works",
  status: "not run",
};

testCase.status = "passed";
console.log(testCase.status);
```

El programa muestra:

```text
passed
```

> **Nota:** La variable es `const`, y aun así cambiaste una propiedad. `const` significa que la variable siempre apunta al mismo objeto. No congela el interior del objeto.

## Un objeto puede guardar cualquier valor

El valor de una propiedad puede ser texto, un número, un *boolean* (verdadero o falso), un array o incluso otro objeto.

```ts
const testCase = {
  id: 2,
  title: "Checkout applies discount",
  automated: true,
  tags: ["checkout", "smoke"],
  environment: { name: "staging", browser: "chromium" },
};

console.log(testCase.environment.browser);
console.log(testCase.tags.length);
```

El programa muestra:

```text
chromium
2
```

Lee `testCase.environment.browser` de izquierda a derecha: el caso de prueba, luego su entorno, luego su navegador.

## Una lista de objetos

En el trabajo real tienes muchos casos de prueba. Pon los objetos dentro de un array.

```ts
const testCases = [
  { id: 1, title: "Login works", status: "passed" },
  { id: 2, title: "Checkout applies discount", status: "failed" },
  { id: 3, title: "Logout clears session", status: "failed" },
];

let failedCount = 0;

for (const testCase of testCases) {
  console.log(`#${testCase.id} ${testCase.title}`);
  if (testCase.status === "failed") {
    failedCount += 1;
  }
}

console.log(`Failed: ${failedCount}`);
```

El bucle te da un objeto a la vez en la variable `testCase`. El programa muestra:

```text
#1 Login works
#2 Checkout applies discount
#3 Logout clears session
Failed: 2
```

Esta forma, un array de objetos, es muy común. Los datos de prueba y las respuestas de una API suelen verse así.

## Desestructuración

La **desestructuración** saca propiedades de un objeto y las guarda en variables, en una sola línea.

```ts
const testCase = { id: 7, title: "Reset password", status: "failed" };

const { title, status } = testCase;

console.log(`${title} is ${status}`);
```

El programa muestra:

```text
Reset password is failed
```

Los nombres dentro de `{ }` deben coincidir con los nombres de las propiedades. Verás esta forma a menudo en el código de Playwright, así que aprende a leerla. También puedes usarla en el parámetro de una función:

```ts
function describe({ id, title }: { id: number; title: string }): string {
  return `#${id} ${title}`;
}

console.log(describe({ id: 7, title: "Reset password" }));
```

Esto muestra `#7 Reset password`. El texto después de los dos puntos es el tipo del objeto. La lección 08 te muestra una forma más limpia de escribirlo.

## Práctica

1. Crea el archivo `exercises/01-programming/objects-practice.ts`.
2. Escribe un objeto llamado `bug` con las propiedades `id` (un número), `title` (texto) y `severity` (texto, por ejemplo `"high"`).
3. Muestra el título con `console.log(bug.title)`.
4. Cambia `bug.severity` a `"low"` y muestra el objeto.
5. Crea un array con tres *bugs*. Usa `for...of` para mostrar cada título.
6. Abre `exercises/01-programming/07-objects.ts`. Reemplaza cada `// TODO` con código.
7. Ejecuta el archivo del ejercicio con este comando:

```bash
node exercises/01-programming/07-objects.ts
```

Haz que cada línea diga `OK`.

## Comprueba lo que sabes

1. ¿Qué es una propiedad?

<details><summary>Respuesta</summary>

Una propiedad es un par `nombre: valor` dentro de un objeto.

</details>

2. ¿Cómo lees el `status` de un objeto llamado `testCase`?

<details><summary>Respuesta</summary>

Escribe `testCase.status`.

</details>

3. ¿Puedes cambiar una propiedad de un objeto guardado en una variable `const`?

<details><summary>Respuesta</summary>

Sí. `const` solo te impide poner otro objeto distinto en la variable. Aún puedes cambiar las propiedades de su interior.

</details>

4. ¿Qué hace `const { title } = testCase;`?

<details><summary>Respuesta</summary>

Crea una variable `title` y le da el valor de `testCase.title`.

</details>

## Siguiente paso

En la siguiente lección les pones nombre a las formas de tus propios objetos, para que TypeScript las revise por ti.
