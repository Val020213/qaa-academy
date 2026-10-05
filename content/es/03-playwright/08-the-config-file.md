---
title: El archivo de configuración
summary: Lee playwright.config.ts línea por línea y aprende a cambiar el puerto con QAA_E2E_PORT.
duration: 30 min
---

## Objetivo

- Explicar cada ajuste de `playwright.config.ts`.
- Saber por qué `retries`, `forbidOnly` y `reporter` cambian en CI.
- Explicar qué hacen `webServer` y `reuseExistingServer`.
- Ejecutar los tests en otro puerto con `QAA_E2E_PORT`.

## Qué es el archivo de configuración

El archivo `playwright.config.ts` está en la raíz del proyecto. Playwright lo lee cada vez que ejecutas `pnpm e2e`. Dice dónde están los tests, cómo ejecutarlos y cómo reportarlos.

No lo escribes a menudo. Pero debes poder leerlo, porque explica gran parte de lo que ves cuando se ejecutan los tests. Abre el archivo y sigue esta lección.

## El puerto y la dirección

```ts
const PORT = process.env.QAA_E2E_PORT ?? "5180"
const BASE_URL = `http://localhost:${PORT}`
```

`process.env` contiene las **variables de entorno**. Son valores con nombre que la terminal pasa a un programa. `QAA_E2E_PORT` es una que inventamos para este proyecto.

El signo `??` significa: usa el valor de la izquierda y, si no existe, usa el de la derecha. Así, el puerto es `5180` a menos que definas `QAA_E2E_PORT`.

`BASE_URL` arma la dirección. Las comillas invertidas (*backticks*) y `${PORT}` ponen el puerto dentro del texto, como aprendiste en la lección sobre valores y variables.

## defineConfig

```ts
export default defineConfig({
```

`defineConfig` es una ayuda de Playwright. Comprueba los tipos de tus ajustes, para que el editor pueda ayudarte. Todo lo que sigue va dentro.

## testDir

```ts
testDir: "./e2e",
```

La carpeta donde Playwright busca los *specs*. Todo archivo `.spec.ts` dentro de `e2e`, también en subcarpetas, es un spec. Por eso los archivos de ejercicios también se ejecutan con `pnpm e2e`.

## fullyParallel

```ts
fullyParallel: true,
```

Playwright ejecuta tests al mismo tiempo, en varios **workers**. Un worker es un proceso que ejecuta tests. Con `true`, incluso los tests del mismo archivo corren en paralelo. Esto es rápido. Solo funciona porque los tests están aislados.

## forbidOnly

```ts
forbidOnly: !!process.env.CI,
```

`CI` es una variable que definen los servidores de CI. El `!!` la convierte en `true` o `false`. En CI, un `test.only` olvidado hace fallar la ejecución. En tu máquina, `only` está permitido.

## retries

```ts
retries: process.env.CI ? 2 : 0,
```

El signo `? :` es un `if / else` corto. En CI, un test fallido se ejecuta de nuevo, hasta dos veces. En tu máquina no hay retries. Quieres ver el fallo de inmediato.

> **Cuidado:** Los retries pueden esconder un test *flaky* (inestable): falla, luego pasa, y la ejecución sale verde. Si el reporte dice "flaky", corrige el test.

## reporter

```ts
reporter: process.env.CI
  ? [["github"], ["html", { open: "never" }]]
  : [["list"], ["html", { open: "never" }]],
```

Un **reporter** decide cómo se muestran los resultados. En tu máquina recibes `list`, la lista de tests que viste en la terminal, y un reporte HTML. En CI recibes `github`, que agrega mensajes a la ejecución de GitHub, y el reporte HTML. `open: "never"` significa que el reporte no se abre solo. Lo abres con `pnpm e2e:report`.

## use

```ts
use: {
  baseURL: BASE_URL,
  trace: "on-first-retry",
  screenshot: "only-on-failure",
},
```

`use` contiene opciones para todos los tests.

- `baseURL` es el inicio de toda dirección. Por eso funciona `page.goto("/#/practice")`.
- `trace` graba un *trace* solo cuando un test se reintenta. En local, agrega `--trace on`.
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

Un **project** (proyecto) es un conjunto de ajustes con los que se ejecutan los tests. Aquí hay un solo project: el navegador Chromium. `devices["Desktop Chrome"]` es una lista de ajustes que copian un Chrome de escritorio: el tamaño de pantalla y otros. Los `...` copian esos ajustes dentro del objeto. Ves `[chromium]` en cada línea del reporte de lista.

Podrías agregar más projects, como Firefox o un teléfono.

## webServer

```ts
webServer: {
  command: `pnpm dev --port ${PORT}`,
  url: BASE_URL,
  reuseExistingServer: !process.env.CI,
  timeout: 60_000,
},
```

`webServer` le dice a Playwright que inicie la app antes de los tests y la detenga al final. Por eso no necesitas `pnpm dev` antes.

- `command` es el comando que inicia la app.
- `url` es la dirección que Playwright revisa para saber que la app está lista.
- `timeout` es cuánto esperar a la app. `60_000` son 60 segundos. El `_` solo hace el número más fácil de leer.
- `reuseExistingServer` decide qué pasa si algo ya responde en la `url`. En tu máquina es `true`: Playwright lo usa. En CI es `false`: Playwright se detiene con un error.

> **Cuidado:** En tu máquina, con `reuseExistingServer`, Playwright prueba lo que esté corriendo en ese puerto. Si otra app usa el puerto 5180, pruebas la app equivocada y no ves ningún error. Usa `QAA_E2E_PORT` para evitarlo.

## Cambiar el puerto

En PowerShell, define la variable y ejecuta los tests en una sola línea:

```bash
$env:QAA_E2E_PORT="5185"; pnpm e2e
```

Playwright inicia el sitio en el puerto 5185 y usa `http://localhost:5185` como dirección base. La variable sigue definida en esta ventana de terminal hasta que la cierres o la quites:

```bash
Remove-Item Env:QAA_E2E_PORT
```

En macOS o Linux, escribe `QAA_E2E_PORT=5185 pnpm e2e`. Allí la variable dura solo para ese comando.

> **Nota:** No uses el 5190. La tienda de práctica usa ese puerto.

## Práctica

1. Abre `playwright.config.ts`. Encuentra cada ajuste de esta lección.
2. Anota: ¿cuántos retries tienes en tu máquina? ¿Cuántos en CI?
3. Ejecuta todos los tests en otro puerto:

```bash
$env:QAA_E2E_PORT="5185"; pnpm e2e
```

4. La salida no imprime el puerto. Si los tests pasan, el sitio respondió en el puerto 5185.
5. Quita la variable con `Remove-Item Env:QAA_E2E_PORT`. Ejecuta `pnpm e2e` otra vez. Ahora el sitio usa el puerto 5180.

Esta lección no tiene archivo de ejercicio.

## Comprueba lo que sabes

1. ¿Qué hace `testDir`?

<details><summary>Respuesta</summary>

Le dice a Playwright qué carpeta tiene los specs. Aquí es `./e2e`.

</details>

2. ¿Por qué hay retries solo en CI?

<details><summary>Respuesta</summary>

En tu máquina quieres ver un fallo de inmediato. En CI un retry puede manejar un fallo raro, pero también puede esconder un test flaky.

</details>

3. ¿Qué hace `reuseExistingServer` en tu máquina?

<details><summary>Respuesta</summary>

Si el sitio ya está corriendo en la `url`, Playwright lo usa. Si no, inicia el sitio con `command`.

</details>

4. ¿Cómo ejecutas los tests en el puerto 5185 en PowerShell?

<details><summary>Respuesta</summary>

Ejecuta `$env:QAA_E2E_PORT="5185"; pnpm e2e`.

</details>

## Siguiente paso

Ya conoces las herramientas principales de Playwright. En el siguiente módulo aprendes las buenas prácticas de QAA: cómo escribir tests que sigan siendo fáciles de leer y de corregir.
