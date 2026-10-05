---
title: Tus propios tipos
summary: Pon nombre a la forma de tus objetos con alias de tipo, propiedades opcionales y uniones de literales.
duration: 25 min
---

## Objetivo

- Escribir un alias de tipo para la forma de un objeto.
- Marcar una propiedad como opcional.
- Limitar un valor de texto a un conjunto fijo de opciones.
- Revisar un valor con `if`, para que TypeScript sepa qué contiene.

## Alias de tipo

En la lección 07 escribiste el tipo de un objeto una y otra vez. Eso es largo y es fácil equivocarse.

Un **alias de tipo** (*type alias*) le da un nombre a un tipo. Lo escribes una vez y lo usas en todas partes.

```ts
type TestCase = {
  id: number;
  title: string;
  status: string;
};

const testCase: TestCase = {
  id: 1,
  title: "Login works",
  status: "passed",
};

console.log(testCase.title);
```

El programa muestra `Login works`.

Por convención, los nombres de tipos empiezan con mayúscula. Ahora TypeScript comprueba que cada `TestCase` tenga las propiedades correctas.

Si olvidas una propiedad, TypeScript la subraya en rojo:

```ts
type TestCase = { id: number; title: string; status: string };

// Error: Property 'status' is missing
const broken: TestCase = { id: 2, title: "Logout works" };
```

Encuentras el error mientras escribes. No esperas a ejecutar el programa.

## Propiedades opcionales

Algunos valores no siempre están. Un caso de prueba puede tener responsable o no.

Pon `?` después del nombre de la propiedad para hacerla **opcional**.

```ts
type TestCase = {
  id: number;
  title: string;
  owner?: string;
};

const withOwner: TestCase = { id: 1, title: "Login works", owner: "Ana" };
const withoutOwner: TestCase = { id: 2, title: "Logout works" };

console.log(withOwner.owner);
console.log(withoutOwner.owner);
```

El programa muestra:

```text
Ana
undefined
```

El tipo de `owner` es `string | undefined`. El signo `|` significa "o". La lección 03 explicó `undefined`: significa "aquí no hay valor".

## Limitar las opciones

Un estado solo debería ser `"passed"`, `"failed"` o `"skipped"`. Si alguien escribe `"pasd"`, es un error.

Puedes crear un tipo con valores de texto exactos. Únelos con `|`. Esto se llama **unión** (*union*).

```ts
type Status = "passed" | "failed" | "skipped";

type TestCase = {
  id: number;
  title: string;
  status: Status;
};

const testCase: TestCase = { id: 1, title: "Login works", status: "passed" };
console.log(testCase.status);
```

El programa muestra `passed`.

Ahora prueba con un valor incorrecto:

```ts
type Status = "passed" | "failed" | "skipped";

// Error: Type '"pasd"' is not assignable to type 'Status'
const status: Status = "pasd";
```

TypeScript detecta el error de escritura antes de que ejecutes nada. Así usamos las opciones fijas en este curso.

> **Nota:** Otros tutoriales usan `enum` para esto. En este curso usa una unión de valores de texto. Es más simple y funciona en todas partes.

## Acotar con if

A veces un valor puede ser de varios tipos. Dentro de un `if`, TypeScript aprende cuál es. Esto se llama **acotar** (*narrowing*).

```ts
type TestCase = {
  id: number;
  title: string;
  owner?: string;
};

function describeOwner(testCase: TestCase): string {
  if (testCase.owner === undefined) {
    return `${testCase.title} has no owner`;
  }
  return `${testCase.title} belongs to ${testCase.owner}`;
}

console.log(describeOwner({ id: 1, title: "Login works", owner: "Ana" }));
console.log(describeOwner({ id: 2, title: "Logout works" }));
```

El programa muestra:

```text
Login works belongs to Ana
Logout works has no owner
```

Después del `if` con `return`, TypeScript sabe que `owner` es un `string`. Sin la comprobación, no te dejaría usar `owner` como texto.

## Leer los tipos Array y Promise

A veces ves tipos con `<` y `>`, como `Array<TestCase>`. Solo necesitas leerlos, no escribirlos.

- `Array<TestCase>` significa una lista de casos de prueba. Es lo mismo que `TestCase[]`.
- `Promise<string>` significa "un string que llegará más tarde". La lección 10 lo explica.

Lee la parte dentro de `< >` como "de". `Array<TestCase>` es "un array de casos de prueba".

## Práctica

1. Crea el archivo `exercises/01-programming/types-practice.ts`.
2. Escribe un tipo `Severity` con los valores `"low"`, `"medium"` y `"high"`.
3. Escribe un tipo `Bug` con `id` (number), `title` (string), `severity` (`Severity`) y un `assignee` opcional (string).
4. Crea dos objetos `Bug`, uno con `assignee` y otro sin él.
5. Escribe a propósito `severity: "urgent"` y mira el subrayado rojo. Luego corrígelo.
6. Abre `exercises/01-programming/08-your-own-types.ts`. Reemplaza cada `// TODO` con código.
7. Ejecuta el archivo del ejercicio con este comando:

```bash
node exercises/01-programming/08-your-own-types.ts
```

Haz que cada línea diga `OK`.

## Comprueba lo que sabes

1. ¿Qué hace un alias de tipo?

<details><summary>Respuesta</summary>

Le da un nombre a un tipo, para que puedas reutilizarlo.

</details>

2. ¿Qué significa el `?` en `owner?: string`?

<details><summary>Respuesta</summary>

La propiedad es opcional. Puede faltar, y entonces su valor es `undefined`.

</details>

3. ¿Qué está mal en `const s: "passed" | "failed" = "skipped";`?

<details><summary>Respuesta</summary>

`"skipped"` no es uno de los valores permitidos. TypeScript muestra un error.

</details>

4. ¿Cómo lees `Array<TestCase>`?

<details><summary>Respuesta</summary>

"Un array de casos de prueba". Es lo mismo que `TestCase[]`.

</details>

## Siguiente paso

En la siguiente lección usas `map`, `filter` y `find` para trabajar con listas de casos de prueba con tipos.
