"use client"

import { useCallback, useEffect, useState } from "react"
import { StatusBadge } from "@/components/status-badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useUser } from "@/components/user-context"
import { api, ApiError, formatMoney } from "@/lib/api"
import type { Order, OrderStatus } from "@/lib/types"

// The next steps an order can take from each status.
const NEXT_STEPS: Record<OrderStatus, { status: OrderStatus; label: string; testId: string }[]> = {
  pending: [
    { status: "paid", label: "Mark as paid", testId: "orders-mark-paid" },
    { status: "cancelled", label: "Cancel", testId: "orders-cancel" },
  ],
  paid: [
    { status: "shipped", label: "Mark as shipped", testId: "orders-mark-shipped" },
    { status: "cancelled", label: "Cancel", testId: "orders-cancel" },
  ],
  shipped: [],
  cancelled: [],
}

export default function OrdersPage() {
  const isAdmin = useUser().role === "admin"
  const [status, setStatus] = useState("all")
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    try {
      const data = await api<{ items: Order[] }>(`/api/orders?status=${status}`)
      setOrders(data.items)
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "The orders could not be loaded.")
    }
  }, [status])

  useEffect(() => {
    void load()
  }, [load])

  async function change(order: Order, next: OrderStatus) {
    setError("")
    try {
      await api(`/api/orders/${order.id}`, { method: "PATCH", body: { status: next } })
      await load()
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "The order could not be changed.")
    }
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight" data-testid="orders-title">Orders</h1>

      <div className="grid w-60 gap-2">
        <Label htmlFor="orders-status-filter">Status</Label>
        {/* A native <select>, so Playwright's selectOption works on it. */}
        <NativeSelect
          id="orders-status-filter"
          className="w-full"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          data-testid="orders-status-filter"
        >
          <NativeSelectOption value="all">All</NativeSelectOption>
          <NativeSelectOption value="pending">Pending</NativeSelectOption>
          <NativeSelectOption value="paid">Paid</NativeSelectOption>
          <NativeSelectOption value="shipped">Shipped</NativeSelectOption>
          <NativeSelectOption value="cancelled">Cancelled</NativeSelectOption>
        </NativeSelect>
      </div>

      {error && (
        <Alert variant="destructive" role="alert" data-testid="orders-error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {!orders && !error && (
        <p className="text-muted-foreground" data-testid="orders-loading">
          Loading…
        </p>
      )}

      {orders && (
        <>
          <Table aria-label="Orders" data-testid="orders-table">
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                {isAdmin && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} data-testid={`orders-row-${order.id}`}>
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.createdAt}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(order.total)}</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} data-testid={`orders-status-${order.id}`} />
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <div className="flex gap-2">
                        {NEXT_STEPS[order.status].map((step) => (
                          <Button
                            key={step.status}
                            variant="link"
                            size="sm"
                            className="underline"
                            type="button"
                            onClick={() => change(order, step.status)}
                            data-testid={`${step.testId}-${order.id}`}
                          >
                            {step.label}
                          </Button>
                        ))}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {orders.length === 0 && (
            <p className="py-5 text-center text-muted-foreground" data-testid="orders-empty">
              No orders with this status.
            </p>
          )}
          <p className="text-sm text-muted-foreground" data-testid="orders-count">
            {orders.length} {orders.length === 1 ? "order" : "orders"}
          </p>
        </>
      )}
    </>
  )
}
