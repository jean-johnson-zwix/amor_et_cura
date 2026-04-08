import { NextRequest, NextResponse } from 'next/server'

const AI_API_URL = process.env.NEXT_PUBLIC_AI_API_URL ?? 'http://localhost:8000'

export async function POST(req: NextRequest) {
  const { client_id } = await req.json()
  if (!client_id) {
    return NextResponse.json({ error: 'client_id is required' }, { status: 422 })
  }

  let aiRes: Response
  try {
    aiRes = await fetch(`${AI_API_URL}/ai/client-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id }),
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
