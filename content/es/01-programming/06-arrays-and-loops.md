---
title: Arrays y bucles
summary: Guarda muchos valores en una lista, repite una acción para cada elemento con un bucle for...of, y aprende a encontrar el bug en un bucle que da una respuesta incorrecta sin ningún error.
duration: 80 min
---

## Empieza con un acertijo

Un club de corredores anota tres tiempos de vuelta, en segundos. El entrenador quiere la mejor vuelta. La mejor vuelta es el número más pequeño. Este es el código.

```ts
const laps = [62, 58, 61];
let best = 0;

for (const lap of laps) {
  if (lap < best) {
    best = lap;
  }
}

console.log(best);
```

¿Qué imprime? ¿Es 58? ¿Es 62? ¿Otra cosa? El programa no muestra ningún mensaje de error. Se ejecuta hasta el final.

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Predecir qué le hace un bucle a una variable en cada vuelta.
- Leer un elemento por su índice, y decir qué pasa cuando el índice no existe.
- Elegir un buen valor inicial para un contador, una suma, un valor mínimo y un valor máximo.
- Encontrar un bug en un bucle reduciendo el problema y cambiando una sola cosa a la vez.

## Arrays

Un *array* (arreglo, una lista de valores) es una lista de valores en orden. Se escribe con corchetes. Los valores se separan con comas.

```ts
const dogs = ["Rex", "Mimi", "Luna"];
console.log(dogs);
```

Esto imprime:

```text
[ 'Rex', 'Mimi', 'Luna' ]
```

Cada valor del array es un **elemento**. Node muestra el texto con comillas simples aquí. Es el mismo texto.

Un array también puede guardar números:

```ts
const laps = [62, 58, 61];
```

Usa un solo tipo en cada array. Una lista de textos, o una lista de números.

## Índice

El **índice** es la posición de un elemento. La cuenta empieza en 0, no en 1.

Antes de ejecutar esto, adivina: ¿qué imprimen las dos líneas?

```ts
const dogs = ["Rex", "Mimi", "Luna"];
console.log(dogs[0]);
console.log(dogs[2]);
```

Esto imprime:

```text
Rex
Luna
```

El primer elemento es el índice 0. El segundo es el índice 1. El tercero es el índice 2.

> **Cuidado:** El primer elemento es `[0]`, no `[1]`. En una lista de 3 elementos, el último índice es 2.

Ahora adivina otra vez. ¿Qué imprime esto?

```ts
console.log(dogs[3]);
console.log(dogs[-1]);
```

Imprime `undefined` dos veces. Sin error. El programa no te dice que el índice está mal. Te da "ningún valor" y sigue. Por eso un índice incorrecto es peligroso: el error aparece más tarde, lejos de donde empezó.

En este proyecto, el verificador de tipos es estricto. Trata `dogs[0]` como "un string o `undefined`". Puedes imprimirlo. Para usarlo como string, primero debes comprobarlo con un `if`.

```ts
const first = dogs[0];
if (first !== undefined) {
  console.log(first.toUpperCase());
}
```

Esto imprime:

```text
REX
```

`toUpperCase()` es una función lista para usar con los textos. Cambia el texto a mayúsculas.

## Longitud

La **longitud** (*length*) de un array es el número de elementos.

```ts
const dogs = ["Rex", "Mimi", "Luna"];
console.log(dogs.length);
console.log(dogs[dogs.length - 1]);
console.log(dogs.at(-1));
```

Esto imprime:

```text
3
Luna
Luna
```

El último índice siempre es `length - 1`. La función `at` es una forma más corta de decir lo mismo: `at(-1)` significa "el último elemento", `at(-2)` significa "el anterior".

## Agregar elementos con push

**push** agrega un elemento al final del array.

```ts
const playlist = ["Blue"];
playlist.push("Sunday");
playlist.push("Echo");
console.log(playlist);
```

Esto imprime:

```text
[ 'Blue', 'Sunday', 'Echo' ]
```

Quizá te preguntes: el array es una `const`, entonces ¿por qué puede cambiar? Una `const` te impide darle al nombre un array nuevo. No te impide cambiar los elementos de adentro.

## Bucles

Un **bucle** repite código. Usa un bucle cuando necesites hacer lo mismo con cada elemento.

El bucle `for...of` toma un elemento a la vez.

```ts
const dogs = ["Rex", "Mimi", "Luna"];

for (const dog of dogs) {
  console.log(`Walking ${dog}`);
}
```

Esto imprime:

```text
Walking Rex
Walking Mimi
Walking Luna
```

Léelo así: para cada `dog` en `dogs`, ejecuta el código entre llaves. En la primera vuelta, `dog` es `"Rex"`. En la segunda vuelta es `"Mimi"`. En la tercera es `"Luna"`.

Tú eliges el nombre `dog`. Usa un nombre que diga qué es un elemento.

### ¿Qué hace un bucle con una lista que crece?

Aquí hay un experimento. El bucle agrega un elemento nuevo mientras se ejecuta. ¿Qué esperas que imprima?

```ts
const queue = ["a", "b"];

for (const item of queue) {
  console.log(item);
  if (item === "a") {
    queue.push("c");
  }
}
```

Imprime `a`, `b` y `c`. El bucle no toma una foto de la lista al inicio. Mira la lista otra vez en cada vuelta, así que también visita el elemento nuevo. Si haces push en cada vuelta, el bucle nunca termina. No cambies una lista mientras la recorres con un bucle, salvo que sepas exactamente por qué.

## Planea el bucle primero en palabras simples

Antes de escribir un bucle, escribe los pasos en palabras simples. Esto se llama **pseudocódigo**. No es código real. Es un plan que puedes leer.

Tarea: contar los días de lluvia de una semana.

```text
start with a count of 0
for each day in the week
  if the day is "rain", add 1 to the count
show the count
```

Ahora el código es fácil de escribir, porque cada línea del plan se convierte en una línea de código. Dividir un problema en pasos pequeños así se llama **descomposición**.

## Contar en un bucle

Usa una variable `let` como contador. Cámbiala dentro del bucle.

```ts
const weather = ["rain", "sun", "rain", "rain", "cloud"];
let rainyDays = 0;

for (const day of weather) {
  if (day === "rain") {
    rainyDays = rainyDays + 1;
  }
}

console.log(`Rainy days: ${rainyDays}`);
```

Esto imprime:

```text
Rainy days: 3
```

Fíjate en que `rainyDays` empieza en 0 antes del bucle. Es un `let` porque cambia.

## Sumar en un bucle

La misma idea suma números. Empieza en 0 y suma cada número.

```ts
const prices = [2.5, 1.2, 4];
let total = 0;

for (const price of prices) {
  total = total + price;
}

console.log(total);
```

Esto imprime:

```text
7.7
```

¿Por qué empezar en 0? Porque sumar 0 no cambia nada. El valor inicial debe ser el que no hace daño. Para una suma, es 0.

## El valor inicial es una decisión

Mira el acertijo otra vez. Para un contador y una suma, 0 es un buen inicio. ¿Es bueno también para el valor mínimo?

Piénsalo con una regla: el valor inicial debe perder contra todos los elementos reales. Para "el mínimo", el inicio debe ser mayor que todas las vueltas. Para "el máximo", debe ser menor que todos los elementos. Cero no es mayor que un tiempo de vuelta.

### De vuelta al acertijo

El programa imprime `0`. La variable `best` empieza en 0. Ninguna vuelta es menor que 0, así que el `if` nunca es verdadero, y `best` se queda en 0. El programa no tiene error. Solo da una respuesta incorrecta.

Puedes encontrar este tipo de bug como un científico. Esto es **depurar con experimentos**: haz una hipótesis, ejecuta una prueba pequeña, cambia una sola cosa a la vez. Primero, reduce el caso que falla. ¿Una lista con una sola vuelta, `[62]`, también imprime 0? Sí. Entonces la lista no es el problema. Después supón: "el valor inicial es el problema". Cambia solo esa línea:

```ts
const laps = [62, 58, 61];
let best = Infinity;

for (const lap of laps) {
  if (lap < best) {
    best = lap;
  }
}

console.log(best);
```

Esto imprime `58`. `Infinity` es un número mayor que cualquier otro número. Otro buen inicio es el primer elemento de la lista. Los dos funcionan. ¿Cuál es mejor cuando la lista está vacía? Lo pensarás en las preguntas.

## Revisar una lista con includes

**includes** pregunta si un valor está en el array. La respuesta es `true` o `false`.

```ts
const likedSongs = ["Blue", "Echo"];
console.log(likedSongs.includes("Echo"));
console.log(likedSongs.includes("Sunday"));
```

Esto imprime:

```text
true
false
```

Úsalo con `if` para decidir qué hacer:

```ts
if (likedSongs.includes("Echo")) {
  console.log("Add Echo to the party playlist");
}
```

Esto imprime:

```text
Add Echo to the party playlist
```

¿Qué da `likedSongs.includes("echo")`? Pruébalo. Las mayúsculas cuentan, así que la respuesta es `false`.

## Profundiza

### Por qué la cuenta empieza en 0

El índice es la distancia desde el inicio de la lista. El primer elemento está a 0 pasos del inicio. El segundo está a 1 paso. Por eso el último índice es `length - 1`. Muchos lenguajes de programación funcionan así.

### Una idea equivocada común: "dos nombres son dos listas"

En la lección «Valores y variables», copiar una variable creaba dos valores separados. Con los arrays es distinto. Un array es un solo objeto en la memoria. Un nombre apunta a él. Cuando escribes `const b = a`, los dos nombres apuntan a la misma lista.

```ts
const a = ["x"];
const b = a;
b.push("y");
console.log(a);
```

Esto imprime:

```text
[ 'x', 'y' ]
```

Cambiaste `b`, pero `a` también cambió. Es una sola lista con dos nombres. Para hacer una copia real, usa `slice()`.

```ts
const c = a.slice();
c.push("z");
console.log(a, c);
```

Esto imprime:

```text
[ 'x', 'y' ] [ 'x', 'y', 'z' ]
```

Ahora `c` es una lista separada.

### Cómo aparece en el trabajo real de automatización de QA

Este es el único vínculo con las pruebas en esta lección. Muchas veces pruebas la misma regla con muchas entradas. Una contraseña debe tener al menos 8 caracteres. Pon las entradas en un array y escribe la comprobación una sola vez.

```ts
const passwords = ["", "123", "abcdefgh"];

for (const password of passwords) {
  if (password.length < 8) {
    console.log(`Rejected: "${password}"`);
  } else {
    console.log(`Accepted: "${password}"`);
  }
}
```

Esto imprime:

```text
Rejected: ""
Rejected: "123"
Accepted: "abcdefgh"
```

Un solo cuerpo, muchas entradas. Esto es *DRY* ("No te repitas"), y el nombre de este estilo es pruebas dirigidas por datos. Estudiarás DRY al final de este módulo. En el Módulo 4 lo verás en tests reales.

### Un compromiso

Fíjate en que el mensaje imprime la entrada. Cuando un caso falla, debes saber qué entrada fue. Recuerda también que una falla detiene un bucle simple en el primer elemento malo. Los elementos que siguen no se revisan. Las herramientas de test reales pueden ejecutar cada entrada como su propio test, así que una falla no esconde a las demás.

## Práctica

1. Crea el archivo `exercises/01-programming/lists.ts`.
2. Haz un array con cuatro nombres de perros, o cuatro nombres de cualquier mundo que te guste. Imprime el primer y el último elemento.
3. Agrega un nombre nuevo con `push`. Imprime la longitud.
4. Usa `for...of` para imprimir cada nombre con el texto `Walking`.
5. Haz un array de números, por ejemplo tiempos de vuelta. Usa un bucle para imprimir la suma.
6. Abre `exercises/01-programming/06-arrays-and-loops.ts` y ejecútalo:

```bash
node exercises/01-programming/06-arrays-and-loops.ts
```

Resuelve los ejercicios. Haz que cada línea diga `OK`.

## Reto

Elige tu propio mundo: tiempos de vuelta, temperaturas diarias, puntajes de un cuestionario, el precio de un café en diez tiendas, la edad de cada animal de un refugio. Escribe una función `report(values)` que reciba una lista de números e imprima una línea con el valor mínimo, el valor máximo y el promedio. Usa un bucle. No uses `Math.min` ni `Math.max`.

Crea el archivo `exercises/challenges/arrays-and-loops.ts`. Ejecútalo con `node exercises/challenges/arrays-and-loops.ts`.

Está terminado cuando:

- Tu función imprime una línea como `min 58.9, max 70.25, average 62.3` para una lista de al menos cinco números.
- También funciona cuando el número más pequeño es negativo, por ejemplo `[-5, -2, -9]`.
- Para una lista vacía imprime un mensaje claro como `No data`, y no `Infinity` ni `NaN`.
- El promedio se muestra con un dígito después del punto decimal.
- `pnpm typecheck` no muestra ningún error para tu archivo.

Vas a necesitar algo que esta lección no enseñó: cómo mostrar un número con una cantidad fija de dígitos después del punto decimal. Busca `javascript toFixed`.

## Piénsalo bien

1. Predice la salida y explica por qué.

```ts
const scores = [10, 20];
let total = 0;

for (const score of scores) {
  total = score;
}

console.log(total);
```

<details>
<summary>Respuesta</summary>

Imprime `20`. La línea `total = score` reemplaza el total en cada vuelta. No suma. En la primera vuelta el total es 10. En la segunda pasa a ser 20, y el bucle termina. Para sumar, escribes `total = total + score`. La primera versión es un descuido muy común porque las dos líneas se ven casi iguales.

</details>

2. Este código debería contar los días de lluvia. Imprime 0 aunque dos días fueron de lluvia. Encuentra el bug.

```ts
const week = ["rain", "rain", "sun"];
let rainy = 0;

for (const day of week) {
  rainy = 0;
  if (day === "rain") {
    rainy = rainy + 1;
  }
}
console.log(rainy);
```

<details>
<summary>Respuesta</summary>

La línea `rainy = 0;` está dentro del bucle. Reinicia el contador en cada vuelta. El último día es `sun`, así que el contador termina en 0. Deja el valor inicial, `let rainy = 0;`, solo antes del bucle, y borra el reinicio. Una buena forma de encontrarlo: imprime `rainy` al final de cada vuelta y mira cómo vuelve a 0.

</details>

3. Las dos líneas dan el último perro de una lista. ¿Cuál es mejor aquí, y qué te haría elegir la otra?

```ts
const lastA = dogs[dogs.length - 1];
const lastB = dogs.at(-1);
```

<details>
<summary>Respuesta</summary>

La versión B es mejor para leer el código. `at(-1)` dice "el último elemento" y no tiene un `length - 1` que puedas equivocar. Las dos dan `undefined` con una lista vacía. Elegirías la versión A si tu código debe correr en un programa muy viejo que no conoce `at`, o si tu equipo ya usa un solo estilo en todo y quieres que el código se vea igual. La velocidad de lectura importa más que ahorrar unas letras.

</details>

4. ¿Qué pasa con este código cuando la lista está vacía? ¿Qué querrías que pasara en su lugar?

```ts
const lapTimes: number[] = [];
let total = 0;

for (const lap of lapTimes) {
  total = total + lap;
}

console.log(total / lapTimes.length);
```

<details>
<summary>Respuesta</summary>

Imprime `NaN`, que significa "no es un número". El bucle no hace nada, así que el total es 0. Luego 0 dividido entre 0 no es un número. El programa no se detiene y no da error. Lo que quieres es comprobar primero la longitud con un `if`, e imprimir un mensaje claro como "No laps yet". El caso límite, una lista vacía, debe ser una decisión tuya, no un accidente.

</details>

5. Explícale a un compañero, en tres oraciones y sin usar la palabra "cero", por qué el último índice de una lista es `length - 1`.

<details>
<summary>Respuesta</summary>

Una buena respuesta podría ser: el índice dice cuántos pasos caminas desde el primer elemento. El primer elemento no necesita pasos, así que está en el índice 0. Una lista de 3 elementos tiene su último elemento a 2 pasos del inicio, así que el último índice es la longitud menos 1. Si tu respuesta dijo "la posición" sin "los pasos desde el inicio", puede sentirse correcta pero no explica la razón. Piensa en una regla: la primera línea está en el inicio, no en el 1.

</details>

6. Un compañero dice: "Siempre haz una copia de una lista con `slice()` antes de hacerle push". ¿Siempre es cierto?

<details>
<summary>Respuesta</summary>

No hay una única respuesta. Una copia protege a los otros nombres que apuntan a la misma lista, así nadie se lleva una sorpresa. Pero una copia cuesta un poco de memoria y de tiempo, y puede esconder que dos partes de tu programa comparten datos a propósito. Si la lista es solo tuya, dentro de una función, una copia agrega ruido. Si recibiste la lista de otra parte del programa, una copia es más segura. Depende de quién más use la lista.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Por qué la mayoría de los lenguajes de programación cuentan desde 0, y cuáles cuentan desde 1?**
   - Busca: `zero-based indexing why`
   - Pruébalo: en un archivo, haz un array de cinco elementos. Imprime `items[0]`, `items[5]` e `items.at(-2)`. Anota cuál línea no pudiste predecir.
   - Una buena respuesta explica: qué significa un índice, la razón de la distancia desde el inicio y un lenguaje que empieza en 1.

2. **¿Cuál es la diferencia entre `for...of`, `for...in` y `forEach` en JavaScript?**
   - Busca: `for of vs for in vs forEach javascript`
   - Pruébalo: recorre `["a", "b"]` con los tres. Imprime lo que obtienes en cada vuelta. Luego intenta poner `await` o `break` dentro de cada uno.
   - Una buena respuesta explica: qué te da cada uno en cada vuelta, y cuál usar para arrays.

3. **¿Por qué puede ser peligroso agregar elementos a una lista dentro de un bucle sobre la misma lista?**
   - Busca: `modify array while iterating javascript`
   - Pruébalo: cambia el experimento de `queue` para que haga push en cada vuelta. Agrega una línea que lo detenga después de 10 vueltas, para que tu computadora no se congele.
   - Una buena respuesta explica: qué ve el bucle en cada vuelta, y una forma más segura de construir la lista nueva.

## Siguiente paso

En la siguiente lección agruparás valores relacionados en objetos, por ejemplo el nombre, la edad y el peso de un perro.
