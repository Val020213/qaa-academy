// Small helper used by the pages to call the API.

import type { FieldErrors } from "./types"

export class ApiError extends Error {
  status: number
  fieldErrors: FieldErrors

  constructor(status: number, message: string, fieldErrors: FieldErrors = {}) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

export async function api<T>(
  path: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const response = await fetch(path, {
    method: options.method ?? "GET",
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (response.status === 204) return undefined as T

  const data = (await response.json().catch(() => ({}))) as {
    message?: string
    errors?: FieldErrors
  }
  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.message ?? "Something went wrong. Try again.",
      data.errors
    )
  }
  return data as T
}

export const formatMoney = (value: number) => `$${value.toFixed(2)}`
