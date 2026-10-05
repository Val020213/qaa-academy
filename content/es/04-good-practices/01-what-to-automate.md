---
title: Qué automatizar
summary: Aprende la pirámide de tests y cómo elegir qué comprobaciones merecen un test end-to-end automatizado.
duration: 25 min
---

## Objetivo

- Explicar la pirámide de tests con palabras simples.
- Decir por qué los tests end-to-end deben ser pocos y elegidos con cuidado.
- Elegir qué automatizar según riesgo, frecuencia y estabilidad.
- Leer un inventario de cobertura real.

## La pirámide de tests

Los *tests* (pruebas de software) tienen tres tamaños comunes.

- Un **test unitario** comprueba una pieza pequeña de código, como una función que suma el impuesto a un precio. Se ejecuta en milisegundos.
- Un **test de integración** comprueba que varias piezas funcionan juntas. Un **test de API** es un tipo común: envía una petición al servidor y revisa la respuesta. Se ejecuta en decenas de milisegundos.
- Un **test end-to-end (de extremo a extremo)**, o **test E2E**, abre un navegador real y usa la aplicación como una persona. Se ejecuta en segundos.

Los equipos dibujan esto como una pirámide. Muchos tests unitarios van abajo. Menos tests de API van en el medio. Los tests E2E, los menos, van arriba.

La forma importa. Los tests de abajo son rápidos y baratos. Los de arriba son lentos y costosos.

## Por qué los tests E2E son caros

Un test E2E abre un navegador, carga páginas y espera a la pantalla. Toca todo el sistema, así que puede fallar por muchas razones: la página, el servidor, los datos o la red.

Esto tiene tres costos.

- La *suite* (el conjunto de tests) tarda más en ejecutarse, así que la gente la ejecuta menos.
- Un fallo es más difícil de explicar, porque la causa puede estar en muchas partes.
- El test se rompe más seguido cuando cambia la pantalla.

Por eso un test E2E debe cubrir un **recorrido de usuario importante**. Un recorrido es el camino que sigue un usuario para lograr un objetivo, como "iniciar sesión, crear un producto, verlo en la lista".

Un test E2E no debe cubrir cada combinación de datos. Probar diez precios inválidos en el navegador es lento. Esas comprobaciones van más abajo en la pirámide, cerca del código.

> **Nota:** En este curso escribirás sobre todo tests E2E. Ese es tu trabajo en la punta de la pirámide. Conocer los otros niveles te ayuda a pedir a los desarrolladores los tests correctos allí.

## Cómo elegir qué automatizar

Eres tester manual. Ya sabes encontrar las comprobaciones importantes. Hazte tres preguntas sobre cada una.

1. **Riesgo.** ¿Qué pasa si esto se rompe? El *login* (inicio de sesión), los pagos y la pérdida de datos son de riesgo alto. Un color incorrecto es de riesgo bajo.
2. **Frecuencia.** ¿Cada cuánto ejecutas esta comprobación a mano? Una comprobación que repites en cada versión es buena candidata.
3. **Estabilidad.** ¿Esta parte del producto cambia cada semana? Si es así, espera. Un test para una pantalla que cambia mucho cuesta más de lo que ahorra.

Una comprobación de riesgo alto, que repites seguido y que es estable es la mejor primera opción.

## Qué se queda manual

No todo debe automatizarse.

- **Pruebas exploratorias.** Exploras el producto sin guion y buscas sorpresas. Un test solo comprueba lo que alguien pensó de antemano. Una persona encuentra lo inesperado.
- **Usabilidad y sensación visual.** ¿La página es clara? ¿El texto se lee fácil?
- **Comprobaciones que haces una sola vez.** Escribir un test cuesta más que hacer la comprobación una vez.

La automatización no te reemplaza. Elimina el trabajo repetido, y así tienes tiempo para explorar.

## Un inventario de cobertura honesto

La tienda de práctica guarda una lista de lo que cubren sus tests. Abre `apps/practice-shop/e2e/COVERAGE.md`. Tiene dos partes.

La primera parte es una tabla de lo que está cubierto. Una fila se ve así:

```text
| Orders    | Status filter, admin marks a pending order as paid                                            | `orders/orders.spec.ts`       |
```

La segunda parte es "Not covered yet" (aún sin cubrir). Lista los huecos a propósito:

```text
- Editing a product.
- Pagination: the Next and Previous buttons.
- Duplicate SKU error when creating a product.
- The viewer role: no New, Edit or Delete buttons, and the API answers 403.
```

Esto es honesto. No dice "todo está probado". Dice qué está probado y qué no. Puedes confiar en la primera parte porque existe la segunda.

Mantén un archivo así en tu propio proyecto. Actualízalo en el mismo cambio que los tests.

## Práctica

1. Abre `apps/practice-shop/e2e/COVERAGE.md`. Cuenta las filas de la tabla "What is covered".
2. Elige un elemento de "Not covered yet". Escribe cuál de las tres preguntas (riesgo, frecuencia, estabilidad) hace que valga la pena probarlo.
3. Elige el elemento que automatizarías al final. Explica por qué en una frase.
4. Piensa en una función de tu propio trabajo. Escribe una línea por cada pregunta: riesgo, frecuencia, estabilidad. Decide: automatizar o dejar manual.
5. Ejecuta una vez la suite existente. Inicia la tienda en una terminal:

```bash
pnpm shop:dev
```

6. En una segunda terminal, ejecuta los tests:

```bash
pnpm shop:e2e
```

7. Lee la salida. Cuenta los tests. Anota cuánto tarda toda la ejecución.

## Comprueba lo que sabes

1. ¿Qué nivel de la pirámide tiene más tests?

<details><summary>Respuesta</summary>

La base: los tests unitarios. Son rápidos y baratos.

</details>

2. ¿Por qué un test E2E no debe probar diez precios inválidos?

<details><summary>Respuesta</summary>

Los tests E2E son lentos y costosos. Esas comprobaciones están mejor más abajo en la pirámide, cerca del código.

</details>

3. ¿Qué tres preguntas te ayudan a elegir qué automatizar?

<details><summary>Respuesta</summary>

Riesgo, frecuencia y estabilidad.

</details>

4. ¿Por qué `COVERAGE.md` lista lo que no está cubierto?

<details><summary>Respuesta</summary>

Hace honesto el inventario. Los lectores conocen el estado real y pueden elegir el siguiente test que escribir.

</details>

## Siguiente paso

En la siguiente lección aprenderás a mantener cada test independiente, para que pase solo y en cualquier orden.
