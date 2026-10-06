---
title: Valores y variables
summary: Guarda texto, números y valores verdadero/falso en variables, y descubre qué recuerda una variable y qué olvida.
duration: 70 min
---

## Empieza con un acertijo

En una hoja de cálculo escribes `=A1*A1` en la celda B1. Cuando cambias A1, B1 también cambia. Ahora mira la misma idea en código. Un cuadrado tiene un lado y un área.

```ts
let side = 4;
const area = side * side;
side = 5;
console.log(area);
```

¿Qué imprime la terminal? Hay dos respuestas tentadoras. Una es `16`. La otra es `25`, porque la hoja de cálculo se actualizaría.

Piensa en qué hace la computadora en cada línea. ¿`area` guarda un número, o guarda una fórmula que se calcula de nuevo cada vez?

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Predecir qué guarda una variable después de una serie de cambios.
- Elegir entre `const` y `let`, y explicar la elección.
- Ponerle a una variable un nombre tal que el lector no necesite un comentario.
- Armar un mensaje con varios valores usando una plantilla de texto (*template literal*).

## Valores

Un **valor** es un dato. Tu programa trabaja con valores todo el tiempo.

Hay tres tipos básicos. Piensa en un perro: tiene un nombre, una edad y un dato de sí o no, como "tiene hambre". Puedes probarlos con `console.log`.

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

El primero es **texto**. El texto va entre comillas. Los programadores llaman al texto *string* (cadena de texto).

El segundo es un **número**. Los números no llevan comillas.

El tercero es un *boolean* (booleano). Es `true` (verdadero) o `false` (falso). Responde una pregunta de sí o no, como "¿Rex tiene hambre?".

## Variables

Una **variable** es un nombre para un valor. Funciona como la etiqueta de una caja. Pones un valor en la caja y usas la etiqueta para encontrarlo después.

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

### De vuelta al acertijo

El acertijo imprime `16`. La línea `const area = side * side;` hace la cuenta una sola vez, en ese momento. Lee `side`, que vale 4, calcula 16 y guarda el número 16. Después de eso, `area` no sabe nada de `side`.

Más tarde, `side = 5` cambia solo la caja llamada `side`. La caja llamada `area` sigue con 16.

Una celda de hoja de cálculo guarda una fórmula. Una variable guarda un resultado. Si quieres el área nueva, debes calcularla de nuevo:

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

Antes de leer el resultado, adivina: ¿qué pasa en este programa?

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

¿Por qué no usar `let` en todas partes? Porque `const` le dice al lector "esto nunca cambia". Cuando ves `let`, sabes que debes vigilar un cambio. La palabra es un pequeño dato de información.

> **Cuidado:** Puedes ver `var` en código viejo de internet. Nunca uses `var`. Tiene reglas confusas. Usa `const` o `let`.

## Poner nombres a las variables

Elige un nombre que diga para qué sirve el valor. Un buen nombre te ahorra escribir un comentario.

Reglas:

- Usa palabras en inglés.
- Empieza con una letra minúscula.
- No uses espacios. Escribe la palabra siguiente con mayúscula: `dogName`, `ticketPrice`. Este estilo se llama **camelCase**.
- Los nombres distinguen mayúsculas y minúsculas. `score` y `Score` son dos nombres distintos.

Buenos nombres: `dogAge`, `squareArea`, `playlistLength`.

Malos nombres: `x`, `data`, `thing2`. No te dicen qué hay dentro.

Aquí tienes una prueba para un nombre. Lee esta línea en voz alta a un amigo: `const t = 5 * 7;`. Tu amigo no puede entenderla. Ahora lee `const cookingMinutes = servings * minutesPerServing;`. Tu amigo sí puede.

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

Un círculo necesita el número pi. `Math.PI` es un valor ya hecho para eso. El área de un círculo es pi por el radio por el radio:

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

Dos respuestas para el mismo círculo. Ninguna está "mal". Una usa una versión corta de pi y la otra está muy cerca del valor real.

Ahora prueba esto con dinero. Un amigo suma diez centavos y veinte centavos. ¿Qué esperas?

```ts
console.log(0.1 + 0.2);
```

Imprime:

```text
0.30000000000000004
```

Esto no es un bug de tu programa. Las computadoras guardan los números en una forma que no puede almacenar 0.1 con exactitud. Cuando el número es un precio, un error pequeño es un problema. Un hábito seguro: guarda el dinero en la unidad más pequeña, como los centavos, en números enteros.

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

Cuando escribes `const saved = price;`, la computadora copia el valor en `saved`. Las dos variables no quedan unidas. Es lo mismo que viste en el acertijo.

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

`saved` conservó el valor viejo. Cambiar `price` después no lo cambió. Piensa en dos cajas, no en una caja con dos etiquetas.

### Una idea equivocada común: el nombre y el texto son lo mismo

Los principiantes suelen poner comillas alrededor del nombre de una variable. Compara estas dos líneas.

```ts
console.log("price");
console.log(price);
```

La primera línea imprime la palabra `price`, porque las comillas crean texto. La segunda imprime el valor guardado en la variable, aquí `20`. Sin comillas significa "busca la variable". Con comillas significa "esto es texto".

Pasa el mismo error con los *template literals*. Un texto normal entre comillas no rellena valores. Solo lo hacen las comillas invertidas.

### Cómo aparece en el trabajo real de automatización QA

El código de los tests usa el mismo valor muchas veces: una dirección web, un nombre de usuario, un mensaje de error. Escríbelo una vez, en una `const`, y usa el nombre en todas partes.

```ts
const baseUrl = "https://shop.example.com";
console.log(`${baseUrl}/login`);
console.log(`${baseUrl}/cart`);
```

Esto imprime:

```text
https://shop.example.com/login
https://shop.example.com/cart
```

Si la dirección cambia, editas una línea. No veinte. Esta idea se llama DRY, "Don't Repeat Yourself" (no te repitas). Cada pieza de conocimiento vive en un solo lugar. La estudiarás al final de este módulo.

Un valor escrito directamente en el código, como `"https://shop.example.com"` en medio de una línea, a veces se llama valor mágico. El lector no sabe por qué está ahí. Un buen nombre lo explica.

### Una concesión

No hagas una variable para todo. Un nombre como `const zero = 0;` no aporta nada. Crea una variable cuando el valor se usa más de una vez, o cuando el nombre explica algo que el valor no explica. Esta es la idea de **KISS**: mantenlo simple. Los nombres extra son cosas extra que leer.

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

Escribe un programa que imprima un recibo o una tarjeta de puntaje. Elige tu propio tema: una tienda de mascotas, un pedido de pizza, un partido de fútbol, un festival de música.

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

Imprime `25`. La segunda línea copia el valor 10 en `bonus`. La tercera línea cambia solo `score`, a 15. La última línea suma 10 y 15. Si una variable estuviera unida a la otra, verías 30.

</details>

2. Este código debería imprimir `Hello, Rex`, pero no lo hace. Encuentra el bug.

```ts
const dogName = "Rex";
console.log("Hello, ${dogName}");
```

<details>
<summary>Respuesta</summary>

Imprime `Hello, ${dogName}`. El texto usa comillas normales, así que la computadora trata `${dogName}` como caracteres simples. Un *template literal* necesita comillas invertidas: `` `Hello, ${dogName}` ``. El programa se ejecuta sin error, por eso este bug es fácil de pasar por alto.

</details>

3. Dos maneras de calcular el precio de una camisa con 21 % de impuesto. Las dos funcionan. ¿Cuál es mejor y qué te haría elegir la otra?

```ts
const taxRate = 0.21;
const total = price * (1 + taxRate);
```

```ts
const total = price * 1.21;
```

<details>
<summary>Respuesta</summary>

La primera es mejor cuando la tasa de impuesto aparece en más de un lugar o puede cambiar. El nombre `taxRate` explica el 0.21 y lo cambias en un solo lugar. La segunda es más corta y sirve para una prueba rápida en un archivo que vas a tirar. La mejor opción depende de cuánto vive el código y de cuántos lugares usan el número.

</details>

4. ¿Qué se rompe si escribes `let` en lugar de `const` para todas las variables de un programa?

<details>
<summary>Respuesta</summary>

No se rompe nada al ejecutarlo. El programa da la misma salida. Lo que pierdes es información. Con `const`, el lector sabe que el valor nunca cambia. Con `let` en todas partes, el lector debe revisar cada variable por si cambia. También pierdes una red de seguridad: si cambias un valor por accidente, `const` detiene el programa con un error, y `let` no.

</details>

5. Un programa de una tienda suma `0.1 + 0.2` euros e imprime `0.30000000000000004`. ¿Por qué pasa esto y cómo guardarías los precios para evitarlo?

<details>
<summary>Respuesta</summary>

Las computadoras guardan fracciones decimales como 0.1 en una forma que no es exacta, así que aparece un error pequeño después de algunas cuentas. Los números enteros no tienen este problema. Guarda los precios en centavos, por ejemplo `10` y `20`, súmalos para obtener `30` y divide entre 100 solo cuando muestres el valor. También puedes redondear el valor impreso a dos decimales, pero entonces el valor guardado sigue sin ser exacto.

</details>

6. Explica `count = count + 1` a un compañero en tres oraciones, sin la palabra "igual". El compañero solo conoce las matemáticas de la escuela, donde `x = x + 1` es imposible.

<details>
<summary>Respuesta</summary>

Una buena respuesta: "En código, el signo `=` significa guardar, no comparar. La computadora primero calcula el lado derecho: toma el valor que `count` tiene ahora y le suma 1. Luego pone el resultado de vuelta en `count`, así que la caja guarda el número nuevo". El razonamiento clave es que el lado derecho se calcula primero y el lado izquierdo solo recibe el resultado. Leerlo como "es lo mismo que" es lo que lo hace parecer imposible.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Cuál es la diferencia entre `var`, `let` y `const`, y por qué las guías de estilo dicen que hay que evitar `var`?**
   - Busca: `javascript var let const difference scope`
   - Pruébalo: escribe `if (true) { var a = 1; let b = 2; }`, y luego imprime `a` e imprime `b` después del bloque. Ejecútalo y lee qué pasa con cada una.
   - Una buena respuesta explica: cómo maneja cada una el alcance (*scope*) y la reasignación, y el problema principal de `var`.

2. **¿Qué son camelCase, snake_case, PascalCase y kebab-case, y dónde se usa cada uno?**
   - Busca: `camelCase snake_case PascalCase kebab-case`
   - Pruébalo: escribe `const my-dog = "Rex";` y ejecútalo. Luego reescribe el nombre en cada uno de los cuatro estilos y descubre cuáles acepta el lenguaje.
   - Una buena respuesta explica: cada estilo con un ejemplo, y por qué uno de ellos no puede ser el nombre de una variable.

3. **¿Qué es un número mágico o un string mágico en el código, y por qué hace que el código sea difícil de cambiar?**
   - Busca: `magic number magic string programming`
   - Pruébalo: abre el archivo de tu reto. Encuentra cada número o texto que escribiste más de una vez. Ponle un nombre a cada uno. Cambia un valor y comprueba que la salida cambia en todas partes.
   - Una buena respuesta explica: una definición, un ejemplo, y cómo lo arregla una constante con nombre.

## Siguiente paso

En la siguiente lección aprendes que cada valor tiene un tipo, y cómo TypeScript usa los tipos para encontrar errores.
