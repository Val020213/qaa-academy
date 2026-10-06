"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight" data-testid="dashboard-title">Dashboard</h1>
        <p className="text-muted-foreground" data-testid="dashboard-welcome">
          Welcome, {user.name}.
        </p>
      </div>

      {failed && (
        <Alert variant="destructive" role="alert" data-testid="dashboard-error">
          <AlertDescription>The numbers could not be loaded.</AlertDescription>
        </Alert>
      )}
      {!stats && !failed && (
        <p className="text-muted-foreground" data-testid="dashboard-loading">
          Loading the numbers…
        </p>
      )}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="dashboard-stats">
          <Card>
            <CardHeader>
              <CardDescription>Products</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tabular-nums" data-testid="stat-products">{stats.products}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Low stock</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tabular-nums" data-testid="stat-low-stock">{stats.lowStock}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Pending orders</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tabular-nums" data-testid="stat-pending-orders">{stats.pendingOrders}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tabular-nums" data-testid="stat-revenue">{formatMoney(stats.revenue)}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
