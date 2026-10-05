---
title: Browser DevTools
summary: Use the Elements, Console and Network panels of Chrome or Edge to look inside a page and investigate a bug.
duration: 45 min
---

## Goal

- Open DevTools and name its main panels.
- Use the Elements panel and the element picker.
- Read errors and run one line of JavaScript in the Console.
- See a request, its status code and its response in the Network panel.
- Follow a routine to investigate a bug.

## What are DevTools?

**DevTools** are tools built into the browser. They show what is inside a page: its elements, its errors and its network traffic. Developers use them to build pages. Testers use them to find out why a page does not work.

DevTools work in Chrome and Edge in the same way. This lesson uses the names you see in both.

## Open DevTools

Use one of these ways:

- Press `F12`.
- Press `Ctrl + Shift + I`.
- Right-click an element on the page and choose **Inspect**.

DevTools open on the side or at the bottom of the window. At the top there is a row of tabs, called **panels**. If a panel is missing, click `>>` to see more.

## The Elements panel

The **Elements** panel shows the DOM as a tree. You can open and close elements with the small arrows.

The **element picker** is the arrow icon at the top left of DevTools. Click it, then click anything on the page. DevTools jumps to that element in the tree. You can also press `Ctrl + Shift + C`.

When you select an element, look at these things:

- Its attributes, such as `data-testid`.
- Its parent and its children.
- The **Styles** pane on the right. It shows the CSS of the element.

You can double-click an attribute or a text and change it. The change affects only your browser, and only until you reload. It is a safe way to try something.

## The Console panel

The **Console** shows messages from the page. Errors are red. Warnings are yellow.

When a page behaves badly, check the Console first. A red error often points to the cause. An error line usually has the file name and the line number at the right side.

You can also type one line of JavaScript at the `>` prompt and press `Enter`. The result appears under it.

```text
> document.title
'QAA Academy'

> document.querySelectorAll("input").length
3
```

This is what you used in the last lesson to test selectors.

## The Network panel

Every time a page loads a file or asks a server for data, the browser sends a **request**. The **Network** panel lists them.

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

> **Tip:** Turn on **Preserve log** in the Network panel. Without it, the list is cleared when the page changes, and you lose the request you want to see.

The next lesson explains requests and responses in detail.

## A routine to investigate a bug

When something does not work, follow the same steps each time:

1. Open DevTools. Reproduce the problem with the Network panel open.
2. Look at the **Console**. Is there a red error?
3. Look at the **Network** panel. Is there a request with a red status? Click it. Read the **Response**.
4. Look at the **Elements** panel. Is the element there? Is it hidden? Does it have the attribute you expect?
5. Write down what you saw: the steps, the request address, the status code and the message.

With these notes, a bug report is much more useful. A developer can start working at once.

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

The line with `page.on` tells Playwright: when the page has an error, save its message in the list. At the end, the list must be empty. You do not need to write this now. It shows that DevTools and Playwright look at the same browser.

Another useful action: right-click a request in the Network panel and choose **Copy**, then **Copy as cURL**. You get a command that repeats the request. You can add it to a bug report.

### A trade-off: DevTools help you look, but they leave no trace

- Changes in the Elements panel exist only in your tab. A reload removes them. Use them to try an idea, such as "what if this text were longer?". They are not a fix, and a test run does not see them.
- A copied request can include your cookie, and a cookie can be a password. Remove it before you paste it into a ticket that many people read.
- The Network panel can slow the connection. Choose a throttling profile such as **Slow 4G**. This shows what a user with a poor connection sees, for example if the "Loading..." text stays on screen.

## Practice

1. Open `http://localhost:5180/#/practice`. Press `F12`.
2. Click the element picker. Click the **Load report** button. Read its `data-testid` in the Elements panel.
3. Open the Console. Run `document.title`. Then run `document.querySelectorAll("input").length`.
4. Run `nonexistentThing` in the Console. Read the red error. This shows how an error looks.
5. In a second terminal, start the practice shop:

```bash
pnpm shop:dev
```

6. Open `http://localhost:5190` in a new tab. Open DevTools and the **Network** panel. Turn on **Preserve log**.
7. Type the email `admin@qa-shop.test` and a wrong password. Click **Sign in**.
8. In the Network panel, find the request `login`. Read its **Status**. Click it and read the **Response**.
9. Read the red error message on the page. Compare it with the response.
10. Stop the shop with `Ctrl + C` in its terminal when you finish.

## Check what you know

1. How do you open DevTools?

<details><summary>Answer</summary>

Press `F12`, or press `Ctrl + Shift + I`, or right-click an element and choose Inspect.

</details>

2. What does the element picker do?

<details><summary>Answer</summary>

You click an element on the page, and DevTools shows it in the Elements panel.

</details>

3. Why open the Network panel before the action?

<details><summary>Answer</summary>

It records only while it is open. If you open it later, you miss the request.

</details>

4. Where do you read the message a server sent back?

<details><summary>Answer</summary>

In the Network panel: click the request, then open the Response tab.

</details>

5. A tester writes the bug report "Saving a product does not work". Another writes "On New product with all fields empty, the request `products` is a `POST` and returns 422. The response lists a message for each field, but the page shows no message". Which report can a developer use at once? Why?

<details>
<summary>Answer</summary>

The second one. It gives the steps, the request, the status code and what was expected. The developer can see where to look: the page does not show the messages that the server sent. The first report says only that something is wrong, so the developer must find out the details alone.

</details>

6. You change the text of the Sign in button to "Pay now" in the Elements panel, then reload the page. What do you see? Would a test that runs after that see "Pay now"?

<details>
<summary>Answer</summary>

After the reload you see "Sign in" again. The Elements panel changes only the copy of the DOM in your tab. A reload builds the page again from the code. A test starts its own new browser, so it never sees your change.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **How do you slow down the network in Chrome DevTools, and why would a tester do it?**
   - Search for: `chrome devtools network throttling`
   - A good answer explains: the steps to choose a profile, and one bug that only a slow connection shows.
2. **What is a HAR file, and why can it be risky to share it?**
   - Search for: `HAR file network export`
   - A good answer explains: what a HAR file records, how you save one, and what private data it may hold.
3. **How can you test a page at the size of a phone with DevTools?**
   - Search for: `chrome devtools device mode`
   - A good answer explains: how to open device mode, what it can simulate, and one thing it cannot replace, such as a real phone.

## Next step

In the next lesson you learn what a request and a response contain, and what the status codes mean.
