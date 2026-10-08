---
title: La terminal
duration: 25 min
---

## Objetivo

El curso ejecuta casi todo desde la terminal: instalar el proyecto, arrancarlo y correr los tests. Esta lección te da los pocos comandos que necesitas para moverte ahí con seguridad.

- Moverte entre carpetas con `cd` y saber siempre en cuál estás.
- Escribir una ruta absoluta o relativa.
- Leer un mensaje de error y encontrar la carpeta equivocada o el error de escritura.

## Abre la terminal en VS Code

En VS Code, haz clic en Terminal > New Terminal y elige PowerShell en el menú de la terminal. Se abre un panel en la parte de abajo con una línea que termina en `>`. Esa línea te muestra en qué carpeta estás, y a continuación escribes tu comando.

![La terminal se abre en la parte de abajo de VS Code. La captura es de VS Code en el navegador: en Windows la ruta se ve como C:\Users\you.](/images/vscode-terminal-panel.png)

```text
PS C:\Users\you>
```

`PS` significa PowerShell. Lo demás es tu carpeta actual.

Una terminal es una ventana donde escribes comandos, y PowerShell es el programa que los ejecuta en Windows. Muchas herramientas para desarrolladores no tienen botones y se manejan con comandos de texto. Un comando se puede guardar en un archivo y repetir de forma exacta, y por eso las herramientas de test funcionan así.

## Rutas

Esta ruta absoluta de Windows empieza con una letra de unidad y usa barras invertidas:

```text
C:\Users\you\projects
```

En los comandos puedes escribir la misma ruta con barras normales: `C:/Users/you/projects`. PowerShell y Node aceptan las dos, y este curso usa barras normales en los comandos.

Una **ruta absoluta** como `C:/Users/you/projects` empieza en la raíz de la unidad y significa lo mismo desde cualquier carpeta. Una **ruta relativa** empieza desde la carpeta en la que estás, como `projects` o `../other`, así que da resultados distintos según dónde estés.

![Una ruta absoluta empieza en la unidad; una relativa, en la carpeta donde estás.](/images/folder-paths.es.svg)

## Tus primeros comandos

**pwd** significa "print working directory" (imprimir el directorio de trabajo). Muestra la carpeta en la que estás ahora.

```bash
pwd
```

```text
Path
----
C:\Users\you
```

**ls** lista los archivos y carpetas que hay dentro de la carpeta actual.

```bash
ls
```

La salida es una tabla con nombres como `Documents` y `Downloads`.

**mkdir** crea una carpeta nueva:

```bash
mkdir projects
```

PowerShell imprime una tabla pequeña que confirma la carpeta nueva.

**cd** significa "change directory". Te mueve a una carpeta:

```bash
cd projects
pwd
```

```text
Path
----
C:\Users\you\projects
```

**cd ..** te sube una carpeta. Los dos puntos significan "la carpeta padre".

```bash
cd ..
pwd
```

```text
Path
----
C:\Users\you
```

> **Nota:** En las carpetas habituales de Windows, las mayúsculas no importan. `Projects` y `projects` son la misma carpeta.

Si el nombre de una carpeta tiene un espacio, ponlo entre comillas. Sin ellas, PowerShell lee dos palabras:

```bash
mkdir "my pets"
cd my pets
```

El `cd` falla con un error sobre un argumento de más, porque ve `my` y `pets` por separado. Con comillas funciona:

```bash
cd "my pets"
```

> **Cuidado:** Un comando como `rm` puede borrar archivos sin preguntar y sin pasar por la papelera de reciclaje. Lee cada comando antes de ejecutarlo, sobre todo si lo copiaste de una página web o te lo dio un asistente de IA.

## Lee la salida

Lee siempre lo que imprime un comando. Si funciona, a menudo no imprime nada o imprime un resultado corto. Si falla, busca el mensaje de error.

Desde tu carpeta de usuario, este comando falla si la carpeta no existe:

```bash
cd missing-folder
```

```text
cd : Cannot find path 'C:\Users\you\missing-folder' because it does not exist.
```

El mensaje nombra la ruta que no encontró. O escribiste mal el nombre, o no estás en la carpeta que creías. El mismo comando da resultados distintos en carpetas distintas, porque una ruta relativa parte de la carpeta actual. Cuando el resultado sea raro, ejecuta `pwd` y `ls` antes de cambiar nada.

## Teclas que ahorran tiempo

- **Tab** completa un nombre. Si `projects` está en la carpeta actual, escribe `cd pro` y presiona Tab para completar el nombre. Úsala siempre, porque ahorra escritura y evita errores de tecleo.
- **Flecha arriba** trae de vuelta tu último comando. Presiónala otra vez para ir más atrás.
- **Ctrl+C** detiene un comando que todavía se está ejecutando. La usarás para detener el sitio del curso.

## Abre una carpeta en VS Code

El comando `code .` abre la carpeta actual en VS Code. El punto significa "esta carpeta". Ejecuta este ejemplo desde tu carpeta de usuario:

```bash
cd projects
code .
```

VS Code muestra la carpeta; puede usar una ventana nueva o una existente. Esta es la forma habitual de empezar a trabajar en un proyecto.

## Práctica

Desde tu carpeta de usuario, crea la carpeta `projects` si todavía no existe, entra en ella, comprueba con `pwd` que la ruta termina en `projects` y ábrela con `code .`. La siguiente lección usa esta carpeta.

## Piénsalo bien

1. Empiezas en `C:\Users\you`. Ejecutas: `mkdir zoo`, `cd zoo`, `mkdir cat`, `cd cat`, `cd ../..`, `mkdir dog`, `cd dog`, `pwd`. ¿Qué imprime el último comando y dónde está la carpeta `cat`?

<details>
<summary>Respuesta</summary>

Imprime `C:\Users\you\dog`. El comando `cd ../..` sube dos niveles, de `cat` a `zoo` y luego a `you`. Así que `dog` se crea junto a `zoo`, no dentro. La carpeta `cat` está en `C:\Users\you\zoo\cat`. Un error común es pensar que todavía estás dentro de `zoo`. Escribir la ruta después de cada comando lo detecta.

</details>

2. Una estudiante ejecuta `mkdir shop-tests`, luego `code .`, y espera que VS Code abra `shop-tests`. VS Code se abre, sin error, pero muestra los archivos equivocados. ¿Cuál es el bug y cuál es la solución?

<details>
<summary>Respuesta</summary>

El comando `mkdir` crea una carpeta pero no entra en ella. El punto de `code .` significa la carpeta actual, así que VS Code abre la carpeta donde ella estaba. La solución es `cd shop-tests` antes de `code .`, o `code shop-tests`. Todos los comandos funcionaron: lo que falló fue la suposición de que `mkdir` te lleva a la carpeta nueva.

</details>

## Siguiente paso

En la siguiente lección, descargarás el proyecto del curso y lo ejecutarás en tu computadora.
