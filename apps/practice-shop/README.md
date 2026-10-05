# QA Shop back office

A small Next.js app made for practising end-to-end tests. It is built like the back-office projects of the team: a login, pages only for logged-in users, lists with search and filters, forms with validation, and an API.

It has no database. The data lives in memory and is created again each time the server starts, so it runs on any machine with only Node installed.

## Run it

From the root of the repository:

```bash
pnpm shop:dev
```

Open http://localhost:5190.

| User | Email | Password | Can do |
| --- | --- | --- | --- |
| Admin | `admin@qa-shop.test` | `Admin123!` | Everything |
| Viewer | `viewer@qa-shop.test` | `Viewer123!` | Read only: no create, edit or delete |

## What is inside

| Page | What to test there |
| --- | --- |
| `/login` | Wrong password, empty form, redirect back to the page you asked for |
| `/dashboard` | Numbers that arrive late (the API waits 1.2 seconds on purpose) |
| `/products` | Search, status filter, pages of 10, create, edit, delete with a confirm dialog |
| `/products/<id>` | The detail page of one product: its data, Edit and Delete for the admin, a 404 for an unknown id |
| `/orders` | Status filter and status changes that only go forward |

## Run the tests

```bash
pnpm shop:e2e        # all specs
pnpm shop:e2e:ui     # Playwright UI mode
```

`e2e/README.md` explains how the suite is organised. `e2e/COVERAGE.md` lists what is tested and what is still missing.

## For tests only

`POST /api/test/reset` puts the data back to its first state. The suite calls it once before each run.

## Folders

```
app/            Pages and API routes (Next.js App Router)
  (dashboard)/    Pages that need a login
  api/            The API
components/     Shared pieces: header, product form, confirm dialog
lib/            Data store, session, validation, types
e2e/            The Playwright suite
proxy.ts        Runs before each page request
```
