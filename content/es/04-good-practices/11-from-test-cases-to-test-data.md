---
title: De casos de prueba a datos de prueba
summary: Convierte tu habilidad para diseñar casos de prueba en una tabla de filas, deriva clases de equivalencia y valores límite del código de validación real, y genera un test por fila.
duration: 90 min
---

## Empieza con un acertijo

Un formulario de la tienda dice que el nombre necesita "al menos 3 caracteres". Una tester prueba "ab" y ve un error. Prueba "abc" y se guarda. Ahí se detiene.

Otro tester prueba 40 nombres: "Mouse", "Keyboard", "Monitor 27", y así. Todos se guardan. Reporta 40 tests aprobados.

Los dos testers ejecutaron un número distinto de casos. Uno de ellos encontró dónde vive la regla. El otro no encontró nada nuevo después del primer caso. ¿Quién probó mejor, y por qué? Ahora piensa en el campo del precio, que debe ser "mayor que 0". ¿Qué tres valores probarías primero?

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Derivar clases de equivalencia y valores límite a partir del código de validación.
- Escribir una tabla de casos como datos y generar un test por fila.
- Decidir qué filas van en un test *end-to-end* (de extremo a extremo) y cuáles en una comprobación más barata de la API.
- Revisar un test con Arrange, Act, Assert (preparar, actuar, comprobar) y FIRST.

## Los casos son datos

Como tester manual ya escribes casos de prueba: un nombre, una entrada y un resultado esperado. Una tabla de casos en código es lo mismo. Es un *array* (lista) de objetos, y un bucle convierte cada objeto en un test. Usaste este patrón en las lecciones 1.09 y 4.10. Esta lección decide qué va en las filas.

Dos ideas eligen las filas.

Una **clase de equivalencia** es un grupo de entradas que la app trata de la misma manera. Si "Mouse" y "Keyboard" pasan la misma comprobación, con una basta. Probar la segunda no te da información nueva.

Un **valor límite** es una entrada en el borde entre dos clases. Los bugs viven ahí, porque los programadores escriben `<` cuando quieren decir `<=`. Prueba el borde, un paso por debajo y un paso por encima.

## Lee las reglas en el código

Las reglas están en `apps/practice-shop/lib/validation.ts`. Lee las líneas del nombre, el precio y el stock. Antes de mirar la tabla, adivina: para la regla del nombre `name.length < 3`, ¿cuál es la última entrada que falla?

Fíjate en cuántos errores muestra el formulario vacío, y cuántos quedan después de arreglar el nombre.

![Un formulario vacío muestra cuatro errores. Al arreglar el nombre, quedan tres errores.](/clips/shop-form-validation.webm)

| Campo | Regla en el código | Clases | Valores límite |
| --- | --- | --- | --- |
| Nombre | sin espacios en los extremos, al menos 3 caracteres | muy corto; suficientemente largo | `""`, `"ab"` rechazados; `"abc"` aceptado; `"  ab  "` rechazado, porque los espacios se quitan primero |
| Precio | un número finito, mayor que 0 | no es un número; infinito (`Infinity`, `1e309`); cero o menos; mayor que cero | `"abc"`, `"0"`, `"-1"` rechazados; `"0.01"` aceptado |
| Stock | un número entero, 0 o más | no es un número; negativo; no entero; entero y 0 o más | `"-1"`, `"1.5"`, `""` rechazados; `"0"` aceptado |

Fíjate en lo que la tabla no muestra. El nombre no tiene límite superior. El precio no tiene límite superior. Una fila como "un nombre de 10000 caracteres" prueba una regla que no existe. Leer el código te dice qué filas son reales.

> **Cuidado:** El código no es el requisito. Si el requisito dice "nombre: de 3 a 50 caracteres" y el código no tiene máximo, la tabla de arriba encuentra un bug que ningún test del código mostraría. Compara los dos, y luego pregunta al responsable del producto.

## Una tabla, un bucle

El formulario está en `/products/new`. Este spec cubre nombre, precio y stock. Tiene los dos lados: las filas aceptadas guardan el producto, las filas rechazadas muestran el texto del error. Aquí el formulario del producto es lo que se prueba, así que el test lo llena por la interfaz. Cada fila cambia un campo de un formulario que por lo demás es válido.

```ts
import { expect, test } from "../lib/test"
import { uniqueName, uniqueSku } from "../lib/helpers"

type Values = { name: string; sku: string; price: string; stock: string }

type Case = {
  title: string
  change: Partial<Values>
  // No "rejected" means the form must accept the input.
  rejected?: { field: "name" | "price" | "stock"; message: string }
}

const NAME_ERROR = "Name must have at least 3 characters."
const PRICE_ERROR = "Price must be greater than 0."
const STOCK_ERROR = "Stock must be a whole number, 0 or more."

const cases: Case[] = [
  { title: "name of 2 characters", change: { name: "ab" }, rejected: { field: "name", message: NAME_ERROR } },
  { title: "name of 3 characters", change: { name: "abc" } },
  { title: "name of spaces only", change: { name: "     " }, rejected: { field: "name", message: NAME_ERROR } },
  { title: "price 0", change: { price: "0" }, rejected: { field: "price", message: PRICE_ERROR } },
  { title: "price 0.01", change: { price: "0.01" } },
  { title: "price with letters", change: { price: "abc" }, rejected: { field: "price", message: PRICE_ERROR } },
  { title: "stock -1", change: { stock: "-1" }, rejected: { field: "stock", message: STOCK_ERROR } },
  { title: "stock 0", change: { stock: "0" } },
  { title: "stock 1.5", change: { stock: "1.5" }, rejected: { field: "stock", message: STOCK_ERROR } },
]

for (const row of cases) {
  test(`product form: ${row.title} is ${row.rejected ? "rejected" : "accepted"}`, async ({ page }) => {
    // Arrange: a valid form, with only the field of this row changed.
    const values: Values = {
      name: uniqueName("Boundary"),
      sku: uniqueSku(),
      price: "12.50",
      stock: "7",
      ...row.change,
    }
    await page.goto("/products/new")

    // Act: fill in the form and save it.
    await page.getByTestId("product-name").fill(values.name)
    await page.getByTestId("product-sku").fill(values.sku)
    await page.getByTestId("product-price").fill(values.price)
    await page.getByTestId("product-stock").fill(values.stock)
    await page.getByTestId("product-save").click()

    // Assert: what the user sees.
    if (row.rejected) {
      await expect(page.getByTestId(`product-${row.rejected.field}-error`)).toHaveText(row.rejected.message)
      await expect(page).toHaveURL(/\/products\/new$/)
    } else {
      await expect(page).toHaveURL(/\/products$/)
    }
  })
}
```

Cada fila crea su propio SKU dentro del test. Ninguna fila depende de otra. Nueve filas dan nueve tests con nueve títulos claros, y una fila que falla se nombra sola en el reporte.

### De vuelta al acertijo

La primera tester probó las dos entradas a cada lado del borde. El segundo tester probó 40 entradas de una misma clase. Para el precio, empieza con `0` (el borde, rechazado), `0.01` (un valor por encima del borde, aceptado) y un valor que no es un número. Tres filas valen más que cuarenta.

## La forma de cada test

Cada test de arriba tiene tres partes. Esto se llama **Arrange, Act, Assert** (preparar, actuar, comprobar). Arrange arma la situación inicial. Act hace la única cosa que se prueba. Assert comprueba lo que el usuario puede ver. Un test, un Act. Si necesitas dos Acts, tienes dos tests.

## ¿Qué filas necesitan un navegador?

Una fila de la tabla es barata de escribir. No es barata de ejecutar. Un test en el navegador abre una página, escribe en cuatro campos y espera a la pantalla.

Los tests de navegador de arriba comprueban que el formulario muestra el error junto al campo. Eso necesita un navegador, pero una o dos filas lo prueban. La regla misma, "el precio debe ser mayor que 0", se comprueba en el servidor, y una comprobación del servidor no necesita pantalla. Este test envía la petición directo a la API y usa `page.request`, que lleva la sesión del administrador desde el login guardado:

```ts
import { expect, test } from "../lib/test"
import { uniqueName, uniqueSku } from "../lib/helpers"

test("the API rejects a price of 0", async ({ page }) => {
  const response = await page.request.post("/api/products", {
    data: { name: uniqueName("Api"), sku: uniqueSku(), price: 0, stock: 1, status: "draft" },
  })

  expect(response.status()).toBe(422)
  expect(await response.json()).toEqual({ errors: { price: "Price must be greater than 0." } })
})
```

El código de estado 422 significa "el servidor entendió la petición, pero los datos no son válidos". El cuerpo lista un mensaje por cada campo equivocado. Este test se ejecuta en unos pocos milisegundos. Pon aquí todas las filas de reglas, y deja dos o tres filas en el navegador para mostrar que el error le llega al usuario.

## Revisa un test con FIRST

Usa estas cinco palabras como lista de revisión. Haz cada pregunta sobre un test que escribiste.

1. **Fast (rápido):** ¿hace solo lo que necesita, y prepara los datos por la API cuando la interfaz no es lo que se prueba?
2. **Independent (independiente):** ¿puede ejecutarse solo y en cualquier orden?
3. **Repeatable (repetible):** ¿da el mismo resultado en cada ejecución, gracias a datos únicos y sin pausas?
4. **Self-checking (autoverificable):** ¿contiene una aserción, para que nadie tenga que mirar la pantalla y decidir?
5. **Timely (oportuno):** ¿se escribió junto con la función, cuando las reglas estaban frescas?

## El límite

Más filas no es más valor. Cada fila debe poder encontrar un bug que ninguna otra fila encuentra. Pregunta por cada fila: "¿qué línea de código equivocada haría fallar solo a esta fila?" Si no puedes nombrar una, borra la fila.

## Profundiza

Las clases de equivalencia y los valores límite son las mismas herramientas que usas en las pruebas manuales. Escribirlos como datos agrega dos beneficios. La tabla es un documento de revisión: un desarrollador o el responsable del producto puede leer nueve líneas y decir "olvidaste la longitud máxima". El bucle también evita que la tabla se aleje de los tests, porque la tabla son los tests.

Las filas también pueden esconder una debilidad. Si cada fila cambia un campo y mantiene los demás válidos, nunca pruebas dos campos equivocados juntos. Es una decisión deliberada: cuando una fila falla, conoces la causa. Agrega unas pocas filas combinadas solo cuando sospeches que los campos se afectan entre sí.

## Práctica

1. Abre `apps/practice-shop/lib/validation.ts`. Para cada uno de los cinco campos, escribe una frase: la regla y sus clases.
2. Crea `apps/practice-shop/e2e/products/product-form-boundaries.spec.ts` y escribe a mano el spec con tabla de arriba.
3. Ejecútalo con `pnpm shop:e2e products/product-form-boundaries.spec.ts` y lee los nueve títulos de test en el reporte.
4. Rompe una regla a propósito en tu propia copia: cambia `name.length < 3` por `name.length < 4`. ¿Qué fila falla? Devuelve la línea a como estaba.
5. Agrega la comprobación de la API como un segundo archivo y ejecútala.

## Reto

Escribe un spec guiado por una tabla para el campo SKU. Un SKU debe verse como `SKU-0001`. El servidor también pasa el texto a mayúsculas antes de comprobarlo, y rechaza un SKU que otro producto ya usa.

Está terminado cuando:

- la tabla tiene al menos 8 filas, y un comentario sobre cada grupo de filas nombra su clase de equivalencia;
- la tabla tiene filas en el lado aceptado y en el lado rechazado de cada límite que encontraste;
- la fila del SKU duplicado crea su primer producto por la API, no por el formulario;
- puedes nombrar, para cada fila, una línea de código equivocada que la haría fallar;
- `pnpm shop:e2e products/sku-boundaries.spec.ts` pasa.

Vas a necesitar algo que esta lección no enseñó: cómo leer el patrón `^SKU-\d{4}$` y encontrar sus bordes. Busca `regular expression anchors` y `regex digit quantifier`.

Crea el archivo `apps/practice-shop/e2e/products/sku-boundaries.spec.ts`. Elige tus propias filas extra. ¿Un `sku-1234` en minúsculas está en la clase aceptada o en la rechazada?

## Piénsalo bien

1. **Predice.** Un tester escribe un solo espacio en el campo Stock y guarda un producto válido. Usando `validation.ts`, di qué hace el formulario y por qué. (Pista: lee cómo se construye `stock` antes de las comprobaciones.)

   <details><summary>Respuesta</summary>

   El formulario guarda el producto con un stock de 0. El código comprueba `data.stock === ""`, y un espacio no es una cadena vacía. Luego `Number(" ")` da 0, que es un número entero y no es negativo. Así que todas las comprobaciones pasan. Es un bug si el requisito dice que el stock es obligatorio. Muestra por qué una entrada que parece vacía es una clase aparte: `""` y `" "` se ven iguales para una persona y son distintas en el código.
   </details>

2. **Encuentra el bug.** Un compañero escribe `const sku = uniqueSku()` una sola vez al inicio del archivo y usa `sku` en cada fila. Las filas rechazadas pasan. Seis meses después las filas "aceptadas" empiezan a fallar. ¿Por qué?

   <details><summary>Respuesta</summary>

   Cada fila aceptada guarda un producto con el mismo SKU. La primera tiene éxito. La segunda choca con la regla de duplicados y muestra "This SKU is already used by another product.", así que falla. Las filas rechazadas nunca guardan, así que ocultan el problema. Los tests no eran independientes: compartían datos. Cada test debe llamar a `uniqueSku()` dentro de su propio cuerpo.
   </details>

3. **Dos versiones.** La versión A tiene un test por fila. La versión B pone todas las filas rechazadas en un solo test: llena el formulario seis veces seguidas y comprueba seis errores. ¿Cuál es mejor aquí, y qué te haría elegir la otra?

   <details><summary>Respuesta</summary>

   La versión A es mejor. Un fallo nombra la fila, las filas corren aisladas y un reintento repite un solo caso. La versión B se detiene en el primer paso que falla y oculta las filas que siguen. Elegirías B solo si cada fila cuesta mucho, por ejemplo un login lento para cada test, y las filas no cambian el estado. Aun así, la solución más barata suele ser mover las filas a una comprobación de la API.
   </details>

4. **Qué se rompe si...** El responsable del producto agrega una regla: el nombre puede tener como máximo 50 caracteres. ¿Qué filas de la tabla siguen siendo válidas, cuáles deben cambiar y cuáles hay que agregar?

   <details><summary>Respuesta</summary>

   Las filas de 2 y 3 caracteres siguen siendo válidas. Los nombres únicos que crea `uniqueName("Boundary")` se quedan por debajo de 50, así que las otras filas también siguen funcionando. Debes agregar filas en el nuevo borde: 50 caracteres (aceptado) y 51 caracteres (rechazado), con un mensaje de error que sacas del código nuevo. También puedes agregar una fila para el nombre vacío. Una regla nueva significa filas nuevas y no código de test nuevo, que es el beneficio de la tabla.
   </details>

5. **Explícalo.** Explica a un compañero, en tres frases, por qué un test con el precio `0` y otro con `0.01` valen más que diez tests con precios como 5, 10 y 99. No uses las palabras "límite" ni "equivalencia".

   <details><summary>Respuesta</summary>

   Una buena respuesta dice que todos los precios por encima de cero siguen el mismo camino en el código, así que después de uno, los demás no te dicen nada nuevo. El error del programador es más probable en el borde, donde el código decide entre "aceptar" y "rechazar", así que los dos valores a cada lado del borde pueden atrapar una comparación equivocada. Diez valores parecidos prueban la misma línea diez veces, mientras que dos valores bien elegidos prueban la decisión misma.
   </details>

6. **Criterio.** Tu tabla tiene 30 filas para el campo del precio. ¿Deben ser todas tests de navegador?

   <details><summary>Respuesta</summary>

   No hay una sola respuesta correcta. El navegador prueba que el error se le muestra al usuario, y una o dos filas lo prueban. Las otras filas comprueban la regla, y la comprobación de la API lo hace más rápido y con menos causas de fallo. La decisión depende de dónde vive la regla: si el navegador también valida, como en muchas apps, necesitas filas de navegador para esa copia también. También depende de cuánto puede tardar la suite y de quién debe leer los resultados.
   </details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Cuántos valores debes probar en cada borde: dos o tres?**
   - Busca: `boundary value analysis two-value three-value`
   - Pruébalo: agrega las filas extra para el campo del precio que pide el método de tres valores, y mira si alguna puede encontrar un bug que las filas de dos valores no pueden.
   - Una buena respuesta explica: cuándo ayuda el valor extra y qué tipo de error de programación atrapa.

2. **¿Qué hace `Number()` con texto raro?**
   - Busca: `javascript Number conversion string whitespace empty string`
   - Pruébalo: ejecuta `Number("")`, `Number(" ")`, `Number("1e3")` y `Number("0x10")` en un archivo pequeño de TypeScript o en la consola del navegador, y escribe una entrada de formulario para cada uno que un usuario podría teclear.
   - Una buena respuesta explica: cuáles de los resultados sorprenderían a un usuario y qué filas agregan a la tabla.

3. **¿Puede un programa inventar las filas por ti?**
   - Busca: `property-based testing fast-check`
   - Pruébalo: escribe una función simple `isValidName(text)` que copie la regla del nombre, y piensa en tres propiedades que siempre deben cumplirse, como "cualquier texto de 3 o más caracteres que no sean espacios se acepta".
   - Una buena respuesta explica: qué encuentra el *property-based testing* (pruebas basadas en propiedades) que una tabla hecha a mano no encuentra, y cuánto cuesta.

## Siguiente paso

En el módulo 5, "Proyecto real", aplicas estas habilidades a las dos apps reales y envías tu primer *pull request*.
