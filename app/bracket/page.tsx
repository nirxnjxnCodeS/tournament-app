import { getSupabaseServer } from '@/lib/supabase-server'
import { computeStandings } from '@/lib/standings'
import { buildBracket } from '@/lib/bracket'
import type { BracketSeeding, Match, Player } from '@/types'
import { BracketTree } from './BracketTree'

export const metadata = { title: 'Bracket' }

export default async function BracketPage() {
  const db = await getSupabaseServer()

  const [{ data: config }, { data: players }, { data: allMatches }, { data: seeding }] =
    await Promise.all([
      db.from('admin_config').select('tournament_stage').eq('id', 1).single(),
      db.from('players').select('*'),
      db.from('matches').select('*'),
      db.from('bracket_seeding').select('*').eq('id', 1).maybeSingle(),
    ])

  const stage = config?.tournament_stage ?? 'setup'
  const playerMap = new Map((players ?? []).map((p) => [p.id, p as Player]))

  if (stage === 'setup' || stage === 'league') {
    // Pre-knockout: show standings with top-4 "will advance" indicator
    const leagueMatches = (allMatches ?? []).filter((m) => m.stage === 'league') as Match[]
    const standings = computeStandings((players ?? []) as Player[], leagueMatches)

    return (
      <div className="px-4 py-6 max-w-lg mx-auto flex flex-col gap-4">
        <h1 className="text-lg font-semibold text-text">Bracket</h1>
        <div className="bg-surface border border-border rounded-card overflow-hidden">
          <div className="px-4 py-2.5 bg-accent/10 border-b border-border">
            <p className="text-xs font-semibold text-accent uppercase tracking-wider">
              {stage === 'setup' ? 'League not started' : 'Top 4 will advance to knockouts'}
            </p>
          </div>
          {standings.length === 0 ? (
            <p className="text-sm text-text-faint text-center py-8">No matches played yet</p>
          ) : (
            <div className="divide-y divide-border-subtle">
              {standings.map((s) => (
                <div
                  key={s.player.id}
                  className={`flex items-center gap-3 px-4 py-3 ${!s.qualified ? 'opacity-40' : ''}`}
                >
                  <span className="text-sm tabular-nums text-text-muted w-5 text-right shrink-0">{s.position}</span>
                  <div
                    className="size-6 rounded-full shrink-0"
                    style={{ backgroundColor: s.player.primary_color }}
                  />
                  <span className="text-sm font-medium text-text flex-1 truncate">{s.player.name}</span>
                  <span className="text-sm tabular-nums font-bold text-text">{s.points}</span>
                  {s.qualified && (
                    <span className="text-[10px] font-semibold text-accent uppercase tracking-wider shrink-0">✓ Q</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  const koMatches = (allMatches ?? []).filter((m) => m.stage !== 'league') as Match[]
  const bracket = buildBracket(seeding as BracketSeeding | null, playerMap, koMatches)

  return (
    <div className="px-4 py-6 max-w-3xl mx-auto flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-text">Bracket</h1>
      <BracketTree bracket={bracket} stage={stage} />
    </div>
  )
}
