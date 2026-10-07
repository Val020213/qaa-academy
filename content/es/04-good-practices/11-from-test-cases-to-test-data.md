---
title: De casos de prueba a datos de prueba
duration: 60 min
---

## Objetivo

Elige las entradas de una tabla de casos a partir de las reglas de validación y los requisitos. Usa esa tabla para generar un test por fila.

- Elegir clases de equivalencia y valores límite.
- Cubrir entradas aceptadas y rechazadas con una tabla de datos.
- Separar las comprobaciones de la API de las del formulario.
- Revisar los tests con FIRST.

## Elegir las filas

Ya usaste un array de objetos y un bucle para generar tests. Ahora el trabajo es elegir qué entradas y resultados esperados poner en las filas.

Una **clase de equivalencia** agrupa entradas que la app trata de la misma manera. Si los nombres "Mouse" y "Keyboard" pasan la misma comprobación de longitud, una fila puede representar esa clase.

Los **valores límite** están en el borde donde cambia una decisión. Para revisar una comparación, elige el borde, un paso por debajo y un paso por encima. En la regla del nombre, `name.length < 3`, las longitudes 2, 3 y 4 permiten comprobar dónde cambia el resultado.

## Lee las reglas en el código

Abre `apps/practice-shop/lib/validation.ts`. La función quita los espacios de los extremos del nombre antes de comprobar su longitud. Convierte el precio y el stock a números antes de comprobarlos.

El formulario envía los valores a la API. El servidor ejecuta la validación y devuelve los errores; el formulario los muestra junto a los campos:

![Un formulario vacío muestra cuatro errores. Al arreglar el nombre, quedan tres errores.](/clips/shop-form-validation.webm)

| Campo | Regla en el código | Clases | Valores límite |
| --- | --- | --- | --- |
| Nombre | sin espacios en los extremos, al menos 3 caracteres | muy corto; suficientemente largo | `""`, `"ab"` rechazados; `"abc"` aceptado; `"  ab  "` rechazado, porque los espacios se quitan primero |
| Precio | un número finito, mayor que 0 | no es un número; infinito (`Infinity`, `1e309`); cero o menos; mayor que cero | `"abc"`, `"0"`, `"-1"` rechazados; `"0.01"` aceptado |
| Stock | un número entero, 0 o más | no es un número; negativo; no entero; entero y 0 o más | `"-1"`, `"1.5"`, `""` rechazados; `"0"` aceptado |

El nombre no tiene límite superior. El precio no tiene límite superior. Una fila como "un nombre de 10000 caracteres" prueba una regla que no existe.

> **Cuidado:** El código no es el requisito. Si el requisito dice "nombre: de 3 a 50 caracteres" y el código no tiene máximo, falta una validación. Compara las reglas con los requisitos y consulta la diferencia con el responsable del producto.

## Una tabla, un bucle

El formulario está en `/products/new`. Cada fila cambia un campo de un formulario que por lo demás es válido. Las filas aceptadas comprueban la vuelta a la lista; las rechazadas comprueban el mensaje y que el formulario siga abierto.

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

El bucle llama a `test` una vez por fila, y el runner de Playwright registra nueve tests con títulos distintos. Si uno falla, el reporte identifica su entrada.

Cada test crea su propio SKU dentro del cuerpo. La preparación construye los valores válidos y aplica el cambio de la fila. Las acciones llenan y guardan el formulario; las aserciones comprueban el resultado. Un test, un Act. Si necesitas dos Acts, tienes dos tests.

## Filas para la API y para el navegador

Usa el navegador para comprobar cómo muestra el formulario un error y qué ocurre al guardar. Para comprobar solo una regla del servidor, envía los datos directamente a la API.

Este test usa `page.request`, que comparte las cookies del contexto del navegador. La configuración de la tienda carga la sesión guardada del administrador:

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

Con precio 0 y los demás campos válidos, el servidor responde con el estado 422 y el error de precio. El test comprueba tanto el estado como el cuerpo de la respuesta.

Este test se ejecuta en unos pocos milisegundos. Pon aquí todas las filas de reglas, y deja dos o tres filas en el navegador para mostrar que el error le llega al usuario.

## Revisa un test con FIRST

Usa **FIRST** como lista de revisión:

1. **Fast (rápido):** ¿hace solo lo que necesita y prepara los datos por la API cuando la interfaz no es lo que se prueba?
2. **Independent (independiente):** ¿puede ejecutarse solo y en cualquier orden?
3. **Repeatable (repetible):** ¿da el mismo resultado en cada ejecución, gracias a datos únicos y sin pausas?
4. **Self-checking (autoverificable):** ¿contiene una aserción que decide si pasa o falla?
5. **Timely (oportuno):** ¿se escribió junto con la función, cuando las reglas estaban frescas?

Cada fila debe poder encontrar un bug que ninguna otra fila encuentra. Pregunta por cada fila: "¿qué línea de código equivocada haría fallar solo a esta fila?" Si no puedes nombrar una, borra la fila.

## Profundiza

### Combinaciones de campos inválidos

Cambiar un solo campo por fila facilita identificar la causa de un fallo, pero deja sin probar las combinaciones de campos inválidos. Agrega unas pocas filas combinadas cuando sospeches que los campos se afectan entre sí.

## Práctica

1. Abre `apps/practice-shop/lib/validation.ts`. Para cada uno de los cinco campos, escribe la regla y sus clases.
2. Crea `apps/practice-shop/e2e/products/product-form-boundaries.spec.ts` y escribe el spec con tabla de arriba.
3. Ejecútalo con `pnpm shop:e2e products/product-form-boundaries.spec.ts` y lee los nueve títulos en el reporte.
4. En tu copia, cambia `name.length < 3` por `name.length < 4`. Ejecuta de nuevo el spec y comprueba qué fila falla. Restaura la línea original.
5. Agrega la comprobación de la API como un segundo archivo y ejecútala.

## Reto

Escribe un spec con tabla para el campo SKU en `apps/practice-shop/e2e/products/sku-boundaries.spec.ts`. Un SKU debe verse como `SKU-0001`. El servidor pasa el texto a mayúsculas antes de comprobarlo y rechaza los duplicados.

Está terminado cuando:

- La tabla tiene al menos 8 filas, con un comentario que nombra cada clase de equivalencia, y cubre los lados aceptado y rechazado de cada límite que encontraste.
- La fila del SKU duplicado crea su primer producto por la API.
- Puedes nombrar, para cada fila, una línea de código equivocada que la haría fallar.
- `pnpm shop:e2e products/sku-boundaries.spec.ts` pasa.

Para leer el patrón `^SKU-\d{4}$` y encontrar sus bordes, busca `regular expression anchors` y `regex digit quantifier`.

## Piénsalo bien

1. Un tester escribe un solo espacio en el campo Stock y guarda un producto con los demás campos válidos. Según `validation.ts`, ¿qué ocurre y por qué?

<details><summary>Respuesta</summary>

El formulario guarda el producto con stock 0. La comprobación `data.stock === ""` no rechaza el espacio. Luego `Number(" ")` da 0, que pasa las comprobaciones de entero y no negativo. `""` y `" "` necesitan filas distintas porque el validador las trata de manera diferente.

</details>

2. Un compañero escribe `const sku = uniqueSku()` una sola vez al inicio del archivo y usa `sku` en todas las filas. ¿Por qué fallan las filas aceptadas después de guardar el primer producto?

<details><summary>Respuesta</summary>

Las filas aceptadas intentan guardar el mismo SKU. Después del primer producto, el servidor rechaza ese SKU con "This SKU is already used by another product.". Las filas rechazadas no guardan productos, así que pueden ocultar el problema. Llama a `uniqueSku()` dentro de cada test.

</details>

3. El responsable del producto agrega un máximo de 50 caracteres al nombre. ¿Qué filas siguen siendo válidas y cuáles debes agregar?

<details><summary>Respuesta</summary>

Las filas de 2 y 3 caracteres siguen siendo válidas. Los nombres de `uniqueName("Boundary")` tienen menos de 50 caracteres, así que tampoco cambian las otras filas. Agrega 50 caracteres como entrada aceptada y 51 como rechazada, con el mensaje de la nueva validación.

</details>

## Siguiente paso

En el módulo 5, "Proyecto real", aplicas estas habilidades a las dos apps reales y envías tu primer *pull request*.
