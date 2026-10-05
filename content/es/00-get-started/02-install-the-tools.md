---
title: Instalar las herramientas
summary: Instala VS Code, Node.js, Git y pnpm en Windows, y comprueba que cada uno funciona.
duration: 45 min
---

## Objetivo

- Instalar VS Code, Node.js 24 LTS, Git para Windows y pnpm.
- Comprobar cada herramienta con un comando `--version`.
- Resolver el error de PowerShell "running scripts is disabled on this system" (la ejecución de scripts está deshabilitada en este sistema).

## Qué hace cada herramienta

- **VS Code** (Visual Studio Code) es el editor donde escribes código.
- **Node.js** ejecuta programas de JavaScript y TypeScript en tu computadora. Playwright lo necesita.
- **Git** guarda el historial de tus archivos y te permite compartirlos.
- **pnpm** es un administrador de paquetes. Descarga las bibliotecas de código que necesita un proyecto.

Instálalas en el orden de abajo.

> **Nota:** En cada caso, usa el instalador oficial y acepta las opciones por defecto. Haz clic en "Next" (siguiente) hasta el final. No necesitas cambiar nada.

## Cómo comprobar una instalación

Después de cada instalación, sigue estos pasos:

1. Cierra la terminal si está abierta.
2. Abre una terminal nueva. En VS Code, usa Terminal > New Terminal.
3. Ejecuta el comando `--version` de esa herramienta.

Debes volver a abrir la terminal porque una terminal vieja no ve el programa nuevo.

Un comando `--version` imprime el número de versión. Si ves un número, la herramienta funciona. Si ves "is not recognized" (no se reconoce), la instalación no terminó o no volviste a abrir la terminal.

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

Tus números serán distintos. No pasa nada.

## 2. Node.js 24 LTS

Ve al sitio de Node.js, nodejs.org. Descarga el instalador de Windows de **24 LTS**. LTS significa soporte a largo plazo (*long-term support*). Es la versión estable. Ejecútalo y acepta las opciones por defecto.

Cierra y vuelve a abrir la terminal. Luego ejecuta:

```bash
node --version
```

Debes ver una versión que empieza con 24:

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

Una salida correcta se ve así:

```text
git version 2.50.0.windows.1
```

## 4. pnpm

Instalas pnpm con npm. npm es un programa que vino con Node.js. Ejecuta:

```bash
npm install -g pnpm
```

La opción `-g` significa global. El programa queda disponible en toda tu computadora.

Cierra y vuelve a abrir la terminal. Luego ejecuta:

```bash
pnpm --version
```

Ves un número de versión:

```text
10.0.0
```

## Problema: "running scripts is disabled on this system"

Cuando ejecutas `npm` o `pnpm`, PowerShell puede mostrar un error como este:

```text
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system.
```

Windows bloquea los *scripts* (archivos de comandos) por defecto, por seguridad. La solución es permitir los scripts que tú escribiste o que están firmados. Ejecuta este comando una sola vez:

```bash
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Este comando cambia una regla de seguridad solo para tu usuario. Permite que se ejecuten los scripts locales. Los scripts descargados deben estar firmados.

Si PowerShell pide confirmación, escribe `Y` y presiona Enter. Luego vuelve a probar tu comando.

## Extensiones de VS Code

Una extensión agrega una función a VS Code. Abre el panel Extensions (extensiones) con Ctrl+Shift+X. Busca cada nombre y haz clic en Install (instalar).

| Extensión | Para qué la quieres |
| --- | --- |
| Playwright Test for VSCode | Ejecuta y depura tests de Playwright desde el editor |
| ESLint | Muestra problemas del código mientras escribes |
| Prettier | Da formato a tu código con un estilo limpio y común |
| Error Lens | Muestra los mensajes de error en la misma línea del código |

## Profundiza

### Por qué debes volver a abrir la terminal

Cuando Windows inicia una terminal, le da una lista de carpetas. Esta lista se llama **PATH**. Cuando escribes `node`, la shell busca un programa llamado `node` en cada carpeta de PATH, en orden.

Un instalador agrega su carpeta a PATH. Pero una terminal que ya estaba abierta conserva su copia vieja de la lista. Una terminal nueva recibe la lista nueva. Esta es la razón real detrás de "cierra y vuelve a abrir".

Puedes ver la lista en PowerShell:

```bash
$env:PATH -split ";"
```

Verás una carpeta en cada línea. Busca la carpeta de Node.js después de la instalación.

### Una idea equivocada común: "Node.js es solo para sitios web"

Los principiantes ven la palabra "JavaScript" y piensan en páginas web. JavaScript se creó para los navegadores. Pero Node.js permite que el mismo lenguaje funcione fuera del navegador, como un programa normal en tu computadora.

Playwright es un programa así. Se ejecuta en Node.js y controla el navegador desde afuera. Entonces el código de tus tests no se ejecuta dentro de la página web. Se ejecuta en Node.js y envía comandos al navegador.

### Por qué importa el número de versión

El curso pide Node.js 24 y da versiones exactas de las herramientas. Una versión tiene tres números, como `10.33.4`. Versiones distintas pueden comportarse de forma distinta. Un test que pasa en tu computadora con una versión puede fallar en la computadora de una colega con otra.

En el trabajo real de automatización QA, esta es una causa común de "en mi máquina funciona". Los equipos escriben las versiones en `package.json` y en un archivo de bloqueo (*lock file*), para que todas las computadoras y el servidor de CI usen las mismas. CI es un servidor que ejecuta tus tests automáticamente después de cada cambio de código. Lo verás en la lección 4 de este módulo.

### Compromiso: la instalación global

`npm install -g pnpm` pone pnpm en toda tu computadora. Esto es fácil, pero significa que todos los proyectos usan la misma versión de pnpm. Las configuraciones más nuevas permiten que cada proyecto elija su propia versión. Por ahora, la instalación global es simple y suficiente.

## Práctica

1. Instala VS Code. Ábrelo.
2. Instala Node.js 24 LTS. Vuelve a abrir la terminal. Ejecuta `node --version`.
3. Instala Git para Windows. Vuelve a abrir la terminal. Ejecuta `git --version`.
4. Ejecuta `npm install -g pnpm`. Vuelve a abrir la terminal. Ejecuta `pnpm --version`.
5. Si ves el error "scripts is disabled", ejecuta el comando `Set-ExecutionPolicy` y repite el paso.
6. Instala las cuatro extensiones.

## Comprueba lo que sabes

1. ¿Por qué vuelves a abrir la terminal después de una instalación?

<details>
<summary>Respuesta</summary>

Una terminal vieja no conoce el programa nuevo. Una terminal nueva sí.

</details>

2. ¿Qué comando muestra la versión de Node.js?

<details>
<summary>Respuesta</summary>

`node --version`

</details>

3. ¿Qué haces cuando PowerShell dice "running scripts is disabled on this system"?

<details>
<summary>Respuesta</summary>

Ejecuta `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` y luego vuelve a ejecutar tu comando.

</details>

4. ¿Qué hace pnpm?

<details>
<summary>Respuesta</summary>

Descarga las bibliotecas de código que necesita un proyecto.

</details>

5. Instalas Git y ejecutas `git --version` en la terminal que ya estaba abierta. Ves "is not recognized". Cierras VS Code, lo abres otra vez y ejecutas el comando de nuevo. Funciona. ¿Qué pasó y por qué?

<details>
<summary>Respuesta</summary>

La terminal vieja tenía una copia de PATH de antes de la instalación, así que no podía encontrar Git. Cuando abriste VS Code otra vez, la terminal nueva recibió el PATH nuevo, y la shell encontró Git. La instalación estuvo bien desde el principio.

</details>

6. Una colega ejecuta los mismos tests que tú, con el mismo código. Tus tests pasan. Los de ella fallan. Nombra dos cosas sobre las herramientas que compararías primero y di por qué.

<details>
<summary>Respuesta</summary>

Compara la versión de Node.js y las versiones de las bibliotecas del proyecto, como Playwright. Versiones distintas pueden cambiar cómo se comporta el mismo código. Revisar esto primero es barato y descarta una causa común antes de mirar el test en sí.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es la variable de entorno PATH y cómo la usa la shell para encontrar un programa?**
   - Busca: `PATH environment variable explained windows`
   - Una buena respuesta explica: qué contiene PATH, en qué orden la recorre la shell y qué pasa cuando un programa no está en ella.

2. **¿Qué significa el versionado semántico y qué te dicen los tres números de una versión?**
   - Busca: `semantic versioning major minor patch`
   - Una buena respuesta explica: el significado de major, minor y patch, y qué cambio puede romper tu código.

3. **¿Por qué los equipos de automatización de tests dicen que "en mi máquina funciona" es un problema y cómo lo reducen?**
   - Busca: `works on my machine problem consistent environments`
   - Una buena respuesta explica: por qué computadoras distintas dan resultados distintos y al menos dos formas de igualar los entornos, como versiones fijas o archivos de bloqueo.

## Siguiente paso

Ve a la siguiente lección para aprender la terminal, el lugar donde ejecutarás tu código.
