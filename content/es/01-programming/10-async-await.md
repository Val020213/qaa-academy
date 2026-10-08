---
title: async y await
duration: 60 min
---

## Objetivo

En esta lección aprendes a escribir código que espera trabajo lento, y a reconocer el error que ocurre cuando olvidas esperar.

- Predecir en qué orden se imprimen las líneas de código lento y de código rápido.
- Usar `async` y `await` para que tu código espere donde debe.
- Detectar el *bug* del `await` olvidado, que puede no dar ningún mensaje de error.
- Decidir cuándo las tareas deben correr una tras otra y cuándo juntas.

## Algunas tareas toman tiempo

Hasta ahora usamos operaciones que terminan antes de pasar a la siguiente línea. Algunas tareas terminan más tarde: pedirle a un servidor el clima de mañana, cargar una canción desde internet, abrir una página en el navegador.

Al iniciar una operación asíncrona, Node.js puede pasar a la línea siguiente antes de que termine. Una operación síncrona, aunque sea lenta, sí bloquea esa ejecución.

## El trabajo lento termina después

En el hilo principal de Node.js, el motor de JavaScript ejecuta una función a la vez. Node.js gestiona temporizadores y operaciones de entrada y salida mientras ese código sigue. Su bucle de eventos ejecuta los callbacks pendientes cuando el hilo puede atenderlos.

`setTimeout` ejecuta una función después de un tiempo en milisegundos. Un milisegundo es una milésima de segundo. Mira qué pasa con un tiempo de 0:

```ts
console.log("Put the kettle on")
setTimeout(() => console.log("Kettle is ready"), 0)
console.log("Get a cup")
```

La salida es:

```text
Put the kettle on
Get a cup
Kettle is ready
```

Incluso con 0 milisegundos, el callback espera a que termine el código que ya se está ejecutando. Node.js ajusta ese retraso a 1 ms; después puede ejecutar el callback cuando el hilo esté libre. El retraso no garantiza una hora exacta.

## Promise

Una **Promise** (promesa) representa el resultado de una operación. Puede estar pendiente, cumplida con un valor o rechazada con un motivo; puede haber terminado cuando la recibes.

El tipo `Promise<string>` indica que, si se cumple, su valor es un `string` (texto).

Aquí hay un *helper* (ayudante) que simula trabajo lento. Espera unos milisegundos:

```ts
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
```

Por ahora no necesitas entender el interior de este *helper*. Úsalo como una herramienta. `Promise<void>` indica que no necesitas usar un valor de resultado. Este temporizador se cumple sin entregar un valor.

## async y await

Pon `await` antes de una Promise para pausar la función hasta que se cumpla o se rechace. Si se cumple, recibes su valor; si se rechaza, `await` lanza el motivo del rechazo.

Puedes usar `await` dentro de una función marcada con `async`. También puedes usarlo en el nivel superior de un módulo. Una función `async` siempre devuelve una Promise.

```ts
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function loadForecast(): Promise<string> {
  await wait(500)
  return "sunny"
}

async function main(): Promise<void> {
  console.log("Asking for the forecast...")
  const forecast = await loadForecast()
  console.log(`Forecast: ${forecast}`)
}

main()
```

El programa imprime `Asking for the forecast...`. Unos 500 ms después imprime:

```text
Forecast: sunny
```

Lee `await loadForecast()` como "espera a que loadForecast termine". La variable `forecast` es un `string` normal, no una Promise.

## El await olvidado

Mira el mismo programa sin el `await` antes de `loadForecast()`:

```ts
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function loadForecast(): Promise<string> {
  await wait(500)
  return "sunny"
}

async function main(): Promise<void> {
  const forecast = loadForecast()
  console.log(`Forecast: ${forecast}`)
}

main()
```

El programa imprime:

```text
Forecast: [object Promise]
```

La variable `forecast` guarda la Promise, no el resultado. El programa no esperó e imprimió demasiado pronto. No hay ningún mensaje de error, y por eso es el tipo difícil de *bug*.

![El tipo de forecast cambia de Promise<string> a string al agregar await en el Playground.](/clips/01b-await-result.webm)

> **Consejo:** Cuando un valor se vea como `[object Promise]`, o un programa se comporte distinto en cada ejecución, revisa primero si falta un `await`.

Sin `await`, la función sí se ejecuta. Solo que no la esperas. Aquí, `await` pausa la función que lo contiene y permite que otro código siga. `slowLog` devuelve una Promise que se cumple sin valor; su mensaje se imprime más tarde.

![await pausa slowLog; main sigue antes de que se reanude slowLog.](/images/01-await-caller.es.svg)

```ts
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function slowLog(): Promise<void> {
  await wait(100)
  console.log("pasta is ready")
}

async function main(): Promise<void> {
  slowLog()
  console.log("table is set")
}

main()
```

El resultado es:

```text
table is set
pasta is ready
```

## try y catch

Una Promise puede fallar. Un servidor puede estar caído. Una canción puede no existir. Cuando una Promise se rechaza, `await` lanza su motivo de rechazo en la función que espera.

Usa `try` y `catch` para manejar el error. El código de `try` se ejecuta primero. Si lanza un error, se ejecuta el código de `catch`.

```ts
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function loadSong(id: number): Promise<string> {
  await wait(100)
  if (id !== 1) {
    throw new Error(`Song ${id} not found`)
  }
  return "Blue in Green"
}

async function main(): Promise<void> {
  try {
    const title = await loadSong(2)
    console.log(title)
  } catch (error) {
    console.log("Something went wrong:", error instanceof Error ? error.message : error)
  }
}

main()
```

El programa imprime:

```text
Something went wrong: Song 2 not found
```

La comprobación `error instanceof Error` asegura que el error tenga un `message`. TypeScript no sabe qué tipo de valor se lanzó, así que tú debes comprobarlo.

## Await dentro de un bucle

Puedes usar `await` dentro de un bucle `for...of`. Cada paso termina antes de que empiece el siguiente.

```ts
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main(): Promise<void> {
  const songs = ["Intro", "Chorus", "Outro"]
  for (const song of songs) {
    await wait(100)
    console.log(`${song} loaded`)
  }
}

main()
```

El programa imprime tres líneas, una tras cada espera de unos 100 milisegundos.

## Una tras otra, o juntas

En este ejemplo, cada tarea empieza después del `await` anterior: tres esperas de 100 ms tardan unos 300 ms. Si las tareas son independientes, puedes iniciarlas juntas al llamar a las tres funciones y esperar sus Promises con `Promise.all`. Usa la función `wait` de arriba.

```ts
async function main(): Promise<void> {
  const startOne = Date.now()
  await wait(100)
  await wait(100)
  await wait(100)
  console.log(`One by one: ${Date.now() - startOne} ms`)

  const startAll = Date.now()
  await Promise.all([wait(100), wait(100), wait(100)])
  console.log(`Together: ${Date.now() - startAll} ms`)
}

main()
```

La primera línea marca unos 300 ms y la segunda unos 100 ms (los tiempos varían en cada ejecución). Juntas es más rápido, pero solo cuando las tareas no dependen unas de otras.

## Profundiza

### forEach no espera al código async

El método `forEach` inicia una función async por cada elemento y no espera a ninguna. Usa `for...of` con `await` cuando necesites esperar cada paso. La primera pregunta de abajo muestra el resultado.

## Práctica

1. Crea el archivo `exercises/01-programming/async-practice.ts`.
2. Copia el primer ejemplo de `wait` de la sección "async y await". Ejecútalo con `node exercises/01-programming/async-practice.ts`.
3. Quita el `await` antes de `loadForecast()` y ejecútalo de nuevo. Lee la salida. Luego vuelve a poner el `await`.
4. Abre `exercises/01-programming/10-async-await.ts`. Reemplaza cada `// TODO` con código.
5. Ejecuta el archivo del ejercicio con este comando:

```bash
node exercises/01-programming/10-async-await.ts
```

Haz que cada comprobación diga `OK`.

## Reto

Tres tiendas reportan su inventario: una panadería, una lechería y un puesto de fruta. Cada reporte es una función async lenta. La panadería tarda 200 ms, la lechería 300 ms y el puesto de fruta 100 ms. La lechería siempre falla con un error. Escribe un programa que consulte a las tres tiendas al mismo tiempo e imprima una línea por cada tienda. Una tienda que falla no debe detener a las otras dos. Puedes elegir otro tema, por ejemplo tres estaciones del clima o tres servicios de música.

Crea el archivo `exercises/challenges/10-async-await.ts`.

Está terminado cuando:

- Ejecutas `node exercises/challenges/10-async-await.ts` e imprime una línea con etiqueta por cada tienda, por ejemplo `dairy: failed, fridge is offline`.
- El programa no se rompe, aunque una tienda falle.
- El programa imprime el tiempo total, y el total está cerca de 300 ms, no de 600 ms.
- Ninguna línea imprime `[object Promise]`, y no usas `forEach` con `async`.

Vas a necesitar algo que esta lección no enseñó: una forma de esperar muchas Promises y conservar tanto los éxitos como los fallos. `Promise.all` se rechaza al recibir el primer rechazo, pero no cancela las otras tareas. Busca: `promise.allsettled status fulfilled rejected`.

## Piénsalo bien

1. ¿Qué imprime este programa y en qué orden? ¿Por qué?

```ts
async function main(): Promise<void> {
  const ids = [1, 2, 3]
  ids.forEach(async (id) => {
    await wait(100)
    console.log(`done ${id}`)
  })
  console.log("finished")
}

main()
```

Usa la función `wait` de esta lección.

<details><summary>Respuesta</summary>

Imprime `finished` primero. Después imprime `done 1`, `done 2` y `done 3`, unos 100 ms más tarde. `forEach` inicia las tres funciones async y sigue, así que `finished` se imprime antes de que termine cualquiera de ellas. Para esperar cada una, usa un bucle `for...of` con `await` dentro.

</details>

2. Este código tiene un *bug*. Se ejecuta, pero hace lo incorrecto. Encuéntralo.

```ts
async function isLoaded(): Promise<boolean> {
  await wait(100)
  return false
}

async function main(): Promise<void> {
  if (isLoaded()) {
    console.log("loaded")
  } else {
    console.log("not loaded")
  }
}

main()
```

<details><summary>Respuesta</summary>

Falta el `await` antes de `isLoaded()`. El `if` recibe una Promise, y para un `if` una Promise siempre es "verdadera". Así que el programa siempre imprime `loaded`, aunque la función devuelva `false`. Con la configuración estricta, TypeScript reporta un error: "This condition will always return true since this 'Promise<boolean>' is always defined." Escribe `if (await isLoaded())`.

</details>

3. En este programa se quitó el `await` antes de `loadSong(2)`. La función `loadSong` lanza un error para todos los ids excepto el 1. ¿Qué esperas que pase y qué se rompe?

```ts
async function main(): Promise<void> {
  try {
    const title = loadSong(2)
    console.log(title)
  } catch (error) {
    console.log("Something went wrong")
  }
  console.log("end of main")
}

main()
```

Usa `loadSong` de la sección "try y catch".

<details><summary>Respuesta</summary>

Imprime `Promise { <pending> }` y `end of main`. Después Node se cierra con el error "Song 2 not found", y `catch` nunca se ejecuta. Sin `await`, el bloque `try` termina sin esperar el rechazo de esa Promise. El `catch` no lo recibe y, con las opciones predeterminadas de Node.js, el rechazo sin manejar detiene el programa. El `catch` todavía puede atrapar errores síncronos del bloque.

</details>

## Siguiente paso

En la siguiente lección aprendes a dividir el código en archivos y a compartirlo con `export` e `import`.
