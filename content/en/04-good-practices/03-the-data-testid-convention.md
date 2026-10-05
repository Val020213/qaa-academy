---
title: The data-testid convention
summary: Learn the team rule for test ids, how row ids work, and what to do when an id is missing.
duration: 40 min
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

## Go deeper

### Why `getByTestId` is only an attribute search

`getByTestId` is not magic. It looks for an element whose `data-testid` attribute has that value. These two lines do the same work:

```ts
await page.getByTestId("products-search").fill("mouse")
await page.locator('[data-testid="products-search"]').fill("mouse")
```

The second line is a CSS attribute selector. The first is shorter and easier to read. The name `data-testid` is only a default. If your team already uses another name, such as `data-qa`, one line in the config changes it, and the app does not change:

```ts
use: { testIdAttribute: "data-qa" },
```

Attributes that start with `data-` are reserved by HTML for your own information. The browser ignores them. That is why they are safe for tests.

### A common wrong idea: any number in the id will do

A beginner may build row ids from the position in the list:

```html
<tr data-testid={`products-row-${index}`}>
```

The shop sorts newest first. When a test adds a product, every row moves down by one. The id `products-row-0` now points to a different product. A test that clicks `products-row-0` may delete the wrong row.

The record id is stable. Product 12 is `products-row-12` today and tomorrow. Use something that belongs to the record, never to its place on the screen.

### How the rule helps in real work

A consistent name allows group selection. The Page Object uses this line:

```ts
this.rows = page.getByTestId(/^products-row-/)
```

The `/^products-row-/` part is a **regular expression**: a pattern that matches text. It means "starts with `products-row-`". It matches the 10 rows, and it does not match `products-name-5`, because the feature and element differ. A sloppy naming rule would make this impossible.

This is also DRY at work. The id string is written once in the app and once in the Page Object. The specs do not repeat it.

### A limit of test ids

A test id says nothing about the user. A button can have `data-testid="products-new"`, and still have no readable name for a screen reader. The test passes. A real user with a screen reader cannot use it. Test ids make tests steady. They do not prove the page is accessible.

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

5. A developer puts `data-testid="delete"` on the delete button of every row, to keep ids short. What happens when your test calls `page.getByTestId("delete").click()` on a page with 10 rows?

<details><summary>Answer</summary>

The locator matches 10 elements. Playwright is strict, so a click on more than one element fails with a strict mode violation. The id must include the record id, such as `products-delete-12`, so each button is unique.

</details>

6. On a page with 10 product rows, how many elements does `page.getByTestId(/^products-row-/)` match? Would `page.getByTestId(/^products-/)` match fewer, the same, or more? Why?

<details><summary>Answer</summary>

The first pattern matches 10, one `tr` per row. The second matches more. Names, status badges, delete buttons, the search box, the table and other elements also start with `products-`. A prefix must be specific to select only the group you want.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What are `data-*` attributes in HTML, and what are they meant for?**
   - Search for: `html data-* attributes custom data`
   - A good answer explains: how to write one, how JavaScript can read it, and why the browser ignores it for display.

2. **What does the Playwright documentation recommend for finding elements, and why?**
   - Search for: `playwright locators best practices getByRole`
   - A good answer explains: the order of preference for locators, and the reason user-facing locators are preferred.

3. **Why are CSS-class and XPath selectors called brittle in test automation?**
   - Search for: `brittle selectors XPath CSS test automation`
   - A good answer explains: what changes in a page that breaks such selectors, and what a stable alternative is.

## Next step

In the next lesson you learn what a fixture is and how to write your own.
