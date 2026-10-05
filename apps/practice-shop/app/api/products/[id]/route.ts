import { NextResponse } from "next/server"
import { currentUser, forbidden, unauthorized } from "@/lib/session"
import { store } from "@/lib/store"
import { validateProduct } from "@/lib/validation"

type Context = { params: Promise<{ id: string }> }

const notFound = () =>
  NextResponse.json({ message: "Product not found." }, { status: 404 })

export async function GET(_request: Request, { params }: Context) {
  if (!(await currentUser())) return unauthorized()

  const id = Number((await params).id)
  const product = store().products.find((item) => item.id === id)
  return product ? NextResponse.json(product) : notFound()
}

export async function PUT(request: Request, { params }: Context) {
  const user = await currentUser()
  if (!user) return unauthorized()
  if (user.role !== "admin") return forbidden()

  const id = Number((await params).id)
  const product = store().products.find((item) => item.id === id)
  if (!product) return notFound()

  const checked = validateProduct(await request.json().catch(() => ({})), id)
  if (!checked.ok) {
    return NextResponse.json({ errors: checked.errors }, { status: 422 })
  }

  Object.assign(product, checked.value)
  return NextResponse.json(product)
}

export async function DELETE(_request: Request, { params }: Context) {
  const user = await currentUser()
  if (!user) return unauthorized()
  if (user.role !== "admin") return forbidden()

  const id = Number((await params).id)
  const data = store()
  if (!data.products.some((item) => item.id === id)) return notFound()

  data.products = data.products.filter((item) => item.id !== id)
  return new NextResponse(null, { status: 204 })
}
