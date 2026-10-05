---
title: The Page Object Model
summary: Read the products Page Object, use it in a spec, and learn the rules and limits of the pattern.
duration: 45 min
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

## Go deeper

### Why a locator made early still works late

The constructor of `ProductsPage` creates many locators. You may worry that they find elements too early, before the page is ready. They do not find anything yet. A **locator** is a recipe: "the element with this test id". Playwright follows the recipe only when you act or assert, and it follows it again each time.

```ts
const product = await createProduct(request)
const products = new ProductsPage(page)
const row = products.row(product.id)

await products.goto()
await expect(row).toBeVisible()
```

The variable `row` exists before the page opens. It still works, because the search happens at the `expect` line, with the page as it is at that moment. Some older tools return a found element, and that element becomes stale when the page changes. A Playwright locator cannot go stale.

### A common wrong idea: a Page Object removes all test changes

People say a Page Object protects tests from UI changes. It only moves the change to one place. If a developer renames `products-search`, you edit one line. If a developer adds a new required step to delete, such as a reason field, the `delete` method changes, and a test that checks the dialog text may also change. The benefit is real but small and local. This is DRY: the locator is written once.

### How it shows up in QA work: a second Page Object

Imagine that the create tests and a new validation spec both use the product form. That is two specs on one view, so rule 3 says a Page Object is now worth it. This one is not in the shop. You can add it as `apps/practice-shop/e2e/lib/pages/product-form.page.ts`:

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

A spec then reads `await form.fill({ name: "ab" })`, `await form.save.click()` and `await expect(form.nameError).toBeVisible()`.

### A trade-off

Every Page Object is more code to read and keep. The `fill` method accepts partial values, so a test can set only the field it cares about. But if you make `fill` take 12 options with flags, you have built a second, hidden test. Keep actions small and named for what a user does.

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

5. The test below creates `row` before it opens the page. Does it work? Explain why.

```ts
const product = await createProduct(request)
const products = new ProductsPage(page)
const row = products.row(product.id)

await products.goto()
await expect(row).toBeVisible()
```

<details><summary>Answer</summary>

It works. `row(...)` returns a locator, which is only a recipe. Playwright searches for the element when `expect` runs, after the page has opened, and it searches again while it waits. The order of creating the locator does not matter. Creating the product before `goto` matters, because the list loads once when the page opens.

</details>

6. A teammate adds the method `deleteAndCheckGone(id)` to `ProductsPage`. It deletes the product and asserts that the row is gone. Is this better than `delete(id)` followed by an `expect` in the spec? Give two reasons.

<details><summary>Answer</summary>

It is worse. First, the assertion is hidden, so a reader of the spec does not see what the test checks. Second, the Page Object now decides what is correct, so the method cannot be reused in a test that expects the delete to fail, such as one for a viewer. Keep the action in the Page Object and the assertion in the spec.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the Single Responsibility Principle, and does a page object with 40 methods break it?**
   - Search for: `single responsibility principle explained`
   - A good answer explains: the principle in one sentence, and how you could split a large page object.

2. **What is a component object, and when is it better than one large page object?**
   - Search for: `page object component object pattern test automation`
   - A good answer explains: what a component is, such as a menu or a dialog, and why sharing it between pages helps.

3. **Why do some testers say a page object should not contain assertions, while others disagree?**
   - Search for: `page object assertions Martin Fowler PageObject`
   - A good answer explains: the argument on each side, and which rule your team follows.

## Next step

In the next lesson you learn how the suite signs in once and reuses the session in every test.
