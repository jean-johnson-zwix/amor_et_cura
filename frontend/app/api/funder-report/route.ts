import { NextRequest, NextResponse } from 'next/server'

const AI_API_URL = process.env.NEXT_PUBLIC_AI_API_URL ?? 'http://localhost:8000'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { start_date, end_date, program_filter } = body

  if (!start_date || !end_date) {
    return NextResponse.json({ error: 'start_date and end_date are required' }, { status: 422 })
  }

  let aiRes: Response
  try {
    aiRes = await fetch(`${AI_API_URL}/ai/funder-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ start_date, end_date, program_filter: program_filter ?? null }),
    })
  } catch {
    return NextResponse.json(
      { error: 'Could not reach the AI service. Make sure the backend is running.' },
      { status: 503 }
    )
  }

  const data = await aiRes.json()
  if (!aiRes.ok) {
    return NextResponse.json(
      { error: (data as { detail?: string }).detail ?? 'AI service error' },
      { status: aiRes.status }
    )
  }

  return NextResponse.json(data)
}
