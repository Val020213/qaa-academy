"use client"

import { useState, type FormEvent } from "react"
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
    <form className="form" onSubmit={submit} noValidate data-testid="login-form">
      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="username"
          data-testid="login-email"
        />
      </label>
      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          data-testid="login-password"
        />
      </label>
      {error && (
        <p className="alert alert-error" role="alert" data-testid="login-error">
          {error}
        </p>
      )}
      <button className="button" type="submit" disabled={sending} data-testid="login-submit">
        {sending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  )
}
