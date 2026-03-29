'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Papa from 'papaparse'
import { importClients, type ImportRow, type ImportRowResult } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

// Expected CSV columns (case-insensitive)
const COLUMN_MAP: Record<string, keyof ImportRow | null> = {
  'first name':  'first_name',
  'first_name':  'first_name',
  'last name':   'last_name',
  'last_name':   'last_name',
  'dob':         'dob',
  'date of birth': 'dob',
  'phone':       'phone',
  'email':       'email',
  'address':     'address',
  'program':     'program',
  'row':         null, // ignore
}

type ParsedPreview = {
  rows: ImportRow[]
  warnings: string[]
}

function parseRows(data: Record<string, string>[]): ParsedPreview {
  const rows: ImportRow[] = []
  const warnings: string[] = []

  data.forEach((raw, i) => {
    const rowNum = i + 2 // 1-indexed, header is row 1
    const mapped: Partial<ImportRow> = { row: rowNum }

    // Map columns
    for (const [rawKey, value] of Object.entries(raw)) {
      const key = COLUMN_MAP[rawKey.toLowerCase().trim()]
      if (key && key !== 'row') {
        (mapped as Record<string, unknown>)[key] = value.trim() || null
      }
    }

    // Validate required fields
    if (!mapped.first_name) {
      warnings.push(`Row ${rowNum}: missing first_name — skipped.`)
      return
    }
    if (!mapped.last_name) {
      warnings.push(`Row ${rowNum}: missing last_name — skipped.`)
      return
    }

    rows.push({
      row: rowNum,
      first_name: mapped.first_name,
      last_name: mapped.last_name ?? '',
      dob: mapped.dob ?? null,
      phone: mapped.phone ?? null,
      email: mapped.email ?? null,
      address: mapped.address ?? null,
      program: mapped.program ?? null,
    })
  })

  return { rows, warnings }
}

export default function CsvImporter() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<ParsedPreview | null>(null)
  const [results, setResults] = useState<ImportRowResult[] | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setResults(null)
    setParseError(null)

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete(result) {
        if (result.errors.length > 0) {
          setParseError(`Could not parse file: ${result.errors[0].message}`)
          return
        }
        setPreview(parseRows(result.data))
      },
    })
  }

  async function handleImport() {
    if (!preview || preview.rows.length === 0) return
    setIsPending(true)
    const result = await importClients(preview.rows)
    setResults(result.results)
    setIsPending(false)
  }

  function handleReset() {
    setPreview(null)
    setResults(null)
    setParseError(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const successCount = results?.filter((r) => r.status === 'success').length ?? 0
  const errorCount = results?.filter((r) => r.status === 'error').length ?? 0

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Template download */}
      <Card>
        <CardHeader>
          <CardTitle>Download template</CardTitle>
          <CardDescription>
            Use this CSV template to format your client data for import.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <button
            onClick={() => {
              const template = 'first_name,last_name,dob,phone,email,address,program\nMaria,Garcia,1985-04-12,(602) 555-0101,mgarcia@example.com,"123 Main St, Chandler, AZ",Family Services\n'
              const blob = new Blob([template], { type: 'text/csv' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'clients-import-template.csv'
              a.click()
              URL.revokeObjectURL(url)
            }}
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-input bg-background px-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            Download template CSV
          </button>
        </CardContent>
      </Card>

      {/* Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload CSV</CardTitle>
          <CardDescription>
            Select a CSV file. Required columns: <code className="text-xs bg-muted px-1 rounded">first_name</code>, <code className="text-xs bg-muted px-1 rounded">last_name</code>. Optional: <code className="text-xs bg-muted px-1 rounded">dob</code>, <code className="text-xs bg-muted px-1 rounded">phone</code>, <code className="text-xs bg-muted px-1 rounded">email</code>, <code className="text-xs bg-muted px-1 rounded">address</code>, <code className="text-xs bg-muted px-1 rounded">program</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFile}
            className="text-sm text-muted-foreground file:mr-3 file:h-8 file:cursor-pointer file:rounded-lg file:border file:border-input file:bg-background file:px-2.5 file:text-sm file:font-medium file:transition-colors hover:file:bg-muted"
          />

          {parseError && (
            <p className="text-sm text-destructive">{parseError}</p>
          )}

          {preview && !results && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{preview.rows.length} rows</span> ready to import.
                {preview.warnings.length > 0 && (
                  <span className="text-amber-600"> {preview.warnings.length} row(s) skipped due to validation errors.</span>
                )}
              </p>

              {preview.warnings.length > 0 && (
                <ul className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 flex flex-col gap-1">
                  {preview.warnings.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              )}

              {/* Preview table */}
              <div className="overflow-x-auto rounded-lg border text-xs">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                      <th className="px-3 py-2 font-medium">Name</th>
                      <th className="px-3 py-2 font-medium">DOB</th>
                      <th className="px-3 py-2 font-medium">Phone</th>
                      <th className="px-3 py-2 font-medium">Program</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.slice(0, 5).map((r) => (
                      <tr key={r.row} className="border-b last:border-0">
                        <td className="px-3 py-2">{r.first_name} {r.last_name}</td>
                        <td className="px-3 py-2 text-muted-foreground">{r.dob ?? '—'}</td>
                        <td className="px-3 py-2 text-muted-foreground">{r.phone ?? '—'}</td>
                        <td className="px-3 py-2 text-muted-foreground">{r.program ?? '—'}</td>
                      </tr>
                    ))}
                    {preview.rows.length > 5 && (
                      <tr>
                        <td colSpan={4} className="px-3 py-2 text-center text-muted-foreground">
                          …and {preview.rows.length - 5} more rows
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleImport} disabled={isPending}>
                  {isPending ? 'Importing…' : `Import ${preview.rows.length} clients`}
                </Button>
                <Button variant="outline" onClick={handleReset}>Cancel</Button>
              </div>

            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Import complete</CardTitle>
            <CardDescription>
              <span className="text-green-700 font-medium">{successCount} succeeded</span>
              {errorCount > 0 && (
                <span className="text-destructive font-medium"> · {errorCount} failed</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {results.some((r) => r.status === 'error') && (
              <ul className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive flex flex-col gap-1">
                {results.filter((r) => r.status === 'error').map((r) => (
                  <li key={r.row}>Row {r.row} ({r.name}): {r.error}</li>
                ))}
              </ul>
            )}
            <div className="flex gap-3">
              <Link
                href="/clients"
                className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
              >
                View clients
              </Link>
              <Button variant="outline" onClick={handleReset}>Import another file</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
