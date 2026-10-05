---
title: Leer errores
summary: Lee errores de tipo y stack traces, sigue una rutina para depurar y corrige los errores más comunes de quien empieza.
duration: 35 min
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

## Siguiente paso

Terminaste los fundamentos de programación. En el módulo 2 aprendes Git y cómo funciona la web, para que puedas leer y compartir proyectos reales.
