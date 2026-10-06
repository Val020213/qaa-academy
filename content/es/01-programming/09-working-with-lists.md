---
title: Trabajar con listas
summary: Usa map, filter, find, some, every, sort y spread para hacerle preguntas a una lista, y aprende qué métodos cambian la lista original.
duration: 70 min
---

## Empieza con un acertijo

Un juego guarda los puntajes de tres jugadores. Los quieres del más bajo al más alto, así que llamas a `sort`. Luego imprimes la lista nueva y la lista vieja.

```ts
const scores = [9, 100, 25];
const sorted = scores.sort();

console.log(sorted);
console.log(scores);
```

¿La primera línea es `[ 9, 25, 100 ]`? ¿La segunda línea sigue siendo `[ 9, 100, 25 ]`, porque hiciste una lista nueva? ¿O está pasando algo más raro? Decide qué imprime cada línea, y por qué.

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Elegir el método de lista correcto para una pregunta: cambiar cada elemento, quedarte con algunos, encontrar uno o responder sí o no.
- Predecir qué métodos cambian la lista original y cuáles la dejan en paz.
- Decir qué devuelve cada método para una lista vacía.
- Leer una cadena de métodos de lista como una oración.

## Los datos

Todos los ejemplos de esta lección usan una lista de reproducción de música. Cópiala al inicio de tu archivo de práctica.

```ts
type Song = {
  title: string;
  artist: string;
  seconds: number;
  liked: boolean;
};

const playlist: Song[] = [
  { title: "Blue", artist: "Mia", seconds: 215, liked: true },
  { title: "Rain Dance", artist: "Tomas", seconds: 180, liked: false },
  { title: "Sunday", artist: "Mia", seconds: 245, liked: true },
  { title: "Echo", artist: "Lena", seconds: 120, liked: false },
];
```

## Funciones callback

Los métodos de esta lección reciben una función como entrada. Esa función se llama **callback**. El método la llama para cada elemento de la lista.

Escribes el callback como una función flecha. La lección «Funciones» mostró las funciones flecha: `(song) => ...`.

## map: cambiar cada elemento

`map` crea un array nuevo. Ejecuta tu callback sobre cada elemento y junta los resultados.

¿Qué esperas de esta línea? ¿Qué tan largo es el array nuevo?

```ts
const titles = playlist.map((song) => song.title);
console.log(titles);
```

El programa imprime:

```text
[ 'Blue', 'Rain Dance', 'Sunday', 'Echo' ]
```

El array nuevo tiene la misma longitud que el viejo. El array viejo no cambia. Cada elemento puede convertirse en algo distinto, por ejemplo un número:

```ts
const minutes = playlist.map((song) => Math.round(song.seconds / 60));
console.log(minutes);
```

Esto imprime:

```text
[ 4, 3, 4, 2 ]
```

> **Cuidado:** Si usas llaves en el callback, debes escribir `return`. Sin él, el callback da `undefined` para cada elemento. `[10, 20].map((p) => { p * 1.2; })` da `[ undefined, undefined ]`. No aparece ningún error. No necesitas llaves para un callback de una línea.

## filter: quedarte con algunos elementos

`filter` crea un array nuevo solo con los elementos para los que tu callback devuelve `true`.

```ts
const liked = playlist.filter((song) => song.liked);
console.log(liked.length);
```

El programa imprime `2`.

Puedes encadenar los dos métodos. Obtén los títulos de las canciones de Mia:

```ts
const miaTitles = playlist
  .filter((song) => song.artist === "Mia")
  .map((song) => song.title);

console.log(miaTitles);
```

El programa imprime:

```text
[ 'Blue', 'Sunday' ]
```

Lee una cadena de arriba abajo como una oración: "de la lista de reproducción, quédate con las canciones de Mia, y luego toma sus títulos". Si puedes decir la cadena en una oración simple, es una buena cadena. El orden importa. ¿Qué pasa si escribes primero `map` y después `filter`? Pruébalo. Después de `map` los elementos son solo títulos, así que `song.artist` ya no existe.

## find: obtener un elemento

`find` devuelve el primer elemento para el que tu callback devuelve `true`. Si nada coincide, devuelve `undefined`.

```ts
const found = playlist.find((song) => song.artist === "Tomas");
console.log(found?.title);

const missing = playlist.find((song) => song.artist === "Zed");
console.log(missing);
```

El programa imprime:

```text
Rain Dance
undefined
```

El tipo del resultado es `Song | undefined`. Debes manejar el caso de `undefined`. El `?.` en `found?.title` significa "lee `title` solo si `found` tiene un valor". Si no, el resultado es `undefined`.

Fíjate en que `find` da solo la primera coincidencia. Hay dos canciones de Mia. `find` para Mia da `Blue` y nunca muestra `Sunday`. Si necesitas todas las coincidencias, necesitas `filter`.

## some y every: sí o no

`some` devuelve `true` si al menos un elemento coincide. `every` devuelve `true` si todos los elementos coinciden.

```ts
const hasLongSong = playlist.some((song) => song.seconds > 240);
const allLiked = playlist.every((song) => song.liked);

console.log(hasLongSong);
console.log(allLiked);
```

El programa imprime:

```text
true
false
```

Ahora el caso límite. ¿Qué dan `some` y `every` para una lista sin canciones? Piénsalo antes de seguir leyendo. Para `some`, no hay ninguna canción que coincida, así que la respuesta es `false`. Para `every`, no hay ninguna canción que rompa la regla, así que la respuesta es `true`.

```ts
const empty: Song[] = [];
console.log(empty.some((song) => song.liked));
console.log(empty.every((song) => song.liked));
```

El programa imprime:

```text
false
true
```

> **Cuidado:** `every` en una lista vacía devuelve `true`. "Todas las canciones le gustan al usuario" es verdad cuando no hay canciones. Ten esto presente cuando una lista pueda estar vacía.

## Spread: copiar una lista

Tres puntos `...` antes de un array significan **spread** (esparcir). Pone todos los elementos del array en un lugar nuevo.

```ts
const extended: Song[] = [
  ...playlist,
  { title: "Moon", artist: "Zed", seconds: 99, liked: false },
];

console.log(playlist.length);
console.log(extended.length);
```

El programa imprime:

```text
4
5
```

La lista original sigue teniendo 4 elementos. Creaste una lista nueva con 5 elementos.

## Ordenar

Ahora vuelve al acertijo del inicio. Una lista de números necesita un callback pequeño que diga cómo comparar dos elementos. El callback recibe dos elementos, `a` y `b`. Devuelve un número negativo si `a` va primero, y un número positivo si `b` va primero.

```ts
const scores = [9, 100, 25];

console.log(scores.toSorted((a, b) => a - b));
console.log(scores);
```

El programa imprime:

```text
[ 9, 25, 100 ]
[ 9, 100, 25 ]
```

`toSorted` crea una lista nueva. La lista vieja queda como estaba.

### De vuelta al acertijo

El programa imprime `[ 100, 25, 9 ]` dos veces. Hay dos sorpresas. Primero, `sort` sin callback ordena los elementos como texto. Como texto, `"100"` va antes de `"25"`, porque el primer carácter `1` es menor que `2`, y `"25"` va antes de `"9"`. Segundo, `sort` cambia la lista original y devuelve esa misma lista. Entonces `sorted` y `scores` son una sola lista con dos nombres, como viste en la lección «Arrays y bucles». La forma segura es `toSorted` con un callback de comparación.

## ¿map o for...of?

Los dos funcionan. Usa esta regla:

- Usa `map`, `filter`, `find`, `some` y `every` cuando quieres un resultado: una lista nueva, un elemento o una respuesta sí/no.
- Usa `for...of` cuando quieres hacer una acción por cada elemento, como imprimir o hacer clic.

En Playwright muchas veces usas `for...of` con `await`. La lección «async y await» muestra por qué.

## Profundiza

### Lo que realmente hace map

No hay magia en `map`. Es un bucle que alguien escribió por ti. Esta función hace el mismo trabajo con un bucle `for...of`:

```ts
function myMap(items: Song[], callback: (song: Song) => number): number[] {
  const result: number[] = [];
  for (const item of items) {
    result.push(callback(item));
  }
  return result;
}

console.log(myMap(playlist, (song) => song.seconds));
```

El texto `(song: Song) => number` es el tipo de un callback. Dice: una función que recibe una canción y devuelve un número. El programa imprime:

```text
[ 215, 180, 245, 120 ]
```

### ¿Qué métodos cambian la lista?

`map`, `filter`, `find`, `some`, `every` y `toSorted` no cambian el original. `sort` y `push` sí. Cuando no estés seguro, búscalo en la documentación del método. Te dice qué devuelve el método y si cambia la lista.

### Cómo aparece en el trabajo real de automatización de QA

Este es el único vínculo con las pruebas en esta lección. Imagina tres intentos de *login* con datos malos. Los pasos son los mismos, solo cambia la entrada. Puedes escribir los datos una vez, como un array de objetos, y recorrerlos con un bucle. Esto es *DRY* ("No te repitas"): un cuerpo de test, muchas entradas. Estudiarás la idea al final de este módulo. Las palabras `async` y `await` del código vienen en la siguiente lección. Léelas como pasos manuales.

```ts
import { expect, test } from "./lib/test";

const badLogins = [
  { name: "empty email", email: "", message: "Enter your email and password." },
  { name: "spaces only", email: "   ", message: "Enter your email and password." },
  { name: "unknown email", email: "ana@example.com", message: "Wrong email or password." },
];

for (const badLogin of badLogins) {
  test(`shows an error for ${badLogin.name}`, async ({ page }) => {
    await page.goto("/#/practice");
    await page.getByTestId("login-email").fill(badLogin.email);
    await page.getByTestId("login-password").fill("Playwright123");
    await page.getByTestId("login-submit").click();

    await expect(page.getByTestId("login-error")).toHaveText(badLogin.message);
  });
}
```

Cada test necesita su propio título, así que el título usa `name`. Si los casos necesitan pasos distintos, escribe tests separados. Un test debe seguir siendo fácil de leer.

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

Haz que cada línea diga `OK`.

## Reto

Elige tu propio mundo: una liga de fútbol, un libro de recetas, un refugio de mascotas, las ciudades de un viaje, un cuestionario con jugadores. Haz una lista de al menos ocho objetos. Cada objeto tiene una propiedad de texto que lo pone en un grupo (un equipo, un país, un tipo de comida) y una propiedad numérica (goles, minutos, precio, puntos).

Escribe una función `report(list)` que imprima dos cosas: los tres elementos con el número más grande, el más alto primero, y cuántos elementos hay en cada grupo. Cuando la lista está vacía, imprime un mensaje claro y no falla.

Crea el archivo `exercises/challenges/working-with-lists.ts`. Ejecútalo con `node exercises/challenges/working-with-lists.ts`.

Está terminado cuando:

- `report` imprime los tres primeros según la propiedad numérica, el más alto primero.
- Después de que `report` se ejecuta, la lista original sigue con el mismo orden de cuando la escribiste. Imprime su primer elemento para comprobarlo tú mismo.
- `report` imprime un conteo por cada grupo, por ejemplo `Reds 3`, y cada grupo aparece una sola vez.
- `report([])` imprime un mensaje claro como `No players`, y ningún error.
- `pnpm typecheck` no muestra ningún error para tu archivo.

Vas a necesitar algo que esta lección no enseñó: cómo tomar solo los primeros elementos de una lista, y cómo llevar un conteo por cada nombre de grupo cuando no conoces los nombres de antemano. Busca `javascript array slice` y `typescript Record string number count occurrences`.

> **Consejo:** Puedes pedirle a un asistente de IA que te explique lo que falta. Luego ejecuta el código tú mismo, cambia una sola cosa a la vez y asegúrate de poder explicar cada línea con tus propias palabras. Nunca pegues código que no puedas explicar.

## Piénsalo bien

1. Predice la salida y explica por qué.

```ts
const numbers = [1, 2, 3, 4];
const big = numbers.filter((n) => n > 2);
big.push(99);

console.log(numbers, big);
```

<details>
<summary>Respuesta</summary>

Imprime `[ 1, 2, 3, 4 ] [ 3, 4, 99 ]`. `filter` crea un array nuevo, así que `big` es una lista separada de `numbers`. Hacer push de 99 en `big` no toca a `numbers`. Si hubieras usado `const big = numbers` y luego hecho push, los dos nombres mostrarían el 99. La diferencia es que `filter` construye una lista nueva, mientras que una asignación simple solo agrega un nombre.

</details>

2. La tienda quiere los precios con 20 por ciento de impuesto. El código se ejecuta sin error, pero la respuesta no sirve. Encuentra el bug.

```ts
const prices = [10, 20];
const withTax = prices.map((price) => {
  price * 1.2;
});

console.log(withTax);
```

<details>
<summary>Respuesta</summary>

Imprime `[ undefined, undefined ]`. El callback tiene llaves, así que necesita la palabra `return`. Sin ella, el callback calcula `price * 1.2` y tira el resultado. Una función sin `return` da `undefined`. Escribe `(price) => price * 1.2` o agrega `return`. TypeScript puede ayudar: si le das al resultado un tipo como `number[]`, muestra un error, porque el callback no devuelve nada.

</details>

3. Dos personas revisan "¿hay alguna canción que le guste al usuario?". ¿Qué versión es mejor, y qué te haría elegir la otra?

```ts
const versionA = playlist.filter((song) => song.liked).length > 0;
const versionB = playlist.some((song) => song.liked);
```

<details>
<summary>Respuesta</summary>

La versión B es mejor aquí. `some` dice exactamente lo que quieres saber: ¿hay al menos una coincidencia? Puede detenerse en la primera coincidencia, y no construye una lista nueva. La versión A funciona, pero construye una lista solo para contarla, y el lector debe pensar qué significa. Elegirías A cuando también necesitas las canciones que le gustan al usuario, o el conteo, para la siguiente línea. Entonces un solo `filter` hace dos trabajos.

</details>

4. Una regla dice: "una lista de reproducción está lista cuando cada canción dura menos de 5 minutos". Llega un requisito nuevo: los usuarios ahora pueden crear listas sin canciones todavía. ¿Qué se rompe?

```ts
const isReady = playlist.every((song) => song.seconds < 300);
```

<details>
<summary>Respuesta</summary>

Una lista vacía da `true`, así que está "lista". Para `every`, ningún elemento rompe la regla, así que la regla se cumple. Probablemente no es lo que quiere el negocio: nadie quiere publicar una lista vacía. Debes agregar una regla: `playlist.length > 0 && playlist.every(...)`. La lección es que una regla escrita para una lista con elementos debe revisarse otra vez para la lista vacía.

</details>

5. Explícale a un compañero qué es un callback, en tres oraciones y sin usar la palabra "función".

<details>
<summary>Respuesta</summary>

Una buena respuesta podría ser: un callback es un pedacito de código que le entregas a otra persona. Ella lo ejecuta cuando lo necesita, por ejemplo una vez por cada elemento de una lista. Tú no lo llamas directamente. Una tarjeta de receta es una buena imagen: le das la tarjeta a un ayudante, y el ayudante la sigue para cada plato. Una respuesta que solo diga "una función dentro de una función" repite la palabra y no explica quién lo ejecuta ni cuándo.

</details>

6. Necesitas los títulos de las tres canciones más largas que le gustan al usuario. ¿Es mejor una cadena larga, o unos pocos pasos con nombre? No hay una única respuesta correcta.

```ts
const result = playlist
  .filter((song) => song.liked)
  .toSorted((a, b) => b.seconds - a.seconds)
  .slice(0, 3)
  .map((song) => song.title);
```

<details>
<summary>Respuesta</summary>

Una cadena se lee como una sola oración y no hay nombres que inventar, así que es buena cuando cada paso es corto y obvio. Los pasos con nombre, como `likedSongs` y `longestThree`, te dan lugares para imprimir y mirar, y son más fáciles de depurar cuando un resultado está mal. Una cadena larga esconde los resultados intermedios. La elección depende de quién lee el código y de cuántas veces esperas depurarlo. Una buena regla: si necesitas un comentario para explicar un paso, dale a ese paso su propio nombre.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué hace `reduce`, y cuándo es más fácil de leer un bucle simple?**
   - Busca: `javascript array reduce explained`
   - Pruébalo: escribe el total de los `seconds` de la lista de reproducción dos veces, una con `reduce` y otra con `for...of`. Dáselas a un amigo y pregúntale cuál entiende primero.
   - Una buena respuesta explica: qué recibe el callback, el papel del valor inicial y un caso donde un bucle `for...of` es más claro.

2. **¿Cómo se lee una página de documentación de un método de array? Elige `flatMap`, `at` o `findLast`.**
   - Busca: `MDN Array flatMap`
   - Pruébalo: recorre la página en este orden: primero la firma de arriba, luego el primer ejemplo, luego la sección sobre casos límite y valores devueltos. Escribe una prueba tuya con un array vacío.
   - Una buena respuesta explica: qué devuelve el método, qué recibe el callback y un caso límite que menciona la página.

3. **¿Por qué funcionan reglas de orden como `a - b`, y qué pasa cuando un callback de comparación no es consistente?**
   - Busca: `javascript sort compare function a - b`
   - Pruébalo: ordena `["b", "a", "C"]` con `sort` por defecto, y luego con `localeCompare`. Después ordena 5 títulos de canciones por longitud con un callback que escribas tú.
   - Una buena respuesta explica: qué significa el signo del número devuelto, por qué las mayúsculas se ordenan primero por defecto y cómo ordenar texto en un orden humano.

## Siguiente paso

En la siguiente lección aprenderás a manejar trabajo que toma tiempo, como una página que carga despacio.
