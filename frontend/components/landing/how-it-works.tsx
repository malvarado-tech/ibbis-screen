import { FileText, Search, FileCheck, ChevronRight } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      title: "Upload Sequence",
      description: "Paste your DNA/RNA sequence directly or drag and drop a FASTA file.",
      icon: FileText,
    },
    {
      title: "Automated Screening",
      description: "Screened against curated biorisk and benign databases in seconds.",
      icon: Search,
    },
    {
      title: "Get Report",
      description: "Receive a clear Pass, Flag, or Warning verdict with detailed analysis.",
      icon: FileCheck,
    },
  ]

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold tracking-tight mb-4" style={{ textWrap: "balance" }}>How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A simple 3-step process to screen your sequences for biosecurity risks.
          </p>
        </div>

        {/* Desktop: horizontal */}
        <div className="hidden md:flex items-start justify-center max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start flex-1">
              <div className="flex flex-col items-center text-center flex-1 px-4">
                <div className="text-5xl font-bold text-primary/[0.08] mb-3 leading-none" aria-hidden="true">
                  {index + 1}
                </div>
                <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <step.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[220px]">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="shrink-0 pt-14 text-muted-foreground/30">
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile: stacked */}
        <div className="md:hidden space-y-8 max-w-sm mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex flex-col items-center shrink-0">
                <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <step.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                {index < steps.length - 1 && (
                  <div className="w-px h-full bg-border mt-2" aria-hidden="true" />
                )}
              </div>
              <div className="pt-1.5 pb-2">
                <span className="text-xs font-mono text-primary/40 tracking-wider">0{index + 1}</span>
                <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
