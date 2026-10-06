---
title: Tomar decisiones
summary: Compara valores y usa if, else if y else para que tu programa elija qué hacer, y aprende por qué importa el orden de las opciones.
duration: 70 min
---

## Empieza con un acertijo

Un videojuego da una medalla al final de un nivel. El bronce es para 50 puntos o más. La plata es para 70 o más. El oro es para 90 o más.

```ts
const points = 95;

if (points >= 50) {
  console.log("bronze medal");
} else if (points >= 70) {
  console.log("silver medal");
} else if (points >= 90) {
  console.log("gold medal");
}
```

Un jugador saca 95. ¿Qué medalla imprime el programa? Cada condición es correcta por sí sola. Las reglas coinciden con la historia. Aun así, un jugador puede quedar muy molesto.

Piensa en cómo recorre las líneas la computadora. ¿Lee las tres condiciones o se detiene antes?

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Predecir qué rama de una cadena de `if` se ejecuta para un valor dado.
- Elegir el orden correcto para varias condiciones.
- Combinar condiciones con `&&`, `||` y `!`, y encontrar el caso donde una regla está mal.
- Probar una decisión en sus valores límite.

## Comparaciones

Un programa muchas veces necesita hacer una pregunta. ¿Está lloviendo? ¿El puntaje pasa de 50?

Una **comparación** hace una pregunta así. La respuesta es siempre un *boolean*: `true` o `false`.

```ts
console.log(5 > 3);
console.log("rain" === "rain");
console.log("rain" === "sun");
```

Esto imprime:

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

¿Qué pasa si los confundes? Prueba este semáforo. Adivina antes de ejecutarlo.

```ts
let lightColor = "green";

if (lightColor = "red") {
  console.log("stop");
}
console.log(lightColor);
```

Esto imprime:

```text
stop
red
```

La luz estaba verde. El programa dice "stop", y ahora la luz está roja. La línea `lightColor = "red"` no hizo una pregunta. Guardó `"red"`, y el texto guardado cuenta como verdadero. No hubo ningún mensaje de error. Esta es una razón por la que debes escribir tres signos de igual.

Otra sorpresa: el texto se compara letra por letra, aunque parezca un número.

```ts
console.log(10 > 9);
console.log("10" > "9");
```

Esto imprime:

```text
true
false
```

El texto `"10"` empieza con `1`, y `"9"` empieza con `9`. La primera letra decide, y `1` va antes que `9`. Los números se comparan como números. El texto se compara como texto.

## if

Una instrucción **if** ejecuta código solo cuando una condición es `true`. El código va dentro de llaves `{ }`.

```ts
const isRaining = true;

if (isRaining) {
  console.log("Take an umbrella");
}
console.log("Leave the house");
```

Esto imprime:

```text
Take an umbrella
Leave the house
```

Si `isRaining` fuera `false`, el primer mensaje no se imprimiría. Solo se imprimiría `Leave the house`.

## else

Usa **else** para ejecutar código cuando la condición es `false`.

```ts
const temperature = 28;

if (temperature > 25) {
  console.log("Go to the beach");
} else {
  console.log("Stay at home");
}
```

Esto imprime:

```text
Go to the beach
```

## else if

Usa **else if** cuando tienes más de dos opciones. La computadora revisa las condiciones desde arriba. Ejecuta el primer bloque que es verdadero y se salta el resto.

```ts
const temperature = 12;

if (temperature < 0) {
  console.log("coat and gloves");
} else if (temperature < 15) {
  console.log("jacket");
} else {
  console.log("t-shirt");
}
```

Esto imprime:

```text
jacket
```

Aquí `temperature < 0` es falso, así que la computadora sigue. Luego `temperature < 15` es verdadero, así que imprime `jacket` y se detiene. Nunca mira el `else`.

El orden importa. Mira las mismas reglas en el orden equivocado:

```ts
const temperature = -5;

if (temperature < 15) {
  console.log("jacket");
} else if (temperature < 0) {
  console.log("coat and gloves");
}
```

Esto imprime `jacket`. A `-5` grados quieres un abrigo. La primera condición también es verdadera para `-5`, así que nunca se llega a la segunda.

### De vuelta al acertijo

El acertijo imprime `bronze medal`. Un puntaje de 95 es 50 o más, así que la primera condición es verdadera y la computadora se detiene. Nunca revisa la plata ni el oro. Un jugador con 95 puntos recibe la misma medalla que uno con 50.

Cada condición por sí sola es correcta. El error está en el orden. La solución es poner primero la condición más exigente:

```ts
const points = 95;

if (points >= 90) {
  console.log("gold medal");
} else if (points >= 70) {
  console.log("silver medal");
} else if (points >= 50) {
  console.log("bronze medal");
}
```

Ahora imprime `gold medal`. La regla: en una cadena de `else if`, la condición más específica va primero.

## Operadores lógicos

Puedes unir condiciones. Hay tres **operadores lógicos**.

`&&` significa Y. Los dos lados deben ser verdaderos.

`||` significa O. Al menos un lado debe ser verdadero.

`!` significa NO. Convierte `true` en `false` y `false` en `true`.

```ts
const hasTicket = true;
const hasPassport = false;

console.log(hasTicket && hasPassport);
console.log(hasTicket || hasPassport);
console.log(!hasPassport);
```

Esto imprime:

```text
false
true
true
```

Aquí tienes un plan según el clima que usa `&&` y `!`:

```ts
const temperature = 25;
const isRaining = true;

if (temperature > 20 && !isRaining) {
  console.log("beach");
} else if (temperature > 20) {
  console.log("cafe");
} else {
  console.log("home");
}
```

Antes de seguir, decide qué imprime. Hace calor, pero llueve. La primera condición necesita calor Y que no llueva, así que es falsa. La segunda condición solo trata del calor, así que es verdadera:

```text
cafe
```

Aquí va uno con `||`:

```ts
const day = "Saturday";

if (day === "Saturday" || day === "Sunday") {
  console.log("weekend");
}
```

Esto imprime:

```text
weekend
```

Fíjate en que escribes la comparación completa a ambos lados. `day === "Saturday" || "Sunday"` no funciona como esperas.

## Una nota breve sobre truthy y falsy

JavaScript te deja escribir `if (name)` sin una comparación. Trata algunos valores como falsos: `""`, `0`, `null` y `undefined`. Se llaman **falsy**. La mayoría de los otros valores son **truthy**.

Es corto, pero puede sorprenderte. Piensa en un cachorro de 0 años:

```ts
const age = 0;

if (age) {
  console.log("age is known");
} else {
  console.log("no age given");
}
```

Esto imprime `no age given`. La edad se conoce, y es 0. El número `0` es *falsy*, aunque `0` sea un valor válido.

> **Consejo:** Como principiante, escribe la comparación completa, como `age !== undefined`. Es más clara y más segura.

## Profundiza

### Por qué `&&` puede protegerte

La computadora lee `a && b` de izquierda a derecha. Si `a` es falso, la respuesta ya es falsa. Entonces no mira `b`. Esto se llama evaluación de **cortocircuito** (*short-circuit*).

```ts
const userName: string | undefined = undefined;

if (userName !== undefined && userName.length > 0) {
  console.log("has name");
} else {
  console.log("no name");
}
```

Esto imprime:

```text
no name
```

`userName.length` fallaría con `undefined`. Nunca se ejecuta, porque la primera parte es falsa. El orden de las dos partes importa. (`length` es el número de caracteres de un texto. Aprenderás más en la lección 06.)

### Una idea equivocada común: "las mayúsculas no importan" y el error con `||`

Las comparaciones son exactas. Las mayúsculas cuentan.

```ts
console.log("Passed" === "passed");
```

Esto imprime `false`. En un test, el texto de la página y el texto de tu código deben coincidir exactamente.

La lección mostró que `day === "Saturday" || "Sunday"` no funciona como se espera. Aquí está el motivo. La computadora lo lee como dos partes separadas: `day === "Saturday"` y `"Sunday"`. Un texto que no está vacío es *truthy*, así que la segunda parte siempre es verdadera.

```ts
const day = "Monday";

if (day === "Saturday" || "Sunday") {
  console.log("weekend");
}
```

Esto imprime `weekend`, aunque el día sea `Monday`.

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

Esto imprime:

```text
FAIL: expected Welcome, Ana but got Welcome, Luis
```

El `expect` de Playwright hace esto por ti. Además detiene el test e imprime un mensaje claro. En la siguiente lección escribirás la comprobación una sola vez como una función. Este es un caso de DRY, "Don't Repeat Yourself" (no te repitas). Lo estudiarás al final de este módulo.

### Cuándo no usar `if`

No pongas un `if` dentro de un test para esconder un resultado distinto. Un test debe seguir un camino claro. Si el test puede tomar dos caminos, quizá no sepas cuál se ejecutó, y una falla puede quedar escondida.

### Valores límite

La mayoría de los errores de decisión viven en el borde, no en el medio. Una regla "envío gratis desde 50" puede estar mal en 49, 50 y 51, y en ningún otro lugar. Un **valor límite** es un valor en el borde de una regla. Cuando pruebas una decisión, elige valores justo por debajo, justo en el borde y justo por encima de cada límite. Más adelante en el curso convertirás estos valores en filas de datos de prueba.

## Práctica

1. Crea el archivo `exercises/01-programming/decisions.ts`.
2. Crea una `const` llamada `score` con un número. Escribe un `if` y un `else` que impriman `pass` cuando el puntaje sea 50 o más, y `fail` en caso contrario.
3. Cambia el puntaje. Ejecuta el archivo cada vez. Comprueba que la salida cambia. Usa 49, 50 y 51.
4. Agrega un `else if` para un tercer caso: imprime `excellent` cuando el puntaje sea 90 o más. Ponlo antes del caso `pass`. Piensa por qué importa el orden.
5. Abre `exercises/01-programming/04-making-decisions.ts` y ejecútalo:

```bash
node exercises/01-programming/04-making-decisions.ts
```

Resuelve los ejercicios. Haz que todas las líneas digan `OK`.

## Reto

Construye las reglas del turno de un juego de mesa. Cada 3.er turno es un "turno de bonificación". Cada 5.º turno es un "turno de penalización". Un turno que es ambos es un "super turno". Cualquier otro turno es un "turno normal". Puedes cambiar el tema: un juego de cartas, el timbre de una escuela, un autobús con paradas especiales.

Crea el archivo `exercises/challenges/making-decisions.ts`. Guarda el número de turno en una `const` al inicio e imprime el nombre del turno.

Está terminado cuando:

- El turno `7` imprime `normal turn`, el turno `9` imprime `bonus turn` y el turno `10` imprime `penalty turn`.
- El turno `15` imprime `super turn` y el turno `30` imprime `super turn`.
- Ejecutaste el archivo al menos una vez con cada uno de estos cinco valores, cambiando la única `const`.
- Un comentario explica qué le pasa al turno 15 si mueves la comprobación del super turno al final, y probaste tu respuesta.

Vas a necesitar algo que esta lección no enseñó: una forma de preguntar "¿este número se divide exactamente entre 3?". Busca: `javascript remainder operator`, `javascript modulo`.

## Piénsalo bien

1. Una persona planea su día. ¿Qué imprime esto y por qué?

```ts
const temperature = 20;
const isRaining = false;

if (temperature > 20 && !isRaining) {
  console.log("beach");
} else if (temperature > 20) {
  console.log("cafe");
} else {
  console.log("home");
}
```

<details>
<summary>Respuesta</summary>

Imprime `home`. No llueve, pero `20 > 20` es falso, porque 20 no es mayor que 20. Así que la primera y la segunda condición son falsas, y la computadora llega al `else`. Una persona diría "20 grados es calor". El código solo sigue el signo que escribiste. El valor en el borde es donde vive este tipo de sorpresa.

</details>

2. Este juego debe imprimir `custom level` solo cuando el nivel no es `easy` ni `hard`. También lo imprime para `easy`. Encuentra el bug.

```ts
const level = "easy";

if (level !== "easy" || level !== "hard") {
  console.log("custom level");
}
```

<details>
<summary>Respuesta</summary>

Con `||`, basta un lado verdadero. El nivel `easy` hace verdadera la segunda parte, porque no es `hard`. Todo texto es distinto de al menos una de las dos palabras, así que la condición siempre es verdadera. Usa `&&`: los dos lados deben ser verdaderos. Otra forma de verlo: "no (easy o hard)" es lo mismo que "no easy y no hard".

</details>

3. Dos maneras de dar una nota. Las dos funcionan para puntajes de 0 a 100. ¿Cuál es mejor y qué te haría elegir la otra?

```ts
if (score >= 90) {
  console.log("A");
} else if (score >= 80) {
  console.log("B");
} else {
  console.log("C");
}
```

```ts
if (score >= 90) {
  console.log("A");
}
if (score >= 80 && score < 90) {
  console.log("B");
}
if (score < 80) {
  console.log("C");
}
```

<details>
<summary>Respuesta</summary>

La primera es más corta y más fácil de cambiar, porque cada límite aparece una vez y la cadena asegura que solo se ejecute un bloque. La segunda dice cada rango completo, así que puedes leer cada bloque solo, en cualquier orden. El costo es que los rangos deben encajar sin huecos y sin traslapes. Si cambias un límite y olvidas otro, un puntaje puede recibir dos notas o ninguna. Elige la segunda solo cuando los bloques son independientes y un puntaje puede necesitar coincidir con varios.

</details>

4. Una tienda dice "envío gratis desde 50". El código es `total >= 50`. La tienda cambia la regla a "envío gratis por encima de 50". ¿Qué cambia en el código y qué total revela un error?

<details>
<summary>Respuesta</summary>

Cambia `>=` por `>`. El total de exactamente 50 es el valor que revela el error, porque es el único que cambia de significado. Un total de 40 o de 60 da el mismo resultado en las dos versiones. Por eso los testers eligen valores en el borde: un signo equivocado se esconde en todas partes menos ahí.

</details>

5. Un refugio de mascotas escribe `if (age)` para comprobar que un perro tiene edad. Un cachorro de 0 años recibe el mensaje "no age given". ¿Por qué y qué escribirías en su lugar?

<details>
<summary>Respuesta</summary>

`0` es *falsy*, así que `if (age)` lo trata igual que un valor que falta. La edad se conoce y es cero. Escribe la pregunta que de verdad quieres hacer: `age !== undefined` si la edad puede faltar. El caso límite aquí es el cero: el número válido más pequeño parece "nada" para una comprobación corta.

</details>

6. Un compañero pone un `if` dentro de un test: "si el banner está en la página, ciérralo y luego continúa". ¿Es buena idea? No hay una única respuesta correcta. Explica la concesión.

<details>
<summary>Respuesta</summary>

Hace que el test pase en las dos situaciones, así que es menos probable que falle por una razón que no es un bug real. El costo es que el test ahora tiene dos caminos y no sabes cuál se ejecutó. Si el banner desaparece por un bug, el test igual pasa. Depende de lo que quieras aprender. Si el banner es parte del requisito, pruébalo en su propio test. Si es ruido aleatorio, como un aviso de cookies, manéjalo en un solo lugar, no en cada test.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Cuál es la diferencia entre `==` y `===` en JavaScript, y qué es la coerción de tipos?**
   - Busca: `javascript == vs === type coercion`
   - Pruébalo: imprime `0 == ""`, `0 === ""`, `null == undefined`, `null === undefined` y `"1" == 1`. VS Code puede subrayar algunos. Node los ejecuta de todos modos. Escribe la razón de cada resultado.
   - Una buena respuesta explica: qué significa coerción, dos resultados sorprendentes de `==`, y por qué `===` es más seguro.

2. **¿Qué es la evaluación de cortocircuito en JavaScript y qué hace `??`?**
   - Busca: `javascript short-circuit evaluation && || nullish coalescing`
   - Pruébalo: imprime `"" || "default"`, `0 || "default"` y `0 ?? "default"`. Explica por qué difieren las dos últimas.
   - Una buena respuesta explica: cómo `&&` y `||` se detienen antes, y cuándo `??` es la mejor opción.

3. **¿Por qué muchas guías de testing dicen que un test no debe contener instrucciones `if`?**
   - Busca: `no conditional logic in tests`
   - Pruébalo: toma tu programa de turnos de juego y escribe una tabla de seis turnos con sus resultados esperados. Comprueba cada fila ejecutando el programa. La tabla, no un `if` dentro del test, te dice qué es lo correcto.
   - Una buena respuesta explica: el problema de los tests con varios caminos, y qué hacer en su lugar.

## Siguiente paso

En la siguiente lección pones código en funciones, para poder darle un nombre y usarlo muchas veces.
