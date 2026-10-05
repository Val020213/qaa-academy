---
title: El archivo de configuración
summary: Lee playwright.config.ts línea por línea y aprende a cambiar el puerto con QAA_E2E_PORT.
duration: 45 min
---

## Objetivo

- Explicar cada opción de `playwright.config.ts`.
- Saber por qué `retries`, `forbidOnly` y `reporter` cambian en CI.
- Explicar qué hacen `webServer` y `reuseExistingServer`.
- Ejecutar los tests en otro puerto con `QAA_E2E_PORT`.

## Qué es el archivo de configuración

El archivo `playwright.config.ts` está en la raíz del proyecto. Playwright lo lee cada vez que ejecutas `pnpm e2e`. Dice dónde están los tests, cómo ejecutarlos y cómo reportarlos.

No lo escribes seguido. Pero debes poder leerlo, porque explica mucho de lo que ves cuando se ejecutan los tests. Abre el archivo y sigue esta lección.

## El puerto y la dirección

```ts
const PORT = process.env.QAA_E2E_PORT ?? "5180"
const BASE_URL = `http://localhost:${PORT}`
```

`process.env` guarda las **variables de entorno**. Son valores con nombre que la terminal pasa a un programa. `QAA_E2E_PORT` es una que inventamos para este proyecto.

El signo `??` significa: usa el valor de la izquierda, y si no existe, usa el de la derecha. Así el puerto es `5180` a menos que definas `QAA_E2E_PORT`.

`BASE_URL` arma la dirección. Las comillas invertidas y `${PORT}` ponen el puerto dentro del texto, como aprendiste en la lección sobre valores y variables.

## defineConfig

```ts
export default defineConfig({
```

`defineConfig` es un *helper* (ayudante) de Playwright. Comprueba los tipos de tus opciones, para que el editor pueda ayudarte. Todo lo que sigue está dentro de él.

## testDir

```ts
testDir: "./e2e",
```

La carpeta donde Playwright busca los *specs*. Todo archivo `.spec.ts` dentro de `e2e`, también en subcarpetas, es un *spec*. Por eso los archivos de ejercicios también se ejecutan con `pnpm e2e`.

## fullyParallel

```ts
fullyParallel: true,
```

Playwright ejecuta tests al mismo tiempo, en varios ***workers*** (procesos de trabajo). Un *worker* es un proceso que ejecuta tests. Con `true`, incluso los tests del mismo archivo se ejecutan en paralelo. Esto es rápido. Solo funciona porque los tests están aislados.

## forbidOnly

```ts
forbidOnly: !!process.env.CI,
```

`CI` es una variable que definen los servidores de CI. El `!!` la convierte en `true` o `false`. En CI, un `test.only` olvidado hace que la ejecución falle. En tu máquina, `only` está permitido.

## retries

```ts
retries: process.env.CI ? 2 : 0,
```

El signo `? :` es un `if / else` corto. En CI, un test que falla se ejecuta de nuevo, hasta dos veces. En tu máquina no hay reintentos. Quieres ver el fallo de inmediato.

> **Cuidado:** Los reintentos pueden esconder un test *flaky* (inestable): falla, luego pasa, y la ejecución queda en verde. Si el reporte dice "flaky", corrige el test.

## reporter

```ts
reporter: process.env.CI
  ? [["github"], ["html", { open: "never" }]]
  : [["list"], ["html", { open: "never" }]],
```

Un ***reporter*** (reportero) decide cómo se muestran los resultados. En tu máquina obtienes `list`, la lista de tests que viste en la terminal, y un reporte HTML. En CI obtienes `github`, que añade mensajes a la ejecución de GitHub, y el reporte HTML. `open: "never"` significa que el reporte no se abre solo. Lo abres con `pnpm e2e:report`.

## use

```ts
use: {
  baseURL: BASE_URL,
  trace: "on-first-retry",
  screenshot: "only-on-failure",
},
```

`use` guarda opciones para todos los tests.

- `baseURL` es el inicio de toda dirección. Por eso funciona `page.goto("/#/practice")`.
- `trace` graba un *trace* solo cuando un test se reintenta. En local, añade `--trace on`.
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

Un **project** (proyecto) es un conjunto de opciones con las que se ejecutan los tests. Aquí hay un proyecto: el navegador Chromium. `devices["Desktop Chrome"]` es una lista de opciones que copian un Chrome de escritorio: el tamaño de pantalla y más. Los `...` copian esas opciones dentro del objeto. Ves `[chromium]` en cada línea del reporte de lista.

Podrías añadir más proyectos, como Firefox o un teléfono.

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

> **Cuidado:** En tu máquina, con `reuseExistingServer`, Playwright prueba lo que esté corriendo en ese puerto. Si otra app usa el puerto 5180, pruebas la app equivocada y no ves ningún error. Usa `QAA_E2E_PORT` para evitarlo.

## Cambia el puerto

En PowerShell, define la variable y ejecuta los tests en una sola línea:

```bash
$env:QAA_E2E_PORT="5185"; pnpm e2e
```

Playwright inicia el sitio en el puerto 5185 y usa `http://localhost:5185` como dirección base. La variable queda definida en esta ventana de terminal hasta que la cierres o la quites:

```bash
Remove-Item Env:QAA_E2E_PORT
```

En macOS o Linux, escribe `QAA_E2E_PORT=5185 pnpm e2e`. Allí la variable dura solo para ese comando.

> **Nota:** No uses 5190. La tienda de práctica usa ese puerto.

## Profundiza

### Por qué la configuración puede contener código

`playwright.config.ts` es un archivo normal de TypeScript. Playwright lo carga y lee lo que exporta. Por eso puedes usar `process.env`, `??` y `? :` dentro de él. La configuración es código que devuelve opciones.

Esto también la convierte en un buen lugar para DRY, "Don't Repeat Yourself" (no te repitas). Piensa en `baseURL`. Se escribe una vez. Todos los tests usan `page.goto("/#/practice")`. Si la configuración no lo tuviera, cada test necesitaría la dirección completa. Cuando el puerto cambia, tendrías que editar todos los tests. Ahora editas una línea, o defines una variable.

Lo mismo vale para `trace`, `screenshot` y `projects`: una opción, todos los tests.

### Una idea equivocada común: "`!!process.env.CI` es verdadero solo en CI"

La configuración tiene `forbidOnly: !!process.env.CI`. El `!!` convierte un valor en `true` o `false`. Un principiante cree que `CI=false` da `false`. Pruébalo en TypeScript simple:

```ts
process.env.CI = "false"
console.log(!!process.env.CI)
delete process.env.CI
console.log(!!process.env.CI)
```

Imprime:

```text
true
false
```

Una variable de entorno siempre es texto. El texto `"false"` no está vacío, así que cuenta como `true`. Solo una variable que falta o un texto vacío da `false`. La comprobación significa "la variable existe", no "la variable dice que sí".

El signo `??` tiene un detalle parecido. Reemplaza solo un valor que falta. Un texto vacío se conserva:

```ts
process.env.QAA_E2E_PORT = ""
console.log(`http://localhost:${process.env.QAA_E2E_PORT ?? "5180"}`)
console.log(`http://localhost:${process.env.QAA_E2E_PORT || "5180"}`)
```

Esto imprime primero `http://localhost:` y después `http://localhost:5180`. El signo `||` también reemplaza un texto vacío.

### Una decisión con costo: más workers no siempre es más rápido

`fullyParallel` ejecuta tests en varios *workers*. Por defecto, Playwright usa cerca de la mitad de los núcleos del procesador de la máquina. Más *workers* significa más tests al mismo tiempo.

Pero la app y los navegadores también necesitan el procesador. En una máquina de CI pequeña, demasiados *workers* hacen más lento cada test. Entonces aparecen tiempos límite agotados, y los tests parecen *flaky* cuando no tienen ningún problema.

Cuando depuras un fallo extraño, ejecuta con un solo *worker*. La opción es `--workers=1`:

```bash
pnpm e2e e2e/playground.spec.ts --workers=1
```

Si el fallo desaparece, la causa puede ser la carga o los datos compartidos. Entonces revisa el aislamiento y la máquina, no solo el test.

## Práctica

1. Abre `playwright.config.ts`. Encuentra cada opción de esta lección.
2. Anota: ¿cuántos reintentos tienes en tu máquina? ¿Cuántos en CI?
3. Ejecuta todos los tests en un puerto distinto:

```bash
$env:QAA_E2E_PORT="5185"; pnpm e2e
```

4. La salida no imprime el puerto. Si los tests pasan, el sitio respondió en el puerto 5185.
5. Quita la variable con `Remove-Item Env:QAA_E2E_PORT`. Ejecuta `pnpm e2e` de nuevo. Ahora el sitio usa el puerto 5180.

Esta lección no tiene archivo de ejercicios.

## Comprueba lo que sabes

1. ¿Qué hace `testDir`?

<details><summary>Respuesta</summary>

Le dice a Playwright qué carpeta tiene los *specs*. Aquí es `./e2e`.

</details>

2. ¿Por qué hay reintentos solo en CI?

<details><summary>Respuesta</summary>

En tu máquina quieres ver un fallo de inmediato. En CI un reintento puede manejar un fallo raro, pero también puede esconder un test *flaky*.

</details>

3. ¿Qué hace `reuseExistingServer` en tu máquina?

<details><summary>Respuesta</summary>

Si el sitio ya está corriendo en la `url`, Playwright lo usa. Si no, inicia el sitio con `command`.

</details>

4. ¿Cómo ejecutas los tests en el puerto 5185 en PowerShell?

<details><summary>Respuesta</summary>

Ejecuta `$env:QAA_E2E_PORT="5185"; pnpm e2e`.

</details>

5. En TypeScript simple, `const PORT = process.env.QAA_E2E_PORT ?? "5180"` se ejecuta cuando `QAA_E2E_PORT` está definido como el texto vacío `""`. ¿Cuál es la dirección final en `BASE_URL` y qué pasa en los tests?

<details><summary>Respuesta</summary>

Es `http://localhost:` sin puerto. El signo `??` reemplaza solo `undefined` o `null`, y un texto vacío no es ninguno de los dos. Un navegador acepta esta dirección y usa el puerto HTTP por defecto, el 80, pero la app no corre allí. Además, el comando que inicia la app recibe `--port` sin valor y se detiene con un error, así que la ejecución falla antes de que los tests puedan pasar. El signo `||` habría usado `5180`.

</details>

6. ¿Cuál configuración es mejor y por qué? La versión A tiene `baseURL` en la configuración y los tests usan `page.goto("/#/practice")`. La versión B no tiene `baseURL`, y cada test usa `page.goto("http://localhost:5180/#/practice")`. Ahora el equipo necesita ejecutar los mismos tests en otro puerto.

<details><summary>Respuesta</summary>

La versión A es mejor. La dirección está en un solo lugar, así que cambias una línea o defines `QAA_E2E_PORT`. En la versión B debes editar cada `goto` de cada test, y una línea que se te escape prueba la dirección equivocada. La versión A también permite ejecutar el mismo test en otros entornos.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es una variable de entorno y cómo se define una en PowerShell y en una terminal Unix?**
   - Busca: `environment variables powershell $env bash export`
   - Una buena respuesta explica: qué es una variable de entorno, cuánto dura en cada terminal, y por qué los programas leen sus opciones de ellas.

2. **¿Cuál es la diferencia entre `??` y `||` en JavaScript?**
   - Busca: `nullish coalescing vs logical or javascript`
   - Una buena respuesta explica: qué valores reemplaza cada signo, con ejemplos para `0`, un texto vacío y `undefined`.

3. **¿Qué es la integración continua y por qué los equipos ejecutan tests automáticos en cada *pull request*?**
   - Busca: `continuous integration automated tests pull request`
   - Una buena respuesta explica: qué hace CI, por qué los tests se ejecutan allí con opciones distintas a las de una laptop, y qué gana un equipo con ello.

## Siguiente paso

Ya conoces las herramientas principales de Playwright. En el siguiente módulo aprendes las buenas prácticas de QAA: cómo escribir tests que sigan siendo fáciles de leer y de corregir.
