---
title: Módulos
duration: 50 min
---

## Objetivo

En esta lección divides el código en varios archivos y compartes lo necesario entre ellos con `export` e `import`.

- Decidir qué puede y qué no puede ver otro archivo de un módulo.
- Compartir un valor, una función o un tipo con `export` y usarlo con `import`.
- Explicar por qué un módulo se ejecuta una sola vez y qué se deduce de eso.
- Elegir cómo dividir el código en módulos y cómo nombrarlos.

## Un archivo, un módulo

En este curso, Node.js ejecuta los archivos `.ts` como **módulos** porque `package.json` declara `"type": "module"`. El verificador también trata cada archivo como módulo por `moduleDetection: "force"`. Sus variables y funciones quedan en su propio ámbito.

Para compartir algo, el módulo debe **exportarlo** (*export*). Para usarlo, otro archivo debe **importarlo** (*import*).

## export

Pon la palabra `export` antes de lo que quieres compartir.

Crea el archivo `exercises/01-programming/_shapes.ts`:

```ts
export const unit = "cm"

export function squareArea(side: number): number {
  return side * side
}

export function circleArea(radius: number): number {
  return Math.PI * radius * radius
}

const secret = "not shared"
```

El archivo comparte `unit`, `squareArea` y `circleArea`. La variable `secret` no tiene `export`, así que queda privada.

## import

Usa `import` al principio de otro archivo. Escribe los nombres entre llaves y luego di de dónde vienen.

Crea el archivo `exercises/01-programming/use-shapes.ts`:

```ts
import { unit, squareArea, circleArea } from "./_shapes.ts"

console.log(`${squareArea(3)} square ${unit}`)
console.log(circleArea(1))
```

Ejecútalo con `node exercises/01-programming/use-shapes.ts`. El programa imprime:

```text
9 square cm
3.141592653589793
```

En esta forma, los nombres dentro de `{ }` coinciden exactamente con los nombres exportados.

Si un archivo intenta importar el `secret` privado:

```ts
import { secret } from "./_shapes.ts"
console.log(secret)
```

el programa se detiene con:

```text
SyntaxError: The requested module './_shapes.ts' does not provide an export named 'secret'
```

VS Code muestra el problema antes, como un subrayado rojo. Lo que no se exporta no se puede importar.

![Los nombres con export están disponibles para use-shapes.ts; secret queda dentro de _shapes.ts.](/images/01b-module-exports.es.svg)

## Rutas relativas

El texto después de `from` es la **ruta**. Una ruta que empieza con `./` apunta a un archivo junto al archivo actual. Una ruta que empieza con `../` sube una carpeta.

- `"./_shapes.ts"` significa el archivo `_shapes.ts` en la misma carpeta.
- `"../shared/data.ts"` significa el archivo `data.ts` en la carpeta `shared`, un nivel más arriba.

> **Nota:** En este curso, escribe la terminación `.ts` en los imports relativos. Node la necesita para encontrar el archivo.

Estas tres versiones incorrectas fallan al ejecutar:

- `from "_shapes.ts"` (sin `./`): Node cree que es el nombre de un paquete y reporta `Cannot find package '_shapes.ts'`.
- `from "./_shapes"` (sin `.ts`): Node reporta `Cannot find module` y muestra la ruta sin la terminación.
- `from "./_shape.ts"` (un error de escritura): el mismo error `Cannot find module`. Lee la ruta del mensaje y compárala con el nombre real del archivo.

## Importar tipos

Un alias de tipo sirve al verificador, pero no crea un valor para ejecutar. Node.js elimina `import type` antes de cargar los módulos. Usa esa forma para importar tipos.

Crea `exercises/01-programming/_weather.ts`:

```ts
export type Weather = "sunny" | "rainy" | "snowy"

export const city = "Lima"
```

Úsalo en otro archivo:

```ts
import type { Weather } from "./_weather.ts"

const today: Weather = "rainy"
console.log(today)
```

El programa imprime `rainy`.

Puedes importar valores y tipos del mismo archivo con dos líneas:

```ts
import type { Weather } from "./_weather.ts"
import { city } from "./_weather.ts"
```

## Un módulo se ejecuta una sola vez

Una panadería tiene una máquina de turnos. Vive en `_tickets.ts` y tiene un contador que sube de uno en uno. Dos archivos más usan la máquina, y el archivo principal los llama.

`exercises/01-programming/_tickets.ts`:

```ts
console.log("ticket machine loaded")

let count = 0

export function nextTicket(): number {
  count += 1
  return count
}
```

`exercises/01-programming/_till.ts`:

```ts
import { nextTicket } from "./_tickets.ts"

export function serveCustomer(): number {
  return nextTicket()
}
```

`exercises/01-programming/_screen.ts`:

```ts
import { nextTicket } from "./_tickets.ts"

export function showNextTicket(): number {
  return nextTicket()
}
```

`exercises/01-programming/bakery.ts`:

```ts
import { serveCustomer } from "./_till.ts"
import { showNextTicket } from "./_screen.ts"

serveCustomer()
serveCustomer()
console.log(showNextTicket())
```

Ejecuta `node exercises/01-programming/bakery.ts`. El programa imprime:

```text
ticket machine loaded
3
```

El mensaje aparece una vez y la pantalla muestra 3. En una ejecución, Node.js guarda los módulos cargados por su URL resuelta. Estos dos imports llegan al mismo archivo: su código se ejecuta una vez y ambos acceden a las mismas variables exportadas. Hay una máquina y un contador, así que todos los clientes comparten los números.

![Los dos módulos usan el mismo contador; los tres turnos avanzan de 0 a 3.](/images/01-module-counter.es.svg)

El contador de este módulo sigue disponible entre llamadas durante esta ejecución. Al ejecutar de nuevo el programa, empieza otra vez en 0.

## Paquetes

No todos los imports apuntan a tus propios archivos. Otras personas publican código como **paquetes**, que instalas con pnpm.

Compara dos imports:

```ts
import { squareArea } from "./_shapes.ts"
import { marked } from "marked"
```

- Una ruta que empieza con `./` o `../` busca un archivo relativo al módulo que importa.
- Un nombre de paquete como `marked` se busca en `node_modules`, desde la carpeta del módulo que importa y luego en sus carpetas superiores. pnpm enlaza ahí los paquetes instalados.

## Profundiza

### Los imports son vivos y de solo lectura

Crea `exercises/01-programming/_dog.ts`:

```ts
export let age = 3

export function birthday(): void {
  age += 1
}
```

El archivo que importa puede leer `age`, pero no asignarle un valor.

```ts
import { age, birthday } from "./_dog.ts"

birthday()
console.log(age)
```

Esto imprime `4`. El import es una vista viva de la variable, no una copia del número. Pero este programa se detiene con `TypeError: Assignment to constant variable.`:

```ts
import { age } from "./_dog.ts"

age = 10
```

El archivo que importa no puede reasignar esa variable. Si el valor fuera un objeto, sí podría cambiar sus propiedades. El módulo ofrece una función, aquí `birthday`, para todos los demás. TypeScript lo reporta antes de ejecutar como "Cannot assign to 'age' because it is an import".

### Un compromiso: el cajón de cosas sueltas

Compartir no es gratis. Un archivo llamado `utils.ts` que guarda de todo se vuelve un cajón de cosas sueltas. Nadie sabe qué hay dentro, y un cambio puede romper muchos archivos.

Comparte código cuando dos archivos necesitan lo mismo. Dale al módulo un nombre que diga lo que hace, por ejemplo `shapes.ts` y no `stuff.ts`. Una buena prueba para un módulo es: ¿puedes decir en una frase para qué sirve?

## Práctica

1. Crea `exercises/01-programming/_shapes.ts` y `exercises/01-programming/use-shapes.ts` a partir de esta lección y ejecuta `node exercises/01-programming/use-shapes.ts`.
2. Quita `export` de `squareArea` y mira el error en VS Code y en la terminal. Luego vuelve a ponerlo.
3. Crea los cuatro archivos de la panadería y ejecuta `bakery.ts`. Luego agrega otra llamada a `serveCustomer()` y ejecútalo otra vez.
4. Abre `exercises/01-programming/_test-cases.ts` y léelo. No lo cambies.
5. Abre `exercises/01-programming/11-modules.ts`. Reemplaza cada `// TODO` con código.
6. Ejecuta el archivo del ejercicio con este comando:

```bash
node exercises/01-programming/11-modules.ts
```

Haz que cada comprobación diga `OK`.

## Reto

Diseña un programa pequeño de zoológico con módulos. Guarda los animales en un módulo y las reglas de comida en otro, y dale al archivo principal un solo lugar desde donde importar. Si prefieres, elige otro mundo, como un refugio de mascotas o una biblioteca. Tu programa debe tener un *helper* privado que ningún otro archivo pueda usar.

Crea el archivo principal `exercises/challenges/11-modules.ts`. Pon tus módulos en la carpeta `exercises/challenges/_zoo/`.

Está terminado cuando:

- Ejecutar `node exercises/challenges/11-modules.ts` imprime al menos dos resultados que vienen de dos módulos distintos.
- El archivo principal tiene exactamente una línea `import` para valores, y apunta a un archivo llamado `index.ts` en tu carpeta.
- Un valor de un módulo no tiene `export`. Un segundo archivo, `exercises/challenges/11-private-test.ts`, intenta importarlo, y al ejecutar ese archivo falla con "does not provide an export named".
- `pnpm typecheck` reporta el import privado en `11-private-test.ts`, y puedes leer ese error y decir qué significa.

Vas a necesitar algo que esta lección no enseñó: un archivo que toma nombres de otros módulos y los exporta de nuevo, para que un archivo sea la única puerta de una carpeta. Busca: `javascript re-export export from barrel file`.

## Piénsalo bien

1. Este módulo funciona, pero da una respuesta incorrecta en la segunda llamada. Encuentra el *bug*.

```ts
const songs: string[] = []

export function makePlaylist(...titles: string[]): string[] {
  for (const title of titles) {
    songs.push(title)
  }
  return songs
}
```

Un archivo llama a `makePlaylist("Blue", "Green")` y luego a `makePlaylist("Red")`.

<details><summary>Respuesta</summary>

La segunda llamada devuelve `["Blue", "Green", "Red"]`, no `["Red"]`. El *array* `songs` está al inicio del módulo, así que se crea una sola vez y todas las llamadas agregan al mismo array. La solución es crear el array dentro de la función, para que cada llamada tenga uno nuevo. Este tipo de estado compartido es difícil de encontrar porque no aparece ningún error.

</details>

2. La panadería abre una segunda caja, y cada caja debe tener sus propios números de turno. ¿Qué se rompe en el diseño de `_tickets.ts` y cómo lo cambiarías?

<details><summary>Respuesta</summary>

Las dos cajas compartirían un contador, porque el módulo se ejecuta una vez y `count` existe una sola vez. La caja 2 daría el número 4 después de que la caja 1 diera el 3. La solución es dejar de guardar el contador al inicio del módulo. En su lugar, exporta una función que cree una máquina nueva, con su propio contador, cada vez que se llama, y que cada caja la llame una vez. Puedes buscar `factory function javascript` para ver el patrón habitual.

</details>

3. El archivo `a.ts` importa `b` desde `b.ts`, y `b.ts` importa `a` desde `a.ts`. Cada archivo exporta su valor con `const` e imprime el valor del otro apenas se carga. Ejecutas `node a.ts`. ¿Qué pasa?

<details><summary>Respuesta</summary>

El programa se detiene con "ReferenceError: Cannot access 'a' before initialization". Node inicia `a.ts`, ve que necesita `b.ts` y ejecuta `b.ts` primero. En ese momento `a.ts` todavía no creó su valor, así que `b.ts` lee algo que aún no existe. Dos módulos que se necesitan entre sí se llaman import circular. La solución habitual es un tercer módulo que guarde lo que ambos necesitan.

</details>

## Siguiente paso

En la siguiente lección aprendes a leer mensajes de error y a arreglar lo que está mal.
