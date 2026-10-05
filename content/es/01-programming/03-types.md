---
title: Tipos
summary: Aprende que cada valor tiene un tipo y deja que el verificador de tipos de TypeScript encuentre errores antes de ejecutar el código.
duration: 45 min
---

## Objetivo

- Nombrar el tipo de un valor: string, number o boolean.
- Escribir una anotación de tipo y saber cuándo TypeScript encuentra el tipo por ti.
- Usar el verificador de tipos para encontrar errores antes de ejecutar.
- Explicar `null` y `undefined` con palabras simples.

## Cada valor tiene un tipo

Un **tipo** es la clase de un valor. Conociste tres clases en la lección anterior.

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

Lee la primera línea: `testName` es un string y su valor es este texto.

## Inferencia de tipos

Muchas veces no necesitas escribir el tipo. TypeScript puede verlo por el valor. Esto se llama **inferencia de tipos**.

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

El verificador de tipos informa un error:

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

El signo `|` significa "o". Así que `string | undefined` significa: un string, o todavía nada. Y `string | null` significa: un string, o ningún valor a propósito.

El verificador de tipos usa esto para protegerte. Si un valor puede faltar, te obliga a pensar en ese caso.

## Profundiza

### Por qué los tipos desaparecen cuando el programa se ejecuta

TypeScript comprueba tus tipos y luego los elimina. Lo que ejecuta Node.js es JavaScript simple. Por eso `node file.ts` no informa un error de tipos.

También significa que TypeScript solo sabe lo que tú le dices. Si un valor viene de fuera, como el texto de una página web, TypeScript no puede mirar dentro de él. Al ejecutarse, el valor tiene el tipo que realmente tiene.

### Una idea equivocada común: "Number() siempre da un número en el que puedo confiar"

`Number()` siempre devuelve un valor de tipo `number`. Pero el valor puede ser inútil.

```ts
console.log(Number("abc"));
console.log(Number(""));
console.log(typeof Number("abc"));
```

Esto muestra:

```text
NaN
0
number
```

`NaN` significa "no es un número" (*not a number*). Es un valor numérico que marca una conversión fallida. Su tipo sigue siendo `number`. Y un texto vacío se convierte en `0`, sin ningún aviso. Así que revisa el texto antes de confiar en el resultado.

### Cómo aparece en el trabajo real de automatización QA

Una página muestra un precio como texto, por ejemplo `$5.00`. Quieres sumarle 1.

```ts
console.log(Number("$5.00"));
console.log(Number("$5.00".replace("$", "")) + 1);
console.log("5" + 1);
```

Esto muestra:

```text
NaN
6
51
```

El signo `$` hace que la conversión falle. `replace` es una función que ya viene incluida en el texto. Aquí cambia `$` por nada. La última línea muestra el otro peligro: `+` con un string y un número los une como texto y da `"51"`.

Muchos resultados incorrectos en los tests vienen de esto. El valor de la página parecía un número, pero el código lo trató como texto.

### Una contrapartida: los tipos ayudan, pero no son tests

El verificador de tipos encuentra una clase de valor equivocada. No puede decirte si un precio es correcto. Solo un test con una comprobación puede hacerlo. Los tipos y los tests detectan problemas distintos, así que necesitas ambos.

## Práctica

1. Crea el archivo `exercises/01-programming/types.ts`.
2. Muestra el `typeof` de un texto, un número y `true`.
3. Muestra `"2" + "3"` y `2 + 3`. Comprueba que los resultados son distintos.
4. Convierte el texto `"10"` en número con `Number()`. Suma 5 y muestra el resultado.
5. Escribe `const retries: number = "three";`. Mira la línea roja en VS Code. Lee el mensaje. Después ejecuta `pnpm typecheck` en la terminal. Corrige la línea.
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

Una anotación es un tipo que tú escribes. Con la inferencia, TypeScript encuentra el tipo por el valor.

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

5. ¿Qué muestra este código y por qué?

```ts
console.log(typeof Number("abc"), Number("abc"));
```

<details>
<summary>Respuesta</summary>

Muestra `number NaN`. `Number()` no puede leer el texto `abc`, así que da `NaN`. `NaN` es un valor especial del tipo number. No es un error, así que el programa continúa.

</details>

6. Un test lee el texto `"20"` de una página y quiere el total después de sumar 5. Encuentra el bug.

```ts
const price = "20";
const total = price + 5;
console.log(total);
```

<details>
<summary>Respuesta</summary>

Muestra `205`, no `25`. La variable `price` es un string, así que `+` une el texto. La solución es `Number(price) + 5`. El verificador de tipos no se queja aquí, porque unir texto y un número está permitido.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Por qué `typeof null` da `"object"` en JavaScript?**
   - Busca: `typeof null object javascript why`
   - Una buena respuesta explica: la historia detrás de esto y que es un error conocido del lenguaje.

2. **¿Qué es `NaN` y por qué `NaN === NaN` es falso? ¿Cómo se comprueba?**
   - Busca: `javascript NaN not equal itself Number.isNaN`
   - Una buena respuesta explica: qué significa NaN, la comparación sorprendente y la forma correcta de comprobarlo.

3. **¿Cuál es la diferencia entre un verificador de tipos y un test, y qué problemas puede detectar cada uno?**
   - Busca: `static typing vs testing bugs`
   - Una buena respuesta explica: un problema que solo detectan los tipos, uno que solo detectan los tests y por qué los equipos usan ambos.

## Siguiente paso

En la próxima lección harás que tu programa tome decisiones con comparaciones e `if`.
