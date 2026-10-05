import { NextResponse } from "next/server"
import { createSession, SESSION_COOKIE } from "@/lib/session"
import { store } from "@/lib/store"

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    email?: string
    password?: string
  }
  const email = String(body.email ?? "").trim().toLowerCase()
  const password = String(body.password ?? "")

  const user = store().users.find(
    (candidate) => candidate.email === email && candidate.password === password
  )
  if (!user) {
    return NextResponse.json(
      { message: "Wrong email or password." },
      { status: 401 }
    )
  }

  const response = NextResponse.json({
    name: user.name,
    email: user.email,
    role: user.role,
  })
  response.cookies.set(SESSION_COOKIE, createSession(user), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  })
  return response
}
