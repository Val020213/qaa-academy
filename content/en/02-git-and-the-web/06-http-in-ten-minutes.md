---
title: HTTP in ten minutes
duration: 60 min
---

## Goal

In this lesson you read the practice shop's HTTP requests and responses to check what the browser sends and what the server returns.

- Identify a request's method, URL, headers and body.
- Read a status code and the data in a JSON response.
- Distinguish an operation that reads data from one that changes it, and recognize what happens when you repeat it.
- Find the response in Network that explains a page error.

## Client and server

The browser is the **client**: it sends a **request** when the page needs data or sends an action. The HTTP server receives that request and returns a **response**. **HTTP** defines the rules for these messages.

![A product request with a valid session and its HTTP response; page code uses the data to update the DOM.](/images/02-http-exchange.en.svg)

In the practice shop, the browser and server run on your computer. The server listens at `http://localhost:5190`.

## The request

A request has these parts:

- **Method**: the operation requested, such as `GET`.
- **URL**: where to send it, such as `/api/products`.
- **Headers**: extra information, such as the type of the data.
- **Body**: the data you send. Many requests have no body.

## The response

The server returns:

- **Status code**: a number that indicates the result of the request.
- **Headers**: extra information.
- **Body**: the data you receive, if the response has a body.

## Methods

The method indicates the operation the client asks the server to perform:

| Method | Meaning | Example |
| --- | --- | --- |
| `GET` | Read data | Get the list of products |
| `POST` | Create something, or send an action | Sign in, create a product |
| `PUT` | Replace something with new data | Save the edit form of a product |
| `PATCH` | Change part of something | Change the status of an order |
| `DELETE` | Remove something | Delete a product |

A `GET` request asks to read, rather than change, application data, so it is defined as safe. The server can log the visit without breaking that rule.

If a shop uses `GET` for `/delete-everything`, a browser that loads the link ahead of time could delete the data without anyone clicking. Operations that change data must use `POST`, `PUT`, `PATCH` or `DELETE`.

## Status codes

The first digit of the **status code** identifies its family:

| Family | Meaning |
| --- | --- |
| 2xx | Success |
| 3xx | Redirection: requires further action; 304 allows using a cached copy |
| 4xx | Client error: the request is wrong or not allowed |
| 5xx | Server error: the server failed |

A wrong password produces this response in the shop:

![A wrong password sends a login request, and DevTools Network shows status 401. The clip uses port 5196; in practice you will use 5190.](/clips/devtools-network.webm)

These are the codes you will see most often:

| Code | Name | Meaning |
| --- | --- | --- |
| 200 | OK | The request succeeded; it can have a body |
| 201 | Created | A new item was created |
| 204 | No Content | It worked, and there is no body. The practice shop returns it when you delete a product |
| 401 | Unauthorized | Valid authentication is missing; a wrong password can also cause this |
| 403 | Forbidden | The server refuses the operation. In the shop, your role is not allowed |
| 404 | Not Found | The server cannot find the resource or does not disclose that it exists |
| 409 | Conflict | The request clashes with the current state. In the shop, an order cannot go back to an earlier status |
| 422 | Unprocessable Content | The data is not valid. The shop returns it for a bad product form |
| 500 | Internal Server Error | The server encountered an unexpected failure |

A 4xx code can be the correct response to an invalid request or one without permission. Read the body too to find the reason for the rejection.

### A page with no results

With an admin session, this request asks for page 999 of the products. You can see it in the DevTools Console:

```text
> await (await fetch("/api/products?page=999")).json()
```

The shop returns `200`, with `items` as an empty list and `total` with the real number of products. The server accepts that page even though it has no results. For `?page=abc`, the route code uses page 1 and also returns `200`.

## JSON

Many APIs send data as **JSON**, a text format with objects and lists:

```json
{
  "name": "Rex",
  "age": 3,
  "tricks": ["sit", "roll"]
}
```

Names and strings use double quotes. Lists use square brackets. JSON does not allow trailing commas or comments.

When you use `JSON.parse` to read the text `{ name: 'Rex' }`, the names have no quotes and the string has single quotes. The result is a `SyntaxError`: that text is valid as a JavaScript object expression, but not as JSON. `JSON.stringify` drops object fields whose value is `undefined` and converts a date to text.

This is the shop's response after a successful sign-in:

```json
{
  "name": "Ada Admin",
  "email": "admin@qa-shop.test",
  "role": "admin"
}
```

## The practice shop API

The API routes are in `apps/practice-shop/app/api`:

| Method and URL | What it does |
| --- | --- |
| `POST /api/auth/login` | Sign in. Returns 401 for a wrong password |
| `GET /api/products` | List products. Returns 401 without a session |
| `POST /api/products` | Create a product. Returns 201, 401, 403 or 422 |
| `DELETE /api/products/<id>` | Delete a product. Returns 204; 401 without a session, 403 without permission or 404 if it does not exist |
| `GET /api/stats` | Numbers for the dashboard. It waits 1.2 seconds on purpose |

The viewer user can read, but gets 403 when creating, editing or deleting.

## Go deeper

### Repeating an operation

With an admin session, deleting the same product twice leaves the same final state: the product is gone. The responses can differ. In the shop, the first `DELETE` request returns `204` and the second returns `404`, because the server can no longer find the product.

A `POST` that creates an item can create another when repeated. The final state after two requests can differ from the state after one.

### Status and data

A `200` indicates success, but does not prove the data is correct. When reviewing the products list, also check the items and total the server returns.

After a deletion, status `204` indicates that the response has no body. Trying to read it as JSON fails. To check the effect of the deletion, another `GET` request for the product, with a valid session, should return `404`.

## Practice

1. Start the shop in a terminal. Keep it running:

```bash
pnpm shop:dev
```

2. Open `http://localhost:5190` in Chrome or Edge. Press `F12`, open **Network**, turn on **Preserve log**, and click **Fetch/XHR**.
3. Sign in with `admin@qa-shop.test` and `Admin123!`.
4. Find the request `login`. Check that the method is `POST` and the status is `200`. Open **Payload** to see the data sent and **Response** to see the JSON.
5. Find the request `stats`. It is a `GET`. Look at its **Time**: the server deliberately waits 1.2 seconds before responding.
6. Click **Products**. Find the request that starts with `products?`. Read the full URL in **Headers** and find `items`, `total` and `pageSize` in **Response**.
7. Click **New product**, leave the form empty and click **Save**.
8. Find the request `products` with method `POST` and status `422`. Read the messages in **Response** and compare them with the red text on the page.
9. Click **Sign out**. Choose the **All** filter in Network and open `http://localhost:5190/products`. Find the request `products` with status `307` and read the `Location` header, which gives the login address.
10. Stop the shop with `Ctrl + C`.

## Challenge

Create `apps/practice-shop/e2e/challenges/api-status-table.spec.ts`. Write a table of API rules and use a loop to turn each row into a test. Each row gives the user, method, address, body and expected status.

Import from `../lib/test`. Read the routes in `apps/practice-shop/app/api` and the helpers in `apps/practice-shop/e2e/lib/fixtures/api-client.ts` to choose the rules.

It is done when:

- You run `pnpm shop:e2e challenges/api-status-table` and all tests pass. Change an expected status, check that the corresponding test fails, then fix it.
- The table has at least six rows covering 401, 403, 404, 422 and at least one 2xx status.
- Each title is built from its row, for example `viewer POST /api/products gives 403`.
- The rows are independent. A row that needs a product creates its own.

Search for how to create tests from an array and choose each test's session: `playwright parameterized tests loop` and `playwright test.use storageState`.

## Think it through

1. You are signed in as admin. Predict the status and the `page` field of three calls: `GET /api/products?page=999`, `GET /api/products?page=abc` and `GET /api/products?page=-5`.

<details>
<summary>Answer</summary>

All three return `200`. For `page=999`, the `page` field is `999` and `items` is empty. For `abc` and `-5`, the server uses page 1: `page` is `1` and `items` has the first products. The route converts the value to a number and sets 1 as the minimum.

</details>

2. A test deletes a product and then checks the response:

```ts
const response = await request.delete(`/api/products/${product.id}`)
expect(response.status()).toBe(204)
expect(await response.json()).toEqual({})
```

The status check passes, but the test fails. Why?

<details>
<summary>Answer</summary>

A `204` response has no body. The call to `json()` tries to read an empty body and throws an error. Remove that check or use another request to check that the product no longer exists.

</details>

3. A developer adds the link `GET /api/products/5/delete`, which deletes product 5. What can break even if nobody clicks it?

<details>
<summary>Answer</summary>

A browser that loads links ahead of time or a search robot could delete the product. These tools may send `GET` requests automatically because the method is defined as safe. The deletion operation should use `DELETE`.

</details>

## Next step

In the next lesson you learn how forms, events and state work, and what a page remembers after a reload.
