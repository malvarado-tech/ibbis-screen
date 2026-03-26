"use client"

import Link from "next/link"
import { ArrowRight, ChevronDown, ShieldCheck } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/[0.06] via-background to-background pt-24 pb-16 md:pt-32 md:pb-24">
      {/* Dot grid pattern */}
      <div className="absolute inset-0 -z-10 pointer-events-none opacity-[0.4] dark:opacity-[0.15]" style={{ backgroundImage: "radial-gradient(circle, hsl(var(--primary) / 0.15) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary mb-8 text-sm font-medium border border-primary/20">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            <span>Built on IBBIS Common Mechanism</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-foreground" style={{ textWrap: "balance" }}>
            Making DNA Screening <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Accessible</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            A secure, open-source interface for IBBIS&apos;s biosecurity screening tools. Protect your synthesis pipeline with confidence and compliance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/screen"
              className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto text-base h-12 px-8 shadow-lg shadow-primary/20")}
            >
              Try Screening Demo
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="#features"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }), "w-full sm:w-auto text-base h-12 px-8")}
            >
              Learn More
              <ChevronDown className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/[0.07] rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-primary/[0.04] rounded-full blur-3xl -z-10 pointer-events-none" />
    </section>
  )
}
