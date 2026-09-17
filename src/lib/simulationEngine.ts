import {
  TeamStrength,
  SimulationResult,
  MatchStats,
  MatchEvent,
  TournamentTeam,
  Team,
  Player,
  ChemistryBreakdown,
  ChemistryBonuses,
  SquadSlot,
  TeamPlaystyle,
} from '@/types'
import { getFormation } from '@/data/formations'
import { getArchetypeProfile } from './archetypeEngine'

// ──  ── CHEMISTRY ENGINE (INLINED) ──────────────────────────

// Safe number helper
function safeNum(v: unknown, fallback: number): number {
  if (v === null || v === undefined) return fallback
  const x = Number(v)
  return isNaN(x) || !isFinite(x) ? fallback : x
}

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

function getBonuses(playstyle: string, overall: number): ChemistryBonuses {
  const s = safeNum(overall, 50) / 100

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

function calculateChemistry(
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
    syncTotal  += safeNum(score, 0.75)
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
    safeNum(avgSync,     0.75) * 0.40 +
    safeNum(balance,     0.75) * 0.25 +
    safeNum(consistency, 0.70) * 0.25 +
    safeNum(coverage,    0.50) * 0.10
  ) * 100

  const overall = Math.round(
    Math.max(0, Math.min(100, safeNum(raw, 50)))
  )

  let label = 'Poor'
  let color = '#EF4444'
  if      (overall >= 85) { label = 'Fluid';   color = '#FFD700' }
  else if (overall >= 75) { label = 'Good';    color = '#22C55E' }
  else if (overall >= 62) { label = 'Average'; color = '#F59E0B' }
  else if (overall >= 50) { label = 'Stiff';   color = '#F97316' }

  return {
    overall,
    playstyleSync:     Math.round(safeNum(avgSync,     0.75) * 100),
    positionalBalance: Math.round(safeNum(balance,     0.75) * 100),
    styleConsistency:  Math.round(safeNum(consistency, 0.70) * 100),
    label,
    color,
    bonuses: getBonuses(ps, overall),
  }
}

// ── Every number goes through this ──────────────────────────
function n(v: unknown, fb = 80): number {
  if (v === null || v === undefined) return fb
  const x = Number(v)
  return Number.isNaN(x) || !Number.isFinite(x) ? fb : x
}

// ── Read a stat trying several key names ────────────────────
function st(stats: any, ...keys: string[]): number {
  if (!stats || typeof stats !== 'object') return 80

  for (const k of keys) {
    const raw = (stats as Record<string, unknown>)[k]
    if (raw === undefined || raw === null) continue

    const x = Number(raw)
    if (Number.isFinite(x) && x > 0) return x
  }

  return 80
}

// ============================================================
// OUT OF POSITION
// ============================================================

export function getOutOfPositionPenalty(natural: string, assigned: string): number {
  if (!natural || !assigned || natural === assigned) return 1.0
  if (natural === 'GK' || assigned === 'GK') return 0.80
  const adj: Record<string, string[]> = {
    DEF: ['MID'], MID: ['DEF', 'ATT'], ATT: ['MID'],
  }
  if ((adj[natural] || []).includes(assigned)) return 0.90
  return 0.85
}

// ============================================================
// CALCULATE TEAM STRENGTH
// ============================================================

export function calculateTeamStrength(
  team: TournamentTeam | Team,
  players: Player[]
): TeamStrength {

  // Build player lookup
  const playerMap = new Map<string, Player>()
  for (const p of players) {
    if (p && p.id) playerMap.set(p.id, p)
  }

  const teamPlaystyle: TeamPlaystyle = (team as any).playstyle || 'Balanced'

  // Build formation position lookup
  const formPosMap = new Map<string, string>()
  try {
    const f = getFormation(team.formation)
    for (const pos of f.positions) {
      formPosMap.set(pos.id, pos.position)
    }
  } catch (e) {
    console.warn('Formation not found:', team.formation)
  }

  let atkTotal = 0, atkCount = 0
  let midTotal = 0, midCount = 0
  let defTotal = 0, defCount = 0
  let gkTotal  = 0, gkCount  = 0
  let ovTotal  = 0, ovCount  = 0
  let prTotal  = 0, coTotal  = 0, archetypeFitTotal = 0

  for (const slot of (team.squad || [])) {
    if (!slot || !slot.playerId) continue
    const player = playerMap.get(slot.playerId)
    if (!player) continue

    const stats    = player.stats || {}
    const overall  = n(player.overall, 91)
    const natPos   = String(player.position || 'MID').toUpperCase()

    // Figure out assigned position
    const assignedPos = String(
      formPosMap.get(slot.positionId) ||
      slot.position ||
      player.position ||
      'MID'
    ).toUpperCase()

    const penalty = getOutOfPositionPenalty(natPos, assignedPos)

    ovTotal += overall * penalty
    ovCount++

    prTotal += st(stats, 'pressing', 'workRate', 'stamina') * penalty
    coTotal += (st(stats, 'pace') + st(stats, 'finishing', 'clinicality', 'movement')) / 2 * penalty
    archetypeFitTotal += (getArchetypeProfile(player.archetype)?.tacticalFit[teamPlaystyle] ?? 0.8) * 100 * penalty

    if (assignedPos === 'GK') {
      const gk = (
        st(stats, 'reflexes',      'positioning')   * 0.35 +
        st(stats, 'positioning',   'commandOfArea') * 0.30 +
        st(stats, 'commandOfArea', 'reflexes')      * 0.20 +
        st(stats, 'composure',     'physicality')   * 0.15
      ) * penalty
      gkTotal += gk
      gkCount++

    } else if (assignedPos === 'ATT') {
      const atk = (
        st(stats, 'finishing',   'clinicality', 'dribbling') * 0.28 +
        st(stats, 'clinicality', 'finishing',   'movement')  * 0.22 +
        st(stats, 'movement',    'dribbling',   'pace')      * 0.20 +
        st(stats, 'dribbling',   'movement',    'finishing') * 0.15 +
        st(stats, 'pace',        'physicality')              * 0.15
      ) * penalty
      atkTotal += atk
      atkCount++

    } else if (assignedPos === 'MID') {
      const mid = (
        st(stats, 'passing',       'vision',        'creativity')    * 0.22 +
        st(stats, 'vision',        'creativity',    'passing')       * 0.18 +
        st(stats, 'creativity',    'ballRetention', 'vision')        * 0.18 +
        st(stats, 'ballRetention', 'passing',       'stamina')       * 0.18 +
        st(stats, 'stamina',       'workRate',      'physicality')   * 0.12 +
        st(stats, 'pressing',      'stamina',       'workRate')      * 0.12
      ) * penalty
      midTotal += mid
      midCount++

    } else if (assignedPos === 'DEF') {
      const def = (
        st(stats, 'defending',     'interceptions', 'physicality') * 0.35 +
        st(stats, 'interceptions', 'defending',     'ballPlaying') * 0.25 +
        st(stats, 'aerialDuels',   'physicality',   'defending')   * 0.15 +
        st(stats, 'ballPlaying',   'composure',     'passing')     * 0.10 +
        st(stats, 'pace',          'physicality')                   * 0.10 +
        st(stats, 'physicality',   'aerialDuels')                   * 0.05
      ) * penalty
      defTotal += def
      defCount++
    }
  }

  const avgAtk = atkCount > 0 ? n(atkTotal / atkCount, 80) : 80
  const avgMid = midCount > 0 ? n(midTotal / midCount, 80) : 80
  const avgDef = defCount > 0 ? n(defTotal / defCount, 80) : 80
  const avgGk  = gkCount  > 0 ? n(gkTotal  / gkCount,  80) : 80
  const avgOv  = ovCount  > 0 ? n(ovTotal  / ovCount,  80) : 80
  const avgPr  = ovCount  > 0 ? n(prTotal  / ovCount,  80) : 80
  const avgCo  = ovCount  > 0 ? n(coTotal  / ovCount,  80) : 80

  console.log('[Strength]', {
    atk: Math.round(avgAtk), mid: Math.round(avgMid),
    def: Math.round(avgDef), gk:  Math.round(avgGk),
    atkCount, midCount, defCount, ovCount,
  })

  const chemistry = calculateChemistry(
    team.squad || [],
    players,
    teamPlaystyle
  )

  let captainBonus = 0
  if (team.captainId) {
    const cap = playerMap.get(team.captainId)
    if (cap) captainBonus = (n(cap.overall, 91) - 88) * 0.004
  }

  const formationBonuses = (() => {
    try { return getFormation(team.formation).bonuses || {} }
    catch { return {} }
  })()

  return {
    overall:        n(avgOv,  80),
    attack:         n(avgAtk, 80),
    midfield:       n(avgMid, 80),
    defense:        n(avgDef, 80),
    gk:             n(avgGk,  80),
    chemistry,
    formationBonus: formationBonuses,
    captainBonus:   n(captainBonus, 0),
    playstyle:      teamPlaystyle as any,
    pressing:       n(avgPr,  80),
    counterAttack:   n(avgCo,  80),
    archetypeFit:    ovCount > 0 ? n(archetypeFitTotal / ovCount, 80) : 80,
  }
}

// ============================================================
// APPLY BONUSES
// ============================================================

function applyBonuses(
  str: TeamStrength,
  stat: 'attack' | 'midfield' | 'defense'
): number {
  const fb  = str.formationBonus || {}
  const cb  = n(str.captainBonus, 0)
  const bon = str.chemistry?.bonuses || {
    attackBoost: 0, defenseBoost: 0,
    possessionBoost: 0, pressingBoost: 0, counterBoost: 0,
  }

  let v = n(str[stat], 80)
  // Archetype compatibility is a small team-level multiplier, preserving OVR while rewarding fit.
  v *= 1 + (n(str.archetypeFit, 80) - 80) / 1000

  if (stat === 'attack') {
    v *= 1 + n(fb.attack, 0)
    v *= 1 + n(bon.attackBoost, 0)
    v *= 1 + n(bon.counterBoost, 0) * 0.5
    v *= 1 + cb
  }
  if (stat === 'midfield') {
    v *= 1 + n(fb.midfield, 0)
    v *= 1 + n(fb.possession, 0) * 0.5
    v *= 1 + n(bon.possessionBoost, 0)
    v *= 1 + cb * 0.5
  }
  if (stat === 'defense') {
    v *= 1 + n(fb.defense, 0)
    v *= 1 + n(fb.defensiveStability, 0)
    v *= 1 + n(bon.defenseBoost, 0)
    v *= 1 - Math.abs(n(fb.defensiveWidth, 0)) * 0.3
  }

  return n(v, 80)
}

// ============================================================
// EXPECTED GOALS
// ============================================================

function xGoals(
  atk: number, def: number, mid: number,
  attPs: string, defPs: string,
  chemPct: number
): number {
  const a = n(atk, 80)
  const d = n(def, 80)
  const m = n(mid, 80)

  const ratio = a / Math.max(d + 10, 1)

  let style = 1.0
  if (attPs === 'Defensive')      style *= 0.72
  if (attPs === 'Attacking')      style *= 1.25
  if (attPs === 'Possession')     style *= 1.08
  if (attPs === 'Pressing')       style *= 1.12
  if (attPs === 'Counter Attack') {
    style *= (defPs === 'Pressing' || defPs === 'Attacking') ? 1.20 : 0.92
  }
  if (defPs === 'Counter Attack' && attPs === 'Pressing') style *= 0.85

  const chem   = 0.85 + n(chemPct, 50) / 100 * 0.30
  const midMod = 1 + (m - 80) / 400
  const raw    = ratio * style * chem * midMod * 1.3

  return Math.max(0.4, Math.min(3.8, n(raw, 1.3)))
}

function sampleGoals(xg: number): number {
  const e = Math.max(0.1, n(xg, 1.3))
  const r = Math.random()
  const p0 = Math.exp(-e)
  const p1 = p0 + e * p0
  const p2 = p1 + (e * e / 2) * p0
  const p3 = p2 + (Math.pow(e, 3) / 6) * p0
  const p4 = p3 + (Math.pow(e, 4) / 24) * p0
  if (r < p0) return 0
  if (r < p1) return 1
  if (r < p2) return 2
  if (r < p3) return 3
  if (r < p4) return 4
  return 5
}

// ============================================================
// SHOTS & POSSESSION
// ============================================================

function calcShots(atk: number, def: number, mid: number) {
  const a = n(atk, 80), d = n(def, 80), m = n(mid, 80)
  const base  = (a / 100) * 12 + (m / 100) * 4
  const mod   = Math.max(0.2, 1 - (d / 100) * 0.35)
  const shots = Math.max(2, Math.round(Math.max(0, base * mod * (0.8 + Math.random() * 0.4))))
  const onT   = Math.max(1, Math.round(Math.max(0, shots * (0.3 + Math.random() * 0.25))))
  return { shots, onTarget: onT }
}

function calcPoss(hM: number, aM: number, hPs: string, aPs: string): [number, number] {
  let h = n(hM, 80), a = n(aM, 80)
  if (hPs === 'Possession')     h *= 1.15
  if (aPs === 'Possession')     a *= 1.15
  if (hPs === 'Counter Attack') h *= 0.88
  if (aPs === 'Counter Attack') a *= 0.88
  if (hPs === 'Counter Attack' && aPs === 'Defensive') h *= 0.90
  if (aPs === 'Counter Attack' && hPs === 'Defensive') a *= 0.90
  const total = h + a
  if (total === 0) return [50, 50]
  const hp = Math.max(30, Math.min(70, Math.round(h / total * 100 + (Math.random() - 0.5) * 8)))
  return [hp, 100 - hp]
}

// ============================================================
// PENALTY SHOOTOUT
// ============================================================

function simulatePenalties(
  hStr: TeamStrength,
  aStr: TeamStrength,
  hId: string,
  aId: string,
  hName: string,
  aName: string
): { homeGoals: number; awayGoals: number; events: MatchEvent[] } {
  const ev: MatchEvent[] = []
  let hPenalties = 0
  let aPenalties = 0
  
  // Calculate shooter quality based on team strength
  const hShooterQuality = n(hStr.overall, 80) / 100
  const aShooterQuality = n(aStr.overall, 80) / 100
  
  const shooters = 5
  
  for (let i = 1; i <= shooters; i++) {
    const minute = 90 + i * 2
    
    // Home team shoots
    const hShoots = Math.random() < (0.7 + hShooterQuality * 0.2)
    if (hShoots) {
      hPenalties++
      ev.push({
        minute,
        type: 'GOAL',
        teamId: hId,
        playerName: `Penalty Taker ${i}`,
        description: `⚽ PENALTY GOAL! ${hName} scores!`,
      })
    } else {
      ev.push({
        minute,
        type: 'MISS',
        teamId: hId,
        playerName: `Penalty Taker ${i}`,
        description: `❌ PENALTY MISS! ${hName} fails to convert!`,
      })
    }
    
    // Away team shoots
    const aShoots = Math.random() < (0.7 + aShooterQuality * 0.2)
    if (aShoots) {
      aPenalties++
      ev.push({
        minute: minute + 1,
        type: 'GOAL',
        teamId: aId,
        playerName: `Penalty Taker ${i}`,
        description: `⚽ PENALTY GOAL! ${aName} scores!`,
      })
    } else {
      ev.push({
        minute: minute + 1,
        type: 'MISS',
        teamId: aId,
        playerName: `Penalty Taker ${i}`,
        description: `❌ PENALTY MISS! ${aName} fails to convert!`,
      })
    }
    
    // Check if outcome is decided (one team has more penalties with fewer remaining shots possible)
    if (hPenalties > aPenalties + (shooters - i)) break
    if (aPenalties > hPenalties + (shooters - i)) break
  }
  
  return {
    homeGoals: hPenalties,
    awayGoals: aPenalties,
    events: ev,
  }
}

// ============================================================
// EVENTS
// ============================================================

function makeEvents(
  hG: number, aG: number,
  hId: string, aId: string,
  hN: string, aN: string,
  hPs: string, aPs: string
): MatchEvent[] {
  const ev: MatchEvent[] = []

  for (let i = 0; i < hG; i++)
    ev.push({ minute: Math.floor(Math.random() * 88) + 1, type: 'GOAL', teamId: hId, description: `⚽ GOAL! ${hN} scores!` })
  for (let i = 0; i < aG; i++)
    ev.push({ minute: Math.floor(Math.random() * 88) + 1, type: 'GOAL', teamId: aId, description: `⚽ GOAL! ${aN} scores!` })

  const extras = Math.floor(6 + Math.random() * 8)
  for (let i = 0; i < extras; i++) {
    const home = Math.random() > 0.5
    const tid  = home ? hId : aId
    const tn   = home ? hN  : aN
    const ps   = home ? hPs : aPs
    const min  = Math.floor(Math.random() * 88) + 1
    const roll = Math.random()
    let type: MatchEvent['type'] = 'FOUL'
    let desc = ''

    if (ps === 'Pressing' && roll < 0.3)         { type = 'PRESS_WIN';   desc = `🔥 ${tn} win the ball high up!` }
    else if (ps === 'Counter Attack' && roll < 0.25) { type = 'COUNTER'; desc = `⚡ ${tn} launch a counter!` }
    else if (roll < 0.25)  { type = 'BIG_CHANCE';  desc = `🎯 Big chance for ${tn}!` }
    else if (roll < 0.45)  { type = 'MISS';         desc = `😮 ${tn} fire over!` }
    else if (roll < 0.60)  { type = 'SAVE';         desc = `🧤 Save! ${tn} denied!` }
    else if (roll < 0.75)  { type = 'YELLOW_CARD';  desc = `🟨 Yellow card for ${tn}` }
    else if (roll < 0.80)  { type = 'VAR_CHECK';    desc = `📺 VAR check...` }
    else                   { type = 'FOUL';          desc = `⚠️ Foul by ${tn}` }

    ev.push({ minute: min, type, teamId: tid, description: desc })
  }

  return ev.sort((a, b) => a.minute - b.minute)
}

// ============================================================
// MAIN SIMULATE
// ============================================================

export function simulateMatch(
  hStr: TeamStrength, aStr: TeamStrength,
  hId: string, aId: string,
  hName: string, aName: string
): SimulationResult {
  const hAtk = applyBonuses(hStr, 'attack')
  const aAtk = applyBonuses(aStr, 'attack')
  const hMid = applyBonuses(hStr, 'midfield')
  const aMid = applyBonuses(aStr, 'midfield')
  const hDef = applyBonuses(hStr, 'defense')
  const aDef = applyBonuses(aStr, 'defense')
  const hPs  = hStr.playstyle || 'Balanced'
  const aPs  = aStr.playstyle || 'Balanced'
  const hCh  = n(hStr.chemistry?.overall, 50)
  const aCh  = n(aStr.chemistry?.overall, 50)

  const hXG = xGoals(hAtk, aDef, hMid, hPs, aPs, hCh)
  const aXG = xGoals(aAtk, hDef, aMid, aPs, hPs, aCh)

  console.log('[Match]', hName, 'xG:', hXG.toFixed(2), 'vs', aName, 'xG:', aXG.toFixed(2))

  const hGoals = sampleGoals(hXG)
  const aGoals = sampleGoals(aXG)
  const hShots = calcShots(hAtk, aDef, hMid)
  const aShots = calcShots(aAtk, hDef, aMid)
  const [hPoss, aPoss] = calcPoss(hMid, aMid, hPs, aPs)
  const hSaves = Math.max(0, aShots.onTarget - aGoals)
  const aSaves = Math.max(0, hShots.onTarget - hGoals)
  const hCnt   = hPs === 'Counter Attack' ? Math.floor(2 + Math.random() * 4) : Math.floor(Math.random() * 2)
  const aCnt   = aPs === 'Counter Attack' ? Math.floor(2 + Math.random() * 4) : Math.floor(Math.random() * 2)

  const stats: MatchStats = {
    possession:     [n(hPoss, 50),          n(aPoss, 50)],
    shots:          [n(hShots.shots, 5),    n(aShots.shots, 5)],
    shotsOnTarget:  [n(hShots.onTarget, 2), n(aShots.onTarget, 2)],
    goals:          [hGoals, aGoals],
    fouls:          [Math.floor(5 + Math.random() * 12), Math.floor(5 + Math.random() * 12)],
    yellowCards:    [Math.floor(Math.random() * 4),      Math.floor(Math.random() * 4)],
    redCards:       [0, 0],
    corners:        [Math.floor(2 + Math.random() * 10), Math.floor(2 + Math.random() * 10)],
    saves:          [n(hSaves, 0), n(aSaves, 0)],
    bigChances:     [Math.floor(1 + Math.random() * 4),  Math.floor(1 + Math.random() * 4)],
    counterAttacks: [hCnt, aCnt],
  }

  ;(stats as any).tacticalVerdict = hPs === 'Possession' && hPoss > aPoss
    ? `${hName} controlled the midfield through possession and gave its creators time between the lines.`
    : aPs === 'Possession' && aPoss > hPoss
      ? `${aName} controlled the midfield through possession and limited the space available to the opposition.`
      : hPs === 'Pressing' && hCnt + hShots.onTarget > aCnt + aShots.onTarget
        ? `${hName}'s pressure created recoveries high up the pitch and turned defensive work into chances.`
        : aPs === 'Pressing' && aCnt + aShots.onTarget > hCnt + hShots.onTarget
          ? `${aName}'s pressure created recoveries high up the pitch and disrupted the build-up.`
          : hPs === 'Counter Attack' && hCnt > aCnt
            ? `${hName} found the space behind the defensive line in transition.`
            : aPs === 'Counter Attack' && aCnt > hCnt
              ? `${aName} found the space behind the defensive line in transition.`
              : `The result was decided by the balance between team quality, chemistry and the key moments.`

  let finalHomeGoals = hGoals
  let finalAwayGoals = aGoals
  let events = makeEvents(hGoals, aGoals, hId, aId, hName, aName, hPs, aPs)

  // If draw, go to penalties
  if (hGoals === aGoals) {
    const penaltyResult = simulatePenalties(hStr, aStr, hId, aId, hName, aName)
    finalHomeGoals = hGoals
    finalAwayGoals = aGoals
    
    // Add penalty events
    events.push({
      minute: 90,
      type: 'VAR_CHECK',
      teamId: hId,
      description: '🔔 Full Time: ' + hGoals + ' - ' + aGoals + '. Going to Penalties!',
    })
    
    events = events.concat(penaltyResult.events)
    
    // Store penalty shootout result for UI display
    ;(stats as any).penaltyShootout = {
      homeGoals: penaltyResult.homeGoals,
      awayGoals: penaltyResult.awayGoals,
    }
  }

  return {
    homeGoals: finalHomeGoals,
    awayGoals: finalAwayGoals,
    stats,
    events,
  }
}

// ============================================================
// GENERATE AI TEAM
// ============================================================

export function generateAITeam(
  teamId: string,
  teamName: string,
  formationType: string,
  availablePlayers: Player[],
  playstyle: string,
  difficulty: 'weak' | 'medium' | 'strong' = 'medium'
): any {
  const form  = getFormation(formationType as any)
  const squad: any[] = []
  const used  = new Set<string>()

  for (const fp of form.positions) {
    const pool = availablePlayers
      .filter(p => p.position === fp.position && !used.has(p.id))
      .sort((a, b) => n(b.overall, 91) - n(a.overall, 91))
    const window = difficulty === 'strong' ? pool.slice(0, 8) : difficulty === 'weak' ? pool.slice(Math.max(0, pool.length - 8)) : pool.slice(2, 10)

    const pick =
      window.find(p => p.preferredPlaystyle === playstyle) ??
      window[0] ??
      availablePlayers.find(p => !used.has(p.id))

    if (pick) {
      used.add(pick.id)
      squad.push({ positionId: fp.id, position: fp.position, playerId: pick.id })
    } else {
      squad.push({ positionId: fp.id, position: fp.position, playerId: null })
    }
  }

  const captainId = squad
    .filter((sl: any) => sl.playerId)
    .map((sl: any) => availablePlayers.find(p => p.id === sl.playerId))
    .filter(Boolean)
    .sort((a: any, b: any) => n(b?.overall, 91) - n(a?.overall, 91))[0]?.id ?? null

  const filled = squad.filter((sl: any) => sl.playerId)
  const avgOv  = filled.length > 0
    ? filled.reduce((sum: number, sl: any) => {
        const p = availablePlayers.find(p => p.id === sl.playerId)
        return sum + n(p?.overall, 91)
      }, 0) / filled.length
    : 91

  return {
    id: teamId, name: teamName,
    formation: formationType as any,
    playstyle: playstyle as any,
    squad, captainId,
    isUserTeam: false,
    strength: avgOv,
    difficulty,
    eliminated: false,
  }
}