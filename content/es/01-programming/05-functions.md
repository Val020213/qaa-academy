---
title: Funciones
summary: Escribe funciones con parámetros y valores de retorno, y aprende por qué las funciones pequeñas con nombre hacen el código fácil de leer.
duration: 50 min
---

## Objetivo

- Escribir una función y llamarla.
- Usar parámetros para darle una entrada a una función.
- Usar `return` para recibir un resultado.
- Escribir una función flecha y un parámetro con valor por defecto.

## Una función es una receta con nombre

Una **función** es un bloque de código con un nombre. Escribes los pasos una vez. Después usas el nombre cada vez que necesites los pasos.

Piensa en una receta. La receta tiene un nombre y una lista de pasos. No copias los pasos cada vez. Dices "haz la receta".

```ts
function printGreeting() {
  console.log("Hello, QA!");
}

printGreeting();
printGreeting();
```

Esto muestra:

```text
Hello, QA!
Hello, QA!
```

Las tres primeras líneas **definen** la función. Empieza con la palabra `function`, luego el nombre, luego `()` y después los pasos entre `{ }`. Definir no la ejecuta.

Las líneas `printGreeting();` **llaman** a la función. Una llamada ejecuta los pasos. Aquí se ejecuta dos veces.

## Parámetros

Un **parámetro** es una entrada de una función. Es una variable que recibe su valor cuando llamas a la función.

```ts
function greet(name: string) {
  console.log(`Hello, ${name}!`);
}

greet("Ana");
greet("Luis");
```

Esto muestra:

```text
Hello, Ana!
Hello, Luis!
```

El `: string` es una anotación de tipo. Dice que `name` debe ser texto. El valor que das en la llamada es un **argumento**. Aquí los argumentos son `"Ana"` y `"Luis"`.

Una función puede tener muchos parámetros. Sepáralos con comas.

## Valores de retorno

Una función puede devolver un resultado. La palabra `return` lo hace. El resultado es el **valor de retorno**.

```ts
function add(a: number, b: number): number {
  return a + b;
}

const total = add(2, 3);
console.log(total);
```

Esto muestra:

```text
5
```

El `: number` después de los paréntesis es el tipo del valor de retorno. Dice: esta función devuelve un número.

Cuando la computadora llega a `return`, la función termina. Ninguna línea después de `return` se ejecuta.

> **Cuidado:** `console.log` muestra un valor en la terminal. `return` devuelve un valor al código que llamó a la función. No son lo mismo. Una función que solo muestra texto no tiene valor de retorno.

## Un ejemplo de QA

Aquí hay una función con una decisión dentro. Usa lo que aprendiste en la lección 04.

```ts
function verdict(status: string): string {
  if (status === "passed") {
    return "pass";
  }
  return "fail";
}

console.log(verdict("passed"));
console.log(verdict("failed"));
```

Esto muestra:

```text
pass
fail
```

La primera llamada devuelve el valor en el `if`. La segunda llamada se salta el `if` y llega al último `return`.

## Funciones flecha

Hay una forma más corta de escribir una función. Se llama **función flecha** (*arrow function*). Usa el signo `=>`.

```ts
const multiply = (a: number, b: number): number => {
  return a * b;
};

console.log(multiply(4, 5));
```

Esto muestra:

```text
20
```

Hace lo mismo que una función normal. Verás funciones flecha a menudo en los tests de Playwright. Puedes usar cualquiera de los dos estilos. Sé coherente dentro de un archivo.

## Parámetros con valor por defecto

Un **parámetro con valor por defecto** tiene un valor que se usa cuando no das ningún argumento.

```ts
function formatResult(name: string, status: string = "pending"): string {
  return `${name}: ${status}`;
}

console.log(formatResult("Login test", "passed"));
console.log(formatResult("Search test"));
```

Esto muestra:

```text
Login test: passed
Search test: pending
```

## Por qué importan las funciones pequeñas

Dale a cada función un solo trabajo y un nombre claro. Así el código se lee casi como una frase.

```ts
function tax(amount: number): number {
  return amount / 10;
}

function totalWithTax(amount: number): number {
  return amount + tax(amount);
}

console.log(totalWithTax(100));
```

Esto muestra:

```text
110
```

Puedes leer `totalWithTax` sin mirar dentro de `tax`. Las funciones pequeñas son fáciles de probar, de corregir y de reutilizar. Un test con pasos claros, como `login()` y `addToCart()`, es fácil de leer para tu equipo.

## Profundiza

### Por qué las variables dentro de una función se quedan dentro

Las variables creadas dentro de una función existen solo mientras la función se ejecuta. Esto se llama **alcance** (*scope*). La función tiene su propio espacio privado.

```ts
function secretDemo() {
  const secret = 1;
  return secret;
}

secretDemo();
console.log(secret);
```

La última línea falla con `ReferenceError: secret is not defined`. La variable vivió solo dentro de la función. Esto es bueno. Dos funciones pueden usar el mismo nombre sin chocar.

Un parámetro también es una copia del valor. Cambiarlo no cambia la variable que pasaste.

```ts
function addOne(n: number): number {
  n = n + 1;
  return n;
}

let x = 5;
console.log(addOne(x));
console.log(x);
```

Esto muestra:

```text
6
5
```

### Una idea equivocada común: "toda función devuelve algo"

Una función que no tiene `return` devuelve `undefined`.

```ts
function printGreeting() {
  console.log("Hello");
}

const result = printGreeting();
console.log(result);
```

Esto muestra:

```text
Hello
undefined
```

La palabra `Hello` vino del `console.log` dentro de la función. La variable `result` no recibió nada. Si quieres un valor, debes devolverlo.

### Cómo aparece en el trabajo real de automatización QA

Cada test debe crear sus propios datos. Una función pequeña lo hace una sola vez para todos los tests.

```ts
function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}@example.com`;
}

console.log(uniqueEmail("ana"));
```

`Date.now()` es la hora actual en milisegundos. Las llamadas con el mismo prefijo en milisegundos distintos dan correos distintos. Dos llamadas en el mismo milisegundo pueden dar el mismo correo. La salida se ve así, con otro número en tu computadora:

```text
ana-1791219025604@example.com
```

Aquí los pasos se escriben una vez y se usan en muchos lugares. Esto es DRY (*Don't Repeat Yourself*, no te repitas). Lo estudiarás al final de este módulo.

### Una contrapartida

Una función debe hacer que un test sea más fácil de leer. `login()` es un buen nombre para tres pasos. Pero si escondes cada línea en una función, el lector debe abrir muchas funciones para entender un solo test. No crees una función para código que usas una sola vez y que ya es claro.

## Práctica

1. Crea el archivo `exercises/01-programming/functions.ts`.
2. Escribe una función `double` que reciba un número y lo devuelva multiplicado por 2. Muestra `double(21)`. Debe mostrar 42.
3. Escribe una función `statusMessage` con un parámetro `name` y un parámetro `status`. Devuelve `Test <name> is <status>`. Muestra un resultado.
4. Añade un valor por defecto para `status`. Llama a la función sin un segundo argumento.
5. Reescribe `double` como una función flecha.
6. Abre `exercises/01-programming/05-functions.ts` y ejecútalo:

```bash
node exercises/01-programming/05-functions.ts
```

Resuelve los ejercicios. Haz que todas las líneas digan `OK`.

## Comprueba lo que sabes

1. ¿Cuál es la diferencia entre definir y llamar a una función?

<details>
<summary>Respuesta</summary>

Definir escribe los pasos y les da un nombre. Llamar ejecuta los pasos.

</details>

2. ¿Qué es un parámetro?

<details>
<summary>Respuesta</summary>

Una entrada de una función. Es una variable que recibe su valor de la llamada.

</details>

3. ¿Qué hace `return`?

<details>
<summary>Respuesta</summary>

Devuelve un valor al código que llamó a la función y termina la función.

</details>

4. ¿Qué muestra `formatResult("Search test")` si no hay un `console.log` a su alrededor?

<details>
<summary>Respuesta</summary>

Nada. La función devuelve un valor pero no lo muestra. Necesitas `console.log` para verlo.

</details>

5. ¿Qué muestra este código y por qué?

```ts
function f(a: number, b: number = 2): number {
  return a * b;
}

console.log(f(3), f(3, 4));
```

<details>
<summary>Respuesta</summary>

Muestra `6 12`. En la primera llamada no hay segundo argumento, así que `b` usa el valor por defecto 2, y 3 * 2 es 6. En la segunda llamada, `b` es 4, y 3 * 4 es 12.

</details>

6. Esta función debería devolver `true` para `"passed"`. ¿Qué da `isPassed("failed")`? Encuentra el problema.

```ts
function isPassed(status: string): boolean {
  if (status === "passed") {
    return true;
  }
}
```

<details>
<summary>Respuesta</summary>

Da `undefined`. Cuando el `if` es falso, la función llega a su final sin un `return`. Una función sin `return` devuelve `undefined`. Añade `return false;` después del `if`. El verificador de tipos también informa este problema, porque la función prometió un boolean.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es el alcance (*scope*) en JavaScript y cuál es la diferencia entre variables locales y globales?**
   - Busca: `javascript scope local global function`
   - Una buena respuesta explica: una definición de alcance, un ejemplo de cada tipo y por qué demasiadas variables globales causan problemas.

2. **¿Cuál es la diferencia entre una función flecha y una función normal?**
   - Busca: `javascript arrow function vs function`
   - Una buena respuesta explica: la sintaxis más corta y al menos una diferencia real, como el funcionamiento de `this`.

3. **¿Qué es una función pura y por qué es fácil de probar con tests unitarios?**
   - Busca: `pure function javascript side effects testing`
   - Una buena respuesta explica: las dos reglas de una función pura y por qué la misma entrada siempre da el mismo resultado que se puede comprobar.

## Siguiente paso

En la próxima lección guardarás muchos valores en una lista y repetirás una acción para cada uno.
