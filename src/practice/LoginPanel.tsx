// Panel 1: login. Valid credentials are qa@example.com / Playwright123.
// Both messages stay in the page and use the `hidden` attribute while they are
// not shown, so a test can check them with toBeHidden() and toBeVisible().

import { useState, type FormEvent } from "react"
import { InlineCode } from "@/practice/InlineCode"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const VALID_EMAIL = "qa@example.com"
const VALID_PASSWORD = "Playwright123"

export function LoginPanel() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [signedIn, setSignedIn] = useState(false)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError("")

    if (!email.trim() || !password) {
      setError("Enter your email and password.")
      return
    }
    if (email.trim() !== VALID_EMAIL || password !== VALID_PASSWORD) {
      setError("Wrong email or password.")
      return
    }
    setSignedIn(true)
  }

  function signOut() {
    setEmail("")
    setPassword("")
    setSignedIn(false)
  }

  return (
    <Card data-testid="login" className="gap-4 p-6">
      <CardHeader className="gap-2 px-0">
        <CardTitle>
          <h2 className="text-base font-semibold">1. Login</h2>
        </CardTitle>
        <CardDescription>
          Valid credentials: <InlineCode>{VALID_EMAIL}</InlineCode> /{" "}
          <InlineCode>{VALID_PASSWORD}</InlineCode>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 px-0">
        {/* hidden: the form disappears after a successful sign in. */}
        <form
          onSubmit={handleSubmit}
          hidden={signedIn}
          noValidate
          data-testid="login-form"
          className="grid max-w-sm gap-4"
        >
          <div className="grid gap-1.5">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              name="email"
              autoComplete="off"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              data-testid="login-email"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              type="password"
              name="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              data-testid="login-password"
            />
          </div>
          <Button type="submit" className="h-10 w-fit px-4" data-testid="login-submit">
            Sign in
          </Button>
        </form>

        {/* Alert already has role="alert": screen readers read the error at once. */}
        <Alert variant="destructive" hidden={!error} data-testid="login-error">
          {error}
        </Alert>

        <Alert
          role="status"
          hidden={!signedIn}
          data-testid="login-welcome"
          className="flex items-center justify-between gap-3 border-ok-border bg-ok-bg text-ok"
        >
          <span>{signedIn ? `Signed in as ${VALID_EMAIL}.` : ""}</span>
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={signOut}
            className="text-ok underline"
            data-testid="login-logout"
          >
            Sign out
          </Button>
        </Alert>
      </CardContent>
    </Card>
  )
}
