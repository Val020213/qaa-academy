---
title: HTTP in ten minutes
summary: Learn requests, responses, methods, status codes and JSON, and read them in the Network panel of the practice shop.
duration: 45 min
---

## Goal

- Explain client, server, request and response.
- Name the HTTP methods and the status code families.
- Recognize the status codes a tester sees most.
- Read a JSON body.
- Find a request in the Network panel and read it.

## Client and server

A **client** asks for something. A **server** answers. Your browser is a client. The computer that holds the data is the server.

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

The method says what the request does. These five are the most common:

| Method | Meaning | Example |
| --- | --- | --- |
| `GET` | Read data | Get the list of products |
| `POST` | Create something, or send an action | Sign in, create a product |
| `PUT` | Replace something with new data | Save the edit form of a product |
| `PATCH` | Change part of something | Change the status of an order |
| `DELETE` | Remove something | Delete a product |

A `GET` request must not change data. It is safe to repeat.

## Status codes

The **status code** is the first thing to look at. The first digit tells the family:

| Family | Meaning |
| --- | --- |
| 2xx | Success |
| 3xx | Redirect: go to another address |
| 4xx | Client error: the request is wrong or not allowed |
| 5xx | Server error: the server failed |

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

A good tester checks the status code and the body. A 4xx code is not always a bug. It is the correct answer to a bad request.

## JSON

Most APIs send data as **JSON**. JSON is text that looks like a TypeScript object. You know this shape from module 1.

This is the real response of the shop after a successful sign-in:

```json
{
  "name": "Ada Admin",
  "email": "admin@qa-shop.test",
  "role": "admin"
}
```

Names are in double quotes. Text is in double quotes. A list uses square brackets.

## The practice shop API

The API routes are in `apps/practice-shop/app/api`. Some of them:

| Method and URL | What it does |
| --- | --- |
| `POST /api/auth/login` | Sign in. Returns 401 for a wrong password |
| `GET /api/products` | List products. Returns 401 without a session |
| `POST /api/products` | Create a product. Returns 201, 403 or 422 |
| `GET /api/stats` | Numbers for the dashboard. It waits 1.2 seconds on purpose |

The viewer user can read, but gets 403 when creating, editing or deleting.

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

## Check what you know

1. What is the difference between 401 and 403?

<details><summary>Answer</summary>

401 means you are not signed in. 403 means you are signed in, but your role is not allowed to do this.

</details>

2. Which method creates a new item, and which status code do you expect?

<details><summary>Answer</summary>

`POST`, and `201 Created`.

</details>

3. A test sends invalid data and the server returns 422. Is it a bug?

<details><summary>Answer</summary>

No. It is the correct answer. The server refuses invalid data. It is a bug if the server returns 200 or 500.

</details>

4. Where in DevTools do you read the JSON that the server sent?

<details><summary>Answer</summary>

In the Network panel: click the request and open the Response tab.

</details>

5. A server answers `200 OK` to `POST /api/products`. The body is `{ "errors": { "sku": "This SKU is already used by another product." } }`. What is wrong with this answer, and which status code is right?

<details>
<summary>Answer</summary>

The status says "success" but the body says that the request failed. A client or a test that checks only the status will think a product was created. The right code is `422`, which means the data is not valid. The shop already does this.

</details>

6. Your test sends `GET /api/products` and gets `401`. In the browser, the same request works. Give one likely reason.

<details>
<summary>Answer</summary>

The browser has the session cookie from your sign-in, and the test does not. The server needs a session for this route, so without the cookie it answers 401, which means "not signed in". The fix is to sign in first in the test, or to start the test with a saved session.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What does it mean that an HTTP method is "idempotent", and which methods are?**
   - Search for: `HTTP idempotent methods MDN`
   - A good answer explains: the meaning with one example, and why `PUT` is idempotent and `POST` is not.
2. **What is the difference between the HTTP status codes 301, 302 and 307?**
   - Search for: `HTTP redirect 301 302 307 difference`
   - A good answer explains: which redirects are permanent, and which keep the method of the request.
3. **What should a tester check in an API response besides the status code?**
   - Search for: `API testing what to verify response`
   - A good answer explains: at least three checks, such as the body, the headers and the response time.

## Next step

In the next lesson you learn how forms, events and state work, and what a page remembers after a reload.
