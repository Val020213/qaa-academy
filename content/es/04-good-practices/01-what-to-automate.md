---
title: Qué automatizar
summary: Elige qué comprobaciones merecen un test end-to-end automatizado, usando la pirámide de tests, números de costo y una forma de pensar basada en el riesgo.
duration: 75 min
---

## Empieza con un acertijo

Una tienda tiene una sola regla: el precio de un producto debe ser mayor que 0. Un desarrollador escribe tres tests para ella.

- El test A llama a la regla del precio directamente en el código. Tarda 2 milisegundos.
- El test B envía una petición al servidor. Tarda 40 milisegundos.
- El test C abre un navegador, inicia sesión, llena el formulario y hace clic en Save (Guardar). Tarda 6 segundos.

Los tres fallan cuando el precio es 0. Los tres pasan cuando el precio es 5.

El equipo puede conservar solo dos. ¿Cuál borras? Hay dos respuestas que parecen buenas: "borra el más lento, la velocidad importa" y "conserva C, es el más parecido a un usuario real".

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Predecir cuánto tarda una suite cuando mueves una comprobación del navegador a un nivel más bajo.
- Decidir qué automatizar usando riesgo, frecuencia y estabilidad.
- Explicar por qué una lista honesta de huecos sirve más que una lista con la cantidad de tests.
- Elegir qué comprobaciones se quedan manuales y defender esa elección.

## La pirámide de tests

Los tests de software vienen en tres tamaños comunes.

- Un **test unitario** comprueba una pieza pequeña de código, como una función que suma el impuesto a un precio. Se ejecuta en milisegundos.
- Un **test de integración** comprueba que varias piezas funcionan juntas. Un **test de API** es un tipo común: envía una petición al servidor y revisa la respuesta. Se ejecuta en decenas de milisegundos.
- Un *test end-to-end* (de extremo a extremo), o **test E2E**, abre un navegador real y usa la aplicación como una persona. Se ejecuta en segundos.

Los equipos dibujan esto como una pirámide: muchos tests unitarios abajo, menos tests de API en el medio y muy pocos tests E2E arriba.

No aceptes esa forma solo porque un libro lo dice. Pruébala con números.

### Un experimento: ¿cuánto cuesta una regla en cada nivel?

La tienda tiene 12 reglas. Cada regla tiene 8 entradas interesantes (válidas, vacía, demasiado larga, cero, etcétera). Son 96 comprobaciones. Usa los tiempos del acertijo. Antes de ejecutar nada, adivina: ¿cuánto tardan las 96 comprobaciones en cada nivel?

Guarda esto como `exercises/challenges/cost.ts` y ejecútalo con `node exercises/challenges/cost.ts`:

```ts
const levels = [
  { name: "unit", seconds: 0.002 },
  { name: "api", seconds: 0.04 },
  { name: "browser", seconds: 6 },
]

const rules = 12
const rows = 8

for (const level of levels) {
  const total = rules * rows * level.seconds
  console.log(`${level.name}: ${rules * rows} checks take ${total.toFixed(1)} seconds`)
}
```

Imprime:

```text
unit: 96 checks take 0.2 seconds
api: 96 checks take 3.8 seconds
browser: 96 checks take 576.0 seconds
```

Eso son casi 10 minutos en el navegador. Un desarrollador espera 10 minutos después de cada cambio, o deja de ejecutar la suite. Las dos opciones son malas.

## Por qué los tests E2E son caros

Un test E2E inicia un navegador, carga páginas y espera la pantalla. Toca todo el sistema, así que puede fallar por muchas razones: la página, el servidor, los datos o la red.

Esto tiene tres costos.

- La suite tarda más en ejecutarse, así que la gente la ejecuta con menos frecuencia.
- Un fallo es más difícil de explicar, porque la causa puede ser muchas piezas.
- El test se rompe más seguido cuando cambia la pantalla.

Por eso un test E2E debe cubrir un **recorrido de usuario importante**. Un recorrido es el camino que sigue un usuario para lograr una meta, como "iniciar sesión, crear un producto, verlo en la lista".

Un test E2E no debe cubrir todas las combinaciones de entradas. Comprobar diez precios inválidos en el navegador es lento. Esas comprobaciones van más abajo en la pirámide, cerca del código.

> **Nota:** En este curso escribirás sobre todo tests E2E. Ese es tu trabajo en la punta de la pirámide. Conocer los niveles de abajo te ayuda a pedirles a los desarrolladores los tests correctos ahí.

### El otro lado: lo que solo el navegador puede atrapar

Ahora sé justo con el test C. Piensa en tres bugs distintos.

1. La regla del precio está mal en el código: acepta 0.
2. La regla está bien, pero el servidor se olvida de llamarla.
3. La regla está bien y el servidor la llama, pero el formulario nunca muestra el error.

¿Cuál de los tres tests falla con cada bug? Resuélvelo primero en papel.

El test A falla solo con el bug 1. El test B falla con los bugs 1 y 2. El test C falla con los tres. Entonces el test del navegador atrapa más tipos de bugs, pero también es el que menos te dice sobre dónde está el bug. Un test de nivel más bajo atrapa menos tipos de bugs, pero señala la causa.

### De vuelta al acertijo

No hay una única respuesta correcta. Mira qué atrapa cada test que los otros no atrapan. Si B ya falla con el bug 1, entonces A aporta poco, así que A es el mejor candidato para borrar. Si borras C, nada atrapa el bug 3, y el usuario no ve nada cuando el precio está mal.

Un equipo sensato conserva B y prueba ahí los valores límite de la regla (0, negativo, una letra). Conserva un solo test de navegador que comprueba que el formulario muestra el mensaje. Borra A solo si B es lo bastante rápido y la regla vive en el código del servidor de todos modos. Las dos respuestas del principio eran demasiado simples, porque miraban la velocidad o el realismo, y no qué bug es el único que atrapa cada test.

## Cómo elegir qué automatizar

Eres un tester manual. Ya sabes cómo encontrar las comprobaciones importantes. Hazle tres preguntas a cada una.

1. **Riesgo.** ¿Qué pasa si esto se rompe? El login, los pagos y la pérdida de datos son de riesgo alto. Un color equivocado es de riesgo bajo.
2. **Frecuencia.** ¿Cada cuánto haces esta comprobación a mano? Una comprobación que repites en cada versión es una buena candidata.
3. **Estabilidad.** ¿Esta parte del producto cambia todas las semanas? Si es así, espera. Un test para una pantalla que cambia seguido cuesta más de lo que ahorra.

Una comprobación de riesgo alto, que se repite mucho y es estable, es la mejor primera elección.

### Pruébalo con tres comprobaciones

Aquí hay tres comprobaciones de una tienda. Antes de leer mi puntaje, dale a cada una un número de 1 (bajo) a 3 (alto) en riesgo, frecuencia y estabilidad. Luego multiplica los tres números.

- Iniciar sesión con una cuenta válida.
- El color de la insignia de estado.
- Una exportación CSV nueva, construida la semana pasada, que el equipo todavía cambia cada pocos días.

El login obtiene 3 x 3 x 3 = 27. El color de la insignia obtiene 1 x 2 x 2 = 4: riesgo bajo, aunque la página sea estable. La exportación CSV obtiene 2 x 1 x 1 = 2, porque cambia mucho y pocas personas la usan. Tus números pueden diferir un poco. Lo importante es el orden: primero el login, al final la exportación.

> **Cuidado:** Multiplicar es una ayuda para pensar, no una ley. Una comprobación con riesgo 3 y estabilidad 1 obtiene 3 x 2 x 1 = 6, baja en la lista. Pero puede ser la comprobación más importante que tengas. No dejes que un puntaje tome la decisión por ti.

## Qué se queda manual

No todo debe automatizarse.

- **Testing exploratorio.** Exploras el producto sin guion y buscas sorpresas. Un test solo puede comprobar lo que alguien pensó de antemano. Una persona encuentra lo inesperado.
- **Usabilidad y sensación visual.** ¿La página es clara? ¿El texto es fácil de leer?
- **Comprobaciones que haces una sola vez.** Escribir un test cuesta más que hacer la comprobación una vez.

La automatización no te reemplaza. Quita el trabajo repetido, para que tengas tiempo de explorar.

Hay un nombre para una trampa que aparece aquí: **YAGNI**, "You Aren't Gonna Need It" (no lo vas a necesitar). Significa que no construyas para una necesidad que solo imaginas. Un equipo que escribe tests "por si los necesitamos después" arma una suite enorme que nadie lee. Escribe el test cuando el riesgo sea real.

## Un inventario de cobertura honesto

La tienda de práctica mantiene una lista de lo que cubren sus tests. Abre `apps/practice-shop/e2e/COVERAGE.md`. Tiene dos partes.

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

Piensa en una regla: un SKU debe verse como `SKU-0001`. Puedes comprobarla en un navegador. El test abre la página, inicia sesión, abre el formulario, escribe el valor, hace clic en guardar y lee el error. Eso toma segundos.

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

Fíjate en la forma: un solo cuerpo de código y una tabla de entradas. Esto es **DRY**, "Don't Repeat Yourself" (no te repitas), de la lección "No te repitas (DRY)" del módulo de programación. Las filas de la tabla también son **valores límite** y **clases de equivalencia**: `SKU-1` y `SKU-12345` quedan justo fuera del largo permitido, y `""` es el caso vacío. La lección 10 de este módulo aplica la idea de la tabla a los tests.

### Una idea equivocada común: más tests significan más seguridad

Muchos principiantes piensan que 200 tests son más seguros que 20. No siempre. Si 150 de ellos recorren el mismo camino con pequeños cambios, un solo botón roto pone en rojo 150 tests. Tienes un problema y 150 mensajes.

La cobertura no es una cuenta de tests. Es una lista de riesgos que un test notaría. `COVERAGE.md` sirve porque lista riesgos, no cantidades de tests.

### Cómo aparece en el trabajo de QA: probar una regla por la API

Muchas veces puedes llegar a la regla sin la pantalla. La API de la tienda comprueba las mismas reglas que el formulario. Este test no necesita ninguna página del navegador:

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

El estado `422` significa que el servidor entendió la petición, pero los datos no son válidos. Este test es rápido. Entonces un solo test E2E puede comprobar únicamente que el formulario le muestra el error al usuario.

## Práctica

1. Abre `apps/practice-shop/e2e/COVERAGE.md`. Cuenta las filas de la tabla "What is covered" (lo que está cubierto). Hay 7.
2. Elige un elemento de "Not covered yet". Escribe cuál de las tres preguntas (riesgo, frecuencia, estabilidad) hace que valga la pena probarlo.
3. Elige el elemento que automatizarías al final. Explica por qué en una frase.
4. Piensa en una funcionalidad de tu propio trabajo. Escribe una línea para cada pregunta: riesgo, frecuencia, estabilidad. Decide: automatizar o dejar manual.
5. Ejecuta la suite existente una vez. Inicia la tienda en una terminal:

```bash
pnpm shop:dev
```

6. En una segunda terminal, ejecuta los tests:

```bash
pnpm shop:e2e
```

7. Lee la salida. Cuenta los tests. Anota cuánto tarda toda la ejecución. Luego encuentra el test más lento de la lista. ¿Es un recorrido o una regla?

## Reto

Divide una regla a lo largo de la pirámide. Elige un campo del formulario de producto: nombre, SKU, precio o stock. Prueba su regla rápido por la API, con una tabla de valores incorrectos. Luego agrega exactamente un test de navegador que demuestre que el usuario ve el error.

Crea el archivo `apps/practice-shop/e2e/challenges/pyramid-split.spec.ts`.

Está terminado cuando:

- Al menos cuatro valores incorrectos de tu campo elegido se prueban por `/api/products`, y cada uno espera el estado `422` y el mensaje exacto de ese campo.
- Cada valor incorrecto es su propio test, y el nombre del test contiene el valor, para que una línea roja te diga qué valor falló.
- Un test de navegador envía el formulario con un valor incorrecto en tu campo. Comprueba el mensaje bajo ese campo, y comprueba que los elementos de error de los otros campos no existen.
- Ejecutaste `pnpm shop:e2e challenges/pyramid-split.spec.ts`, todos los tests pasaron, y puedes ver en la salida que cada test de API es mucho más rápido que el test de navegador.

Vas a necesitar algo que esta lección no enseñó: cómo crear muchos tests a partir de un array de datos, y cómo enviar una petición que está mal en un solo campo. Busca: `playwright parameterize tests for loop`, `playwright list reporter test duration`.

> **Consejo:** Un asistente de IA puede explicarte la idea del bucle. Puedes preguntarle. Pero ejecuta el código y sé capaz de explicar cada línea a un compañero. Nunca conserves una línea que no puedas explicar.

## Piénsalo bien

1. Un equipo tiene 40 tests E2E. Cada uno escribe un precio incorrecto distinto en el formulario de producto, y cada uno tarda 12 segundos. ¿Cuánto dura la suite? Ahora el equipo mueve 38 de ellos a la API (0.04 segundos cada uno) y deja 2 en el navegador. Predice el nuevo tiempo y di qué dejarías en el navegador.

<details><summary>Respuesta</summary>

Antes: 40 x 12 = 480 segundos, que son 8 minutos. Después: 2 x 12 + 38 x 0.04 = 24 + 1.52, unos 26 segundos. La regla del precio está en el código del servidor, así que no necesita un navegador. Los dos tests que se quedan deben comprobar que el formulario muestra el mensaje de error, así la pantalla se sigue probando una vez. Además, el fallo señala la causa con más claridad.

</details>

2. Esta semana solo puedes automatizar una comprobación. La comprobación A es el checkout, que es de riesgo alto y se usa en cada versión, pero la página se rediseña la próxima semana. La comprobación B es el restablecimiento de contraseña, que también es de riesgo alto y no ha cambiado en dos años, pero la pruebas a mano solo una vez al mes. ¿Cuál eliges primero?

<details><summary>Respuesta</summary>

Elige B. Las dos son de riesgo alto. A es inestable: el rediseño romperá el test y pagas dos veces. B es estable, así que el test seguirá funcionando. La frecuencia es menor en B, pero esta vez la estabilidad decide. Escribe el test del checkout después del rediseño.

</details>

3. Un compañero dice: "Tenemos 300 tests E2E, así que estamos seguros." Otro dice: "Tenemos 40, y una lista de lo que no cubren." ¿Quién tiene más probabilidad de encontrar un problema antes que los usuarios? ¿Qué le preguntarías a cada uno?

<details><summary>Respuesta</summary>

No se puede saber solo con los números. Al primero pregúntale: "¿Qué riesgos notan los 300 tests?" Si la mayoría recorre el mismo camino, un fallo da 300 tests rojos y muchos riesgos siguen sin revisar. Al segundo pregúntale: "¿Qué hueco te preocupa más?" La persona con la lista sabe dónde el sistema está ciego, y ese es el comienzo de un plan. Conocer con honestidad los huecos vale más que una cantidad grande.

</details>

4. Tu equipo quiere un test E2E para cada fila de la lista "Not covered yet" de `COVERAGE.md`. El mes que viene el equipo de producto va a eliminar toda el área de pedidos. ¿Qué falla en tu plan y qué harías en su lugar?

<details><summary>Respuesta</summary>

Los tests para los huecos de pedidos (cancelar, enviar, filtro vacío) se escribirían y se tirarían. Esta es la pregunta de estabilidad: un área que va a desaparecer no debe recibir tests nuevos. Deja los huecos de pedidos en la lista y márcalos como "will be removed" (se eliminarán). Dedica el tiempo a los huecos en áreas que se quedan, como editar un producto o la paginación.

</details>

5. La tabla de SKU de esta lección tiene cinco filas. Un colega agrega una sexta fila: `" SKU-0001 "` con espacios alrededor, y espera `false`. El test dice `WRONG`. ¿Quién tiene razón: los datos del test o la función? ¿Cómo lo decides?

<details><summary>Respuesta</summary>

La función llama a `.trim()`, así que acepta los espacios y devuelve `true`. La fila no es "incorrecta" en sí misma: es una pregunta sobre la regla. Lo decides preguntando qué dice el requisito y qué hace el servidor real. En la tienda, `validation.ts` también recorta el SKU, así que `true` es el comportamiento verdadero, y el valor esperado de la fila es el error. El caso muestra por qué una fila es una decisión sobre el producto, y no solo una línea de código.

</details>

6. Tienes dos horas antes de una versión. Puedes escribir tres tests automatizados, o explorar a mano la funcionalidad nueva. La funcionalidad cambió mucho esta semana. ¿Qué haces y de qué depende tu respuesta?

<details><summary>Respuesta</summary>

La mayoría de los testers exploraría a mano primero. La funcionalidad es nueva e inestable, así que un script habría que reescribirlo, y explorar encuentra las sorpresas que un script no puede. La respuesta depende del riesgo: si un recorrido central como el login pudiera verse afectado, lo compruebas a mano en 5 minutos primero, y lo automatizas después de la versión. También depende de lo que ya existe. Si ya corre una suite de regresión estable, tienes libertad para explorar. No hay una única respuesta correcta.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es el testing trophy (trofeo de tests) y en qué se diferencia de la pirámide de tests?**
   - Busca: `testing trophy vs testing pyramid`
   - Pruébalo: toma las filas de `COVERAGE.md`. Escribe cada una en un nivel (unitario, API, E2E) dos veces: una para un equipo de pirámide y otra para un equipo de trofeo. Marca dónde se diferencian tus dos listas.
   - Una buena respuesta explica: qué niveles enfatiza cada forma y por qué algunos equipos eligen el trofeo.

2. **¿Qué es el testing basado en riesgo y cómo ordenan los riesgos los equipos?**
   - Busca: `risk-based testing likelihood impact`
   - Pruébalo: lista seis funcionalidades de la tienda. Dale a cada una una probabilidad y un impacto de 1 a 3. Multiplica, ordena y compara tu orden con la lista "Not covered yet".
   - Una buena respuesta explica: cómo la probabilidad y el impacto se combinan en una prioridad, y cómo eso te ayuda a elegir qué automatizar.

3. **¿Cuál es la diferencia entre un smoke test y un test de regresión?**
   - Busca: `smoke test vs regression test`
   - Pruébalo: ejecuta `pnpm shop:e2e auth/auth.spec.ts`, y luego toda la suite. Anota los dos tiempos. Decide qué archivos spec pondrías en una ejecución "smoke" de menos de 30 segundos.
   - Una buena respuesta explica: el propósito, el tamaño y el momento de cada uno, y cuál ejecutarías primero después de una versión nueva.

## Siguiente paso

En la próxima lección aprendes a mantener cada test independiente, para que pase solo y en cualquier orden.
