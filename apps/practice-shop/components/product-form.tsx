"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import { api, ApiError } from "@/lib/api"
import type { FieldErrors, Product } from "@/lib/types"

/** The same form creates a product (no `product`) and edits one (with `product`). */
export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter()
  const [values, setValues] = useState({
    name: product?.name ?? "",
    sku: product?.sku ?? "",
    price: product ? String(product.price) : "",
    stock: product ? String(product.stock) : "",
    status: product?.status ?? "draft",
  })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState("")
  const [saving, setSaving] = useState(false)

  const set = (field: keyof typeof values) => (
    event: { target: { value: string } }
  ) => setValues({ ...values, [field]: event.target.value })

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setErrors({})
    setFormError("")

    try {
      await api(product ? `/api/products/${product.id}` : "/api/products", {
        method: product ? "PUT" : "POST",
        body: values,
      })
      router.push("/products")
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 422) {
        setErrors(caught.fieldErrors)
      } else {
        setFormError(caught instanceof ApiError ? caught.message : "The product could not be saved.")
      }
      setSaving(false)
    }
  }

  const fieldError = (field: string) =>
    errors[field] && (
      <span className="field-error" data-testid={`product-${field}-error`}>
        {errors[field]}
      </span>
    )

  return (
    <form className="form card" onSubmit={submit} noValidate data-testid="product-form">
      <label>
        Name
        <input value={values.name} onChange={set("name")} data-testid="product-name" />
        {fieldError("name")}
      </label>
      <label>
        SKU
        <input value={values.sku} onChange={set("sku")} placeholder="SKU-0001" data-testid="product-sku" />
        {fieldError("sku")}
      </label>
      <label>
        Price
        <input value={values.price} onChange={set("price")} inputMode="decimal" data-testid="product-price" />
        {fieldError("price")}
      </label>
      <label>
        Stock
        <input value={values.stock} onChange={set("stock")} inputMode="numeric" data-testid="product-stock" />
        {fieldError("stock")}
      </label>
      <label>
        Status
        <select value={values.status} onChange={set("status")} data-testid="product-status">
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
        {fieldError("status")}
      </label>

      {formError && (
        <p className="alert alert-error" role="alert" data-testid="product-form-error">
          {formError}
        </p>
      )}

      <div className="actions">
        <Link className="button button-secondary" href="/products" data-testid="product-cancel">
          Cancel
        </Link>
        <button className="button" type="submit" disabled={saving} data-testid="product-save">
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  )
}
