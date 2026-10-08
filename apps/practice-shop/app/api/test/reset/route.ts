import { NextResponse } from "next/server"
import { resetStore } from "@/lib/store"

// Restores the seed products and orders; keeps existing sessions.
// In production it answers 404 unless ENABLE_TEST_API is a nonempty string.
export async function POST() {
  if (process.env.NODE_ENV === "production" && !process.env.ENABLE_TEST_API) {
    return new NextResponse(null, { status: 404 })
  }
  resetStore()
  return NextResponse.json({ ok: true })
}
