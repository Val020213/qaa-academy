---
title: Tu primer proyecto
summary: Descarga el repositorio del curso, ejecuta el sitio del curso y entiende para qué sirve cada carpeta, archivo y script.
duration: 80 min
---

## Empieza con un acertijo

Después de `pnpm install`, tu proyecto tiene una carpeta llamada `node_modules`. Contiene decenas de miles de archivos y ocupa cientos de megabytes. Tú no escribiste ninguno.

Una tarde tu disco se llena. Borras toda la carpeta `node_modules`. No tocaste ningún archivo que tú escribiste.

¿El proyecto está roto ahora? ¿Perdiste parte de tu trabajo? Si puedes arreglarlo, ¿qué único comando lo trae todo de vuelta, y por qué ese comando sabe qué traer?

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Descargar el proyecto del curso con Git y ejecutar el sitio del curso.
- Predecir qué pasa cuando borras o cambias los archivos que administra pnpm.
- Explicar para qué sirve cada carpeta y archivo del proyecto, y cuáles puedes editar.
- Decidir cómo reaccionar cuando un puerto ya está en uso.

## Descarga el proyecto

El curso es un proyecto en un repositorio de Git. Un **repositorio** es una carpeta que Git vigila. El repositorio del curso es público en GitHub, un sitio web que guarda repositorios: https://github.com/Val020213/qaa-academy

No vas a trabajar en ese repositorio. Vas a trabajar en tu propia copia, llamada **fork**. Un *fork* (bifurcación) es una copia de un repositorio en tu propia cuenta de GitHub. Puedes cambiarla libremente, y el original queda igual.

1. Crea una cuenta gratis en github.com si no tienes una.
2. Abre el repositorio del curso en tu navegador.
3. Haz clic en **Fork**, arriba a la derecha. Luego haz clic en **Create fork**.

Ahora tienes tu propia copia en `https://github.com/<your-user>/qaa-academy`.

En la terminal, ve a la carpeta donde guardas tus proyectos. Luego ejecuta `git clone` con la dirección de tu fork. Reemplaza `<your-user>` con tu nombre de usuario de GitHub:

```bash
cd projects
git clone https://github.com/<your-user>/qaa-academy.git qaa
cd qaa
code .
```

- `git clone` descarga a tu computadora una copia de tu fork.
- `qaa` es el nombre de la carpeta nueva.
- `cd qaa` te mueve a ella.
- `code .` la abre en VS Code.

En la ventana nueva de VS Code, abre una terminal con Terminal > New Terminal. Empieza dentro de la carpeta `qaa`.

## Instala las librerías

Un proyecto usa código escrito por otras personas. Estas piezas se llaman **dependencias**. Descárgalas con:

```bash
pnpm install
```

Esto puede tardar un minuto. Crea una carpeta llamada `node_modules`.

### Una despensa y una lista de compras

Piensa en cocinar. Una tarjeta de receta dice "harina, huevos, leche". Es corta y la puedes compartir. La despensa guarda las bolsas y cajas reales. Es grande, y la puedes volver a llenar con la lista.

En un proyecto, `package.json` es la lista de compras. `node_modules` es la despensa. Un tercer archivo, `pnpm-lock.yaml`, es el recibo. Dice la marca y el tamaño exactos de cada artículo. Piensa también en una lista de reproducción de música. El archivo de la lista es pequeño, y los archivos de las canciones son grandes. Puedes volver a descargar las canciones desde la lista.

### De vuelta al acertijo

El proyecto no está roto y no perdiste nada de tu trabajo. `node_modules` es solo una copia de código que escribieron otras personas. El comando `pnpm install` lee `package.json` y `pnpm-lock.yaml`, y vuelve a llenar la carpeta con las mismas versiones.

Puedes comprobarlo. Detén cualquier sitio que esté en ejecución. Borra `node_modules` y luego ejecuta `pnpm dev`. ¿Qué esperas? Falla, porque falta la herramienta que inicia el sitio. Luego ejecuta `pnpm install` y `pnpm dev` otra vez. Funciona. Por eso `node_modules` nunca se guarda en Git.

## Ejecuta el sitio del curso

```bash
pnpm dev
```

La terminal imprime un mensaje que dice que el sitio está en ejecución. Abre esta dirección en tu navegador:

```text
http://localhost:5180
```

`localhost` significa "esta computadora". El sitio se ejecuta solo en tu máquina. Ahí lees las lecciones.

Mira cómo cambian en el sitio el tema, el idioma y la marca de lección completada.

![Cambia el sitio a oscuro, luego a español, y luego marca la lección como completada.](/clips/theme-and-language.webm)

La terminal queda ocupada mientras el sitio se ejecuta. Para detenerlo, haz clic en la terminal y presiona **Ctrl+C**.

### Experimento: dos copias a la vez

Abre un segundo panel de terminal en VS Code. Ejecuta `pnpm dev` también ahí, mientras el primero sigue en ejecución. ¿Qué esperas?

Dos programas no pueden escuchar en el mismo puerto al mismo tiempo. Un **puerto** es una puerta numerada de tu computadora. Cada programa que espera visitas usa una puerta. El sitio del curso está configurado para usar solo la puerta 5180. Así que el segundo comando falla con un error que dice que el puerto ya está en uso. No se mueve en silencio a otro puerto. Esto es a propósito, para que un test nunca revise la aplicación equivocada.

Presiona Ctrl+C en la primera terminal. Ejecuta de nuevo el comando en la segunda terminal. Ahora funciona.

## Las carpetas

| Carpeta | Qué contiene |
| --- | --- |
| `content/` | Las lecciones, como archivos de texto Markdown |
| `exercises/` | Archivos de práctica donde escribes tu propio código |
| `e2e/` | Tests de Playwright que revisan este sitio del curso |
| `src/` | El código del sitio del curso en sí. Es una aplicación React |
| `apps/practice-shop/` | Una segunda aplicación, más grande, para probar en el módulo 5. Puedes ignorarla hasta entonces. |

Trabajarás sobre todo en `exercises/`. No necesitas cambiar `src/`.

## Los archivos del proyecto

- `package.json` lista el nombre del proyecto, sus dependencias y sus scripts.
- `node_modules/` guarda las dependencias descargadas. Nunca lo edites.
- `pnpm-lock.yaml` registra la versión exacta de cada dependencia, para que todos obtengan las mismas.
- `tsconfig.json` tiene la configuración de TypeScript.
- `playwright.config.ts` tiene la configuración de los tests de Playwright.

## Los scripts

Un **script** es un comando con nombre guardado en `package.json`. Lo ejecutas con `pnpm <name>`. Piensa en los botones de un microondas: "palomitas" es un nombre que representa un ajuste largo.

| Comando | Qué hace |
| --- | --- |
| `pnpm dev` | Inicia el sitio del curso en http://localhost:5180 |
| `pnpm build` | Revisa los tipos y construye la versión final del sitio |
| `pnpm typecheck` | Revisa el código TypeScript en busca de errores |
| `pnpm e2e` | Ejecuta los tests de Playwright sin un navegador visible |
| `pnpm e2e:ui` | Ejecuta los tests en una ventana donde puedes mirar cada paso |
| `pnpm e2e:headed` | Ejecuta los tests con un navegador visible |
| `pnpm shop:dev` | Inicia la tienda de práctica. La necesitas en el módulo 5 |
| `pnpm shop:e2e` | Ejecuta los tests de Playwright de la tienda de práctica |

## Ejecuta los tests una vez

Playwright necesita su propio navegador. Descárgalo una vez con este comando:

```bash
pnpm exec playwright install chromium
```

Luego ejecuta los tests:

```bash
pnpm e2e
```

No necesitas iniciar el sitio primero. Playwright lo inicia por sí mismo.

**No** necesitas entender todavía estos tests. Este paso solo prueba que tu configuración funciona. Aprenderás cómo funcionan en el módulo 3.

Si todos los tests pasan, la salida termina con una línea que tiene el número de tests y la palabra `passed`, y después el tiempo. Los números pueden ser distintos en tu computadora.

> **Cuidado:** Si `pnpm dev` sigue en ejecución en otra terminal, no pasa nada. Playwright puede usarlo o iniciar el suyo.

## Profundiza

### Por qué existe el archivo de bloqueo

En `package.json`, la versión de una dependencia puede tener un rango, como `^5.3.0`. El `^` significa "esta versión o una más nueva y compatible". Sin más control, dos personas podrían instalar dos versiones distintas en dos días distintos.

El archivo `pnpm-lock.yaml` elimina este riesgo. Guarda la versión exacta de cada dependencia, y pnpm la usa cuando ejecutas `pnpm install`. Así tú y un colega obtienen el mismo código. El propio Playwright no tiene `^` aquí: el curso escribe `1.59.1`, una versión exacta.

### Por qué Playwright instala su propio navegador

Puede que preguntes: "Yo tengo Chrome. ¿Por qué descargar otro navegador?" Un test necesita un navegador que se comporte igual cada vez. Tu Chrome se actualiza solo, y cada actualización puede cambiar pequeñas cosas. El navegador que descarga Playwright coincide con la versión de Playwright que usas, así que los tests se mantienen estables.

### Cómo aparece en el trabajo real de automatización: los scripts

La sección `scripts` de `package.json` es un pequeño menú de comandos. Esta es una parte de la sección real de este proyecto:

```json
"scripts": {
  "dev": "vite",
  "e2e": "playwright test",
  "e2e:ui": "playwright test --ui"
}
```

Cuando ejecutas `pnpm e2e`, pnpm ejecuta `playwright test`. No necesitas recordar el comando largo. En un equipo, todos ejecutan los mismos nombres cortos, y CI también los ejecuta. Este es el primer ejemplo de la idea DRY, "Don't Repeat Yourself" (no te repitas): el comando largo se escribe una vez, en un solo lugar, y el nombre se usa en todas partes. Estudiarás DRY al final del módulo 1.

### Una idea equivocada común: "Si los tests pasan, la configuración está bien"

Los tests de esta lección revisan el sitio del curso. Cuando pasan, prueban que Node, pnpm y Playwright funcionan juntos. No prueban que tú los entiendas. Fíjate también en el archivo de configuración `playwright.config.ts`: inicia el sitio antes de los tests, por eso no ejecutas `pnpm dev` primero. Lee ese archivo en el módulo 3.

> **Consejo:** Cuando un comando falla, no borres `node_modules` primero. Lee el error. La mayoría de los fallos tienen un mensaje corto y claro.

### Usar un asistente de IA con un proyecto

Un asistente puede explicar un archivo de configuración o un error. Pero a menudo no conoce tus versiones. Si te dice que cambies `package.json`, pregunta por qué, ejecuta `pnpm install` y comprueba que el proyecto sigue funcionando. Nunca pegues un bloque que no puedas explicar.

## Práctica

1. Abre una terminal y ve a tu carpeta de proyectos.
2. Haz un fork del repositorio del curso en GitHub. Luego ejecuta `git clone https://github.com/<your-user>/qaa-academy.git qaa` con tu nombre de usuario.
3. Ejecuta `cd qaa` y luego `code .`.
4. En la terminal de VS Code, ejecuta `pnpm install`.
5. Ejecuta `pnpm dev`. Abre http://localhost:5180 y encuentra esta lección.
6. Presiona Ctrl+C en la terminal para detener el sitio.
7. Ejecuta `pnpm exec playwright install chromium`.
8. Ejecuta `pnpm e2e` y comprueba que los tests pasan.
9. Abre `package.json` en VS Code. Encuentra la sección llamada `scripts`.

## Reto

Crea un proyecto pequeño tuyo desde cero, como lo hace un desarrollador cuando empieza uno nuevo. Elige tu propio mundo: un refugio de mascotas, una receta, una tabla de fútbol, una lista de reproducción. El proyecto debe imprimir una oración sobre tu mundo, y debe poder repetirse en otra computadora solo con los archivos.

Crea una carpeta nueva `projects/my-first-project`, fuera del repositorio del curso. Dentro tendrás los archivos `package.json` y `hello.ts`, y tu propia versión del programa.

Está terminado cuando:

- Ejecutas `pnpm start` en esa carpeta e imprime una oración sobre tu mundo, como el nombre y la edad de un perro.
- `package.json` tiene un script llamado `start`, y lo escribiste tú, no una herramienta.
- Agregaste el paquete `typescript` como dependencia de desarrollo, y `pnpm exec tsc --version` imprime una versión.
- Existe un archivo de bloqueo. Borraste `node_modules` y ejecutaste un comando para traerlo de vuelta, y `pnpm start` sigue funcionando.
- Puedes explicar, en una oración para cada uno, por qué `node_modules` no se guarda en Git y el archivo de bloqueo sí.

Vas a necesitar algo que esta lección no enseñó: cómo crear un archivo de proyecto nuevo con pnpm, cómo escribir un script y cómo ejecutar un archivo TypeScript con Node.js. Busca: `pnpm init`, `package.json scripts start` y `node run typescript file directly`.

## Piénsalo bien

1. Borras `node_modules` y ejecutas `pnpm dev`. ¿Qué esperas y qué ejecutas después para arreglarlo? ¿Dónde encuentra pnpm la lista de lo que debe descargar?

<details>
<summary>Respuesta</summary>

`pnpm dev` falla, porque falta el programa que inicia el sitio, que vive en `node_modules`. Ejecutas `pnpm install`. El comando lee `package.json` para los nombres de las librerías y `pnpm-lock.yaml` para las versiones exactas, y las descarga de nuevo. Así que los dos archivos pequeños guardan todo el conocimiento. La carpeta grande es una copia que se puede volver a crear, y por eso nunca se guarda en Git.

</details>

2. Una colega cambia el script a `"e2e": "playwright test --ui"`. En su computadora funciona bien. En CI, la ejecución nunca termina. El código corre, sin error. Encuentra el problema.

<details>
<summary>Respuesta</summary>

La opción `--ui` abre una ventana donde una persona mira y hace clic en cada test. CI no tiene pantalla ni persona, así que la ejecución espera a alguien que nunca llega. El script corre, pero hace el trabajo equivocado para CI. El curso mantiene dos scripts separados: `e2e` para ejecuciones sin ventana y `e2e:ui` para personas. Un nombre debe hacer un solo trabajo.

</details>

3. Playwright está escrito como `1.59.1` en `package.json`, y muchas otras librerías usan `^`, como `^5.3.0`. ¿Cuál forma es mejor para una herramienta de tests y qué te haría elegir la otra?

<details>
<summary>Respuesta</summary>

Una versión exacta es mejor para una herramienta de tests, porque una versión nueva puede cambiar cómo se comportan los tests y hacerlos fallar sin que haya un problema en tu código. Con el rango, recibes arreglos y funciones nuevas por defecto, lo cual es bueno para librerías auxiliares pequeñas que rara vez rompen cosas. Elige el rango cuando quieras recibir actualizaciones sin trabajo, y cuando el archivo de bloqueo mantenga a todos en la misma versión. La versión exacta pide más trabajo cuando quieres actualizar, pero da control.

</details>

4. ¿Qué se rompe si alguien agrega `pnpm-lock.yaml` a la lista de archivos que Git ignora?

<details>
<summary>Respuesta</summary>

Cada persona ejecuta `pnpm install` y obtiene la versión más nueva que permiten los rangos ese día. Dos personas pueden terminar con dos versiones distintas. Entonces un test pasa para una persona y falla para la otra, con el mismo código. Nadie puede decir qué versión es la correcta. El archivo de bloqueo es el único archivo que convierte "la misma instalación" en una promesa.

</details>

5. Otro programa usa el puerto 5180. Ejecutas `pnpm dev` y luego ejecutas `pnpm e2e`. ¿Qué esperas de cada uno y por qué son distintos?

<details>
<summary>Respuesta</summary>

`pnpm dev` falla con un error de que el puerto está en uso, porque el sitio está configurado con un puerto fijo y se niega a moverse. `pnpm e2e` es más peligroso: en tu computadora, Playwright reutiliza un servidor que ya responde en ese puerto. Si el otro programa responde ahí, los tests revisan la aplicación equivocada. La configuración lee un puerto del ajuste `QAA_E2E_PORT`, así que puedes elegir un puerto libre. Una respuesta equivocada y silenciosa es peor que un error ruidoso.

</details>

6. Playwright descarga su propia copia de un navegador, y esto ocupa cientos de megabytes. Un compañero dice: "Usa el Chrome que ya está en la computadora". No hay una única respuesta correcta. Di de qué depende tu elección.

<details>
<summary>Respuesta</summary>

Usar el Chrome instalado ahorra espacio en disco y tiempo de descarga. Pero Chrome se actualiza solo, así que un test puede romperse un día en que nadie cambió el código, y dos computadoras pueden tener dos versiones. El navegador descargado coincide con la versión de Playwright, así que los resultados son los mismos en todas partes. La elección depende de si necesitas los mismos resultados en muchas computadoras y de cuánto disco y tiempo tienes. Para un equipo y para CI, la copia estable normalmente vale el espacio.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Cuál es la diferencia entre `dependencies` y `devDependencies` en package.json?**
   - Busca: `dependencies vs devDependencies package.json`
   - Pruébalo: En tu propio proyecto del Reto, ejecuta `pnpm add dayjs` y luego ejecuta `pnpm add -D typescript` si todavía no está. Abre `package.json` y mira en qué lista quedó cada nombre.
   - Una buena respuesta explica: qué guarda cada lista y por qué una herramienta de pruebas como Playwright va en la segunda lista.

2. **¿Qué es un archivo de bloqueo (*lock file*) y por qué deberías hacerle *commit* en Git?**
   - Busca: `pnpm-lock.yaml lock file why commit`
   - Pruébalo: Abre `pnpm-lock.yaml` en tu propio proyecto. Encuentra `typescript` y anota su versión exacta. Compárala con el rango de `package.json`.
   - Una buena respuesta explica: qué guarda el archivo de bloqueo y qué puede salir mal en un equipo sin él.

3. **¿Qué es un puerto y qué significa localhost:5180?**
   - Busca: `what is a port localhost explained`
   - Pruébalo: En el proyecto del curso, inicia `pnpm dev` en una terminal. En otra terminal, ejecuta `pnpm dev --port 5181` y abre las dos direcciones en el navegador. Di qué viste y por qué funciona el segundo comando.
   - Una buena respuesta explica: qué es un número de puerto, por qué dos aplicaciones no pueden usar el mismo puerto y cómo encuentra una herramienta de tests la aplicación que debe probar.

## Siguiente paso

Tu configuración está lista. Ve al módulo 1 y escribe tu primer programa.
