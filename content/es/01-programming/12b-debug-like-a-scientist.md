---
title: Depura como un científico
duration: 60 min
---

## Objetivo

En esta lección aprendes un método para encontrar *bugs* que no dan ningún mensaje de error: una hipótesis, un experimento pequeño y un cambio a la vez.

- Describir un *bug* con exactitud: qué esperabas y qué pasó.
- Hacer un ejemplo pequeño que falla a partir de uno grande.
- Formular una hipótesis que un experimento pueda refutar, y predecir el resultado antes de ejecutar.
- Explicar por qué ocurrió el *bug* y comprobar que la solución no rompió otros casos.

## El tipo difícil de bug

El tipo difícil es el **bug de lógica** de la lección 12: el programa corre, imprime un resultado y el resultado es incorrecto. Nada te dice dónde mirar. Cambiar algo, ejecutar de nuevo y luego cambiar otra cosa es adivinar, porque después de cinco cambios no sabes cuál importó. El método de esta lección prueba una sola hipótesis a la vez.

## El método

1. **Observa.** Escribe dos líneas. "Esperaba: ..." y "Obtuve: ...". Usa valores exactos, no "está roto".
2. **Reproduce.** Haz que el *bug* ocurra siempre, con la misma entrada. Un *bug* que no puedes repetir no lo puedes probar.
3. **Reduce.** Construye el **ejemplo mínimo**: la entrada más pequeña y las menos líneas que todavía fallan. Borra todo lo que no cambia el resultado.
4. **Formula una hipótesis.** Una **hipótesis** es una suposición que un experimento puede refutar. "El bucle se salta la segunda fila" es una hipótesis. "Algo anda mal con el bucle" no lo es.
5. **Diseña un experimento.** Elige un lugar para un `console.log`, o cambia una entrada. Escribe lo que predices que mostrará. Hazlo antes de ejecutar.
6. **Ejecútalo.** Si la predicción fue correcta, tu hipótesis puede ser cierta. Si fue incorrecta, tacha la hipótesis. Aprendiste algo.
7. **Cambia una cosa a la vez.** Nunca dos.
8. **Explica y vuelve a comprobar.** Cuando funcione, di por qué fallaba. Luego ejecuta los otros casos, para ver que la solución no rompió nada.

## Una investigación completa

Aquí hay un marcador de unas 20 líneas. Un juego da puntos a tres jugadores. El programa debe imprimir al ganador. Debería imprimir `Leo with 10 points`.

```ts
// Expected: "Winner: Leo with 10 points"
type Score = { player: string, points: number }

const text = '[{"player":"Mia","points":"9"},{"player":"Leo","points":"10"},{"player":"Zoe","points":"7"}]'
const scores = JSON.parse(text) as Score[]

function findWinner(table: Score[]): Score {
  let winner = table[0] as Score
  for (const row of table) {
    if (row.points > winner.points) {
      winner = row
    }
  }
  return winner
}

const winner = findWinner(scores)
console.log(`Players: ${scores.length}`)
console.log(`Winner: ${winner.player} with ${winner.points} points`)
```

Imprime:

```text
Players: 3
Winner: Mia with 9 points
```

**Observa.** Esperaba Leo con 10. Obtuve Mia con 9. El programa es igual cada vez, así que ya es reproducible. Ya es pequeño, así que no hay nada que reducir.

**Primera hipótesis: el bucle se salta a Leo.** El experimento: imprimir cada jugador dentro del bucle. Si la hipótesis es cierta, falta `Leo`. Predigo: no habrá línea con `Leo`.

```ts
  for (const row of table) {
    console.log("row:", row.player)
```

El resultado:

```text
row: Mia
row: Leo
row: Zoe
```

Mi predicción fue incorrecta, así que tacho la hipótesis. El bucle sí visita a Leo.

**Segunda hipótesis: la comparación dice "no" para la fila de Leo.** El experimento: imprimir los dos números y la comparación. Predigo que para Leo muestra `true`, porque 10 es más que 9.

```ts
    console.log(row.player, row.points, winner.points, row.points > winner.points)
```

El resultado:

```text
Mia 9 9 false
Leo 10 9 false
Zoe 7 9 false
```

La predicción falló otra vez. `10 > 9` debería ser `true`, así que mi idea de los datos está equivocada. Una predicción escrita es lo que te hace notar esta sorpresa.

**Reduce y prueba el valor.** Dos experimentos pequeños:

```ts
console.log(typeof JSON.parse('{"points":"10"}').points)
console.log("10" > "9")
console.log(10 > 9)
```

Imprimen:

```text
string
false
true
```

Lo encontré. El texto JSON tiene los números entre comillas, así que `points` es texto. El texto se compara letra por letra, y `"1"` va antes que `"9"`. Por eso `"10" > "9"` es `false`. La línea `as Score[]` le dijo a TypeScript que confiara en mí, así que no avisó.

**Arregla una sola cosa.** Convierte el texto en números cuando leas los datos:

```ts
const raw = JSON.parse(text) as { player: string, points: string }[]
const scores: Score[] = raw.map((row) => ({ player: row.player, points: Number(row.points) }))
```

Ahora imprime `Winner: Leo with 10 points`.

**Explica y vuelve a comprobar.** Los números eran texto, así que la comparación usó el orden del alfabeto. Revisa otros casos: los puntos `100` y `20` deben dar `100`, y Mia debe seguir ganando cuando tiene más puntos.

## Herramientas para cuando estás atascado

**Explicar al patito de goma.** Explica el código, línea por línea, en voz alta, a un patito de goma o a una silla vacía. Di qué hace cada línea y qué guarda cada variable. Muchas veces te oyes decir algo que no es cierto, y ese es el *bug*.

**Bisección.** Bisecar significa partir a la mitad el área de búsqueda. Un programa tiene 8 pasos y el resultado final es incorrecto. Imprime el valor después del paso 4. Si ya es incorrecto, el *bug* está en los pasos 1 a 4. Si es correcto, el *bug* está en los pasos 5 a 8. Parte a la mitad otra vez. Ocho pasos necesitan solo tres impresiones, no ocho.

## La lista de trampas

- **Arreglar el síntoma.** Haces que la salida se vea bien para esta entrada, por ejemplo con `if (name === "Leo")`. La causa sigue ahí.
- **"Ahora funciona, no sé por qué".** Esto no es una solución. El *bug* se está escondiendo. Deshaz tu cambio y mira si vuelve a fallar. Si no falla, no arreglaste nada.

## Práctica

1. Crea el archivo `exercises/01-programming/debug-practice.ts` y copia el programa del marcador.
2. Ejecútalo. Escribe las dos líneas "Esperaba" y "Obtuve" en un comentario.
3. Prueba las dos hipótesis, una por una. Escribe tu predicción en un comentario antes de ejecutar cada experimento, y tacha las hipótesis que fueron incorrectas.
4. Arregla el *bug* con un solo cambio. Luego prueba los puntos `100` y `20`.
5. Abre `exercises/01-programming/12b-debug-like-a-scientist.ts`. Tiene cinco funciones con un *bug* cada una. Todas corren, y cada una da un resultado incorrecto para algunas entradas.
6. Ejecuta el archivo con este comando:

```bash
node exercises/01-programming/12b-debug-like-a-scientist.ts
```

7. Para cada función, escribe una hipótesis y una predicción antes de cambiar el código. Haz que cada línea diga `OK`.

## Reto

Escribe un programa pequeño de un mundo que elijas, por ejemplo una receta que se ajusta para más personas o una tabla de fútbol. Ponle un *bug*. El programa debe correr, imprimir un resultado incorrecto y no mostrar ningún error. Luego escribe la investigación como comentarios en el archivo, en el orden en que la hiciste.

Crea el archivo `exercises/challenges/12b-debug-like-a-scientist.ts`.

Está terminado cuando:

- Ejecutas `node exercises/challenges/12b-debug-like-a-scientist.ts` e imprime un resultado incorrecto sin error.
- Los comentarios tienen "Expected" (esperado) y "Got" (obtenido), al menos dos hipótesis con una predicción para cada una, y una hipótesis que tachaste.
- Una segunda copia del programa, `exercises/challenges/12b-fixed.ts`, imprime el resultado correcto después de exactamente un cambio.
- Detuviste el programa al menos una vez con una instrucción `debugger`, usando `node inspect`, y un comentario nombra un valor que viste ahí.

Vas a necesitar algo que esta lección no enseñó: una forma de pedirle a Node que se detenga y te deje mirar los valores mientras el programa corre. Busca: `node inspect debugger vs code breakpoint`.

## Piénsalo bien

1. Este código corre, y la respuesta es incorrecta. Encuentra el *bug*.

```ts
function lastThree(scores: number[]): number[] {
  return scores.slice(-4)
}

console.log(lastThree([5, 8, 2, 9, 7]))
```

<details><summary>Respuesta</summary>

Imprime `[ 8, 2, 9, 7 ]`, que son cuatro puntajes, no tres. `slice(-4)` toma los últimos cuatro elementos. Debería ser `slice(-3)`. Es un *bug* de error por uno (*off-by-one*). Reduce la entrada a `[1, 2, 3, 4]` y cuenta el resultado. Revisa también los bordes: una lista de exactamente tres elementos y una lista de dos.

</details>

2. Una función debe devolver el promedio de una lista. Devuelve `NaN` para la lista `[]` y el valor correcto para cualquier otra lista. Un amigo dice: "solo agrega `if (list.length === 0) return 0`". ¿Esto arregla la causa o el síntoma? ¿Qué preguntarías antes de aceptarlo?

<details><summary>Respuesta</summary>

Puede ser solo una solución al síntoma. `NaN` viene de dividir 0 entre 0, lo cual es matemáticamente correcto para "ningún valor". Lo que debes preguntar es qué necesita quien llama: ¿una lista vacía debe devolver 0, no devolver nada o ser un error? Un promedio de 0 puede parecer un dato real y esconder un problema.

</details>

3. Cambias dos cosas a la vez y el *bug* desaparece. Un compañero dice que está bien, porque funciona. ¿Qué se rompe con esta forma de trabajar? ¿Cómo descubres qué cambio importó?

<details><summary>Respuesta</summary>

Pierdes la causa. Un cambio puede ser la solución real, y el otro puede ser un nuevo *bug* escondido. Para saberlo, deshaz un cambio y ejecuta de nuevo. Si el *bug* vuelve, ese cambio era la solución. Luego prueba cada cambio por separado.

</details>

## Siguiente paso

En la siguiente lección aprendes DRY, una forma de pensar que mantiene tu código fácil de cambiar y fácil de confiar.
