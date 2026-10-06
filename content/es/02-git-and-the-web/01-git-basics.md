---
title: Git básico
summary: Usa Git para guardar copias de tu trabajo, probar ideas en un branch y compartir cambios con un pull request.
duration: 75 min
---

## Empieza con un acertijo

Guardas un libro de cocina en una carpeta. El archivo `soup.txt` dice: "Add one spoon of salt." (agrega una cucharada de sal).

Creas un *branch* (rama) llamado `try-spicy`. En él, cambias el archivo a "Add one spoon of chili." (agrega una cucharada de chile). Haces un *commit*. Luego vuelves al branch `main`. No editas nada.

Abres `soup.txt` en VS Code. ¿Qué dice: "salt" o "chili"? Nadie tocó el archivo después del cambio.

Ahora piensa en una segunda pregunta. Si borras `soup.txt` y haces un commit, ¿un amigo que copia tu carpeta todavía puede leer la receta vieja?

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Predecir qué contiene un archivo después de cambiar de branch.
- Decidir cuándo preparar un solo archivo y cuándo preparar todos.
- Explicar por qué un secreto borrado no desaparece del historial.
- Leer un diff y escribir un mensaje de commit que cuente una sola idea.

## ¿Qué es el control de versiones?

Piensa en un videojuego con ranuras de guardado. Antes de un jefe difícil, guardas. Si pierdes, cargas la ranura anterior. Nunca lo pierdes todo.

El **control de versiones** es un sistema de guardado para archivos. Registra el historial de una carpeta. Puedes ver qué cambió, cuándo y por qué. Puedes volver a una versión anterior.

Ahora piensa en un trabajo escolar. Sin control de versiones, terminas con `essay-final.docx`, `essay-final2.docx` y `essay-final-REAL.docx`. Nadie sabe cuál es el correcto. Con control de versiones, hay un solo archivo y un historial de sus cambios.

**Git** es la herramienta de control de versiones que usan casi todos los equipos. Sirve para código, trabajos escolares, recetas y cualquier archivo de texto.

## Cuatro palabras que debes conocer

- Un **repositorio** es una carpeta cuyo historial registra Git.
- Un **commit** es una copia guardada de tus archivos en un momento, con un mensaje corto.
- Un **branch** es una línea de trabajo separada. Tus cambios en ella no tocan el código principal.
- Un **remote** (remoto) es una copia del repositorio en un servidor, como GitHub. La compartes con tu equipo.

## Configuración inicial

Dile a Git quién eres. Hazlo una sola vez en tu computadora. Usa tu nombre y tu correo reales:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

Git escribe esta información en cada commit que haces. Revisa el valor:

```bash
git config --global user.name
```

```text
Your Name
```

## El ciclo diario

Repites los mismos pasos todos los días. Los ejemplos usan el libro de cocina del acertijo.

**1. Revisa el estado.** `git status` muestra qué archivos cambiaste.

```bash
git status
```

```text
On branch main
nothing to commit, working tree clean
```

**2. Crea un branch.** No trabajes directamente en `main`. `git switch -c` crea un branch nuevo y te mueve a él.

```bash
git switch -c try-spicy
```

```text
Switched to a new branch 'try-spicy'
```

**3. Haz tus cambios.** Edita archivos en VS Code. Ejecuta `git status` otra vez. Te muestra los archivos cambiados.

**4. Prepara los cambios.** `git add` elige qué entra en el próximo commit.

```bash
git add soup.txt
```

**5. Haz el commit.** `git commit -m` guarda la copia con un mensaje.

```bash
git commit -m "Use chili instead of salt in the soup"
```

**6. Haz push.** `git push` envía tu branch al remote.

```bash
git push -u origin try-spicy
```

La parte `-u origin try-spicy` solo se necesita la primera vez que haces push de un branch nuevo.

**7. Abre un pull request.** Un ***pull request*** (solicitud de integración, PR) es una petición para agregar tu branch a `main`. Lo creas en el sitio web del remote, por ejemplo GitHub. Un compañero lee tus cambios y los aprueba. Después se hace *merge* (se fusiona) del branch en `main`.

Para traer los últimos cambios del equipo, ejecuta:

```bash
git pull
```

## El área de preparación: un experimento

El paso 4 parece un paso extra inútil. ¿Por qué no guardar todo de una vez? Intenta predecir qué pasa aquí.

Tienes un libro de cocina limpio. Haces estas cosas en este orden:

1. Editas `soup.txt`: agregas la línea "Add a little salt."
2. Ejecutas `git add soup.txt`.
3. Editas `soup.txt` otra vez: agregas la línea "Add black pepper."
4. Ejecutas `git commit -m "Add salt"`.

¿Qué contiene el commit: la línea de la sal, la línea de la pimienta o ambas? ¿Qué muestra `git status` después del paso 3?

Piensa primero. Luego sigue leyendo.

El commit contiene solo la línea de la sal. `git add` copia el archivo tal como está en ese momento al **área de preparación** (*staging area*). Es una sala de espera para el próximo commit. La línea de la pimienta llegó después, así que no está en la sala de espera. `git status` después del paso 3 muestra el mismo archivo dos veces:

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

La parte de arriba es la versión preparada. La parte de abajo es lo que cambió después. El área de preparación te deja armar un commit con cuidado. Puedes terminar dos ideas en una tarde y guardarlas como dos commits.

> **Consejo:** `git add .` prepara todos los archivos cambiados de la carpeta actual. Es rápido. Ejecuta `git status` antes, para saber qué entra.

## Los branches cambian tus archivos

Antes de la respuesta, una mirada más al acertijo: Git hace algo con tu carpeta que ningún programa normal hace.

### De vuelta al acertijo

Cuando cambias a `main`, `soup.txt` dice "salt". Git reescribe los archivos de tu carpeta para que coincidan con la copia del branch al que cambiaste. La versión con chile está a salvo en el commit de `try-spicy`. Si vuelves a ese branch, "chili" regresa.

Esto sorprende a casi todos. Una carpeta parece algo fijo. Con Git, la carpeta muestra el branch en el que estás. Por eso un branch casi no cuesta nada, y por eso puedes probar ideas locas en uno.

La segunda pregunta tiene una respuesta parecida. Un commit que borra `soup.txt` agrega una copia nueva sin el archivo. La copia vieja sigue existiendo en el historial. Tu amigo puede volver a ella y leer la receta vieja.

## Lee un diff

Un **diff** muestra exactamente qué cambió en un archivo. Ejecuta:

```bash
git diff
```

La salida se ve así, sin las líneas de encabezado:

```text
-Add one spoon of salt.
+Add one spoon of chili.
```

Una línea que empieza con `-` fue eliminada. Una línea que empieza con `+` fue agregada. Una línea cambiada aparece como una eliminación y una adición. Lee el diff antes de cada commit. Te ayuda a encontrar errores y archivos que no querías cambiar.

## El archivo .gitignore

Un archivo llamado `.gitignore` lista nombres que Git debe ignorar. Cada línea es un nombre:

```text
node_modules
test-results
.env
```

Git no hará seguimiento de estos. La mayoría de los proyectos ya tienen un `.gitignore`. No lo borres.

## Lo que nunca debes subir en un commit

- **Contraseñas y secretos.** Esto incluye claves de API, tokens y archivos `.env`. Cualquiera que pueda ver el repositorio puede ver el historial.
- **Carpetas que puedes reconstruir.** `node_modules` es grande y `pnpm install` la vuelve a crear.
- **Salida generada.** Los reportes y las capturas que crea un programa son resultados, no código fuente.

> **Cuidado:** Si subes una contraseña por error, avisa a tu equipo de inmediato. La contraseña debe cambiarse.

## Profundiza

### Por qué funciona así: copias y etiquetas

Git no guarda una lista de ediciones. Un commit guarda una copia de tus archivos en un momento. Cada commit tiene un ID largo y único, y apunta al commit anterior. Los IDs se acortan en `git log --oneline`:

```text
a1b2c3d Add login test for valid user
9f8e7d6 Add exercises folder
```

Tus IDs serán distintos. Un **branch** es solo una etiqueta pequeña que apunta a un commit. Cuando haces un commit, la etiqueta avanza. Como un branch es solo una etiqueta, crear uno es instantáneo y casi no cuesta nada. Por eso el equipo te pide crear un branch nuevo para cada tarea.

### Una idea equivocada común: "borré el archivo, así que el secreto desapareció"

Una persona principiante sube un archivo `.env` con una contraseña. Ve el error, borra el archivo y hace otro commit. Ahora el archivo ya no está en la carpeta. Pero no desapareció del historial.

```text
commit 2: Remove .env file      (the file is gone here)
commit 1: Add login test        (the file, and the password, are still here)
```

Cualquiera puede volver al commit 1 y leer la contraseña. Por eso la lección dice que la contraseña debe cambiarse. Borrar un archivo no borra el historial.

Una segunda idea equivocada tiene que ver con `.gitignore`. Solo afecta a archivos que Git todavía no sigue. Si un archivo se subió antes, agregar su nombre a `.gitignore` no hace que Git deje de seguirlo.

### Cómo aparece en el trabajo real de QA: commits pequeños

Una persona con poco tiempo lee cada pull request. Compara dos historiales:

```text
Update tests
Fix stuff
```

```text
Add a failing test for the wrong-password error
Use data-testid for the sign-in button
```

El segundo historial cuenta una historia. Quien revisa puede leer un commit a la vez. Si un commit causa un problema, el equipo puede deshacer solo ese commit. Una buena regla: un commit, una idea.

### Un equilibrio: muchos commits o pocos

Los commits muy pequeños, como uno por cada línea, también son difíciles de leer. Haz un commit cuando termines una idea y los tests todavía se ejecuten.

## Práctica

1. Ejecuta `git config --global user.name "Your Name"` con tu propio nombre.
2. Ejecuta `git config --global user.email "you@example.com"` con tu correo.
3. En el proyecto del curso, ejecuta `git status`. Lee la salida.
4. Ejecuta `git switch -c my-notes`.
5. Crea un archivo `exercises/notes.txt` y escribe una línea en él.
6. Ejecuta `git status`. Busca tu archivo nuevo en la lista.
7. Ejecuta `git add exercises/notes.txt`, y luego `git commit -m "Add my notes"`.
8. Ejecuta `git log --oneline`. Busca tu commit arriba de todo.
9. Cambia la línea de `notes.txt`, y luego ejecuta `git diff`. Busca las líneas con `-` y `+`.
10. Ejecuta `git add exercises/notes.txt`. Cambia la línea una vez más. Ejecuta `git status` y busca el archivo en las dos listas. Predice primero.

## Reto

Crea un pequeño libro de cocina privado (o un diario de cuidado de mascotas, o un registro de fútbol: elige tu propio mundo). También vas a practicar un error: subes un archivo privado por accidente y después lo reparas.

Trabaja en una carpeta nueva fuera del proyecto del curso, por ejemplo en tu carpeta Documentos. Ejecuta `git init` allí. Haz al menos cuatro commits en un branch que tú creaste. Un commit temprano debe contener por error un archivo llamado `private-notes.txt`. Luego repara el repositorio para que Git ya no siga ese archivo, mientras el archivo se queda en tu disco.

Crea el archivo `exercises/challenges/git-basics.txt` en el proyecto del curso. Pega en él la salida de los comandos de abajo, y agrega una frase sobre por qué el secreto todavía no está seguro.

Está terminado cuando:

- `git status` dice "nothing to commit, working tree clean", y `private-notes.txt` sigue en la carpeta.
- `git ls-files` no lista `private-notes.txt`.
- `git log --oneline` muestra al menos cuatro commits, y cada mensaje cuenta una sola idea.
- `git log --oneline -- private-notes.txt` muestra dos commits: el que agregó el archivo y el que dejó de seguirlo.
- Tu archivo `exercises/challenges/git-basics.txt` contiene la salida de los dos últimos comandos, y una frase que explica por qué debes cambiar cualquier contraseña que estuviera dentro.

Vas a necesitar algo que esta lección no enseñó: cómo hacer que Git deje de seguir un archivo pero lo conserve en el disco. Busca: `git rm --cached keep file`, `git init new repository`.

## Piénsalo bien

1. Agregaste `secrets.txt` a `.gitignore`, pero subiste `secrets.txt` en un commit la semana pasada. Cambias el archivo y ejecutas `git status`. ¿Git lista el archivo como cambiado? Predice y luego explica por qué.

<details>
<summary>Respuesta</summary>

Sí, Git lo lista. `.gitignore` solo funciona con archivos que Git todavía no sigue. Este archivo ya es parte del historial, así que Git todavía lo vigila. Para dejar de seguirlo, debes quitarlo de Git con `git rm --cached`. También debes cambiar cualquier contraseña que tenga dentro, porque los commits viejos todavía guardan el texto viejo.

</details>

2. Un amigo ejecuta estos pasos. El último comando muestra "no changes added to commit". El código del amigo está bien y el archivo estaba guardado. Encuentra el error.

```bash
git switch -c fix-typo
# edit soup.txt and save
git commit -m "Fix typo in soup"
```

<details>
<summary>Respuesta</summary>

El amigo olvidó `git add`. Un commit guarda solo lo que está en el área de preparación, y no se puso nada allí. La edición sigue en la carpeta, sin preparar. La solución es `git add soup.txt` y luego el mismo comando de commit. Un hábito que evita esto es ejecutar `git status` antes de cada commit.

</details>

3. Dos formas de preparar: `git add .` y `git add soup.txt`. Las dos funcionan. ¿Cuál es mejor cuando terminas una tarea y qué te haría elegir la otra?

<details>
<summary>Respuesta</summary>

Nombrar el archivo es más seguro. Eliges exactamente qué entra, así que un archivo `.env` o un experimento a medias no puede colarse. `git add .` es mejor cuando acabas de leer `git status` y todos los archivos cambiados pertenecen a esta sola idea. Es más corto, y no puedes olvidar un archivo. La elección depende de cuántos archivos cambiaron y de qué tan seguro estás de cada uno.

</details>

4. Tu equipo crece de 3 a 20 personas. Todas hacen push directo a `main`, sin branches y sin pull requests. ¿Qué se rompe primero y por qué?

<details>
<summary>Respuesta</summary>

Los errores llegan a todos a la vez. Un cambio roto en `main` detiene a las 20 personas, y nadie lo leyó antes de que llegara. Además, dos personas cambian el mismo archivo al mismo tiempo con más frecuencia, y deben reparar choques mientras intentan trabajar. Un branch más una revisión da un lugar para atrapar problemas antes de que lleguen al código compartido. Con 3 personas quizá sobrevivas sin eso, pero el costo de un error crece con el número de personas.

</details>

5. Explica a un compañero nuevo qué es un commit. Usa tres frases y no uses la palabra "copia".

<details>
<summary>Respuesta</summary>

Una buena respuesta podría ser: "Un commit es un punto de guardado de todo tu proyecto, con una nota corta que dice qué hiciste. Git guarda todos los puntos de guardado en orden, así que puedes mirar uno viejo o volver a él. Cada punto de guardado sabe cuál vino antes." El razonamiento es que el compañero necesita la idea de un punto de guardado, un mensaje y una cadena. Si tu respuesta dice "una copia de las líneas cambiadas", no es exacta, porque un commit guarda el estado de los archivos, no una lista de ediciones.

</details>

6. Dos cocineros trabajan en dos branches. Uno cambia la línea 2 de `soup.txt`. El otro cambia la línea 9 del mismo archivo. Se hace merge de ambos branches en `main`. ¿Hay un conflicto?

<details>
<summary>Respuesta</summary>

No. Git compara los archivos línea por línea. Los dos cambios están en líneas distintas, así que puede combinarlos sin ayuda. Un conflicto aparece solo cuando ambos branches cambian las mismas líneas, o cuando uno cambia una línea que el otro borra. Por eso los commits pequeños y enfocados, y los branches de vida corta, causan menos conflictos.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es un conflicto de merge y cómo se resuelve?**
   - Busca: `git merge conflict markers resolve`
   - Pruébalo: en un repositorio de práctica, crea dos branches que cambien la misma línea de un archivo. Haz merge de uno en el otro. Abre el archivo, lee las líneas marcadas, arregla el archivo y termina el merge.
   - Una buena respuesta explica: qué causa un conflicto, qué significan las líneas marcadas en el archivo, y los pasos para arreglar el archivo y terminar.
2. **¿Qué puedes escribir en un archivo `.gitignore` además de un nombre simple, como `*` y `!`?**
   - Busca: `gitignore pattern format`
   - Pruébalo: en un repositorio de práctica, crea `a.log`, `b.log` y `keep.log`. Escribe `*.log` y `!keep.log` en `.gitignore`. Ejecuta `git status`, y luego `git check-ignore -v a.log`.
   - Una buena respuesta explica: cómo ignorar todos los archivos con una misma terminación, cómo ignorar una carpeta y cómo hacer una excepción.
3. **¿Cómo deshaces un cambio que no está preparado, un cambio que sí está preparado y un commit que ya hiciste?**
   - Busca: `git undo restore reset revert difference`
   - Pruébalo: en un repositorio de práctica, cambia un archivo y deshazlo con `git restore`. Luego prepara un cambio y quítalo de la preparación. Luego haz un commit y deshazlo con `git revert`. Ejecuta `git log --oneline` después de cada paso.
   - Una buena respuesta explica: qué comando sirve para cada una de las tres situaciones, y por qué `git revert` es más seguro que `git reset` en trabajo que ya compartiste.

## Siguiente paso

Ahora vas a aprender cómo funciona la web, para que sepas qué van a controlar tus tests.
