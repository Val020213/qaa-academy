---
title: Objetos
summary: Agrupa valores relacionados bajo nombres, guarda muchos objetos en una lista, y aprende por qué una función puede cambiar un objeto pero no un número.
duration: 65 min
---

## Empieza con un acertijo

Dos funciones suman un año a una edad. Una recibe un número simple. La otra recibe un perro, que es un objeto con un nombre y una edad. Llamas a las dos.

```ts
function birthdayAge(age: number): void {
  age = age + 1;
}

function birthdayDog(dog: { name: string; age: number }): void {
  dog.age = dog.age + 1;
}

let age = 3;
const dog = { name: "Rex", age: 3 };

birthdayAge(age);
birthdayDog(dog);

console.log(age, dog.age);
```

Las dos funciones hacen la misma aritmética. ¿Las dos edades pasan a ser 4? ¿Cambia solo una? ¿Cuál, y por qué la computadora las trataría distinto?

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Predecir cuándo una función cambia el valor que le diste, y cuándo no.
- Leer, cambiar y agregar una propiedad de un objeto, también en un objeto anidado.
- Guardar muchos objetos en un array y recorrerlos con un bucle.
- Decidir cuándo cambiar un objeto y cuándo crear uno nuevo.

## Por qué necesitamos objetos

Un perro tiene un nombre, una edad y un peso. Estos tres valores van juntos.

Podrías usar tres variables separadas:

```ts
const dogName = "Rex";
const dogAge = 3;
const dogWeight = 12.5;
```

Esto se vuelve un desorden cuando tienes diez perros. Un **objeto** resuelve esto. Un objeto es un solo valor que guarda varios valores con nombre.

## Crear un objeto

Un objeto se escribe con llaves `{ }`. Adentro escribes pares `nombre: valor`, separados por comas.

```ts
const dog = {
  name: "Rex",
  age: 3,
  weight: 12.5,
};

console.log(dog);
```

Una **propiedad** es un par `nombre: valor` dentro de un objeto. Este objeto tiene tres propiedades: `name`, `age` y `weight`.

El programa imprime:

```text
{ name: 'Rex', age: 3, weight: 12.5 }
```

## Leer una propiedad

Escribe el nombre del objeto, un punto y el nombre de la propiedad.

```ts
const square = { side: 4, color: "red" };

console.log(square.side);
console.log(square.side * square.side);
```

El programa imprime:

```text
4
16
```

La segunda línea es el área del cuadrado: lado por lado. El objeto guarda los datos. El código crea datos nuevos a partir de ellos.

¿Qué esperas de `console.log(square.size)`? La propiedad `size` no existe. TypeScript muestra un subrayado rojo antes de que ejecutes nada. Si lo ignoras y ejecutas el archivo, el programa imprime `undefined`. No se detiene. Un error de ortografía en el nombre de una propiedad da "ningún valor", no un error.

## Cambiar una propiedad

Puedes asignar un valor nuevo a una propiedad con `=`.

```ts
const dog = { name: "Rex", age: 3 };

dog.age = 4;
console.log(dog.age);
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
};

console.log(recipe.oven.needed);
console.log(recipe.ingredients.length);
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
const rectangle = { width: 3, height: 5, color: "red" };
const wanted = "height";

console.log(rectangle["width"]);
console.log(rectangle[wanted]);
```

El programa imprime:

```text
3
5
```

`rectangle.width` y `rectangle["width"]` significan lo mismo. La forma con punto es más fácil de leer. Usa la forma con corchetes solo cuando el nombre está en una variable.

## Una lista de objetos

En el trabajo real tienes muchos objetos. Ponlos dentro de un array.

```ts
const playlist = [
  { title: "Blue", artist: "Mia", seconds: 215 },
  { title: "Rain Dance", artist: "Tomas", seconds: 180 },
  { title: "Sunday", artist: "Mia", seconds: 245 },
];

let totalSeconds = 0;

for (const song of playlist) {
  console.log(`${song.title} by ${song.artist}`);
  totalSeconds += song.seconds;
}

console.log(`Total: ${totalSeconds} seconds`);
```

El bucle te da un objeto a la vez en la variable `song`. El programa imprime:

```text
Blue by Mia
Rain Dance by Tomas
Sunday by Mia
Total: 640 seconds
```

Esta forma, un array de objetos, es muy común. Una tabla de una hoja de cálculo es la misma idea: cada fila es un objeto y cada columna es una propiedad. Los datos que llegan de un servidor muchas veces se ven así.

## Desestructuración

La **desestructuración** saca propiedades de un objeto y las pone en variables, en una sola línea.

```ts
const song = { title: "Blue", artist: "Mia", seconds: 215 };

const { title, seconds } = song;

console.log(`${title} lasts ${seconds} seconds`);
```

El programa imprime:

```text
Blue lasts 215 seconds
```

Los nombres dentro de `{ }` deben coincidir con los nombres de las propiedades. Verás esta forma seguido en el código de Playwright, así que aprende a leerla. También puedes usarla en el parámetro de una función:

```ts
function describe({ title, artist }: { title: string; artist: string }): string {
  return `${title} by ${artist}`;
}

console.log(describe({ title: "Blue", artist: "Mia" }));
```

Esto imprime `Blue by Mia`. El texto después de los dos puntos es el tipo del objeto. La lección «Tus propios tipos» muestra una forma más limpia de escribirlo.

## Crea tu propia regla para las funciones

Tienes dos opciones cuando una función necesita "cambiar" un objeto. Puede cambiar el objeto que le diste. O puede dejar ese objeto en paz y devolver uno nuevo. Mira la segunda forma:

```ts
function withBirthday(dog: { name: string; age: number }): { name: string; age: number } {
  return { ...dog, age: dog.age + 1 };
}

const rex = { name: "Rex", age: 3 };
const olderRex = withBirthday(rex);

console.log(rex);
console.log(olderRex);
```

El programa imprime:

```text
{ name: 'Rex', age: 3 }
{ name: 'Rex', age: 4 }
```

Los tres puntos `...dog` ponen todas las propiedades de `dog` en el objeto nuevo. Luego `age: dog.age + 1` reemplaza una de ellas. Es más fácil confiar en una función que devuelve un valor nuevo y no cambia nada más. Puedes llamarla dos veces y no pasa nada sorprendente.

### De vuelta al acertijo

El programa imprime `3 4`. El número se pasa por valor: la función recibe su propia copia de `3`, le suma 1 a la copia, y la copia desaparece. El perro se pasa por enlace: la función recibe un enlace al mismo objeto, así que `dog.age = ...` cambia al único perro al que apuntan los dos nombres. La siguiente sección explica este enlace.

## Profundiza

### Por qué una copia cambia el original

Un objeto vive en la memoria de la computadora. Una variable no guarda el objeto mismo. Guarda un enlace hacia él. Este enlace se llama **referencia**.

Cuando escribes `const same = original;`, copias el enlace. No copias el objeto. Ahora dos nombres apuntan a un solo objeto.

```ts
const original = { id: 1, status: "failed" };
const same = original;
same.status = "passed";
console.log(original.status);

const copy = { ...original };
copy.status = "skipped";
console.log(original.status, copy.status);
```

El programa imprime:

```text
passed
passed skipped
```

El primer cambio pasó por `same` y cambió el único objeto compartido. Los tres puntos de `{ ...original }` crean un objeto nuevo con las mismas propiedades. La lección «Arrays y bucles» muestra la misma idea con los arrays.

Esta copia es superficial: un objeto dentro del objeto sigue compartido. ¿Qué esperas aquí?

```ts
const rex = { name: "Rex", owner: { city: "Lima" } };
const copyOfRex = { ...rex };
copyOfRex.owner.city = "Cusco";
console.log(rex.owner.city);
```

Imprime `Cusco`. La copia tiene su propio `name`, pero su `owner` es el mismo enlace. Para copiar también todo lo de adentro, usa `structuredClone(rex)`.

La misma regla explica por qué `===` no compara el contenido:

```ts
const a = { id: 1 };
const b = { id: 1 };
console.log(a === b);
console.log(a === a);
console.log(JSON.stringify(a) === JSON.stringify(b));
```

Imprime `false`, `true` y `true`. Dos objetos son iguales con `===` solo cuando son el mismo objeto. El verificador al final de cada archivo de ejercicios compara el texto creado por `JSON.stringify`, por esta razón.

### Cómo aparece en el trabajo de automatización de QA

Este es el único vínculo con las pruebas en esta lección. Los datos de prueba muchas veces son un objeto. Lo escribes una vez y cada test lo lee. Esta idea tiene un nombre: *DRY*, "No te repitas" (*Don't Repeat Yourself*). La estudiarás al final de este módulo.

Este archivo de test vive en la carpeta `e2e`. Las palabras `async` y `await` vienen después, en la lección «async y await». Lee las líneas como pasos manuales.

```ts
import { expect, test } from "./lib/test";

const validUser = { email: "qa@example.com", password: "Playwright123" };

test("accepts the test credentials", async ({ page }) => {
  await page.goto("/#/practice");
  await page.getByTestId("login-email").fill(validUser.email);
  await page.getByTestId("login-password").fill(validUser.password);
  await page.getByTestId("login-submit").click();

  await expect(page.getByTestId("login-welcome")).toContainText(validUser.email);
});
```

Si la contraseña cambia, cambias una sola línea. Un test debe seguir leyéndose como una historia clara, así que mantén el objeto de datos pequeño y bien nombrado.

## Práctica

1. Crea el archivo `exercises/01-programming/objects-practice.ts`.
2. Escribe un objeto llamado `book` con las propiedades `id` (un número), `title` (texto) y `pages` (un número).
3. Imprime el título con `console.log(book.title)`.
4. Cambia `book.pages` por un número nuevo e imprime el objeto.
5. Haz un array con tres libros. Usa `for...of` para imprimir cada título y sumar todas las páginas.
6. Abre `exercises/01-programming/07-objects.ts`. Reemplaza cada `// TODO` con código.
7. Ejecuta el archivo de ejercicios con este comando:

```bash
node exercises/01-programming/07-objects.ts
```

Haz que cada línea diga `OK`.

## Reto

Elige tu propio mundo: un refugio de mascotas, un libro de biblioteca, un jugador de fútbol, una receta, un vuelo. Haz un objeto con al menos cuatro propiedades. Una propiedad debe ser otro objeto, por ejemplo el dueño de una mascota, con un nombre y una ciudad.

Luego escribe dos funciones. La primera, `describeAll`, imprime cada propiedad como una línea `name: value`. No debe contener el nombre de ninguna propiedad. La segunda, `moveOwner`, recibe tu objeto y una ciudad nueva. Devuelve un objeto nuevo con la ciudad nueva, y no cambia el original.

Crea el archivo `exercises/challenges/objects.ts`. Ejecútalo con `node exercises/challenges/objects.ts`.

Está terminado cuando:

- `describeAll` imprime una línea por cada propiedad, y ningún nombre de propiedad está escrito dentro de la función.
- Cuando agregas una propiedad nueva a tu objeto, aparece una línea nueva y no cambiaste `describeAll`.
- Después de llamar a `moveOwner`, imprimir el original y el resultado muestra dos ciudades distintas.
- `pnpm typecheck` no muestra ningún error para tu archivo.

Vas a necesitar algo que esta lección no enseñó: cómo listar los nombres y los valores de un objeto. Busca `javascript Object.entries`. Para copiar un objeto y todo lo que tiene adentro, usa `structuredClone` de la sección de copia profunda de arriba. Para el tipo de los parámetros, escribe el tipo del objeto en la cabecera de la función como en el ejemplo de `describe`.

## Piénsalo bien

1. Predice la salida y explica por qué.

```ts
const rex = { name: "Rex", owner: { city: "Lima" } };
const copyOfRex = { ...rex };
copyOfRex.owner.city = "Cusco";
console.log(rex.owner.city);
```

<details>
<summary>Respuesta</summary>

Imprime `Cusco`. El *spread* `{ ...rex }` crea un objeto superior nuevo, pero cada propiedad se copia tal como es. La propiedad `owner` guarda un enlace, y se copia el enlace, no el objeto al que apunta. Entonces `rex.owner` y `copyOfRex.owner` son el mismo objeto. Esto es una copia superficial. `structuredClone` hace una copia profunda.

</details>

2. La canción está en la lista, pero el programa dice que no. Encuentra el bug.

```ts
const favourite = { title: "Blue", artist: "Mia" };
const songs = [
  { title: "Blue", artist: "Mia" },
  { title: "Echo", artist: "Lena" },
];

console.log(songs.includes(favourite));
```

<details>
<summary>Respuesta</summary>

Imprime `false`. `includes` compara objetos con la misma regla que `===`: pregunta "¿es el mismo objeto?", no "¿tiene el mismo contenido?". El objeto de la lista y `favourite` se ven iguales, pero son dos objetos. Compara las propiedades que te importan, por ejemplo `songs.some((song) => song.title === favourite.title)`. La lección «Trabajar con listas» enseña `some`.

</details>

3. Dos versiones de una función de cumpleaños funcionan. ¿Cuál es mejor aquí, y qué te haría elegir la otra?

```ts
function birthdayA(dog: { age: number }): void {
  dog.age = dog.age + 1;
}

function birthdayB(dog: { name: string; age: number }): { name: string; age: number } {
  return { ...dog, age: dog.age + 1 };
}
```

<details>
<summary>Respuesta</summary>

La versión B es mejor cuando varias partes del programa usan el mismo perro. No cambia el perro a tus espaldas, así que puedes guardar el valor viejo y comparar. La versión A es más corta, y está bien cuando el perro es privado de una función y quieres ahorrar el trabajo de crear un objeto nuevo. También elegirías A para un objeto enorme que cambia miles de veces por segundo. Para programas normales, prefiere B. Es más fácil de razonar.

</details>

4. ¿Qué se rompe si alguien renombra la propiedad `seconds` a `duration` en los datos, pero no en el código que la lee?

```ts
const song = { title: "Blue", duration: 215 };
console.log(`${song.title} lasts ${song.seconds} seconds`);
```

<details>
<summary>Respuesta</summary>

TypeScript muestra un subrayado rojo: la propiedad `seconds` no existe. Si lo ignoras y ejecutas el archivo, imprime `Blue lasts undefined seconds`. Si luego el código usara el valor en una suma, el resultado sería `NaN`. El cambio de nombre debe hacerse en todos los lugares. Por eso ayuda un tipo que escribe los nombres una sola vez. La lección «Tus propios tipos» muestra cómo.

</details>

5. Explícale a un compañero, en tres oraciones y sin usar la palabra "copia", por qué una función puede cambiar un objeto que le pasas, pero no puede cambiar un número.

<details>
<summary>Respuesta</summary>

Una buena respuesta podría ser: un número se guarda directamente en la variable, así que la función recibe su propio número y cambia solo ese. Un objeto se guarda en algún lugar de la memoria, y la variable guarda un enlace a ese lugar. La función recibe el mismo enlace, así que trabaja sobre el mismo objeto que ves afuera. Una mala respuesta dice "los objetos se pasan distinto" y no da ninguna razón. La razón es lo que guarda la variable: el valor mismo, o un enlace.

</details>

6. ¿Qué pasa aquí cuando ninguna canción tiene el título "Nope"? ¿Cómo harías el código seguro?

```ts
const songs = [{ title: "Blue", artist: "Mia" }];
const found = songs.find((song) => song.title === "Nope");
const { title } = found;
```

<details>
<summary>Respuesta</summary>

El programa se detiene con un `TypeError`: no puede desestructurar la propiedad `title` porque `found` es `undefined`. La función `find` da `undefined` cuando nada coincide. TypeScript también te avisa antes de que ejecutes el archivo. Comprueba primero con `if (found === undefined)`, y decide qué hace el programa cuando falta la canción: detenerse con un mensaje claro, o usar un valor por defecto. Un caso límite como "no se encontró nada" debe tener una respuesta planeada.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Cuál es la diferencia entre una copia superficial y una copia profunda de un objeto?**
   - Busca: `javascript shallow copy vs deep copy`
   - Pruébalo: haz un objeto con un array adentro, por ejemplo `{ name: "Rex", toys: ["ball"] }`. Cópialo con `{ ...x }`, haz push de un juguete en la copia e imprime el original. Luego hazlo otra vez con `structuredClone`.
   - Una buena respuesta explica: qué se copia y qué sigue compartido en cada caso, y un ejemplo donde una copia superficial causa una sorpresa.

2. **¿Qué es JSON, y cómo cambian `JSON.parse` y `JSON.stringify` entre texto y objetos?**
   - Busca: `MDN JSON.parse JSON.stringify`
   - Pruébalo: convierte tu objeto perro en texto con `JSON.stringify`, imprímelo y conviértelo de vuelta con `JSON.parse`. Luego llama a `JSON.parse` con el texto `{name: "Rex"}` y lee el error.
   - Una buena respuesta explica: cómo se ve el texto JSON, qué hace cada función y qué pasa cuando el texto no es un JSON válido.

3. **¿Qué hace `Object.freeze`, y detiene un cambio en lo profundo de un objeto?**
   - Busca: `javascript Object.freeze shallow`
   - Pruébalo: congela el objeto `recipe` de esta lección. Intenta cambiar `recipe.name` y `recipe.oven.needed`. Imprime los dos después de cada intento.
   - Una buena respuesta explica: qué rechaza un objeto congelado, por qué el objeto anidado todavía puede cambiar y una razón para congelar datos.

## Siguiente paso

En la siguiente lección das nombre a las formas de tus propios objetos, para que TypeScript pueda revisarlas por ti.
