import { Info } from "lucide-react"

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

export function DemoBanner() {
  if (!DEMO_MODE) return null

  return (
    <aside aria-label="Demo notice" className="border-b bg-muted/60 text-foreground/80">
      <div className="container mx-auto flex items-center justify-center gap-2 px-4 py-1.5 text-xs md:px-8">
        <Info className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <p>
          <span className="font-medium text-foreground">Demo mode:</span> sample data, no DNA is screened.
        </p>
      </div>
    </aside>
  )
}
