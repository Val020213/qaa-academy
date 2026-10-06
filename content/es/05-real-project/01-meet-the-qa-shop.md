---
title: Conoce la QA Shop
summary: Arranca la tienda de práctica, entra con dos roles, explórala como tester y comprueba una de sus reglas con un script pequeño.
duration: 80 min
---

## Empieza con un acertijo

A las 9:00 entras como admin a una aplicación web. Marcas el pedido 1005 como pagado. A las 9:30 el desarrollador detiene el servidor y lo arranca otra vez para probar un cambio. A las 9:35 abres la página de pedidos.

Tres cosas podrían ser ciertas. El pedido 1005 sigue pagado. El pedido 1005 está pendiente otra vez. O el pedido ya no existe.

Ahora una segunda pregunta. A las 9:10 también creaste un producto llamado "Test lamp". Un colega dice: "Si ya no está, tienes que reportar un bug". ¿Estás de acuerdo?

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Decidir qué explorar primero en una aplicación que nunca has visto, y escribir un *charter* (misión de exploración) para ella.
- Predecir qué acciones puede hacer cada rol y luego comprobar tu predicción a mano.
- Explicar por qué la tienda olvida sus datos y por qué eso ayuda a un test.
- Comprobar una regla de negocio de la tienda con un script, sin usar el navegador.

## Qué es la QA Shop

La **QA Shop** es una aplicación web pequeña para practicar. Es un **back office** (administración interna): un sitio privado donde un equipo gestiona productos y pedidos. Los clientes nunca lo ven.

Está hecha como los proyectos reales a los que te unirás. Tiene un *login* (inicio de sesión), páginas solo para usuarios con sesión iniciada, listas con búsqueda y filtros, formularios con validación y una **API**. Una API es la parte de la aplicación a la que llaman las páginas para pedir y guardar datos.

Las páginas usan shadcn/ui, un conjunto de botones, campos, tablas y diálogos ya hechos. No necesitas conocerlo. Solo necesitas saber que los valores de `data-testid` y los textos visibles son las partes estables que vas a seleccionar en los tests.

## Arranca la aplicación

Abre una terminal en VS Code. Ve a la raíz del repositorio. Ejecuta:

```bash
pnpm shop:dev
```

Espera hasta ver una línea con `Ready`. Deja esta terminal abierta. Abre http://localhost:5190 en tu navegador.

> **Nota:** Si el puerto está ocupado, quizá arrancaste la tienda en otra terminal. Cierra esa primero.

## Dos usuarios, dos roles

Un **rol** decide lo que puede hacer un usuario. La tienda tiene dos.

| Usuario | Correo | Contraseña | Puede hacer |
| --- | --- | --- | --- |
| Admin | `admin@qa-shop.test` | `Admin123!` | Todo |
| Viewer (lector) | `viewer@qa-shop.test` | `Viewer123!` | Solo leer |

Solo puedes tener un usuario con sesión por ventana del navegador. Para usar los dos, abre una ventana privada para el segundo usuario.

Antes de entrar como viewer, haz una predicción. Escribe una lista: ¿qué botones verá el viewer en `/products` y en `/orders`? Luego entra y compara. Cada diferencia entre tu lista y la pantalla es una lección sobre cómo funciona la aplicación.

## Explora como tester

**Probar de forma exploratoria** significa que usas la aplicación con libertad y vigilas los riesgos. No sigues un guion. Anotas lo que encuentras. Esas notas se convierten en tus ideas de prueba.

Mira cómo una persona se mueve por las páginas y qué observa.

![Entra como admin, mira el dashboard, busca mouse, abre un producto y vuelve atrás.](/clips/shop-tour.webm)

Antes de hacer clic, divide el trabajo en partes. Esto se llama **descomposición**: partir una tarea grande en pasos pequeños que puedes terminar. En la tienda, las partes son las páginas: login, dashboard, productos, pedidos y una dirección desconocida. Dale a cada parte un **charter**: una frase sobre qué explorar y por qué. Ejemplo: "Explora la página de login para encontrar formas en que un usuario puede entrar sin una contraseña válida".

Mantén abierto un archivo de texto. Para cada página, escribe qué funciona y qué probarías.

### /login

Prueba un formulario vacío. Prueba una contraseña incorrecta. Prueba un login correcto. Lee los mensajes de error.

Ahora cierra la sesión. Escribe directamente la dirección `http://localhost:5190/products`. Mira la barra de direcciones después de la redirección. Contiene `next=%2Fproducts`. El `%2F` es una barra escrita de forma segura. Inicia sesión y mira a dónde llegas.

### /dashboard

Ves cuatro números. No aparecen de golpe. La API espera 1.2 segundos a propósito. Anota: "los números llegan tarde, primero sale un texto de carga".

### /products

Esta página tiene más comportamiento. Prueba cada control:

- Busca por nombre y por SKU. Un **SKU** es un código de producto, como `SKU-0001`.
- Filtra por estado.
- Ve a la página siguiente. La lista muestra 10 productos por página.
- Haz clic en **New product** (producto nuevo). Guarda un formulario vacío. Luego crea un producto.
- Crea un segundo producto con el mismo SKU.
- Haz clic en el nombre de un producto. Se abre su página de detalle, `/products/<id>`. Lee sus datos. Usa el enlace de volver para regresar.
- En la página de detalle, como admin, mira los botones **Edit** (editar) y **Delete** (eliminar).
- Edita un producto desde la lista. El enlace **Edit** abre `/products/<id>/edit`. Elimina uno, y cancela una vez.

### /orders

Filtra por estado. Como admin, cambia un pedido. Antes de hacer clic, predice: ¿qué botones tendrá un pedido pendiente? ¿Uno pagado? ¿Uno enviado? Luego comprueba. Fíjate en que un estado solo avanza.

### Una dirección desconocida

Abre `http://localhost:5190/products/999999`. Anota lo que ves.

### De vuelta al acertijo

El pedido 1005 está pendiente otra vez, y "Test lamp" ya no está. La tienda guarda sus datos en la memoria del servidor. La memoria se borra cuando el programa se detiene. En cada arranque, la tienda crea de nuevo los mismos 24 productos y 12 pedidos.

Así que esto no es un bug. Es una regla de la tienda. Un reporte de bug aquí le costaría tiempo a un desarrollador y mostraría que no leíste el README. El mejor hábito: antes de reportar algo inesperado, pregunta "¿esto es así por diseño?" y busca la regla.

## Convierte las notas en ideas de prueba

Tus notas todavía no son tests. Convierte cada una en una frase sobre lo que ve un usuario. Ejemplo: "Un admin cancela un pedido pendiente y ve el estado `cancelled`".

Sé exacto. Compara dos notas. Nota A: "Eliminar funciona". Nota B: "Un admin elimina un producto, confirma en el diálogo y la fila desaparece". Dos personas pueden ejecutar la nota B y ponerse de acuerdo en el resultado. Nadie puede decir si la nota A pasó.

Este es el primer paso de toda tarea de automatización. No puedes automatizar lo que no entiendes. La *suite* (conjunto de tests) de las próximas lecciones cubre solo una parte de lo que encontraste.

## Profundiza

### Por qué la tienda olvida sus datos

La mayoría de las aplicaciones reales guardan los datos en una **base de datos**, un programa que almacena datos en disco. La QA Shop guarda los datos en memoria.

Es una decisión pensada para probar. Un test necesita conocer los datos de partida. Si la aplicación siempre empieza con los mismos 12 pedidos, un test puede decir "el pedido 1005 está pendiente" y tener razón cada vez. Los datos conocidos y repetibles son la base de todo test estable. Los equipos reales logran el mismo efecto con una base de datos de pruebas que reinician antes de cada ejecución. La tienda también tiene una dirección solo para tests, `POST /api/test/reset`, que devuelve los datos a su estado inicial sin reiniciar.

### Una idea equivocada: "exploro, así que no necesito un plan"

Muchos principiantes piensan que explorar es hacer clic al azar. No lo es. Un charter te mantiene enfocado. También te da algo que reportar. "Exploré el login durante 20 minutos y encontré dos riesgos" es un resultado claro. "Hice clic por ahí" no lo es.

### Cómo aparece esto en el trabajo real de automatización QA

Descubriste que `/products` te envía a `/login?next=%2Fproducts`. Un programa puede leer esa dirección. Este script pequeño muestra cómo el navegador la separa:

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

Un test puede comprobar las dos partes: la ruta es `/login`, y `next` guarda la página que querías. Tu exploración te dio la regla. La automatización convierte la regla en una comprobación repetible.

### Cuándo no automatizar una idea

No toda idea de prueba debe volverse automatización. Automatizar cuesta tiempo para escribir y para reparar. Resérvala para comprobaciones que se repiten a menudo, son estables e importan al negocio. Una comprobación que harás una sola vez sale más barata a mano.

Ya conoces la idea de escribir una regla una sola vez, llamada *DRY* (Don't Repeat Yourself, no te repitas). Su contrapeso es **YAGNI**: You Aren't Gonna Need It (no lo vas a necesitar). No construyas para una necesidad que solo imaginas. Automatiza las diez comprobaciones que se ejecutan todos los días antes de construir un framework para cien comprobaciones que quizá nunca existan.

## Práctica

1. Ejecuta `pnpm shop:dev`. Abre http://localhost:5190.
2. Entra como admin. Visita todas las páginas de arriba, una página de detalle de producto y la dirección desconocida.
3. Escribe al menos 10 ideas de prueba en un archivo de texto. Usa frases simples.
4. Cierra la sesión. Entra como viewer. Agrega 3 ideas más sobre lo que el viewer no debe ver.
5. Detén el servidor con `Ctrl+C`. Arráncalo otra vez. Comprueba que el producto que creaste ya no está.

## Reto

Ocultar un botón no es seguridad. Un viewer que no tiene el botón aún puede enviar una petición a mano. Tu tarea: comprobar que la tienda aplica sus reglas de pedidos en la API, y no solo en la página.

Escribe un script que envíe peticiones a la tienda en marcha. Usa el pedido 1003. En los datos iniciales está enviado (`shipped`). Intenta cambiar su estado a `paid` tres veces: sin sesión, como viewer y como admin. Imprime una línea por cada intento con el código de estado y el mensaje que devuelve la API. Luego agrega un cuarto intento que elijas tú: otra regla que encontraste al explorar.

Crea el archivo `exercises/challenges/shop-order-rules.ts`. No edites ningún otro archivo.

Está terminado cuando:

- Ejecutas `node exercises/challenges/shop-order-rules.ts` con la tienda en marcha, e imprime una línea por intento.
- Las tres primeras líneas muestran tres códigos de estado distintos, y puedes decir por qué encaja cada código.
- El script no cambia ningún dato. Ejecútalo dos veces y la salida es la misma.
- Tu cuarto intento es un caso que elegiste, y la línea dice qué esperabas antes de ejecutarlo.
- El script no necesita instalar nada. Usa solo lo que Node ya trae.

Vas a necesitar algo que esta lección no enseñó: cómo enviar una petición con un programa, incluyendo un cuerpo y una cookie. Una **cookie** es un valor pequeño que el navegador guarda y envía de vuelta en cada petición. La tienda envía su cookie de sesión cuando entras. Tienes que leerla de la respuesta y enviarla de vuelta. Busca: `node fetch post json body`, `fetch response headers getSetCookie`, `http status 401 403 409 difference`.

> **Consejo:** Trabaja en pasos pequeños, una hipótesis y un experimento a la vez. Primero imprime solo el código de estado del login. Luego lee la cookie. Luego envía una petición PATCH.

## Piénsalo bien

1. Un tester escribe esta idea: "Entro como admin, marco el pedido 1003 como pagado y veo el estado `paid`". La nota es clara y una persona puede ejecutarla. Encuentra el problema.

<details><summary>Respuesta</summary>

El pedido 1003 está enviado en los datos iniciales, y un pedido enviado es final. No tiene el botón **Mark as paid** (marcar como pagado), así que el test nunca puede ejecutarse como está escrito. La nota se lee bien pero ignora los datos. Por eso exploras primero: descubres qué pedido está pendiente (1001, 1005 o 1009) antes de escribir la idea. Una idea de prueba debe nombrar datos que existen de verdad en el estado inicial.

</details>

2. Tienes dos horas y 40 ideas de prueba. Puedes automatizar unas 12. ¿Cómo eliges? No hay una única respuesta correcta.

<details><summary>Respuesta</summary>

Elige por riesgo y por repetición. Prefiere las comprobaciones que importan al negocio (login, crear producto, cambiar un pedido), que ejecutarías en cada versión y que son estables. Descarta las que se ejecutan una vez, dependen de una página lenta o aleatoria, o salen más baratas a mano. La elección depende de lo que más teme el equipo y de qué tan seguido cambia la aplicación. Otro tester podría elegir otras 12 y tener razón, si puede explicar sus motivos.

</details>

3. ¿Qué imprime este script, y por qué?

```ts
const url = new URL("http://localhost:5190/login?next=%2Fproducts%3Fq%3Dmouse")
console.log(url.searchParams.get("next"))
```

<details><summary>Respuesta</summary>

Imprime `/products?q=mouse`. La parte después de `next=` es el texto `/products?q=mouse` con los caracteres especiales `/`, `?` y `=` escritos como `%2F`, `%3F` y `%3D`. `searchParams.get` los convierte de nuevo en caracteres normales. Esto importa porque la dirección completa de la página que querías se guarda dentro de un solo valor. Sin esa escritura, el `?` empezaría una nueva parte de la dirección.

</details>

4. ¿Qué se rompería para un tester si la tienda guardara sus datos en una base de datos en disco y nunca los reiniciara?

<details><summary>Respuesta</summary>

Los tests ya no conocerían los datos de partida. El pedido 1005 estaría pendiente en la primera ejecución y pagado en la segunda, porque un estado solo avanza. El mismo test pasaría y luego fallaría, sin ningún cambio en la aplicación. El equipo necesitaría un paso de reinicio o una base de datos de pruebas aparte. Los datos en memoria te dan ese reinicio gratis, a cambio de que nada se guarda nunca.

</details>

5. Explica a un compañero, en tres frases, por qué un viewer sin botones no es protección suficiente. No uses la palabra "botón".

<details><summary>Respuesta</summary>

La página solo decide qué dibuja, pero cualquiera puede enviar una petición al servidor sin usar la página. Por eso el servidor debe comprobar el rol de cada petición por su cuenta. En la tienda responde 403, que significa "te conozco, pero no tienes permiso". Un buen test comprueba las dos cosas: la página no muestra acciones al viewer, y el servidor rechaza la petición.

</details>

6. Dos testers usan la misma tienda en marcha al mismo tiempo. El tester A marca el pedido 1005 como pagado. El tester B, un minuto después, sigue una idea de prueba que empieza con "el pedido 1005 está pendiente". ¿Qué pasa y qué enseña?

<details><summary>Respuesta</summary>

El tester B encuentra el pedido pagado y piensa que la idea de prueba está mal o que la aplicación está rota. Los dos comparten la misma memoria, así que la acción de una persona cambia los datos de la otra. La lección es que los datos compartidos hacen que los resultados dependan de otras personas. Un tester debería crear sus propios datos, o acordar quién usa qué pedido. Verás el mismo problema cuando los tests corran en la suite.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es un charter de prueba en las pruebas exploratorias y en qué se diferencia de un caso de prueba?**
   - Busca: `test charter exploratory testing session`
   - Pruébalo: escribe un charter para `/orders` y explora durante 15 minutos con un temporizador. Cuenta cuántos riesgos anotaste.
   - Una buena respuesta explica: qué contiene un charter y cómo guía una sesión con tiempo limitado, en comparación con los casos de prueba paso a paso.

2. **¿Cuál es la diferencia entre los códigos de estado 401 y 403, y entre autenticación y autorización?**
   - Busca: `authentication vs authorization 401 403`
   - Pruébalo: entra como viewer, abre las DevTools, ve a la pestaña Console y ejecuta `fetch("/api/orders/1009", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status: "paid" }) }).then((r) => r.status)`. Anota el número, luego adivina qué obtienes cuando no tienes sesión, y pruébalo.
   - Una buena respuesta explica: que la autenticación demuestra quién eres, la autorización decide qué puedes hacer, y qué código devuelve la tienda en cada caso.

3. **¿Por qué los equipos reinician o precargan los datos de prueba antes de ejecutar tests automáticos?**
   - Busca: `test data management seed reset automation`
   - Pruébalo: con la tienda en marcha, crea un producto y luego ejecuta `fetch("/api/test/reset", { method: "POST" }).then((r) => r.json())` en la Console de las DevTools. Recarga `/products` y observa qué cambió.
   - Una buena respuesta explica: por qué los datos de partida repetibles evitan tests *flaky* (inestables), y una forma en que un equipo puede crearlos.

## Siguiente paso

En la próxima lección abres la carpeta `e2e` y aprendes para qué sirve cada archivo.
