"use client"

import Link from "next/link"
import { Github, Globe, Users, BookOpen } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Credibility() {
  const partners = [
    { name: "NIST", label: "US National Institute of Standards and Technology" },
    { name: "iGEM", label: "International Genetically Engineered Machine" },
    { name: "GBA", label: "Global Biofoundries Alliance" },
    { name: "IBBIS", label: "International Biosecurity & Biosafety Initiative" },
  ]

  const stats = [
    { value: "6", label: "Active programs", icon: BookOpen },
    { value: "12+", label: "Countries represented", icon: Globe },
    { value: "60+", label: "Consortium members", icon: Users },
  ]

  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header + CTA */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4" style={{ textWrap: "balance" }}>
              Built on IBBIS Common Mechanism
            </h2>
            <p className="text-base text-primary-foreground/70 max-w-2xl mx-auto mb-8 leading-relaxed">
              IBBIS is an independent Swiss non-profit building open-source tools for DNA synthesis screening. Their Common Mechanism is trusted by organizations worldwide.
            </p>
            <Link
              href="https://github.com/ibbis-bio/commec"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground text-sm font-medium hover:bg-primary-foreground/20 transition-colors"
            >
              <Github className="h-4 w-4" aria-hidden="true" />
              View on GitHub
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mb-14 max-w-lg mx-auto">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold tabular-nums mb-1">{stat.value}</div>
                <div className="text-xs text-primary-foreground/50 leading-tight">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Partner logos strip */}
          <div className="border-t border-primary-foreground/10 pt-10">
            <p className="text-xs text-primary-foreground/40 text-center mb-6 uppercase tracking-widest">Trusted by partners including</p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
              {partners.map((partner, i) => (
                <div key={i} className="group relative">
                  <span className="text-lg font-semibold tracking-wide text-primary-foreground/70 group-hover:text-primary-foreground transition-colors cursor-default">
                    {partner.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
