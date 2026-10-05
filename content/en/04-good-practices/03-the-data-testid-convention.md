---
title: The data-testid convention
summary: Learn the team rule for test ids, how row ids work, and what to do when an id is missing.
duration: 25 min
---

## Goal

- Name a test id with the rule `<feature>-<element>`.
- Build row-scoped ids that include the record id.
- Read a `data-testid` in real JSX.
- Know what to do when an id is missing.

## What is data-testid

A **test id** is an attribute in the page HTML that exists only for tests. Its name is `data-testid`. Users do not see it.

Playwright finds an element by its test id with `getByTestId`:

```ts
await page.getByTestId("products-search").fill("mouse")
```

The test id does not change when the text, the colour or the layout of the page changes. So the test keeps working.

## The rule

Every interactive element has a `data-testid` with this shape:

```text
<feature>-<element>
```

The **feature** is the page or area. The **element** is what the thing is. Here are real ids from the shop:

- `login-email`, `login-password`, `login-submit`
- `products-search`, `products-status-filter`, `products-new`
- `product-name`, `product-sku`, `product-save`
- `orders-status-filter`

All words are lowercase, with a hyphen between them. You can read the id and know where the element is.

> **Note:** "Interactive" means you click it, type in it or choose from it. Elements you only read, such as a count or an error message, also get ids in this shop, because tests check them.

## Row ids include the record id

A table has many rows. They all look the same, so the id must say which row. The record id goes at the end.

Here is the real code from `apps/practice-shop/app/(dashboard)/products/page.tsx`:

```html
<tr key={product.id} data-testid={`products-row-${product.id}`}>
  <td data-testid={`products-name-${product.id}`}>{product.name}</td>
```

For the product with id 12, the ids are `products-row-12` and `products-name-12`. The delete button is the same:

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

This button has the id `products-delete-12` for product 12. In a test you build the id from the id you know:

```ts
await page.getByTestId(`products-delete-${product.id}`).click()
```

## One shared dialog, one shared id

Some elements exist only once on the page at a time. The confirm dialog is one of them. The shop uses one dialog for every delete. Its buttons always have the same ids: `confirm-delete-button` and `confirm-delete-cancel`.

You can see this in `apps/practice-shop/components/confirm-delete-dialog.tsx`. A comment at the top explains it.

So the delete flow has two steps with two kinds of ids. The first click uses a row id. The second click uses the shared id.

## When an id is missing

Sometimes you need an element that has no test id. Do not use a fragile selector, such as a CSS class or the position of an element.

You have two options.

1. **Ask the developer.** Say which element, which page and which name you suggest, such as `products-export`.
2. **Add it yourself.** It is one attribute in the JSX. For example, the new-product link looks like this:

```html
<Link className="button" href="/products/new" data-testid="products-new">
  New product
</Link>
```

Adding `data-testid` does not change how the page works or looks. If you are not sure you may change the file, ask first.

## Test ids versus roles and text

Playwright has other ways to find elements. `getByRole` finds an element by its meaning, such as a button. `getByText` finds it by the words on screen.

Many teams prefer roles, because they also check that the page is accessible. This team chose test ids. The rule in `apps/practice-shop/e2e/README.md` says:

```text
Select with `page.getByTestId(...)`. No CSS, no XPath, no text selectors for things you click.
```

The reasons are practical.

- Text changes. A button called "Delete" may become "Remove". Every test that uses the text would break.
- Text can appear twice. In the products table, every row has a "Delete" button.
- An id is a contract. A developer who sees `data-testid` knows a test depends on it.

The cost is that developers must add the ids. That is why the rule applies to every element.

## Practice

1. Open `apps/practice-shop/app/(dashboard)/products/page.tsx`.
2. Find every `data-testid` in the file. Write down three that include a record id.
3. Open `apps/practice-shop/e2e/lib/pages/products.page.ts`. Find where `products-search` is used.
4. Start the shop with `pnpm shop:dev`. Open http://localhost:5190 and sign in as `admin@qa-shop.test` with the password `Admin123!`.
5. Open the products page. In your browser, right-click a Delete button and choose **Inspect**.
6. Find the `data-testid` attribute on the button. Check that the number matches the product.
7. Do the same for the search box on the page.

## Check what you know

1. What shape does a test id have?

<details><summary>Answer</summary>

`<feature>-<element>`, in lowercase with hyphens. Example: `products-search`.

</details>

2. What is the id of the delete button for the product with id 7?

<details><summary>Answer</summary>

`products-delete-7`.

</details>

3. Why does the shop have one `confirm-delete-button` and not one per product?

<details><summary>Answer</summary>

The shop uses one shared dialog for every delete, and only one dialog is open at a time.

</details>

4. Give one reason the team prefers test ids over text.

<details><summary>Answer</summary>

Text can change, and the same text can appear many times. A test id stays the same and is unique.

</details>

## Next step

In the next lesson you learn what a fixture is and how to write your own.
