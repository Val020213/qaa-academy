import { NextResponse } from "next/server"
import { currentUser, unauthorized } from "@/lib/session"
import { store } from "@/lib/store"

// GET /api/orders?status=pending
export async function GET(request: Request) {
  if (!(await currentUser())) return unauthorized()

  const status = new URL(request.url).searchParams.get("status") ?? "all"
  const items = store().orders.filter(
    (order) => status === "all" || order.status === status
  )
  return NextResponse.json({ items, total: items.length })
}
