import { store } from "./store"
import type { FieldErrors, Product, ProductStatus } from "./types"

const STATUSES: ProductStatus[] = ["active", "draft", "archived"]

export type ProductInput = Omit<Product, "id">

/**
 * Checks the data of a product form.
 * Returns the clean values, or one message per wrong field.
 */
export function validateProduct(
  body: unknown,
  currentId?: number
): { ok: true; value: ProductInput } | { ok: false; errors: FieldErrors } {
  const data = (body ?? {}) as Record<string, unknown>
  const errors: FieldErrors = {}

  const name = String(data.name ?? "").trim()
  if (name.length < 3) errors.name = "Name must have at least 3 characters."

  const sku = String(data.sku ?? "").trim().toUpperCase()
  if (!/^SKU-\d{4}$/.test(sku)) {
    errors.sku = "SKU must look like SKU-0001."
  } else if (
    store().products.some((product) => product.sku === sku && product.id !== currentId)
  ) {
    errors.sku = "This SKU is already used by another product."
  }

  const price = Number(data.price)
  if (data.price === "" || !Number.isFinite(price) || price <= 0) {
    errors.price = "Price must be greater than 0."
  }

  const stock = Number(data.stock)
  if (data.stock === "" || !Number.isInteger(stock) || stock < 0) {
    errors.stock = "Stock must be a whole number, 0 or more."
  }

  const status = String(data.status ?? "") as ProductStatus
  if (!STATUSES.includes(status)) errors.status = "Choose a status."

  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return { ok: true, value: { name, sku, price, stock, status } }
}
