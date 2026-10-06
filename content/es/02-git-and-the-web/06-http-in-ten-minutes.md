---
title: HTTP en diez minutos
summary: Aprende peticiones, respuestas, métodos, códigos de estado y JSON, y léelos en el panel Network de la tienda de práctica.
duration: 80 min
---

## Empieza con un acertijo

Una biblioteca muestra una lista de libros en una pantalla. La página va lenta, así que pulsas **Quitar "Libro 7"** dos veces. Luego, con la misma prisa, pulsas **Agregar "Dune"** dos veces.

Ahora mira la lista. ¿"Libro 7" ya no está? ¿Cuántas copias de "Dune" hay? ¿Y qué mensaje da el bibliotecario en la segunda pulsación de cada botón?

Los dos botones se parecen, pero un buen sistema los trata de forma distinta. Piensa qué acción es segura de repetir y cuál no.

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Predecir el método y el código de estado de una acción que describes con palabras.
- Decidir qué familia de códigos de estado corresponde a un fallo y de quién es la culpa.
- Explicar por qué repetir algunas acciones es seguro y repetir otras no.
- Leer el cuerpo de un JSON y encontrar el campo que necesitas.
- Encontrar una petición en el panel Network y leer su método, su estado y su respuesta.

## Cliente y servidor

Un **cliente** pide algo. Un **servidor** responde. Piensa en un restaurante: tú eres el cliente, el mesero lleva tu pedido y la cocina es el servidor. Tu navegador es un cliente. El computador que guarda los datos es el servidor.

Cuando haces clic en un botón que necesita datos, el navegador envía una **petición** (*request*) al servidor. El servidor devuelve una **respuesta** (*response*). **HTTP** es el conjunto de reglas de estos mensajes.

Aquí, los dos corren en tu computador. La tienda de práctica es el servidor, en `http://localhost:5190`.

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

El método dice qué hace la petición. En la biblioteca, `GET` es "muéstrame la lista". `POST` es "agrega un libro nuevo". `PUT` es "reemplaza la ficha de este libro por una ficha nueva". `PATCH` es "corrige una línea de la ficha". `DELETE` es "saca este libro de la lista".

| Método | Significado | Ejemplo |
| --- | --- | --- |
| `GET` | Leer datos | Obtener la lista de productos |
| `POST` | Crear algo o enviar una acción | Iniciar sesión, crear un producto |
| `PUT` | Reemplazar algo con datos nuevos | Guardar el formulario de edición de un producto |
| `PATCH` | Cambiar una parte de algo | Cambiar el estado de un pedido |
| `DELETE` | Quitar algo | Eliminar un producto |

Una petición `GET` no debe cambiar datos. Es segura de repetir.

Este es el caso que se rompe si ignoras la regla. Imagina una tienda donde el enlace `/delete-everything` es un `GET`. Un navegador puede cargar enlaces antes de que hagas clic, para ir más rápido. Un robot de búsqueda sigue todos los enlaces de una página. Los dos borrarían los datos, y nadie pulsó un botón. Por eso una petición que cambia datos debe usar `POST`, `PUT`, `PATCH` o `DELETE`.

## Códigos de estado

El **código de estado** es lo primero que debes mirar. El primer dígito dice la familia:

| Familia | Significado |
| --- | --- |
| 2xx | Éxito |
| 3xx | Redirección: ve a otra dirección |
| 4xx | Error del cliente: la petición está mal o no está permitida |
| 5xx | Error del servidor: el servidor falló |

Volvamos al restaurante. Un 4xx es "tu pedido está mal": "no tenemos ese plato", "este salón es solo para el personal", "no escribiste el número de mesa". Un 5xx es "es culpa nuestra": "la cocina se está quemando". El primer dígito te dice quién debe arreglarlo.

Mira qué estado muestran las DevTools después de una contraseña incorrecta.

![Una contraseña incorrecta envía una petición login, y Network en las DevTools muestra el estado 401.](/clips/devtools-network.webm)

Los códigos que verás con más frecuencia:

| Código | Nombre | Significado |
| --- | --- | --- |
| 200 | OK | Funcionó y hay un cuerpo |
| 201 | Created | Se creó un elemento nuevo |
| 204 | No Content | Funcionó y no hay cuerpo. La tienda de práctica lo devuelve cuando eliminas un producto |
| 401 | Unauthorized | No has iniciado sesión |
| 403 | Forbidden | Iniciaste sesión, pero tu rol no tiene permiso |
| 404 | Not Found | La cosa no existe |
| 409 | Conflict | La petición choca con el estado actual. En la tienda, un pedido no puede volver a un estado anterior |
| 422 | Unprocessable Content | Los datos no son válidos. La tienda lo devuelve cuando el formulario de producto está mal |
| 500 | Internal Server Error | El servidor tiene un bug |

Un código 4xx no siempre es un bug. Es la respuesta correcta a una mala petición.

### Un experimento: ¿qué esperas?

Iniciaste sesión en la tienda como admin. Pides la página 999 de la lista de productos. La tienda tiene menos de 999 páginas. ¿Qué estado esperas? ¿404, porque no existe la página 999? ¿O algo distinto?

Puedes probarlo. Abre la tienda, inicia sesión, abre las DevTools y escribe esto en la Console:

```text
> await (await fetch("/api/products?page=999")).json()
```

La respuesta es `200`, con `items` como una lista vacía y `total` mostrando todavía el número real de productos. La tienda no trata "la página 999" como algo que falta. La trata como una pregunta válida con una respuesta vacía. Ahora adivina una más difícil: ¿qué devuelve `?page=abc`? El código usa la página 1 cuando el número no es válido, así que obtienes la primera página y la respuesta también es `200`. No toda petición extraña recibe un 4xx. La regla está escrita en el código del servidor, y un tester debe descubrir cuál es.

## JSON

La mayoría de las API envían datos como **JSON**. JSON es texto que se parece a un objeto de JavaScript. Conoces esta forma del módulo 1. La misma forma puede describir un perro, una canción o un producto.

```json
{
  "name": "Rex",
  "age": 3,
  "tricks": ["sit", "roll"]
}
```

Los nombres van entre comillas dobles. El texto va entre comillas dobles. Una lista usa corchetes. No hay coma al final ni comentarios.

Adivina qué pasa cuando le pides a JavaScript que lea `{ name: 'Rex' }`. Los nombres no tienen comillas y el texto tiene comillas simples. El resultado es un `SyntaxError`: el texto es un objeto de JavaScript, pero no es un JSON válido. Adivina también qué hace `JSON.stringify` con un campo cuyo valor es `undefined`. El campo se descarta. Una fecha se convierte en texto.

Esta es la respuesta real de la tienda después de un inicio de sesión correcto:

```json
{
  "name": "Ada Admin",
  "email": "admin@qa-shop.test",
  "role": "admin"
}
```

## La API de la tienda de práctica

Las rutas de la API están en `apps/practice-shop/app/api`. Algunas de ellas:

| Método y URL | Qué hace |
| --- | --- |
| `POST /api/auth/login` | Inicia sesión. Devuelve 401 con una contraseña incorrecta |
| `GET /api/products` | Lista los productos. Devuelve 401 sin una sesión |
| `POST /api/products` | Crea un producto. Devuelve 201, 403 o 422 |
| `DELETE /api/products/<id>` | Elimina un producto. Devuelve 204, o 404 si no existe |
| `GET /api/stats` | Números para el dashboard. Espera 1,2 segundos a propósito |

El usuario viewer puede leer, pero recibe 403 al crear, editar o eliminar.

### De vuelta al acertijo

Quitar "Libro 7" dos veces deja la misma lista: el libro ya no está. Solo cambia el mensaje. La primera pulsación funciona, y la segunda no encuentra nada que quitar. Agregar "Dune" dos veces crea dos copias, porque cada agregado es algo nuevo. Esta es la promesa de cada método. `DELETE` es seguro de repetir en su resultado. `POST` no lo es. Por eso un navegador pregunta "¿Quieres volver a enviar el formulario?" antes de repetir un `POST`.

## Profundiza

### Por qué funciona así: métodos seguros y repetibles

HTTP le da una promesa a cada método. Un `GET` solo lee, así que puedes repetirlo. Un `DELETE` cambia datos, pero hacerlo dos veces deja el mismo estado final: la cosa ya no está. Un `POST` normalmente crea una cosa nueva cada vez, así que hacerlo dos veces crea dos. Estas promesas importan. Un navegador puede repetir un `GET` por sí solo, y te pregunta antes de repetir un `POST`.

Puedes ver la promesa de `DELETE` en la tienda. El estado es el mismo después de las dos llamadas, pero las respuestas son distintas:

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

Guárdalo como `apps/practice-shop/e2e/products/delete-twice.spec.ts`. La primera llamada elimina el producto. La segunda no encuentra nada.

### Una idea equivocada común: "el código de estado lo dice todo"

Un código de estado dice si la petición funcionó. No dice que los datos sean correctos. Un buen test de API comprueba las dos cosas:

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

Guárdalo como `apps/practice-shop/e2e/auth/login-api.spec.ts`. La línea con `test.use` hace que el test empiece sin sesión, como lo hace `auth.spec.ts`.

Fíjate en la dirección: `/api/auth/login`, y no `http://localhost:5190/api/auth/login`. La dirección del servidor se escribe una sola vez, como `baseURL` en `playwright.config.ts`. Todos los tests usan una ruta corta. Esta es la idea llamada **DRY** (*Don't Repeat Yourself*, no te repitas): un dato, un lugar. Si el puerto cambia, cambias una línea. El *helper* (función de ayuda) `createProduct` es otro caso: muchos tests necesitan un producto, y todos usan un solo helper.

### Un equilibrio: un test de API es rápido, pero no es toda la historia

El test de API de arriba es rápido y no depende de la página. Pero no prueba que la página le muestre el mensaje al usuario. Usa tests de API para las reglas del servidor. Usa tests de UI para lo que ve el usuario. Una buena *suite* tiene los dos.

## Práctica

1. Inicia la tienda en una terminal. Déjala corriendo:

```bash
pnpm shop:dev
```

2. Abre `http://localhost:5190` en Chrome o Edge. Pulsa `F12`, abre **Network**, activa **Preserve log** y haz clic en **Fetch/XHR**.
3. Inicia sesión con `admin@qa-shop.test` y `Admin123!`.
4. Busca la petición `login`. Comprueba: el método es `POST`, el estado es `200`. Abre **Payload** para ver los datos que enviaste. Abre **Response** para ver el JSON.
5. Busca la petición `stats`. Es un `GET`. Mira su **Time**. Es de unos 1,2 segundos. ¿Por qué?
6. Haz clic en **Products** en la página. Busca la petición que empieza con `products?`. Lee la URL completa en **Headers**. Abre **Response** y busca `items`, `total` y `pageSize`.
7. Haz clic en **New product** (nuevo producto), deja el formulario vacío y haz clic en **Save** (guardar).
8. Busca la petición `products`. Es un `POST`. Comprueba que el estado sea `422`. Lee la **Response**. Lista un mensaje por cada campo incorrecto.
9. Compara los mensajes con los textos rojos de la página. Son los mismos.
10. Haz clic en **Sign out** (cerrar sesión). Haz clic en el filtro **All** del panel Network. Abre `http://localhost:5190/products`. La página te envía a la página de login. Busca la petición `products` con estado `307`. Es una redirección (3xx). Lee el encabezado `Location`.
11. Detén la tienda con `Ctrl + C`.

## Reto

Escribe las reglas de la API de la tienda como una tabla de datos, y deja que un bucle convierta cada fila en un test. Cada fila dice quién pide, qué método, qué dirección, qué cuerpo y qué estado esperas. Elige tú las reglas. Tú decides cuáles seis o más reglas son las más importantes de proteger.

**Está terminado cuando:**

1. Ejecutas `pnpm shop:e2e challenges/api-status-table` y todos los tests pasan.
2. La tabla tiene al menos seis filas. Juntas esperan un 401, un 403, un 404, un 422 y al menos un estado 2xx.
3. El título de cada test se construye a partir de su fila, por ejemplo `viewer POST /api/products gives 403`, para que un fallo nombre la regla que se rompió.
4. Ninguna fila depende de otra. Una fila que necesita un producto crea el suyo.
5. Cambias un número esperado a propósito, ves el título que falla y luego lo arreglas.

Vas a necesitar algo que esta lección no enseñó: cómo crear muchos tests a partir de un array y cómo iniciar un test como el viewer. Para un test sin sesión, reutiliza el `storageState` vacío del ejemplo anterior. Busca: `playwright parameterized tests loop` y `playwright test.use storageState`. El archivo `apps/practice-shop/e2e/lib/fixtures/api-client.ts` ya tiene helpers que puedes leer y reutilizar.

Crea tú mismo el archivo `apps/practice-shop/e2e/challenges/api-status-table.spec.ts`. Importa desde `../lib/test`. No copies una solución de ningún lado. Lee el código de las rutas en `apps/practice-shop/app/api` para descubrir qué devuelve realmente cada regla.

## Piénsalo bien

1. Iniciaste sesión como admin. Predice el estado y el campo `page` de tres llamadas: `GET /api/products?page=999`, `GET /api/products?page=abc` y `GET /api/products?page=-5`. Explica por qué.

<details>
<summary>Respuesta</summary>

Las tres devuelven `200`. Con `page=999` la lista `items` está vacía, porque no hay tantos productos. Con `abc` y `-5` el servidor vuelve a la página 1, así que `page` es `1` e `items` trae los primeros productos. El código de la ruta convierte un número inválido en 1 y nunca devuelve un error para esto. No puedes adivinar estas reglas por el nombre de la API. Debes leer el código o probarlo.

</details>

2. Un test elimina un producto y luego comprueba la respuesta:

```ts
const response = await request.delete(`/api/products/${product.id}`)
expect(response.status()).toBe(204)
expect(await response.json()).toEqual({})
```

La comprobación del estado pasa, pero el test falla. ¿Por qué?

<details>
<summary>Respuesta</summary>

El estado `204` significa "No Content": la respuesta no tiene cuerpo. Leer `json()` de un cuerpo vacío lanza un error, así que el test falla en la última línea. El test pide algo que, según las reglas de HTTP, no existe. La solución es quitar esa línea, o comprobar el estado con otra petición.

</details>

3. Después de eliminar puedes comprobar de dos maneras. Versión A: esperar `204`. Versión B: esperar `204`, luego hacer `GET` del producto y esperar `404`. Las dos funcionan. ¿Cuál prefieres y qué te haría elegir la otra?

<details>
<summary>Respuesta</summary>

La versión B prueba el efecto, no solo la promesa: el producto de verdad ya no está. Cuesta una petición más. Usa la versión A cuando muchos otros tests ya prueban que eliminar funciona, y este test trata de otra cosa, como el rol. Elige la B cuando lo que pruebas es la eliminación misma.

</details>

4. Un desarrollador agrega el enlace `GET /api/products/5/delete`, que elimina el producto 5. ¿Qué puede romperse, aunque nadie haga clic en el enlace?

<details>
<summary>Respuesta</summary>

Se promete que un `GET` es seguro, así que navegadores, robots y herramientas pueden llamarlo sin una persona. Un navegador que carga enlaces por adelantado, o un robot de búsqueda, podría eliminar productos. Además, un tester que repita todas las llamadas `GET` para revisarlas borraría datos. El método debe ser `DELETE`, porque la promesa del método le dice a cada herramienta qué es seguro.

</details>

5. Explica a un colega la diferencia entre 401 y 403 en tres frases. No uses las palabras "iniciar sesión" ni "rol". Usa un cine o un tren si te ayuda.

<details>
<summary>Respuesta</summary>

Una respuesta modelo: En un cine, 401 es "no sé quién eres, muéstrame tu entrada". 403 es "sé quién eres, pero tu entrada no es para esta sala". La diferencia importa en los tests, porque el 401 se arregla consiguiendo una sesión, y el 403 solo lo arregla un usuario con más permisos.

</details>

6. La tienda responde `200` con una lista vacía para la página 999. Otro diseño responde `404`. ¿Cuál es mejor?

<details>
<summary>Respuesta</summary>

No hay una sola respuesta correcta. Un `200` con una lista vacía es simple para el código de la página: dibuja "sin resultados". Un `404` dice que la página no existe, lo que ayuda a una API que debe decirle a un robot que se detenga. Depende de quién usa la API y de qué hace la página con una respuesta vacía. Lo importante es que la decisión esté escrita y que los tests la comprueben.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué significa que un método HTTP sea "idempotente" y cuáles lo son?**
   - Busca: `HTTP idempotent methods MDN`
   - Pruébalo: en la tienda, crea un producto en la página. Lee su id en la dirección. En la Console, ejecuta `fetch("/api/products/<id>", { method: "DELETE" }).then((r) => r.status)` dos veces, con tu id real, y anota los dos números.
   - Una buena respuesta explica: el significado con un ejemplo, por qué `PUT` es idempotente y `POST` no, y tus dos números.
2. **¿Cuál es la diferencia entre los códigos de estado HTTP 301, 302 y 307?**
   - Busca: `HTTP redirect 301 302 307 difference`
   - Pruébalo: con la tienda corriendo y sin sesión, ejecuta `curl.exe -i http://localhost:5190/products` en PowerShell. Lee la primera línea y la línea `location`.
   - Una buena respuesta explica: qué redirecciones son permanentes, cuáles mantienen el método de la petición y qué imprimió tu comando.
3. **¿Qué debe comprobar un tester en la respuesta de una API además del código de estado?**
   - Busca: `API testing what to verify response`
   - Pruébalo: abre la respuesta de la petición `products?` en las DevTools. Haz una lista de tres cosas en ella, además del estado, que un test podría comprobar. Escribe una línea `expect` para cada una.
   - Una buena respuesta explica: al menos tres comprobaciones, como el cuerpo, los encabezados y el tiempo de respuesta, y por qué cada una puede detectar un bug que el estado no ve.

## Siguiente paso

En la próxima lección aprenderás cómo funcionan los formularios, los eventos y el estado, y qué recuerda una página después de recargar.
