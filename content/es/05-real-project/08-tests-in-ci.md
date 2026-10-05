---
title: Tests en CI
summary: Lee el workflow de CI, aprende qué cambia cuando los tests corren en CI, descarga el reporte de una ejecución fallida y planifica qué sigue.
duration: 35 min
---

## Objetivo

- Explicar qué es CI y cuándo se ejecuta.
- Leer `.github/workflows/e2e.yml` paso a paso.
- Nombrar qué cambia en las configuraciones de Playwright cuando la variable `CI` está definida.
- Abrir el reporte y el trace de una ejecución de CI que falló.

## Qué es CI

**CI** significa integración continua (*continuous integration*). Un servidor ejecuta tus tests automáticamente en cada pull request. Usa una máquina limpia, así que el resultado no depende de tu computadora.

CI protege al equipo. Un cambio que rompe un test no se puede fusionar por error.

## Lee el workflow

Abre `.github/workflows/e2e.yml`. Es un **workflow** (flujo de trabajo): una lista de pasos que GitHub ejecuta.

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
5. `pnpm typecheck` revisa los tipos.
6. `pnpm exec playwright install --with-deps chromium` descarga el navegador y las bibliotecas del sistema que necesita.
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

La configuración de la tienda conserva el trace de cada test que falla (`retain-on-failure`). La configuración del sitio del curso graba un trace en el primer reintento (`on-first-retry`). En CI también cambia el reporter `list` por `github`, que muestra los errores en la página del pull request.

## Descarga el reporte

1. Abre tu pull request. Haz clic en la comprobación que falló y luego en **Details**.
2. Abre el **Summary** de la ejecución. Baja hasta **Artifacts**.
3. Descarga `playwright-reports`. Es un archivo zip. Descomprímelo.
4. El zip contiene dos carpetas: una para la suite del sitio del curso y otra para la suite de la tienda. Si la suite del sitio del curso falló, la de la tienda no se ejecutó, así que falta la carpeta de la tienda.
5. Abre un reporte con la ruta de la carpeta:

```bash
pnpm exec playwright show-report path\to\apps\practice-shop\playwright-report
```

Reemplaza la ruta por la real. Haz clic en el test que falló. Abre su trace. Es el mismo trace que leíste en la lección 3 (Ejecutar la suite y leer el reporte), grabado en la máquina de CI. Los reportes se conservan 7 días.

## Un test falla solo en CI

Primero, no lo vuelvas a ejecutar hasta que pase. Lee el trace. Luego revisa las causas habituales.

- **Velocidad.** La máquina de CI es más lenta. Una espera fija o un timeout corto fallan allí. Usa aserciones web-first.
- **Orden y datos.** CI empieza limpio. Un test que dependía de datos sobrantes falla.
- **Sistema operativo.** CI usa Linux. Allí los nombres de archivo distinguen mayúsculas y minúsculas: `Products.page.ts` no es `products.page.ts`.
- **Reutilización del servidor.** En tu máquina un servidor viejo puede ocultar un problema. CI siempre inicia uno nuevo.

Para copiar las condiciones de CI, define la variable. Detén primero la tienda, porque el modo CI no reutiliza un servidor en marcha. En PowerShell:

```bash
$env:CI = "1"
pnpm shop:e2e
Remove-Item Env:CI
```

La última línea quita la variable de nuevo.

## Después del curso

Ya sabes cómo se construye, se ejecuta y se revisa un proyecto de tests. Tu siguiente paso es real: pide acceso a un proyecto de un equipo. Antes de leer cualquier test, lee su `e2e/README.md` y luego sus notas de cobertura. Ejecuta la suite. Después elige un hueco pequeño y abre allí tu primer pull request.

## Práctica

1. Abre `.github/workflows/e2e.yml`. Busca el paso que instala el navegador.
2. Abre los dos archivos `playwright.config.ts`. Busca `forbidOnly`, `retries` y `reuseExistingServer`.
3. Detén la tienda. Ejecuta la suite de la tienda con `CI` definida, como se muestra arriba. Comprueba que inicia su propio servidor.
4. Quita la variable. Comprueba con `echo $env:CI` que está vacía.

## Comprueba lo que sabes

1. ¿Cuándo se ejecuta el workflow?

<details><summary>Respuesta</summary>

En cada pull request y en cada push a `main`.

</details>

2. ¿Qué hace `retries: 2` en CI y por qué no en local?

<details><summary>Respuesta</summary>

Un test que falla se ejecuta de nuevo hasta dos veces. En local quieres ver el fallo de inmediato, así que los reintentos están desactivados.

</details>

3. ¿Por qué el paso de subida se ejecuta después de un fallo?

<details><summary>Respuesta</summary>

`if: ${{ !cancelled() }}` hace que se ejecute incluso cuando fallan los pasos anteriores. Necesitas el reporte cuando los tests fallan.

</details>

4. Un test falla solo en CI. ¿Qué abres primero?

<details><summary>Respuesta</summary>

El trace del reporte descargado.

</details>

## Siguiente paso

Terminaste el curso. Abre el módulo Referencias cuando necesites un enlace y pide un proyecto real para continuar.
