---
title: Git básico
summary: Usa Git para guardar tu trabajo, trabajar en una rama y compartir cambios mediante un pull request.
duration: 30 min
---

## Objetivo

- Explicar qué es el control de versiones y por qué QA Automation lo necesita.
- Configurar Git en tu computadora.
- Usar el ciclo diario de Git.
- Saber qué nunca debes hacer *commit*.

## ¿Qué es el control de versiones?

El **control de versiones** es un sistema que registra el historial de tus archivos. Puedes ver qué cambió, cuándo y por qué. Puedes volver a una versión anterior.

QA Automation lo necesita por tres razones:

- El código de los tests cambia a menudo, y necesitas deshacer errores.
- Muchas personas trabajan en los mismos tests.
- Desarrolladores y testers revisan los cambios de los demás antes de aceptarlos.

**Git** es la herramienta de control de versiones que casi todos los equipos usan.

## Cuatro palabras que debes conocer

- Un **repositorio** es una carpeta cuyo historial registra Git.
- Un *commit* (confirmación) es una copia guardada de tus cambios en un momento dado, con un mensaje corto.
- Una *branch* (rama) es una línea de trabajo separada, para que tus cambios no afecten el código principal.
- Un **remote** (remoto) es una copia del repositorio en un servidor, como GitHub, que compartes con tu equipo.

## Configuración inicial

Dile a Git quién eres. Hazlo una sola vez en tu computadora. Usa tu nombre real y tu correo de trabajo:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

Git escribe esta información en cada commit que haces. Comprueba los valores:

```bash
git config --global user.name
```

```text
Your Name
```

## El ciclo diario

Repites los mismos pasos cada día.

**1. Revisa el estado.** `git status` muestra qué archivos cambiaste.

```bash
git status
```

```text
On branch main
nothing to commit, working tree clean
```

**2. Crea una branch.** Nunca trabajes directamente en `main`. `git switch -c` crea una rama nueva y te mueve a ella.

```bash
git switch -c add-login-test
```

```text
Switched to a new branch 'add-login-test'
```

**3. Haz tus cambios.** Edita archivos en VS Code. Ejecuta `git status` otra vez. Muestra los archivos cambiados.

**4. Prepara los cambios.** `git add` elige qué entra en el próximo commit.

```bash
git add exercises/login-test.ts
```

Puedes usar `git add .` para preparar todos los archivos cambiados de la carpeta actual.

**5. Haz commit.** `git commit -m` guarda la copia con un mensaje.

```bash
git commit -m "Add login test for valid user"
```

Escribe un mensaje corto que diga qué hiciste.

**6. Haz push.** `git push` envía tu branch al remote.

```bash
git push -u origin add-login-test
```

La parte `-u origin add-login-test` solo es necesaria la primera vez que haces push de una branch nueva.

**7. Abre un pull request.** Un *pull request* (PR, solicitud de integración) es una petición para añadir tu branch a `main`. Lo creas en el sitio web del remote, por ejemplo GitHub. Un compañero lee tus cambios y los aprueba. Después se hace *merge* (se fusiona) de la branch en `main`.

Para traer los últimos cambios del equipo, ejecuta:

```bash
git pull
```

## Leer un diff

Un **diff** muestra exactamente qué cambió en un archivo. Ejecuta:

```bash
git diff
```

La salida se ve así:

```text
-  const status = "failed";
+  const status = "passed";
```

Una línea que empieza con `-` fue eliminada. Una línea que empieza con `+` fue añadida. Lee el diff antes de cada commit. Te ayuda a encontrar errores y archivos que no querías cambiar.

## El archivo .gitignore

Un archivo llamado `.gitignore` enumera los archivos y carpetas que Git debe ignorar. Cada línea es un nombre:

```text
node_modules
test-results
.env
```

Git no les dará seguimiento. La mayoría de los proyectos ya tienen un `.gitignore`. No lo borres.

## Lo que nunca debes hacer commit

- **Contraseñas y secretos.** Esto incluye claves de API, *tokens* y archivos `.env`. Cualquiera que pueda ver el repositorio puede ver el historial, incluso después de que borres el archivo.
- **`node_modules`.** Es grande y cualquiera puede recrearlo con `pnpm install`.
- **`test-results`.** Contiene reportes y capturas de pantalla de las ejecuciones de tests. Son resultados, no código fuente.

> **Cuidado:** Si haces commit de una contraseña por error, avisa a tu equipo de inmediato. Hay que cambiar la contraseña.

## Práctica

1. Ejecuta `git config --global user.name "Your Name"` con tu propio nombre.
2. Ejecuta `git config --global user.email "you@example.com"` con tu correo.
3. En el proyecto del curso, ejecuta `git status`. Lee la salida.
4. Ejecuta `git switch -c my-notes`.
5. Crea un archivo `exercises/notes.txt` y escribe una línea en él.
6. Ejecuta `git status`. Busca tu archivo nuevo en la lista.
7. Ejecuta `git add exercises/notes.txt` y luego `git commit -m "Add my notes"`.
8. Ejecuta `git log --oneline`. Busca tu commit al principio.
9. Cambia la línea de `notes.txt` y luego ejecuta `git diff`. Busca las líneas con `-` y `+`.

## Comprueba lo que sabes

1. ¿Qué es un commit?

<details>
<summary>Respuesta</summary>

Es una copia guardada de tus cambios, con un mensaje corto.

</details>

2. ¿Por qué trabajas en una branch y no en `main`?

<details>
<summary>Respuesta</summary>

Una branch mantiene tu trabajo separado, así no rompes el código principal antes de que un compañero lo revise.

</details>

3. ¿Qué significa una línea que empieza con `+` en un diff?

<details>
<summary>Respuesta</summary>

Significa que la línea fue añadida.

</details>

4. Nombra dos cosas que nunca debes hacer commit.

<details>
<summary>Respuesta</summary>

Contraseñas o secretos, `node_modules` o `test-results`. Cualquier par es correcto.

</details>

## Siguiente paso

A continuación aprenderás cómo funciona la web, para que sepas qué van a controlar tus tests.
