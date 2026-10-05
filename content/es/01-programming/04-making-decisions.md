---
title: Tomar decisiones
summary: Compara valores y usa if, else if y else para que tu programa elija qué hacer.
duration: 45 min
---

## Objetivo

- Comparar dos valores con `===` y `!==`.
- Elegir entre acciones con `if`, `else if` y `else`.
- Combinar condiciones con `&&`, `||` y `!`.

## Comparaciones

Un programa a menudo necesita hacer una pregunta. ¿El estado es "passed"? ¿El precio es mayor que 50?

Una **comparación** hace una pregunta así. La respuesta siempre es un *boolean* (booleano): `true` o `false`.

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
| `!==` | es distinto de           |
| `>`   | es mayor que             |
| `<`   | es menor que             |
| `>=`  | es mayor o igual que     |
| `<=`  | es menor o igual que     |

> **Cuidado:** `=` guarda un valor. `===` compara dos valores. No los confundas. Además, nunca uses `==`. Tiene reglas extrañas. Usa siempre `===` y `!==`.

## if

Una instrucción **if** ejecuta código solo cuando una condición es `true`. El código va entre llaves `{ }`.

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

El texto `""` es un string vacío. La contraseña está vacía, así que la segunda parte es falsa. Con `&&`, una parte falsa hace falsa toda la condición.

Aquí tienes una con `||`:

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

JavaScript te deja escribir `if (name)` sin una comparación. Trata algunos valores como falsos: `""`, `0`, `null` y `undefined`. Se llaman **falsy**. La mayoría de los demás valores son **truthy**.

Es algo corto, pero puede sorprenderte. El número `0` es falsy, incluso cuando `0` es un resultado válido.

> **Consejo:** Si estás empezando, escribe la comparación completa, como `name !== ""`. Es más claro y más seguro.

## Profundiza

### Por qué `&&` puede protegerte

La computadora lee `a && b` de izquierda a derecha. Si `a` es falso, la respuesta ya es falsa. Por eso no mira `b`. Esto se llama evaluación de **cortocircuito** (*short-circuit*).

```ts
const userName: string | undefined = undefined;

if (userName !== undefined && userName.length > 0) {
  console.log("has name");
} else {
  console.log("no name");
}
```

Esto muestra:

```text
no name
```

`userName.length` fallaría con `undefined`. Nunca se ejecuta, porque la primera parte es falsa. El orden de las dos partes importa. (`length` es el número de caracteres de un texto. Aprenderás más en la lección 06.)

### Una idea equivocada común: "las mayúsculas no importan" y el error con `||`

Las comparaciones son exactas. Las mayúsculas cuentan.

```ts
console.log("Passed" === "passed");
```

Esto muestra `false`. En un test, el texto de la página y el texto de tu código deben coincidir exactamente.

La lección mostró que `status === "failed" || "blocked"` no funciona como se espera. Este es el motivo. La computadora lo lee como dos partes separadas: `status === "failed"` y `"blocked"`. Un texto que no está vacío es truthy, así que la segunda parte siempre es verdadera.

```ts
const status = "passed";

if (status === "failed" || "blocked") {
  console.log("Needs review");
}
```

Esto muestra `Needs review`, aunque el estado sea `passed`.

### Cómo aparece en el trabajo real de automatización QA

Un test es, en el fondo, una decisión. Comparas lo que esperabas con lo que obtuviste. Si son distintos, el test falla.

```ts
const expected = "Welcome, Ana";
const actual = "Welcome, Luis";

if (actual === expected) {
  console.log("PASS");
} else {
  console.log(`FAIL: expected ${expected} but got ${actual}`);
}
```

Esto muestra:

```text
FAIL: expected Welcome, Ana but got Welcome, Luis
```

El `expect` de Playwright hace esto por ti. Además detiene el test y muestra un mensaje claro. En la próxima lección escribirás la comprobación una sola vez como una función. Este es un caso de DRY (*Don't Repeat Yourself*, no te repitas). Lo estudiarás al final de este módulo.

### Cuándo no usar `if`

No pongas un `if` dentro de un test para ocultar un resultado distinto. Un test debe seguir un solo camino claro. Si el test puede tomar dos caminos, quizá no sepas cuál se ejecutó, y un fallo puede quedar oculto.

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

5. ¿Qué muestra este código y por qué?

```ts
const score = 95;

if (score >= 50) {
  console.log("pass");
} else if (score >= 90) {
  console.log("excellent");
}
```

<details>
<summary>Respuesta</summary>

Muestra `pass`. La computadora ejecuta el primer bloque cuya condición es verdadera. Una puntuación de 95 también es 50 o más, así que se detiene en el primer bloque. Nunca llega a la comprobación de `excellent`. Pon primero la condición más específica, `score >= 90`.

</details>

6. Este código debería mostrar `unknown` solo cuando el estado no es `passed` ni `failed`. Pero muestra `unknown` también para `passed`. Encuentra el *bug* (error).

```ts
const status = "passed";

if (status !== "passed" || status !== "failed") {
  console.log("unknown");
}
```

<details>
<summary>Respuesta</summary>

Con `||`, basta con que un lado sea verdadero. El estado `passed` hace verdadera la segunda parte, porque no es `failed`. Todo texto es distinto de al menos uno de los dos. Usa `&&`: los dos lados deben ser verdaderos.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Cuál es la diferencia entre `==` y `===` en JavaScript y qué es la coerción de tipos?**
   - Busca: `javascript == vs === type coercion`
   - Una buena respuesta explica: qué significa coerción, dos resultados sorprendentes de `==` y por qué `===` es más seguro.

2. **¿Qué es la evaluación de cortocircuito en JavaScript?**
   - Busca: `javascript short-circuit evaluation && ||`
   - Una buena respuesta explica: cómo `&&` y `||` se detienen antes, y un uso que evita un fallo.

3. **¿Por qué muchas guías de pruebas dicen que un test no debe contener instrucciones `if`?**
   - Busca: `no conditional logic in tests`
   - Una buena respuesta explica: el problema de los tests con varios caminos y qué hacer en su lugar.

## Siguiente paso

En la próxima lección pondrás código en funciones, para darle un nombre y usarlo muchas veces.
