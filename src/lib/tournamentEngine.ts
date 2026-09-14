import { 
  Tournament, Match, TournamentStage, TournamentTeam, 
  Team, Player, MatchStats, MatchEvent
} from '@/types'
import { simulateMatch, calculateTeamStrength, generateAITeam } from './simulationEngine'
import { getAllFormations } from '@/data/formations'

// ============================================================
// AI TEAM NAMES
// ============================================================

export const AI_TEAM_NAMES = [
  'Red Dragons FC',
  'Steel City United',
  'Northern Wolves',
  'Coastal Sharks',
  'Mountain Lions',
  'Desert Storm FC',
  'River Rapids',
]

const AI_FORMATIONS = ['4-3-3', '4-4-2', '4-2-3-1', '3-5-2', '5-3-2', '3-4-3', '4-1-2-1-2']

// ============================================================
// CREATE TOURNAMENT
// ============================================================

export function createTournament(
  userTeam: Team,
  allPlayers: Player[]
): Tournament {
  const tournamentId = `tournament_${Date.now()}`
  const userTournamentTeam: TournamentTeam = {
    ...userTeam,
    isUserTeam: true,
    strength: 75,
    eliminated: false,
  }

  // Generate 7 AI teams
  const teams: TournamentTeam[] = [userTournamentTeam]
  const strengths: Array<'weak' | 'medium' | 'strong'> = [
    'medium', 'medium', 'strong', 'weak', 'medium', 'strong', 'weak'
  ]

  // Get players NOT in user squad
  const userPlayerIds = new Set(userTeam.squad.map(s => s.playerId).filter(Boolean))
  const remainingPlayers = allPlayers.filter(p => !userPlayerIds.has(p.id))

  for (let i = 0; i < 7; i++) {
    const formation = AI_FORMATIONS[i % AI_FORMATIONS.length] as any
    const aiTeam = generateAITeam(
      `ai_team_${i + 1}`,
      AI_TEAM_NAMES[i],
      formation,
      remainingPlayers,
      strengths[i]
    )
    teams.push(aiTeam)
  }

  // Shuffle teams for bracket seeding
  const shuffledTeams = shuffleArray([...teams])

  // Create quarter final matches
  // QF: [0]v[1], [2]v[3], [4]v[5], [6]v[7]
  const qfMatches: Match[] = []
  for (let i = 0; i < 4; i++) {
    const home = shuffledTeams[i * 2]
    const away = shuffledTeams[i * 2 + 1]
    qfMatches.push({
      id: `match_qf_${i + 1}`,
      stage: 'QUARTER_FINAL',
      homeTeamId: home.id,
      awayTeamId: away.id,
      homeTeamName: home.name,
      awayTeamName: away.name,
      status: 'PENDING',
    })
  }

  return {
    id: tournamentId,
    status: 'IN_PROGRESS',
    currentStage: 'QUARTER_FINAL',
    teams,
    matches: qfMatches,
    winnerId: null,
    userTeamId: userTeam.id,
    stats: {
      totalGoals: 0,
      totalMatches: 0,
      userGoalsScored: 0,
      userGoalsConceded: 0,
      userMatchesPlayed: 0,
      userMatchesWon: 0,
    },
  }
}

// ============================================================
// SIMULATE A MATCH
// ============================================================

export function simulateTournamentMatch(
  match: Match,
  tournament: Tournament,
  allPlayers: Player[]
): Match {
  const homeTeam = tournament.teams.find(t => t.id === match.homeTeamId)!
  const awayTeam = tournament.teams.find(t => t.id === match.awayTeamId)!

  const homeStrength = calculateTeamStrength(homeTeam, allPlayers)
  const awayStrength = calculateTeamStrength(awayTeam, allPlayers)

  const result = simulateMatch(
    homeStrength,
    awayStrength,
    match.homeTeamId,
    match.awayTeamId,
    match.homeTeamName,
    match.awayTeamName
  )

  let winnerId: string | null
  
  // Check if there was a penalty shootout
  const penaltyData = (result.stats as any).penaltyShootout
  if (result.homeGoals === result.awayGoals && penaltyData) {
    // Regular time was a draw, determine winner from penalties
    winnerId = penaltyData.homeGoals > penaltyData.awayGoals
      ? match.homeTeamId
      : match.awayTeamId
  } else {
    // Regular time winner
    winnerId = result.homeGoals === result.awayGoals
      ? null
      : result.homeGoals > result.awayGoals
        ? match.homeTeamId
        : match.awayTeamId
  }

  return {
    ...match,
    status: 'COMPLETED',
    stats: result.stats,
    events: result.events,
    score: [result.homeGoals, result.awayGoals],
    winnerId,
  }
}

// ============================================================
// ADVANCE TOURNAMENT
// ============================================================

export function advanceTournament(
  tournament: Tournament,
  completedMatch: Match,
  allPlayers: Player[]
): Tournament {
  const updatedTournament = { ...tournament }
  
  // Update match in list
  updatedTournament.matches = tournament.matches.map(m => 
    m.id === completedMatch.id ? completedMatch : m
  )

  // Update stats
  const isUserMatch = 
    completedMatch.homeTeamId === tournament.userTeamId ||
    completedMatch.awayTeamId === tournament.userTeamId

  if (isUserMatch && completedMatch.stats) {
    const userIsHome = completedMatch.homeTeamId === tournament.userTeamId
    const userGoals  = userIsHome ? completedMatch.stats.goals[0] : completedMatch.stats.goals[1]
    const oppGoals   = userIsHome ? completedMatch.stats.goals[1] : completedMatch.stats.goals[0]
    const userWon    = completedMatch.winnerId === tournament.userTeamId

    updatedTournament.stats = {
      ...tournament.stats,
      totalGoals:          tournament.stats.totalGoals + (completedMatch.score?.[0] ?? 0) + (completedMatch.score?.[1] ?? 0),
      totalMatches:        tournament.stats.totalMatches + 1,
      userGoalsScored:     tournament.stats.userGoalsScored + userGoals,
      userGoalsConceded:   tournament.stats.userGoalsConceded + oppGoals,
      userMatchesPlayed:   tournament.stats.userMatchesPlayed + 1,
      userMatchesWon:      tournament.stats.userMatchesWon + (userWon ? 1 : 0),
    }
  } else if (completedMatch.stats) {
    updatedTournament.stats = {
      ...tournament.stats,
      totalGoals:   tournament.stats.totalGoals + (completedMatch.score?.[0] ?? 0) + (completedMatch.score?.[1] ?? 0),
      totalMatches: tournament.stats.totalMatches + 1,
    }
  }

  // Mark loser as eliminated
  if (completedMatch.winnerId) {
    const loserId = completedMatch.winnerId === completedMatch.homeTeamId 
      ? completedMatch.awayTeamId 
      : completedMatch.homeTeamId

    updatedTournament.teams = tournament.teams.map(t => 
      t.id === loserId ? { ...t, eliminated: true } : t
    )
  }

  // Check if current stage is complete
  const currentStageMatches = updatedTournament.matches.filter(
    m => m.stage === tournament.currentStage
  )
  const allComplete = currentStageMatches.every(m => m.status === 'COMPLETED')

  if (allComplete) {
    // Advance to next stage
    const winners = currentStageMatches.map(m => m.winnerId!).filter(Boolean)
    
    if (tournament.currentStage === 'QUARTER_FINAL' && winners.length === 4) {
      // Create Semi Finals
      const sfMatches: Match[] = []
      const winnerTeams = winners.map(id => updatedTournament.teams.find(t => t.id === id)!)
      
      for (let i = 0; i < 2; i++) {
        const home = winnerTeams[i * 2]
        const away = winnerTeams[i * 2 + 1]
        if (home && away) {
          sfMatches.push({
            id: `match_sf_${i + 1}`,
            stage: 'SEMI_FINAL',
            homeTeamId: home.id,
            awayTeamId: away.id,
            homeTeamName: home.name,
            awayTeamName: away.name,
            status: 'PENDING',
          })
        }
      }

      updatedTournament.matches = [...updatedTournament.matches, ...sfMatches]
      updatedTournament.currentStage = 'SEMI_FINAL'

    } else if (tournament.currentStage === 'SEMI_FINAL' && winners.length === 2) {
      // Create Final
      const finalistTeams = winners.map(id => updatedTournament.teams.find(t => t.id === id)!)
      
      if (finalistTeams[0] && finalistTeams[1]) {
        const finalMatch: Match = {
          id: 'match_final',
          stage: 'FINAL',
          homeTeamId: finalistTeams[0].id,
          awayTeamId: finalistTeams[1].id,
          homeTeamName: finalistTeams[0].name,
          awayTeamName: finalistTeams[1].name,
          status: 'PENDING',
        }
        updatedTournament.matches = [...updatedTournament.matches, finalMatch]
        updatedTournament.currentStage = 'FINAL'
      }

    } else if (tournament.currentStage === 'FINAL' && winners.length >= 1) {
      // Tournament complete
      updatedTournament.status = 'COMPLETED'
      updatedTournament.winnerId = winners[0]
      updatedTournament.currentStage = null
    }
  }

  return updatedTournament
}

// ============================================================
// HELPERS
// ============================================================

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function getUserMatchForStage(
  tournament: Tournament,
  stage: TournamentStage
): Match | null {
  return tournament.matches.find(
    m => m.stage === stage && 
    (m.homeTeamId === tournament.userTeamId || m.awayTeamId === tournament.userTeamId)
  ) ?? null
}

export function getStageMatches(tournament: Tournament, stage: TournamentStage): Match[] {
  return tournament.matches.filter(m => m.stage === stage)
}

export function isUserEliminated(tournament: Tournament): boolean {
  const userTeam = tournament.teams.find(t => t.id === tournament.userTeamId)
  return userTeam?.eliminated ?? false
}