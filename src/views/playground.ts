// Practice app: a small "application under test" with the patterns that
// appear most in end-to-end tests (forms, lists, filters and slow loading).
// Every interactive element has a data-testid that follows the team rule:
// "<feature>-<element>".

const VALID_EMAIL = "qa@example.com"
const VALID_PASSWORD = "Playwright123"

type CaseStatus = "pending" | "passed"
type CaseFilter = "all" | CaseStatus

interface TestCase {
  id: number
  title: string
  status: CaseStatus
}

export function renderPlayground(): string {
  return `
    <section class="page" data-testid="playground">
      <h1 data-testid="playground-title">Practice app</h1>
      <p class="lead">
        A small application to automate. The example specs are in
        <code>e2e/playground.spec.ts</code>. Run them with <code>pnpm e2e:ui</code>.
      </p>

      <section class="panel" data-testid="login">
        <h2>1. Login</h2>
        <p class="hint">Valid credentials: <code>${VALID_EMAIL}</code> / <code>${VALID_PASSWORD}</code></p>
        <form class="form" data-testid="login-form" novalidate>
          <label>Email
            <input type="email" name="email" autocomplete="off" data-testid="login-email" />
          </label>
          <label>Password
            <input type="password" name="password" data-testid="login-password" />
          </label>
          <button type="submit" class="button" data-testid="login-submit">Sign in</button>
        </form>
        <p class="message message-error" role="alert" data-testid="login-error" hidden></p>
        <div class="message message-ok" data-testid="login-welcome" hidden>
          <span></span>
          <button type="button" class="link-button" data-testid="login-logout">Sign out</button>
        </div>
      </section>

      <section class="panel" data-testid="cases">
        <h2>2. Test case list</h2>
        <form class="form form-inline" data-testid="cases-form">
          <label class="grow">New case
            <input type="text" name="title" autocomplete="off" data-testid="cases-input" />
          </label>
          <button type="submit" class="button" data-testid="cases-add">Add</button>
        </form>
        <label class="filter">Show
          <select data-testid="cases-filter">
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="passed">Passed</option>
          </select>
        </label>
        <ul class="cases" data-testid="cases-list"></ul>
        <p class="hint" data-testid="cases-empty">There are no cases yet.</p>
        <p class="counter" data-testid="cases-counter">0 of 0 passed</p>
      </section>

      <section class="panel" data-testid="report">
        <h2>3. Slow loading</h2>
        <p class="hint">The report takes about one and a half seconds to arrive, like a real API.</p>
        <button type="button" class="button" data-testid="report-load">Load report</button>
        <p class="message" data-testid="report-loading" hidden>Loading…</p>
        <p class="message message-ok" data-testid="report-result" hidden></p>
      </section>
    </section>`
}

/** Connects the HTML from `renderPlayground` to its behaviour. */
export function mountPlayground(root: HTMLElement): void {
  mountLogin(root)
  mountCases(root)
  mountReport(root)
}

/** Finds an element by its data-testid and fails with a clear message if it is missing. */
function byTestId<T extends HTMLElement>(root: HTMLElement, testId: string): T {
  const element = root.querySelector<T>(`[data-testid="${testId}"]`)
  if (!element) throw new Error(`data-testid="${testId}" was not found`)
  return element
}

function mountLogin(root: HTMLElement): void {
  const form = byTestId<HTMLFormElement>(root, "login-form")
  const email = byTestId<HTMLInputElement>(root, "login-email")
  const password = byTestId<HTMLInputElement>(root, "login-password")
  const error = byTestId(root, "login-error")
  const welcome = byTestId(root, "login-welcome")
  const logout = byTestId(root, "login-logout")

  const showError = (message: string) => {
    error.textContent = message
    error.hidden = false
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault()
    error.hidden = true

    if (!email.value.trim() || !password.value) {
      showError("Enter your email and password.")
      return
    }
    if (email.value.trim() !== VALID_EMAIL || password.value !== VALID_PASSWORD) {
      showError("Wrong email or password.")
      return
    }

    welcome.querySelector("span")!.textContent = `Signed in as ${VALID_EMAIL}.`
    welcome.hidden = false
    form.hidden = true
  })

  logout.addEventListener("click", () => {
    form.reset()
    form.hidden = false
    welcome.hidden = true
  })
}

function mountCases(root: HTMLElement): void {
  const form = byTestId<HTMLFormElement>(root, "cases-form")
  const input = byTestId<HTMLInputElement>(root, "cases-input")
  const filter = byTestId<HTMLSelectElement>(root, "cases-filter")
  const list = byTestId<HTMLUListElement>(root, "cases-list")
  const empty = byTestId(root, "cases-empty")
  const counter = byTestId(root, "cases-counter")

  let cases: TestCase[] = []
  let nextId = 1

  const paint = () => {
    const selected = filter.value as CaseFilter
    const visible = cases.filter(
      (testCase) => selected === "all" || testCase.status === selected
    )

    list.replaceChildren(
      ...visible.map((testCase) => {
        const item = document.createElement("li")
        item.dataset.testid = "cases-item"
        item.dataset.status = testCase.status

        const checkbox = document.createElement("input")
        checkbox.type = "checkbox"
        checkbox.checked = testCase.status === "passed"
        checkbox.dataset.testid = `cases-toggle-${testCase.id}`
        checkbox.addEventListener("change", () => {
          testCase.status = checkbox.checked ? "passed" : "pending"
          paint()
        })

        const label = document.createElement("label")
        const title = document.createElement("span")
        title.textContent = testCase.title
        title.dataset.testid = "cases-item-title"
        label.append(checkbox, title)

        const remove = document.createElement("button")
        remove.type = "button"
        remove.className = "link-button"
        remove.textContent = "Delete"
        remove.dataset.testid = `cases-delete-${testCase.id}`
        remove.addEventListener("click", () => {
          cases = cases.filter((other) => other.id !== testCase.id)
          paint()
        })

        item.append(label, remove)
        return item
      })
    )

    const passed = cases.filter((testCase) => testCase.status === "passed").length
    counter.textContent = `${passed} of ${cases.length} passed`
    empty.hidden = visible.length > 0
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault()
    const title = input.value.trim()
    if (!title) return

    cases.push({ id: nextId, title, status: "pending" })
    nextId += 1
    input.value = ""
    paint()
  })

  filter.addEventListener("change", paint)
  paint()
}

function mountReport(root: HTMLElement): void {
  const button = byTestId<HTMLButtonElement>(root, "report-load")
  const loading = byTestId(root, "report-loading")
  const result = byTestId(root, "report-result")

  const wait = (ms: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, ms))

  button.addEventListener("click", async () => {
    button.disabled = true
    result.hidden = true
    loading.hidden = false

    await wait(1500)

    loading.hidden = true
    result.textContent = "Report ready: 12 tests, 11 passed, 1 failed."
    result.hidden = false
    button.disabled = false
  })
}
