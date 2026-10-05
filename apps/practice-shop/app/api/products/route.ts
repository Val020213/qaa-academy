import { NextResponse } from "next/server"
import { currentUser, forbidden, unauthorized } from "@/lib/session"
import { store } from "@/lib/store"
import type { Page, Product } from "@/lib/types"
import { validateProduct } from "@/lib/validation"

const PAGE_SIZE = 10

// GET /api/products?q=mouse&status=active&page=2
export async function GET(request: Request) {
  if (!(await currentUser())) return unauthorized()

  const params = new URL(request.url).searchParams
  const query = (params.get("q") ?? "").trim().toLowerCase()
  const status = params.get("status") ?? "all"
  const page = Math.max(1, Number(params.get("page")) || 1)

  const matching = store()
    .products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query)
    )
    .filter((product) => status === "all" || product.status === status)
    // Newest first, so a product you just created is at the top.
    .sort((a, b) => b.id - a.id)

  const result: Page<Product> = {
    items: matching.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    total: matching.length,
    page,
    pageSize: PAGE_SIZE,
  }
  return NextResponse.json(result)
}

export async function POST(request: Request) {
  const user = await currentUser()
  if (!user) return unauthorized()
  if (user.role !== "admin") return forbidden()

  const checked = validateProduct(await request.json().catch(() => ({})))
  if (!checked.ok) {
    return NextResponse.json({ errors: checked.errors }, { status: 422 })
  }

  const data = store()
  const product: Product = { id: data.nextProductId, ...checked.value }
  data.nextProductId += 1
  data.products.push(product)
  return NextResponse.json(product, { status: 201 })
}
