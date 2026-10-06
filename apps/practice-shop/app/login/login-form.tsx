"use client"

import { useState, type FormEvent } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api, ApiError } from "@/lib/api"

export function LoginForm({ next }: { next: string }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [sending, setSending] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError("")

    if (!email.trim() || !password) {
      setError("Enter your email and password.")
      return
    }

    setSending(true)
    try {
      await api("/api/auth/login", { method: "POST", body: { email, password } })
      // A full page load, so the server reads the new session cookie.
      window.location.assign(next)
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Something went wrong. Try again.")
      setSending(false)
    }
  }

  return (
    <form className="grid gap-4" onSubmit={submit} noValidate data-testid="login-form">
      <div className="grid gap-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="username"
          data-testid="login-email"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="login-password">Password</Label>
        <Input
          id="login-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          data-testid="login-password"
        />
      </div>
      {error && (
        <Alert variant="destructive" role="alert" data-testid="login-error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" disabled={sending} data-testid="login-submit">
        {sending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  )
}
