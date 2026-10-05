---
title: Tests en CI
summary: Lee el workflow de CI, aprende qué cambia cuando los tests corren en CI, descarga el reporte de una ejecución fallida y planifica lo que sigue.
duration: 50 min
---

## Objetivo

- Explicar qué es CI y cuándo se ejecuta.
- Leer `.github/workflows/e2e.yml` paso a paso.
- Nombrar qué cambia en las configuraciones de Playwright cuando la variable `CI` está definida.
- Abrir el reporte y el trace de una ejecución fallida en CI.

## Qué es CI

**CI** significa integración continua (*continuous integration*). Un servidor ejecuta tus tests automáticamente en cada pull request. Usa una máquina limpia, así que un resultado allí no depende de tu computadora.

CI protege al equipo. Un cambio que rompe un test no se puede integrar por error.

## Lee el workflow

Abre `.github/workflows/e2e.yml`. Es un **workflow**: una lista de pasos que GitHub ejecuta.

```yaml
on:
  pull_request:
  push:
    branches: [main]
```

`on` dice cuándo se ejecuta: en cada pull request y en cada push a `main`.

```yaml
jobs:
  e2e:
    runs-on: ubuntu-latest
    timeout-minutes: 15
```

Un **job** (trabajo) es un grupo de pasos en una máquina. Esta máquina usa Linux, no Windows. El job se detiene después de 15 minutos.

Los pasos se ejecutan en orden:

1. `actions/checkout@v4` descarga tu código.
2. `pnpm/action-setup@v4` instala pnpm. Lee la versión de la línea `packageManager` de `package.json`.
3. `actions/setup-node@v4` instala Node 24 y guarda en caché las descargas de pnpm.
4. `pnpm install --frozen-lockfile` instala los paquetes. Falla si `pnpm-lock.yaml` no coincide con `package.json`.
5. `pnpm typecheck` comprueba los tipos.
6. `pnpm exec playwright install --with-deps chromium` descarga el navegador y las librerías del sistema que necesita.
7. `pnpm e2e` ejecuta la suite del sitio del curso.
8. `pnpm shop:e2e` ejecuta la suite de la tienda.
9. `actions/upload-artifact@v4` guarda los reportes.

Si un paso falla, los siguientes no se ejecutan. El paso de subida tiene `if: ${{ !cancelled() }}`. Se ejecuta incluso después de un fallo, porque necesitas el reporte sobre todo cuando algo falla.

## Qué cambia con la variable CI

GitHub define la variable de entorno `CI`. Los dos archivos `playwright.config.ts` la leen.

| Ajuste | En tu máquina | En CI |
| --- | --- | --- |
| `forbidOnly` | desactivado | activado: un `test.only` hace fallar la ejecución |
| `retries` | 0 | 2: un test que falla se ejecuta de nuevo hasta 2 veces |
| `reuseExistingServer` | activado | desactivado: Playwright siempre inicia su propio servidor |

Un test que falla y luego pasa en un reintento se marca como **flaky** (inestable) en el reporte. Es una advertencia. Arréglalo.

La configuración de la tienda conserva el trace de cada test fallido (`retain-on-failure`). La configuración del sitio del curso graba un trace en el primer reintento (`on-first-retry`). En CI también cambia el reporter `list` por `github`, que muestra los errores en la página del pull request.

## Descarga el reporte

1. Abre tu pull request. Haz clic en la comprobación fallida y luego en **Details**.
2. Abre el **Summary** de la ejecución. Baja hasta **Artifacts**.
3. Descarga `playwright-reports`. Es un archivo zip. Descomprímelo.
4. El zip contiene dos carpetas: una para la suite del sitio del curso y otra para la suite de la tienda. Si falló la suite del sitio del curso, la suite de la tienda no se ejecutó, así que falta la carpeta de la tienda.
5. Abre un reporte con la ruta de la carpeta:

```bash
pnpm exec playwright show-report path\to\apps\practice-shop\playwright-report
```

Reemplaza la ruta por la tuya real. Haz clic en el test fallido. Abre su trace. Es el mismo trace que leíste en la lección 3, grabado en la máquina de CI. Los reportes se conservan 7 días.

## Un test falla solo en CI

Primero, no lo vuelvas a ejecutar hasta que pase. Lee el trace. Luego revisa las causas habituales.

- **Velocidad.** La máquina de CI es más lenta. Una espera fija o un timeout corto falla allí. Usa aserciones web-first.
- **Orden y datos.** CI empieza limpio. Un test que dependía de datos sobrantes falla.
- **Sistema operativo.** CI usa Linux. Allí los nombres de archivo distinguen mayúsculas: `Products.page.ts` no es `products.page.ts`.
- **Reutilización del servidor.** En tu máquina, un servidor viejo puede esconder un problema. CI siempre inicia uno nuevo.

Para copiar las condiciones de CI, define la variable. Detén primero la tienda, porque el modo CI no reutiliza un servidor en marcha. En PowerShell:

```bash
$env:CI = "1"
pnpm shop:e2e
Remove-Item Env:CI
```

La última línea vuelve a quitar la variable.

## Después del curso

Ahora sabes cómo se construye, se ejecuta y se revisa un proyecto de tests. Tu siguiente paso es uno real: pide acceso a un proyecto de un equipo. Antes de leer cualquier test, lee su `e2e/README.md` y luego sus notas de cobertura. Ejecuta la suite. Después elige un hueco pequeño y abre allí tu primer pull request.

## Profundiza

### Por qué CI empieza desde una máquina limpia

"En mi máquina funciona" es una frase famosa. Tu computadora tiene archivos viejos, servidores viejos y ajustes que olvidaste. CI empieza desde cero cada vez: descarga el código, instala los paquetes, inicia un servidor nuevo. Si los tests pasan allí, no dependen de tu computadora.

`--frozen-lockfile` sigue la misma idea. El archivo de bloqueo (*lock file*) lista la versión exacta de cada paquete. Con esta opción, CI se niega a adivinar versiones nuevas. Todos obtienen los mismos paquetes.

### Una idea equivocada: "los reintentos hacen confiables los tests"

Los reintentos no arreglan un test flaky. Lo esconden. La tienda usa 2 reintentos en CI porque una pequeña demora no debería detener al equipo. Pero un test que pasa solo en el segundo intento es una advertencia. Playwright lo marca como **flaky** en el reporte. Trata esa marca como una tarea por arreglar.

### Cómo aparece en el trabajo real de automatización QA

La configuración lee la variable `CI` así:

```ts
retries: process.env.CI ? 2 : 0
forbidOnly: !!process.env.CI
```

El `!!` convierte cualquier valor en `true` o `false`. Este pequeño script muestra el resultado para distintos valores:

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

Fíjate en que el texto `"0"` y el texto `"false"` dan `true`. Solo un valor vacío o ningún valor da `false`. Si un compañero define `CI=0` para apagar el modo CI, lo encenderá. Es una trampa real de las variables de entorno, porque siempre son texto.

### DRY en el workflow

Las dos configuraciones de Playwright leen una sola variable, `CI`. Un interruptor cambia varios ajustes. El archivo del workflow también vive en un solo lugar y se ejecuta en cada pull request, así nadie tiene que recordar ejecutar las dos suites. Eso es **DRY** (Don't Repeat Yourself, no te repitas). La regla se escribe una vez y se aplica siempre.

### El costo de un solo job grande

El workflow ejecuta las dos suites en un solo job, una tras otra. Es simple. El costo es el tiempo: la suite de la tienda espera a la suite del curso. Los equipos con suites lentas las separan en jobs distintos que corren al mismo tiempo. Es más rápido, pero cada job debe instalar todo otra vez. Para un proyecto pequeño, un solo job es la mejor opción.

## Práctica

1. Abre `.github/workflows/e2e.yml`. Encuentra el paso que instala el navegador.
2. Abre los dos archivos `playwright.config.ts`. Encuentra `forbidOnly`, `retries` y `reuseExistingServer`.
3. Detén la tienda. Ejecuta la suite de la tienda con `CI` definida, como se muestra arriba. Comprueba que inicia su propio servidor.
4. Quita la variable. Comprueba con `echo $env:CI` que está vacía.

## Comprueba lo que sabes

1. ¿Cuándo se ejecuta el workflow?

<details><summary>Respuesta</summary>

En cada pull request y en cada push a `main`.

</details>

2. ¿Qué hace `retries: 2` en CI y por qué no en local?

<details><summary>Respuesta</summary>

Un test que falla se ejecuta de nuevo hasta dos veces. En local quieres ver un fallo de inmediato, así que los reintentos están desactivados.

</details>

3. ¿Por qué el paso de subida se ejecuta después de un fallo?

<details><summary>Respuesta</summary>

`if: ${{ !cancelled() }}` hace que se ejecute incluso cuando fallan pasos anteriores. Necesitas el reporte cuando los tests fallan.

</details>

4. Un test falla solo en CI. ¿Qué abres primero?

<details><summary>Respuesta</summary>

El trace del reporte descargado.

</details>

5. Un compañero define la variable `CI` como `0` para apagar el modo CI. ¿Qué da `!!process.env.CI` y cuál es el resultado para `forbidOnly`?

<details><summary>Respuesta</summary>

Da `true`. El valor es el texto "0", y cualquier texto que no esté vacío es verdadero. Así que `forbidOnly` sigue activado y `retries` es 2. Para apagar el modo CI, quita la variable, como muestra la lección con `Remove-Item Env:CI`.

</details>

6. Un test falla en su primera ejecución en CI, pasa en la segunda, y el job queda en verde. ¿Hay un problema?

<details><summary>Respuesta</summary>

Sí, uno oculto. El job pasa gracias al reintento, pero el reporte marca el test como flaky. Algo es inestable: el tiempo, los datos o el entorno. Si nadie lo arregla, el equipo dejará poco a poco de confiar en los builds en rojo.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es la integración continua (CI) y qué problema resuelve?**
   - Busca: `continuous integration explained benefits`
   - Una buena respuesta explica: que CI ejecuta comprobaciones automáticamente en cada cambio, y cómo encuentra problemas pronto

2. **¿Qué son los workflows, jobs y steps de GitHub Actions?**
   - Busca: `github actions workflow job step explained`
   - Una buena respuesta explica: cómo se relacionan las tres palabras y cómo se activa un archivo de workflow

3. **¿Por qué los equipos usan un archivo de bloqueo como pnpm-lock.yaml?**
   - Busca: `lockfile package manager reproducible installs`
   - Una buena respuesta explica: qué guarda un archivo de bloqueo y por qué hace que las instalaciones sean iguales en todas las máquinas

## Siguiente paso

Terminaste el curso. Abre el módulo Referencias cuando necesites un enlace y pide un proyecto real para continuar.
