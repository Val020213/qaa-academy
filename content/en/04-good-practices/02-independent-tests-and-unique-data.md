---
title: Independent tests and unique data
summary: Write tests that pass alone, in any order and twice in a row, and find the hidden link when one test breaks because of another.
duration: 80 min
---

## Start with a puzzle

A test creates a product with the SKU `SKU-5000`, which it writes in the code. On Monday it passes. On Tuesday, with no change to the code, it fails: the server says "This SKU is already used by another product."

At the same time, a second test fails. Nobody edited it for months. It checks that a search for "Lamp" shows 1 row, and it now shows 2.

No test shows a code error. The shop server was not restarted between Monday and Tuesday.

Which test do you fix first, the one that fails with the error message or the one that finds 2 rows? What is the real cause?

Write down your guess before you read on.

## Goal

- Predict whether a test passes alone, in any order and twice in a row.
- Find the hidden link between two tests that look unrelated.
- Decide between random values and a counter when you need unique data.
- Explain what a reset before every test would hide, and what it would cost.

## Three rules

A good test is **independent**. It follows three rules.

1. It passes when you run it **alone**.
2. It passes in **any order** with the other tests.
3. It passes **twice in a row**, without restarting anything.

A test that breaks one of these rules is dangerous. It may pass today and fail tomorrow, and nobody knows why. Test people call this a **flaky** test: a test that sometimes passes and sometimes fails with no change in the code.

These three rules are part of a short list called **FIRST**: tests should be Fast, Independent, Repeatable and Self-checking. This lesson is about the I and the R.

### An experiment: two tests and a shared list

Read this program. Do not run it. What do you expect `testA()` and `testB()` to print when they run in this order: A, then B? Then guess what happens if you reset the list and run only B.

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

It prints `A then B: true true`, then `B alone: false`. The line `products.length = 1` puts the list back to its start, as a fresh run would. Test B never adds anything. It passes only because test A ran first and changed the list.

This is **order dependence**. The code of test B is not wrong. Its data is not its own.

Now change the order. What do you expect from B, then A, then B again?

```ts
const products: string[] = ["Mouse"]
function testA() { products.push("Keyboard"); return products.length === 2 }
function testB() { return products.length === 2 }
console.log("B, A, B:", testB(), testA(), testB())
```

It prints `B, A, B: false true true`. The same test B fails first and passes later. A suite that only ever runs in one order will never show this.

## Shared data in the shop

The practice shop has no database. It keeps its data in the memory of the server. Every test uses the same memory.

Think of one shared notebook. If one test writes in it, the next test can read it. This is the root of most problems.

### Back to the puzzle

The error message points at the test with `SKU-5000`. But that test is only a victim. On Monday it created the product and never removed it. The product still lives in the server memory on Tuesday, so the same SKU is now taken. The test breaks rule 3: it does not pass twice in a row.

The second test, with "Lamp", is also a victim, of a different test. Some test created a second product with "Lamp" in its name and left it behind. The test that counts rows reads data that is not its own.

So the fix is not in the two failing tests. It is in the tests that leave data, and in the habit of writing fixed values. Fix first the one that wrote `SKU-5000` in code, because it is the one that you can see. Then give every test its own unique data, so no one depends on what others leave.

### Why the shop runs with one worker

Look at the comment at the top of `apps/practice-shop/playwright.config.ts`:

```ts
// The app keeps its data in memory and every test shares it,
// so tests run one at a time, in one worker.
fullyParallel: false,
workers: 1,
```

A **worker** is a process that runs tests. With `workers: 1`, only one test runs at a time. With `fullyParallel: false`, tests in one file also run one after another.

The reason is simple. If two tests ran at the same time, one could delete a product while the other reads it.

> **Note:** Running tests in parallel is faster. It needs data that tests do not share. This shop does not have that, so it chooses safety.

## Reset once, in the setup

At the start of each run, the data should be in a known state. The setup test in `apps/practice-shop/e2e/global.setup.ts` does this:

```ts
const reset = await request.post("/api/test/reset")
expect(reset.ok()).toBeTruthy()
```

The reset puts the data back to the seed data: 24 products and 12 orders.

The reset happens **once per run**, not before each test. Think about why before you read the reason. A reset before every test sounds safer. What would it hide?

A reset before every test gives each test a clean shop. That is a shop which never exists in real life. A real shop has hundreds of products that other people made. A test that only works when the shop is clean may fail the first time it meets real data, for example a search that finds a second product with the same word. A reset before every test would also add one more request to each test. The better habit is to start from known data once, and make each test strong enough to live with the data of the others.

## Create your own data

Each test creates what it needs. It does not use a product that another test made.

The file `apps/practice-shop/e2e/lib/helpers.ts` has two helpers. The first makes a unique name:

```ts
/** A name that no other test uses, e.g. "Mouse 3fa9c1d2". */
export function uniqueName(prefix: string): string {
  return `${prefix} ${crypto.randomUUID().slice(0, 8)}`
}
```

The second makes a SKU. A **SKU** is a code that identifies a product, like `SKU-4821`.

```ts
/** A valid SKU like "SKU-4821" that is not used by the seed data. */
export function uniqueSku(): string {
  const value = nextSku
  nextSku = value >= LAST ? FIRST : value + 1
  return `SKU-${value}`
}
```

The seed uses `SKU-0001` to `SKU-0024`. The helper starts at a random number from 1000 and counts up. Two tests never get the same SKU.

Here is a test that uses them, from `e2e/products/products.spec.ts`:

```ts
const name = uniqueName("Created")
// ...
await page.getByTestId("product-name").fill(name)
await page.getByTestId("product-sku").fill(uniqueSku())
```

The name is unique, so the test can find its own product. It does not matter how many products other tests made.

## Never depend on another test

Look at the orders spec, `e2e/orders/orders.spec.ts`. An order status only moves forward. Once an order is "paid", you cannot make it "pending" again.

So each test uses its own seeded order. One test uses order 1003. The other uses order 1005. If both used 1005, the second test would fail.

Also look at how the first test in `products.spec.ts` handles a changing total:

```ts
// Other tests add products, so we ask the API for the real total.
const total = ((await (await request.get("/api/products")).json()) as { total: number }).total
```

The test does not write `24 products`. Other tests add products, so it reads the real total first.

## Go deeper

### Debug like a scientist when a test is flaky

When a test fails only sometimes, do not change five things at once. Use the method of a scientist.

1. **Make one guess.** For example: "this test depends on a product that another test makes."
2. **Run one small experiment** that can prove the guess wrong. Run the test alone with `-g`. If it passes alone and fails in the full run, the guess has support.
3. **Change one thing** and run again. Never two things.
4. **Shrink the failing case.** Find the smallest set of tests that still fails: two tests, then one pair. The smaller the case, the clearer the link.

### Why shared data breaks a test that looks correct

A variable outside a function lives as long as the program runs. Every function can change it. Shared test data works the same way. The program in the explanation shows the problem in small size: test B has no mistake, and still fails when it runs alone.

### A common wrong idea: unique means random

`uniqueName` uses random characters. So you may think random is always the way. But look at `uniqueSku`. It does not pick random numbers. It counts up.

Before you read on, guess: if you pick 100 random SKUs from the 9,000 values `SKU-1000` to `SKU-9999`, how likely is it that at least two are the same? 1 percent, 10 percent or 40 percent? This program asks the computer 20,000 times:

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

It prints about `42 percent of runs had a clash`. The number can change by one point from run to run, because it uses random numbers.

The reason is the size of the space. A name has eight characters from 16 choices each. That is 4,294,967,296 possible values. A clash among 1,000 names is very unlikely, about 1 in 8,600. A SKU has only four digits, so the space is small, and clashes come fast. Counting up gives 9,000 different SKUs before the counter wraps and repeats the first one. That is far more than one run needs. It is not a guarantee across workers or across runs.

```ts
let next = 9998
function sku() {
  const value = next
  next = value >= 9999 ? 1000 : value + 1
  return `SKU-${value}`
}
console.log(sku(), sku(), sku())
```

This prints `SKU-9998 SKU-9999 SKU-1000`. When the counter reaches the end it goes back to 1000, so the SKU stays valid.

### How it shows up in QA work

Parallel runs are the next problem. If a team wants tests to run at the same time, each worker needs data it does not share. Tests that already create their own unique data are ready for this step. Tests that depend on shared records must be rewritten first.

Also note a DRY idea here. The knowledge "how this suite makes unique data" lives in `helpers.ts` only. No spec invents its own way to make a name.

## Practice

1. Open `apps/practice-shop/e2e/lib/helpers.ts`. Find the lines that choose the first SKU number.
2. Open `apps/practice-shop/e2e/orders/orders.spec.ts`. Find the comment that says which order each test uses.
3. Start the shop with `pnpm shop:dev` in one terminal.
4. In a second terminal, run one spec file alone:

```bash
pnpm shop:e2e products/products.spec.ts
```

5. Run the same file again, with no restart:

```bash
pnpm shop:e2e products/products.spec.ts
```

6. Both runs should pass. This proves rule 3: twice in a row.
7. Run one single test by a word from its name. `-g` means "grep": it runs only tests whose name contains the word.

```bash
pnpm shop:e2e -g cancelling
```

8. This proves rule 1: it passes alone.

## Challenge

Write the test for the gap "Duplicate SKU error when creating a product" from `COVERAGE.md`. The point is to make it independent: it must create its own data, and it must survive being run many times.

Create the file `apps/practice-shop/e2e/challenges/duplicate-sku.spec.ts`.

The test creates a product through the API. Then it opens the new-product form, fills it with valid values and the SKU of that product, and saves. The form must show an error and must not create a second product.

It is done when:

- The test gets its SKU from a product that it creates itself. The file does not contain a fixed SKU such as `SKU-0001`, and no seeded product id.
- After Save, the element `product-sku-error` has the exact text the server sends, and the page address still ends with `/products/new`.
- The total number of products, read from `/api/products` before and after the Save, is the same.
- You ran `pnpm shop:e2e challenges/duplicate-sku.spec.ts --repeat-each=3` and all three runs passed.

You will need something this lesson did not teach: how to run the same test several times in one command, and why a test that opens a form must wait until the page is ready for typing. Search for: `playwright repeat-each`, `playwright hydration fill input erased react`. Read the comment in `products.spec.ts` above `newButton.click()` for a first hint.

## Think it through

1. A test file has two tests. Test one creates a product with `createProduct` and checks that it appears in the list. Test two checks that the list has a row with the text "Created". Test two never creates anything. Run in the order one, two, it passes. Predict what happens when you run test two alone on a fresh server, and in the order two, one.

<details><summary>Answer</summary>

On a fresh server the seed data has no product named "Created" in the products, so test two fails when run alone, and also when it runs first. It passes only after test one, or after any test that makes such a product. The test depends on data that it does not own. The fix is that test two creates its own product with a name from `uniqueName("Created")`, and then looks for exactly that name.

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

Product 23 is seeded data, "Mouse Pad". The first run deletes it. Run it twice against the same running data, for example with `--repeat-each 2`. The second copy does not reset the data, so product 23 does not exist and there is no delete button to click. (A second normal `pnpm shop:e2e` command passes, because the setup project resets the seed before each command.) The test breaks rule 3, passing twice in a row. It should create its own product with `createProduct` and delete that one.

</details>

3. Two versions of a helper both give unique SKUs. Version one picks a random number from 1000 to 9999 each time. Version two counts up from a random start and wraps at 9999. Which is better for this suite, and what would make you choose the other?

<details><summary>Answer</summary>

Version two is better here: inside one run it gives 9,000 different SKUs before it repeats, and version one gives a clash among 100 SKUs in about 4 runs out of 10. Version one would be fine if the space were huge, such as a UUID, where a clash is not a practical worry. It also fits when many workers each need a value and cannot share a counter, because random values need no coordination. The choice depends on the size of the space and on whether the callers can share state.

</details>

4. The team sets `workers: 2` in the shop config, with no other change. Which test in `products.spec.ts` is most likely to fail, and why? Would `uniqueSku` still give different SKUs?

<details><summary>Answer</summary>

The first test, "shows 10 rows on the first page and the total count", is the most likely. It reads the total from the API, then opens the page, and a test in the other worker may add or delete a product between the two steps. The count text then does not match. `uniqueSku` keeps its counter in the memory of one worker process, so each worker starts at its own random number. SKUs inside one worker stay different, but two workers can clash with a small chance. The shop is built for one worker, and the config tells you so.

</details>

5. The counter version of `uniqueSku` makes 9,000 SKUs before it wraps. What happens on call number 9,001 in a very long run? Is it a bug you need to fix?

<details><summary>Answer</summary>

Call 9,001 returns the same SKU as call 1. If the product from call 1 still exists, the server answers with "This SKU is already used by another product." and the test fails. A normal run makes far fewer than 9,000 products, and tests that clean up leave no old products, so the problem is rare. It is not worth a complex fix today (this is the idea of YAGNI). It is worth a comment in the helper, so the next person knows the limit.

</details>

6. A teammate says: "Let us reset the data before every test. Then we never have order problems." Give one gain and one loss. Would you accept the proposal?

<details><summary>Answer</summary>

The gain is a known start for every test, and fewer leftovers. The loss is real: tests no longer meet the messy data of real life, so a test that needs a clean shop would look healthy, and one extra request is added to every test. A test that quietly depends on a clean shop will fail in the first environment with real data. Many teams prefer one reset per run and strong tests that make their own unique data. The answer depends on the cost of finding such hidden links later, and on whether the data can be kept private to each test.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **How does Playwright keep one test from affecting another?**
   - Search for: `playwright test isolation browser context`
   - Try it: write two tests in a scratch spec. In each test, first open `/products` with `page.goto`. In the first, set a value with `page.evaluate(() => localStorage.setItem("x", "1"))`. In the second, read it back with `localStorage.getItem("x")` and print it. Run both and see what the second prints.
   - A good answer explains: what a browser context is, and what each test gets new.

2. **What is a UUID, and why is a random one almost never repeated?**
   - Search for: `UUID version 4 collision probability`
   - Try it: in a `.ts` file, call `crypto.randomUUID()` 100,000 times and put the results in a `Set`. Print the size of the set. Then cut each value to its first 4 characters and run it again.
   - A good answer explains: what a UUID looks like, how many values exist, and why a clash is not a practical worry.

3. **How do teams keep test data apart when many tests run at the same time?**
   - Search for: `test data isolation parallel tests`
   - Try it: in `playwright.config.ts` of the shop, read what `workers` and `fullyParallel` do. Without changing the file, write which of the shop tests would break first with `workers: 2`, and why.
   - A good answer explains: at least two strategies, such as unique data per test or a separate database per worker.

## Next step

In the next lesson you learn the naming rule for `data-testid` and why the team uses it.
