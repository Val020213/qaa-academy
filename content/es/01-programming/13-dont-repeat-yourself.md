---
title: No te repitas (DRY)
summary: Dale a cada regla, valor y formato un solo hogar, y aprende cuándo un poco de repetición es mejor que un atajo.
duration: 60 min
---

## Empieza con un acertijo

Un profesor dice: "La nota mínima para aprobar era 50. Desde hoy es 60". Un programador cambia el número en el programa. Tres funciones usan la nota mínima, y cada una tiene su propia copia del número.

```ts
function hasPassed(score: number): boolean {
  return score >= 60;
}

function describeStudent(name: string, score: number): string {
  return score >= 60 ? `${name} passed` : `${name} failed`;
}

function countPassed(scores: number[]): number {
  let count = 0;
  for (const score of scores) {
    if (score >= 50) {
      count += 1;
    }
  }
  return count;
}
```

Mia tiene 55 puntos. Otra estudiante tiene 40. ¿Qué dan `hasPassed(55)`, `describeStudent("Mia", 55)` y `countPassed([55, 40])`? ¿Es correcta la respuesta de la última llamada para la nueva regla?

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Predecir qué líneas de un programa se rompen cuando cambia una regla.
- Decidir cuándo darle un solo hogar a una regla, un valor o un formato.
- Explicar por qué dos trozos de código que se ven iguales pueden necesitar quedar separados.
- Elegir entre un poco de repetición y un atajo difícil de leer.

## La idea

**DRY** significa "Don't Repeat Yourself" (no te repitas). Cada pieza de conocimiento tiene un solo hogar en el programa. Cuando cambia, lo cambias una sola vez.

La palabra clave es **conocimiento**: una regla, un valor o un formato. DRY no trata de texto que se parece. Lo verás pronto.

### De vuelta al acertijo

Las dos primeras llamadas dan `false` y `Mia failed`. La tercera da `1`, pero con la nueva regla nadie aprobó. No aparece ningún error. La copia olvidada del `50` es el *bug*.

Ahora la solución. Dale nombre al número una sola vez y deja que una función sea dueña de la regla. Las otras funciones le preguntan a esa función.

```ts
const PASS_MARK = 60;

function hasPassed(score: number): boolean {
  return score >= PASS_MARK;
}

function describeStudent(name: string, score: number): string {
  return hasPassed(score) ? `${name} passed` : `${name} failed`;
}

function countPassed(scores: number[]): number {
  let count = 0;
  for (const score of scores) {
    if (hasPassed(score)) {
      count += 1;
    }
  }
  return count;
}

console.log(hasPassed(55));
console.log(describeStudent("Mia", 55));
console.log(`Passed: ${countPassed([55, 40])}`);
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
  return `${title} (${minutes} min)`;
}

console.log(songLine("Yellow", 4));
```

Esto imprime `Yellow (4 min)`. Si más adelante la app muestra `4:00` en su lugar, cambias una sola función.

### Un bucle sobre datos

Construyes el formulario de registro de un refugio de mascotas. Tres campos no deben estar vacíos. Mira primero esta versión.

```ts
const pet = { name: "Rex", species: "", age: "" };
const errors: string[] = [];

if (pet.name === "") {
  errors.push("Name is required");
}
if (pet.species === "") {
  errors.push("Species is required");
}
if (pet.age === "") {
  errors.push("Age is required");
}

console.log(errors);
```

Antes de seguir: el refugio agrega un cuarto campo, `color`. ¿Cuántas líneas debes cambiar? Ahora mira la versión donde los campos son datos.

```ts
const pet: Record<string, string> = { name: "Rex", species: "", age: "" };
const errors: string[] = [];

const required = [
  { field: "name", label: "Name" },
  { field: "species", label: "Species" },
  { field: "age", label: "Age" },
];

for (const item of required) {
  if (pet[item.field] === "") {
    errors.push(`${item.label} is required`);
  }
}

console.log(errors);
```

Las dos versiones imprimen el mismo resultado:

```text
[ 'Species is required', 'Age is required' ]
```

Para un campo nuevo, agregas un objeto al array. El bucle no cambia.

## Cuándo la repetición es la mejor opción

Un trozo de código compartido ata a quienes lo usan. Cuando lo cambias, cambian todos. Por eso la pregunta nunca es "¿esto se ve igual?". La pregunta es "¿esto cambia por la misma razón?".

### Mismo texto, distinto conocimiento

Una pizza puede tener como máximo 10 ingredientes. El título de una lista de reproducción puede tener como máximo 10 caracteres. Las dos reglas dicen `10`. ¿Usarías una sola constante?

```ts
const LIMIT = 10;
```

Supón que la pizzería permite 12 ingredientes el mes que viene. Con un solo `LIMIT`, los títulos de las listas también crecen a 12 caracteres, y nadie lo pidió. Dos reglas necesitan dos nombres: `MAX_TOPPINGS` y `MAX_TITLE_LENGTH`. El número es el mismo por casualidad. El conocimiento no.

### Distinto texto, mismo conocimiento

Ahora lo contrario. Una función calcula el área de un círculo con `3.14 * radius * radius`. Otra calcula su longitud con `2 * 3.1416 * radius`. ¿Qué esperas para un radio de 10?

```ts
function circleArea(radius: number): number {
  return 3.14 * radius * radius;
}

function circleLength(radius: number): number {
  return 2 * 3.1416 * radius;
}

console.log(circleArea(10));
console.log(circleLength(10));
```

Imprime `314` y `62.832`. Las dos funciones guardan un solo hecho, el valor de pi, pero guardan dos aproximaciones distintas. El texto no coincide, así que una búsqueda del número completo `3.1416` se saltaría la primera. Usa `Math.PI` en las dos. Entonces `circleArea(10)` da `314.1592653589793`, y las dos funciones concuerdan.

### La regla de tres

¿Cuándo quitas la repetición? Usa la **regla de tres**. La primera vez, escribe el código. La segunda vez, puedes copiarlo. La tercera vez, ves el patrón y quitas la repetición. Con dos copias muchas veces todavía no sabes cuál es la diferencia real.

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
  let text = upper ? title.toUpperCase() : title;
  if (brackets) {
    text = `[${text}]`;
  }
  if (star) {
    text = `* ${text}`;
  }
  return `${text} (${minutes} min)`;
}

console.log(formatSong("Yellow", 4, true, false, true));
```

Imprime `* YELLOW (4 min)`. Pero ¿qué significan `true, false, true`? Tienes que abrir la función para saberlo. Cada nueva necesidad agrega una bandera. Dos funciones pequeñas con nombres claros son más fáciles de leer y de cambiar.

Este es el contrapeso de DRY: **KISS** (*keep it simple*, mantenlo simple) y **YAGNI** (*you aren't gonna need it*, no lo vas a necesitar: no construyas para necesidades que solo imaginas). Una bandera que agregas "por si alguien la necesita" rompe YAGNI. Un atajo equivocado cuesta más que un poco de repetición.

## Profundiza

### Distinto texto, mismo conocimiento

La repetición no siempre es el mismo texto. Un carrito escribe `total * 1.2`. Una factura escribe `price + price / 5`. Las dos guardan un hecho: el impuesto es 20 por ciento. Si el impuesto cambia, alguien debe encontrar las dos. DRY pide un solo `TAX_RATE`. Pregúntate: si esta regla cambia, ¿todos estos lugares deben cambiar juntos? Si la respuesta es sí, necesitan un hogar. Si es no, déjalos separados. Esta es la pregunta que debes hacer antes de cada refactorización.

### Cómo se ve en la automatización de tests

En la automatización de *tests*, la misma idea se convierte en *helpers*, *fixtures* y *page objects*. El módulo 4 tiene una lección completa sobre esto. Ya puedes verla en este proyecto. El archivo `playwright.config.ts` guarda `baseURL` una sola vez, así que los *tests* escriben `page.goto("/#/practice")` y no la dirección completa. El archivo *spec* `e2e/playground.spec.ts` también guarda en un solo lugar el primer paso de cada *test*. Un *hook* llamado `beforeEach` se ejecuta antes de cada *test*. El módulo 3 explica los *hooks*.

```ts
test.beforeEach(async ({ page }) => {
  await page.goto("/#/practice");
});
```

### El límite para los tests

Los *tests* tienen una regla especial: un *test* debe ser fácil de leer, como una historia. Un *test* con un poco de repetición que entiendes en diez segundos es mejor que un *test* que esconde sus pasos detrás de tres capas de *helpers*. Quita la repetición que es ruido, como la dirección y la preparación. Conserva los pasos que muestran qué comprueba el *test*. Un *test* que esconde su historia es más difícil de arreglar cuando falla.

## Práctica

1. Abre `exercises/01-programming/13-dont-repeat-yourself.ts`. Reemplaza cada `// TODO` con código. Escribe cada regla una sola vez.
2. Ejecuta el archivo del ejercicio con este comando:

```bash
node exercises/01-programming/13-dont-repeat-yourself.ts
```

Haz que cada línea diga `OK`. Las comprobaciones solo ven el resultado, así que revisa tú mismo que cada regla tenga un solo hogar.

## Reto

Elige tu propio mundo: una panadería, una liga de fútbol, un zoológico, una biblioteca, una empresa de autobuses. Escribe un programa pequeño con tres reglas que aparezcan cada una en al menos tres lugares. Por ejemplo, una panadería tiene un límite de envío gratis, una tarifa de envío y una lista de precios, y tres funciones los usan. Primero escribe la versión repetida y guarda su salida. Luego quita la repetición sin cambiar la salida. Después cambia una regla y mira cómo todo el programa la sigue.

Crea el archivo `exercises/challenges/13-dont-repeat-yourself.ts`. No se da ninguna solución.

Está terminado cuando:

- El archivo corre con `node exercises/challenges/13-dont-repeat-yourself.ts` e imprime al menos tres líneas.
- Cada una de las tres reglas está escrita una sola vez. Una búsqueda de su número o texto encuentra un solo lugar.
- Cambias una regla, ejecutas el archivo otra vez, y cambia cada línea que usa esa regla.
- Una de tus reglas es una tabla de precios o de nombres, y usas un bucle sobre ella.
- Un lugar de tu código queda repetido a propósito, y un comentario de una frase dice por qué.

Vas a necesitar algo que esta lección no enseñó: cómo recorrer con un bucle una tabla de nombres y valores. Busca: `typescript Object.entries loop` y `typescript Record string number`.

## Piénsalo bien

1. Un programa de zoológico tiene `const TICKET_AGE_LIMIT = 12` para las entradas de niños. Una segunda función dice `age < 12` para dar un paseo gratis en el trenecito. El zoológico cambia las entradas de niños a la edad de 14. La regla del paseo gratis debe seguir en 12. ¿Qué haces con los dos números y por qué?

<details><summary>Respuesta</summary>

Las dos reglas se ven iguales pero cambian por razones distintas. La regla de la entrada y la regla del tren son conocimiento distinto. Dale al tren su propia constante, por ejemplo `FREE_TRAIN_AGE`. Si reutilizaras `TICKET_AGE_LIMIT`, el cambio a 14 cambiaría también la regla del tren sin avisar. Un nombre compartido dice "estas cosas siempre cambian juntas", así que úsalo solo cuando eso sea cierto.

</details>

2. Encuentra el *bug*. El código corre e imprime una línea, pero una regla sigue copiada.

```ts
const TAX_RATE = 0.2;

function priceWithTax(price: number): number {
  return price * (1 + TAX_RATE);
}

function tip(price: number): number {
  return price * 0.2;
}
```

Un compañero dice: "Bien, la tasa de impuesto tiene una constante". ¿Cuál es el problema y qué revisarías antes de cambiarlo?

<details><summary>Respuesta</summary>

El `0.2` de `tip` tiene el mismo texto pero puede ser una regla distinta. Si la propina es un 20 por ciento fijo que no tiene nada que ver con el impuesto, usar `TAX_RATE` ahí sería un *bug* esperando al próximo cambio de impuesto. Pregunta: si el impuesto pasa a 0.25, ¿la propina también debe cambiar? Si no, la propina necesita su propia constante, `TIP_RATE`. La constante del impuesto es correcta. El verdadero defecto es el `0.2` sin nombre, que esconde lo que significa.

</details>

3. Dos versiones funcionan. La versión A tiene `printCat(name)` y `printDog(name)`, que se diferencian en una palabra. La versión B tiene `printAnimal(name, sound)`. ¿Cuál es mejor y cuándo elegirías la otra?

<details><summary>Respuesta</summary>

La versión B es mejor cuando las dos funciones cambian juntas, por ejemplo cuando cambia el formato de la línea. Un solo cambio arregla las dos. La versión A es mejor si la salida del gato y la del perro van a diferir después en muchas cosas. Entonces B se llena de banderas y se vuelve difícil de leer. Con solo dos copias, la regla de tres dice que puedes esperar. Con un tercer animal, B es la opción clara.

</details>

4. ¿Qué se rompe si cambias el requisito del formulario del refugio: los campos siguen siendo los mismos, pero la etiqueta de "Age" debe ser "Age in years" y `color` es opcional? Piensa en la versión con bucle.

<details><summary>Respuesta</summary>

La etiqueta es fácil: editas un objeto del array. El campo opcional es más difícil, porque el bucle trata cada elemento como obligatorio. Puedes agregar un `required: boolean` a cada objeto y revisarlo en el bucle. Eso vuelve a ser una bandera, pero vive en los datos, no en la llamada a una función, así que sigue siendo legible. Si más adelante agregas cinco tipos distintos de reglas, un bucle sobre datos simples puede dejar de bastar.

</details>

5. Explícale DRY a un amigo que cocina, en tres frases, sin usar la palabra "repetir". Usa un libro de recetas como ejemplo.

<details><summary>Respuesta</summary>

Una buena respuesta: "Escribe cada dato en un solo lugar. Si muchas recetas necesitan la misma salsa, escribe la salsa una vez y haz que las recetas apunten a ella. Cuando mejoras la salsa, todas las recetas mejoran". La prueba de una buena respuesta es que habla de datos y de un solo hogar, no de copiar texto. Si tu respuesta solo dice "no copies y pegues", se pierde la idea, porque dos salsas escritas con palabras distintas pueden guardar un mismo dato.

</details>

6. Un compañero nuevo quiere quitar todas las líneas repetidas de un programa de 500 líneas en una tarde. ¿Qué le dirías? No hay una única respuesta correcta.

<details><summary>Respuesta</summary>

Quitar la repetición es un compromiso. Ayuda cuando las copias cambian juntas, y hace daño cuando atas cosas que solo se parecen. También cuesta tiempo, y el riesgo crece con cada cambio en código que ya funciona. Una buena respuesta dice: quita las copias que tratan de una misma regla, empieza por las que ya causaron un *bug* y espera a la tercera copia en los casos poco claros. La mejor elección depende de con qué frecuencia cambia el código y de cuántas personas lo leen.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es la "regla de tres" en la refactorización y por qué los desarrolladores esperan a la tercera copia?**
   - Busca: `rule of three refactoring duplication`
   - Pruébalo: escribe una función dos veces en un archivo de pruebas, con una pequeña diferencia. Luego cópiala una tercera vez con otra diferencia. Ahora intenta escribir una sola función para las tres. Fíjate qué diferencias solo fueron visibles después de la tercera copia.
   - Una buena respuesta explica: qué dice la regla, un caso en que ayuda y un caso en que la romperías.

2. **¿Qué significa el dicho "la duplicación es mucho más barata que la abstracción equivocada"?**
   - Busca: `duplication far cheaper than wrong abstraction`
   - Pruébalo: toma la función `formatSong` de esta lección y agrégale una cuarta bandera tuya. Cuenta cuántos lugares donde se llama se vuelven más difíciles de leer. Luego sepárala en dos funciones con nombre y compara.
   - Una buena respuesta explica: qué es una abstracción equivocada, por qué empeora con el tiempo y cómo un equipo puede arreglarla.

3. **¿Cuál es la diferencia entre DRY y DAMP en el código de los tests?**
   - Busca: `DRY vs DAMP tests`
   - Pruébalo: abre `e2e/playground.spec.ts` y lee dos *tests*. Decide qué líneas moverías a un *helper* y cuáles dejarías en el *test*. Escribe una frase para cada decisión.
   - Una buena respuesta explica: qué significa cada palabra, por qué los *tests* suelen preferir DAMP y un ejemplo de un *test* demasiado DRY.

## Siguiente paso

Terminaste los fundamentos de programación. En el módulo 2 aprendes Git y cómo funciona la web, para que puedas leer y compartir proyectos reales.
