---
title: La terminal
summary: Aprende qué es una terminal, cómo funcionan las rutas y los pocos comandos de PowerShell que necesitas cada día.
duration: 70 min
---

## Empieza con un acertijo

Abres VS Code. Divides la terminal en dos paneles, uno al lado del otro. Los dos muestran el mismo *prompt* (indicador):

```text
PS C:\Users\you>
```

En el panel de la izquierda, ejecutas `mkdir zoo` y luego `cd zoo`. Después haces clic en el panel de la derecha y ejecutas `pwd`.

¿Qué carpeta muestra el panel de la derecha? ¿Es `C:\Users\you\zoo`, porque el panel de la izquierda acaba de moverse? ¿O es `C:\Users\you`? Y si el panel de la derecha es diferente, ¿qué te dice eso sobre lo que realmente es una terminal?

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Predecir en qué carpeta estás después de una serie de comandos `cd`.
- Explicar qué es una ruta y leerla de izquierda a derecha.
- Decidir cuándo una ruta debe ser absoluta y cuándo relativa.
- Leer un mensaje de error y encontrar la carpeta equivocada o el error de escritura.

## ¿Qué es una terminal?

Una **terminal** es una ventana donde escribes comandos. La computadora lee cada comando, lo ejecuta e imprime un resultado.

Usas una terminal porque muchas herramientas para desarrolladores no tienen botones. Las ejecutas con comandos de texto.

La terminal ejecuta un **shell** (intérprete de comandos). Un shell es el programa que entiende tus comandos. En Windows, el shell que usas es **PowerShell**.

## Abre la terminal en VS Code

1. Abre VS Code.
2. Haz clic en Terminal > New Terminal en el menú de arriba.
3. Se abre un panel en la parte de abajo.

Ves una línea que termina con `>`. Este es el **prompt**. Te muestra dónde estás y espera tu comando.

```text
PS C:\Users\you>
```

`PS` significa PowerShell. Lo demás es tu carpeta actual.

### De vuelta al acertijo

Cada panel de terminal es su propio shell, y cada shell tiene su propia carpeta actual. Piensa en dos personas en un edificio grande. Mover a una persona al cuarto 12 no mueve a la otra. El panel de la derecha sigue mostrando `C:\Users\you`. El comando `mkdir zoo` sí creó la carpeta, así que verías `zoo` con `ls` en los dos paneles. Pero solo el shell de la izquierda entró en ella.

Puedes comprobarlo. Haz clic en el botón de dividir, arriba a la derecha del panel de la terminal. Ejecuta `cd` en un panel y `pwd` en el otro.

## ¿Qué es una ruta?

Una **ruta** (*path*) es la dirección de un archivo o carpeta en tu computadora.

Piensa en una dirección postal: país, ciudad, calle, número de casa. La lees del lugar más grande al más pequeño. Una ruta funciona igual. Una biblioteca es otra buena imagen: edificio, piso, estante, libro.

En Windows, una ruta empieza con una letra de unidad y usa barras invertidas:

```text
C:\Users\you\projects
```

Léela de izquierda a derecha. Unidad `C:`, luego la carpeta `Users`, luego la carpeta `you`, luego la carpeta `projects`.

En los comandos, puedes escribir la misma ruta con barras normales: `C:/Users/you/projects`. PowerShell y Node aceptan las dos. Este curso usa barras normales en los comandos.

### Dos formas de escribir una dirección

Puedes dar una dirección postal completa: "España, Madrid, Calle Mayor 5". O puedes decir "la casa de al lado de la mía". La primera forma es igual desde cualquier lugar. La segunda depende de dónde estás parado.

Las rutas tienen las mismas dos formas. Una **ruta absoluta** empieza en la unidad, como `C:/Users/you/projects`. Una **ruta relativa** empieza desde la carpeta en la que estás ahora, como `projects` o `../other`. Una ruta relativa da resultados distintos en lugares distintos.

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

**cd** significa "change directory" (cambiar de directorio). Te mueve a una carpeta:

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

> **Nota:** Las mayúsculas no importan en las rutas de PowerShell. `Projects` y `projects` son la misma carpeta.

## Experimento: predice la carpeta

Aquí hay un zoológico pequeño. Predice el resultado antes de ejecutarlo. Empieza en `projects`.

```bash
mkdir zoo
cd zoo
mkdir cat
cd cat
cd ../..
pwd
```

¿En qué carpeta estás? Piensa. Cada `cd` es un movimiento. Escribe en papel la ruta después de cada comando. El comando `cd ../..` significa "sube una, y luego sube una más". Después ejecútalo y compara.

Ahora un segundo experimento. Crea una carpeta cuyo nombre tenga un espacio e intenta entrar en ella:

```bash
mkdir "my pets"
cd my pets
```

¿Qué esperas? El shell ve dos palabras, `my` y `pets`, y el comando solo acepta una. Obtienes un error sobre un argumento de más. Pon el nombre entre comillas y funciona:

```bash
cd "my pets"
```

Una computadora separa el texto en los espacios. Las comillas le dicen "esto es una sola pieza".

## Lee la salida

Cuando ejecutas un comando, lee siempre lo que imprime. Si un comando funciona, a menudo no imprime nada, o imprime un resultado corto. Si falla, imprime un error en rojo.

Aquí hay un error por una carpeta que no existe:

```bash
cd missing-folder
```

```text
cd : Cannot find path 'C:\Users\you\missing-folder' because it does not exist.
```

El mensaje te dice el problema. Te equivocaste al escribir, o estás en la carpeta equivocada. Ejecuta `pwd` y `ls` para comprobarlo.

Depura como un científico. Haz una hipótesis ("estoy en la carpeta equivocada"). Haz un experimento pequeño (`pwd`). Luego cambia una sola cosa. No cambies tres cosas a la vez, porque entonces no sabes cuál ayudó.

## Teclas que ahorran tiempo

- **Tab** completa un nombre. Escribe `cd pro` y presiona Tab. PowerShell escribe `projects`.
- **Flecha arriba** trae de vuelta tu último comando. Presiónala otra vez para ir más atrás.
- **Ctrl+C** detiene un comando que todavía se está ejecutando. La usarás para detener el sitio del curso.

> **Consejo:** Usa Tab todo el tiempo. Ahorra escritura y evita errores de tecleo.

## Abre una carpeta en VS Code

El comando `code .` abre la carpeta actual en VS Code. El punto significa "esta carpeta".

```bash
cd projects
code .
```

VS Code abre una ventana nueva que muestra la carpeta. Esta es la forma habitual de empezar a trabajar en un proyecto.

## Profundiza

### Por qué existe la terminal: el texto es fácil de repetir

Un botón necesita que una persona le haga clic. Un comando de texto se puede guardar en un archivo, compartir y volver a ejecutar con un programa. Por eso las herramientas de test usan comandos: una computadora puede ejecutar `pnpm e2e` de noche, sin nadie presente.

Es la misma razón por la que quieres tests automatizados. Un paso escrito como texto se puede repetir de forma exacta.

### Una idea equivocada común: "La terminal es otra computadora"

Los principiantes a menudo creen que los comandos cambian algo lejano. No es así. Una terminal se ejecuta en tu propia computadora, y cada comando trabaja desde una **carpeta actual**. El prompt muestra esa carpeta.

Por eso el mismo comando puede dar resultados distintos en lugares distintos. Compara:

```bash
cd projects
ls
cd ..
ls
```

Los dos comandos `ls` muestran archivos distintos, porque estás en carpetas distintas. Muchos errores de principiante, como "cannot find path", vienen de ejecutar un comando en la carpeta equivocada. Antes de depurar, ejecuta `pwd`.

### Cómo aparece en el trabajo real de automatización

Ejecutarás los comandos de test desde la carpeta del proyecto, no desde cualquier carpeta. Si ejecutas `pnpm e2e` en tu carpeta personal, pnpm no encuentra `package.json` y falla. El test estaba bien. El lugar era el equivocado.

Un segundo ejemplo es CI, un servidor que ejecuta tus tests después de cada cambio de código. CI no tiene ratón. Empieza en una carpeta y ejecuta los mismos comandos de texto que tú escribes. Si tus tests solo funcionan con clics en una ventana, no pueden ejecutarse ahí.

### Por qué puedes copiar un comando pero igual debes entenderlo

Un comando puede borrar archivos. En PowerShell, `rm` elimina un archivo y no pregunta. No hay papelera de reciclaje para eso. Lee cada comando antes de ejecutarlo, sobre todo uno de internet.

> **Cuidado:** Nunca ejecutes un comando que no entiendes solo porque una página web lo dice. Esta también es la regla para un asistente de IA: puedes pedirle un comando, pero debes poder explicarlo antes de ejecutarlo.

## Práctica

1. Abre una terminal en VS Code. Ejecuta `pwd`.
2. Ejecuta `ls`. Lee los nombres que aparecen.
3. Ejecuta `mkdir projects`.
4. Ejecuta `cd projects` y luego `pwd`. Comprueba que la ruta termina en `projects`.
5. Ejecuta `cd ..` y luego `pwd`. Comprueba que volviste a subir.
6. Escribe `cd pro`, presiona Tab y mira cómo se completa el nombre. Presiona Enter.
7. Presiona la flecha arriba dos veces. Mira tus comandos anteriores.
8. Ejecuta `code .` dentro de `projects`. VS Code abre la carpeta.
9. Haz un error a propósito: ejecuta `cd nothing-here`. Lee el mensaje.

## Reto

Construye un pequeño árbol de carpetas usando solo comandos, luego muéstralo con un solo comando y después bórralo con un solo comando. Elige tu propio mundo: un refugio de mascotas (gatos, perros, cuartos), una colección de música (artistas, álbumes), una liga de fútbol (equipos, jugadores) o un libro de recetas.

Construye el árbol dentro de `projects/challenge-terminal/world`. Junto a él, crea el archivo `projects/challenge-terminal/commands.txt` y escribe en él, en orden, cada comando que usaste.

Está terminado cuando:

- El árbol tiene al menos 6 carpetas y al menos 3 niveles de profundidad, y el nombre de una carpeta contiene un espacio.
- Creas al menos un archivo dentro del árbol con un comando, no con el ratón.
- Un comando, ejecutado desde la carpeta de arriba del árbol, lista cada carpeta y archivo que hay dentro, incluidos los que están muy adentro.
- Te mueves entre las carpetas profundas usando solo rutas relativas, y `pwd` al final muestra la carpeta que planeaste.
- Eliminas todo el árbol con un solo comando, y `ls` muestra que `world` ya no está, mientras que `commands.txt` sigue ahí.

Vas a necesitar algo que esta lección no enseñó: cómo crear un archivo vacío, cómo listar carpetas dentro de carpetas y cómo borrar una carpeta con todo lo que tiene dentro. Busca: `powershell New-Item ItemType File`, `powershell ls Recurse` y `powershell Remove-Item Recurse`.

> **Cuidado:** Antes de borrar, ejecuta `pwd` y lee la ruta. Un comando de borrado en la carpeta equivocada no se puede deshacer.

## Piénsalo bien

1. Empiezas en `C:\Users\you`. Ejecutas: `mkdir zoo`, `cd zoo`, `mkdir cat`, `cd cat`, `cd ../..`, `mkdir dog`, `cd dog`, `pwd`. ¿Qué imprime el último comando y dónde está la carpeta `cat`?

<details>
<summary>Respuesta</summary>

Imprime `C:\Users\you\dog`. El comando `cd ../..` sube dos niveles, de `cat` a `zoo` y luego a `you`. Así que `dog` se crea junto a `zoo`, no dentro. La carpeta `cat` está en `C:\Users\you\zoo\cat`. Un error común es pensar que todavía estás dentro de `zoo`. Escribir la ruta después de cada comando lo detecta.

</details>

2. Una estudiante ejecuta `mkdir shop-tests`, luego `code .`, y espera que VS Code abra `shop-tests`. VS Code se abre, sin error, pero muestra los archivos equivocados. ¿Cuál es el bug y cuál es la solución?

<details>
<summary>Respuesta</summary>

El comando `mkdir` crea una carpeta pero no entra en ella. El punto de `code .` significa la carpeta actual, así que VS Code abre la carpeta donde ella estaba. La solución es `cd shop-tests` antes de `code .`, o `code shop-tests`. Todos los comandos funcionaron. La suposición "mkdir me lleva ahí" era incorrecta. Cuando el resultado es raro y no hay error, comprueba dónde estás con `pwd`.

</details>

3. Cada mañana quieres empezar a trabajar en tu proyecto. Forma A: en VS Code, usa File > Open Folder y haz clic por las carpetas. Forma B: en una terminal, ejecuta `cd projects/qaa` y luego `code .`. ¿Cuál es mejor y qué te haría elegir la otra?

<details>
<summary>Respuesta</summary>

La forma A no necesita comandos, así que es buena mientras aprendes la terminal. La forma B es más rápida, y puedes anotarla una vez y repetirla de forma exacta. Elige B cuando haces los mismos pasos todos los días, o cuando debes escribir pasos para un compañero. Elige A cuando el ratón es más rápido para ti, por ejemplo cuando la carpeta está muy lejos y no recuerdas su ruta. La mejor respuesta es la que de verdad vas a usar todos los días.

</details>

4. Un compañero dice: "Nuestros tests preguntan '¿Seguro? (Y/N)' antes de cada paso. Es solo una tecla". ¿Qué se rompe si pones una pregunta así en un comando que ejecuta CI?

<details>
<summary>Respuesta</summary>

CI no tiene una persona que presione una tecla. El comando espera una respuesta durante mucho tiempo, y luego toda la ejecución falla o se cuelga. Un comando que funciona en una terminal con una persona puede fallar en CI por esta razón. Los comandos automatizados deben ejecutarse de principio a fin sin preguntar. Es la misma razón por la que los pasos de un test deben ser exactos.

</details>

5. Estás en `C:\` y ejecutas `cd ..` cinco veces. ¿Qué esperas y por qué importa esto cuando escribes un comando que sube un número fijo de niveles?

<details>
<summary>Respuesta</summary>

Te quedas en `C:\`, porque la raíz de la unidad no tiene carpeta padre. PowerShell no muestra un error aquí. Esto importa porque un comando como `cd ../../..` solo es correcto desde un punto de partida. Desde otro lugar, termina en otra carpeta, o en la raíz sin avisarte. Las rutas relativas dependen del inicio, así que un script debe moverse primero a un lugar conocido.

</details>

6. Una página de instalación dice: "Ejecuta esta línea para instalar todo", y la línea descarga un script de internet y lo ejecuta de inmediato. ¿La ejecutarías? No hay una única respuesta correcta. Di de qué depende.

<details>
<summary>Respuesta</summary>

La línea ahorra tiempo, pero no ves lo que hace el script antes de que se ejecute. Si la fuente es una empresa conocida, y puedes leer el script antes, el riesgo es pequeño. Si la página es desconocida, el riesgo es grande, porque un script puede borrar archivos o robar datos. La decisión depende de cuánto confías en la fuente y de si puedes leer el script antes de ejecutarlo. Un hábito seguro es descargarlo, leerlo y después ejecutarlo.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Cuál es la diferencia entre una terminal, un shell y una consola?**
   - Busca: `terminal vs shell vs console difference`
   - Pruébalo: Abre PowerShell y abre también el Command Prompt (busca "cmd" en el menú Inicio, o Start). Ejecuta `pwd` en los dos. Anota qué hace cada uno y di cuál de las tres palabras describe la ventana y cuál describe el programa que hay dentro.
   - Una buena respuesta explica: qué significa cada palabra y por qué la gente a menudo las usa como si fueran lo mismo.

2. **¿Cuál es la diferencia entre una ruta absoluta y una ruta relativa, y cuándo falla una ruta relativa?**
   - Busca: `absolute path vs relative path`
   - Pruébalo: Crea una carpeta `a` con una carpeta `b` dentro. Desde `a`, entra en `b` con una ruta relativa y luego con la ruta completa. Después ve a tu carpeta personal e intenta la misma ruta relativa. Lee el error.
   - Una buena respuesta explica: cómo se escribe cada una y un ejemplo de cuándo es mejor cada una.

3. **¿Cómo le dice un comando a quien lo llamó que funcionó o falló, y por qué lo necesita CI?**
   - Busca: `exit code 0 success powershell LASTEXITCODE`
   - Pruébalo: Ejecuta `node --version` y luego ejecuta `$LASTEXITCODE`. Después ejecuta `node does-not-exist.js` y ejecuta `$LASTEXITCODE` otra vez. Compara los dos números.
   - Una buena respuesta explica: qué es un código de salida (*exit code*), qué significa el número 0 y cómo usa un servidor de CI ese número para marcar una ejecución como aprobada o fallida.

## Siguiente paso

En la siguiente lección, descargarás el proyecto del curso y lo ejecutarás en tu computadora.
