---
title: El archivo de configuración
summary: Lee playwright.config.ts línea por línea, predice cómo se comporta en tu máquina y en CI, y cámbialo con seguridad.
duration: 90 min
---

## Empieza con un acertijo

Una compañera está cansada de los reintentos en su laptop. Lee la configuración:

```ts
retries: process.env.CI ? 2 : 0,
```

Ella piensa: "Voy a apagar CI". En PowerShell ejecuta `$env:CI="false"` y luego `pnpm e2e`.

Espera cero reintentos y ninguna comprobación de `test.only`. Pero un test que falla se sigue ejecutando tres veces en total, y un `test.only` olvidado detiene la ejecución.

¿Por qué el valor `"false"` no apaga nada? ¿Qué cambiarías en su comando para conseguir lo que quiere?

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Predecir cómo se comporta la configuración en tu máquina y en CI.
- Explicar de qué te protege cada opción.
- Elegir dónde va una opción: en la configuración, en el comando o en el test.
- Ejecutar los tests en otro puerto, y explicar por qué lo harías.

## Qué es el archivo de configuración

El archivo `playwright.config.ts` está en la raíz del proyecto. Playwright lo lee cada vez que ejecutas `pnpm e2e`. Dice dónde están los tests, cómo ejecutarlos y cómo reportarlos.

No lo escribes seguido. Pero debes poder leerlo, porque explica mucho de lo que ves cuando los tests corren. Abre el archivo y sigue esta lección.

Leer documentación es una habilidad. Cuando encuentres una opción nueva, abre la página de Playwright sobre las opciones de test. Busca tres cosas: la firma (el tipo del valor), el ejemplo y las notas sobre casos límite. No necesitas leer toda la página.

## El puerto y la dirección

```ts
const PORT = process.env.QAA_E2E_PORT ?? "5180"
const BASE_URL = `http://localhost:${PORT}`
```

`process.env` guarda las **variables de entorno**. Son valores con nombre que la terminal le pasa a un programa. `QAA_E2E_PORT` es una que inventamos para este proyecto.

El signo `??` significa: usa el valor de la izquierda y, si no existe, usa el de la derecha. Así que el puerto es `5180` a menos que definas `QAA_E2E_PORT`.

`BASE_URL` arma la dirección. Las comillas invertidas y `${PORT}` ponen el puerto dentro del texto.

## defineConfig

```ts
export default defineConfig({
```

`defineConfig` es un *helper* de Playwright. Revisa los tipos de tus opciones, así el editor puede ayudarte. Todo lo que sigue está dentro de él.

## testDir

```ts
testDir: "./e2e",
```

La carpeta donde Playwright busca los specs. Cada archivo `.spec.ts` dentro de `e2e`, también en las subcarpetas, es un spec. Por eso los archivos de ejercicios también se ejecutan con `pnpm e2e`.

## fullyParallel

```ts
fullyParallel: true,
```

Playwright ejecuta tests al mismo tiempo, en varios **workers**. Un worker es un proceso que ejecuta tests. Con `true`, incluso los tests del mismo archivo corren en paralelo. Esto es rápido. Solo funciona porque los tests están aislados, como viste en la lección anterior.

## forbidOnly y retries

```ts
forbidOnly: !!process.env.CI,
retries: process.env.CI ? 2 : 0,
```

`CI` es una variable que ponen los servidores de CI. El `!!` convierte un valor en `true` o `false`. El signo `? :` es un `if / else` corto. En CI, un `test.only` olvidado hace fallar la ejecución, y un test que falló se ejecuta otra vez, hasta dos veces. En tu máquina quieres ver la falla de inmediato.

### Experimento: ¿qué pregunta de verdad la configuración?

Antes de leer la salida, predice `retries` y `forbidOnly` para cada valor de `CI`: sin definir, `""` (texto vacío), `"0"`, `"false"`. Escribe cuatro pares. Luego ejecuta este archivo con `node`.

```ts
for (const value of [undefined, "", "0", "false"]) {
  if (value === undefined) delete process.env.CI
  else process.env.CI = value

  console.log(JSON.stringify(value), process.env.CI ? 2 : 0, !!process.env.CI)
}
```

Imprime:

```text
undefined 0 false
"" 0 false
"0" 2 true
"false" 2 true
```

Una variable de entorno siempre es texto. El texto `"0"` y el texto `"false"` no están vacíos, así que cuentan como `true`. Solo una variable que falta o un texto vacío cuenta como `false`. La comprobación significa "la variable existe", no "la variable dice que sí".

> **Cuidado:** Los reintentos pueden esconder un test *flaky* (inestable): falla, luego pasa, y la ejecución sale verde. Si el reporte dice "flaky", arregla el test.

### De vuelta al acertijo

Su comando pone `CI` en el texto `"false"`. Ese texto no está vacío, así que `process.env.CI` cuenta como verdadero. Obtiene dos reintentos y `forbidOnly` activado, lo contrario de lo que quería. Debe quitar la variable (`Remove-Item Env:CI`) o ponerla en un texto vacío. Mejor aún: que no toque `CI` en absoluto. Si quiere cero reintentos en una ejecución, puede usar `--retries=0` en el comando.

## reporter

```ts
reporter: process.env.CI
  ? [["github"], ["html", { open: "never" }]]
  : [["list"], ["html", { open: "never" }]],
```

Un **reporter** decide cómo se muestran los resultados. En tu máquina obtienes `list`, la lista de tests que viste en la terminal, y un reporte HTML. En CI obtienes `github`, que agrega mensajes a la ejecución de GitHub, y el reporte HTML. `open: "never"` significa que el reporte no se abre solo. Lo abres con `pnpm e2e:report`.

## use

```ts
use: {
  baseURL: BASE_URL,
  trace: "on-first-retry",
  screenshot: "only-on-failure",
},
```

`use` guarda opciones para todos los tests.

- `baseURL` es el comienzo de cada dirección. Por eso `page.goto("/#/practice")` funciona.
- `trace` graba un *trace* (traza) solo cuando un test se reintenta. En local, agrega `--trace on`.
- `screenshot` toma una captura solo cuando un test falla.

## projects

```ts
projects: [
  {
    name: "chromium",
    use: { ...devices["Desktop Chrome"] },
  },
],
```

Un **project** (proyecto) es un conjunto de opciones con el que se ejecutan los tests. Aquí hay un proyecto: el navegador Chromium. `devices["Desktop Chrome"]` es una lista de opciones que copian un Chrome de escritorio: tamaño de pantalla y otras. Los `...` copian esas opciones dentro del objeto. Ves `[chromium]` en cada línea del reporte de lista.

Podrías agregar más proyectos, como Firefox o un teléfono. Cada proyecto ejecuta todos los tests otra vez.

## webServer

```ts
webServer: {
  command: `pnpm dev --port ${PORT}`,
  url: BASE_URL,
  reuseExistingServer: !process.env.CI,
  timeout: 60_000,
},
```

`webServer` le dice a Playwright que inicie la app antes de los tests y la detenga al final. Por eso no necesitas ejecutar `pnpm dev` antes.

- `command` es el comando que inicia la app.
- `url` es la dirección que Playwright revisa para saber que la app está lista.
- `timeout` es cuánto esperar a la app. `60_000` son 60 segundos. El `_` solo hace el número más fácil de leer.
- `reuseExistingServer` decide qué pasa si algo ya responde en la `url`. En tu máquina es `true`: Playwright lo usa. En CI es `false`: Playwright se detiene con un error.

> **Cuidado:** En tu máquina, con `reuseExistingServer`, Playwright prueba lo que sea que corra en ese puerto. Si otra app usa el puerto 5180, pruebas la app equivocada y no ves ningún error al respecto. Usa `QAA_E2E_PORT` para evitarlo.

## Cambia el puerto

En PowerShell, define la variable y ejecuta los tests en una sola línea:

```bash
$env:QAA_E2E_PORT="5185"; pnpm e2e
```

Playwright inicia el sitio en el puerto 5185 y usa `http://localhost:5185` como dirección base. La variable queda definida en esta ventana de terminal hasta que la cierres o la quites:

```bash
Remove-Item Env:QAA_E2E_PORT
```

En macOS o Linux, escribe `QAA_E2E_PORT=5185 pnpm e2e`. Ahí la variable dura solo para ese comando.

> **Nota:** No uses 5190. La practice shop usa ese puerto.

## Profundiza

### Por qué la configuración puede contener código

`playwright.config.ts` es un archivo normal de TypeScript. Playwright lo carga y lee lo que exporta. Por eso puedes usar `process.env`, `??` y `? :` dentro de él. La configuración es código que devuelve opciones.

Esto también hace de la configuración un buen lugar para DRY, "Don't Repeat Yourself" (no te repitas). El `baseURL` se escribe una vez. Si la configuración no lo tuviera, cada test necesitaría la dirección completa. Cuando cambie el puerto, tendrías que editar cada test. Ahora editas una línea, o defines una variable.

### Una idea equivocada común: "`??` y `||` son lo mismo"

El signo `??` reemplaza solo un valor que falta. Un texto vacío se conserva:

```ts
process.env.QAA_E2E_PORT = ""
console.log(`http://localhost:${process.env.QAA_E2E_PORT ?? "5180"}`)
console.log(`http://localhost:${process.env.QAA_E2E_PORT || "5180"}`)
```

Esto imprime `http://localhost:` primero y `http://localhost:5180` después. El signo `||` también reemplaza un texto vacío. Reemplaza también el número `0`. Para una opción donde `0` es una elección real, esto importa:

```ts
process.env.WORKERS = "0"
console.log(Number(process.env.WORKERS) || 4)
console.log(Number(process.env.WORKERS) ?? 4)
```

Imprime `4` y luego `0`. Aquí `||` descarta un valor que la persona escribió a propósito. Elige el signo preguntándote: ¿qué valores significan "no se dio nada"?

### Un compromiso: más workers no siempre es más rápido

`fullyParallel` ejecuta tests en varios workers. Por defecto, Playwright usa más o menos la mitad de los núcleos del procesador de la máquina. Pero la app y los navegadores también necesitan el procesador. En una máquina de CI pequeña, demasiados workers hacen más lento cada test. Entonces aparecen tiempos agotados, y los tests parecen flaky cuando no tienen nada malo.

Cuando depuras una falla extraña, ejecuta con un solo worker:

```bash
pnpm e2e e2e/playground.spec.ts --workers=1
```

Si la falla desaparece, la causa puede ser la carga o datos compartidos. Entonces revisa el aislamiento y la máquina, no solo el test.

## Práctica

1. Abre `playwright.config.ts`. Encuentra cada opción de esta lección.
2. Escribe: ¿cuántos reintentos tienes en tu máquina? ¿Cuántos en CI?
3. Ejecuta todos los tests en un puerto distinto:

```bash
$env:QAA_E2E_PORT="5185"; pnpm e2e
```

4. La salida no imprime el puerto. Si los tests pasan, el sitio respondió en el puerto 5185.
5. Quita la variable con `Remove-Item Env:QAA_E2E_PORT`. Ejecuta `pnpm e2e` otra vez. Ahora el sitio usa el puerto 5180.

Esta lección no tiene archivo de ejercicios.

## Reto

Arma una segunda configuración para una pregunta distinta, sin cambiar `playwright.config.ts`. La pregunta: "¿Los tests de la página Practice también pasan en una ventana pequeña, y de uno en uno?"

Crea el archivo `playwright.challenge.config.ts` en la raíz del proyecto. Debe ejecutar solo los tests de `e2e/playground.spec.ts`, en dos proyectos. El primer proyecto es un navegador de escritorio. El segundo es un proyecto de pantalla pequeña a tu elección: un teléfono de la lista de dispositivos de Playwright, o un tamaño de ventana que tú escojas. Debe usar un worker y un reintento, y debe iniciar el sitio en el puerto 5186, con el puerto escrito una sola vez en el archivo.

Está terminado cuando:

- `pnpm exec playwright test --config playwright.challenge.config.ts --list` muestra 8 tests, cada uno con un nombre de proyecto entre corchetes, y ningún test de otro archivo.
- `pnpm exec playwright test --config playwright.challenge.config.ts` imprime `Running 8 tests using 1 worker` y los 8 pasan.
- `playwright.config.ts` no se cambió, y el número de puerto aparece una sola vez en tu archivo.
- `pnpm exec playwright test --config playwright.challenge.config.ts --project=<your second project name>` ejecuta solo 4 tests.

Vas a necesitar algo que esta lección no enseñó: cómo indicarle a Playwright otro archivo de configuración, cómo elegir solo algunos archivos de spec en una configuración y cómo definir el tamaño de una ventana. Busca: `playwright test --config option`, `playwright testMatch`, `playwright viewport emulation`.

## Piénsalo bien

1. Predice `retries` y `forbidOnly` para cada uno de estos casos, y explica por qué: `CI` sin definir; `CI` definida como `""`; `CI` definida como `"0"`.

<details><summary>Respuesta</summary>

Sin definir: 0 reintentos y `forbidOnly` falso, porque la variable no existe. Texto vacío: lo mismo, porque un texto vacío cuenta como falso. El texto `"0"`: 2 reintentos y `forbidOnly` verdadero, porque cualquier texto que no esté vacío cuenta como verdadero, también cuando parece decir "no". La configuración comprueba si la variable tiene un valor, no qué significa el valor.

</details>

2. Esta configuración corre sin ningún mensaje de error al inicio, pero la ejecución falla después de un minuto más o menos. Encuentra el bug.

```ts
const PORT = process.env.QAA_E2E_PORT ?? "5180"
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  webServer: {
    command: "pnpm dev --port 5180",
    url: BASE_URL,
    timeout: 60_000,
  },
})
```

<details><summary>Respuesta</summary>

El comando tiene el puerto escrito como `5180`, pero la `url` sigue a `QAA_E2E_PORT`. Si defines `QAA_E2E_PORT=5185`, Playwright inicia el sitio en 5180 y espera un sitio en 5185. Nada responde ahí, así que después de 60 segundos se detiene con un tiempo agotado. El puerto está en dos lugares y los lugares pueden no coincidir. El arreglo es usar `${PORT}` también en el comando.

</details>

3. Dos versiones de una opción. Versión A: `reuseExistingServer: true` siempre. Versión B: `reuseExistingServer: !process.env.CI`. ¿Cuál es mejor para este equipo y qué te haría elegir la otra?

<details><summary>Respuesta</summary>

La versión B es mejor. En tu máquina, reutilizar un sitio que ya corre ahorra tiempo, porque a menudo ya tienes `pnpm dev` abierto. En CI no se espera un sitio corriendo en ese puerto, así que un error te avisa de que el entorno no está limpio. La versión A estaría bien si la máquina de CI siempre empieza limpia y nadie puede dejar un sitio corriendo. La elección depende de cuánto confías en el entorno.

</details>

4. El equipo agrega dos proyectos a la configuración: Firefox y un teléfono. ¿Qué cambia en la ejecución y qué podría romperse?

<details><summary>Respuesta</summary>

Ahora cada test corre tres veces, así que la ejecución dura unas tres veces más, y el reporte muestra nombres como `[firefox]` y `[phone]`. Los tests que usan `data-testid` y roles deberían seguir pasando. Los tests que dependen del tamaño de pantalla o del hover pueden fallar en el teléfono, por ejemplo cuando un menú pasa debajo del contenido en una ventana pequeña. Entonces cada falla te dice algo sobre la app, no solo sobre el test.

</details>

5. Un colega nuevo pregunta por qué los tests usan `page.goto("/#/practice")` y no la dirección completa. Explícalo en tres oraciones sin usar las palabras "DRY" ni "variable".

<details><summary>Respuesta</summary>

Ejemplo: "El comienzo de la dirección se escribe una vez, en el archivo de configuración. Si el puerto o el servidor cambian, editamos una línea y todos los tests siguen funcionando. Los mismos tests también pueden correr contra otra dirección." Una buena respuesta dice dónde vive la dirección y qué facilita eso.

</details>

6. Otra app ya corre en el puerto 5180 de tu máquina, y ejecutas `pnpm e2e` sin definir `QAA_E2E_PORT`. ¿Qué pasa y cómo lo notarías?

<details><summary>Respuesta</summary>

`reuseExistingServer` es verdadero en tu máquina, y la otra app responde en la `url`. Así que Playwright no inicia el sitio del curso y ejecuta los tests contra la otra app. No verías ningún mensaje al respecto. Verías fallas como elementos que no se encuentran. La primera pista es que casi todos los tests fallan a la vez, y la captura muestra una página que no conoces.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es una variable de entorno y cómo se define una en PowerShell y en un shell de Unix?**
   - Busca: `environment variables powershell $env bash export`
   - Pruébalo: En PowerShell, ejecuta `$env:MY_NAME="Rex"; node -e "console.log(process.env.MY_NAME)"`. Abre una segunda ventana de terminal y ejecuta solo la parte de `node`. Compara los resultados.
   - Una buena respuesta explica: qué es una variable de entorno, cuánto dura en cada shell y por qué los programas leen sus opciones de ellas.

2. **¿Cuál es la diferencia entre `??` y `||` en JavaScript?**
   - Busca: `nullish coalescing vs logical or javascript`
   - Pruébalo: En un archivo de prueba, prueba ambos signos con `0`, `""`, `false`, `null` y `undefined` a la izquierda. Ejecútalo con `node` y escribe los resultados en una tabla pequeña.
   - Una buena respuesta explica: qué valores reemplaza cada signo, con ejemplos para `0`, un texto vacío y `undefined`.

3. **¿Qué es la integración continua y por qué los equipos ejecutan tests automáticos en cada pull request?**
   - Busca: `continuous integration automated tests pull request`
   - Pruébalo: Abre el archivo `.github/workflows/e2e.yml` en este proyecto. Encuentra el paso que ejecuta los tests y lista dos cosas que allí son distintas de tu laptop.
   - Una buena respuesta explica: qué hace CI, por qué los tests corren ahí con opciones distintas de las de una laptop y qué gana un equipo con eso.

## Siguiente paso

Ya conoces las herramientas principales de Playwright. En el próximo módulo aprendes las buenas prácticas de QAA: cómo escribir tests que se mantienen fáciles de leer y de arreglar.
