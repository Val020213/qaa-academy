---
title: La convención data-testid
summary: Aprende la regla del equipo para los test ids, cómo funcionan los ids de fila y qué hacer cuando falta un id.
duration: 40 min
---

## Objetivo

- Nombrar un *test id* con la regla `<feature>-<element>`.
- Construir ids de fila que incluyan el id del registro.
- Leer un `data-testid` en JSX real.
- Saber qué hacer cuando falta un id.

## Qué es data-testid

Un **test id** (identificador para tests) es un atributo del HTML de la página que existe solo para los tests. Su nombre es `data-testid`. Los usuarios no lo ven.

Playwright encuentra un elemento por su test id con `getByTestId`:

```ts
await page.getByTestId("products-search").fill("mouse")
```

El test id no cambia cuando cambian el texto, el color o el diseño de la página. Así el test sigue funcionando.

## La regla

Todo elemento interactivo tiene un `data-testid` con esta forma:

```text
<feature>-<element>
```

La **feature** (funcionalidad) es la página o el área. El **element** (elemento) es lo que es esa cosa. Estos son ids reales de la tienda:

- `login-email`, `login-password`, `login-submit`
- `products-search`, `products-status-filter`, `products-new`
- `product-name`, `product-sku`, `product-save`
- `orders-status-filter`

Todas las palabras van en minúsculas, con un guion entre ellas. Puedes leer el id y saber dónde está el elemento.

> **Nota:** "Interactivo" significa que lo pulsas, escribes en él o eliges algo de él. En esta tienda, los elementos que solo lees, como un conteo o un mensaje de error, también tienen ids, porque los tests los comprueban.

## Los ids de fila incluyen el id del registro

Una tabla tiene muchas filas. Todas se ven iguales, así que el id debe decir qué fila es. El id del registro va al final.

Este es el código real de `apps/practice-shop/app/(dashboard)/products/page.tsx`:

```html
<tr key={product.id} data-testid={`products-row-${product.id}`}>
  <td data-testid={`products-name-${product.id}`}>{product.name}</td>
```

Para el producto con id 12, los ids son `products-row-12` y `products-name-12`. El botón de borrar funciona igual:

```html
<button
  className="link-button danger"
  type="button"
  onClick={() => setToDelete(product)}
  data-testid={`products-delete-${product.id}`}
>
  Delete
</button>
```

Este botón tiene el id `products-delete-12` para el producto 12. En un test construyes el id a partir del id que conoces:

```ts
await page.getByTestId(`products-delete-${product.id}`).click()
```

## Un diálogo compartido, un id compartido

Algunos elementos existen una sola vez en la página a la vez. El diálogo de confirmación es uno de ellos. La tienda usa un solo diálogo para todos los borrados. Sus botones siempre tienen los mismos ids: `confirm-delete-button` y `confirm-delete-cancel`.

Puedes verlo en `apps/practice-shop/components/confirm-delete-dialog.tsx`. Un comentario al inicio lo explica.

Así, el flujo de borrado tiene dos pasos con dos tipos de ids. El primer clic usa un id de fila. El segundo clic usa el id compartido.

## Cuando falta un id

A veces necesitas un elemento que no tiene test id. No uses un selector frágil, como una clase CSS o la posición de un elemento.

Tienes dos opciones.

1. **Pregunta al desarrollador.** Dile qué elemento, qué página y qué nombre sugieres, como `products-export`.
2. **Agrégalo tú.** Es un solo atributo en el JSX. Por ejemplo, el enlace de producto nuevo se ve así:

```html
<Link className="button" href="/products/new" data-testid="products-new">
  New product
</Link>
```

Agregar `data-testid` no cambia cómo funciona ni cómo se ve la página. Si no estás seguro de poder cambiar el archivo, pregunta primero.

## Test ids frente a roles y texto

Playwright tiene otras formas de encontrar elementos. `getByRole` encuentra un elemento por su significado, como un botón. `getByText` lo encuentra por las palabras en pantalla.

Muchos equipos prefieren los roles, porque también comprueban que la página sea accesible. Este equipo eligió los test ids. La regla en `apps/practice-shop/e2e/README.md` dice:

```text
Select with `page.getByTestId(...)`. No CSS, no XPath, no text selectors for things you click.
```

Las razones son prácticas.

- El texto cambia. Un botón llamado "Delete" puede pasar a llamarse "Remove". Todos los tests que usan el texto se romperían.
- El texto puede aparecer dos veces. En la tabla de productos, cada fila tiene un botón "Delete".
- Un id es un contrato. Un desarrollador que ve `data-testid` sabe que un test depende de él.

El costo es que los desarrolladores deben agregar los ids. Por eso la regla se aplica a todos los elementos.

## Profundiza

### Por qué `getByTestId` es solo una búsqueda de atributo

`getByTestId` no es magia. Busca un elemento cuyo atributo `data-testid` tenga ese valor. Estas dos líneas hacen el mismo trabajo:

```ts
await page.getByTestId("products-search").fill("mouse")
await page.locator('[data-testid="products-search"]').fill("mouse")
```

La segunda línea es un selector de atributo CSS. La primera es más corta y más fácil de leer. El nombre `data-testid` es solo un valor por defecto. Si tu equipo ya usa otro nombre, como `data-qa`, una línea en la configuración lo cambia, y la aplicación no cambia:

```ts
use: { testIdAttribute: "data-qa" },
```

Los atributos que empiezan con `data-` están reservados por HTML para tu propia información. El navegador los ignora. Por eso son seguros para los tests.

### Una idea equivocada común: cualquier número en el id sirve

Un principiante puede construir los ids de fila con la posición en la lista:

```html
<tr data-testid={`products-row-${index}`}>
```

La tienda ordena de más nuevo a más antiguo. Cuando un test agrega un producto, todas las filas bajan una posición. El id `products-row-0` ahora apunta a otro producto. Un test que pulsa `products-row-0` puede borrar la fila equivocada.

El id del registro es estable. El producto 12 es `products-row-12` hoy y mañana. Usa algo que pertenezca al registro, nunca a su lugar en la pantalla.

### Cómo ayuda la regla en el trabajo real

Un nombre consistente permite seleccionar por grupo. El Page Object usa esta línea:

```ts
this.rows = page.getByTestId(/^products-row-/)
```

La parte `/^products-row-/` es una **expresión regular**: un patrón que coincide con texto. Significa "empieza con `products-row-`". Coincide con las 10 filas, y no coincide con `products-name-5`, porque la feature y el elemento son distintos. Una regla de nombres descuidada lo haría imposible.

Esto también es DRY en acción. La cadena del id se escribe una vez en la aplicación y una vez en el Page Object. Los specs no la repiten.

### Un límite de los test ids

Un test id no dice nada sobre el usuario. Un botón puede tener `data-testid="products-new"` y aun así no tener un nombre legible para un lector de pantalla. El test pasa. Un usuario real con un lector de pantalla no puede usarlo. Los test ids hacen que los tests sean estables. No prueban que la página sea accesible.

## Práctica

1. Abre `apps/practice-shop/app/(dashboard)/products/page.tsx`.
2. Encuentra cada `data-testid` del archivo. Anota tres que incluyan un id de registro.
3. Abre `apps/practice-shop/e2e/lib/pages/products.page.ts`. Encuentra dónde se usa `products-search`.
4. Inicia la tienda con `pnpm shop:dev`. Abre http://localhost:5190 e inicia sesión como `admin@qa-shop.test` con la contraseña `Admin123!`.
5. Abre la página de productos. En tu navegador, haz clic derecho en un botón Delete y elige **Inspect** (Inspeccionar).
6. Encuentra el atributo `data-testid` en el botón. Comprueba que el número coincide con el producto.
7. Haz lo mismo con el cuadro de búsqueda de la página.

## Comprueba lo que sabes

1. ¿Qué forma tiene un test id?

<details><summary>Respuesta</summary>

`<feature>-<element>`, en minúsculas y con guiones. Ejemplo: `products-search`.

</details>

2. ¿Cuál es el id del botón de borrar del producto con id 7?

<details><summary>Respuesta</summary>

`products-delete-7`.

</details>

3. ¿Por qué la tienda tiene un solo `confirm-delete-button` y no uno por producto?

<details><summary>Respuesta</summary>

La tienda usa un solo diálogo compartido para todos los borrados, y solo hay un diálogo abierto a la vez.

</details>

4. Da una razón por la que el equipo prefiere los test ids al texto.

<details><summary>Respuesta</summary>

El texto puede cambiar, y el mismo texto puede aparecer muchas veces. Un test id se mantiene igual y es único.

</details>

5. Un desarrollador pone `data-testid="delete"` en el botón de borrar de cada fila, para que los ids sean cortos. ¿Qué pasa cuando tu test llama a `page.getByTestId("delete").click()` en una página con 10 filas?

<details><summary>Respuesta</summary>

El locator coincide con 10 elementos. Playwright es estricto, así que un clic sobre más de un elemento falla con una *strict mode violation* (violación del modo estricto). El id debe incluir el id del registro, como `products-delete-12`, para que cada botón sea único.

</details>

6. En una página con 10 filas de productos, ¿con cuántos elementos coincide `page.getByTestId(/^products-row-/)`? ¿`page.getByTestId(/^products-/)` coincidiría con menos, con los mismos o con más? ¿Por qué?

<details><summary>Respuesta</summary>

El primer patrón coincide con 10, un `tr` por fila. El segundo coincide con más. Los nombres, las etiquetas de estado, los botones de borrar, el cuadro de búsqueda, la tabla y otros elementos también empiezan con `products-`. Un prefijo debe ser específico para seleccionar solo el grupo que quieres.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué son los atributos `data-*` en HTML y para qué sirven?**
   - Busca: `html data-* attributes custom data`
   - Una buena respuesta explica: cómo se escribe uno, cómo puede leerlo JavaScript y por qué el navegador lo ignora al mostrar la página.

2. **¿Qué recomienda la documentación de Playwright para encontrar elementos y por qué?**
   - Busca: `playwright locators best practices getByRole`
   - Una buena respuesta explica: el orden de preferencia de los locators y la razón por la que se prefieren los que usan lo que ve el usuario.

3. **¿Por qué los selectores de clase CSS y de XPath se llaman frágiles en la automatización de tests?**
   - Busca: `brittle selectors XPath CSS test automation`
   - Una buena respuesta explica: qué cambia en una página que rompe esos selectores y cuál es una alternativa estable.

## Siguiente paso

En la próxima lección aprendes qué es un fixture y cómo escribir el tuyo.
