# QAA Academy

**Read the course online: https://qaa-academy.vercel.app**

A course to go from manual QA to QA Automation. You first learn to program with TypeScript, then you write end-to-end tests with Playwright. The course is a static site, and the same site is the application you learn to automate.

## Requirements

- Windows 10 or 11 (macOS and Linux also work)
- Node.js 24 or newer
- pnpm
- Git

The lesson "Install the tools" explains each install step.

## Start

Fork this repository on GitHub, so you have your own copy to work in. Then clone your fork:

```bash
git clone https://github.com/<your-user>/qaa-academy.git qaa
cd qaa
pnpm install
pnpm dev
```

Open http://localhost:5180 and start with module 0.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Starts the course site on port 5180. |
| `pnpm build` | Checks types and builds the site into `dist/`. |
| `pnpm typecheck` | Checks types in the site, the specs and the exercises. |
| `node exercises/01-programming/<file>.ts` | Runs an exercise and shows what is still failing. |
| `pnpm exec playwright install chromium` | Downloads the browser Playwright uses. Run it once. |
| `pnpm e2e` | Runs the Playwright specs. It starts the site if it is not running. |
| `pnpm e2e:ui` | Opens Playwright's UI mode. |
| `pnpm e2e:headed` | Runs the specs with the browser visible. |
| `pnpm e2e:report` | Opens the last HTML report. |
| `pnpm shop:dev` | Starts the practice shop on http://localhost:5190 (module 5). |
| `pnpm shop:e2e` | Runs the practice shop's own Playwright suite. |
| `pnpm shop:e2e:ui` | The same suite in UI mode. |

If another application uses port 5180, set `QAA_E2E_PORT` to another port before `pnpm e2e`.

## Folders

```
content/      Lessons in Markdown
  en/           English (the full course), one folder per module
  es/           Spanish translation, same folders and file names
exercises/    TypeScript exercises that check themselves
e2e/          Playwright specs against this site
  lib/test.ts   `test` and `expect`; specs import from here
  exercises/    Module 3 exercises (`test.fixme`) and their solutions
src/          The code of the site
  modules.ts    The course map: modules and planned lessons
  content.ts    Loads the Markdown and turns it into HTML
  progress.ts   Completed lessons (localStorage)
  i18n.ts       Languages: site texts in English and Spanish
  theme.ts      Light and dark theme
  main.ts       Entry point and hash navigation
  views/        Home, lesson, side menu and Practice app
apps/
  practice-shop/  QA Shop back office: a Next.js app with its own e2e/ suite (module 5)
```

## Add a lesson

1. Create `content/en/<module>/<nn>-<topic>.md` with this header:

   ```text
   ---
   title: Short title
   summary: One sentence that sums up the lesson.
   duration: 20 min
   ---
   ```

2. Use the sections `## Goal`, the explanation sections, `## Practice`, `## Check what you know` and `## Next step`.
3. If the lesson was in the `planned` list of its module in `src/modules.ts`, remove it from that list.

The order inside a module comes from the number at the start of the file name.

## Languages

The site is in English and Spanish. The button in the top bar switches between them, and the choice is saved in the browser.

- Site texts are in `src/i18n.ts`; module names are in `src/modules.ts`.
- A Spanish lesson is a file in `content/es/` with the same folder and file name as the English one. A lesson with no Spanish file is shown in English.
- Code blocks, commands and the texts of the two practice apps are the same in both languages. The Practice app and the QA Shop stay in English because the tests check their texts.
- The exercise files in `exercises/` and `e2e/exercises/` have their instructions in English only.
