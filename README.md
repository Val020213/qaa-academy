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
src/          The course site: a React app built with shadcn/ui components
  main.tsx, App.tsx   Entry point and hash navigation
  pages/        Home, lesson, Practice app, not found
  practice/     The three panels of the Practice app
  components/   Top bar, side menu, "On this page" list; ui/ holds the shadcn components
  lib/          Lesson loading, languages, theme, progress, icons
  typeset.css   shadcn/typeset: the base style of lesson text
public/clips/ Short screen recordings shown inside lessons
scripts/clips/  The scripts that record those clips (see its README)
apps/
  practice-shop/  QA Shop back office: a Next.js app with its own e2e/ suite (module 5)
```

## Add a lesson

1. Create `content/en/<module>/<nn>-<topic>.md` with this header:

   ```text
   ---
   title: Short title
   summary: One sentence that sums up the lesson. Optional.
   duration: 20 min
   ---
   ```

2. Use these sections, in this order: `## Goal`, the explanation sections, `## Go deeper`, `## Practice`, `## Think it through`, `## Research on your own` and `## Next step`. Leave out the two question sections when the learner does not yet know enough for them, as in the welcome lesson. Two more sections are optional, for lessons where they fit: `## Start with a puzzle` before the goal (with a `### Back to the puzzle` in the explanation), and `## Challenge` after the practice. A lesson can also open with a short story, or go straight into the subject.
3. If the lesson was in the `planned` list of its module in `src/modules.ts`, remove it from that list.

The order inside a module comes from the number at the start of the file name.

To show a screen recording in a lesson, put the file in `public/clips/` and write `![What the clip shows](/clips/name.webm)` on its own line. A screenshot works the same way: put it in `public/images/` and write `![What it shows](/images/name.png)`.

For a small inline tool logo, put the SVG in `public/icons/` and write `![](/icons/typescript.svg) TypeScript` next to the tool name. Logos are decorative and have no caption. Lesson images open in a viewer by click, Enter or Space. Clips have a full-screen button when the browser supports it.

## Languages

The site is in English and Spanish. The button in the top bar switches between them, and the choice is saved in the browser.

- Site texts are in `src/i18n.ts`; module names are in `src/modules.ts`.
- A Spanish lesson is a file in `content/es/` with the same folder and file name as the English one. A lesson with no Spanish file is shown in English.
- Code blocks, commands and the texts of the two practice apps are the same in both languages. The Practice app and the QA Shop stay in English because the tests check their texts.
- The exercise files in `exercises/` and `e2e/exercises/` have their instructions in English only.
