---
title: Tus propios tipos
duration: 50 min
---

## Objetivo

En esta lección das nombre a la forma de tus objetos y limitas los valores permitidos, para que TypeScript encuentre errores antes de que el programa se ejecute.

- Escribir un alias de tipo para la forma de un objeto, con una propiedad opcional.
- Limitar un valor de texto a un conjunto fijo de opciones, y explicar por qué es más seguro que un texto cualquiera.
- Predecir qué errores atrapa TypeScript antes de ejecutar el programa, y cuáles no puede atrapar.
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

Por convención, los nombres de tipo empiezan con mayúscula. Ahora TypeScript comprueba que cada `Dog` tenga las propiedades correctas:

```ts
type Dog = { name: string; age: number };

// Error: Property 'age' is missing
const missing: Dog = { name: "Mimi" };

// Error: Type 'string' is not assignable to type 'number'
const wrong: Dog = { name: "Luna", age: "three" };
```

Las dos líneas reciben un subrayado rojo. Encuentras el error mientras escribes, sin esperar a que el programa se ejecute.

## Propiedades opcionales

Algunos valores no siempre están. Un perro puede tener un apodo, o no. Pon `?` después del nombre de la propiedad para hacerla **opcional**.

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

El tipo de `nickname` es `string | undefined`. El signo `|` significa "o", y `undefined` es el "aquí no hay valor" que viste en la lección «Tipos».

## Limitar las opciones

Una pizzería tiene una función que da el precio según el tamaño. Si el parámetro es un `string` cualquiera, un pedido con el tamaño escrito `"Large"`, con L mayúscula, no produce ningún error:

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

El programa imprime `0`. `"Large"` no es igual a `"large"`, así que los dos `if` se saltan y la última línea devuelve 0: el cliente recibe una pizza gratis. TypeScript no pudo avisar, porque `"Large"` es un `string` válido.

Un tamaño de pizza solo debería ser `"small"`, `"medium"` o `"large"`. Puedes crear un tipo a partir de valores de texto exactos, unidos con `|`. Esto se llama una **unión**.

```ts
type Size = "small" | "medium" | "large";

type Pizza = {
  flavour: string;
  size: Size;
};

const order: Pizza = { flavour: "Margherita", size: "large" };
console.log(order.size);
```

El programa imprime `large`. Un valor fuera de la lista es un error:

```ts
type Size = "small" | "medium" | "large";

// Error: Type '"Large"' is not assignable to type 'Size'
const size: Size = "Large";
```

TypeScript atrapa el error de ortografía antes de que ejecutes nada. Si cambias el tipo del parámetro de `pizzaPrice` a `Size`, la llamada con `"Large"` también falla:

```ts
function pizzaPrice(size: Size): number {
  // ...
}

pizzaPrice("Large");
```

La llamada recibe un subrayado rojo: `Argument of type '"Large"' is not assignable to parameter of type 'Size'`. Una unión convierte una respuesta incorrecta y silenciosa en un error fuerte y temprano. Un error que ves mientras escribes cuesta segundos; uno que llega a un cliente cuesta mucho más.

> **Nota:** Otros tutoriales usan `enum` para esto. En este curso, usa una unión de valores de texto. Es más simple y funciona en todas partes.

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

Después del `if` con `return`, TypeScript sabe que `nickname` es un `string`. Sin ese `if`, rechaza `dog.nickname.toUpperCase()` con el mensaje `'dog.nickname' is possibly 'undefined'`, y te protege del fallo que ocurriría con Mimi.

## Leer los tipos Array y Promise

A veces ves tipos con `<` y `>`. Solo necesitas leerlos, no escribirlos. Lee la parte dentro de `< >` como "de".

- `Array<Dog>` es "un array de perros". Es lo mismo que `Dog[]`.
- `Promise<string>` es "un string que llegará más tarde".

## Profundiza

### Los tipos existen solo mientras escribes

TypeScript quita todos los tipos antes de que el programa se ejecute. Node solo ve JavaScript simple, así que un tipo no puede comprobar datos que llegan mientras el programa corre.

```ts
type Dog = { name: string; age: number };

const parsed: Dog = JSON.parse('{"name":"Rex","age":"abc"}');
console.log(parsed.age + 1);
```

TypeScript no muestra ningún error. El programa imprime:

```text
abc1
```

El tipo dice que `age` es un número, pero los datos reales tienen texto. `JSON.parse` devuelve un valor de tipo `any`, que significa "cualquier cosa", así que TypeScript lo acepta sin comprobar. El tipo que escribes es lo que esperas, no una prueba de lo que llegó.

### Cuándo no escribir un tipo

No escribas un tipo para todo. Esta línea no necesita ninguno:

```ts
const count = 3;
```

TypeScript ya sabe que `count` es un número. Escribe tipos para los parámetros de las funciones, para formas que muchos lugares comparten y para opciones fijas. Los tipos de más hacen el código más largo y no lo hacen más seguro. La idea aquí es *KISS*: mantenlo simple (*keep it simple*). Una idea relacionada es *YAGNI*, "No lo vas a necesitar" (*You Aren't Gonna Need It*): no construyas para necesidades que solo imaginas, como un tipo con diez propiedades opcionales porque "quizá las necesitemos".

Usa una unión solo cuando las opciones son una lista pequeña y fija. Si el texto puede ser cualquier cosa, como el nombre que escribe una persona, usa `string`.

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

Elige tu propio mundo, por ejemplo métodos de pago en una tienda o figuras geométricas. Escribe un tipo con al menos tres clases de cosa. Cada clase tiene sus propias propiedades: un círculo tiene un `radius` y un cuadrado tiene un `side`. Luego escribe una función que reciba cualquiera de ellos y devuelva un texto que lo describa.

Crea el archivo `exercises/challenges/your-own-types.ts`. Ejecútalo con `node exercises/challenges/your-own-types.ts`.

Está terminado cuando:

- El tipo tiene al menos tres clases, y una clase no puede tener las propiedades de otra. Compruébalo a propósito y luego quita la línea incorrecta.
- Tu función maneja cada clase, y ejecutar el archivo imprime una línea por clase.
- Agregas una cuarta clase al tipo, y TypeScript muestra un error dentro de tu función hasta que manejes la clase nueva.
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

Imprime `Nickname: undefined`. La propiedad `nickname` es opcional y no se dio, así que su valor es `undefined`, y una plantilla de texto convierte cualquier valor en texto. TypeScript no te detiene, pero el resultado probablemente no es lo que quieres en una pantalla. Sería mejor una comprobación con `if`.

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

La función se escribió cuando solo existían `small` y `large`. Cuando se agregó `"medium"` al tipo, siguió compilando, porque "todo lo que no es small cuesta 12" es código válido. El tipo no obligó al autor a pensar en el tamaño nuevo. Una forma más segura lista cada tamaño con su propio `if` y termina con una comprobación que falla al compilar cuando falta un tamaño, como la del reto. Los tipos atrapan toda una clase de errores, no todos.

</details>

3. ¿Qué se rompe si el requisito cambia, y el tipo pasa de `age: number` a `age: string` porque algunos perros tienen "como 3"?

```ts
type Dog = { name: string; age: string };
const rex: Dog = { name: "Rex", age: "3" };
console.log(rex.age + 1);
```

<details>
<summary>Respuesta</summary>

Un código como `rex.age * 2` recibe un subrayado rojo, porque un texto no se puede multiplicar. Eso es bueno: el compilador te muestra los lugares que debes revisar. Pero `rex.age + 1` está permitido. Con un string, `+` une textos, y el programa imprime `31`, no `4`. Después de un cambio de tipo así, busca cada uso de la propiedad y lee cada uno.

</details>

## Siguiente paso

En la siguiente lección usarás `map`, `filter` y `find` para trabajar con listas de objetos con tipo.
