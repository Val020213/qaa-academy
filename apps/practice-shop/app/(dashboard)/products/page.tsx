"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"
import { StatusBadge } from "@/components/status-badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight" data-testid="products-title">Products</h1>
        {isAdmin && (
          <Button asChild>
            <Link href="/products/new" data-testid="products-new">
              New product
            </Link>
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="grid w-60 gap-2">
          <Label htmlFor="products-search">Search</Label>
          <Input
            id="products-search"
            type="search"
            value={search}
            placeholder="Name or SKU"
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            data-testid="products-search"
          />
        </div>
        <div className="grid w-60 gap-2">
          <Label htmlFor="products-status-filter">Status</Label>
          {/* A native <select>, so Playwright's selectOption works on it. */}
          <NativeSelect
            id="products-status-filter"
            className="w-full"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value)
              setPage(1)
            }}
            data-testid="products-status-filter"
          >
            <NativeSelectOption value="all">All</NativeSelectOption>
            <NativeSelectOption value="active">Active</NativeSelectOption>
            <NativeSelectOption value="draft">Draft</NativeSelectOption>
            <NativeSelectOption value="archived">Archived</NativeSelectOption>
          </NativeSelect>
        </div>
      </div>

      {message && (
        <Alert variant="success" role="status" data-testid="products-message">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive" role="alert" data-testid="products-error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!result && !error && (
        <p className="text-muted-foreground" data-testid="products-loading">
          Loading…
        </p>
      )}

      {result && (
        <>
          <Table aria-label="Products" data-testid="products-table">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Status</TableHead>
                {isAdmin && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((product) => (
                <TableRow key={product.id} data-testid={`products-row-${product.id}`}>
                  <TableCell data-testid={`products-name-${product.id}`}>
                    <Button asChild variant="link" className="h-auto p-0 underline">
                      <Link href={`/products/${product.id}`} data-testid={`products-view-${product.id}`}>
                        {product.name}
                      </Link>
                    </Button>
                  </TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(product.price)}</TableCell>
                  <TableCell className="text-right tabular-nums">{product.stock}</TableCell>
                  <TableCell>
                    <StatusBadge status={product.status} data-testid={`products-status-${product.id}`} />
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <div className="flex gap-2">
                        <Button asChild variant="link" size="sm" className="underline">
                          <Link href={`/products/${product.id}/edit`} data-testid={`products-edit-${product.id}`}>
                            Edit
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          type="button"
                          onClick={() => setToDelete(product)}
                          data-testid={`products-delete-${product.id}`}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {result.items.length === 0 && (
            <p className="py-5 text-center text-muted-foreground" data-testid="products-empty">
              No products match your search.
            </p>
          )}

          <div className="flex items-center justify-between text-sm">
            <span data-testid="products-count">
              {result.total} {result.total === 1 ? "product" : "products"}
            </span>
            <nav aria-label="Pagination" className="flex items-center gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                data-testid="products-prev-page"
              >
                Previous
              </Button>
              <span data-testid="products-page">
                Page {page} of {pageCount}
              </span>
              <Button
                variant="outline"
                type="button"
                onClick={() => setPage(page + 1)}
                disabled={page >= pageCount}
                data-testid="products-next-page"
              >
                Next
              </Button>
            </nav>
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
