---
title: Leer errores
duration: 50 min
---

## Objetivo

En esta lección aprendes a leer un mensaje de error de TypeScript y un *stack trace* (traza de la pila de llamadas), y a decidir si la línea que se rompió es la que tiene el error.

- Distinguir un error de tipo, un error en tiempo de ejecución y un *bug* de lógica.
- Leer las partes de un mensaje de error de TypeScript y de un *stack trace*.
- Reconocer los errores más comunes de quien empieza y su arreglo habitual.
- Decidir si la línea que se rompió es la línea que tiene el error.

## Tres tipos de errores

En la primera lección viste que un error puede detectarse antes de ejecutar o mientras se ejecuta. En TypeScript esos dos casos tienen nombre propio:

- Un **error de tipo** se encuentra antes de que el programa se ejecute. TypeScript revisa tu código y encuentra una diferencia. Lo ves como un subrayado rojo en VS Code, o al ejecutar `pnpm typecheck`.
- Un **error en tiempo de ejecución** ocurre mientras el programa corre. El programa se detiene en la línea que falla.

Un tercer tipo es el **bug de lógica**. El programa corre sin error pero da una respuesta incorrecta. Aquí ningún mensaje te ayuda: debes comparar el resultado con lo que esperas. La siguiente lección trata de este tipo.

## Anatomía de un error de TypeScript

Este código tiene un error de tipo:

```ts
const count: number = "five";
```

TypeScript reporta:

```text
exercises/01-programming/demo.ts:1:7 - error TS2322: Type 'string' is not assignable to type 'number'.
```

Léelo por partes:

- `exercises/01-programming/demo.ts` es el archivo.
- `1:7` es el número de línea y el número de columna. Ve a la línea 1, carácter 7.
- `TS2322` es el código del error. Búscalo en la web para encontrar explicaciones.
- `Type 'string' is not assignable to type 'number'` es el mensaje. Dice: pusiste texto donde se espera un número.

La frase "Type X is not assignable to type Y" es la más común. Léela como "recibí X, pero necesito Y".

## Anatomía de un stack trace

Aquí hay un error en tiempo de ejecución. La función lee el nombre del dueño desde un texto JSON. JSON es un formato de texto para datos.

```ts
function getDogName(jsonText: string): string {
  const dog = JSON.parse(jsonText);
  return dog.owner.name;
}

console.log(getDogName('{"name":"Rex"}'));
```

Node imprime algo como esto:

```text
return dog.owner.name;
                 ^

TypeError: Cannot read properties of undefined (reading 'name')
    at getDogName (file:///C:/qaa/exercises/01-programming/demo.ts:3:20)
    at file:///C:/qaa/exercises/01-programming/demo.ts:6:13
```

Léelo por partes:

- Las primeras líneas muestran el código que falló con una marca `^`.
- `TypeError` es el tipo de error.
- Después de los dos puntos está el mensaje: `dog.owner` es `undefined`, así que no puedes leer `name` de él.
- Las líneas que empiezan con `at` son el ***stack trace***. Lista las funciones que se estaban ejecutando, de la más nueva a la más antigua.

Empieza por la primera línea `at` que esté en tu propio archivo. Te da la línea y la columna donde ocurrió la caída.

## Los errores más comunes de quien empieza

### 1. Type 'string' is not assignable to type 'number'

Diste el tipo equivocado. Cambia el valor o el tipo. Ejemplo: `const age: number = "30"` pasa a ser `const age: number = 30`.

### 2. Cannot find name 'x'

TypeScript no conoce ese nombre. Revisa la ortografía y las mayúsculas. Revisa que lo hayas importado.

### 3. Property 'x' does not exist on type 'Y'

Usaste el nombre de una propiedad que el tipo no tiene. Revisa la ortografía, o agrega la propiedad a tu tipo.

### 4. 'x' is possibly 'undefined'

Un valor puede faltar, por ejemplo el resultado de `find`. Revísalo primero: `if (found !== undefined) { ... }`.

### 5. Cannot read properties of undefined

Un error en tiempo de ejecución. Lees una propiedad de algo que es `undefined`. Imprime el objeto con `console.log` y busca la parte que falta.

### 6. x is not a function

Llamaste a algo que no es una función. Revisa el nombre y los puntos. Quizá olvidaste que una propiedad es un valor simple.

### 7. Cannot find module

La ruta de un import está mal, o un paquete no está instalado. Revisa `./`, el nombre del archivo y la terminación `.ts`. Para los paquetes, ejecuta `pnpm install`.

### 8. A Promise shows as [object Promise]

Olvidaste `await`. Agrégalo. Mira la lección 10.

> **Consejo:** Arregla primero el primer error de la lista. Los errores siguientes suelen ser causados por el primero.

## ¿Dónde está el error?

La línea que señala el mensaje es donde el programa se rompió, y no siempre es la que tiene el error. Mira este programa:

```ts
type Dog = { id: number; name: string };
const dogs: Dog[] = [{ id: 1, name: "Rex" }];

function getName(id: number): string {
  const found = dogs.find((dog) => dog.id === id) as Dog;
  return found.name;
}

function printName(id: number): void {
  console.log(getName(id));
}

printName(2);
```

La salida real, con los nombres largos de carpetas acortados:

```text
TypeError: Cannot read properties of undefined (reading 'name')
    at getName (demo.ts:6:16)
    at printName (demo.ts:10:15)
    at Object.<anonymous> (demo.ts:13:1)
```

Node señala la línea 6, y la línea 6 está bien. El error es que nadie tiene un perro con id 2, y la línea 13 lo pidió. El texto `as Dog` le dijo a TypeScript que confiara en ti, así que escondió el `undefined`.

Las líneas `at` te dicen cómo llegar de la caída al origen. Node guarda la lista de las funciones que se están ejecutando, la **pila de llamadas** (*call stack*), y la imprime cuando ocurre una caída. Léela de arriba hacia abajo: `getName` se rompió, la llamó `printName` en la línea 10, y a esa la llamó el archivo principal en la línea 13. El valor incorrecto vino de más abajo en la lista. Pregúntate en cada línea: ¿qué esperaba aquí y qué recibí?

## Profundiza

### Fallo con ruido o fallo en silencio

Un programa puede fallar con ruido, con una caída y un mensaje. O puede fallar en silencio e imprimir algo incorrecto. Con ruido suele ser mejor, porque lo ves. Este refugio de perros guarda un dueño opcional por perro:

```ts
type Dog = { name: string; owner?: { name: string } };

function ownerName(dog: Dog): string {
  return (dog.owner as { name: string }).name;
}

const dogs: Dog[] = [{ name: "Rex", owner: { name: "Ana" } }, { name: "Mimi" }];

for (const dog of dogs) {
  console.log(ownerName(dog));
}
```

Imprime `Ana` y luego se rompe en la línea 4, pero la línea 4 no es el error. Mimi no tiene dueño, y el `as { name: string }` le dijo a TypeScript "confía en mí, el dueño está ahí". Los datos y el código no coinciden, y el `as` lo escondió. Una buena solución decide qué debe pasar con un perro sin dueño: imprimir "no owner" (sin dueño) o reportar un mensaje claro.

Compara la caída con esta "solución" para Mimi:

```ts
console.log(`${dog.name} belongs to ${dog.owner?.name}`);
```

El `?.` significa "si falta el dueño, da `undefined`". El programa imprime `Mimi belongs to undefined` y no se rompe. El error desapareció, pero el problema sigue ahí.

### Un `catch` vacío esconde el error

Un error es un mensaje del código, y no debes esconderlo. Este es un error común:

```ts
async function checkWelcome(): Promise<void> {
  throw new Error("Expected the welcome text");
}

async function main(): Promise<void> {
  try {
    await checkWelcome();
  } catch {
    // ignore
  }
  console.log("test passed");
}

main();
```

Imprime `test passed`, aunque la comprobación falló. El `catch` vacío se tragó el error. Un *test* así nunca puede fallar. Usa `catch` solo cuando puedas hacer algo útil. Si solo quieres registrar el error, escribe `throw error` al final del bloque `catch` para pasar el error hacia arriba.

## Práctica

1. Crea el archivo `exercises/01-programming/errors-practice.ts`.
2. Escribe `const count: number = "five";`. Lee el subrayado rojo. Luego ejecuta `pnpm typecheck` y encuentra el mismo mensaje. Nombra el archivo, la línea, la columna y el código.
3. Arréglalo, para que el error desaparezca.
4. Escribe una llamada a `getDogName` como en esta lección y ejecútala con `node`. Encuentra la primera línea `at` de tu propio archivo.
5. Abre `exercises/01-programming/12-reading-errors.ts`. Tiene cinco funciones con un *bug* cada una.
6. Ejecuta el archivo con este comando:

```bash
node exercises/01-programming/12-reading-errors.ts
```

7. Arregla un *bug* a la vez. Usa `console.log` para imprimir valores. Haz que cada línea diga `OK`.

## Reto

Construye un programa en un mundo que elijas, como recetas o una liga de fútbol. Debe romperse con un *stack trace*, y la línea que se rompe no debe ser la línea que tiene el error. Luego escribe una segunda versión que no se rompa y que le diga al usuario, en una frase clara, qué está mal con los datos.

Crea el archivo `exercises/challenges/12-reading-errors.ts` para la versión que se rompe y `exercises/challenges/12-clear-error.ts` para la versión clara.

Está terminado cuando:

- Ejecutar `node exercises/challenges/12-reading-errors.ts` se rompe con un `TypeError`, y el *stack trace* tiene al menos tres líneas `at` en tu propio archivo.
- Un comentario en el archivo nombra la línea que se rompió y la otra línea que tiene el error.
- Ejecutar `node exercises/challenges/12-clear-error.ts` imprime una frase con el nombre de lo que está mal, por ejemplo `Recipe "Salad" has no oven`, y ningún *stack trace*.
- Justo después del segundo programa, el código de salida es 1. En PowerShell, ejecuta `$LASTEXITCODE` para verlo.

Vas a necesitar algo que esta lección no enseñó: una forma de decirle a Node.js que tu programa falló, aunque atrapaste el error. Busca: `node process.exitCode`.

## Piénsalo bien

1. ¿Qué imprime este programa y por qué?

```ts
const area = Number("5cm") * 5;
console.log(area, area === area);
```

<details><summary>Respuesta</summary>

Imprime `NaN false`. `Number("5cm")` no puede hacer un número con ese texto, pero no lanza un error. Devuelve `NaN`, que significa "no es un número", y `NaN` por 5 sigue siendo `NaN`. `NaN` es el único valor que no es igual a sí mismo, así que `area === area` es `false`. El programa corre sin ningún mensaje, así que solo revisar el valor encuentra este *bug* de lógica.

</details>

2. Una lista de perros está vacía, y el código hace `dogs[0].name`. ¿Qué pasa en tiempo de ejecución? ¿Qué dice TypeScript estricto antes de ejecutar?

<details><summary>Respuesta</summary>

En tiempo de ejecución, `dogs[0]` es `undefined`, así que el programa se detiene con "Cannot read properties of undefined (reading 'name')". Con la configuración estricta de este curso, TypeScript reporta `Object is possibly 'undefined'` antes de ejecutar. El caso límite es la lista vacía. Revisa el valor primero con `if (first !== undefined)` y decide qué debe hacer el programa cuando no hay perros.

</details>

3. Una función debe encontrar un perro por su id. La versión A usa `find(...) as Dog`. La versión B revisa el resultado y lanza `new Error("Dog 2 not found")` cuando es `undefined`. Ambas funcionan cuando el perro existe. ¿Cuál es mejor aquí y cuándo elegirías la A?

<details><summary>Respuesta</summary>

La versión B es mejor porque el error nombra el problema real en el lugar donde empieza. Con la versión A la caída llega más tarde, en otra línea, con un mensaje sobre `undefined`. La versión A es aceptable solo cuando sabes que el valor no puede faltar, por ejemplo porque lo acabas de crear una línea antes. Los datos de un archivo, de un usuario o de un servidor siempre pueden faltar.

</details>

## Siguiente paso

En la siguiente lección aprendes a depurar como un científico: cómo encontrar *bugs* que no dan ningún mensaje de error.
