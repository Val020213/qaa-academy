import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Shared by app/not-found.tsx and app/(dashboard)/not-found.tsx.
// It has no <main> of its own: the page that uses it decides that.
export function NotFoundCard() {
  return (
    <Card className="w-full max-w-sm" data-testid="not-found">
      <CardHeader>
        <CardTitle>
          <h1 className="text-xl font-semibold">Page not found</h1>
        </CardTitle>
        <CardDescription>There is nothing at this address.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link href="/dashboard">Back to the dashboard</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
