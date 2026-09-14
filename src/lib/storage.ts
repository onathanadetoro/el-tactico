import { Team, Tournament, Player } from '@/types'

const KEY = 'usd_game'

export interface StoredData {
  userTeam:    Team | null
  tournament:  Tournament | null
  players:     Player[]
  lastSaved:   string
}

function getDefault(): StoredData {
  return { userTeam: null, tournament: null, players: [], lastSaved: '' }
}

export function loadFromStorage(): StoredData {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return getDefault()
    const parsed = JSON.parse(raw)
    return {
      userTeam:   parsed.userTeam   ?? null,
      tournament: parsed.tournament ?? null,
      players:    parsed.players    ?? [],
      lastSaved:  parsed.lastSaved  ?? '',
    }
  } catch {
    return getDefault()
  }
}

function save(data: Partial<StoredData>) {
  try {
    const existing = loadFromStorage()
    const updated  = { ...existing, ...data, lastSaved: new Date().toISOString() }
    localStorage.setItem(KEY, JSON.stringify(updated))
  } catch (e) {
    console.error('Save failed', e)
  }
}

export function saveUserTeam(team: Team | null)          { save({ userTeam: team }) }
export function saveTournament(t: Tournament | null)     { save({ tournament: t }) }
export function savePlayers(players: Player[])           { save({ players }) }

export function clearStorage() {
  try {
    // Clear both old and new keys
    localStorage.removeItem(KEY)
    localStorage.removeItem('ultimate_soccer_draft')
  } catch {}
}

export function getLastSaved(): string | null {
  try {
    const d = loadFromStorage()
    if (!d.lastSaved) return null
    return new Date(d.lastSaved).toLocaleString()
  } catch { return null }
}

export interface LocalStorageData extends StoredData {}