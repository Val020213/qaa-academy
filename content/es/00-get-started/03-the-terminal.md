---
title: La terminal
summary: Aprende qué es una terminal y los pocos comandos de PowerShell que necesitas cada día.
duration: 40 min
---

## Objetivo

- Abrir PowerShell dentro de VS Code.
- Moverte entre carpetas con unos pocos comandos simples.
- Entender qué es una ruta.
- Detener un comando en ejecución y reutilizar comandos anteriores.

## ¿Qué es una terminal?

Una **terminal** es una ventana donde escribes comandos. La computadora lee cada comando, lo ejecuta e imprime un resultado.

Usas una terminal porque muchas herramientas para desarrolladores no tienen botones. Las ejecutas con comandos de texto.

La terminal ejecuta una **shell**. Una shell es el programa que entiende tus comandos. En Windows, la shell que usas es **PowerShell**.

## Abre la terminal en VS Code

1. Abre VS Code.
2. Haz clic en Terminal > New Terminal en el menú de arriba.
3. Se abre un panel en la parte de abajo.

Ves una línea que termina en `>`. Este es el **prompt** (indicador). Muestra dónde estás y espera tu comando.

```text
PS C:\Users\you>
```

`PS` significa PowerShell. Lo demás es tu carpeta actual.

## ¿Qué es una ruta?

Una **ruta** (*path*) es la dirección de un archivo o una carpeta en tu computadora.

En Windows, una ruta empieza con la letra de una unidad y usa barras invertidas:

```text
C:\Users\you\projects
```

Léela de izquierda a derecha. Unidad `C:`, luego carpeta `Users`, luego carpeta `you`, luego carpeta `projects`.

En los comandos, puedes escribir la misma ruta con barras normales: `C:/Users/you/projects`. PowerShell y Node aceptan las dos. Este curso usa barras normales en los comandos.

## Tus primeros comandos

**pwd** significa "print working directory" (mostrar la carpeta de trabajo). Muestra la carpeta en la que estás ahora.

```bash
pwd
```

```text
Path
----
C:\Users\you
```

**ls** lista los archivos y las carpetas dentro de la carpeta actual.

```bash
ls
```

La salida es una tabla con nombres como `Documents` y `Downloads`.

**mkdir** crea una carpeta nueva:

```bash
mkdir projects
```

PowerShell imprime una tabla pequeña que confirma la carpeta nueva.

**cd** significa "change directory" (cambiar de carpeta). Te mueve a una carpeta:

```bash
cd projects
pwd
```

```text
Path
----
C:\Users\you\projects
```

**cd ..** te sube una carpeta. Los dos puntos significan "la carpeta superior".

```bash
cd ..
pwd
```

```text
Path
----
C:\Users\you
```

> **Nota:** Las mayúsculas no importan en las rutas de PowerShell. `Projects` y `projects` son la misma carpeta.

## Lee la salida

Cuando ejecutas un comando, lee siempre lo que imprime. Si un comando funciona, muchas veces no imprime nada, o imprime un resultado corto. Si falla, imprime un error en rojo.

Este es un error por una carpeta que no existe:

```bash
cd missing-folder
```

```text
cd : Cannot find path 'C:\Users\you\missing-folder' because it does not exist.
```

El mensaje te dice el problema. Escribiste mal el nombre, o estás en la carpeta equivocada. Ejecuta `pwd` y `ls` para comprobarlo.

## Teclas que ahorran tiempo

- **Tab** completa un nombre. Escribe `cd pro` y presiona Tab. PowerShell escribe `projects`.
- **Flecha arriba** trae de vuelta tu último comando. Presiónala otra vez para ir más atrás.
- **Ctrl+C** detiene un comando que sigue en ejecución. La usarás para detener el sitio del curso.

> **Consejo:** Usa Tab todo el tiempo. Ahorra escritura y evita errores de tipeo.

## Abre una carpeta en VS Code

El comando `code .` abre la carpeta actual en VS Code. El punto significa "esta carpeta".

```bash
cd projects
code .
```

VS Code abre una ventana nueva que muestra la carpeta. Esta es la forma habitual de empezar a trabajar en un proyecto.

## Profundiza

### Por qué existe la terminal: el texto es fácil de repetir

Un botón necesita que una persona le haga clic. Un comando de texto se puede guardar en un archivo, compartir y volver a ejecutar con un programa. Por eso las herramientas de pruebas usan comandos: una computadora puede ejecutar `pnpm e2e` de noche, sin nadie presente.

Es la misma razón por la que quieres tests automatizados. Un paso escrito como texto se puede repetir con exactitud.

### Una idea equivocada común: "La terminal es otra computadora"

Muchos principiantes creen que los comandos cambian algo lejano. No es así. Una terminal funciona en tu propia computadora, y cada comando trabaja desde una **carpeta actual**. El prompt muestra esa carpeta.

Por eso el mismo comando puede dar resultados distintos en lugares distintos. Compara:

```bash
cd projects
ls
cd ..
ls
```

Los dos comandos `ls` muestran archivos distintos, porque estás en carpetas distintas. Muchos errores de principiante, como "cannot find path", vienen de ejecutar un comando en la carpeta equivocada. Antes de depurar, ejecuta `pwd`.

### Cómo aparece en el trabajo real de automatización QA

Ejecutarás los comandos de los tests desde la carpeta del proyecto, no desde cualquier carpeta. Si ejecutas `pnpm e2e` en tu carpeta personal, pnpm no encuentra `package.json` y falla. El test estaba bien. El lugar era el equivocado.

Un segundo ejemplo es CI, un servidor que ejecuta tus tests después de cada cambio de código. CI no tiene ratón. Empieza en una carpeta y ejecuta los mismos comandos de texto que tú escribes. Si tus tests solo funcionan con clics en una ventana, no pueden ejecutarse ahí.

### Por qué puedes copiar un comando, pero aun así debes entenderlo

Un comando puede borrar archivos. En PowerShell, `rm` elimina un archivo y no pregunta. No hay papelera de reciclaje para eso. Lee cada comando antes de ejecutarlo, sobre todo si viene de internet.

> **Cuidado:** Nunca ejecutes un comando que no entiendes solo porque una página web lo dice.

## Práctica

1. Abre una terminal en VS Code. Ejecuta `pwd`.
2. Ejecuta `ls`. Lee los nombres que aparecen.
3. Ejecuta `mkdir projects`.
4. Ejecuta `cd projects` y luego `pwd`. Comprueba que la ruta termina en `projects`.
5. Ejecuta `cd ..` y luego `pwd`. Comprueba que volviste arriba.
6. Escribe `cd pro`, presiona Tab y mira cómo se completa el nombre. Presiona Enter.
7. Presiona la flecha arriba dos veces. Mira tus comandos anteriores.
8. Ejecuta `code .` dentro de `projects`. VS Code abre la carpeta.
9. Provoca un error a propósito: ejecuta `cd nothing-here`. Lee el mensaje.

## Comprueba lo que sabes

1. ¿Qué muestra `pwd`?

<details>
<summary>Respuesta</summary>

Muestra la carpeta en la que estás ahora.

</details>

2. ¿Qué hace `cd ..`?

<details>
<summary>Respuesta</summary>

Te mueve a la carpeta superior, un nivel arriba.

</details>

3. ¿Qué es una ruta?

<details>
<summary>Respuesta</summary>

Es la dirección de un archivo o una carpeta, por ejemplo `C:\Users\you\projects`.

</details>

4. ¿Cómo detienes un comando que sigue en ejecución?

<details>
<summary>Respuesta</summary>

Presiona Ctrl+C.

</details>

5. ¿Qué hace `code .`?

<details>
<summary>Respuesta</summary>

Abre la carpeta actual en VS Code.

</details>

6. Ejecutas `pnpm dev` en `C:\Users\you` y ves un error que dice que no se encontró `package.json`. Estás seguro de que el proyecto existe. ¿Cuál es la causa más probable y qué ejecutas para comprobarlo?

<details>
<summary>Respuesta</summary>

Estás en la carpeta equivocada. pnpm busca `package.json` en la carpeta actual, y tu carpeta personal no tiene uno. Ejecuta `pwd` para ver dónde estás, luego usa `cd` para entrar a la carpeta del proyecto y prueba otra vez.

</details>

7. Ejecutas estos comandos en orden, empezando en `C:\Users\you`: `mkdir work`, `cd work`, `cd ..`, `cd work`. ¿En qué carpeta estás al final y qué dos comandos se podrían quitar sin cambiarlo?

<details>
<summary>Respuesta</summary>

Estás en `C:\Users\you\work`. Los dos comandos del medio, `cd ..` y el segundo `cd work`, se cancelan entre sí: uno sube y el otro vuelve a bajar. Quitar los dos da la misma carpeta final.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Cuál es la diferencia entre una terminal, una shell y una consola?**
   - Busca: `terminal vs shell vs console difference`
   - Una buena respuesta explica: qué significa cada palabra y por qué la gente las usa a menudo como si fueran lo mismo.

2. **¿Cuál es la diferencia entre una ruta absoluta y una ruta relativa?**
   - Busca: `absolute path vs relative path`
   - Una buena respuesta explica: cómo se escribe cada una y un ejemplo de cuándo es mejor cada una.

3. **¿Por qué los servidores de CI ejecutan los tests desde una terminal y qué significa "headless" en una ejecución de tests?**
   - Busca: `CI continuous integration run tests headless`
   - Una buena respuesta explica: qué hace CI, por qué no tiene pantalla y cómo un navegador *headless* (sin ventana) ejecuta un test sin mostrar una ventana.

## Siguiente paso

En la siguiente lección, descargarás el proyecto del curso y lo ejecutarás en tu computadora.
