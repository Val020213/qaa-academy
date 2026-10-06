---
title: Preparar datos por la API
summary: Usa la API para crear datos de prueba, deja la interfaz para el único test sobre esa interfaz y aprende qué va a rechazar la API.
duration: 75 min
---

## Empieza con un acertijo

Escribes un test para la tienda. Necesita un producto con precio `0`. El formulario de producto rechaza un precio de 0: muestra "Price must be greater than 0."

Un compañero dice: "Sáltate el formulario. Manda el producto directo a la API. La API es la puerta de atrás, así que no tiene las reglas del formulario."

Otro compañero dice: "La API es el mismo código del servidor. También lo va a rechazar."

Uno de los dos tiene razón. Si es el segundo, el test tampoco puede conseguir el producto que quiere, y tienes una segunda pregunta: ¿qué debes hacer entonces?

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Decidir cuándo un test puede preparar datos por la API y cuándo debe usar la interfaz.
- Predecir qué responde la API a datos válidos e inválidos, con el código de estado.
- Explicar en qué se diferencian `page.request` y el *fixture* (recurso preparado) `request`.
- Explicar por qué existe un endpoint de reinicio solo para tests.

## Una regla

Un test trata de una sola cosa. En un test de borrado, la cosa es el botón de borrar. Crear el producto que se va a borrar no es la cosa.

Entonces la regla es: **la interfaz está bajo prueba solo en el test sobre esa interfaz.** Todo lo demás, el test lo prepara por la API.

Una **API** es la forma en que los programas hablan con el servidor, sin pantalla. Una petición a la API es más rápida que hacer clic en un formulario. También tiene menos pasos que pueden fallar.

Para conseguir un producto que borrar por la interfaz, abres el formulario, llenas cinco campos y haces clic en guardar. Un bug en el formulario rompe entonces tu test de borrado. Por la API es una sola petición, y solo la función de borrar puede romper el test.

Esto es **descomposición** aplicada a los tests. Divide el test en pasos: preparar, actuar, comprobar. Luego pregunta por cada paso: "¿Este paso es lo que estoy probando?". Si no, toma el camino más barato y seguro.

## Los helpers del cliente de API

Abre `apps/practice-shop/e2e/lib/fixtures/api-client.ts`. El comentario de arriba dice:

```ts
// The "request" fixture and "page.request" both carry the cookies of the
// saved admin session, so these helpers work as admin by default.
```

El archivo tiene tres *helpers* (funciones de ayuda). El primero inicia sesión:

```ts
export async function loginViaApi(
  request: APIRequestContext,
  user: { email: string; password: string }
): Promise<void> {
  const response = await request.post("/api/auth/login", {
    data: { email: user.email, password: user.password },
  })
  expect(response.ok()).toBeTruthy()
}
```

El segundo crea un producto. Usa `uniqueName` y `uniqueSku`, así que los datos son únicos. Puedes cambiar cualquier campo:

```ts
export async function createProduct(
  request: APIRequestContext,
  overrides: Partial<Omit<Product, "id">> = {}
): Promise<Product> {
  const response = await request.post("/api/products", {
    data: {
      name: uniqueName("Product"),
      sku: uniqueSku(),
      price: 19.99,
      stock: 10,
      status: "active",
      ...overrides,
    },
  })
  expect(response.status()).toBe(201)
  return (await response.json()) as Product
}
```

El helper comprueba que el estado sea `201`. Es el código HTTP para "creado". Si la API falla, el test se detiene aquí con un mensaje claro, no más tarde en la pantalla.

El tercero borra un producto:

```ts
export async function deleteProduct(request: APIRequestContext, id: number): Promise<void> {
  const response = await request.delete(`/api/products/${id}`)
  expect(response.status()).toBe(204)
}
```

El estado `204` significa "hecho, no hay nada que devolver".

### Predice antes de ejecutar

Mira `createProduct`. Son tres llamadas, y para cada una di el código de estado que esperas:

1. `createProduct(request, { stock: 0 })`
2. `createProduct(request, { stock: -1 })`
3. `createProduct(request, { price: 0.001 })`

Las reglas están en `apps/practice-shop/lib/validation.ts`. El stock debe ser un número entero, 0 o más. El precio debe ser mayor que 0.

La llamada 1 recibe `201`: 0 está permitido. La llamada 2 recibe `422`: está por debajo del límite. La llamada 3 también recibe `201`. La regla dice "mayor que 0", y 0.001 es mayor que 0. La tienda no tiene un precio mínimo sobre cero. Si eso es un bug es una pregunta de producto, y vas a encontrar este tipo de borde otra vez en la última lección de este módulo.

Una respuesta `422` tiene un cuerpo. Nombra el campo y el mensaje:

```json
{ "errors": { "stock": "Stock must be a whole number, 0 or more." } }
```

### De vuelta al acertijo

El segundo compañero tiene razón. La API y el formulario llaman a la misma función, `validateProduct`, así que un precio de 0 recibe un `422` en los dos. La API no es una puerta de atrás. Es la misma puerta, sin la pantalla alrededor.

Entonces tu test no puede crear un producto con precio 0, y no debería necesitarlo: la aplicación no lo permite. Si quieres probar cómo muestra la lista un precio raro, usa un valor positivo pequeño permitido, como `0.01`. Si la necesidad real es "qué dice el formulario con precio 0", eso es un test sobre el formulario, y usa la interfaz.

## Las cookies se comparten

El fixture `request` es un cliente para llamadas a la API. La configuración carga en él las cookies guardadas del admin, igual que en `page`. Así que la petición tiene la sesión iniciada como admin.

`page.request` es el mismo tipo de cliente, pero pertenece a la página. Usa las cookies del contexto del navegador de la página. Cuando una cookie cambia en uno, el otro lo ve. El fixture `request` tiene sus propias cookies. Un login con el fixture `request` no cambia el navegador.

Lo viste en el test de cerrar sesión: `loginViaApi(page.request, ADMIN)` le da al navegador una sesión sin abrir la página de login.

## El test de borrado

Este es el test de borrado de `apps/practice-shop/e2e/products/products.spec.ts`:

```ts
test("confirming in the dialog removes the product", async ({ page, request }) => {
  const product = await createProduct(request)
  const products = new ProductsPage(page)
  await products.goto()
  await expect(products.row(product.id)).toBeVisible()

  await products.delete(product.id)

  await expect(products.row(product.id)).toHaveCount(0)
  await expect(products.message).toContainText(product.name)
})
```

Léelo en orden.

1. `createProduct(request)` prepara el producto por la API.
2. El test abre la página y espera la fila. Una fila visible significa que la página está lista.
3. Los únicos pasos de interfaz son los que están bajo prueba: el clic y la confirmación.

El test no necesita limpieza. El propio test borra el producto. Otros tests dejan sus productos. Está bien: los nombres son únicos y la próxima ejecución reinicia los datos.

## El endpoint de reinicio

Mira `apps/practice-shop/app/api/test/reset/route.ts`:

```ts
// Test-only endpoint: puts the data back to its first state.
// A real project would never ship this to production, so it answers 404 there.
export async function POST() {
  if (process.env.NODE_ENV === "production" && !process.env.ENABLE_TEST_API) {
    return new NextResponse(null, { status: 404 })
  }
  resetStore()
  return NextResponse.json({ ok: true })
}
```

Una llamada a este endpoint devuelve todos los datos a los datos iniciales. El test de setup lo usa una vez por ejecución.

Existe solo para tests, por eso está bloqueado en producción. Un endpoint que borra todos los datos sería peligroso en un sistema real. En un proyecto real, pide a los desarrolladores una herramienta así solo para tu entorno de pruebas.

> **Cuidado:** Nunca apuntes tus tests a un sistema real de producción. Usa un entorno de pruebas que puedas reiniciar.

## Profundiza

### Por qué la API es más rápida y la interfaz es una capa encima

El formulario de la tienda no habla con el servidor de una forma especial. Cuando haces clic en Save (guardar), la página envía esta petición: `POST /api/products`. Es la misma petición que envía `createProduct`. El servidor hace el mismo trabajo para las dos.

Así que el camino de la interfaz tiene pasos extra. El navegador carga la página, React arranca, se escriben cinco campos, se hace clic en el botón, la página pasa a la lista y la lista carga de nuevo. Cualquiera de estos pasos puede ser lento o romperse. El camino de la API tiene un solo paso. Cuando solo necesitas que un producto exista, un paso es mejor que ocho.

### Una idea equivocada común: los datos de la API hacen el test menos real

Algunas personas dicen que un test es falso si los datos no vinieron de la pantalla. No es verdad. Un test necesita ser real en lo que comprueba. El test de borrado comprueba el flujo de borrado. No necesita probar que el formulario de crear funciona. Otro test, "a new product appears at the top of the list", lo hace.

Una segunda idea equivocada es la contraria: "la API acepta cualquier cosa". Como mostró el acertijo, no es así. Nunca escribes directo en los datos saltándote las reglas.

### Cómo aparece en el trabajo de QA: pon el estado en un override

`createProduct` tiene valores por defecto y acepta *overrides* (valores que reemplazan los de por defecto). Un test indica solo el campo que importa:

```ts
import { expect, test } from "../lib/test"
import { createProduct } from "../lib/fixtures/api-client"
import { ProductsPage } from "../lib/pages/products.page"

test("an archived product shows the archived badge", async ({ page, request }) => {
  const product = await createProduct(request, { status: "archived" })
  const products = new ProductsPage(page)
  await products.goto()
  await expect(products.row(product.id)).toBeVisible()

  await expect(page.getByTestId(`products-status-${product.id}`)).toHaveText("archived")
})
```

El cuerpo del producto, con nombre, SKU, precio y stock, se escribe una vez en el helper. El test muestra solo `status: "archived"`, así que el lector ve qué tiene de especial. Esto es *DRY*, y además mantiene el test legible.

### Un equilibrio

El helper de la API ata tus tests a la API. Si la API cambia, por ejemplo con un nuevo campo obligatorio, `createProduct` se rompe, y también todos los tests que lo usan. Lo arreglas en un solo lugar. Es un buen trato. Pero solo funciona cuando la API es estable y tu equipo te da acceso. Si no hay API, usa la interfaz para preparar y mantenla corta.

### Lee la respuesta, no solo el estado

Un código de estado dice "funcionó" o "no funcionó". El cuerpo dice qué pasó exactamente. Cuando pruebas con `request`, mira los dos. Pregúntate: si la API respondió `201` pero devolvió el precio equivocado, ¿qué línea lo notaría? `createProduct` devuelve el cuerpo, así que un test puede comparar `product.price` con lo que envió.

## Práctica

1. Abre `apps/practice-shop/e2e/lib/fixtures/api-client.ts`. Encuentra las tres líneas `expect` que comprueban la respuesta.
2. Crea el archivo `apps/practice-shop/e2e/products/api-practice.spec.ts` con este código:

```ts
import { expect, test } from "../lib/test"
import { createProduct, deleteProduct } from "../lib/fixtures/api-client"

test("a product made through the API can be read, then deleted", async ({ request }) => {
  const product = await createProduct(request)

  const found = await request.get(`/api/products/${product.id}`)
  expect(found.status()).toBe(200)

  await deleteProduct(request, product.id)

  const gone = await request.get(`/api/products/${product.id}`)
  expect(gone.status()).toBe(404)
})
```

3. Inicia la tienda con `pnpm shop:dev`. En otra terminal ejecuta:

```bash
pnpm shop:e2e products/api-practice.spec.ts
```

4. El test nunca abre una página del navegador. Mira qué tan rápido corre al lado de los tests de interfaz.
5. Escribe una frase: ¿por qué este test no necesita `uniqueName` en su propio código?
6. Revisa tus tres predicciones de "Predice antes de ejecutar". Agrega esta línea al inicio del archivo: `import { uniqueSku } from "../lib/helpers"`. Luego agrega este test al mismo archivo y ejecútalo:

```ts
test("the API answers the edge cases", async ({ request }) => {
  for (const change of [{ stock: 0 }, { stock: -1 }, { price: 0.001 }]) {
    const response = await request.post("/api/products", {
      data: { name: "Edge case", sku: uniqueSku(), price: 5, stock: 5, status: "draft", ...change },
    })
    console.log(JSON.stringify(change), response.status(), await response.text())
  }
})
```

7. Lee la salida. El test imprime el estado y el cuerpo para cada cambio. ¿El cuerpo del `422` se parece al JSON de arriba? ¿Cuál de tus predicciones estaba equivocada, si alguna?

## Reto

Encargo: la lista de productos muestra 10 productos por página. A los bugs les gusta vivir donde el total es un múltiplo exacto del tamaño de página, porque "la última página" es fácil de calcular mal. Vas a probar justo ese borde. Tu test hace que el total de productos sea un múltiplo exacto de 10, con la menor cantidad posible de productos nuevos, y luego recorre todas las páginas.

Crea el archivo `apps/practice-shop/e2e/challenges/pagination-edge.spec.ts`.

Está terminado cuando:

- El test lee el total real con `GET /api/products`, y crea solo los productos necesarios, con `createProduct`, para que el total sea un múltiplo de 10.
- `products-page` muestra `Page 1 of N` donde N es el total dividido entre 10. No hay una página extra vacía.
- El test hace clic en `products-next-page` hasta la última página. Después de cada clic, comprueba el texto de `products-page`.
- En la última página, `products-next-page` está deshabilitado, y la página muestra 10 filas.
- `pnpm shop:e2e challenges/pagination-edge.spec.ts --repeat-each 2` pasa las dos veces.

Vas a necesitar algo que esta lección no enseñó: cómo leer un número del cuerpo de una respuesta, cómo calcular cuántos productos faltan y cómo comprobar que un botón está deshabilitado. Busca: `playwright APIResponse json`, `javascript remainder operator`, `playwright toBeDisabled`, `playwright toHaveText regular expression`.

## Piénsalo bien

1. **Predice.** Los datos iniciales tienen 24 productos y una ejecución nueva parte de ellos. Un test llama `createProduct(request, { stock: 0, price: 0.01 })` una vez y abre `/products`. ¿Qué muestra `products-count` y qué muestra `products-page`? ¿Qué cambia si el test crea 6 productos en vez de 1?

<details><summary>Respuesta</summary>

El helper recibe `201`, porque stock 0 y precio 0.01 están del lado permitido de los dos límites. El total pasa a 25, así que el conteo muestra "25 products" y la página muestra "Page 1 of 3". Con 6 productos el total es 30. La página entonces muestra "Page 1 of 3" otra vez, y la última página tiene 10 filas, no 5. La forma del texto del conteo es la misma, y el número de páginas no creció. Este es el borde que pruebas en el reto.

</details>

2. **Encuentra el bug.** Este test a veces pasa y a veces falla. El código se ejecuta sin errores. ¿Qué está mal?

```ts
test("the new product is in the list", async ({ page, request }) => {
  const products = new ProductsPage(page)
  await products.goto()
  const product = await createProduct(request)

  await expect(products.row(product.id)).toBeVisible()
})
```

<details><summary>Respuesta</summary>

La lista se carga desde la API una vez, después de que la página arranca. El test crea el producto después de `goto`, así que hay una carrera (*race*). Si el producto existe antes de que la petición de la lista llegue al servidor, la fila aparece y el test pasa. Si la petición de la lista es más rápida, la fila nunca aparece y el test falla. La solución es crear primero el producto y luego abrir la página, para que la lista que carga ya contenga el producto.

</details>

3. **Dos versiones.** El test de borrado no deja nada atrás, pero otros tests dejan productos. La versión A agrega `afterEach` para borrar cada producto que el test hizo. La versión B los deja, porque el setup reinicia los datos en la próxima ejecución. ¿Cuál es mejor aquí y cuándo elegirías la otra?

<details><summary>Respuesta</summary>

La versión B es suficiente aquí, porque la tienda guarda los datos en memoria y `global.setup.ts` los reinicia al inicio de cada ejecución. La versión A agrega código y una petición más por test, y puede fallar por sí misma. Elige A cuando los tests corren en un entorno compartido que nunca se reinicia, o cuando lo que quedó cambia lo que otros tests ven, como un conteo de todos los productos. Un punto medio razonable es limpiar solo en los tests donde lo que queda importa.

</details>

4. **Qué se rompe si.** Los desarrolladores agregan un campo obligatorio, `category`, al producto. ¿Qué tests fallan, en qué línea y cuántos lugares debes editar?

<details><summary>Respuesta</summary>

Todos los tests que llaman `createProduct` fallan en la línea de `createProduct`, porque la API responde `422` y el helper espera `201`. El fallo es claro y temprano, y lo arreglas en un solo lugar: agrega una `category` por defecto al helper. Los tests del formulario también fallan, pero por otra razón, porque llenan el formulario y el campo nuevo queda vacío. Editas esos tests por separado. El helper es la razón por la que el primer grupo cuesta una sola edición.

</details>

5. **Explícalo.** Un gerente dice: "Crear el producto por la API es hacer trampa. Un usuario real usa el formulario". Responde en tres frases sin usar la palabra "más rápido".

<details><summary>Respuesta</summary>

Una buena respuesta: "Cada test comprueba un solo comportamiento, y el test de borrado comprueba el borrado, no el formulario. Si el formulario se rompe, el test de borrado fallaría por una razón que no tiene nada que ver con borrar, y el equipo buscaría en el lugar equivocado. Otro test ya comprueba el formulario, así que el formulario sigue cubierto, una vez y en el lugar correcto." La idea principal es que cada test debe fallar por una sola razón.

</details>

6. **Caso límite.** Supón que la configuración permitiera cuatro workers, y los tests corrieran al mismo tiempo. Cada worker carga `helpers.ts` y empieza `uniqueSku` en su propio número al azar entre 1000 y 9999. ¿Qué puede salir mal, con qué frecuencia y cómo se vería el fallo?

<details><summary>Respuesta</summary>

Dos workers pueden obtener números de SKU que se tocan, porque cada uno cuenta hacia arriba desde su propio inicio al azar. Entonces el segundo `createProduct` recibe `422`, con "This SKU is already used by another product." La probabilidad es pequeña. Con cuatro workers y unos veinte productos por worker, la probabilidad de al menos un choque es de aproximadamente 2.6 en 100, y a lo largo de muchas ejecuciones va a pasar, y se verá aleatorio. Es un test *flaky* con una causa real. Hoy la configuración usa un solo worker, así que no puede pasar. Si algún día agregas workers, dale a cada worker su propio rango de números, por ejemplo usando el número del worker en el SKU.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué significan los códigos de estado HTTP 201, 204, 401, 403, 404 y 422?**
   - Busca: `HTTP status codes MDN 422 403`
   - Pruébalo: en un archivo de spec de borrador, usa el fixture `request` para llamar `GET /api/products/99999`. Luego agrega `test.use({ storageState: { cookies: [], origins: [] } })` al inicio de un segundo archivo de test y llama `GET /api/products`. Imprime `response.status()` en cada uno.
   - Una buena respuesta explica: el significado de cada código en una frase y cuáles devuelve la tienda para qué problema.

2. **¿Qué hacen los métodos HTTP GET, POST, PUT y DELETE en una API REST?**
   - Busca: `REST API methods GET POST PUT DELETE`
   - Pruébalo: abre la tienda en tu navegador, luego DevTools, luego la pestaña Network. Edita un producto y guarda. Encuentra la petición en la lista y lee su método, su dirección y su respuesta.
   - Una buena respuesta explica: qué hace cada método y cuál usa la tienda para crear, cambiar y borrar un producto.

3. **¿Por qué los equipos construyen endpoints solo para tests, como un reinicio, y qué riesgos traen?**
   - Busca: `test-only endpoints security risk production`
   - Pruébalo: en un spec de borrador, llama `POST /api/test/reset`, luego `GET /api/products` e imprime el `total`. Ejecútalo solo cuando no haya otro test corriendo. Luego di por qué tu propia sesión sigue funcionando después del reinicio.
   - Una buena respuesta explica: por qué el endpoint ayuda a los tests y cómo un equipo lo mantiene lejos de producción.

## Siguiente paso

En la próxima lección aprendes por qué los tests se vuelven inestables y cómo encontrar la causa.
