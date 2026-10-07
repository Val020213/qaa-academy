---
title: Browser DevTools
duration: 60 min
---

## Goal

In this lesson you use DevTools to investigate a bug in the browser. You compare a page's elements, messages and requests with what you expected to see.

- Inspect and change an element in the Elements panel.
- Run JavaScript and read errors in the Console.
- Read a request, its status and its response in Network.
- Choose a panel based on the symptom and save evidence for a bug report.

## Open DevTools

**DevTools** are built into the browser. This lesson uses the Elements, Console and Network panels in Chrome and Edge.

Open them using one of these options:

- Press `F12`.
- Press `Ctrl + Shift + I`.
- Right-click an element on the page and choose **Inspect**.

DevTools open on the side or at the bottom of the window. At the top there is a row of tabs, called **panels**. If a panel is missing, click `>>` to see more.

## The Elements panel

The **Elements** panel shows the DOM as a tree. You can open and close elements with the small arrows.

The **element picker** is the arrow icon at the top left of DevTools. Click it, then click an element on the page. DevTools selects that element in the tree. You can also press `Ctrl + Shift + C`.

Watch how DevTools finds the email input and shows its `data-testid`.

![DevTools Elements finds the email input and shows its data-testid attribute. The clip uses port 5186; in practice you will use 5180.](/clips/devtools-elements.webm)

When you select an element, check:

- Its attributes, such as `data-testid`.
- Its parent and its children.
- The **Styles** pane on the right, which shows the element's CSS.

You can double-click an attribute or text and change it. The change exists only in your tab's DOM: it does not change the server's files or a teammate's page. When you press `F5`, the browser rebuilds the DOM and your edit disappears.

Use an edit to try a longer text in the layout. To check the full flow, create that data through the form: an Elements edit skips the form and the server's rules.

## The Console panel

The **Console** shows messages from the page. Errors are red and warnings are yellow. An error line usually includes the file name and line number on the right.

You can also type JavaScript next to the `>` sign and press `Enter`. The browser runs the code and the Console displays the result below.

On the course's Practice page at `http://localhost:5180/#/practice`, with no cases added:

```text
> document.title
'QAA Academy'

> document.querySelectorAll("input").length
3
```

The three fields are Email, Password and New case. If you add a case in section 2 and run the second line again, you get 4. Each row adds a checkbox, which is also an `input`.

A Console with no errors does not prove that the page is correct. The code can run without failing and display the wrong number. Compare the result with the requirement and, if it comes from the server, with the response in Network.

## The Network panel

When a page loads a file or asks a server for data, the browser sends a **request**. The **Network** panel shows one row per request. Loading a page can involve separate requests for the document, scripts, styles and data.

1. Open the Network panel **before** the action you want to study. DevTools records requests while it is open and recording is active, even if you switch panels.
2. Do the action on the page, such as clicking a button.
3. Review the requests in the list.

The main columns are:

- **Name**: the end of the address.
- **Status**: the result code. `200` means success. A number from 400 up means a problem.
- **Type**: for example `document`, `script` or `fetch`.
- **Time**: how long the request took.

To see the data calls, click the **Fetch/XHR** filter. Then click a request to see its details:

- **Headers**: the address, the method, the status and extra information.
- **Payload**: the data the page sent. It appears for requests that send data.
- **Response**: the data the server sent back.

Without **Preserve log**, the list is cleared when a new document loads, and the request you wanted is gone. Turn it on before signing in to keep the request and its response after navigation.

## Investigate a bug with DevTools

Choose the panel based on the symptom. If a page does not respond to an action, check the Console. If it shows wrong data, look at Network and compare the Response with the screen. For a layout problem, check Elements.

1. Reproduce the problem with DevTools open and the Network panel ready.
2. Read any errors in the **Console**.
3. In **Network**, check the status and **Response** of the request related to the action.
4. In **Elements**, check that the element exists, is visible and has the expected attributes.
5. Note the steps, request address, status code and message for the bug report.

## Go deeper

### Copy a request

Right-click a request in the Network panel, choose **Copy**, then **Copy as cURL**. You get a command that repeats the request and that you can attach to a bug report.

A copied request can include the session cookie. In the shop it contains a token that allows access to your session. Remove it before you paste it into a ticket that many people read.

### Simulate a slow connection

In the Network panel, choose a throttling profile such as **Slow 4G**. You can observe how long a request takes and whether the "Loading..." text stays on screen while it waits.

## Practice

1. Open `http://localhost:5180/#/practice` with no cases added. Press `F12`.
2. Click the element picker and select the **Load report** button. Read its `data-testid` in the Elements panel.
3. Open the Console. Run `document.title`. Then run `document.querySelectorAll("input").length`. The result is 3.
4. Add one case in section 2 and run the count again. Check that the new element is a checkbox.
5. Run `nonexistentThing` in the Console. Read the red error.
6. In a second terminal, start the practice shop:

```bash
pnpm shop:dev
```

7. Open `http://localhost:5190` in a new tab. Open DevTools and the **Network** panel. Turn on **Preserve log**.
8. Type the email `admin@qa-shop.test` and a wrong password. Click **Sign in**.
9. Find the `login` request in Network. Read its **Status** and **Response**. Compare the response with the red error message on the page.
10. Stop the shop with `Ctrl + C` in its terminal when you finish.

## Challenge

Write a Playwright test that opens the Practice page or a lesson page, records every browser request and reports what it saw. The test must fail when a request cannot complete because of a transport failure. An HTTP response such as 404 or 500 does not trigger `requestfailed`.

Create the file `e2e/challenges/devtools-network.spec.ts`. Import `test` and `expect` from `../lib/test`. Do not use `waitForTimeout`.

It is done when:

1. You run `pnpm e2e e2e/challenges/devtools-network.spec.ts` and the test passes.
2. The test prints one line for each request type with its count, for example `script: 12`, and one line with the total.
3. The list contains a `document` request because you started listening before the page loaded.
4. You add a line that makes the page call an address where nothing is listening. The test fails with a message that names that address. Then you remove the line.

Search for: `playwright page.on request resourceType`, `playwright requestfailed event` and, for criterion 4, `playwright page.evaluate fetch`.

## Think it through

1. The Practice page has no cases. You run `document.querySelectorAll("input").length` and get 3. You add two cases and run it again. What do you get, and why?

<details>
<summary>Answer</summary>

You get 5. Each row adds a checkbox, which is an `input` element. The three original fields are still there.

</details>

2. You know the shop has 24 products, but the dashboard shows "Products 0". The Console is clean. The Network panel shows the request `stats` with status `200`, and its Response says `"products": 24`. Where is the bug, and why did you not see a red error?

<details>
<summary>Answer</summary>

The server sent the right number, so check the page code that displays it. That code can produce the wrong result without throwing an error that appears in the Console.

</details>

3. You turn off **Preserve log**. You sign in to the shop with a correct password. The page moves to `/dashboard`. What evidence do you lose in the Network panel?

<details>
<summary>Answer</summary>

The `login` request, its status and its response disappear from the list when the shop loads the new page.

</details>

## Next step

In the next lesson you learn what a request and a response contain, and what the status codes mean.
