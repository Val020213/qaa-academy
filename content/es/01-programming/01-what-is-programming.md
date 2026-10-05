---
title: ¿Qué es programar?
summary: Aprende qué es un programa, escribe el primero con console.log y lee tu primer mensaje de error.
duration: 40 min
---

## Objetivo

- Explicar qué son un programa, el código y un archivo.
- Escribir y ejecutar un programa pequeño en VS Code.
- Usar comentarios para añadir notas a tu código.
- Leer un mensaje de error sencillo y corregirlo.

## ¿Qué es un programa?

Un programa es una lista de instrucciones. Una computadora sigue las instrucciones una por una.

La computadora hace exactamente lo que le dices. No adivina. No entiende lo que quisiste decir.

Lee las instrucciones en orden, desde la primera línea hasta la última.

Ya escribes instrucciones. Un caso de prueba manual es una lista de pasos: abrir la página, escribir un nombre de usuario, hacer clic en Login. Un programa es parecido. La diferencia es que los pasos los sigue una computadora, no una persona.

## Código, archivos y ejecutar

El **código** es el texto que escribes para la computadora. Cada instrucción es una línea de código.

Guardas el código en un **archivo**. Un archivo es un documento con un nombre, como `hello.ts`. Las letras después del punto son la **extensión**. La extensión indica el tipo de archivo.

**Ejecutar** un programa significa pedirle a la computadora que siga las instrucciones del archivo.

## JavaScript y TypeScript

**JavaScript** es un lenguaje de programación. Un lenguaje de programación es un conjunto de reglas para escribir instrucciones. JavaScript se creó para las páginas web, y también funciona fuera del navegador.

**TypeScript** es JavaScript con comprobaciones extra. Puede encontrar algunos errores antes de que el programa se ejecute. Los archivos que lo usan terminan en `.ts`.

En este curso escribes TypeScript. Playwright, la herramienta que usarás para los *tests* (pruebas automáticas), funciona bien con él.

**Node.js** es el programa que ejecuta tu código en tu computadora. Lo instalaste en el Módulo 0.

## Tu primer programa

Abre la carpeta del proyecto en VS Code. Crea un archivo nuevo en `exercises/01-programming/hello.ts`.

Escribe esta única línea:

```ts
console.log("Hello, QA!");
```

`console.log` es una instrucción. Significa: muestra esto en la terminal. El texto entre comillas es lo que se muestra. El `;` al final cierra la línea.

Ahora abre la terminal en VS Code (Terminal > New Terminal). Ejecuta el archivo:

```bash
node exercises/01-programming/hello.ts
```

La terminal muestra:

```text
Hello, QA!
```

Escribiste un programa y lo ejecutaste.

## Las instrucciones se ejecutan en orden

Añade más líneas al archivo:

```ts
console.log("Step 1: open the login page");
console.log("Step 2: type the user name");
console.log("Step 3: click Login");
```

La terminal muestra las líneas en el mismo orden:

```text
Step 1: open the login page
Step 2: type the user name
Step 3: click Login
```

Si cambias de lugar dos líneas del archivo, la salida también cambia. El orden de las líneas importa.

## Comentarios

Un **comentario** es una nota para las personas. La computadora lo ignora. Un comentario empieza con `//`.

```ts
// This test checks the login page
console.log("Open the login page");
```

La terminal muestra solo esto:

```text
Open the login page
```

Usa comentarios para explicar por qué escribiste algo. No los uses para repetir lo que la línea ya dice.

## Comete un error a propósito

Los errores son normales. Los programadores se equivocan todo el día. La habilidad está en leer el mensaje y resolver el problema.

Cambia la primera línea para que olvide la comilla de cierre:

```ts
console.log("Hello, QA!);
```

Guarda el archivo y ejecútalo otra vez. La terminal muestra un error. Las primeras líneas se ven así:

```text
C:/Users/you/project/exercises/01-programming/hello.ts:1
console.log("Hello, QA!);

SyntaxError [ERR_INVALID_TYPESCRIPT_SYNTAX]: Expected ',', got '<eof>'
```

Siguen más líneas. Por ahora puedes ignorarlas. Lee las primeras:

- La primera línea te dice el archivo y el número de línea. Aquí es la línea 1.
- La segunda línea muestra el código que tiene el problema.
- La línea con `SyntaxError` nombra el tipo de error. Un **error de sintaxis** significa que el código rompe las reglas del lenguaje.

El mensaje no siempre es fácil de entender. Aquí dice que la línea terminó demasiado pronto. La razón es la comilla que falta.

Añade la comilla que falta y ejecuta de nuevo. El mensaje desaparece.

> **Consejo:** No le tengas miedo al texto rojo. Te dice dónde mirar. Lee primero el número de línea.

## Profundiza

### Por qué la computadora no adivina

Un chip de computadora entiende solo instrucciones muy pequeñas, como "suma estos dos números". No puede leer tu TypeScript directamente. Node.js contiene un motor que convierte tu código en esas instrucciones pequeñas. El motor trabaja de forma estricta. Sigue tu texto exactamente y no puede preguntarte qué quisiste decir.

Por eso una letra equivocada rompe un programa. Una persona que lee un caso de prueba puede adivinar que "Logn" significa "Login". Una computadora no.

### Una idea equivocada común: "un error significa que nada se ejecutó"

Muchos principiantes piensan que un programa que falla no hace nada. Mira este archivo. La segunda línea tiene un error de escritura: `Log` lleva L mayúscula.

```ts
console.log("Step 1: open the login page");
console.Log("Step 2: type the user name");
console.log("Step 3: click Login");
```

Cuando lo ejecutas, la terminal muestra esto:

```text
Step 1: open the login page
```

Después de esa línea ves el error `TypeError: console.Log is not a function`. El paso 1 se ejecutó. El paso 2 falló. El paso 3 nunca se ejecutó.

La computadora ejecuta las líneas en orden y se detiene en el primer problema. Las líneas anteriores al problema ya hicieron su trabajo. Recuérdalo cuando *depures* (busques errores): encuentra la última línea que funcionó y mira la siguiente.

> **Nota:** Un error de sintaxis, como la comilla que falta en esta lección, es distinto. La computadora lee todo el archivo antes de ejecutar nada. Por eso, con un error de sintaxis, no se ejecuta ninguna línea.

### Cómo aparece en el trabajo real de automatización QA

Un test automatizado es un programa. Tiene pasos, en orden, como un caso de prueba manual. Cuando un paso falla, el test se detiene ahí. Los pasos siguientes no se ejecutan. El reporte te dice qué paso falló.

Por eso el orden de los pasos es parte del test. Si cambias de lugar "escribir la contraseña" y "hacer clic en Login", haces un test distinto.

También puedes notar que las tres líneas `console.log` se parecen. Repetir la misma idea muchas veces es una señal. Estudiarás esta idea, llamada DRY (no te repitas), al final de este módulo.

## Práctica

1. Crea el archivo `exercises/01-programming/hello.ts` si aún no lo has hecho.
2. Escribe tres líneas `console.log` que muestren los pasos de un test de *login* (inicio de sesión). Ejecuta el archivo con `node exercises/01-programming/hello.ts`.
3. Pon un comentario encima de la primera línea. Escribe qué comprueba el test.
4. Cambia el orden de dos líneas. Ejecuta el archivo. Comprueba que la salida cambió.
5. Borra una comilla de cierre a propósito. Ejecuta el archivo. Busca el número de línea en el mensaje de error.
6. Corrige la comilla y ejecuta el archivo otra vez.

## Comprueba lo que sabes

1. ¿Qué es un programa?

<details>
<summary>Respuesta</summary>

Una lista de instrucciones que una computadora sigue en orden, de arriba abajo.

</details>

2. ¿Qué hace `console.log("Hi");`?

<details>
<summary>Respuesta</summary>

Muestra el texto Hi en la terminal.

</details>

3. ¿Qué hace la computadora con una línea que empieza con `//`?

<details>
<summary>Respuesta</summary>

La ignora. Es un comentario, escrito para las personas.

</details>

4. Ejecutas un archivo y ves un error. ¿Qué lees primero?

<details>
<summary>Respuesta</summary>

El nombre del archivo y el número de línea. Después, la última línea, que nombra el tipo de error.

</details>

5. Mira este programa. ¿Qué muestra la terminal y por qué?

```ts
console.log("A");
console.Log("B");
console.log("C");
```

<details>
<summary>Respuesta</summary>

Muestra `A` y después un error que dice `console.Log is not a function`. No muestra `C`. La computadora ejecuta las líneas en orden. Se detiene en la línea 2, porque `Log` con L mayúscula no existe. Nunca llega a la línea 3.

</details>

6. Un compañero dice: "Mi archivo tiene una comilla que falta en la línea 5, pero las líneas 1 a 4 sí mostraron su texto". ¿Es posible?

<details>
<summary>Respuesta</summary>

No. Una comilla que falta es un error de sintaxis. La computadora lee todo el archivo antes de ejecutarlo, así que encuentra el problema primero y no ejecuta nada. Si las líneas 1 a 4 mostraron texto, el problema de la línea 5 era de otro tipo. Ese tipo de error ocurre solo cuando la computadora llega a esa línea.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Cuál es la diferencia entre JavaScript y TypeScript, y por qué muchos equipos eligen TypeScript?**
   - Busca: `typescript vs javascript difference`
   - Una buena respuesta explica: qué añade TypeScript, cuándo ocurren las comprobaciones extra y qué se elimina antes de ejecutar el código.

2. **¿Qué es Node.js y por qué JavaScript puede ejecutarse fuera de un navegador?**
   - Busca: `what is node.js v8 engine`
   - Una buena respuesta explica: qué hace un motor y qué añade Node.js a su alrededor, como los archivos y la terminal.

3. **¿Qué pruebas manuales conviene automatizar y cuáles no?**
   - Busca: `what to automate in testing`
   - Una buena respuesta explica: al menos tres buenos candidatos y tres malos, con una razón para cada uno.

## Siguiente paso

En la próxima lección aprenderás a guardar valores, como texto y números, en variables.
