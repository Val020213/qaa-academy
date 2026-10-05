# Module 3 exercises: Playwright basics

Each lesson in module 3 (lessons 01 to 04 and 07) has one exercise file here.
The Practice app is at http://localhost:5180/#/practice.

## How an exercise works

1. Open the exercise file, for example `02-locators.spec.ts`.
2. Every test starts as `test.fixme(...)`. Playwright skips it and reports it as skipped.
3. Change `test.fixme` to `test`. Write the steps from the numbered comments.
4. Run only that file:

```bash
pnpm e2e e2e/exercises/03-playwright/02-locators.spec.ts
```

5. Make the test pass. Then do the next one.

Try first. Do not open `solutions/` until you have tried every test.
When you are done, or really stuck, compare your code with the file
that has the same name in `solutions/`. Your code can be different and still correct.

## Rules

- Import `test` and `expect` from `../../lib/test`, never from `@playwright/test`.
- Select elements with `page.getByTestId(...)` unless the exercise says otherwise.
- Do not use `page.waitForTimeout`. Use assertions that wait.
- Every test must work alone. The Practice app starts empty on every page load.

The files in `solutions/` run with the normal `pnpm e2e` command.
