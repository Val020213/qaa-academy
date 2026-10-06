// Panel 3: a slow report. The button waits 1.5 seconds, like a real API,
// so tests can practise assertions that wait.

import { useState } from "react"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export function ReportPanel() {
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  async function loadReport() {
    setLoading(true)
    setReady(false)

    await wait(1500)

    setLoading(false)
    setReady(true)
  }

  return (
    <Card data-testid="report" className="gap-4 p-6">
      <CardHeader className="gap-2 px-0">
        <CardTitle>
          <h2 className="text-base font-semibold">3. Slow loading</h2>
        </CardTitle>
        <CardDescription>
          The report takes about one and a half seconds to arrive, like a real API.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 px-0">
        <Button
          type="button"
          onClick={loadReport}
          disabled={loading}
          className="h-10 w-fit px-4"
          data-testid="report-load"
        >
          Load report
        </Button>
        <Alert role="status" hidden={!loading} data-testid="report-loading">
          Loading…
        </Alert>
        <Alert
          role="status"
          hidden={!ready}
          data-testid="report-result"
          className="border-ok-border bg-ok-bg text-ok"
        >
          {ready ? "Report ready: 12 tests, 11 passed, 1 failed." : ""}
        </Alert>
      </CardContent>
    </Card>
  )
}
