---
title: Leer errores
summary: Lee errores de tipo y stack traces, sigue una rutina para depurar y corrige los errores más comunes de quien empieza.
duration: 50 min
---

## Objetivo

- Distinguir un error de tipo de un error en tiempo de ejecución.
- Leer las partes de un mensaje de error de TypeScript.
- Leer un *stack trace* (rastro de la pila de llamadas).
- Seguir una rutina simple para encontrar un *bug*.

## Dos tipos de errores

Los errores son normales. Todo programador los ve a diario. Un mensaje de error te dice qué está mal. Debes aprender a leerlo.

Hay dos tipos de errores:

- Un **error de tipo** se encuentra antes de ejecutar el programa. TypeScript revisa tu código y encuentra una incompatibilidad. Lo ves como un subrayado rojo en VS Code, o al ejecutar `pnpm typecheck`.
- Un **error en tiempo de ejecución** ocurre mientras el programa se ejecuta. El programa se detiene en la línea que falla.

Un tercer tipo es el **bug de lógica**. El programa se ejecuta sin errores, pero da una respuesta incorrecta. Ningún mensaje te ayuda aquí. Debes comparar el resultado con lo que esperas.

## Anatomía de un error de TypeScript

Aquí hay un error:

```ts
const count: number = "five";
```

TypeScript informa:

```text
exercises/01-programming/demo.ts:1:7 - error TS2322: Type 'string' is not assignable to type 'number'.
```

Léelo por partes:

- `exercises/01-programming/demo.ts` es el archivo.
- `1:7` es el número de línea y el número de columna. Ve a la línea 1, carácter 7.
- `TS2322` es el código del error. Búscalo en internet para encontrar explicaciones.
- `Type 'string' is not assignable to type 'number'` es el mensaje. Dice: pusiste texto donde se espera un número.

La frase "Type X is not assignable to type Y" es la más común. Léela como "recibí X, pero necesito Y".

## Anatomía de un stack trace

Aquí hay un error en tiempo de ejecución:

```ts
function getUserName(jsonText: string): string {
  const user = JSON.parse(jsonText);
  return user.profile.name;
}

console.log(getUserName('{"name":"Ana"}'));
```

Node muestra algo como esto:

```text
return user.profile.name;
                   ^

TypeError: Cannot read properties of undefined (reading 'name')
    at getUserName (file:///C:/qaa/exercises/01-programming/demo.ts:3:22)
    at file:///C:/qaa/exercises/01-programming/demo.ts:6:13
```

Léelo por partes:

- Las primeras líneas muestran el código que falla, con una marca `^`.
- `TypeError` es el tipo de error.
- Después de los dos puntos está el mensaje: `user.profile` es `undefined`, así que no puedes leer `name` de él.
- Las líneas que empiezan con `at` son el **stack trace**. Lista las funciones que se estaban ejecutando, de la más nueva a la más antigua.

Empieza por la primera línea `at` que esté en tu propio archivo. Te da la línea y la columna donde ocurrió el fallo.

## Una rutina para depurar

Usa estos cinco pasos, en este orden.

1. **Lee** el mensaje completo con calma. Encuentra el archivo, la línea y el mensaje.
2. **Reproduce** el problema. Haz que falle otra vez, de la misma forma, cada vez.
3. **Hazlo más pequeño.** Quita código hasta tener el ejemplo más pequeño que todavía falla.
4. **Muestra valores.** Usa `console.log` para ver qué guardan realmente las variables. Compara con lo que esperabas.
5. **Busca.** Copia el mensaje de error y búscalo. Antes, quita de ese texto tus propios nombres.

La mayoría de los bugs se encuentran en el paso 4. El valor no es el que pensabas.

## Los errores más comunes de quien empieza

### 1. Type 'string' is not assignable to type 'number'

Diste el tipo equivocado. Cambia el valor o el tipo. Ejemplo: `const age: number = "30"` pasa a ser `const age: number = 30`.

### 2. Cannot find name 'x'

TypeScript no conoce ese nombre. Revisa la ortografía y las mayúsculas. Revisa que lo hayas importado.

### 3. Property 'x' does not exist on type 'Y'

Usaste un nombre de propiedad que el tipo no tiene. Revisa la ortografía, o añade la propiedad a tu tipo.

### 4. 'x' is possibly 'undefined'

Un valor puede faltar, por ejemplo el resultado de `find`. Revísalo primero: `if (found !== undefined) { ... }`.

### 5. Cannot read properties of undefined

Es un error en tiempo de ejecución. Leíste una propiedad de algo que es `undefined`. Muestra el objeto con `console.log` y busca la parte que falta.

### 6. x is not a function

Llamaste a algo que no es una función. Revisa el nombre y los puntos. Quizá olvidaste que una propiedad es un valor simple.

### 7. Cannot find module

La ruta de un import es incorrecta, o un paquete no está instalado. Revisa `./`, el nombre del archivo y la terminación `.ts`. Para los paquetes, ejecuta `pnpm install`.

### 8. A Promise shows as [object Promise]

Olvidaste `await`. Añádelo. Este es el bug más común en los tests de Playwright.

> **Consejo:** Corrige primero el primer error de la lista. Los errores siguientes suelen ser causados por el primero.

## Profundiza

### Por qué un stack trace es una lista

Las funciones llaman a otras funciones. Node guarda una lista de las funciones que se están ejecutando ahora. Esta lista es la **pila de llamadas** (*call stack*). Cuando ocurre un fallo, Node muestra la lista. Eso es el stack trace.

```ts
type TestCase = { id: number; title: string };
const testCases: TestCase[] = [{ id: 1, title: "Login works" }];

function getTitle(id: number): string {
  const found = testCases.find((testCase) => testCase.id === id) as TestCase;
  return found.title;
}

function printTitle(id: number): void {
  console.log(getTitle(id));
}

printTitle(2);
```

Node muestra, con los nombres largos de carpetas acortados:

```text
TypeError: Cannot read properties of undefined (reading 'title')
    at getTitle (demo.ts:6:16)
    at printTitle (demo.ts:10:15)
    at Object.<anonymous> (demo.ts:13:1)
```

Léelo de arriba hacia abajo. `getTitle` falló. La llamó `printTitle`, línea 10. A esa la llamó el archivo principal, línea 13.

### Una idea equivocada: la línea del fallo contiene el error

El fallo está en la línea 6, pero la línea 6 no está mal. El problema real es que nadie tiene un caso de prueba con id 2. El texto `as TestCase` le dijo a TypeScript que confiara en ti, así que ocultó el `undefined`. El valor incorrecto vino de la línea 13.

Lee hacia abajo en la pila para encontrar quién pasó el valor incorrecto. Luego pregunta: ¿qué esperaba aquí y qué obtuve?

### Cómo aparece en el trabajo de automatización QA

Un error es un mensaje del código. No debes esconderlo. Este es un error común:

```ts
async function checkWelcome(): Promise<void> {
  throw new Error("Expected the welcome text");
}

async function main(): Promise<void> {
  try {
    await checkWelcome();
  } catch {
    // ignore
  }
  console.log("test passed");
}

main();
```

Muestra `test passed`, aunque la comprobación falló. El `catch` vacío se tragó el error. Un test así nunca puede fallar. Usa `catch` solo cuando puedas hacer algo útil. Si solo quieres registrar el error, escribe `throw error` al final del bloque `catch` para pasarlo hacia arriba.

Los mensajes claros también valen mucho. El *helper* `byTestId` en `src/views/playground.ts` escribe una sola vez el mensaje "was not found" para cada elemento. Esa es la idea **DRY** (*Don't Repeat Yourself*, no te repitas), que estudiarás en la siguiente lección.

## Práctica

1. Crea el archivo `exercises/01-programming/errors-practice.ts`.
2. Escribe `const count: number = "five";`. Lee el subrayado rojo. Luego ejecuta `pnpm typecheck` y encuentra el mismo mensaje. Nombra el archivo, la línea, la columna y el código.
3. Corrígelo, para que el error desaparezca.
4. Escribe una llamada a `getUserName` como en esta lección y ejecútala con `node`. Encuentra la primera línea `at` en tu propio archivo.
5. Abre `exercises/01-programming/12-reading-errors.ts`. Tiene cinco funciones con un bug cada una.
6. Ejecuta el archivo con este comando:

```bash
node exercises/01-programming/12-reading-errors.ts
```

7. Corrige un bug a la vez. Usa `console.log` para mostrar valores. Haz que cada línea diga `OK`.

## Comprueba lo que sabes

1. ¿Cuál es la diferencia entre un error de tipo y un error en tiempo de ejecución?

<details><summary>Respuesta</summary>

Un error de tipo se encuentra antes de ejecutar el programa. Un error en tiempo de ejecución ocurre mientras se ejecuta.

</details>

2. En `demo.ts:12:5`, ¿qué significan 12 y 5?

<details><summary>Respuesta</summary>

La línea 12 y la columna 5 del archivo `demo.ts`.

</details>

3. ¿Por dónde empiezas a leer un stack trace?

<details><summary>Respuesta</summary>

Por la primera línea `at` que apunta a tu propio archivo.

</details>

4. Tu test muestra `[object Promise]`. ¿Cuál es la causa probable?

<details><summary>Respuesta</summary>

Falta un `await`.

</details>

5. ¿Qué muestra este programa y por qué?

```ts
function parsePrice(text: string): number {
  return Number(text.replace("$", ""));
}

console.log(parsePrice("$abc"));
```

<details><summary>Respuesta</summary>

Muestra `NaN`, que significa "no es un número" (*not a number*). `Number("abc")` no puede crear un número, pero no lanza un error. El programa se ejecuta sin ningún mensaje. Este es un bug de lógica, y solo una revisión del valor, por ejemplo con `console.log`, puede mostrarlo.

</details>

6. Este código falla al ejecutarse. Encuentra la causa y explica cómo lo corregirías.

```ts
type TestCase = { id: number; title: string };
const testCases: TestCase[] = [{ id: 1, title: "Login works" }];

const second = testCases[5];
console.log(second.title);
```

<details><summary>Respuesta</summary>

No hay ningún elemento en la posición 5, así que `second` es `undefined`. Leer `.title` de él da "Cannot read properties of undefined". TypeScript en modo estricto avisa antes: `'second' is possibly 'undefined'`. Corrígelo con `if (second !== undefined) { ... }` y averigua por qué miraste la posición 5.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es la pila de llamadas (*call stack*) en JavaScript y cómo se relaciona con un stack trace?**
   - Busca: `javascript call stack explained`
   - Una buena respuesta explica: qué se agrega y qué se quita de la pila cuando se ejecutan las funciones, y qué es un desbordamiento de pila (*stack overflow*).

2. **¿Cuáles son los tipos de error comunes de JavaScript, como `TypeError`, `ReferenceError` y `SyntaxError`?**
   - Busca: `MDN javascript error types TypeError ReferenceError`
   - Una buena respuesta explica: qué causa cada tipo y un ejemplo corto de código para cada uno.

3. **¿Cómo ayuda el Trace Viewer de Playwright a un tester a encontrar por qué falló un test?**
   - Busca: `playwright trace viewer`
   - Una buena respuesta explica: qué registra un *trace*, qué puedes ver en él y por qué ayuda más que solo leer el texto del error.

## Siguiente paso

En la última lección de este módulo aprendes DRY, una forma de pensar que mantiene tu código fácil de cambiar y fácil de creer.
