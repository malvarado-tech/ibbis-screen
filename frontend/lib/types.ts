export type ScreeningStatus = 'idle' | 'queued' | 'processing' | 'complete' | 'error'

export type OverallResult = 'PASS' | 'FLAG' | 'WARNING' | 'ERROR'

export type StepStatus = 'pending' | 'running' | 'complete' | 'skipped'

export interface ScreeningStep {
  id: string
  name: string
  description: string
  status: StepStatus
  duration?: number
}

export interface Region {
  start: number
  end: number
  type: 'biorisk' | 'regulated' | 'benign' | 'unknown'
  label: string
  score?: number
}

export interface ScreeningResult {
  overall: OverallResult
  steps: ScreeningStep[]
  regions: Region[]
  report_html?: string
  report_json?: Record<string, any>
}

export interface ScreeningJob {
  job_id: string
  status: ScreeningStatus
  current_step?: number
  result?: ScreeningResult
  error?: string
}

export interface HistoryItem {
  id: string
  timestamp: string
  name: string
  sequence: string
  length: number
  status: OverallResult | 'ERROR'
  result?: ScreeningResult
}
