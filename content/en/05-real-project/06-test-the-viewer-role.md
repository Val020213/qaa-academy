---
title: Test the viewer role
summary: Test a second user by starting signed out and signing in as the viewer, learn to prove that something is absent, and test who can change an order.
duration: 90 min
---

## Start with a puzzle

A shop has two kinds of users. An admin can edit and delete products. A viewer can only look.

Sam writes a test for the viewer. It opens the products page and checks that the page has zero Delete buttons. The test is green. Sam is happy.

Next week, a developer makes a typo in the address that loads the product list. The table on the viewer's page is now empty. The test is still green.

Sam also runs the same test as admin by mistake. Admins have Delete buttons on every row. The test is green again.

How can one check pass in all three situations? What does a green result tell Sam in each one?

Write down your guess before you read on.

## Goal

- Explain why a second user needs a second session.
- Start a spec signed out and sign in as the viewer.
- Write an "absent" check that can fail, and prove that it can.
- Decide which layer, the screen or the API, must carry each rule.

## The problem

Every test in the suite starts signed in as admin. The config loads `e2e/.auth/admin.json` for all tests. But the viewer is a different user with a different session. You cannot be both at once in one browser context.

A **browser context** is one clean browser profile that a test uses. It has its own cookies. So the viewer needs a context with the viewer's cookie.

## The simplest approach

Do it inside the spec, in three steps.

1. Replace the admin session with an empty one: `test.use({ storageState: { cookies: [], origins: [] } })`. The test starts signed out. The `auth.spec.ts` file does this too.
2. In `beforeEach`, call `loginViaApi(page.request, VIEWER)`. It posts to `/api/auth/login`.
3. `page.request` shares cookies with the page. The session cookie arrives in the context, so `page.goto` already sees the viewer as signed in.

`loginViaApi` and `VIEWER` come from `lib/fixtures/api-client.ts`. A **`beforeEach`** hook is code that runs before every test in its group.

Before you read on, predict what happens if you pass the `request` fixture instead of `page.request`. Where does the cookie go?

> **Careful:** Pass `page.request`, not the `request` fixture. The `request` fixture has its own cookie jar, not the page's. A login on it would not sign the page in.

## Absent controls

You want to assert that something is not there. Use `toHaveCount(0)`. Now think about when this assertion is satisfied. `toHaveCount(0)` is true as soon as it sees zero elements. When is that? Also at the first moment of a page that has not loaded.

That is the trap. A page that has not loaded has zero buttons. An empty table has zero buttons. A page of an admin who has not seen the rows yet has zero buttons. A check that passes in every case proves nothing. A test that cannot fail is not a test.

Watch which buttons the viewer does not have.

![The viewer sees products and orders but has no New, Edit, Delete or action buttons.](/clips/shop-viewer-role.webm)

The fix has two parts:

1. First wait for something that must exist: the first row. Then the page has loaded and has data.
2. Prove that the check can fail. Run the same test as admin once. If it stays green, the check is not worth anything.

The rows have test ids with the product id inside, such as `products-edit-12`. A regular expression matches all of them: `getByTestId(/^products-edit-/)`.

### Back to the puzzle

The check "zero Delete buttons" is true for a viewer with data, for a viewer with an empty table, and for an admin whose rows have not loaded yet. Sam's test never looked at the rows. A green result meant only "at the moment of the check, I saw no Delete button". The fix is to wait for the first row, then check for zero buttons, and to run it once as admin to see it fail. This is a mini **experiment**: change one thing (the user), and see if the result changes.

## The API check

The UI hides the buttons. But a hidden button is not security. Someone can still call the API. The server must refuse.

`page.request.post(url, { data })` sends a POST request with the viewer's cookie. The API answers status 403, which means "forbidden": you are known, but you may not do this. The body has a message.

## The full spec

Create `apps/practice-shop/e2e/products/viewer.spec.ts`.

```ts
import { expect, test } from "../lib/test"
import { VIEWER, loginViaApi } from "../lib/fixtures/api-client"
import { uniqueName, uniqueSku } from "../lib/helpers"
import { ProductsPage } from "../lib/pages/products.page"

// Start signed out. The saved admin session is not used in this file.
test.use({ storageState: { cookies: [], origins: [] } })

test.describe("Viewer role", () => {
  test.beforeEach(async ({ page }) => {
    // The cookie lands in the browser context, so page.goto sees it too.
    await loginViaApi(page.request, VIEWER)
  })

  test("the viewer sees the products but no New, Edit or Delete", async ({ page }) => {
    const products = new ProductsPage(page)

    await products.goto()

    await expect(page.getByTestId("user-role")).toHaveText("viewer")
    // Wait for the rows first. A "0 buttons" check on an empty page proves nothing.
    await expect(products.rows.first()).toBeVisible()
    await expect(products.newButton).toHaveCount(0)
    await expect(page.getByTestId(/^products-edit-/)).toHaveCount(0)
    await expect(page.getByTestId(/^products-delete-/)).toHaveCount(0)
  })

  test("the API answers 403 when the viewer creates a product", async ({ page }) => {
    const response = await page.request.post("/api/products", {
      data: { name: uniqueName("Blocked"), sku: uniqueSku(), price: 9.5, stock: 1, status: "active" },
    })

    expect(response.status()).toBe(403)
    expect(await response.json()).toEqual({ message: "Your role does not allow this action." })
  })
})
```

The first test also checks `user-role`. The header shows the role in a badge. This proves the page is really signed in as viewer, not as a leftover admin.

## The alternative

You can add a second setup test that signs in as the viewer and saves `e2e/.auth/viewer.json`. Viewer specs then use `test.use({ storageState: "e2e/.auth/viewer.json" })`, which pays off when many specs need the viewer.

## Go deeper

### Why two requests can have different cookies

A **cookie** is a small piece of text that the browser stores and sends with each request to the same site. When you sign in, the server makes a session id and sends it back as the cookie `shop_session`. The server keeps a list in memory: this id belongs to this user. On each request, it reads the cookie and finds the user.

Playwright keeps cookies in a **browser context**. `page.request` uses the cookies of the page's context. The `request` fixture has its own. That is why the lesson says to pass `page.request`.

Because the server keeps a list of sessions, an admin and a viewer can be signed in at the same moment. Each one has its own cookie and its own entry in the list.

### A wrong idea: "403 and 401 are the same"

Both mean "not allowed", but they are different. In the shop:

- **401** means the server does not know who you are. You have no valid session.
- **403** means the server knows you, but your role may not do this.

The viewer gets 403. A visitor with no cookie gets 401. This is a good extra test, because it checks a different rule:

```ts
import { expect, test } from "../lib/test"

// Start signed out, with no cookie at all.
test.use({ storageState: { cookies: [], origins: [] } })

test("the API answers 401 when nobody is signed in", async ({ request }) => {
  const response = await request.get("/api/products")

  expect(response.status()).toBe(401)
  expect(await response.json()).toEqual({ message: "You must sign in." })
})
```

### How it shows up in real QA automation work

Security bugs often look like this: a developer hides the Delete button for a viewer, but forgets to check the role on the server. The page looks right, and a UI-only test passes. The API test in this lesson is the one that fails. In QA, this kind of problem is called **broken access control**, and it is one of the most common serious bugs.

Look at how the shop hides the controls. The products page and the orders page read the role of the user. For a viewer, they do not draw the Actions column at all: the header cell and the buttons are missing. That is a rule in the screen. The server has its own rule in the API. Two rules in two places can drift apart. This is why you test both.

### DRY and its trade-off

The `beforeEach` signs in the viewer before each test in the group. That is **DRY**: Don't Repeat Yourself. A **fixture** in Playwright is a prepared thing a test receives; a saved `viewer.json` session is similar, and it removes the login from every spec. The cost is more set-up files and one more thing to explain to a new teammate. With two tests, `beforeEach` is simpler. With twenty, the saved session wins. **YAGNI** says: do not build the saved session on day one for twenty specs that do not exist yet.

## Practice

1. Create `products/viewer.spec.ts` with the code above.
2. Run it: `pnpm --filter practice-shop e2e e2e/products/viewer.spec.ts`.
3. To see the spec can fail, temporarily sign in with `ADMIN` instead of `VIEWER` (add `ADMIN` to the import). Run it. Read the failure. Undo.
4. Add a third test: the viewer opens `/orders` and sees no `orders-mark-paid-` buttons. Use a regular expression and wait for a row first.
5. Update `COVERAGE.md`: the viewer role row is covered, and the gap is removed.

## Challenge

Test the viewer on **orders**. Create the file `apps/practice-shop/e2e/orders/orders-viewer.spec.ts`. Two things must hold for a viewer: the page does not offer order actions, and the server refuses an order change. You must also prove that a refused change did not change the order. Choose the order for the API check yourself. Remember that orders in the seed are used by other specs. The pending orders are 1001, 1005 and 1009.

It is done when:

- A UI test signs in as the viewer, waits for an order row, and checks that there are no buttons with the ids that start with `orders-mark-paid-`, `orders-mark-shipped-` and `orders-cancel-`.
- The same UI test checks that the Actions column header is not on the page.
- An API test sends the status change `paid` for your pending order as the viewer, and expects 403 and the message "Your role does not allow this action."
- The same test then signs in as admin in a separate session, reads the orders list through the API, and proves that your order is still `pending`.
- You run the spec twice with no failure. Then you sign the first test in as `ADMIN` once, see it fail, and undo the change.

You will need something this lesson did not teach: how to read a list from the JSON of a response and find one item in it, and how to find a table header by its role. Search for `playwright APIResponse json`, `typescript array find` and `playwright getByRole columnheader`. Remember that the `request` fixture has a cookie jar that is separate from `page.request`.

## Think it through

1. Predict the result. You change the viewer spec so that it signs in as `ADMIN`, and you delete the line that waits for the first row. The test only does `products.goto()` and then `toHaveCount(0)` on the Delete buttons. Is it green or red, and why?

<details><summary>Answer</summary>

It can be green. Right after the page opens, the list has not loaded, so there are zero Delete buttons, and `toHaveCount(0)` is satisfied at once. The test ends before the rows appear. A green result here says nothing about the admin's rows. This is why you wait for the first row and why you run the test once as the wrong user.

</details>

2. A teammate adds this test to the viewer file. It passes. Find the bug.

```ts
test("the viewer cannot create a product", async ({ request }) => {
  const response = await request.post("/api/products", {
    data: { name: uniqueName("Blocked"), sku: uniqueSku(), price: 9.5, stock: 1, status: "active" },
  })
  expect(response.ok()).toBeFalsy()
})
```

<details><summary>Answer</summary>

The test uses the `request` fixture, which has no login. The server answers 401, not 403. `ok()` is false for any error, so the test passes for the wrong reason. The test would also pass if the viewer rule were broken in another way, for example with a 500 error. Use `page.request` so the viewer's cookie is sent, and check `status()` against 403.

</details>

3. Version one signs in with `beforeEach` and `loginViaApi`. Version two saves `e2e/.auth/viewer.json` once in a setup test. Which do you choose for this suite, and what would change your mind?

<details><summary>Answer</summary>

With two or three viewer tests, `beforeEach` is better. It is visible in the spec, and there is no extra file or setup project to explain. The saved session saves one request per test, so with many viewer specs it wins on speed and removes repeated code. The cost is that the setup project grows, and a stale file can fail tests in a confusing way. The number of viewer specs and the cost of a login decide.

</details>

4. The business changes a rule: a viewer may now edit a product, but not create or delete. What must change in the viewer spec, and in which place can the change hide a bug?

<details><summary>Answer</summary>

The test must stop asserting that Edit is absent. It should assert that Edit is present, and that a PUT request from the viewer succeeds. The checks for New and Delete stay, and the 403 test stays for POST. The dangerous place is the server: the screen may show Edit while the server still answers 403 to PUT. So a new API test for PUT is needed, not only a change to the screen test.

</details>

5. Explain to a teammate, in three sentences and without the word "security", why a test that only checks hidden buttons is not enough.

<details><summary>Answer</summary>

A good answer says that the browser only draws the buttons, but anyone can send a request to the server without using the page. The server is the only place that decides what a user may do. So a test must send the request as that user and check that it is refused. Any answer that separates what the screen shows from what the server allows is correct.

</details>

6. At the same time, an admin edits products in one test and a viewer is tested in another. Both are signed in. Can the server handle two users at once, and how do you do this in one Playwright test?

<details><summary>Answer</summary>

The server can. It keeps a list of sessions, and each cookie maps to one user. In one test, one browser context has one cookie jar. So you need a second context for the second user, or you use the separate cookie jar of the `request` fixture for API calls. In this suite tests also run one at a time (`workers: 1`), so two tests do not overlap, but two users inside one test can.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the difference between HTTP status 401 and 403?**
   - Search for: `http 401 unauthorized vs 403 forbidden`
   - Try it: write a throwaway test that sends `GET /api/products` with no login, and `POST /api/products` as the viewer. Print both `response.status()` values with `console.log`. Delete the file.
   - A good answer explains: what each code means and one example where an API should return each

2. **What is role-based access control (RBAC)?**
   - Search for: `role based access control rbac explained`
   - Try it: make a table with two roles (admin, viewer) as columns and the actions of the shop (create, edit, delete a product; mark, cancel an order) as rows. Fill each cell by hand in the browser. Mark each cell that you cannot decide from the screen alone.
   - A good answer explains: how roles map to permissions, and how a tester can check that a role is limited correctly

3. **What is broken access control, and why is it on the OWASP Top 10 list?**
   - Search for: `owasp top 10 broken access control`
   - Try it: sign in as the viewer in the browser. Type `/products/new` in the address bar. Fill in the form and press Save. Write what you see, and decide whether the page is a bug, or only a missing hint for the user.
   - A good answer explains: what the risk is, one example, and how a QA engineer can test for it

## Next step

In the next lesson you put your work into a pull request.
