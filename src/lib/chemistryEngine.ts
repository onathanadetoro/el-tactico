import {
  Player,
  TeamPlaystyle,
  ChemistryBreakdown,
  ChemistryBonuses,
  SquadSlot,
} from '@/types'

// Safe number helper
function safe(v: unknown, fallback: number): number {
  if (v === null || v === undefined) return fallback
  const n = Number(v)
  return isNaN(n) || !isFinite(n) ? fallback : n
}

// ============================================================
// COMPATIBILITY TABLE
// ============================================================

const COMPAT: Record<string, Record<string, number>> = {
  'Sweeper Keeper':     { Attacking: 0.80, Defensive: 0.70, Possession: 0.85, 'Counter Attack': 0.75, Pressing: 1.00, Balanced: 0.80 },
  'Shot Stopper':       { Attacking: 0.70, Defensive: 1.00, Possession: 0.75, 'Counter Attack': 0.90, Pressing: 0.70, Balanced: 0.80 },
  'Organiser':          { Attacking: 0.70, Defensive: 1.00, Possession: 0.80, 'Counter Attack': 0.85, Pressing: 0.75, Balanced: 0.85 },
  'Distributor':        { Attacking: 0.85, Defensive: 0.70, Possession: 1.00, 'Counter Attack': 0.75, Pressing: 0.80, Balanced: 0.85 },
  'Ball Playing':       { Attacking: 0.80, Defensive: 0.75, Possession: 1.00, 'Counter Attack': 0.70, Pressing: 0.80, Balanced: 0.85 },
  'Aggressive Stopper': { Attacking: 0.70, Defensive: 1.00, Possession: 0.65, 'Counter Attack': 0.85, Pressing: 0.90, Balanced: 0.80 },
  'Sweeper':            { Attacking: 0.65, Defensive: 1.00, Possession: 0.80, 'Counter Attack': 0.90, Pressing: 0.70, Balanced: 0.80 },
  'Wing Back':          { Attacking: 1.00, Defensive: 0.55, Possession: 0.75, 'Counter Attack': 0.90, Pressing: 0.85, Balanced: 0.80 },
  'Retainer':           { Attacking: 0.60, Defensive: 0.85, Possession: 1.00, 'Counter Attack': 0.65, Pressing: 0.70, Balanced: 0.80 },
  'Creative':           { Attacking: 1.00, Defensive: 0.55, Possession: 0.90, 'Counter Attack': 0.75, Pressing: 0.65, Balanced: 0.80 },
  'Box to Box':         { Attacking: 0.80, Defensive: 0.80, Possession: 0.75, 'Counter Attack': 0.85, Pressing: 0.85, Balanced: 1.00 },
  'Pressing':           { Attacking: 0.80, Defensive: 0.70, Possession: 0.65, 'Counter Attack': 0.80, Pressing: 1.00, Balanced: 0.80 },
  'Anchor':             { Attacking: 0.55, Defensive: 1.00, Possession: 0.80, 'Counter Attack': 0.75, Pressing: 0.75, Balanced: 0.80 },
  'Clinical':           { Attacking: 0.90, Defensive: 0.60, Possession: 0.75, 'Counter Attack': 1.00, Pressing: 0.70, Balanced: 0.85 },
  'Poacher':            { Attacking: 0.85, Defensive: 0.55, Possession: 0.70, 'Counter Attack': 1.00, Pressing: 0.65, Balanced: 0.80 },
  'Target Man':         { Attacking: 0.75, Defensive: 0.90, Possession: 0.70, 'Counter Attack': 0.65, Pressing: 0.70, Balanced: 0.80 },
  'Dribbler':           { Attacking: 1.00, Defensive: 0.50, Possession: 0.80, 'Counter Attack': 0.85, Pressing: 0.70, Balanced: 0.80 },
  'Pressing Forward':   { Attacking: 0.75, Defensive: 0.70, Possession: 0.65, 'Counter Attack': 0.75, Pressing: 1.00, Balanced: 0.80 },
}

const SYNERGY: Record<string, string[]> = {
  'Retainer':           ['Creative', 'Box to Box', 'Anchor'],
  'Creative':           ['Retainer', 'Dribbler', 'Clinical', 'Poacher'],
  'Box to Box':         ['Retainer', 'Pressing', 'Anchor', 'Wing Back'],
  'Pressing':           ['Pressing Forward', 'Box to Box', 'Aggressive Stopper', 'Sweeper Keeper'],
  'Anchor':             ['Creative', 'Box to Box', 'Ball Playing'],
  'Clinical':           ['Creative', 'Retainer', 'Wing Back', 'Ball Playing'],
  'Poacher':            ['Creative', 'Wing Back', 'Retainer'],
  'Target Man':         ['Box to Box', 'Wing Back', 'Anchor'],
  'Dribbler':           ['Creative', 'Retainer', 'Wing Back'],
  'Pressing Forward':   ['Pressing', 'Box to Box', 'Aggressive Stopper'],
  'Ball Playing':       ['Retainer', 'Creative', 'Clinical', 'Anchor'],
  'Aggressive Stopper': ['Anchor', 'Pressing', 'Pressing Forward'],
  'Sweeper':            ['Ball Playing', 'Retainer', 'Distributor'],
  'Wing Back':          ['Clinical', 'Poacher', 'Creative', 'Dribbler'],
  'Sweeper Keeper':     ['Ball Playing', 'Sweeper', 'Retainer'],
  'Shot Stopper':       ['Aggressive Stopper', 'Sweeper'],
  'Organiser':          ['Aggressive Stopper', 'Sweeper', 'Anchor'],
  'Distributor':        ['Ball Playing', 'Retainer', 'Creative'],
}

// ============================================================
// MAIN EXPORT
// ============================================================

export function calculateChemistry(
  squad: SquadSlot[],
  players: Player[],
  playstyle: TeamPlaystyle
): ChemistryBreakdown {
  const playerMap = new Map<string, Player>(players.map(p => [p.id, p]))

  const assigned: Player[] = []
  for (const slot of squad) {
    if (!slot.playerId) continue
    const p = playerMap.get(slot.playerId)
    if (p) assigned.push(p)
  }

  if (assigned.length === 0) return emptyChemistry()

  const ps = playstyle || 'Balanced'

  // 1 — playstyle sync
  let syncTotal = 0
  for (const p of assigned) {
    const row   = COMPAT[p.style] || {}
    const score = row[ps]
    syncTotal  += safe(score, 0.75)
  }
  const avgSync = syncTotal / assigned.length

  // 2 — positional balance
  const filled = squad.filter(s => s.playerId).length
  let inPos = 0
  for (const slot of squad) {
    if (!slot.playerId) continue
    const p = playerMap.get(slot.playerId)
    if (p && p.position === slot.position) inPos++
  }
  const balance = filled > 0 ? inPos / filled : 1

  // 3 — style synergy
  let synTotal = 0
  let synCount = 0
  for (let i = 0; i < assigned.length; i++) {
    for (let j = i + 1; j < assigned.length; j++) {
      const aStyle = assigned[i].style || ''
      const bStyle = assigned[j].style || ''
      const list   = SYNERGY[aStyle]
      synTotal    += Array.isArray(list) && list.includes(bStyle) ? 1 : 0.5
      synCount++
    }
  }
  const consistency = synCount > 0 ? synTotal / synCount : 0.7

  // 4 — coverage
  const coverage = assigned.length / 11

  // overall 0-100
  const raw = (
    safe(avgSync,     0.75) * 0.40 +
    safe(balance,     0.75) * 0.25 +
    safe(consistency, 0.70) * 0.25 +
    safe(coverage,    0.50) * 0.10
  ) * 100

  const overall = Math.round(
    Math.max(0, Math.min(100, safe(raw, 50)))
  )

  let label = 'Poor'
  let color = '#EF4444'
  if      (overall >= 85) { label = 'Fluid';   color = '#FFD700' }
  else if (overall >= 75) { label = 'Good';    color = '#22C55E' }
  else if (overall >= 62) { label = 'Average'; color = '#F59E0B' }
  else if (overall >= 50) { label = 'Stiff';   color = '#F97316' }

  return {
    overall,
    playstyleSync:     Math.round(safe(avgSync,     0.75) * 100),
    positionalBalance: Math.round(safe(balance,     0.75) * 100),
    styleConsistency:  Math.round(safe(consistency, 0.70) * 100),
    label,
    color,
    bonuses: getBonuses(ps, overall),
  }
}

// ============================================================
// BONUSES
// ============================================================

function getBonuses(playstyle: string, overall: number): ChemistryBonuses {
  const s = safe(overall, 50) / 100

  switch (playstyle) {
    case 'Attacking':
      return { attackBoost: s * 0.12, defenseBoost: -0.02, possessionBoost: 0.04, pressingBoost: 0.02, counterBoost: 0.04 }
    case 'Defensive':
      return { attackBoost: -0.02, defenseBoost: s * 0.14, possessionBoost: 0.02, pressingBoost: 0.04, counterBoost: 0.06 }
    case 'Possession':
      return { attackBoost: 0.04, defenseBoost: 0.04, possessionBoost: s * 0.16, pressingBoost: 0.02, counterBoost: -0.02 }
    case 'Counter Attack':
      return { attackBoost: 0.06, defenseBoost: 0.06, possessionBoost: -0.04, pressingBoost: 0.02, counterBoost: s * 0.16 }
    case 'Pressing':
      return { attackBoost: 0.04, defenseBoost: 0.06, possessionBoost: -0.02, pressingBoost: s * 0.16, counterBoost: 0.02 }
    default:
      return { attackBoost: s * 0.06, defenseBoost: s * 0.06, possessionBoost: s * 0.06, pressingBoost: s * 0.04, counterBoost: s * 0.04 }
  }
}

// ============================================================
// EMPTY FALLBACK
// ============================================================

function emptyChemistry(): ChemistryBreakdown {
  return {
    overall:           50,
    playstyleSync:     50,
    positionalBalance: 50,
    styleConsistency:  50,
    label:             'Average',
    color:             '#F59E0B',
    bonuses: {
      attackBoost:     0,
      defenseBoost:    0,
      possessionBoost: 0,
      pressingBoost:   0,
      counterBoost:    0,
    },
  }
}