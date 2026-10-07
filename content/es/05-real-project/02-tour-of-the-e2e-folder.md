---
title: Recorrido por la carpeta e2e
duration: 50 min
---

## Objetivo

En esta lección recorres la suite de la tienda y sigues una ejecución desde la configuración hasta los resultados.

- Ubicar las instrucciones y la cobertura de la suite.
- Identificar los specs, el setup y el código compartido.
- Seguir el orden de ejecución y encontrar los resultados.
- Elegir dónde poner un spec nuevo y su Page Object.

## Abre la carpeta

En VS Code, abre `apps/practice-shop/e2e` y localiza estos archivos:

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

`README.md` explica cómo ejecutar la suite y lista las reglas del equipo. Empieza por ahí.

`COVERAGE.md` lista lo que cubren los tests y lo que aún falta.

## Los specs

La suite tiene cuatro archivos de tests:

- `auth/auth.spec.ts`: login, contraseña incorrecta, cerrar sesión.
- `dashboard.spec.ts`: texto de carga, luego los números.
- `products/products.spec.ts`: lista, búsqueda, filtro, crear, eliminar.
- `orders/orders.spec.ts`: filtro de estado, marcar como pagado.

Los specs se agrupan en carpetas por funcionalidad. Pon un spec nuevo en la carpeta de su funcionalidad.

## El archivo de setup

El runner de Playwright ejecuta `global.setup.ts` en el proyecto `setup`, antes de los specs de `chromium`. El test hace dos cosas:

1. Llama a `POST /api/test/reset` para devolver los datos a su estado inicial.
2. Entra como admin por la página de login y guarda la sesión.

El test de pedidos cambia el pedido 1005 de `pending` a `paid`. El reinicio lo devuelve a su estado inicial antes de cada ejecución, así que el mismo test puede pasar otra vez sin reiniciar el servidor.

El reinicio en `lib/store.ts` conserva las sesiones abiertas: reemplaza los datos, pero mantiene el mapa de sesiones.

El proyecto `setup` usa `storageState: { cookies: [], origins: [] }`. Así empieza sin sesión y no intenta cargar `admin.json`, el archivo que debe crear.

## La carpeta lib

`lib` guarda código que los specs comparten.

- `test.ts` exporta `test` y `expect`. Los specs importan de aquí, nunca de `@playwright/test`. Hoy el archivo los reexporta; si se agregan fixtures allí, los specs conservan sus importaciones.
- `helpers.ts` tiene `uniqueName()` y `uniqueSku()`. El nombre lleva ocho caracteres de un UUID aleatorio; el SKU recorre los valores de 1000 a 9999 desde un inicio aleatorio. Reducen las coincidencias, pero pueden repetir valores entre procesos o al agotar el rango.
- `fixtures/api-client.ts` tiene `loginViaApi`, `createProduct` y `deleteProduct`. Preparan datos por la API. También tiene los usuarios `ADMIN` y `VIEWER`.
- `pages/products.page.ts` guarda los locators y las acciones de productos en `ProductsPage`. Las aserciones quedan en el spec.

Este locator de `ProductsPage` selecciona las filas por el prefijo de su test id:

```ts
this.rows = page.getByTestId(/^products-row-/)
```

La expresión regular coincide con todo id que empiece con `products-row-`. Los dos tests de pedidos usan locators directamente; no tienen Page Object.

## La carpeta .auth

El setup escribe la sesión de admin en `.auth/admin.json`. El archivo `e2e/.gitignore` le dice a Git que ignore esta carpeta, porque contiene una sesión privada que cambia en cada ejecución.

## La configuración

`playwright.config.ts` está en `apps/practice-shop`, fuera de `e2e`. Estas opciones conectan las piezas:

- `testDir: "./e2e"` le dice a Playwright dónde buscar specs.
- `workers: 1` ejecuta los tests de uno en uno, porque comparten la memoria de la aplicación.
- `use.baseURL` permite que los tests escriban `page.goto("/products")`.
- `use.storageState: "e2e/.auth/admin.json"` carga la sesión del admin por defecto. El setup y los tests de autenticación reemplazan ese estado con cookies y orígenes vacíos.
- `projects` tiene dos entradas: `setup` y `chromium`.
- `webServer` arranca la aplicación.

Un worker es un proceso que ejecuta tests. Usar uno evita que los tests modifiquen los mismos datos al mismo tiempo, a costa de ejecutarlos uno tras otro.

## Cómo fluye una ejecución

Cuando ejecutas la suite, ocurre esto en orden:

![La configuración conecta el servidor, el setup, la sesión guardada, los specs y los resultados.](/images/05-suite-flow.es.svg)

1. Playwright lee `playwright.config.ts`.
2. Revisa `webServer.url`, que usa el puerto 5190 salvo que lo cambies con `SHOP_E2E_PORT`. Si la tienda responde y `CI` está ausente o vacía, la reutiliza; con `CI` no vacía, falla. Si no responde, arranca `webServer.command` y espera.
3. El proyecto `setup` ejecuta `global.setup.ts`. Reinicia los datos y guarda `.auth/admin.json`.
4. El proyecto `chromium` tiene `dependencies: ["setup"]`, así que empieza solo después de que setup pase. Si setup falla, no se ejecutan los specs de `chromium`.
5. Los specs se ejecutan uno por uno, con la sesión del admin por defecto o con el estado que declare el spec.
6. Playwright escribe los resultados.

## Dónde van los resultados

Aparecen dos carpetas en `apps/practice-shop`:

- `playwright-report/` guarda el reporte HTML.
- `test-results/` guarda capturas de pantalla y traces de los tests que fallaron.

Git ignora ambas. Cada ejecución nueva las reemplaza.

## Práctica

1. Abre `apps/practice-shop/e2e/README.md` y lee la sección "Conventions".
2. Abre `global.setup.ts`. Encuentra la línea que reinicia los datos.
3. Abre `playwright.config.ts`. Encuentra `dependencies`, `workers` y `reuseExistingServer`.
4. Abre `orders/orders.spec.ts`. Comprueba que importa de `../lib/test`.
5. Dibuja el flujo de una ejecución en papel usando los archivos que revisaste. Compáralo con la lista de arriba.

## Reto

Crea `apps/practice-shop/e2e/lib/pages/orders.page.ts` con una clase `OrdersPage` y úsala en `apps/practice-shop/e2e/orders/orders-shipped.spec.ts`. El spec tiene un solo test: un admin filtra los pedidos por `shipped` y comprueba que los pedidos 1003, 1007 y 1011 muestran cada uno el estado `shipped`.

Está terminado cuando:

- `OrdersPage` puede abrir la página, filtrar por un estado y darte la fila y el estado de un pedido según su id. El archivo `orders.page.ts` no contiene ningún `expect`.
- El spec importa `test` y `expect` de `../lib/test` y usa solo `getByTestId`, a través de tu clase.
- `pnpm --filter practice-shop e2e e2e/orders/orders-shipped.spec.ts` pasa. Ejecútalo dos veces seguidas.
- El test solo lee datos. No cambia ningún pedido.

Usa `products.page.ts` como modelo para la clase. Busca: `typescript class constructor readonly property`, `playwright locator getByTestId template string`.

## Piénsalo bien

1. Quita la línea `use: { storageState: { cookies: [], origins: [] } }` del proyecto `setup` y borra `e2e/.auth/admin.json`. ¿Qué pasa en la próxima ejecución y por qué?

<details><summary>Respuesta</summary>

El test de setup hereda `storageState: "e2e/.auth/admin.json"` del `use` de nivel superior. Playwright falla al crear su contexto porque el archivo todavía no existe. Como `chromium` depende de `setup`, no se ejecuta ningún otro test.

</details>

2. Dos desarrolladores ejecutan `pnpm shop:e2e` en la misma computadora casi al mismo tiempo. Las dos ejecuciones encuentran la tienda en el puerto 5190 y la reutilizan. ¿Qué puede salir mal?

<details><summary>Respuesta</summary>

Ambas ejecuciones comparten los datos en memoria del servidor. El setup de la ejecución B puede reiniciarlos mientras la ejecución A está probando: el pedido 1005 vuelve de `paid` a `pending`, o desaparece un producto recién creado. La suite necesita una ejecución a la vez sobre esa tienda.

</details>

## Siguiente paso

En la próxima lección ejecutas la suite y lees el reporte de un test que falla.
