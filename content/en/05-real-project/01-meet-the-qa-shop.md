---
title: Meet the QA Shop
summary: Start the practice shop, sign in with two roles, explore it like a tester, and prove one of its rules with a small script.
duration: 80 min
---

## Start with a puzzle

At 9:00 you sign in to a web app as admin. You mark order 1005 as paid. At 9:30 the developer stops the server and starts it again to test a change. At 9:35 you open the orders page.

Three things could be true. Order 1005 is still paid. Order 1005 is pending again. Or the order does not exist any more.

Now a second question. You also created a product called "Test lamp" at 9:10. A colleague says: "If it is gone, you must file a bug." Do you agree?

Write down your guess before you read on.

## Goal

- Decide what to explore first in an app you have never seen, and write a charter for it.
- Predict which actions each role may do, then check your prediction by hand.
- Explain why the shop forgets its data, and why that helps a test.
- Prove one business rule of the shop with a script, without using the browser.

## What the QA Shop is

The **QA Shop** is a small web app for practice. It is a **back office**: a private site where a team manages products and orders. Customers never see it.

It is built like the real projects you will join. It has a login, pages only for signed-in users, lists with search and filters, forms with validation, and an **API**. An API is the part of the app that the pages call to get and save data.

The pages use shadcn/ui, a set of ready-made buttons, inputs, tables and dialogs. You do not need to know it. You only need to know that the `data-testid` values and the visible texts are the stable parts you will select in tests.

## Start the app

Open a terminal in VS Code. Go to the root of the repository. Run:

```bash
pnpm shop:dev
```

Wait until you see a line with `Ready`. Leave this terminal open. Open http://localhost:5190 in your browser.

> **Note:** If the port is busy, you may have started the shop in another terminal. Close that one first.

## Two users, two roles

A **role** decides what a user may do. The shop has two.

| User | Email | Password | Can do |
| --- | --- | --- | --- |
| Admin | `admin@qa-shop.test` | `Admin123!` | Everything |
| Viewer | `viewer@qa-shop.test` | `Viewer123!` | Read only |

You can sign in with only one user per browser window. To use both, open a private window for the second user.

Before you sign in as viewer, make a prediction. Write a list: which buttons will the viewer see on `/products` and on `/orders`? Then sign in and compare. Every difference between your list and the screen is a lesson about how the app works.

## Explore like a tester

**Exploratory testing** means you use the app freely and watch for risks. You do not follow a script. You write down what you find. These notes become your test ideas.

Watch how one person moves through the pages and what they notice.

![Sign in as admin, see the dashboard, search for mouse, open a product and go back.](/clips/shop-tour.webm)

Before you click, break the job into parts. This is called **decomposition**: split a big task into small steps you can finish. For the shop, the parts are the pages: login, dashboard, products, orders, and an unknown address. Give each part a **charter**: one sentence about what to explore and why. Example: "Explore the login page to find ways a user can enter without a valid password."

Keep a text file open. For each page, write what works and what you would test.

### /login

Try an empty form. Try a wrong password. Try a correct login. Read the error messages.

Now sign out. Type the address `http://localhost:5190/products` directly. Look at the address bar after the redirect. It contains `next=%2Fproducts`. The `%2F` is a slash written in a safe way. Sign in and see where you land.

### /dashboard

You see four numbers. They do not appear at once. The API waits 1.2 seconds on purpose. Write down: "numbers arrive late, loading text first".

### /products

This page has the most behavior. Try each control:

- Search by name and by SKU. A **SKU** is a product code such as `SKU-0001`.
- Filter by status.
- Go to the next page. The list shows 10 products per page.
- Click **New product**. Save an empty form. Then create a product.
- Create a second product with the same SKU.
- Click the name of a product. This opens its detail page, `/products/<id>`. Read its data. Use the back link to return.
- On the detail page, as admin, look at the **Edit** and **Delete** buttons.
- Edit a product from the list. The **Edit** link opens `/products/<id>/edit`. Delete one, and cancel once.

### /orders

Filter by status. As admin, change an order. Before you click, predict: which buttons will a pending order have? A paid one? A shipped one? Then check. Notice that a status only moves forward.

### An unknown address

Open `http://localhost:5190/products/999999`. Write down what you see.

### Back to the puzzle

Order 1005 is pending again, and "Test lamp" is gone. The shop keeps its data in the memory of the server. Memory is erased when the program stops. At each start the shop creates the same 24 products and 12 orders again.

So this is not a bug. It is a rule of the shop. A bug report here would cost a developer time and would show that you did not read the README. The better habit: before you report something unexpected, ask "is this by design?" and look for the rule.

## Turn notes into test ideas

Your notes are not tests yet. Turn each one into a sentence about what a user sees. Example: "An admin cancels a pending order and sees the status `cancelled`."

Be exact. Compare two notes. Note A: "Delete works." Note B: "An admin deletes a product, confirms in the dialog, and the row disappears." Two people can run note B and agree on the result. Nobody can say if note A passed.

This is the first step of every automation task. You cannot automate what you do not understand. The suite in the next lessons covers only part of what you found.

## Go deeper

### Why the shop forgets its data

Most real apps save data in a **database**, a program that stores data on disk. The QA Shop keeps data in memory instead.

This is a choice made for testing. A test needs to know the starting data. If the app always begins with the same 12 orders, a test can say "order 1005 is pending" and be right every time. Data that is known and repeatable is the base of every stable test. Real teams get the same effect with a test database that they reset before each run. The shop also has a test-only address, `POST /api/test/reset`, that puts the data back without a restart.

### A wrong idea: "I explore, so I do not need a plan"

Many beginners think exploratory testing means clicking at random. It does not. A charter keeps you focused. It also gives you something to report. "I explored login for 20 minutes and found two risks" is a clear result. "I clicked around" is not.

### How it shows up in real QA automation work

You found that `/products` sends you to `/login?next=%2Fproducts`. A program can read that address. This small script shows how the browser splits it:

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

A test can check both parts: the path is `/login`, and `next` holds the page you wanted. Your exploring told you the rule. The automation turns the rule into a repeatable check.

### When not to automate an idea

Not every test idea should become automation. Automation costs time to write and to repair. Keep it for checks that are repeated often, are stable, and matter to the business. A check you will do only once is cheaper by hand.

You know the idea of writing a rule once, called DRY (Don't Repeat Yourself). Its counterweight is **YAGNI**: You Aren't Gonna Need It. Do not build for a need you only imagine. Automate the ten checks that run every day before you build a framework for a hundred checks that may never exist.

## Practice

1. Run `pnpm shop:dev`. Open http://localhost:5190.
2. Sign in as admin. Visit every page above, a product detail page and the unknown address.
3. Write at least 10 test ideas in a text file. Use plain sentences.
4. Sign out. Sign in as viewer. Add 3 more ideas about what the viewer must not see.
5. Stop the server with `Ctrl+C`. Start it again. Check that your created product is gone.

## Challenge

Hiding a button is not security. A viewer who has no button can still send a request by hand. Your task: prove that the shop enforces its order rules in the API, not only on the page.

Write a script that sends requests to the running shop. Use order 1003. In the seed data it is shipped. Try to change its status to `paid` three times: with no sign-in, as viewer, and as admin. Print one line for each try with the status code and the message the API sends back. Then add a fourth try that you choose yourself: another rule you found while exploring.

Create the file `exercises/challenges/shop-order-rules.ts`. Do not edit any other file.

It is done when:

- You run `node exercises/challenges/shop-order-rules.ts` with the shop running, and it prints one line per try.
- The first three lines show three different status codes, and you can say why each code fits.
- The script does not change any data. Run it twice and the output is the same.
- Your fourth try is a case you chose, and the line says what you expected before you ran it.
- The script needs no install. It uses only what Node already has.

You will need something this lesson did not teach: how to send a request with a program, including a body and a cookie. A **cookie** is a small value the browser saves and sends back with every request. The shop sends its session cookie when you sign in. You must read it from the answer and send it back. Search for: `node fetch post json body`, `fetch response headers getSetCookie`, `http status 401 403 409 difference`.

> **Tip:** Work in small steps, one guess and one experiment at a time. First print only the status code of the login. Then read the cookie. Then send one PATCH request.

## Think it through

1. A tester writes this idea: "Sign in as admin, mark order 1003 as paid, and see the status `paid`." The note is clear and a person can run it. Find the problem.

<details><summary>Answer</summary>

Order 1003 is shipped in the seed data, and a shipped order is final. It has no **Mark as paid** button, so the test can never be run as written. The note reads well but ignores the data. This is why you explore first: you learn which order is pending (1001, 1005 or 1009) before you write the idea. A test idea must name data that really exists in the starting state.

</details>

2. You have two hours and 40 test ideas. You can automate about 12 of them. How do you choose? There is no single right answer.

<details><summary>Answer</summary>

Pick by risk and by repetition. Favor checks that matter to the business (login, create product, change an order), that you would run on every release, and that are stable. Skip checks that run once, depend on a slow or random page, or are cheaper by hand. The choice depends on what the team fears most and how often the app changes. Another tester could pick a different 12 and be right, if they can explain the reasons.

</details>

3. What does this script print, and why?

```ts
const url = new URL("http://localhost:5190/login?next=%2Fproducts%3Fq%3Dmouse")
console.log(url.searchParams.get("next"))
```

<details><summary>Answer</summary>

It prints `/products?q=mouse`. The part after `next=` is the text `/products?q=mouse` with the special characters `/`, `?` and `=` written as `%2F`, `%3F` and `%3D`. `searchParams.get` turns them back into normal characters. This matters because the whole address of the page you wanted is stored inside one value. Without the writing, the `?` would start a new part of the address.

</details>

4. What would break for a tester if the shop saved its data in a database on disk and never reset it?

<details><summary>Answer</summary>

Tests would no longer know the starting data. Order 1005 would be pending on the first run and paid on the second, because a status only moves forward. The same test would pass, then fail, with no change to the app. The team would need a reset step or a separate test database. Memory data gives you this reset for free, at the cost that nothing is ever saved.

</details>

5. Explain to a teammate, in three sentences, why a viewer without buttons is not enough protection. Do not use the word "button".

<details><summary>Answer</summary>

The page only decides what it draws, but anyone can send a request to the server without using the page. So the server must check the role of every request itself. In the shop it answers 403, which means "you are known, but not allowed". A good test checks both: the page shows no actions to the viewer, and the server refuses the request.

</details>

6. Two testers use the same running shop at the same time. Tester A marks order 1005 as paid. Tester B, a minute later, follows a test idea that starts with "order 1005 is pending". What happens, and what does it teach?

<details><summary>Answer</summary>

Tester B finds the order paid and thinks the test idea is wrong or the app is broken. Both testers share the same memory, so one person's action changes the data of the other. The lesson is that shared data makes results depend on other people. A tester should create their own data, or agree who uses which order. You will see the same problem again when tests run in the suite.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is a test charter in exploratory testing, and how is it different from a test case?**
   - Search for: `test charter exploratory testing session`
   - Try it: write one charter for `/orders`, then explore for 15 minutes with a timer. Count how many risks you wrote down.
   - A good answer explains: what a charter contains and how it guides a time-boxed session, compared with step-by-step test cases.

2. **What is the difference between the status codes 401 and 403, and between authentication and authorization?**
   - Search for: `authentication vs authorization 401 403`
   - Try it: sign in as viewer, open DevTools, go to the Console tab, and run `fetch("/api/orders/1009", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status: "paid" }) }).then((r) => r.status)`. Write down the number, then guess what you get when you are signed out, and test it.
   - A good answer explains: that authentication proves who you are, authorization decides what you may do, and which code the shop returns in each case.

3. **Why do teams reset or seed test data before automated tests run?**
   - Search for: `test data management seed reset automation`
   - Try it: while the shop runs, create a product, then run `fetch("/api/test/reset", { method: "POST" }).then((r) => r.json())` in the DevTools Console. Reload `/products` and observe what changed.
   - A good answer explains: why repeatable starting data prevents flaky tests, and one way a team can create it.

## Next step

In the next lesson you open the `e2e` folder and learn what every file in it does.
