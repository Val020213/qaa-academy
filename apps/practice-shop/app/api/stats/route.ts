import { NextResponse } from "next/server"
import { currentUser, unauthorized } from "@/lib/session"
import { store } from "@/lib/store"

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function GET() {
  if (!(await currentUser())) return unauthorized()

  // Slow on purpose: a place to practise waiting the right way in tests.
  await wait(1200)

  const { products, orders } = store()
  return NextResponse.json({
    products: products.length,
    lowStock: products.filter((product) => product.stock < 5).length,
    pendingOrders: orders.filter((order) => order.status === "pending").length,
    revenue: orders
      .filter((order) => order.status === "paid" || order.status === "shipped")
      .reduce((sum, order) => sum + order.total, 0),
  })
}
