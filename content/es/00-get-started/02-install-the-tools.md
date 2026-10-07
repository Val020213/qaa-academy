---
title: Instalar las herramientas
duration: 25 min
---

## Objetivo

Al terminar esta lección tendrás en tu computadora con Windows el editor, el entorno y las herramientas que usa el resto del curso. También sabrás qué hacer cuando la terminal no encuentra un programa.

- Instalar VS Code, Node.js 24 LTS, Git para Windows y pnpm.
- Diagnosticar el error "is not recognized" y el error "running scripts is disabled on this system".
- Explicar por qué importa el número de versión cuando dos personas ejecutan el mismo código.

## Qué hace cada herramienta

- **VS Code** (Visual Studio Code) es el editor donde escribes código.
- **Node.js** ejecuta programas de JavaScript y TypeScript en tu computadora. Playwright lo necesita.
- **Git** guarda el historial de tus archivos y te permite compartirlos.
- **pnpm** es un gestor de paquetes. Descarga las librerías de código que necesita un proyecto.

Instálalas en el orden de abajo. Para cada una, usa el instalador oficial y acepta las opciones por defecto: haz clic en "Next" hasta el final.

## Cómo comprobar una instalación

Después de instalar cada herramienta, cierra la terminal y abre una nueva. En VS Code, usa Terminal > New Terminal. Luego ejecuta el comando `--version` de esa herramienta.

Una terminal que ya estaba abierta no ve los programas que instalaste después de abrirla. El comando `--version` imprime el número de versión. Si ves un número, la herramienta funciona. Si ves "is not recognized", la instalación no terminó o la terminal que usas es vieja.

## 1. VS Code

Descarga el instalador de Windows desde el sitio oficial de VS Code. Ejecútalo y acepta las opciones por defecto.

Abre VS Code y luego la terminal con Terminal > New Terminal. Aparece en la parte de abajo de la ventana. Ejecuta:

```bash
code --version
```

Ves tres líneas: un número de versión, un código y `x64`. Por ejemplo:

```text
1.105.0
a1b2c3d4e5f6...
x64
```

Tus números serán distintos, y está bien.

## 2. Node.js 24 LTS

Ve al sitio de Node.js, nodejs.org, y descarga el instalador de Windows para **24 LTS**. LTS significa soporte a largo plazo (*long-term support*): es la versión estable. Ejecútalo y acepta las opciones por defecto.

Con una terminal nueva, ejecuta:

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

Con una terminal nueva, ejecuta:

```bash
git --version
```

Una salida sana se ve así:

```text
git version 2.50.0.windows.1
```

## 4. pnpm

pnpm se instala con npm, un programa que vino con Node.js. Ejecuta:

```bash
npm install -g pnpm
```

La opción `-g` significa global: pnpm queda disponible en toda tu computadora.

Con una terminal nueva, ejecuta:

```bash
pnpm --version
```

El proyecto del curso usa pnpm 10, así que el número debe empezar con 10:

```text
10.33.4
```

## Problema: "running scripts is disabled on this system"

Cuando ejecutas `npm` o `pnpm`, PowerShell puede mostrar un error como este:

```text
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system.
```

Windows bloquea los scripts por defecto, por seguridad. La solución es permitir los scripts que tú escribiste o que están firmados. Ejecuta este comando una sola vez:

```bash
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

El comando cambia una regla de seguridad solo para tu usuario. Los scripts locales pueden ejecutarse, y los descargados deben estar firmados.

Si PowerShell pide confirmación, escribe `Y` y presiona Enter. Luego vuelve a probar tu comando.

## Extensiones de VS Code

Abre el panel de Extensions con Ctrl+Shift+X. Busca cada nombre y haz clic en Install.

| Extensión | Para qué la quieres |
| --- | --- |
| Playwright Test for VSCode | Ejecuta y depura tests de Playwright desde el editor |
| ESLint | Muestra problemas del código mientras escribes |
| Prettier | Da formato a tu código con un estilo limpio y común |
| Error Lens | Muestra los mensajes de error en la misma línea que el código |

## Profundiza

### Node.js no es solo para sitios web

JavaScript se hizo para los navegadores, y por eso mucha gente lo asocia con páginas web. Node.js permite que el mismo lenguaje se ejecute fuera del navegador, como un programa normal en tu computadora.

Playwright es uno de esos programas. Se ejecuta en Node.js y controla el navegador desde afuera, así que el código de tus tests no corre dentro de la página: corre en Node.js y envía comandos al navegador.

### Por qué importa el número de versión

El curso pide Node.js 24 y da las versiones exactas de las herramientas. Una versión tiene tres números, como `10.33.4`, y versiones distintas pueden comportarse distinto. Un test que pasa en tu computadora puede fallar en la de un colega que tiene otra versión.

Es una causa común de "en mi máquina funciona". Los equipos escriben las versiones en `package.json` y en un archivo de bloqueo (*lock file*), para que todas las computadoras y el servidor de CI usen las mismas. CI (integración continua, *continuous integration*) es la práctica de integrar los cambios de todo el equipo varias veces al día y verificar cada uno de forma automática: un servidor instala el proyecto desde cero, lo compila y ejecuta las comprobaciones y los tests antes de aceptar el cambio.

### La versión de pnpm de cada proyecto

`npm install -g pnpm` instala un solo pnpm para toda tu computadora. Aun así, un proyecto puede pedir una versión exacta en el campo `packageManager` de su `package.json`, y pnpm 10 descarga y usa esa versión cuando trabajas dentro de ese proyecto. El proyecto del curso lo hace, así que la versión que instalaste aquí no tiene que coincidir con la suya.

## Práctica

Abre una terminal nueva y ejecuta los cuatro comandos:

```bash
code --version
node --version
git --version
pnpm --version
```

Debes ver cuatro números de versión, y el de Node.js debe empezar con 24. Si alguno dice "is not recognized", revisa esa instalación. Si `npm` o `pnpm` muestran el error de scripts, ejecuta el comando `Set-ExecutionPolicy` y repite.

![Una terminal sana: cada comando responde con un número de versión.](/images/terminal-versions.png)

## Piénsalo bien

1. Un principiante ve "running scripts is disabled on this system". Un sitio web le dice que ejecute `Set-ExecutionPolicy -Scope LocalMachine Unrestricted`. Arregla el error. ¿Por qué es una mala solución, aunque funcione?

<details>
<summary>Respuesta</summary>

El comando cambia más de lo necesario. `LocalMachine` cambia la regla para todos los usuarios de la computadora, y `Unrestricted` permite que se ejecute cualquier script, incluso los descargados. El comando más seguro, `-Scope CurrentUser RemoteSigned`, cambia solo tu usuario y sigue bloqueando los scripts descargados sin firma. Antes de ejecutar una solución que encuentras en internet, pregunta qué más cambia.

</details>

## Siguiente paso

Ve a la siguiente lección para aprender la terminal, el lugar donde ejecutarás tu código.
