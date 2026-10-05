// The "database" of the practice shop: plain arrays kept in memory.
//
// There is no real database on purpose, so the app runs on any machine with
// only Node installed. The data is created again every time the server starts,
// and tests can ask for a fresh copy with POST /api/test/reset.

import type { Order, Product, User } from "./types"

interface Store {
  users: User[]
  products: Product[]
  orders: Order[]
  /** Session token → user id. */
  sessions: Map<string, number>
  nextProductId: number
}

const PRODUCT_NAMES = [
  "Wireless Mouse", "Mechanical Keyboard", "USB-C Cable", "Laptop Stand",
  "Webcam HD", "Monitor 24 inch", "Desk Lamp", "Noise Cancelling Headphones",
  "Portable SSD 1TB", "HDMI Adapter", "Office Chair", "Standing Desk",
  "Notebook A5", "Whiteboard Markers", "Phone Charger", "Bluetooth Speaker",
  "Laptop Sleeve", "Ethernet Cable", "Power Strip", "Screen Cleaner",
  "Graphics Tablet", "Microphone", "Mouse Pad", "Docking Station",
]

const CUSTOMERS = [
  "Ana Torres", "Luis Méndez", "Carla Ruiz", "Pedro Gómez", "Sofía Díaz",
  "Marco León", "Elena Cruz", "Javier Soto", "Laura Vega", "Diego Ramos",
  "Paula Ortiz", "Andrés Peña",
]

function seed(): Store {
  const products: Product[] = PRODUCT_NAMES.map((name, index) => ({
    id: index + 1,
    name,
    sku: `SKU-${String(index + 1).padStart(4, "0")}`,
    price: 5 + ((index * 37) % 400) + 0.99,
    stock: (index * 7) % 60,
    status: index % 6 === 5 ? "archived" : index % 4 === 3 ? "draft" : "active",
  }))

  const statuses = ["pending", "paid", "shipped", "cancelled"] as const
  const orders: Order[] = CUSTOMERS.map((customer, index) => ({
    id: 1001 + index,
    customer,
    total: 20 + ((index * 53) % 300) + 0.5,
    status: statuses[index % statuses.length] ?? "pending",
    createdAt: `2026-09-${String(index + 1).padStart(2, "0")}`,
  }))

  return {
    users: [
      { id: 1, email: "admin@qa-shop.test", password: "Admin123!", name: "Ada Admin", role: "admin" },
      { id: 2, email: "viewer@qa-shop.test", password: "Viewer123!", name: "Victor Viewer", role: "viewer" },
    ],
    products,
    orders,
    sessions: new Map(),
    nextProductId: products.length + 1,
  }
}

// Next.js can load this file more than once (pages and API routes are built
// separately, and files reload when you edit them). Keeping the data on
// `globalThis` makes every copy share the same arrays.
const globalStore = globalThis as typeof globalThis & { __shopStore?: Store }

export function store(): Store {
  globalStore.__shopStore ??= seed()
  return globalStore.__shopStore
}

/** Puts the data back to its first state. Sessions are kept, so logged-in tests stay logged in. */
export function resetStore(): void {
  const sessions = globalStore.__shopStore?.sessions ?? new Map<string, number>()
  globalStore.__shopStore = { ...seed(), sessions }
}
