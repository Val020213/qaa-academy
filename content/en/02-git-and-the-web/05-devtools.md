---
title: Browser DevTools
summary: Use the Elements, Console and Network panels of Chrome or Edge to look inside a page and investigate a bug.
duration: 30 min
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

## Next step

In the next lesson you learn what a request and a response contain, and what the status codes mean.
