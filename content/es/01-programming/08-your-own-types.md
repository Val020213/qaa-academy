---
title: Tus propios tipos
summary: Da nombre a la forma de tus objetos con alias de tipo, propiedades opcionales y uniones de literales, y deja que la computadora encuentre errores antes de que el programa se ejecute.
duration: 65 min
---

## Empieza con un acertijo

Una pizzería tiene una función que da el precio según el tamaño. Llega un pedido de un cliente con el tamaño escrito `"Large"`, con L mayúscula.

```ts
function pizzaPrice(size: string): number {
  if (size === "small") {
    return 8;
  }
  if (size === "large") {
    return 12;
  }
  return 0;
}

console.log(pizzaPrice("Large"));
```

¿Qué imprime? No hay mensaje de error y el programa no se detiene. Ahora piensa en la pizzería: ¿qué le pasa al cliente, y cómo podría la computadora avisar al programador antes de que el programa se ejecute?

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Predecir qué errores atrapa TypeScript antes de ejecutar el programa, y cuáles no puede atrapar.
- Escribir un alias de tipo para la forma de un objeto, con una propiedad opcional.
- Limitar un valor de texto a un conjunto fijo de opciones, y explicar por qué es más seguro que un texto cualquiera.
- Decidir cuándo vale la pena escribir un tipo y cuándo es solo ruido.

## Alias de tipo

En la lección «Objetos» escribiste el tipo de un objeto una y otra vez. Es largo y es fácil equivocarse.

Un **alias de tipo** (*type alias*) da un nombre a un tipo. Lo escribes una vez y lo usas en todas partes.

```ts
type Dog = {
  name: string;
  age: number;
};

const rex: Dog = {
  name: "Rex",
  age: 3,
};

console.log(rex.name);
```

El programa imprime `Rex`.

Por convención, los nombres de tipo empiezan con mayúscula. Ahora TypeScript comprueba que cada `Dog` tenga las propiedades correctas.

¿Qué esperas cuando falta una propiedad, o cuando un valor tiene el tipo equivocado?

```ts
type Dog = { name: string; age: number };

// Error: Property 'age' is missing
const missing: Dog = { name: "Mimi" };

// Error: Type 'string' is not assignable to type 'number'
const wrong: Dog = { name: "Luna", age: "three" };
```

Las dos líneas reciben un subrayado rojo. Encuentras el error mientras escribes. No esperas a que el programa se ejecute.

## Propiedades opcionales

Algunos valores no siempre están. Un perro puede tener un apodo, o no.

Pon `?` después del nombre de la propiedad para hacerla **opcional**.

```ts
type Dog = {
  name: string;
  age: number;
  nickname?: string;
};

const withNickname: Dog = { name: "Rex", age: 3, nickname: "Rexy" };
const withoutNickname: Dog = { name: "Mimi", age: 5 };

console.log(withNickname.nickname);
console.log(withoutNickname.nickname);
```

El programa imprime:

```text
Rexy
undefined
```

El tipo de `nickname` es `string | undefined`. El signo `|` significa "o". La lección «Tipos» explicó `undefined`: significa "aquí no hay valor".

## Limitar las opciones

Un tamaño de pizza solo debería ser `"small"`, `"medium"` o `"large"`. Si alguien escribe `"Large"`, es un error.

Puedes crear un tipo a partir de valores de texto exactos. Únelos con `|`. Esto se llama una **unión**.

```ts
type Size = "small" | "medium" | "large";

type Pizza = {
  flavour: string;
  size: Size;
};

const order: Pizza = { flavour: "Margherita", size: "large" };
console.log(order.size);
```

El programa imprime `large`.

Ahora prueba un valor incorrecto:

```ts
type Size = "small" | "medium" | "large";

// Error: Type '"Large"' is not assignable to type 'Size'
const size: Size = "Large";
```

TypeScript atrapa el error de ortografía antes de que ejecutes nada. Así usamos las opciones fijas en este curso.

> **Nota:** Otros tutoriales usan `enum` para esto. En este curso, usa una unión de valores de texto. Es más simple y funciona en todas partes.

### De vuelta al acertijo

El programa imprime `0`. El texto `"Large"` no es igual a `"large"`, así que los dos `if` se saltan, y la última línea devuelve 0. El cliente recibe una pizza gratis. TypeScript no pudo avisarte, porque el tipo del parámetro era `string`, y `"Large"` es un string válido. Cambia el tipo del parámetro a `Size`:

```ts
function pizzaPrice(size: Size): number {
  // ...
}

pizzaPrice("Large");
```

Ahora la llamada tiene un subrayado rojo: `Argument of type '"Large"' is not assignable to parameter of type 'Size'`. Una unión convierte una respuesta incorrecta y silenciosa en un error fuerte y temprano. Un error que ves mientras escribes cuesta segundos. Un error que llega a un cliente cuesta mucho más.

## Estrechar con if

A veces un valor puede ser de varios tipos. Dentro de un `if`, TypeScript aprende cuál es. Esto se llama **estrechamiento** (*narrowing*).

```ts
type Dog = {
  name: string;
  age: number;
  nickname?: string;
};

function callName(dog: Dog): string {
  if (dog.nickname === undefined) {
    return dog.name;
  }
  return dog.nickname.toUpperCase();
}

console.log(callName({ name: "Rex", age: 3, nickname: "Rexy" }));
console.log(callName({ name: "Mimi", age: 5 }));
```

El programa imprime:

```text
REXY
Mimi
```

Después del `if` con `return`, TypeScript sabe que `nickname` es un `string`. Intenta quitar el `if`. TypeScript rechaza `dog.nickname.toUpperCase()` con el mensaje `'dog.nickname' is possibly 'undefined'`. Te protege del fallo que ocurriría con Mimi.

## Leer los tipos Array y Promise

A veces ves tipos con `<` y `>`, como `Array<Dog>`. Solo necesitas leerlos, no escribirlos.

- `Array<Dog>` significa una lista de perros. Es lo mismo que `Dog[]`.
- `Promise<string>` significa "un string que llegará más tarde". La lección «async y await» lo explica.

Lee la parte dentro de `< >` como "de". `Array<Dog>` es "un array de perros".

## Profundiza

### Los tipos existen solo mientras escribes

TypeScript quita todos los tipos antes de que el programa se ejecute. Node solo ve JavaScript simple. Por eso un tipo no puede comprobar datos que llegan mientras el programa corre.

```ts
type Dog = { name: string; age: number };

const parsed: Dog = JSON.parse('{"name":"Rex","age":"abc"}');
console.log(parsed.age + 1);
```

TypeScript no muestra ningún error. El programa imprime:

```text
abc1
```

El tipo dice que `age` es un número. Los datos reales tienen texto. `JSON.parse` devuelve un valor de tipo `any`, que significa "cualquier cosa", así que TypeScript lo acepta sin comprobar. Le dijiste a TypeScript lo que esperas, y te creyó.

Este es el único vínculo con las pruebas en esta lección. La respuesta de una API son datos de afuera. Un tipo describe lo que esperas, no lo que envió el servidor. Tu test igual debe comprobar los valores reales.

### Una forma, escrita una vez

Un alias de tipo también sirve para evitar la repetición. Esta idea se llama *DRY*, "No te repitas" (*Don't Repeat Yourself*). Cada pieza de conocimiento vive en un solo lugar. La estudiarás al final de este módulo.

Mira `Size`. Los valores permitidos están escritos una vez:

```ts
type Size = "small" | "medium" | "large" | "family";
```

Agregas `"family"` aquí, y todos los lugares que usan `Size` lo aceptan. Si hubieras escrito las opciones en diez funciones, cambiarías diez lugares y podrías olvidar uno.

Pero ten cuidado: una opción nueva no hace que el código viejo la maneje. Una función que dice "small cuesta 8, cualquier otro cuesta 12" sigue compilando, y le da al tamaño family el precio de un large. El verificador de tipos lo acepta, porque el código es válido. Solo una persona, o un test, puede ver que la regla está mal. Los tipos atrapan toda una clase de errores. No atrapan todos los errores.

### Cuándo no escribir un tipo

No escribas un tipo para todo. Esta línea no necesita ninguno:

```ts
const count = 3;
```

TypeScript ya sabe que `count` es un número. Escribe tipos para los parámetros de las funciones, para formas que muchos lugares comparten y para opciones fijas. Los tipos de más hacen el código más largo y no lo hacen más seguro. La idea aquí es *KISS*: mantenlo simple (*keep it simple*). Una idea relacionada es *YAGNI*, "No lo vas a necesitar" (*You Aren't Gonna Need It*): no construyas para necesidades que solo imaginas. No escribas un tipo grande con diez propiedades opcionales porque "quizá las necesitemos".

Elige también la herramienta correcta. Usa una unión solo cuando las opciones son una lista pequeña y fija. Si el texto puede ser cualquier cosa, como el nombre que escribe una persona, usa `string`.

## Práctica

1. Crea el archivo `exercises/01-programming/types-practice.ts`.
2. Escribe un tipo `Mood` con los valores `"happy"`, `"tired"` y `"hungry"`.
3. Escribe un tipo `Pet` con `name` (string), `age` (number), `mood` (`Mood`) y un `owner` (string) opcional.
4. Crea dos objetos `Pet`, uno con dueño y otro sin dueño.
5. A propósito, escribe `mood: "angry"` y mira el subrayado rojo. Luego arréglalo.
6. Abre `exercises/01-programming/08-your-own-types.ts`. Reemplaza cada `// TODO` con código.
7. Ejecuta el archivo de ejercicios con este comando:

```bash
node exercises/01-programming/08-your-own-types.ts
```

Haz que cada línea diga `OK`.

## Reto

Elige tu propio mundo: métodos de pago en una tienda, figuras, vehículos, mensajes que una app puede enviar, jugadas de un juego de cartas. Escribe un tipo con al menos tres clases de cosa. Cada clase tiene sus propias propiedades. Por ejemplo, un círculo tiene un `radius` y un cuadrado tiene un `side`. Luego escribe una función que reciba cualquiera de ellos y devuelva un texto que lo describa.

Crea el archivo `exercises/challenges/your-own-types.ts`. Ejecútalo con `node exercises/challenges/your-own-types.ts`.

Está terminado cuando:

- El tipo tiene al menos tres clases, y una clase no puede tener las propiedades de otra. TypeScript muestra un subrayado rojo cuando lo intentas. Compruébalo a propósito y luego quita la línea incorrecta.
- Tu función maneja cada clase, y ejecutar el archivo imprime una línea por clase.
- Agregas una cuarta clase al tipo, y TypeScript muestra un error dentro de tu función hasta que manejes la clase nueva. Compruébalo a propósito y luego manéjala o quítala.
- `pnpm typecheck` no muestra ningún error para tu archivo al final.

Vas a necesitar algo que esta lección no enseñó: cómo darle una etiqueta a cada clase para que TypeScript sepa de cuál se trata, y cómo hacer que TypeScript se queje de una clase que olvidaste. Busca `typescript discriminated union` y `typescript exhaustive check never`.

## Piénsalo bien

1. Predice la salida y explica por qué.

```ts
type Dog = { name: string; age: number; nickname?: string };

const rex: Dog = { name: "Rex", age: 3 };
console.log(`Nickname: ${rex.nickname}`);
```

<details>
<summary>Respuesta</summary>

Imprime `Nickname: undefined`. La propiedad `nickname` es opcional y no se dio, así que su valor es `undefined`. Una plantilla de texto convierte cualquier valor en texto, por eso ves la palabra `undefined`. TypeScript no te detiene, pero el resultado probablemente no es lo que quieres en una pantalla. Sería mejor una comprobación con `if`.

</details>

2. El código compila y se ejecuta. Una pizza mediana cuesta 12, pero la pizzería quiere 10. Encuentra el bug.

```ts
type Size = "small" | "medium" | "large";

function price(size: Size): number {
  if (size === "small") {
    return 8;
  }
  return 12;
}
```

<details>
<summary>Respuesta</summary>

La función se escribió cuando solo existían `small` y `large`. Cuando se agregó `"medium"` al tipo, la función siguió compilando, porque "todo lo que no es small cuesta 12" es código válido. El tipo no obligó al autor a pensar en el tamaño nuevo. Una forma más segura lista cada tamaño a propósito, con un `if` para cada uno y una comprobación final que falla al compilar cuando falta un tamaño. Verás esta idea en el reto.

</details>

3. Las dos versiones funcionan. ¿Cuál es mejor aquí, y qué te haría elegir la otra?

```ts
type DogA = { name: string; nickname?: string };
type DogB = { name: string; nickname: string };
// For DogB, "no nickname" is written as an empty text: ""
```

<details>
<summary>Respuesta</summary>

La versión A suele ser mejor, porque `undefined` significa "ningún valor" y TypeScript obliga a cada lector a comprobarlo. Con la versión B, el texto vacío parece un valor real, así que una pantalla puede mostrar `Nickname: ` sin nada después y ninguna comprobación te avisa. Elegirías B cuando los datos vienen de un formulario o de un archivo que siempre da un texto, y cuando un texto vacío es un valor normal e inofensivo en tu programa. La elección depende de si "falta" y "vacío" significan cosas distintas para tus usuarios.

</details>

4. ¿Qué se rompe si el requisito cambia, y el tipo pasa de `age: number` a `age: string` porque algunos perros tienen "como 3"?

```ts
type Dog = { name: string; age: string };
const rex: Dog = { name: "Rex", age: "3" };
console.log(rex.age + 1);
```

<details>
<summary>Respuesta</summary>

Un código como `rex.age * 2` recibe un subrayado rojo, porque un texto no se puede multiplicar. Eso es bueno: el compilador te muestra los lugares que debes revisar. Pero `rex.age + 1` está permitido. Con un string, `+` une textos, y el programa imprime `31`, no `4`. Esto muestra que un cambio de tipo no siempre te da una lista de errores que encuentre todos los problemas. Después de un cambio así, busca cada uso de la propiedad y lee cada uno.

</details>

5. Explícale a un compañero, en tres oraciones y sin usar la palabra "incorrecto", por qué TypeScript no impidió que `parsed.age + 1` imprimiera `abc1`.

<details>
<summary>Respuesta</summary>

Una buena respuesta podría ser: TypeScript revisa el código mientras escribes, y luego quita los tipos, así que Node nunca los ve. Los datos que vienen de afuera, como los de `JSON.parse`, llegan solo mientras el programa se ejecuta. TypeScript no puede conocerlos, así que `JSON.parse` devuelve `any` y el tipo que escribes es una promesa, no una prueba. La razón clave es el momento: la revisión ocurre antes de que existan los datos.

</details>

6. Un compañero quiere un alias de tipo para cada objeto del proyecto, incluso los que se usan una sola vez. ¿Dónde pones el límite?

<details>
<summary>Respuesta</summary>

No hay una única respuesta. Los tipos ayudan cuando una forma la comparten varios lugares, cuando entra a una función como parámetro, o cuando un error en ella sería costoso. Para un objeto pequeño que se usa una vez en una función, TypeScript ya conoce su forma, y un nombre agrega longitud y una cosa más que leer. Este es el equilibrio entre seguridad y **KISS** o **YAGNI**. El límite depende de cuántos lugares usan la forma y de cuánto tiempo vivirá el código.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Cuál es la diferencia entre `type` e `interface` en TypeScript?**
   - Busca: `typescript type vs interface`
   - Pruébalo: escribe la forma `Dog` de las dos maneras. Luego intenta hacer una unión de dos formas con cada una, y lee cuál funciona.
   - Una buena respuesta explica: cómo describe cada uno la forma de un objeto, una cosa que solo `type` puede hacer, y cuál usa este curso y por qué.

2. **¿Qué significa que los tipos de TypeScript se borran al ejecutar?**
   - Busca: `typescript types erased at runtime`
   - Pruébalo: escribe una función con un parámetro con tipo. Llámala desde un segundo archivo con datos de `JSON.parse` del tipo equivocado. Ejecútalo con `node` y comprueba que no aparece ningún error de tipo.
   - Una buena respuesta explica: qué se quita antes de que el programa se ejecute, por qué las comprobaciones de tipo no existen cuando corre, y un bug que esto puede esconder.

3. **¿Cómo comprueban otras personas los datos que vienen de afuera, por ejemplo de un formulario o de la respuesta de un servidor?**
   - Busca: `typescript runtime validation zod`
   - Pruébalo: escribe una función `isDog(value)` que reciba `unknown` y devuelva `true` solo si el valor tiene un `name` de tipo string y un `age` de tipo number. Pruébala con tres valores buenos y tres malos.
   - Una buena respuesta explica: por qué un tipo no puede hacer este trabajo, y cómo una comprobación en tiempo de ejecución cierra el hueco.

## Siguiente paso

En la siguiente lección usarás `map`, `filter` y `find` para trabajar con listas de objetos con tipo.
