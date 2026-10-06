"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { api, ApiError, formatMoney } from "@/lib/api"
import type { Product } from "@/lib/types"
import { StatusBadge } from "@/components/status-badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ConfirmDeleteDialog } from "./confirm-delete-dialog"
import { useUser } from "./user-context"

/** The read-only page of one product. Only an admin sees Edit and Delete. */
export function ProductDetail({ product }: { product: Product }) {
  const router = useRouter()
  const isAdmin = useUser().role === "admin"
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")

  async function confirmDelete() {
    setDeleting(true)
    try {
      await api(`/api/products/${product.id}`, { method: "DELETE" })
      router.push("/products")
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "The product could not be deleted.")
      setConfirming(false)
      setDeleting(false)
    }
  }

  return (
    <>
      <p className="text-sm">
        <Button asChild variant="link" className="h-auto p-0 underline">
          <Link href="/products" data-testid="product-detail-back">
            ← Back to products
          </Link>
        </Button>
      </p>

      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight" data-testid="product-detail-title">
          {product.name}
        </h1>
        {isAdmin && (
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/products/${product.id}/edit`} data-testid="product-detail-edit">
                Edit
              </Link>
            </Button>
            <Button
              variant="destructive"
              type="button"
              onClick={() => setConfirming(true)}
              data-testid="product-detail-delete"
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive" role="alert" data-testid="product-detail-error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent>
          <dl className="grid gap-5 sm:grid-cols-4" data-testid="product-detail">
            <div>
              <dt className="text-xs tracking-wide text-muted-foreground uppercase">SKU</dt>
              <dd className="mt-1 font-semibold" data-testid="product-detail-sku">{product.sku}</dd>
            </div>
            <div>
              <dt className="text-xs tracking-wide text-muted-foreground uppercase">Price</dt>
              <dd className="mt-1 font-semibold" data-testid="product-detail-price">{formatMoney(product.price)}</dd>
            </div>
            <div>
              <dt className="text-xs tracking-wide text-muted-foreground uppercase">Stock</dt>
              <dd className="mt-1 font-semibold" data-testid="product-detail-stock">{product.stock}</dd>
            </div>
            <div>
              <dt className="text-xs tracking-wide text-muted-foreground uppercase">Status</dt>
              <dd className="mt-1">
                <StatusBadge status={product.status} data-testid="product-detail-status" />
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {confirming && (
        <ConfirmDeleteDialog
          name={product.name}
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  )
}
