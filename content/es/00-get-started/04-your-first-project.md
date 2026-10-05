---
title: Tu primer proyecto
summary: Descarga el repositorio del curso, ejecuta el sitio del curso y aprende para qué sirve cada carpeta y cada archivo.
duration: 30 min
---

## Objetivo

- Descargar el proyecto del curso con Git.
- Instalar sus bibliotecas y ejecutar el sitio del curso.
- Saber para qué sirve cada carpeta y cada archivo del proyecto.
- Ejecutar los scripts del proyecto y comprobar que tu configuración funciona.

## Descarga el proyecto

El curso es un proyecto en un repositorio de Git. Un **repositorio** es una carpeta que Git vigila. El repositorio del curso es público en GitHub, un sitio web que guarda repositorios: https://github.com/Val020213/qaa-academy

No vas a trabajar en ese repositorio. Vas a trabajar en tu propia copia, llamada *fork*. Un **fork** es una copia de un repositorio en tu propia cuenta de GitHub. Puedes cambiarla con libertad, y el original queda igual.

1. Crea una cuenta gratis en github.com si no tienes una.
2. Abre el repositorio del curso en tu navegador.
3. Haz clic en **Fork**, arriba a la derecha. Luego haz clic en **Create fork**.

Ahora tienes tu propia copia en `https://github.com/<your-user>/qaa-academy`.

En la terminal, ve a la carpeta donde guardas tus proyectos. Luego ejecuta `git clone` con la dirección de tu fork. Reemplaza `<your-user>` con tu nombre de usuario de GitHub:

```bash
cd projects
git clone https://github.com/<your-user>/qaa-academy.git qaa
cd qaa
code .
```

- `git clone` descarga una copia de tu fork a tu computadora.
- `qaa` es el nombre de la carpeta nueva.
- `cd qaa` te mueve dentro de ella.
- `code .` la abre en VS Code.

En la nueva ventana de VS Code, abre una terminal con Terminal > New Terminal. Empieza dentro de la carpeta `qaa`.

## Instala las bibliotecas

Un proyecto usa código escrito por otras personas. Estas piezas se llaman **dependencias**. Descárgalas con:

```bash
pnpm install
```

Esto puede tardar un minuto. Crea una carpeta llamada `node_modules`.

## Ejecuta el sitio del curso

```bash
pnpm dev
```

La terminal imprime un mensaje que dice que el sitio está en ejecución. Abre esta dirección en tu navegador:

```text
http://localhost:5180
```

`localhost` significa "esta computadora". El sitio funciona solo en tu máquina. Ahí lees las lecciones.

La terminal queda ocupada mientras el sitio funciona. Para detenerlo, haz clic en la terminal y presiona **Ctrl+C**.

## Las carpetas

| Carpeta | Qué contiene |
| --- | --- |
| `content/` | Las lecciones, como archivos de texto Markdown |
| `exercises/` | Archivos de práctica donde escribes tu propio código |
| `e2e/` | Tests de Playwright que comprueban este sitio del curso |
| `src/` | El código del sitio del curso en sí |
| `apps/practice-shop/` | Una segunda aplicación, más grande, para probar en el módulo 5. Puedes ignorarla hasta entonces. |

Trabajarás sobre todo en `exercises/`. No necesitas cambiar `src/`.

## Los archivos del proyecto

- `package.json` lista el nombre del proyecto, sus dependencias y sus scripts.
- `node_modules/` guarda las dependencias descargadas. Nunca la edites.
- `pnpm-lock.yaml` registra la versión exacta de cada dependencia, para que todos obtengan las mismas.
- `tsconfig.json` tiene la configuración de TypeScript.

## Los scripts

Un **script** es un comando con nombre guardado en `package.json`. Lo ejecutas con `pnpm <name>`.

| Comando | Qué hace |
| --- | --- |
| `pnpm dev` | Inicia el sitio del curso en http://localhost:5180 |
| `pnpm build` | Construye la versión final del sitio |
| `pnpm typecheck` | Revisa el código TypeScript en busca de errores |
| `pnpm e2e` | Ejecuta los tests de Playwright sin un navegador visible |
| `pnpm e2e:ui` | Ejecuta los tests en una ventana donde puedes ver cada paso |
| `pnpm e2e:headed` | Ejecuta los tests con un navegador visible |

## Ejecuta los tests una vez

Playwright necesita su propio navegador. Descárgalo una sola vez con este comando:

```bash
pnpm exec playwright install chromium
```

Luego ejecuta los tests:

```bash
pnpm e2e
```

No necesitas iniciar el sitio antes. Playwright lo inicia por sí solo.

**No** necesitas entender estos tests todavía. Este paso solo comprueba que tu configuración funciona. Aprenderás cómo funcionan en el módulo 3.

Si todos los tests pasan, la salida termina con una línea como esta:

```text
  7 passed (6.0s)
```

El número de tests y el tiempo pueden ser distintos.

> **Cuidado:** Si `pnpm dev` sigue en ejecución en otra terminal, no hay problema. Playwright puede usarlo o iniciar el suyo.

## Práctica

1. Abre una terminal y ve a tu carpeta de proyectos.
2. Haz un fork del repositorio del curso en GitHub. Luego ejecuta `git clone https://github.com/<your-user>/qaa-academy.git qaa` con tu nombre de usuario.
3. Ejecuta `cd qaa` y luego `code .`.
4. En la terminal de VS Code, ejecuta `pnpm install`.
5. Ejecuta `pnpm dev`. Abre http://localhost:5180 y busca esta lección.
6. Presiona Ctrl+C en la terminal para detener el sitio.
7. Ejecuta `pnpm exec playwright install chromium`.
8. Ejecuta `pnpm e2e` y comprueba que los tests pasan.
9. Abre `package.json` en VS Code. Busca la sección llamada `scripts`.

## Comprueba lo que sabes

1. ¿Qué hace `git clone`?

<details>
<summary>Respuesta</summary>

Descarga una copia de un repositorio a tu computadora.

</details>

2. ¿Qué hace `pnpm install`?

<details>
<summary>Respuesta</summary>

Descarga las bibliotecas que necesita el proyecto en `node_modules`.

</details>

3. ¿Cómo detienes `pnpm dev`?

<details>
<summary>Respuesta</summary>

Presiona Ctrl+C en la terminal.

</details>

4. ¿Qué carpeta usarás más para practicar?

<details>
<summary>Respuesta</summary>

La carpeta `exercises/`.

</details>

## Siguiente paso

Tu configuración está lista. Ve al módulo 1 y escribe tu primer programa.
