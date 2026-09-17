// ============================================================
// PLAYER TYPES
// ============================================================

export type Position = 'GK' | 'DEF' | 'MID' | 'ATT'

export type GKStyle  = 'Sweeper Keeper' | 'Shot Stopper' | 'Organiser' | 'Distributor'
export type DEFStyle = 'Ball Playing' | 'Aggressive Stopper' | 'Sweeper' | 'Wing Back'
export type MIDStyle = 'Retainer' | 'Creative' | 'Box to Box' | 'Pressing' | 'Anchor'
export type ATTStyle = 'Clinical' | 'Poacher' | 'Target Man' | 'Dribbler' | 'Pressing Forward'
export type PlayerStyle = GKStyle | DEFStyle | MIDStyle | ATTStyle

export type TeamPlaystyle =
  | 'Attacking'
  | 'Defensive'
  | 'Possession'
  | 'Counter Attack'
  | 'Pressing'
  | 'Balanced'

export interface PlayerStats {
  pace:          number
  physicality:   number
  composure:     number
  workRate:      number
  reflexes?:     number
  positioning?:  number
  distribution?: number
  commandOfArea?:number
  defending?:    number
  interceptions?:number
  aerialDuels?:  number
  ballPlaying?:  number
  passing?:      number
  vision?:       number
  pressing?:     number
  ballRetention?:number
  creativity?:   number
  stamina?:      number
  finishing?:    number
  dribbling?:    number
  movement?:     number
  holdUpPlay?:   number
  clinicality?:  number
}

export interface Player {
  id:                  string
  name:                string
  position:            Position
  nationality:         string
  age:                 number
  style:               PlayerStyle
  preferredPlaystyle:  TeamPlaystyle
  stats:               PlayerStats
  overall:             number
  trait:               string
  weaknesses:          string
  archetype?:          string
  secondaryArchetype?: string
}

// ============================================================
// FORMATION TYPES
// ============================================================

export type FormationType =
  | '4-3-3'
  | '4-2-3-1'
  | '4-4-2'
  | '3-5-2'
  | '4-1-2-1-2'
  | '5-3-2'
  | '3-4-3'

export interface FormationRequirements {
  GK:  number
  DEF: number
  MID: number
  ATT: number
}

export interface FormationBonus {
  attack?:             number
  defense?:            number
  possession?:         number
  midfield?:           number
  chemistry?:          number
  chanceCreation?:     number
  defensiveWidth?:     number
  defensiveStability?: number
  pressing?:           number
  counterAttack?:      number
}

export interface Formation {
  type:            FormationType
  name:            string
  requirements:    FormationRequirements
  bonuses:         FormationBonus
  description:     string
  naturalPlaystyle:TeamPlaystyle
  positions:       PitchPosition[]
}

export interface PitchPosition {
  id:         string
  label:      string
  position:   Position
  x:          number
  y:          number
  slotIndex:  number
}

// ============================================================
// CHEMISTRY TYPES
// ============================================================

export interface ChemistryBonuses {
  attackBoost:     number
  defenseBoost:    number
  possessionBoost: number
  pressingBoost:   number
  counterBoost:    number
}

export interface ChemistryBreakdown {
  overall:           number
  playstyleSync:     number
  positionalBalance: number
  styleConsistency:  number
  label:             string
  color:             string
  bonuses:           ChemistryBonuses
}

// ============================================================
// TEAM TYPES
// ============================================================

export interface SquadSlot {
  positionId: string
  position:   Position
  playerId:   string | null
}

export interface Team {
  id:          string
  name:        string
  formation:   FormationType
  playstyle:   TeamPlaystyle
  squad:       SquadSlot[]
  captainId:   string | null
  isUserTeam:  boolean
}

// ============================================================
// TOURNAMENT TYPES
// ============================================================

export type TournamentStage = 'ROUND_OF_32' | 'ROUND_OF_16' | 'QUARTER_FINAL' | 'SEMI_FINAL' | 'FINAL'
export type MatchStatus     = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'

export interface MatchEvent {
  minute:       number
  type:         'GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'SAVE' | 'MISS' | 'BIG_CHANCE' | 'FOUL' | 'VAR_CHECK' | 'COUNTER' | 'PRESS_WIN'
  teamId:       string
  playerName?:  string
  description:  string
}

export interface MatchStats {
  possession:    [number, number]
  shots:         [number, number]
  shotsOnTarget: [number, number]
  goals:         [number, number]
  fouls:         [number, number]
  yellowCards:   [number, number]
  redCards:      [number, number]
  corners:       [number, number]
  saves:         [number, number]
  bigChances:    [number, number]
  counterAttacks:[number, number]
}

export interface Match {
  id:            string
  stage:         TournamentStage
  homeTeamId:    string
  awayTeamId:    string
  homeTeamName:  string
  awayTeamName:  string
  status:        MatchStatus
  stats?:        MatchStats
  events?:       MatchEvent[]
  winnerId?:     string | null
  score?:        [number, number]
}

export interface TournamentTeam {
  id:          string
  name:        string
  formation:   FormationType
  playstyle:   TeamPlaystyle
  squad:       SquadSlot[]
  captainId:   string | null
  isUserTeam:  boolean
  strength:    number
  difficulty?: 'weak' | 'medium' | 'strong'
  eliminated:  boolean
}

export interface Tournament {
  id:           string
  status:       'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
  currentStage: TournamentStage | null
  teams:        TournamentTeam[]
  matches:      Match[]
  winnerId:     string | null
  userTeamId:   string
  stats:        TournamentStats
}

export interface TournamentStats {
  totalGoals:        number
  totalMatches:      number
  userGoalsScored:   number
  userGoalsConceded: number
  userMatchesPlayed: number
  userMatchesWon:    number
}

// ============================================================
// SIMULATION TYPES
// ============================================================

export interface TeamStrength {
  overall:       number
  attack:        number
  midfield:      number
  defense:       number
  gk:            number
  chemistry:     ChemistryBreakdown
  formationBonus:FormationBonus
  captainBonus:  number
  playstyle:     TeamPlaystyle
  pressing:      number
  counterAttack: number
  archetypeFit?: number
}

export interface SimulationResult {
  homeGoals: number
  awayGoals: number
  stats:     MatchStats
  events:    MatchEvent[]
}

// ============================================================
// APP TYPES
// ============================================================

export type AppPage =
  | 'HOME'
  | 'SQUAD_BUILDER'
  | 'FORMATION'
  | 'TOURNAMENT'
  | 'MATCH'
  | 'RESULTS'

export interface AppState {
  currentPage:  AppPage
  players:      Player[]
  userTeam:     Team | null
  tournament:   Tournament | null
  currentMatch: Match | null
}

export interface FilterOptions {
  search:    string
  position:  Position | 'ALL'
  sortBy:    string
  sortOrder: 'asc' | 'desc'
}

export interface LocalStorageData {
  userTeam:    Team | null
  tournament:  Tournament | null
  players:     Player[]
  lastSaved:   string
}