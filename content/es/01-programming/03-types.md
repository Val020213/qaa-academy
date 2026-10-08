---
title: Tipos
duration: 50 min
---

## Objetivo

En esta lección aprendes que cada valor tiene un tipo, y a usar el verificador de tipos de TypeScript para encontrar errores antes de ejecutar el código.

- Predecir qué da una operación cuando sus valores tienen tipos distintos.
- Nombrar el tipo de un valor y escribir una anotación de tipo cuando hace falta.
- Usar el verificador de tipos para encontrar un error antes de ejecutar el código.
- Decidir cuándo un valor que falta debe ser `null` y cuándo `undefined`.

## Cada valor tiene un tipo

Un **tipo** es la clase de un valor. Ya conoces tres.

| Tipo      | Ejemplo           | Significado    |
| --------- | ----------------- | -------------- |
| `string`  | `"Rex"`           | texto          |
| `number`  | `404`             | un número      |
| `boolean` | `true`            | sí o no        |

El tipo decide qué puedes hacer con un valor. Puedes multiplicar números. No puedes multiplicar el nombre de un perro de una forma útil.

Puedes preguntar el tipo con `typeof`.

```ts
console.log(typeof "Rex")
console.log(typeof 404)
console.log(typeof true)
```

Esto imprime:

```text
string
number
boolean
```

## Texto que parece un número

`"5"` y `5` se ven iguales, pero no son lo mismo. El primero es un *string*. El segundo es un número.

```ts
console.log("5" + "1")
console.log(5 + 1)
```

Esto imprime:

```text
51
6
```

Con texto, `+` une las partes. Con números, `+` las suma.

Para convertir texto en número, usa `Number()`. Para convertir un número en texto, usa `String()`.

```ts
const ageFromForm = "5"
console.log(Number(ageFromForm) + 1)
console.log(String(404) + " error")
```

Esto imprime:

```text
6
404 error
```

### Mezclar texto y números

Un refugio de mascotas guarda el número de gatos como texto, porque viene de un formulario, y el número de perros como un número de verdad.

```ts
const cats = "3"
const dogs = 4
console.log(cats + dogs)
console.log(cats * dogs)
console.log(cats - dogs)
```

Esto imprime:

```text
34
12
-1
```

El signo `+` tiene dos trabajos. Si un lado es texto, une. Entonces `"3" + 4` se vuelve el texto `"34"`. Los signos `*` y `-` tienen un solo trabajo: las matemáticas. Entonces JavaScript convierte `"3"` en el número 3 sin avisar y calcula `3 * 4` y `3 - 4`.

Este cambio automático se llama **coerción de tipos** (*type coercion*). Es peligrosa porque el programa no se detiene: el mismo texto da resultados de clases distintas en cada línea y ninguna da un error.

El verificador de tipos marca las operaciones con `*` y `-`: `cats` es texto, no un número. Node.js quita las anotaciones de tipo, pero no ejecuta el verificador.

## Anotaciones de tipo

Una **anotación de tipo** le dice a TypeScript el tipo de una variable. Escribes dos puntos y el tipo después del nombre.

```ts
const dogName: string = "Rex"
const dogAge: number = 3
const isHungry: boolean = false
```

Lee la primera línea: `dogName` es un *string*, y su valor es este texto.

## Inferencia de tipos

Muchas veces no necesitas escribir el tipo. TypeScript puede verlo a partir del valor. Esto se llama **inferencia de tipos** (*type inference*).

```ts
const dogName = "Rex"
```

TypeScript infiere el tipo a partir del texto que asignaste a `dogName`.

Una buena regla: deja que TypeScript infiera el tipo en las variables simples, y escríbelo cuando TypeScript no pueda saberlo.

## El verificador de tipos

El **verificador de tipos** (*type checker*) es una parte de TypeScript. Lee tu código y busca errores antes de que lo ejecutes.

Escribe esto en un archivo:

```ts
const dogAge: number = "three"
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

> **Nota:** El comando `node file.ts` no revisa los tipos. Solo los quita y ejecuta el código. `pnpm typecheck` ejecuta el verificador; VS Code muestra sus diagnósticos mientras escribes.

## null y undefined

A veces falta un valor. JavaScript tiene dos valores que usamos para representar que falta un dato.

Usamos `undefined` cuando todavía no se ha dado un valor. Una variable declarada sin valor inicial, como la temperatura de una estación sin mediciones, empieza con `undefined`.

Usamos `null` para indicar explícitamente que no hay valor. Puedes asignarlo al dueño de un perro que nadie ha adoptado.

```ts
let temperature: number | undefined
console.log(temperature)
console.log(typeof temperature)

const owner: string | null = null
console.log(owner)
```

Esto imprime:

```text
undefined
undefined
null
```

El signo `|` significa "o". Entonces `number | undefined` permite un número o `undefined`. Y `string | null` permite un *string* o `null`.

Con la configuración estricta del proyecto, el verificador marca una operación que necesita un valor si todavía podría ser `null` o `undefined`.

## Profundiza

### Los tipos desaparecen cuando el programa se ejecuta

Con `node file.ts`, Node.js quita las anotaciones de tipo y V8 ejecuta el JavaScript resultante. El verificador de tipos se ejecuta por separado. Una anotación no comprueba un valor que llega de fuera al ejecutarse: esa comprobación debe estar en el código.

### Number() siempre da un `number`, pero no siempre un número útil

```ts
console.log(Number("abc"))
console.log(Number(""))
console.log(typeof Number("abc"))
```

Esto imprime:

```text
NaN
0
number
```

`NaN` significa "no es un número" (*not a number*). Es un valor de tipo `number`; aquí aparece porque la conversión de `"abc"` falló. Y un texto vacío se vuelve `0`, sin ninguna advertencia. Por eso revisa el texto antes de confiar en el resultado.

## Práctica

1. Crea el archivo `exercises/01-programming/types.ts`.
2. Imprime el `typeof` de un texto, un número y `true`.
3. Imprime `"2" + "3"` y `2 + 3`. Comprueba que los resultados son distintos.
4. Convierte el texto `"10"` en número con `Number()`. Suma 5 e imprime el resultado.
5. Escribe `const dogAge: number = "three"`. Mira la línea roja en VS Code. Lee el mensaje. Luego ejecuta `pnpm typecheck` en la terminal. Arregla la línea.
6. Abre `exercises/01-programming/03-types.ts` y ejecútalo:

```bash
node exercises/01-programming/03-types.ts
```

Resuelve los ejercicios. Haz que cada comprobación diga `OK`.

## Reto

Una estación meteorológica envía sus lecturas como texto, con la unidad al final: `"21.5°C"`, `"19°C"`, `"23°C"`. Escribe un programa que convierta las lecturas en números e informe el promedio. Puedes cambiar el tema: un sensor de una piscina o los precios de un menú.

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
console.log("3" * "4", "3" + "4", "3" - 1, "3" + 1)
```

<details>
<summary>Respuesta</summary>

Imprime `12 34 2 31`. Los signos `*` y `-` solo pueden hacer matemáticas, así que JavaScript convierte el texto en números: `3 * 4` es 12 y `3 - 1` es 2. El signo `+` une cuando un lado es texto, así que obtienes `"34"` y `"31"`. El verificador de tipos marca con una línea roja las líneas de matemáticas, pero `node` las ejecuta.

</details>

2. Un programa de una piscina debe imprimir el promedio de dos lecturas, 20 y 30. Imprime un número extraño. Encuentra el bug.

```ts
const morning = "20"
const evening = "30"
console.log((morning + evening) / 2)
```

<details>
<summary>Respuesta</summary>

Imprime `1015`. Los dos valores son texto, así que `+` los une en `"2030"`. Luego `/ 2` convierte ese texto en el número 2030 y lo divide. El programa se ejecuta sin error y da una respuesta equivocada. La solución es convertir primero el texto en números: `(Number(morning) + Number(evening)) / 2`, que da 25.

</details>

3. Un formulario envía una edad como texto. Tu código es `Number(ageText) + 1` para hallar el próximo cumpleaños. Una regla nueva dice que el campo de edad puede estar vacío. ¿Qué sale mal?

<details>
<summary>Respuesta</summary>

Un texto vacío se vuelve `0` con `Number("")`, así que la edad siguiente es `1`. El programa no muestra error ni advertencia, y el resultado parece una edad real. Tendrías que revisar si el texto está vacío antes de convertir.

</details>

## Siguiente paso

En la siguiente lección haces que tu programa tome decisiones con comparaciones e `if`.
