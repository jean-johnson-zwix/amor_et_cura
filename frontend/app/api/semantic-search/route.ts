import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const AI_API_URL = process.env.NEXT_PUBLIC_AI_API_URL ?? 'http://localhost:8000'

export async function POST(req: NextRequest) {
  const { query } = await req.json()
  if (!query?.trim()) {
    return NextResponse.json({ error: 'query is required' }, { status: 422 })
  }

  // 1 — Embed the search query
  let embedding: number[]
  try {
    const embedRes = await fetch(`${AI_API_URL}/ai/embed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: query.trim() }),
    })
    if (!embedRes.ok) {
      const err = await embedRes.json().catch(() => ({}))
      return NextResponse.json(
        { error: err.detail ?? 'Embedding service unavailable. Try again in a moment.' },
        { status: 503 }
      )
    }
    const data = await embedRes.json()
    embedding = data.embedding
  } catch {
    return NextResponse.json(
      { error: 'Could not reach the AI service. Make sure the backend is running.' },
      { status: 503 }
    )
  }

  // 2 — Similarity search in Supabase via pgvector RPC
  const supabase = await createClient()
  const { data: results, error } = await supabase.rpc('search_visits_by_embedding', {
    query_embedding: JSON.stringify(embedding),
    match_threshold: 0.4,
    match_count: 8,
  })

  if (error) {
    console.error('semantic-search: rpc error', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ results: results ?? [] })
}
