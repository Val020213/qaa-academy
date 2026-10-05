---
title: HTTP en diez minutos
summary: Aprende peticiones, respuestas, métodos, códigos de estado y JSON, y léelos en el panel Network de la tienda de práctica.
duration: 30 min
---

## Objetivo

- Explicar cliente, servidor, petición y respuesta.
- Nombrar los métodos HTTP y las familias de códigos de estado.
- Reconocer los códigos de estado que un tester ve con más frecuencia.
- Leer un cuerpo JSON.
- Encontrar una petición en el panel Network y leerla.

## Cliente y servidor

Un **cliente** pide algo. Un **servidor** responde. Tu navegador es un cliente. La computadora que guarda los datos es el servidor.

Cuando haces clic en un botón que necesita datos, el navegador envía una **petición** al servidor. El servidor devuelve una **respuesta**. **HTTP** es el conjunto de reglas de estos mensajes.

Aquí, ambos funcionan en tu computadora. La tienda de práctica es el servidor, en `http://localhost:5190`.

## La petición

Una petición tiene cuatro partes:

- **Método**: lo que quieres hacer, como `GET`.
- **URL**: adónde enviarla, como `/api/products`.
- **Headers** (cabeceras): información extra, como el tipo de los datos.
- **Cuerpo** (*body*): los datos que envías. Muchas peticiones no tienen cuerpo.

## La respuesta

Una respuesta tiene estas partes:

- **Código de estado**: un número que dice si funcionó.
- **Headers**: información extra.
- **Cuerpo**: los datos que recibes.

## Métodos

El método dice qué hace la petición. Estos cinco son los más comunes:

| Método | Significado | Ejemplo |
| --- | --- | --- |
| `GET` | Leer datos | Obtener la lista de productos |
| `POST` | Crear algo, o enviar una acción | Iniciar sesión, crear un producto |
| `PUT` | Reemplazar algo con datos nuevos | Guardar el formulario de edición de un producto |
| `PATCH` | Cambiar una parte de algo | Cambiar el estado de un pedido |
| `DELETE` | Eliminar algo | Eliminar un producto |

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
| 204 | No Content | Funcionó, y no hay cuerpo. La tienda de práctica lo devuelve cuando eliminas un producto |
| 401 | Unauthorized | No has iniciado sesión |
| 403 | Forbidden | Has iniciado sesión, pero tu rol no tiene permiso |
| 404 | Not Found | La cosa no existe |
| 409 | Conflict | La petición choca con el estado actual. En la tienda, un pedido no puede volver a un estado anterior |
| 422 | Unprocessable Content | Los datos no son válidos. La tienda lo devuelve para un formulario de producto incorrecto |
| 500 | Internal Server Error | El servidor tiene un bug |

Un buen tester revisa el código de estado y el cuerpo. Un código 4xx no siempre es un bug. Es la respuesta correcta a una petición incorrecta.

## JSON

La mayoría de las APIs envían datos como **JSON**. JSON es un texto que se parece a un objeto de TypeScript. Conoces esta forma del módulo 1.

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
| `GET /api/products` | Lista los productos. Devuelve 401 sin sesión |
| `POST /api/products` | Crea un producto. Devuelve 201, 403 o 422 |
| `GET /api/stats` | Números para el dashboard. Espera 1,2 segundos a propósito |

El usuario viewer puede leer, pero recibe 403 al crear, editar o eliminar.

## Práctica

1. Inicia la tienda en una terminal. Déjala en ejecución:

```bash
pnpm shop:dev
```

2. Abre `http://localhost:5190` en Chrome o Edge. Pulsa `F12`, abre **Network**, activa **Preserve log** y haz clic en **Fetch/XHR**.
3. Inicia sesión con `admin@qa-shop.test` y `Admin123!`.
4. Busca la petición `login`. Comprueba que el método es `POST` y que el estado es `200`. Abre **Payload** para ver los datos que enviaste. Abre **Response** para ver el JSON.
5. Busca la petición `stats`. Es `GET`. Mira su **Time**. Es de unos 1,2 segundos. ¿Por qué?
6. Haz clic en **Products** en la página. Busca la petición que empieza con `products?`. Lee la URL completa en **Headers**. Abre **Response** y busca `items`, `total` y `pageSize`.
7. Haz clic en **New product**, deja el formulario vacío y haz clic en **Save**.
8. Busca la petición `products`. Es un `POST`. Comprueba que el estado es `422`. Lee la **Response**. Enumera un mensaje por cada campo incorrecto.
9. Compara los mensajes con los textos en rojo de la página. Son iguales.
10. Haz clic en **Sign out**. Haz clic en el filtro **All** del panel Network. Abre `http://localhost:5190/products`. La página te envía a la página de login. Busca la petición `products` con estado `307`. Es una redirección (3xx). Lee la cabecera `Location`.
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

## Siguiente paso

En la próxima lección aprenderás cómo funcionan los formularios, los eventos y el estado, y qué recuerda una página después de recargar.
