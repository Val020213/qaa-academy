---
title: Módulos
summary: Divide el código en archivos, compártelo con export e import, y predice qué se comparte y qué queda privado.
duration: 70 min
---

## Empieza con un acertijo

Una panadería tiene una máquina de turnos. Vive en el archivo `_tickets.ts`. Tiene un contador que empieza en 0 y sube de uno en uno por cada ticket.

Otros dos archivos usan la máquina. El archivo `_till.ts` tiene una función `serveCustomer`. El archivo `_screen.ts` tiene una función `showNextTicket`. Los dos archivos importan la misma función `nextTicket` desde `_tickets.ts`.

El archivo principal llama a `serveCustomer()` dos veces. Luego imprime el resultado de `showNextTicket()`.

¿Imprime 1 (cada archivo tiene su propia máquina) o 3 (hay una sola máquina)? ¿Cuántas veces se inicia el archivo de la máquina?

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Predecir qué puede y qué no puede ver otro archivo de un módulo.
- Compartir un valor, una función o un tipo con `export` y usarlo con `import`.
- Explicar por qué un módulo se ejecuta una sola vez y qué se deduce de eso.
- Elegir cómo dividir el código en módulos y cómo nombrarlos.

## Un archivo, un módulo

Los proyectos reales tienen muchos archivos. Cada archivo es un **módulo**. Un módulo guarda sus propias variables y funciones. Los otros archivos no las pueden ver.

Esto es útil. Una app de recetas puede guardar el código del horno en un archivo y la lista de compras en otro. Si el código del horno cambia, lo arreglas en un solo lugar.

Para compartir algo, el módulo debe **exportarlo** (*export*). Para usarlo, otro archivo debe **importarlo** (*import*).

## export

Pon la palabra `export` antes de lo que quieres compartir.

Crea el archivo `exercises/01-programming/_shapes.ts`:

```ts
export const unit = "cm";

export function squareArea(side: number): number {
  return side * side;
}

export function circleArea(radius: number): number {
  return Math.PI * radius * radius;
}

const secret = "not shared";
```

El archivo comparte `unit`, `squareArea` y `circleArea`. La variable `secret` no tiene `export`, así que queda privada.

## import

Usa `import` al principio de otro archivo. Escribe los nombres entre llaves y luego di de dónde vienen.

Crea el archivo `exercises/01-programming/use-shapes.ts`:

```ts
import { unit, squareArea, circleArea } from "./_shapes.ts";

console.log(`${squareArea(3)} square ${unit}`);
console.log(circleArea(1));
```

Ejecútalo con `node exercises/01-programming/use-shapes.ts`. El programa imprime:

```text
9 square cm
3.141592653589793
```

Los nombres dentro de `{ }` deben coincidir exactamente con los nombres exportados.

Ahora rómpelo a propósito. ¿Qué esperas cuando un archivo importa el `secret` privado?

```ts
import { secret } from "./_shapes.ts";
console.log(secret);
```

El programa se detiene con:

```text
SyntaxError: The requested module './_shapes.ts' does not provide an export named 'secret'
```

VS Code muestra el problema antes, como un subrayado rojo. Privado significa privado.

## Rutas relativas

El texto después de `from` es la **ruta**. Una ruta que empieza con `./` apunta a un archivo junto al archivo actual. Una ruta que empieza con `../` sube una carpeta.

- `"./_shapes.ts"` significa el archivo `_shapes.ts` en la misma carpeta.
- `"../shared/data.ts"` significa el archivo `data.ts` en la carpeta `shared`, un nivel más arriba.

> **Nota:** En este curso, escribe la terminación `.ts` en los imports relativos. Node la necesita para encontrar el archivo.

Prueba tres versiones incorrectas. Cada una falla de una forma distinta. Adivina primero el mensaje.

- `from "_shapes.ts"` (sin `./`): Node cree que es el nombre de un paquete y reporta `Cannot find package '_shapes.ts'`.
- `from "./_shapes"` (sin `.ts`): Node reporta `Cannot find module` y muestra la ruta sin la terminación.
- `from "./_shape.ts"` (un error de escritura): el mismo error `Cannot find module`. Lee la ruta del mensaje y compárala con el nombre real del archivo.

## Importar tipos

Un tipo existe solo mientras TypeScript revisa tu código. Desaparece cuando el programa se ejecuta. Usa `import type` para los tipos.

Crea `exercises/01-programming/_weather.ts`:

```ts
export type Weather = "sunny" | "rainy" | "snowy";

export const city = "Lima";
```

Úsalo en otro archivo:

```ts
import type { Weather } from "./_weather.ts";

const today: Weather = "rainy";
console.log(today);
```

El programa imprime `rainy`.

Puedes importar valores y tipos del mismo archivo con dos líneas:

```ts
import type { Weather } from "./_weather.ts";
import { city } from "./_weather.ts";
```

## Un módulo se ejecuta una sola vez

De vuelta a la panadería. Crea los tres archivos y el archivo principal.

`exercises/01-programming/_tickets.ts`:

```ts
console.log("ticket machine loaded");

let count = 0;

export function nextTicket(): number {
  count += 1;
  return count;
}
```

`exercises/01-programming/_till.ts`:

```ts
import { nextTicket } from "./_tickets.ts";

export function serveCustomer(): number {
  return nextTicket();
}
```

`exercises/01-programming/_screen.ts`:

```ts
import { nextTicket } from "./_tickets.ts";

export function showNextTicket(): number {
  return nextTicket();
}
```

`exercises/01-programming/bakery.ts`:

```ts
import { serveCustomer } from "./_till.ts";
import { showNextTicket } from "./_screen.ts";

serveCustomer();
serveCustomer();
console.log(showNextTicket());
```

Ejecuta `node exercises/01-programming/bakery.ts`. El programa imprime:

```text
ticket machine loaded
3
```

### De vuelta al acertijo

El mensaje aparece una vez y la pantalla muestra 3. Cuando dos archivos importan el mismo módulo, el código del módulo se ejecuta una sola vez. Los dos archivos reciben los mismos valores exportados. No reciben copias. Hay una máquina y un contador, así que todos los clientes comparten los números.

Esto tiene una consecuencia que debes recordar. Una variable al inicio de un módulo vive tanto como el programa. Todas las funciones que la usan la comparten.

## Paquetes

No todos los imports apuntan a tus propios archivos. Otras personas publican código como **paquetes**. Un paquete es un conjunto de código que instalas con pnpm.

Compara dos imports:

```ts
import { squareArea } from "./_shapes.ts";
import { marked } from "marked";
```

- Una ruta que empieza con `./` o `../` es un archivo tuyo.
- Un nombre sin punto es un paquete. Node lo busca en la carpeta `node_modules`, donde pnpm pone los paquetes instalados.

El paquete `marked` convierte texto Markdown en HTML. El sitio del curso lo usa para mostrar estas lecciones.

## Profundiza

### Los imports son vivos y de solo lectura

Crea `exercises/01-programming/_dog.ts`:

```ts
export let age = 3;

export function birthday(): void {
  age += 1;
}
```

El archivo que importa puede leer `age`, pero no asignarle un valor. Predice qué imprime cada programa y luego ejecútalos.

```ts
import { age, birthday } from "./_dog.ts";

birthday();
console.log(age);
```

Esto imprime `4`. El import es una vista viva de la variable, no una copia del número. Pero este programa se detiene con `TypeError: Assignment to constant variable.`:

```ts
import { age } from "./_dog.ts";

age = 10;
```

Solo el módulo dueño de una variable puede cambiarla. El módulo ofrece una función, aquí `birthday`, para todos los demás.

### Un compromiso: el cajón de cosas sueltas

Compartir no es gratis. Un archivo llamado `utils.ts` que guarda de todo se vuelve un cajón de cosas sueltas. Nadie sabe qué hay dentro, y un cambio puede romper muchos archivos.

Comparte código cuando dos archivos necesitan lo mismo. Dale al módulo un nombre que diga lo que hace, por ejemplo `shapes.ts` y no `stuff.ts`. Una buena prueba para un módulo es: ¿puedes decir en una frase para qué sirve?

### Cómo aparece en el trabajo de automatización QA

Todo *test* de Playwright empieza con una línea de import.

```ts
import { test, expect } from "@playwright/test";
```

Léela así: "Del paquete `@playwright/test`, trae dos herramientas. `test` define un *test*. `expect` comprueba un resultado". Los nombres `async` y `await` del cuerpo del *test* vienen de la lección 10.

Mira el archivo real `e2e/lib/test.ts` de este proyecto. Todos los *specs* (archivos de tests) importan `test` y `expect` desde ahí. Hoy solo los pasa tal cual desde `@playwright/test`. Cuando el equipo agregue sus propios *fixtures* en el módulo 4, el cambio se hará en este único archivo. Ningún *spec* cambia su import.

Esto es **DRY**: "Don't Repeat Yourself" (no te repitas). El código compartido tiene un solo hogar. Estudiarás la idea al final de este módulo.

En Playwright, cada proceso *worker* (trabajador) carga su propia copia de cada módulo. Por eso no uses una variable de módulo para pasar datos de un *test* a otro.

> **Consejo:** Un asistente de IA puede sugerirte cómo dividir el código en archivos. Ejecuta lo que te dé. Si no puedes explicar cada import y cada export de la respuesta, no lo conserves.

## Práctica

1. Crea `exercises/01-programming/_shapes.ts` y `exercises/01-programming/use-shapes.ts` a partir de esta lección.
2. Ejecuta `node exercises/01-programming/use-shapes.ts`.
3. Quita `export` de `squareArea` y mira el error en VS Code y en la terminal. Luego vuelve a ponerlo.
4. Crea los cuatro archivos de la panadería y ejecuta `bakery.ts`. Luego agrega una segunda llamada a `serveCustomer()` y predice el nuevo número antes de ejecutar.
5. Abre `exercises/01-programming/_test-cases.ts` y léelo. No lo cambies.
6. Abre `exercises/01-programming/11-modules.ts`. Reemplaza cada `// TODO` con código.
7. Ejecuta el archivo del ejercicio con este comando:

```bash
node exercises/01-programming/11-modules.ts
```

Haz que cada línea diga `OK`.

## Reto

Diseña un programa pequeño de zoológico con módulos. Guarda los animales en un módulo y las reglas de comida en otro, y dale al archivo principal un solo lugar desde donde importar. Elige tu propio mundo si prefieres: un refugio de mascotas, una biblioteca, una liga de fútbol. Tu programa debe tener un *helper* privado que ningún otro archivo pueda usar.

Crea el archivo principal `exercises/challenges/11-modules.ts`. Pon tus módulos en la carpeta `exercises/challenges/_zoo/`.

Está terminado cuando:

- Ejecutar `node exercises/challenges/11-modules.ts` imprime al menos dos resultados que vienen de dos módulos distintos.
- El archivo principal tiene exactamente una línea `import` para valores, y apunta a un archivo llamado `index.ts` en tu carpeta.
- Un valor de un módulo no tiene `export`. Un segundo archivo, `exercises/challenges/11-private-test.ts`, intenta importarlo, y al ejecutar ese archivo falla con "does not provide an export named".
- `pnpm typecheck` reporta un error solo para `11-private-test.ts`, y puedes leer ese error y decir qué significa.

Vas a necesitar algo que esta lección no enseñó: un archivo que toma nombres de otros módulos y los exporta de nuevo, para que un archivo sea la única puerta de una carpeta. Busca: `javascript re-export export from barrel file`.

## Piénsalo bien

1. Un archivo `_dog.ts` tiene `export let age = 3;` y `export function birthday() { age += 1; }`. Un segundo archivo ejecuta `import { age, birthday } from "./_dog.ts"; birthday(); console.log(age);`. ¿Qué imprime y por qué? ¿Qué pasa si el segundo archivo ejecuta `age = 10;`?

<details><summary>Respuesta</summary>

Imprime `4`. Un import es una vista viva de la variable del otro módulo, no una copia de su valor en el momento de importar. Por eso, cuando `birthday` cambia `age`, quien importa ve el valor nuevo. La línea `age = 10;` se detiene con "Assignment to constant variable", y TypeScript reporta "Cannot assign to 'age' because it is an import". Solo el módulo dueño de la variable puede cambiarla.

</details>

2. Este módulo funciona, pero da una respuesta incorrecta en la segunda llamada. Encuentra el *bug*.

```ts
const songs: string[] = [];

export function makePlaylist(...titles: string[]): string[] {
  for (const title of titles) {
    songs.push(title);
  }
  return songs;
}
```

Un archivo llama a `makePlaylist("Blue", "Green")` y luego a `makePlaylist("Red")`.

<details><summary>Respuesta</summary>

La segunda llamada devuelve `["Blue", "Green", "Red"]`, no `["Red"]`. El *array* `songs` está al inicio del módulo, así que se crea una sola vez y vive tanto como el programa. Cada llamada agrega al mismo array, y cada quien recibe el mismo array de vuelta. La solución es crear el array dentro de la función, para que cada llamada tenga uno nuevo. Este tipo de estado compartido es difícil de encontrar porque no aparece ningún error.

</details>

3. Tienes 12 funciones de ayuda: 5 sobre dinero, 4 sobre fechas, 3 sobre texto. La versión A las pone todas en `utils.ts`. La versión B crea `money.ts`, `dates.ts` y `text.ts`. Ambas funcionan. ¿Cuál es mejor aquí y qué te haría elegir la A?

<details><summary>Respuesta</summary>

La versión B es mejor aquí, porque cada archivo tiene un trabajo claro y un nombre que te dice dónde buscar. Un cambio en una regla de fechas no puede romper por accidente el código de dinero. La versión A es mejor cuando el proyecto es muy pequeño, por ejemplo 3 funciones en total, porque tres archivos para tres funciones es más trabajo que ayuda. La decisión depende de cuántas cosas tienes y de cuántas personas deben encontrarlas. Divide cuando los nombres dejan de decirte dónde están las cosas.

</details>

4. La panadería abre una segunda caja, y cada caja debe tener sus propios números de turno. ¿Qué se rompe en el diseño de `_tickets.ts` y cómo lo cambiarías?

<details><summary>Respuesta</summary>

Las dos cajas compartirían un contador, porque el módulo se ejecuta una vez y `count` existe una sola vez. La caja 2 daría el número 4 después de que la caja 1 diera el 3. La solución es dejar de guardar el contador al inicio del módulo. En su lugar, exporta una función que cree una máquina nueva, con su propio contador, cada vez que se llama. Luego cada caja la llama una vez y se queda con su propia máquina. Puedes buscar `factory function javascript` para ver el patrón habitual.

</details>

5. Explícale a un compañero la diferencia entre `from "./_shapes.ts"` y `from "marked"`, en tres frases, sin usar la palabra "ruta".

<details><summary>Respuesta</summary>

Una buena respuesta dice tres cosas. El primero apunta a un archivo que tú escribiste, junto al archivo actual. El segundo es un paquete que hizo otra persona y que se instaló en `node_modules`. Si escribes el primero sin `./`, Node busca un paquete y reporta que no lo puede encontrar.

</details>

6. El archivo `a.ts` importa `b` desde `b.ts`, y `b.ts` importa `a` desde `a.ts`. Cada archivo imprime el valor del otro apenas se carga. Ejecutas `node a.ts`. ¿Qué pasa?

<details><summary>Respuesta</summary>

El programa se detiene con "ReferenceError: Cannot access 'a' before initialization". Node inicia `a.ts`, ve que necesita `b.ts` y ejecuta `b.ts` primero. En ese momento `a.ts` todavía no creó su valor, así que `b.ts` lee algo que aún no existe. Dos módulos que se necesitan entre sí se llaman import circular. La solución habitual es un tercer módulo que guarde lo que ambos necesitan.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Cuál es la diferencia entre los módulos ES (`import`) y CommonJS (`require`)?**
   - Busca: `es modules vs commonjs node`
   - Pruébalo: crea `old.cjs` con la línea `module.exports = { hi: "hello" };`. En un archivo `.ts` escribe `import old from "./old.cjs"; console.log(old.hi);` y ejecútalo con `node`. Luego ejecuta `pnpm typecheck` o mira VS Code. Anota qué dice cada herramienta.
   - Una buena respuesta explica: las dos sintaxis, por qué ves ambas en los tutoriales, por qué el programa puede ejecutarse mientras TypeScript se queja y cuál usa este curso.

2. **¿Qué significa `^` en una versión como `^4.13.0` en `package.json`, y por qué Playwright está escrito sin él?**
   - Busca: `package.json caret version range semver`
   - Pruébalo: abre `package.json` en este proyecto. Anota tres paquetes que empiecen con `^` y uno que no. Luego encuentra la entrada de `@playwright/test` en `pnpm-lock.yaml`.
   - Una buena respuesta explica: qué significan los números de versión, qué agrega el archivo de bloqueo (*lock file*) y una razón para fijar una herramienta de *tests* a una versión exacta.

3. **¿Cuál es la diferencia entre `dependencies` y `devDependencies`?**
   - Busca: `package.json dependencies vs devDependencies`
   - Pruébalo: en `package.json`, encuentra dónde están listados `@playwright/test` y `react`. Explica por qué cada uno está en su lista.
   - Una buena respuesta explica: qué significa cada lista, en cuál suele ir una herramienta de *tests* y por qué.

## Siguiente paso

En la siguiente lección aprendes a leer mensajes de error y a arreglar lo que está mal.
