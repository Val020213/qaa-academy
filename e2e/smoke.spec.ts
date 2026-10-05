import { expect, test } from "./lib/test"

test.describe("smoke: the course site loads", () => {
  test("the home page shows the course modules", async ({ page }) => {
    await page.goto("/")

    await expect(page.getByTestId("home-title")).toBeVisible()
    await expect(page.getByTestId("home-module-card")).toHaveCount(7)
  })

  test("the top bar links to the course repository on GitHub", async ({ page }) => {
    await page.goto("/")

    await expect(page.getByTestId("topbar-github")).toHaveAttribute(
      "href",
      "https://github.com/Val020213/qaa-academy"
    )
  })

  test("a lesson opens from the side menu", async ({ page }) => {
    await page.goto("/")

    await page.getByTestId("sidebar-lesson-link").first().click()

    await expect(page).toHaveURL(/#\/lesson\//)
    await expect(page.getByTestId("lesson-title")).toBeVisible()
    await expect(page.getByTestId("lesson-content")).not.toBeEmpty()
  })

  test("a lesson marked as completed stays completed after a reload", async ({
    page,
  }) => {
    await page.goto("/")
    await page.getByTestId("sidebar-lesson-link").first().click()

    const toggle = page.getByTestId("lesson-complete-toggle")
    await toggle.click()
    await expect(toggle).toHaveAttribute("aria-pressed", "true")

    await page.reload()
    await expect(page.getByTestId("lesson-complete-toggle")).toHaveAttribute(
      "aria-pressed",
      "true"
    )
  })
})

test.describe("theme", () => {
  test("the site starts in the light theme", async ({ page }) => {
    await page.goto("/")

    await expect(page.locator("html")).toHaveAttribute("data-theme", "light")
  })

  test("the toggle switches to dark and the choice survives a reload", async ({
    page,
  }) => {
    await page.goto("/")

    await page.getByTestId("theme-toggle").click()
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark")

    await page.reload()
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark")
  })
})

test.describe("language", () => {
  test("the site starts in English", async ({ page }) => {
    await page.goto("/")

    await expect(page.locator("html")).toHaveAttribute("lang", "en")
    await expect(page.getByTestId("home-title")).toHaveText(
      "From manual QA to QA Automation"
    )
  })

  test("the toggle switches to Spanish and the choice survives a reload", async ({
    page,
  }) => {
    await page.goto("/")

    await page.getByTestId("locale-toggle").click()
    await expect(page.getByTestId("home-title")).toHaveText(
      "De QA manual a QA Automation"
    )

    await page.reload()
    await expect(page.locator("html")).toHaveAttribute("lang", "es")
    await expect(page.getByTestId("topbar-course")).toHaveText("Curso")
  })

  test("a lesson keeps its address when the language changes", async ({ page }) => {
    await page.goto("/#/lesson/01-programming/05-functions")
    await expect(page.getByTestId("lesson-title")).toHaveText("Functions")

    await page.getByTestId("locale-toggle").click()

    await expect(page).toHaveURL(/#\/lesson\/01-programming\/05-functions$/)
    await expect(page.getByTestId("lesson-title")).toHaveText("Funciones")
  })
})
