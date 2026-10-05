---
title: La terminal
summary: Aprende qué es una terminal y los pocos comandos de PowerShell que necesitas cada día.
duration: 25 min
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

## Siguiente paso

En la siguiente lección, descargarás el proyecto del curso y lo ejecutarás en tu computadora.
