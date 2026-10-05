---
title: Objetos
summary: Agrupa valores relacionados bajo nombres y guarda una lista de casos de prueba como objetos.
duration: 40 min
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

## Profundiza

### Por qué una copia cambia el original

Un objeto vive en la memoria del computador. Una variable no guarda el objeto en sí. Guarda un enlace hacia él. Este enlace se llama **referencia**.

Cuando escribes `const same = original;`, copias el enlace. No copias el objeto. Ahora dos nombres apuntan a un solo objeto.

```ts
const original = { id: 1, status: "failed" };
const same = original;
same.status = "passed";
console.log(original.status);

const copy = { ...original };
copy.status = "skipped";
console.log(original.status, copy.status);
```

El programa muestra:

```text
passed
passed skipped
```

El primer cambio pasó por `same` y modificó el único objeto compartido. Los tres puntos de `{ ...original }` crean un objeto nuevo con las mismas propiedades. La lección 09 muestra la misma idea para los arrays. Esta copia es superficial: un objeto dentro del objeto sigue compartido.

La misma regla explica por qué `===` no compara el contenido:

```ts
const a = { id: 1 };
const b = { id: 1 };
console.log(a === b);
console.log(a === a);
console.log(JSON.stringify(a) === JSON.stringify(b));
```

Muestra `false`, `true` y `true`. Dos objetos son iguales con `===` solo cuando son el mismo objeto. El verificador al final de cada archivo de ejercicios compara el texto creado por `JSON.stringify`, por esta razón.

### Cómo aparece en el trabajo de automatización QA

Los datos de prueba suelen ser un objeto. Lo escribes una vez y cada test lo lee. Esta idea tiene un nombre: **DRY** (*Don't Repeat Yourself*, no te repitas). La estudiarás al final de este módulo.

Este archivo de test vive en la carpeta `e2e`. Las palabras `async` y `await` llegan después, en la lección 10. Lee las líneas como pasos manuales.

```ts
import { expect, test } from "./lib/test";

const validUser = { email: "qa@example.com", password: "Playwright123" };

test("accepts the test credentials", async ({ page }) => {
  await page.goto("/#/practice");
  await page.getByTestId("login-email").fill(validUser.email);
  await page.getByTestId("login-password").fill(validUser.password);
  await page.getByTestId("login-submit").click();

  await expect(page.getByTestId("login-welcome")).toContainText(validUser.email);
});
```

Si la contraseña cambia, cambias una sola línea. Un test debe seguir leyéndose como una historia clara, así que mantén el objeto de datos pequeño y bien nombrado.

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

5. ¿Qué muestra este programa y por qué?

```ts
type TestCase = { id: number; title: string; status: string };

function markPassed(testCase: TestCase): void {
  testCase.status = "passed";
}

const login: TestCase = { id: 1, title: "Login works", status: "failed" };
markPassed(login);
console.log(login.status);
```

<details><summary>Respuesta</summary>

Muestra `passed`. La función recibe una referencia al mismo objeto, no una copia. Cuando cambia `status`, el objeto al que apunta `login` también cambia. Esto es útil, pero también un riesgo: una función puede cambiar tus datos sin que lo notes.

</details>

6. Este código tiene un bug. Encuéntralo.

```ts
const testCase = { id: 1, title: "Login works", status: "failed" };
const { title, state } = testCase;
console.log(`${title} is ${state}`);
```

<details><summary>Respuesta</summary>

El objeto no tiene una propiedad `state`. La propiedad se llama `status`. TypeScript muestra el error "Property 'state' does not exist" antes de que ejecutes el programa. Sin esa revisión, el programa mostraría `Login works is undefined`.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Cuál es la diferencia entre una copia superficial y una copia profunda de un objeto?**
   - Busca: `javascript shallow copy vs deep copy`
   - Una buena respuesta explica: qué se copia y qué sigue compartido en cada caso, y un ejemplo donde la copia superficial causa una sorpresa.

2. **¿Qué es JSON y cómo cambian `JSON.parse` y `JSON.stringify` entre texto y objetos?**
   - Busca: `MDN JSON.parse JSON.stringify`
   - Una buena respuesta explica: cómo se ve el texto JSON, qué hace cada función y qué pasa cuando el texto no es JSON válido.

3. **¿Por qué los testers mantienen los datos de prueba separados de los pasos del test?**
   - Busca: `test data management software testing`
   - Una buena respuesta explica: qué son los datos de prueba, dos problemas que aparecen cuando los datos se copian en cada test y una forma de mantenerlos en un solo lugar.

## Siguiente paso

En la siguiente lección les pones nombre a las formas de tus propios objetos, para que TypeScript las revise por ti.
