import { ProductForm } from "@/components/product-form"

export default function NewProductPage() {
  return (
    <>
      <h1 className="mb-4 text-2xl font-semibold tracking-tight" data-testid="product-form-title">New product</h1>
      <ProductForm />
    </>
  )
}
