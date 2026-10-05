---
title: Conoce la QA Shop
summary: Inicia la tienda de práctica, entra con dos roles y explora cada página como tester antes de automatizar nada.
duration: 50 min
---

## Objetivo

- Iniciar la QA Shop en tu computadora.
- Entrar como admin y como viewer, y ver qué cambia.
- Explorar cada página y anotar qué se debería probar.
- Explicar por qué se explora a mano antes de escribir automatización.

## Qué es la QA Shop

La **QA Shop** es una pequeña aplicación web para practicar. Es un **back office** (panel interno): un sitio privado donde un equipo gestiona productos y pedidos. Los clientes nunca lo ven.

Está hecha como los proyectos reales a los que te unirás. Tiene un login, páginas solo para usuarios con sesión iniciada, listas con búsqueda y filtros, formularios con validación y una **API**. Una API es la parte de la aplicación que las páginas llaman para obtener y guardar datos.

La aplicación no tiene base de datos. Guarda sus datos en memoria. Los datos se crean de nuevo cada vez que arranca el servidor. Si rompes algo, detén el servidor y vuelve a iniciarlo.

## Inicia la aplicación

Abre una terminal en VS Code. Ve a la raíz del repositorio. Ejecuta:

```bash
pnpm shop:dev
```

Espera hasta ver una línea con `Ready`. Deja esta terminal abierta. Abre http://localhost:5190 en tu navegador.

> **Nota:** Si el puerto está ocupado, quizá iniciaste la tienda en otra terminal. Cierra primero esa.

## Dos usuarios, dos roles

Un **rol** decide qué puede hacer un usuario. La tienda tiene dos.

| Usuario | Correo | Contraseña | Puede hacer |
| --- | --- | --- | --- |
| Admin | `admin@qa-shop.test` | `Admin123!` | Todo |
| Viewer | `viewer@qa-shop.test` | `Viewer123!` | Solo leer |

Solo puedes tener un usuario con sesión por ventana del navegador. Para usar los dos, abre una ventana privada para el segundo usuario.

## Explora como tester

El **testing exploratorio** significa que usas la aplicación con libertad y buscas riesgos. No sigues un guion. Anotas lo que encuentras. Esas notas se convierten en tus ideas de test.

Ten un archivo de texto abierto. Para cada página, escribe dos listas: lo que funciona y lo que probarías.

### /login

Prueba un formulario vacío. Prueba una contraseña incorrecta. Prueba un login correcto. Lee los mensajes de error.

Ahora cierra la sesión. Escribe directamente la dirección `http://localhost:5190/products`. Mira la barra de direcciones después de la redirección. Contiene `?next=`. Inicia sesión y mira a dónde llegas.

### /dashboard

Ves cuatro números. No aparecen de inmediato. La API espera 1.2 segundos a propósito. Anota: "los números llegan tarde, primero aparece un texto de carga".

### /products

Esta página tiene más comportamiento. Prueba cada control:

- Busca por nombre y por SKU. Un **SKU** es un código de producto como `SKU-0001`.
- Filtra por estado.
- Ve a la página siguiente. La lista muestra 10 productos por página.
- Haz clic en **New product** (nuevo producto). Guarda un formulario vacío. Luego crea un producto.
- Crea un segundo producto con el mismo SKU.
- Haz clic en el nombre de un producto. Se abre su página de detalle, `/products/<id>`. Lee sus datos. Usa el enlace para volver.
- En la página de detalle, como admin, mira los botones **Edit** (editar) y **Delete** (eliminar).
- Edita un producto desde la lista. El enlace **Edit** abre `/products/<id>/edit`. Elimina uno, y cancela una vez.

### /orders

Filtra por estado. Como admin, cambia un pedido. Fíjate en que un estado solo avanza. Un pedido enviado o cancelado no tiene botones.

### Una dirección desconocida

Abre `http://localhost:5190/products/999999`. Anota lo que ves.

### Como viewer

Entra como viewer. Visita `/products` y `/orders`. Busca los botones que tenías como admin.

## Convierte las notas en ideas de test

Tus notas todavía no son tests. Convierte cada una en una frase sobre lo que ve un usuario. Ejemplo: "Un admin cancela un pedido pendiente y ve el estado `cancelled`."

Este es el primer paso de toda tarea de automatización. No puedes automatizar lo que no entiendes. La suite de las próximas lecciones cubre solo una parte de lo que encontraste.

## Profundiza

### Por qué la tienda olvida sus datos

La mayoría de las aplicaciones reales guardan los datos en una **base de datos**, un programa que almacena datos en disco. La QA Shop guarda los datos en la memoria del servidor. La memoria se borra cuando el programa se detiene.

Es una decisión pensada para probar. Un test necesita conocer los datos de partida. Si la aplicación siempre empieza con los mismos 24 productos y 12 pedidos, un test puede decir "el pedido 1005 está pendiente" y acertar siempre. Los datos conocidos y repetibles son la base de todo test estable. Los equipos reales logran lo mismo con una base de datos de pruebas que reinician antes de cada ejecución.

### Una idea equivocada: "Exploro, así que no necesito un plan"

Muchos principiantes creen que el testing exploratorio es hacer clic al azar. No lo es. Quien explora bien se da un **charter** (carta de exploración): una frase sobre qué explorar y por qué. Ejemplo: "Explorar la página de login para encontrar formas de entrar sin una contraseña válida."

Un charter te mantiene enfocado. También te da algo que reportar. "Exploré el login durante 20 minutos y encontré dos riesgos" es un resultado claro. "Hice clic por todos lados" no lo es.

### Cómo aparece en el trabajo real de automatización QA

Descubriste que `/products` te envía a `/login?next=/products`. Un programa puede leer esa dirección. Este pequeño script muestra cómo el navegador la divide:

```ts
const url = new URL("http://localhost:5190/login?next=/products")
console.log(url.pathname)
console.log(url.searchParams.get("next"))
```

Imprime:

```text
/login
/products
```

Un test puede comprobar las dos partes: la ruta es `/login` y `next` contiene la página que querías. Tu exploración te dio la regla. La automatización convierte la regla en una comprobación repetible.

### Cuándo no automatizar una idea

No toda idea de test debe convertirse en automatización. Automatizar cuesta tiempo para escribir y para reparar. Resérvala para comprobaciones que se repiten a menudo, son estables y importan al negocio. Una comprobación que harás una sola vez es más barata a mano.

Antes en el curso estudiaste la idea de escribir una regla una sola vez, llamada DRY (Don't Repeat Yourself, no te repitas). Aquí ves una versión pequeña: una sola llamada a `reset` deja los mismos datos en cada ejecución, y nadie repite la preparación a mano.

## Práctica

1. Ejecuta `pnpm shop:dev`. Abre http://localhost:5190.
2. Entra como admin. Visita todas las páginas de arriba, una página de detalle de producto y la dirección desconocida.
3. Escribe al menos 10 ideas de test en un archivo de texto. Usa frases simples.
4. Cierra la sesión. Entra como viewer. Añade 3 ideas más sobre lo que el viewer no debe ver.
5. Detén el servidor con `Ctrl+C`. Inícialo de nuevo. Comprueba que el producto que creaste ya no está.

## Comprueba lo que sabes

1. ¿Qué es el testing exploratorio?

<details><summary>Respuesta</summary>

Usas la aplicación con libertad, sin guion, y anotas riesgos e ideas para probar.

</details>

2. ¿Qué pasa con los datos cuando el servidor se reinicia?

<details><summary>Respuesta</summary>

Los datos se crean de nuevo desde el principio. Tus cambios se pierden.

</details>

3. ¿Cuál es la diferencia entre admin y viewer?

<details><summary>Respuesta</summary>

Admin puede crear, editar y eliminar. Viewer solo puede leer.

</details>

4. ¿Por qué explorar a mano antes de automatizar?

<details><summary>Respuesta</summary>

Debes entender qué hace la aplicación antes de poder escribir un test que lo compruebe.

</details>

5. Mira esta nota de un tester: "Eliminar funciona." ¿Qué le falta como idea de test? Reescríbela para que otra persona pueda ejecutarla.

<details><summary>Respuesta</summary>

No dice quién elimina, qué producto, ni qué ve el usuario. Una versión mejor: "Un admin elimina un producto, confirma en el diálogo y la fila desaparece de la lista." Ahora dos personas harán la misma comprobación y estarán de acuerdo en el resultado.

</details>

6. Creas un producto y luego detienes y reinicias el servidor. Buscas el producto y no lo encuentras. ¿Es un bug? ¿Por qué?

<details><summary>Respuesta</summary>

No. La tienda guarda los datos en memoria, y un reinicio crea de nuevo los datos iniciales. El comportamiento es intencional. Un reporte de bug aquí sería un error. Debes leer la lección o el README antes de reportar algo que no esperabas.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es un charter de pruebas en el testing exploratorio y en qué se diferencia de un caso de prueba?**
   - Busca: `test charter exploratory testing session`
   - Una buena respuesta explica: qué contiene un charter y cómo guía una sesión con tiempo limitado, comparado con los casos de prueba paso a paso

2. **¿Cuál es la diferencia entre autenticación y autorización?**
   - Busca: `authentication vs authorization roles`
   - Una buena respuesta explica: que la autenticación demuestra quién eres, la autorización decide qué puedes hacer, y cómo los roles admin y viewer muestran la segunda

3. **¿Por qué los equipos reinician o siembran los datos de prueba antes de ejecutar tests automatizados?**
   - Busca: `test data management seed reset automation`
   - Una buena respuesta explica: por qué los datos de partida repetibles evitan tests flaky, y una forma en que un equipo puede crearlos

## Siguiente paso

En la próxima lección abrirás la carpeta `e2e` y aprenderás para qué sirve cada archivo.
