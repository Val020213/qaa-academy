---
title: Qué automatizar
duration: 60 min
---

## Objetivo

En esta lección eliges qué comprobaciones automatizar y en qué nivel probarlas. Comparas el costo de ejecutarlas con los riesgos que pueden detectar.

- Calcular el tiempo de varias comprobaciones en cada nivel de la pirámide.
- Priorizar usando riesgo, frecuencia y estabilidad.
- Elegir qué comprobaciones mantener manuales.
- Registrar la cobertura y sus huecos.

## La pirámide de tests

La pirámide propone muchos tests unitarios, menos tests de integración y pocos tests E2E. Cada nivel comprueba una parte distinta de la aplicación:

- Un **test unitario** llama directamente a una pieza pequeña de código, como una función que valida un precio.
- Un **test de integración** comprueba varias piezas juntas. Un **test de API** envía una petición al servidor y revisa la respuesta.
- Un **test E2E** recorre la aplicación con un navegador, como los tests que ya escribiste con Playwright.

### El costo de repetir una comprobación

Supón que un test unitario tarda 2 milisegundos, uno de API tarda 40 milisegundos y uno de navegador tarda 6 segundos. Son tiempos de ejemplo, no mediciones de la tienda.

La tienda tiene 12 reglas, cada una con 8 entradas para comprobar: 96 comprobaciones. El siguiente cálculo suma sus tiempos si se ejecutan una tras otra.

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

Con estos tiempos, comprobar todas las entradas en el navegador toma casi 10 minutos. Mover las comprobaciones de reglas a la API reduce la espera sin necesitar que el navegador repita cada entrada.

## El costo y la cobertura de un test E2E

Un test E2E inicia un navegador, carga páginas y espera la pantalla. Toca todo el sistema, así que puede fallar por muchas razones: la página, el servidor, los datos o la red.

Además del tiempo de ejecución, debes contar el trabajo de investigar fallos y mantener los pasos cuando cambia la pantalla. Reserva los tests E2E para recorridos importantes, como iniciar sesión, crear un producto y verlo en la lista.

### Los bugs que detecta cada nivel

Para la regla «el precio debe ser mayor que 0», considera tres tests:

- A llama directamente a la función que valida el precio.
- B envía el precio al servidor y comprueba la respuesta.
- C envía el formulario en el navegador y comprueba el mensaje de error.

Estos tests cubren fallos distintos:

1. La función acepta 0: A, B y C fallan.
2. La función es correcta, pero el servidor no la llama: B y C fallan.
3. El servidor rechaza el precio, pero el formulario no muestra el error: solo C falla.

El test de navegador cubre la conexión entre la pantalla y el servidor. Si falla, tienes más piezas que revisar que con A, que llama directamente a la función.

Puedes conservar B para los valores límite y C para comprobar el mensaje del formulario. Considera quitar A solo si B cubre los mismos casos, es suficientemente rápido y la regla vive en el servidor.

## Elegir qué automatizar

Evalúa cada comprobación con tres criterios:

1. **Riesgo:** el daño que causa un fallo. El login, los pagos y la pérdida de datos son de riesgo alto.
2. **Frecuencia:** cuántas veces repites la comprobación. Una que haces en cada versión puede ahorrar trabajo al automatizarla.
3. **Estabilidad:** cuánto cambia la parte que pruebas. Los cambios frecuentes en una pantalla pueden exigir cambios frecuentes en el test.

Una comprobación de riesgo alto, repetida y estable es una buena primera elección.

### Un puntaje para ordenar candidatas

Puedes asignar de 1 (bajo) a 3 (alto) a cada criterio y multiplicarlos. Con estas valoraciones de ejemplo:

- Login con una cuenta válida: 3 x 3 x 3 = 27.
- Color de la insignia de estado: 1 x 2 x 2 = 4.
- Exportación CSV nueva, poco usada y todavía en desarrollo: 2 x 1 x 1 = 2.

El puntaje pone primero el login, pero revisa el riesgo antes de decidir. Una comprobación con riesgo 3, frecuencia 2 y estabilidad 1 obtiene 6 y puede seguir siendo la más urgente.

## Qué se queda manual

Mantén trabajo manual cuando necesites explorar o juzgar la experiencia del usuario:

- En el **testing exploratorio**, buscas comportamientos que todavía no están contemplados en los tests.
- Para evaluar **usabilidad y claridad visual**, revisas si la página y sus textos se entienden.
- Para una **comprobación de una sola vez**, compara el esfuerzo de escribir y mantener el test con hacerla a mano.

**YAGNI**, «You Aren't Gonna Need It» (no lo vas a necesitar), recomienda construir para una necesidad real. Antes de agregar un test «por si acaso», identifica el riesgo que detectaría y cuándo necesitarás repetirlo.

## Un inventario de cobertura

Abre `apps/practice-shop/e2e/COVERAGE.md`. La tabla "What is covered" registra los comportamientos cubiertos y el archivo que los comprueba. Una fila se ve así:

```text
| Orders    | Status filter, admin marks a pending order as paid                                            | `orders/orders.spec.ts`       |
```

La sección "Not covered yet" registra los huecos. Este es un fragmento:

```text
- Editing a product.
- The product detail page: open it from the list, check its data, go back.
- Deleting a product from its detail page.
- Pagination: the Next and Previous buttons.
- Duplicate SKU error when creating a product.
- The viewer role: no New, Edit or Delete buttons, and the API answers 403.
```

Usa esos huecos para priorizar el siguiente test. Actualiza el inventario en el mismo cambio que los tests, para que el equipo sepa qué riesgos siguen sin comprobar.

## Comprobar una regla sin navegador

Una función que valida el formato de un SKU puede recibir varias entradas sin abrir páginas ni llenar formularios:

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

Imprime cinco líneas, y cada una termina en `ok`. La función recorta los espacios y convierte el texto a mayúsculas antes de comprobar el formato.

Las filas de la tabla también son **valores límite** y **clases de equivalencia**: `SKU-1` y `SKU-12345` quedan justo fuera del largo permitido, y `""` es el caso vacío.

### Comprobar la respuesta de la API

En la tienda, el formulario envía los valores al servidor. El servidor valida los datos y devuelve los errores; el formulario los muestra bajo los campos.

Este test comprueba el rechazo de un nombre demasiado corto sin usar una página del navegador:

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

El servidor devuelve el estado `422` y un mensaje para el campo. El test comprueba ambos, mientras que un test E2E puede comprobar que el formulario muestra ese mensaje al usuario.

## Profundiza

### La cantidad de tests no demuestra la cobertura

Si 150 tests recorren el mismo camino con entradas distintas, un botón roto puede hacer fallar los 150. La cantidad de fallos no te dice cuántos riesgos distintos cubren.

Un inventario como `COVERAGE.md` permite revisar qué comportamientos se comprueban y cuáles faltan, aunque la suite tenga muchos tests.

## Práctica

1. Abre `apps/practice-shop/e2e/COVERAGE.md` y revisa las 7 filas de "What is covered".
2. De "Not covered yet", elige un elemento para automatizar primero y otro para el final. Justifica cada elección con riesgo, frecuencia o estabilidad.
3. Elige una funcionalidad de tu trabajo. Escribe una línea para cada criterio y decide si automatizarla o mantenerla manual.
4. Inicia la tienda en una terminal:

```bash
pnpm shop:dev
```

5. En una segunda terminal, ejecuta la suite:

```bash
pnpm shop:e2e
```

6. Anota la cantidad de tests y el tiempo total. Identifica el test más lento y revisa si comprueba un recorrido o una regla.

## Reto

Elige un campo del formulario de producto: nombre, SKU, precio o stock. Comprueba al menos cuatro valores incorrectos por la API y agrega un solo test de navegador para el mensaje del formulario.

Crea el archivo `apps/practice-shop/e2e/challenges/pyramid-split.spec.ts`.

Está terminado cuando:

- Cada valor incorrecto se prueba por `/api/products` y espera el estado `422` y el mensaje exacto del campo elegido.
- Cada valor tiene su propio test, cuyo nombre contiene el valor que se prueba.
- El test de navegador comprueba el mensaje bajo el campo elegido y que no existen elementos de error para los otros campos.
- Ejecutaste `pnpm shop:e2e challenges/pyramid-split.spec.ts`, todos los tests pasaron, y puedes ver en la salida que cada test de API es mucho más rápido que el test de navegador.

Para crear tests desde un array y enviar datos incorrectos en un solo campo, busca: `playwright parameterize tests for loop`, `playwright list reporter test duration`.

## Piénsalo bien

1. Un equipo tiene 40 tests E2E que prueban precios incorrectos. Cada uno tarda 12 segundos y se ejecutan uno tras otro. Si mueve 38 a la API (0.04 segundos cada uno) y deja 2 en el navegador, ¿cuánto tarda cada ejecución?

<details><summary>Respuesta</summary>

Antes: 40 x 12 = 480 segundos, u 8 minutos. Después: 2 x 12 + 38 x 0.04 = 25.52 segundos, unos 26 segundos. Los tests de navegador deben comprobar que el formulario muestra el error.

</details>

2. Tu equipo quiere un test E2E por cada hueco de "Not covered yet" de `COVERAGE.md`. El mes que viene eliminará el área de pedidos. ¿Qué problema tiene el plan?

<details><summary>Respuesta</summary>

Los tests nuevos de pedidos tendrían poca vida útil. Registra que esa área se eliminará y prioriza los huecos de las áreas que seguirán disponibles.

</details>

3. Un colega agrega a la tabla de SKU la entrada `" SKU-0001 "` y espera `false`. El código imprime `WRONG`. ¿Qué devuelve la función y qué debes revisar antes de cambiarla?

<details><summary>Respuesta</summary>

Devuelve `true`, porque `.trim()` elimina los espacios antes de comprobar el formato. Revisa el requisito para decidir el valor esperado. En la tienda, `validation.ts` también recorta el SKU.

</details>

## Siguiente paso

En la próxima lección aprendes a mantener cada test independiente, para que pase solo y en cualquier orden.
