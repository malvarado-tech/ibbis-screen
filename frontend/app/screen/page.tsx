"use client"

import { useState, useRef, useCallback } from "react"
import { Upload, FileText, AlertCircle, CheckCircle2, ShieldAlert, AlertTriangle, Loader2, Play, ChevronDown, XCircle, RotateCcw, Download, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { submitSequence, getJobStatus, downloadReport } from "@/lib/api"
import { ScreeningJob, ScreeningStep } from "@/lib/types"
import { EXAMPLE_SEQUENCES } from "@/lib/mock-data"
import { TooltipProvider } from "@/components/ui/tooltip"

function StepIndicator({ step, isActive }: { step: ScreeningStep; isActive: boolean }) {
  const isSkipped = step.status === "skipped"
  const isComplete = step.status === "complete"

  return (
    <div className={`flex items-center justify-between text-sm py-2 ${isSkipped ? "opacity-50" : ""}`}>
      <div className="flex items-center gap-2">
        {isComplete && <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" aria-hidden="true" />}
        {isActive && <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />}
        {isSkipped && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Full taxonomy screening available in cloud deployment</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {!isComplete && !isActive && !isSkipped && <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />}
        <span className={isComplete || isActive ? "text-foreground" : "text-muted-foreground"}>
          {step.name}
        </span>
      </div>
      <span className="text-xs text-muted-foreground">
        {isComplete && step.duration ? `${step.duration.toFixed(1)}s` : ""}
        {isSkipped ? "Skipped" : ""}
        {!isComplete && !isSkipped && !isActive ? "Pending" : ""}
      </span>
    </div>
  )
}

function ResultBadge({ result }: { result: string }) {
  const config = {
    PASS: { bg: "bg-green-500/10", text: "text-green-700 dark:text-green-400", icon: CheckCircle2, label: "No significant biorisks detected." },
    FLAG: { bg: "bg-red-500/10", text: "text-red-700 dark:text-red-400", icon: ShieldAlert, label: "Potential biorisks detected. Manual review required." },
    WARNING: { bg: "bg-yellow-500/10", text: "text-yellow-700 dark:text-yellow-400", icon: AlertTriangle, label: "Possible concerns detected. Review recommended." },
    ERROR: { bg: "bg-red-500/10", text: "text-red-700 dark:text-red-400", icon: XCircle, label: "Screening encountered an error." },
  }[result] || { bg: "bg-muted", text: "text-muted-foreground", icon: AlertCircle, label: "" }

  const Icon = config.icon

  return (
    <div className={`p-6 rounded-lg text-center ${config.bg} ${config.text}`}>
      <div className="flex justify-center mb-2">
        <Icon className="h-10 w-10" aria-hidden="true" />
      </div>
      <h3 className="text-2xl font-bold">{result}</h3>
      <p className="text-sm mt-1 opacity-80">{config.label}</p>
    </div>
  )
}

function SequenceVisualization({ regions, sequenceLength }: { regions: { start: number; end: number; type: string; label: string; score?: number }[]; sequenceLength: number }) {
  if (!regions.length || !sequenceLength) return null

  return (
    <div>
      <h4 className="font-medium mb-3">Sequence Map</h4>
      <div className="relative h-10 bg-muted rounded-lg overflow-hidden border">
        {regions.map((region, i) => {
          const left = (region.start / sequenceLength) * 100
          const width = ((region.end - region.start) / sequenceLength) * 100
          const color = region.type === "biorisk" ? "bg-red-500/80" : region.type === "benign" ? "bg-green-500/60" : "bg-yellow-500/60"
          const hoverColor = region.type === "biorisk" ? "hover:bg-red-500" : region.type === "benign" ? "hover:bg-green-500/80" : "hover:bg-yellow-500/80"

          return (
            <TooltipProvider key={i}>
              <Tooltip>
                <TooltipTrigger
                  className={`absolute top-0 h-full ${color} ${hoverColor} cursor-pointer transition-colors`}
                  style={{ left: `${left}%`, width: `${Math.max(width, 2)}%` }}
                />
                <TooltipContent>
                  <p className="font-medium">{region.label}</p>
                  <p className="text-xs">{region.start}–{region.end} bp ({region.type}){region.score ? ` | Score: ${(region.score * 100).toFixed(0)}%` : ""}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </div>
      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-green-500/60" aria-hidden="true" /> Benign</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-500/80" aria-hidden="true" /> Biorisk</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" aria-hidden="true" /> Unknown</span>
      </div>
    </div>
  )
}

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

export default function ScreenPage() {
  const [sequence, setSequence] = useState("")
  const [name, setName] = useState("")
  const [activeExample, setActiveExample] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [job, setJob] = useState<ScreeningJob | null>(null)
  const [error, setError] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setName(file.name.replace(/\.(fasta|fa|txt)$/i, ""))
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setSequence(content.trim())
    }
    reader.readAsText(file)
  }

  const loadExample = (index: number) => {
    const example = EXAMPLE_SEQUENCES[index]
    setSequence(example.sequence)
    setName(example.name)
    setActiveExample(index)
  }

  const reset = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current)
    setJob(null)
    setError(null)
    setIsSubmitting(false)
    setSequence("")
    setName("")
    setActiveExample(null)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sequence) return

    // Basic validation
    const lines = sequence.trim().split("\n")
    const seqContent = lines.filter(l => !l.startsWith(">")).join("").replace(/\s/g, "")
    if (seqContent.length < 50) {
      setError("Sequence must be at least 50 base pairs.")
      return
    }

    setIsSubmitting(true)
    setError(null)
    setJob(null)

    try {
      const jobId = await submitSequence(sequence, name || "Untitled Sequence")

      pollRef.current = setInterval(async () => {
        try {
          const status = await getJobStatus(jobId)
          setJob(status)

          if (status.status === "complete" || status.status === "error") {
            if (pollRef.current) clearInterval(pollRef.current)
            setIsSubmitting(false)
          }
        } catch {
          if (pollRef.current) clearInterval(pollRef.current)
          setError("Failed to get job status. The backend may be unavailable.")
          setIsSubmitting(false)
        }
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setIsSubmitting(false)
    }
  }

  // Compute sequence length for visualization
  const seqLength = job?.result?.regions
    ? Math.max(...job.result.regions.map(r => r.end), 0)
    : 0

  // Build pipeline steps for progress display
  const pipelineSteps: ScreeningStep[] = job?.result?.steps || [
    { id: "1", name: "Biorisk Scan", description: "HMM profile matching", status: job?.current_step === 1 ? "running" : (job?.current_step && job.current_step > 1 ? "complete" : "pending") as any },
    { id: "2", name: "Protein Taxonomy", description: "BLAST search (skipped in demo)", status: "skipped" },
    { id: "3", name: "Nucleotide Taxonomy", description: "BLASTN search (skipped in demo)", status: "skipped" },
    { id: "4", name: "Low-Concern Check", description: "Benign database clearing", status: job?.current_step === 4 ? "running" : "pending" as any },
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Screen Sequence</h1>
        <p className="text-muted-foreground">
          Upload a FASTA file or paste a DNA/RNA sequence to screen for biosecurity risks.
        </p>
      </div>

      {DEMO_MODE && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/50 p-4 text-sm text-blue-800 dark:text-blue-200">
          <Info className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <span className="font-medium">Demo Mode</span> — Showing simulated screening results using example data.
            This platform supports real <a href="https://github.com/ibbis-bio/common-mechanism" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600 dark:hover:text-blue-300">commec</a> screening when installed locally with full databases.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Input Sequence</CardTitle>
              <CardDescription>Provide a FASTA-formatted sequence (minimum 50 bp).</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Example loader */}
                <div className="space-y-2">
                  <Label>Load Example</Label>
                  <div className="flex flex-wrap gap-2">
                    {EXAMPLE_SEQUENCES.map((ex, i) => (
                      <Button
                        key={i}
                        type="button"
                        variant={activeExample === i ? "default" : "outline"}
                        size="sm"
                        onClick={() => loadExample(i)}
                        disabled={isSubmitting}
                      >
                        {ex.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file-upload">Upload FASTA File</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".fasta,.fa,.txt"
                    onChange={handleFileUpload}
                    className="cursor-pointer"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-muted" />
                  <span className="flex-shrink-0 mx-4 text-muted-foreground text-sm">OR</span>
                  <div className="flex-grow border-t border-muted" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sequence-name">Sequence Name (Optional)</Label>
                  <Input
                    id="sequence-name"
                    placeholder="e.g., Construct A"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sequence-text">Paste Sequence (FASTA format)</Label>
                  <Textarea
                    id="sequence-text"
                    placeholder={">sequence_name\nATGCGTACGTTA\u2026"}
                    className="font-mono h-48 resize-y text-sm"
                    value={sequence}
                    onChange={(e) => setSequence(e.target.value)}
                    disabled={isSubmitting}
                    spellCheck={false}
                    autoComplete="off"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {sequence.split("\n").filter(l => !l.startsWith(">")).join("").replace(/\s/g, "").length} bp
                  </p>
                </div>

                {error && (
                  <div className="p-4 bg-destructive/10 text-destructive rounded-md flex items-start gap-3" role="alert" aria-live="polite">
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!sequence || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      Screening\u2026
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" aria-hidden="true" />
                      Run Screen
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Results</CardTitle>
              <CardDescription>Screening outcome will appear here.</CardDescription>
            </CardHeader>
            <CardContent>
              {!job && !isSubmitting && (
                <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
                  <FileText className="h-12 w-12 mb-4 opacity-20" aria-hidden="true" />
                  <p>Submit a sequence to see results</p>
                </div>
              )}

              {(isSubmitting || (job && job.status === "processing")) && (
                <div className="space-y-6 py-4">
                  <div className="flex flex-col items-center justify-center text-center space-y-3">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden="true" />
                    <div aria-live="polite">
                      <p className="font-medium">Screening in progress\u2026</p>
                      <p className="text-sm text-muted-foreground">Running lightweight mode (Steps 1 & 4)</p>
                    </div>
                  </div>

                  <div className="space-y-1 border-t pt-4">
                    {pipelineSteps.map((step) => (
                      <StepIndicator
                        key={step.id}
                        step={step}
                        isActive={step.status === "running" || (job?.current_step?.toString() === step.id && step.status !== "complete" && step.status !== "skipped")}
                      />
                    ))}
                  </div>
                </div>
              )}

              {job?.status === "complete" && job.result && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <ResultBadge result={job.result.overall} />

                  <div className="space-y-1 border-t pt-4">
                    {job.result.steps.map((step) => (
                      <StepIndicator key={step.id} step={step} isActive={false} />
                    ))}
                  </div>

                  <SequenceVisualization regions={job.result.regions} sequenceLength={seqLength} />

                  {job.result.regions.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Detected Regions</h4>
                      <ul className="space-y-2">
                        {job.result.regions.map((region, i) => (
                          <li key={i} className="text-sm p-3 rounded border bg-muted/50">
                            <div className="flex flex-col gap-1 mb-1">
                              <span className="font-medium text-sm leading-snug">{region.label}</span>
                              <span className="text-muted-foreground text-xs">{region.start}–{region.end} bp</span>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              region.type === "biorisk" ? "bg-red-500/20 text-red-700 dark:text-red-400" :
                              region.type === "regulated" ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400" :
                              region.type === "benign" ? "bg-green-500/20 text-green-700 dark:text-green-400" :
                              "bg-muted text-muted-foreground"
                            }`}>
                              {region.type}
                              {region.score ? ` (${(region.score * 100).toFixed(0)}%)` : ""}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {job.result.regions.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">No specific regions flagged.</p>
                  )}
                </div>
              )}

              {job?.status === "error" && (
                <div className="p-4 bg-destructive/10 text-destructive rounded-md">
                  <p className="text-sm">{job.error || "An error occurred during screening."}</p>
                </div>
              )}
            </CardContent>
            {job?.status === "complete" && (
              <CardFooter className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={reset}>
                  <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                  New Screen
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
