---
title: Meet the QA Shop
summary: Start the practice shop, sign in with two roles, and explore every page like a tester before you automate anything.
duration: 50 min
---

## Goal

- Start the QA Shop on your computer.
- Sign in as admin and as viewer, and see what is different.
- Explore each page and write down what should be tested.
- Explain why you explore by hand before you write automation.

## What the QA Shop is

The **QA Shop** is a small web app for practice. It is a **back office**: a private site where a team manages products and orders. Customers never see it.

It is built like the real projects you will join. It has a login, pages only for signed-in users, lists with search and filters, forms with validation, and an **API**. An API is the part of the app that the pages call to get and save data.

The app has no database. It keeps its data in memory. The data is created again each time the server starts. If you break something, stop the server and start it again.

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

## Explore like a tester

**Exploratory testing** means you use the app freely and watch for risks. You do not follow a script. You write down what you find. These notes become your test ideas.

Keep a text file open. For each page, write two lists: what works, and what you would test.

### /login

Try an empty form. Try a wrong password. Try a correct login. Read the error messages.

Now sign out. Type the address `http://localhost:5190/products` directly. Look at the address bar after the redirect. It contains `?next=`. Sign in and see where you land.

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

Filter by status. As admin, change an order. Notice that a status only moves forward. A shipped or cancelled order has no buttons.

### An unknown address

Open `http://localhost:5190/products/999999`. Write down what you see.

### As the viewer

Sign in as viewer. Visit `/products` and `/orders`. Look for the buttons you had as admin.

## Turn notes into test ideas

Your notes are not tests yet. Turn each one into a sentence about what a user sees. Example: "An admin cancels a pending order and sees the status `cancelled`."

This is the first step of every automation task. You cannot automate what you do not understand. The suite in the next lessons covers only part of what you found.

## Go deeper

### Why the shop forgets its data

Most real apps save data in a **database**, a program that stores data on disk. The QA Shop keeps data in the memory of the server instead. Memory is erased when the program stops.

This is a choice made for testing. A test needs to know the starting data. If the app always begins with the same 24 products and 12 orders, a test can say "order 1005 is pending" and be right every time. Data that is known and repeatable is the base of every stable test. Real teams get the same effect with a test database that they reset before each run.

### A wrong idea: "I explore, so I do not need a plan"

Many beginners think exploratory testing means clicking at random. It does not. Good explorers give themselves a **charter**: one sentence about what to explore and why. Example: "Explore the login page to find ways a user can enter without a valid password."

A charter keeps you focused. It also gives you something to report. "I explored login for 20 minutes and found two risks" is a clear result. "I clicked around" is not.

### How it shows up in real QA automation work

You found that `/products` sends you to `/login?next=/products`. A program can read that address. This small script shows how the browser splits it:

```ts
const url = new URL("http://localhost:5190/login?next=/products")
console.log(url.pathname)
console.log(url.searchParams.get("next"))
```

It prints:

```text
/login
/products
```

A test can check both parts: the path is `/login`, and `next` holds the page you wanted. Your exploring told you the rule. The automation turns the rule into a repeatable check.

### When not to automate an idea

Not every test idea should become automation. Automation costs time to write and to repair. Keep it for checks that are repeated often, are stable, and matter to the business. A check you will do only once is cheaper by hand.

Earlier in the course you studied the idea of writing a rule once, called DRY (Don't Repeat Yourself). You can see a small version of it here: one `reset` call gives every run the same data, so nobody repeats set-up work by hand.

## Practice

1. Run `pnpm shop:dev`. Open http://localhost:5190.
2. Sign in as admin. Visit every page above, a product detail page and the unknown address.
3. Write at least 10 test ideas in a text file. Use plain sentences.
4. Sign out. Sign in as viewer. Add 3 more ideas about what the viewer must not see.
5. Stop the server with `Ctrl+C`. Start it again. Check that your created product is gone.

## Check what you know

1. What is exploratory testing?

<details><summary>Answer</summary>

You use the app freely, without a script, and write down risks and ideas to test.

</details>

2. What happens to the data when the server restarts?

<details><summary>Answer</summary>

The data is created again from the start. Your changes are lost.

</details>

3. What is the difference between admin and viewer?

<details><summary>Answer</summary>

Admin can create, edit and delete. Viewer can only read.

</details>

4. Why explore by hand before you automate?

<details><summary>Answer</summary>

You must understand what the app does before you can write a test that checks it.

</details>

5. Look at this note from a tester: "Delete works." What is wrong with it as a test idea? Rewrite it so that another person could run it.

<details><summary>Answer</summary>

It does not say who deletes, which product, or what the user sees. A better version: "An admin deletes a product, confirms in the dialog, and the row disappears from the list." Now two people will run the same check and agree on the result.

</details>

6. You create a product, then stop and restart the server. You search for the product and do not find it. Is this a bug? Why?

<details><summary>Answer</summary>

No. The shop keeps data in memory, and a restart creates the seed data again. The behaviour is by design. A bug report here would be wrong. You should read the lesson or README before you report something you did not expect.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is a test charter in exploratory testing, and how is it different from a test case?**
   - Search for: `test charter exploratory testing session`
   - A good answer explains: what a charter contains and how it guides a time-boxed session, compared with step-by-step test cases

2. **What is the difference between authentication and authorization?**
   - Search for: `authentication vs authorization roles`
   - A good answer explains: that authentication proves who you are, authorization decides what you may do, and how the admin and viewer roles show the second one

3. **Why do teams reset or seed test data before automated tests run?**
   - Search for: `test data management seed reset automation`
   - A good answer explains: why repeatable starting data prevents flaky tests, and one way a team can create it

## Next step

In the next lesson you open the `e2e` folder and learn what every file in it does.
