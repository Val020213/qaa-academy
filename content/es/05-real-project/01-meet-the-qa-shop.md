---
title: Conoce la QA Shop
duration: 70 min
---

## Objetivo

En esta lección exploras la QA Shop y escribes ideas de prueba basadas en sus reglas y datos iniciales. También compruebas sus permisos y reglas de pedidos con un script.

- Guiar la exploración de cada página con un *charter*.
- Comprobar las acciones disponibles para admin y viewer.
- Reconocer qué datos se pierden al reiniciar el servidor.
- Comprobar una regla de negocio desde la API.

## La QA Shop

La **QA Shop** es un back office de práctica para gestionar productos y pedidos. Tiene login, páginas protegidas, búsqueda, filtros, formularios con validación y una API.

## Arranca la aplicación

Abre una terminal en VS Code y ve a la raíz del repositorio. Ejecuta:

```bash
pnpm shop:dev
```

Espera hasta ver una línea con `Ready`. Deja esta terminal abierta y abre http://localhost:5190 en tu navegador.

> **Nota:** Si el puerto está ocupado, quizá arrancaste la tienda en otra terminal. Cierra esa primero.

## Dos usuarios, dos roles

La tienda tiene estos usuarios de prueba:

| Usuario | Correo | Contraseña | Puede hacer |
| --- | --- | --- | --- |
| Admin | `admin@qa-shop.test` | `Admin123!` | Todo |
| Viewer (lector) | `viewer@qa-shop.test` | `Viewer123!` | Solo leer |

Las ventanas normales del mismo perfil comparten la cookie de sesión de la tienda. Para usar los dos usuarios a la vez, abre una ventana privada para el segundo usuario.

## Explora como tester

Divide la exploración por páginas. Dale a cada una un **charter**: una frase sobre qué explorar y por qué. Por ejemplo: "Explora la página de login para encontrar formas en que un usuario puede entrar sin una contraseña válida".

Mantén abierto un archivo de texto para anotar los resultados y las ideas de prueba de cada página. Este recorrido muestra el login, la búsqueda y el detalle de un producto:

![Entra como admin, mira el dashboard, busca mouse, abre un producto y vuelve atrás.](/clips/shop-tour.webm)

### /login

Prueba un formulario vacío, una contraseña incorrecta y un login correcto. Lee los mensajes de error.

Cierra la sesión y escribe directamente la dirección `http://localhost:5190/products`. Después de la redirección, la barra de direcciones contiene `next=%2Fproducts`: la página solicitada quedó guardada en ese parámetro. El `%2F` representa una barra. Inicia sesión y comprueba a dónde llegas.

### /dashboard

Observa los cuatro números y el texto de carga que aparece antes. La API espera 1.2 segundos a propósito antes de responder.

### /products

Prueba cada control:

- Busca por nombre y por SKU. Un **SKU** es un código de producto, como `SKU-0001`.
- Filtra por estado.
- Ve a la página siguiente. La lista muestra 10 productos por página.
- Haz clic en **New product** (producto nuevo). Guarda un formulario vacío. Luego crea un producto.
- Crea un segundo producto con el mismo SKU.
- Haz clic en el nombre de un producto. Se abre su página de detalle, `/products/<id>`. Lee sus datos. Usa el enlace de volver para regresar.
- En la página de detalle, como admin, mira los botones **Edit** (editar) y **Delete** (eliminar).
- Edita un producto desde la lista. El enlace **Edit** abre `/products/<id>/edit`. Elimina uno, y cancela una vez.

### /orders

Filtra por estado y compara las acciones disponibles para pedidos pendientes, pagados y enviados. Como admin, cambia un pedido y comprueba el resultado. Los cambios de estado permitidos solo avanzan.

### Una dirección desconocida

Abre `http://localhost:5190/products/999999` y anota lo que ves.

## Los datos iniciales

El servidor de la tienda guarda los datos en memoria. Cuando se detiene, pierde los cambios; al arrancar de nuevo, crea los mismos 24 productos y 12 pedidos. Un producto que creaste desaparece y el pedido 1005 vuelve a estar pendiente.

![Reiniciar el servidor pierde los cambios y vuelve a crear los productos y pedidos de la semilla.](/images/05-memory-reset.es.svg)

Los datos iniciales conocidos permiten repetir una comprobación desde el mismo estado. La tienda también ofrece `POST /api/test/reset` para restablecerlos sin reiniciar el servidor.

## Convierte las notas en ideas de prueba

Escribe cada idea con el usuario, la acción y el resultado observable. Por ejemplo: "Un admin cancela un pedido pendiente y ve el estado `cancelled`".

"Eliminar funciona" no indica cómo comprobar el resultado. "Un admin elimina un producto, confirma en el diálogo y la fila desaparece" permite que dos testers ejecuten la misma comprobación.

## Profundiza

### Leer la dirección de la redirección

Cuando visitas `/products` sin sesión, el servidor te redirige a `/login?next=%2Fproducts`. El objeto URL separa la ruta y los parámetros de esa dirección. Este script lee las partes:

```ts
const url = new URL("http://localhost:5190/login?next=%2Fproducts")
console.log(url.pathname)
console.log(url.search)
console.log(url.searchParams.get("next"))
```

Imprime:

```text
/login
?next=%2Fproducts
/products
```

La ruta es `/login`; `next` contiene la página solicitada, con la barra decodificada. Puedes comprobar ambos valores para verificar la redirección.

## Práctica

1. Escribe al menos 10 ideas de prueba en un archivo de texto a partir de la exploración. Incluye la acción y el resultado esperado.
2. Cierra la sesión. Entra como viewer. Agrega 3 ideas más sobre lo que el viewer no debe ver.
3. Detén el servidor con `Ctrl+C`. Arráncalo otra vez. Comprueba que el producto que creaste ya no está.

## Reto

El servidor debe comprobar los permisos aunque la página oculte las acciones al viewer. Escribe un script que envíe peticiones a la tienda en marcha para comprobar los permisos y las reglas de pedidos.

Usa el pedido 1003, que está enviado (`shipped`) en los datos iniciales. Intenta cambiar su estado a `paid` tres veces: sin sesión, como viewer y como admin. Imprime una línea por intento con el código de estado y el mensaje de la API. Agrega un cuarto intento para otra regla que encontraste al explorar.

Crea el archivo `exercises/challenges/shop-order-rules.ts`. No edites ningún otro archivo.

Está terminado cuando:

- Al ejecutar `node exercises/challenges/shop-order-rules.ts` con la tienda en marcha, el script imprime una línea por intento y usa solo lo que Node ya trae.
- Las tres primeras líneas muestran tres códigos de estado distintos, y puedes decir por qué encaja cada código.
- El script no cambia productos ni pedidos; los logins sí crean sesiones. Ejecútalo dos veces y la salida es la misma.
- Tu cuarto intento es un caso que elegiste, y la línea dice qué esperabas antes de ejecutarlo.

Para las peticiones con sesión, lee la cookie de la respuesta de login y envíala en las siguientes peticiones. Busca: `node fetch post json body`, `fetch response headers getSetCookie`, `http status 401 403 409 difference`.

## Piénsalo bien

1. Un tester escribe esta idea: "Entro como admin, marco el pedido 1003 como pagado y veo el estado `paid`". Encuentra el problema.

<details><summary>Respuesta</summary>

El pedido 1003 está enviado en los datos iniciales y ese estado es final. No tiene el botón **Mark as paid** (marcar como pagado). Para comprobar ese cambio necesitas un pedido pendiente, como 1001, 1005 o 1009.

</details>

2. ¿Qué imprime este script, y por qué?

```ts
const url = new URL("http://localhost:5190/login?next=%2Fproducts%3Fq%3Dmouse")
console.log(url.searchParams.get("next"))
```

<details><summary>Respuesta</summary>

Imprime `/products?q=mouse`. El valor de `next` contiene los caracteres `/`, `?` y `=` escritos como `%2F`, `%3F` y `%3D`. `searchParams.get` los decodifica. Un segundo `?` también puede quedar dentro del valor de `next`; un `&` sin codificar separaría otro parámetro. La codificación conserva la dirección completa como un solo valor.

</details>

3. Dos testers usan la misma tienda en marcha. El tester A marca el pedido 1005 como pagado. El tester B sigue una idea de prueba que empieza con "el pedido 1005 está pendiente". ¿Qué pasa?

<details><summary>Respuesta</summary>

El tester B encuentra el pedido pagado porque ambos usan los mismos datos en la memoria del servidor. Deben acordar quién usa cada pedido o preparar datos separados para que una acción no cambie el punto de partida del otro.

</details>

## Siguiente paso

En la próxima lección abres la carpeta `e2e` y aprendes para qué sirve cada archivo.
