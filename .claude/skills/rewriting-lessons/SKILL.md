---
name: rewriting-lessons
description: Use when writing, rewriting, trimming or reviewing a lesson of the QAA Academy course (files under content/en and content/es), or when briefing a subagent to do so. Encodes the course owner's feedback on tone, what a lesson must not contain, which sections are optional, how to keep English and Spanish in sync, how to add screenshots, and the checks to run before reporting. Use it even for a one-paragraph change to a lesson.
---

# Rewriting lessons

## Overview

The owner's standard for lesson text, collected from their review of module 0 on 2026-10-06. Core principle: **a lesson says what the learner needs in order to do the next thing, once, plainly, and nothing else.** When in doubt, cut. The owner removed far more than they added, and never asked for anything to be put back.

Quotes below are the owner's words.

## The learner

A manual QA tester who works in a software team. They know what a program, a database, a repository, a bug, a login, a version and a test case are. They have not written code or used a terminal. They may not be a native speaker of the lesson's language, so sentences are short and plain.

"the learners know what is a program, know what is db and are software related, but not with direct programming things."

## Rules

1. **No brief wording in the lesson.** A phrase from the instructions given to the writer must never appear in the text. The summary once said "cómo estudiar para aprender de verdad", an echo of "the course should teach deeply". Lessons do not talk about how deep or hard they are.
2. **No puzzle or challenge without a reason.** "not all the lesson should have a challenge, someone just can start with the lesson or a storytelling, avoid challenging without any reason". A lesson opens with a short work story, or goes straight in. No "write your answer before you read on".
3. **Do not explain what they know.** No definition of a program, a repository, a path. No gloss of everyday work words: bug, login, dashboard, script. Explain only what is new to this reader.
4. **Each idea once.** "i see some redundant ideas across the same lesson". If a point is made in the body, it is not made again in a "go deeper" subsection, in the practice and in a question.
5. **No analogy per concept.** "avoid put real life examples to all, that looks really weird to read, you don't need to explain every word that you said". Default to no everyday analogy. Varied, playful examples belong in programming exercises (module 1), not in explanations.
6. **Nothing early.** A topic that a later module teaches does not appear before it: DRY, CI, PATH lookup, debugging method were all removed from module 0. "in this welcome module this should not go yet".
7. **Questions match what the learner knows.** "the questions are good but maybe there is not the place, we are starting now". In orientation lessons keep zero to two questions that the learner can answer from what they just did. Whether later modules keep more is the owner's call: ask before rewriting module 1 onward.
8. **No experiment for its own sake.** A hands-on step stays only if the learner needs its result. Prediction prompts ("what do you expect?") are out by default.
9. **No shallow definition.** If a term cannot be explained correctly in a sentence or two, leave it out. "CI is a server that runs your tests" was rejected: "es más que eso".
10. **Avoid words that mean something else to the reader.** "prompt" was removed from the terminal lesson as confusing. Describe the thing instead of naming it.
11. **Facts are checked.** The owner caught two wrong claims (Playwright "is written in TypeScript"; "every project uses the same pnpm version"). Do not add a technical claim you have not verified against the repository, a run, or the tool's documentation. When a claim was only partly verified, say so in the report.
12. **Plain is not the same as toy.** Cutting scaffolding must not leave a hand-wave where a real explanation belongs. The owner called "Node.js follows your instructions one by one..." "un poco de juguete" and asked for the real picture: how code gets from text to execution in general (compiler and interpreter, parsing into a tree, checking, execution), then what Node.js does specifically. These readers work in software; give them the actual mechanism, in simple words, general first and then the tool.
13. **Name the real actor.** "The computer reads it as two separate parts" was called out as lacking rigour, and so was using "the computer" all over a lesson. Say which thing does it, with the term the learner already has from lesson 01 of module 1 (parsing, the syntax tree, type checking, execution):
    - reading the text, grammar, what counts as one expression, comments being dropped: the **parser** (Spanish: *el analizador*), or "Node.js parses...";
    - what a piece of code evaluates to, the order of evaluation, operator precedence, truthy and falsy: **JavaScript** (the rules of the language), stated as a rule: "`===` binds tighter than `||`, so the expression is parsed as `(day === "Saturday") || "Sunday"`";
    - running statements one after another, stopping at an error, printing: **Node.js**;
    - type errors, red underlines, `pnpm typecheck`: the **type checker** (*el verificador de tipos*), never Node.js;
    - "your computer" stays when it means the machine itself: installing a tool, a folder on disk, `localhost`.
    Give the mechanism, not only the name: say *why* the result is what it is (precedence, short-circuit, the value an expression produces).
14. **Screenshots where the learner can get lost.** A step that says "click X, top right" on a site, or the first look at a tool, gets a screenshot.

## Shape of a lesson

Frontmatter: `title` and `duration`. `summary` is optional and module 0 does not use it. Set `duration` honestly after trimming.

Section names the site gives an icon to, when the section exists: `## Goal` / `## Objetivo`, `## Go deeper` / `## Profundiza`, `## Practice` / `## Práctica`, `## Think it through` / `## Piénsalo bien`, `## Research on your own` / `## Investiga por tu cuenta`, `## Next step` / `## Siguiente paso`. Every paragraph sits under a `##` heading.

- Goal: one or two sentences on what they will have at the end, then three or four bullets that match the content.
- Practice: one short task that uses what the lesson taught. Not a numbered replay of the lesson.
- Puzzle, Challenge, Go deeper, Think it through, Research: all optional. Module 0 has no puzzle, challenge or research section.
- After removing a section, fix what pointed at it: goal bullets, "as you saw in...", "you will see it in lesson N", questions whose answer needed it.

## Lessons that teach code

Module 0 is orientation and was cut hard. A lesson that teaches programming keeps its teaching content, its code examples and its exercises; what goes is the scaffolding around them. Module 1 was rewritten to this shape:

1. `## Goal`: one or two plain sentences, then three or four bullets that match the content.
2. The teaching sections with their code and outputs. Cut definitions of what the learner knows, analogies in prose (a playful subject may stay as the *subject* of example code: a dog, a recipe, a playlist), repeated points, "what do you expect?" prompts, and previews of later lessons.
3. `## Go deeper`: optional, at most two subsections, each teaching something about this lesson's own topic that the body did not say.
4. `## Practice`: kept. It uses the lesson's exercise file.
5. `## Challenge`: kept, trimmed to the task, the file to create, at most four acceptance criteria and the search-hints line.
6. `## Think it through`: at most three questions, of the kind where the learner predicts what code prints, finds a bug, or says what breaks. No "explain it to a colleague" and no "there is no single answer" questions.
7. `## Next step`.

No opening puzzle and no research section. What a puzzle taught moves into the body as plain explanation, with its code block unchanged.

Rules for the code itself when a subagent rewrites a lesson: a code block, command, output sample or error message that survives stays character for character; a block may be deleted with its passage or moved, never edited; nothing new is added. A subagent that thinks a sample is wrong reports it with evidence and does not fix it. The lead may add code, after running it and pasting the real output.

Assume everything taught in the lessons before, and do not re-explain it. When one agent per lesson works in parallel, tell each one that the others exist and that it edits only its own two files.

## Prose

Write as an experienced colleague would speak to a new teammate. Short sentences, but let some connect: a run of four-word sentences reads as mechanical. No rhetorical question followed by its answer, no "Think of..." openers, no closing line that restates the paragraph. Spanish is neutral Latin American Spanish written directly, not a translation of the English.

## English and Spanish

`content/en` and `content/es` hold the same lesson under the same file name. Same sections in the same order, same number of questions, same table rows, and identical text inside every code fence and every pair of backticks. The owner reads the Spanish; rewrite it first, then mirror it into English.

Commands, outputs, version numbers, URLs and file names that survive a rewrite stay character for character.

## Delegating

The owner wants Claude to lead and review, and a Sonnet subagent (or Codex for running things) to do the writing. Use one agent per lesson that writes Spanish and then mirrors English; two agents drift apart.

The brief must contain: the two file paths and "edit nothing else, never `.scratch/`, do not commit"; who the learner is; the owner's quotes above; the already-rewritten lessons of module 0 as the model to read first; the target section list for this lesson, decided by you; what to delete; what must stay character for character; the sync rule; the checks below.

Do not put a text search in the brief that matches ordinary words. A check for the analogy word "taller" made an agent replace "installer" with "setup file" throughout a lesson.

## Screenshots and clips

The owner has said it is allowed to record clips and to use GitHub Codespaces to record or generate any content a lesson needs: screenshots, screen recordings, command output. Do it without asking again when it makes an explanation clearer. What still needs the owner: anything that deletes data in their accounts, and real Windows captures.

Put the file in `public/images/` and write `![Caption](/images/name.png)` on its own line; the text becomes the caption. Clips work the same way from `public/clips/`.

- A screen recording: a headless Playwright script in `scripts/clips/` that writes a `.webm` to `public/clips/` (see the scripts already there). Prefer headless; if a real display is needed, never use the owner's main screen.
- An editor hover or a type error as the learner sees it: the TypeScript Playground in headless Playwright gives a real capture of the same editor VS Code uses.
- A public web page: headless Playwright, outline the element with a red ring, crop to the region that matters.
- A page that needs a login, or VS Code: the Claude in Chrome extension in the owner's browser. A GitHub Codespace with PowerShell installed gives a real VS Code terminal; use a neutral prompt (`function prompt { 'PS> ' }`) for close-ups, because its paths are Linux paths and the lessons teach Windows.
- This machine is Linux. Real Windows screenshots have to come from the owner.
- Say in the caption when a screenshot differs from what the learner will see. Crop out account details.
- Never delete things in the owner's accounts; stop the Codespace and give them the link.

## Diagrams

The owner asked for Excalidraw-style drawings to explain flows and processes. Use one when a lesson describes a sequence of stages, a branch, or who talks to whom, and prose alone makes the reader hold the picture in their head: how code gets from text to execution, a request and its response, the steps of a test run. Do not draw what a three-item list already shows.

- Diagrams are generated, not drawn by hand: `scripts/diagrams/lib.mjs` wraps Rough.js (the look of Excalidraw) and gives `box`, `arrow`, `note`, `label` and `save`. Copy `scripts/diagrams/code-to-execution.mjs` as a starting point and run it with `node scripts/diagrams/<name>.mjs`.
- One SVG per language, written to `public/images/<name>.en.svg` and `<name>.es.svg`; each lesson links its own. All the text of a diagram lives in the `TEXT` object at the top of its script.
- Keep it to one idea: five to seven boxes, a short title and one or two short lines in each. Red notes mark where something goes wrong. A dashed outline marks something outside the main flow.
- The background is white so the drawing reads in the light and the dark theme.
- Render the SVG and look at it before placing it (clipped edges and overlapping text are the usual faults), then write a caption that says what the drawing shows.
- A diagram states facts too: everything in it must be true and must match the text beside it.

## Illustrations

A drawing that makes a rule stick, like the camel for camelCase, is welcome where it helps the reader remember; the owner asked for them. Two ways to make one:

- Drawn by script, like the diagrams: exact, small, and regenerated with one command. This is the default, and the only choice when the picture carries code or labels.
- Generated by Codex with its built-in image tool, when the picture is a character or a scene that a script draws badly. Keep all words out of the generated picture and put them in the caption, because generated text is not reliable and cannot be translated. Shrink the PNG before adding it, and look at it yourself first.

One illustration per idea, and only where the idea is hard to remember without it.

## Before reporting

1. Read both rewritten files yourself. A subagent's report is not a review.
2. Code fences in sync:
   `diff <(awk '/^```/{f=!f} f' content/es/<path>) <(awk '/^```/{f=!f} f' content/en/<path>)`
3. No new commands: compare the fenced lines against `git show HEAD:content/es/<path>`.
4. `pnpm build` and `pnpm e2e e2e/smoke.spec.ts`.
5. For a visual change, look at the page in a screenshot.
6. Do not commit unless asked. Report what was removed, what was kept and why, and anything not verified.
