import { Player, PlayerStats, Position, TeamPlaystyle } from '@/types'

export type PlayerArchetype =
  | 'Shot Stopper' | 'Sweeper Keeper' | 'Ball-Playing Keeper' | 'Commanding Keeper' | 'Aggressive Keeper'
  | 'Ball-Playing Defender' | 'Stopper' | 'Cover Defender' | 'No-Nonsense Defender' | 'Progressive Defender' | 'Aerial Dominator' | 'Sweeper'
  | 'Attacking Fullback' | 'Inverted Fullback' | 'Defensive Fullback' | 'Wingback' | 'Crossing Specialist' | 'Overlapping Runner' | 'Wide Playmaker'
  | 'Ball Winner' | 'Anchor' | 'Deep-Lying Playmaker' | 'Regista' | 'Destroyer' | 'Half-Back'
  | 'Box-to-Box' | 'Advanced Playmaker' | 'Tempo Controller' | 'Mezzala' | 'Ball Carrier' | 'Creative Controller'
  | 'Shadow Striker' | 'Classic No. 10' | 'Pressing Creator' | 'Free Roamer'
  | 'Traditional Winger' | 'Inverted Winger' | 'Inside Forward' | 'Creative Winger' | 'Direct Winger' | 'Touchline Winger' | 'Counter Runner'
  | 'Poacher' | 'Complete Forward' | 'Target Man' | 'False 9' | 'Pressing Forward' | 'Creator' | 'Advanced Forward' | 'Physical Forward' | 'Mobile Forward'

export interface ArchetypeProfile {
  archetype: PlayerArchetype
  tacticalFit: Partial<Record<TeamPlaystyle, number>>
  strength: (s: PlayerStats) => string
  weakness: (s: PlayerStats) => string
}

const v = (s: PlayerStats, key: keyof PlayerStats, fallback = 70) => Number(s[key] ?? fallback)
const best = (s: PlayerStats, keys: (keyof PlayerStats)[]) => keys.reduce((a, k) => v(s, k) > v(s, a) ? k : a, keys[0])

const profiles: Record<PlayerArchetype, ArchetypeProfile> = {
  'Shot Stopper': { archetype:'Shot Stopper', tacticalFit:{Defensive:1, Balanced:.9}, strength:s=>`Reflex saves built on ${v(s,'reflexes')} reflexes`, weakness:s=>`Contributes little beyond the box with ${v(s,'distribution')} distribution` },
  'Sweeper Keeper': { archetype:'Sweeper Keeper', tacticalFit:{Pressing:1,Possession:.95}, strength:s=>`Sweeps behind the line with ${v(s,'pace')} pace and ${v(s,'positioning')} positioning`, weakness:s=>`Leaves more space to defend when his aggressive positioning fails` },
  'Ball-Playing Keeper': { archetype:'Ball-Playing Keeper', tacticalFit:{Possession:1,Attacking:.9}, strength:s=>`Starts buildup with ${v(s,'distribution')} distribution and calm passing`, weakness:s=>`Offers less immediate protection when shots arrive in volume` },
  'Commanding Keeper': { archetype:'Commanding Keeper', tacticalFit:{Defensive:1,Balanced:.9}, strength:s=>`Controls crosses and aerial situations with ${v(s,'commandOfArea')} command`, weakness:s=>`Is less specialised at launching attacks from deep` },
  'Aggressive Keeper': { archetype:'Aggressive Keeper', tacticalFit:{Pressing:1,'Counter Attack':.9}, strength:s=>`Closes attackers early with ${v(s,'pace')} pace off the line`, weakness:s=>`A mistimed rush can expose the goal behind him` },
  'Ball-Playing Defender': { archetype:'Ball-Playing Defender', tacticalFit:{Possession:1,Attacking:.9}, strength:s=>`Breaks lines with ${v(s,'passing')} passing from deep`, weakness:s=>`Can be less dominant in direct physical duels` },
  'Stopper': { archetype:'Stopper', tacticalFit:{Pressing:1,Defensive:.9}, strength:s=>`Steps out decisively with ${v(s,'defending')} defending and ${v(s,'physicality')} strength`, weakness:s=>`Leaving the line can create gaps behind the challenge` },
  'Cover Defender': { archetype:'Cover Defender', tacticalFit:{Defensive:1,'Counter Attack':.9}, strength:s=>`Protects space behind the line with ${v(s,'pace')} recovery pace`, weakness:s=>`Is less aggressive when defending the ball in front` },
  'No-Nonsense Defender': { archetype:'No-Nonsense Defender', tacticalFit:{Defensive:1}, strength:s=>`Wins ugly moments through ${v(s,'defending')} defending and clearances`, weakness:s=>`Adds limited progression to patient buildup` },
  'Progressive Defender': { archetype:'Progressive Defender', tacticalFit:{Possession:1,'Counter Attack':.9}, strength:s=>`Carries possession forward with ${v(s,'ballPlaying')} ball progression`, weakness:s=>`Aggressive carries can expose possession in dangerous areas` },
  'Aerial Dominator': { archetype:'Aerial Dominator', tacticalFit:{Defensive:1}, strength:s=>`Owns crosses and set pieces with ${v(s,'aerialDuels')} aerial ability`, weakness:s=>`Mobile attackers can pull him away from his best duels` },
  'Sweeper': { archetype:'Sweeper', tacticalFit:{Defensive:1,'Counter Attack':.95}, strength:s=>`Anticipates through balls with ${v(s,'interceptions')} interceptions`, weakness:s=>`Constant close-contact duels reduce his influence` },
  'Attacking Fullback': { archetype:'Attacking Fullback', tacticalFit:{Attacking:1,'Counter Attack':.95}, strength:s=>`Creates width through overlapping runs and ${v(s,'pace')} pace`, weakness:s=>`Space opens behind him when attacks break down` },
  'Inverted Fullback': { archetype:'Inverted Fullback', tacticalFit:{Possession:1,Defensive:.9}, strength:s=>`Adds a spare midfielder through ${v(s,'passing')} passing inside`, weakness:s=>`Provides less natural width near the touchline` },
  'Defensive Fullback': { archetype:'Defensive Fullback', tacticalFit:{Defensive:1}, strength:s=>`Protects the flank with ${v(s,'defending')} 1v1 defending`, weakness:s=>`Offers limited attacking volume in the final third` },
  'Wingback': { archetype:'Wingback', tacticalFit:{Attacking:1,'Counter Attack':1,Pressing:.9}, strength:s=>`Provides constant width with ${v(s,'stamina')} stamina`, weakness:s=>`High positioning can leave defensive space in transition` },
  'Crossing Specialist': { archetype:'Crossing Specialist', tacticalFit:{Attacking:1}, strength:s=>`Delivers dangerous service with ${v(s,'passing')} passing from wide areas`, weakness:s=>`Loses value when teammates do not attack the box` },
  'Overlapping Runner': { archetype:'Overlapping Runner', tacticalFit:{Attacking:1,Pressing:.9}, strength:s=>`Arrives late beyond the winger with ${v(s,'pace')} pace`, weakness:s=>`Needs coordinated space rather than isolated possession` },
  'Wide Playmaker': { archetype:'Wide Playmaker', tacticalFit:{Possession:1,Attacking:.9}, strength:s=>`Creates from wide areas through ${v(s,'vision')} vision`, weakness:s=>`Is less direct as a runner into the box` },
  'Ball Winner': { archetype:'Ball Winner', tacticalFit:{Pressing:1,Defensive:1}, strength:s=>`Recovers possession through ${v(s,'defending')} tackling and ${v(s,'interceptions')} reading`, weakness:s=>`Provides limited creativity after winning the ball` },
  'Anchor': { archetype:'Anchor', tacticalFit:{Defensive:1,Possession:.9}, strength:s=>`Protects the defence through disciplined ${v(s,'positioning')} positioning`, weakness:s=>`Rarely adds numbers beyond the ball` },
  'Deep-Lying Playmaker': { archetype:'Deep-Lying Playmaker', tacticalFit:{Possession:1,Attacking:.85}, strength:s=>`Dictates buildup with ${v(s,'passing')} passing from deep`, weakness:s=>`Does not offer the same aggressive ball-winning as a destroyer` },
  'Regista': { archetype:'Regista', tacticalFit:{Possession:1,'Counter Attack':.9}, strength:s=>`Switches play and progresses attacks with ${v(s,'vision')} vision`, weakness:s=>`Needs defensive cover when roaming for passing angles` },
  'Destroyer': { archetype:'Destroyer', tacticalFit:{Pressing:1,Defensive:.9}, strength:s=>`Disrupts midfield through ${v(s,'pressing')} pressing and duels`, weakness:s=>`Aggressive movement can pull him out of position` },
  'Half-Back': { archetype:'Half-Back', tacticalFit:{Possession:1,Defensive:1}, strength:s=>`Drops into the line to create buildup superiority`, weakness:s=>`Offers less midfield presence while protecting the defence` },
  'Box-to-Box': { archetype:'Box-to-Box', tacticalFit:{Balanced:1,Pressing:.95}, strength:s=>`Contributes across transitions with ${v(s,'stamina')} stamina`, weakness:s=>`Does not specialise in one phase of play` },
  'Advanced Playmaker': { archetype:'Advanced Playmaker', tacticalFit:{Attacking:1,Possession:.95}, strength:s=>`Unlocks defences between the lines with ${v(s,'creativity')} creativity`, weakness:s=>`Provides less defensive work away from the ball` },
  'Tempo Controller': { archetype:'Tempo Controller', tacticalFit:{Possession:1,Balanced:.9}, strength:s=>`Retains and changes tempo with ${v(s,'ballRetention')} ball security`, weakness:s=>`Offers less direct threat in the final third` },
  'Mezzala': { archetype:'Mezzala', tacticalFit:{Attacking:1,Possession:.9}, strength:s=>`Combines in the half-space and arrives with ${v(s,'creativity')} creativity`, weakness:s=>`Can leave central space when drifting wide` },
  'Ball Carrier': { archetype:'Ball Carrier', tacticalFit:{'Counter Attack':1,Attacking:.9}, strength:s=>`Breaks midfield lines with ${v(s,'dribbling')} progressive carries`, weakness:s=>`Risky carries can surrender possession` },
  'Creative Controller': { archetype:'Creative Controller', tacticalFit:{Possession:1,Attacking:.95}, strength:s=>`Combines vision and retention to control attacks`, weakness:s=>`Is less specialised in defensive duels` },
  'Shadow Striker': { archetype:'Shadow Striker', tacticalFit:{Attacking:1,Pressing:.9}, strength:s=>`Times late box runs with ${v(s,'movement')} movement`, weakness:s=>`Becomes quieter when asked to stay deep` },
  'Classic No. 10': { archetype:'Classic No. 10', tacticalFit:{Attacking:1,Possession:.9}, strength:s=>`Finds final passes through ${v(s,'vision')} vision`, weakness:s=>`Can struggle in extremely physical systems` },
  'Pressing Creator': { archetype:'Pressing Creator', tacticalFit:{Pressing:1,Attacking:.9}, strength:s=>`Creates while leading pressure with ${v(s,'pressing')} pressing`, weakness:s=>`Energy-intensive movement can reduce late-game sharpness` },
  'Free Roamer': { archetype:'Free Roamer', tacticalFit:{Attacking:1,Possession:.9}, strength:s=>`Finds unpredictable overloads through ${v(s,'creativity')} creativity`, weakness:s=>`Roaming can disrupt positional structure` },
  'Traditional Winger': { archetype:'Traditional Winger', tacticalFit:{Attacking:1}, strength:s=>`Stretches the pitch and attacks fullbacks with ${v(s,'pace')} pace`, weakness:s=>`Is less effective when forced into central combinations` },
  'Inverted Winger': { archetype:'Inverted Winger', tacticalFit:{Attacking:1,Possession:.9}, strength:s=>`Cuts inside to combine and shoot with ${v(s,'dribbling')} dribbling`, weakness:s=>`Moving inside reduces natural width` },
  'Inside Forward': { archetype:'Inside Forward', tacticalFit:{Attacking:1,'Counter Attack':1}, strength:s=>`Attacks the box from wide areas with ${v(s,'movement')} movement`, weakness:s=>`Contributes less during slow buildup` },
  'Creative Winger': { archetype:'Creative Winger', tacticalFit:{Possession:1,Attacking:.95}, strength:s=>`Creates combinations and chances with ${v(s,'vision')} vision`, weakness:s=>`Offers less direct goal threat than an inside forward` },
  'Direct Winger': { archetype:'Direct Winger', tacticalFit:{'Counter Attack':1,Attacking:.95}, strength:s=>`Drives at defenders with ${v(s,'dribbling')} direct dribbling`, weakness:s=>`Aggressive progression can bring more turnovers` },
  'Touchline Winger': { archetype:'Touchline Winger', tacticalFit:{Possession:.9,Attacking:.95}, strength:s=>`Creates central space by holding the width`, weakness:s=>`Needs teammates attacking the box to maximise that space` },
  'Counter Runner': { archetype:'Counter Runner', tacticalFit:{'Counter Attack':1}, strength:s=>`Explodes into open space with ${v(s,'pace')} pace`, weakness:s=>`Has less impact against a deep defensive block` },
  'Poacher': { archetype:'Poacher', tacticalFit:{'Counter Attack':1,Attacking:.9}, strength:s=>`Anticipates box chances with ${v(s,'movement')} movement`, weakness:s=>`Offers limited buildup beyond the final third` },
  'Complete Forward': { archetype:'Complete Forward', tacticalFit:{Attacking:1,Balanced:1}, strength:s=>`Blends ${v(s,'finishing')} finishing with ${v(s,'holdUpPlay')} link play`, weakness:s=>`Does not specialise as heavily in one phase` },
  'Target Man': { archetype:'Target Man', tacticalFit:{Attacking:.9,Defensive:.85}, strength:s=>`Provides a reliable outlet through ${v(s,'holdUpPlay')} hold-up play`, weakness:s=>`Can be isolated against a high defensive line` },
  'False 9': { archetype:'False 9', tacticalFit:{Possession:1,Attacking:.9}, strength:s=>`Drops between lines to create midfield overloads`, weakness:s=>`Dropping deep can reduce penalty-box presence` },
  'Pressing Forward': { archetype:'Pressing Forward', tacticalFit:{Pressing:1}, strength:s=>`Leads the defensive line with ${v(s,'pressing')} pressure`, weakness:s=>`High-intensity pressing demands consistent energy` },
  'Creator': { archetype:'Creator', tacticalFit:{Possession:1,Attacking:.9}, strength:s=>`Creates chances for teammates through ${v(s,'vision')} vision`, weakness:s=>`Can trade goal volume for combination play` },
  'Advanced Forward': { archetype:'Advanced Forward', tacticalFit:{'Counter Attack':1,Attacking:.95}, strength:s=>`Stretches the line with ${v(s,'pace')} runs behind`, weakness:s=>`Is less involved in deep buildup` },
  'Physical Forward': { archetype:'Physical Forward', tacticalFit:{Attacking:.9,Defensive:.85}, strength:s=>`Competes for duels with ${v(s,'physicality')} physicality`, weakness:s=>`Is less suited to extremely fluid systems` },
  'Mobile Forward': { archetype:'Mobile Forward', tacticalFit:{Attacking:1,'Counter Attack':.9}, strength:s=>`Moves across the frontline to create uncertainty`, weakness:s=>`Movement can leave the central striker zone` },
}

function score(s: PlayerStats, p: Position, a: PlayerArchetype): number {
  const n = (keys: (keyof PlayerStats)[]) => keys.reduce((sum,k) => sum + v(s,k), 0) / keys.length
  if (p==='GK') return a==='Sweeper Keeper'?n(['pace','positioning','distribution']):a==='Ball-Playing Keeper'?n(['distribution','passing','composure']):a==='Commanding Keeper'?n(['commandOfArea','aerialDuels','positioning']):a==='Aggressive Keeper'?n(['pace','positioning','workRate']):n(['reflexes','positioning','composure'])
  if (p==='DEF') return a==='Ball-Playing Defender'||a==='Progressive Defender'?n(['passing','ballPlaying','composure']):a==='Aerial Dominator'?n(['aerialDuels','physicality','defending']):a==='Stopper'?n(['defending','physicality','pressing']):a==='Cover Defender'||a==='Sweeper'?n(['pace','interceptions','positioning']):a==='Attacking Fullback'||a==='Wingback'||a==='Overlapping Runner'?n(['pace','stamina','passing']):a==='Inverted Fullback'?n(['passing','vision','ballRetention']):a==='Crossing Specialist'||a==='Wide Playmaker'?n(['passing','vision','creativity']):n(['defending','positioning','interceptions'])
  if (p==='MID') return a==='Ball Winner'||a==='Destroyer'?n(['defending','interceptions','pressing']):a==='Anchor'||a==='Half-Back'?n(['positioning','defending','ballRetention']):a==='Deep-Lying Playmaker'||a==='Regista'||a==='Tempo Controller'?n(['passing','vision','ballRetention']):a==='Advanced Playmaker'||a==='Creative Controller'||a==='Classic No. 10'||a==='Pressing Creator'?n(['creativity','vision','passing']):a==='Ball Carrier'?n(['dribbling','pace','physicality']):a==='Box-to-Box'?n(['stamina','workRate','physicality']):n(['creativity','movement','passing'])
  return a==='Poacher'?n(['finishing','movement','clinicality']):a==='Target Man'||a==='Physical Forward'?n(['holdUpPlay','physicality','aerialDuels']):a==='False 9'||a==='Creator'||a==='Creative Winger'?n(['passing','vision','creativity']):a==='Pressing Forward'?n(['pressing','stamina','workRate']):a==='Counter Runner'||a==='Advanced Forward'?n(['pace','movement','finishing']):a==='Inside Forward'||a==='Inverted Winger'?n(['dribbling','movement','finishing']):n(['dribbling','pace','creativity'])
}

const byPosition: Record<Position, PlayerArchetype[]> = {
  GK:['Shot Stopper','Sweeper Keeper','Ball-Playing Keeper','Commanding Keeper','Aggressive Keeper'],
  DEF:['Ball-Playing Defender','Stopper','Cover Defender','No-Nonsense Defender','Progressive Defender','Aerial Dominator','Sweeper','Attacking Fullback','Inverted Fullback','Defensive Fullback','Wingback','Crossing Specialist','Overlapping Runner','Wide Playmaker'],
  MID:['Ball Winner','Anchor','Deep-Lying Playmaker','Regista','Destroyer','Half-Back','Box-to-Box','Advanced Playmaker','Tempo Controller','Mezzala','Ball Carrier','Creative Controller','Shadow Striker','Classic No. 10','Pressing Creator','Free Roamer'],
  ATT:['Poacher','Complete Forward','Target Man','False 9','Pressing Forward','Creator','Advanced Forward','Physical Forward','Mobile Forward','Traditional Winger','Inverted Winger','Inside Forward','Creative Winger','Direct Winger','Touchline Winger','Counter Runner'],
}

export function deriveArchetype(player: Pick<Player,'position'|'stats'>): PlayerArchetype {
  const options = byPosition[player.position]
  return options.reduce((best, candidate) => score(player.stats, player.position, candidate) > score(player.stats, player.position, best) ? candidate : best, options[0])
}

export function enrichPlayers(players: Player[]): Player[] {
  const used = new Set<string>()
  return players.map(player => {
    const archetype = deriveArchetype(player)
    const profile = profiles[archetype]
    const candidates = [profile.strength(player.stats), profile.strength({ ...player.stats, pace: v(player.stats,'pace') + 1 }), profile.strength({ ...player.stats, vision: v(player.stats,'vision') + 1 })]
    const weakCandidates = [profile.weakness(player.stats), profile.weakness({ ...player.stats, passing: v(player.stats,'passing') + 1 }), profile.weakness({ ...player.stats, physicality: v(player.stats,'physicality') + 1 })]
    let strength = candidates[0], weakness = weakCandidates[0]
    let found = false
    for (const s of candidates) for (const w of weakCandidates) {
      if (!used.has(`${s}|${w}`)) { strength=s; weakness=w; found = true; break }
    }
    // If a generated pool shares the same headline profile, expose different measured evidence
    // instead of adding arbitrary adjectives or random text.
    const evidenceKeys: (keyof PlayerStats)[] = ['finishing','movement','passing','vision','pace','defending','interceptions','stamina','physicality']
    let evidenceIndex = 0
    while (!found && evidenceIndex < evidenceKeys.length) {
      const key = evidenceKeys[evidenceIndex++]
      const evidenceStrength = `${profile.strength(player.stats)} (${String(key)} ${v(player.stats, key)})`
      const evidenceWeakness = `${profile.weakness(player.stats)} (${String(key)} ${v(player.stats, key)})`
      if (!used.has(`${evidenceStrength}|${evidenceWeakness}`)) {
        strength = evidenceStrength
        weakness = evidenceWeakness
        found = true
      }
    }
    used.add(`${strength}|${weakness}`)
    return { ...player, archetype, trait: strength, weaknesses: weakness }
  })
}

export function getArchetypeProfile(archetype?: string): ArchetypeProfile | null {
  return archetype && profiles[archetype as PlayerArchetype] ? profiles[archetype as PlayerArchetype] : null
}
