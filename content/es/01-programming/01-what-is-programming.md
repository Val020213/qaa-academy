---
title: ¿Qué es programar?
duration: 45 min
---

## Objetivo

En esta lección escribes y ejecutas tu primer programa en TypeScript, y aprendes a leer lo que imprime y lo que dice cuando falla.

- Describir las fases por las que pasa tu código, desde el texto hasta la ejecución.
- Escribir y ejecutar un programa con `node`.
- Predecir qué imprime un programa, línea por línea.
- Dejar notas en el código con comentarios.
- Distinguir un error que se detecta antes de ejecutar de uno que ocurre mientras se ejecuta, y leer el mensaje de cada uno.

## Del texto a la ejecución

El procesador de tu computadora solo entiende código máquina: números que representan operaciones muy pequeñas, como sumar dos valores o copiar un dato. Normalmente escribes texto en un lenguaje de programación, y otro programa lleva ese texto hasta el procesador.

Un **compilador** traduce código a otra forma antes de que esa parte se ejecute: puede ser código máquina, bytecode u otro lenguaje. Un **intérprete** ejecuta instrucciones sin crear antes un ejecutable completo. Algunas herramientas combinan las dos ideas.

Estas son las fases que encontrarás en las herramientas de este curso:

1. **Análisis** (*parsing*). Se lee el texto y se comprueba que cumple la gramática del lenguaje: paréntesis que cierran, comillas completas. El resultado es un árbol que representa la estructura del código, el árbol de sintaxis (*AST*).
2. **Verificación.** Algunos lenguajes revisan después que las piezas encajen, por ejemplo que no multipliques un texto por un número. En TypeScript esta fase es la verificación de tipos.
3. **Ejecución.** El árbol se convierte en instrucciones que la máquina puede ejecutar, y se ejecutan.

### Qué hace Node.js con tu archivo

En este curso escribes en **TypeScript**, que es JavaScript con anotaciones de tipos; sus archivos terminan en `.ts`. Los ejecuta **Node.js**, que instalaste en el módulo 0. Con los archivos `.ts` de este curso, pasa esto:

1. Node.js analiza el archivo y le quita las anotaciones de tipos. Lo que queda es JavaScript. Node.js no verifica los tipos, solo los borra.
2. V8, el motor de JavaScript que Node.js lleva dentro y que también usa Chrome, analiza ese JavaScript, construye el árbol y lo convierte en *bytecode*: instrucciones intermedias, más simples que tu código y más generales que el código máquina.
3. V8 empieza ejecutando el bytecode. También puede compilar partes usadas con frecuencia a código máquina mientras el programa corre, para ejecutarlas más rápido. Esto se llama compilación *just-in-time* (JIT).

![Lo que hace Node.js con un archivo .ts. El verificador de tipos es una herramienta aparte.](/images/code-to-execution.es.svg)

La verificación de tipos la hace otra herramienta, el verificador de TypeScript. VS Code lo usa mientras escribes, y por eso subraya errores antes de que ejecutes nada. La lección «Tipos» lo usa a fondo.

Estas fases explican lo que verás al final de la lección: un error de gramática aparece en el análisis, antes de que se ejecute una sola línea, y otros errores solo aparecen cuando la ejecución llega a ellos.

## Tu primer programa

Abre la carpeta del proyecto en VS Code. Crea un archivo nuevo en `exercises/01-programming/hello.ts`.

Escribe esta única línea:

```ts
console.log("Hello, world!")
```

`console.log` imprime el valor y añade un salto de línea. En este curso escribimos cada instrucción en su propia línea. TypeScript también acepta un `;` al final de una instrucción, así que lo verás en el código de otras personas, pero este curso no lo escribe.

Ahora abre la terminal de VS Code (Terminal > New Terminal). Ejecuta el archivo:

```bash
node exercises/01-programming/hello.ts
```

La terminal imprime:

```text
Hello, world!
```

## Las instrucciones se ejecutan en orden

Este archivo es una lista de reproducción:

```ts
console.log("Now playing: Blue Monday")
console.log("Now playing: Yesterday")
console.log("Now playing: Hey Jude")
```

Las canciones salen en el mismo orden que las líneas:

```text
Now playing: Blue Monday
Now playing: Yesterday
Now playing: Hey Jude
```

Si cambias de lugar dos líneas en el archivo, la salida también cambia. El orden de las líneas es parte del programa.

Un programa también puede ejecutarse sin ningún error y aun así estar mal. Si escribes "meter el pastel al horno" antes de "calentar el horno a 180 grados", Node.js no se queja: el analizador comprueba la gramática del archivo, no que el orden de los pasos tenga sentido.

## Comentarios

Un **comentario** es una nota para las personas. El analizador no lo trata como una instrucción, así que no se ejecuta. Un comentario de línea empieza con `//` y llega hasta el final de la línea.

```ts
// A short routine for a pet shelter
console.log("Fill the water bowls")
console.log("Feed the cats") // the dogs eat later
```

La terminal imprime solo esto:

```text
Fill the water bowls
Feed the cats
```

Usa los comentarios para explicar por qué hiciste algo. No los uses para repetir lo que la línea ya dice.

También puedes poner `//` delante de una línea de código para apagarla por un rato. Los programadores le llaman **comentar** la línea.

## Dos tipos de error

Cuando el código tiene un error, lo que ves en la terminal cambia según Node.js lo detecte al analizar el archivo o al ejecutarlo.

### Antes de ejecutar: no se imprime la salida del programa

Node.js lee el archivo completo antes de ejecutar una sola línea. Si el archivo rompe las reglas del lenguaje, Node.js muestra el error y no ejecuta ninguna de sus instrucciones, ni siquiera las correctas que van antes. A esto se le llama **error de sintaxis**.

Cambia la línea 1 de `hello.ts` para que olvide la comilla de cierre:

```ts
console.log("Hello, world!)
```

Guarda el archivo y ejecútalo. Las primeras líneas del error se ven así:

```text
C:/Users/you/project/exercises/01-programming/hello.ts:1
console.log("Hello, world!)

SyntaxError [ERR_INVALID_TYPESCRIPT_SYNTAX]: Expected ',', got '<eof>'
```

Siguen más líneas. Por ahora puedes ignorarlas. Lee las primeras:

- La primera línea te dice el archivo y el número de línea. Aquí es la línea 1.
- La segunda línea muestra el código que tiene el problema.
- La línea con `SyntaxError` nombra el tipo de error.

El mensaje no siempre es fácil de entender. Aquí dice que el archivo terminó mientras el analizador esperaba más código, y la razón real es la comilla que falta. Agrega la comilla y ejecuta de nuevo: el mensaje desaparece.

### Durante la ejecución: las líneas anteriores ya se imprimieron

Otros errores solo aparecen cuando Node.js llega a la línea que los causa. Aquí tienes una receta, un paso por línea:

```ts
console.log("1. Boil the water")
console.log("2. Add the pasta")
console.log("3. Drain the water")
console.log("4. Add the sauce")
console.log("5. Serve")
```

Si en la línea 4 escribes `console.Log` con L mayúscula, el archivo cumple las reglas de sintaxis y empieza a ejecutarse. Imprime los pasos 1, 2 y 3, y luego se detiene con `TypeError: console.Log is not a function`. Los pasos 4 y 5 nunca se imprimen.

Cuando un programa falla a mitad de camino, las líneas anteriores sí se ejecutaron y las siguientes no. Busca la última línea que funcionó y mira la que sigue.

## Práctica

1. En `exercises/01-programming/hello.ts`, escribe tres líneas `console.log` con los pasos de una rutina que conozcas bien (hacer té, una mañana en la escuela, un calentamiento de fútbol). Ejecuta el archivo con `node exercises/01-programming/hello.ts`.
2. Pon un comentario encima de la primera línea. Escribe para qué sirve la rutina.
3. Cambia el orden de dos líneas y ejecuta el archivo. Decide si el nuevo orden todavía tiene sentido.
4. Borra una comilla de cierre a propósito y ejecuta el archivo. Encuentra el número de línea en el mensaje de error.
5. Arregla la comilla. Luego cambia `console.log` por `console.Log` en una línea y ejecuta otra vez. Compara los dos mensajes de error. ¿Cuál imprimió algunas líneas antes de fallar?

## Reto

Escribe un programa que imprima una "tarjeta de instrucciones" corta de algo que sepas hacer. Elige tu propio tema, por ejemplo dar de comer a una mascota o una receta.

Crea el archivo `exercises/challenges/what-is-programming.ts`. Crea la carpeta `challenges` si no existe.

Está terminado cuando:

- Ejecutas `node exercises/challenges/what-is-programming.ts` y imprime al menos 8 líneas sin error.
- La primera línea es un título y la segunda es una línea de 30 guiones. No escribiste los 30 guiones uno por uno.
- Hay una línea vacía en la salida que separa dos partes de la tarjeta.
- Un comentario al inicio nombra dos líneas que puedes cambiar de lugar sin cambiar el significado, y dos líneas que no puedes cambiar.

Vas a necesitar algo que esta lección no enseñó: cómo imprimir una línea en blanco y cómo repetir un texto muchas veces sin escribirlo. Busca: `console.log empty line`, `javascript string repeat`.

## Piénsalo bien

1. ¿Qué imprime este archivo?

```ts
console.log("Rinse the rice") // console.log("Add salt")
// console.log("Boil the rice")
console.log("Serve")
```

<details>
<summary>Respuesta</summary>

Imprime `Rinse the rice` y luego `Serve`. En la línea 1, el segundo `console.log` está dentro del comentario, así que nunca se ejecuta. La línea 2 es un comentario desde su primer carácter.

</details>

2. Un amigo escribe un programa de panadería. Se ejecuta sin error, pero el pastel es un desastre. Encuentra el bug.

```ts
console.log("Put the cake in the oven")
console.log("Heat the oven to 180 degrees")
console.log("Wait 30 minutes")
```

<details>
<summary>Respuesta</summary>

Los pasos están en el orden equivocado. Node.js ejecuta las líneas en el orden en que están escritas y no sabe que un horno debe estar caliente antes de meter el pastel. Cambia de lugar las líneas 1 y 2.

</details>

3. ¿Qué pasa si ejecutas un archivo vacío? ¿Y si el archivo tiene solo comentarios?

<details>
<summary>Respuesta</summary>

No se imprime nada y no hay error. Un archivo vacío es un programa válido con cero instrucciones, y uno con solo comentarios tampoco tiene instrucciones que ejecutar.

</details>

## Siguiente paso

En la siguiente lección aprendes a guardar valores, como nombres y números, en variables.
