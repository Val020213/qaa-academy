---
title: Tomar decisiones
summary: Compara valores y usa if, else if y else para que tu programa elija qué hacer.
duration: 30 min
---

## Objetivo

- Comparar dos valores con `===` y `!==`.
- Elegir entre acciones con `if`, `else if` y `else`.
- Combinar condiciones con `&&`, `||` y `!`.

## Comparaciones

Un programa a menudo necesita hacer una pregunta. ¿El estado es "passed"? ¿El precio es mayor que 50?

Una **comparación** hace esa pregunta. La respuesta siempre es un boolean: `true` o `false`.

```ts
console.log(5 > 3);
console.log("passed" === "passed");
console.log("passed" === "failed");
```

Esto muestra:

```text
true
true
false
```

Estos son los signos de comparación:

| Signo | Significado              |
| ----- | ------------------------ |
| `===` | es igual a               |
| `!==` | no es igual a            |
| `>`   | es mayor que             |
| `<`   | es menor que             |
| `>=`  | es mayor o igual que     |
| `<=`  | es menor o igual que     |

> **Cuidado:** `=` guarda un valor. `===` compara dos valores. No los confundas. Además, nunca uses `==`. Tiene reglas extrañas. Usa siempre `===` y `!==`.

## if

Una instrucción **if** ejecuta código solo cuando una condición es `true`. El código va dentro de llaves `{ }`.

```ts
const status = "failed";

if (status === "failed") {
  console.log("Create a bug report");
}
console.log("Done");
```

Esto muestra:

```text
Create a bug report
Done
```

Si `status` fuera `"passed"`, el primer mensaje no se mostraría. Solo se mostraría `Done`.

## else

Usa **else** para ejecutar código cuando la condición es `false`.

```ts
const status = "passed";

if (status === "passed") {
  console.log("Test OK");
} else {
  console.log("Test needs attention");
}
```

Esto muestra:

```text
Test OK
```

## else if

Usa **else if** cuando tienes más de dos opciones. La computadora revisa las condiciones desde arriba. Ejecuta el primer bloque que sea verdadero y se salta el resto.

```ts
const openBugs = 3;

if (openBugs === 0) {
  console.log("clean");
} else if (openBugs < 5) {
  console.log("minor");
} else {
  console.log("critical");
}
```

Esto muestra:

```text
minor
```

Aquí `openBugs === 0` es falso, así que la computadora sigue. Luego `openBugs < 5` es verdadero, así que muestra `minor` y se detiene.

El orden importa. Pon primero la condición más específica.

## Operadores lógicos

Puedes unir condiciones. Hay tres **operadores lógicos**.

`&&` significa Y. Los dos lados deben ser verdaderos.

`||` significa O. Al menos un lado debe ser verdadero.

`!` significa NO. Convierte `true` en `false` y `false` en `true`.

```ts
const hasUser = true;
const hasPassword = false;

console.log(hasUser && hasPassword);
console.log(hasUser || hasPassword);
console.log(!hasPassword);
```

Esto muestra:

```text
false
true
true
```

Aquí tienes una comprobación de *login* (inicio de sesión) que usa `&&`:

```ts
const userName = "ana";
const password = "";

if (userName !== "" && password !== "") {
  console.log("Send the login form");
} else {
  console.log("Show an error: fill in all fields");
}
```

Esto muestra:

```text
Show an error: fill in all fields
```

El texto `""` es un string vacío. La contraseña está vacía, así que la segunda parte es falsa. Con `&&`, una sola parte falsa hace falsa toda la condición.

Aquí hay un ejemplo con `||`:

```ts
const status = "blocked";

if (status === "failed" || status === "blocked") {
  console.log("Needs review");
}
```

Esto muestra:

```text
Needs review
```

Fíjate en que escribes la comparación completa en ambos lados. `status === "failed" || "blocked"` no funciona como esperas.

## Una nota breve sobre truthy y falsy

JavaScript te deja escribir `if (name)` sin una comparación. Trata algunos valores como falsos: `""`, `0`, `null` y `undefined`. Se llaman ***falsy*** (equivalentes a falso). La mayoría de los otros valores son ***truthy*** (equivalentes a verdadero).

Es un tema corto, pero puede sorprenderte. El número `0` es falsy, aunque `0` sea un resultado válido.

> **Consejo:** Si estás empezando, escribe la comparación completa, como `name !== ""`. Es más claro y más seguro.

## Práctica

1. Crea el archivo `exercises/01-programming/decisions.ts`.
2. Crea una `const` llamada `score` con un número. Escribe un `if` y un `else` que muestren `pass` cuando la puntuación sea 50 o más, y `fail` en los demás casos.
3. Cambia la puntuación. Ejecuta el archivo cada vez. Comprueba que la salida cambia.
4. Añade un `else if` para un tercer caso: muestra `excellent` cuando la puntuación sea 90 o más. Ponlo antes del caso `pass`. Piensa por qué importa el orden.
5. Abre `exercises/01-programming/04-making-decisions.ts` y ejecútalo:

```bash
node exercises/01-programming/04-making-decisions.ts
```

Resuelve los ejercicios. Haz que todas las líneas digan `OK`.

## Comprueba lo que sabes

1. ¿Cuál es la diferencia entre `=` y `===`?

<details>
<summary>Respuesta</summary>

`=` guarda un valor en una variable. `===` compara dos valores y da `true` o `false`.

</details>

2. ¿Qué da `true && false`?

<details>
<summary>Respuesta</summary>

`false`. Con `&&`, los dos lados deben ser verdaderos.

</details>

3. ¿Qué muestra esto? `const n = 7; if (n > 10) { console.log("A"); } else if (n > 5) { console.log("B"); } else { console.log("C"); }`

<details>
<summary>Respuesta</summary>

Muestra B. La primera condición es falsa. La segunda es verdadera, así que la computadora se detiene ahí.

</details>

4. ¿Qué comparación usas para comprobar que dos valores son distintos?

<details>
<summary>Respuesta</summary>

`!==`

</details>

## Siguiente paso

En la próxima lección pondrás código en funciones, para poder darle un nombre y usarlo muchas veces.
