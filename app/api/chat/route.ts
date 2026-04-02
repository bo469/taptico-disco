import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are Bo, the AI Chief Agent Officer at Taptico Solutions. You are conducting a discovery interview with a team member at Southern Lighting Source (SLS), a commercial and industrial lighting and controls manufacturer's rep agency in Atlanta, GA.

SLS CONTEXT:
- Founded 2006, HQ at 800 Battery Ave SE, Atlanta
- Territory: Georgia, Tennessee, Alabama
- Recently secured Acuity Brands representation for all of Georgia
- 51-200 employees
- Key projects include TRIMONT (Atlanta) and UTA (Nashville)
- PET/preferred vendor status with CBRE, Turner Construction, Cushman & Wakefield
- They have 17 documented successful projects
- Uses Microsoft 365
- Tagline: "On Time. On Budget. Beautiful."

YOUR PERSONALITY:
- Warm, witty, conversational. Not corporate. Not stiff.
- You are genuinely curious about their daily work life
- Use light humor when natural but never at their expense
- You ask ONE question at a time and wait for the answer
- You listen carefully and ask smart follow-ups that show you heard them
- You occasionally validate their frustrations with empathy
- Keep responses concise: 2-4 sentences max, then your question
- Never use em dashes or emojis
- Do not lecture or pitch. Just listen and learn.

YOUR GOAL:
Interview this person to discover:
1. What their actual day-to-day looks like
2. What tasks eat up the most time
3. What processes feel broken, slow, or frustrating
4. What information is hard to find or scattered
5. What they wish they could automate or hand off
6. What would make their work life meaningfully better

INTERVIEW FLOW:
- Start by greeting them by name and role, make them feel seen
- Ask about their typical day or week first (broad, easy question)
- Then drill into specific pain points they mention
- Ask "what does that actually look like?" or "how much time does that take?" to get specifics
- After 5-7 exchanges, start wrapping up with a summary of what you heard
- End by thanking them and telling them this will directly shape the AI solutions Taptico builds for SLS

IMPORTANT: You already know the high-level SLS engagement (ABM, Bid Hunting, The Grid). But do NOT assume you know this person's specific problems. That is the whole point of this conversation. Listen first.`

export async function POST(request: NextRequest) {
  try {
    const { messages, clientSlug, sessionId, userIdentifier } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    // Resolve identifiers with safe defaults
    const resolvedClientSlug = clientSlug || 'unknown'
    const resolvedSessionId = sessionId || `anon-${Date.now()}`

    // Get the last user message to persist before sending to Claude
    const lastMessage = messages[messages.length - 1]

    // Persist incoming user message to Supabase (best-effort, non-blocking)
    const supabaseAdmin = getSupabaseAdmin()
    if (lastMessage && lastMessage.role === 'user' && supabaseAdmin) {
      supabaseAdmin
        .from('messages')
        .insert({
          session_id: resolvedSessionId,
          client_slug: resolvedClientSlug,
          role: 'user',
          content: lastMessage.content,
        })
        .then(({ error }) => {
          if (error) console.error('Supabase insert (user message) error:', error.message)
        })
    }

    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: messages,
    })

    const reply = response.content
      .filter((item: any) => item.type === 'text')
      .map((item: any) => item.text)
      .join('\n')

    // Persist assistant reply to Supabase (best-effort, non-blocking)
    supabaseAdmin &&
    supabaseAdmin
      .from('messages')
      .insert({
        session_id: resolvedSessionId,
        client_slug: resolvedClientSlug,
        role: 'assistant',
        content: reply,
      })
      .then(({ error }) => {
        if (error) console.error('Supabase insert (assistant message) error:', error.message)
      })

    // Update user XP: upsert row, increment interviews_done on first message
    if (userIdentifier && supabaseAdmin) {
      const isFirstMessage = messages.length === 1
      if (isFirstMessage) {
        supabaseAdmin
          .from('user_xp')
          .upsert(
            {
              client_slug: resolvedClientSlug,
              user_identifier: userIdentifier,
              xp: 10,
              interviews_done: 1,
              last_active: new Date().toISOString(),
            },
            {
              onConflict: 'client_slug,user_identifier',
              ignoreDuplicates: false,
            }
          )
          .then(({ error }) => {
            if (error) console.error('Supabase upsert (user_xp) error:', error.message)
          })
      } else {
        // Update last_active and accumulate XP on each subsequent message
        supabaseAdmin
          .from('user_xp')
          .upsert(
            {
              client_slug: resolvedClientSlug,
              user_identifier: userIdentifier,
              last_active: new Date().toISOString(),
            },
            {
              onConflict: 'client_slug,user_identifier',
              ignoreDuplicates: false,
            }
          )
          .then(({ error }) => {
            if (error) console.error('Supabase upsert (user_xp last_active) error:', error.message)
          })
      }
    }

    return NextResponse.json({ success: true, reply })
  } catch (error: any) {
    console.error('Chat API error:', error?.message || error)
    return NextResponse.json(
      { success: false, error: 'Chat failed. Please try again.' },
      { status: 500 }
    )
  }
}
