---
title: Trabajar con listas
duration: 50 min
---

## Objetivo

En esta lección le haces preguntas a una lista con los métodos de array: transformarla, filtrarla, buscar en ella y ordenarla, sin cambiar la lista original por accidente.

- Elegir el método de lista correcto para una pregunta: cambiar cada elemento, quedarte con algunos, encontrar uno o responder sí o no.
- Predecir qué métodos cambian la lista original y cuáles la dejan en paz.
- Decir qué devuelve cada método para una lista vacía.
- Leer una cadena de métodos de lista como una oración.

## Los datos

Los primeros ejemplos usan una lista de reproducción de música. Cópiala al inicio de tu archivo de práctica.

```ts
type Song = {
  title: string
  artist: string
  seconds: number
  liked: boolean
}

const playlist: Song[] = [
  { title: "Blue", artist: "Mia", seconds: 215, liked: true },
  { title: "Rain Dance", artist: "Tomas", seconds: 180, liked: false },
  { title: "Sunday", artist: "Mia", seconds: 245, liked: true },
  { title: "Echo", artist: "Lena", seconds: 120, liked: false },
]
```

## Funciones callback

Varios métodos de esta lección reciben una función como entrada. Esa función se llama **callback**. El método la llama al recorrer la lista; algunos se detienen en cuanto encuentran la respuesta. Aquí la escribimos como función flecha: `(song) => ...`.

## map: cambiar cada elemento

`map` crea un array nuevo. Ejecuta tu callback sobre cada elemento presente y junta los resultados.

```ts
const titles = playlist.map((song) => song.title)
console.log(titles)
```

El programa imprime:

```text
[ 'Blue', 'Rain Dance', 'Sunday', 'Echo' ]
```

El array nuevo tiene la longitud inicial del viejo. `map` no modifica el array original, aunque tu callback sí puede hacerlo. Cada elemento puede convertirse en algo distinto, por ejemplo un número:

```ts
const minutes = playlist.map((song) => Math.round(song.seconds / 60))
console.log(minutes)
```

Esto imprime:

```text
[ 4, 3, 4, 2 ]
```

> **Cuidado:** Si usas llaves en el callback, debes escribir `return`. Sin él, el callback da `undefined` para cada elemento. `[10, 20].map((p) => { p * 1.2 })` da `[ undefined, undefined ]`. No aparece ningún error. No necesitas llaves para un callback de una línea.

## filter: quedarte con algunos elementos

`filter` crea un array nuevo solo con los elementos para los que tu callback devuelve un valor que JavaScript considera verdadero.

```ts
const liked = playlist.filter((song) => song.liked)
console.log(liked.length)
```

El programa imprime `2`.

Puedes encadenar los dos métodos. Obtén los títulos de las canciones de Mia:

```ts
const miaTitles = playlist
  .filter((song) => song.artist === "Mia")
  .map((song) => song.title)

console.log(miaTitles)
```

El programa imprime:

```text
[ 'Blue', 'Sunday' ]
```

Una cadena se lee de arriba abajo como una oración: "de la lista de reproducción, quédate con las canciones de Mia, y luego toma sus títulos". El orden importa. Si escribes `map` primero y `filter` después, los elementos ya son solo títulos y `song.artist` no existe.

## find: obtener un elemento

`find` devuelve el primer elemento para el que tu callback devuelve un valor que JavaScript considera verdadero. Si nada coincide, devuelve `undefined`.

```ts
const found = playlist.find((song) => song.artist === "Tomas")
console.log(found?.title)

const missing = playlist.find((song) => song.artist === "Zed")
console.log(missing)
```

El programa imprime:

```text
Rain Dance
undefined
```

El tipo del resultado es `Song | undefined`, así que debes manejar el caso de `undefined`. El `?.` en `found?.title` lee `title` si `found` no es `null` ni `undefined`; en esos dos casos, el resultado es `undefined`.

`find` da solo la primera coincidencia. Hay dos canciones de Mia, y `find` para Mia devuelve el objeto de `Blue`, no el de `Sunday`. Si necesitas todas las coincidencias, usa `filter`.

## some y every: sí o no

`some` devuelve `true` si al menos un elemento coincide. `every` devuelve `true` si todos los elementos coinciden.

```ts
const hasLongSong = playlist.some((song) => song.seconds > 240)
const allLiked = playlist.every((song) => song.liked)

console.log(hasLongSong)
console.log(allLiked)
```

El programa imprime:

```text
true
false
```

Con una lista sin canciones, `some` da `false` porque no hay ninguna canción que coincida, y `every` da `true` porque no hay ninguna canción que rompa la regla.

```ts
const empty: Song[] = []
console.log(empty.some((song) => song.liked))
console.log(empty.every((song) => song.liked))
```

El programa imprime:

```text
false
true
```

> **Cuidado:** `every` en una lista vacía devuelve `true`. "Todas las canciones le gustan al usuario" es verdad cuando no hay canciones. Ten esto presente cuando una lista pueda estar vacía.

## Spread: copiar una lista

Dentro de un literal de array, `...playlist` usa **spread** para añadir los elementos de `playlist` al array nuevo.

```ts
const extended: Song[] = [
  ...playlist,
  { title: "Moon", artist: "Zed", seconds: 99, liked: false },
]

console.log(playlist.length)
console.log(extended.length)
```

El programa imprime:

```text
4
5
```

La lista original sigue teniendo 4 elementos. Creaste una lista nueva con 5 elementos, pero las dos listas comparten los objetos de las primeras cuatro canciones. Cambiar una propiedad de uno de esos objetos se ve en ambas.

## Ordenar

`sort` tiene dos trampas. Mira este código:

```ts
const scores = [9, 100, 25]
const sorted = scores.sort()

console.log(sorted)
console.log(scores)
```

Imprime `[ 100, 25, 9 ]` dos veces. Primero, `sort` sin callback ordena los elementos como texto. Como texto, `"100"` va antes de `"25"`, porque el primer carácter `1` es menor que `2`, y `"25"` va antes de `"9"`. Segundo, `sort` cambia la lista original y devuelve esa misma lista. Entonces `sorted` y `scores` son una sola lista con dos nombres, como viste en la lección 06.

Para ordenar números, `toSorted` recibe un callback que dice cómo comparar dos elementos. El callback recibe `a` y `b`, y devuelve un número negativo si `a` va primero, o un número positivo si `b` va primero. Devuelve `0` si los considera iguales; esos elementos conservan su orden relativo.

```ts
const scores = [9, 100, 25]

console.log(scores.toSorted((a, b) => a - b))
console.log(scores)
```

El programa imprime:

```text
[ 9, 25, 100 ]
[ 9, 100, 25 ]
```

`toSorted` crea una lista nueva. `map`, `filter`, `find`, `some`, `every` y `toSorted` no modifican por sí mismos el array original; tu callback sí puede modificarlo o cambiar sus objetos. `sort` y `push` modifican el array. Cuando no estés seguro de un método, busca su documentación: dice qué devuelve y si cambia la lista.

## ¿map o for...of?

Los dos funcionan. Usa esta regla:

- Usa `map`, `filter`, `find`, `some` y `every` cuando quieres un resultado: una lista nueva, un elemento o una respuesta sí/no.
- Usa `for...of` cuando quieres hacer una acción por cada elemento, como imprimir o hacer clic.

## Profundiza

### Lo que realmente hace map

Puedes reproducir este uso de `map` con un bucle. Esta función obtiene las duraciones de nuestra lista con `for...of`:

```ts
function myMap(items: Song[], callback: (song: Song) => number): number[] {
  const result: number[] = []
  for (const item of items) {
    result.push(callback(item))
  }
  return result
}

console.log(myMap(playlist, (song) => song.seconds))
```

El texto `(song: Song) => number` es el tipo de un callback. Dice: una función que recibe una canción y devuelve un número. El programa imprime:

```text
[ 215, 180, 245, 120 ]
```

## Práctica

1. Crea el archivo `exercises/01-programming/lists-practice.ts`.
2. Pega los datos de la lista de reproducción del inicio de esta lección.
3. Imprime los títulos de todas las canciones con `map`.
4. Imprime los títulos de todas las canciones que no le gustan al usuario.
5. Usa `find` para obtener la canción de "Lena" e imprime su duración en segundos.
6. Imprime si `some` canción dura más de 4 minutos.
7. Abre `exercises/01-programming/09-working-with-lists.ts`. Reemplaza cada `// TODO` con código.
8. Ejecuta el archivo de ejercicios con este comando:

```bash
node exercises/01-programming/09-working-with-lists.ts
```

Haz que cada comprobación diga `OK`.

## Reto

Elige tu propio mundo, por ejemplo una liga de fútbol o un libro de recetas. Haz una lista de al menos ocho objetos. Cada objeto tiene una propiedad de texto que lo pone en un grupo (un equipo, un tipo de comida) y una propiedad numérica (goles, minutos, precio, puntos).

Escribe una función `report(list)` que imprima dos cosas: los tres elementos con el número más grande, el más alto primero, y cuántos elementos hay en cada grupo. Cuando la lista está vacía, imprime un mensaje claro y no falla.

Crea el archivo `exercises/challenges/working-with-lists.ts`. Ejecútalo con `node exercises/challenges/working-with-lists.ts`.

Está terminado cuando:

- `report` imprime los tres primeros según la propiedad numérica, el más alto primero.
- Después de que `report` se ejecuta, la lista original sigue con el mismo orden de cuando la escribiste. Imprime la lista completa para comprobarlo.
- `report` imprime un conteo por cada grupo, por ejemplo `Reds 3`, y cada grupo aparece una sola vez.
- `report([])` imprime un mensaje claro como `No players`, y ningún error.

Vas a necesitar algo que esta lección no enseñó: cómo tomar solo los primeros elementos de una lista, y cómo llevar un conteo por cada nombre de grupo cuando no conoces los nombres de antemano. Busca `javascript array slice` y `typescript Record string number count occurrences`.

## Piénsalo bien

1. Predice la salida y explica por qué.

```ts
const numbers = [1, 2, 3, 4]
const big = numbers.filter((n) => n > 2)
big.push(99)

console.log(numbers, big)
```

<details>
<summary>Respuesta</summary>

Imprime `[ 1, 2, 3, 4 ] [ 3, 4, 99 ]`. `filter` crea un array nuevo, así que `big` es una lista separada de `numbers`. Hacer push de 99 en `big` no toca a `numbers`. Si hubieras usado `const big = numbers` y luego hecho push, los dos nombres mostrarían el 99, porque una asignación simple solo agrega un nombre a la misma lista.

</details>

2. La tienda quiere los precios con 20 por ciento de impuesto. El código se ejecuta sin error, pero la respuesta no sirve. Encuentra el bug.

```ts
const prices = [10, 20]
const withTax = prices.map((price) => {
  price * 1.2
})

console.log(withTax)
```

<details>
<summary>Respuesta</summary>

Imprime `[ undefined, undefined ]`. El callback tiene llaves, así que necesita la palabra `return`. Sin ella, el callback calcula `price * 1.2` y tira el resultado. Escribe `(price) => price * 1.2` o agrega `return`. TypeScript puede ayudar: si le das al resultado un tipo como `number[]`, muestra un error, porque el callback no devuelve nada.

</details>

3. Una regla dice: "una lista de reproducción está lista cuando cada canción dura menos de 5 minutos". Llega un requisito nuevo: los usuarios ahora pueden crear listas sin canciones todavía. ¿Qué se rompe?

```ts
const isReady = playlist.every((song) => song.seconds < 300)
```

<details>
<summary>Respuesta</summary>

Una lista vacía da `true`, así que está "lista". Para `every`, ningún elemento rompe la regla. Si el negocio exige al menos una canción para publicar, agrega la regla: `playlist.length > 0 && playlist.every(...)`.

</details>

## Siguiente paso

En la siguiente lección aprenderás a manejar trabajo que toma tiempo, como una página que carga despacio.
