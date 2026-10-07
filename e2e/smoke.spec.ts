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

test.describe("on this page", () => {
  test("a lesson lists its sections and a click scrolls to one", async ({ page }) => {
    await page.goto("/#/lesson/01-programming/05-functions")

    const links = page.getByTestId("lesson-toc-link")
    await expect(links.filter({ hasText: "Goal" })).toHaveCount(1)
    await expect(links.first()).toHaveAttribute("aria-current", "true")

    await links.filter({ hasText: "Practice" }).click()

    await expect(page.locator("#section-1")).not.toBeInViewport()
    await expect(links.filter({ hasText: "Practice" })).toHaveAttribute(
      "aria-current",
      "true"
    )
  })
})

test.describe("clips", () => {
  test("a lesson shows its screen recording with a caption", async ({ page }) => {
    await page.goto("/#/lesson/03-playwright/04-assertions-that-wait")

    const video = page.locator("figure.clip video").first()
    await expect(video).toHaveAttribute("src", "/clips/auto-wait-report.webm")
    await expect(page.locator("figure.clip figcaption").first()).not.toBeEmpty()

    // The file really loads: the browser knows how long the clip is.
    await expect
      .poll(() => video.evaluate((element: HTMLVideoElement) => element.duration))
      .toBeGreaterThan(1)
  })
})

test.describe("lesson media", () => {
  test("a screenshot opens in the viewer and Escape restores focus", async ({ page }) => {
    await page.goto("/#/lesson/00-get-started/04-your-first-project")
    const image = page.getByTestId("lesson-image").first()
    const src = await image.getAttribute("src")
    await image.click()

    const viewer = page.getByTestId("media-viewer")
    await expect(viewer).toBeVisible()
    await expect(page.getByTestId("media-viewer-image")).toHaveAttribute("src", new RegExp(`${src}$`))
    await expect(page.getByTestId("media-viewer-close")).toBeFocused()
    await page.keyboard.press("Tab")
    await expect(page.locator("#media-caption")).toBeFocused()
    await page.keyboard.press("Tab")
    await expect(page.getByTestId("media-viewer-close")).toBeFocused()
    await page.keyboard.press("Shift+Tab")
    await expect(page.locator("#media-caption")).toBeFocused()
    await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe("hidden")

    await page.keyboard.press("Escape")
    await expect(viewer).not.toBeVisible()
    await expect(image).toBeFocused()
    await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe("")
  })

  test("a screenshot opens with Enter or Space and closes with the localized button", async ({ page }) => {
    await page.goto("/#/lesson/00-get-started/04-your-first-project")
    await page.getByTestId("locale-toggle").click()
    const image = page.getByTestId("lesson-image").first()
    await expect(image).toHaveAccessibleName(/^Ampliar imagen: /)
    await expect(image).toHaveRole("button")

    for (const key of ["Enter", "Space"]) {
      await image.focus()
      await image.press(key)
      await expect(page.getByTestId("media-viewer")).toBeVisible()
      const close = page.getByTestId("media-viewer-close")
      await expect(close).toHaveAccessibleName("Cerrar")
      await close.click()
      await expect(page.getByTestId("media-viewer")).not.toBeVisible()
      await expect(image).toBeFocused()
    }
  })

  test("the backdrop closes the viewer but the enlarged image does not", async ({ page }) => {
    await page.goto("/#/lesson/00-get-started/04-your-first-project")
    const image = page.getByTestId("lesson-image").first()
    await image.click()
    await page.getByTestId("media-viewer-image").click()
    await expect(page.getByTestId("media-viewer")).toBeVisible()
    await page.getByTestId("media-viewer").click({ position: { x: 2, y: 2 } })
    await expect(page.getByTestId("media-viewer")).not.toBeVisible()
    await expect(image).toBeFocused()
  })

  test("a clip has an accessible full-screen control in both languages", async ({ page }) => {
    await page.goto("/#/lesson/03-playwright/04-assertions-that-wait")
    const button = page.getByTestId("clip-fullscreen").first()
    await expect(button).toBeVisible()
    await expect(button).toHaveAccessibleName("View video full screen")
    await page.getByTestId("locale-toggle").click()
    await expect(button).toHaveAccessibleName("Ver video en pantalla completa")
  })

  test("a browser that disables fullscreen keeps the native clip controls", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(document, "fullscreenEnabled", { value: false })
    })
    await page.goto("/#/lesson/03-playwright/04-assertions-that-wait")
    await expect(page.locator("figure.clip video").first()).toHaveAttribute("controls", "")
    await expect(page.getByTestId("clip-fullscreen")).toHaveCount(0)
    await expect(page.locator("figure.clip figcaption").first()).not.toBeEmpty()
  })
})
