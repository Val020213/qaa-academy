---
title: Test the viewer role
duration: 60 min
---

## Goal

You will test that the viewer can read products and orders but cannot change them. The spec will check the UI controls and an API request that the server refuses.

- Start a spec without the saved admin session and sign in as the viewer.
- Wait for data before checking that controls are absent.
- Check the status and message of a refused request.
- Verify that a refused change leaves the order unchanged.

## Prepare the viewer session

The config loads `e2e/.auth/admin.json` by default. To test the viewer, replace that state and sign in within the spec:

1. Use `test.use({ storageState: { cookies: [], origins: [] } })` to start signed out, as `auth.spec.ts` does.
2. In `beforeEach`, call `loginViaApi(page.request, VIEWER)`. The helper sends a POST to `/api/auth/login`.
3. The server returns the session cookie. Since `page.request` shares cookies with the browser context, `page.goto` opens the page with the viewer's session.

`loginViaApi` and `VIEWER` come from `lib/fixtures/api-client.ts`. The `request` fixture has a separate cookie store: signing in through it does not sign the page in.

![The page and page.request share cookies; the request fixture uses a separate store.](/images/05-cookie-stores.en.svg)

## Check absent controls

`toHaveCount(0)` passes as soon as the locator finds zero elements. If it finds any, Playwright repeats the check until the count is zero or the timeout expires. The assertion can pass before the data arrives: an empty table has no Edit or Delete controls either.

Wait for the first row first. In this shop, rows appear when the browser receives products from the API and React displays them. The absence check then runs against a list with data.

![The viewer sees products and orders but has no New, Edit, Delete or action buttons.](/clips/shop-viewer-role.webm)

The controls' test ids include the product id, such as `products-edit-12`. Use `getByTestId(/^products-edit-/)` to find those that start with that prefix.

Run the spec once as admin to check that it detects the wrong user. Then restore the viewer login.

## Check permissions through the API

The products and orders pages read the user's role. For the viewer, React omits the controls and the Actions column, including its header.

The server checks the role separately, since a request can arrive without using those controls. `page.request.post(url, { data })` sends the POST with the viewer's cookie. When the viewer tries to create a product, the API returns 403 and the refusal message.

## Write the spec

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

The `user-role` check confirms that the header shows viewer. Waiting for the first row checks that products are present before looking for absent controls. The second test checks the refusal directly through the API, including its status and message.

## Reuse a viewer session

If several specs need the viewer, you can add another setup test that saves `e2e/.auth/viewer.json`. Those specs would use `test.use({ storageState: "e2e/.auth/viewer.json" })`.

For the two tests in this spec, `beforeEach` keeps the login in the same file. A saved session avoids repeating the login request but requires another state file to be prepared.

## Go deeper

### Check access without a session

The 403 test checks a role restriction. This other test checks access without a session: with empty state, the `request` fixture sends no user cookie and the API returns 401.

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

## Practice

1. Create `products/viewer.spec.ts` with the code above.
2. Run it: `pnpm --filter practice-shop e2e e2e/products/viewer.spec.ts`.
3. Temporarily sign in with `ADMIN` instead of `VIEWER` (add `ADMIN` to the import). Run the spec and read the failure. Undo the change.
4. Add a third test: the viewer opens `/orders` and sees no `orders-mark-paid-` buttons. Use a regular expression and wait for a row first.
5. Update `COVERAGE.md`: add a row for the viewer tests and remove that gap.

## Challenge

Test the viewer on orders. Create `apps/practice-shop/e2e/orders/orders-viewer.spec.ts` and check that a refused change leaves the order unchanged. Choose the order for the API check. In a fresh seed, the pending orders are 1001, 1005 and 1009. Reserve 1009 for these read and rejection checks: cancellation and payment tests change 1001 and 1005.

It is done when:

- A UI test signs in as the viewer, waits for a row, and checks that the Actions header and controls with ids starting with `orders-mark-paid-`, `orders-mark-shipped-` and `orders-cancel-` are absent.
- An API test first checks with `page.request.get("/api/auth/me")` that the role is `viewer`. It then sends the status change `paid` for 1009 and expects 403 and the message "Your role does not allow this action."
- The same test signs in as admin in a separate session, reads the orders list through the API, and checks that your order is still `pending`.
- The spec passes twice. Then you sign the first test in as `ADMIN`, see it fail, and undo the change. If you change the shared login, the API test’s role check must fail before PATCH.

Search for: `playwright APIResponse json`, `typescript array find` and `playwright getByRole columnheader`. You can use the `request` fixture for the separate admin session without changing the viewer's session in `page.request`.

## Think it through

1. You change the spec to sign in as `ADMIN` and remove the role and first-row checks. The test only does `products.goto()` and then `toHaveCount(0)` on the Delete controls. Can it pass before the rows appear?

<details><summary>Answer</summary>

Yes. If the list has not loaded yet, the locator finds zero Delete controls and the assertion passes. By the time the admin's rows arrive, the test may have finished.

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

The login in `beforeEach` uses `page.request`, but the test sends the request with `request`, which is still signed out. The server returns 401 and `ok()` returns false. The same assertion would accept a 500 error. Use `page.request` and check `status()` against 403.

</details>

3. The business changes a rule: the viewer may edit a product but may not create or delete one. Which checks need to change to detect a UI that offers Edit while the server still refuses edits?

<details><summary>Answer</summary>

Check that Edit is present and that a PUT request from the viewer succeeds. Keep the checks for absent New and Delete controls and the POST refusal with 403. If the server still refuses PUT, the API test will detect the failure even though the UI shows Edit.

</details>

## Next step

In the next lesson you put your work into a pull request.
