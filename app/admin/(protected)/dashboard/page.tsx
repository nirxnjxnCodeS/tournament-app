import { getSupabaseServer } from '@/lib/supabase-server'
import { MatchSettingsCard } from './MatchSettingsCard'
import { StartLeagueButton } from './StartLeagueButton'

export const metadata = { title: 'Admin Dashboard' }

const DEFAULT_SETTINGS = { league_match_duration: 10, semi_match_duration: 12, final_match_duration: 15 }

export default async function DashboardPage() {
  const db = await getSupabaseServer()

  const [
    { data: config },
    { count: playedCount },
    { count: totalCount },
    { data: goals },
    { data: settings },
    { count: playerCount },
  ] = await Promise.all([
    db.from('admin_config').select('tournament_stage').eq('id', 1).single(),
    db.from('matches').select('id', { count: 'exact', head: true }).in('status', ['played', 'walkover']),
    db.from('matches').select('id', { count: 'exact', head: true }).eq('stage', 'league'),
    db.from('matches').select('score_a, score_b').eq('status', 'played'),
    db.from('tournament_settings').select('*').eq('id', 1).maybeSingle(),
    db.from('players').select('id', { count: 'exact', head: true }),
  ])

  const totalGoals = (goals ?? []).reduce(
    (sum, m) => sum + (m.score_a ?? 0) + (m.score_b ?? 0),
    0,
  )

  const stage = config?.tournament_stage ?? 'setup'
  const stageLabel: Record<string, string> = {
    setup:     'Setup',
    league:    'League Stage',
    knockouts: 'Knockout Stage',
    completed: 'Completed',
  }

  const s = settings ?? DEFAULT_SETTINGS

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-text">Dashboard</h1>
        <p className="text-sm text-text-muted mt-0.5">
          Stage: <span className="text-accent font-medium">{stageLabel[stage]}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Matches played" value={`${playedCount ?? 0} / ${totalCount ?? 66}`} />
        <StatCard label="Goals scored"   value={String(totalGoals)} />
        <StatCard label="Stage"          value={stageLabel[stage]} accent />
      </div>

      {stage === 'setup' && (
        <StartLeagueButton playerCount={playerCount ?? 0} />
      )}

      <MatchSettingsCard
        leagueDuration={s.league_match_duration}
        semiDuration={s.semi_match_duration}
        finalDuration={s.final_match_duration}
      />
    </div>
  )
}

function StatCard({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-surface border border-border rounded-card px-4 py-4">
      <p className="text-xs text-text-muted mb-1">{label}</p>
      <p className={`text-xl font-bold ${accent ? 'text-accent' : 'text-text'}`}>{value}</p>
    </div>
  )
}
