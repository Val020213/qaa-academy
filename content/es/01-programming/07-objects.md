---
title: Objetos
duration: 50 min
---

## Objetivo

En esta lección agrupas valores relacionados en un objeto, guardas muchos objetos en un array y entiendes por qué una función puede cambiar un objeto pero no un número.

- Leer y cambiar una propiedad de un objeto, también en un objeto anidado.
- Guardar muchos objetos en un array y recorrerlos con un bucle.
- Predecir cuándo una función cambia el valor que le diste, y cuándo no.
- Decidir cuándo cambiar un objeto y cuándo crear uno nuevo.

## Por qué necesitamos objetos

Un perro tiene un nombre, una edad y un peso. Podrías usar tres variables separadas:

```ts
const dogName = "Rex"
const dogAge = 3
const dogWeight = 12.5
```

Con diez perros esto se vuelve un desorden. Un **objeto** es un solo valor que guarda varios valores con nombre.

## Crear un objeto

Un objeto se escribe con llaves `{ }`. Adentro escribes pares `name: value`, separados por comas.

```ts
const dog = {
  name: "Rex",
  age: 3,
  weight: 12.5,
}

console.log(dog)
```

Una **propiedad** es un par `name: value` dentro de un objeto. Este objeto tiene tres propiedades: `name`, `age` y `weight`.

El programa imprime:

```text
{ name: 'Rex', age: 3, weight: 12.5 }
```

## Leer una propiedad

Escribe el nombre del objeto, un punto y el nombre de la propiedad.

```ts
const square = { side: 4, color: "red" }

console.log(square.side)
console.log(square.side * square.side)
```

El programa imprime:

```text
4
16
```

La segunda línea es el área del cuadrado: lado por lado. El objeto guarda los datos y el código calcula otros a partir de ellos.

La propiedad `size` no existe en `square`. Si escribes `console.log(square.size)`, TypeScript muestra un subrayado rojo antes de que ejecutes nada. Si lo ignoras y ejecutas el archivo, el programa imprime `undefined` y no se detiene.

![El verificador del Playground marca size; el subrayado desaparece al escribir side.](/clips/01b-object-property.webm)

## Cambiar una propiedad

Puedes asignar un valor nuevo a una propiedad con `=`.

```ts
const dog = { name: "Rex", age: 3 }

dog.age = 4
console.log(dog.age)
```

El programa imprime:

```text
4
```

> **Nota:** La variable es `const`, y aun así cambiaste una propiedad. `const` significa que la variable siempre apunta al mismo objeto. No congela el interior del objeto.

## Un objeto puede guardar cualquier valor

El valor de una propiedad puede ser texto, un número, un *boolean* (verdadero o falso), un array o incluso otro objeto.

```ts
const recipe = {
  name: "Pancakes",
  servings: 4,
  ingredients: ["flour", "milk", "egg"],
  oven: { needed: false, minutes: 0 },
}

console.log(recipe.oven.needed)
console.log(recipe.ingredients.length)
```

El programa imprime:

```text
false
3
```

Lee `recipe.oven.needed` de izquierda a derecha: la receta, luego su horno, luego si hace falta.

## Nombrar una propiedad con una variable

A veces conoces el nombre de la propiedad solo mientras el programa se ejecuta. Los corchetes te dejan usar un valor de texto como nombre.

```ts
const rectangle = { width: 3, height: 5, color: "red" }
const wanted = "height"

console.log(rectangle["width"])
console.log(rectangle[wanted])
```

El programa imprime:

```text
3
5
```

`rectangle.width` y `rectangle["width"]` significan lo mismo. La forma con punto es más fácil de leer. Usa corchetes cuando el nombre está en una variable o no se puede escribir después de un punto.

## Una lista de objetos

Cuando tienes muchos objetos, ponlos dentro de un array.

```ts
const playlist = [
  { title: "Blue", artist: "Mia", seconds: 215 },
  { title: "Rain Dance", artist: "Tomas", seconds: 180 },
  { title: "Sunday", artist: "Mia", seconds: 245 },
]

let totalSeconds = 0

for (const song of playlist) {
  console.log(`${song.title} by ${song.artist}`)
  totalSeconds += song.seconds
}

console.log(`Total: ${totalSeconds} seconds`)
```

El bucle te da un objeto a la vez en la variable `song`. El programa imprime:

```text
Blue by Mia
Rain Dance by Tomas
Sunday by Mia
Total: 640 seconds
```

En esta lista, cada elemento es un objeto con las mismas propiedades. Los arrays también permiten objetos con propiedades distintas.

## Desestructuración

La **desestructuración** lee propiedades de un objeto y guarda sus valores en variables.

```ts
const song = { title: "Blue", artist: "Mia", seconds: 215 }

const { title, seconds } = song

console.log(`${title} lasts ${seconds} seconds`)
```

El programa imprime:

```text
Blue lasts 215 seconds
```

En esta forma, los nombres dentro de `{ }` coinciden con los nombres de las propiedades. También puedes usarla en el parámetro de una función:

```ts
function describe({ title, artist }: { title: string, artist: string }): string {
  return `${title} by ${artist}`
}

console.log(describe({ title: "Blue", artist: "Mia" }))
```

Esto imprime `Blue by Mia`. El texto después de los dos puntos es el tipo del objeto.

## Qué recibe una función

Dos funciones suman un año a una edad. Una recibe un número. La otra recibe un perro, que es un objeto con un nombre y una edad.

```ts
function birthdayAge(age: number): void {
  age = age + 1
}

function birthdayDog(dog: { name: string, age: number }): void {
  dog.age = dog.age + 1
}

let age = 3
const dog = { name: "Rex", age: 3 }

birthdayAge(age)
birthdayDog(dog)

console.log(age, dog.age)
```

El programa imprime `3 4`. La edad del número no cambió, pero la del perro sí.

Los argumentos se pasan por valor. Con un número, el parámetro recibe el valor `3`, y asignarle otro número no cambia la variable original. Con un objeto, se copia una **referencia**, un enlace al mismo objeto. Por eso `dog.age = ...` cambia el perro compartido. Asignar otro objeto al parámetro no cambia la variable original.

Lo mismo pasa con una asignación. Cuando escribes `const same = original`, copias el enlace, no el objeto, y dos nombres apuntan a un solo objeto. En este ejemplo, `{ ...original }` crea un objeto nuevo con las mismas propiedades.

```ts
const original = { id: 1, status: "failed" }
const same = original
same.status = "passed"
console.log(original.status)

const copy = { ...original }
copy.status = "skipped"
console.log(original.status, copy.status)
```

El programa imprime:

```text
passed
passed skipped
```

El primer cambio pasó por `same` y cambió el único objeto compartido. El segundo solo cambió `copy`.

## Devolver un objeto nuevo

Cuando una función necesita "cambiar" un objeto, tiene dos opciones. Puede cambiar el objeto que le diste, como `birthdayDog`. O puede dejar ese objeto en paz y devolver uno nuevo:

```ts
function withBirthday(dog: { name: string, age: number }): { name: string, age: number } {
  return { ...dog, age: dog.age + 1 }
}

const rex = { name: "Rex", age: 3 }
const olderRex = withBirthday(rex)

console.log(rex)
console.log(olderRex)
```

El programa imprime:

```text
{ name: 'Rex', age: 3 }
{ name: 'Rex', age: 4 }
```

En este objeto, `...dog` copia sus propiedades al objeto nuevo. Luego `age: dog.age + 1` reemplaza una de ellas. Es más fácil confiar en una función que devuelve un valor nuevo y no cambia nada más: puedes llamarla dos veces y no pasa nada sorprendente.

## Profundiza

### La copia superficial

En este ejemplo, `{ ...rex }` copia los valores de las propiedades. Si una propiedad guarda otro objeto, se copia el enlace y ese objeto interior sigue compartido.

```ts
const rex = { name: "Rex", owner: { city: "Lima" } }
const copyOfRex = { ...rex }
copyOfRex.owner.city = "Cusco"
console.log(rex.owner.city)
```

Imprime `Cusco`. La copia tiene su propio `name`, pero su `owner` es el mismo objeto. Para copiar también el objeto interior de este ejemplo, usa `structuredClone(rex)`.

![La copia es un objeto nuevo, pero su owner es el mismo objeto que el del original.](/images/shallow-copy.es.svg)

### Comparar objetos con `===`

Dos objetos son iguales con `===` solo cuando son el mismo objeto, no cuando tienen el mismo contenido.

```ts
const a = { id: 1 }
const b = { id: 1 }
console.log(a === b)
console.log(a === a)
console.log(JSON.stringify(a) === JSON.stringify(b))
```

Imprime `false`, `true` y `true`. El verificador al final de cada archivo de ejercicios compara el texto creado por `JSON.stringify`, por esta razón.

## Práctica

1. Crea el archivo `exercises/01-programming/objects-practice.ts`.
2. Escribe un objeto llamado `book` con las propiedades `id` (un número), `title` (texto) y `pages` (un número). Imprime el título con `console.log(book.title)`.
3. Cambia `book.pages` por un número nuevo e imprime el objeto.
4. Haz un array con tres libros. Usa `for...of` para imprimir cada título y sumar todas las páginas.
5. Abre `exercises/01-programming/07-objects.ts`. Reemplaza cada `// TODO` con código.
6. Ejecuta el archivo de ejercicios con este comando:

```bash
node exercises/01-programming/07-objects.ts
```

Haz que cada comprobación diga `OK`.

## Reto

Elige tu propio mundo, por ejemplo un refugio de mascotas o una receta. Haz un objeto con al menos cuatro propiedades. Una propiedad debe ser otro objeto, por ejemplo el dueño de una mascota, con un nombre y una ciudad.

Luego escribe dos funciones. La primera, `describeAll`, imprime cada propiedad como una línea `name: value`. No debe contener el nombre de ninguna propiedad. La segunda, `moveOwner`, recibe tu objeto y una ciudad nueva. Devuelve un objeto nuevo con la ciudad nueva, y no cambia el original.

Crea el archivo `exercises/challenges/objects.ts`. Ejecútalo con `node exercises/challenges/objects.ts`.

Está terminado cuando:

- `describeAll` imprime una línea por cada propiedad, y ningún nombre de propiedad está escrito dentro de la función.
- Cuando agregas una propiedad nueva a tu objeto, aparece una línea nueva y no cambiaste `describeAll`.
- Después de llamar a `moveOwner`, imprimir el original y el resultado muestra dos ciudades distintas.
- `pnpm typecheck` no muestra ningún error para tu archivo.

Vas a necesitar algo que esta lección no enseñó: cómo listar los nombres y los valores de un objeto. Busca `javascript Object.entries`. Para copiar un objeto y todo lo que tiene adentro, usa `structuredClone` de la sección de copia superficial de arriba. Para el tipo de los parámetros, escribe el tipo del objeto en la cabecera de la función como en el ejemplo de `describe`.

## Piénsalo bien

1. La canción está en la lista, pero el programa dice que no. Encuentra el bug.

```ts
const favourite = { title: "Blue", artist: "Mia" }
const songs = [
  { title: "Blue", artist: "Mia" },
  { title: "Echo", artist: "Lena" },
]

console.log(songs.includes(favourite))
```

<details>
<summary>Respuesta</summary>

Imprime `false`. `includes` compara objetos con la misma regla que `===`: pregunta "¿es el mismo objeto?", no "¿tiene el mismo contenido?". El objeto de la lista y `favourite` se ven iguales, pero son dos objetos. Compara las propiedades que te importan, por ejemplo `songs.some((song) => song.title === favourite.title)`.

</details>

2. ¿Qué se rompe si alguien renombra la propiedad `seconds` a `duration` en los datos, pero no en el código que la lee?

```ts
const song = { title: "Blue", duration: 215 }
console.log(`${song.title} lasts ${song.seconds} seconds`)
```

<details>
<summary>Respuesta</summary>

TypeScript muestra un subrayado rojo: la propiedad `seconds` no existe. Si lo ignoras y ejecutas el archivo, imprime `Blue lasts undefined seconds`. Si luego sumas un número a ese `undefined`, el resultado es `NaN`. El cambio de nombre debe hacerse en todos los lugares.

</details>

3. ¿Qué pasa aquí cuando ninguna canción tiene el título "Nope"? ¿Cómo harías el código seguro?

```ts
const songs = [{ title: "Blue", artist: "Mia" }]
const found = songs.find((song) => song.title === "Nope")
const { title } = found
```

<details>
<summary>Respuesta</summary>

El programa se detiene con un `TypeError`: no puede desestructurar la propiedad `title` porque `found` es `undefined`. La función `find` da `undefined` cuando nada coincide. TypeScript también te avisa antes de que ejecutes el archivo. Comprueba primero con `if (found === undefined)`, y decide qué hace el programa cuando falta la canción: detenerse con un mensaje claro, o usar un valor por defecto.

</details>

## Siguiente paso

En la siguiente lección das nombre a las formas de tus propios objetos, para que TypeScript pueda revisarlas por ti.
