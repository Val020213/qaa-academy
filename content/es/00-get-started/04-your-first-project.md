---
title: Tu primer proyecto
duration: 30 min
---

## Objetivo

Al terminar tendrás el proyecto del curso en tu computadora, con el sitio en marcha y los tests pasando una vez.

- Descargar el proyecto con Git e instalar sus dependencias.
- Ejecutar el sitio del curso y detenerlo.
- Saber qué hay en cada carpeta y qué hace cada script.

## Descarga el proyecto

El curso vive en este repositorio de GitHub: https://github.com/Val020213/qaa-academy

No vas a trabajar en ese repositorio sino en tu propia copia, llamada **fork**. Es una copia en tu cuenta de GitHub: la cambias libremente y el original queda como está.

1. Crea una cuenta gratis en github.com si no tienes una.
2. Abre el repositorio del curso en tu navegador.
3. Haz clic en **Fork**, arriba a la derecha. Luego haz clic en **Create fork**.

![El botón Fork está arriba a la derecha, en la página del repositorio.](/images/github-fork.png)

![En la página siguiente, elige tu usuario en Owner y haz clic en Create fork.](/images/github-create-fork.png)


Ahora tienes tu propia copia en `https://github.com/<your-user>/qaa-academy`.

Desde tu carpeta de usuario, entra en la carpeta donde guardas tus proyectos. Luego ejecuta `git clone` con la dirección de tu fork. Reemplaza `<your-user>` con tu nombre de usuario de GitHub:

```bash
cd projects
git clone https://github.com/<your-user>/qaa-academy.git qaa
cd qaa
code .
```

`git clone` descarga tu fork a la computadora, y `qaa` es el nombre de la carpeta nueva.

En VS Code, abre una terminal con Terminal > New Terminal. Empieza dentro de la carpeta `qaa`.

## Instala las dependencias

Un proyecto usa código escrito por otras personas. Esas piezas se llaman **dependencias**. Descárgalas con:

```bash
pnpm install
```

La instalación crea una carpeta llamada `node_modules`; el tiempo depende de la conexión. Tres piezas trabajan juntas:

- `package.json` lista las dependencias del proyecto.
- `pnpm-lock.yaml` registra la versión exacta de cada una, para que todos obtengan las mismas.
- `node_modules/` guarda las copias descargadas. No la edites: este proyecto la excluye de Git.

Si borras `node_modules`, `pnpm install` la vuelve a crear a partir de los otros dos archivos.

## Ejecuta el sitio del curso

```bash
pnpm dev
```

La terminal imprime un mensaje que dice que el sitio está en ejecución:

![Lo que imprime pnpm dev cuando el sitio está listo.](/images/terminal-pnpm-dev.png)

Abre esta dirección en tu navegador:

```text
http://localhost:5180
```

`localhost` significa "esta computadora": el sitio corre solo en tu máquina, y ahí lees las lecciones. En este clip se ve cómo cambian el tema, el idioma y la marca de lección completada.

![Cambia el sitio a oscuro, luego a español, y luego marca la lección como completada.](/clips/theme-and-language.webm)

La terminal queda ocupada mientras el sitio corre. Para detenerlo, haz clic en la terminal y presiona **Ctrl+C**.

El sitio usa el puerto 5180 por defecto. Si `pnpm dev` falla porque el puerto ya está en uso, comprueba qué programa lo ocupa. Si es este curso en otra terminal, detén esa con Ctrl+C o sigue usando el sitio abierto.

## Las carpetas

| Carpeta | Qué contiene |
| --- | --- |
| `content/` | Las lecciones, como archivos de texto Markdown |
| `exercises/` | Archivos de práctica donde escribes tu propio código |
| `e2e/` | Tests de Playwright que revisan este sitio del curso |
| `src/` | El código del sitio del curso en sí. Es una aplicación React |
| `apps/practice-shop/` | Una segunda aplicación, más grande, para probar en el módulo 5. Puedes ignorarla hasta entonces. |

Trabajarás sobre todo en `exercises/`. No necesitas cambiar `src/`.

En la raíz del proyecto hay dos archivos más de configuración: `tsconfig.json` para TypeScript y `playwright.config.ts` para los tests de Playwright.

## Los scripts

Un **script** es un comando con nombre guardado en `package.json`. Lo ejecutas con `pnpm <name>`.

| Comando | Qué hace |
| --- | --- |
| `pnpm dev` | Inicia el sitio del curso en http://localhost:5180 |
| `pnpm build` | Revisa los tipos y construye la versión final del sitio |
| `pnpm typecheck` | Revisa los tipos del código TypeScript del proyecto |
| `pnpm e2e` | Ejecuta los tests de Playwright sin un navegador visible |
| `pnpm e2e:ui` | Ejecuta los tests en una ventana donde puedes mirar cada paso |
| `pnpm e2e:headed` | Ejecuta los tests con un navegador visible |
| `pnpm shop:dev` | Inicia la tienda de práctica. La necesitas en el módulo 5 |
| `pnpm shop:e2e` | Ejecuta los tests de Playwright de la tienda de práctica |

## Ejecuta los tests una vez

Estos tests usan el Chromium que instala Playwright. Descárgalo con este comando:

```bash
pnpm exec playwright install chromium
```

Luego ejecuta los tests:

```bash
pnpm e2e
```

Con la configuración del curso, Playwright inicia el sitio si no está en ejecución. En tu máquina también puede usar el servidor que ya responde en esa dirección: comprueba que sea el del curso. Tampoco necesitas entender todavía estos tests: este paso solo prueba que tu configuración funciona, y aprenderás cómo funcionan en el módulo 3.

Si todos pasan, la salida incluye una línea que tiene el número de tests y la palabra `passed`, y después el tiempo. Los números pueden ser distintos en tu computadora. Los tests marcados como `skipped` son ejercicios que completarás en el módulo 3.

![El final de una ejecución sana de pnpm e2e.](/images/terminal-pnpm-e2e.png)

Cada versión de Playwright elige una versión de Chromium. Si actualizas Playwright, repite la instalación del navegador. Usar la misma versión reduce diferencias entre computadoras, pero no garantiza el mismo resultado en los tests.

## Práctica

Abre `package.json` en VS Code y encuentra la sección `scripts`. Encuentra las entradas de los comandos de la tabla anterior. Después busca dentro de `content/` el archivo de esta lección.

## Piénsalo bien

1. Borras `node_modules` y ejecutas `pnpm dev`. ¿Qué esperas y qué ejecutas después para arreglarlo? ¿Dónde encuentra pnpm la lista de lo que debe descargar?

<details>
<summary>Respuesta</summary>

`pnpm dev` falla, porque falta el programa que inicia el sitio, que vive en `node_modules`. Ejecutas `pnpm install`, que lee `package.json` para saber qué librerías descargar y `pnpm-lock.yaml` para las versiones exactas.

</details>

## Siguiente paso

Tu configuración está lista. Ve al módulo 1 y escribe tu primer programa.
