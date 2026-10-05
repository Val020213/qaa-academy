---
title: Recorrido por la carpeta e2e
summary: Aprende para qué sirve cada archivo de la suite de tests de la tienda y cómo fluye una ejecución, desde la configuración hasta el reporte.
duration: 45 min
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

- `test.ts` exporta `test` y `expect`. Los specs importan desde aquí, nunca desde `@playwright/test`.
- `helpers.ts` tiene `uniqueName()` y `uniqueSku()`. Crean datos que ningún otro test usa.
- `fixtures/api-client.ts` tiene `loginViaApi`, `createProduct` y `deleteProduct`. Preparan datos por la API. También tiene los usuarios `ADMIN` y `VIEWER`.
- `pages/products.page.ts` es un **Page Object** (objeto de página): una clase que sabe dónde están los elementos de la página de productos. Nunca hace aserciones.

## La carpeta .auth

`.auth/admin.json` es la sesión de admin guardada. El archivo de setup la escribe. El archivo `e2e/.gitignore` le dice a Git que ignore esta carpeta, porque una sesión es privada y cambia en cada ejecución.

## La configuración

`playwright.config.ts` está en `apps/practice-shop`, fuera de `e2e`. Estos ajustes son los más importantes:

- `testDir: "./e2e"` le dice a Playwright dónde buscar specs.
- `workers: 1` ejecuta los tests de uno en uno, porque comparten la memoria de la aplicación.
- `use.baseURL` permite que los tests escriban `page.goto("/products")`.
- `use.storageState: "e2e/.auth/admin.json"` inicia cada test con la sesión ya abierta.
- `projects` tiene dos entradas: `setup` y `chromium`.
- `webServer` inicia la aplicación.

## Cómo fluye una ejecución

Cuando ejecutas la suite, esto ocurre en orden:

1. Playwright lee `playwright.config.ts`.
2. Revisa `webServer.url`. Si la tienda ya responde en el puerto 5190, la reutiliza. Si no, inicia `pnpm dev --port 5190` y espera.
3. El proyecto `setup` ejecuta `global.setup.ts`. Reinicia los datos y guarda `.auth/admin.json`.
4. El proyecto `chromium` tiene `dependencies: ["setup"]`, así que empieza solo después de que setup pase. Si setup falla, no se ejecuta ningún spec.
5. Los specs se ejecutan uno por uno, y cada uno empieza con la sesión de admin abierta.
6. Playwright escribe los resultados.

## Dónde van los resultados

Aparecen dos carpetas en `apps/practice-shop`:

- `playwright-report/` contiene el reporte HTML.
- `test-results/` contiene capturas de pantalla y traces de los tests que fallaron.

Git ignora ambas. Cada ejecución nueva las reemplaza.

## Profundiza

### Por qué setup es un proyecto y no un test normal

El proyecto `chromium` dice `dependencies: ["setup"]`. Playwright ejecuta primero el proyecto `setup` y espera. Si falla, Playwright omite el resto y te lo dice. Ves un fallo claro, no diecisiete fallos confusos.

El test de setup debe empezar con una sesión vacía. La configuración muestra `storageState: { cookies: [], origins: [] }` para `setup`. Si cargara `admin.json`, buscaría un archivo que su propia ejecución está a punto de crear.

### Una idea equivocada: "el Page Object también debería comprobar cosas"

Los principiantes suelen poner aserciones dentro de un Page Object, como `expectRowVisible()`. Se ve ordenado. Pero entonces el Page Object decide qué es correcto, y una misma página no puede servir a dos tests que esperan resultados distintos. En esta suite, `ProductsPage` solo sabe dónde están las cosas y cómo hacer clic en ellas. El spec dice qué debe ser verdad. Así el test sigue leyéndose como una historia.

### Cómo aparece en el trabajo real de automatización QA

Sin sesiones guardadas, cada test iniciaría sesión por la página:

```ts
import { test } from "../lib/test"
import { ADMIN } from "../lib/fixtures/api-client"

test.use({ storageState: { cookies: [], origins: [] } })

test("a test that signs in by itself", async ({ page }) => {
  await page.goto("/login")
  await page.getByTestId("login-email").fill(ADMIN.email)
  await page.getByTestId("login-password").fill(ADMIN.password)
  await page.getByTestId("login-submit").click()
  // ... now the real test starts
})
```

La línea `test.use` inicia el test sin sesión. Sin ella, la sesión de admin guardada enviaría `/login` al dashboard, y el formulario nunca aparecería.

Con 17 tests, repetirías estas cuatro líneas 17 veces y añadirías unos segundos a cada test. La suite escribe el login una sola vez en `global.setup.ts` y guarda las cookies. Esta es la idea llamada **DRY** (Don't Repeat Yourself, no te repitas): un dato vive en un solo lugar. Si la página de login cambia, arreglas el archivo de setup para todos estos tests. El spec de auth prueba la propia página de login, así que tiene sus propios pasos de login y necesita la misma actualización. Estudiaste DRY antes en el curso. La misma idea se aplica a `baseURL` en la configuración: la dirección de la tienda se escribe una sola vez, así que los tests escriben `page.goto("/products")`.

### El costo de `workers: 1`

Un **worker** es un proceso que ejecuta tests. Con un solo worker, los tests se ejecutan uno tras otro. Eso es más lento. La razón es el estado compartido: todos los tests cambian los mismos datos en memoria. Con varios workers, dos tests podrían marcar el pedido 1005 como pagado al mismo tiempo y estorbarse.

Los equipos que necesitan velocidad lo resuelven de otra forma. Cada worker recibe sus propios datos o su propio servidor. Eso cuesta más preparación. Para una tienda pequeña, lento y estable es la mejor opción.

Recuerda también que la legibilidad sigue importando más que eliminar toda repetición. Un test que muestra sus propios pasos es más fácil de leer que uno que los esconde.

## Práctica

1. Abre `apps/practice-shop/e2e/README.md` y lee la sección "Conventions".
2. Abre `global.setup.ts`. Encuentra la línea que reinicia los datos.
3. Abre `playwright.config.ts`. Encuentra `dependencies`, `workers` y `reuseExistingServer`.
4. Abre `orders/orders.spec.ts`. Comprueba que importa desde `../lib/test`.
5. Dibuja de memoria el flujo de una ejecución en papel. Compáralo con la lista de arriba.

## Comprueba lo que sabes

1. ¿Por qué `global.setup.ts` se ejecuta antes que los specs?

<details><summary>Respuesta</summary>

El proyecto `chromium` depende de `setup`. Setup reinicia los datos y guarda la sesión de admin que usan todos los tests.

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

Contiene una sesión privada que cambia en cada ejecución. No se debe compartir.

</details>

5. Supón que cambias `workers: 1` por `workers: 4`. Dos tests usan el pedido 1005: uno lo marca como pagado y otro comprueba que está pendiente. ¿Qué podría pasar y por qué?

<details><summary>Respuesta</summary>

Los tests podrían ejecutarse al mismo tiempo. Si el primero marca el pedido como pagado antes de que el segundo compruebe, el segundo falla con `paid` en lugar de `pending`. El fallo no ocurriría siempre. Depende del momento, así que es un test inestable (*flaky*). La causa son los datos compartidos, no un bug de la aplicación.

</details>

6. Eliminas el archivo `e2e/.auth/admin.json` y ejecutas `pnpm shop:e2e`. ¿Falla la suite? ¿Por qué?

<details><summary>Respuesta</summary>

No. El proyecto `setup` se ejecuta primero, inicia sesión de nuevo y guarda un `admin.json` nuevo. Solo entonces empiezan los demás tests. La ejecución crea el archivo, así que es seguro eliminarlo.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es un Page Object en la automatización de tests y qué no debería contener?**
   - Busca: `page object model pattern playwright`
   - Una buena respuesta explica: que un Page Object contiene locators y acciones de una página, y por qué muchos equipos dejan las aserciones en el test

2. **¿Cómo reutiliza Playwright una sesión iniciada entre tests?**
   - Busca: `playwright authentication storageState`
   - Una buena respuesta explica: qué se guarda en el archivo de storage state y por qué hace los tests más rápidos

3. **¿Qué es una cookie y cómo la usa un sitio web para recordar que iniciaste sesión?**
   - Busca: `http cookie session login how it works`
   - Una buena respuesta explica: qué guarda y devuelve el navegador, y por qué una cookie guardada puede iniciar sesión en un test

## Siguiente paso

En la próxima lección ejecutarás la suite y leerás el reporte de un test que falla.
