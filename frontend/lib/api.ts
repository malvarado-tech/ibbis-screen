import { ScreeningJob } from "./types"
import { EXAMPLE_SEQUENCES } from "./mock-data"

function getApiUrl(): string {
  if (typeof window === "undefined") return "https://back-ibbis.malvarado.org"
  const h = window.location.hostname
  if (h === "localhost" || h === "127.0.0.1") return "http://localhost:8000"
  return "https://back-ibbis.malvarado.org"
}
const API_URL = getApiUrl()
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Track mock job state for realistic polling simulation
const mockJobs = new Map<string, { step: number; sequence: string; startTime: number }>()

export async function submitSequence(sequence: string, name: string = "Sequence"): Promise<string> {
  if (DEMO_MODE) {
    await delay(500)
    const jobId = `job_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`
    mockJobs.set(jobId, { step: 0, sequence, startTime: Date.now() })
    return jobId
  }

  const response = await fetch(`${API_URL}/api/v1/screen`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sequence, name }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to submit sequence" }))
    throw new Error(error.detail || "Failed to submit sequence")
  }

  const data = await response.json()
  return data.job_id
}

export async function getJobStatus(jobId: string): Promise<ScreeningJob> {
  if (DEMO_MODE) {
    await delay(800)

    const mockJob = mockJobs.get(jobId)
    if (!mockJob) {
      return { job_id: jobId, status: "error", error: "Job not found" }
    }

    const elapsed = Date.now() - mockJob.startTime

    // Simulate pipeline progression over ~4 seconds
    if (elapsed < 1500) {
      return {
        job_id: jobId,
        status: "processing",
        current_step: 1,
      }
    }

    if (elapsed < 3000) {
      return {
        job_id: jobId,
        status: "processing",
        current_step: 4,
      }
    }

    // Complete — match against example sequences for realistic results
    const matchedExample = EXAMPLE_SEQUENCES.find((ex) => {
      const exSeq = ex.sequence.split("\n").slice(1).join("").replace(/\s/g, "")
      const inputSeq = mockJob.sequence.replace(/^>.*\n/, "").replace(/\s/g, "")
      return exSeq.startsWith(inputSeq.substring(0, 50)) || inputSeq.startsWith(exSeq.substring(0, 50))
    })

    mockJobs.delete(jobId)

    if (matchedExample) {
      return {
        job_id: jobId,
        status: "complete",
        result: matchedExample.mockResult,
      }
    }

    // Default result for unknown sequences
    return {
      job_id: jobId,
      status: "complete",
      result: {
        overall: "PASS",
        steps: [
          { id: "1", name: "Biorisk Scan", description: "HMM profile matching against biorisk database", status: "complete", duration: 1.3 },
          { id: "2", name: "Protein Taxonomy", description: "BLAST/DIAMOND search against NCBI nr", status: "skipped" },
          { id: "3", name: "Nucleotide Taxonomy", description: "BLASTN search against NCBI core_nt", status: "skipped" },
          { id: "4", name: "Low-Concern Check", description: "Clearing against benign databases", status: "complete", duration: 0.7 },
        ],
        regions: [],
      },
    }
  }

  const response = await fetch(`${API_URL}/api/v1/screen/${jobId}`)

  if (!response.ok) {
    throw new Error("Failed to get job status")
  }

  return response.json()
}

export async function downloadReport(jobId: string, format: "json" | "html" = "json"): Promise<Blob> {
  if (DEMO_MODE) {
    throw new Error("Report download is not available in demo mode")
  }

  const response = await fetch(`${API_URL}/api/v1/screen/${jobId}/report?format=${format}`)

  if (!response.ok) {
    throw new Error("Failed to download report")
  }

  return response.blob()
}
