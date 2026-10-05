---
title: No te repitas (DRY)
summary: Dale a cada regla, valor y formato un solo hogar, y aprende cuándo un poco de repetición es mejor que un atajo.
duration: 40 min
---

## Objetivo

- Explicar qué significa DRY y por qué el conocimiento repetido causa bugs.
- Quitar la repetición con una constante, una función, un parámetro, un bucle, un alias de tipo y un módulo.
- Saber cuándo dejar un poco de repetición.

## El problema

Una página es "lenta" cuando necesita más de 2000 milisegundos. Tres funciones usan esta regla, y cada una tiene su propia copia del número.

El requisito cambia: el límite es 1500. Alguien actualiza dos funciones y olvida la tercera.

```ts
function isSlow(ms: number): boolean {
  return ms > 1500;
}

function describePage(name: string, ms: number): string {
  return ms > 1500 ? `${name} is too slow` : `${name} is fast enough`;
}

function countSlow(times: number[]): number {
  let count = 0;
  for (const time of times) {
    if (time > 2000) {
      count += 1;
    }
  }
  return count;
}

console.log(isSlow(1700));
console.log(describePage("Checkout", 1700));
console.log(`Slow pages: ${countSlow([1700, 900])}`);
```

El programa muestra:

```text
true
Checkout is too slow
Slow pages: 0
```

Dos líneas dicen que la página es lenta. La tercera dice que no hay páginas lentas. No aparece ningún error. La copia olvidada es el bug.

## La idea

**DRY** significa "Don't Repeat Yourself" (no te repitas). Cada pieza de conocimiento tiene un solo hogar en el programa. Cuando cambia, la cambias una sola vez.

DRY trata del conocimiento: una regla, un valor o un formato. No trata del texto que se parece.

## Las herramientas que ya tienes

**Una constante** para un valor repetido. Escribe el número una vez, con un nombre.

```ts
const MAX_RESPONSE_MS = 1500;
```

**Una función** para pasos repetidos. La regla tiene su propio hogar y los demás lugares la llaman.

```ts
function isSlow(ms: number): boolean {
  return ms > MAX_RESPONSE_MS;
}
```

`describePage` y `countSlow` ahora llaman a `isSlow(ms)`. Las tres líneas del problema ahora muestran `true`, `Checkout is too slow` y `Slow pages: 1`.

**Un parámetro** para los mismos pasos con una diferencia. El formato del título de un bug vive en un solo lugar.

```ts
function bugTitle(area: string, problem: string, severity: string): string {
  return `[${severity}] ${area}: ${problem}`;
}

console.log(bugTitle("Checkout", "discount is not applied", "high"));
```

Esto muestra `[high] Checkout: discount is not applied`.

**Un array de datos y un bucle** para la misma comprobación con muchas entradas. Este es el "antes". Tres bloques `if` copiados, uno por cada campo del formulario:

```ts
const form = { name: "Ana", email: "", password: "" };
const errors: string[] = [];

if (form.name === "") {
  errors.push("Name is required");
}
if (form.email === "") {
  errors.push("Email is required");
}
if (form.password === "") {
  errors.push("Password is required");
}

console.log(errors);
```

Este es el "después". Los campos son datos en un array y un solo bucle `for...of` los comprueba todos:

```ts
const form: Record<string, string> = { name: "Ana", email: "", password: "" };
const errors: string[] = [];

const required = [
  { field: "name", label: "Name" },
  { field: "email", label: "Email" },
  { field: "password", label: "Password" },
];

for (const item of required) {
  if (form[item.field] === "") {
    errors.push(`${item.label} is required`);
  }
}

console.log(errors);
```

Las dos versiones muestran el mismo resultado:

```text
[ 'Email is required', 'Password is required' ]
```

Para comprobar un campo nuevo, agregas un objeto al array. El bucle no cambia.

**Un alias de tipo** para la forma de un objeto repetida (lección 08) y **un módulo** para el código que usan varios archivos (lección 11). El cambio vive en un solo lugar y cada usuario lo recibe.

## El límite: no quites la repetición demasiado pronto

Una pieza de código compartida une a todos los que la usan. Cuando la cambias, cambian todos. Usa la **regla de tres**. La primera vez, escribe el código. La segunda vez, puedes copiarlo. La tercera vez, ves el patrón y quitas la repetición. Con dos copias, muchas veces aún no conoces la diferencia real.

Dos piezas de código pueden verse iguales y cambiar por razones distintas. La tienda permite 10 productos en un carrito, y el título de una lista puede tener 10 caracteres. Un solo `LIMIT = 10` compartido sería un error. Mantén separados `MAX_CART_ITEMS` y `MAX_LIST_TITLE_LENGTH`.

Un atajo equivocado cuesta más que un poco de repetición. Esta función atiende todos los casos con banderas:

```ts
function formatLine(name: string, status: string, upper: boolean, brackets: boolean, withIcon: boolean): string {
  let text = upper ? status.toUpperCase() : status;
  if (brackets) {
    text = `[${text}]`;
  }
  if (withIcon) {
    text = `${status === "passed" ? "+" : "-"} ${text}`;
  }
  return `${text} ${name}`;
}

console.log(formatLine("Login works", "passed", true, false, true));
```

Muestra `+ PASSED Login works`. Pero ¿qué significan `true, false, true`? Tienes que abrir la función para saberlo. Cada necesidad nueva agrega una bandera. Dos funciones pequeñas con nombres claros son más fáciles de leer y de cambiar.

## Profundiza

### Texto distinto, mismo conocimiento

La repetición no siempre es el mismo texto. Un carrito escribe `total * 1.2`. Una factura escribe `price + price / 5`. Ambos guardan un solo hecho: el impuesto es del 20 por ciento. Si el impuesto cambia, alguien debe encontrar los dos. DRY pide un solo `TAX_RATE`. Pregúntate: si esta regla cambia, ¿deben cambiar juntos todos estos lugares? Si la respuesta es sí, necesitan un solo hogar. Si es no, déjalos separados. Esta es la pregunta que debes hacer antes de cada refactorización.

### Cómo se ve en la automatización de tests

En la automatización de tests, la misma idea se convierte en *helpers*, *fixtures* y *page objects*. El módulo 4 tiene una lección completa sobre esto. Ya puedes verlo en este proyecto. El archivo `playwright.config.ts` guarda `baseURL` una sola vez, así que los tests escriben `page.goto("/#/practice")` y no la dirección completa. El archivo de *spec* `e2e/playground.spec.ts` también mantiene en un solo lugar el primer paso de cada test. Un *hook* llamado `beforeEach` se ejecuta antes de cada test. El módulo 3 explica los hooks.

```ts
test.beforeEach(async ({ page }) => {
  await page.goto("/#/practice");
});
```

### El límite para los tests

Los tests tienen una regla especial: un test debe ser fácil de leer, como una historia. Un test con un poco de repetición que entiendes en diez segundos es mejor que un test que esconde sus pasos detrás de tres capas de helpers. Quita la repetición que es ruido, como la dirección y la preparación. Conserva los pasos que muestran lo que el test comprueba. Un test que esconde su historia es más difícil de corregir cuando falla.

## Práctica

1. Abre `exercises/01-programming/13-dont-repeat-yourself.ts`. Reemplaza cada `// TODO` con código. Escribe cada regla una sola vez.
2. Ejecuta el archivo del ejercicio con este comando:

```bash
node exercises/01-programming/13-dont-repeat-yourself.ts
```

Haz que cada línea diga `OK`. Las comprobaciones solo ven el resultado, así que verifica tú mismo que cada regla tenga un solo hogar.

## Comprueba lo que sabes

1. ¿Qué significa DRY?

<details><summary>Respuesta</summary>

"Don't Repeat Yourself" (no te repitas). Cada pieza de conocimiento, como una regla, un valor o un formato, tiene un solo hogar en el programa.

</details>

2. ¿Qué es la regla de tres?

<details><summary>Respuesta</summary>

Espera a ver el mismo código tres veces antes de quitar la repetición. Con dos copias, quizá aún no sepas cuál es la diferencia real.

</details>

3. Un colega quita la repetición con `doStep("pay", true, false, true, false, true)`. La función funciona. ¿Por qué es un problema?

<details><summary>Respuesta</summary>

Nadie puede leer la llamada sin abrir la función. Cada caso nuevo agrega una bandera y la función se vuelve más difícil de cambiar. Dos funciones pequeñas con nombres claros son mejores. Una abstracción equivocada cuesta más que un poco de repetición.

</details>

4. La tienda permite 10 productos en un carrito, y el título de una lista puede tener 10 caracteres. ¿Deben usar ambos una constante `LIMIT = 10`?

<details><summary>Respuesta</summary>

No. Las dos reglas cambian por razones distintas. Si el límite del carrito pasa a 20, el límite del título no debe cambiar. Usa dos constantes con dos nombres.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es la "regla de tres" en la refactorización y por qué los desarrolladores esperan a la tercera copia?**
   - Busca: `rule of three refactoring duplication`
   - Una buena respuesta explica: qué dice la regla, un caso donde ayuda y un caso donde la romperías.

2. **¿Qué significa el dicho "la duplicación es mucho más barata que la abstracción equivocada"?**
   - Busca: `duplication far cheaper than wrong abstraction`
   - Una buena respuesta explica: qué es una abstracción equivocada, por qué empeora con el tiempo y cómo un equipo puede corregirla.

3. **¿Cuál es la diferencia entre DRY y DAMP en el código de tests?**
   - Busca: `DRY vs DAMP tests`
   - Una buena respuesta explica: qué significa cada palabra, por qué los tests suelen preferir DAMP y un ejemplo de un test demasiado DRY.

## Siguiente paso

Terminaste los fundamentos de programación. En el módulo 2 aprendes Git y cómo funciona la web, para que puedas leer y compartir proyectos reales.
