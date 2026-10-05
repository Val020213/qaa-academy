"use client"

import { useCallback, useEffect, useState } from "react"
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
      <h1 data-testid="orders-title">Orders</h1>

      <div className="toolbar">
        <label>
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            data-testid="orders-status-filter"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="shipped">Shipped</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
      </div>

      {error && (
        <p className="alert alert-error" role="alert" data-testid="orders-error">
          {error}
        </p>
      )}
      {!orders && !error && (
        <p className="muted" data-testid="orders-loading">
          Loading…
        </p>
      )}

      {orders && (
        <>
          <table className="table" data-testid="orders-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th className="number">Total</th>
                <th>Status</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} data-testid={`orders-row-${order.id}`}>
                  <td>#{order.id}</td>
                  <td>{order.customer}</td>
                  <td>{order.createdAt}</td>
                  <td className="number">{formatMoney(order.total)}</td>
                  <td>
                    <span className={`badge badge-${order.status}`} data-testid={`orders-status-${order.id}`}>
                      {order.status}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="row-actions">
                      {NEXT_STEPS[order.status].map((step) => (
                        <button
                          key={step.status}
                          className="link-button"
                          type="button"
                          onClick={() => change(order, step.status)}
                          data-testid={`${step.testId}-${order.id}`}
                        >
                          {step.label}
                        </button>
                      ))}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <p className="muted empty" data-testid="orders-empty">
              No orders with this status.
            </p>
          )}
          <p className="muted" data-testid="orders-count">
            {orders.length} {orders.length === 1 ? "order" : "orders"}
          </p>
        </>
      )}
    </>
  )
}
