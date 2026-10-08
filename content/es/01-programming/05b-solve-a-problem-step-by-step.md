---
title: Resuelve un problema paso a paso
duration: 60 min
---

## Objetivo

Esta lección te da un método para empezar cuando conoces las piezas del lenguaje pero no sabes por dónde atacar un problema.

- Decir un problema con tus propias palabras, con un ejemplo de entrada y de salida.
- Escribir los pasos de una solución en palabras simples antes de escribir código.
- Hacer crecer una función un paso a la vez, y ejecutarla después de cada paso.
- Elegir valores de prueba: un caso fácil, un caso límite y una entrada incorrecta.

## El método

Conoces las variables, los tipos, `if` y las funciones, pero abrir un archivo vacío no basta para saber qué escribir primero. Lo que ayuda es un método: piensas con palabras y escribes el código al final. Son cinco movimientos.

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
  return 10
}

console.log(ticketPrice(30, "Monday"))
```

Esto imprime `10`. Ahora el paso 2:

```ts
function ticketPrice(age: number, day: string): number {
  let price = 10
  if (age < 12) {
    price = 6
  } else if (age >= 65) {
    price = 7
  }
  return price
}

console.log(ticketPrice(30, "Monday"))
console.log(ticketPrice(8, "Monday"))
console.log(ticketPrice(70, "Monday"))
```

Esto imprime `10`, `6` y `7`. Ahora el paso 3. Agrégalo antes del `return`:

```ts
  if (day === "Tuesday") {
    price = price - 2
  }
```

Ejecútalo con `ticketPrice(8, "Tuesday")`. Imprime `4`, el número de tu ejemplo.

**Movimiento 5: revisa.** Un **caso límite** (*edge case*) es un valor en el borde de una regla o fuera de lo usual. Prueba estos:

```ts
console.log(ticketPrice(11, "Monday"), ticketPrice(12, "Monday"))
console.log(ticketPrice(64, "Monday"), ticketPrice(65, "Monday"))
console.log(ticketPrice(30, "tuesday"))
console.log(ticketPrice(-1, "Monday"))
```

Imprime:

```text
6 10
10 7
10
6
```

Los bordes funcionan: 11 paga 6 y 12 paga 10, 64 paga 10 y 65 paga 7. Pero encontraste dos problemas. El texto `"tuesday"` con `t` minúscula no recibe descuento. Y una edad de -1 paga 6, porque -1 es menor que 12. Una persona real no puede tener -1 años.

Agrega una regla al principio. Decide qué hace la función con una edad incorrecta. Aquí devuelve -1 y lo explicas en un comentario. Lecciones posteriores muestran mejores formas.

```ts
  if (age < 0) {
    return -1 // -1 means "wrong age"
  }
```

> **Consejo:** Anota cada problema que encuentres en el movimiento 5. Algunos los arreglas ahora. Otros los dejas a propósito, con una nota.

## Ejemplo 2: ¿es un año bisiesto?

Este es más corto y viene de otro mundo: el calendario.

**Movimiento 1: dilo.** Di si un año tiene 366 días. Ejemplo: 2024 da `true`.

**Movimiento 2: resuélvelo a mano.** Quizá no recuerdes las reglas. Haz una tabla con los años que conoces y luego busca qué tienen en común.

```text
2024 -> leap year
2023 -> not a leap year
2000 -> leap year
1900 -> not a leap year
```

Una regla que muchas personas recuerdan es «un año bisiesto llega cada cuatro años». En código sería esto:

```ts
function isLeapYear(year: number): boolean {
  return year % 4 === 0
}
```

El signo `%` da el residuo de una división, así que `2024 % 4` es `0` y la función dice `true` para 2024. También acierta con 2023. Pero 1900 es divisible entre 4 y no fue bisiesto, así que la función falla con 1900, y también con 2100. Una regla que es cierta para tus dos primeros ejemplos puede ser falsa para un tercero. Por eso reúnes más de un ejemplo en los movimientos 1 y 2.

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
    return true
  }
  if (year % 100 === 0) {
    return false
  }
  return year % 4 === 0
}

console.log(isLeapYear(2000), isLeapYear(1900), isLeapYear(2024), isLeapYear(2023))
```

Esto imprime `true false true false`. Son los cuatro años de tu tabla hecha a mano. El **movimiento 5** pasó con los mismos cuatro valores. Agrega casos límite: 2100, 1600 y el año 0.

## Cuando te atascas

- **Haz el problema más pequeño.** Resuelve una versión con una sola regla. Agrega la siguiente regla cuando la primera funcione.
- **Resuelve primero un problema más fácil.** Calcula el precio del boleto para una edad fija. Luego convierte la edad en un parámetro.
- **Explícalo en voz alta.** Cuéntale el problema a un amigo, a una mascota o a un juguete. Muchas veces encuentras el paso que falta mientras hablas.
- **Vuelve al ejemplo.** Si tu código da un resultado distinto al de tu ejemplo a mano, ejecútalo con ese ejemplo. Cambia una sola cosa a la vez.

## Profundiza

### Escribir el pseudocódigo como comentarios

Un buen truco es escribir los pasos como comentarios en el archivo y poner el código debajo de cada uno. Al final, los comentarios son la explicación de tu código.

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

Una tienda da el cambio en monedas. Escribe una función que diga cuántas monedas hacen falta para devolver una cantidad dada, usando las menos monedas posibles. Elige tu propio mundo, por ejemplo una tienda con centavos de euro o un juego con monedas de oro, plata y cobre. Usa al menos cinco valores de moneda.

Crea el archivo `exercises/challenges/solve-a-problem.ts`. Llama a la función `coinsForChange`. Escribe tus pasos en palabras simples como comentario al inicio.

Está terminado cuando:

- Con las monedas 50, 20, 10, 5, 2 y 1, `coinsForChange(38)` devuelve 5, y `coinsForChange(99)` devuelve 6.
- `coinsForChange(0)` devuelve 0.
- Una entrada incorrecta, como `-5` o `2.5`, devuelve -1.
- Al final del archivo imprimes cada llamada junto a su valor esperado, y ejecutas el archivo con `node`.

Vas a necesitar algo que esta lección no enseñó: cómo saber cuántas veces cabe un número en otro, y qué sobra. Busca: `javascript Math.floor`, `javascript Number.isInteger`.

## Piénsalo bien

1. ¿Qué imprime esto? Usa la versión final de `ticketPrice`.

```ts
console.log(ticketPrice(65, "Tuesday"), ticketPrice(64, "Tuesday"))
```

<details>
<summary>Respuesta</summary>

Imprime `5 8`. Una persona de 65 años es adulta mayor, así que el precio base es 7, y el martes resta 2, lo que da 5. Una persona de 64 años no es mayor ni niña, así que el precio base es 10, y el martes da 8.

</details>

2. Esta función de año bisiesto se ejecuta sin error, pero da una respuesta incorrecta para uno de los años que probaste. Encuentra el año y el bug.

```ts
function isLeapYear(year: number): boolean {
  if (year % 4 === 0) {
    return true
  }
  if (year % 100 === 0) {
    return false
  }
  if (year % 400 === 0) {
    return true
  }
  return false
}
```

<details>
<summary>Respuesta</summary>

Para 1900 devuelve `true`, pero 1900 no es bisiesto. El año 1900 es divisible entre 4, así que el primer `if` devuelve antes de revisar la regla del 100. Lo mismo pasa con 2100. Las comprobaciones están en el orden equivocado: la regla más específica, la del 400, debe ir primero, como en tus pasos en palabras simples.

</details>

3. ¿Qué devuelve `ticketPrice(NaN, "Monday")` con la función final? ¿Es un buen resultado?

<details>
<summary>Respuesta</summary>

Devuelve `10`. Toda comparación con `NaN` es falsa, así que la edad no es menor que 0, ni menor que 12, ni 65 o más. La función cae en el precio base y da un precio de adulto para un valor que no es una edad. La solución depende del requisito: devolver un código para una edad incorrecta, como con -1, o comprobar con `Number.isNaN`.

</details>

## Siguiente paso

En la siguiente lección aprenderás Arrays y bucles, que te permiten manejar muchos valores a la vez.
