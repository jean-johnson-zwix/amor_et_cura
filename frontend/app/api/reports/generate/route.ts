import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/supabase/session'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { dateFrom, dateTo, program } = await request.json()

  // Fetch visit data from Supabase (falls back to stub summary if no data yet)
  const supabase = await createClient()
  const query = supabase
    .from('visits')
    .select('visit_date, notes, service_types(name), profiles(full_name), clients(first_name, last_name, program)')
    .gte('visit_date', dateFrom)
    .lte('visit_date', dateTo)
    .order('visit_date', { ascending: true })

  const { data: visits } = await query

  // Build context for Claude
  let dataContext = ''
  if (visits && visits.length > 0) {
    const filteredVisits = program
      ? visits.filter((v: any) => v.clients?.program === program)
      : visits

    const totalVisits = filteredVisits.length
    const uniqueClients = new Set(filteredVisits.map((v: any) => `${v.clients?.first_name} ${v.clients?.last_name}`)).size
    const serviceBreakdown = filteredVisits.reduce((acc: Record<string, number>, v: any) => {
      const name = (v.service_types as any)?.name ?? 'Unknown'
      acc[name] = (acc[name] ?? 0) + 1
      return acc
    }, {})

    dataContext = `
Real data from the database:
- Date range: ${dateFrom} to ${dateTo}
- Program filter: ${program || 'All programs'}
- Total visits: ${totalVisits}
- Unique clients served: ${uniqueClients}
- Services breakdown: ${Object.entries(serviceBreakdown).map(([k, v]) => `${k} (${v})`).join(', ')}
- Sample notes: ${filteredVisits.slice(0, 5).map((v: any) => v.notes).filter(Boolean).join(' | ')}
`
  } else {
    // Stub context for demo when no real data exists
    dataContext = `
Demo data (no real visits in database yet):
- Date range: ${dateFrom} to ${dateTo}
- Program filter: ${program || 'All programs'}
- Total visits: 32
- Unique clients served: 12
- Services breakdown: Case Management (8), Food Assistance (6), Housing Support (5), Mental Health Services (5), Employment Support (4), Medical Referral (4)
- Highlights: Clients showed improved housing stability, several successful employment placements, ongoing mental health support coordination
`
  }

  const prompt = `You are a grant writer for a nonprofit called "Amor et Cura" that provides case management services.

Write a professional funder-ready narrative report based on the following service data:

${dataContext}

The report should:
1. Start with an executive summary (2-3 sentences)
2. Describe the clients served and their needs
3. Highlight key services delivered and outcomes
4. Include specific numbers and metrics
5. End with a forward-looking statement about impact

Write in a warm, professional tone suitable for grant reports. Use markdown formatting with headers.`

  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta'
        ) {
          controller.enqueue(new TextEncoder().encode(chunk.delta.text))
        }
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
