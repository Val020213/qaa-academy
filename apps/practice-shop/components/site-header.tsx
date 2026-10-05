"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
    <header className="site-header" data-testid="site-header">
      <Link href="/dashboard" className="brand">
        QA Shop
      </Link>
      <nav>
        {LINKS.map((link) => {
          const active = pathname.startsWith(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              className={active ? "active" : undefined}
              aria-current={active ? "page" : undefined}
              data-testid={link.testId}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>
      <div className="user">
        <span data-testid="user-name">{user.name}</span>
        <span className="badge" data-testid="user-role">
          {user.role}
        </span>
        <button className="link-button" type="button" onClick={logout} data-testid="logout-button">
          Sign out
        </button>
      </div>
    </header>
  )
}
