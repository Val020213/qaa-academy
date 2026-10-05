---
title: The Page Object Model
summary: Read the products Page Object, use it in a spec, and learn the rules and limits of the pattern.
duration: 30 min
---

## Goal

- Explain what a Page Object is.
- Read `products.page.ts` and use it in a spec.
- Apply the rules: no assertions inside, one per view.
- Know when not to build one.

## The problem

Imagine five specs for the products page. Each one writes `page.getByTestId("products-search")`. One day the developer renames that id. You must fix five specs.

A **Page Object** solves this. It is a class that holds the locators and the actions for one page. A **class** is a block of code that groups data and functions under one name. Specs use the class instead of writing the ids themselves.

## Read the real one

Open `apps/practice-shop/e2e/lib/pages/products.page.ts`. It starts like this:

```ts
// Page Object for the products list. It knows WHERE things are and HOW to
// click them. It never asserts: the specs decide what is correct.
export class ProductsPage {
  readonly page: Page
  readonly table: Locator
  readonly rows: Locator
  readonly searchInput: Locator
```

The class has three parts. The word `readonly` means the value is set once and never changed.

**Locators.** The constructor creates them once. The constructor is the function that runs when you write `new ProductsPage(page)`.

```ts
constructor(page: Page) {
  this.page = page
  this.table = page.getByTestId("products-table")
  this.rows = page.getByTestId(/^products-row-/)
  this.searchInput = page.getByTestId("products-search")
```

**Locators that need a value.** A **method** is a function inside a class. A row depends on the product id, so it is a method:

```ts
row(id: number): Locator {
  return this.page.getByTestId(`products-row-${id}`)
}
```

**Actions.** An action is something a user does:

```ts
async search(text: string) {
  await this.searchInput.fill(text)
}

/** Deletes a product: row button, then the shared confirm button. */
async delete(id: number) {
  await this.openDeleteDialog(id)
  await this.confirmDeleteButton.click()
}
```

The `delete` action hides two clicks. The spec only says `delete`.

## Use it in a spec

Here is a real test from `apps/practice-shop/e2e/products/products.spec.ts`:

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

The spec creates the object with `new ProductsPage(page)`. Then it reads like a manual test: go to the page, delete the product, check the row is gone.

Notice that `expect` is in the spec. This is the first rule.

## The rules

1. **No assertions inside the Page Object.** It describes the page. The spec decides what is correct. The same `message` locator can be used to check a message exists in one test and does not exist in another.
2. **One Page Object per view.** A view is one page or one screen. The products list is one. The product form is another.
3. **Do not build one too early.** Build a Page Object when several specs use the same page. With one spec, plain `getByTestId` lines are clearer.
4. **Actions are what a user does.** Use `search`, `delete`. Do not copy every click into a method.

> **Note:** Today only `products.spec.ts` imports `ProductsPage`. The orders and dashboard specs use plain `getByTestId`. The shop includes `ProductsPage` as a model to read. In a real project, rule 3 says to wait until a second spec needs it.

## When it does not help

A Page Object is a tool, not a rule for everything. It does not help in these cases.

- A page is used in one spec only. The class adds a file and no benefit.
- A page changes completely every month. You rewrite the class each time.
- The class grows to 40 methods. It becomes hard to read. Split the view.
- It hides too much. If `deleteAndCheck` clicks and asserts, the spec no longer shows what is checked.
- A small flow like login. A helper function such as `fillLoginForm` in `auth.spec.ts` is enough.

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
  await expect(products.count).toHaveText("1 product")
})
```

5. Start the shop with `pnpm shop:dev`. In another terminal run:

```bash
pnpm shop:e2e products/pom-practice.spec.ts
```

6. Write one sentence: which lines of your spec would change if the search box id changed?

## Check what you know

1. What does a Page Object hold?

<details><summary>Answer</summary>

The locators and actions for one page.

</details>

2. Why must a Page Object not contain assertions?

<details><summary>Answer</summary>

It only describes the page. The spec decides what is correct, so one locator can be used for different checks.

</details>

3. When should you not build a Page Object?

<details><summary>Answer</summary>

When only one spec uses the page, or when the page changes all the time.

</details>

4. Why is `row(id)` a method and not a property?

<details><summary>Answer</summary>

It needs a product id to build the locator. A method can take a value.

</details>

## Next step

In the next lesson you learn how the suite signs in once and reuses the session in every test.
