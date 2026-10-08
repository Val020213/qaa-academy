---
title: Tests en CI
duration: 60 min
---

## Objetivo

Vas a leer las revisiones automáticas del proyecto y encontrar la causa de un test que falla en CI.

- Leer `.github/workflows/e2e.yml` y reconocer qué revisiones ejecuta y cuáles faltan.
- Identificar los ajustes que cambian con la variable `CI`.
- Descargar el reporte de una ejecución fallida y revisar su trace.
- Escribir una función que interprete un interruptor del entorno.

## CI en este proyecto

**CI** significa integración continua (*continuous integration*). Las revisiones automáticas acompañan la integración de cambios al repositorio del equipo. En este proyecto, GitHub Actions ejecuta la revisión de tipos y las dos suites en una máquina nueva, sin los archivos ni los servidores que quedaron en tu computadora.

CI informa si un test falla. Para bloquear el merge, el repositorio debe exigir ese check mediante sus reglas de protección. Un test debe ser **R**epeatable (repetible): con las mismas condiciones, da el mismo resultado. Una ejecución limpia en Ubuntu con Chromium aporta evidencia en ese entorno.

## Lee el workflow

Abre `.github/workflows/e2e.yml`. El **workflow** define cuándo se ejecutan las revisiones y los pasos que ejecuta el runner de GitHub Actions.

```yaml
on:
  pull_request:
  push:
    branches: [main]
```

`on` dice cuándo corre: en cada pull request, y en cada push a `main`.

```yaml
jobs:
  e2e:
    runs-on: ubuntu-latest
    timeout-minutes: 15
```

Un **job** agrupa pasos que ejecuta un runner. Este job usa Linux y tiene un límite de 15 minutos.

Los pasos corren en orden:

1. `actions/checkout@v4` descarga tu código.
2. `pnpm/action-setup@v4` instala pnpm. Lee la versión de la línea `packageManager` de `package.json`.
3. `actions/setup-node@v4` instala Node 24 y guarda en caché las descargas de pnpm.
4. `pnpm install --frozen-lockfile` instala los paquetes. Falla si `pnpm-lock.yaml` no coincide con `package.json`.
5. `pnpm typecheck` revisa los tipos del sitio del curso, sus tests y los ejercicios.
6. `pnpm exec playwright install --with-deps chromium` descarga el navegador y las bibliotecas del sistema que necesita.
7. `pnpm e2e` ejecuta la suite del sitio del curso.
8. `pnpm shop:e2e` ejecuta la suite de la tienda.
9. `actions/upload-artifact@v4` guarda los reportes.

La revisión de tipos va antes de la descarga del navegador. Si encuentra un error, el job se detiene antes de descargarlo y ejecutar los tests. Esto es **fallar rápido** (*failing fast*).

Si un paso falla, GitHub Actions omite los siguientes pasos sin una condición que permita ejecutarlos después del fallo. El paso de subida tiene `if: ${{ !cancelled() }}`: corre incluso después de un fallo, siempre que la ejecución no se haya cancelado.

![Un fallo omite los pasos normales restantes; la subida puede conservar los reportes disponibles.](/images/05-ci-failure-flow.es.svg)

El workflow no ejecuta `pnpm --filter practice-shop typecheck`. CI no ejecuta esa revisión de tipos de la tienda; un defecto de tipos que afecte la ejecución aún puede hacer fallar un test. Ejecuta ese comando antes del push, como indica la lección 7.

## Los ajustes de CI

GitHub define la variable de entorno `CI`. Los dos archivos `playwright.config.ts` la leen.

| Ajuste | En tu máquina | En CI |
| --- | --- | --- |
| `forbidOnly` | apagado | encendido: un `test.only` hace fallar la ejecución |
| `retries` | 0 | 2: un test que falla se ejecuta otra vez hasta 2 veces |
| `reuseExistingServer` | encendido | apagado: inicia el servidor si la URL no responde; falla si ya responde |

Un test que falla y luego pasa en un reintento se marca como **flaky** (inestable) en el reporte. Investiga la causa del fallo aunque el reintento pase.

![Un éxito inicial, un reintento exitoso y tres fallos producen resultados distintos.](/images/05-retry-classification.es.svg)

La configuración de la tienda guarda el trace de cada test fallido (`retain-on-failure`). La del sitio del curso graba un trace en el primer reintento (`on-first-retry`) y cambia el reporter `list` por `github` en CI, que imprime los errores en la página del pull request.

La tienda usa un solo worker (`workers: 1`) porque sus datos viven en memoria y los tests los comparten. La configuración del sitio del curso ejecuta los tests en paralelo.

## La variable CI se lee como texto

Las dos configuraciones contienen estas líneas:

```ts
forbidOnly: !!process.env.CI,
// ...
retries: process.env.CI ? 2 : 0,
```

El `!!` convierte el valor en un boolean. Este script muestra el resultado para distintos valores:

```ts
for (const value of [undefined, "", "1", "0", "false"]) {
  console.log(JSON.stringify(value), !!value)
}
```

Imprime:

```text
undefined false
"" false
"1" true
"0" true
"false" true
```

Si un compañero intenta apagar el modo CI así:

```bash
$env:CI = "false"
pnpm shop:e2e
```

JavaScript trata el texto no vacío como verdadero. El valor de `process.env.CI` sigue siendo el texto `"false"`; su conversión a boolean da `true`, `retries` es 2 y `forbidOnly` está encendido. Si un test falla en los tres intentos, Playwright lo reporta como fallido.

El ajuste `reuseExistingServer` también está apagado. Detén una tienda que ya esté corriendo antes de ejecutar la suite. Para apagar el modo CI, quita la variable.

## Descarga el reporte

1. Abre tu pull request. Haz clic en la revisión que falló y luego en **Details**.
2. Abre el **Summary** de la ejecución. Baja hasta **Artifacts**.
3. Si existe `playwright-reports`, descárgalo y descomprime el zip. Un fallo anterior a los tests puede dejar la ejecución sin reportes.
4. Busca `playwright-report/` para el curso y `apps/practice-shop/playwright-report/` para la tienda. El artefacto conserva estas rutas desde su raíz común. Si la suite del curso falló, la tienda no corrió y no generó su reporte.
5. Abre un reporte con la ruta de la carpeta:

```bash
pnpm exec playwright show-report path\to\apps\practice-shop\playwright-report
```

Reemplaza la ruta por la tuya. Haz clic en el test que falló y abre su trace para revisar las acciones y el estado de la página. Los reportes se conservan 7 días.

## Un test falla solo en CI

Lee el trace y elige una hipótesis basada en el fallo. Prueba esa hipótesis cambiando una sola cosa:

- Una respuesta puede tardar más en CI por la carga o la red. Comprueba los tiempos en el trace; una espera fija o un timeout corto puede vencer antes de que llegue. Usa aserciones *web-first* (que esperan solas).
- Un test puede depender de datos que quedaron de una ejecución anterior. CI empieza limpio.
- CI usa Linux, donde los nombres de archivo distinguen mayúsculas: `Products.page.ts` no es `products.page.ts`.
- Un servidor viejo en tu máquina puede esconder un problema. Con la URL libre, Playwright en CI inicia uno nuevo; si ya responde, falla.

Para reproducir los ajustes de Playwright de CI en tu máquina, define la variable. Esto no cambia tu sistema operativo ni crea un entorno limpio. Detén primero la tienda, porque el modo CI no reutiliza un servidor que ya está corriendo. En PowerShell:

```bash
$env:CI = "1"
pnpm shop:e2e
Remove-Item Env:CI
```

La última línea quita la variable otra vez.

## Profundiza

### El archivo de bloqueo

El archivo de bloqueo guarda las versiones exactas de los paquetes. Con `--frozen-lockfile`, pnpm instala esas versiones y falla si necesita actualizar el archivo. Así detectas un cambio de dependencias que no quedó registrado en `pnpm-lock.yaml`.

### Las dos suites en un job

El workflow instala las herramientas una vez y ejecuta las dos suites en orden. La tienda espera a que termine la suite del curso; si esta falla, la tienda no corre.

Separarlas en jobs permite ejecutarlas al mismo tiempo, pero cada job necesita preparar su entorno. La duración de las suites ayuda al equipo a decidir si compensa repetir esa preparación.

## Práctica

1. Abre `.github/workflows/e2e.yml`. Encuentra el paso que instala el navegador.
2. Abre los dos archivos `playwright.config.ts`. Encuentra `forbidOnly`, `retries` y `reuseExistingServer`.
3. Detén la tienda. Ejecuta la suite de la tienda con `CI` definida, como se muestra arriba. Comprueba que inicia su propio servidor.
4. Comprueba con `echo $env:CI` que la variable quedó vacía después de la última línea de la secuencia.

## Reto

Crea `exercises/challenges/ci-flag.ts` con una función `isCiOn(value)` que reciba un texto o nada y devuelva `true` o `false`. Define qué textos significan "apagado" y escribe la regla en un comentario de una o dos frases al principio. La regla debe interpretar `CI=0` y `CI=false` como apagado.

Está terminado cuando:

- `node exercises/challenges/ci-flag.ts` imprime una línea por cada uno de al menos ocho valores, como `"false" -> off`. Incluye `undefined`, un texto vacío, `"1"`, `"0"`, `"false"` y `" FALSE "`.
- El archivo compara los resultados con una tabla de respuestas esperadas e imprime `all cases match` al terminar la comprobación de casos, antes del mensaje sobre el entorno. Si un caso no coincide, imprime ese caso.
- La última línea imprime `CI mode from the environment: on` u `off`, leído de la variable `CI` real. Imprime `on` después de `$env:CI = "1"`, y `off` después de `$env:CI = "0"` y cuando la variable se quita.
- `pnpm typecheck` pasa con tu archivo en su lugar.

Busca: `node process.env`, `javascript string trim toLowerCase` y `javascript Set has`.

## Piénsalo bien

1. Un compañero define `CI` como un espacio, como el texto `"null"` y como el texto `"undefined"`. ¿Qué da `!!process.env.CI` en cada caso?

<details><summary>Respuesta</summary>

Da `true` en los tres casos porque son textos no vacíos. Solo la ausencia de la variable o un texto vacío da `false`.

</details>

2. La suite de la tienda falla en su primera ejecución y pasa en el reintento 1. El job queda en verde. ¿Qué problema queda sin resolver si el equipo solo mira esa marca?

<details><summary>Respuesta</summary>

El reporte marca el test como flaky. El reintento pasó, pero el equipo todavía debe investigar la causa del primer fallo.

</details>

3. Un compañero agrega un paquete pero olvida hacer commit de `pnpm-lock.yaml`. ¿Qué pasa si quita `--frozen-lockfile` del paso de instalación?

<details><summary>Respuesta</summary>

En este proyecto, pnpm activa la instalación congelada por defecto en CI porque el archivo de bloqueo no está vacío. La instalación sigue fallando por la diferencia con `package.json`. `--no-frozen-lockfile` es la opción que permite actualizarlo durante la instalación.

</details>

## Siguiente paso

Terminaste el curso. Abre el módulo de Referencias cuando necesites un enlace, y pide un proyecto real para continuar.
