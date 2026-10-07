---
title: The Page Object Model
duration: 65 min
---

## Goal

In this lesson you use the products Page Object to share locators and actions across tests. You also decide what the spec should show so a reader can understand what it checks.

- Read `products.page.ts` and use it in a spec.
- Understand what the constructor stores and why you can run it before opening the page.
- Separate page actions from test assertions.
- Decide when to extract a Page Object and when a function is enough.

## Share locators and actions

If five specs write `page.getByTestId("products-search")`, changing that id means editing all five. A **Page Object** groups a page's locators and actions so specs can share them.

The shop implements it with a **class**, which groups properties and functions. Each test creates an object of that class and uses it with its own `page`.

## Read ProductsPage

Open `apps/practice-shop/e2e/lib/pages/products.page.ts`:

```ts
// Page Object for the products list. It knows WHERE things are and HOW to
// click them. It never asserts: the specs decide what is correct.
export class ProductsPage {
  readonly page: Page
  readonly table: Locator
  readonly rows: Locator
  readonly searchInput: Locator
```

With `readonly`, the type checker allows assigning the property in its declaration or inside the constructor and rejects reassignment outside it. It does not freeze the stored object.

The **constructor** runs when you write `new ProductsPage(page)`. It stores the page it receives and creates the locators:

```ts
constructor(page: Page) {
  this.page = page
  this.table = page.getByTestId("products-table")
  this.rows = page.getByTestId(/^products-row-/)
  this.searchInput = page.getByTestId("products-search")
  // ...
}
```

A function inside a class is called a **method**. The `row` method takes a product id and returns the locator for its row:

```ts
row(id: number): Locator {
  return this.page.getByTestId(`products-row-${id}`)
}
```

Other methods group actions:

```ts
async search(text: string) {
  await this.searchInput.fill(text)
}

// ...

/** Deletes a product: row button, then the shared confirm button. */
async delete(id: number) {
  await this.openDeleteDialog(id)
  await this.confirmDeleteButton.click()
}
```

`delete` performs two clicks: it opens the dialog and confirms the deletion. The constructor creates `confirmDeleteButton` from `page`, because the dialog is outside the table. A locator starting from a row would not find it.

### Create locators before navigating

The constructor stores the searches that Playwright will run when you use the locators. You can therefore create `ProductsPage` and ask it for a row before opening the page:

```ts
const product = await createProduct(request)
const products = new ProductsPage(page)
const row = products.row(product.id)

await products.goto()
await expect(row).toBeVisible()
```

Playwright searches for the row when the assertion checks its visibility. If the DOM changes, the locator searches the current DOM again. The locator does not keep a reference to the previous node. Its search criterion can still stop matching or select another element if the DOM changes.

This example compares searching once with storing a function that searches again. Here, `findNow` returns a reference to the object it finds, not a copy; that reference keeps the previous object when the array is replaced.

```ts
type Row = { id: number; name: string }
let page: Row[] = [{ id: 7, name: "Desk Lamp" }]

function findNow(id: number): Row | undefined {
  return page.find((row) => row.id === id)
}
function locator(id: number) {
  return () => page.find((row) => row.id === id)
}

const found = findNow(7)
const recipe = locator(7)

// The page redraws: same product, new object.
page = [{ id: 7, name: "Desk Lamp" }]

console.log("same object as before:", found === page[0])
console.log("recipe finds the new one:", recipe() === page[0])
```

Node.js prints:

```text
same object as before: false
recipe finds the new one: true
```

`found` keeps the previous object; `recipe()` searches the new array. The Page Object constructor stores locators so Playwright can search again when the test uses them.

## Use it in a spec

This test is in `apps/practice-shop/e2e/products/products.spec.ts`:

```ts
test("confirming in the dialog removes the product", async ({ page, request }) => {
  const product = await createProduct(request)
  const products = new ProductsPage(page)
  await products.goto()
  await expect(products.row(product.id)).toBeVisible()

  await products.delete(product.id)

  await expect(products.row(product.id)).toHaveCount(0)
  await expect(products.message).toContainText(product.name)
})
```

The spec prepares the product, opens the list and checks that the row is visible before deleting. After `delete`, it checks that the row disappears and the message contains the product name.

Assertions stay in the spec. The Page Object exposes `row` and `message`, and each test decides what result it expects from those locators.

## Decide what to extract

Use these rules when extracting a Page Object:

1. Keep assertions in the spec. If `deleteAndCheck` also checks the result, the reader must open another file to find out what the test verifies.
2. Organize each Page Object around a view: the products list and the form have different locators and actions.
3. Wait until several specs need the same page before extracting the class. A small flow may only need a function, such as `fillLoginForm` in `auth.spec.ts`.
4. Name methods after what the user does, such as `search` or `delete`. Avoid creating a method for every click.

Only `products.spec.ts` imports `ProductsPage` in the shop. The orders and dashboard specs use `getByTestId` directly; the products class is the example of the pattern you study here.

## Go deeper

### A Page Object for the form

If several specs use the product form, you can group its locators in `apps/practice-shop/e2e/lib/pages/product-form.page.ts`. This class is a proposal, not a file in the shop:

```ts
import type { Locator, Page } from "../test"

// Page Object for the product form. Locators and actions only, no assertions.
export class ProductFormPage {
  readonly name: Locator
  readonly sku: Locator
  readonly price: Locator
  readonly stock: Locator
  readonly save: Locator
  readonly nameError: Locator

  constructor(page: Page) {
    this.name = page.getByTestId("product-name")
    this.sku = page.getByTestId("product-sku")
    this.price = page.getByTestId("product-price")
    this.stock = page.getByTestId("product-stock")
    this.save = page.getByTestId("product-save")
    this.nameError = page.getByTestId("product-name-error")
  }

  async fill(values: { name?: string; sku?: string; price?: string; stock?: string }) {
    if (values.name !== undefined) await this.name.fill(values.name)
    if (values.sku !== undefined) await this.sku.fill(values.sku)
    if (values.price !== undefined) await this.price.fill(values.price)
    if (values.stock !== undefined) await this.stock.fill(values.stock)
  }
}
```

`fill` accepts partial values: the test can change only the field it needs. A spec can write `await form.fill({ name: "ab" })`, `await form.save.click()` and `await expect(form.nameError).toBeVisible()`.

Each Page Object adds code you must maintain. Keep methods focused on an action; if `fill` accumulates options to decide which scenario to run, part of the test is hidden in the class.

### Changes still need review

If `products-search` changes, edit its locator in the Page Object. If deletion requires a reason, the `delete` method changes. A spec that checks the dialog text may also need an update.

The Page Object brings shared locators and actions together. Each spec remains responsible for its expected results.

## Practice

1. Open `apps/practice-shop/e2e/lib/pages/products.page.ts`. Find the three methods that take a product id.
2. Find which spec files import `ProductsPage`. In PowerShell, from the repository root, run:

```bash
Get-ChildItem apps/practice-shop/e2e -Recurse -Filter *.ts | Select-String "ProductsPage"
```

3. Count how many places write the id `products-search`:

```bash
Get-ChildItem apps/practice-shop/e2e -Recurse -Filter *.ts | Select-String "products-search"
```

4. Create the file `apps/practice-shop/e2e/products/pom-practice.spec.ts` with this code:

```ts
import { expect, test } from "../lib/test"
import { createProduct } from "../lib/fixtures/api-client"
import { uniqueName } from "../lib/helpers"
import { ProductsPage } from "../lib/pages/products.page"

test("the Page Object finds a product by name", async ({ page, request }) => {
  const product = await createProduct(request, { name: uniqueName("Practice") })
  const products = new ProductsPage(page)
  await products.goto()
  await expect(products.row(product.id)).toBeVisible()

  await products.search(product.name)

  await expect(products.rows).toHaveCount(1)
  await expect(products.row(product.id)).toBeVisible()
  await expect(products.count).toHaveText("1 product")
})
```

5. Start the shop with `pnpm shop:dev`. In another terminal run:

```bash
pnpm shop:e2e products/pom-practice.spec.ts
```

## Challenge

Build a Page Object for the product detail page and use it in a spec. Cover the gap "The product detail page: open it from the list, check its data, go back" from `COVERAGE.md`.

Create `apps/practice-shop/e2e/challenges/pages/product-detail.page.ts` and `apps/practice-shop/e2e/challenges/product-detail.spec.ts`.

The detail page is at `/products/<id>`. Read `apps/practice-shop/components/product-detail.tsx` for the test ids.

It is done when:

- The Page Object has locators for the title, SKU, price, stock, status and back link, and an action `backToList()`. The file does not contain `expect`: `Select-String "expect" apps/practice-shop/e2e/challenges/pages/product-detail.page.ts` prints nothing in PowerShell.
- The spec creates its product with `createProduct`, with a price and stock you choose. It opens the detail page by clicking the product's name link in the list.
- The spec checks the title, SKU, price, stock and status using the product's values. The detail page's test ids appear only in the Page Object.
- After `backToList()`, the address ends with `/products`. You ran the spec twice in a row and both passed.

Search for: `playwright toHaveURL regex`, `javascript number toFixed two decimals`. The file `apps/practice-shop/lib/api.ts` shows how the page formats a price.

## Think it through

1. This delete test passes even when the product is still in the list. Find the bug.

```ts
this.rows = page.getByTestId("products-row")
// in the spec, after products.delete(id):
await expect(products.rows).toHaveCount(0)
```

<details><summary>Answer</summary>

`getByTestId` with a string matches the full value. Rows have ids such as `products-row-12`, so `rows` finds zero elements even before deletion. The real Page Object uses `/^products-row-/` for all rows or `row` with a product id. Check that the row exists before deletion and disappears afterward.

</details>

2. The delete dialog adds a "Reason" field and disables confirmation until it contains text. What must change if the tests use `ProductsPage.delete(id)`? What changes if each spec clicks the buttons directly?

<details><summary>Answer</summary>

The `delete` method must fill the reason before confirming. With clicks written directly in the specs, you must update each spec that deletes. Tests that check the dialog text may also need changes.

</details>

3. `rowByName(name)` uses `this.rows.filter({ hasText: name })`. There are products named "Mouse Pad" and "Wireless Mouse". What happens when you click `products.rowByName("Mouse")`? What if two products have exactly the same name?

<details><summary>Answer</summary>

`hasText` matches part of the text, so the locator finds both rows and the click fails because of strict mode. Two products with the same name also produce multiple matches. Use a name that identifies a single row or the product id.

</details>

## Next step

In the next lesson you learn how the suite signs in once and reuses the session in every test.
