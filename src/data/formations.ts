import { Formation, FormationType, PitchPosition } from '@/types'

// ============================================================
// PITCH POSITIONS FOR EACH FORMATION
// Coordinates: x = left-right (0-100%), y = top-bottom (0-100%)
// Top = opponent's goal, Bottom = own goal
// GK is always at bottom (y ~88)
// ============================================================

const formations: Record<FormationType, Formation> = {
  '4-3-3': {
    type: '4-3-3',
    name: '4-3-3',
    description: 'Attacking formation with wide forwards and three midfielders.',
    naturalPlaystyle: 'Attacking',
    requirements: { GK: 1, DEF: 4, MID: 3, ATT: 3 },
    bonuses: {
      attack: 0.08,
      possession: 0.03,
      defensiveStability: -0.04,
    },
    positions: [
      // GK
      { id: 'gk_1',  label: 'GK',  position: 'GK',  x: 50, y: 88, slotIndex: 0 },
      // DEF (4)
      { id: 'def_1', label: 'RB',  position: 'DEF', x: 82, y: 72, slotIndex: 0 },
      { id: 'def_2', label: 'CB',  position: 'DEF', x: 62, y: 75, slotIndex: 1 },
      { id: 'def_3', label: 'CB',  position: 'DEF', x: 38, y: 75, slotIndex: 2 },
      { id: 'def_4', label: 'LB',  position: 'DEF', x: 18, y: 72, slotIndex: 3 },
      // MID (3)
      { id: 'mid_1', label: 'RM',  position: 'MID', x: 75, y: 52, slotIndex: 0 },
      { id: 'mid_2', label: 'CM',  position: 'MID', x: 50, y: 55, slotIndex: 1 },
      { id: 'mid_3', label: 'LM',  position: 'MID', x: 25, y: 52, slotIndex: 2 },
      // ATT (3)
      { id: 'att_1', label: 'RW',  position: 'ATT', x: 80, y: 30, slotIndex: 0 },
      { id: 'att_2', label: 'ST',  position: 'ATT', x: 50, y: 22, slotIndex: 1 },
      { id: 'att_3', label: 'LW',  position: 'ATT', x: 20, y: 30, slotIndex: 2 },
    ],
  },

  '4-2-3-1': {
    type: '4-2-3-1',
    name: '4-2-3-1',
    description: 'Balanced formation with defensive midfield shield and attacking trident.',
    naturalPlaystyle: 'Balanced',
    requirements: { GK: 1, DEF: 4, MID: 5, ATT: 1 },
    bonuses: {
      midfield: 0.05,
      defense: 0.04,
    },
    positions: [
      // GK
      { id: 'gk_1',  label: 'GK',  position: 'GK',  x: 50, y: 88, slotIndex: 0 },
      // DEF (4)
      { id: 'def_1', label: 'RB',  position: 'DEF', x: 82, y: 72, slotIndex: 0 },
      { id: 'def_2', label: 'CB',  position: 'DEF', x: 62, y: 75, slotIndex: 1 },
      { id: 'def_3', label: 'CB',  position: 'DEF', x: 38, y: 75, slotIndex: 2 },
      { id: 'def_4', label: 'LB',  position: 'DEF', x: 18, y: 72, slotIndex: 3 },
      // MID (5: 2 DM + 3 AM)
      { id: 'mid_1', label: 'CDM', position: 'MID', x: 62, y: 60, slotIndex: 0 },
      { id: 'mid_2', label: 'CDM', position: 'MID', x: 38, y: 60, slotIndex: 1 },
      { id: 'mid_3', label: 'RAM', position: 'MID', x: 78, y: 42, slotIndex: 2 },
      { id: 'mid_4', label: 'CAM', position: 'MID', x: 50, y: 40, slotIndex: 3 },
      { id: 'mid_5', label: 'LAM', position: 'MID', x: 22, y: 42, slotIndex: 4 },
      // ATT (1)
      { id: 'att_1', label: 'ST',  position: 'ATT', x: 50, y: 20, slotIndex: 0 },
    ],
  },

  '4-4-2': {
    type: '4-4-2',
    name: '4-4-2',
    description: 'Classic balanced formation with solid midfield and two strikers.',
    naturalPlaystyle: 'Balanced',
    requirements: { GK: 1, DEF: 4, MID: 4, ATT: 2 },
    bonuses: {
      chemistry: 0.03,
    },
    positions: [
      // GK
      { id: 'gk_1',  label: 'GK',  position: 'GK',  x: 50, y: 88, slotIndex: 0 },
      // DEF (4)
      { id: 'def_1', label: 'RB',  position: 'DEF', x: 82, y: 72, slotIndex: 0 },
      { id: 'def_2', label: 'CB',  position: 'DEF', x: 62, y: 75, slotIndex: 1 },
      { id: 'def_3', label: 'CB',  position: 'DEF', x: 38, y: 75, slotIndex: 2 },
      { id: 'def_4', label: 'LB',  position: 'DEF', x: 18, y: 72, slotIndex: 3 },
      // MID (4)
      { id: 'mid_1', label: 'RM',  position: 'MID', x: 78, y: 52, slotIndex: 0 },
      { id: 'mid_2', label: 'CM',  position: 'MID', x: 58, y: 55, slotIndex: 1 },
      { id: 'mid_3', label: 'CM',  position: 'MID', x: 42, y: 55, slotIndex: 2 },
      { id: 'mid_4', label: 'LM',  position: 'MID', x: 22, y: 52, slotIndex: 3 },
      // ATT (2)
      { id: 'att_1', label: 'ST',  position: 'ATT', x: 62, y: 22, slotIndex: 0 },
      { id: 'att_2', label: 'ST',  position: 'ATT', x: 38, y: 22, slotIndex: 1 },
    ],
  },

  '3-5-2': {
    type: '3-5-2',
    name: '3-5-2',
    description: 'Midfield-dominant formation with wing-backs and three defenders.',
    naturalPlaystyle: 'Possession',
    requirements: { GK: 1, DEF: 3, MID: 5, ATT: 2 },
    bonuses: {
      possession: 0.08,
      chanceCreation: 0.06,
      defensiveWidth: -0.06,
    },
    positions: [
      // GK
      { id: 'gk_1',  label: 'GK',  position: 'GK',  x: 50, y: 88, slotIndex: 0 },
      // DEF (3)
      { id: 'def_1', label: 'CB',  position: 'DEF', x: 65, y: 76, slotIndex: 0 },
      { id: 'def_2', label: 'CB',  position: 'DEF', x: 50, y: 78, slotIndex: 1 },
      { id: 'def_3', label: 'CB',  position: 'DEF', x: 35, y: 76, slotIndex: 2 },
      // MID (5: WB + CM + WB)
      { id: 'mid_1', label: 'RWB', position: 'MID', x: 85, y: 58, slotIndex: 0 },
      { id: 'mid_2', label: 'CM',  position: 'MID', x: 67, y: 52, slotIndex: 1 },
      { id: 'mid_3', label: 'CM',  position: 'MID', x: 50, y: 50, slotIndex: 2 },
      { id: 'mid_4', label: 'CM',  position: 'MID', x: 33, y: 52, slotIndex: 3 },
      { id: 'mid_5', label: 'LWB', position: 'MID', x: 15, y: 58, slotIndex: 4 },
      // ATT (2)
      { id: 'att_1', label: 'ST',  position: 'ATT', x: 62, y: 22, slotIndex: 0 },
      { id: 'att_2', label: 'ST',  position: 'ATT', x: 38, y: 22, slotIndex: 1 },
    ],
  },

  '4-1-2-1-2': {
    type: '4-1-2-1-2',
    name: '4-1-2-1-2 Diamond',
    description: 'Diamond midfield providing excellent passing triangles and control.',
    naturalPlaystyle: 'Possession',
    requirements: { GK: 1, DEF: 4, MID: 4, ATT: 2 },
    bonuses: {
      midfield: 0.08,
      possession: 0.05,
      defensiveWidth: -0.05,
    },
    positions: [
      // GK
      { id: 'gk_1',  label: 'GK',  position: 'GK',  x: 50, y: 88, slotIndex: 0 },
      // DEF (4)
      { id: 'def_1', label: 'RB',  position: 'DEF', x: 82, y: 72, slotIndex: 0 },
      { id: 'def_2', label: 'CB',  position: 'DEF', x: 62, y: 76, slotIndex: 1 },
      { id: 'def_3', label: 'CB',  position: 'DEF', x: 38, y: 76, slotIndex: 2 },
      { id: 'def_4', label: 'LB',  position: 'DEF', x: 18, y: 72, slotIndex: 3 },
      // MID Diamond (4: DM + LM + RM + CAM)
      { id: 'mid_1', label: 'CDM', position: 'MID', x: 50, y: 62, slotIndex: 0 },
      { id: 'mid_2', label: 'LM',  position: 'MID', x: 25, y: 50, slotIndex: 1 },
      { id: 'mid_3', label: 'RM',  position: 'MID', x: 75, y: 50, slotIndex: 2 },
      { id: 'mid_4', label: 'CAM', position: 'MID', x: 50, y: 38, slotIndex: 3 },
      // ATT (2)
      { id: 'att_1', label: 'ST',  position: 'ATT', x: 62, y: 22, slotIndex: 0 },
      { id: 'att_2', label: 'ST',  position: 'ATT', x: 38, y: 22, slotIndex: 1 },
    ],
  },

  '5-3-2': {
    type: '5-3-2',
    name: '5-3-2',
    description: 'Defensive formation with five-man backline and two strikers.',
    naturalPlaystyle: 'Defensive',
    requirements: { GK: 1, DEF: 5, MID: 3, ATT: 2 },
    bonuses: {
      defense: 0.10,
      attack: -0.06,
    },
    positions: [
      // GK
      { id: 'gk_1',  label: 'GK',  position: 'GK',  x: 50, y: 88, slotIndex: 0 },
      // DEF (5)
      { id: 'def_1', label: 'RWB', position: 'DEF', x: 88, y: 68, slotIndex: 0 },
      { id: 'def_2', label: 'RCB', position: 'DEF', x: 70, y: 75, slotIndex: 1 },
      { id: 'def_3', label: 'CB',  position: 'DEF', x: 50, y: 78, slotIndex: 2 },
      { id: 'def_4', label: 'LCB', position: 'DEF', x: 30, y: 75, slotIndex: 3 },
      { id: 'def_5', label: 'LWB', position: 'DEF', x: 12, y: 68, slotIndex: 4 },
      // MID (3)
      { id: 'mid_1', label: 'RM',  position: 'MID', x: 72, y: 52, slotIndex: 0 },
      { id: 'mid_2', label: 'CM',  position: 'MID', x: 50, y: 52, slotIndex: 1 },
      { id: 'mid_3', label: 'LM',  position: 'MID', x: 28, y: 52, slotIndex: 2 },
      // ATT (2)
      { id: 'att_1', label: 'ST',  position: 'ATT', x: 62, y: 22, slotIndex: 0 },
      { id: 'att_2', label: 'ST',  position: 'ATT', x: 38, y: 22, slotIndex: 1 },
    ],
  },

  '3-4-3': {
    type: '3-4-3',
    name: '3-4-3',
    description: 'Ultra-attacking formation with three forwards and wing-backs.',
    naturalPlaystyle: 'Attacking',
    requirements: { GK: 1, DEF: 3, MID: 4, ATT: 3 },
    bonuses: {
      attack: 0.10,
      defense: -0.08,
    },
    positions: [
      // GK
      { id: 'gk_1',  label: 'GK',  position: 'GK',  x: 50, y: 88, slotIndex: 0 },
      // DEF (3)
      { id: 'def_1', label: 'CB',  position: 'DEF', x: 65, y: 76, slotIndex: 0 },
      { id: 'def_2', label: 'CB',  position: 'DEF', x: 50, y: 78, slotIndex: 1 },
      { id: 'def_3', label: 'CB',  position: 'DEF', x: 35, y: 76, slotIndex: 2 },
      // MID (4: WB + CM + WB)
      { id: 'mid_1', label: 'RWB', position: 'MID', x: 82, y: 58, slotIndex: 0 },
      { id: 'mid_2', label: 'CM',  position: 'MID', x: 60, y: 52, slotIndex: 1 },
      { id: 'mid_3', label: 'CM',  position: 'MID', x: 40, y: 52, slotIndex: 2 },
      { id: 'mid_4', label: 'LWB', position: 'MID', x: 18, y: 58, slotIndex: 3 },
      // ATT (3)
      { id: 'att_1', label: 'RW',  position: 'ATT', x: 78, y: 28, slotIndex: 0 },
      { id: 'att_2', label: 'ST',  position: 'ATT', x: 50, y: 20, slotIndex: 1 },
      { id: 'att_3', label: 'LW',  position: 'ATT', x: 22, y: 28, slotIndex: 2 },
    ],
  },
}

export default formations

export function getFormation(type: FormationType): Formation {
  return formations[type]
}

export function getAllFormations(): Formation[] {
  return Object.values(formations)
}

export function getFormationRequirements(type: FormationType): { GK: number; DEF: number; MID: number; ATT: number } {
  return formations[type].requirements
}

export function getTotalPlayers(type: FormationType): number {
  const req = formations[type].requirements
  return req.GK + req.DEF + req.MID + req.ATT
}