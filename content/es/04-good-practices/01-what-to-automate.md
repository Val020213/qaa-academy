---
title: Qué automatizar
summary: Aprende la pirámide de tests y cómo elegir qué comprobaciones merecen un test end-to-end automatizado.
duration: 40 min
---

## Objetivo

- Explicar la pirámide de tests con palabras sencillas.
- Decir por qué los tests end-to-end deben ser pocos y estar bien elegidos.
- Elegir qué automatizar según el riesgo, la frecuencia y la estabilidad.
- Leer un inventario de cobertura real.

## La pirámide de tests

Los tests de software tienen tres tamaños habituales.

- Un *unit test* (test unitario) comprueba un trozo pequeño de código, como una función que suma el impuesto a un precio. Se ejecuta en milisegundos.
- Un *integration test* (test de integración) comprueba que varias piezas funcionan juntas. Un *API test* (test de API) es un tipo común: envía una petición al servidor y revisa la respuesta. Se ejecuta en decenas de milisegundos.
- Un *test end-to-end* (de extremo a extremo), o *test E2E*, abre un navegador real y usa la aplicación como una persona. Se ejecuta en segundos.

Los equipos dibujan estos tests como una pirámide. Abajo hay muchos tests unitarios. En el medio hay menos tests de API. Arriba hay muy pocos tests E2E.

La forma importa. Los tests de abajo son rápidos y baratos. Los de arriba son lentos y caros.

## Por qué los tests E2E son caros

Un test E2E abre un navegador, carga páginas y espera a la pantalla. Toca todo el sistema, así que puede fallar por muchas razones: la página, el servidor, los datos o la red.

Esto tiene tres costos.

- La suite tarda más en ejecutarse, así que la gente la ejecuta con menos frecuencia.
- Un fallo es más difícil de explicar, porque la causa puede estar en muchas partes.
- El test se rompe más a menudo cuando cambia la pantalla.

Por eso un test E2E debe cubrir un **recorrido importante del usuario**. Un recorrido es el camino que sigue un usuario para lograr un objetivo, como "iniciar sesión, crear un producto, verlo en la lista".

Un test E2E no debe cubrir cada combinación de datos. Comprobar diez precios inválidos en el navegador es lento. Esas comprobaciones van más abajo en la pirámide, cerca del código.

> **Nota:** En este curso escribirás sobre todo tests E2E. Ese es tu trabajo en la punta de la pirámide. Conocer los niveles de abajo te ayuda a pedir a los desarrolladores los tests correctos allí.

## Cómo elegir qué automatizar

Eres un tester manual. Ya sabes encontrar las comprobaciones importantes. Hazte tres preguntas sobre cada una.

1. **Riesgo.** ¿Qué pasa si esto falla? El login, los pagos y la pérdida de datos son de riesgo alto. Un color incorrecto es de riesgo bajo.
2. **Frecuencia.** ¿Cuántas veces ejecutas esta comprobación a mano? Una comprobación que repites en cada versión es una buena candidata.
3. **Estabilidad.** ¿Esta parte del producto cambia cada semana? Si es así, espera. Un test para una pantalla que cambia mucho cuesta más de lo que ahorra.

Una comprobación de riesgo alto, repetida con frecuencia y estable es la mejor primera opción.

## Qué se queda manual

No todo debe automatizarse.

- **Pruebas exploratorias.** Exploras el producto sin guion y buscas sorpresas. Un test solo puede comprobar lo que alguien pensó de antemano. Una persona encuentra lo inesperado.
- **Usabilidad y sensación visual.** ¿La página es clara? ¿El texto es fácil de leer?
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
- The product detail page: open it from the list, check its data, go back.
- Deleting a product from its detail page.
- Pagination: the Next and Previous buttons.
- Duplicate SKU error when creating a product.
- The viewer role: no New, Edit or Delete buttons, and the API answers 403.
```

Esto es honesto. No dice "todo está probado". Dice qué está probado y qué no. Un lector puede confiar en la primera parte porque existe la segunda.

Mantén un archivo así en tu propio proyecto. Actualízalo en el mismo cambio que los tests.

## Profundiza

### Por qué la misma comprobación cuesta mucho más en un navegador

Piensa en una regla: un SKU debe verse como `SKU-0001`. Puedes comprobarlo en un navegador. El test abre la página, inicia sesión, abre el formulario, escribe el valor, pulsa guardar y lee el error. Eso tarda segundos.

La regla en sí es una línea de código. Un test unitario puede comprobarla en milisegundos. Esta es la idea en TypeScript simple. Comprueba cinco entradas con un solo bucle:

```ts
function isValidSku(value: string): boolean {
  return /^SKU-\d{4}$/.test(value.trim().toUpperCase())
}

const rows = [
  { input: "SKU-0001", expected: true },
  { input: "sku-0001", expected: true },
  { input: "SKU-1", expected: false },
  { input: "SKU-12345", expected: false },
  { input: "", expected: false },
]

for (const row of rows) {
  const actual = isValidSku(row.input)
  console.log(`${JSON.stringify(row.input)} -> ${actual} ${actual === row.expected ? "ok" : "WRONG"}`)
}
```

Imprime cinco líneas, y cada una termina en `ok`. En un navegador, las mismas cinco comprobaciones tardarían unos 25 segundos si cada una tarda 5 segundos.

Fíjate en la forma: un solo cuerpo de código y una tabla de entradas. Esto es **DRY** (no te repitas), de la lección "No te repitas (DRY)" del módulo de programación. La lección 10 de este módulo lo aplica a los tests.

### Una idea equivocada común: más tests significan más seguridad

Muchos principiantes piensan que 200 tests son más seguros que 20. No siempre. Si 150 de ellos recorren el mismo camino con pequeños cambios, un botón roto pone en rojo 150 tests. Tienes un problema y 150 mensajes.

La cobertura no es un conteo de tests. Es una lista de riesgos que un test notaría. `COVERAGE.md` es útil porque lista riesgos, no números de tests.

### Cómo aparece en el trabajo de QA: probar una regla por la API

Muchas veces puedes llegar a la regla sin pasar por la pantalla. La API de la tienda comprueba las mismas reglas que el formulario. Este test no necesita ninguna página del navegador:

```ts
import { expect, test } from "../lib/test"

test("the API rejects a name that is too short", async ({ request }) => {
  const response = await request.post("/api/products", {
    data: { name: "ab", sku: "SKU-7001", price: 5, stock: 1, status: "active" },
  })

  expect(response.status()).toBe(422)
  const body = (await response.json()) as { errors: { name: string } }
  expect(body.errors.name).toBe("Name must have at least 3 characters.")
})
```

El estado `422` significa que el servidor entendió la petición pero los datos no son válidos. Este test es rápido. Entonces un solo test E2E puede comprobar únicamente que el formulario muestra el error al usuario.

## Práctica

1. Abre `apps/practice-shop/e2e/COVERAGE.md`. Cuenta las filas de la tabla "What is covered" (lo que está cubierto).
2. Elige un elemento de "Not covered yet". Escribe cuál de las tres preguntas (riesgo, frecuencia, estabilidad) hace que valga la pena probarlo.
3. Elige el elemento que automatizarías al final. Explica por qué en una frase.
4. Piensa en una funcionalidad de tu propio trabajo. Escribe una línea para cada pregunta: riesgo, frecuencia, estabilidad. Decide: automatizar o dejar manual.
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

El de abajo: los tests unitarios. Son rápidos y baratos.

</details>

2. ¿Por qué un test E2E no debe comprobar diez precios inválidos?

<details><summary>Respuesta</summary>

Los tests E2E son lentos y caros. Esas comprobaciones están mejor más abajo en la pirámide, cerca del código.

</details>

3. ¿Qué tres preguntas te ayudan a elegir qué automatizar?

<details><summary>Respuesta</summary>

Riesgo, frecuencia y estabilidad.

</details>

4. ¿Por qué `COVERAGE.md` lista lo que no está cubierto?

<details><summary>Respuesta</summary>

Hace honesto el inventario. Los lectores conocen el estado real y pueden elegir el siguiente test que escribir.

</details>

5. Un equipo tiene 40 tests E2E. Cada uno escribe un precio incorrecto distinto en el formulario de producto. La suite tarda 8 minutos. ¿Qué cambiarías y qué dejarías en el navegador?

<details><summary>Respuesta</summary>

Pasa las 40 comprobaciones de precio a la API o a tests unitarios, porque la regla del precio está en el código del servidor y no necesita un navegador. Deja uno o dos tests E2E que comprueben que el formulario muestra el mensaje de error. La regla se prueba rápido y la pantalla se prueba una sola vez.

</details>

6. Solo puedes automatizar una comprobación esta semana. La comprobación A es el pago (checkout): riesgo alto y se usa en cada versión, pero la página se rediseña la próxima semana. La comprobación B es restablecer la contraseña: también de riesgo alto y sin cambios desde hace dos años, pero la pruebas a mano solo una vez al mes. ¿Cuál eliges primero?

<details><summary>Respuesta</summary>

Elige B. Las dos son de riesgo alto. A es inestable: el rediseño romperá el test y pagas dos veces. B es estable, así que el test seguirá funcionando. La frecuencia de B es menor, pero esta vez decide la estabilidad. Escribe el test del pago después del rediseño.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es el testing trophy (trofeo de tests) y en qué se diferencia de la pirámide de tests?**
   - Busca: `testing trophy vs testing pyramid`
   - Una buena respuesta explica: a qué niveles da más peso cada forma y por qué algunos equipos eligen el trofeo.

2. **¿Qué son las pruebas basadas en riesgo y cómo ordenan los equipos los riesgos?**
   - Busca: `risk-based testing likelihood impact`
   - Una buena respuesta explica: cómo la probabilidad y el impacto se combinan en una prioridad, y cómo eso te ayuda a elegir qué automatizar.

3. **¿Cuál es la diferencia entre un smoke test y un test de regresión?**
   - Busca: `smoke test vs regression test`
   - Una buena respuesta explica: el propósito, el tamaño y el momento de cada uno, y cuál ejecutarías primero después de una nueva versión.

## Siguiente paso

En la próxima lección aprendes a mantener cada test independiente, para que pase solo y en cualquier orden.
