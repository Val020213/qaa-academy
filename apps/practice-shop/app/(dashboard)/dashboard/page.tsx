"use client"

import { useEffect, useState } from "react"
import { useUser } from "@/components/user-context"
import { api, formatMoney } from "@/lib/api"

interface Stats {
  products: number
  lowStock: number
  pendingOrders: number
  revenue: number
}

export default function DashboardPage() {
  const user = useUser()
  const [stats, setStats] = useState<Stats | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    api<Stats>("/api/stats")
      .then(setStats)
      .catch(() => setFailed(true))
  }, [])

  return (
    <>
      <h1 data-testid="dashboard-title">Dashboard</h1>
      <p className="muted" data-testid="dashboard-welcome">
        Welcome, {user.name}.
      </p>

      {failed && (
        <p className="alert alert-error" role="alert" data-testid="dashboard-error">
          The numbers could not be loaded.
        </p>
      )}
      {!stats && !failed && (
        <p className="muted" data-testid="dashboard-loading">
          Loading the numbers…
        </p>
      )}
      {stats && (
        <div className="stats" data-testid="dashboard-stats">
          <article className="card">
            <p className="muted">Products</p>
            <p className="stat" data-testid="stat-products">{stats.products}</p>
          </article>
          <article className="card">
            <p className="muted">Low stock</p>
            <p className="stat" data-testid="stat-low-stock">{stats.lowStock}</p>
          </article>
          <article className="card">
            <p className="muted">Pending orders</p>
            <p className="stat" data-testid="stat-pending-orders">{stats.pendingOrders}</p>
          </article>
          <article className="card">
            <p className="muted">Revenue</p>
            <p className="stat" data-testid="stat-revenue">{formatMoney(stats.revenue)}</p>
          </article>
        </div>
      )}
    </>
  )
}
