---
title: Funciones
summary: Escribe funciones con parámetros y valores de retorno, y aprende por qué las funciones pequeñas con nombre hacen el código fácil de leer.
duration: 75 min
---

## Empieza con un acertijo

Quieres el área total de dos jardines cuadrados. Escribes una función para el área de un cuadrado y la llamas dos veces.

```ts
function areaOfSquare(side: number) {
  const area = side * side;
  console.log(area);
}

const total = areaOfSquare(3) + areaOfSquare(4);
console.log(total);
```

La terminal muestra tres líneas. Las dos primeras vienen de la función. ¿Qué esperas en la tercera línea, la de `total`?

La respuesta no es 25. Piensa en qué recibe la variable `total` de cada llamada. ¿De verdad se devuelve un número, o solo se muestra algo?

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Predecir qué devuelve una llamada a una función y qué solo imprime.
- Escribir una función con parámetros y un valor de retorno.
- Explicar la diferencia entre `console.log` y `return`.
- Dividir un problema en funciones pequeñas que hacen un solo trabajo cada una.

## Una función es una receta con nombre

Una **función** es un bloque de código con un nombre. Escribes los pasos una vez. Luego usas el nombre cada vez que necesitas los pasos.

Piensa en una receta. La receta tiene un nombre y una lista de pasos. No copias los pasos cada vez. Dices "haz la receta".

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

Un **parámetro** es una entrada de una función. Es una variable que recibe su valor cuando llamas a la función.

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

El `: string` es una anotación de tipo. Dice que `name` debe ser texto. El valor que das en la llamada es un **argumento**. Aquí los argumentos son `"Ana"` y `"Luis"`.

Una función puede tener muchos parámetros. Sepáralos con comas.

## Valores de retorno

Una función puede devolver un resultado. La palabra `return` hace esto. El resultado es el **valor de retorno**.

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

El `: number` después de los paréntesis es el tipo del valor de retorno. Dice: esta función devuelve un número.

Cuando la computadora llega a `return`, la función termina. Cualquier línea después de `return` no se ejecuta.

> **Cuidado:** `console.log` muestra un valor en la terminal. `return` devuelve un valor al código que llamó a la función. No son lo mismo. Una función que solo imprime no tiene valor de retorno.

### De vuelta al acertijo

La función `areaOfSquare` calcula el área, pero solo la imprime. No tiene `return`. Entonces cada llamada devuelve `undefined`, que significa "nada".

La tercera línea suma `undefined + undefined`. El resultado no es un número con sentido. La terminal muestra:

```text
9
16
NaN
```

El `9` y el `16` los imprime `console.log` dentro de la función. El `NaN` es la suma de dos nadas. El verificador de tipos también lo detecta: VS Code subraya el `+` y dice que no puede sumar dos valores `void`.

La solución es devolver el número e imprimir solo al final:

```ts
function areaOfSquare(side: number): number {
  return side * side;
}

const total = areaOfSquare(3) + areaOfSquare(4);
console.log(total);
```

Esto imprime `25`. Una función que devuelve un valor se puede usar en cuentas, guardar, comparar y probar. Una función que solo imprime solo la puede leer una persona.

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

La primera llamada devuelve su valor en el `if`. La segunda llamada se salta el `if` y llega al último `return`.

¿Y si olvidas el último `return`? Mira esta función y decide qué da `isHungry("full")`:

```ts
function isHungry(mood: string): boolean {
  if (mood === "hungry") {
    return true;
  }
}
```

Da `undefined`. Cuando el `if` es falso, la función llega a su final sin `return`. El verificador de tipos también lo reporta: `Function lacks ending return statement and return type does not include 'undefined'`.

## Funciones flecha

Hay una forma más corta de escribir una función. Se llama **función flecha** (*arrow function*). Usa el signo `=>`.

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

Hace lo mismo que una función normal. Verás funciones flecha muy seguido en los tests de Playwright. Puedes usar cualquiera de los dos estilos. Sé consistente dentro de un archivo.

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

Un valor por defecto incluso puede usar un parámetro que viene antes. Adivina la salida antes de leerla:

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

Puedes leer `totalWithTax` sin mirar dentro de `tax`. Las funciones pequeñas son fáciles de probar, fáciles de arreglar y fáciles de reutilizar.

Un buen hábito antes de escribir una función grande es la **descomposición**: divide el problema en problemas más pequeños y dale un nombre a cada uno. Para hallar el costo de una fiesta de pizza, quizá necesites `slicesNeeded`, `pizzasNeeded` y `totalPrice`. Cada una es pequeña. Juntas resuelven un problema grande. La siguiente lección muestra cómo hacerlo paso a paso.

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

Esto imprime:

```text
6
5
```

### Una idea equivocada común: "toda función devuelve algo"

Una función que no tiene `return` devuelve `undefined`. El acertijo del inicio de esta lección es este error.

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

La palabra `Hello` vino de `console.log` dentro de la función. La variable `result` no recibió nada. Si quieres un valor, debes devolverlo.

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

Aquí los pasos se escriben una vez y se usan en muchos lugares. Esto es DRY, "Don't Repeat Yourself" (no te repitas). Lo estudiarás al final de este módulo.

Un test con pasos claros, como `login()` y `addToCart()`, es fácil de leer para tu equipo.

### Una concesión

Una función debe hacer el código más fácil de leer. `login()` es un buen nombre para tres pasos. Pero si escondes cada línea en una función, el lector debe abrir muchas funciones para entender una sola cosa. No crees una función para código que usas una sola vez y que ya es claro. Esto es **YAGNI**: no construyas para una necesidad que solo imaginas.

## Práctica

1. Crea el archivo `exercises/01-programming/functions.ts`.
2. Escribe una función `double` que reciba un número y lo devuelva multiplicado por 2. Imprime `double(21)`. Debe imprimir 42.
3. Escribe una función `dogSummary` con un parámetro `name` y un parámetro `age`. Devuelve `<name> is <age> years old`. Imprime un resultado.
4. Agrega un valor por defecto para `age`. Llama a la función sin segundo argumento.
5. Reescribe `double` como una función flecha.
6. Escribe `areaOfSquare` del acertijo de las dos maneras: una que imprime y otra que devuelve. Suma las áreas de dos cuadrados con cada una. Mira cuál funciona.
7. Abre `exercises/01-programming/05-functions.ts` y ejecútalo:

```bash
node exercises/01-programming/05-functions.ts
```

Resuelve los ejercicios. Haz que todas las líneas digan `OK`.

## Reto

Escribe una función que convierta una cantidad de minutos en un texto de reloj. Por ejemplo, 135 minutos se vuelven `2:15`. Elige tu propio tema: la duración de una canción, un vuelo, una película, un tiempo de cocción.

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

Imprime `3 2`. En la primera llamada no hay segundo argumento, así que `b` toma su valor por defecto, que es `a * 2`, y `a` es 1. Entonces `b` es 2 y la suma es 3. En la segunda llamada, `b` se da como 1, así que no se usa el valor por defecto y la suma es 2. Un valor por defecto puede leer los parámetros que vienen antes.

</details>

2. Esta función debe devolver `true` para `"passed"`. ¿Qué da `isPassed("failed")`? Encuentra el problema.

```ts
function isPassed(status: string): boolean {
  if (status === "passed") {
    return true;
  }
}
```

<details>
<summary>Respuesta</summary>

Da `undefined`. Cuando el `if` es falso, la función llega a su final sin un `return`. Una función sin `return` devuelve `undefined`. Agrega `return false;` después del `if`. El verificador de tipos también reporta este problema, porque la función prometió un *boolean*.

</details>

3. Dos versiones de una función. Las dos funcionan. ¿Cuál es mejor y qué te haría elegir la otra?

```ts
function showArea(side: number): void {
  console.log(side * side);
}
```

```ts
function area(side: number): number {
  return side * side;
}
```

<details>
<summary>Respuesta</summary>

La segunda es mejor en la mayoría de los casos, porque quien llama decide qué hacer con el número: imprimirlo, sumarlo, compararlo o comprobarlo en un test. La primera decide por todos, y nadie puede reutilizar su resultado. Elegirías la primera cuando el único propósito es mostrar algo, como una línea de reporte al final de un programa. Un buen hábito es calcular en una función e imprimir en otra.

</details>

4. La función `tax` de la lección siempre usa 10 %. Una regla nueva dice que los libros pagan 4 % y la comida paga 21 %. ¿Qué debe cambiar y qué harías?

<details>
<summary>Respuesta</summary>

El número 10 está escondido dentro de `tax`, así que la función no puede manejar otras tasas. Agrega un parámetro para la tasa, por ejemplo `tax(amount, rate)`, y cambia cada llamada. Puedes darle a la tasa un valor por defecto, para que las llamadas viejas sigan funcionando. Así cada tasa vive en el lugar que conoce el producto. Sin este cambio, copiarías la función tres veces y tendrías que arreglar tres lugares después.

</details>

5. Una función `average(total, count)` devuelve `total / count`. ¿Qué devuelve para `average(0, 0)` y para `average(5, 0)`? ¿Es un buen resultado?

<details>
<summary>Respuesta</summary>

Devuelve `NaN` para la primera e `Infinity` para la segunda. El programa no se detiene, así que un número equivocado puede viajar lejos antes de que alguien lo vea. Un mejor diseño decide qué significa el caso vacío: devolver 0, devolver un mensaje o detenerse con un error claro. La decisión pertenece al requisito, porque un promedio de nada no tiene una única respuesta correcta.

</details>

6. Explica la diferencia entre `console.log` y `return` a un compañero, en tres oraciones. No uses las palabras "terminal" ni "mostrar".

<details>
<summary>Respuesta</summary>

Una buena respuesta: "Un return entrega un valor a la línea que llamó a la función, como un mesero que te trae un plato. Un console.log escribe el valor para que lo lea una persona, y el código que llamó a la función no recibe nada. Si quieres usar el valor otra vez en el programa, necesitas return". El razonamiento: una función es una herramienta para otro código. La salida para un humano es un efecto secundario y no se puede usar en el siguiente cálculo.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es el alcance (*scope*) en JavaScript y cuál es la diferencia entre variables locales y globales?**
   - Busca: `javascript scope local global function shadowing`
   - Pruébalo: crea una `const size = 1;` fuera de una función y una `const size = 2;` distinta dentro de una función que la imprima. Llama a la función y luego imprime `size` afuera. Explica los dos resultados.
   - Una buena respuesta explica: una definición de alcance, un ejemplo de cada tipo, y por qué demasiadas variables globales causan problemas.

2. **¿Cuál es la diferencia entre una función flecha y una función normal?**
   - Busca: `javascript arrow function vs function hoisting`
   - Pruébalo: llama a una función antes de la línea donde la defines. Hazlo una vez con una `function` normal y otra con una función flecha en una `const`. Lee el segundo error.
   - Una buena respuesta explica: la sintaxis más corta, qué significa *hoisting* (elevación), y al menos una diferencia real más.

3. **¿Qué es una función pura y por qué es fácil de probar con tests unitarios?**
   - Busca: `pure function javascript side effects testing`
   - Pruébalo: escribe `double(n)` y `uniqueEmail(prefix)` de esta lección. Llama a cada una dos veces con la misma entrada y compara los dos resultados. ¿Cuál es pura?
   - Una buena respuesta explica: las dos reglas de una función pura y por qué la misma entrada siempre da el mismo resultado que se puede comprobar.

## Siguiente paso

En la siguiente lección aprendes un método para resolver un problema paso a paso, para que una página en blanco no te detenga.
