import { Badge } from "@/components/ui/badge"

// One colour per status. Products and orders share this list.
const VARIANTS = {
  active: "success",
  paid: "success",
  shipped: "success",
  pending: "warning",
  draft: "warning",
  cancelled: "secondary",
  archived: "secondary",
} as const

type Status = keyof typeof VARIANTS

/** A coloured badge that shows a product or order status as text. */
export function StatusBadge({ status, "data-testid": testId }: { status: Status; "data-testid"?: string }) {
  return (
    <Badge variant={VARIANTS[status]} data-testid={testId}>
      {status}
    </Badge>
  )
}
