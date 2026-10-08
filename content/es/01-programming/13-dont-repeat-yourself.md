---
title: No te repitas (DRY)
duration: 50 min
---

## Objetivo

En esta lección aprendes a escribir cada regla, valor y formato en un solo lugar, y a reconocer cuándo un poco de repetición es mejor que un atajo.

- Predecir qué líneas de un programa se rompen cuando cambia una regla.
- Darle un solo hogar a una regla, un valor o un formato con una constante, una función, un parámetro o un bucle sobre datos.
- Explicar por qué dos trozos de código que se ven iguales pueden necesitar quedar separados.
- Elegir entre un poco de repetición y un atajo difícil de leer.

## Una regla copiada en tres lugares

Un profesor dice: "La nota mínima para aprobar era 50. Desde hoy es 60". Tres funciones usan la nota mínima, y cada una tiene su propia copia del número. El programador cambia el número en dos y olvida la tercera.

```ts
function hasPassed(score: number): boolean {
  return score >= 60
}

function describeStudent(name: string, score: number): string {
  return score >= 60 ? `${name} passed` : `${name} failed`
}

function countPassed(scores: number[]): number {
  let count = 0
  for (const score of scores) {
    if (score >= 50) {
      count += 1
    }
  }
  return count
}
```

Mia tiene 55 puntos y otra estudiante tiene 40. `hasPassed(55)` da `false` y `describeStudent("Mia", 55)` da `Mia failed`, pero `countPassed([55, 40])` da `1`, aunque con la nueva regla nadie aprobó. No aparece ningún error: el programa corre y solo el resultado está mal. La copia olvidada del `50` es el bug.

## Un solo hogar para cada regla

**DRY** significa "Don't Repeat Yourself" (no te repitas). Cada pieza de conocimiento tiene un solo hogar en el programa, y cuando cambia, la cambias una sola vez.

La palabra clave es **conocimiento**: una regla, un valor o un formato. DRY no trata de texto que se parece, como verás más abajo.

Para arreglar el ejemplo, dale nombre al número una sola vez y deja que una función sea dueña de la regla. Las otras funciones le preguntan a esa función.

```ts
const PASS_MARK = 60

function hasPassed(score: number): boolean {
  return score >= PASS_MARK
}

function describeStudent(name: string, score: number): string {
  return hasPassed(score) ? `${name} passed` : `${name} failed`
}

function countPassed(scores: number[]): number {
  let count = 0
  for (const score of scores) {
    if (hasPassed(score)) {
      count += 1
    }
  }
  return count
}

console.log(hasPassed(55))
console.log(describeStudent("Mia", 55))
console.log(`Passed: ${countPassed([55, 40])}`)
```

Esto imprime:

```text
false
Mia failed
Passed: 0
```

La próxima vez que cambie la nota mínima, editas una línea. Ese es todo el beneficio de DRY.

## Las herramientas que ya tienes

Ya conoces varias formas de darle un hogar al conocimiento. Cada una sirve para un tipo distinto de repetición.

- **Una constante** para un valor repetido, como `PASS_MARK` arriba.
- **Una función** para pasos repetidos, como `hasPassed`.
- **Un parámetro** para los mismos pasos con una diferencia.
- **Un array de datos y un bucle** para la misma comprobación sobre muchas entradas.
- **Un alias de tipo** para una forma de objeto repetida (lección 08).
- **Un módulo** para código usado por varios archivos (lección 11).

### Un parámetro

Una app de música imprime la línea de una canción en muchos lugares. El formato es el conocimiento. El título y la duración son las diferencias.

```ts
function songLine(title: string, minutes: number): string {
  return `${title} (${minutes} min)`
}

console.log(songLine("Yellow", 4))
```

Esto imprime `Yellow (4 min)`. Si más adelante la app muestra `4:00` en su lugar, cambias una sola función.

### Un bucle sobre datos

Construyes el formulario de registro de un refugio de mascotas. Tres campos no deben estar vacíos. En esta versión, cada campo tiene su propio bloque `if`.

```ts
const pet = { name: "Rex", species: "", age: "" }
const errors: string[] = []

if (pet.name === "") {
  errors.push("Name is required")
}
if (pet.species === "") {
  errors.push("Species is required")
}
if (pet.age === "") {
  errors.push("Age is required")
}

console.log(errors)
```

Si el refugio agrega un cuarto campo obligatorio, `color`, tienes que escribir otro bloque completo. En la versión siguiente los campos son datos:

```ts
const pet: Record<string, string> = { name: "Rex", species: "", age: "" }
const errors: string[] = []

const required = [
  { field: "name", label: "Name" },
  { field: "species", label: "Species" },
  { field: "age", label: "Age" },
]

for (const item of required) {
  if (pet[item.field] === "") {
    errors.push(`${item.label} is required`)
  }
}

console.log(errors)
```

Las dos versiones imprimen el mismo resultado:

```text
[ 'Species is required', 'Age is required' ]
```

Para un campo obligatorio nuevo, agregas su valor a `pet` y un objeto al array. El bucle no cambia.

## Cuándo la repetición es la mejor opción

Un trozo de código compartido ata a quienes lo usan: todos usan la misma implementación. Por eso la pregunta no es si dos trozos se ven iguales, sino si cambian por la misma razón.

### Mismo texto, distinto conocimiento

Una pizza puede tener como máximo 10 ingredientes. El título de una lista de reproducción puede tener como máximo 10 caracteres. Las dos reglas dicen `10`, y es tentador usar una sola constante:

```ts
const LIMIT = 10
```

Supón que la pizzería permite 12 ingredientes el mes que viene. Con un solo `LIMIT`, los títulos de las listas también crecen a 12 caracteres, y nadie lo pidió. Dos reglas necesitan dos nombres: `MAX_TOPPINGS` y `MAX_TITLE_LENGTH`. El número es el mismo por casualidad. El conocimiento no.

### Distinto texto, mismo conocimiento

Ahora lo contrario. Una función calcula el área de un círculo con `3.14 * radius * radius`. Otra calcula su longitud con `2 * 3.1416 * radius`.

```ts
function circleArea(radius: number): number {
  return 3.14 * radius * radius
}

function circleLength(radius: number): number {
  return 2 * 3.1416 * radius
}

console.log(circleArea(10))
console.log(circleLength(10))
```

Imprime `314` y `62.832`. Las dos funciones guardan un solo hecho, el valor de pi, pero guardan dos aproximaciones distintas. El texto no coincide, así que una búsqueda del número completo `3.1416` se saltaría la primera. Usa `Math.PI` en las dos. Entonces `circleArea(10)` da `314.1592653589793`, y las dos funciones concuerdan.

Lo mismo pasa con un carrito que escribe `total * 1.2` y una factura que escribe `price + price / 5`: las dos guardan el mismo hecho, que el impuesto es 20 por ciento. Antes de unir código, pregunta si todos esos lugares deben cambiar juntos cuando la regla cambie. Si la respuesta es sí, necesitan un hogar. Si es no, déjalos separados.

### La regla de tres

La **regla de tres** es una guía: la primera vez escribes el código; la segunda puedes copiarlo; la tercera revisas si las copias representan la misma regla antes de unirlas. Con dos copias muchas veces todavía no sabes cuál es la diferencia real.

### Un atajo que hace daño

Esta función atiende todos los casos con banderas:

```ts
function formatSong(
  title: string,
  minutes: number,
  upper: boolean,
  brackets: boolean,
  star: boolean,
): string {
  let text = upper ? title.toUpperCase() : title
  if (brackets) {
    text = `[${text}]`
  }
  if (star) {
    text = `* ${text}`
  }
  return `${text} (${minutes} min)`
}

console.log(formatSong("Yellow", 4, true, false, true))
```

Imprime `* YELLOW (4 min)`. Pero en la llamada no se entiende qué significan `true, false, true`: tienes que abrir la función para saberlo, y cada nueva necesidad agrega una bandera. Dos funciones pequeñas con nombres claros son más fáciles de leer y de cambiar.

Este es el contrapeso de DRY: **KISS** (*keep it simple*, mantenlo simple) y **YAGNI** (*you aren't gonna need it*, no lo vas a necesitar: no construyas para necesidades que solo imaginas). Una bandera que agregas "por si alguien la necesita" rompe YAGNI. Un atajo equivocado cuesta más que un poco de repetición.

## Práctica

1. Abre `exercises/01-programming/13-dont-repeat-yourself.ts`. Completa las funciones y la constante marcadas con `// TODO`, reemplazando sus valores provisionales. Escribe cada regla una sola vez.
2. Ejecuta el archivo del ejercicio con este comando:

```bash
node exercises/01-programming/13-dont-repeat-yourself.ts
```

Haz que cada comprobación diga `OK`. Las comprobaciones solo ven el resultado, así que revisa tú mismo que cada regla tenga un solo hogar.

## Reto

Elige tu propio mundo, por ejemplo una panadería o una liga de fútbol, y escribe un programa pequeño con tres reglas que aparezcan cada una en al menos tres lugares. Primero escribe la versión repetida y guarda su salida. Luego quita la repetición sin cambiar la salida. Después cambia una regla y mira cómo todo el programa la sigue.

Crea el archivo `exercises/challenges/13-dont-repeat-yourself.ts`. No se da ninguna solución.

Está terminado cuando:

- El archivo corre con `node exercises/challenges/13-dont-repeat-yourself.ts` e imprime al menos tres líneas.
- Cada una de las tres reglas está escrita una sola vez; al cambiarla, todas las partes que la usan siguen el nuevo valor.
- Una de tus reglas es una tabla de precios o de nombres, y usas un bucle sobre ella.
- Un lugar de tu código queda repetido a propósito, y un comentario de una frase dice por qué.

Vas a necesitar algo que esta lección no enseñó: cómo recorrer con un bucle una tabla de nombres y valores. Busca: `typescript Object.entries loop` y `typescript Record string number`.

## Piénsalo bien

1. Un programa de zoológico tiene `const TICKET_AGE_LIMIT = 12` para las entradas de niños. Una segunda función dice `age < 12` para dar un paseo gratis en el trenecito. El zoológico cambia las entradas de niños a la edad de 14. La regla del paseo gratis debe seguir en 12. ¿Qué haces con los dos números y por qué?

<details><summary>Respuesta</summary>

Las dos reglas se ven iguales pero cambian por razones distintas, así que son conocimiento distinto. Dale al tren su propia constante, por ejemplo `FREE_TRAIN_AGE`. Si reutilizaras `TICKET_AGE_LIMIT`, el cambio a 14 cambiaría también la regla del tren sin avisar.

</details>

2. Un compañero propone usar `TAX_RATE` también en `tip`, porque los dos valores son `0.2`. ¿Qué revisarías antes de cambiarlo?

```ts
const TAX_RATE = 0.2

function priceWithTax(price: number): number {
  return price * (1 + TAX_RATE)
}

function tip(price: number): number {
  return price * 0.2
}
```

<details><summary>Respuesta</summary>

El `0.2` de `tip` tiene el mismo texto pero puede ser una regla distinta. Si la propina es un 20 por ciento fijo que no tiene nada que ver con el impuesto, usar `TAX_RATE` ahí sería un bug esperando al próximo cambio de impuesto. Pregunta: si el impuesto pasa a 0.25, ¿la propina también debe cambiar? Si no, la propina necesita su propia constante, `TIP_RATE`. La constante del impuesto es correcta. El código no demuestra que ambas tasas deban cambiar juntas. Nombrar la tasa de propina aclara que es una regla independiente.

</details>

3. El refugio cambia la etiqueta de "Age" a "Age in years" y agrega `color` como campo opcional. En la versión con bucle, ¿qué cambias?

<details><summary>Respuesta</summary>

Editas la etiqueta del objeto de `age` en el array `required`. Agregas `color` a `pet`, pero no a `required`, porque es opcional. El bucle no cambia.

</details>

## Siguiente paso

Terminaste los fundamentos de programación. En el módulo 2 aprendes Git y cómo funciona la web, para que puedas leer y compartir proyectos reales.
