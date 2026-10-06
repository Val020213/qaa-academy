---
title: Resuelve un problema paso a paso
summary: Un método de cinco movimientos para el momento de la página en blanco, cuando conoces cada pieza del lenguaje y aun así no sabes por dónde empezar.
duration: 80 min
---

## Empieza con un acertijo

Un programa de calendario debe decir si un año es bisiesto, es decir, un año con 366 días. Un amigo escribe esto y dice: "En la escuela aprendí que un año bisiesto llega cada cuatro años".

```ts
function isLeapYear(year: number): boolean {
  return year % 4 === 0;
}
```

El signo `%` da el residuo de una división. Entonces `2024 % 4` es `0`, y la función dice `true` para 2024. Dice `false` para 2023. Las dos respuestas son correctas.

Pero la función falla en algunos años. Encuentra uno sin buscar. ¿Qué necesitas saber sobre los años bisiestos para encontrarlo?

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Decir un problema con tus propias palabras, con un ejemplo de entrada y de salida.
- Escribir los pasos de una solución en palabras simples antes de escribir código.
- Hacer crecer una función un paso a la vez, y ejecutarla después de cada paso.
- Elegir valores de prueba: un caso fácil, un caso límite y una entrada incorrecta.

## La página en blanco

Conoces las variables, los tipos, `if` y las funciones. Abres un archivo nuevo y miras una pantalla vacía. No pasa nada.

Esto es normal. Conocer las piezas no es lo mismo que saber construir con ellas. Un cocinero puede conocer todas las herramientas de la cocina y aun así no saber qué cocinar primero.

La solución no es más sintaxis. La solución es un método. Primero piensas, con palabras, y escribes el código al final. Estos son cinco movimientos.

1. **Dilo.** Escribe el problema con tus propias palabras. Agrega un ejemplo: una entrada y la salida que esperas.
2. **Resuélvelo a mano.** Haz la tarea en papel para el ejemplo. Observa lo que haces, paso a paso.
3. **Escribe los pasos en palabras simples.** Esto se llama **pseudocódigo**: pasos para una persona, no para una computadora.
4. **Programa un paso.** Convierte un paso en código. Ejecútalo. Después haz el siguiente paso.
5. **Revisa tres tipos de entrada.** Un caso fácil, un caso límite y una entrada incorrecta.

Dividir un problema en pasos pequeños se llama **descomposición**. Cada movimiento de arriba es una forma de hacerlo.

## Ejemplo 1: el precio de un boleto de cine

**Movimiento 1: dilo.** Un cine vende boletos según la edad y el día. Los niños menores de 12 pagan 6. Las personas de 65 años o más pagan 7. Todos los demás pagan 10. Los martes cada boleto cuesta 2 menos.

Ejemplo: una persona de 8 años en martes paga 4.

**Movimiento 2: resuélvelo a mano.** Toma a una persona de 70 años en martes. Miras la edad: 70 es más de 65, así que el precio base es 7. Miras el día: es martes, así que restas 2. La respuesta es 5. Fíjate en que decidiste primero la edad y después el día.

**Movimiento 3: palabras simples.**

```text
1. Start with the adult price, 10.
2. If the age is under 12, the price is 6. Otherwise, if the age is 65 or more, it is 7.
3. If the day is Tuesday, take 2 off the price.
4. Give back the price.
```

**Movimiento 4: código, un paso a la vez.** Solo el paso 1. Ejecútalo.

```ts
function ticketPrice(age: number, day: string): number {
  return 10;
}

console.log(ticketPrice(30, "Monday"));
```

Esto imprime `10`. Ahora el paso 2:

```ts
function ticketPrice(age: number, day: string): number {
  let price = 10;
  if (age < 12) {
    price = 6;
  } else if (age >= 65) {
    price = 7;
  }
  return price;
}

console.log(ticketPrice(30, "Monday"));
console.log(ticketPrice(8, "Monday"));
console.log(ticketPrice(70, "Monday"));
```

Esto imprime `10`, `6` y `7`. Ahora el paso 3. Agrégalo antes del `return`:

```ts
  if (day === "Tuesday") {
    price = price - 2;
  }
```

Ejecútalo con `ticketPrice(8, "Tuesday")`. Imprime `4`, el número de tu ejemplo.

**Movimiento 5: revisa.** Un **caso límite** (*edge case*) es un valor en el borde de una regla o fuera de lo usual. Prueba estos:

```ts
console.log(ticketPrice(11, "Monday"), ticketPrice(12, "Monday"));
console.log(ticketPrice(64, "Monday"), ticketPrice(65, "Monday"));
console.log(ticketPrice(30, "tuesday"));
console.log(ticketPrice(-1, "Monday"));
```

Imprime:

```text
6 10
10 7
10
6
```

Los bordes funcionan: 11 paga 6 y 12 paga 10, 64 paga 10 y 65 paga 7. Pero encontraste dos problemas. El texto `"tuesday"` con t minúscula no recibe descuento. Y una edad de -1 paga 6, porque -1 es menor que 12. Una persona real no puede tener -1 años.

Agrega una regla al principio. Decide qué hace la función con una edad incorrecta. Aquí devuelve -1 y lo explicas en un comentario. Lecciones posteriores muestran mejores formas.

```ts
  if (age < 0) {
    return -1; // -1 means "wrong age"
  }
```

> **Consejo:** Anota cada problema que encuentres en el movimiento 5. Algunos los arreglas ahora. Otros los dejas a propósito, con una nota.

## Ejemplo 2: ¿es un año bisiesto?

Este es más corto. Viene de otro mundo: el calendario.

**Movimiento 1: dilo.** Di si un año tiene 366 días. Ejemplo: 2024 da `true`.

**Movimiento 2: resuélvelo a mano.** Quizá no recuerdes las reglas. Haz una tabla con los años que conoces y luego busca qué tienen en común.

```text
2024 -> leap year
2023 -> not a leap year
2000 -> leap year
1900 -> not a leap year
```

### De vuelta al acertijo

La regla de tu amigo dice que cada cuarto año es bisiesto. El año 1900 es divisible entre 4, pero no fue bisiesto. Entonces la función simple da una respuesta incorrecta para 1900. También falla con 2100. Una regla que es cierta para tus dos primeros ejemplos puede ser falsa para un tercero. Por eso reúnes más de un ejemplo en el movimiento 1 y en el movimiento 2.

La regla completa: un año divisible entre 400 es bisiesto. Si no, un año divisible entre 100 no lo es. Si no, un año divisible entre 4 sí lo es.

**Movimiento 3: palabras simples.**

```text
1. If the year divides by 400, it is a leap year.
2. Otherwise, if it divides by 100, it is not.
3. Otherwise, it is a leap year if it divides by 4.
```

**Movimiento 4: código.**

```ts
function isLeapYear(year: number): boolean {
  if (year % 400 === 0) {
    return true;
  }
  if (year % 100 === 0) {
    return false;
  }
  return year % 4 === 0;
}

console.log(isLeapYear(2000), isLeapYear(1900), isLeapYear(2024), isLeapYear(2023));
```

Esto imprime `true false true false`. Son los cuatro años de tu tabla hecha a mano. El **movimiento 5** pasó con los mismos cuatro valores. Agrega casos límite: 2100, 1600 y el año 0.

## Cuando te atascas

- **Haz el problema más pequeño.** Resuelve una versión con una sola regla. Agrega la siguiente regla cuando la primera funcione.
- **Resuelve primero un problema más fácil.** Calcula el precio del boleto para una edad fija. Luego convierte la edad en un parámetro.
- **Explícalo en voz alta.** Cuéntale el problema a un amigo, a una mascota o a un juguete. Muchas veces encuentras el paso que falta mientras hablas.
- **Vuelve al ejemplo.** Si tu código da un resultado distinto al de tu ejemplo a mano, ejecútalo con ese ejemplo. Cambia una sola cosa a la vez.

Puedes pedir ayuda a un asistente de IA. Úsalo para una pista sobre un paso, no para toda la solución. Luego escribe el código tú mismo, ejecútalo y prepárate para explicar cada línea. Si no puedes explicar una línea, no la aprendiste, y no podrás arreglarla cuando se rompa.

## Profundiza

### Por qué primero las palabras

Un lenguaje de programación te obliga a pensar en detalles: llaves, tipos, nombres. Las palabras simples te dejan pensar solo en la idea. Si la idea está mal, lo descubres barato, antes de haber escrito código que parece correcto.

### Escribir el pseudocódigo como comentarios

Un buen truco es escribir los pasos como comentarios en el archivo y poner el código debajo de cada uno. Al final, los comentarios son la explicación de tu código.

### Cómo aparece en el trabajo real de automatización de QA

Antes de escribir un test automatizado, escribes los pasos manuales en palabras simples. Es el mismo movimiento. Un test que no puedes decir con palabras es difícil de escribir en código. Los casos límite del movimiento 5 son los casos de prueba que elige un tester: el borde, la entrada incorrecta y el caso usual.

### Un compromiso

Escribir los pasos toma un tiempo que parece perdido. Para una tarea de dos líneas, es demasiado. Para una tarea que te hace detenerte a pensar, ahorra tiempo. La habilidad está en ver qué tipo de tarea tienes.

## Práctica

1. Crea el archivo `exercises/01-programming/solve.ts`.
2. Escribe la función `ticketPrice` del cine en el mismo orden que la lección: un paso, una ejecución. Deja los pasos como comentarios encima de la función.
3. Agrega los tres casos límite de la lección y lee los resultados.
4. Escribe `isLeapYear`. Prueba 1900, 2000, 2024 y 2100.
5. Abre `exercises/01-programming/05b-solve-a-problem-step-by-step.ts` y ejecútalo:

```bash
node exercises/01-programming/05b-solve-a-problem-step-by-step.ts
```

Cada ejercicio es un problema pequeño en palabras. Escribe tus pasos primero en un comentario. Haz que cada línea diga `OK`.

## Reto

Una tienda da el cambio en monedas. Escribe una función que diga cuántas monedas hacen falta para devolver una cantidad dada, usando las menos monedas posibles. Elige tu propio mundo: una tienda con centavos de euro, un juego con monedas de oro, plata y cobre, una máquina expendedora. Usa al menos cinco valores de moneda.

Crea el archivo `exercises/challenges/solve-a-problem.ts`. Llama a la función `coinsForChange`. Escribe tus pasos en palabras simples como comentario al inicio.

Está terminado cuando:

- Con las monedas 50, 20, 10, 5, 2 y 1, `coinsForChange(38)` devuelve 5, y `coinsForChange(99)` devuelve 6.
- `coinsForChange(0)` devuelve 0.
- Una entrada incorrecta, como `-5` o `2.5`, devuelve -1.
- Al final del archivo imprimes cada llamada junto a su valor esperado, y ejecutas el archivo con `node`.

Vas a necesitar algo que esta lección no enseñó: cómo saber cuántas veces cabe un número en otro, y qué sobra. Busca: `javascript Math.floor`, `javascript Number.isInteger`.

## Piénsalo bien

1. ¿Qué imprime esto, y por qué? Usa la versión final de `ticketPrice`.

```ts
console.log(ticketPrice(65, "Tuesday"), ticketPrice(64, "Tuesday"));
```

<details>
<summary>Respuesta</summary>

Imprime `5 8`. Una persona de 65 años es adulta mayor, así que el precio base es 7, y el martes resta 2, lo que da 5. Una persona de 64 años no es mayor ni niña, así que el precio base es 10, y el martes da 8. El borde en 65 es el punto donde cambia el precio, por eso estaba en los casos límite.

</details>

2. Esta función de año bisiesto se ejecuta sin error, pero da una respuesta incorrecta para uno de los años que probaste. Encuentra el año y el bug.

```ts
function isLeapYear(year: number): boolean {
  if (year % 4 === 0) {
    return true;
  }
  if (year % 100 === 0) {
    return false;
  }
  if (year % 400 === 0) {
    return true;
  }
  return false;
}
```

<details>
<summary>Respuesta</summary>

Para 1900 devuelve `true`, pero 1900 no es bisiesto. El año 1900 es divisible entre 4, así que el primer `if` devuelve antes de revisar la regla del 100. Lo mismo pasa con 2100. Las comprobaciones están en el orden equivocado: la regla más específica, la del 400, debe ir primero, como en tus pasos en palabras simples. Es la misma lección de las medallas en la lección «Tomar decisiones».

</details>

3. Dos versiones del programa de boletos. ¿Cuál es mejor, y qué te haría elegir la otra?

```ts
function ticketPrice(age: number, day: string): number {
  // all rules here, 15 lines
}
```

```ts
function basePrice(age: number): number { /* ... */ }
function dayDiscount(day: string): number { /* ... */ }
function ticketPrice(age: number, day: string): number {
  return basePrice(age) - dayDiscount(day);
}
```

<details>
<summary>Respuesta</summary>

La segunda versión le da a cada regla un nombre y un solo trabajo, así que puedes probar y cambiar las reglas de edad sin tocar las reglas del día. El costo es más código y más nombres que leer. Para 15 líneas con dos reglas, la primera versión también está bien. Elige la segunda cuando las reglas crezcan, o cuando dos programas necesiten la misma regla. No dividas antes de sentir la necesidad.

</details>

4. El cine ahora dice: los adultos mayores empiezan a los 60, y el descuento del martes no se aplica a los niños. ¿Cuáles de tus pasos en palabras simples cambian, y cuál es la lección?

<details>
<summary>Respuesta</summary>

El paso 2 cambia el número 65 por 60. El paso 3 recibe una condición extra: resta 2 solo si la persona no es un niño. Si solo tuvieras código, tendrías que buscar los lugares que cambiar. Con pasos simples, cada regla es una línea que puedes encontrar. Un buen hábito es cambiar primero los pasos y después el código.

</details>

5. ¿Qué devuelve `ticketPrice(NaN, "Monday")` con la función final? ¿Es un buen resultado?

<details>
<summary>Respuesta</summary>

Devuelve `10`. Toda comparación con `NaN` es falsa, así que la edad no es menor que 0, ni menor que 12, ni 65 o más. La función cae en el precio base y da un precio de adulto para un valor que no es una edad. Es una entrada incorrecta que la revisión de tres tipos del movimiento 5 encontraría. La solución depende del requisito: devolver un código para una edad incorrecta, como con -1, o comprobar con `Number.isNaN`.

</details>

6. Un asistente de IA te da una solución completa y funcional del problema del cine. Pasa tus cuatro valores de prueba. ¿La usas? No hay una única respuesta correcta. Explica el compromiso.

<details>
<summary>Respuesta</summary>

Usarla ahorra tiempo ahora, y si puedes explicar cada línea, el código puede estar bien. El riesgo es que no puedas encontrar un bug después, porque no construiste la idea. Además, la solución puede pasar tus cuatro valores y aun así fallar en un borde que no probaste. Depende de tu objetivo. Cuando estás aprendiendo, pide una pista sobre un paso y escribe tú el resto. Cuando solo necesitas un resultado, primero lee, ejecuta y explica cada línea.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es el pseudocódigo y cómo lo usan los programadores?**
   - Busca: `pseudocode examples beginners`
   - Pruébalo: elige una tarea diaria, como preparar una taza de té con azúcar si quieres. Escríbela como pseudocódigo con una decisión. Luego dásela a un amigo y mira si la sigue exactamente.
   - Una buena respuesta explica: qué es el pseudocódigo, por qué no tiene reglas fijas y un caso en el que ayuda.

2. **¿Qué son el análisis de valores límite y las clases de equivalencia en las pruebas?**
   - Busca: `boundary value analysis equivalence partitioning`
   - Pruébalo: para el boleto de cine, haz una lista de los grupos de edades que deben comportarse igual. Luego elige los valores en cada borde. Ejecuta `ticketPrice` con ellos.
   - Una buena respuesta explica: las dos ideas con el ejemplo del boleto, y cuántos valores necesitas.

3. **¿Qué es el rubber duck debugging y por qué funciona?**
   - Busca: `rubber duck debugging`
   - Pruébalo: la próxima vez que tu código dé un resultado incorrecto, explícalo línea por línea en voz alta antes de cambiar nada. Anota si te ayudó.
   - Una buena respuesta explica: la idea, y por qué decir un problema en voz alta te hace notar lo que te saltaste.

## Siguiente paso

En la siguiente lección aprenderás Arrays y bucles, que te permiten manejar muchos valores a la vez.
