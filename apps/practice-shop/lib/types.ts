export type Role = "admin" | "viewer"

export interface User {
  id: number
  email: string
  password: string
  name: string
  role: Role
}

export type ProductStatus = "active" | "draft" | "archived"

export interface Product {
  id: number
  name: string
  sku: string
  price: number
  stock: number
  status: ProductStatus
}

export type OrderStatus = "pending" | "paid" | "shipped" | "cancelled"

export interface Order {
  id: number
  customer: string
  total: number
  status: OrderStatus
  createdAt: string
}

/** What the API returns for a list with pages. */
export interface Page<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

/** Field name → error message. */
export type FieldErrors = Record<string, string>
