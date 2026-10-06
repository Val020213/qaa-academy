---
title: The data-testid convention
summary: Learn the team rule for test ids, why row ids carry the record id, and how to judge when a test id is the right tool.
duration: 75 min
---

## Start with a puzzle

A test finds the delete button with `page.getByText("Delete")` and clicks it. For three weeks the test passes. Then it fails with this message:

```text
Error: strict mode violation: getByText('Delete') resolved to 10 elements
```

Nobody edited the test. Nobody edited the page code. The test ran on the same server as before.

What changed? And is the test wrong, or is the page wrong?

Write down your guess before you read on.

## Goal

- Name a test id with the rule `<feature>-<element>`.
- Predict how many elements a locator matches before you run it.
- Find the bug in a row id that is built from a position, not from a record.
- Decide when a test id is the right tool, and when a role or a label is better.

## What is data-testid

A **test id** is an attribute in the page HTML that exists only for tests. Its name is `data-testid`. Users do not see it.

Playwright finds an element by its test id with `getByTestId`:

```ts
await page.getByTestId("products-search").fill("mouse")
```

The test id does not change when the text, the colour or the layout of the page changes. So the test keeps working.

### Back to the puzzle

The page code and the test did not change, so the data did. For three weeks the page showed one product, so `getByText("Delete")` matched one button. Then someone added products, and the page showed 10 rows, each with a "Delete" button. Playwright is strict: a click on a locator that matches many elements fails.

The test was always weak. It worked only because the page was small. The page is not wrong: ten rows with the same word is normal. The lesson is that a text which repeats is not a safe way to find one thing. The fix is an id that names the row, such as `products-delete-12`. You will see why next.

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

### An experiment: how many elements match?

A rule is easy to say. Test it with a question. Here are seven ids from the shop. Before you run anything, guess how many each pattern matches.

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

The first pattern is exact. The second is too wide: it picks up names, buttons and counts. The third is too loose: it also catches the orders. A naming rule makes a good pattern possible. A sloppy rule would make it impossible.

## Row ids include the record id

A table has many rows. They all look the same, so the id must say which row. The record id goes at the end.

Here is the real code from `apps/practice-shop/app/(dashboard)/products/page.tsx`:

```tsx
<TableRow key={product.id} data-testid={`products-row-${product.id}`}>
  <TableCell data-testid={`products-name-${product.id}`}>
```

For the product with id 12, the ids are `products-row-12` and `products-name-12`. The delete button is the same:

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

This button has the id `products-delete-12` for product 12. In a test you build the id from the id you know:

```ts
await page.getByTestId(`products-delete-${product.id}`).click()
```

### Why not use the position?

A beginner may build row ids from the position in the list. Look at this idea and find what is wrong before you read on:

```tsx
<TableRow data-testid={`products-row-${index}`}>
```

The shop sorts newest first. When a test adds a product, every row moves down by one. The id `products-row-0` now points to a different product. A test that clicks `products-delete-0` may delete the wrong row, and no error tells you.

This small program shows the same effect:

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

The record id is stable. Product 12 is `products-row-12` today and tomorrow. Use something that belongs to the record, never to its place on the screen.

## One shared dialog, one shared id

Some elements exist only once on the page at a time. The confirm dialog is one of them. The shop uses one dialog for every delete, also on the product detail page. Its buttons always have the same ids: `confirm-delete-button` and `confirm-delete-cancel`.

Watch what happens to the row when you cancel, and when you confirm.

![Delete opens a dialog. Cancel keeps the row; confirm removes it and shows a message.](/clips/shop-delete-dialog.webm)

You can see this in `apps/practice-shop/components/confirm-delete-dialog.tsx`. A comment at the top explains it. The dialog is built on the shadcn `AlertDialog`. It is drawn at the end of the page, outside the table, with the role `alertdialog`.

So the delete flow has two steps with two kinds of ids. The first click uses a row id. The second click uses the shared id.

Think about this: the dialog is outside the table row. If you write `page.getByTestId("products-row-12").getByTestId("confirm-delete-button")`, how many elements do you expect to find? Zero. The row does not contain the dialog. Always search for the shared dialog from `page`, not from a row.

## When an id is missing

Sometimes you need an element that has no test id. Do not use a fragile selector, such as a CSS class or the position of an element.

You have two options.

1. **Ask the developer.** Say which element, which page and which name you suggest, such as `products-export`.
2. **Add it yourself.** It is one attribute in the JSX. For example, the new-product link looks like this:

```tsx
<Button asChild>
  <Link href="/products/new" data-testid="products-new">
    New product
  </Link>
</Button>
```

Look closely. `Button asChild` means the button style is given to the `Link` inside. So the real element is an `<a>` tag, and the test id sits on that `<a>`. The same is true for the Edit link in each row: it is a link, not a `<button>`. A test that looks for `getByRole("button", { name: "Edit" })` finds nothing. Test ids hide this difference, and that is useful. But it is a reminder that you must know what you click.

Adding `data-testid` does not change how the page works or looks. If you are not sure you may change the file, ask first.

## Test ids versus roles and labels

Playwright has other ways to find elements. `getByRole` finds an element by its meaning, such as a button. `getByLabel` finds a form field by its visible label. `getByText` finds it by the words on screen.

Many teams prefer roles and labels, because they also check that the page is accessible. This team chose test ids. The rule in `apps/practice-shop/e2e/README.md` says:

```text
Select with `page.getByTestId(...)`. No CSS, no XPath, no text selectors for things you click.
```

The reasons are practical.

- Text changes. A button called "Delete" may become "Remove". Every test that uses the text would break.
- Text can appear twice. In the products table, every row has a "Delete" button.
- An id is a contract. A developer who sees `data-testid` knows a test depends on it.

The cost is that developers must add the ids. That is why the rule applies to every element.

Since the shop now uses real labels, `page.getByLabel("Search")` also finds the search box. In the code the label sits next to the input, joined with the `htmlFor` attribute. This works because `<Label htmlFor="products-search">` and the input have matching ids. Both ways are valid. Which is better? That depends on what you want the test to prove, and you will think about it in the questions.

### Test what the user sees, not how the code is built

Role and label locators say what a person sees: "a button called Sign in". A test id says how the developers marked the code. When a role locator fails, it often points to a real problem for the user: the label is missing. A test id never fails for that reason. Use test ids for what has no good name, such as a row in a table, and use roles and labels where the page has real names.

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
7. Do the same for the search box on the page. Then inspect an Edit link: is it a `<button>` or an `<a>`?

## Challenge

Write a test that audits the test ids of one page. It reads every id on the page and checks that each one follows the rule.

Create the file `apps/practice-shop/e2e/challenges/testid-audit.spec.ts`. Choose your world: audit the products page (`/products`) or the orders page (`/orders`).

It is done when:

- The first test opens your page, waits until the table is visible, and then collects all `data-testid` values on the page.
- The rule is a function `isGoodTestId(id: string): boolean` that you write. It accepts lowercase words joined by hyphens, with an optional number at the end.
- If an id breaks the rule, the failure message lists the bad ids. A message that says only "expected true" does not count.
- A second test needs no browser. It calls your function with at least three good ids and four bad ones, such as `Products-New`, `products_new`, `new` and `products-row-`, so you see that the rule can fail.
- You ran the spec and read the result. If one id of the real page breaks your rule, write in a comment what you decided: is the rule too strict, or is the id wrong?

You will need something this lesson did not teach: how to read an attribute from many elements at once, and how to write a pattern that accepts a number only at the end. Search for: `playwright locator evaluateAll`, `playwright locator all getAttribute`, `regex lowercase letters hyphen digits`.

## Think it through

1. Look at these seven ids and these three patterns. How many ids does each pattern match?

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
// patterns: /^products-row-/   /^products-/   /row/
```

<details><summary>Answer</summary>

The first matches 1 (`products-row-12`). The second matches 5: every id that starts with `products-`, which is the row, name, delete button, search box and count. The third matches 2: `products-row-12` and `orders-row-1003`, because it looks for the word anywhere. The prefix must be specific to select only the group you want, and the `^` keeps a pattern from matching the middle of other ids.

</details>

2. A developer builds row ids from the position in the list. This test always passes, but another test in the suite sometimes fails after it. Find the bug.

```ts
test("deleting the lamp shows a message", async ({ page }) => {
  await page.goto("/products")
  await page.getByTestId("products-delete-0").click()
  await page.getByTestId("confirm-delete-button").click()
  await expect(page.getByTestId("products-message")).toBeVisible()
})
```

<details><summary>Answer</summary>

The id uses the position, and the shop sorts newest first. The test was written when the lamp was in row 0. When another test has just added a product, row 0 is that new product, so the test deletes the wrong one. The only check is that a message appears, so it passes anyway. The product that another test needs is gone, and that test fails later with no clear link. Use ids built from the record id, create the lamp inside the test so you know its id, and check that the right row is gone.

</details>

3. Both lines find the search box on the products page. Which is better here, and what would make you choose the other?

```ts
await page.getByTestId("products-search").fill("mouse")
await page.getByLabel("Search").fill("mouse")
```

<details><summary>Answer</summary>

The test id line is steady: it does not change when the label text changes, and the team rule asks for it. The label line proves something else: a real person sees a field called "Search", and a screen reader can name it. If the label were missing, the second line would fail, and that is a real accessibility bug. A team that cares about accessibility may use the label version, or use both: test ids for the steps, and one test that checks the labels exist. The choice depends on what you want the test to prove.

</details>

4. The shop is translated to Spanish and the Delete button now says "Eliminar". Which of these locators still work: `getByText("Delete")`, `getByRole("button", { name: "Delete" })`, `getByTestId("products-delete-12")`? What does your answer say about the team rule?

<details><summary>Answer</summary>

Only the test id still works. The text and the role name both use the word "Delete", and the word changed. This is the reason the team chose test ids for things they click. The price is that a test id would not notice that the translation is missing, or that a button has no name at all. If the product has several languages, you may add a few role-based tests on purpose, to check that the names are correct.

</details>

5. Explain to a new teammate, in three sentences and without the word "selector", why the delete button of product 12 has the id `products-delete-12` and not just `delete`.

<details><summary>Answer</summary>

A good answer says: the table shows ten rows, and each has its own delete button. If all had the id `delete`, a test could not say which one it wants, and Playwright would stop with a strict mode error. The number at the end is the record id, so the id points at one product, and it does not change when the list order changes.

</details>

6. The user searches for a word that matches no product. What does `page.getByTestId(/^products-row-/)` match? What happens if the test then calls `.first().click()` on it? Which element shows the user that the list is empty?

<details><summary>Answer</summary>

It matches zero elements. A click on `.first()` of an empty match waits for an element that never comes, and the test ends with a timeout error, not a clear message. The page has the id `products-empty` for the empty-list message. A good test for this case asserts that the rows count is 0 with `toHaveCount(0)` and that `products-empty` is visible. It never clicks a row that may not exist.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What are `data-*` attributes in HTML, and what are they meant for?**
   - Search for: `html data-* attributes custom data`
   - Try it: open the shop in your browser, press F12 and open the Console. Run `document.querySelector('[data-testid="products-search"]').dataset`. Read what comes back, then try `.dataset.testid`.
   - A good answer explains: how to write one, how JavaScript can read it, and why the browser ignores it for display.

2. **What does the Playwright documentation recommend for finding elements, and why?**
   - Search for: `playwright locators best practices getByRole`
   - Try it: choose three elements on the login page. Write the locator for each in the order the documentation prefers. Check each one in the Playwright inspector or in a short spec.
   - A good answer explains: the order of preference for locators, and the reason user-facing locators are preferred.

3. **Why are CSS-class and XPath selectors called brittle in test automation?**
   - Search for: `brittle selectors XPath CSS test automation`
   - Try it: in the browser DevTools, right-click the Delete button of the first row, choose Copy, and copy the CSS selector and the XPath. Compare them with `products-delete-12`. Write which part of each would break if a developer changed the layout.
   - A good answer explains: what changes in a page that breaks such selectors, and what a stable alternative is.

## Next step

In the next lesson you learn what a fixture is and how to write your own.
