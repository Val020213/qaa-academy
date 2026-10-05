---
title: Valores y variables
summary: Guarda texto, números y valores verdadero/falso en variables, y combínalos con matemáticas y template literals.
duration: 45 min
---

## Objetivo

- Nombrar los tres tipos básicos de valor: texto, número y verdadero/falso.
- Guardar un valor en una variable con `const` o `let`.
- Elegir nombres claros para las variables.
- Construir un mensaje con varios valores usando un *template literal* (plantilla de texto).

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

El primero es **texto**. El texto va entre comillas. Los programadores llaman al texto *string* (cadena de texto).

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

La segunda línea es un error. No puedes darle un valor nuevo a una `const`. El programa se detiene con un error que dice `Assignment to constant variable`.

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

## Nombrar variables

Elige un nombre que diga qué es el valor. Un buen nombre te ahorra escribir un comentario.

Reglas:

- Usa palabras en inglés.
- Empieza con una letra minúscula.
- No uses espacios. Escribe la palabra siguiente con mayúscula inicial: `testName`, `openBugs`. Este estilo se llama **camelCase**.
- Los nombres distinguen mayúsculas y minúsculas. `status` y `Status` son dos nombres distintos.

Buenos nombres: `userName`, `failedTests`, `orderTotal`.

Malos nombres: `x`, `data`, `thing2`. No te dicen qué contienen.

## Matemáticas básicas

Puedes hacer operaciones con números. Los signos son `+`, `-`, `*` (por) y `/` (entre).

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

Un **template literal** es texto entre comillas invertidas (backticks). La comilla invertida es la tecla `` ` ``. En muchos teclados con Windows la pulsas y luego pulsas la barra espaciadora.

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

> **Consejo:** Usa un template literal siempre que construyas un mensaje con valores. Lo harás a menudo en los tests.

## Profundiza

### Una variable guarda su propia copia de un valor

Cuando escribes `const saved = price;`, la computadora copia el valor en `saved`. Las dos variables no quedan enlazadas.

```ts
let price = 10;
const saved = price;
price = 20;
console.log(saved, price);
```

Esto muestra:

```text
10 20
```

`saved` conservó el valor antiguo. Cambiar `price` después no lo modificó. Piensa en dos cajas, no en una caja con dos etiquetas.

### Una idea equivocada común: el nombre y el texto son lo mismo

Los principiantes a menudo ponen comillas alrededor del nombre de una variable. Compara estas dos líneas.

```ts
console.log("price");
console.log(price);
```

La primera línea muestra la palabra `price`, porque las comillas crean texto. La segunda muestra el valor guardado en la variable, aquí `20`. Sin comillas significa "busca la variable". Con comillas significa "esto es texto".

El mismo error ocurre con los template literals. Un string normal entre comillas no rellena valores. Solo lo hacen las comillas invertidas.

### Cómo aparece en el trabajo real de automatización QA

El código de los tests usa el mismo valor muchas veces: una dirección web, un nombre de usuario, un mensaje de error. Escríbelo una vez, en una `const`, y usa el nombre en todas partes.

```ts
const baseUrl = "https://shop.example.com";
console.log(`${baseUrl}/login`);
console.log(`${baseUrl}/cart`);
```

Esto muestra:

```text
https://shop.example.com/login
https://shop.example.com/cart
```

Si la dirección cambia, editas una línea. No veinte. Esta idea se llama DRY (*Don't Repeat Yourself*, no te repitas). Cada pieza de conocimiento vive en un solo lugar. La estudiarás al final de este módulo.

Un valor escrito directamente en el código, como `"https://shop.example.com"` en medio de una línea, a veces se llama valor mágico. El lector no sabe por qué está ahí. Un buen nombre lo explica.

### Una contrapartida

No crees una variable para todo. Un nombre como `const zero = 0;` no aporta nada. Crea una variable cuando el valor se usa más de una vez, o cuando el nombre explica algo que el valor no explica.

## Práctica

1. Crea el archivo `exercises/01-programming/variables.ts`.
2. Crea una `const` llamada `testName` con el nombre de un test. Muéstrala.
3. Crea una `let` llamada `status` con el texto `"open"`. Muéstrala. Cámbiala a `"fixed"`. Muéstrala otra vez.
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

Solo cuando el valor debe cambiar más adelante. En los demás casos usa `const`.

</details>

3. ¿Qué muestra esto? `const a = 2; console.log(a * 5 + 1);`

<details>
<summary>Respuesta</summary>

Muestra 11.

</details>

4. ¿Qué signo usas alrededor de un template literal?

<details>
<summary>Respuesta</summary>

Comillas invertidas (backticks). Los valores van dentro de `${...}`.

</details>

5. ¿Qué muestra este código y por qué?

```ts
let count = 1;
count = count + 1;
count = count * 5;
console.log(count);
```

<details>
<summary>Respuesta</summary>

Muestra 10. La primera línea guarda 1. La segunda línea lee el valor actual, suma 1 y guarda 2. La tercera línea lee 2, multiplica por 5 y guarda 10. Cada línea usa el valor que dejó la anterior.

</details>

6. Este código debería mostrar `Hello, Ana`, pero no lo hace. Encuentra el *bug* (error).

```ts
const userName = "Ana";
console.log("Hello, ${userName}");
```

<details>
<summary>Respuesta</summary>

Muestra `Hello, ${userName}`. El texto usa comillas normales, así que la computadora trata `${userName}` como caracteres simples. Un template literal necesita comillas invertidas: `` `Hello, ${userName}` ``.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Cuál es la diferencia entre `var`, `let` y `const`, y por qué las guías de estilo dicen que evites `var`?**
   - Busca: `javascript var let const difference scope`
   - Una buena respuesta explica: cómo maneja cada una el alcance (*scope*) y la reasignación, y el problema principal de `var`.

2. **¿Qué son camelCase, snake_case, PascalCase y kebab-case, y dónde se usa cada uno?**
   - Busca: `camelCase snake_case PascalCase kebab-case`
   - Una buena respuesta explica: cada estilo con un ejemplo, y cuál usan normalmente las variables de JavaScript.

3. **¿Qué es un número mágico o string mágico en el código y por qué es un problema en el código de tests?**
   - Busca: `magic number magic string programming`
   - Una buena respuesta explica: una definición, un ejemplo y cómo lo resuelve una constante con nombre.

## Siguiente paso

En la próxima lección aprenderás que cada valor tiene un tipo, y cómo TypeScript usa los tipos para encontrar errores.
