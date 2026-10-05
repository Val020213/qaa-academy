import { headers } from "next/headers"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"
import { SiteHeader } from "@/components/site-header"
import { UserProvider } from "@/components/user-context"
import { currentUser } from "@/lib/session"

// Every page inside the (dashboard) folder needs a logged-in user.
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await currentUser()
  if (!user) {
    const path = (await headers()).get("x-pathname") ?? "/dashboard"
    redirect(`/login?next=${encodeURIComponent(path)}`)
  }

  const publicUser = { name: user.name, email: user.email, role: user.role }
  return (
    <UserProvider user={publicUser}>
      <SiteHeader />
      <main className="content" data-testid="content">
        {children}
      </main>
    </UserProvider>
  )
}
