---
title: Módulos
summary: Divide el código en archivos, compártelo con export e import y lee las líneas import de Playwright.
duration: 25 min
---

## Objetivo

- Explicar que un archivo es un módulo.
- Compartir un valor o una función con `export`.
- Usarlo en otro archivo con `import`.
- Leer `import { test, expect } from "@playwright/test"`.

## Un archivo, un módulo

Los proyectos reales tienen muchos archivos. Cada archivo es un **módulo**. Un módulo guarda sus propias variables y funciones. Los demás archivos no pueden verlas.

Esto es útil. Un archivo de tests puede usar una función auxiliar de otro archivo en lugar de copiarla. Si la función auxiliar cambia, la corriges en un solo lugar.

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

## Siguiente paso

En la última lección de este módulo aprendes a leer los mensajes de error y a corregir lo que está mal.
