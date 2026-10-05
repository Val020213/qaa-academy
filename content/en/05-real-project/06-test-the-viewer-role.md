---
title: Test the viewer role
summary: Test a second user by starting signed out and signing in as the viewer through the API, in the spec itself.
duration: 50 min
---

## Goal

- Explain why a second user needs a second session.
- Start a spec signed out and sign in as the viewer.
- Assert that controls are absent without writing a false pass.
- Check that the API refuses the viewer with status 403.

## The problem

Every test in the suite starts signed in as admin. The config loads `e2e/.auth/admin.json` for all tests. But the viewer is a different user with a different session. You cannot be both at once in one browser context.

A **browser context** is one clean browser profile that a test uses. It has its own cookies. So the viewer needs a context with the viewer's cookie.

## The simplest approach

Do it inside the spec, in three steps.

1. Replace the admin session with an empty one: `test.use({ storageState: { cookies: [], origins: [] } })`. The test starts signed out. The `auth.spec.ts` file does this too.
2. In `beforeEach`, call `loginViaApi(page.request, VIEWER)`. It posts to `/api/auth/login`.
3. `page.request` shares cookies with the page. The session cookie arrives in the context, so `page.goto` already sees the viewer as signed in.

`loginViaApi` and `VIEWER` come from `lib/fixtures/api-client.ts`. A **`beforeEach`** hook is code that runs before every test in its group.

> **Careful:** Pass `page.request`, not the `request` fixture. The `request` fixture has its own cookie jar, not the page's. A login on it would not sign the page in.

## Absent controls

You want to assert that something is not there. Use `toHaveCount(0)`.

There is a trap. If the page has not loaded yet, there are also zero buttons. The assertion passes for the wrong reason. So first wait for something that must exist: the first row. Then assert the count of 0.

The rows have test ids with the product id inside, such as `products-edit-12`. A regular expression matches all of them: `getByTestId(/^products-edit-/)`.

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

The first test also checks `user-role`. This proves the page is really signed in as viewer, not as a leftover admin.

## The alternative

You can add a second setup test that signs in as the viewer and saves `e2e/.auth/viewer.json`. Viewer specs then use `test.use({ storageState: "e2e/.auth/viewer.json" })`, which pays off when many specs need the viewer.

## Go deeper

### Why two requests can have different cookies

A **cookie** is a small piece of text that the browser stores and sends with each request to the same site. When you sign in, the server makes a session id and sends it back as the cookie `shop_session`. The server keeps a list in memory: this id belongs to this user. On each request, it reads the cookie and finds the user.

Playwright keeps cookies in a **browser context**. `page.request` uses the cookies of the page's context. The `request` fixture has its own. That is why the lesson says to pass `page.request`.

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

### DRY and its trade-off

The `beforeEach` signs in the viewer before each test in the group. That is **DRY**: Don't Repeat Yourself. A **fixture** in Playwright is a prepared thing a test receives; a saved `viewer.json` session is similar, and it removes the login from every spec. The cost is more set-up files and one more thing to explain to a new teammate. With two tests, `beforeEach` is simpler. With twenty, the saved session wins.

## Practice

1. Create `products/viewer.spec.ts` with the code above.
2. Run it: `pnpm --filter practice-shop e2e e2e/products/viewer.spec.ts`.
3. To see the spec can fail, temporarily sign in with `ADMIN` instead of `VIEWER` (add `ADMIN` to the import). Run it. Read the failure. Undo.
4. Add a third test: the viewer opens `/orders` and sees no `orders-mark-paid-` buttons. Use a regular expression and wait for a row first.
5. Update `COVERAGE.md`: the viewer role row is covered, and the gap is removed.

## Check what you know

1. Why does the viewer test need `storageState` with empty cookies?

<details><summary>Answer</summary>

Without it, the test starts as admin. The viewer test needs to start signed out and then sign in as the viewer.

</details>

2. Why wait for the first row before `toHaveCount(0)`?

<details><summary>Answer</summary>

On a page that is not loaded yet, the count is also 0. The test would pass without proving anything.

</details>

3. Why test the API, and not only the hidden buttons?

<details><summary>Answer</summary>

A hidden button is not security. The server must refuse the request itself.

</details>

4. In `beforeEach` you use `loginViaApi(request, VIEWER)` with the `request` fixture instead of `page.request`. What happens to the first test, and why?

<details><summary>Answer</summary>

The login works, but the cookie goes to the `request` fixture's own cookie jar, not to the page. The page opens `/products` with no session, so the app sends it to the login page. The check for `user-role` then fails. This shows why the lesson says to use `page.request`.

</details>

5. A developer removes the role check from `POST /api/products` but keeps the buttons hidden. Which of the two viewer tests fails, and why?

<details><summary>Answer</summary>

The second test, the API test. The viewer's request now succeeds with status 201, not 403. The first test still passes, because the buttons are still hidden. This is why you need both tests: the UI test checks what the user sees, and the API test checks what the server allows.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the difference between HTTP status 401 and 403?**
   - Search for: `http 401 unauthorized vs 403 forbidden`
   - A good answer explains: what each code means and one example where an API should return each

2. **What is role-based access control (RBAC)?**
   - Search for: `role based access control rbac explained`
   - A good answer explains: how roles map to permissions, and how a tester can check that a role is limited correctly

3. **What is broken access control, and why is it on the OWASP Top 10 list?**
   - Search for: `owasp top 10 broken access control`
   - A good answer explains: what the risk is, one example, and how a QA engineer can test for it

## Next step

In the next lesson you put your work into a pull request.
