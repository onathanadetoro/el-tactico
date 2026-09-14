'use client'

import React, {
  createContext, useContext, useReducer,
  useEffect, useCallback
} from 'react'
import {
  AppState, AppPage, Player, Team, Tournament, Match
} from '@/types'
import { generatePlayers } from '@/data/playerGenerator'
import {
  saveUserTeam, saveTournament, savePlayers,
  loadFromStorage, clearStorage
} from './storage'

// ============================================================
// ACTIONS
// ============================================================

type Action =
  | { type: 'INIT';           players: Player[]; userTeam: Team | null; tournament: Tournament | null }
  | { type: 'SET_PAGE';       page: AppPage }
  | { type: 'SET_TEAM';       team: Team }
  | { type: 'SET_TOURNAMENT'; tournament: Tournament }
  | { type: 'UPDATE_TOURNAMENT'; tournament: Tournament }
  | { type: 'SET_MATCH';      match: Match | null }
  | { type: 'RESET' }

// ============================================================
// INITIAL STATE
// ============================================================

const initial: AppState = {
  currentPage:  'HOME',
  players:      [],
  userTeam:     null,
  tournament:   null,
  currentMatch: null,
}

// ============================================================
// REDUCER
// ============================================================

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {

    case 'INIT':
      return {
        ...state,
        players:     action.players,
        userTeam:    action.userTeam,
        tournament:  action.tournament,
        currentPage:
          action.tournament?.status === 'IN_PROGRESS' ? 'TOURNAMENT' :
          action.tournament?.status === 'COMPLETED'   ? 'TOURNAMENT' :
          action.userTeam                             ? 'TOURNAMENT' :
          'HOME',
      }

    case 'SET_PAGE':
      return { ...state, currentPage: action.page }

    case 'SET_TEAM':
      return { ...state, userTeam: action.team }

    case 'SET_TOURNAMENT':
      return { ...state, tournament: action.tournament }

    case 'UPDATE_TOURNAMENT':
      return { ...state, tournament: action.tournament }

    case 'SET_MATCH':
      return { ...state, currentMatch: action.match }

    case 'RESET':
      return { ...initial }

    default:
      return state
  }
}

// ============================================================
// CONTEXT
// ============================================================

interface Ctx {
  state:             AppState
  navigateTo:        (page: AppPage) => void
  setUserTeam:       (team: Team) => void
  updateUserTeam:    (updates: Partial<Team>) => void
  setTournament:     (t: Tournament) => void
  updateTournament:  (t: Tournament) => void
  setCurrentMatch:   (m: Match | null) => void
  resetGame:         () => void
}

const GameContext = createContext<Ctx | null>(null)

// ============================================================
// PROVIDER
// ============================================================

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial)

  // ── Load from storage on mount ───────────────────────────
  useEffect(() => {
    const stored = loadFromStorage()

    let players = stored.players
    if (!players || players.length === 0) {
      players = generatePlayers()
      savePlayers(players)
    }

    dispatch({
      type:       'INIT',
      players,
      userTeam:   stored.userTeam,
      tournament: stored.tournament,
    })
  }, [])

  // ── Auto-save team ───────────────────────────────────────
  useEffect(() => {
    if (state.userTeam) {
      saveUserTeam(state.userTeam)
    }
  }, [state.userTeam])

  // ── Auto-save tournament ─────────────────────────────────
  useEffect(() => {
    if (state.tournament) {
      saveTournament(state.tournament)
    }
  }, [state.tournament])

  // ── Actions ──────────────────────────────────────────────

  const navigateTo = useCallback((page: AppPage) => {
    dispatch({ type: 'SET_PAGE', page })
  }, [])

  const setUserTeam = useCallback((team: Team) => {
    saveUserTeam(team)
    dispatch({ type: 'SET_TEAM', team })
  }, [])

  const updateUserTeam = useCallback((updates: Partial<Team>) => {
    if (!state.userTeam) return
    const updated = { ...state.userTeam, ...updates }
    saveUserTeam(updated)
    dispatch({ type: 'SET_TEAM', team: updated })
  }, [state.userTeam])

  const setTournament = useCallback((tournament: Tournament) => {
    saveTournament(tournament)
    dispatch({ type: 'SET_TOURNAMENT', tournament })
  }, [])

  const updateTournament = useCallback((tournament: Tournament) => {
    saveTournament(tournament)
    dispatch({ type: 'UPDATE_TOURNAMENT', tournament })
  }, [])

  const setCurrentMatch = useCallback((match: Match | null) => {
    dispatch({ type: 'SET_MATCH', match })
  }, [])

  const resetGame = useCallback(() => {
    clearStorage()
    const players = generatePlayers()
    savePlayers(players)
    dispatch({ type: 'RESET' })
    dispatch({ type: 'INIT', players, userTeam: null, tournament: null })
  }, [])

  return (
    <GameContext.Provider value={{
      state,
      navigateTo,
      setUserTeam,
      updateUserTeam,
      setTournament,
      updateTournament,
      setCurrentMatch,
      resetGame,
    }}>
      {children}
    </GameContext.Provider>
  )
}

// ============================================================
// HOOK
// ============================================================

export function useGame(): Ctx {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used inside GameProvider')
  return ctx
}