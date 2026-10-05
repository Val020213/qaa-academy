import Link from "next/link"

export default function NotFound() {
  return (
    <main className="login-page">
      <section className="card login-card" data-testid="not-found">
        <h1>Page not found</h1>
        <p className="muted">There is nothing at this address.</p>
        <Link className="button" href="/dashboard">
          Back to the dashboard
        </Link>
      </section>
    </main>
  )
}
