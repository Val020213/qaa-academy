import type { Locator, Page } from "../test"

// Page Object for the products list. It knows WHERE things are and HOW to
// click them. It never asserts: the specs decide what is correct.
export class ProductsPage {
  readonly page: Page
  readonly table: Locator
  readonly rows: Locator
  readonly searchInput: Locator
  readonly statusFilter: Locator
  readonly count: Locator
  readonly message: Locator
  readonly newButton: Locator
  readonly confirmDialog: Locator
  readonly confirmDeleteButton: Locator
  readonly cancelDeleteButton: Locator

  constructor(page: Page) {
    this.page = page
    this.table = page.getByTestId("products-table")
    this.rows = page.getByTestId(/^products-row-/)
    this.searchInput = page.getByTestId("products-search")
    this.statusFilter = page.getByTestId("products-status-filter")
    this.count = page.getByTestId("products-count")
    this.message = page.getByTestId("products-message")
    this.newButton = page.getByTestId("products-new")
    this.confirmDialog = page.getByTestId("confirm-delete-dialog")
    this.confirmDeleteButton = page.getByTestId("confirm-delete-button")
    this.cancelDeleteButton = page.getByTestId("confirm-delete-cancel")
  }

  async goto() {
    await this.page.goto("/products")
  }

  async search(text: string) {
    await this.searchInput.fill(text)
  }

  async filterByStatus(status: "all" | "active" | "draft" | "archived") {
    await this.statusFilter.selectOption(status)
  }

  row(id: number): Locator {
    return this.page.getByTestId(`products-row-${id}`)
  }

  rowByName(name: string): Locator {
    return this.rows.filter({ hasText: name })
  }

  /** Opens the confirm dialog, but does not confirm. */
  async openDeleteDialog(id: number) {
    await this.page.getByTestId(`products-delete-${id}`).click()
  }

  /** Deletes a product: row button, then the shared confirm button. */
  async delete(id: number) {
    await this.openDeleteDialog(id)
    await this.confirmDeleteButton.click()
  }
}
