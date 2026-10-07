---
title: El archivo de configuración
duration: 60 min
---

## Objetivo

Lee la configuración del proyecto para entender cómo Playwright ejecuta los tests. Usa sus opciones para cambiar el puerto y ejecutar los mismos tests con distintas condiciones.

- Leer las opciones de ejecución, reportes y navegador.
- Distinguir el comportamiento local del comportamiento en CI.
- Configurar el inicio del sitio y evitar conflictos de puerto.
- Ejecutar los tests con otra configuración.

## Lee el archivo de configuración

El runner de Playwright lee `playwright.config.ts` cada vez que ejecutas `pnpm e2e`. El archivo está en la raíz del proyecto y define dónde buscar los tests, cómo ejecutarlos y cómo mostrar los resultados.

Abre el archivo. Es TypeScript: Playwright lo carga y lee lo que exporta. Por eso puede calcular opciones a partir de variables de entorno.

## El puerto y la dirección

```ts
const PORT = process.env.QAA_E2E_PORT ?? "5180"
const BASE_URL = `http://localhost:${PORT}`
```

Node.js expone las **variables de entorno** en `process.env`: valores con nombre que recibe del proceso que lo inicia. `QAA_E2E_PORT` es una variable definida para este proyecto.

El operador `??` usa el valor de la derecha cuando el de la izquierda es `null` o `undefined`. Si no defines `QAA_E2E_PORT`, el puerto es `5180`. `BASE_URL` usa ese puerto para construir la dirección del sitio.

## defineConfig

```ts
export default defineConfig({
```

`defineConfig` es un *helper* de Playwright. Revisa los tipos de tus opciones, así el editor puede ayudarte. Todo lo que sigue está dentro de él.

## testDir

```ts
testDir: "./e2e",
```

El runner busca los specs en `e2e` y sus subcarpetas. Por eso los archivos de ejercicios con extensión `.spec.ts` también se ejecutan con `pnpm e2e`.

## fullyParallel

```ts
fullyParallel: true,
```

Con esta opción, el runner puede ejecutar en paralelo incluso los tests del mismo archivo. Los workers ejecutan los tests en procesos separados; los tests no deben depender de que otro test termine primero.

## forbidOnly y retries

```ts
forbidOnly: !!process.env.CI,
retries: process.env.CI ? 2 : 0,
```

Los servidores de CI definen `CI` como variable de entorno. `!!` convierte su valor en un booleano; `? :` elige entre dos valores según la condición.

Con `CI` definida y no vacía, `forbidOnly` hace fallar la ejecución si encuentra `test.only`, y `retries` permite hasta dos reintentos de un test fallido. Sin `CI`, el runner no reintenta los tests.

Este ejemplo muestra qué valores activan esas opciones:

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

Los valores de las variables de entorno son texto. `"0"` y `"false"` cuentan como verdaderos porque no están vacíos. Una variable que falta o un texto vacío cuenta como falso. La comprobación significa "la variable existe", no "la variable dice que sí".

Si ejecutas `$env:CI="false"`, activas las opciones de CI. Para quitar la variable en PowerShell, usa `Remove-Item Env:CI`. Para desactivar solo los reintentos en una ejecución, usa `--retries=0` en el comando.

> **Cuidado:** Si un test falla y luego pasa en un reintento, el reporte lo marca como *flaky* (inestable). Revisa la falla aunque la ejecución termine sin errores.

## reporter

```ts
reporter: process.env.CI
  ? [["github"], ["html", { open: "never" }]]
  : [["list"], ["html", { open: "never" }]],
```

Los **reporters** muestran los resultados. Sin `CI`, `list` muestra la lista de tests en la terminal; con `CI`, `github` agrega mensajes a la ejecución de GitHub. Ambas opciones generan un reporte HTML.

`open: "never"` evita que el reporte se abra automáticamente. Lo abres con `pnpm e2e:report`.

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

Con `baseURL`, los tests usan rutas relativas y el inicio de la dirección se escribe una vez. Un cambio de puerto no requiere editar cada test.

## projects

```ts
projects: [
  {
    name: "chromium",
    use: { ...devices["Desktop Chrome"] },
  },
],
```

Un **project** (proyecto) es un conjunto de opciones con el que se ejecutan los tests. Aquí hay uno llamado `chromium`, que usa el navegador Chromium y las opciones de `devices["Desktop Chrome"]`, como el tamaño de la ventana.

El nombre aparece como `[chromium]` en el reporte de lista. Si agregas un proyecto para Firefox o un teléfono, el runner vuelve a ejecutar los tests con esas opciones.

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

- `command` inicia la app en el puerto elegido.
- `url` es la dirección que Playwright revisa para saber que la app está lista.
- `timeout` limita la espera por la app a `60_000` milisegundos, es decir, 60 segundos.
- `reuseExistingServer` decide qué pasa si algo ya responde en la `url`. Sin `CI`, Playwright lo reutiliza; con `CI`, se detiene con un error.

> **Cuidado:** Playwright no comprueba que el sitio que responde sea el del curso. Si otra app usa el puerto 5180, los tests pueden ejecutarse contra esa app. Usa `QAA_E2E_PORT` para elegir otro puerto.

## Cambia el puerto

En PowerShell, define la variable y ejecuta los tests:

```bash
$env:QAA_E2E_PORT="5185"; pnpm e2e
```

Playwright usa `http://localhost:5185` como dirección base y como dirección para comprobar el servidor. La variable queda definida en esa ventana de terminal hasta que la cierres o la quites:

```bash
Remove-Item Env:QAA_E2E_PORT
```

En macOS o Linux, escribe `QAA_E2E_PORT=5185 pnpm e2e`. La variable dura solo para ese comando.

> **Nota:** No uses 5190. La practice shop usa ese puerto.

## Profundiza

### Valores de respaldo con `??` y `||`

`??` conserva un texto vacío, mientras que `||` lo reemplaza:

```ts
process.env.QAA_E2E_PORT = ""
console.log(`http://localhost:${process.env.QAA_E2E_PORT ?? "5180"}`)
console.log(`http://localhost:${process.env.QAA_E2E_PORT || "5180"}`)
```

Imprime `http://localhost:` primero y `http://localhost:5180` después. El número `0` también es falsy, así que `||` lo reemplaza:

```ts
process.env.WORKERS = "0"
console.log(Number(process.env.WORKERS) || 4)
console.log(Number(process.env.WORKERS) ?? 4)
```

Imprime `4` y luego `0`. Al elegir el operador, distingue los valores que significan que falta una opción de los valores válidos para esa opción.

### El límite de workers

Por defecto, Playwright usa aproximadamente la mitad de los núcleos del procesador como límite de workers. La app y los navegadores también consumen recursos: demasiados workers pueden causar lentitud y tiempos agotados.

Para revisar una falla con un solo worker:

```bash
pnpm e2e e2e/playground.spec.ts --workers=1
```

Si la falla desaparece, revisa la carga de la máquina y los datos compartidos. El cambio por sí solo no identifica la causa.

## Práctica

1. Abre `playwright.config.ts` y encuentra las opciones de esta lección.
2. Ejecuta todos los tests en otro puerto:

```bash
$env:QAA_E2E_PORT="5185"; pnpm e2e
```

3. Revisa los resultados. Quita la variable con `Remove-Item Env:QAA_E2E_PORT` para volver al puerto predeterminado.

Esta lección no tiene archivo de ejercicios.

## Reto

Crea `playwright.challenge.config.ts` en la raíz del proyecto para ejecutar los tests de Practice en escritorio y en una pantalla pequeña. Conserva `playwright.config.ts` sin cambios.

Ejecuta solo `e2e/playground.spec.ts` en dos proyectos: uno de escritorio y otro con un teléfono de la lista de dispositivos o un tamaño de ventana a tu elección. Usa un worker y un reintento. Inicia el sitio en el puerto 5186 y escribe ese número una sola vez.

Está terminado cuando:

- `pnpm exec playwright test --config playwright.challenge.config.ts --list` muestra 8 tests, cada uno con un nombre de proyecto entre corchetes, y ningún test de otro archivo.
- `pnpm exec playwright test --config playwright.challenge.config.ts` imprime `Running 8 tests using 1 worker` y los 8 pasan.
- `playwright.config.ts` no se cambió, y el número de puerto aparece una sola vez en tu archivo.
- `pnpm exec playwright test --config playwright.challenge.config.ts --project=<your second project name>` ejecuta solo 4 tests.

Busca: `playwright test --config option`, `playwright testMatch`, `playwright viewport emulation`.

## Piénsalo bien

1. Defines `QAA_E2E_PORT=5185` y ejecutas los tests con esta configuración. La ejecución falla después de aproximadamente un minuto. Encuentra el bug.

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

<details>
<summary>Respuesta</summary>

El comando inicia el sitio en `5180`, pero `url` usa el puerto de `QAA_E2E_PORT`. Playwright espera una respuesta en 5185, donde no hay un servidor, y agota los 60 segundos. Usa `${PORT}` también en el comando.

</details>

2. En CI ya hay un sitio que responde en la dirección configurada. Compara `reuseExistingServer: true` con `reuseExistingServer: !process.env.CI`. ¿Qué hace Playwright en cada caso?

<details>
<summary>Respuesta</summary>

Con `reuseExistingServer: true`, Playwright reutiliza ese sitio. Con `reuseExistingServer: !process.env.CI`, se detiene con un error porque `CI` tiene un valor no vacío. Ese error permite detectar un servidor inesperado en CI.

</details>

3. Otra app responde en el puerto 5180 de tu máquina. Ejecutas `pnpm e2e` sin definir `CI` ni `QAA_E2E_PORT`. ¿Qué sitio prueban los tests y cómo lo detectarías?

<details>
<summary>Respuesta</summary>

Playwright reutiliza la otra app porque `reuseExistingServer` es verdadero. Puedes ver fallas por elementos que no se encuentran y capturas de una página distinta del sitio del curso.

</details>

## Siguiente paso

Ya conoces las herramientas principales de Playwright. En el próximo módulo aprendes las buenas prácticas de QAA: cómo escribir tests que se mantienen fáciles de leer y de arreglar.
