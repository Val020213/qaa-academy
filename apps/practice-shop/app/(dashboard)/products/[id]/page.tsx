import { notFound } from "next/navigation"
import { ProductDetail } from "@/components/product-detail"
import { store } from "@/lib/store"

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const id = Number((await params).id)
  const product = store().products.find((item) => item.id === id)
  if (!product) notFound()

  // A copy, so the component receives plain data and not the stored object.
  return <ProductDetail product={{ ...product }} />
}
