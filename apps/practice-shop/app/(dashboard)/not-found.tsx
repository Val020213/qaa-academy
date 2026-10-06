import { NotFoundCard } from "@/components/not-found-card"

// Shown when a dashboard page calls notFound(), for example an unknown product.
// The dashboard layout already has the <main>, so we only add the card.
export default function DashboardNotFound() {
  return <NotFoundCard />
}
