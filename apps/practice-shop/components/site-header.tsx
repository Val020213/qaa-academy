"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { useUser } from "./user-context"

const LINKS = [
  { href: "/dashboard", label: "Dashboard", testId: "nav-dashboard" },
  { href: "/products", label: "Products", testId: "nav-products" },
  { href: "/orders", label: "Orders", testId: "nav-orders" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const user = useUser()

  async function logout() {
    await api("/api/auth/logout", { method: "POST" })
    window.location.assign("/login")
  }

  return (
    <header
      className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b px-6 py-2"
      data-testid="site-header"
    >
      <Button asChild variant="link" className="px-0 text-base font-bold">
        <Link href="/dashboard">QA Shop</Link>
      </Button>
      {/* aria-label makes this landmark different from the other <nav> on a page */}
      <nav aria-label="Main" className="flex flex-1 gap-1">
        {LINKS.map((link) => {
          const active = pathname.startsWith(link.href)
          return (
            <Button
              key={link.href}
              asChild
              variant={active ? "secondary" : "ghost"}
              className={active ? "font-semibold" : "text-muted-foreground"}
            >
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                data-testid={link.testId}
              >
                {link.label}
              </Link>
            </Button>
          )
        })}
      </nav>
      <div className="flex items-center gap-3 text-sm">
        <span data-testid="user-name">{user.name}</span>
        <Badge variant="secondary" data-testid="user-role">
          {user.role}
        </Badge>
        <Button variant="outline" size="sm" type="button" onClick={logout} data-testid="logout-button">
          Sign out
        </Button>
      </div>
    </header>
  )
}
