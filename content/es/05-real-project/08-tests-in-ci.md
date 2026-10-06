---
title: Tests en CI
summary: Lee el workflow de CI, aprende qué cambia cuando los tests corren en CI, descarga un reporte de una ejecución fallida y escribe una forma más segura de leer un interruptor del entorno.
duration: 90 min
---

## Empieza con un acertijo

Las dos configuraciones de Playwright del curso contienen estas dos líneas:

```ts
forbidOnly: !!process.env.CI,
// ...
retries: process.env.CI ? 2 : 0,
```

Un compañero quiere ejecutar la suite de la tienda de la forma normal en su computadora, sin reintentos. Le dicen que fije la variable en algo que signifique "apagado". En PowerShell escribe:

```bash
$env:CI = "false"
pnpm shop:e2e
```

Un test tiene un error de escritura y falla. Espera ver un solo fallo de inmediato.

¿Qué hace la ejecución? ¿Reintenta el test que falló? ¿`forbidOnly` sigue apagado? Piensa qué tipo de valor guarda una variable de entorno.

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Explica qué es CI, cuándo corre y por qué parte de una máquina limpia.
- Lee `.github/workflows/e2e.yml` paso a paso, y di qué no revisa.
- Predice cómo lee la configuración la variable `CI` para cualquier valor.
- Abre el reporte y el trace de una ejecución fallida de CI y encuentra la causa.

## Qué es CI

**CI** significa integración continua (*continuous integration*). Un servidor ejecuta tus tests automáticamente en cada pull request. Usa una máquina limpia, así que un resultado allí no depende de tu computadora.

CI protege al equipo. Un cambio que rompe un test no se puede integrar por error. También es el lugar donde se demuestra uno de los rasgos de **FIRST**. Un test debe ser **R**epeatable (repetible): da el mismo resultado en cualquier máquina. Tu computadora no puede demostrar eso. Una máquina limpia sí.

## Lee el workflow

Abre `.github/workflows/e2e.yml`. Es un **workflow**: una lista de pasos que GitHub ejecuta.

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

Un **job** (trabajo) es un grupo de pasos en una máquina. Esta máquina usa Linux, no Windows. El job se detiene a los 15 minutos.

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

Mira el orden. La revisión de tipos va antes de la descarga del navegador, y la descarga del navegador va antes de los tests. ¿Por qué? Las revisiones baratas van primero. Si un tipo está mal, el job falla en segundos y no espera una descarga lenta. Esta idea se llama **fallar rápido** (*failing fast*). Intenta escribir el orden que elegirías para un paso nuevo "revisar el estilo del código". ¿Dónde va, y por qué?

Si un paso falla, los siguientes no corren. El paso de subida tiene `if: ${{ !cancelled() }}`. Corre incluso después de un fallo, porque necesitas el reporte más que nunca cuando algo falla.

Busca lo que falta. El workflow no ejecuta `pnpm --filter practice-shop typecheck`. Un tipo incorrecto en un spec de la tienda no se detecta en CI. Debes ejecutar ese comando tú mismo, como dice la lección 7.

## Qué cambia con la variable CI

GitHub define la variable de entorno `CI`. Los dos archivos `playwright.config.ts` la leen.

| Ajuste | En tu máquina | En CI |
| --- | --- | --- |
| `forbidOnly` | apagado | encendido: un `test.only` hace fallar la ejecución |
| `retries` | 0 | 2: un test que falla se ejecuta otra vez hasta 2 veces |
| `reuseExistingServer` | encendido | apagado: Playwright siempre inicia su propio servidor |

Un test que falla y luego pasa en un reintento se marca como **flaky** (inestable) en el reporte. Es una advertencia. Arréglalo.

La configuración de la tienda guarda el trace de cada test fallido (`retain-on-failure`). La configuración del sitio del curso graba un trace en el primer reintento (`on-first-retry`). La configuración del sitio del curso también cambia el reporter `list` por `github` en CI, que imprime los errores en la página del pull request. La configuración de la tienda usa un solo worker (`workers: 1`) siempre, porque sus datos viven en memoria y todos los tests los comparten. La configuración del sitio del curso ejecuta los tests en paralelo.

### De vuelta al acertijo

Una variable de entorno siempre es texto. El texto `"false"` es un texto de cinco letras, y JavaScript trata como verdadero cualquier texto que no esté vacío. Entonces `process.env.CI` es verdadero, `retries` es 2 y `forbidOnly` está encendido. El compañero ve el test que falla correr tres veces seguidas, y luego la ejecución lo reporta como fallido. El ajuste `reuseExistingServer` también está apagado, así que una tienda que ya está corriendo estorba: detenla primero. Para apagar el modo CI, quita la variable. El script de "Profundiza" muestra los valores uno al lado del otro.

## Descarga el reporte

1. Abre tu pull request. Haz clic en la revisión que falló y luego en **Details**.
2. Abre el **Summary** de la ejecución. Baja hasta **Artifacts**.
3. Descarga `playwright-reports`. Es un archivo zip. Descomprímelo.
4. El zip tiene dos carpetas: una para la suite del sitio del curso y otra para la suite de la tienda. Si la suite del sitio del curso falló, la suite de la tienda no corrió, así que falta la carpeta de la tienda.
5. Abre un reporte con la ruta de la carpeta:

```bash
pnpm exec playwright show-report path\to\apps\practice-shop\playwright-report
```

Reemplaza la ruta por la tuya. Haz clic en el test que falló. Abre su trace. Es el mismo trace que leíste en la lección del trace viewer, grabado en la máquina de CI. Los reportes se conservan 7 días.

## Un test falla solo en CI

Primero, no vuelvas a ejecutar hasta que pase. Lee el trace. Luego sigue el método de un científico. Haz una hipótesis de la lista de abajo. Haz un experimento pequeño para probarla. Cambia una sola cosa a la vez.

- **Velocidad.** La máquina de CI es más lenta. Una espera fija o un timeout corto falla allí. Usa aserciones *web-first* (que esperan solas).
- **Orden y datos.** CI empieza limpio. Un test que dependía de datos que quedaron de antes falla.
- **Sistema operativo.** CI usa Linux. Allí los nombres de archivo distinguen mayúsculas: `Products.page.ts` no es `products.page.ts`.
- **Reutilizar el servidor.** En tu máquina, un servidor viejo puede esconder un problema. CI siempre inicia uno nuevo.

Para copiar las condiciones de CI, define la variable. Detén primero la tienda, porque el modo CI no reutiliza un servidor que ya está corriendo. En PowerShell:

```bash
$env:CI = "1"
pnpm shop:e2e
Remove-Item Env:CI
```

La última línea quita la variable otra vez.

## Después del curso

Ahora sabes cómo se construye, se ejecuta y se revisa un proyecto de tests. Tu siguiente paso es uno real: pide acceso a un proyecto de un equipo. Antes de leer cualquier test, lee su `e2e/README.md`, y luego sus notas de cobertura. Ejecuta la suite. Después elige un hueco pequeño y abre allí tu primer pull request.

## Profundiza

### Por qué CI parte de una máquina limpia

"En mi máquina funciona" es una frase famosa. Tu computadora tiene archivos viejos, servidores viejos y configuraciones que olvidaste. CI parte de cero cada vez: descarga el código, instala los paquetes, inicia un servidor nuevo. Si los tests pasan allí, no dependen de tu computadora.

`--frozen-lockfile` sigue la misma idea. El archivo de bloqueo (*lock file*) lista la versión exacta de cada paquete. Con esta opción, CI se niega a adivinar versiones nuevas. Todos obtienen los mismos paquetes.

### Una idea equivocada: "los reintentos hacen confiables los tests"

Los reintentos no arreglan un test flaky. Lo esconden. La tienda usa 2 reintentos en CI porque un pequeño retraso no debería detener al equipo. Pero un test que pasa solo en el segundo intento es una advertencia. Playwright lo marca como **flaky** en el reporte. Trata esa marca como una tarea por arreglar.

### Cómo aparece en el trabajo real de automatización QA

La configuración lee la variable `CI` así:

```ts
forbidOnly: !!process.env.CI,
// ...
retries: process.env.CI ? 2 : 0,
```

El `!!` convierte cualquier valor en `true` o `false`. Este script pequeño muestra el resultado para distintos valores:

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

Fíjate en que el texto `"0"` y el texto `"false"` dan `true`. Solo un valor vacío o la ausencia de valor da `false`. Si un compañero define `CI=0` para apagar el modo CI, lo va a encender. Esa es una trampa real de las variables de entorno, porque siempre son texto.

### DRY en el workflow

Las dos configuraciones de Playwright leen una sola variable, `CI`. Un interruptor cambia varios ajustes. El archivo del workflow también vive en un solo lugar y corre en cada pull request, así que nadie tiene que acordarse de ejecutar las dos suites. Eso es **DRY**: *Don't Repeat Yourself* (no te repitas). La regla se escribe una vez y se aplica siempre. **KISS** (hazlo simple) es el equilibrio: el workflow tiene un job y nueve pasos simples. No necesita matrices, plantillas ni acciones personalizadas.

### El costo de un job grande

El workflow ejecuta las dos suites en un solo job, una después de la otra. Es simple. El costo es el tiempo: la suite de la tienda espera a la suite del curso. Los equipos con suites lentas las separan en jobs distintos que corren al mismo tiempo. Es más rápido, pero cada job debe instalar todo otra vez. Para un proyecto pequeño, un solo job es la mejor opción. **YAGNI** dice: separa el job cuando la espera de verdad moleste, no antes.

## Práctica

1. Abre `.github/workflows/e2e.yml`. Encuentra el paso que instala el navegador.
2. Abre los dos archivos `playwright.config.ts`. Encuentra `forbidOnly`, `retries` y `reuseExistingServer`.
3. Detén la tienda. Ejecuta la suite de la tienda con `CI` definida, como se muestra arriba. Comprueba que inicia su propio servidor.
4. Quita la variable. Comprueba con `echo $env:CI` que está vacía.

## Reto

Escribe una forma más segura de leer un interruptor del entorno. Crea el archivo `exercises/challenges/ci-flag.ts`. El archivo define una función `isCiOn(value)` que recibe un texto o nada y responde `true` o `false`. Elige tu propia regla sobre qué textos significan "apagado". Escribe esa regla en un comentario al principio del archivo, en una o dos frases. Tu regla debe estar escrita para personas, no solo para la máquina: un compañero que escribe `CI=0` o `CI=false` debe obtener lo que espera.

Está terminado cuando:

- Ejecutar `node exercises/challenges/ci-flag.ts` imprime una línea por cada uno de al menos ocho valores de muestra, como `"false" -> off`. Las muestras incluyen nada en absoluto (`undefined`), un texto vacío, `"1"`, `"0"`, `"false"` y un texto con espacios y mayúsculas como `" FALSE "`.
- El archivo contiene una tabla de respuestas esperadas, compara tu función con ella e imprime `all cases match` al final. Si un caso no coincide, imprime ese caso.
- La última línea imprime `CI mode from the environment: on` u `off`, leído de la variable `CI` real. Imprime `on` después de `$env:CI = "1"`, y `off` después de `$env:CI = "0"` y cuando la variable se quita.
- `pnpm typecheck` pasa con tu archivo en su lugar.

Vas a necesitar algo que esta lección no enseñó: cómo leer una variable de entorno en un script de Node, y cómo limpiar un texto antes de compararlo. Busca: `node process.env`, `javascript string trim toLowerCase` y `javascript Set has`.

## Piénsalo bien

1. Predice la salida. Un compañero define `CI` como un espacio, como el texto `"null"` y como el texto `"undefined"`. ¿Qué da `!!process.env.CI` en cada caso, y por qué?

<details><summary>Respuesta</summary>

Da `true` en los tres casos. Una variable de entorno es texto, y todo texto que no esté vacío es verdadero, incluso un solo espacio o la palabra "null". Solo una variable que no existe (valor `undefined`) o un texto vacío da `false`. Por eso un lector seguro de interruptores nombra los valores de "apagado" que acepta, y no depende de la verdad de un texto.

</details>

2. Un job ejecuta las dos suites. La suite del sitio del curso está en verde. La suite de la tienda falla en su primera ejecución, pasa en el reintento 1, y el job queda en verde. Nadie mira el reporte durante un mes. Encuentra qué está mal en la forma de trabajar del equipo.

<details><summary>Respuesta</summary>

El job está en verde, pero el reporte marca el test como flaky. La señal está en el reporte, y nadie la lee. Algo es inestable: el tiempo, los datos compartidos o el entorno. Con el tiempo el reintento esconde cada vez más de estos tests, y el equipo deja de confiar en los builds en rojo. Un equipo necesita una regla, como "una marca flaky abre una tarea". Un reintento es una herramienta del pipeline, no un arreglo del test.

</details>

3. Versión uno: un job que ejecuta las dos suites en orden. Versión dos: dos jobs que corren al mismo tiempo. ¿Cuál es mejor para este curso, y qué te haría elegir la otra?

<details><summary>Respuesta</summary>

La versión uno es mejor para un proyecto pequeño. Es simple, y hay una sola instalación. La versión dos es más rápida, pero cada job instala todo otra vez, y debes recolectar dos juegos de reportes. Si las suites crecen tanto que la gente espera demasiado por un pull request, o si una suite falla seguido y bloquea a la otra, sepáralas. Decide el tiempo de espera del equipo.

</details>

4. ¿Qué se rompe si se quita `--frozen-lockfile` del paso de instalación, y un compañero agrega un paquete pero olvida hacer commit de `pnpm-lock.yaml`?

<details><summary>Respuesta</summary>

En CI, pnpm ya viene congelado por defecto cuando existe un archivo de bloqueo, así que quitar la opción no cambiaría mucho. La opción `--no-frozen-lockfile` es la que apaga ese comportamiento, y entonces pnpm puede elegir versiones por sí mismo, quizá más nuevas que las que probó el compañero. Un test puede fallar en CI por una razón que nadie puede reproducir en una computadora. Con la opción, el job falla de inmediato con un mensaje claro de que el archivo de bloqueo no coincide. Un fallo rápido y claro es mejor que una diferencia escondida.

</details>

5. Explica a un compañero, en tres frases y sin la palabra "servidor", por qué la máquina de CI puede encontrar bugs que tu computadora no.

<details><summary>Respuesta</summary>

Una buena respuesta dice que CI parte de cero cada vez: archivos nuevos, paquetes nuevos, una copia nueva de la aplicación. Tu computadora guarda datos viejos, configuraciones viejas y programas viejos que pueden esconder un problema. La máquina de CI también tiene otro sistema operativo y otra velocidad, así que salen a la luz problemas de tiempo y de nombres de archivo. Cualquier respuesta que nombre "inicio limpio" y "condiciones distintas" es correcta.

</details>

6. El equipo quiere reemplazar `!!process.env.CI` en las dos configuraciones por tu función más segura del reto. ¿Es una buena idea? Decide, y di de qué depende.

<details><summary>Respuesta</summary>

No hay una única respuesta correcta. La ventaja es que `CI=0` y `CI=false` funcionan como la gente espera, así que hay menos sorpresas. El costo es un helper compartido que las dos configuraciones deben importar, y una regla nueva que explicar, mientras que GitHub siempre define `CI=true`. Si la gente define la variable a mano con frecuencia, el helper vale la pena. Si solo la define GitHub, el cambio es más código del que el problema necesita, y es mejor conservar la versión de una línea.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es la integración continua (CI), y qué problema resuelve?**
   - Busca: `continuous integration explained benefits`
   - Pruébalo: abre la pestaña Actions de tu fork en GitHub. Abre una ejecución terminada. Anota el tiempo de cada paso, y di qué paso toma más tiempo y por qué.
   - Una buena respuesta explica: que CI ejecuta revisiones automáticamente en cada cambio, y cómo encuentra problemas temprano

2. **¿Qué son los workflows, jobs y pasos de GitHub Actions?**
   - Busca: `github actions workflow job step explained`
   - Pruébalo: copia `.github/workflows/e2e.yml` a un archivo de texto fuera del repositorio. Dibuja el archivo como un árbol: workflow, job, pasos. Marca qué parte dice cuándo corre y qué parte dice en qué máquina corre.
   - Una buena respuesta explica: cómo se relacionan las tres palabras y cómo se activa un archivo de workflow

3. **¿Por qué los equipos usan un archivo de bloqueo como pnpm-lock.yaml?**
   - Busca: `lockfile package manager reproducible installs`
   - Pruébalo: abre `pnpm-lock.yaml` y encuentra la entrada de `marked`. Luego abre `package.json` y compara la versión escrita en los dos archivos. Uno tiene un rango con `^` y el otro tiene una versión exacta. Escribe por qué el archivo de bloqueo necesita la exacta.
   - Una buena respuesta explica: qué guarda un archivo de bloqueo y por qué hace que las instalaciones sean iguales en todas las máquinas

## Siguiente paso

Terminaste el curso. Abre el módulo de Referencias cuando necesites un enlace, y pide un proyecto real para continuar.
