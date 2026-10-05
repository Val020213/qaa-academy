---
title: Módulos
summary: Divide el código en archivos, compártelo con export e import y lee las líneas import de Playwright.
duration: 40 min
---

## Objetivo

- Explicar que un archivo es un módulo.
- Compartir un valor o una función con `export`.
- Usarlo en otro archivo con `import`.
- Leer `import { test, expect } from "@playwright/test"`.

## Un archivo, un módulo

Los proyectos reales tienen muchos archivos. Cada archivo es un **módulo**. Un módulo guarda sus propias variables y funciones. Los demás archivos no pueden verlas.

Esto es útil. Un archivo de tests puede usar un *helper* (función auxiliar) de otro archivo en lugar de copiarlo. Si el helper cambia, lo corriges en un solo lugar.

Para compartir algo, el módulo debe **exportarlo** (*export*). Para usarlo, otro archivo debe **importarlo** (*import*).

## export

Pon la palabra `export` antes de lo que quieres compartir.

Crea el archivo `exercises/01-programming/_helpers.ts`:

```ts
export const appName = "Shop";

export function addTax(price: number): number {
  return price * 1.2;
}

const secret = "not shared";
```

El archivo comparte `appName` y `addTax`. La variable `secret` no tiene `export`, así que sigue siendo privada.

## import

Usa `import` al inicio de otro archivo. Escribe los nombres entre llaves y luego di de dónde vienen.

Crea el archivo `exercises/01-programming/use-helpers.ts`:

```ts
import { appName, addTax } from "./_helpers.ts";

console.log(appName);
console.log(addTax(100));
```

Ejecútalo con `node exercises/01-programming/use-helpers.ts`. El programa muestra:

```text
Shop
120
```

Los nombres dentro de `{ }` deben coincidir exactamente con los nombres exportados.

## Rutas relativas

El texto después de `from` es la **ruta** (*path*). Una ruta que empieza con `./` apunta a un archivo junto al archivo actual. Una ruta que empieza con `../` sube una carpeta.

- `"./_helpers.ts"` significa el archivo `_helpers.ts` en la misma carpeta.
- `"../shared/data.ts"` significa el archivo `data.ts` en la carpeta `shared`, un nivel más arriba.

> **Nota:** En este curso, escribe la terminación `.ts` en los imports relativos. Node la necesita para encontrar el archivo.

## Importar tipos

Un tipo existe solo mientras TypeScript revisa tu código. Desaparece cuando el programa se ejecuta. Usa `import type` para los tipos.

Pon esto en `_helpers.ts`:

```ts
export type Status = "passed" | "failed" | "skipped";
```

Úsalo en otro archivo:

```ts
import type { Status } from "./_helpers.ts";

const status: Status = "passed";
console.log(status);
```

El programa muestra `passed`.

Puedes importar valores y tipos del mismo archivo con dos líneas:

```ts
import type { Status } from "./_helpers.ts";
import { appName } from "./_helpers.ts";
```

## Paquetes

No todos los imports apuntan a un archivo tuyo. Otras personas publican código como **paquetes** (*packages*). Un paquete es un conjunto de código que instalas con pnpm.

Compara dos imports:

```ts
import { addTax } from "./_helpers.ts";
import { test, expect } from "@playwright/test";
```

- Una ruta que empieza con `./` o `../` es un archivo tuyo.
- Un nombre sin punto es un paquete. Node lo busca en la carpeta `node_modules`, donde pnpm guarda los paquetes instalados.

El nombre `@playwright/test` es el paquete creado por el equipo de Playwright.

## Leer un archivo de tests de Playwright

Todo test de Playwright empieza con una línea import.

```ts
import { test, expect } from "@playwright/test";
```

Léela así: "Del paquete `@playwright/test`, trae dos herramientas. `test` define un test. `expect` comprueba un resultado."

Después las usas:

```ts
test("login page has a title", async ({ page }) => {
  await page.goto("/login");
  await expect(page).toHaveTitle("Login");
});
```

Todavía no necesitas entenderlo todo. Fíjate en las tres partes que ya conoces: `test` y `expect` vienen del import, y `async` y `await` vienen de la lección 10.

## Profundiza

### Un módulo se ejecuta una sola vez

Cuando dos archivos importan el mismo módulo, el código del módulo se ejecuta una vez. Los dos archivos reciben los mismos valores exportados. No reciben copias.

Crea cuatro archivos pequeños. El primero es `_settings.ts`:

```ts
console.log("settings loaded");

export const settings = { retries: 0 };
```

El segundo es `_bump.ts`:

```ts
import { settings } from "./_settings.ts";

export function bump(): void {
  settings.retries += 1;
}
```

El tercero es `_show.ts`:

```ts
import { settings } from "./_settings.ts";

export function show(): number {
  return settings.retries;
}
```

El cuarto es `main.ts`:

```ts
import { bump } from "./_bump.ts";
import { show } from "./_show.ts";

bump();
console.log(show());
```

Ejecuta `node main.ts`. El programa muestra:

```text
settings loaded
1
```

El mensaje aparece una vez, y `show` ve el cambio que hizo `bump`. Los dos archivos usan un solo objeto. En Playwright, cada proceso *worker* carga su propia copia de cada módulo. Por eso no uses una variable de módulo para pasar datos de un test a otro.

### Cómo aparece en el trabajo de automatización QA

Mira el archivo real `e2e/lib/test.ts` de este proyecto. Cada *spec* (archivo de tests) importa `test` y `expect` desde allí. Hoy solo los pasa desde `@playwright/test`. Cuando el equipo agregue sus propios *fixtures* en el módulo 4, el cambio se hará en este único archivo. Ningún spec cambia su import.

Esto es **DRY** (*Don't Repeat Yourself*, no te repitas): el código compartido tiene un solo hogar. Estudiarás la idea al final de este módulo.

### Un costo: el cajón de sastre

Compartir no es gratis. Un archivo llamado `utils.ts` que guarda de todo se convierte en un cajón de sastre. Nadie sabe qué hay dentro, y un cambio puede romper muchos archivos.

Comparte código cuando dos archivos necesitan lo mismo. Dale al módulo un nombre que diga qué hace, por ejemplo `test-data.ts` y no `stuff.ts`.

## Práctica

1. Crea `exercises/01-programming/_helpers.ts` y `exercises/01-programming/use-helpers.ts` a partir de esta lección.
2. Ejecuta `node exercises/01-programming/use-helpers.ts`.
3. Quita `export` de `addTax` y mira el error en VS Code y en la terminal. Luego vuelve a ponerlo.
4. Abre `exercises/01-programming/_test-cases.ts` y léelo. No lo cambies.
5. Abre `exercises/01-programming/11-modules.ts`. Reemplaza cada `// TODO` con código.
6. Ejecuta el archivo del ejercicio con este comando:

```bash
node exercises/01-programming/11-modules.ts
```

Haz que cada línea diga `OK`.

## Comprueba lo que sabes

1. ¿Qué es un módulo?

<details><summary>Respuesta</summary>

Un módulo es un archivo. Su contenido es privado a menos que lo exportes.

</details>

2. ¿Cómo compartes una función de un archivo?

<details><summary>Respuesta</summary>

Escribe `export` antes de la función.

</details>

3. ¿Qué significa `"./data.ts"` en un import?

<details><summary>Respuesta</summary>

El archivo `data.ts` en la misma carpeta que el archivo actual.

</details>

4. ¿Qué hace `import { test, expect } from "@playwright/test"`?

<details><summary>Respuesta</summary>

Trae a tu archivo las herramientas `test` y `expect` del paquete `@playwright/test`.

</details>

5. Un archivo tiene `const taxRate = 0.2;` y `export function addTax(...)`. Otro archivo empieza con `import { taxRate } from "./_helpers.ts";`. ¿Qué pasa cuando lo ejecutas y por qué?

<details><summary>Respuesta</summary>

El programa se detiene con un error como "The requested module does not provide an export named 'taxRate'". La variable `taxRate` no tiene `export`, así que es privada de su archivo. TypeScript también lo avisa en VS Code antes de que ejecutes. La solución es escribir `export` antes de `const taxRate`, o usar solo `addTax`.

</details>

6. Este import no funciona. Encuentra la razón.

```ts
import { addTax } from "_helpers.ts";
```

<details><summary>Respuesta</summary>

A la ruta le falta `./` al inicio. Node cree que `_helpers.ts` es el nombre de un paquete y lo busca en `node_modules`. No lo encuentra y avisa "Cannot find package '_helpers.ts'". Escribe `"./_helpers.ts"` para un archivo en la misma carpeta.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Cuál es la diferencia entre los módulos ES (`import`) y CommonJS (`require`)?**
   - Busca: `es modules vs commonjs node`
   - Una buena respuesta explica: las dos sintaxis, por qué ves ambas en los tutoriales y cuál usa este curso.

2. **¿Cuál es la diferencia entre `dependencies` y `devDependencies` en `package.json`?**
   - Busca: `package.json dependencies vs devDependencies`
   - Una buena respuesta explica: qué significa cada lista, en cuál suele ir una herramienta de pruebas como Playwright y por qué.

3. **¿Qué es un framework de automatización de pruebas y qué partes suelen compartir los tests?**
   - Busca: `test automation framework components`
   - Una buena respuesta explica: qué agrega un framework alrededor de la herramienta de pruebas, dos o tres partes compartidas como helpers o datos de prueba, y una razón para mantenerlas en módulos separados.

## Siguiente paso

En la última lección de este módulo aprendes a leer los mensajes de error y a corregir lo que está mal.
