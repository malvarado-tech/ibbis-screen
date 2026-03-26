"use client"

import Link from "next/link"
import { Shield, ExternalLink, Github, BookOpen } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-6">
          <Shield className="h-12 w-12 text-primary" aria-hidden="true" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-4" style={{ textWrap: "balance" }}>About IBBIS Screen</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A modern, accessible interface for the International Biosecurity and Biosafety Initiative for Science (IBBIS) Common Mechanism.
        </p>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-bold tracking-tight mb-6" style={{ textWrap: "balance" }}>The Mission</h2>
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <p className="text-lg leading-relaxed text-muted-foreground">
              As DNA synthesis becomes more accessible, the risk of malicious actors obtaining dangerous pathogens increases. IBBIS Screen aims to mitigate this risk by providing a user-friendly, open-source platform for screening DNA and RNA sequences against known biorisk databases.
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground mt-4">
              By making the screening process seamless and transparent, we empower researchers, synthesis providers, and institutions to implement robust biosecurity measures without compromising innovation or efficiency.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" aria-hidden="true" />
                The Common Mechanism
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                This application is built on top of the IBBIS Common Mechanism (commec), an open-source tool designed to standardize and improve DNA synthesis screening globally.
              </p>
              <Link href="https://github.com/ibbis-bio/commec" target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
                <Github className="mr-2 h-4 w-4" aria-hidden="true" />
                View on GitHub
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
                Documentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Learn how to integrate the screening API into your own synthesis pipeline, LIMS, or bioinformatics workflows.
              </p>
              <Link href="/api-docs" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
                <ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
                API Reference
              </Link>
            </CardContent>
          </Card>
        </section>

        <section className="bg-muted/50 p-8 rounded-2xl border">
          <h2 className="text-2xl font-bold tracking-tight mb-4" style={{ textWrap: "balance" }}>How it Works</h2>
          <ol className="space-y-6 list-decimal list-inside text-muted-foreground">
            <li className="text-lg">
              <span className="font-semibold text-foreground">Sequence Submission:</span> Users upload a FASTA file or paste a sequence.
            </li>
            <li className="text-lg">
              <span className="font-semibold text-foreground">Preprocessing:</span> The sequence is validated, cleaned, and translated if necessary.
            </li>
            <li className="text-lg">
              <span className="font-semibold text-foreground">Database Alignment:</span> The sequence is aligned against a curated database of known pathogens and toxins (Biorisk Database) and a database of common, safe sequences (Benign Database).
            </li>
            <li className="text-lg">
              <span className="font-semibold text-foreground">Risk Assessment:</span> An algorithm analyzes the alignments to determine if the sequence poses a biosecurity risk, generating a PASS, FLAG, or WARNING result.
            </li>
          </ol>
        </section>
      </div>
    </div>
  )
}
