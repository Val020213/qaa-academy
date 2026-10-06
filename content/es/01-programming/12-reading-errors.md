---
title: Leer errores
summary: Lee errores de tipo y stack traces, encuentra dónde está el error real y arregla los errores más comunes.
duration: 75 min
---

## Empieza con un acertijo

Un refugio de perros guarda una lista de perros. Cada perro puede tener un dueño. Este programa imprime el dueño de cada perro.

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

El programa imprime `Ana`. Luego se rompe, y el mensaje apunta a la línea 4, dentro de `ownerName`.

¿Está mal la línea 4? Si no, ¿dónde está el error?

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Distinguir un error de tipo de un error en tiempo de ejecución y de un *bug* de lógica.
- Leer las partes de un mensaje de error de TypeScript y de un *stack trace* (traza de la pila de llamadas).
- Decidir si la línea que se rompió es la línea que tiene el error.
- Elegir entre fallar con ruido y esconder un problema.

## Dos tipos de errores

Los errores son normales. Todo programador los ve todos los días. Un mensaje de error te dice qué está mal. Debes aprender a leerlo.

Hay dos tipos de errores:

- Un **error de tipo** se encuentra antes de que el programa se ejecute. TypeScript revisa tu código y encuentra una diferencia. Lo ves como un subrayado rojo en VS Code, o al ejecutar `pnpm typecheck`.
- Un **error en tiempo de ejecución** ocurre mientras el programa corre. El programa se detiene en la línea que falla.

Un tercer tipo es el **bug de lógica**. El programa corre sin error pero da una respuesta incorrecta. Aquí ningún mensaje te ayuda. Debes comparar el resultado con lo que esperas. La siguiente lección trata de este tipo.

## Anatomía de un error de TypeScript

Aquí hay un error en el mundo de una escuela:

```ts
const count: number = "five";
```

Antes de seguir, adivina qué palabras usará el mensaje. TypeScript reporta:

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

## Una rutina de depuración

Usa estos cinco pasos, en este orden.

1. **Lee** el mensaje completo, despacio. Encuentra el archivo, la línea y el mensaje.
2. **Reproduce** el problema. Haz que falle otra vez, de la misma forma, cada vez.
3. **Hazlo más pequeño.** Quita código hasta tener el ejemplo más pequeño que todavía falla.
4. **Imprime valores.** Usa `console.log` para ver qué guardan de verdad las variables. Compara con lo que esperabas.
5. **Busca.** Copia el mensaje de error y búscalo. Antes, quita tus propios nombres del texto.

La mayoría de los *bugs* se encuentran en el paso 4. El valor no es lo que pensabas. La lección 12b (Depura como un científico) enseña esta rutina como un método con hipótesis y experimentos.

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

Mira este programa otra vez. La caída está en una línea, pero ¿el error está en esa línea?

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

Adivina qué línea señala Node. Luego lee la salida real, con los nombres largos de carpetas acortados:

```text
TypeError: Cannot read properties of undefined (reading 'name')
    at getName (demo.ts:6:16)
    at printName (demo.ts:10:15)
    at Object.<anonymous> (demo.ts:13:1)
```

Node señala la línea 6. La línea 6 está bien. El error es que nadie tiene un perro con id 2, y la línea 13 lo pidió. El texto `as Dog` le dijo a TypeScript que confiara en ti, así que escondió el `undefined`.

### De vuelta al acertijo

La caída está en la línea 4, pero la línea 4 no es el error. Mimi no tiene dueño. El código dice `as { name: string }`, que le dice a TypeScript "confía en mí, el dueño está ahí". Los datos y el código no coinciden, y el `as` lo escondió. Una buena solución decide qué debe pasar con un perro sin dueño: imprimir "no owner" (sin dueño) o reportar un mensaje claro.

## Profundiza

### Por qué un stack trace es una lista

Las funciones llaman a otras funciones. Node guarda una lista de las funciones que se están ejecutando ahora. Esta lista es la **pila de llamadas** (*call stack*). Cuando ocurre una caída, Node imprime la lista. Eso es el *stack trace*.

Léela de arriba hacia abajo. `getName` se rompió. Fue llamada por `printName`, línea 10. Esa fue llamada por el archivo principal, línea 13. El valor incorrecto vino del fondo de la lista. Lee hacia abajo en la pila para encontrar quién lo pasó. Luego pregúntate: ¿qué esperaba aquí y qué recibí?

### Fallo con ruido o fallo en silencio

Un programa puede fallar con ruido, con una caída y un mensaje. O puede fallar en silencio e imprimir algo incorrecto. Con ruido suele ser mejor, porque lo ves. Compara la caída con esta "solución" para Mimi:

```ts
console.log(`${dog.name} belongs to ${dog.owner?.name}`);
```

El `?.` significa "si falta el dueño, da `undefined`". El programa imprime `Mimi belongs to undefined` y no se rompe. El error desapareció, pero el problema sigue ahí.

### Cómo aparece en el trabajo de automatización QA

Un error es un mensaje del código. No debes esconderlo. Este es un error común:

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

Los errores de Playwright están escritos para ayudar. Cuando una comprobación no encuentra un elemento, el fallo nombra el *locator* que usó y dice que el elemento no se encontró. Lee ese texto antes de cambiar cualquier cosa.

> **Consejo:** Puedes pegar un mensaje de error en un asistente de IA y preguntar qué significa. Luego compara la respuesta con el archivo y la línea del mensaje. Nunca conserves una solución que no puedas explicar.

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

Construye un programa en un mundo que elijas, como recetas, un zoológico o una liga de fútbol. Debe romperse con un *stack trace*, y la línea que se rompe no debe ser la línea que tiene el error. Luego escribe una segunda versión que no se rompa y que le diga al usuario, en una frase clara, qué está mal con los datos.

Crea el archivo `exercises/challenges/12-reading-errors.ts` para la versión que se rompe y `exercises/challenges/12-clear-error.ts` para la versión clara.

Está terminado cuando:

- Ejecutar `node exercises/challenges/12-reading-errors.ts` se rompe con un `TypeError`, y el *stack trace* tiene al menos tres líneas `at` en tu propio archivo.
- Un comentario en el archivo nombra la línea que se rompió y la otra línea que tiene el error.
- Ejecutar `node exercises/challenges/12-clear-error.ts` imprime una frase con el nombre de lo que está mal, por ejemplo `Recipe "Salad" has no oven`, y ningún *stack trace*.
- Justo después del segundo programa, el código de salida es 1. En PowerShell, ejecuta `$LASTEXITCODE` para verlo.

Vas a necesitar algo que esta lección no enseñó: una forma de decirle a la computadora que tu programa falló, aunque atrapaste el error. Busca: `node process.exitCode`.

## Piénsalo bien

1. ¿Qué imprime este programa y por qué?

```ts
const area = Number("5cm") * 5;
console.log(area, area === area);
```

<details><summary>Respuesta</summary>

Imprime `NaN false`. `Number("5cm")` no puede hacer un número con ese texto, pero no lanza un error. Devuelve `NaN`, que significa "no es un número", y `NaN` por 5 sigue siendo `NaN`. `NaN` es el único valor que no es igual a sí mismo, así que `area === area` es `false`. El programa corre sin ningún mensaje, así que solo revisar el valor encuentra este *bug* de lógica.

</details>

2. Este programa corre e imprime un buen mensaje. Encuentra el *bug*.

```ts
async function checkOven(): Promise<void> {
  throw new Error("Oven is cold");
}

async function main(): Promise<void> {
  try {
    await checkOven();
  } catch {
    // ignore
  }
  console.log("Dinner is ready");
}

main();
```

<details><summary>Respuesta</summary>

El `catch` vacío se traga el error, así que el programa dice "Dinner is ready" aunque el horno está frío. Nada te avisa de que algo salió mal. Quita el `try` y el `catch`, o en `catch` haz algo útil y pasa el error hacia arriba con `throw error`. No puedes confiar en un programa que esconde sus fallos.

</details>

3. Una función debe encontrar un perro por su id. La versión A usa `find(...) as Dog`. La versión B revisa el resultado y lanza `new Error("Dog 2 not found")` cuando es `undefined`. Ambas funcionan cuando el perro existe. ¿Cuál es mejor aquí y cuándo elegirías la A?

<details><summary>Respuesta</summary>

La versión B es mejor porque el error nombra el problema real en el lugar donde empieza. Con la versión A la caída llega más tarde, en otra línea, con un mensaje sobre `undefined`. La versión A es aceptable solo cuando sabes que el valor no puede faltar, por ejemplo porque lo acabas de crear una línea antes. La elección depende de quién controla los datos. Los datos de un archivo, de un usuario o de un servidor siempre pueden faltar.

</details>

4. Un colega "arregla" la caída de Mimi con `dog.owner?.name`. El programa ahora corre hasta el final. ¿Qué cambió y cuál es el riesgo?

<details><summary>Respuesta</summary>

La caída desapareció, y el programa imprime `Mimi belongs to undefined`. El problema de los datos sigue ahí, pero ahora está en silencio. Si este texto va a un reporte o a un cliente, nadie lo nota hasta más tarde. El riesgo es que un fallo ruidoso y fácil se volvió uno silencioso y difícil. Una mejor solución decide qué debe pasar con un dueño que falta, por ejemplo un texto claro como "no owner".

</details>

5. Explícale a un compañero qué te dice un *stack trace*, en tres frases, sin usar la palabra "pila".

<details><summary>Respuesta</summary>

Una buena respuesta dice tres cosas. Es una lista de las funciones que se estaban ejecutando cuando ocurrió la caída. Las primeras líneas muestran dónde fue la caída, y las líneas siguientes muestran quién la llamó, una por una. El error suele estar más abajo en la lista que la primera línea.

</details>

6. Una lista de perros está vacía, y el código hace `dogs[0].name`. ¿Qué pasa en tiempo de ejecución? ¿Qué dice TypeScript estricto antes de ejecutar?

<details><summary>Respuesta</summary>

En tiempo de ejecución, `dogs[0]` es `undefined`, así que el programa se detiene con "Cannot read properties of undefined (reading 'name')". Con la configuración estricta de este curso, TypeScript reporta `Object is possibly 'undefined'` antes de ejecutar. El caso límite es la lista vacía. Revisa el valor primero con `if (first !== undefined)` y decide qué debe hacer el programa cuando no hay perros.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es la pila de llamadas (*call stack*) en JavaScript y cómo se relaciona con un *stack trace*?**
   - Busca: `javascript call stack explained`
   - Pruébalo: escribe una función que se llame a sí misma sin fin, por ejemplo `function f() { f(); } f();`, y ejecútala. Lee el mensaje y las primeras líneas.
   - Una buena respuesta explica: qué se agrega y qué se quita de la pila cuando las funciones se ejecutan, y qué es un desbordamiento de pila (*stack overflow*).

2. **¿Cuáles son los tipos de error comunes de JavaScript, como `TypeError`, `ReferenceError` y `SyntaxError`?**
   - Busca: `MDN javascript error types TypeError ReferenceError`
   - Pruébalo: escribe tres programas diminutos que causen cada uno un tipo de error distinto. Ejecútalos y anota la primera línea de cada mensaje.
   - Una buena respuesta explica: qué causa cada tipo y un ejemplo corto de código para cada uno.

3. **¿Cómo ayuda el Trace Viewer de Playwright a un tester a encontrar por qué falló un test?**
   - Busca: `playwright trace viewer`
   - Pruébalo: lee la página de la documentación de Playwright sobre el *trace viewer*. Escribe el comando que abre un archivo de traza guardado y anota tres cosas que el visor muestra en cada paso.
   - Una buena respuesta explica: qué registra una traza (*trace*), qué puedes ver en ella y cómo ayuda más que solo leer el texto del error.

## Siguiente paso

En la siguiente lección aprendes a depurar como un científico: cómo encontrar *bugs* que no dan ningún mensaje de error.
