import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
    <main className="grid min-h-screen place-items-center p-6">
      <Card className="w-full max-w-sm" data-testid="login-card">
        <CardHeader>
          <CardTitle>
            <h1 className="text-xl font-semibold">QA Shop</h1>
          </CardTitle>
          <CardDescription>Sign in to the back office.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm next={safeNext} />
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground" data-testid="login-hint">
            Admin: <code className="rounded bg-muted px-1">admin@qa-shop.test</code> /{" "}
            <code className="rounded bg-muted px-1">Admin123!</code>
            <br />
            Viewer: <code className="rounded bg-muted px-1">viewer@qa-shop.test</code> /{" "}
            <code className="rounded bg-muted px-1">Viewer123!</code>
          </p>
        </CardFooter>
      </Card>
    </main>
  )
}
