---
title: ¿Qué es programar?
summary: Aprende qué es un programa, escribe el primero con console.log y descubre qué hace la computadora cuando tu código tiene un error.
duration: 60 min
---

## Empieza con un acertijo

Aquí tienes una receta escrita como programa. Cada línea imprime un paso.

```ts
console.log("1. Boil the water");
console.log("2. Add the pasta");
console.log("3. Drain the water");
console.log("4. Add the sauce");
console.log("5. Serve");
```

Ahora cometes un pequeño error en la línea 4. Hay dos versiones del error. En la versión A escribes `console.Log` con L mayúscula. En la versión B olvidas la comilla de cierre después de `sauce`.

En cada versión, ¿cuántos pasos imprime la terminal antes de quejarse? La respuesta no es la misma para A y para B. ¿Cuál es, y por qué una computadora se comportaría de dos maneras?

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Predecir qué imprime un programa pequeño, línea por línea.
- Escribir y ejecutar un programa en VS Code.
- Explicar por qué la computadora sigue tus palabras al pie de la letra, y qué te cuesta eso.
- Leer un mensaje de error y decidir dónde mirar primero.

## ¿Qué es un programa?

Un programa es una lista de instrucciones. La computadora las sigue una por una, de la primera línea a la última.

La computadora hace exactamente lo que dices. No adivina. No entiende lo que quisiste decir.

Piensa en un robot cocinero. Le dices "haz té". Una persona sabe qué significa. Un robot que sigue las palabras al pie de la letra necesita más: toma una taza, hierve agua, vierte el agua, pon una bolsita de té, espera tres minutos. Hasta "espera" necesita un número.

Cuando escribes para una computadora, debes decir cada paso. Por eso programar te obliga a pensar con claridad.

Ya escribes instrucciones. Un caso de prueba manual es una lista de pasos. También lo es una receta, la ruta a la estación o las reglas de un juego de mesa. Un programa es la misma clase de lista. La diferencia es que la sigue una computadora, no una persona.

## Código, archivos y ejecución

El **código** es el texto que escribes para la computadora. Cada instrucción es una línea de código.

Guardas el código en un **archivo**. Un archivo es un documento con un nombre, como `hello.ts`. Las letras después del punto son la **extensión**. La extensión te dice qué tipo de archivo es.

**Ejecutar** un programa significa pedirle a la computadora que siga las instrucciones del archivo.

## JavaScript y TypeScript

**JavaScript** es un lenguaje de programación. Un lenguaje de programación es un conjunto de reglas para escribir instrucciones. JavaScript se creó para las páginas web, y también funciona fuera del navegador.

**TypeScript** es JavaScript con revisiones extra. Puede encontrar algunos errores antes de que el programa se ejecute. Los archivos que lo usan terminan en `.ts`.

En este curso escribes TypeScript. Playwright, la herramienta que usarás para los tests, funciona muy bien con él.

**Node.js** es el programa que ejecuta tu código en tu computadora. Lo instalaste en el Módulo 0.

## Tu primer programa

Abre la carpeta del proyecto en VS Code. Crea un archivo nuevo en `exercises/01-programming/hello.ts`.

Escribe esta única línea:

```ts
console.log("Hello, world!");
```

`console.log` es una instrucción. Significa: muestra esto en la terminal. El texto entre comillas es lo que muestra. El `;` al final cierra la línea.

Ahora abre la terminal de VS Code (Terminal > New Terminal). Ejecuta el archivo:

```bash
node exercises/01-programming/hello.ts
```

La terminal imprime:

```text
Hello, world!
```

Escribiste un programa y lo ejecutaste.

## Las instrucciones se ejecutan en orden

Antes de ejecutar este archivo, decide qué esperas. Es una lista de reproducción de música.

```ts
console.log("Now playing: Blue Monday");
console.log("Now playing: Yesterday");
console.log("Now playing: Hey Jude");
```

Esperas las canciones en el mismo orden que las líneas. Eso es lo que pasa:

```text
Now playing: Blue Monday
Now playing: Yesterday
Now playing: Hey Jude
```

Si cambias de lugar dos líneas en el archivo, la salida también cambia. El orden de las líneas es parte del programa.

El orden también puede romper un programa sin ningún error. Mira este plan de cena:

```ts
console.log("Put the cake in the oven");
console.log("Heat the oven to 180 degrees");
console.log("Wait 30 minutes");
```

La computadora está contenta. Un pastel en un horno frío no. Un programa puede ejecutarse sin error y aun así estar mal. La computadora revisa las reglas del lenguaje. No revisa tu idea.

## Comentarios

Un **comentario** es una nota para las personas. La computadora lo ignora. Un comentario empieza con `//`.

```ts
// A short routine for a pet shelter
console.log("Fill the water bowls");
console.log("Feed the cats"); // the dogs eat later
```

La terminal imprime solo esto:

```text
Fill the water bowls
Feed the cats
```

Usa los comentarios para explicar por qué hiciste algo. No los uses para repetir lo que la línea ya dice.

También puedes poner `//` delante de una línea de código para apagarla por un rato. Los programadores le llaman **comentar** la línea.

## Comete un error a propósito

Los errores son normales. Los programadores se equivocan todo el día. La habilidad está en leer el mensaje y decidir dónde mirar.

Toma la versión B del acertijo. Cambia la línea 1 de `hello.ts` para que olvide la comilla de cierre:

```ts
console.log("Hello, world!);
```

Guarda el archivo y ejecútalo. La terminal muestra un error. Las primeras líneas se ven así:

```text
C:/Users/you/project/exercises/01-programming/hello.ts:1
console.log("Hello, world!);

SyntaxError [ERR_INVALID_TYPESCRIPT_SYNTAX]: Expected ',', got '<eof>'
```

Siguen más líneas. Por ahora puedes ignorarlas. Lee las primeras:

- La primera línea te dice el archivo y el número de línea. Aquí es la línea 1.
- La segunda línea muestra el código que tiene el problema.
- La línea con `SyntaxError` nombra el tipo de error. Un **error de sintaxis** significa que el código rompe las reglas del lenguaje.

El mensaje no siempre es fácil de entender. Aquí dice que la línea terminó demasiado pronto. La razón real es la comilla que falta.

Agrega la comilla que falta y ejecuta de nuevo. El mensaje desaparece.

> **Consejo:** No le tengas miedo al texto rojo. Te dice dónde mirar. Lee primero el número de línea.

### De vuelta al acertijo

La versión A (`console.Log`) imprime los pasos 1, 2 y 3. Luego se detiene con `TypeError: console.Log is not a function`. Los pasos 4 y 5 nunca se imprimen, porque la computadora no puede hacer el paso 4.

La versión B (la comilla que falta) no imprime nada. La computadora lee el archivo completo antes de ejecutar una sola línea. Encuentra primero la línea rota y se niega a empezar.

Así que hay dos tipos de problema. Uno se encuentra cuando la computadora lee el archivo. El otro se encuentra solo cuando la computadora llega a esa línea. Los dos detienen el programa, pero en momentos distintos.

## Profundiza

### Por qué la computadora no adivina

Un chip de computadora entiende solo instrucciones muy pequeñas, como "suma estos dos números". No puede leer tu TypeScript directamente. Node.js contiene un motor que convierte tu código en esas instrucciones pequeñas. El motor trabaja de forma estricta. Sigue tu texto exactamente y no puede preguntarte qué quisiste decir.

Por eso una letra equivocada rompe un programa. Una persona que lee una receta puede adivinar que "Boill the water" significa "Boil the water". Una computadora no puede.

### Una idea equivocada común: "un error significa que nada se ejecutó"

Muchos principiantes piensan que un programa que falla no hace nada. La versión A del acertijo muestra que no es cierto. Las líneas 1 a 3 se ejecutaron. La línea 4 falló. La línea 5 nunca se ejecutó.

La computadora ejecuta las líneas en orden y se detiene en el primer problema. Las líneas anteriores al problema ya hicieron su trabajo. Recuerda esto cuando depures: encuentra la última línea que funcionó y mira la siguiente.

> **Nota:** Un error de sintaxis, como la comilla que falta, es distinto. La computadora lee el archivo completo antes de ejecutar nada. Por eso, con un error de sintaxis, ninguna línea se ejecuta.

### Cómo aparece en el trabajo real de automatización QA

Un test automatizado es un programa. Tiene pasos, en orden, como un caso de prueba manual. Cuando un paso falla, el test se detiene ahí. Los pasos siguientes no se ejecutan. El reporte te dice qué paso falló.

Por eso el orden de los pasos es parte del test. Si cambias de lugar "escribir la contraseña" y "hacer clic en Login", hiciste un test distinto.

También puedes notar que muchas líneas `console.log` se parecen. Repetir la misma idea muchas veces es una señal. Estudiarás esta idea, llamada DRY, al final de este módulo.

## Práctica

1. Crea el archivo `exercises/01-programming/hello.ts` si aún no lo has hecho.
2. Escribe tres líneas `console.log` con los pasos de una rutina que conozcas bien (hacer té, una mañana en la escuela, un calentamiento de fútbol). Ejecuta el archivo con `node exercises/01-programming/hello.ts`.
3. Pon un comentario encima de la primera línea. Escribe para qué sirve la rutina.
4. Cambia el orden de dos líneas. Ejecuta el archivo. Decide si el nuevo orden todavía tiene sentido.
5. Borra una comilla de cierre a propósito. Ejecuta el archivo. Encuentra el número de línea en el mensaje de error.
6. Arregla la comilla. Luego cambia `console.log` por `console.Log` en una línea y ejecuta otra vez. Compara los dos mensajes de error. ¿Cuál imprimió algunas líneas antes?

## Reto

Escribe un programa que imprima una "tarjeta de instrucciones" corta de algo que sepas hacer. Elige tu propio tema: dar de comer a una mascota, preparar un juego, una receta, una ruta por tu ciudad.

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
console.log("Rinse the rice"); // console.log("Add salt");
// console.log("Boil the rice");
console.log("Serve");
```

<details>
<summary>Respuesta</summary>

Imprime `Rinse the rice` y luego `Serve`. El `//` empieza un comentario, y un comentario llega hasta el final de la línea. En la línea 1, el segundo `console.log` está dentro del comentario, así que nunca se ejecuta. La línea 2 es un comentario desde su primer carácter. Solo la primera parte de la línea 1 y la línea 3 son código.

</details>

2. Un amigo escribe un programa de panadería. Se ejecuta sin error, pero el pastel es un desastre. Encuentra el bug.

```ts
console.log("Put the cake in the oven");
console.log("Heat the oven to 180 degrees");
console.log("Wait 30 minutes");
```

<details>
<summary>Respuesta</summary>

Los pasos están en el orden equivocado. La computadora solo revisa que cada línea siga las reglas del lenguaje. No sabe que un horno debe estar caliente antes de meter el pastel. Cambia de lugar las líneas 1 y 2. La lección es que "sin error" no significa "correcto".

</details>

3. Dos comentarios para la misma línea. ¿Cuál es mejor y cuándo elegirías el otro?

```ts
// print the song name
console.log("Now playing: Yesterday");
```

```ts
// the radio screen shows this text, so keep it short
console.log("Now playing: Yesterday");
```

<details>
<summary>Respuesta</summary>

El segundo es mejor. El primero repite lo que la línea ya dice, así que no aporta nada. El segundo explica por qué la línea está escrita así, y un lector no puede ver eso en el código. Elegirías el primer estilo solo cuando el código es difícil de leer y no puedes hacerlo más claro. Incluso entonces, muchas veces una línea mejor es mejor respuesta que un comentario.

</details>

4. ¿Qué pasa si ejecutas un archivo vacío? ¿Y si el archivo tiene solo comentarios?

<details>
<summary>Respuesta</summary>

No se imprime nada y no hay error. Un archivo vacío es un programa válido con cero instrucciones, y un archivo con solo comentarios también, porque la computadora ignora los comentarios. Es un buen caso límite. Un programa no necesita imprimir nada para ser correcto. Solo necesita seguir las reglas del lenguaje.

</details>

5. Explica a un compañero nuevo, en tres oraciones y sin la palabra "error", por qué un test se detiene en el paso que falla. Imagina que el compañero nunca ha programado.

<details>
<summary>Respuesta</summary>

Una buena respuesta podría ser: "La computadora sigue los pasos en orden, como una persona que lee una lista. Cuando un paso no se puede hacer, la computadora no sabe qué hacer después, así que se detiene. Los pasos anteriores ya ocurrieron y los pasos siguientes nunca empiezan". El razonamiento es que un paso posterior muchas veces depende de uno anterior. Si siguieras después de una falla, los resultados posteriores no significarían nada.

</details>

6. Una computadora podría adivinar lo que quisiste decir cuando escribes `console.Log`. Podría corregir la mayúscula por sí sola. ¿Es buena idea? Da una razón a favor y una en contra.

<details>
<summary>Respuesta</summary>

No hay una única respuesta correcta. A favor: pierdes menos tiempo con errores pequeños de escritura y los principiantes se sienten menos atascados. En contra: la suposición puede ser errónea, y entonces el programa hace algo que no pediste, sin ningún mensaje que te avise. En un test, una suposición errónea podría significar un test que pasa cuando debería fallar. Depende del costo de una suposición errónea. Un cuadro de búsqueda puede adivinar, porque equivocarse cuesta poco. Un programa que mueve dinero no debe adivinar.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Cuál es la diferencia entre JavaScript y TypeScript, y por qué muchos equipos eligen TypeScript?**
   - Busca: `typescript vs javascript difference`
   - Pruébalo: crea `exercises/01-programming/types-demo.ts` con las líneas `const n: number = "x";` y `console.log(n);`. Ejecútalo con `node`. Luego mira el archivo en VS Code.
   - Una buena respuesta explica: por qué Node ejecuta el archivo pero VS Code muestra una línea roja, y qué quita TypeScript antes de que el código se ejecute.

2. **¿Qué es Node.js, y por qué JavaScript puede ejecutarse fuera de un navegador?**
   - Busca: `what is node.js v8 engine`
   - Pruébalo: ejecuta `node -p "process.version"` y luego `node -e "console.log(typeof window)"` en la terminal. Abre un navegador, presiona F12, abre la pestaña Console y ejecuta ahí `typeof window`. Compara.
   - Una buena respuesta explica: qué hace un motor, y qué tiene un navegador que Node.js no tiene (y al revés).

3. **¿Qué tareas conviene darle a una computadora y cuáles no?**
   - Busca: `what to automate in testing`
   - Pruébalo: escribe una lista de diez cosas que haces cada semana, en el trabajo o en casa. Marca cada una como "se repite mucho", "casi no cambia" y "necesita criterio". Elige tres para automatizar y di por qué.
   - Una buena respuesta explica: al menos tres buenos candidatos y tres malos, con una razón para cada uno.

## Siguiente paso

En la siguiente lección aprendes a guardar valores, como nombres y números, en variables.
