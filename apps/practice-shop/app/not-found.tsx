import { NotFoundCard } from "@/components/not-found-card"

// Shown for an address that does not exist at all.
export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <NotFoundCard />
    </main>
  )
}
