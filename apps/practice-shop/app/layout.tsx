import type { Metadata } from "next"
import type { ReactNode } from "react"
// The font files come from an installed package, so nothing is downloaded at build time.
import "@fontsource-variable/geist"
import "./globals.css"

export const metadata: Metadata = {
  title: "QA Shop back office",
  description: "A small app to practise end-to-end testing",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
