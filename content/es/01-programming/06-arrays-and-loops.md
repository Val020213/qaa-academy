---
title: Arrays y bucles
duration: 60 min
---

## Objetivo

En esta lección guardas muchos valores en una lista y repites una acción para cada uno con un bucle. También aprendes a encontrar el bug en un bucle que da una respuesta incorrecta sin mostrar ningún error.

- Leer un elemento por su índice, y decir qué pasa cuando el índice no existe.
- Predecir qué le hace un bucle a una variable en cada vuelta.
- Elegir un buen valor inicial para un contador, una suma, un valor mínimo y un valor máximo.
- Encontrar un bug en un bucle reduciendo el problema y cambiando una sola cosa a la vez.

## Arrays

Un **array** (arreglo) es una lista de valores en orden. Se escribe con corchetes, y los valores se separan con comas.

```ts
const dogs = ["Rex", "Mimi", "Luna"]
console.log(dogs)
```

Esto imprime:

```text
[ 'Rex', 'Mimi', 'Luna' ]
```

Cada valor del array es un **elemento**. En esta salida, Node.js muestra los textos con comillas simples; es el mismo texto.

Un array también puede guardar números:

```ts
const laps = [62, 58, 61]
```

Usa un solo tipo en cada array: una lista de textos, o una lista de números.

## Índice

El **índice** es la posición de un elemento. La cuenta empieza en 0, no en 1.

```ts
const dogs = ["Rex", "Mimi", "Luna"]
console.log(dogs[0])
console.log(dogs[2])
```

Esto imprime:

```text
Rex
Luna
```

El primer elemento es el índice 0, el segundo es el índice 1 y el tercero es el índice 2. En una lista de 3 elementos, el último índice es 2.

Los índices empiezan en 0 por una convención que JavaScript heredó de lenguajes como C, y la razón está en la memoria. En C, un array es un bloque de casillas del mismo tamaño, una al lado de la otra, y la variable guarda un **puntero**: la dirección de memoria de la primera casilla. Para llegar a un elemento, el programa calcula dirección = inicio + índice × tamaño de la casilla. El índice es cuántas casillas hay que saltar desde el inicio, y para el primer elemento no hay que saltar ninguna.

![Un array en memoria en un lenguaje como C: la variable guarda la dirección de la primera casilla, y el índice dice cuántas casillas saltar.](/images/zero-index.es.svg)

JavaScript conserva la convención pero no te muestra direcciones: `dogs` guarda una referencia al array, y el motor decide cómo guardarlo. V8, el motor de Node.js, guarda un array como este de forma parecida al dibujo, en un bloque de casillas contiguas donde cada una tiene la referencia a un texto. Si el array tiene huecos enormes, V8 cambia a otra estructura, y por eso un índice de JavaScript no es una dirección de memoria.

Si pides un índice que no existe, no hay error:

```ts
console.log(dogs[3])
console.log(dogs[-1])
```

Imprime `undefined` dos veces. El programa no te avisa que el índice está mal; te da "ningún valor" y sigue. Por eso un índice incorrecto es peligroso: el error aparece más tarde, lejos de donde empezó.

En este proyecto, la opción `noUncheckedIndexedAccess` hace que el verificador trate `dogs[0]` como «un string o `undefined`». Antes de usarlo como string, puedes comprobarlo con un `if`.

```ts
const first = dogs[0]
if (first !== undefined) {
  console.log(first.toUpperCase())
}
```

Esto imprime:

```text
REX
```

`toUpperCase()` devuelve un texto en mayúsculas; no cambia el original.

## Longitud

En un array sin posiciones vacías como estos, la **longitud** (*length*) es el número de elementos.

```ts
const dogs = ["Rex", "Mimi", "Luna"]
console.log(dogs.length)
console.log(dogs[dogs.length - 1])
console.log(dogs.at(-1))
```

Esto imprime:

```text
3
Luna
Luna
```

En un array no vacío como este, el último índice es `length - 1`. `at(-1)` devuelve el último elemento y `at(-2)` el anterior; si no existe, devuelve `undefined`.

## Agregar elementos con push

**push** agrega un elemento al final del array.

```ts
const playlist = ["Blue"]
playlist.push("Sunday")
playlist.push("Echo")
console.log(playlist)
```

Esto imprime:

```text
[ 'Blue', 'Sunday', 'Echo' ]
```

El array es una `const` y aun así cambia: una `const` te impide darle al nombre un array nuevo, pero no te impide cambiar los elementos de adentro.

## Bucles

Un **bucle** repite código. Úsalo cuando necesites hacer lo mismo con cada elemento. El bucle `for...of` toma un elemento a la vez.

```ts
const dogs = ["Rex", "Mimi", "Luna"]

for (const dog of dogs) {
  console.log(`Walking ${dog}`)
}
```

Esto imprime:

```text
Walking Rex
Walking Mimi
Walking Luna
```

Léelo así: para cada `dog` en `dogs`, ejecuta el código entre llaves. En la primera vuelta `dog` es `"Rex"`, en la segunda es `"Mimi"` y en la tercera es `"Luna"`. Tú eliges el nombre `dog`; usa uno que diga qué es un elemento.

### El bucle for con índice

Hay una forma más antigua de escribir un bucle, en la que tú llevas el índice. Entre los paréntesis van tres partes separadas por `;`, el único lugar de este módulo donde escribes punto y coma:

```ts
const dogs = ["Rex", "Mimi", "Luna"]

for (let i = 0; i < dogs.length; i++) {
  console.log(`${i}: Walking ${dogs[i]}`)
}
```

- `let i = 0` se ejecuta una vez, antes de empezar: crea el contador en el primer índice.
- `i < dogs.length` es la condición. Se evalúa antes de cada vuelta, y el bucle termina cuando es falsa.
- `i++` se ejecuta al final de cada vuelta. Es una forma corta de escribir `i = i + 1`.

Esto imprime:

```text
0: Walking Rex
1: Walking Mimi
2: Walking Luna
```

Usa `for...of` cuando solo necesitas cada elemento, porque no hay contador que puedas escribir mal. Usa el bucle con índice cuando necesitas la posición, como aquí para numerar las líneas. El error típico de esta forma es escribir `i <= dogs.length`: el bucle da una vuelta de más y `dogs[3]` es `undefined`.

![El índice visita 0, 1 y 2. Cuando i llega a 3, i < dogs.length es falso y el bucle termina sin leer dogs[3].](/images/01-loop-traversal.es.svg)

### Un bucle sobre una lista que crece

Aquí el bucle agrega un elemento nuevo mientras se ejecuta:

```ts
const queue = ["a", "b"]

for (const item of queue) {
  console.log(item)
  if (item === "a") {
    queue.push("c")
  }
}
```

Imprime `a`, `b` y `c`. El iterador de un array comprueba la longitud actual antes de obtener cada elemento, así que también visita `"c"`. Si agregas un elemento en cada vuelta, nunca alcanza el final de la lista: continúa hasta que lo detengas o se produzca un error. No cambies una lista mientras la recorres, salvo que sepas exactamente por qué.

## Contar en un bucle

Usa una variable `let` como contador y cámbiala dentro del bucle.

```ts
const weather = ["rain", "sun", "rain", "rain", "cloud"]
let rainyDays = 0

for (const day of weather) {
  if (day === "rain") {
    rainyDays = rainyDays + 1
  }
}

console.log(`Rainy days: ${rainyDays}`)
```

Esto imprime:

```text
Rainy days: 3
```

`rainyDays` empieza en 0 antes del bucle, y es un `let` porque cambia.

## Sumar en un bucle

La misma idea suma números. Empieza en 0 y suma cada número.

```ts
const prices = [2.5, 1.2, 4]
let total = 0

for (const price of prices) {
  total = total + price
}

console.log(total)
```

Esto imprime:

```text
7.7
```

Se empieza en 0 porque sumar 0 no cambia nada. El valor inicial debe ser uno que no haga daño al resultado.

## El valor inicial es una decisión

Para un contador y una suma, 0 es un buen inicio. Para un valor mínimo no lo es. Un club de corredores anota tres tiempos de vuelta, en segundos, y quiere la mejor vuelta, que es el número más pequeño:

```ts
const laps = [62, 58, 61]
let best = 0

for (const lap of laps) {
  if (lap < best) {
    best = lap
  }
}

console.log(best)
```

Imprime `0`, sin ningún mensaje de error. `best` empieza en 0, ninguna vuelta es menor que 0, así que el `if` nunca es verdadero y `best` se queda en 0. El programa no falla: solo da una respuesta incorrecta.

Para el mínimo, puedes empezar con un valor al menos tan grande como todos los datos; para el máximo, con uno al menos tan pequeño. También puedes empezar con el primer elemento de una lista no vacía.

Para encontrar un bug así, reduce el caso que falla y cambia una sola cosa a la vez. Con una lista de una sola vuelta, `[62]`, el programa también imprime 0, así que la lista no es el problema. Entonces cambia solo la línea del valor inicial:

```ts
const laps = [62, 58, 61]
let best = Infinity

for (const lap of laps) {
  if (lap < best) {
    best = lap
  }
}

console.log(best)
```

Esto imprime `58`. `Infinity` es mayor que cualquier número finito. Otro buen inicio es el primer elemento si la lista no está vacía.

## Revisar una lista con includes

**includes** pregunta si un valor está en el array. La respuesta es `true` o `false`.

```ts
const likedSongs = ["Blue", "Echo"]
console.log(likedSongs.includes("Echo"))
console.log(likedSongs.includes("Sunday"))
```

Esto imprime:

```text
true
false
```

Úsalo con `if` para decidir qué hacer:

```ts
if (likedSongs.includes("Echo")) {
  console.log("Add Echo to the party playlist")
}
```

Esto imprime:

```text
Add Echo to the party playlist
```

Las mayúsculas cuentan: `likedSongs.includes("echo")` da `false`.

## Profundiza

### Dos nombres, una sola lista

Al copiar una variable que guarda un número o un texto, obtienes dos valores separados. Con los arrays es distinto: un array es un solo objeto en la memoria y el nombre apunta a él. Cuando escribes `const b = a`, los dos nombres apuntan a la misma lista.

```ts
const a = ["x"]
const b = a
b.push("y")
console.log(a)
```

Esto imprime:

```text
[ 'x', 'y' ]
```

Cambiaste la lista a través de `b`, y `a` apunta a esa misma lista. `slice()` crea otro array con los mismos elementos.

![Dos nombres que apuntan a la misma lista.](/images/shared-array.es.svg)

```ts
const c = a.slice()
c.push("z")
console.log(a, c)
```

Esto imprime:

```text
[ 'x', 'y' ] [ 'x', 'y', 'z' ]
```

Ahora `c` es una lista separada.

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

Resuelve los ejercicios. Haz que cada comprobación diga `OK`.

## Reto

Elige tu propio mundo, por ejemplo tiempos de vuelta o el precio de un café en diez tiendas. Escribe una función `report(values)` que reciba una lista de números e imprima una línea con el valor mínimo, el valor máximo y el promedio. Usa un bucle. No uses `Math.min` ni `Math.max`.

Crea el archivo `exercises/challenges/arrays-and-loops.ts`. Ejecútalo con `node exercises/challenges/arrays-and-loops.ts`.

Está terminado cuando:

- Tu función imprime una línea como `min 58.9, max 70.25, average 62.3` para una lista de al menos cinco números.
- También funciona cuando el número más pequeño es negativo, por ejemplo `[-5, -2, -9]`.
- Para una lista vacía imprime un mensaje claro como `No data`, y no `Infinity` ni `NaN`.
- El promedio se muestra con un dígito después del punto decimal.

Vas a necesitar algo que esta lección no enseñó: cómo mostrar un número con una cantidad fija de dígitos después del punto decimal. Busca `javascript toFixed`.

## Piénsalo bien

1. Predice la salida y explica por qué.

```ts
const scores = [10, 20]
let total = 0

for (const score of scores) {
  total = score
}

console.log(total)
```

<details>
<summary>Respuesta</summary>

Imprime `20`. La línea `total = score` reemplaza el total en cada vuelta; no suma. En la primera vuelta el total es 10 y en la segunda pasa a ser 20. Para sumar, escribes `total = total + score`. Es un descuido muy común porque las dos líneas se ven casi iguales.

</details>

2. Este código debería contar los días de lluvia. Imprime 0 aunque dos días fueron de lluvia. Encuentra el bug.

```ts
const week = ["rain", "rain", "sun"]
let rainy = 0

for (const day of week) {
  rainy = 0
  if (day === "rain") {
    rainy = rainy + 1
  }
}
console.log(rainy)
```

<details>
<summary>Respuesta</summary>

La línea `rainy = 0` está dentro del bucle y reinicia el contador en cada vuelta. El último día es `sun`, así que el contador termina en 0. Deja el valor inicial, `let rainy = 0`, solo antes del bucle, y borra el reinicio. Una buena forma de encontrarlo es imprimir `rainy` al final de cada vuelta y ver cómo vuelve a 0.

</details>

3. ¿Qué pasa con este código cuando la lista está vacía? ¿Qué querrías que pasara en su lugar?

```ts
const lapTimes: number[] = []
let total = 0

for (const lap of lapTimes) {
  total = total + lap
}

console.log(total / lapTimes.length)
```

<details>
<summary>Respuesta</summary>

Imprime `NaN`, que significa "no es un número". El bucle no hace nada, así que el total es 0, y 0 dividido entre 0 no es un número. El programa no se detiene y no da error. Lo que quieres es comprobar primero la longitud con un `if` e imprimir un mensaje claro como "No laps yet". Una lista vacía es un caso límite, y lo que pasa con ella debe ser una decisión tuya, no un accidente.

</details>

## Siguiente paso

En la siguiente lección agruparás valores relacionados en objetos, por ejemplo el nombre, la edad y el peso de un perro.
