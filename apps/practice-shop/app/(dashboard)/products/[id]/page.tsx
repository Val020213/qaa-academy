import { notFound } from "next/navigation"
import { ProductForm } from "@/components/product-form"
import { store } from "@/lib/store"

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const id = Number((await params).id)
  const product = store().products.find((item) => item.id === id)
  if (!product) notFound()

  return (
    <>
      <h1 data-testid="product-form-title">Edit product</h1>
      {/* A copy, so the form receives plain data and not the stored object. */}
      <ProductForm product={{ ...product }} />
    </>
  )
}
