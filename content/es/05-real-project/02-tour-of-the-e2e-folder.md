---
title: Recorrido por la carpeta e2e
summary: Aprende para qué sirve cada archivo de la suite de tests de la tienda y cómo fluye una ejecución, desde la configuración hasta el reporte.
duration: 30 min
---

## Objetivo

- Nombrar cada archivo y carpeta de la suite de tests de la tienda y decir para qué sirve.
- Describir el orden de una ejecución: configuración, servidor, setup, specs.
- Encontrar el reporte y los traces después de una ejecución.

## Abre la carpeta

En VS Code, abre `apps/practice-shop/e2e`. Un proyecto real de un equipo se ve así. Cuando te unas a uno, harás primero este recorrido.

```text
apps/practice-shop/
  playwright.config.ts
  e2e/
    README.md
    COVERAGE.md
    global.setup.ts
    dashboard.spec.ts
    auth/auth.spec.ts
    products/products.spec.ts
    orders/orders.spec.ts
    lib/
      test.ts
      helpers.ts
      fixtures/api-client.ts
      pages/products.page.ts
    .auth/
    .gitignore
```

## Los documentos

`README.md` explica cómo ejecutar la suite y lista las reglas del equipo. Léelo primero en cualquier proyecto.

`COVERAGE.md` lista lo que cubren los tests y lo que aún falta. Tu *pull request* (solicitud de cambios) de este módulo cerrará algunos de esos huecos.

## Los specs

Un *spec* (archivo de especificación de tests) es un archivo que termina en `.spec.ts`. Contiene tests. La suite tiene cuatro:

- `auth/auth.spec.ts`: login, contraseña incorrecta, cerrar sesión.
- `dashboard.spec.ts`: texto de carga y luego los números.
- `products/products.spec.ts`: lista, búsqueda, filtro, crear, eliminar.
- `orders/orders.spec.ts`: filtro por estado, marcar como pagado.

Los specs se agrupan en carpetas por funcionalidad. Pon un spec nuevo en la carpeta de su funcionalidad.

## El archivo de setup

`global.setup.ts` no es un spec normal. Se ejecuta primero, antes que todos los demás. Hace dos cosas:

1. Llama a `POST /api/test/reset` para devolver los datos a su estado inicial.
2. Inicia sesión como admin por la página de login y guarda la sesión.

## La carpeta lib

`lib` contiene código que comparten los specs.

- `test.ts` exporta `test` y `expect`. Los specs importan de aquí, nunca de `@playwright/test`.
- `helpers.ts` tiene `uniqueName()` y `uniqueSku()`. Crean datos que ningún otro test usa.
- `fixtures/api-client.ts` tiene `loginViaApi`, `createProduct` y `deleteProduct`. Preparan datos por la API. También tiene los usuarios `ADMIN` y `VIEWER`.
- `pages/products.page.ts` es un **Page Object**: una clase que sabe dónde están los elementos de la página de productos. Nunca hace aserciones.

## La carpeta .auth

`.auth/admin.json` es la sesión guardada del admin. La escribe el archivo de setup. El archivo `e2e/.gitignore` le dice a Git que ignore esta carpeta, porque una sesión es privada y cambia en cada ejecución.

## La configuración

`playwright.config.ts` está en `apps/practice-shop`, fuera de `e2e`. Estos ajustes son los más importantes:

- `testDir: "./e2e"` le dice a Playwright dónde buscar specs.
- `workers: 1` ejecuta los tests uno por uno, porque comparten la memoria de la aplicación.
- `use.baseURL` permite que los tests escriban `page.goto("/products")`.
- `use.storageState: "e2e/.auth/admin.json"` hace que cada test empiece con sesión iniciada.
- `projects` tiene dos entradas: `setup` y `chromium`.
- `webServer` inicia la aplicación.

## Cómo fluye una ejecución

Cuando ejecutas la suite, esto ocurre en orden:

1. Playwright lee `playwright.config.ts`.
2. Revisa `webServer.url`. Si la tienda ya responde en el puerto 5190, la reutiliza. Si no, inicia `pnpm dev --port 5190` y espera.
3. El proyecto `setup` ejecuta `global.setup.ts`. Reinicia los datos y guarda `.auth/admin.json`.
4. El proyecto `chromium` tiene `dependencies: ["setup"]`, así que empieza solo después de que el setup pase. Si el setup falla, no se ejecuta ningún spec.
5. Los specs se ejecutan uno por uno, cada uno con sesión iniciada como admin.
6. Playwright escribe los resultados.

## Dónde van los resultados

Aparecen dos carpetas en `apps/practice-shop`:

- `playwright-report/` contiene el reporte HTML.
- `test-results/` contiene capturas de pantalla y *traces* (grabaciones de un test) de los tests que fallaron.

Git ignora ambas. Cada ejecución nueva las reemplaza.

## Práctica

1. Abre `apps/practice-shop/e2e/README.md` y lee la sección "Conventions".
2. Abre `global.setup.ts`. Busca la línea que reinicia los datos.
3. Abre `playwright.config.ts`. Busca `dependencies`, `workers` y `reuseExistingServer`.
4. Abre `orders/orders.spec.ts`. Comprueba que importa de `../lib/test`.
5. Dibuja de memoria en papel el flujo de una ejecución. Compáralo con la lista de arriba.

## Comprueba lo que sabes

1. ¿Por qué `global.setup.ts` se ejecuta antes que los specs?

<details><summary>Respuesta</summary>

El proyecto `chromium` depende de `setup`. El setup reinicia los datos y guarda la sesión de admin que usan todos los tests.

</details>

2. ¿Qué te da `uniqueSku()`?

<details><summary>Respuesta</summary>

Un SKU válido, como `SKU-4821`, que no usan los datos iniciales ni otros tests.

</details>

3. ¿Dónde pones un spec nuevo sobre pedidos?

<details><summary>Respuesta</summary>

En la carpeta `orders`, por ejemplo `e2e/orders/`.

</details>

4. ¿Por qué Git ignora `.auth`?

<details><summary>Respuesta</summary>

Contiene una sesión privada que cambia en cada ejecución. No debe compartirse.

</details>

## Siguiente paso

En la próxima lección ejecutarás la suite y leerás el reporte de un test que falla.
