---
title: Tipos
summary: Aprende que cada valor tiene un tipo, y deja que el verificador de tipos de TypeScript encuentre errores antes de ejecutar el código.
duration: 30 min
---

## Objetivo

- Nombrar el tipo de un valor: string, number o boolean.
- Escribir una anotación de tipo, y saber cuándo TypeScript encuentra el tipo por ti.
- Usar el verificador de tipos para encontrar errores antes de ejecutar.
- Explicar `null` y `undefined` con palabras simples.

## Cada valor tiene un tipo

Un **tipo** es la clase de un valor. En la lección anterior conociste tres clases.

| Tipo      | Ejemplo           | Significado    |
| --------- | ----------------- | -------------- |
| `string`  | `"Login failed"`  | texto          |
| `number`  | `404`             | un número      |
| `boolean` | `true`            | sí o no        |

El tipo decide qué puedes hacer con un valor. Puedes multiplicar números. No puedes multiplicar texto de forma útil.

Puedes preguntar el tipo con `typeof`.

```ts
console.log(typeof "Login failed");
console.log(typeof 404);
console.log(typeof true);
```

Esto muestra:

```text
string
number
boolean
```

## Texto que parece un número

`"5"` y `5` se ven iguales, pero no son lo mismo. El primero es un string. El segundo es un número.

```ts
console.log("5" + "1");
console.log(5 + 1);
```

Esto muestra:

```text
51
6
```

Con texto, `+` une las partes. Con números, `+` los suma.

Este es un error común. Una página web a menudo te da texto, aunque muestre un número. Por ejemplo, el texto de un precio en una página es un string.

Para convertir texto en número, usa `Number()`. Para convertir un número en texto, usa `String()`.

```ts
const textFromPage = "5";
console.log(Number(textFromPage) + 1);
console.log(String(404) + " error");
```

Esto muestra:

```text
6
404 error
```

## Anotaciones de tipo

Una **anotación de tipo** le dice a TypeScript el tipo de una variable. Escribes dos puntos y el tipo después del nombre.

```ts
const testName: string = "Login with valid user";
const retries: number = 3;
const isBlocked: boolean = false;
```

Lee la primera línea: `testName` es un string, y su valor es este texto.

## Inferencia de tipos

Muchas veces no necesitas escribir el tipo. TypeScript lo ve a partir del valor. Esto se llama **inferencia de tipos**.

```ts
const testName = "Login with valid user";
```

TypeScript sabe que `testName` es un string, porque el valor es texto.

Una buena regla: deja que TypeScript infiera el tipo en las variables simples. Escribe el tipo cuando TypeScript no pueda saberlo. Lo harás con las funciones en la lección 05.

## El verificador de tipos

El **verificador de tipos** (*type checker*) es una parte de TypeScript. Lee tu código y busca errores, antes de que lo ejecutes. Piensa en él como un revisor que lee cada línea.

Escribe esto en un archivo:

```ts
const retries: number = "three";
```

El verificador de tipos reporta un error:

```text
error TS2322: Type 'string' is not assignable to type 'number'.
```

Dice: prometiste un número, pero diste texto.

Ves el problema en dos lugares:

- En VS Code aparece una línea roja ondulada debajo del código. Pasa el ratón por encima para leer el mensaje.
- En la terminal puedes ejecutar el verificador de tipos para todo el proyecto:

```bash
pnpm typecheck
```

Corrige el problema antes de ejecutar el programa. Es más rápido que encontrarlo después.

> **Nota:** El comando `node file.ts` no comprueba los tipos. Solo los quita y ejecuta el código. El verificador es `pnpm typecheck` y las líneas rojas de VS Code.

## null y undefined

A veces falta un valor. TypeScript tiene dos valores especiales para esto.

`undefined` significa: todavía no se ha dado nada. Una variable que no tiene valor es `undefined`.

`null` significa: no hay valor, y es a propósito. Lo asignas tú.

```ts
let assignee: string | undefined;
console.log(assignee);
console.log(typeof assignee);

const owner: string | null = null;
console.log(owner);
```

Esto muestra:

```text
undefined
undefined
null
```

El signo `|` significa "o". Así, `string | undefined` significa: un string, o todavía nada. Y `string | null` significa: un string, o ningún valor a propósito.

El verificador de tipos usa esto para protegerte. Si un valor puede faltar, te obliga a pensar en ese caso.

## Práctica

1. Crea el archivo `exercises/01-programming/types.ts`.
2. Muestra el `typeof` de un texto, un número y `true`.
3. Muestra `"2" + "3"` y `2 + 3`. Comprueba que los resultados son distintos.
4. Convierte el texto `"10"` en número con `Number()`. Suma 5 y muestra el resultado.
5. Escribe `const retries: number = "three";`. Mira la línea roja en VS Code. Lee el mensaje. Luego ejecuta `pnpm typecheck` en la terminal. Corrige la línea.
6. Abre `exercises/01-programming/03-types.ts` y ejecútalo:

```bash
node exercises/01-programming/03-types.ts
```

Resuelve los ejercicios. Haz que todas las líneas digan `OK`.

## Comprueba lo que sabes

1. ¿Qué da `"5" + "1"`?

<details>
<summary>Respuesta</summary>

El texto `"51"`. Con texto, `+` une las partes.

</details>

2. ¿Cuál es la diferencia entre una anotación de tipo y la inferencia de tipos?

<details>
<summary>Respuesta</summary>

Una anotación es un tipo que escribes tú. Con la inferencia, TypeScript encuentra el tipo a partir del valor.

</details>

3. ¿`node file.ts` encuentra errores de tipos?

<details>
<summary>Respuesta</summary>

No. Usa las líneas rojas de VS Code o `pnpm typecheck`.

</details>

4. ¿Cuál es la diferencia entre `null` y `undefined`?

<details>
<summary>Respuesta</summary>

`undefined` significa que todavía no se ha dado nada. `null` significa que no hay valor, a propósito.

</details>

## Siguiente paso

En la próxima lección harás que tu programa tome decisiones con comparaciones y `if`.
