---
title: Valores y variables
duration: 50 min
---

## Objetivo

En esta lección guardas texto, números y valores verdadero/falso en variables, y aprendes a predecir qué contiene cada variable después de varios cambios.

- Predecir qué guarda una variable después de una serie de cambios.
- Elegir entre `const` y `let`, y explicar la elección.
- Ponerle a una variable un nombre tal que el lector no necesite un comentario.
- Armar un mensaje con varios valores usando una plantilla de texto (*template literal*).

## Valores

Un **valor** es un dato con el que trabaja tu programa. Hay tres tipos básicos. Puedes probarlos con `console.log`.

```ts
console.log("Rex");
console.log(3);
console.log(true);
```

Esto imprime:

```text
Rex
3
true
```

El primero es **texto**. El texto va entre comillas. Los programadores lo llaman *string* (cadena de texto).

El segundo es un **número**. Los números no llevan comillas.

El tercero es un *boolean* (booleano). Es `true` (verdadero) o `false` (falso) y responde una pregunta de sí o no, como "¿Rex tiene hambre?".

## Variables

Una **variable** es un nombre para un valor.

```ts
const dogName = "Rex";
console.log(dogName);
```

Esto imprime:

```text
Rex
```

Lee la primera línea así: crea una variable llamada `dogName` y dale este texto. El signo `=` aquí significa "guardar". No significa "igual", como en matemáticas.

Puedes usar la variable muchas veces. Si el valor cambia, lo cambias en un solo lugar.

### Una variable guarda un resultado

Una variable guarda el valor que se calculó en ese momento, no la fórmula. Mira este programa:

```ts
let side = 4;
const area = side * side;
side = 5;
console.log(area);
```

Imprime `16`. La línea `const area = side * side;` hace la cuenta una sola vez: lee `side`, que vale 4, calcula 16 y guarda el número 16. Después, `side = 5` cambia solo `side`, y `area` sigue con 16.

Si quieres el área nueva, debes calcularla de nuevo:

```ts
let side = 4;
let area = side * side;
side = 5;
area = side * side;
console.log(area);
```

Esto imprime `25`.

## const y let

Hay dos maneras de crear una variable.

`const` crea una variable que no puede cambiar. Úsala por defecto.

`let` crea una variable que sí puede cambiar. Úsala solo cuando el valor deba cambiar.

```ts
const dogAge = 3;
dogAge = 4;
console.log(dogAge);
```

El programa se detiene en la línea 2 con un error que dice `Assignment to constant variable`. No puedes dar un valor nuevo a una `const`. La línea 3 nunca se ejecuta.

Ahora la misma idea con `let`:

```ts
let dogAge = 3;
console.log(dogAge);
dogAge = 4;
console.log(dogAge);
```

Esto imprime:

```text
3
4
```

Fíjate en que escribes `let` solo una vez. Para cambiar el valor después, escribe el nombre y `=`.

¿Por qué no usar `let` en todas partes? Porque `const` le dice al lector que el valor nunca cambia, y cuando ve `let` sabe que debe vigilar un cambio.

> **Cuidado:** Puedes ver `var` en código viejo de internet. Nunca uses `var`. Tiene reglas confusas. Usa `const` o `let`.

## Poner nombres a las variables

Elige un nombre que diga para qué sirve el valor. Un buen nombre te ahorra escribir un comentario: `const t = 5 * 7;` no dice nada, y `const cookingMinutes = servings * minutesPerServing;` se entiende sola.

Reglas:

- Usa palabras en inglés.
- Empieza con una letra minúscula.
- No uses espacios. Escribe la palabra siguiente con mayúscula: `dogName`, `ticketPrice`. Este estilo se llama **camelCase**.
- Los nombres distinguen mayúsculas y minúsculas. `score` y `Score` son dos nombres distintos.

![En camelCase, cada mayúscula es una joroba.](/images/camel-case.es.svg)

Buenos nombres: `dogAge`, `squareArea`, `playlistLength`.

Malos nombres: `x`, `data`, `thing2`. No te dicen qué hay dentro.

## Matemáticas básicas

Puedes hacer cuentas con números. Los signos son `+`, `-`, `*` (por) y `/` (entre).

```ts
const side = 6;
const squareArea = side * side;
const perimeter = side * 4;
console.log(squareArea);
console.log(perimeter);
console.log(squareArea + perimeter * 2);
```

Esto imprime:

```text
36
24
84
```

Las matemáticas siguen el orden de siempre: `*` y `/` van antes que `+` y `-`. Usa paréntesis para elegir el orden: `(1 + 2) * 3` es 9.

`Math.PI` es un valor ya hecho para el número pi. El área de un círculo es pi por el radio por el radio:

```ts
const radius = 5;
console.log(3.14 * radius * radius);
console.log(Math.PI * radius * radius);
```

Esto imprime:

```text
78.5
78.53981633974483
```

Ninguna respuesta está "mal": una usa una versión corta de pi y la otra está muy cerca del valor real.

Con decimales hay un caso más delicado. Suma diez centavos y veinte centavos:

```ts
console.log(0.1 + 0.2);
```

Imprime:

```text
0.30000000000000004
```

Esto no es un bug de tu programa ni de JavaScript. Se llama **error de punto flotante** (*floating point error*) y aparece en casi todos los lenguajes de programación.

La causa es la forma en que se guardan los números. Tú los escribes en base 10, pero JavaScript los guarda en binario y con un espacio fijo: 64 bits por número, según el estándar IEEE 754. En base 10 pasa algo parecido con 1/3, que es 0.3333… sin fin: si solo puedes escribir una cantidad fija de cifras, tienes que cortar. En binario, 0.1 es una de esas fracciones que no terminan. Lo que queda guardado es el número más cercano posible, 0.1000000000000000055…, y con 0.2 pasa lo mismo. Al sumarlos se suman también los dos errores, y el resultado ya no cae exactamente en 0.3.

No todos los decimales tienen este problema. 0.5 y 0.25 son exactos, porque en binario son 1/2 y 1/4. Los números enteros también son exactos, hasta 9 007 199 254 740 992 (2 elevado a 53).

Esto tiene dos consecuencias prácticas:

- Una cuenta con decimales puede no dar el resultado exacto que esperas. Si un test comprueba que `0.1 + 0.2` es exactamente `0.3`, falla, aunque la suma "esté bien". Con decimales se comprueba que el resultado esté muy cerca del esperado, o se redondea antes de comparar.
- Cuando el número es dinero, un error pequeño es un problema. Guarda el dinero en la unidad más pequeña, como los centavos, en números enteros.

```ts
const priceInCents = 1999;
console.log(priceInCents * 3);
```

Esto imprime `5997`. Divides entre 100 solo cuando muestras el precio a una persona.

## Unir texto

El signo `+` también une texto.

```ts
const firstPart = "Rex is ";
const secondPart = "hungry";
console.log(firstPart + secondPart);
```

Esto imprime:

```text
Rex is hungry
```

Unir muchas partes con `+` es difícil de leer. Hay una manera mejor.

## Plantillas de texto (template literals)

Un *template literal* (plantilla de texto) es texto entre comillas invertidas. La comilla invertida es la tecla `` ` ``. En muchos teclados de Windows la presionas y luego presionas la barra espaciadora.

Dentro de un *template literal*, `${...}` pone el valor de una variable dentro del texto.

```ts
const dogName = "Rex";
const dogAge = 3;
console.log(`${dogName} is ${dogAge} years old`);
```

Esto imprime:

```text
Rex is 3 years old
```

También puedes poner un cálculo dentro de `${...}`:

```ts
console.log(`${dogName} is ${dogAge * 7} in dog years`);
```

Esto imprime:

```text
Rex is 21 in dog years
```

> **Consejo:** Usa un *template literal* siempre que armes un mensaje con valores.

## Profundiza

### Una variable guarda su propia copia de un valor

Cuando escribes `const saved = price;`, JavaScript copia el valor de `price` en `saved`. Las dos variables no quedan unidas.

```ts
let price = 10;
const saved = price;
price = 20;
console.log(saved, price);
```

Esto imprime:

```text
10 20
```

`saved` conservó el valor viejo. Cambiar `price` después no lo cambió.

### El nombre de una variable y el texto no son lo mismo

Los principiantes suelen poner comillas alrededor del nombre de una variable. Compara estas dos líneas.

```ts
console.log("price");
console.log(price);
```

La primera línea imprime la palabra `price`, porque las comillas crean texto. La segunda imprime el valor guardado en la variable, aquí `20`. Sin comillas significa "busca la variable". Con comillas significa "esto es texto".

Pasa lo mismo con los *template literals*. Un texto normal entre comillas no rellena valores. Solo lo hacen las comillas invertidas.

## Práctica

1. Crea el archivo `exercises/01-programming/variables.ts`.
2. Crea una `const` llamada `dogName` con un nombre. Imprímela.
3. Crea un `let` llamado `mood` con el texto `"sleepy"`. Imprímelo. Cámbialo a `"playful"`. Imprímelo otra vez.
4. Crea dos números, `price` y `quantity`, para algo que comprarías. Imprime el total con un *template literal*, como `Total: 60`.
5. Intenta cambiar una `const` a propósito. Ejecuta el archivo. Lee el error.
6. Abre el archivo `exercises/01-programming/02-values-and-variables.ts`. Ejecútalo con este comando:

```bash
node exercises/01-programming/02-values-and-variables.ts
```

Al principio todas las líneas dicen `FAIL`. Resuelve los ejercicios uno por uno. Ejecuta el archivo después de cada uno. Haz que todas las líneas digan `OK`.

## Reto

Escribe un programa que imprima un recibo o una tarjeta de puntaje. Elige tu propio tema, por ejemplo una tienda de mascotas o un pedido de pizza.

Crea el archivo `exercises/challenges/values-and-variables.ts`.

Está terminado cuando:

- Cada número y texto que usas más de una vez está guardado en una variable. Ningún número está escrito dos veces.
- El programa imprime al menos cinco líneas, y al menos una tiene un total que calculas (con impuesto, un descuento o el total de un equipo).
- Cada monto de dinero se imprime con exactamente dos decimales, como `7.50`, no `7.5`.
- Cambias un número al inicio del archivo, lo ejecutas de nuevo y cada línea que depende de él es correcta.

Vas a necesitar algo que esta lección no enseñó: cómo imprimir un número con una cantidad fija de decimales. Busca: `javascript toFixed 2 decimals`, `javascript number format 2 decimal places`.

## Piénsalo bien

1. ¿Qué imprime este código y por qué?

```ts
let score = 10;
const bonus = score;
score = score + 5;
console.log(bonus + score);
```

<details>
<summary>Respuesta</summary>

Imprime `25`. La segunda línea copia el valor 10 en `bonus`. La tercera línea cambia solo `score`, a 15. La última línea suma 10 y 15.

</details>

2. Este código debería imprimir `Hello, Rex`, pero no lo hace. Encuentra el bug.

```ts
const dogName = "Rex";
console.log("Hello, ${dogName}");
```

<details>
<summary>Respuesta</summary>

Imprime `Hello, ${dogName}`. El texto usa comillas normales, así que el analizador lo lee como un texto literal y `${dogName}` son caracteres simples. Un *template literal* necesita comillas invertidas: `` `Hello, ${dogName}` ``. El programa se ejecuta sin error, por eso este bug es fácil de pasar por alto.

</details>

3. ¿Qué se rompe si escribes `let` en lugar de `const` para todas las variables de un programa?

<details>
<summary>Respuesta</summary>

No se rompe nada al ejecutarlo. El programa da la misma salida. Lo que pierdes es información: con `let` en todas partes, el lector debe revisar cada variable por si cambia. También pierdes una red de seguridad. Si cambias un valor por accidente, `const` detiene el programa con un error, y `let` no.

</details>

## Siguiente paso

En la siguiente lección aprendes que cada valor tiene un tipo, y cómo TypeScript usa los tipos para encontrar errores.
