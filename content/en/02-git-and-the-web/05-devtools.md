---
title: Browser DevTools
summary: Use the Elements, Console and Network panels of Chrome or Edge to look inside a page, test your guesses and investigate a bug.
duration: 75 min
---

## Start with a puzzle

A pizza shop has a web page. It shows "Margherita, $12". You open DevTools, double-click the price and type "$1". Then you click **Order**.

Two questions. What price does the kitchen receive? And on another page, a recipe says "Serves: -2 people", but the Console shows no red error at all. How can a page be wrong with no error?

You cannot answer yet, but you can guess. Think about who owns the price: your browser, or the shop.

Write down your guess before you read on.

## Goal

- Predict what a change in the Elements panel does, and what it does not do.
- Decide which panel to open first for a given symptom.
- Explain why a clean Console does not prove that a page is correct.
- Read a request, its status code and its response in the Network panel.
- Investigate a problem with one guess and one small experiment at a time.

## What are DevTools?

**DevTools** are tools built into the browser. They show what is inside a page: its elements, its errors and its network traffic. Developers use them to build pages. Testers use them to find out why a page does not work.

DevTools work in Chrome and Edge in the same way. This lesson uses the names you see in both.

Any page works for your first look. Open a weather site or a recipe site and follow along. You do not need the course apps yet.

## Open DevTools

Use one of these ways:

- Press `F12`.
- Press `Ctrl + Shift + I`.
- Right-click an element on the page and choose **Inspect**.

DevTools open on the side or at the bottom of the window. At the top there is a row of tabs, called **panels**. If a panel is missing, click `>>` to see more.

## The Elements panel

The **Elements** panel shows the DOM as a tree. The DOM is the copy of the page that the browser keeps in memory. You can open and close elements with the small arrows.

The **element picker** is the arrow icon at the top left of DevTools. Click it, then click anything on the page. DevTools jumps to that element in the tree. You can also press `Ctrl + Shift + C`.

Watch how DevTools finds the email input and shows its `data-testid`.

![DevTools Elements finds the email input and shows its data-testid attribute.](/clips/devtools-elements.webm)

When you select an element, look at these things:

- Its attributes, such as `data-testid`.
- Its parent and its children.
- The **Styles** pane on the right. It shows the CSS of the element.

You can double-click an attribute or a text and change it.

Stop and guess. You change a text in the Elements panel, and then press `F5`. What do you expect to see? Now, a colleague opens the same page on another computer. What does the colleague see?

The answer: after `F5` the old text is back. The colleague never saw your change. You edited the browser's copy of the page, not the page file on the server. A reload builds a new copy from the server. So the Elements panel is a safe place to try ideas, and a bad place to prove anything.

## The Console panel

The **Console** shows messages from the page. Errors are red. Warnings are yellow.

When a page behaves badly, check the Console. A red error often points to the cause. An error line usually has the file name and the line number at the right side.

You can also type one line of JavaScript at the `>` prompt and press `Enter`. The result appears under it.

Try this on the Practice page of the course, at `http://localhost:5180/#/practice`. First guess: how many `input` elements does the page have? Count the fields you can see.

```text
> document.title
'QAA Academy'

> document.querySelectorAll("input").length
3
```

You see three fields: Email, Password and New case. Now add one case in section 2 and run the second line again. Guess first. The answer is 4. A checkbox is also an `input`, and every case row has one. Your count of "fields" and the browser's count of `input` elements are different things. When a count surprises you, ask what the code counts.

## The Network panel

Every time a page loads a file or asks a server for data, the browser sends a **request**. The **Network** panel lists them. Think of a weather page. The page itself is one request. The temperature arrives in another one, after the page is already on screen.

Follow these steps:

1. Open the Network panel **before** the action you want to study. It records only while it is open.
2. Do the action on the page, such as clicking a button.
3. Look at the list. Each row is one request.

The main columns are:

- **Name**: the end of the address.
- **Status**: the result code. `200` means success. A number from 400 up means a problem.
- **Type**: for example `document`, `script` or `fetch`.
- **Time**: how long the request took.

Pages load many files, such as scripts and styles. To see only the data calls, click the filter **Fetch/XHR**. These are the requests made by the page's code.

Click a request to see its details:

- **Headers**: the address, the method, the status and extra information.
- **Payload**: the data the page sent. It appears for requests that send data.
- **Response**: the data the server sent back.

Now the rule broken. Open the Network panel after you click a button that signs you in, and the page moves to a new address. What do you expect to find? Without **Preserve log**, the list is cleared when the page changes, and the request you wanted is gone.

> **Tip:** Turn on **Preserve log** in the Network panel before you start.

The next lesson explains requests and responses in detail.

## A routine to investigate a bug

**Debug like a scientist.** Make one guess about the cause. Run one small experiment that could prove the guess wrong. Change one thing at a time. If the problem is large, shrink it: find the shortest steps that still show the bug.

DevTools give you the experiments. A good routine is:

1. Open DevTools. Reproduce the problem with the Network panel open.
2. Look at the **Console**. Is there a red error?
3. Look at the **Network** panel. Is there a request with a red status? Click it. Read the **Response**.
4. Look at the **Elements** panel. Is the element there? Is it hidden? Does it have the attribute you expect?
5. Write down what you saw: the steps, the request address, the status code and the message.

The panel to open first depends on the symptom. A page that does nothing: Console. Wrong data: Network, then compare the response with the screen. Wrong look: Elements.

### Back to the puzzle

The price on the screen is only a picture of data. A well-built shop does not take the price from the page. The browser sends which pizza you want, and the server looks up the price itself. So the kitchen still gets $12. Your edit changed your copy only.

The recipe with "Serves: -2" has the same lesson in the other direction. The Console shows errors of the page code. The code ran without any error and still produced a wrong number. No red line does not mean no bug.

## Go deeper

### A common wrong idea: "the Console is clean, so there is no bug"

The Console shows errors of the page code. Many bugs are not errors. A page can show the wrong number, and every request can answer `200`. The code does what it was told, but the result is wrong. Nothing is red.

A clean Console is a good sign, and not a proof. You still compare what you see with what is expected. You still read the response in the Network panel and check that the data is right.

### How it shows up in real QA work: from DevTools to a test

You can turn what you saw in DevTools into an automatic check. This test fails if the Practice page throws an error while the report loads:

```ts
import { expect, test } from "./lib/test"

test("the practice page has no JavaScript errors", async ({ page }) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))

  await page.goto("/#/practice")
  await page.getByTestId("report-load").click()
  await expect(page.getByTestId("report-result")).toBeVisible()

  expect(errors).toEqual([])
})
```

You could save it as `e2e/practice-no-errors.spec.ts` in the course repository. The line with `page.on` tells Playwright: when the page has an error, save its message in the list. At the end, the list must be empty. You do not need to write this now. It shows that DevTools and Playwright look at the same browser.

Another useful action: right-click a request in the Network panel and choose **Copy**, then **Copy as cURL**. You get a command that repeats the request. You can add it to a bug report.

### A trade-off: DevTools help you look, but they leave no trace

- Changes in the Elements panel exist only in your tab. A reload removes them. Use them to try an idea, such as "what if this text were longer?". They are not a fix, and a test run does not see them.
- A copied request can include your cookie, and a cookie can be a password. Remove it before you paste it into a ticket that many people read.
- The Network panel can slow the connection. Choose a throttling profile such as **Slow 4G**. This shows what a user with a poor connection sees, for example if the "Loading..." text stays on screen.

## Practice

1. Open `http://localhost:5180/#/practice`. Press `F12`.
2. Click the element picker. Click the **Load report** button. Read its `data-testid` in the Elements panel.
3. Open the Console. Run `document.title`. Then run `document.querySelectorAll("input").length`. The result is 3.
4. Add one case in section 2 and run the count again. Explain the new number.
5. Run `nonexistentThing` in the Console. Read the red error. This shows how an error looks.
6. In a second terminal, start the practice shop:

```bash
pnpm shop:dev
```

7. Open `http://localhost:5190` in a new tab. Open DevTools and the **Network** panel. Turn on **Preserve log**.
8. Type the email `admin@qa-shop.test` and a wrong password. Click **Sign in**.
9. In the Network panel, find the request `login`. Read its **Status**. Click it and read the **Response**.
10. Read the red error message on the page. Compare it with the response.
11. Stop the shop with `Ctrl + C` in its terminal when you finish.

## Challenge

Make Playwright do what the Network panel does. Write a test that opens a page of the course site, records every request the browser sends, and reports what it saw. Choose your own page: the Practice page, or any lesson page. The test must also fail when a request fails.

**It is done when:**

1. You run `pnpm e2e e2e/challenges/devtools-network.spec.ts` and the test passes.
2. The test prints one line for each request type with its count, for example `script: 12`, and one line with the total.
3. The list contains a `document` request, so you know that you started listening before the page loaded.
4. You prove the test can fail: add one line that makes the page call an address where nothing is listening, run the test, see it fail with a message that names that address, then remove the line.
5. You compare your total with the Network panel after a reload with the cache disabled. You write one sentence in a comment on why the two numbers may differ.

You will need something this lesson did not teach: how to listen to every request, how to read the type of a request, and how to notice a request that failed. Search for `playwright page.on request resourceType` and `playwright requestfailed event`. For criterion 4, also search for `playwright page.evaluate fetch`.

Create the file `e2e/challenges/devtools-network.spec.ts` yourself. Import `test` and `expect` from `../lib/test`. Do not use `waitForTimeout`.

## Think it through

1. The Practice page has no cases. You run `document.querySelectorAll("input").length` and get 3. You add two cases and run it again. What do you get, and why?

<details>
<summary>Answer</summary>

You get 5. Each case row has a checkbox, and a checkbox is an `input` element. Two cases add two. The three text fields are still there. The lesson of the question: a number from the Console counts elements of one kind, and you must know what the selector really matches.

</details>

2. The shop dashboard shows "Products 0". The Console is clean. The Network panel shows the request `stats` with status `200`, and its Response says `"products": 24`. Where is the bug, and why did you not see a red error?

<details>
<summary>Answer</summary>

The server sent the right number, so the bug is in the page code that shows it. The code ran without a crash, so the Console had nothing to report. This is a bug of logic, not an error. The Response tab is the proof that you need: it shows that the data was right when it left the server.

</details>

3. You want to know how a product name with 80 letters looks in the table. Version A: edit the text in the Elements panel. Version B: create a product with a long name through the form. Both give a picture. Which do you choose first, and what would make you use the other?

<details>
<summary>Answer</summary>

Version A is faster, so use it for a first look at the layout. But it skips the form, the server and the rules, so it can show a wrong picture. For example, the server may cut or refuse an 80-letter name. Use version B when the result will go into a bug report or a test, because it is real data on the real path.

</details>

4. You turn off **Preserve log**. You sign in with a correct password. The page moves to `/dashboard`. What do you see in the Network panel, and what does that cost you?

<details>
<summary>Answer</summary>

The list shows only the requests of the new page. The `login` request is gone, because the page change cleared the list. If the sign-in had a problem, you lost the best proof of it: the status and the response. Turn on **Preserve log** before any action that moves to another page.

</details>

5. Explain to a teammate, in three sentences and without using the word "DOM", why your edit in the Elements panel disappears when you reload.

<details>
<summary>Answer</summary>

A model answer: The browser keeps a working copy of the page, and the Elements panel edits that copy. When you reload, the browser asks the server again and builds a new copy from what the server sends. Your edit was never sent to the server, so it is lost. A good answer says where the truth lives (the server) and where your change lived (your tab only).

</details>

6. A colleague says: "Always attach the full Copy as cURL to every bug report." Do you agree?

<details>
<summary>Answer</summary>

There is a trade-off. A full command lets the developer repeat the request at once, which saves time. But it can hold a cookie or a token, and a ticket may be read by many people. It depends on who reads the ticket and how long the session lives. A good habit: attach the command with the secret parts replaced, and write the steps in words.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **How do you slow down the network in Chrome DevTools, and why would a tester do it?**
   - Search for: `chrome devtools network throttling`
   - Try it: open the shop dashboard. Note the **Time** of the request `stats` with no throttling. Choose **Slow 4G**, reload, and note the time again.
   - A good answer explains: the steps to choose a profile, the two times you measured, and one bug that only a slow connection shows.
2. **What is a HAR file, and why can it be risky to share it?**
   - Search for: `HAR file network export`
   - Try it: sign in to the shop with a wrong password, export the HAR file from the Network panel, open it in a text editor and search for the word `password`.
   - A good answer explains: what a HAR file records, how you save one, and what private data it may hold.
3. **How can you test a page at the size of a phone with DevTools?**
   - Search for: `chrome devtools device mode`
   - Try it: open the Practice page in device mode. Make the width smaller step by step and find the width where the course menu moves below the content.
   - A good answer explains: how to open device mode, what it can simulate, the width you found, and one thing it cannot replace, such as a real phone.

## Next step

In the next lesson you learn what a request and a response contain, and what the status codes mean.
