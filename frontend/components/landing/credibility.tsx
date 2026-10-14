"use client"

import Link from "next/link"
import { Github } from "lucide-react"

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

export function Credibility() {
  const facts = [
    "Wraps commec, the open-source DNA synthesis screening tool published by IBBIS.",
    "A proof of concept, shared with the IBBIS team.",
    ...(DEMO_MODE ? ["This demo uses sample data: no sequence is screened."] : []),
  ]

  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-8" style={{ textWrap: "balance" }}>
            Built on IBBIS Common Mechanism
          </h2>
          <ul className="space-y-3 mb-10 text-base leading-relaxed text-primary-foreground/90 dark:text-primary-foreground">
            {facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
          <Link
            href="https://github.com/ibbis-bio/common-mechanism"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-primary-foreground/10 dark:bg-transparent border border-primary-foreground/20 dark:border-primary-foreground/60 text-primary-foreground text-sm font-medium hover:bg-primary-foreground/20 transition-colors"
          >
            <Github className="h-4 w-4" aria-hidden="true" />
            commec on GitHub
          </Link>
        </div>
      </div>
    </section>
  )
}
