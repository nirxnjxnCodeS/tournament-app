'use server'

import { requireAdmin } from './auth'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import type { MatchStage } from '@/types'

type MatchActionState = { error?: string } | null

function revalidateAll() {
  revalidatePath('/', 'layout')
}

export async function enterScore(
  _prev: MatchActionState,
  formData: FormData,
): Promise<MatchActionState> {
  await requireAdmin()
  const db = getSupabaseAdmin()

  const id      = formData.get('id') as string
  const score_a = Number(formData.get('score_a'))
  const score_b = Number(formData.get('score_b'))

  if (!id) return { error: 'Match ID required' }
  if (!Number.isInteger(score_a) || score_a < 0 || score_a > 20) return { error: 'Invalid score for player A' }
  if (!Number.isInteger(score_b) || score_b < 0 || score_b > 20) return { error: 'Invalid score for player B' }

  const { data: match, error: fetchError } = await db
    .from('matches')
    .select('stage, status')
    .eq('id', id)
    .single()
  if (fetchError || !match) return { error: 'Match not found' }

  if (match.stage !== 'league' && score_a === score_b) {
    return { error: 'Draws not allowed in knockout stage' }
  }

  const { error } = await db
    .from('matches')
    .update({
      score_a,
      score_b,
      status: 'played',
      walkover_winner: null,
      played_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidateAll()
  return {}
}

export async function declareWalkover(
  _prev: MatchActionState,
  formData: FormData,
): Promise<MatchActionState> {
  await requireAdmin()
  const db = getSupabaseAdmin()

  const id              = formData.get('id') as string
  const walkover_winner = formData.get('walkover_winner') as string

  if (!id || !walkover_winner) return { error: 'Match ID and winner required' }

  const { data: match, error: fetchError } = await db
    .from('matches')
    .select('player_a, player_b')
    .eq('id', id)
    .single()
  if (fetchError || !match) return { error: 'Match not found' }
  if (walkover_winner !== match.player_a && walkover_winner !== match.player_b) {
    return { error: 'Winner must be a match participant' }
  }

  const { error } = await db
    .from('matches')
    .update({
      status: 'walkover',
      walkover_winner,
      score_a: null,
      score_b: null,
      played_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidateAll()
  return {}
}

// editScore and revertWalkoverToScore share the same path as enterScore.
// Both clear walkover_winner, set status='played', save actual scores.
export async function editScore(
  _prev: MatchActionState,
  formData: FormData,
): Promise<MatchActionState> {
  return enterScore(_prev, formData)
}

export async function revertWalkoverToScore(
  _prev: MatchActionState,
  formData: FormData,
): Promise<MatchActionState> {
  return enterScore(_prev, formData)
}

export async function resetMatch(matchId: string): Promise<{ error?: string }> {
  await requireAdmin()
  const db = getSupabaseAdmin()

  const { data: match, error: fetchError } = await db
    .from('matches')
    .select('status')
    .eq('id', matchId)
    .single()
  if (fetchError || !match) return { error: 'Match not found' }
  if (match.status !== 'played' && match.status !== 'walkover') {
    return { error: 'Only played or walkover matches can be reset' }
  }

  const { error } = await db
    .from('matches')
    .update({
      score_a: null,
      score_b: null,
      status: 'pending',
      played_at: null,
      walkover_winner: null,
    })
    .eq('id', matchId)

  if (error) return { error: error.message }

  revalidateAll()
  return {}
}

// ── Knockout match creation ───────────────────────────────────────────
// Internal helper — only called from advanceToKnockouts which guards with requireAdmin
export async function createKnockoutMatch(
  player_a: string,
  player_b: string,
  stage: MatchStage,
): Promise<{ error?: string }> {
  const db = getSupabaseAdmin()
  const { error } = await db
    .from('matches')
    .insert({ player_a, player_b, stage, status: 'pending' })
  if (error) return { error: error.message }
  return {}
}
