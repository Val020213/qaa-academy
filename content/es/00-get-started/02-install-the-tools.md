---
title: Instalar las herramientas
summary: Instala VS Code, Node.js, Git y pnpm en Windows, comprueba que cada uno funciona y entiende cómo la terminal encuentra los programas.
duration: 75 min
---

## Empieza con un acertijo

Tu cocina tiene dos frascos. Los dos dicen "sal". Uno tiene sal vieja y húmeda. El otro tiene sal fresca. Le pides a una amiga: "Pásame la sal". Ella mira el estante de izquierda a derecha y toma el primer frasco con esa etiqueta.

Ahora piensa en tu computadora. Imagina que tiene dos programas que se llaman `node`. Uno es muy viejo. El otro es nuevo. Abres una terminal y escribes `node --version`.

¿Cuál se ejecuta? ¿Cómo podrías averiguarlo, sin adivinar? ¿Y qué cambiarías para que se ejecute el otro?

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Instalar VS Code, Node.js 24 LTS, Git para Windows y pnpm.
- Predecir qué programa se ejecuta cuando dos programas tienen el mismo nombre.
- Diagnosticar el error "is not recognized" y el error "running scripts is disabled on this system".
- Explicar por qué importa el número de versión cuando dos personas ejecutan el mismo código.

## Qué hace cada herramienta

- **VS Code** (Visual Studio Code) es el editor donde escribes código.
- **Node.js** ejecuta programas de JavaScript y TypeScript en tu computadora. Playwright lo necesita.
- **Git** guarda el historial de tus archivos y te permite compartirlos.
- **pnpm** es un gestor de paquetes. Descarga las librerías de código que necesita un proyecto.

Piensa en un taller. VS Code es el escritorio. Node.js es la máquina que hace el trabajo. Git es el cuaderno que anota cada cambio. pnpm es la persona que trae las piezas de la tienda.

Instálalas en el orden de abajo.

> **Nota:** Para cada instalador, usa el instalador oficial y acepta las opciones por defecto. Haz clic en "Next" (Siguiente) hasta el final. No necesitas cambiar nada.

## Cómo comprobar una instalación

Después de cada instalación, haz estos pasos:

1. Cierra la terminal si está abierta.
2. Abre una terminal nueva. En VS Code, usa Terminal > New Terminal.
3. Ejecuta el comando `--version` de esa herramienta.

Debes volver a abrir la terminal porque una terminal vieja no ve el programa nuevo. Pronto verás la razón real.

Un comando `--version` imprime el número de versión. Si ves un número, la herramienta funciona. Si ves "is not recognized", la instalación no terminó, o no volviste a abrir la terminal.

## 1. VS Code

Descarga el instalador de Windows desde el sitio oficial de VS Code. Ejecútalo y acepta las opciones por defecto.

Abre VS Code. Luego abre la terminal con Terminal > New Terminal. La terminal aparece en la parte de abajo de la ventana.

Compruébalo:

```bash
code --version
```

Ves tres líneas: un número de versión, un código y `x64`. Por ejemplo:

```text
1.105.0
a1b2c3d4e5f6...
x64
```

Tus números serán distintos. Está bien.

## 2. Node.js 24 LTS

Ve al sitio de Node.js, nodejs.org. Descarga el instalador de Windows para **24 LTS**. LTS significa soporte a largo plazo (*long-term support*). Es la versión estable. Ejecútalo y acepta las opciones por defecto.

Cierra y vuelve a abrir la terminal. Luego ejecuta:

```bash
node --version
```

Deberías ver una versión que empieza con 24:

```text
v24.0.0
```

Los números después del 24 pueden ser distintos.

## 3. Git para Windows

Descarga Git para Windows desde el sitio oficial de Git. Ejecuta el instalador y acepta las opciones por defecto.

Cierra y vuelve a abrir la terminal. Luego ejecuta:

```bash
git --version
```

Una salida sana se ve así:

```text
git version 2.50.0.windows.1
```

## 4. pnpm

Instalas pnpm con npm. npm es un programa que vino con Node.js. Ejecuta:

```bash
npm install -g pnpm
```

La opción `-g` significa global. El programa queda disponible en todo tu computadora.

Cierra y vuelve a abrir la terminal. Luego ejecuta:

```bash
pnpm --version
```

Ves un número de versión. El proyecto del curso usa pnpm 10, así que deberías ver un número que empieza con 10:

```text
10.33.4
```

## Problema: "running scripts is disabled on this system"

Cuando ejecutas `npm` o `pnpm`, PowerShell puede mostrar un error como este:

```text
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system.
```

Windows bloquea los *scripts* (guiones de comandos) por defecto, por seguridad. La solución es permitir los scripts que tú escribiste o que están firmados. Ejecuta este comando una sola vez:

```bash
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Este comando cambia una regla de seguridad solo para tu usuario. Permite que se ejecuten los scripts locales. Los scripts descargados deben estar firmados.

Si PowerShell pide confirmación, escribe `Y` y presiona Enter. Luego vuelve a probar tu comando.

## Extensiones de VS Code

Una extensión agrega una función a VS Code. Abre el panel de Extensions con Ctrl+Shift+X. Busca cada nombre y haz clic en Install.

| Extensión | Para qué la quieres |
| --- | --- |
| Playwright Test for VSCode | Ejecuta y depura tests de Playwright desde el editor |
| ESLint | Muestra problemas del código mientras escribes |
| Prettier | Da formato a tu código con un estilo limpio y común |
| Error Lens | Muestra los mensajes de error en la misma línea que el código |

## Cómo la terminal encuentra un programa

Cuando escribes `node`, ¿dónde busca la terminal? No busca en todo el disco. Sería demasiado lento.

Windows le da a cada terminal una lista de carpetas. Esta lista se llama **PATH**. El shell (intérprete de comandos) lee la lista del primero al último. En cada carpeta, busca un programa con el nombre que escribiste. Ejecuta el primero que encuentra y se detiene.

Esa es la regla del frasco de sal. Gana el primer frasco con la etiqueta.

### Experimento: ver la lista

Ejecuta esto en PowerShell:

```bash
$env:PATH -split ";"
```

Ves una carpeta por línea. Antes de ejecutarlo, adivina: ¿la carpeta de Node.js está cerca del principio o cerca del final de tu lista? Luego compruébalo. Busca una línea que termine en `nodejs`.

Ahora pregúntale al shell qué programas `node` puede ver:

```bash
Get-Command node -All
```

La opción `-All` muestra todas las coincidencias, no solo la primera. En la mayoría de las computadoras ves una línea. Si ves dos, la de arriba es la que se ejecuta.

### Experimento: rómpelo a propósito

Este experimento es seguro. Cambia solo la terminal en la que estás. Primero, guarda la lista real en una variable. Una **variable** es una caja con nombre que guarda un valor.

```bash
$old = $env:PATH
$env:PATH = ""
node --version
```

¿Qué esperas? Piensa primero. Ahora el shell no tiene carpetas donde buscar, así que no puede encontrar `node`. Ves un error que dice que el término `node` no se reconoce (is not recognized).

Ahora devuelve la lista:

```bash
$env:PATH = $old
node --version
```

Node vuelve a funcionar. Cambiaste la lista solo en esta terminal. Cierra la terminal y abre una nueva. La terminal nueva recibe de Windows una lista nueva y correcta.

### De vuelta al acertijo

El shell toma la primera coincidencia en el orden de PATH. Así que se ejecuta el `node` viejo si su carpeta va antes que la del nuevo. Para ver cuál se ejecuta, usa `Get-Command node -All` y lee la línea de arriba. Para que se ejecute el nuevo, instálalo de modo que su carpeta quede primero, o elimina el viejo.

Esto también explica "cierra y vuelve a abrir". Un instalador agrega su carpeta a la lista que guarda Windows. Pero una terminal que ya estaba abierta conserva su copia vieja. Una terminal nueva copia la lista nueva.

## Profundiza

### Una idea equivocada común: "Node.js es solo para sitios web"

Los principiantes ven la palabra "JavaScript" y piensan en páginas web. JavaScript se hizo para los navegadores. Pero Node.js permite que el mismo lenguaje se ejecute fuera del navegador, como un programa normal en tu computadora.

Playwright es un programa así. Se ejecuta en Node.js y controla el navegador desde afuera. Así que el código de tus tests no se ejecuta dentro de la página web. Se ejecuta en Node.js y envía comandos al navegador.

### Por qué importa el número de versión

El curso pide Node.js 24 y da las versiones exactas de las herramientas. Una versión tiene tres números, como `10.33.4`. Versiones distintas pueden comportarse distinto. Un test que pasa en tu computadora con una versión puede fallar en la computadora de un colega con otra.

En el trabajo real de automatización, esta es una causa común de "en mi máquina funciona". Los equipos escriben las versiones en `package.json` y en un archivo de bloqueo (*lock file*), para que todas las computadoras y el servidor de CI usen las mismas. CI es un servidor que ejecuta tus tests automáticamente después de cada cambio de código. Lo verás en la lección 4 de este módulo.

### Compromiso: instalación global

`npm install -g pnpm` pone pnpm en toda tu computadora. Es fácil, pero significa que todos los proyectos usan la misma versión de pnpm. Las configuraciones más nuevas dejan que cada proyecto elija su propia versión. Por ahora, la instalación global es simple y está bien.

### Usar un asistente de IA con problemas de instalación

Un asistente puede ayudarte a leer un error. Pero un comando que cambia tu sistema, como `Set-ExecutionPolicy`, necesita cuidado. Pregúntale al asistente qué hace el comando y cuál es la opción más segura. Ejecuta solo lo que puedas explicar.

## Práctica

1. Instala VS Code. Ábrelo.
2. Instala Node.js 24 LTS. Vuelve a abrir la terminal. Ejecuta `node --version`.
3. Instala Git para Windows. Vuelve a abrir la terminal. Ejecuta `git --version`.
4. Ejecuta `npm install -g pnpm`. Vuelve a abrir la terminal. Ejecuta `pnpm --version`.
5. Si ves el error "scripts is disabled", ejecuta el comando `Set-ExecutionPolicy` y repite el paso.
6. Instala las cuatro extensiones.
7. Ejecuta `$env:PATH -split ";"` y encuentra la carpeta de Node.js. Ejecuta `Get-Command node -All` y anota el resultado.

## Reto

Escribe un pequeño script de PowerShell que revise tu propia configuración y te diga qué está mal. Debe probar cuatro herramientas: `code`, `node`, `git` y `pnpm`. Un amigo debería poder ejecutarlo en una computadora nueva y saber en dos segundos qué falta.

Crea el archivo `exercises/challenges/check-tools.ps1`. Si todavía no descargaste el proyecto del curso, créalo en tu carpeta `projects`.

Está terminado cuando:

- Ejecutas `.\exercises\challenges\check-tools.ps1` e imprime una línea por cada una de las cuatro herramientas, con el nombre de la herramienta y su versión.
- Cuando una herramienta no está instalada, su línea dice `MISSING`, el script no se detiene y no muestra ningún error en rojo. Pruébalo agregando a tu lista un nombre de herramienta falso, como `banana`.
- Si la versión de Node.js no empieza con `v24`, la línea dice `WRONG VERSION`.
- La lista de nombres de herramientas está escrita una sola vez, en un solo lugar, y el script no tiene una copia del mismo código para cada herramienta.
- Si PowerShell se niega a ejecutar el archivo, puedes explicar por qué, y lo arreglaste con la opción más segura.

Vas a necesitar algo que esta lección no enseñó: cómo escribir un script de PowerShell con una lista, un bucle y una decisión, y cómo pedir un comando sin error si no existe. Busca: `powershell foreach loop array`, `powershell Get-Command ErrorAction SilentlyContinue` y `powershell if else`.

## Piénsalo bien

1. Hay dos programas llamados `node` en una computadora. La lista PATH tiene `C:\old-node` primero y `C:\Program Files\nodejs` segundo. `C:\old-node` tiene la versión 12 y el otro tiene la versión 24. Escribes `node --version`. ¿Qué ves y cuál es la forma más rápida de encontrar la razón?

<details>
<summary>Respuesta</summary>

Ves la versión 12, porque el shell toma la primera coincidencia y se detiene. La forma más rápida es `Get-Command node -All`, que lista todas las coincidencias en el orden de PATH. La primera línea es el programa que se ejecuta. Para arreglarlo, quita la carpeta vieja de PATH, o pon la carpeta nueva antes de ella. Por eso "instalé la versión nueva pero sigue corriendo la vieja" es un problema muy común.

</details>

2. Un principiante ve "running scripts is disabled on this system". Un sitio web le dice que ejecute `Set-ExecutionPolicy -Scope LocalMachine Unrestricted`. Arregla el error. ¿Por qué es una mala solución, aunque funcione?

<details>
<summary>Respuesta</summary>

El comando resuelve el problema, pero cambia más de lo necesario. `LocalMachine` cambia la regla para todos los usuarios de la computadora, y `Unrestricted` permite que se ejecute cualquier script, incluso los descargados. El comando más seguro, `-Scope CurrentUser RemoteSigned`, cambia solo tu usuario y sigue bloqueando los scripts descargados sin firma. Una solución que funciona no siempre es una buena solución. Pregunta qué más cambia la solución.

</details>

3. Puedes instalar pnpm de dos formas. Forma A: `npm install -g pnpm`, una versión para toda la computadora. Forma B: cada proyecto dice en su `package.json` qué versión de pnpm quiere. ¿Cuál es mejor para ti hoy, y qué te haría elegir la otra?

<details>
<summary>Respuesta</summary>

La forma A es más simple para un principiante, porque ejecutas un comando y funciona. La forma B es mejor cuando trabajas en varios proyectos que necesitan versiones distintas, o en un equipo que quiere que todos usen la misma. Si empiezas a ver errores que dicen "este proyecto necesita otra versión de pnpm", pasa a la forma B. La regla es empezar simple y agregar control solo cuando aparece un problema real.

</details>

4. Explícale PATH a un amigo que nunca ha usado una terminal. Usa tres oraciones. No uses la palabra "carpeta".

<details>
<summary>Respuesta</summary>

Una respuesta de ejemplo: "Cuando escribes el nombre de un programa, tu computadora necesita encontrar dónde vive. PATH es una lista de lugares donde buscar, y la computadora la lee del primero al último. Ejecuta la primera coincidencia que encuentra, y si no encuentra ninguna, dice que el nombre no se reconoce". Una buena respuesta incluye el orden y el caso de fallo. Si la respuesta no menciona el orden, no puede explicar el acertijo de los dos node.

</details>

5. Un colega nuevo instaló VS Code, pero `code --version` dice "is not recognized" en cada terminal nueva. Las otras herramientas funcionan. ¿Cuál es la causa más probable y qué haces?

<details>
<summary>Respuesta</summary>

VS Code está instalado, pero su carpeta no está en PATH. El instalador de VS Code tiene una opción llamada "Add to PATH", y viene activada por defecto. Probablemente tu colega la desactivó. La solución es ejecutar el instalador otra vez, marcar esa opción y abrir una terminal nueva. Es un buen ejemplo de un valor que falta: la herramienta existe, pero la lista no la nombra.

</details>

6. Puedes instalar Node.js con el instalador oficial, o con una herramienta que te deja cambiar entre muchas versiones. No hay una única respuesta correcta. Di de qué depende tu elección.

<details>
<summary>Respuesta</summary>

El instalador oficial es simple, y es la elección correcta si usas un proyecto y una versión. Un cambiador de versiones ayuda cuando trabajas en proyectos que necesitan versiones distintas de Node.js, porque cambias de versión con un comando. Pero agrega una herramienta nueva que aprender y una cosa más que puede fallar. La elección depende de cuántos proyectos tienes y de cuánta ayuda puedes conseguir. Para este curso, una versión es suficiente.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es la variable de entorno PATH y cómo la usa el shell para encontrar un programa?**
   - Busca: `PATH environment variable explained windows`
   - Pruébalo: Ejecuta `$env:PATH -split ";"` y cuenta las líneas. Luego ejecuta `Get-Command git` y comprueba que la carpeta que muestra es una de las líneas de la lista.
   - Una buena respuesta explica: qué guarda PATH, en qué orden lo recorre el shell y qué pasa cuando un programa no está en él.

2. **¿Qué significa el versionado semántico y qué te dicen los tres números de una versión?**
   - Busca: `semantic versioning major minor patch`
   - Pruébalo: Ejecuta `npm view pnpm version` y compara el resultado con tu propio `pnpm --version`. Decide si la diferencia es major, minor o patch, y di si crees que el cambio podría romper tu código.
   - Una buena respuesta explica: el significado de major, minor y patch, y qué cambio puede romper tu código.

3. **¿Por qué los equipos de automatización de pruebas dicen que "en mi máquina funciona" es un problema, y cómo lo reducen?**
   - Busca: `works on my machine problem consistent environments`
   - Pruébalo: Escribe un reporte corto de tu configuración: las versiones de Node.js, Git, pnpm y VS Code, y tu versión de Windows. Imagina que tienes que pegarlo en un reporte de bug. Comprueba que un desconocido podría crear la misma configuración a partir de él.
   - Una buena respuesta explica: por qué computadoras distintas dan resultados distintos y al menos dos formas de igualar los entornos, como versiones fijas o archivos de bloqueo.

## Siguiente paso

Ve a la siguiente lección para aprender la terminal, el lugar donde ejecutarás tu código.
