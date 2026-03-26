"use client"

import { useState } from "react"
import { Search, Filter, Clock, CheckCircle2, AlertCircle, ShieldAlert, FileText, Download, Eye, BarChart3, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HistoryItem } from "@/lib/types"
import { MOCK_HISTORY } from "@/lib/mock-data"

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [history] = useState<HistoryItem[]>(MOCK_HISTORY)

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalScreens = history.length
  const passCount = history.filter(h => h.status === "PASS").length
  const flagCount = history.filter(h => h.status === "FLAG" || h.status === "WARNING").length
  const passRate = totalScreens > 0 ? ((passCount / totalScreens) * 100).toFixed(0) : "0"

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            View and manage your sequence screening history.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              type="search"
              placeholder="Search history\u2026"
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search screening history"
              autoComplete="off"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><BarChart3 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />Total Screens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">{totalScreens}</div>
            <p className="text-xs text-muted-foreground mt-1">Sequences processed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400" aria-hidden="true" />Pass Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 tabular-nums">{passRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">{passCount} of {totalScreens} passed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400" aria-hidden="true" />Flagged Sequences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400 tabular-nums">{flagCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Require manual review</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 mb-4">
        <Button variant={statusFilter === null ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(null)}>All ({history.length})</Button>
        <Button variant={statusFilter === "PASS" ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("PASS")}>Pass ({passCount})</Button>
        <Button variant={statusFilter === "FLAG" ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("FLAG")}>Flag ({history.filter(h => h.status === "FLAG").length})</Button>
        <Button variant={statusFilter === "WARNING" ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("WARNING")}>Warning ({history.filter(h => h.status === "WARNING").length})</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Screens</CardTitle>
          <CardDescription>Your most recently submitted sequences.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Job ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Length</th>
                  <th className="px-4 py-3 rounded-tr-lg">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-4 font-mono text-xs text-muted-foreground">{item.id}</td>
                    <td className="px-4 py-4 font-medium">{item.name}</td>
                    <td className="px-4 py-4 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                        {new Intl.DateTimeFormat(undefined, { year: "numeric", month: "numeric", day: "numeric" }).format(new Date(item.timestamp))}
                      </div>
                    </td>
                    <td className="px-4 py-4">{item.length} bp</td>
                    <td className="px-4 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        item.status === "PASS" ? "bg-green-500/10 text-green-700 dark:text-green-400" :
                        item.status === "FLAG" ? "bg-red-500/10 text-red-700 dark:text-red-400" :
                        "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                      }`}>
                        {item.status === "PASS" ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> :
                         item.status === "FLAG" ? <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" /> :
                         <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />}
                        {item.status}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredHistory.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" aria-hidden="true" />
                <p>No screening history found.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
