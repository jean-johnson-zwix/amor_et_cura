'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Papa from 'papaparse'
import { importClients, type ImportRow, type ImportRowResult } from './actions'

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
  'program':     'programs',
  'programs':    'programs',
  'row':         null,
}

type ParsedPreview = {
  rows: ImportRow[]
  warnings: string[]
}

function parseRows(data: Record<string, string>[]): ParsedPreview {
  const rows: ImportRow[] = []
  const warnings: string[] = []

  data.forEach((raw, i) => {
    const rowNum = i + 2
    const mapped: Partial<ImportRow> = { row: rowNum }

    for (const [rawKey, value] of Object.entries(raw)) {
      const key = COLUMN_MAP[rawKey.toLowerCase().trim()]
      if (key && key !== 'row') {
        (mapped as Record<string, unknown>)[key] = value.trim() || null
      }
    }

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
      programs: mapped.programs ?? [],
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
    <div className="mx-auto max-w-2xl flex flex-col gap-4">

      {/* Template download */}
      <div className="rounded-2xl bg-white shadow-sm p-5">
        <div className="mb-4 border-b border-[#e2e8f0] pb-3">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-navy">Download template</p>
        </div>
        <p className="mb-3 text-[12px] text-[#6b7280]">
          Use this CSV template to format your client data for import.
        </p>
        <button
          onClick={() => {
            const template = 'first_name,last_name,dob,phone,email,address,program\nMaria,Garcia,1985-04-12,(602) 555-0101,mgarcia@example.com,"123 Main St, City, State",Family Services\n'
            const blob = new Blob([template], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'clients-import-template.csv'
            a.click()
            URL.revokeObjectURL(url)
          }}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#e2e8f0] bg-white px-4 text-[13px] font-medium text-navy hover:bg-teal-tint transition-colors"
        >
          <svg className="size-4 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download template CSV
        </button>
      </div>

      {/* Upload */}
      <div className="rounded-2xl bg-white shadow-sm p-5">
        <div className="mb-4 border-b border-[#e2e8f0] pb-3">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-navy">Upload CSV</p>
        </div>
        <p className="mb-3 text-[12px] text-[#6b7280]">
          Required columns:{' '}
          <code className="rounded bg-teal-tint px-1 py-0.5 text-[11px] text-navy">first_name</code>,{' '}
          <code className="rounded bg-teal-tint px-1 py-0.5 text-[11px] text-navy">last_name</code>.{' '}
          Optional:{' '}
          <code className="rounded bg-teal-tint px-1 py-0.5 text-[11px] text-navy">dob</code>,{' '}
          <code className="rounded bg-teal-tint px-1 py-0.5 text-[11px] text-navy">phone</code>,{' '}
          <code className="rounded bg-teal-tint px-1 py-0.5 text-[11px] text-navy">email</code>,{' '}
          <code className="rounded bg-teal-tint px-1 py-0.5 text-[11px] text-navy">address</code>,{' '}
          <code className="rounded bg-teal-tint px-1 py-0.5 text-[11px] text-navy">program</code>.
        </p>

        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFile}
          className="text-[13px] text-[#6b7280] file:mr-3 file:h-8 file:cursor-pointer file:rounded-lg file:border file:border-[#e2e8f0] file:bg-white file:px-3 file:text-[12px] file:font-medium file:text-navy file:transition-colors hover:file:bg-teal-tint"
        />

        {parseError && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-700">{parseError}</p>
        )}

        {preview && !results && (
          <div className="mt-4 flex flex-col gap-3">
            <p className="text-[12px] text-[#6b7280]">
              <span className="font-semibold text-navy">{preview.rows.length} rows</span> ready to import.
              {preview.warnings.length > 0 && (
                <span className="text-amber-600"> {preview.warnings.length} row(s) skipped due to validation errors.</span>
              )}
            </p>

            {preview.warnings.length > 0 && (
              <ul className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-700 flex flex-col gap-1">
                {preview.warnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            )}

            {/* Preview table */}
            <div className="overflow-x-auto rounded-lg border border-[#e2e8f0]">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-[#e2e8f0] bg-teal-tint text-left">
                    <th className="px-3 py-2 font-medium text-[#6b7280]">Name</th>
                    <th className="px-3 py-2 font-medium text-[#6b7280]">DOB</th>
                    <th className="px-3 py-2 font-medium text-[#6b7280]">Phone</th>
                    <th className="px-3 py-2 font-medium text-[#6b7280]">Program</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.slice(0, 5).map((r) => (
                    <tr key={r.row} className="border-b border-[#f1f5f9] last:border-0 hover:bg-teal-tint">
                      <td className="px-3 py-2 text-navy">{r.first_name} {r.last_name}</td>
                      <td className="px-3 py-2 text-[#6b7280]">{r.dob ?? '—'}</td>
                      <td className="px-3 py-2 text-[#6b7280]">{r.phone ?? '—'}</td>
                      <td className="px-3 py-2 text-[#6b7280]">{r.programs?.join(', ') || '—'}</td>
                    </tr>
                  ))}
                  {preview.rows.length > 5 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-2 text-center text-[#6b7280]">
                        …and {preview.rows.length - 5} more rows
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3">
              <button onClick={handleImport} disabled={isPending}
                className="inline-flex h-9 items-center rounded-lg bg-teal px-5 text-[13px] font-medium text-white transition-colors hover:bg-[#D45228] disabled:opacity-60">
                {isPending ? 'Importing…' : `Import ${preview.rows.length} clients`}
              </button>
              <button onClick={handleReset}
                className="inline-flex h-9 items-center rounded-lg border border-[#e2e8f0] bg-white px-4 text-[13px] font-medium text-navy hover:bg-teal-tint">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {results && (
        <div className="rounded-2xl bg-white shadow-sm p-5">
          <div className="mb-4 border-b border-[#e2e8f0] pb-3 flex items-center gap-2">
            <p className="text-[13px] font-semibold uppercase tracking-wide text-navy">Import complete</p>
            <span className="rounded-full bg-teal-light px-2 py-0.5 text-[11px] font-medium text-[#16A34A]">
              {successCount} succeeded
            </span>
            {errorCount > 0 && (
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700">
                {errorCount} failed
              </span>
            )}
          </div>

          {results.some((r) => r.status === 'error') && (
            <ul className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700 flex flex-col gap-1">
              {results.filter((r) => r.status === 'error').map((r) => (
                <li key={r.row}>Row {r.row} ({r.name}): {r.error}</li>
              ))}
            </ul>
          )}

          <div className="flex gap-3">
            <Link href="/clients"
              className="inline-flex h-9 items-center rounded-lg bg-teal px-5 text-[13px] font-medium text-white transition-colors hover:bg-[#D45228]">
              View clients
            </Link>
            <button onClick={handleReset}
              className="inline-flex h-9 items-center rounded-lg border border-[#e2e8f0] bg-white px-4 text-[13px] font-medium text-navy hover:bg-teal-tint">
              Import another file
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
