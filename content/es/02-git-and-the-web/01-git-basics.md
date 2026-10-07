---
title: Git básico
duration: 60 min
---

## Objetivo

Vas a guardar cambios con Git, revisar qué entra en cada commit y compartir tu trabajo en un branch.

- Preparar los archivos que pertenecen a una misma tarea.
- Predecir qué contiene un archivo después de cambiar de branch.
- Leer un diff y escribir un mensaje de commit que cuente una sola idea.
- Reconocer por qué borrar un secreto no lo elimina del historial.

## Commits y branches

Git registra versiones de los archivos de un repositorio para que puedas revisar cambios y recuperar una versión anterior. Un **commit** guarda el estado de los archivos que Git sigue, con un mensaje que describe el cambio.

Cada commit tiene un ID largo y único, y guarda el ID del commit del que parte, su **padre**. El primer commit de un repositorio no tiene padre, y un commit que une dos branches (*merge*) tiene dos. Los IDs se acortan en `git log --oneline`:

```text
a1b2c3d Add login test for valid user
9f8e7d6 Add exercises folder
```

Tus IDs serán distintos. Un **branch** (rama) es una referencia que apunta a un commit. Cuando haces un commit en ese branch, Git mueve la referencia al commit nuevo. Crear un branch no requiere copiar todos los archivos.

Un **remote** (remoto) es una copia del repositorio en un servidor, como GitHub, donde compartes los cambios con tu equipo.

## Configuración inicial

Configura tu nombre y correo una vez en tu computadora. Reemplaza los valores del ejemplo con los tuyos:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

Git escribe esta información en cada commit que haces. Revisa el nombre:

```bash
git config --global user.name
```

```text
Your Name
```

## El ciclo diario

Estos ejemplos cambian una receta en `soup.txt`.

**1. Revisa el estado.** `git status` muestra el branch actual y los archivos con cambios.

```bash
git status
```

```text
On branch main
nothing to commit, working tree clean
```

**2. Crea un branch.** Usa un branch para la tarea. `git switch -c` crea uno nuevo y te mueve a él.

```bash
git switch -c try-spicy
```

```text
Switched to a new branch 'try-spicy'
```

**3. Haz tus cambios.** Edita los archivos en VS Code y guárdalos. Ejecuta `git status` para ver cuáles cambiaron.

**4. Prepara los cambios.** `git add` guarda la versión del archivo que quieres incluir en el próximo commit.

```bash
git add soup.txt
```

**5. Haz el commit.** `git commit -m` registra el estado preparado con un mensaje.

```bash
git commit -m "Use chili instead of salt in the soup"
```

**6. Haz push.** `git push` envía los commits de tu branch al remote.

```bash
git push -u origin try-spicy
```

La opción `-u` enlaza tu branch local con el branch del remoto. Después de ese primer push, `git push` y `git pull` sin argumentos ya saben a dónde ir.

**7. Abre un pull request.** Un **pull request** (PR) pide integrar los cambios de tu branch en `main`. Lo creas en GitHub para que un compañero revise los cambios antes de hacer *merge* (fusionarlos).

Para traer los últimos cambios del equipo, ejecuta:

```bash
git pull
```

Git descarga los cambios del remote y los integra en tu branch actual. Sin argumentos, usa el branch remoto que tu branch tiene configurado para seguir.

## El área de preparación

Git distingue los archivos de tu carpeta, el **área de preparación** (*staging area*) y el último commit. `git add` guarda el contenido del archivo tal como está en ese momento en el área de preparación. `git commit` registra ese estado, aunque hayas seguido editando el archivo después.

Por ejemplo, empiezas sin cambios pendientes y sigues estos pasos:

1. Editas `soup.txt`: agregas la línea "Add a little salt."
2. Ejecutas `git add soup.txt`.
3. Editas `soup.txt` otra vez: agregas la línea "Add black pepper."
4. Ejecutas `git commit -m "Add salt"`.

El commit incluye la línea de la sal. La línea de la pimienta queda sin preparar porque la agregaste después de `git add`. Después del paso 3, `git status` muestra el mismo archivo en dos listas:

```text
On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	modified:   soup.txt

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   soup.txt
```

La primera lista muestra cambios preparados respecto al último commit. La segunda muestra cambios en la carpeta respecto a la versión preparada.

`git add .` prepara todos los archivos nuevos y modificados de la carpeta actual y de sus subcarpetas, excepto los que `.gitignore` excluye. Ejecuta `git status` antes de usarlo y comprueba que todos pertenecen a la tarea. Si solo quieres incluir un archivo, nómbralo como en `git add soup.txt`.

## Los branches cambian tus archivos

Supón que en `main` el archivo `soup.txt` contiene "Add one spoon of salt." Creas `try-spicy`, cambias la línea a "Add one spoon of chili." y haces un commit. Luego vuelves a `main`, sin cambios pendientes.

Cuando cambias a `main`, `soup.txt` vuelve a decir "Add one spoon of salt." Git reescribe los archivos de tu carpeta para que coincidan con el commit al que apunta ese branch. Aquí todos los cambios están en commits; si tuvieras cambios sin guardar en un archivo que difiere entre los dos branches, Git se negaría a cambiar para no perderlos. Si vuelves a `try-spicy`, recuperas la versión con chile.

## Lee un diff

Un **diff** muestra exactamente qué cambió en un archivo. Ejecuta este comando antes de preparar los cambios:

```bash
git diff
```

`git diff` compara los archivos de tu carpeta con el área de preparación. Muestra los cambios que todavía no preparaste; los cambios ya preparados no aparecen en esta comparación.

La salida se ve así, sin las líneas de encabezado:

```text
-Add one spoon of salt.
+Add one spoon of chili.
```

Una línea que empieza con `-` fue eliminada y una que empieza con `+` fue agregada. Una línea cambiada aparece como una eliminación y una adición. Revisa el diff para encontrar errores antes de preparar el archivo.

## El archivo .gitignore

Un archivo llamado `.gitignore` lista lo que Git debe ignorar. Cada línea es un patrón: un nombre de archivo, una carpeta que termina en `/`, o un nombre con `*` como comodín. Las líneas que empiezan con `#` son comentarios.

```text
node_modules
test-results
.env
```

Git no hará seguimiento de estos. `.gitignore` solo afecta a archivos que Git todavía no sigue. Si un archivo se subió antes, agregar su nombre a `.gitignore` no hace que Git deje de seguirlo.

Deja fuera de tus commits:

- Contraseñas, claves de API, tokens y archivos `.env`.
- Carpetas que puedes reconstruir, como `node_modules`, que `pnpm install` vuelve a crear.
- Reportes y capturas generados al ejecutar tests.

## Profundiza

### Borrar un archivo no borra su historial

Si haces un commit con una contraseña en `.env` y luego borras el archivo en otro commit, Git conserva la versión anterior:

```text
commit 2: Remove .env file      (the file is gone here)
commit 1: Add login test        (the file, and the password, are still here)
```

Cualquiera con acceso a esos commits puede leer la contraseña. Avisa a tu equipo de inmediato y cambia la contraseña.

### Un commit por idea

Haz un commit cuando termines una idea, con un mensaje que diga qué cambió. Estos mensajes no permiten saberlo:

```text
Update tests
Fix stuff
```

Estos identifican el cambio que puede revisar un compañero:

```text
Add a failing test for the wrong-password error
Use data-testid for the sign-in button
```

Un commit por cada línea también dificulta la revisión. Agrupa los cambios de una misma tarea para que el equipo pueda revisarlos o deshacerlos juntos.

## Práctica

1. Ejecuta `git config --global user.name "Your Name"` con tu propio nombre.
2. Ejecuta `git config --global user.email "you@example.com"` con tu correo.
3. En el proyecto del curso, ejecuta `git status`. Lee la salida.
4. Ejecuta `git switch -c my-notes`.
5. Crea un archivo `exercises/notes.txt` y escribe una línea en él.
6. Ejecuta `git status`. Busca tu archivo nuevo en la lista.
7. Ejecuta `git add exercises/notes.txt`. Luego ejecuta `git commit -m "Add my notes"`.
8. Ejecuta `git log --oneline`. Busca tu commit arriba de todo.
9. Cambia la línea de `notes.txt` y guárdala. Ejecuta `git diff` y busca las líneas con `-` y `+`.
10. Ejecuta `git add exercises/notes.txt`. Cambia y guarda la línea una vez más. Ejecuta `git status` y busca el archivo en las dos listas.

## Reto

En una carpeta nueva fuera del proyecto del curso, ejecuta `git init`. Crea un branch y haz al menos cuatro commits con notas de pruebas. En un commit temprano incluye `private-notes.txt` con una contraseña inventada. Luego haz que Git deje de seguir ese archivo, conservándolo en tu disco.

Crea `exercises/challenges/git-basics.txt` en el proyecto del curso para guardar la evidencia.

Está terminado cuando:

- `git status` dice "nothing to commit, working tree clean", `private-notes.txt` sigue en la carpeta y `git ls-files` no lo lista.
- `git log --oneline` muestra al menos cuatro commits, y cada mensaje cuenta una sola idea.
- `git log --oneline -- private-notes.txt` muestra dos commits: el que agregó el archivo y el que dejó de seguirlo.
- `exercises/challenges/git-basics.txt` contiene la salida de los dos últimos comandos y una frase que explica por qué debes cambiar cualquier contraseña que estuviera dentro.

Busca cómo dejar de seguir un archivo sin borrarlo del disco y cómo crear el repositorio: `git rm --cached keep file`, `git init new repository`.

## Piénsalo bien

1. Agregaste `secrets.txt` a `.gitignore`, pero subiste `secrets.txt` en un commit la semana pasada. Cambias el archivo y ejecutas `git status`. ¿Git lista el archivo como cambiado?

<details>
<summary>Respuesta</summary>

Sí. Git ya sigue ese archivo, así que `.gitignore` no impide que detecte sus cambios. Debes quitarlo del seguimiento con `git rm --cached` para conservarlo en disco.

</details>

2. Un compañero ejecuta estos pasos. El último comando muestra "no changes added to commit". El archivo estaba guardado. Encuentra el error.

```bash
git switch -c fix-typo
# edit soup.txt and save
git commit -m "Fix typo in soup"
```

<details>
<summary>Respuesta</summary>

Falta `git add`. La edición está en la carpeta, pero el área de preparación no contiene cambios para el commit. Ejecuta `git add soup.txt` y luego el mismo comando de commit.

</details>

3. Git ya sigue `soup.txt` y `exercises/notes.txt`, y cambiaste ambos archivos. El área de preparación está vacía y estás en la raíz del proyecto. Solo la receta pertenece a la tarea. ¿Qué incluiría el siguiente commit si ejecutas `git add .`? ¿Y si ejecutas `git add soup.txt`?

<details>
<summary>Respuesta</summary>

`git add .` prepara ambos archivos si lo ejecutas desde la raíz del proyecto. `git add soup.txt` prepara solo la receta, así que las notas quedan fuera del siguiente commit.

</details>

## Siguiente paso

Ahora vas a aprender cómo funciona la web, para que sepas qué van a controlar tus tests.
