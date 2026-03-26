"use client"

import { useState } from "react"
import { Code, Terminal, FileJson, CheckCircle2, Download } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 px-2 py-1 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
      aria-label="Copy to clipboard"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  )
}

export default function ApiDocsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4" style={{ textWrap: "balance" }}>API Documentation</h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Integrate IBBIS Screen into your LIMS, synthesis pipeline, or bioinformatics workflows.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-2">
          <nav className="sticky top-24 space-y-1">
            <a href="#getting-started" className="block px-3 py-2 text-sm font-medium rounded-md bg-muted text-foreground">Getting Started</a>
            <a href="#endpoints" className="block px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground">Endpoints</a>
            <div className="pl-4 space-y-1 mt-1">
              <a href="#submit-screen" className="block px-3 py-1.5 text-sm rounded-md text-muted-foreground hover:text-foreground">Submit Screen</a>
              <a href="#get-status" className="block px-3 py-1.5 text-sm rounded-md text-muted-foreground hover:text-foreground">Get Status</a>
              <a href="#download-report" className="block px-3 py-1.5 text-sm rounded-md text-muted-foreground hover:text-foreground">Download Report</a>
            </div>
            <a href="#data-model" className="block px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground mt-2">Data Model</a>
          </nav>
        </div>

        <div className="lg:col-span-3 space-y-16">
          <section id="getting-started">
            <h2 className="text-3xl font-bold tracking-tight mb-6">Getting Started</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              The IBBIS Screen API is a RESTful service that allows you to programmatically submit DNA/RNA sequences for biosecurity screening and retrieve the results. No authentication is required for the demo deployment.
            </p>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" aria-hidden="true" />
                  Base URL
                </CardTitle>
              </CardHeader>
              <CardContent>
                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                  https://your-deployment.run.app/api/v1
                </code>
                <p className="text-xs text-muted-foreground mt-2">Replace with your actual Cloud Run or local development URL.</p>
              </CardContent>
            </Card>
          </section>

          <section id="endpoints">
            <h2 className="text-3xl font-bold tracking-tight mb-8">Endpoints</h2>

            {/* POST /api/v1/screen */}
            <div id="submit-screen" className="space-y-6 mb-12">
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 rounded-md bg-green-500/10 text-green-700 dark:text-green-400 font-mono font-bold text-sm">POST</span>
                <h3 className="text-2xl font-semibold">/api/v1/screen</h3>
              </div>
              <p className="text-muted-foreground">Submit a new sequence for screening. Returns a job ID for polling.</p>

              <Tabs defaultValue="curl" className="w-full">
                <TabsList>
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="js">Node.js</TabsTrigger>
                </TabsList>
                <TabsContent value="curl" className="mt-4">
                  <div className="relative">
                    <CopyButton text={`curl -X POST https://your-deployment.run.app/api/v1/screen \\
  -H "Content-Type: application/json" \\
  -d '{
    "sequence": ">GFP\\nATGGTGAGCAAGGGCGAGGAG...",
    "name": "GFP Construct"
  }'`} />
                    <div className="bg-zinc-950 text-zinc-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                      <pre><code>{`curl -X POST https://your-deployment.run.app/api/v1/screen \\
  -H "Content-Type: application/json" \\
  -d '{
    "sequence": ">GFP\\nATGGTGAGCAAGGGCGAGGAG...",
    "name": "GFP Construct"
  }'`}</code></pre>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="python" className="mt-4">
                  <div className="relative">
                    <CopyButton text={`import requests

url = "https://your-deployment.run.app/api/v1/screen"
data = {
    "sequence": ">GFP\\nATGGTGAGCAAGGGCGAGGAG...",
    "name": "GFP Construct"
}

response = requests.post(url, json=data)
job = response.json()
print(f"Job ID: {job['job_id']}")  # Poll this ID for results`} />
                    <div className="bg-zinc-950 text-zinc-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                      <pre><code>{`import requests

url = "https://your-deployment.run.app/api/v1/screen"
data = {
    "sequence": ">GFP\\nATGGTGAGCAAGGGCGAGGAG...",
    "name": "GFP Construct"
}

response = requests.post(url, json=data)
job = response.json()
print(f"Job ID: {job['job_id']}")  # Poll this ID for results`}</code></pre>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="js" className="mt-4">
                  <div className="relative">
                    <CopyButton text={`const response = await fetch(
  'https://your-deployment.run.app/api/v1/screen',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sequence: '>GFP\\nATGGTGAGCAAGGGCGAGGAG...',
      name: 'GFP Construct'
    })
  }
);

const { job_id } = await response.json();
// Poll GET /api/v1/screen/{job_id} for results`} />
                    <div className="bg-zinc-950 text-zinc-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                      <pre><code>{`const response = await fetch(
  'https://your-deployment.run.app/api/v1/screen',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sequence: '>GFP\\nATGGTGAGCAAGGGCGAGGAG...',
      name: 'GFP Construct'
    })
  }
);

const { job_id } = await response.json();
// Poll GET /api/v1/screen/{job_id} for results`}</code></pre>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileJson className="h-4 w-4" aria-hidden="true" />
                    Response <span className="text-xs font-normal text-muted-foreground ml-2">201 Created</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 p-4 rounded-lg font-mono text-sm overflow-x-auto border">
                    <pre><code>{`{
  "job_id": "job_m1x2y3z4",
  "status": "queued"
}`}</code></pre>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* GET /api/v1/screen/{job_id} */}
            <div id="get-status" className="space-y-6 mb-12">
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-400 font-mono font-bold text-sm">GET</span>
                <h3 className="text-2xl font-semibold">/api/v1/screen/&#123;job_id&#125;</h3>
              </div>
              <p className="text-muted-foreground">Poll for the status and results of a screening job. Poll every 2 seconds until <code className="bg-muted px-1 py-0.5 rounded text-xs">status</code> is <code className="bg-muted px-1 py-0.5 rounded text-xs">complete</code> or <code className="bg-muted px-1 py-0.5 rounded text-xs">error</code>.</p>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden="true" />
                    Response (Completed)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 p-4 rounded-lg font-mono text-sm overflow-x-auto border">
                    <pre><code>{`{
  "job_id": "job_m1x2y3z4",
  "status": "complete",
  "result": {
    "overall": "FLAG",
    "steps": [
      { "id": "1", "name": "Biorisk Scan", "status": "complete", "duration": 1.5 },
      { "id": "2", "name": "Protein Taxonomy", "status": "skipped" },
      { "id": "3", "name": "Nucleotide Taxonomy", "status": "skipped" },
      { "id": "4", "name": "Low-Concern Check", "status": "complete", "duration": 1.1 }
    ],
    "regions": [
      {
        "start": 721,
        "end": 891,
        "type": "biorisk",
        "label": "Flagged region — matches biorisk HMM profile",
        "score": 0.94
      }
    ]
  }
}`}</code></pre>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* GET /api/v1/screen/{job_id}/report */}
            <div id="download-report" className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-400 font-mono font-bold text-sm">GET</span>
                <h3 className="text-2xl font-semibold">/api/v1/screen/&#123;job_id&#125;/report</h3>
              </div>
              <p className="text-muted-foreground">Download the full screening report in JSON or HTML format.</p>

              <div className="relative">
                <CopyButton text={`# JSON report
curl https://your-deployment.run.app/api/v1/screen/job_m1x2y3z4/report?format=json

# HTML report (visual, Plotly-based)
curl https://your-deployment.run.app/api/v1/screen/job_m1x2y3z4/report?format=html`} />
                <div className="bg-zinc-950 text-zinc-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre><code>{`# JSON report
curl https://your-deployment.run.app/api/v1/screen/job_m1x2y3z4/report?format=json

# HTML report (visual, Plotly-based)
curl https://your-deployment.run.app/api/v1/screen/job_m1x2y3z4/report?format=html`}</code></pre>
                </div>
              </div>
            </div>
          </section>

          <section id="data-model">
            <h2 className="text-3xl font-bold tracking-tight mb-6">Data Model</h2>
            <Card>
              <CardHeader>
                <CardTitle>Screening Result Statuses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-700 dark:text-green-400 whitespace-nowrap">PASS</span>
                    <p className="text-sm text-muted-foreground">No biorisk sequences detected. Sequence is cleared.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-700 dark:text-red-400 whitespace-nowrap">FLAG</span>
                    <p className="text-sm text-muted-foreground">Biorisk sequences detected. Requires manual review before order fulfillment.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 whitespace-nowrap">WARNING</span>
                    <p className="text-sm text-muted-foreground">Potential concerns detected but below flag threshold. Review recommended.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-700 dark:text-red-400 whitespace-nowrap">ERROR</span>
                    <p className="text-sm text-muted-foreground">Screening could not be completed due to a processing error.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Region Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <code className="text-xs bg-muted px-2 py-1 rounded whitespace-nowrap">biorisk</code>
                    <p className="text-sm text-muted-foreground">Region matches a known hazardous protein family (toxin, virulence factor, etc.) in the biorisk HMM database.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <code className="text-xs bg-muted px-2 py-1 rounded whitespace-nowrap">regulated</code>
                    <p className="text-sm text-muted-foreground">Region matches a regulated pathogen taxon (requires full taxonomy screening, Steps 2-3).</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <code className="text-xs bg-muted px-2 py-1 rounded whitespace-nowrap">benign</code>
                    <p className="text-sm text-muted-foreground">Region cleared as low-concern (housekeeping gene, common lab protein, vaccine strain, etc.).</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <code className="text-xs bg-muted px-2 py-1 rounded whitespace-nowrap">unknown</code>
                    <p className="text-sm text-muted-foreground">Region could not be classified. May require manual investigation.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  )
}
