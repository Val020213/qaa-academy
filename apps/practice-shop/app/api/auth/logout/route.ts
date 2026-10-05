import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { deleteSession, SESSION_COOKIE } from "@/lib/session"

export async function POST() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  if (token) deleteSession(token)

  const response = NextResponse.json({ ok: true })
  response.cookies.delete(SESSION_COOKIE)
  return response
}
