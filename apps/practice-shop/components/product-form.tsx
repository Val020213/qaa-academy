"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
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

  // The error text under a field. The input points to it with aria-describedby,
  // so a screen reader reads the error together with the field.
  const fieldError = (field: string) =>
    errors[field] && (
      <p id={`product-${field}-error`} className="text-sm text-destructive" data-testid={`product-${field}-error`}>
        {errors[field]}
      </p>
    )
  // The two accessibility attributes every input needs when it has an error.
  const errorProps = (field: string) => ({
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? `product-${field}-error` : undefined,
  })

  return (
    <Card className="max-w-lg">
      <CardContent>
        <form className="grid gap-4" onSubmit={submit} noValidate data-testid="product-form">
          <div className="grid gap-2">
            <Label htmlFor="product-name">Name</Label>
            <Input id="product-name" value={values.name} onChange={set("name")} {...errorProps("name")} data-testid="product-name" />
            {fieldError("name")}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="product-sku">SKU</Label>
            <Input
              id="product-sku"
              value={values.sku}
              onChange={set("sku")}
              placeholder="SKU-0001"
              {...errorProps("sku")}
              data-testid="product-sku"
            />
            {fieldError("sku")}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="product-price">Price</Label>
            <Input
              id="product-price"
              value={values.price}
              onChange={set("price")}
              inputMode="decimal"
              {...errorProps("price")}
              data-testid="product-price"
            />
            {fieldError("price")}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="product-stock">Stock</Label>
            <Input
              id="product-stock"
              value={values.stock}
              onChange={set("stock")}
              inputMode="numeric"
              {...errorProps("stock")}
              data-testid="product-stock"
            />
            {fieldError("stock")}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="product-status">Status</Label>
            {/* A native <select>, so Playwright's selectOption works on it. */}
            <NativeSelect
              id="product-status"
              className="w-full"
              value={values.status}
              onChange={set("status")}
              {...errorProps("status")}
              data-testid="product-status"
            >
              <NativeSelectOption value="draft">Draft</NativeSelectOption>
              <NativeSelectOption value="active">Active</NativeSelectOption>
              <NativeSelectOption value="archived">Archived</NativeSelectOption>
            </NativeSelect>
            {fieldError("status")}
          </div>

          {formError && (
            <Alert variant="destructive" role="alert" data-testid="product-form-error">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button asChild variant="outline">
              <Link href="/products" data-testid="product-cancel">
                Cancel
              </Link>
            </Button>
            <Button type="submit" disabled={saving} data-testid="product-save">
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
