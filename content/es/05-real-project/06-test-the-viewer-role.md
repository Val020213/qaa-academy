---
title: Probar el rol viewer
summary: Prueba a un segundo usuario empezando sin sesión e iniciando sesión como viewer, aprende a demostrar que algo está ausente y prueba quién puede cambiar un pedido.
duration: 90 min
---

## Empieza con un acertijo

Una tienda tiene dos tipos de usuarios. Un admin puede editar y eliminar productos. Un viewer (solo lectura) solo puede mirar.

Sam escribe un test para el viewer. Abre la página de productos y comprueba que la página tiene cero botones Delete. El test sale en verde. Sam está contento.

La semana siguiente, un desarrollador comete un error de escritura en la dirección que carga la lista de productos. La tabla en la página del viewer ahora está vacía. El test sigue en verde.

Sam también ejecuta por error el mismo test como admin. Los admins tienen botones Delete en cada fila. El test sale en verde otra vez.

¿Cómo puede una misma comprobación pasar en las tres situaciones? ¿Qué le dice a Sam un resultado verde en cada una?

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Explica por qué un segundo usuario necesita una segunda sesión.
- Empieza un spec sin sesión e inicia sesión como viewer.
- Escribe una comprobación de "ausente" que pueda fallar, y demuestra que puede.
- Decide qué capa, la pantalla o la API, debe llevar cada regla.

## El problema

Cada test de la suite empieza con sesión de admin. La configuración carga `e2e/.auth/admin.json` para todos los tests. Pero el viewer es otro usuario con otra sesión. No puedes ser los dos a la vez en un mismo contexto del navegador.

Un **contexto del navegador** (*browser context*) es un perfil de navegador limpio que usa un test. Tiene sus propias cookies. Por eso el viewer necesita un contexto con la cookie del viewer.

## El enfoque más simple

Hazlo dentro del spec, en tres pasos.

1. Reemplaza la sesión del admin por una vacía: `test.use({ storageState: { cookies: [], origins: [] } })`. El test empieza sin sesión. El archivo `auth.spec.ts` también lo hace.
2. En `beforeEach`, llama a `loginViaApi(page.request, VIEWER)`. Esto envía un POST a `/api/auth/login`.
3. `page.request` comparte cookies con la página. La cookie de sesión llega al contexto, así que `page.goto` ya ve al viewer con sesión iniciada.

`loginViaApi` y `VIEWER` vienen de `lib/fixtures/api-client.ts`. Un *hook* **`beforeEach`** (gancho) es código que corre antes de cada test de su grupo.

Antes de seguir, predice qué pasa si pasas el fixture `request` en lugar de `page.request`. ¿A dónde va la cookie?

> **Cuidado:** Pasa `page.request`, no el fixture `request`. El fixture `request` tiene su propio almacén de cookies, no el de la página. Un login en él no inicia la sesión de la página.

## Controles ausentes

Quieres comprobar que algo no está ahí. Usa `toHaveCount(0)`. Ahora piensa cuándo se cumple esta aserción. `toHaveCount(0)` es verdadera apenas ve cero elementos. ¿Cuándo ocurre eso? También en el primer instante de una página que aún no cargó.

Esa es la trampa. Una página que no cargó tiene cero botones. Una tabla vacía tiene cero botones. La página de un admin que todavía no ha visto las filas tiene cero botones. Una comprobación que pasa en todos los casos no prueba nada. Un test que no puede fallar no es un test.

Observa qué botones no tiene el viewer.

![El viewer ve productos y pedidos, pero no tiene botones New, Edit, Delete ni de acciones.](/clips/shop-viewer-role.webm)

El arreglo tiene dos partes:

1. Primero espera algo que debe existir: la primera fila. Entonces la página ya cargó y tiene datos.
2. Demuestra que la comprobación puede fallar. Ejecuta el mismo test una vez como admin. Si sigue en verde, la comprobación no vale nada.

Las filas tienen test ids con el id del producto adentro, como `products-edit-12`. Una expresión regular coincide con todos: `getByTestId(/^products-edit-/)`.

### De vuelta al acertijo

La comprobación "cero botones Delete" es verdadera para un viewer con datos, para un viewer con una tabla vacía y para un admin cuyas filas aún no cargaron. El test de Sam nunca miró las filas. Un resultado verde solo significaba "en el momento de la comprobación, no vi ningún botón Delete". El arreglo es esperar la primera fila, luego comprobar cero botones, y ejecutarlo una vez como admin para verlo fallar. Es un mini **experimento**: cambia una sola cosa (el usuario) y mira si el resultado cambia.

## La comprobación por la API

La interfaz oculta los botones. Pero un botón oculto no es seguridad. Alguien todavía puede llamar a la API. El servidor debe rechazar la petición.

`page.request.post(url, { data })` envía una petición POST con la cookie del viewer. La API responde con el estado 403, que significa "prohibido": te conoce, pero no tienes permiso para hacer esto. El cuerpo trae un mensaje.

## El spec completo

Crea `apps/practice-shop/e2e/products/viewer.spec.ts`.

```ts
import { expect, test } from "../lib/test"
import { VIEWER, loginViaApi } from "../lib/fixtures/api-client"
import { uniqueName, uniqueSku } from "../lib/helpers"
import { ProductsPage } from "../lib/pages/products.page"

// Start signed out. The saved admin session is not used in this file.
test.use({ storageState: { cookies: [], origins: [] } })

test.describe("Viewer role", () => {
  test.beforeEach(async ({ page }) => {
    // The cookie lands in the browser context, so page.goto sees it too.
    await loginViaApi(page.request, VIEWER)
  })

  test("the viewer sees the products but no New, Edit or Delete", async ({ page }) => {
    const products = new ProductsPage(page)

    await products.goto()

    await expect(page.getByTestId("user-role")).toHaveText("viewer")
    // Wait for the rows first. A "0 buttons" check on an empty page proves nothing.
    await expect(products.rows.first()).toBeVisible()
    await expect(products.newButton).toHaveCount(0)
    await expect(page.getByTestId(/^products-edit-/)).toHaveCount(0)
    await expect(page.getByTestId(/^products-delete-/)).toHaveCount(0)
  })

  test("the API answers 403 when the viewer creates a product", async ({ page }) => {
    const response = await page.request.post("/api/products", {
      data: { name: uniqueName("Blocked"), sku: uniqueSku(), price: 9.5, stock: 1, status: "active" },
    })

    expect(response.status()).toBe(403)
    expect(await response.json()).toEqual({ message: "Your role does not allow this action." })
  })
})
```

El primer test también comprueba `user-role`. El encabezado muestra el rol en una insignia. Esto prueba que la página realmente tiene sesión de viewer, y no un admin que quedó de antes.

## La alternativa

Puedes agregar un segundo test de preparación que inicie sesión como viewer y guarde `e2e/.auth/viewer.json`. Entonces los specs del viewer usan `test.use({ storageState: "e2e/.auth/viewer.json" })`, que vale la pena cuando muchos specs necesitan al viewer.

## Profundiza

### Por qué dos peticiones pueden tener cookies distintas

Una **cookie** es un trozo pequeño de texto que el navegador guarda y envía con cada petición al mismo sitio. Cuando inicias sesión, el servidor crea un id de sesión y lo devuelve como la cookie `shop_session`. El servidor guarda una lista en memoria: este id pertenece a este usuario. En cada petición, lee la cookie y encuentra al usuario.

Playwright guarda las cookies en un **contexto del navegador**. `page.request` usa las cookies del contexto de la página. El fixture `request` tiene las suyas. Por eso la lección dice que pases `page.request`.

Como el servidor guarda una lista de sesiones, un admin y un viewer pueden tener sesión iniciada al mismo tiempo. Cada uno tiene su propia cookie y su propia entrada en la lista.

### Una idea equivocada: "403 y 401 son lo mismo"

Los dos significan "no permitido", pero son distintos. En la tienda:

- **401** significa que el servidor no sabe quién eres. No tienes una sesión válida.
- **403** significa que el servidor te conoce, pero tu rol no puede hacer esto.

El viewer recibe 403. Un visitante sin cookie recibe 401. Este es un buen test extra, porque comprueba una regla distinta:

```ts
import { expect, test } from "../lib/test"

// Start signed out, with no cookie at all.
test.use({ storageState: { cookies: [], origins: [] } })

test("the API answers 401 when nobody is signed in", async ({ request }) => {
  const response = await request.get("/api/products")

  expect(response.status()).toBe(401)
  expect(await response.json()).toEqual({ message: "You must sign in." })
})
```

### Cómo aparece en el trabajo real de automatización QA

Los bugs de seguridad suelen verse así: un desarrollador oculta el botón Delete para un viewer, pero olvida comprobar el rol en el servidor. La página se ve bien, y un test que solo mira la interfaz pasa. El test de API de esta lección es el que falla. En QA, este tipo de problema se llama **control de acceso roto** (*broken access control*), y es uno de los bugs graves más comunes.

Mira cómo la tienda oculta los controles. La página de productos y la de pedidos leen el rol del usuario. Para un viewer, no dibujan la columna Actions en absoluto: faltan la celda del encabezado y los botones. Esa es una regla en la pantalla. El servidor tiene su propia regla en la API. Dos reglas en dos lugares pueden desalinearse. Por eso pruebas las dos.

### DRY y su costo

El `beforeEach` inicia sesión como viewer antes de cada test del grupo. Eso es **DRY**: *Don't Repeat Yourself* (no te repitas). Un **fixture** en Playwright es algo preparado que un test recibe; una sesión guardada en `viewer.json` es parecida, y quita el login de cada spec. El costo es más archivos de preparación y una cosa más que explicar a un compañero nuevo. Con dos tests, `beforeEach` es más simple. Con veinte, gana la sesión guardada. **YAGNI** dice: no construyas la sesión guardada el primer día para veinte specs que todavía no existen.

## Práctica

1. Crea `products/viewer.spec.ts` con el código de arriba.
2. Ejecútalo: `pnpm --filter practice-shop e2e e2e/products/viewer.spec.ts`.
3. Para ver que el spec puede fallar, inicia sesión temporalmente con `ADMIN` en lugar de `VIEWER` (agrega `ADMIN` al import). Ejecútalo. Lee el fallo. Deshaz el cambio.
4. Agrega un tercer test: el viewer abre `/orders` y no ve botones `orders-mark-paid-`. Usa una expresión regular y espera primero una fila.
5. Actualiza `COVERAGE.md`: la fila del rol viewer queda cubierta y se quita el hueco.

## Reto

Prueba al viewer en **pedidos**. Crea el archivo `apps/practice-shop/e2e/orders/orders-viewer.spec.ts`. Dos cosas deben cumplirse para un viewer: la página no ofrece acciones sobre los pedidos, y el servidor rechaza un cambio de pedido. También debes demostrar que un cambio rechazado no modificó el pedido. Elige tú el pedido para la comprobación por la API. Recuerda que los pedidos de la semilla los usan otros specs. Los pedidos pendientes son 1001, 1005 y 1009.

Está terminado cuando:

- Un test de interfaz inicia sesión como viewer, espera una fila de pedido y comprueba que no hay botones con ids que empiecen con `orders-mark-paid-`, `orders-mark-shipped-` y `orders-cancel-`.
- El mismo test de interfaz comprueba que el encabezado de la columna Actions no está en la página.
- Un test de API envía como viewer el cambio de estado `paid` para tu pedido pendiente, y espera 403 y el mensaje "Your role does not allow this action."
- El mismo test luego inicia sesión como admin en una sesión aparte, lee la lista de pedidos por la API y demuestra que tu pedido sigue en `pending`.
- Ejecutas el spec dos veces sin fallos. Luego inicias sesión en el primer test como `ADMIN` una vez, lo ves fallar y deshaces el cambio.

Vas a necesitar algo que esta lección no enseñó: cómo leer una lista del JSON de una respuesta y encontrar un elemento en ella, y cómo encontrar el encabezado de una tabla por su rol. Busca: `playwright APIResponse json`, `typescript array find` y `playwright getByRole columnheader`. Recuerda que el fixture `request` tiene un almacén de cookies separado del de `page.request`.

## Piénsalo bien

1. Predice el resultado. Cambias el spec del viewer para que inicie sesión como `ADMIN`, y borras la línea que espera la primera fila. El test solo hace `products.goto()` y luego `toHaveCount(0)` sobre los botones Delete. ¿Sale verde o rojo, y por qué?

<details><summary>Respuesta</summary>

Puede salir verde. Justo después de abrir la página, la lista no ha cargado, así que hay cero botones Delete, y `toHaveCount(0)` se cumple de inmediato. El test termina antes de que aparezcan las filas. Un resultado verde aquí no dice nada sobre las filas del admin. Por eso esperas la primera fila y por eso ejecutas el test una vez con el usuario equivocado.

</details>

2. Un compañero agrega este test al archivo del viewer. Pasa. Encuentra el bug.

```ts
test("the viewer cannot create a product", async ({ request }) => {
  const response = await request.post("/api/products", {
    data: { name: uniqueName("Blocked"), sku: uniqueSku(), price: 9.5, stock: 1, status: "active" },
  })
  expect(response.ok()).toBeFalsy()
})
```

<details><summary>Respuesta</summary>

El test usa el fixture `request`, que no tiene login. El servidor responde 401, no 403. `ok()` es falso para cualquier error, así que el test pasa por la razón equivocada. El test también pasaría si la regla del viewer estuviera rota de otra manera, por ejemplo con un error 500. Usa `page.request` para que se envíe la cookie del viewer, y comprueba `status()` contra 403.

</details>

3. La versión uno inicia sesión con `beforeEach` y `loginViaApi`. La versión dos guarda `e2e/.auth/viewer.json` una vez en un test de preparación. ¿Cuál eliges para esta suite, y qué te haría cambiar de opinión?

<details><summary>Respuesta</summary>

Con dos o tres tests del viewer, `beforeEach` es mejor. Se ve en el spec, y no hay un archivo extra ni un proyecto de preparación que explicar. La sesión guardada ahorra una petición por test, así que con muchos specs del viewer gana en velocidad y quita código repetido. El costo es que el proyecto de preparación crece, y un archivo viejo puede hacer fallar tests de formas confusas. Deciden el número de specs del viewer y el costo de un login.

</details>

4. El negocio cambia una regla: un viewer ahora puede editar un producto, pero no crear ni eliminar. ¿Qué debe cambiar en el spec del viewer, y en qué lugar el cambio puede esconder un bug?

<details><summary>Respuesta</summary>

El test debe dejar de comprobar que Edit está ausente. Debe comprobar que Edit está presente, y que una petición PUT del viewer tiene éxito. Las comprobaciones de New y Delete se quedan, y el test del 403 se queda para POST. El lugar peligroso es el servidor: la pantalla puede mostrar Edit mientras el servidor sigue respondiendo 403 a PUT. Por eso hace falta un test de API nuevo para PUT, no solo un cambio en el test de pantalla.

</details>

5. Explica a un compañero, en tres frases y sin la palabra "seguridad", por qué un test que solo comprueba botones ocultos no es suficiente.

<details><summary>Respuesta</summary>

Una buena respuesta dice que el navegador solo dibuja los botones, pero cualquiera puede enviar una petición al servidor sin usar la página. El servidor es el único lugar que decide lo que un usuario puede hacer. Por eso un test debe enviar la petición como ese usuario y comprobar que se rechaza. Cualquier respuesta que separe lo que muestra la pantalla de lo que permite el servidor es correcta.

</details>

6. Al mismo tiempo, un admin edita productos en un test y un viewer se prueba en otro. Los dos tienen sesión iniciada. ¿Puede el servidor atender a dos usuarios a la vez, y cómo haces esto en un solo test de Playwright?

<details><summary>Respuesta</summary>

El servidor puede. Guarda una lista de sesiones, y cada cookie corresponde a un usuario. En un test, un contexto del navegador tiene un almacén de cookies. Así que necesitas un segundo contexto para el segundo usuario, o usas el almacén de cookies separado del fixture `request` para las llamadas a la API. En esta suite los tests además corren de uno en uno (`workers: 1`), así que dos tests no se solapan, pero dos usuarios dentro de un mismo test sí pueden.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Cuál es la diferencia entre los estados HTTP 401 y 403?**
   - Busca: `http 401 unauthorized vs 403 forbidden`
   - Pruébalo: escribe un test desechable que envíe `GET /api/products` sin login, y `POST /api/products` como viewer. Imprime los dos valores de `response.status()` con `console.log`. Borra el archivo.
   - Una buena respuesta explica: qué significa cada código y un ejemplo de cuándo una API debe devolver cada uno

2. **¿Qué es el control de acceso basado en roles (RBAC)?**
   - Busca: `role based access control rbac explained`
   - Pruébalo: haz una tabla con dos roles (admin, viewer) como columnas y las acciones de la tienda (crear, editar, eliminar un producto; marcar, cancelar un pedido) como filas. Llena cada celda a mano en el navegador. Marca cada celda que no puedas decidir solo con la pantalla.
   - Una buena respuesta explica: cómo los roles se relacionan con los permisos, y cómo un tester puede comprobar que un rol está bien limitado

3. **¿Qué es el control de acceso roto (broken access control), y por qué está en la lista OWASP Top 10?**
   - Busca: `owasp top 10 broken access control`
   - Pruébalo: inicia sesión como viewer en el navegador. Escribe `/products/new` en la barra de direcciones. Llena el formulario y presiona Save. Anota lo que ves, y decide si la página es un bug o solo una pista que falta para el usuario.
   - Una buena respuesta explica: cuál es el riesgo, un ejemplo y cómo puede probarlo un ingeniero de QA

## Siguiente paso

En la siguiente lección llevas tu trabajo a un pull request.
