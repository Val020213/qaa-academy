---
title: The data-testid convention
duration: 60 min
---

## Goal

In this lesson you apply the shop's test-id convention to controls, rows and dialogs. You check how to select the right record when the table order changes.

- Name a test id with the rule `<feature>-<element>`.
- Build row ids from the record id.
- Select groups by their prefix and find a dialog outside a row.
- Distinguish what a test id checks from what a role or label locator checks.

## The naming rule

The shop uses this format for ids on its interactive elements:

```text
<feature>-<element>
```

`feature` names the page or area; `element` names the control. Words are lowercase and separated by hyphens. These are real ids from the shop:

- `login-email`, `login-password`, `login-submit`
- `products-search`, `products-status-filter`, `products-new`
- `product-name`, `product-sku`, `product-save`
- `orders-status-filter`

Counts and error messages also have ids because tests check them.

If a table shows ten products, `page.getByText("Delete")` finds ten buttons. When you try to click, Playwright requires one match and fails. The first error line is:

```text
locator.click: Error: strict mode violation: getByText('Delete') resolved to 10 elements:
```

To select a product's button, the test needs to identify the record.

## Row ids include the record id

In `apps/practice-shop/app/(dashboard)/products/page.tsx`, each row and its name cell include the product id:

```tsx
<TableRow key={product.id} data-testid={`products-row-${product.id}`}>
  <TableCell data-testid={`products-name-${product.id}`}>
```

For the product with id 12, the ids are `products-row-12` and `products-name-12`. The delete button follows the same rule:

```tsx
<Button
  variant="ghost"
  size="sm"
  className="text-destructive hover:text-destructive"
  type="button"
  onClick={() => setToDelete(product)}
  data-testid={`products-delete-${product.id}`}
>
  Delete
</Button>
```

In the test, build the button id from the product id:

```ts
await page.getByTestId(`products-delete-${product.id}`).click()
```

### A position can point to another product

An id built from a position depends on the list order:

```tsx
<TableRow data-testid={`products-row-${index}`}>
```

The shop sorts newest first. Adding a product at the start changes the positions of the existing rows. A test that clicks `products-delete-0` can delete another product without Playwright detecting the mistake.

This program shows the change:

```ts
type Product = { id: number; name: string }

let products: Product[] = [
  { id: 12, name: "Desk Lamp" },
  { id: 11, name: "Webcam" },
  { id: 10, name: "Cable" },
]

function rowIdByPosition(position: number) {
  return `products-row-${position}`
}
function rowIdByRecord(product: Product) {
  return `products-row-${product.id}`
}

const lampBefore = products[0]
console.log("before:", rowIdByPosition(0), rowIdByRecord(lampBefore!))

products = [{ id: 13, name: "New Mouse" }, ...products]

console.log("after: ", rowIdByPosition(0), "is now", products[0]?.name)
console.log("after: ", rowIdByRecord(lampBefore!), "is still", lampBefore?.name)
```

It prints:

```text
before: products-row-0 products-row-12
after:  products-row-0 is now New Mouse
after:  products-row-12 is still Desk Lamp
```

`products-row-0` now identifies the new product. `products-row-12` keeps identifying the lamp because it is built from the record id.

## Select groups by prefix

In `apps/practice-shop/e2e/lib/pages/products.page.ts`, this line selects product rows:

```ts
this.rows = page.getByTestId(/^products-row-/)
```

The regular expression `/^products-row-/` looks for ids that start with `products-row-`. The prefix selects rows without including their buttons or order rows.

Compare three patterns against the same ids:

```ts
const ids = [
  "products-row-12",
  "products-name-12",
  "products-delete-12",
  "products-search",
  "products-count",
  "product-name",
  "orders-row-1003",
]

for (const pattern of [/^products-row-/, /^products-/, /row/]) {
  console.log(String(pattern), "matches", ids.filter((id) => pattern.test(id)).length)
}
```

The result is:

```text
/^products-row-/ matches 1
/^products-/ matches 5
/row/ matches 2
```

The first pattern selects only the product-row prefix, not a complete id. The second is too wide: it picks up names, buttons and counts. The third also includes order rows.

## One shared dialog, one shared id

The shop reuses the confirmation dialog on the list and product detail pages. Its buttons have the ids `confirm-delete-button` and `confirm-delete-cancel`.

![Delete opens a dialog. Cancel keeps the row; confirm removes it and shows a message.](/clips/shop-delete-dialog.webm)

The component is in `apps/practice-shop/components/confirm-delete-dialog.tsx`. It uses the shadcn `AlertDialog`, with the role `alertdialog`, outside the table in the DOM.

![Simplified DOM tree: the confirmation button is outside the row.](/images/04-dialog-scope.en.svg)

Clicking a row's button opens the dialog; clicking the shared button confirms deletion. The search `page.getByTestId("products-row-12").getByTestId("confirm-delete-button")` finds zero elements because it searches inside the row. Find the dialog button from `page`.

## When an id is missing

Ask the developer to add the attribute, specifying the element, page and suggested name, such as `products-export`. You can also add it yourself if you have permission to change the file.

The new-product link shows where to put it:

```tsx
<Button asChild>
  <Link href="/products/new" data-testid="products-new">
    New product
  </Link>
</Button>
```

`Button asChild` applies the style to the `Link` it contains. The DOM element is an `<a>`, and the test id is on that link. The same applies to Edit in each row: `getByRole("button", { name: "Edit" })` does not find that link.

By itself, `data-testid` adds no styling or behavior. The app’s JavaScript and CSS can still read or select it.

## Test ids, roles and labels

Role and label locators search for an element’s role or accessible name. Finding it does not establish that the whole page is accessible. This team chose test ids. The rule in `apps/practice-shop/e2e/README.md` says:

```text
Select with `page.getByTestId(...)`. No CSS, no XPath, no text selectors for things you click.
```

The team uses ids as a contract between development and QA: the name stays the same when text or styling changes. Developers must add and maintain these attributes.

In the shop, `page.getByLabel("Search")` also finds the search box. The label `<Label htmlFor="products-search">` points to the field whose `id` attribute has the same value. This association is separate from the `data-testid` attribute.

## Go deeper

### The attribute Playwright searches

These two lines select the same field:

```ts
await page.getByTestId("products-search").fill("mouse")
await page.locator('[data-testid="products-search"]').fill("mouse")
```

The second uses a CSS attribute selector. `getByTestId` uses `data-testid` by default. If the app already uses `data-qa`, this option tells Playwright to search that attribute:

```ts
use: { testIdAttribute: "data-qa" },
```

Attributes that start with `data-` are reserved by HTML for your own information. The browser keeps them in the DOM and exposes them to JavaScript through `dataset`; it assigns them no built-in action or styling.

### What a test id checks

A button can have `data-testid="products-new"` and still lack an accessible name. Finding it by its test id does not check that name.

In this shop, follow the test-id convention for actions. Another team may choose roles and labels for controls with accessible names and test ids for records without an identifying name.

## Practice

1. Open `apps/practice-shop/app/(dashboard)/products/page.tsx`. Write down three `data-testid` values that include a record id.
2. Open `apps/practice-shop/e2e/lib/pages/products.page.ts`. Find where `products-search` is used.
3. Start the shop with `pnpm shop:dev`. Open http://localhost:5190 and sign in as `admin@qa-shop.test` with the password `Admin123!`.
4. Open the products page. Right-click a Delete button and choose **Inspect**.
5. Find the button's `data-testid` attribute. Check that the number matches the product.
6. Inspect the search box and check its test id. Then inspect an Edit link and check whether its tag is `<button>` or `<a>`.

## Challenge

Create `apps/practice-shop/e2e/challenges/testid-audit.spec.ts` to audit test ids on the products page (`/products`) or the orders page (`/orders`).

It is done when:

- The first test waits for the table to be visible and collects all `data-testid` values on the page. If any break the rule, the failure message lists the bad ids.
- Your function `isGoodTestId(id: string): boolean` accepts lowercase words joined by hyphens, with an optional number at the end.
- A second test, without a browser, checks at least three good ids and four bad ones, such as `Products-New`, `products_new`, `new` and `products-row-`.
- You ran the spec and read the result. If a real id breaks your rule, a comment states whether the rule is too strict or the id is wrong.

You will need to read an attribute from many elements at once and write a pattern that accepts a number only at the end. Search for: `playwright locator evaluateAll`, `playwright locator all getAttribute`, `regex lowercase letters hyphen digits`.

## Think it through

1. A developer builds ids from list positions. After a product is added at the start, this test passes even though it no longer deletes the lamp. Where is the bug, and which check hides it?

```ts
test("deleting the lamp shows a message", async ({ page }) => {
  await page.goto("/products")
  await page.getByTestId("products-delete-0").click()
  await page.getByTestId("confirm-delete-button").click()
  await expect(page.getByTestId("products-message")).toBeVisible()
})
```

<details><summary>Answer</summary>

`products-delete-0` selects the new product, which now occupies the first position. The assertion only checks that a message appears. Create the lamp inside the test so you know its id, use it in the locator and check that its row disappears.

</details>

2. The Delete button now says "Eliminar" and keeps its test id. Which of these locators still find it: `getByText("Delete")`, `getByRole("button", { name: "Delete" })`, `getByTestId("products-delete-12")`?

<details><summary>Answer</summary>

Only `getByTestId("products-delete-12")`. The other two look for the word "Delete", which changed. The test id would also miss a missing translation or accessible name.

</details>

3. A search returns no products. How many elements does `page.getByTestId(/^products-row-/)` match, and what happens when you call `.first().click()` on that locator?

<details><summary>Answer</summary>

It matches zero elements. Playwright keeps searching for a first match until the timeout expires. To check this state, use `toHaveCount(0)` on the rows and check that `products-empty` is visible.

</details>

## Next step

In the next lesson you learn what a fixture is and how to write your own.
