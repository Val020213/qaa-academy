---
title: Recorrido por la carpeta e2e
summary: Aprende para qué sirve cada archivo de la suite de tests de la tienda, por qué existe y cómo fluye una ejecución desde la configuración hasta el reporte.
duration: 75 min
---

## Empieza con un acertijo

Una compañera ejecuta `pnpm shop:e2e` y ve `17 passed`. No reinicia la tienda. Ejecuta el mismo comando otra vez. También muestra `17 passed`.

Pero la primera ejecución cambió datos que no se pueden deshacer. El test "un admin marca un pedido pendiente como pagado" cambia el pedido 1005 de `pending` a `paid`. La tienda no tiene "deshacer". El mismo test empieza comprobando que el pedido 1005 está `pending`.

Entonces, ¿cómo puede pasar la segunda ejecución? Piensa qué archivo o qué línea lo haría posible.

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Explicar para qué sirve cada archivo y cada carpeta de la suite, y qué se rompería si faltara.
- Predecir el orden de una ejecución: configuración, servidor, setup, specs.
- Decidir dónde va un archivo nuevo dentro de la carpeta.
- Encontrar el reporte y los traces después de una ejecución.

## Abre la carpeta

En VS Code, abre `apps/practice-shop/e2e`. Un proyecto real de equipo se ve así. Cuando te unas a uno, harás primero este recorrido.

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

No leas los archivos en orden. Primero mira los nombres y adivina. ¿Dónde buscarías "cómo ejecutar los tests"? ¿Dónde buscarías "qué falta por probar"? Luego comprueba tu respuesta con las notas de abajo.

## Los documentos

`README.md` explica cómo ejecutar la suite y lista las reglas del equipo. Léelo primero en cualquier proyecto.

`COVERAGE.md` lista lo que cubren los tests y lo que aún falta. Tu *pull request* (solicitud de cambios) de este módulo cerrará algunos de esos huecos.

## Los specs

Un *spec* (archivo de especificación de tests) es un archivo que termina en `.spec.ts`. Contiene tests. La suite tiene cuatro:

- `auth/auth.spec.ts`: login, contraseña incorrecta, cerrar sesión.
- `dashboard.spec.ts`: texto de carga, luego los números.
- `products/products.spec.ts`: lista, búsqueda, filtro, crear, eliminar.
- `orders/orders.spec.ts`: filtro de estado, marcar como pagado.

Los specs se agrupan en carpetas por funcionalidad. Pon un spec nuevo en la carpeta de su funcionalidad.

## El archivo de setup

`global.setup.ts` no es un spec normal. Se ejecuta primero, antes que todos los demás. Hace dos cosas:

1. Llama a `POST /api/test/reset` para devolver los datos a su estado inicial.
2. Entra como admin por la página de login y guarda la sesión.

### De vuelta al acertijo

La segunda ejecución pasa porque el paso 1 del archivo de setup se ejecuta al inicio de cada ejecución. El pedido 1005 vuelve a estar pendiente antes de que empiece el primer spec. El cambio de estado es de un solo sentido dentro de la aplicación, pero la dirección de reinicio solo para tests está fuera de las reglas de la aplicación.

Hay un detalle más en `lib/store.ts`: el reinicio conserva las sesiones abiertas. El comentario dice "so logged-in tests stay logged in". Recuérdalo cuando pienses qué le hace un reinicio a un usuario con sesión iniciada.

## La carpeta lib

`lib` guarda código que los specs comparten.

- `test.ts` exporta `test` y `expect`. Los specs importan de aquí, nunca de `@playwright/test`. Hoy el archivo solo los pasa tal cual. Parece inútil. La razón es que algún día podrías agregar ahí tus propios *fixtures* (preparaciones reutilizables), y ningún spec tendría que cambiar su importación.
- `helpers.ts` tiene `uniqueName()` y `uniqueSku()`. Crean datos que ningún otro test usa.
- `fixtures/api-client.ts` tiene `loginViaApi`, `createProduct` y `deleteProduct`. Preparan datos por la API. También tiene los usuarios `ADMIN` y `VIEWER`.
- `pages/products.page.ts` es un **Page Object**: una clase que sabe dónde están los elementos de la página de productos. Nunca hace aserciones.

Mira cómo `ProductsPage` encuentra todas las filas a la vez:

```ts
this.rows = page.getByTestId(/^products-row-/)
```

Aquí el test id es una expresión regular. Significa "todo id que empiece con `products-row-`". Una línea encuentra todas las filas, sin importar cuántas sean. Fíjate en lo que falta: no hay un Page Object para pedidos. La suite tiene solo dos tests de pedidos, así que una clase añadiría código y daría poco. Esto es **YAGNI**: no construyas para una necesidad que solo imaginas. Si la página de pedidos crece, puedes agregarlo entonces.

## La carpeta .auth

`.auth/admin.json` es la sesión de admin guardada. El archivo de setup la escribe. El archivo `e2e/.gitignore` le dice a Git que ignore esta carpeta, porque una sesión es privada y cambia en cada ejecución.

## La configuración

`playwright.config.ts` está en `apps/practice-shop`, fuera de `e2e`. Estas opciones son las más importantes:

- `testDir: "./e2e"` le dice a Playwright dónde buscar specs.
- `workers: 1` ejecuta los tests de uno en uno, porque comparten la memoria de la aplicación.
- `use.baseURL` permite que los tests escriban `page.goto("/products")`.
- `use.storageState: "e2e/.auth/admin.json"` hace que cada test empiece con la sesión iniciada.
- `projects` tiene dos entradas: `setup` y `chromium`.
- `webServer` arranca la aplicación.

## Cómo fluye una ejecución

Cuando ejecutas la suite, ocurre esto en orden:

1. Playwright lee `playwright.config.ts`.
2. Revisa `webServer.url`. Si la tienda ya responde en el puerto 5190, la reutiliza. Si no, arranca `pnpm dev --port 5190` y espera.
3. El proyecto `setup` ejecuta `global.setup.ts`. Reinicia los datos y guarda `.auth/admin.json`.
4. El proyecto `chromium` tiene `dependencies: ["setup"]`, así que empieza solo después de que setup pase. Si setup falla, no se ejecuta ningún spec.
5. Los specs se ejecutan uno por uno, cada uno con la sesión de admin ya iniciada.
6. Playwright escribe los resultados.

## Dónde van los resultados

Aparecen dos carpetas en `apps/practice-shop`:

- `playwright-report/` guarda el reporte HTML.
- `test-results/` guarda capturas de pantalla y *traces* (grabaciones de un test) de los tests que fallaron.

Git ignora ambas. Cada ejecución nueva las reemplaza.

## Profundiza

### Por qué setup es un proyecto y no un test normal

El proyecto `chromium` dice `dependencies: ["setup"]`. Playwright ejecuta primero el proyecto `setup` y espera. Si falla, Playwright omite el resto y te lo dice. Ves un solo fallo claro, no muchos confusos.

El test de setup debe empezar con una sesión vacía. La configuración muestra `storageState: { cookies: [], origins: [] }` para `setup`. Si cargara `admin.json`, buscaría un archivo que su propia ejecución está por crear.

### Una idea equivocada: "el Page Object también debería comprobar cosas"

Los principiantes suelen poner aserciones dentro de un Page Object, como `expectRowVisible()`. Se ve ordenado. Pero entonces el Page Object decide qué es correcto, y una página no puede servir a dos tests que esperan resultados distintos. En esta suite, `ProductsPage` solo sabe dónde están las cosas y cómo hacer clic en ellas. El spec dice qué debe ser verdad. El test se sigue leyendo como una historia.

### Cómo aparece esto en el trabajo real de automatización QA

Sin sesiones guardadas, cada test entraría por la página:

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

La línea `test.use` hace que el test empiece sin sesión. Sin ella, la sesión de admin guardada enviaría `/login` al dashboard, y el formulario nunca aparecería.

Con 17 tests, repetirías estas cuatro líneas 17 veces, y sumarías unos segundos a cada test. La suite escribe el login una vez en `global.setup.ts` y guarda las cookies. Esta es la idea llamada **DRY**: Don't Repeat Yourself (no te repitas). Un dato vive en un solo lugar. Si la página de login cambia, arreglas el archivo de setup para todos estos tests. El spec de auth prueba la propia página de login, así que tiene sus propios pasos de login y necesita la misma actualización. La misma idea vale para `baseURL` en la configuración: la dirección de la tienda se escribe una vez, y por eso los tests escriben `page.goto("/products")`.

DRY tiene un contrapeso: **KISS**, mantenlo simple. Si un *helper* (función auxiliar) compartido es más difícil de leer que las líneas que reemplaza, copia las líneas. Las dos ideas sirven a un mismo objetivo: que la próxima persona pueda cambiar la suite sin miedo.

### El costo de `workers: 1`

Un **worker** es un proceso que ejecuta tests. Con un solo worker, los tests corren uno tras otro. Eso es más lento. La razón es el estado compartido: todos los tests cambian los mismos datos en memoria. Con varios workers, dos tests podrían marcar el pedido 1005 como pagado al mismo tiempo y estorbarse.

Los equipos que necesitan velocidad lo resuelven de otra forma. Cada worker recibe sus propios datos o su propio servidor. Eso cuesta más preparación. Para una tienda pequeña, lento y estable es la mejor opción.

Una buena suite sigue las letras de **FIRST**: los tests deben ser rápidos (Fast), independientes (Independent), repetibles (Repeatable), autoverificables (Self-checking) y oportunos (Timely). Esta suite sacrifica un poco de "Fast" para conseguir "Independent" y "Repeatable".

## Práctica

1. Abre `apps/practice-shop/e2e/README.md` y lee la sección "Conventions".
2. Abre `global.setup.ts`. Encuentra la línea que reinicia los datos.
3. Abre `playwright.config.ts`. Encuentra `dependencies`, `workers` y `reuseExistingServer`.
4. Abre `orders/orders.spec.ts`. Comprueba que importa de `../lib/test`.
5. Dibuja de memoria el flujo de una ejecución en papel. Compáralo con la lista de arriba.

## Reto

La suite tiene un Page Object para productos pero ninguno para pedidos. Escribe uno y úsalo en un spec nuevo. Vas a practicar una regla del equipo: el Page Object sabe dónde están las cosas, y el spec decide qué es verdad.

Crea dos archivos. El primero es `apps/practice-shop/e2e/lib/pages/orders.page.ts`. Contiene una clase `OrdersPage` para la página de pedidos. El segundo es `apps/practice-shop/e2e/orders/orders-shipped.spec.ts`. Tiene un solo test: un admin filtra los pedidos por `shipped` y comprueba que los pedidos enviados 1003, 1007 y 1011 muestran cada uno el estado `shipped`.

Está terminado cuando:

- `OrdersPage` puede abrir la página, filtrar por un estado y darte la fila y el estado de un pedido según su id.
- El archivo `orders.page.ts` no contiene ningún `expect`.
- El spec importa `test` y `expect` de `../lib/test` y usa solo `getByTestId`, a través de tu clase.
- `pnpm --filter practice-shop e2e e2e/orders/orders-shipped.spec.ts` pasa. Ejecútalo dos veces seguidas.
- El test solo lee datos. No cambia ningún pedido, así que no puede romper otro test.

Vas a necesitar algo que esta lección no enseñó: cómo escribir una clase de TypeScript que guarda locators y tiene métodos, como hace `ProductsPage`, y cómo construir un test id a partir de una variable. Busca: `typescript class constructor readonly property`, `playwright locator getByTestId template string`.

> **Consejo:** Lee `products.page.ts` como modelo. Copia su forma, no sus palabras. Decide tú qué partes realmente necesitas. KISS y YAGNI se aplican: bastan dos o tres métodos.

## Piénsalo bien

1. Quita la línea `use: { storageState: { cookies: [], origins: [] } }` del proyecto `setup` y borra `e2e/.auth/admin.json`. ¿Qué pasa en la próxima ejecución y por qué?

<details><summary>Respuesta</summary>

El test de setup ahora hereda `storageState: "e2e/.auth/admin.json"` del `use` de nivel superior. Ese archivo no existe, porque setup es el test que lo crearía. Playwright falla al intentar abrir el test de setup con un archivo que falta. Como `chromium` depende de `setup`, no se ejecuta ningún otro test. Una línea pequeña de configuración evita un círculo: setup necesita el archivo, y el archivo necesita setup.

</details>

2. Una compañera tiene la sesión iniciada con la sesión guardada. Durante la ejecución, el test de setup llama a `POST /api/test/reset`. Predice: ¿sigue válida la sesión de ella después? ¿Por qué?

<details><summary>Respuesta</summary>

Sí. El código de reinicio en `lib/store.ts` crea productos, pedidos y usuarios nuevos, pero copia el mapa `sessions` viejo en el almacén nuevo. Así, un navegador que ya inició sesión sigue funcionando. Si el reinicio también borrara las sesiones, cada cookie guardada dejaría de funcionar justo después de setup, y cada test sería enviado a la página de login.

</details>

3. Encuentra el problema en este test. Se ejecuta, pero no es bueno.

```ts
test("the products page shows 10 rows", async ({ page }) => {
  await page.goto("/products")
  const rows = await page.getByTestId(/^products-row-/).count()
  expect(rows).toBe(10)
})
```

<details><summary>Respuesta</summary>

`count()` lee el número una sola vez, en ese momento. La página carga su lista después de abrirse, así que el conteo puede ser 0 y el test falla aunque la aplicación esté bien. Pasar o fallar depende entonces de la velocidad. La forma *web-first* (que espera sola) `await expect(page.getByTestId(/^products-row-/)).toHaveCount(10)` reintenta hasta que el número sea correcto o se acabe el tiempo. Usa un `expect` simple sobre un valor simple solo cuando el valor no puede cambiar.

</details>

4. Dos formas de entrar. Versión A: cada test entra por la página de login. Versión B: el proyecto setup entra una vez y guarda las cookies. ¿Cuál es mejor aquí, y qué te haría elegir A?

<details><summary>Respuesta</summary>

B es mejor para la tienda. Ahorra segundos por test y mantiene los pasos de login en un solo lugar. Elegirías A cuando el test trata del propio login, como `auth.spec.ts`, o cuando cada test necesita un usuario distinto. A también es más simple de leer en una suite diminuta de dos o tres tests. La elección depende de cuántos tests hay y cuántos usuarios necesitan.

</details>

5. Dos desarrolladores ejecutan `pnpm shop:e2e` en la misma computadora casi al mismo tiempo. Las dos ejecuciones encuentran la tienda en el puerto 5190 y la reutilizan. ¿Qué puede salir mal?

<details><summary>Respuesta</summary>

Las dos ejecuciones comparten una sola memoria. El setup de la ejecución B reinicia los datos mientras la ejecución A está a la mitad de sus tests. El pedido 1005 pasa de `paid` de vuelta a `pending`, o un producto que la ejecución A acaba de crear desaparece. Los fallos parecen aleatorios y no se pueden repetir a pedido. La suite está hecha para una ejecución a la vez sobre una tienda. Los equipos dan a cada persona o a cada trabajo de CI su propia copia de la aplicación.

</details>

6. Tu suite creció a 300 tests y tarda 40 minutos con `workers: 1`. El equipo te pide probar `workers: 4`. No hay una única respuesta correcta. ¿Qué revisarías antes de aceptar?

<details><summary>Respuesta</summary>

Primero revisa si los tests comparten datos. En la tienda sí, así que cuatro workers se estorbarían a menos que cada worker tenga su propio servidor y sus propios datos. También pesarías el costo: más máquinas y más trabajo de preparación, contra 40 minutos de espera en cada cambio. Otro camino es ejecutar la suite larga con menos frecuencia y tener una suite corta de humo (*smoke*) para cada cambio. La decisión depende de cada cuánto publica el equipo y de cuánto cuesta un bug tardío.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es un Page Object en la automatización de tests y qué no debe contener?**
   - Busca: `page object model pattern playwright`
   - Pruébalo: abre `products.page.ts` e imagina que el test id `products-new` cambia a `products-add`. Cuenta cuántos archivos debes editar. Luego haz el mismo conteo para un spec que no tiene Page Object.
   - Una buena respuesta explica: que un Page Object guarda locators y acciones de una página, y por qué muchos equipos dejan las aserciones en el test.

2. **¿Cómo reutiliza Playwright una sesión iniciada entre tests?**
   - Busca: `playwright authentication storageState`
   - Pruébalo: después de una ejecución, abre `e2e/.auth/admin.json`. Encuentra la cookie llamada `shop_session`. No copies su valor a ningún lado. Luego explica en una línea qué necesita encontrar el servidor en su memoria para aceptarla.
   - Una buena respuesta explica: qué se guarda en el archivo de storage state y por qué hace los tests más rápidos.

3. **¿Qué es una cookie y cómo la usa un sitio web para recordar que iniciaste sesión?**
   - Busca: `http cookie session login how it works httponly`
   - Pruébalo: entra a la tienda, abre las DevTools, ve a Application y luego a Cookies. Mira `shop_session` y su marca `HttpOnly`. En la pestaña Console, escribe `document.cookie` y mira si aparece la cookie de sesión.
   - Una buena respuesta explica: qué guarda y devuelve el navegador, qué cambia `HttpOnly`, y por qué una cookie guardada puede iniciar sesión en un test.

## Siguiente paso

En la próxima lección ejecutas la suite y lees el reporte de un test que falla.
