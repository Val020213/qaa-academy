---
title: Instalar las herramientas
summary: Instala VS Code, Node.js, Git y pnpm en Windows, y comprueba que cada uno funciona.
duration: 30 min
---

## Objetivo

- Instalar VS Code, Node.js 24 LTS, Git para Windows y pnpm.
- Comprobar cada herramienta con un comando `--version`.
- Resolver el error de PowerShell "running scripts is disabled on this system".

## Qué hace cada herramienta

- **VS Code** (Visual Studio Code) es el editor donde escribes código.
- **Node.js** ejecuta programas de JavaScript y TypeScript en tu computadora. Playwright lo necesita.
- **Git** guarda el historial de tus archivos y te permite compartirlos.
- **pnpm** es un administrador de paquetes. Descarga las bibliotecas de código que necesita un proyecto.

Instálalas en el orden de abajo.

> **Nota:** En cada instalador, usa el instalador oficial y acepta las opciones por defecto. Haz clic en "Next" (siguiente) hasta el final. No necesitas cambiar nada.

## Cómo comprobar una instalación

Después de cada instalación, sigue estos pasos:

1. Cierra la terminal si está abierta.
2. Abre una terminal nueva. En VS Code, usa Terminal > New Terminal.
3. Ejecuta el comando `--version` de esa herramienta.

Debes volver a abrir la terminal porque una terminal vieja no ve el programa nuevo.

Un comando `--version` imprime el número de versión. Si ves un número, la herramienta funciona. Si ves "is not recognized", la instalación no terminó o no volviste a abrir la terminal.

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

Windows bloquea los scripts por defecto, por seguridad. La solución es permitir los scripts que tú escribiste o que están firmados. Ejecuta este comando una sola vez:

```bash
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Este comando cambia una regla de seguridad solo para tu usuario. Permite que se ejecuten los scripts locales. Los scripts descargados deben estar firmados.

Si PowerShell pide confirmación, escribe `Y` y presiona Enter. Luego vuelve a probar tu comando.

## Extensiones de VS Code

Una extensión agrega una función a VS Code. Abre el panel Extensions con Ctrl+Shift+X. Busca cada nombre y haz clic en Install (instalar).

| Extensión | Para qué la quieres |
| --- | --- |
| Playwright Test for VSCode | Ejecuta y depura tests de Playwright desde el editor |
| ESLint | Muestra problemas del código mientras escribes |
| Prettier | Da formato a tu código con un estilo limpio y común |
| Error Lens | Muestra los mensajes de error en la misma línea del código |

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

## Siguiente paso

Ve a la siguiente lección para aprender la terminal, el lugar donde ejecutarás tu código.
