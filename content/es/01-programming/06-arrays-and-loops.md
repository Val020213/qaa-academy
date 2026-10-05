---
title: Arrays y bucles
summary: Guarda muchos valores en una lista y repite una acción para cada elemento con un bucle for...of.
duration: 50 min
---

## Objetivo

- Crear un array y leer elementos por índice.
- Añadir elementos y contarlos.
- Repetir una acción para cada elemento con `for...of`.
- Contar y sumar valores en un bucle, y comprobar una lista con `includes`.

## Arrays

Un *array* (arreglo) es una lista de valores en orden. Se escribe con corchetes. Los valores se separan con comas.

```ts
const tests = ["login", "search", "checkout"];
console.log(tests);
```

Esto muestra:

```text
[ 'login', 'search', 'checkout' ]
```

Cada valor del array es un **elemento**. Aquí Node muestra el texto con comillas simples. Es el mismo texto.

Un array también puede contener números:

```ts
const durations = [12, 40, 7];
```

Guarda un solo tipo en cada array. Una lista de texto o una lista de números.

## Índice

El **índice** es la posición de un elemento. La cuenta empieza en 0, no en 1.

```ts
const tests = ["login", "search", "checkout"];
console.log(tests[0]);
console.log(tests[2]);
```

Esto muestra:

```text
login
checkout
```

El primer elemento tiene el índice 0. El segundo tiene el índice 1. El tercero tiene el índice 2.

> **Cuidado:** El primer elemento es `[0]`, no `[1]`. Esta es una fuente muy común de errores. En una lista de 3 elementos, el último índice es 2.

Si pides un índice que no existe, obtienes `undefined`.

```ts
console.log(tests[5]);
```

Esto muestra:

```text
undefined
```

En este proyecto, el verificador de tipos es estricto. Trata `tests[0]` como "un string o `undefined`". Aun así puedes mostrarlo. Si quieres usarlo como string, primero debes comprobarlo con un `if`.

```ts
const first = tests[0];
if (first !== undefined) {
  console.log(first.toUpperCase());
}
```

Esto muestra:

```text
LOGIN
```

`toUpperCase()` es una función que ya viene incluida en el texto. Cambia el texto a mayúsculas.

## Longitud

La **longitud** (*length*) de un array es el número de elementos.

```ts
const tests = ["login", "search", "checkout"];
console.log(tests.length);
console.log(tests[tests.length - 1]);
```

Esto muestra:

```text
3
checkout
```

El último índice siempre es `length - 1`.

## Añadir elementos con push

**push** añade un elemento al final del array.

```ts
const tests = ["login"];
tests.push("search");
tests.push("checkout");
console.log(tests);
```

Esto muestra:

```text
[ 'login', 'search', 'checkout' ]
```

Quizá te preguntes: el array es una `const`, ¿por qué puede cambiar? Una `const` te impide darle al nombre un array nuevo. No te impide cambiar los elementos de dentro.

## Bucles

Un **bucle** repite código. Usa un bucle cuando necesites hacer lo mismo para cada elemento.

El bucle `for...of` toma un elemento cada vez.

```ts
const tests = ["login", "search", "checkout"];

for (const test of tests) {
  console.log(`Running ${test}`);
}
```

Esto muestra:

```text
Running login
Running search
Running checkout
```

Léelo así: para cada `test` en `tests`, ejecuta el código entre llaves. En la primera vuelta, `test` es `"login"`. En la segunda es `"search"`. En la tercera es `"checkout"`.

Tú eliges el nombre `test`. Usa un nombre que diga qué es un elemento.

## Contar en un bucle

Usa una variable `let` como contador. Cámbiala dentro del bucle.

```ts
const statuses = ["passed", "failed", "passed", "failed", "failed"];
let failedCount = 0;

for (const status of statuses) {
  if (status === "failed") {
    failedCount = failedCount + 1;
  }
}

console.log(`Failed tests: ${failedCount}`);
```

Esto muestra:

```text
Failed tests: 3
```

Fíjate en que `failedCount` empieza en 0 antes del bucle. Es una `let` porque cambia.

## Sumar en un bucle

La misma idea suma números. Empieza en 0 y suma cada número.

```ts
const durations = [12, 40, 7];
let totalSeconds = 0;

for (const duration of durations) {
  totalSeconds = totalSeconds + duration;
}

console.log(totalSeconds);
```

Esto muestra:

```text
59
```

## Comprobar una lista con includes

**includes** pregunta si un valor está en el array. La respuesta es `true` o `false`.

```ts
const statuses = ["passed", "blocked"];
console.log(statuses.includes("blocked"));
console.log(statuses.includes("failed"));
```

Esto muestra:

```text
true
false
```

Úsalo con `if` para decidir qué hacer:

```ts
if (statuses.includes("blocked")) {
  console.log("Some tests are blocked");
}
```

Esto muestra:

```text
Some tests are blocked
```

## Profundiza

### Por qué la cuenta empieza en 0

El índice es la distancia desde el inicio de la lista. El primer elemento está a 0 pasos del inicio. El segundo está a 1 paso. Por eso el último índice es `length - 1`. Muchos lenguajes de programación funcionan así.

### Una idea equivocada común: "dos nombres son dos listas"

En la lección 02, copiar una variable creaba dos valores separados. Con los arrays es distinto. Un array es un objeto en la memoria. Un nombre apunta a él. Cuando escribes `const b = a`, ambos nombres apuntan a la misma lista.

```ts
const a = ["x"];
const b = a;
b.push("y");
console.log(a);
```

Esto muestra:

```text
[ 'x', 'y' ]
```

Cambiaste `b`, pero `a` también cambió. Es una sola lista con dos nombres. Para hacer una copia real, usa `slice()`.

```ts
const c = a.slice();
c.push("z");
console.log(a, c);
```

Esto muestra:

```text
[ 'x', 'y' ] [ 'x', 'y', 'z' ]
```

Ahora `c` es una lista separada.

### Cómo aparece en el trabajo real de automatización QA

A menudo pruebas la misma regla con muchas entradas. Una contraseña debe tener al menos 8 caracteres. Pon las entradas en un array y escribe la comprobación una sola vez.

```ts
const passwords = ["", "123", "abcdefgh"];

for (const password of passwords) {
  if (password.length < 8) {
    console.log(`Rejected: "${password}"`);
  } else {
    console.log(`Accepted: "${password}"`);
  }
}
```

Esto muestra:

```text
Rejected: ""
Rejected: "123"
Accepted: "abcdefgh"
```

Un solo cuerpo, muchas entradas. Esto es DRY (*Don't Repeat Yourself*, no te repitas), y el nombre de este estilo es *data-driven testing* (pruebas basadas en datos). Estudiarás DRY al final de este módulo. En el Módulo 4 lo verás en tests reales.

### Una contrapartida

Fíjate en que el mensaje muestra la entrada. Cuando un caso falla, debes saber qué entrada era. Recuerda también que un fallo detiene un bucle simple en el primer elemento malo. Los elementos siguientes no se comprueban. Las herramientas de tests reales pueden ejecutar cada entrada como un test propio, así un fallo no oculta a los demás.

## Práctica

1. Crea el archivo `exercises/01-programming/lists.ts`.
2. Crea un array con cuatro nombres de tests. Muestra el primer y el último elemento.
3. Añade un nombre de test nuevo con `push`. Muestra la longitud.
4. Usa `for...of` para mostrar cada nombre con el texto `Running`.
5. Crea un array de duraciones. Usa un bucle para mostrar la suma.
6. Abre `exercises/01-programming/06-arrays-and-loops.ts` y ejecútalo:

```bash
node exercises/01-programming/06-arrays-and-loops.ts
```

Resuelve los ejercicios. Haz que todas las líneas digan `OK`.

## Comprueba lo que sabes

1. ¿Cuál es el índice del primer elemento de un array?

<details>
<summary>Respuesta</summary>

0.

</details>

2. Un array tiene 4 elementos. ¿Cuál es el índice del último?

<details>
<summary>Respuesta</summary>

3. El último índice es la longitud menos 1.

</details>

3. ¿Qué hace `push`?

<details>
<summary>Respuesta</summary>

Añade un elemento al final del array.

</details>

4. ¿Qué muestra esto? `let n = 0; for (const x of [1, 2, 3]) { n = n + x; } console.log(n);`

<details>
<summary>Respuesta</summary>

6. El bucle suma 1, luego 2, luego 3.

</details>

5. ¿Qué muestra este código y por qué?

```ts
const tests = ["a", "b", "c"];
console.log(tests[tests.length]);
```

<details>
<summary>Respuesta</summary>

Muestra `undefined`. La longitud es 3, pero el último índice es 2. El índice 3 no existe. El código correcto es `tests[tests.length - 1]`.

</details>

6. Este código debería contar los tests fallidos. Muestra 0 aunque dos tests fallaron. Encuentra el *bug* (error).

```ts
const statuses = ["failed", "failed", "passed"];
let failed = 0;

for (const s of statuses) {
  failed = 0;
  if (s === "failed") {
    failed = failed + 1;
  }
}
console.log(failed);
```

<details>
<summary>Respuesta</summary>

La línea `failed = 0;` está dentro del bucle. Reinicia el contador en cada vuelta. La última vuelta es `passed`, así que el contador termina en 0. Deja el valor inicial, `let failed = 0;`, solo antes del bucle y borra el reinicio.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es la indexación desde cero y por qué la usan la mayoría de los lenguajes de programación?**
   - Busca: `zero-based indexing why`
   - Una buena respuesta explica: qué significa un índice y la razón relacionada con la distancia desde el inicio.

2. **¿Cuál es la diferencia entre `for...of`, `for...in` y `forEach` en JavaScript?**
   - Busca: `for of vs for in vs forEach javascript`
   - Una buena respuesta explica: qué te da cada uno en cada vuelta y cuál usar para arrays.

3. **¿Qué son las pruebas basadas en datos (*data-driven testing*) y cuándo son una buena idea?**
   - Busca: `data-driven testing test automation`
   - Una buena respuesta explica: una definición, un buen uso y un caso donde los tests separados son más claros.

## Siguiente paso

En la próxima lección agruparás valores relacionados en objetos, por ejemplo el id, el título y el estado de un caso de prueba.
