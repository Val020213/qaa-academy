---
title: Funciones
summary: Escribe funciones con parámetros y valores de retorno, y aprende por qué las funciones pequeñas con buen nombre hacen el código fácil de leer.
duration: 35 min
---

## Objetivo

- Escribir una función y llamarla.
- Usar parámetros para darle a una función su entrada.
- Usar `return` para recibir un resultado.
- Escribir una función flecha y un parámetro por defecto.

## Una función es una receta con nombre

Una **función** es un bloque de código con un nombre. Escribes los pasos una vez. Después usas el nombre cada vez que necesitas los pasos.

Piensa en una receta. La receta tiene un nombre y una lista de pasos. No copias los pasos cada vez. Dices "haz la receta".

```ts
function printGreeting() {
  console.log("Hello, QA!");
}

printGreeting();
printGreeting();
```

Esto muestra:

```text
Hello, QA!
Hello, QA!
```

Las primeras tres líneas **definen** la función. Empieza con la palabra `function`, luego el nombre, luego `()`, y después los pasos dentro de `{ }`. Definir no la ejecuta.

Las líneas `printGreeting();` **llaman** a la función. Una llamada ejecuta los pasos. Aquí los ejecuta dos veces.

## Parámetros

Un **parámetro** es una entrada de una función. Es una variable que recibe su valor cuando llamas a la función.

```ts
function greet(name: string) {
  console.log(`Hello, ${name}!`);
}

greet("Ana");
greet("Luis");
```

Esto muestra:

```text
Hello, Ana!
Hello, Luis!
```

El `: string` es una anotación de tipo. Dice que `name` debe ser texto. El valor que das en la llamada es un **argumento**. Aquí los argumentos son `"Ana"` y `"Luis"`.

Una función puede tener muchos parámetros. Sepáralos con comas.

## Valores de retorno

Una función puede devolver un resultado. La palabra `return` lo hace. El resultado es el **valor de retorno**.

```ts
function add(a: number, b: number): number {
  return a + b;
}

const total = add(2, 3);
console.log(total);
```

Esto muestra:

```text
5
```

El `: number` después de los paréntesis es el tipo del valor de retorno. Dice: esta función devuelve un número.

Cuando la computadora llega a `return`, la función termina. Cualquier línea después de `return` no se ejecuta.

> **Cuidado:** `console.log` muestra un valor en la terminal. `return` devuelve un valor al código que llamó a la función. No son lo mismo. Una función que solo muestra texto no tiene valor de retorno.

## Un ejemplo de QA

Aquí hay una función con una decisión dentro. Usa lo que aprendiste en la lección 04.

```ts
function verdict(status: string): string {
  if (status === "passed") {
    return "pass";
  }
  return "fail";
}

console.log(verdict("passed"));
console.log(verdict("failed"));
```

Esto muestra:

```text
pass
fail
```

La primera llamada devuelve el valor en el `if`. La segunda llamada se salta el `if` y llega al último `return`.

## Funciones flecha

Hay una forma más corta de escribir una función. Se llama **función flecha** (*arrow function*). Usa el signo `=>`.

```ts
const multiply = (a: number, b: number): number => {
  return a * b;
};

console.log(multiply(4, 5));
```

Esto muestra:

```text
20
```

Hace lo mismo que una función normal. Verás funciones flecha a menudo en los tests de Playwright. Puedes usar cualquiera de los dos estilos. Sé consistente dentro de un mismo archivo.

## Parámetros por defecto

Un **parámetro por defecto** tiene un valor que se usa cuando no das ningún argumento.

```ts
function formatResult(name: string, status: string = "pending"): string {
  return `${name}: ${status}`;
}

console.log(formatResult("Login test", "passed"));
console.log(formatResult("Search test"));
```

Esto muestra:

```text
Login test: passed
Search test: pending
```

## Por qué importan las funciones pequeñas

Dale a cada función un solo trabajo y un nombre claro. Así el código se lee casi como una frase.

```ts
function tax(amount: number): number {
  return amount / 10;
}

function totalWithTax(amount: number): number {
  return amount + tax(amount);
}

console.log(totalWithTax(100));
```

Esto muestra:

```text
110
```

Puedes leer `totalWithTax` sin mirar dentro de `tax`. Las funciones pequeñas son fáciles de probar, de corregir y de reutilizar. Un *test* (prueba automática) con pasos claros, como `login()` y `addToCart()`, es fácil de leer para tu equipo.

## Práctica

1. Crea el archivo `exercises/01-programming/functions.ts`.
2. Escribe una función `double` que reciba un número y lo devuelva multiplicado por 2. Muestra `double(21)`. Debe mostrar 42.
3. Escribe una función `statusMessage` con un parámetro `name` y un parámetro `status`. Devuelve `Test <name> is <status>`. Muestra un resultado.
4. Añade un valor por defecto para `status`. Llama a la función sin un segundo argumento.
5. Reescribe `double` como una función flecha.
6. Abre `exercises/01-programming/05-functions.ts` y ejecútalo:

```bash
node exercises/01-programming/05-functions.ts
```

Resuelve los ejercicios. Haz que todas las líneas digan `OK`.

## Comprueba lo que sabes

1. ¿Cuál es la diferencia entre definir y llamar a una función?

<details>
<summary>Respuesta</summary>

Definir escribe los pasos y les da un nombre. Llamar ejecuta los pasos.

</details>

2. ¿Qué es un parámetro?

<details>
<summary>Respuesta</summary>

Una entrada de una función. Es una variable que recibe su valor de la llamada.

</details>

3. ¿Qué hace `return`?

<details>
<summary>Respuesta</summary>

Devuelve un valor al código que llamó a la función, y termina la función.

</details>

4. ¿Qué muestra `formatResult("Search test")` si no hay un `console.log` alrededor?

<details>
<summary>Respuesta</summary>

Nada. La función devuelve un valor, pero no lo muestra. Necesitas `console.log` para verlo.

</details>

## Siguiente paso

En la próxima lección guardarás muchos valores en una lista y repetirás una acción para cada uno.
