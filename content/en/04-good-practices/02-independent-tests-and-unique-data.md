---
title: Independent tests and unique data
summary: Write tests that pass alone, in any order and twice in a row, using unique data helpers.
duration: 30 min
---

## Goal

- State the three rules of an independent test.
- Explain why the shop suite runs with one worker.
- Use `uniqueName` and `uniqueSku` to create your own data.
- Explain why the setup resets the data only once.

## Three rules

A good test is **independent**. It follows three rules.

1. It passes when you run it **alone**.
2. It passes in **any order** with the other tests.
3. It passes **twice in a row**, without restarting anything.

A test that breaks one of these rules is dangerous. It may pass today and fail tomorrow, and nobody knows why.

## Shared data in the shop

The practice shop has no database. It keeps its data in the memory of the server. Every test uses the same memory.

Think of one shared notebook. If one test writes in it, the next test can read it. This is the root of most problems.

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

The reset happens **once per run**, not before each test. A reset before every test would be slow. It would also hide mistakes: a test that depends on another test would still pass.

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

## Check what you know

1. What are the three rules of an independent test?

<details><summary>Answer</summary>

It passes alone, in any order, and twice in a row.

</details>

2. Why does the shop config use `workers: 1`?

<details><summary>Answer</summary>

The shop keeps its data in memory and every test shares it. Two tests at the same time could change the same data.

</details>

3. What does `uniqueName("Created")` return?

<details><summary>Answer</summary>

The prefix plus a space and eight random characters, such as `Created 3fa9c1d2`.

</details>

4. Why does the setup reset the data only once per run?

<details><summary>Answer</summary>

Each test must create its own data. A reset before every test would hide shared data problems.

</details>

## Next step

In the next lesson you learn the naming rule for `data-testid` and why the team uses it.
