import { NextResponse } from "next/server"
import { currentUser, forbidden, unauthorized } from "@/lib/session"
import { store } from "@/lib/store"
import type { OrderStatus } from "@/lib/types"

// The only moves the business allows. A shipped or cancelled order is final.
const ALLOWED: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "cancelled"],
  paid: ["shipped", "cancelled"],
  shipped: [],
  cancelled: [],
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await currentUser()
  if (!user) return unauthorized()
  if (user.role !== "admin") return forbidden()

  const id = Number((await params).id)
  const order = store().orders.find((item) => item.id === id)
  if (!order) {
    return NextResponse.json({ message: "Order not found." }, { status: 404 })
  }

  const body = (await request.json().catch(() => ({}))) as { status?: OrderStatus }
  if (!body.status || !ALLOWED[order.status].includes(body.status)) {
    return NextResponse.json(
      { message: `An order that is ${order.status} cannot become ${body.status}.` },
      { status: 409 }
    )
  }

  order.status = body.status
  return NextResponse.json(order)
}
