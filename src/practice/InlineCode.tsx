// A short piece of code inside a sentence. It always uses the strong text
// colour, so it stays readable on its grey background in both themes.

import type { ReactNode } from "react"

export function InlineCode({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.875em] text-foreground">
      {children}
    </code>
  )
}
