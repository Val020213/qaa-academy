---
title: Meet the QA Shop
summary: Start the practice shop, sign in with two roles, and explore every page like a tester before you automate anything.
duration: 35 min
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
- Edit a product. Delete one, and cancel once.

### /orders

Filter by status. As admin, change an order. Notice that a status only moves forward. A shipped or cancelled order has no buttons.

### An unknown address

Open `http://localhost:5190/products/999999`. Write down what you see.

### As the viewer

Sign in as viewer. Visit `/products` and `/orders`. Look for the buttons you had as admin.

## Turn notes into test ideas

Your notes are not tests yet. Turn each one into a sentence about what a user sees. Example: "An admin cancels a pending order and sees the status `cancelled`."

This is the first step of every automation task. You cannot automate what you do not understand. The suite in the next lessons covers only part of what you found.

## Practice

1. Run `pnpm shop:dev`. Open http://localhost:5190.
2. Sign in as admin. Visit all three pages and the unknown address above.
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

## Next step

In the next lesson you open the `e2e` folder and learn what every file in it does.
