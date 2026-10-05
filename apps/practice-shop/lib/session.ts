import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { store } from "./store"
import type { User } from "./types"

export const SESSION_COOKIE = "shop_session"

/** The logged-in user, or undefined when there is no valid session cookie. */
export async function currentUser(): Promise<User | undefined> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  if (!token) return undefined

  const userId = store().sessions.get(token)
  return store().users.find((user) => user.id === userId)
}

export function createSession(user: User): string {
  const token = crypto.randomUUID()
  store().sessions.set(token, user.id)
  return token
}

export function deleteSession(token: string): void {
  store().sessions.delete(token)
}

export const unauthorized = () =>
  NextResponse.json({ message: "You must sign in." }, { status: 401 })

export const forbidden = () =>
  NextResponse.json(
    { message: "Your role does not allow this action." },
    { status: 403 }
  )
