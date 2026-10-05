"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { api, ApiError, formatMoney } from "@/lib/api"
import type { Product } from "@/lib/types"
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
      <p className="breadcrumb">
        <Link href="/products" data-testid="product-detail-back">
          ← Back to products
        </Link>
      </p>

      <div className="page-head">
        <h1 data-testid="product-detail-title">{product.name}</h1>
        {isAdmin && (
          <div className="actions">
            <Link
              className="button button-secondary"
              href={`/products/${product.id}/edit`}
              data-testid="product-detail-edit"
            >
              Edit
            </Link>
            <button
              className="button button-danger"
              type="button"
              onClick={() => setConfirming(true)}
              data-testid="product-detail-delete"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="alert alert-error" role="alert" data-testid="product-detail-error">
          {error}
        </p>
      )}

      <dl className="card details" data-testid="product-detail">
        <div>
          <dt>SKU</dt>
          <dd data-testid="product-detail-sku">{product.sku}</dd>
        </div>
        <div>
          <dt>Price</dt>
          <dd data-testid="product-detail-price">{formatMoney(product.price)}</dd>
        </div>
        <div>
          <dt>Stock</dt>
          <dd data-testid="product-detail-stock">{product.stock}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>
            <span className={`badge badge-${product.status}`} data-testid="product-detail-status">
              {product.status}
            </span>
          </dd>
        </div>
      </dl>

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
