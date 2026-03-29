'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type HandoffData = {
  clientName: string
  clientNumber: string
  program: string | null
  phone: string | null
  email: string | null
  address: string | null
  dob: string | null
  recentVisits: {
    date: string
    serviceType: string
    caseWorker: string
    duration: number | null
    notes: string | null
  }[]
  generatedAt: string
}

function extractActionItems(notes: string): string[] {
  const actionPatterns = [
    /referred? (?:to )?([^.]+)/gi,
    /follow[- ]up[^.]*\./gi,
    /awaiting[^.]+\./gi,
    /next steps?:[^.]+\./gi,
    /scheduled[^.]+\./gi,
    /pending[^.]+\./gi,
  ]
  const items: string[] = []
  for (const pattern of actionPatterns) {
    const matches = notes.match(pattern)
    if (matches) items.push(...matches.map((m) => m.trim()))
  }
  return [...new Set(items)].slice(0, 5)
}

export default function HandoffView({ data }: { data: HandoffData }) {
  const [copied, setCopied] = useState(false)

  const allNotes = data.recentVisits
    .map((v) => v.notes)
    .filter(Boolean)
    .join(' ')
  const actionItems = allNotes ? extractActionItems(allNotes) : []

  const summaryText = `
CLIENT HANDOFF SUMMARY
Generated: ${data.generatedAt}

CLIENT
Name: ${data.clientName} (${data.clientNumber})
Program: ${data.program ?? '—'}
DOB: ${data.dob ?? '—'}
Phone: ${data.phone ?? '—'}
Email: ${data.email ?? '—'}
Address: ${data.address ?? '—'}

RECENT VISITS (last ${data.recentVisits.length})
${data.recentVisits.map((v) =>
  `• ${v.date} — ${v.serviceType}${v.duration ? ` (${v.duration} min)` : ''} with ${v.caseWorker}
  ${v.notes ?? 'No notes recorded.'}`
).join('\n')}

OPEN ACTION ITEMS
${actionItems.length > 0 ? actionItems.map((a) => `• ${a}`).join('\n') : '• No specific action items detected. Review notes above.'}

NOTES FOR INCOMING CASE WORKER
Please review the visit history above and follow up on any open referrals or pending items. Introduce yourself to the client at the earliest opportunity.
`.trim()

  function handleCopy() {
    navigator.clipboard.writeText(summaryText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Client overview */}
      <Card>
        <CardHeader>
          <CardTitle>Client Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium">{data.clientName} <span className="text-xs text-muted-foreground font-mono">({data.clientNumber})</span></dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Program</dt>
              <dd className="font-medium">{data.program ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Phone</dt>
              <dd className="font-medium">{data.phone ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{data.email ?? '—'}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-muted-foreground">Address</dt>
              <dd className="font-medium">{data.address ?? '—'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Recent visits */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Visit History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data.recentVisits.length === 0 ? (
            <p className="px-4 py-6 text-sm text-center text-muted-foreground">No visits recorded.</p>
          ) : (
            <div className="divide-y">
              {data.recentVisits.map((v, i) => (
                <div key={i} className="px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <span className="font-medium">{v.serviceType}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{v.date}</span>
                  </div>
                  {v.notes && <p className="text-muted-foreground text-xs leading-relaxed">{v.notes}</p>}
                  <p className="text-xs text-muted-foreground mt-1">
                    {v.caseWorker}{v.duration ? ` · ${v.duration} min` : ''}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action items */}
      <Card>
        <CardHeader>
          <CardTitle>Open Action Items</CardTitle>
        </CardHeader>
        <CardContent>
          {actionItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">No specific action items detected. Review visit notes above.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {actionItems.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5 shrink-0 text-amber-500">⚠</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Notes for incoming worker */}
      <Card>
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground italic">
            Please review the visit history above and follow up on any open referrals or pending items. Introduce yourself to the client at the earliest opportunity.
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 print:hidden">
        <Button onClick={handleCopy} variant="outline">
          {copied ? 'Copied!' : 'Copy summary'}
        </Button>
        <Button onClick={() => window.print()} variant="outline">
          Print / Save PDF
        </Button>
      </div>

      <p className="text-xs text-muted-foreground print:hidden">Generated {data.generatedAt}</p>
    </div>
  )
}
