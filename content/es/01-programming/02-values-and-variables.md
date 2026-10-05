---
title: Valores y variables
summary: Guarda texto, números y valores verdadero/falso en variables, y combínalos con operaciones matemáticas y template literals.
duration: 30 min
---

## Objetivo

- Nombrar los tres tipos básicos de valor: texto, número y verdadero/falso.
- Guardar un valor en una variable con `const` o `let`.
- Elegir nombres claros para las variables.
- Armar un mensaje con varios valores usando un template literal.

## Valores

Un **valor** es un dato. Tu programa trabaja con valores todo el tiempo.

Hay tres tipos básicos. Puedes probarlos con `console.log`.

```ts
console.log("Login with valid user");
console.log(42);
console.log(true);
```

Esto muestra:

```text
Login with valid user
42
true
```

El primero es **texto**. El texto va entre comillas. Los programadores llaman *string* (cadena de texto) al texto.

El segundo es un **número**. Los números no llevan comillas.

El tercero es un *boolean* (booleano). Es `true` o `false`. Responde una pregunta de sí o no, como "¿pasó el test?".

## Variables

Una **variable** es un nombre para un valor. Funciona como la etiqueta de una caja. Pones un valor en la caja y usas la etiqueta para encontrarlo después.

```ts
const testName = "Login with valid user";
console.log(testName);
```

Esto muestra:

```text
Login with valid user
```

Lee la primera línea así: crea una variable llamada `testName` y dale este texto. Aquí el signo `=` significa "guardar". No significa "igual" como en matemáticas.

Puedes usar la variable muchas veces. Si el valor cambia, lo cambias en un solo lugar.

## const y let

Hay dos formas de crear una variable.

`const` crea una variable que no puede cambiar. Úsala por defecto.

```ts
const bugId = 101;
bugId = 102;
```

La segunda línea es un error. No puedes dar un valor nuevo a una `const`. El programa se detiene con un error que dice `Assignment to constant variable`.

`let` crea una variable que sí puede cambiar. Úsala solo cuando el valor deba cambiar.

```ts
let status = "open";
console.log(status);
status = "fixed";
console.log(status);
```

Esto muestra:

```text
open
fixed
```

Fíjate en que escribes `let` solo una vez. Para cambiar el valor después, escribe el nombre y `=`.

> **Cuidado:** Puede que veas `var` en código antiguo de internet. Nunca uses `var`. Tiene reglas confusas. Usa `const` o `let`.

## Nombres de variables

Elige un nombre que diga qué es el valor. Un buen nombre te evita escribir un comentario.

Reglas:

- Usa palabras en inglés.
- Empieza con una letra minúscula.
- No uses espacios. Escribe la palabra siguiente con mayúscula: `testName`, `openBugs`. Este estilo se llama **camelCase**.
- Los nombres distinguen mayúsculas de minúsculas. `status` y `Status` son dos nombres distintos.

Buenos nombres: `userName`, `failedTests`, `orderTotal`.

Malos nombres: `x`, `data`, `thing2`. No dicen qué hay dentro.

## Matemáticas básicas

Puedes hacer operaciones con números. Los signos son `+`, `-`, `*` (multiplicar) y `/` (dividir).

```ts
const passed = 8;
const failed = 2;
const total = passed + failed;
console.log(total);
console.log(total * 3);
```

Esto muestra:

```text
10
30
```

Las matemáticas siguen el orden habitual: `*` y `/` van antes que `+` y `-`. Usa paréntesis para elegir el orden: `(1 + 2) * 3` es 9.

## Unir texto

El signo `+` también une texto.

```ts
const firstPart = "Test ";
const secondPart = "passed";
console.log(firstPart + secondPart);
```

Esto muestra:

```text
Test passed
```

Unir muchas partes con `+` es difícil de leer. Hay una forma mejor.

## Template literals

Un ***template literal*** (plantilla de texto) es texto entre acentos graves. El acento grave es la tecla `` ` ``. En muchos teclados de Windows la pulsas y luego pulsas la barra espaciadora.

Dentro de un template literal, `${...}` pone el valor de una variable dentro del texto.

```ts
const user = "Ana";
const openBugs = 3;
console.log(`${user} has ${openBugs} open bugs`);
```

Esto muestra:

```text
Ana has 3 open bugs
```

También puedes poner un cálculo dentro de `${...}`:

```ts
console.log(`Total tests: ${8 + 2}`);
```

Esto muestra:

```text
Total tests: 10
```

> **Consejo:** Usa un template literal siempre que armes un mensaje con valores. Lo harás mucho en los tests.

## Práctica

1. Crea el archivo `exercises/01-programming/variables.ts`.
2. Crea una `const` llamada `testName` con el nombre de un test. Muéstrala.
3. Crea un `let` llamado `status` con el texto `"open"`. Muéstralo. Cámbialo a `"fixed"`. Muéstralo otra vez.
4. Crea dos números, `price` y `quantity`. Muestra el total con un template literal, como `Total: 60`.
5. Intenta cambiar una `const` a propósito. Ejecuta el archivo. Lee el error.
6. Abre el archivo `exercises/01-programming/02-values-and-variables.ts`. Ejecútalo con este comando:

```bash
node exercises/01-programming/02-values-and-variables.ts
```

Al principio todas las líneas dicen `FAIL`. Resuelve los ejercicios uno por uno. Ejecuta el archivo después de cada uno. Haz que todas las líneas digan `OK`.

## Comprueba lo que sabes

1. ¿Cuáles son los tres tipos básicos de valor?

<details>
<summary>Respuesta</summary>

Texto (string), número y boolean (`true` o `false`).

</details>

2. ¿Cuándo usas `let` en lugar de `const`?

<details>
<summary>Respuesta</summary>

Solo cuando el valor deba cambiar después. En los demás casos, usa `const`.

</details>

3. ¿Qué muestra esto? `const a = 2; console.log(a * 5 + 1);`

<details>
<summary>Respuesta</summary>

Muestra 11.

</details>

4. ¿Qué signo se usa alrededor de un template literal?

<details>
<summary>Respuesta</summary>

Acentos graves. Los valores van dentro de `${...}`.

</details>

## Siguiente paso

En la próxima lección aprenderás que cada valor tiene un tipo, y cómo TypeScript usa los tipos para encontrar errores.
