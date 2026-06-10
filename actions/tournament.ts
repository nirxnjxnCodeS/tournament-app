'use server'

import { requireAdmin } from './auth'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { generateRoundRobin, validateFixtures } from '@/lib/fixtures'
import { computeStandings } from '@/lib/standings'
import { getSeedsFromStandings } from '@/lib/bracket'
import { createKnockoutMatch } from './matches'
import { revalidatePath } from 'next/cache'
import type { Match, Player } from '@/types'

function revalidateAll() {
  revalidatePath('/', 'layout')
}

// ── Setup → League ────────────────────────────────────────────────────
export async function startLeague(): Promise<{ error?: string }> {
  await requireAdmin()
  const db = getSupabaseAdmin()

  // Must have exactly 12 players
  const { data: players, error: pErr } = await db
    .from('players')
    .select('*')
    .order('created_at')
  if (pErr) return { error: pErr.message }
  if (!players || players.length !== 12) {
    return { error: `Need exactly 12 players (have ${players?.length ?? 0})` }
  }

  // Generate and validate all 66 fixtures
  const fixtures = generateRoundRobin(players.map((p) => p.id))
  if (!validateFixtures(fixtures, 12)) {
    return { error: 'Fixture generation failed validation — this is a bug' }
  }

  // Batch insert all 66 matches
  const { error: mErr } = await db.from('matches').insert(
    fixtures.map((f) => ({ ...f, status: 'pending' }))
  )
  if (mErr) return { error: mErr.message }

  const { error: stageErr } = await db
    .from('admin_config')
    .update({ tournament_stage: 'league' })
    .eq('id', 1)
  if (stageErr) return { error: stageErr.message }

  revalidateAll()
  return {}
}

// ── League → Knockouts ────────────────────────────────────────────────
// Returns pendingCount > 0 as a warning payload so the UI can show the
// "X matches still pending — proceed anyway?" modal (edge case 4).
export async function advanceToKnockouts(): Promise<{
  error?: string
  pendingCount?: number
  requiresConfirm?: boolean
}> {
  await requireAdmin()
  const db = getSupabaseAdmin()

  const { data: config } = await db.from('admin_config').select('tournament_stage').eq('id', 1).single()
  if (config?.tournament_stage !== 'league') return { error: 'Tournament is not in league stage' }

  // Check for pending matches
  const { count: pendingCount } = await db
    .from('matches')
    .select('id', { count: 'exact', head: true })
    .eq('stage', 'league')
    .eq('status', 'pending')

  if ((pendingCount ?? 0) > 0) {
    return { pendingCount: pendingCount ?? 0, requiresConfirm: true }
  }

  return _doAdvanceToKnockouts()
}

// Called after admin confirms the warning modal
export async function confirmAdvanceToKnockouts(): Promise<{ error?: string }> {
  await requireAdmin()
  const db = getSupabaseAdmin()

  const { data: config } = await db.from('admin_config').select('tournament_stage').eq('id', 1).single()
  if (config?.tournament_stage !== 'league') return { error: 'Tournament is not in league stage' }

  return _doAdvanceToKnockouts()
}

async function _doAdvanceToKnockouts(): Promise<{ error?: string }> {
  const db = getSupabaseAdmin()

  // Fetch all league matches + players to compute standings
  const [{ data: players }, { data: matches }] = await Promise.all([
    db.from('players').select('*'),
    db.from('matches').select('*').eq('stage', 'league'),
  ])
  if (!players || !matches) return { error: 'Failed to fetch data' }

  const standings = computeStandings(players as Player[], matches as Match[])
  const [s1, s2, s3, s4] = getSeedsFromStandings(standings)

  if (!s1 || !s2 || !s3 || !s4) return { error: 'Could not determine top 4 seeds' }

  // Write bracket seeding (single row, upsert)
  const { error: seedErr } = await db
    .from('bracket_seeding')
    .upsert({ id: 1, seed_1: s1.id, seed_2: s2.id, seed_3: s3.id, seed_4: s4.id })
  if (seedErr) return { error: seedErr.message }

  // Create SF matches: SF1 = seed1 vs seed4, SF2 = seed2 vs seed3
  const sf1 = await createKnockoutMatch(s1.id, s4.id, 'sf1')
  if (sf1.error) return { error: sf1.error }
  const sf2 = await createKnockoutMatch(s2.id, s3.id, 'sf2')
  if (sf2.error) return { error: sf2.error }

  // Advance stage
  const { error: stageErr } = await db
    .from('admin_config')
    .update({ tournament_stage: 'knockouts' })
    .eq('id', 1)
  if (stageErr) return { error: stageErr.message }

  revalidateAll()
  return {}
}

// ── Knockouts → Completed ─────────────────────────────────────────────
export async function completeTournament(): Promise<{ error?: string }> {
  await requireAdmin()
  const db = getSupabaseAdmin()

  // All 3 knockout matches must be played or walkover
  const { data: koMatches } = await db
    .from('matches')
    .select('stage, status')
    .in('stage', ['sf1', 'sf2', 'final'])
  if (!koMatches || koMatches.length < 3) return { error: 'Not all knockout matches exist yet' }
  const allDone = koMatches.every((m) => m.status === 'played' || m.status === 'walkover')
  if (!allDone) return { error: 'All 3 knockout matches must be played first' }

  const { error } = await db
    .from('admin_config')
    .update({ tournament_stage: 'completed' })
    .eq('id', 1)
  if (error) return { error: error.message }

  revalidateAll()
  return {}
}

// ── Reset bracket seeding (escape hatch) ─────────────────────────────
// Deletes the seeding row and resets all knockout matches to pending.
// Guard: only callable when stage = 'knockouts' AND no knockout match
// has status = 'played' or 'walkover'. Once one KO match is played,
// the bracket is locked forever.
export async function resetBracketSeeding(): Promise<{ error?: string }> {
  await requireAdmin()
  const db = getSupabaseAdmin()

  const { data: config } = await db.from('admin_config').select('tournament_stage').eq('id', 1).single()
  if (config?.tournament_stage !== 'knockouts') {
    return { error: 'Can only reset bracket during knockout stage' }
  }

  // Block if any knockout match has been played
  const { count: playedCount } = await db
    .from('matches')
    .select('id', { count: 'exact', head: true })
    .in('stage', ['sf1', 'sf2', 'final'])
    .in('status', ['played', 'walkover'])
  if ((playedCount ?? 0) > 0) {
    return { error: 'Bracket is locked — a knockout match has already been played' }
  }

  // Delete knockout matches and seeding row, revert stage to league
  const { error: delMatchErr } = await db
    .from('matches')
    .delete()
    .in('stage', ['sf1', 'sf2', 'final'])
  if (delMatchErr) return { error: delMatchErr.message }

  const { error: delSeedErr } = await db
    .from('bracket_seeding')
    .delete()
    .eq('id', 1)
  if (delSeedErr) return { error: delSeedErr.message }

  const { error: stageErr } = await db
    .from('admin_config')
    .update({ tournament_stage: 'league' })
    .eq('id', 1)
  if (stageErr) return { error: stageErr.message }

  revalidateAll()
  return {}
}

// ── Match duration settings ───────────────────────────────────────────
export async function updateMatchSettings(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  await requireAdmin()
  const db = getSupabaseAdmin()

  const league = Number(formData.get('league_match_duration'))
  const semi   = Number(formData.get('semi_match_duration'))
  const fin    = Number(formData.get('final_match_duration'))

  if (!Number.isInteger(league) || league < 5 || league > 30) return { error: 'League duration must be 5–30 min' }
  if (!Number.isInteger(semi)   || semi   < 5 || semi   > 30) return { error: 'Semi-final duration must be 5–30 min' }
  if (!Number.isInteger(fin)    || fin    < 5 || fin    > 30) return { error: 'Final duration must be 5–30 min' }

  const { error } = await db
    .from('tournament_settings')
    .upsert({ id: 1, league_match_duration: league, semi_match_duration: semi, final_match_duration: fin })

  if (error) return { error: error.message }

  revalidateAll()
  return {}
}
