---
title: HTTP en diez minutos
summary: Aprende peticiones, respuestas, métodos, códigos de estado y JSON, y léelos en el panel Network de la tienda de práctica.
duration: 45 min
---

## Objetivo

- Explicar cliente, servidor, petición y respuesta.
- Nombrar los métodos HTTP y las familias de códigos de estado.
- Reconocer los códigos de estado que un tester ve con más frecuencia.
- Leer un cuerpo JSON.
- Encontrar una petición en el panel Network y leerla.

## Cliente y servidor

Un **cliente** pide algo. Un **servidor** responde. Tu navegador es un cliente. La computadora que guarda los datos es el servidor.

Cuando haces clic en un botón que necesita datos, el navegador envía una **petición** (*request*) al servidor. El servidor devuelve una **respuesta** (*response*). **HTTP** es el conjunto de reglas para estos mensajes.

Aquí, ambos se ejecutan en tu computadora. La tienda de práctica es el servidor, en `http://localhost:5190`.

## La petición

Una petición tiene cuatro partes:

- **Método**: lo que quieres hacer, como `GET`.
- **URL**: adónde enviarla, como `/api/products`.
- **Encabezados** (*headers*): información extra, como el tipo de los datos.
- **Cuerpo** (*body*): los datos que envías. Muchas peticiones no tienen cuerpo.

## La respuesta

Una respuesta tiene estas partes:

- **Código de estado**: un número que dice si funcionó.
- **Encabezados**: información extra.
- **Cuerpo**: los datos que recibes.

## Métodos

El método dice qué hace la petición. Estos cinco son los más comunes:

| Método | Significado | Ejemplo |
| --- | --- | --- |
| `GET` | Leer datos | Obtener la lista de productos |
| `POST` | Crear algo, o enviar una acción | Iniciar sesión, crear un producto |
| `PUT` | Reemplazar algo con datos nuevos | Guardar el formulario de edición de un producto |
| `PATCH` | Cambiar una parte de algo | Cambiar el estado de un pedido |
| `DELETE` | Quitar algo | Borrar un producto |

Una petición `GET` no debe cambiar datos. Es seguro repetirla.

## Códigos de estado

El **código de estado** es lo primero que debes mirar. El primer dígito indica la familia:

| Familia | Significado |
| --- | --- |
| 2xx | Éxito |
| 3xx | Redirección: ir a otra dirección |
| 4xx | Error del cliente: la petición es incorrecta o no está permitida |
| 5xx | Error del servidor: el servidor falló |

Los códigos que verás con más frecuencia:

| Código | Nombre | Significado |
| --- | --- | --- |
| 200 | OK | Funcionó, y hay un cuerpo |
| 201 | Created | Se creó un elemento nuevo |
| 204 | No Content | Funcionó, y no hay cuerpo. La tienda de práctica lo devuelve cuando borras un producto |
| 401 | Unauthorized | No has iniciado sesión |
| 403 | Forbidden | Has iniciado sesión, pero tu rol no tiene permiso |
| 404 | Not Found | La cosa no existe |
| 409 | Conflict | La petición choca con el estado actual. En la tienda, un pedido no puede volver a un estado anterior |
| 422 | Unprocessable Content | Los datos no son válidos. La tienda lo devuelve para un formulario de producto incorrecto |
| 500 | Internal Server Error | El servidor tiene un bug |

Un buen tester comprueba el código de estado y el cuerpo. Un código 4xx no siempre es un bug. Es la respuesta correcta a una petición incorrecta.

## JSON

La mayoría de las API envían los datos como **JSON**. JSON es texto que se parece a un objeto de TypeScript. Conoces esta forma del módulo 1.

Esta es la respuesta real de la tienda después de un inicio de sesión correcto:

```json
{
  "name": "Ada Admin",
  "email": "admin@qa-shop.test",
  "role": "admin"
}
```

Los nombres van entre comillas dobles. El texto va entre comillas dobles. Una lista usa corchetes.

## La API de la tienda de práctica

Las rutas de la API están en `apps/practice-shop/app/api`. Algunas de ellas:

| Método y URL | Qué hace |
| --- | --- |
| `POST /api/auth/login` | Inicia sesión. Devuelve 401 si la contraseña es incorrecta |
| `GET /api/products` | Lista productos. Devuelve 401 sin una sesión |
| `POST /api/products` | Crea un producto. Devuelve 201, 403 o 422 |
| `GET /api/stats` | Números para el dashboard. Espera 1,2 segundos a propósito |

El usuario viewer puede leer, pero recibe 403 al crear, editar o borrar.

## Profundiza

### Por qué funciona así: métodos seguros y repetibles

HTTP le da una promesa a cada método. Un `GET` solo lee, así que puedes repetirlo. Un `DELETE` cambia datos, pero hacerlo dos veces deja el mismo estado final: la cosa ya no está. Un `POST` normalmente crea una cosa nueva cada vez, así que hacerlo dos veces crea dos. Estas promesas importan. Un navegador puede repetir un `GET` por sí mismo, y te pregunta antes de repetir un `POST`.

Puedes ver la promesa de `DELETE` en la tienda. El estado es el mismo después de ambas llamadas, pero las respuestas son distintas:

```ts
import { expect, test } from "../lib/test"
import { createProduct } from "../lib/fixtures/api-client"

test("deleting a product twice gives 204, then 404", async ({ request }) => {
  const product = await createProduct(request)

  const first = await request.delete(`/api/products/${product.id}`)
  const second = await request.delete(`/api/products/${product.id}`)

  expect(first.status()).toBe(204)
  expect(second.status()).toBe(404)
})
```

Guárdalo como `apps/practice-shop/e2e/products/delete-twice.spec.ts`. La primera llamada quita el producto. La segunda no encuentra nada.

### Una idea equivocada común: "el código de estado lo dice todo"

Un código de estado dice si la petición funcionó. No dice que los datos sean correctos. Un buen test de API comprueba ambas cosas:

```ts
import { expect, test } from "../lib/test"

test.use({ storageState: { cookies: [], origins: [] } })

test("the API rejects a wrong password", async ({ request }) => {
  const response = await request.post("/api/auth/login", {
    data: { email: "admin@qa-shop.test", password: "wrong" },
  })

  expect(response.status()).toBe(401)
  expect(await response.json()).toEqual({ message: "Wrong email or password." })
})
```

Guárdalo como `apps/practice-shop/e2e/auth/login-api.spec.ts`. La línea con `test.use` hace que el test empiece sin sesión iniciada, como hace `auth.spec.ts`.

Fíjate en la dirección: `/api/auth/login`, no `http://localhost:5190/api/auth/login`. La dirección del servidor se escribe una sola vez, como `baseURL` en `playwright.config.ts`. Cada test usa una ruta corta. Esta es la idea llamada **DRY** (*Don't Repeat Yourself*, no te repitas): un dato, un lugar. Si el puerto cambia, cambias una línea. El *helper* (función de ayuda) `createProduct` es otro caso: muchos tests necesitan un producto, y todos usan un solo helper.

### Un equilibrio: un test de API es rápido, pero no es toda la historia

El test de API de arriba es rápido y no depende de la página. Pero no prueba que la página muestre el mensaje al usuario. Usa tests de API para las reglas del servidor. Usa tests de UI para lo que ve el usuario. Una buena suite tiene ambos.

## Práctica

1. Inicia la tienda en una terminal. Déjala en ejecución:

```bash
pnpm shop:dev
```

2. Abre `http://localhost:5190` en Chrome o Edge. Pulsa `F12`, abre **Network**, activa **Preserve log** y haz clic en **Fetch/XHR**.
3. Inicia sesión con `admin@qa-shop.test` y `Admin123!`.
4. Busca la petición `login`. Comprueba: el método es `POST`, el estado es `200`. Abre **Payload** para ver los datos que enviaste. Abre **Response** para ver el JSON.
5. Busca la petición `stats`. Es `GET`. Mira su **Time**. Es de unos 1,2 segundos. ¿Por qué?
6. Haz clic en **Products** en la página. Busca la petición que empieza con `products?`. Lee la URL completa en **Headers**. Abre **Response** y busca `items`, `total` y `pageSize`.
7. Haz clic en **New product** (Nuevo producto), deja el formulario vacío y haz clic en **Save** (Guardar).
8. Busca la petición `products`. Es un `POST`. Comprueba que el estado es `422`. Lee la **Response**. Enumera un mensaje por cada campo incorrecto.
9. Compara los mensajes con los textos rojos de la página. Son los mismos.
10. Haz clic en **Sign out** (Cerrar sesión). Haz clic en el filtro **All** del panel Network. Abre `http://localhost:5190/products`. La página te envía a la página de login. Busca la petición `products` con estado `307`. Es una redirección (3xx). Lee el encabezado `Location`.
11. Detén la tienda con `Ctrl + C`.

## Comprueba lo que sabes

1. ¿Cuál es la diferencia entre 401 y 403?

<details><summary>Respuesta</summary>

401 significa que no has iniciado sesión. 403 significa que has iniciado sesión, pero tu rol no tiene permiso para hacer esto.

</details>

2. ¿Qué método crea un elemento nuevo y qué código de estado esperas?

<details><summary>Respuesta</summary>

`POST`, y `201 Created`.

</details>

3. Un test envía datos no válidos y el servidor devuelve 422. ¿Es un bug?

<details><summary>Respuesta</summary>

No. Es la respuesta correcta. El servidor rechaza los datos no válidos. Sería un bug si el servidor devolviera 200 o 500.

</details>

4. ¿Dónde lees en las DevTools el JSON que envió el servidor?

<details><summary>Respuesta</summary>

En el panel Network: haz clic en la petición y abre la pestaña Response.

</details>

5. Un servidor responde `200 OK` a `POST /api/products`. El cuerpo es `{ "errors": { "sku": "This SKU is already used by another product." } }`. ¿Qué está mal en esta respuesta y qué código de estado es el correcto?

<details>
<summary>Respuesta</summary>

El estado dice "éxito", pero el cuerpo dice que la petición falló. Un cliente o un test que comprueba solo el estado pensará que se creó un producto. El código correcto es `422`, que significa que los datos no son válidos. La tienda ya lo hace así.

</details>

6. Tu test envía `GET /api/products` y recibe `401`. En el navegador, la misma petición funciona. Da una razón probable.

<details>
<summary>Respuesta</summary>

El navegador tiene la cookie de sesión de tu inicio de sesión, y el test no. El servidor necesita una sesión para esta ruta, así que sin la cookie responde 401, que significa "no has iniciado sesión". La solución es iniciar sesión primero en el test, o empezar el test con una sesión guardada.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué significa que un método HTTP sea "idempotente" y cuáles lo son?**
   - Busca: `HTTP idempotent methods MDN`
   - Una buena respuesta explica: el significado con un ejemplo y por qué `PUT` es idempotente y `POST` no.
2. **¿Cuál es la diferencia entre los códigos de estado HTTP 301, 302 y 307?**
   - Busca: `HTTP redirect 301 302 307 difference`
   - Una buena respuesta explica: qué redirecciones son permanentes y cuáles conservan el método de la petición.
3. **¿Qué debe comprobar un tester en una respuesta de API además del código de estado?**
   - Busca: `API testing what to verify response`
   - Una buena respuesta explica: al menos tres comprobaciones, como el cuerpo, los encabezados y el tiempo de respuesta.

## Siguiente paso

En la próxima lección aprendes cómo funcionan los formularios, los eventos y el estado, y qué recuerda una página después de recargar.
