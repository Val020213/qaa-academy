---
title: HTTP in ten minutes
summary: Learn requests, responses, methods, status codes and JSON, and read them in the Network panel of the practice shop.
duration: 80 min
---

## Start with a puzzle

A library keeps a list of books on a screen. The page is slow, so you press **Remove "Book 7"** twice. Then, in the same hurry, you press **Add "Dune"** twice.

Now look at the list. Is "Book 7" gone? How many copies of "Dune" are there? And what message does the librarian give for the second press of each button?

The two buttons look alike, but a good system treats them in different ways. Think about which action is safe to repeat, and which one is not.

Write down your guess before you read on.

## Goal

- Predict the method and the status code for an action you describe in words.
- Decide which status code family fits a failure, and who is at fault.
- Explain why repeating some actions is safe and repeating others is not.
- Read a JSON body and find the field you need.
- Find a request in the Network panel and read its method, status and response.

## Client and server

A **client** asks for something. A **server** answers. Think of a restaurant: you are the client, the waiter carries your order, the kitchen is the server. Your browser is a client. The computer that holds the data is the server.

When you click a button that needs data, the browser sends a **request** to the server. The server sends back a **response**. **HTTP** is the set of rules for these messages.

Here, both run on your computer. The practice shop is the server, at `http://localhost:5190`.

## The request

A request has four parts:

- **Method**: what you want to do, such as `GET`.
- **URL**: where to send it, such as `/api/products`.
- **Headers**: extra information, such as the type of the data.
- **Body**: the data you send. Many requests have no body.

## The response

A response has these parts:

- **Status code**: a number that tells if it worked.
- **Headers**: extra information.
- **Body**: the data you get back.

## Methods

The method says what the request does. In the library, `GET` is "show me the list". `POST` is "add a new book". `PUT` is "replace the card of this book with a new card". `PATCH` is "fix one line on the card". `DELETE` is "take this book off the list".

| Method | Meaning | Example |
| --- | --- | --- |
| `GET` | Read data | Get the list of products |
| `POST` | Create something, or send an action | Sign in, create a product |
| `PUT` | Replace something with new data | Save the edit form of a product |
| `PATCH` | Change part of something | Change the status of an order |
| `DELETE` | Remove something | Delete a product |

A `GET` request must not change data. It is safe to repeat.

Here is the case that breaks if you ignore this rule. Imagine a shop where the link `/delete-everything` is a `GET`. A browser can load links before you click them, to be faster. A search robot follows every link on a page. Both would delete the data, and nobody pressed a button. This is why a request that changes data must use `POST`, `PUT`, `PATCH` or `DELETE`.

## Status codes

The **status code** is the first thing to look at. The first digit tells the family:

| Family | Meaning |
| --- | --- |
| 2xx | Success |
| 3xx | Redirect: go to another address |
| 4xx | Client error: the request is wrong or not allowed |
| 5xx | Server error: the server failed |

Back to the restaurant. A 4xx is "your order is wrong": "we have no such dish", "this room is for staff only", "you did not fill in the table number". A 5xx is "our fault": "the kitchen is on fire". The first digit tells you who should fix it.

Watch which status DevTools shows after a wrong password.

![A wrong password sends a login request, and DevTools Network shows status 401.](/clips/devtools-network.webm)

The codes you will see most:

| Code | Name | Meaning |
| --- | --- | --- |
| 200 | OK | It worked, and there is a body |
| 201 | Created | A new item was created |
| 204 | No Content | It worked, and there is no body. The practice shop returns it when you delete a product |
| 401 | Unauthorized | You are not signed in |
| 403 | Forbidden | You are signed in, but your role is not allowed |
| 404 | Not Found | The thing does not exist |
| 409 | Conflict | The request clashes with the current state. In the shop, an order cannot go back to an earlier status |
| 422 | Unprocessable Content | The data is not valid. The shop returns it for a bad product form |
| 500 | Internal Server Error | The server has a bug |

A 4xx code is not always a bug. It is the correct answer to a bad request.

### An experiment: what do you expect?

You are signed in to the shop as admin. You ask for page 999 of the products list. The shop has fewer than 999 pages. What status do you expect? 404, because there is no page 999? Or something else?

You can try it. Open the shop, sign in, open DevTools, and type this in the Console:

```text
> await (await fetch("/api/products?page=999")).json()
```

The answer is `200`, with `items` as an empty list and `total` still showing the real number of products. The shop does not treat "page 999" as a missing thing. It treats it as a valid question with an empty answer. Now guess a harder one: what does `?page=abc` return? The code uses page 1 when the number is not valid, so you get the first page and the answer is `200` too. Not every strange request gets a 4xx. The rule is written in the server code, and a tester must find out what the rule is.

## JSON

Most APIs send data as **JSON**. JSON is text that looks like a JavaScript object. You know this shape from module 1. The same shape can describe a dog, a song or a product.

```json
{
  "name": "Rex",
  "age": 3,
  "tricks": ["sit", "roll"]
}
```

Names are in double quotes. Text is in double quotes. A list uses square brackets. There is no trailing comma and no comment.

Guess what happens when you ask JavaScript to read `{ name: 'Rex' }`. Names have no quotes and the text has single quotes. The result is a `SyntaxError`: the text is a JavaScript object, but it is not valid JSON. Also guess what `JSON.stringify` does with a field whose value is `undefined`. The field is dropped. A date becomes text.

This is the real response of the shop after a successful sign-in:

```json
{
  "name": "Ada Admin",
  "email": "admin@qa-shop.test",
  "role": "admin"
}
```

## The practice shop API

The API routes are in `apps/practice-shop/app/api`. Some of them:

| Method and URL | What it does |
| --- | --- |
| `POST /api/auth/login` | Sign in. Returns 401 for a wrong password |
| `GET /api/products` | List products. Returns 401 without a session |
| `POST /api/products` | Create a product. Returns 201, 403 or 422 |
| `DELETE /api/products/<id>` | Delete a product. Returns 204, or 404 if it does not exist |
| `GET /api/stats` | Numbers for the dashboard. It waits 1.2 seconds on purpose |

The viewer user can read, but gets 403 when creating, editing or deleting.

### Back to the puzzle

Removing "Book 7" twice leaves the same list: the book is gone. Only the message differs. The first press works, and the second finds nothing to remove. Adding "Dune" twice makes two copies, because each add is a new thing. This is the promise of each method. `DELETE` is safe to repeat in its result. `POST` is not. That is why a browser asks "Do you want to send the form again?" before it repeats a `POST`.

## Go deeper

### Why it works this way: safe and repeatable methods

HTTP gives each method a promise. A `GET` only reads, so you can repeat it. A `DELETE` changes data, but doing it twice leaves the same end state: the thing is gone. A `POST` usually creates a new thing each time, so doing it twice makes two. These promises matter. A browser can repeat a `GET` by itself, and it asks you before it repeats a `POST`.

You can see the `DELETE` promise in the shop. The state is the same after both calls, but the answers are different:

```ts
import { expect, test } from "../lib/test"
import { createProduct } from "../lib/fixtures/api-client"

test("deleting a product twice gives 204, then 404", async ({ request }) => {
  const product = await createProduct(request)

  const first = await request.delete(`/api/products/${product.id}`)
  const second = await request.delete(`/api/products/${product.id}`)

  expect(first.status()).toBe(204)
  expect(second.status()).toBe(404)
})
```

Save it as `apps/practice-shop/e2e/products/delete-twice.spec.ts`. The first call removes the product. The second finds nothing.

### A common wrong idea: "the status code tells everything"

A status code says whether the request worked. It does not say that the data is right. A good API test checks both:

```ts
import { expect, test } from "../lib/test"

test.use({ storageState: { cookies: [], origins: [] } })

test("the API rejects a wrong password", async ({ request }) => {
  const response = await request.post("/api/auth/login", {
    data: { email: "admin@qa-shop.test", password: "wrong" },
  })

  expect(response.status()).toBe(401)
  expect(await response.json()).toEqual({ message: "Wrong email or password." })
})
```

Save it as `apps/practice-shop/e2e/auth/login-api.spec.ts`. The line with `test.use` makes the test start signed out, as `auth.spec.ts` does.

Notice the address: `/api/auth/login`, not `http://localhost:5190/api/auth/login`. The server address is written once, as `baseURL` in `playwright.config.ts`. Every test uses a short path. This is the idea called **DRY** (Don't Repeat Yourself): one fact, one place. If the port changes, you change one line. The helper `createProduct` is another case: many tests need a product, and they all use one helper.

### A trade-off: an API test is fast, but it is not the whole story

The API test above is quick and does not depend on the page. But it does not prove that the page shows the message to the user. Use API tests for rules of the server. Use UI tests for what the user sees. A good suite has both.

## Practice

1. Start the shop in a terminal. Keep it running:

```bash
pnpm shop:dev
```

2. Open `http://localhost:5190` in Chrome or Edge. Press `F12`, open **Network**, turn on **Preserve log**, and click **Fetch/XHR**.
3. Sign in with `admin@qa-shop.test` and `Admin123!`.
4. Find the request `login`. Check: the method is `POST`, the status is `200`. Open **Payload** to see the data you sent. Open **Response** to see the JSON.
5. Find the request `stats`. It is `GET`. Look at its **Time**. It is about 1.2 seconds. Why?
6. Click **Products** in the page. Find the request that starts with `products?`. Read the full URL in **Headers**. Open **Response** and find `items`, `total` and `pageSize`.
7. Click **New product**, leave the form empty and click **Save**.
8. Find the request `products`. It is a `POST`. Check that the status is `422`. Read the **Response**. It lists one message for each wrong field.
9. Compare the messages with the red texts on the page. They are the same.
10. Click **Sign out**. Click the **All** filter in the Network panel. Open `http://localhost:5190/products`. The page sends you to the login page. Find the request `products` with status `307`. That is a redirect (3xx). Read the `Location` header.
11. Stop the shop with `Ctrl + C`.

## Challenge

Write the rules of the shop API as a table of data, and let a loop turn each row into one test. Each row says who asks, which method, which address, which body, and which status you expect. Choose the rules yourself. You decide which six or more rules are the most important to protect.

**It is done when:**

1. You run `pnpm shop:e2e challenges/api-status-table` and all tests pass.
2. The table has at least six rows. Together they expect a 401, a 403, a 404, a 422 and at least one 2xx status.
3. Each test title is built from its row, for example `viewer POST /api/products gives 403`, so a failure names the rule that broke.
4. No row depends on another row. A row that needs a product creates its own.
5. You change one expected number on purpose, see the failing title, then fix it.

You will need something this lesson did not teach: how to make many tests from one array, and how to start a test as the viewer. For a signed-out test, reuse the empty `storageState` from the earlier example. Search for `playwright parameterized tests loop` and `playwright test.use storageState`. The file `apps/practice-shop/e2e/lib/fixtures/api-client.ts` already has helpers you can read and reuse.

Create the file `apps/practice-shop/e2e/challenges/api-status-table.spec.ts` yourself. Import from `../lib/test`. Do not copy a solution from anywhere. Read the route code in `apps/practice-shop/app/api` to find out what each rule really returns.

## Think it through

1. You are signed in as admin. Predict the status and the `page` field of three calls: `GET /api/products?page=999`, `GET /api/products?page=abc` and `GET /api/products?page=-5`. Say why.

<details>
<summary>Answer</summary>

All three return `200`. For `page=999` the list `items` is empty, because there are not so many products. For `abc` and `-5` the server falls back to page 1, so `page` is `1` and `items` has the first products. The route code turns an invalid number into 1 and never returns an error for this. You cannot guess these rules from the name of the API. You must read the code or try it.

</details>

2. A test deletes a product and then checks the answer:

```ts
const response = await request.delete(`/api/products/${product.id}`)
expect(response.status()).toBe(204)
expect(await response.json()).toEqual({})
```

The status check passes, but the test fails. Why?

<details>
<summary>Answer</summary>

The status `204` means "No Content": the response has no body. Reading `json()` on an empty body throws an error, so the test fails on the last line. The test asks for something that, by the rules of HTTP, does not exist. The fix is to remove that line, or to check the state in another request.

</details>

3. After a delete you can check in two ways. Version A: expect `204`. Version B: expect `204`, then `GET` the product and expect `404`. Both work. Which do you prefer, and what would make you choose the other?

<details>
<summary>Answer</summary>

Version B proves the effect, not only the promise: the product is really gone. It costs one more request. Use version A when many other tests already prove that deleting works, and this test is about something else, such as the role. Choose B when the delete itself is the thing you test.

</details>

4. A developer adds the link `GET /api/products/5/delete`, which deletes product 5. What can break, even if nobody clicks the link?

<details>
<summary>Answer</summary>

A `GET` is promised to be safe, so browsers, robots and tools may call it without a person. A browser that loads links early, or a search robot, could delete products. Also a tester who repeats all `GET` calls to check them would delete data. The method must be `DELETE`, because the promise of the method tells every tool what is safe.

</details>

5. Explain to a teammate the difference between 401 and 403 in three sentences. Do not use the words "sign in" or "role". Use a cinema or a train if it helps.

<details>
<summary>Answer</summary>

A model answer: At a cinema, 401 is "I do not know who you are, show me your ticket". 403 is "I know who you are, but your ticket is not for this room". The difference matters for tests, because 401 is fixed by getting a session, and 403 is fixed only by a user with more rights.

</details>

6. The shop answers `200` with an empty list for page 999. Another design answers `404`. Which is better?

<details>
<summary>Answer</summary>

There is no single right answer. A `200` with an empty list is simple for the page code: it draws "no results". A `404` says that the page does not exist, which helps an API that must tell a robot to stop. It depends on who uses the API and what the page does with an empty answer. The important thing is that the choice is written down, and that tests check it.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What does it mean that an HTTP method is "idempotent", and which methods are?**
   - Search for: `HTTP idempotent methods MDN`
   - Try it: in the shop, create a product in the page. Read its id in the address. In the Console, run `fetch("/api/products/<id>", { method: "DELETE" }).then((r) => r.status)` twice, with your real id, and write down both numbers.
   - A good answer explains: the meaning with one example, why `PUT` is idempotent and `POST` is not, and your two numbers.
2. **What is the difference between the HTTP status codes 301, 302 and 307?**
   - Search for: `HTTP redirect 301 302 307 difference`
   - Try it: with the shop running and signed out, run `curl.exe -i http://localhost:5190/products` in PowerShell. Read the first line and the `location` line.
   - A good answer explains: which redirects are permanent, which keep the method of the request, and what your command printed.
3. **What should a tester check in an API response besides the status code?**
   - Search for: `API testing what to verify response`
   - Try it: open the response of the request `products?` in DevTools. List three things in it, besides the status, that a test could check. Write one `expect` line for each.
   - A good answer explains: at least three checks, such as the body, the headers and the response time, and why each one can catch a bug the status misses.

## Next step

In the next lesson you learn how forms, events and state work, and what a page remembers after a reload.
