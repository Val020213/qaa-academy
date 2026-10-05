"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"
import { useUser } from "@/components/user-context"
import { api, ApiError, formatMoney } from "@/lib/api"
import type { Page, Product } from "@/lib/types"

export default function ProductsPage() {
  const isAdmin = useUser().role === "admin"

  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<Page<Product> | null>(null)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [toDelete, setToDelete] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    const params = new URLSearchParams({ q: search, status, page: String(page) })
    try {
      setResult(await api<Page<Product>>(`/api/products?${params}`))
      setError("")
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "The products could not be loaded.")
    }
  }, [search, status, page])

  useEffect(() => {
    void load()
  }, [load])

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      await api(`/api/products/${toDelete.id}`, { method: "DELETE" })
      setMessage(`“${toDelete.name}” was deleted.`)
      setToDelete(null)
      await load()
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "The product could not be deleted.")
      setToDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  const pageCount = result ? Math.max(1, Math.ceil(result.total / result.pageSize)) : 1

  return (
    <>
      <div className="page-head">
        <h1 data-testid="products-title">Products</h1>
        {isAdmin && (
          <Link className="button" href="/products/new" data-testid="products-new">
            New product
          </Link>
        )}
      </div>

      <div className="toolbar">
        <label>
          Search
          <input
            type="search"
            value={search}
            placeholder="Name or SKU"
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            data-testid="products-search"
          />
        </label>
        <label>
          Status
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value)
              setPage(1)
            }}
            data-testid="products-status-filter"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </label>
      </div>

      {message && (
        <p className="alert alert-ok" role="status" data-testid="products-message">
          {message}
        </p>
      )}
      {error && (
        <p className="alert alert-error" role="alert" data-testid="products-error">
          {error}
        </p>
      )}

      {!result && !error && (
        <p className="muted" data-testid="products-loading">
          Loading…
        </p>
      )}

      {result && (
        <>
          <table className="table" data-testid="products-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th className="number">Price</th>
                <th className="number">Stock</th>
                <th>Status</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {result.items.map((product) => (
                <tr key={product.id} data-testid={`products-row-${product.id}`}>
                  <td data-testid={`products-name-${product.id}`}>
                    <Link href={`/products/${product.id}`} data-testid={`products-view-${product.id}`}>
                      {product.name}
                    </Link>
                  </td>
                  <td>{product.sku}</td>
                  <td className="number">{formatMoney(product.price)}</td>
                  <td className="number">{product.stock}</td>
                  <td>
                    <span
                      className={`badge badge-${product.status}`}
                      data-testid={`products-status-${product.id}`}
                    >
                      {product.status}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="row-actions">
                      <Link href={`/products/${product.id}/edit`} data-testid={`products-edit-${product.id}`}>
                        Edit
                      </Link>
                      <button
                        className="link-button danger"
                        type="button"
                        onClick={() => setToDelete(product)}
                        data-testid={`products-delete-${product.id}`}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {result.items.length === 0 && (
            <p className="muted empty" data-testid="products-empty">
              No products match your search.
            </p>
          )}

          <div className="pagination">
            <span data-testid="products-count">
              {result.total} {result.total === 1 ? "product" : "products"}
            </span>
            <div className="actions">
              <button
                className="button button-secondary"
                type="button"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                data-testid="products-prev-page"
              >
                Previous
              </button>
              <span data-testid="products-page">
                Page {page} of {pageCount}
              </span>
              <button
                className="button button-secondary"
                type="button"
                onClick={() => setPage(page + 1)}
                disabled={page >= pageCount}
                data-testid="products-next-page"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {toDelete && (
        <ConfirmDeleteDialog
          name={toDelete.name}
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </>
  )
}
