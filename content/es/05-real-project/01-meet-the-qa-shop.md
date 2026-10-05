---
title: Conoce la QA Shop
summary: Inicia la tienda de práctica, entra con dos roles y explora cada página como tester antes de automatizar nada.
duration: 35 min
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

**Testing exploratorio** significa que usas la aplicación con libertad y buscas riesgos. No sigues un guion. Anotas lo que encuentras. Esas notas se convierten en tus ideas de test.

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
- Edita un producto. Elimina uno, y cancela una vez.

### /orders

Filtra por estado. Como admin, cambia un pedido. Fíjate en que un estado solo avanza. Un pedido enviado o cancelado no tiene botones.

### Una dirección desconocida

Abre `http://localhost:5190/products/999999`. Anota lo que ves.

### Como viewer

Entra como viewer. Visita `/products` y `/orders`. Busca los botones que tenías como admin.

## Convierte las notas en ideas de test

Tus notas todavía no son tests. Convierte cada una en una frase sobre lo que ve un usuario. Ejemplo: "Un admin cancela un pedido pendiente y ve el estado `cancelled`."

Este es el primer paso de toda tarea de automatización. No puedes automatizar lo que no entiendes. La suite de las próximas lecciones cubre solo una parte de lo que encontraste.

## Práctica

1. Ejecuta `pnpm shop:dev`. Abre http://localhost:5190.
2. Entra como admin. Visita las tres páginas y la dirección desconocida de arriba.
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

## Siguiente paso

En la próxima lección abrirás la carpeta `e2e` y aprenderás para qué sirve cada archivo.
