"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { Role } from "@/lib/types"

export interface PublicUser {
  name: string
  email: string
  role: Role
}

const UserContext = createContext<PublicUser | null>(null)

export function UserProvider({ user, children }: { user: PublicUser; children: ReactNode }) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>
}

/** The logged-in user. Only works inside the dashboard pages. */
export function useUser(): PublicUser {
  const user = useContext(UserContext)
  if (!user) throw new Error("useUser must be used inside <UserProvider>")
  return user
}
