// Prepare data through the API, which is faster and steadier than the UI.
// Use the UI only for the thing the test is really about.
//
// The "request" fixture and "page.request" both carry the cookies of the
// saved admin session, so these helpers work as admin by default.
import type { APIRequestContext } from "../test"
import { expect } from "../test"
import { uniqueName, uniqueSku } from "../helpers"

export const ADMIN = { email: "admin@qa-shop.test", password: "Admin123!", name: "Ada Admin" }
export const VIEWER = { email: "viewer@qa-shop.test", password: "Viewer123!", name: "Victor Viewer" }

export interface Product {
  id: number
  name: string
  sku: string
  price: number
  stock: number
  status: "active" | "draft" | "archived"
}

/** Signs in through the API. The session cookie stays in the request context. */
export async function loginViaApi(
  request: APIRequestContext,
  user: { email: string; password: string }
): Promise<void> {
  const response = await request.post("/api/auth/login", {
    data: { email: user.email, password: user.password },
  })
  expect(response.ok()).toBeTruthy()
}

/** Creates a product with a generated name and SKU. Pass overrides to change any field. */
export async function createProduct(
  request: APIRequestContext,
  overrides: Partial<Omit<Product, "id">> = {}
): Promise<Product> {
  const response = await request.post("/api/products", {
    data: {
      name: uniqueName("Product"),
      sku: uniqueSku(),
      price: 19.99,
      stock: 10,
      status: "active",
      ...overrides,
    },
  })
  expect(response.status()).toBe(201)
  return (await response.json()) as Product
}

export async function deleteProduct(request: APIRequestContext, id: number): Promise<void> {
  const response = await request.delete(`/api/products/${id}`)
  expect(response.status()).toBe(204)
}
