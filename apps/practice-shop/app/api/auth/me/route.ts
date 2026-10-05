import { NextResponse } from "next/server"
import { currentUser, unauthorized } from "@/lib/session"

export async function GET() {
  const user = await currentUser()
  if (!user) return unauthorized()
  return NextResponse.json({ name: user.name, email: user.email, role: user.role })
}
