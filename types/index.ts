export type TournamentStage = 'setup' | 'league' | 'knockouts' | 'completed'
export type MatchStage = 'league' | 'sf1' | 'sf2' | 'final'
export type MatchStatus = 'pending' | 'played' | 'walkover'

export interface Player {
  id: string
  name: string
  badge_url: string | null
  primary_color: string
  created_at: string
}

export interface Match {
  id: string
  player_a: string
  player_b: string
  score_a: number | null
  score_b: number | null
  stage: MatchStage
  status: MatchStatus
  walkover_winner: string | null
  played_at: string | null
  created_at: string
  matchday_number: number | null
  // joined
  player_a_data?: Player
  player_b_data?: Player
}

export interface Standing {
  player: Player
  played: number
  won: number
  drawn: number
  lost: number
  goals_for: number
  goals_against: number
  goal_difference: number
  points: number
  form: ('W' | 'D' | 'L')[]  // last 5, newest right
  streak: { type: 'W' | 'D' | 'L' | null; count: number }
  position: number
  qualified: boolean  // top 4
  tied: boolean       // flagged if tiebreaker needed
}

export interface KnockoutBracket {
  sf1: { home: Player | null; away: Player | null; match: Match | null }
  sf2: { home: Player | null; away: Player | null; match: Match | null }
  final: { home: Player | null; away: Player | null; match: Match | null }
  champion: Player | null
  runner_up: Player | null
}

export interface Award {
  id: 'champion' | 'runner_up' | 'shield' | 'golden_boot' | 'clean_sheet' | 'best_gd'
  label: string
  icon: string
  winner: Player | null
  winners: Player[]       // for ties (e.g. joint Golden Boot)
  value: string | number | null  // e.g. "23 goals", "+18 GD"
}

export interface AdminConfig {
  id: 1
  tournament_stage: TournamentStage
}

// Populated once when admin advances to knockouts; never mutated
// SF1 = seed_1 vs seed_4, SF2 = seed_2 vs seed_3
export interface BracketSeeding {
  id: 1
  seed_1: string | null  // player id (1st place)
  seed_2: string | null  // 2nd place
  seed_3: string | null  // 3rd place
  seed_4: string | null  // 4th place
  seeded_at: string | null
}
