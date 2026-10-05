---
title: Tus propios tipos
summary: Pon nombre a la forma de tus objetos con alias de tipo, propiedades opcionales y uniones de literales.
duration: 40 min
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

## Profundiza

### Los tipos solo existen mientras escribes

TypeScript elimina todos los tipos antes de que el programa se ejecute. Node solo ve JavaScript simple. Por eso un tipo no puede revisar los datos que llegan mientras el programa corre.

```ts
type TestCase = { id: number; title: string };

const parsed: TestCase = JSON.parse('{"id":"abc","title":"Login works"}');
console.log(parsed.id + 1);
```

TypeScript no muestra ningún error. El programa muestra:

```text
abc1
```

El tipo dice que `id` es un número. Los datos reales tienen texto. `JSON.parse` devuelve un valor de tipo `any`, que significa "cualquier cosa", así que TypeScript lo acepta sin revisar. Le dijiste a TypeScript lo que esperas, y te creyó.

Esto importa en el trabajo de QA. La respuesta de una API son datos que vienen de afuera. Un tipo describe lo que esperas, no lo que envió el servidor. Tu test aún debe comprobar los valores reales.

### Una forma, escrita una vez

Un alias de tipo también sirve para evitar la repetición. Esta idea se llama **DRY** (*Don't Repeat Yourself*, no te repitas). Cada pieza de conocimiento vive en un solo lugar. La estudiarás al final de este módulo.

Mira `Status`. Los valores permitidos se escriben una vez:

```ts
type Status = "passed" | "failed" | "skipped" | "blocked";
```

Agregas `"blocked"` aquí, y todos los lugares que usan `Status` lo aceptan. Si escribieras las tres opciones en diez funciones, cambiarías diez lugares y podrías olvidar uno.

### Cuándo no escribir un tipo

No escribas un tipo para todo. Esta línea no necesita ninguno:

```ts
const count = 3;
```

TypeScript ya sabe que `count` es un número. Escribe tipos para los parámetros de las funciones, para las formas que comparten muchos lugares y para las opciones fijas. Los tipos de más alargan el código y no lo hacen más seguro.

Elige también la herramienta correcta. Usa una unión solo cuando las opciones son una lista pequeña y fija. Si el texto puede ser cualquiera, como un título que escribe un usuario, usa `string`.

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

5. ¿Qué muestra este programa y por qué?

```ts
type TestCase = { id: number; title: string; owner?: string };

const testCase: TestCase = { id: 1, title: "Login works" };
console.log(`Owner: ${testCase.owner}`);
```

<details><summary>Respuesta</summary>

Muestra `Owner: undefined`. La propiedad `owner` es opcional y no se dio, así que su valor es `undefined`. Una plantilla de texto convierte cualquier valor en texto, por eso ves la palabra `undefined`. TypeScript no te detiene, pero el resultado probablemente no es lo que quieres. Una comprobación con `if` sería mejor.

</details>

6. Este código tiene un bug. Encuéntralo.

```ts
type Status = "passed" | "failed";

function isDone(status: Status): boolean {
  if (status === "passed") {
    return true;
  }
  if (status === "failde") {
    return false;
  }
  return false;
}
```

<details><summary>Respuesta</summary>

El texto `"failde"` tiene un error de escritura. `Status` solo puede ser `"passed"` o `"failed"`, así que esta comparación nunca puede ser verdadera. TypeScript avisa que los tipos no tienen nada en común. Con un tipo `string` simple, TypeScript no podría detectar este error. El programa se ejecutaría y el segundo `if` nunca funcionaría.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Cuál es la diferencia entre `type` e `interface` en TypeScript?**
   - Busca: `typescript type vs interface`
   - Una buena respuesta explica: cómo cada uno describe la forma de un objeto, algo que solo `type` puede hacer, y cuál usa este curso y por qué.

2. **¿Qué significa que los tipos de TypeScript se borran en tiempo de ejecución?**
   - Busca: `typescript types erased at runtime`
   - Una buena respuesta explica: qué quita el compilador o Node, por qué las comprobaciones de tipos no existen cuando el programa corre y un bug que esto puede esconder.

3. **¿Qué es un contrato de API y por qué un tipo de TypeScript no puede probar que un servidor lo cumple?**
   - Busca: `api contract testing explained`
   - Una buena respuesta explica: qué es un contrato de API, por qué un tipo es solo una promesa hecha al escribir el código y cómo un tester puede comprobar la respuesta real.

## Siguiente paso

En la siguiente lección usas `map`, `filter` y `find` para trabajar con listas de casos de prueba con tipos.
