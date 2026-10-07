---
title: HTTP en diez minutos
duration: 60 min
---

## Objetivo

En esta lección lees las peticiones y respuestas HTTP de la tienda de práctica para revisar qué envía el navegador y qué devuelve el servidor.

- Distinguir el método, la URL, los encabezados y el cuerpo de una petición.
- Leer un código de estado y los datos de una respuesta JSON.
- Distinguir una operación de lectura de una que cambia datos, y reconocer qué pasa al repetirla.
- Encontrar en Network la respuesta que explica un error de la página.

## Cliente y servidor

El navegador es el **cliente**: envía una **petición** (*request*) cuando la página necesita datos o envía una acción. El servidor HTTP recibe esa petición y devuelve una **respuesta** (*response*). **HTTP** define las reglas de esos mensajes.

En la tienda de práctica, el navegador y el servidor corren en tu computadora. El servidor atiende en `http://localhost:5190`.

## La petición

Una petición tiene estas partes:

- **Método**: la operación solicitada, como `GET`.
- **URL**: adónde enviarla, como `/api/products`.
- **Encabezados** (*headers*): información extra, como el tipo de los datos.
- **Cuerpo** (*body*): los datos que envías. Muchas peticiones no tienen cuerpo.

## La respuesta

El servidor devuelve:

- **Código de estado**: un número que indica el resultado de la petición.
- **Encabezados**: información extra.
- **Cuerpo**: los datos que recibes, si la respuesta tiene cuerpo.

## Métodos

El método indica la operación que el cliente pide al servidor:

| Método | Significado | Ejemplo |
| --- | --- | --- |
| `GET` | Leer datos | Obtener la lista de productos |
| `POST` | Crear algo o enviar una acción | Iniciar sesión, crear un producto |
| `PUT` | Reemplazar algo con datos nuevos | Guardar el formulario de edición de un producto |
| `PATCH` | Cambiar una parte de algo | Cambiar el estado de un pedido |
| `DELETE` | Quitar algo | Eliminar un producto |

Una petición `GET` no debe cambiar datos. Es segura de repetir.

Si una tienda usa `GET` para `/delete-everything`, un navegador que cargue el enlace por adelantado podría borrar los datos sin que nadie haga clic. Las operaciones que cambian datos deben usar `POST`, `PUT`, `PATCH` o `DELETE`.

## Códigos de estado

El primer dígito del **código de estado** identifica su familia:

| Familia | Significado |
| --- | --- |
| 2xx | Éxito |
| 3xx | Redirección: ve a otra dirección |
| 4xx | Error del cliente: la petición está mal o no está permitida |
| 5xx | Error del servidor: el servidor falló |

Una contraseña incorrecta produce esta respuesta en la tienda:

![Una contraseña incorrecta envía una petición login, y Network en las DevTools muestra el estado 401.](/clips/devtools-network.webm)

Estos son los códigos que verás con más frecuencia:

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

Un código 4xx puede ser la respuesta correcta a una petición inválida o sin permiso. Lee también el cuerpo para conocer el motivo del rechazo.

### Una página sin resultados

Con una sesión de admin, esta petición pide la página 999 de los productos. Puedes verla en la Console de las DevTools:

```text
> await (await fetch("/api/products?page=999")).json()
```

La tienda responde `200`, con `items` como una lista vacía y `total` con el número real de productos. El servidor acepta esa página aunque no tenga resultados. Con `?page=abc`, el código de la ruta usa la página 1 y también responde `200`.

## JSON

Muchas API envían datos como **JSON**, un formato de texto con objetos y listas:

```json
{
  "name": "Rex",
  "age": 3,
  "tricks": ["sit", "roll"]
}
```

Los nombres y los textos van entre comillas dobles. Las listas usan corchetes. JSON no admite una coma al final ni comentarios.

Cuando le pides a JavaScript que lea `{ name: 'Rex' }`, los nombres no tienen comillas y el texto tiene comillas simples. El resultado es un `SyntaxError`: el texto es un objeto de JavaScript, pero no es un JSON válido. `JSON.stringify` descarta los campos de un objeto cuyo valor es `undefined` y convierte una fecha en texto.

Esta es la respuesta de la tienda después de un inicio de sesión correcto:

```json
{
  "name": "Ada Admin",
  "email": "admin@qa-shop.test",
  "role": "admin"
}
```

## La API de la tienda de práctica

Las rutas de la API están en `apps/practice-shop/app/api`:

| Método y URL | Qué hace |
| --- | --- |
| `POST /api/auth/login` | Inicia sesión. Devuelve 401 con una contraseña incorrecta |
| `GET /api/products` | Lista los productos. Devuelve 401 sin una sesión |
| `POST /api/products` | Crea un producto. Devuelve 201, 403 o 422 |
| `DELETE /api/products/<id>` | Elimina un producto. Devuelve 204, o 404 si no existe |
| `GET /api/stats` | Números para el dashboard. Espera 1,2 segundos a propósito |

El usuario viewer puede leer, pero recibe 403 al crear, editar o eliminar.

## Profundiza

### Repetir una operación

Eliminar dos veces el mismo producto deja el mismo estado final: el producto ya no está. Las respuestas pueden ser distintas. En la tienda, la primera petición `DELETE` devuelve `204` y la segunda devuelve `404`, porque el servidor ya no encuentra el producto.

Un `POST` que crea un elemento puede crear otro al repetirse. El estado final después de dos peticiones puede ser distinto del estado después de una.

### El estado y los datos

Un `200` indica éxito, pero no demuestra que los datos sean correctos. Al revisar la lista de productos, comprueba también los elementos y el total que devuelve el servidor.

Después de una eliminación, el estado `204` indica que la respuesta no tiene cuerpo. Intentar leerlo como JSON falla. Para comprobar el efecto de la eliminación, otra petición `GET` al producto debe devolver `404`.

## Práctica

1. Inicia la tienda en una terminal. Déjala corriendo:

```bash
pnpm shop:dev
```

2. Abre `http://localhost:5190` en Chrome o Edge. Pulsa `F12`, abre **Network**, activa **Preserve log** y haz clic en **Fetch/XHR**.
3. Inicia sesión con `admin@qa-shop.test` y `Admin123!`.
4. Busca la petición `login`. Comprueba que el método sea `POST` y el estado sea `200`. Abre **Payload** para ver los datos enviados y **Response** para ver el JSON.
5. Busca la petición `stats`. Es un `GET`. Mira su **Time**: el servidor espera 1,2 segundos a propósito antes de responder.
6. Haz clic en **Products**. Busca la petición que empieza con `products?`. Lee la URL completa en **Headers** y busca `items`, `total` y `pageSize` en **Response**.
7. Haz clic en **New product** (nuevo producto), deja el formulario vacío y haz clic en **Save** (guardar).
8. Busca la petición `products` con método `POST` y estado `422`. Lee los mensajes de **Response** y compáralos con los textos rojos de la página.
9. Haz clic en **Sign out** (cerrar sesión). Elige el filtro **All** de Network y abre `http://localhost:5190/products`. Busca la petición `products` con estado `307` y lee el encabezado `Location`, que indica la dirección del login.
10. Detén la tienda con `Ctrl + C`.

## Reto

Crea `apps/practice-shop/e2e/challenges/api-status-table.spec.ts`. Escribe una tabla de reglas de la API y usa un bucle para convertir cada fila en un test. Cada fila indica el usuario, el método, la dirección, el cuerpo y el estado esperado.

Importa desde `../lib/test`. Lee las rutas en `apps/practice-shop/app/api` y los helpers de `apps/practice-shop/e2e/lib/fixtures/api-client.ts` para elegir las reglas.

Está terminado cuando:

- Ejecutas `pnpm shop:e2e challenges/api-status-table` y todos los tests pasan. Cambias un estado esperado, compruebas que falla el test correspondiente y lo corriges.
- La tabla tiene al menos seis filas que cubren 401, 403, 404, 422 y al menos un estado 2xx.
- Cada título se construye desde su fila, por ejemplo `viewer POST /api/products gives 403`.
- Las filas son independientes. Una fila que necesita un producto crea el suyo.

Busca cómo crear tests desde un array y elegir la sesión de cada test: `playwright parameterized tests loop` y `playwright test.use storageState`.

## Piénsalo bien

1. Iniciaste sesión como admin. Predice el estado y el campo `page` de tres llamadas: `GET /api/products?page=999`, `GET /api/products?page=abc` y `GET /api/products?page=-5`.

<details>
<summary>Respuesta</summary>

Las tres devuelven `200`. Con `page=999`, el campo `page` es `999` e `items` está vacío. Con `abc` y `-5`, el servidor usa la página 1: `page` es `1` e `items` trae los primeros productos. La ruta convierte el valor a número y establece 1 como mínimo.

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

Una respuesta `204` no tiene cuerpo. La llamada a `json()` intenta leer un cuerpo vacío y lanza un error. Quita esa comprobación o usa otra petición para comprobar que el producto ya no existe.

</details>

3. Un desarrollador agrega el enlace `GET /api/products/5/delete`, que elimina el producto 5. ¿Qué puede romperse aunque nadie haga clic?

<details>
<summary>Respuesta</summary>

Un navegador que cargue enlaces por adelantado o un robot de búsqueda podría eliminar el producto. Esas herramientas pueden enviar peticiones `GET` automáticamente porque el método está definido como seguro. La operación de eliminación debe usar `DELETE`.

</details>

## Siguiente paso

En la próxima lección aprenderás cómo funcionan los formularios, los eventos y el estado, y qué recuerda una página después de recargar.
