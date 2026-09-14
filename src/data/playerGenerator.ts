import {
  Player, Position, PlayerStyle, TeamPlaystyle,
  GKStyle, DEFStyle, MIDStyle, ATTStyle, PlayerStats
} from '@/types'

// ============================================================
// NAME POOLS
// ============================================================

const firstNames = [
  'Lucas', 'Marco', 'Carlos', 'Diego', 'Rafael', 'Miguel', 'Andre', 'Bruno',
  'Fabio', 'Mateo', 'Luca', 'Felix', 'Kai', 'Leandro', 'Niko', 'Thiago',
  'Victor', 'Eduardo', 'Patrick', 'Julian', 'Ivan', 'Alexei', 'Rodrigo',
  'Santiago', 'Emre', 'Yusuf', 'Karim', 'Amine', 'Sven', 'Lars', 'Niklas',
  'Tomas', 'Jakub', 'Pavel', 'Marek', 'Lukas', 'Jan', 'Dominik', 'Adam',
  'Gabriel', 'Vinicius', 'Antony', 'Richarlison', 'Casemiro', 'Ousmane',
  'Kylian', 'Antoine', 'Theo', 'William', 'Jordan', 'Mason', 'Phil',
  'Bukayo', 'Marcus', 'Jude', 'Declan', 'Harry', 'Raheem', 'Erling',
  'Martin', 'Pedri', 'Gavi', 'Ansu', 'Ferran', 'Dani', 'Sergio',
  'Alessandro', 'Lorenzo', 'Federico', 'Nicolo', 'Giacomo', 'Giovanni',
  'Hiroki', 'Takumi', 'Kaoru', 'Daichi', 'Ritsu', 'Yuki', 'Shoya',
  'Son', 'Hwang', 'Cho', 'Jung', 'Mohamed', 'Sadio', 'Edouard',
  'Pierre', 'Cheikhou', 'Idrissa', 'Roberto', 'David', 'Alvaro',
  'Nacho', 'Cesc', 'Andres', 'Xabi', 'Zlatan', 'Romelu', 'Romario',
  'Thierry', 'Didier', 'Samuel', 'Nwankwo', 'Kevin', 'Riyad', 'Bernardo',
  'Ruben', 'Joao', 'Cristiano', 'Lionel', 'Neymar', 'Kaka', 'Ronaldinho',
  'Xherdan', 'Granit', 'Haris', 'Breel', 'Noah', 'Nico', 'Yannick',
]

const lastNames = [
  'Silva', 'Santos', 'Costa', 'Oliveira', 'Rodrigues', 'Ferreira', 'Alves',
  'Lima', 'Pereira', 'Carvalho', 'Melo', 'Ribeiro', 'Almeida', 'Nascimento',
  'Fernandez', 'Garcia', 'Lopez', 'Martinez', 'Rodriguez', 'Gonzalez',
  'Sanchez', 'Ramirez', 'Torres', 'Flores', 'Rivera', 'Gomez', 'Diaz',
  'Muller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner',
  'Becker', 'Hoffmann', 'Schulz', 'Koch', 'Richter', 'Klein', 'Wolf',
  'Dupont', 'Durand', 'Martin', 'Bernard', 'Moreau', 'Laurent', 'Simon',
  'Rossi', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo', 'Ricci',
  'Diallo', 'Traore', 'Kone', 'Coulibaly', 'Toure', 'Dembele', 'Salah',
  'Hassan', 'Ibrahim', 'Abdullah', 'Rahman', 'Khalil', 'Nasser',
  'Vardy', 'Grealish', 'Rashford', 'Saka', 'Bellingham', 'Rice', 'Mount',
  'Kane', 'Sterling', 'Trippier', 'Maguire', 'Stones', 'Walker', 'Shaw',
  'Nakamura', 'Kagawa', 'Honda', 'Nagatomo', 'Osako', 'Kamada', 'Ito',
  'Pedersen', 'Haaland', 'Odegaard', 'Bergsen', 'Larsen', 'Andersen',
  'Depay', 'Dumfries', 'Blind', 'Klaassen', 'Wijnaldum', 'Koeman',
  'De Bruyne', 'Hazard', 'Lukaku', 'Courtois', 'Alderweireld', 'Witsel',
  'Cancelo', 'Dias', 'Neves', 'Moutinho', 'Jota', 'Felix', 'Leao',
]

const nationalities = [
  'Brazil', 'Argentina', 'France', 'Germany', 'Spain', 'England', 'Italy',
  'Portugal', 'Netherlands', 'Belgium', 'Uruguay', 'Colombia', 'Mexico',
  'Japan', 'South Korea', 'Senegal', 'Nigeria', 'Morocco', 'Egypt',
  'Croatia', 'Poland', 'Denmark', 'Sweden', 'Norway', 'Switzerland',
  'Australia', 'United States', 'Ghana', 'Ivory Coast', 'Cameroon',
]

// ============================================================
// STYLE DEFINITIONS
// ============================================================

const GK_STYLES: GKStyle[]   = ['Sweeper Keeper', 'Shot Stopper', 'Organiser', 'Distributor']
const DEF_STYLES: DEFStyle[] = ['Ball Playing', 'Aggressive Stopper', 'Sweeper', 'Wing Back']
const MID_STYLES: MIDStyle[] = ['Retainer', 'Creative', 'Box to Box', 'Pressing', 'Anchor']
const ATT_STYLES: ATTStyle[] = ['Clinical', 'Poacher', 'Target Man', 'Dribbler', 'Pressing Forward']

const STYLE_PLAYSTYLE_MAP: Record<string, TeamPlaystyle> = {
  'Sweeper Keeper':    'Pressing',
  'Shot Stopper':      'Defensive',
  'Organiser':         'Defensive',
  'Distributor':       'Possession',
  'Ball Playing':      'Possession',
  'Aggressive Stopper':'Pressing',
  'Sweeper':           'Defensive',
  'Wing Back':         'Attacking',
  'Retainer':          'Possession',
  'Creative':          'Attacking',
  'Box to Box':        'Balanced',
  'Pressing':          'Pressing',
  'Anchor':            'Defensive',
  'Clinical':          'Counter Attack',
  'Poacher':           'Counter Attack',
  'Target Man':        'Defensive',
  'Dribbler':          'Attacking',
  'Pressing Forward':  'Pressing',
}

const STYLE_TRAITS: Record<string, string> = {
  'Sweeper Keeper':    'Rushes off line to claim crosses and start attacks',
  'Shot Stopper':      'World class reflexes — almost unbeatable one on one',
  'Organiser':         'Commands the entire backline with authority',
  'Distributor':       'Launches attacks with pinpoint long passes',
  'Ball Playing':      'Glides out from the back under intense pressure',
  'Aggressive Stopper':'Dominant in tackles, headers and physical duels',
  'Sweeper':           'Reads the game brilliantly to cut out danger',
  'Wing Back':         'Bombs forward relentlessly to create overloads',
  'Retainer':          'Keeps the ball safe under the most intense pressure',
  'Creative':          'Unlocks defences with vision no one else has',
  'Box to Box':        'Covers every blade of grass in both directions',
  'Pressing':          'Suffocates opponents and wins the ball high up',
  'Anchor':            'Shields the defence with intelligence and positioning',
  'Clinical':          'Rarely wastes a clear cut chance — ice in the veins',
  'Poacher':           'Always in the right place at exactly the right time',
  'Target Man':        'Holds the ball up and brings teammates into play',
  'Dribbler':          'Takes on defenders with explosive pace and skill',
  'Pressing Forward':  'Wins the ball in dangerous areas to create chaos',
}

const STYLE_WEAKNESSES: Record<string, string> = {
  'Sweeper Keeper':    'Can be caught out by lofted balls over the top',
  'Shot Stopper':      'Less comfortable with the ball at feet',
  'Organiser':         'Struggles against rapid transitions and pace',
  'Distributor':       'Can be drawn out of position when pressing',
  'Ball Playing':      'Can be pressed into costly errors under pressure',
  'Aggressive Stopper':'Gets drawn out of position chasing the ball',
  'Sweeper':           'Less effective in direct one vs one duels',
  'Wing Back':         'Leaves dangerous space in behind when attacking',
  'Retainer':          'Rarely contributes directly to the final third',
  'Creative':          'Defensively vulnerable when pressed aggressively',
  'Box to Box':        'No single standout elite quality in any area',
  'Pressing':          'Burns energy quickly and fades in the second half',
  'Anchor':            'Very limited attacking output and creativity',
  'Clinical':          'Less involved in build up play and link up',
  'Poacher':           'Ineffective when play bypasses the penalty box',
  'Target Man':        'Poor pace means struggles in behind defences',
  'Dribbler':          'Can be inconsistent in the final third',
  'Pressing Forward':  'Low direct goal contribution and finishing',
}

// ============================================================
// HELPERS
// ============================================================

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function clamp(v: number, min = 75, max = 97): number {
  return Math.max(min, Math.min(max, v))
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ── Every player has one elite stat, one strong stat,
//    and all others are solid but clearly weaker.
//    This creates identity without any player dominating everything.
// ────────────────────────────────────────────────────────────

function spread(elite: number, strong: number, solid: number, weak: number) {
  return {
    elite:  clamp(elite  + rand(-1, 1), 93, 97),
    strong: clamp(strong + rand(-1, 1), 89, 93),
    solid:  clamp(solid  + rand(-2, 2), 84, 89),
    weak:   clamp(weak   + rand(-2, 2), 75, 84),
  }
}

// ============================================================
// GK GENERATORS — each style has a completely different profile
// ============================================================

function generateGKStats(style: GKStyle): PlayerStats {
  switch (style) {
    case 'Shot Stopper': {
      const s = spread(95, 91, 86, 78)
      return {
        pace: rand(55, 65), physicality: s.solid, composure: s.solid, workRate: rand(70, 80),
        reflexes: s.elite, positioning: s.strong, commandOfArea: s.solid, distribution: s.weak,
      }
    }
    case 'Sweeper Keeper': {
      const s = spread(95, 91, 86, 78)
      return {
        pace: rand(68, 78), physicality: s.solid, composure: s.strong, workRate: rand(75, 85),
        reflexes: s.strong, positioning: s.elite, commandOfArea: s.solid, distribution: s.solid,
      }
    }
    case 'Organiser': {
      const s = spread(95, 91, 86, 78)
      return {
        pace: rand(55, 65), physicality: s.strong, composure: s.elite, workRate: rand(72, 82),
        reflexes: s.solid, positioning: s.solid, commandOfArea: s.elite, distribution: s.solid,
      }
    }
    case 'Distributor': {
      const s = spread(95, 91, 86, 78)
      return {
        pace: rand(60, 70), physicality: s.solid, composure: s.strong, workRate: rand(72, 82),
        reflexes: s.solid, positioning: s.solid, commandOfArea: s.solid, distribution: s.elite,
      }
    }
  }
}

// ============================================================
// DEF GENERATORS
// ============================================================

function generateDEFStats(style: DEFStyle): PlayerStats {
  switch (style) {
    case 'Ball Playing': {
      const s = spread(95, 91, 86, 78)
      return {
        pace: s.solid, physicality: s.solid, composure: s.elite, workRate: rand(78, 88),
        defending: s.strong, interceptions: s.solid, aerialDuels: s.weak, ballPlaying: s.elite,
      }
    }
    case 'Aggressive Stopper': {
      const s = spread(95, 91, 86, 78)
      return {
        pace: s.solid, physicality: s.elite, composure: s.weak, workRate: rand(82, 92),
        defending: s.elite, interceptions: s.strong, aerialDuels: s.strong, ballPlaying: s.weak,
      }
    }
    case 'Sweeper': {
      const s = spread(95, 91, 86, 78)
      return {
        pace: s.strong, physicality: s.solid, composure: s.strong, workRate: rand(78, 88),
        defending: s.solid, interceptions: s.elite, aerialDuels: s.solid, ballPlaying: s.solid,
      }
    }
    case 'Wing Back': {
      const s = spread(95, 91, 86, 78)
      return {
        pace: s.elite, physicality: s.solid, composure: s.solid, workRate: s.elite,
        defending: s.solid, interceptions: s.solid, aerialDuels: s.weak, ballPlaying: s.solid,
      }
    }
  }
}

// ============================================================
// MID GENERATORS
// ============================================================

function generateMIDStats(style: MIDStyle): PlayerStats {
  switch (style) {
    case 'Retainer': {
      const s = spread(95, 91, 86, 78)
      return {
        pace: s.weak, physicality: s.solid, composure: s.elite, workRate: s.solid,
        passing: s.strong, vision: s.solid, pressing: s.weak, ballRetention: s.elite,
        creativity: s.solid, stamina: s.solid,
      }
    }
    case 'Creative': {
      const s = spread(95, 91, 86, 78)
      return {
        pace: s.solid, physicality: s.weak, composure: s.strong, workRate: s.solid,
        passing: s.strong, vision: s.elite, pressing: s.weak, ballRetention: s.solid,
        creativity: s.elite, stamina: s.solid,
      }
    }
    case 'Box to Box': {
      const s = spread(95, 91, 86, 78)
      return {
        pace: s.solid, physicality: s.strong, composure: s.solid, workRate: s.elite,
        passing: s.solid, vision: s.solid, pressing: s.strong, ballRetention: s.solid,
        creativity: s.solid, stamina: s.elite,
      }
    }
    case 'Pressing': {
      const s = spread(95, 91, 86, 78)
      return {
        pace: s.strong, physicality: s.strong, composure: s.solid, workRate: s.elite,
        passing: s.solid, vision: s.weak, pressing: s.elite, ballRetention: s.solid,
        creativity: s.weak, stamina: s.strong,
      }
    }
    case 'Anchor': {
      const s = spread(95, 91, 86, 78)
      return {
        pace: s.weak, physicality: s.elite, composure: s.strong, workRate: s.solid,
        passing: s.solid, vision: s.weak, pressing: s.strong, ballRetention: s.strong,
        creativity: s.weak, stamina: s.solid,
      }
    }
  }
}

// ============================================================
// ATT GENERATORS
// ============================================================

function generateATTStats(style: ATTStyle): PlayerStats {
  switch (style) {
    case 'Clinical': {
      const s = spread(95, 91, 86, 78)
      return {
        pace: s.solid, physicality: s.solid, composure: s.elite, workRate: s.solid,
        finishing: s.strong, dribbling: s.solid, movement: s.strong, holdUpPlay: s.weak,
        clinicality: s.elite,
      }
    }
    case 'Poacher': {
      const s = spread(95, 91, 86, 78)
      return {
        pace: s.strong, physicality: s.weak, composure: s.strong, workRate: s.solid,
        finishing: s.strong, dribbling: s.solid, movement: s.elite, holdUpPlay: s.weak,
        clinicality: s.strong,
      }
    }
    case 'Target Man': {
      const s = spread(95, 91, 86, 78)
      return {
        pace: s.weak, physicality: s.elite, composure: s.solid, workRate: s.solid,
        finishing: s.solid, dribbling: s.weak, movement: s.solid, holdUpPlay: s.elite,
        clinicality: s.solid,
      }
    }
    case 'Dribbler': {
      const s = spread(95, 91, 86, 78)
      return {
        pace: s.elite, physicality: s.weak, composure: s.solid, workRate: s.solid,
        finishing: s.solid, dribbling: s.elite, movement: s.strong, holdUpPlay: s.weak,
        clinicality: s.solid,
      }
    }
    case 'Pressing Forward': {
      const s = spread(95, 91, 86, 78)
      return {
        pace: s.strong, physicality: s.strong, composure: s.solid, workRate: s.elite,
        finishing: s.solid, dribbling: s.solid, movement: s.solid, holdUpPlay: s.solid,
        clinicality: s.weak,
      }
    }
  }
}

// ============================================================
// OVERALL — tight 91-95 band, style adjusts within that band
// ============================================================

function calculateOverall(stats: PlayerStats, position: Position): number {
  let score = 0

  if (position === 'GK') {
    score =
      (stats.reflexes       ?? 85) * 0.30 +
      (stats.positioning    ?? 85) * 0.25 +
      (stats.commandOfArea  ?? 85) * 0.20 +
      (stats.distribution   ?? 85) * 0.10 +
      stats.composure              * 0.10 +
      stats.physicality            * 0.05

  } else if (position === 'DEF') {
    score =
      (stats.defending      ?? 85) * 0.28 +
      (stats.interceptions  ?? 85) * 0.22 +
      (stats.aerialDuels    ?? 85) * 0.15 +
      (stats.ballPlaying    ?? 85) * 0.12 +
      stats.pace                   * 0.12 +
      stats.physicality            * 0.06 +
      stats.composure              * 0.05

  } else if (position === 'MID') {
    score =
      (stats.passing        ?? 85) * 0.18 +
      (stats.vision         ?? 85) * 0.15 +
      (stats.ballRetention  ?? 85) * 0.15 +
      (stats.creativity     ?? 85) * 0.14 +
      (stats.pressing       ?? 85) * 0.10 +
      (stats.stamina        ?? 85) * 0.10 +
      stats.physicality            * 0.08 +
      stats.composure              * 0.05 +
      stats.pace                   * 0.05

  } else {
    score =
      (stats.finishing      ?? 85) * 0.24 +
      (stats.clinicality    ?? 85) * 0.22 +
      (stats.movement       ?? 85) * 0.16 +
      (stats.dribbling      ?? 85) * 0.14 +
      stats.pace                   * 0.12 +
      (stats.holdUpPlay     ?? 85) * 0.07 +
      stats.composure              * 0.05
  }

  // Clamp tightly to 91-95
  return clamp(Math.round(score), 91, 95)
}

// ============================================================
// MAIN GENERATOR
// ============================================================

export function generatePlayers(): Player[] {
  const players: Player[] = []
  const usedNames = new Set<string>()

  const distribution: Array<{ position: Position; count: number }> = [
    { position: 'GK',  count: 10 },
    { position: 'DEF', count: 30 },
    { position: 'MID', count: 35 },
    { position: 'ATT', count: 25 },
  ]

  for (const { position, count } of distribution) {
    const styles =
      position === 'GK'  ? GK_STYLES  :
      position === 'DEF' ? DEF_STYLES :
      position === 'MID' ? MID_STYLES :
      ATT_STYLES

    // How many players per style — distribute as evenly as possible
    // so no style has a monopoly
    const styleCountMap: Record<string, number> = {}
    styles.forEach(s => { styleCountMap[s] = 0 })

    for (let i = 0; i < count; i++) {
      // Unique name
      let name = ''
      let attempts = 0
      do {
        const fn = firstNames[Math.floor(Math.random() * firstNames.length)]
        const ln = lastNames[Math.floor(Math.random() * lastNames.length)]
        name = `${fn} ${ln}`
        attempts++
      } while (usedNames.has(name) && attempts < 100)
      usedNames.add(name)

      // Pick style with fewest players so far — ensures even distribution
      const style = styles.reduce((least, s) =>
        styleCountMap[s] < styleCountMap[least] ? s : least
      , styles[0]) as PlayerStyle
      styleCountMap[style as string]++

      // Generate stats
      let stats: PlayerStats
      if (position === 'GK')       stats = generateGKStats(style as GKStyle)
      else if (position === 'DEF') stats = generateDEFStats(style as DEFStyle)
      else if (position === 'MID') stats = generateMIDStats(style as MIDStyle)
      else                         stats = generateATTStats(style as ATTStyle)

      const overall = calculateOverall(stats, position)
      const preferredPlaystyle = STYLE_PLAYSTYLE_MAP[style] as TeamPlaystyle

      players.push({
        id:                `player_${position}_${i}_${Math.random().toString(36).substr(2, 5)}`,
        name,
        position,
        nationality:       pick(nationalities),
        age:               rand(18, 36),
        style,
        preferredPlaystyle,
        stats,
        overall,
        trait:             STYLE_TRAITS[style],
        weaknesses:        STYLE_WEAKNESSES[style],
      })
    }
  }

  return players.sort((a, b) => b.overall - a.overall)
}

// ============================================================
// COLOR HELPERS
// ============================================================

export function getStatColor(value: number): string {
  if (value >= 93) return '#FFD700'
  if (value >= 89) return '#22C55E'
  if (value >= 84) return '#84CC16'
  if (value >= 79) return '#F59E0B'
  if (value >= 75) return '#F97316'
  return '#EF4444'
}

export function getOverallColor(overall: number): string {
  if (overall >= 95) return '#FFD700'
  if (overall >= 93) return '#22C55E'
  if (overall >= 91) return '#3B82F6'
  return '#94A3B8'
}

export function getPositionColor(position: Position): string {
  switch (position) {
    case 'GK':  return '#F59E0B'
    case 'DEF': return '#3B82F6'
    case 'MID': return '#22C55E'
    case 'ATT': return '#EF4444'
  }
}

export function getPositionBgColor(position: Position): string {
  switch (position) {
    case 'GK':  return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    case 'DEF': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    case 'MID': return 'bg-green-500/20 text-green-400 border-green-500/30'
    case 'ATT': return 'bg-red-500/20 text-red-400 border-red-500/30'
  }
}

export function getPlaystyleColor(playstyle: TeamPlaystyle): string {
  switch (playstyle) {
    case 'Attacking':      return 'text-red-400 bg-red-500/10 border-red-500/30'
    case 'Defensive':      return 'text-blue-400 bg-blue-500/10 border-blue-500/30'
    case 'Possession':     return 'text-green-400 bg-green-500/10 border-green-500/30'
    case 'Counter Attack': return 'text-orange-400 bg-orange-500/10 border-orange-500/30'
    case 'Pressing':       return 'text-purple-400 bg-purple-500/10 border-purple-500/30'
    case 'Balanced':       return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
  }
}

export function getVisibleStats(position: string): Array<{ key: string; label: string }> {
  if (position === 'GK') {
    return [
      { key: 'reflexes',      label: 'Reflexes' },
      { key: 'positioning',   label: 'Positioning' },
      { key: 'commandOfArea', label: 'Command' },
      { key: 'distribution',  label: 'Distribution' },
      { key: 'composure',     label: 'Composure' },
      { key: 'physicality',   label: 'Physicality' },
    ]
  }
  if (position === 'DEF') {
    return [
      { key: 'defending',     label: 'Defending' },
      { key: 'interceptions', label: 'Interceptions' },
      { key: 'aerialDuels',   label: 'Aerial Duels' },
      { key: 'ballPlaying',   label: 'Ball Playing' },
      { key: 'pace',          label: 'Pace' },
      { key: 'physicality',   label: 'Physicality' },
    ]
  }
  if (position === 'MID') {
    return [
      { key: 'passing',       label: 'Passing' },
      { key: 'vision',        label: 'Vision' },
      { key: 'creativity',    label: 'Creativity' },
      { key: 'ballRetention', label: 'Ball Retention' },
      { key: 'pressing',      label: 'Pressing' },
      { key: 'stamina',       label: 'Stamina' },
    ]
  }
  if (position === 'ATT') {
    return [
      { key: 'finishing',     label: 'Finishing' },
      { key: 'clinicality',   label: 'Clinicality' },
      { key: 'movement',      label: 'Movement' },
      { key: 'dribbling',     label: 'Dribbling' },
      { key: 'pace',          label: 'Pace' },
      { key: 'holdUpPlay',    label: 'Hold Up Play' },
    ]
  }
  return []
}