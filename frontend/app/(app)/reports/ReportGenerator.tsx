'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const PROGRAMS = [
  'Case Management',
  'Food Assistance',
  'Housing Support',
  'Mental Health Services',
  'Employment Support',
  'Medical Referral',
  'Child & Family Services',
  'Education Support',
  'Legal Aid Referral',
  'Transportation Assistance',
]

export default function ReportGenerator() {
  const today = new Date().toISOString().split('T')[0]
  const firstOfMonth = today.slice(0, 8) + '01'

  const [dateFrom, setDateFrom] = useState(firstOfMonth)
  const [dateTo, setDateTo] = useState(today)
  const [program, setProgram] = useState('')
  const [report, setReport] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGenerate() {
    setLoading(true)
    setReport('')
    setError('')

    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateFrom, dateTo, program }),
      })

      if (!res.ok) {
        setError('Failed to generate report. Please try again.')
        return
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let done = false

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        if (value) setReport((prev) => prev + decoder.decode(value))
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(report)
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Config card */}
      <Card>
        <CardHeader>
          <CardTitle>Report Parameters</CardTitle>
          <CardDescription>Select a date range and optional program filter to generate a funder-ready narrative.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="date_from">From</Label>
              <Input
                id="date_from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="date_to">To</Label>
              <Input
                id="date_to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="program">Program (optional)</Label>
              <select
                id="program"
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">All programs</option>
                {PROGRAMS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex items-center gap-3">
            <Button onClick={handleGenerate} disabled={loading}>
              {loading ? 'Generating…' : 'Generate Report'}
            </Button>
            {report && (
              <>
                <Button variant="outline" onClick={handleCopy}>Copy</Button>
                <Button variant="outline" onClick={handlePrint} className="print:hidden">Print / Save PDF</Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Output card */}
      {(report || loading) && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Report</CardTitle>
            <CardDescription>
              {dateFrom} – {dateTo}{program ? ` · ${program}` : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && !report && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="animate-pulse">Writing report…</span>
              </div>
            )}
            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed">
              {report}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
