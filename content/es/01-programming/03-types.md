---
title: Tipos
summary: Aprende que cada valor tiene un tipo y deja que el verificador de tipos de TypeScript encuentre errores antes de ejecutar el código.
duration: 70 min
---

## Empieza con un acertijo

Un refugio de mascotas guarda el número de gatos como texto, porque viene de un formulario. Guarda el número de perros como un número de verdad.

```ts
const cats = "3";
const dogs = 4;
console.log(cats + dogs);
console.log(cats * dogs);
console.log(cats - dogs);
```

¿Qué imprimen las tres líneas? Puedes pensar que el programa se detiene con un error, porque no se puede mezclar texto y números. O puedes pensar que las tres líneas se comportan igual.

Mira cada signo por separado. Uno de ellos puede tratar `"3"` de forma muy distinta a los otros dos.

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Predecir qué da una operación cuando sus valores tienen tipos distintos.
- Nombrar el tipo de un valor y escribir una anotación de tipo cuando hace falta.
- Usar el verificador de tipos para encontrar un error antes de ejecutar el código.
- Decidir cuándo un valor que falta debe ser `null` y cuándo `undefined`.

## Cada valor tiene un tipo

Un **tipo** es la clase de un valor. Conociste tres clases en la lección anterior.

| Tipo      | Ejemplo           | Significado    |
| --------- | ----------------- | -------------- |
| `string`  | `"Rex"`           | texto          |
| `number`  | `404`             | un número      |
| `boolean` | `true`            | sí o no        |

El tipo decide qué puedes hacer con un valor. Puedes multiplicar números. No puedes multiplicar el nombre de un perro de una forma útil.

Puedes preguntar el tipo con `typeof`.

```ts
console.log(typeof "Rex");
console.log(typeof 404);
console.log(typeof true);
```

Esto imprime:

```text
string
number
boolean
```

## Texto que parece un número

`"5"` y `5` se ven iguales, pero no son lo mismo. El primero es un *string*. El segundo es un número.

Antes de leer el resultado, adivina qué imprime cada línea:

```ts
console.log("5" + "1");
console.log(5 + 1);
```

Esto imprime:

```text
51
6
```

Con texto, `+` une las partes. Con números, `+` las suma.

Para convertir texto en número, usa `Number()`. Para convertir un número en texto, usa `String()`.

```ts
const ageFromForm = "5";
console.log(Number(ageFromForm) + 1);
console.log(String(404) + " error");
```

Esto imprime:

```text
6
404 error
```

### De vuelta al acertijo

El acertijo imprime esto:

```text
34
12
-1
```

El signo `+` tiene dos trabajos. Si un lado es texto, une. Entonces `"3" + 4` se vuelve el texto `"34"`. Los signos `*` y `-` tienen un solo trabajo: las matemáticas. Entonces JavaScript convierte `"3"` en el número 3 sin avisar y calcula `3 * 4` y `3 - 4`.

JavaScript hace este cambio sin decírtelo. Se llama **coerción de tipos** (*type coercion*). A veces es amable y muchas veces es peligrosa, porque el mismo texto da resultados de clases distintas en cada línea.

TypeScript ve el problema. En VS Code, las líneas con `*` y `-` muestran una línea roja: el lado izquierdo de la operación debe ser un número. El comando `node` ignora los tipos y ejecuta el archivo de todos modos. Así que el programa funciona y el verificador igual te avisa.

## Anotaciones de tipo

Una **anotación de tipo** le dice a TypeScript el tipo de una variable. Escribes dos puntos y el tipo después del nombre.

```ts
const dogName: string = "Rex";
const dogAge: number = 3;
const isHungry: boolean = false;
```

Lee la primera línea: `dogName` es un *string*, y su valor es este texto.

## Inferencia de tipos

Muchas veces no necesitas escribir el tipo. TypeScript puede verlo a partir del valor. Esto se llama **inferencia de tipos** (*type inference*).

```ts
const dogName = "Rex";
```

TypeScript sabe que `dogName` es un *string*, porque el valor es texto.

Una buena regla: deja que TypeScript infiera el tipo en las variables simples. Escribe el tipo cuando TypeScript no pueda saberlo. Lo harás con las funciones en la lección 05.

## El verificador de tipos

El **verificador de tipos** (*type checker*) es una parte de TypeScript. Lee tu código y busca errores, antes de que lo ejecutes. Piénsalo como un revisor que lee cada línea.

Escribe esto en un archivo:

```ts
const dogAge: number = "three";
```

El verificador de tipos reporta un error:

```text
error TS2322: Type 'string' is not assignable to type 'number'.
```

Dice: prometiste un número, pero diste texto.

Ves el problema en dos lugares:

- En VS Code aparece una línea roja ondulada bajo el código. Pasa el mouse encima para leer el mensaje.
- En la terminal puedes ejecutar el verificador de tipos para todo el proyecto:

```bash
pnpm typecheck
```

Arregla el problema antes de ejecutar el programa. Es más rápido que encontrarlo después.

> **Nota:** El comando `node file.ts` no revisa los tipos. Solo los quita y ejecuta el código. El verificador es `pnpm typecheck` y las líneas rojas de VS Code.

## null y undefined

A veces falta un valor. TypeScript tiene dos valores especiales para esto.

`undefined` significa: todavía no se ha dado nada. Una estación meteorológica que no ha hecho su primera medición tiene una temperatura `undefined`.

`null` significa: no hay valor, y es a propósito. Un perro del refugio que nadie ha adoptado no tiene dueño. Eso lo decides tú.

```ts
let temperature: number | undefined;
console.log(temperature);
console.log(typeof temperature);

const owner: string | null = null;
console.log(owner);
```

Esto imprime:

```text
undefined
undefined
null
```

El signo `|` significa "o". Entonces `number | undefined` significa: un número, o todavía nada. Y `string | null` significa: un *string*, o ningún valor a propósito.

El verificador de tipos usa esto para protegerte. Si un valor puede faltar, te obliga a pensar en ese caso.

## Profundiza

### Por qué los tipos desaparecen cuando el programa se ejecuta

TypeScript revisa tus tipos y luego los quita. Lo que Node.js ejecuta es JavaScript simple. Por eso `node file.ts` no reporta un error de tipos.

También significa que TypeScript solo sabe lo que tú le dices. Si un valor viene de fuera, como un texto de una página web, TypeScript no puede mirar dentro. Al ejecutarse, el valor tiene el tipo que realmente tiene.

### Una idea equivocada común: "Number() siempre da un número en el que puedo confiar"

`Number()` siempre devuelve un valor de tipo `number`. Pero el valor puede ser inútil.

```ts
console.log(Number("abc"));
console.log(Number(""));
console.log(typeof Number("abc"));
```

Esto imprime:

```text
NaN
0
number
```

`NaN` significa "no es un número" (*not a number*). Es un valor numérico que marca una conversión fallida. Su tipo sigue siendo `number`. Y un texto vacío se vuelve `0`, sin ninguna advertencia. Por eso revisa el texto antes de confiar en el resultado.

### Cómo aparece en el trabajo real de automatización QA

Una página muestra un precio como texto, por ejemplo `$5.00`. Quieres sumarle 1.

```ts
console.log(Number("$5.00"));
console.log(Number("$5.00".replace("$", "")) + 1);
console.log("5" + 1);
```

Esto imprime:

```text
NaN
6
51
```

El signo `$` hace que la conversión falle. `replace` es una función ya hecha del texto. Aquí cambia `$` por nada. La última línea muestra el otro peligro: `+` con un *string* y un número los une como texto y da `"51"`.

Muchos resultados incorrectos en los tests vienen de esto. El valor en la página parecía un número, pero el código lo trató como texto.

### Una concesión: los tipos ayudan, pero no son tests

El verificador de tipos encuentra una clase de valor equivocada. No puede decirte si un precio es correcto. Solo un test con una comprobación puede hacerlo. Los tipos y los tests detectan problemas distintos, así que necesitas ambos.

## Práctica

1. Crea el archivo `exercises/01-programming/types.ts`.
2. Imprime el `typeof` de un texto, un número y `true`.
3. Imprime `"2" + "3"` y `2 + 3`. Comprueba que los resultados son distintos.
4. Convierte el texto `"10"` en número con `Number()`. Suma 5 e imprime el resultado.
5. Escribe `const dogAge: number = "three";`. Mira la línea roja en VS Code. Lee el mensaje. Luego ejecuta `pnpm typecheck` en la terminal. Arregla la línea.
6. Abre `exercises/01-programming/03-types.ts` y ejecútalo:

```bash
node exercises/01-programming/03-types.ts
```

Resuelve los ejercicios. Haz que todas las líneas digan `OK`.

## Reto

Una estación meteorológica envía sus lecturas como texto, con la unidad al final: `"21.5°C"`, `"19°C"`, `"23°C"`. Escribe un programa que convierta las lecturas en números e informe el promedio. Puedes cambiar el tema: un sensor de una piscina, las alturas de los jugadores de un equipo de baloncesto, los precios de un menú.

Crea el archivo `exercises/challenges/types.ts`.

Está terminado cuando:

- Las lecturas están guardadas como texto en tres variables `const`. También se guarda una cuarta lectura, `"n/a"`.
- Ejecutas `node exercises/challenges/types.ts` y imprime el promedio de las tres primeras lecturas como `Average: 21.2°C`.
- El programa también imprime el `typeof` del promedio antes de darle formato, y dice `number`.
- El programa imprime `false` para la pregunta "¿la cuarta lectura es un número válido?" y `true` para la primera.

Vas a necesitar algo que esta lección no enseñó: una forma de leer el número al inicio de un texto como `"21.5°C"`, y una forma confiable de preguntar "¿este valor es `NaN`?". Busca: `javascript parseFloat`, `javascript Number.isNaN`. Para un decimal, busca `javascript toFixed`.

## Piénsalo bien

1. ¿Qué imprime esta línea y por qué?

```ts
console.log("3" * "4", "3" + "4", "3" - 1, "3" + 1);
```

<details>
<summary>Respuesta</summary>

Imprime `12 34 2 31`. Los signos `*` y `-` solo pueden hacer matemáticas, así que JavaScript convierte el texto en números: `3 * 4` es 12 y `3 - 1` es 2. El signo `+` une cuando un lado es texto, así que obtienes `"34"` y `"31"`. El verificador de tipos marca con una línea roja las líneas de matemáticas, pero `node` las ejecuta.

</details>

2. Un programa de una piscina debe imprimir el promedio de dos lecturas, 20 y 30. Imprime un número extraño. Encuentra el bug.

```ts
const morning = "20";
const evening = "30";
console.log((morning + evening) / 2);
```

<details>
<summary>Respuesta</summary>

Imprime `1015`. Los dos valores son texto, así que `+` los une en `"2030"`. Luego `/ 2` convierte ese texto en el número 2030 y lo divide. El programa se ejecuta sin error y da una respuesta equivocada. La solución es convertir primero el texto en números: `(Number(morning) + Number(evening)) / 2`, que da 25.

</details>

3. Dos versiones que funcionan. ¿Cuál es mejor y qué te haría elegir la otra?

```ts
const dogAge: number = 3;
```

```ts
const dogAge = 3;
```

<details>
<summary>Respuesta</summary>

La segunda es mejor para un valor simple. TypeScript ya sabe que es un número, así que la anotación repite información y añade ruido. Elegirías la primera cuando el valor no se da en ese momento, por ejemplo `let dogAge: number;`, o cuando quieres que el verificador detenga un valor incorrecto que viene de una función. La regla: escribe un tipo donde TypeScript no pueda saberlo por sí solo.

</details>

4. Un formulario envía una edad como texto. Tu código es `Number(ageText) + 1` para hallar el próximo cumpleaños. Una regla nueva dice que el campo de edad puede estar vacío. ¿Qué sale mal?

<details>
<summary>Respuesta</summary>

Un texto vacío se vuelve `0` con `Number("")`, así que la edad siguiente es `1`. El programa no muestra error ni advertencia, y el resultado parece una edad real. El valor que falta se esconde dentro de un número válido. Tendrías que revisar si el texto está vacío antes de convertir, y decidir qué debe decir el programa cuando no hay edad.

</details>

5. Un refugio guarda el dueño de cada perro como `string`. Llega un perro sin dueño. ¿Qué problema encuentras y cómo ayudaría el tipo `string | null`?

<details>
<summary>Respuesta</summary>

Con solo `string`, debes inventar un valor falso como `""` o `"none"`. Ese valor parece un dueño real, y nada te avisa cuando lo usas por error. Con `string | null`, el dueño que falta es un caso real y separado. Entonces el verificador de tipos te obliga a manejar `null` antes de usar el texto. El costo es un poco más de código en cada lugar donde lees el dueño.

</details>

6. ¿Un programa debe guardar un precio como el número `5` o como el texto `"$5.00"`? No hay una única respuesta correcta. Explica qué te da cada opción y de qué depende.

<details>
<summary>Respuesta</summary>

Un número te permite sumar, comparar y multiplicar sin conversión, y el verificador puede protegerte. El texto es lo que lee una persona, así que sirve para mostrar, y conserva el símbolo y el formato. Una solución común es guardar el número dentro del programa y crear el texto solo en el último momento, cuando lo muestras. La elección depende de lo que hace el valor: los cálculos necesitan un número, mientras que mostrarlo y compararlo con una página necesita el texto.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Por qué `typeof null` da `"object"` en JavaScript?**
   - Busca: `typeof null object javascript why`
   - Pruébalo: imprime `typeof null`, `typeof undefined`, `typeof NaN` y `typeof []` en un solo `console.log`. Compara cada respuesta con lo que esperabas.
   - Una buena respuesta explica: la historia detrás de esto, y que es un error conocido del lenguaje.

2. **¿Qué es `NaN` y por qué `NaN === NaN` es falso? ¿Cómo se comprueba?**
   - Busca: `javascript NaN not equal itself Number.isNaN`
   - Pruébalo: imprime `NaN === NaN`, `Number.isNaN(NaN)`, `Number.isNaN("abc")` y `isNaN("abc")`. Dos de las tres últimas dan respuestas distintas. Descubre por qué.
   - Una buena respuesta explica: qué significa NaN, la comparación sorprendente, y por qué `Number.isNaN` e `isNaN` no son lo mismo.

3. **¿Cuál es la diferencia entre un verificador de tipos y un test, y qué problemas puede detectar cada uno?**
   - Busca: `static typing vs testing bugs`
   - Pruébalo: escribe `const squareArea: number = 4 + 4;` para un cuadrado de lado 4. Comprueba que el verificador de tipos queda conforme. Luego explica qué clase de comprobación encontraría el error.
   - Una buena respuesta explica: un problema que solo detectan los tipos, uno que solo detectan los tests, y por qué los equipos usan ambos.

## Siguiente paso

En la siguiente lección haces que tu programa tome decisiones con comparaciones e `if`.
