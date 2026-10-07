---
title: Funciones
duration: 60 min
---

## Objetivo

En esta lección escribes funciones que reciben datos y devuelven un resultado, y aprendes a distinguir lo que una función devuelve de lo que solo imprime.

- Escribir una función con parámetros y un valor de retorno.
- Predecir qué devuelve una llamada a una función y qué solo imprime.
- Usar parámetros con valor por defecto y funciones flecha.
- Dividir un problema en funciones pequeñas que hacen un solo trabajo cada una.

## Tu primera función

Una **función** es un bloque de código con nombre. Escribes los pasos una vez y los ejecutas con el nombre cuantas veces quieras.

```ts
function barkTwice() {
  console.log("Woof!");
  console.log("Woof!");
}

barkTwice();
barkTwice();
```

Esto imprime:

```text
Woof!
Woof!
Woof!
Woof!
```

Las primeras cuatro líneas **definen** la función. Empieza con la palabra `function`, luego el nombre, luego `()`, luego los pasos entre `{ }`. Definir no la ejecuta.

Las líneas `barkTwice();` **llaman** a la función. Una llamada ejecuta los pasos. Aquí los ejecuta dos veces.

## Parámetros

Un **parámetro** es una entrada de una función: una variable que recibe su valor cuando llamas a la función.

```ts
function greet(name: string) {
  console.log(`Hello, ${name}!`);
}

greet("Ana");
greet("Luis");
```

Esto imprime:

```text
Hello, Ana!
Hello, Luis!
```

El `: string` dice que `name` es texto. El valor que das en la llamada es un **argumento**. Aquí los argumentos son `"Ana"` y `"Luis"`.

Una función puede tener muchos parámetros. Sepáralos con comas.

## Valores de retorno

Una función puede devolver un resultado con la palabra `return`. Ese resultado es el **valor de retorno**.

```ts
function areaOfRectangle(width: number, height: number): number {
  return width * height;
}

const gardenArea = areaOfRectangle(4, 5);
console.log(gardenArea);
```

Esto imprime:

```text
20
```

El `: number` después de los paréntesis es el tipo del valor de retorno: esta función devuelve un número.

Cuando Node.js ejecuta `return`, la función termina. Las líneas que siguen no se ejecutan.

> **Cuidado:** `console.log` muestra un valor en la terminal. `return` devuelve un valor al código que llamó a la función. No son lo mismo. Una función que solo imprime no tiene valor de retorno.

### Una función que solo imprime

Esta función calcula el área de un cuadrado, pero solo la imprime. Se llama dos veces para sumar el área de dos jardines:

```ts
function areaOfSquare(side: number) {
  const area = side * side;
  console.log(area);
}

const total = areaOfSquare(3) + areaOfSquare(4);
console.log(total);
```

Como no tiene `return`, cada llamada devuelve `undefined`, que significa "nada". La tercera línea suma `undefined + undefined`, y la terminal muestra:

```text
9
16
NaN
```

El `9` y el `16` los imprime `console.log` dentro de la función. El `NaN` es el resultado de sumar dos nadas. El verificador de tipos también lo detecta: VS Code subraya el `+` y dice que no puede sumar dos valores `void`.

La solución es devolver el número e imprimir solo al final:

```ts
function areaOfSquare(side: number): number {
  return side * side;
}

const total = areaOfSquare(3) + areaOfSquare(4);
console.log(total);
```

Esto imprime `25`. Una función que devuelve un valor se puede usar en cuentas, guardar, comparar y probar. Una función que solo imprime solo la puede leer una persona.

Lo mismo pasa con cualquier función sin `return`:

```ts
function printGreeting() {
  console.log("Hello");
}

const result = printGreeting();
console.log(result);
```

Esto imprime:

```text
Hello
undefined
```

La palabra `Hello` viene del `console.log` dentro de la función. La variable `result` no recibió nada. Si quieres un valor, debes devolverlo.

## Decisiones dentro de una función

Una función puede usar lo que aprendiste en la lección 04. Esta convierte la edad de un perro en una etapa de vida.

```ts
function lifeStage(dogAge: number): string {
  if (dogAge < 2) {
    return "puppy";
  }
  return "adult";
}

console.log(lifeStage(1));
console.log(lifeStage(6));
```

Esto imprime:

```text
puppy
adult
```

La primera llamada devuelve su valor en el `if`. La segunda se salta el `if` y llega al último `return`.

El `: string` después de los paréntesis es opcional. Si lo quitas, el verificador de tipos deduce el tipo de retorno a partir de los `return` de la función. Aquí deduce algo más preciso que `string`: `"puppy" | "adult"`, que se lee «el texto puppy o el texto adult», y ningún otro. Pasa el cursor sobre el nombre de la función en VS Code y verás su firma completa, sin tener que leer el cuerpo.

![El editor muestra el tipo de retorno que dedujo el verificador: solo dos textos posibles.](/images/ts-inferred-return.png)

Escribir el tipo sirve para lo contrario: declaras lo que la función debe devolver, y el verificador te avisa si algún `return` no lo cumple.

Si olvidas ese último `return`, el caso en que el `if` es falso devuelve `undefined`:

```ts
function isHungry(mood: string): boolean {
  if (mood === "hungry") {
    return true;
  }
}
```

`isHungry("full")` llega al final de la función sin `return`. El verificador de tipos también lo reporta: `Function lacks ending return statement and return type does not include 'undefined'`.

## Funciones flecha

Hay una forma más corta de escribir una función: la **función flecha** (*arrow function*), que usa el signo `=>`.

```ts
const multiply = (a: number, b: number): number => {
  return a * b;
};

console.log(multiply(4, 5));
```

Esto imprime:

```text
20
```

Hace lo mismo que una función normal. Puedes usar cualquiera de los dos estilos; sé consistente dentro de un archivo.

## Parámetros con valor por defecto

Un **parámetro con valor por defecto** tiene un valor que se usa cuando no das ningún argumento.

```ts
function describeSong(title: string, minutes: number = 3): string {
  return `${title} lasts ${minutes} minutes`;
}

console.log(describeSong("Yesterday", 2));
console.log(describeSong("Hey Jude"));
```

Esto imprime:

```text
Yesterday lasts 2 minutes
Hey Jude lasts 3 minutes
```

Un valor por defecto incluso puede usar un parámetro que viene antes:

```ts
function total(price: number, tip: number = price / 10): number {
  return price + tip;
}

console.log(total(50));
console.log(total(50, 0));
```

Esto imprime:

```text
55
50
```

## Por qué importan las funciones pequeñas

Dale a cada función un solo trabajo y un nombre claro. Esta idea se llama **responsabilidad única** (*single responsibility*). Así el código se lee casi como una oración.

```ts
function tax(amount: number): number {
  return amount / 10;
}

function totalWithTax(amount: number): number {
  return amount + tax(amount);
}

console.log(totalWithTax(100));
```

Esto imprime:

```text
110
```

Puedes leer `totalWithTax` sin mirar dentro de `tax`. Las funciones pequeñas son fáciles de probar, de arreglar y de reutilizar.

Antes de escribir una función grande conviene aplicar la **descomposición**: divide el problema en problemas más pequeños y dale un nombre a cada uno. Para hallar el costo de una fiesta de pizza, quizá necesites `slicesNeeded`, `pizzasNeeded` y `totalPrice`. Cada una es pequeña, y juntas resuelven el problema completo.

## Profundiza

### Las variables de una función se quedan dentro

Las variables creadas dentro de una función existen solo mientras la función se ejecuta. Esto se llama **alcance** (*scope*).

```ts
function secretDemo() {
  const secret = 1;
  return secret;
}

secretDemo();
console.log(secret);
```

La última línea falla con `ReferenceError: secret is not defined`. Gracias a esto, dos funciones pueden usar el mismo nombre sin chocar.

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

Esto imprime:

```text
6
5
```

### Una concesión

Una función debe hacer el código más fácil de leer. `login()` es un buen nombre para tres pasos. Pero si escondes cada línea en una función, el lector tiene que abrir muchas funciones para entender una sola cosa. No crees una función para código que usas una sola vez y que ya es claro.

## Práctica

1. Crea el archivo `exercises/01-programming/functions.ts`.
2. Escribe una función `double` que reciba un número y lo devuelva multiplicado por 2. Imprime `double(21)`. Debe imprimir 42.
3. Escribe una función `dogSummary` con un parámetro `name` y un parámetro `age`. Devuelve `<name> is <age> years old`. Imprime un resultado.
4. Agrega un valor por defecto para `age`. Llama a la función sin segundo argumento.
5. Reescribe `double` como una función flecha.
6. Escribe `areaOfSquare` de las dos maneras: una que imprime y otra que devuelve. Suma las áreas de dos cuadrados con cada una. Mira cuál funciona.
7. Abre `exercises/01-programming/05-functions.ts` y ejecútalo:

```bash
node exercises/01-programming/05-functions.ts
```

Resuelve los ejercicios. Haz que todas las líneas digan `OK`.

## Reto

Escribe una función que convierta una cantidad de minutos en un texto de reloj. Por ejemplo, 135 minutos se vuelven `2:15`. Elige tu propio tema: la duración de una canción, un vuelo o una película.

Crea el archivo `exercises/challenges/functions.ts`. Llama `formatDuration` a la función principal.

Está terminado cuando:

- `formatDuration(135)` devuelve `2:15`, y `formatDuration(60)` devuelve `1:00`.
- `formatDuration(5)` devuelve `0:05` y `formatDuration(0)` devuelve `0:00`. Los minutos siempre tienen dos dígitos.
- Al final del archivo imprimes cada una de estas cuatro llamadas junto al texto esperado, para ver que coinciden cuando ejecutas `node exercises/challenges/functions.ts`.
- `formatDuration` usa una segunda función pequeña para una parte del trabajo. Cada función tiene un solo trabajo.

Vas a necesitar algo que esta lección no enseñó: cómo hallar las horas completas y los minutos que sobran, y cómo rellenar un texto con un cero a la izquierda. Busca: `javascript Math.floor`, `javascript remainder operator`, `javascript padStart`.

## Piénsalo bien

1. ¿Qué imprime este código y por qué?

```ts
function f(a: number, b: number = a * 2): number {
  return a + b;
}

console.log(f(1), f(1, 1));
```

<details>
<summary>Respuesta</summary>

Imprime `3 2`. En la primera llamada no hay segundo argumento, así que `b` toma su valor por defecto, que es `a * 2`, y `a` es 1. Entonces `b` es 2 y la suma es 3. En la segunda llamada, `b` se da como 1, así que no se usa el valor por defecto y la suma es 2.

</details>

2. La función `tax` de la lección siempre usa 10 %. Una regla nueva dice que los libros pagan 4 % y la comida paga 21 %. ¿Qué debe cambiar en `tax`?

<details>
<summary>Respuesta</summary>

El número 10 está escondido dentro de `tax`, así que la función no puede manejar otras tasas. Agrega un parámetro para la tasa, por ejemplo `tax(amount, rate)`, y cambia cada llamada. Puedes darle a la tasa un valor por defecto para que las llamadas viejas sigan funcionando.

</details>

3. Una función `average(total, count)` devuelve `total / count`. ¿Qué devuelve para `average(0, 0)` y para `average(5, 0)`? ¿Es un buen resultado?

<details>
<summary>Respuesta</summary>

Devuelve `NaN` para la primera e `Infinity` para la segunda. El programa no se detiene, así que un número equivocado puede viajar lejos antes de que alguien lo vea. Un mejor diseño decide qué significa el caso vacío: devolver 0, devolver un mensaje o detenerse con un error claro.

</details>

## Siguiente paso

En la siguiente lección aprendes un método para resolver un problema paso a paso, para que una página en blanco no te detenga.
