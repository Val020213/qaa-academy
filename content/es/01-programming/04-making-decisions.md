---
title: Tomar decisiones
duration: 50 min
---

## Objetivo

En esta lección haces que tu programa elija qué hacer según un valor, y aprendes a revisar que la regla elegida es la que querías.

- Predecir qué rama de una cadena de `if` se ejecuta para un valor dado.
- Elegir el orden correcto para varias condiciones.
- Combinar condiciones con `&&`, `||` y `!`, y encontrar el caso donde una regla está mal.
- Probar una decisión en sus valores límite.

## Comparaciones

Una **comparación** hace una pregunta sobre dos valores. La respuesta es siempre un *boolean*: `true` o `false`.

```ts
console.log(5 > 3)
console.log("rain" === "rain")
console.log("rain" === "sun")
```

Esto imprime:

```text
true
true
false
```

El verificador de tipos puede marcar comparaciones entre textos fijos distintos, como `"rain" === "sun"`, porque ya sabe que no coinciden. Node.js las ejecuta; en este ejemplo la comparación entre textos distintos produce `false`.

Estos son los signos de comparación:

| Signo | Significado              |
| ----- | ------------------------ |
| `===` | es igual a               |
| `!==` | no es igual a            |
| `>`   | es mayor que             |
| `<`   | es menor que             |
| `>=`  | es mayor o igual que     |
| `<=`  | es menor o igual que     |

> **Cuidado:** `=` guarda un valor. `===` compara dos valores. No los confundas. `==` puede convertir los valores antes de compararlos. Usa `===` y `!==`, que comparan sin esa conversión.

Si confundes los signos, el programa no avisa:

```ts
let lightColor = "green"

if (lightColor = "red") {
  console.log("stop")
}
console.log(lightColor)
```

Esto imprime:

```text
stop
red
```

La luz estaba verde. El programa dice "stop", y ahora la luz está roja. La línea `lightColor = "red"` no hizo una pregunta. La asignación guarda `"red"` y también produce ese texto como resultado. Como no está vacío, la condición lo trata como verdadero. No hubo ningún mensaje de error.

JavaScript compara dos textos de izquierda a derecha por sus códigos UTF-16, aunque parezcan números.

```ts
console.log(10 > 9)
console.log("10" > "9")
```

Esto imprime:

```text
true
false
```

El texto `"10"` empieza con `1`, y `"9"` empieza con `9`. El primer código distinto decide, y `1` va antes que `9`. Los números se comparan como números. El texto se compara como texto.

Las mayúsculas también cuentan:

```ts
console.log("Passed" === "passed")
```

Esto imprime `false`.

## if

Una instrucción **if** ejecuta código cuando JavaScript trata el valor de su condición como verdadero. El código va dentro de llaves `{ }`.

```ts
const isRaining = true

if (isRaining) {
  console.log("Take an umbrella")
}
console.log("Leave the house")
```

Esto imprime:

```text
Take an umbrella
Leave the house
```

Si `isRaining` fuera `false`, el primer mensaje no se imprimiría. Solo se imprimiría `Leave the house`.

## else

Usa **else** cuando JavaScript trata la condición como falsa.

```ts
const temperature = 28

if (temperature > 25) {
  console.log("Go to the beach")
} else {
  console.log("Stay at home")
}
```

Esto imprime:

```text
Go to the beach
```

## else if

Usa **else if** cuando tienes más de dos opciones. Node.js evalúa las condiciones desde arriba, ejecuta el bloque de la primera que es verdadera y se salta el resto de la cadena.

```ts
const temperature = 12

if (temperature < 0) {
  console.log("coat and gloves")
} else if (temperature < 15) {
  console.log("jacket")
} else {
  console.log("t-shirt")
}
```

Esto imprime:

```text
jacket
```

Aquí `temperature < 0` es falso, así que Node.js pasa a la siguiente condición. Luego `temperature < 15` es verdadero, así que ejecuta ese bloque, imprime `jacket` y se salta el resto de la cadena. Nunca llega al `else`.

Por eso el orden importa. Un videojuego da una medalla al final de un nivel: bronce desde 50 puntos, plata desde 70 y oro desde 90. Cada condición es correcta por sí sola, pero están en el orden equivocado:

```ts
const points = 95

if (points >= 50) {
  console.log("bronze medal")
} else if (points >= 70) {
  console.log("silver medal")
} else if (points >= 90) {
  console.log("gold medal")
}
```

Esto imprime `bronze medal`. Un puntaje de 95 es 50 o más, así que la primera condición es verdadera, Node.js ejecuta ese bloque y se salta el resto de la cadena. Nunca evalúa la plata ni el oro, y un jugador con 95 puntos recibe la misma medalla que uno con 50.

La solución es poner primero la condición más exigente:

```ts
const points = 95

if (points >= 90) {
  console.log("gold medal")
} else if (points >= 70) {
  console.log("silver medal")
} else if (points >= 50) {
  console.log("bronze medal")
}
```

Ahora imprime `gold medal`. Aquí los rangos se solapan: 95 cumple las tres condiciones. Revisa primero el umbral más alto para dar la medalla que corresponde.

## Operadores lógicos

Puedes unir condiciones con tres **operadores lógicos**. Con valores booleanos:

`&&` significa Y. Los dos lados deben ser verdaderos.

`||` significa O. Al menos un lado debe ser verdadero.

`!` significa NO. Convierte `true` en `false` y `false` en `true`.

```ts
const hasTicket = true
const hasPassport = false

console.log(hasTicket && hasPassport)
console.log(hasTicket || hasPassport)
console.log(!hasPassport)
```

Esto imprime:

```text
false
true
true
```

Aquí tienes un plan según el clima que usa `&&` y `!`:

```ts
const temperature = 25
const isRaining = true

if (temperature > 20 && !isRaining) {
  console.log("beach")
} else if (temperature > 20) {
  console.log("cafe")
} else {
  console.log("home")
}
```

Hace calor, pero llueve. La primera condición necesita calor Y que no llueva, así que es falsa. La segunda solo trata del calor, así que es verdadera:

```text
cafe
```

Y uno con `||`:

```ts
const day = "Saturday"

if (day === "Saturday" || day === "Sunday") {
  console.log("weekend")
}
```

Esto imprime:

```text
weekend
```

Escribes la comparación completa a ambos lados. `day === "Saturday" || "Sunday"` no funciona como esperas; la sección "Profundiza" explica por qué.

## Valores límite

Una regla de envío gratis desde 50 debe excluir 49 e incluir 50 y 51. Confundir `>` con `>=` cambia el resultado en 50. Un **valor límite** está en el borde de una regla; prueba justo por debajo, en el borde y por encima.

## Truthy y falsy

JavaScript te deja escribir `if (name)` sin una comparación. Trata algunos valores como falsos: `""`, `0`, `null` y `undefined`. Se llaman **falsy**. La mayoría de los otros valores son **truthy**.

Esto puede sorprenderte con un cachorro de 0 años:

```ts
const age = 0

if (age) {
  console.log("age is known")
} else {
  console.log("no age given")
}
```

Esto imprime `no age given`. La edad se conoce, y es 0. El número `0` es *falsy*, aunque `0` sea un valor válido.

> **Consejo:** Como principiante, escribe la comparación completa, como `age !== undefined`. Es más clara y más segura.

## Profundiza

### Por qué `&&` puede protegerte

JavaScript evalúa `a && b` de izquierda a derecha. Si `a` es *falsy*, devuelve ese valor sin evaluar `b`. Si `a` es *truthy*, evalúa y devuelve `b`. Esto se llama evaluación de **cortocircuito** (*short-circuit*).

```ts
let userName: string | undefined

if (userName !== undefined && userName.length > 0) {
  console.log("has name")
} else {
  console.log("no name")
}
```

Esto imprime:

```text
no name
```

Leer `userName.length` fallaría si `userName` fuera `undefined`. Nunca se ejecuta, porque la primera parte es falsa. El orden de las dos partes importa.

### Por qué `day === "Saturday" || "Sunday"` siempre es truthy

`===` tiene más precedencia que `||`, así que el analizador arma la expresión como `(day === "Saturday") || "Sunday"`: dos expresiones unidas por `||`. `||` devuelve el primer valor si es *truthy*; si no, devuelve el segundo. Aquí devuelve `true` cuando `day` es `"Saturday"`, o el texto `"Sunday"` en otro caso. Ambos son *truthy*, por eso el `if` siempre entra.

```ts
const day = "Monday"

if (day === "Saturday" || "Sunday") {
  console.log("weekend")
}
```

Esto imprime `weekend`, aunque el día sea `Monday`.

## Práctica

1. Crea el archivo `exercises/01-programming/decisions.ts`.
2. Crea una `const` llamada `score` con un número. Escribe un `if` y un `else` que impriman `pass` cuando el puntaje sea 50 o más, y `fail` en caso contrario.
3. Cambia el puntaje y ejecuta el archivo cada vez, con 49, 50 y 51. Comprueba que 49 imprime `fail`, y que 50 y 51 imprimen `pass`.
4. Agrega un `else if` para un tercer caso: imprime `excellent` cuando el puntaje sea 90 o más. Ponlo antes del caso `pass`.
5. Abre `exercises/01-programming/04-making-decisions.ts` y ejecútalo:

```bash
node exercises/01-programming/04-making-decisions.ts
```

Resuelve los ejercicios. Haz que cada comprobación diga `OK`.

## Reto

Construye las reglas del turno de un juego de mesa. Cada 3.er turno es un "turno de bonificación". Cada 5.º turno es un "turno de penalización". Un turno que es ambos es un "super turno". Cualquier otro turno es un "turno normal". Puedes cambiar el tema: un juego de cartas, el timbre de una escuela.

Crea el archivo `exercises/challenges/making-decisions.ts`. Guarda el número de turno en una `const` al inicio e imprime el nombre del turno.

Está terminado cuando:

- El turno `7` imprime `normal turn`, el turno `9` imprime `bonus turn` y el turno `10` imprime `penalty turn`.
- El turno `15` imprime `super turn` y el turno `30` imprime `super turn`.
- Ejecutaste el archivo al menos una vez con cada uno de estos cinco valores, cambiando la única `const`.
- Un comentario explica qué le pasa al turno 15 si mueves la comprobación del super turno al final, y probaste tu respuesta.

Vas a necesitar algo que esta lección no enseñó: una forma de preguntar "¿este número se divide exactamente entre 3?". Busca: `javascript remainder operator`, `javascript modulo`.

## Piénsalo bien

1. ¿Qué imprime esto y por qué?

```ts
const temperature = 20
const isRaining = false

if (temperature > 20 && !isRaining) {
  console.log("beach")
} else if (temperature > 20) {
  console.log("cafe")
} else {
  console.log("home")
}
```

<details>
<summary>Respuesta</summary>

Imprime `home`. No llueve, pero `20 > 20` es falso, porque 20 no es mayor que 20. Así que la primera y la segunda condición son falsas, y Node.js ejecuta el `else`. Una persona diría "20 grados es calor", pero el código solo sigue el signo que escribiste.

</details>

2. Este juego debe imprimir `custom level` solo cuando el nivel no es `easy` ni `hard`. También lo imprime para `easy`. Encuentra el bug.

```ts
const level = "easy"

if (level !== "easy" || level !== "hard") {
  console.log("custom level")
}
```

<details>
<summary>Respuesta</summary>

Con `||`, basta un lado verdadero. El nivel `easy` hace verdadera la segunda parte, porque no es `hard`. Todo texto es distinto de al menos una de las dos palabras, así que la condición siempre es verdadera. Usa `&&`: los dos lados deben ser verdaderos. Otra forma de verlo: "no (easy o hard)" es lo mismo que "no easy y no hard".

</details>

3. Un refugio de mascotas escribe `if (age)` para comprobar que un perro tiene edad. Un cachorro de 0 años recibe el mensaje "no age given". ¿Por qué y qué escribirías en su lugar?

<details>
<summary>Respuesta</summary>

`0` es *falsy*, así que `if (age)` lo trata igual que un valor que falta. La edad se conoce y es cero. Escribe la pregunta que de verdad quieres hacer: `age !== undefined` si la edad puede faltar.

</details>

## Siguiente paso

En la siguiente lección pones código en funciones, para poder darle un nombre y usarlo muchas veces.
