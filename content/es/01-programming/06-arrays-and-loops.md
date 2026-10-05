---
title: Arrays y bucles
summary: Guarda muchos valores en una lista y repite una acción para cada elemento con un bucle for...of.
duration: 35 min
---

## Objetivo

- Crear un array y leer elementos por índice.
- Añadir elementos y contarlos.
- Repetir una acción para cada elemento con `for...of`.
- Contar y sumar valores en un bucle, y revisar una lista con `includes`.

## Arrays

Un ***array*** (arreglo) es una lista de valores en orden. Se escribe con corchetes. Los valores se separan con comas.

```ts
const tests = ["login", "search", "checkout"];
console.log(tests);
```

Esto muestra:

```text
[ 'login', 'search', 'checkout' ]
```

Cada valor del array es un **elemento**. Node muestra aquí el texto con comillas simples. Es el mismo texto.

Un array también puede guardar números:

```ts
const durations = [12, 40, 7];
```

Guarda un solo tipo en cada array. Una lista de texto, o una lista de números.

## Índice

El **índice** es la posición de un elemento. La cuenta empieza en 0, no en 1.

```ts
const tests = ["login", "search", "checkout"];
console.log(tests[0]);
console.log(tests[2]);
```

Esto muestra:

```text
login
checkout
```

El primer elemento tiene el índice 0. El segundo tiene el índice 1. El tercero tiene el índice 2.

> **Cuidado:** El primer elemento es `[0]`, no `[1]`. Es una fuente muy común de errores. En una lista de 3 elementos, el último índice es 2.

Si pides un índice que no existe, obtienes `undefined`.

```ts
console.log(tests[5]);
```

Esto muestra:

```text
undefined
```

En este proyecto, el verificador de tipos es estricto. Trata `tests[0]` como "un string o `undefined`". Aun así puedes mostrarlo. Si quieres usarlo como string, primero debes comprobarlo con un `if`.

```ts
const first = tests[0];
if (first !== undefined) {
  console.log(first.toUpperCase());
}
```

Esto muestra:

```text
LOGIN
```

`toUpperCase()` es una función que ya viene incluida en el texto. Cambia el texto a mayúsculas.

## Longitud

La **longitud** (*length*) de un array es el número de elementos.

```ts
const tests = ["login", "search", "checkout"];
console.log(tests.length);
console.log(tests[tests.length - 1]);
```

Esto muestra:

```text
3
checkout
```

El último índice siempre es `length - 1`.

## Añadir elementos con push

***push*** añade un elemento al final del array.

```ts
const tests = ["login"];
tests.push("search");
tests.push("checkout");
console.log(tests);
```

Esto muestra:

```text
[ 'login', 'search', 'checkout' ]
```

Quizá te preguntes: el array es una `const`, entonces ¿por qué puede cambiar? Una `const` te impide darle al nombre un array nuevo. No te impide cambiar los elementos de adentro.

## Bucles

Un **bucle** repite código. Usa un bucle cuando necesites hacer lo mismo con cada elemento.

El bucle `for...of` toma un elemento a la vez.

```ts
const tests = ["login", "search", "checkout"];

for (const test of tests) {
  console.log(`Running ${test}`);
}
```

Esto muestra:

```text
Running login
Running search
Running checkout
```

Léelo así: para cada `test` en `tests`, ejecuta el código entre llaves. En la primera vuelta, `test` es `"login"`. En la segunda es `"search"`. En la tercera es `"checkout"`.

Tú eliges el nombre `test`. Usa un nombre que diga qué es un elemento.

## Contar en un bucle

Usa una variable `let` como contador. Cámbiala dentro del bucle.

```ts
const statuses = ["passed", "failed", "passed", "failed", "failed"];
let failedCount = 0;

for (const status of statuses) {
  if (status === "failed") {
    failedCount = failedCount + 1;
  }
}

console.log(`Failed tests: ${failedCount}`);
```

Esto muestra:

```text
Failed tests: 3
```

Fíjate en que `failedCount` empieza en 0 antes del bucle. Es un `let` porque cambia.

## Sumar en un bucle

La misma idea sirve para sumar números. Empieza en 0 y suma cada número.

```ts
const durations = [12, 40, 7];
let totalSeconds = 0;

for (const duration of durations) {
  totalSeconds = totalSeconds + duration;
}

console.log(totalSeconds);
```

Esto muestra:

```text
59
```

## Revisar una lista con includes

***includes*** pregunta si un valor está en el array. La respuesta es `true` o `false`.

```ts
const statuses = ["passed", "blocked"];
console.log(statuses.includes("blocked"));
console.log(statuses.includes("failed"));
```

Esto muestra:

```text
true
false
```

Úsalo con `if` para decidir qué hacer:

```ts
if (statuses.includes("blocked")) {
  console.log("Some tests are blocked");
}
```

Esto muestra:

```text
Some tests are blocked
```

## Práctica

1. Crea el archivo `exercises/01-programming/lists.ts`.
2. Crea un array con cuatro nombres de test. Muestra el primer y el último elemento.
3. Añade un nombre de test nuevo con `push`. Muestra la longitud.
4. Usa `for...of` para mostrar cada nombre con el texto `Running`.
5. Crea un array de duraciones. Usa un bucle para mostrar la suma.
6. Abre `exercises/01-programming/06-arrays-and-loops.ts` y ejecútalo:

```bash
node exercises/01-programming/06-arrays-and-loops.ts
```

Resuelve los ejercicios. Haz que todas las líneas digan `OK`.

## Comprueba lo que sabes

1. ¿Cuál es el índice del primer elemento de un array?

<details>
<summary>Respuesta</summary>

0.

</details>

2. Un array tiene 4 elementos. ¿Cuál es el índice del último?

<details>
<summary>Respuesta</summary>

3. El último índice es la longitud menos 1.

</details>

3. ¿Qué hace `push`?

<details>
<summary>Respuesta</summary>

Añade un elemento al final del array.

</details>

4. ¿Qué muestra esto? `let n = 0; for (const x of [1, 2, 3]) { n = n + x; } console.log(n);`

<details>
<summary>Respuesta</summary>

6. El bucle suma 1, luego 2, luego 3.

</details>

## Siguiente paso

En la próxima lección agruparás valores relacionados en objetos, por ejemplo el id, el título y el estado de un caso de prueba.
