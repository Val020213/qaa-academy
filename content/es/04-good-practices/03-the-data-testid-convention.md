---
title: La convención data-testid
summary: Aprende la regla del equipo para los test ids, cómo funcionan los ids de fila y qué hacer cuando falta un id.
duration: 25 min
---

## Objetivo

- Nombrar un test id con la regla `<feature>-<element>`.
- Construir ids de fila que incluyan el id del registro.
- Leer un `data-testid` en JSX real.
- Saber qué hacer cuando falta un id.

## Qué es data-testid

Un *test id* (identificador para tests) es un atributo del HTML de la página que existe solo para los tests. Su nombre es `data-testid`. Los usuarios no lo ven.

Playwright encuentra un elemento por su test id con `getByTestId`:

```ts
await page.getByTestId("products-search").fill("mouse")
```

El test id no cambia cuando cambian el texto, el color o el diseño de la página. Por eso el test sigue funcionando.

## La regla

Todo elemento interactivo tiene un `data-testid` con esta forma:

```text
<feature>-<element>
```

La **feature** (función) es la página o el área. El **element** (elemento) es lo que es esa cosa. Estos son ids reales de la tienda:

- `login-email`, `login-password`, `login-submit`
- `products-search`, `products-status-filter`, `products-new`
- `product-name`, `product-sku`, `product-save`
- `orders-status-filter`

Todas las palabras van en minúsculas, con un guion entre ellas. Puedes leer el id y saber dónde está el elemento.

> **Nota:** "Interactivo" significa que le haces clic, escribes en él o eliges algo en él. En esta tienda, los elementos que solo lees, como un contador o un mensaje de error, también tienen ids, porque los tests los comprueban.

## Los ids de fila incluyen el id del registro

Una tabla tiene muchas filas. Todas se ven iguales, así que el id debe decir de qué fila se trata. El id del registro va al final.

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

Algunos elementos existen una sola vez a la vez en la página. El diálogo de confirmación es uno de ellos. La tienda usa un solo diálogo para todos los borrados. Sus botones siempre tienen los mismos ids: `confirm-delete-button` y `confirm-delete-cancel`.

Lo puedes ver en `apps/practice-shop/components/confirm-delete-dialog.tsx`. Un comentario al inicio lo explica.

Así, el flujo de borrado tiene dos pasos con dos tipos de ids. El primer clic usa un id de fila. El segundo clic usa el id compartido.

## Cuando falta un id

A veces necesitas un elemento que no tiene test id. No uses un selector frágil, como una clase CSS o la posición de un elemento.

Tienes dos opciones.

1. **Pídelo al desarrollador.** Indica qué elemento, en qué página y qué nombre sugieres, como `products-export`.
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

- El texto cambia. Un botón llamado "Delete" puede pasar a ser "Remove". Se romperían todos los tests que usan el texto.
- El texto puede aparecer dos veces. En la tabla de productos, cada fila tiene un botón "Delete".
- Un id es un contrato. Un desarrollador que ve `data-testid` sabe que un test depende de él.

El costo es que los desarrolladores deben agregar los ids. Por eso la regla se aplica a todos los elementos.

## Práctica

1. Abre `apps/practice-shop/app/(dashboard)/products/page.tsx`.
2. Busca cada `data-testid` del archivo. Anota tres que incluyan un id de registro.
3. Abre `apps/practice-shop/e2e/lib/pages/products.page.ts`. Busca dónde se usa `products-search`.
4. Inicia la tienda con `pnpm shop:dev`. Abre http://localhost:5190 e inicia sesión como `admin@qa-shop.test` con la contraseña `Admin123!`.
5. Abre la página de productos. En tu navegador, haz clic derecho en un botón Delete (borrar) y elige **Inspect** (inspeccionar).
6. Busca el atributo `data-testid` del botón. Comprueba que el número coincide con el producto.
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

La tienda usa un diálogo compartido para todos los borrados, y solo hay un diálogo abierto a la vez.

</details>

4. Da una razón por la que el equipo prefiere los test ids al texto.

<details><summary>Respuesta</summary>

El texto puede cambiar, y el mismo texto puede aparecer muchas veces. Un test id se mantiene igual y es único.

</details>

## Siguiente paso

En la siguiente lección aprenderás qué es un fixture y cómo escribir el tuyo.
