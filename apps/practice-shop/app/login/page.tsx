import { redirect } from "next/navigation"
import { currentUser } from "@/lib/session"
import { LoginForm } from "./login-form"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  if (await currentUser()) redirect("/dashboard")

  const next = (await searchParams).next
  // Only go back to a path inside this site, never to another website.
  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard"

  return (
    <main className="login-page">
      <section className="card login-card" data-testid="login-card">
        <h1>QA Shop</h1>
        <p className="muted">Sign in to the back office.</p>
        <LoginForm next={safeNext} />
        <p className="hint" data-testid="login-hint">
          Admin: <code>admin@qa-shop.test</code> / <code>Admin123!</code>
          <br />
          Viewer: <code>viewer@qa-shop.test</code> / <code>Viewer123!</code>
        </p>
      </section>
    </main>
  )
}
