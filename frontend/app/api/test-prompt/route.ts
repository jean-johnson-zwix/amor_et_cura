import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/supabase/session'

const AI_API_URL = process.env.NEXT_PUBLIC_AI_API_URL ?? 'http://localhost:8000'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (session?.profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const body = await req.json()
  const { task_slug, user_prompt } = body

  if (!task_slug || !user_prompt?.trim()) {
    return NextResponse.json({ error: 'task_slug and user_prompt are required' }, { status: 422 })
  }

  let aiRes: Response
  try {
    aiRes = await fetch(`${AI_API_URL}/ai/test-prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_slug, user_prompt }),
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
