---
title: Meet the QA Shop
duration: 70 min
---

## Goal

In this lesson you explore the QA Shop and write test ideas based on its rules and starting data. You also check its permissions and order rules with a script.

- Guide the exploration of each page with a charter.
- Check the actions available to admin and viewer.
- Recognize which data is lost when the server restarts.
- Check a business rule through the API.

## The QA Shop

The **QA Shop** is a practice back office for managing products and orders. It has a login, protected pages, search, filters, forms with validation, and an API.

## Start the app

Open a terminal in VS Code and go to the root of the repository. Run:

```bash
pnpm shop:dev
```

Wait until you see a line with `Ready`. Leave this terminal open and open http://localhost:5190 in your browser.

> **Note:** If the port is busy, you may have started the shop in another terminal. Close that one first.

## Two users, two roles

The shop has these test users:

| User | Email | Password | Can do |
| --- | --- | --- | --- |
| Admin | `admin@qa-shop.test` | `Admin123!` | Everything |
| Viewer | `viewer@qa-shop.test` | `Viewer123!` | Read only |

Regular windows in the same browser profile share the shop's session cookie. To use both users at once, open a private window for the second user.

## Explore like a tester

Divide the exploration by page. Give each one a **charter**: a sentence about what to explore and why. For example: "Explore the login page to find ways a user can enter without a valid password."

Keep a text file open to record the results and test ideas for each page. This tour shows the login, search, and a product detail page:

![Sign in as admin, see the dashboard, search for mouse, open a product and go back.](/clips/shop-tour.webm)

### /login

Try an empty form, a wrong password, and a correct login. Read the error messages.

Sign out and type the address `http://localhost:5190/products` directly. After the redirect, the address bar contains `next=%2Fproducts`: that parameter holds the requested page. The `%2F` represents a slash. Sign in and check where you land.

### /dashboard

Watch the four numbers and the loading text that appears first. The API waits 1.2 seconds on purpose before responding.

### /products

Try each control:

- Search by name and by SKU. A **SKU** is a product code such as `SKU-0001`.
- Filter by status.
- Go to the next page. The list shows 10 products per page.
- Click **New product**. Save an empty form. Then create a product.
- Create a second product with the same SKU.
- Click the name of a product. This opens its detail page, `/products/<id>`. Read its data. Use the back link to return.
- On the detail page, as admin, look at the **Edit** and **Delete** buttons.
- Edit a product from the list. The **Edit** link opens `/products/<id>/edit`. Delete one, and cancel once.

### /orders

Filter by status and compare the actions available for pending, paid, and shipped orders. As admin, change an order and check the result. Allowed status changes only move forward.

### An unknown address

Open `http://localhost:5190/products/999999` and write down what you see.

## The starting data

The shop server keeps its data in memory. When it stops, it loses the changes; when it starts again, it creates the same 24 products and 12 orders. A product you created disappears, and order 1005 is pending again.

![Restarting the server loses changes and recreates the seeded products and orders.](/images/05-memory-reset.en.svg)

Known starting data lets you repeat a check from the same state. The shop also provides `POST /api/test/reset` to restore it without restarting the server.

## Turn notes into test ideas

Write each idea with the user, action, and observable result. For example: "An admin cancels a pending order and sees the status `cancelled`."

"Delete works" does not say how to check the result. "An admin deletes a product, confirms in the dialog, and the row disappears" lets two testers run the same check.

## Go deeper

### Read the redirect address

When you visit `/products` without a session, the server redirects you to `/login?next=%2Fproducts`. The URL object separates the path and parameters of that address. This script reads the parts:

```ts
const url = new URL("http://localhost:5190/login?next=%2Fproducts")
console.log(url.pathname)
console.log(url.search)
console.log(url.searchParams.get("next"))
```

It prints:

```text
/login
?next=%2Fproducts
/products
```

The path is `/login`; `next` contains the requested page, with the slash decoded. You can check both values to verify the redirect.

## Practice

1. Write at least 10 test ideas in a text file based on the exploration. Include the action and expected result.
2. Sign out. Sign in as viewer. Add 3 more ideas about what the viewer must not see.
3. Stop the server with `Ctrl+C`. Start it again. Check that your created product is gone.

## Challenge

The server must check permissions even when the page hides actions from the viewer. Write a script that sends requests to the running shop to check permissions and order rules.

Use order 1003, which is shipped (`shipped`) in the starting data. Try to change its status to `paid` three times: without a session, as viewer, and as admin. Print one line per attempt with the status code and the API message. Add a fourth attempt for another rule you found while exploring.

Create the file `exercises/challenges/shop-order-rules.ts`. Do not edit any other file.

It is done when:

- When you run `node exercises/challenges/shop-order-rules.ts` with the shop running, the script prints one line per attempt and uses only what Node already has.
- The first three lines show three different status codes, and you can say why each code fits.
- The script does not change products or orders; logins do create sessions. Run it twice and the output is the same.
- Your fourth attempt is a case you chose, and the line says what you expected before you ran it.

For requests with a session, read the cookie from the login response and send it in subsequent requests. Search for: `node fetch post json body`, `fetch response headers getSetCookie`, `http status 401 403 409 difference`.

## Think it through

1. A tester writes this idea: "Sign in as admin, mark order 1003 as paid, and see the status `paid`." Find the problem.

<details><summary>Answer</summary>

Order 1003 is shipped in the starting data, and that status is final. It has no **Mark as paid** button. To check that change, you need a pending order such as 1001, 1005, or 1009.

</details>

2. What does this script print, and why?

```ts
const url = new URL("http://localhost:5190/login?next=%2Fproducts%3Fq%3Dmouse")
console.log(url.searchParams.get("next"))
```

<details><summary>Answer</summary>

It prints `/products?q=mouse`. The value of `next` contains the characters `/`, `?`, and `=` written as `%2F`, `%3F`, and `%3D`. `searchParams.get` decodes them. A second `?` can also remain inside the value of `next`; an unencoded `&` would separate another parameter. Encoding keeps the complete address in one value.

</details>

3. Two testers use the same running shop. Tester A marks order 1005 as paid. Tester B follows a test idea that starts with "order 1005 is pending". What happens?

<details><summary>Answer</summary>

Tester B finds the order paid because both use the same data in the server's memory. They need to agree on who uses each order or prepare separate data so one person's action does not change the other's starting state.

</details>

## Next step

In the next lesson you open the `e2e` folder and learn what every file in it does.
