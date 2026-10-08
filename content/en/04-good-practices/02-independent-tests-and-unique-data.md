---
title: Independent tests and unique data
duration: 60 min
---

## Goal

In this lesson, you examine how data left by one test affects the others. You use separate names and SKUs so each test can find and change its own records.

- Check that a test passes alone, in any order and twice in a row.
- Find dependencies between tests that share data.
- Use the shop helpers to create your own data.
- Identify the limits of random values and a counter.

## Three rules

An independent, repeatable test follows these rules:

1. It passes when you run it **alone**.
2. It passes in **any order** with the other tests.
3. It passes **twice in a row**, without restarting anything.

In this program, test A changes the list that test B reads:

```ts
const products: string[] = ["Mouse"]

function testA() {
  products.push("Keyboard")
  return products.length === 2
}
function testB() {
  return products.length === 2
}

console.log("A then B:", testA(), testB())
products.length = 1
console.log("B alone:", testB())
```

It prints `A then B: true true`, then `B alone: false`. The line `products.length = 1` restores the initial list. B does not prepare its data: it passes because A added a product. This is **order dependence**.

With the order B, A, B:

```ts
const products: string[] = ["Mouse"]
function testA() { products.push("Keyboard"); return products.length === 2 }
function testB() { return products.length === 2 }
console.log("B, A, B:", testB(), testA(), testB())
```

It prints `B, A, B: false true true`. The first call to B finds one product; the second finds two because A changed the list between the calls.

## Shared data in the shop

The practice shop keeps its data in server memory. The tests read and change that same data.

![Example of two tests creating and reading products on the same server.](/images/04-shared-server-data.en.svg)

A test that creates a product with the fixed value `SKU-5000` fails if it creates it again without deleting the previous product or resetting the data. The server responds "This SKU is already used by another product." because the SKU is taken.

Another test may expect one row when searching for "Lamp" and find two if an earlier test left another product with that word. The search depends on all stored names, even those the test did not create.

### One worker

The configuration in `apps/practice-shop/playwright.config.ts` prevents two tests from changing the shop at the same time:

```ts
// The app keeps its data in memory and every test shares it,
// so tests run one at a time, in one worker.
fullyParallel: false,
workers: 1,
```

With `workers: 1`, Playwright runs one test at a time. With `fullyParallel: false`, tests in the same file also run one after another. This prevents one test from deleting a product while another reads it, but the data it leaves remains available to the next test.

## Reset once, in the setup

The setup test in `apps/practice-shop/e2e/global.setup.ts` asks the server to reset the data:

```ts
const reset = await request.post("/api/test/reset")
expect(reset.ok()).toBeTruthy()
```

The reset restores the seed data: 24 products and 12 orders. In a normal run, setup requests it once before the Chromium tests, not before each test. A setup retry can repeat it.

Resetting before each test adds one request per test and can hide dependencies on a clean shop. For example, a search that expects one match never encounters a product left by another test. In this suite, each test must work alongside data added by the others.

## Create your own data

Each test prepares the records it needs. The file `apps/practice-shop/e2e/lib/helpers.ts` contains two helpers to generate their values.

`uniqueName` adds a random suffix to the name:

```ts
/** A name with a random suffix, e.g. "Mouse 3fa9c1d2". */
export function uniqueName(prefix: string): string {
  return `${prefix} ${crypto.randomUUID().slice(0, 8)}`
}
```

`uniqueSku` generates the code that identifies the product, such as `SKU-4821`:

```ts
/** A valid SKU like "SKU-4821" that is not used by the seed data. */
export function uniqueSku(): string {
  const value = nextSku
  nextSku = value >= LAST ? FIRST : value + 1
  return `SKU-${value}`
}
```

The seed uses `SKU-0001` to `SKU-0024`. The helper starts at a random number from 1000 and counts up. In one worker process, the first 9,000 calls produce distinct SKUs; after that the counter repeats values.

The creation test in `e2e/products/products.spec.ts` uses both helpers:

```ts
const name = uniqueName("Created")
// ...
await page.getByTestId("product-name").fill(name)
await page.getByTestId("product-sku").fill(uniqueSku())
```

The generated name lets the test search for the product it created, rather than a word that may appear in other products.

![Each test uses its own product identity while sharing the same server.](/images/04-data-identities.en.svg)

## Records and totals that change

In `e2e/orders/orders.spec.ts`, an order status only moves forward. Once it is "paid", it cannot return to "pending".

The filter reads order 1003, which is already shipped, and the payment test changes 1005, which is pending. If two tests tried to pay 1005, the second would find it already paid. Repeating that test without resetting the seed also fails.

The first test in `products.spec.ts` needs to check the total product count, which changes when other tests create or delete records:

```ts
// Other tests add products, so we ask the API for the real total.
const total = ((await (await request.get("/api/products")).json()) as { total: number }).total
```

The test reads the total from `/api/products` before opening the list. It compares the displayed text with the current data instead of always expecting `24 products`.

## Go deeper

### Random values and counters

Choosing a random value does not guarantee that it differs from earlier values. This program simulates 20,000 runs that pick 100 SKUs from the 9,000 values `SKU-1000` to `SKU-9999`:

```ts
const pool = 9000
const picks = 100
const trials = 20000
let clashes = 0

for (let trial = 0; trial < trials; trial++) {
  const seen = new Set<number>()
  for (let i = 0; i < picks; i++) {
    const value = 1000 + Math.floor(Math.random() * pool)
    if (seen.has(value)) {
      clashes++
      break
    }
    seen.add(value)
  }
}
console.log(`${((clashes / trials) * 100).toFixed(0)} percent of runs had a clash`)
```

It prints about `42 percent of runs had a clash`. The result varies because Node.js runs the simulation with random numbers. The `Set` stores the chosen values, and `seen.has(value)` detects a repeat.

Each of the eight characters in the suffix from `uniqueName` has 16 choices: 4,294,967,296 possible values. The chance of a clash among 1,000 names is about 1 in 8,600. The SKU space is much smaller.

Counting up produces 9,000 different SKUs before repeating the first. The counter in `uniqueSku` lives in one worker process; it does not guarantee different values across workers or runs. Retries and `--repeat-each` can start another process with a new counter, even though `workers: 1` limits execution to one process at a time.

```ts
let next = 9998
function sku() {
  const value = next
  next = value >= 9999 ? 1000 : value + 1
  return `SKU-${value}`
}
console.log(sku(), sku(), sku())
```

This prints `SKU-9998 SKU-9999 SKU-1000`. At the end of the range, the counter returns to 1000 and keeps the SKU format valid.

## Practice

1. Open `apps/practice-shop/e2e/lib/helpers.ts`. Find the lines that choose the first SKU number.
2. Open `apps/practice-shop/e2e/orders/orders.spec.ts`. Find the comment that says which order each test uses.
3. Start the shop with `pnpm shop:dev` in one terminal.
4. In a second terminal, run one spec file alone:

```bash
pnpm shop:e2e products/products.spec.ts
```

5. Run two repetitions within one execution:

```bash
pnpm shop:e2e products/products.spec.ts --repeat-each=2
```

Setup resets the data once before the repetitions. Check both without another reset; two separate commands would run setup again. Each repetition uses another worker, so the SKU counter starts again and can still collide with existing data.

6. Run one test by a word from its name. With `-g`, Playwright filters tests by name:

```bash
pnpm shop:e2e -g cancelling
```

Check that it passes alone.

## Challenge

Cover the gap "Duplicate SKU error when creating a product" from `COVERAGE.md` in `apps/practice-shop/e2e/challenges/duplicate-sku.spec.ts`.

Create a product through the API. Open the new-product form, fill it with valid values and that product's SKU, and save. Check that it shows the error and does not create a second product.

It is done when:

- The test gets the SKU from its own product, without a fixed value such as `SKU-0001` or a seeded id.
- After saving, `product-sku-error` shows the server's exact text and the address still ends with `/products/new`.
- The total from `/api/products` is the same before and after saving.
- `pnpm shop:e2e challenges/duplicate-sku.spec.ts --repeat-each=3` passes all three repetitions.

Search for: `playwright repeat-each`, `playwright hydration fill input erased react`. Read the comment in `products.spec.ts` about `newButton.click()`: the click alone does not establish that the destination form is ready for typing.

## Think it through

1. One test creates a product with `createProduct`. Another searches for a row containing "Created", but creates nothing. It passes in the order one, two. What happens if you run the second alone on a fresh server or before the first?

<details><summary>Answer</summary>

It fails: the seed has no such name. It should create its own product with `uniqueName("Created")` and search for that full name.

</details>

2. This test passes on a fresh run. On the second run it fails. Find the bug.

```ts
test("deleting Mouse Pad removes its row", async ({ page }) => {
  const products = new ProductsPage(page)
  await products.goto()

  await products.delete(23)

  await expect(products.row(23)).toHaveCount(0)
})
```

<details><summary>Answer</summary>

The first run deletes seeded product 23, "Mouse Pad". With `--repeat-each 2`, the second copy uses the same data and cannot find the delete button. A second normal `pnpm shop:e2e` command passes because the setup resets the seed. The test should create its own product with `createProduct` and delete that one.

</details>

3. What does `uniqueSku` return on call 9,001? What happens if the product from the first call still exists?

<details><summary>Answer</summary>

It returns the same SKU as call 1. The server rejects the creation with "This SKU is already used by another product." because the counter exhausted its 9,000 values.

</details>

## Next step

In the next lesson you learn the naming rule for `data-testid` and why the team uses it.
