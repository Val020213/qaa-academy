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

Después de instalar cada herramienta, cierra las terminales y todas las ventanas de VS Code. Abre VS Code otra vez y usa Terminal > New Terminal. Luego ejecuta el comando `--version` de esa herramienta.

La terminal hereda de VS Code la configuración para encontrar programas; reiniciar ambos la actualiza. El comando `--version` imprime el número de versión. Si ves un número, el comando está disponible. Si ves "is not recognized", revisa el nombre, la instalación y el reinicio.

## 1. VS Code

Descarga el instalador de Windows desde el [sitio oficial de VS Code](https://code.visualstudio.com). Ejecútalo y acepta las opciones por defecto.

Abre VS Code y luego la terminal con Terminal > New Terminal. Aparece en la parte de abajo de la ventana. Ejecuta:

```bash
code --version
```

Ves tres líneas: la versión, el identificador de la revisión y la arquitectura, como `x64`. Por ejemplo:

```text
1.140.0
07f806f999227108933c2e30515b26eecc1fda74
x64
```

Tus números serán distintos, y está bien.

## 2. Node.js 24 LTS

Ve al sitio de Node.js, [nodejs.org](https://nodejs.org), y descarga el instalador de Windows para **24 LTS**. LTS significa soporte a largo plazo (*long-term support*): recibe correcciones durante más tiempo. Ejecútalo y acepta las opciones por defecto.

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

Descarga Git para Windows desde el [sitio oficial de Git](https://git-scm.com). Ejecuta el instalador y acepta las opciones por defecto.

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
npm install -g pnpm@10.33.4
```

La opción `-g` significa global: pnpm se instala fuera del proyecto para usarlo desde distintas carpetas.

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

La política de ejecución de PowerShell bloquea el script de npm o pnpm. Ejecuta este comando para permitir scripts locales y exigir firma a los marcados como descargados de internet:

```bash
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

El comando cambia una regla de seguridad solo para tu usuario. Los scripts locales pueden ejecutarse; los marcados como descargados de internet necesitan una firma de confianza. Una política de la empresa puede mantener el bloqueo.

Si PowerShell pide confirmación, escribe `Y` y presiona Enter. Luego vuelve a probar tu comando.

## Extensiones de VS Code

Abre el panel de Extensions con Ctrl+Shift+X. Busca cada nombre y haz clic en Install.

| Extensión | Para qué la quieres |
| --- | --- |
| Playwright Test for VSCode | Ejecuta y depura tests de Playwright desde el editor |
| ESLint | Muestra problemas del código si el proyecto configura ESLint |
| Prettier | Da formato a tu código con un estilo limpio y común |
| Error Lens | Muestra los mensajes de error en la misma línea que el código |

## Profundiza

### Node.js no es solo para sitios web

JavaScript se hizo para los navegadores, y por eso mucha gente lo asocia con páginas web. Node.js permite que el mismo lenguaje se ejecute fuera del navegador, como un programa normal en tu computadora.

Playwright es uno de esos programas. Se ejecuta en Node.js y controla el navegador desde afuera, así que el código de tus tests no corre dentro de la página: corre en Node.js y envía comandos al navegador.

### Por qué importa el número de versión

El curso pide Node.js 24 y fija algunas versiones. Una versión como `10.33.4` tiene tres números, y versiones distintas pueden comportarse distinto. Un test que pasa en tu computadora puede fallar en la de un colega que tiene otra versión.

El proyecto registra las versiones en `package.json` y en un archivo de bloqueo (*lock file*). pnpm usa ese archivo para instalar las mismas versiones de las dependencias. Node.js se instala aparte: usa la versión 24 que pide el curso.

### La versión de pnpm de cada proyecto

`npm install -g pnpm@10.33.4` instala pnpm fuera de los proyectos. Un proyecto puede pedir otra versión exacta en el campo `packageManager` de su `package.json`, y pnpm 10 la descarga y usa por defecto cuando trabajas dentro de ese proyecto. El proyecto del curso lo hace, así que la versión que instalaste aquí no tiene que coincidir con la suya.

## Práctica

Abre una terminal nueva y ejecuta los cuatro comandos:

```bash
code --version
node --version
git --version
pnpm --version
```

Debes ver cuatro números de versión, y el de Node.js debe empezar con 24. Si alguno dice "is not recognized", revisa esa instalación. Si `npm` o `pnpm` muestran el error de scripts, ejecuta el comando `Set-ExecutionPolicy` y repite.

![Node.js, Git y pnpm responden con su versión; comprueba VS Code con el comando de arriba.](/images/terminal-versions.png)

## Piénsalo bien

1. Un principiante ve "running scripts is disabled on this system". Un sitio web le dice que ejecute `Set-ExecutionPolicy -Scope LocalMachine Unrestricted`. Arregla el error. ¿Por qué es una mala solución, aunque funcione?

<details>
<summary>Respuesta</summary>

El comando cambia más de lo necesario. `LocalMachine` cambia la regla para todos los usuarios de la computadora, y `Unrestricted` permite ejecutar scripts sin firma, incluidos los descargados. El comando más seguro, `-Scope CurrentUser RemoteSigned`, cambia solo tu usuario y bloquea los scripts sin firma marcados como descargados de internet. Antes de ejecutar una solución que encuentras en internet, pregunta qué más cambia.

</details>

## Siguiente paso

Ve a la siguiente lección para aprender la terminal, el lugar donde ejecutarás tu código.
