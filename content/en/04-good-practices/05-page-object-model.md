---
title: The Page Object Model
summary: Read the products Page Object, learn why locators made early still work, and judge when the pattern helps and when it hides too much.
duration: 85 min
---

## Start with a puzzle

Look at the first lines of the `ProductsPage` class in the shop:

```ts
constructor(page: Page) {
  this.page = page
  this.table = page.getByTestId("products-table")
  this.rows = page.getByTestId(/^products-row-/)
  this.searchInput = page.getByTestId("products-search")
  // ...
}
```

A spec runs `const products = new ProductsPage(page)` on its first line. At that moment the browser has not opened `/products` yet. The table, the rows and the search box do not exist anywhere.

Yet the line does not fail with "element not found". Why not? And what would you expect if the class stored the found elements instead?

Write down your guess before you read on.

## Goal

- Explain why a Page Object can describe elements that do not exist yet.
- Read `products.page.ts` and use it in a spec.
- Judge a Page Object: where do assertions belong, and when is it too much?
- Decide when not to build one.

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

// ...

/** Deletes a product: row button, then the shared confirm button. */
async delete(id: number) {
  await this.openDeleteDialog(id)
  await this.confirmDeleteButton.click()
}
```

The `delete` action hides two clicks. The spec only says `delete`. The second click goes to `confirmDeleteButton`, which the constructor builds from `page`, not from a row. The confirm dialog is drawn at the end of the page, outside the table, so a locator that starts from a row could not find it.

### Back to the puzzle

A **locator** is a recipe: "the element with this test id". It is not the element. Playwright follows the recipe only when you act on it or assert on it, and it follows it again each time. So the constructor can write twelve recipes before the page exists. Nothing is searched yet.

Here is the difference in plain code. A recipe is a function that searches again each time. A found element is a copy taken once. What do you expect each to print after the page changes?

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

It prints:

```text
same object as before: false
recipe finds the new one: true
```

The copy points at an object that the page threw away. This is a **stale** element, and some older tools suffer from it. The recipe searches again and finds the new object. If the constructor stored found elements, it would fail on an empty page, or hold dead copies after the page redraws. Storing recipes avoids both problems.

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

Notice the shape of the test. It **arranges** its data (`createProduct`, open the page), it **acts** (`delete`), and it **asserts** (the two `expect` lines). This is **Arrange, Act, Assert**. A Page Object serves the first two steps and leaves the third to the spec.

## The rules

1. **No assertions inside the Page Object.** It describes the page. The spec decides what is correct. The same `message` locator can be used to check a message exists in one test and does not exist in another.
2. **One Page Object per view.** A view is one page or one screen. The products list is one. The product form is another.
3. **Do not build one too early.** Build a Page Object when several specs use the same page. With one spec, plain `getByTestId` lines are clearer.
4. **Actions are what a user does.** Use `search`, `delete`. Do not copy every click into a method.

> **Note:** Today only `products.spec.ts` imports `ProductsPage`. The orders and dashboard specs use plain `getByTestId`. The shop includes `ProductsPage` as a model to read. In a real project, rule 3 says to wait until a second spec needs it.

Rule 1 is easiest to see when it is broken. Look at this locator and think about what is wrong with it before you read on:

```ts
this.rows = page.getByTestId("products-row")
```

`getByTestId` with a plain string matches the whole value. No element has the id `products-row` alone: the ids are `products-row-12`, `products-row-13` and so on. So `rows` matches nothing. A test that asks `expect(products.rows).toHaveCount(0)` after a delete passes, and it would pass even if the delete never happened. The code runs and gives a wrong answer. You will meet this again in the questions.

## When it does not help

A Page Object is a tool, not a rule for everything. It does not help in these cases.

- A page is used in one spec only. The class adds a file and no benefit.
- A page changes completely every month. You rewrite the class each time.
- The class grows to 40 methods. It becomes hard to read. Split the view.
- It hides too much. If `deleteAndCheck` clicks and asserts, the spec no longer shows what is checked.
- A small flow like login. A helper function such as `fillLoginForm` in `auth.spec.ts` is enough.

## Go deeper

### Why a locator made early still works late

The constructor of `ProductsPage` creates many locators. You may worry that they find elements too early, before the page is ready. They do not find anything yet. A locator is a recipe, as you saw above, and Playwright follows it again each time.

```ts
const product = await createProduct(request)
const products = new ProductsPage(page)
const row = products.row(product.id)

await products.goto()
await expect(row).toBeVisible()
```

The variable `row` exists before the page opens. It still works, because the search happens at the `expect` line, with the page as it is at that moment. A Playwright locator cannot go stale.

### A common wrong idea: a Page Object removes all test changes

People say a Page Object protects tests from UI changes. It only moves the change to one place. If a developer renames `products-search`, you edit one line. If a developer adds a new required step to delete, such as a reason field, the `delete` method changes, and a test that checks the dialog text may also change. The benefit is real but small and local. This is DRY: the locator is written once.

When the shop moved to shadcn components, the markup of the table, the buttons and the dialog changed, and no test id changed. Specs that use the Page Object, and plain specs that use the same ids, both kept working. The ids are the contract. The Page Object adds one place to edit when the contract itself changes.

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

Every Page Object is more code to read and keep. The `fill` method accepts partial values, so a test can set only the field it cares about. But if you make `fill` take 12 options with flags, you have built a second, hidden test. Keep actions small and named for what a user does. A class where each method does one job, and each name says what it is for, is easy to trust. This is the idea of **single responsibility**.

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

## Challenge

Build a Page Object for the product detail page, and use it in a spec. This closes the gap "The product detail page: open it from the list, check its data, go back" from `COVERAGE.md`.

Create these files: `apps/practice-shop/e2e/challenges/pages/product-detail.page.ts` and `apps/practice-shop/e2e/challenges/product-detail.spec.ts`.

The detail page is at `/products/<id>`. Read `apps/practice-shop/components/product-detail.tsx` for the test ids.

It is done when:

- The Page Object has a locator for the title, SKU, price, stock and status, a locator for the back link, and one action `backToList()`. The file does not contain the word `expect`. In PowerShell, `Select-String "expect" apps/practice-shop/e2e/challenges/pages/product-detail.page.ts` prints nothing.
- The spec creates its own product with `createProduct`, with a price and a stock that you choose. It opens the detail page by clicking the product's name link in the list, and not by typing the address.
- The spec checks the title, SKU, price, stock and status, using the values of the product object. The test ids of the detail page appear only in the Page Object, not in the spec.
- After `backToList()`, the page address ends with `/products`.
- You ran the spec twice in a row and both runs passed.

You will need something this lesson did not teach: how to check a page address that contains a number, and how the page shows money. Search for: `playwright toHaveURL regex`, `javascript number toFixed two decimals`. The file `apps/practice-shop/lib/api.ts` shows how the page formats a price.

## Think it through

1. Predict what this plain code prints, and say why the second line is `true`.

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

page = [{ id: 7, name: "Desk Lamp" }]

console.log("same object as before:", found === page[0])
console.log("recipe finds the new one:", recipe() === page[0])
```

<details><summary>Answer</summary>

It prints `same object as before: false` and `recipe finds the new one: true`. The variable `found` holds the old object, which the "page" threw away when it was replaced by a new array with a new object. The recipe is a function, so it searches again in the current page each time. A Playwright locator works like the recipe, and this is why a locator that you made before the page loaded still works after it.

</details>

2. A teammate writes this locator in the Page Object. The code runs without errors, and a delete test using it passes. Find the bug.

```ts
this.rows = page.getByTestId("products-row")
// in the spec, after products.delete(id):
await expect(products.rows).toHaveCount(0)
```

<details><summary>Answer</summary>

`getByTestId` with a string matches the full value, and no element has the id `products-row`. The ids carry the record id, such as `products-row-12`. So `rows` always matches zero elements, and `toHaveCount(0)` always passes, even if the delete did not happen. The real locator uses a pattern, `/^products-row-/`, or a row method with the product id. A good check also proves the test can fail: run it once without the delete and see it go red.

</details>

3. Two versions both work. Version one is a `ProductsPage` class with `delete(id)`. Version two is a file with plain functions, `deleteProduct(page, id)`, `searchProducts(page, text)`, and no class. Which do you choose here, and what would change your mind?

<details><summary>Answer</summary>

For a small suite, plain functions are simpler, and they follow KISS. A class helps when the page has many locators that several actions share, because the locators are created once and the autocomplete shows what the page offers. Choose the class when the page has about five or more locators and more than one spec uses them. Choose functions when you have one or two actions and no shared state. The team's habits also matter: pick the one the team can read without a guide.

</details>

4. The product team changes delete: the dialog now has a text box "Reason", and the confirm button stays disabled until the box has text. Which files must you change if you use `ProductsPage.delete(id)`, and which if every spec clicks the buttons itself? What can still break in specs that use the Page Object?

<details><summary>Answer</summary>

With the Page Object you change one method: `delete` must fill the reason before the confirm click. With plain specs you change every test that deletes. The Page Object does not protect specs that open the dialog and cancel, because they never reach the reason, so they keep working. A spec that checks the dialog text may need an update. The Page Object makes the change small and local, but it does not remove it.

</details>

5. `rowByName(name)` uses `this.rows.filter({ hasText: name })`. Two products exist: "Mouse Pad" and "Wireless Mouse". What happens when a test calls `products.rowByName("Mouse")` and then clicks it? What happens when the shop has two products with exactly the same name?

<details><summary>Answer</summary>

`hasText` matches part of the text, so "Mouse" matches both rows. A click on a locator that matches two elements fails with a strict mode error. Two products with the same exact name give the same result. The test should search for a unique name, as `uniqueName` does in the suite, or use the row with the product id. The method is safe only when the name you pass is unique.

</details>

6. A teammate wants the new `ProductFormPage` now, though only one spec uses the form today. Another says to wait for the second spec. Who is right?

<details><summary>Answer</summary>

There is no single right answer. Waiting follows YAGNI and keeps the code small, and the class is easy to extract later because the locators are already in the spec. Building it now is better if you know that a second spec is coming this week, because it prevents the first copy of the ids. It also depends on how stable the form is: a form that changes often is a good reason to have one place to edit. The cost of a wrong choice is small either way, so decide fast and move on.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the Single Responsibility Principle, and does a page object with 40 methods break it?**
   - Search for: `single responsibility principle explained`
   - Try it: count the methods of `ProductsPage`. Group them into "where things are", "what a user does" and "other". Write which group you would split out first if the class grew to 40 methods.
   - A good answer explains: the principle in one sentence, and how you could split a large page object.

2. **What is a component object, and when is it better than one large page object?**
   - Search for: `page object component object pattern test automation`
   - Try it: the confirm dialog appears on the list page and on the detail page. In a scratch file, write a small `ConfirmDialog` class with `confirm()` and `cancel()`, and use it from two page objects in your head or on paper. Write which duplicate code it removes.
   - A good answer explains: what a component is, such as a menu or a dialog, and why sharing it between pages helps.

3. **Why do some testers say a page object should not contain assertions, while others disagree?**
   - Search for: `page object assertions Martin Fowler PageObject`
   - Try it: take the delete test from this lesson. Write a second version where `deleteAndCheckGone(id)` is in the Page Object. Put both versions next to each other and mark which one tells a new reader more about what is checked.
   - A good answer explains: the argument on each side, and which rule your team follows.

## Next step

In the next lesson you learn how the suite signs in once and reuses the session in every test.
