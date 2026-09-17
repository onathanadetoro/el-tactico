'use client'

import React, { useState, useCallback } from 'react'
import clsx from 'clsx'
import { Tournament, Match } from '@/types'
import { useGame } from '@/lib/gameContext'
import { createTournament, simulateTournamentMatch, advanceTournament, getStageMatches } from '@/lib/tournamentEngine'
import TournamentBracket from './TournamentBracket'
import MatchSimulation from './MatchSimulation'
import TrophyScreen from './TrophyScreen'
import Button from '@/components/ui/Button'
import { Trophy, Play, Users, Target, Shield, ChevronLeft, Zap, AlertCircle } from 'lucide-react'

type TournamentView = 'BRACKET' | 'MATCH' | 'TROPHY'

export default function TournamentPage() {
  const { state, setTournament, updateTournament, navigateTo } = useGame()
  const { players, userTeam, tournament } = state

  const [view, setView]           = useState<TournamentView>('BRACKET')
  const [activeMatch, setActiveMatch] = useState<Match | null>(null)
  const [simulating, setSimulating]   = useState(false)

  // Create tournament if not exists
  const handleCreateTournament = useCallback(() => {
    if (!userTeam) return
    const newTournament = createTournament(userTeam, players)
    setTournament(newTournament)
  }, [userTeam, players, setTournament])

  // Open a match for simulation
  const handlePlayMatch = useCallback((match: Match) => {
    setActiveMatch(match)
    setView('MATCH')
  }, [])

  // Handle match completion
  const handleMatchComplete = useCallback((updatedTournament: Tournament, completedMatch: Match) => {
    updateTournament(updatedTournament)
    setActiveMatch(null)

    if (updatedTournament.status === 'COMPLETED') {
      setView('TROPHY')
    } else {
      setView('BRACKET')

      // Auto-simulate AI matches for current stage
      setTimeout(() => {
        simulateAIMatches(updatedTournament)
      }, 500)
    }
  }, [updateTournament])

  // Simulate all AI matches in current stage
  const simulateAIMatches = useCallback((currentTournament: Tournament) => {
    if (!currentTournament.currentStage) return

    const stageMatches = getStageMatches(currentTournament, currentTournament.currentStage)
    const pendingAIMatches = stageMatches.filter(m =>
      m.status === 'PENDING' &&
      m.homeTeamId !== currentTournament.userTeamId &&
      m.awayTeamId !== currentTournament.userTeamId
    )

    if (pendingAIMatches.length === 0) return

    setSimulating(true)

    let updatedT = { ...currentTournament }

    for (const match of pendingAIMatches) {
      const simResult = simulateTournamentMatch(match, updatedT, players)
      updatedT = advanceTournament(updatedT, simResult, players)
    }

    updateTournament(updatedT)
    setSimulating(false)

    if (updatedT.status === 'COMPLETED') {
      setView('TROPHY')
    }
  }, [players, updateTournament])

  // Simulate all AI matches manually
  const handleSimulateAI = useCallback(() => {
    if (!tournament) return
    simulateAIMatches(tournament)
  }, [tournament, simulateAIMatches])

  // Back from match
  const handleBackFromMatch = useCallback(() => {
    setView('BRACKET')
    setActiveMatch(null)
  }, [])

  // Not started
  if (!tournament) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center space-y-6">
          <div className="text-3xl font-black mb-4">FA Cup</div>
          <h1 className="text-3xl font-black gradient-text">FA Cup</h1>
          <p className="text-text-secondary">
            You're about to enter the FA Cup with <strong className="text-text-primary">{userTeam?.name}</strong>.
            One loss eliminates you. Navigate real clubs through the Quarter Final, Semi Final, and Final.
          </p>

          {/* Team summary */}
          {userTeam && (
            <div className="bg-panel border border-border rounded-xl p-4 text-left">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Users size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-bold text-text-primary">{userTeam.name}</p>
                  <p className="text-xs text-text-secondary">{userTeam.formation} Formation</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-panel-light rounded-lg p-2">
                  <p className="text-xs text-text-muted">Players</p>
                  <p className="font-bold text-text-primary">{userTeam.squad.filter(s => s.playerId).length}/11</p>
                </div>
                <div className="bg-panel-light rounded-lg p-2">
                  <p className="text-xs text-text-muted">Captain</p>
                  <p className="font-bold text-text-primary">
                    {userTeam.captainId
                      ? players.find(p => p.id === userTeam.captainId)?.name.split(' ')[1] ?? '—'
                      : 'None'}
                  </p>
                </div>
                <div className="bg-panel-light rounded-lg p-2">
                  <p className="text-xs text-text-muted">Formation</p>
                  <p className="font-bold text-text-primary">{userTeam.formation}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => navigateTo('SQUAD_BUILDER')} icon={<ChevronLeft size={16} />}>
              Edit Squad
            </Button>
            <Button variant="success" size="lg" onClick={handleCreateTournament} icon={<Trophy size={20} />}>
              Start Tournament!
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Trophy screen
  if (view === 'TROPHY' || tournament.status === 'COMPLETED') {
    return (
      <TrophyScreen
        tournament={tournament}
        players={players}
        onPlayAgain={() => navigateTo('HOME')}
      />
    )
  }

  // Match simulation view
  if (view === 'MATCH' && activeMatch) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
          <button
            onClick={handleBackFromMatch}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-sm"
          >
            <ChevronLeft size={16} /> Back to Bracket
          </button>
        </div>
        <MatchSimulation
          match={activeMatch}
          tournament={tournament}
          onMatchComplete={handleMatchComplete}
        />
      </div>
    )
  }

  // Bracket view
  const currentStageMatches = tournament.currentStage
    ? getStageMatches(tournament, tournament.currentStage)
    : []
  const userMatch = currentStageMatches.find(
    m => m.homeTeamId === tournament.userTeamId || m.awayTeamId === tournament.userTeamId
  )
  const pendingAIMatches = currentStageMatches.filter(
    m => m.status === 'PENDING' &&
    m.homeTeamId !== tournament.userTeamId &&
    m.awayTeamId !== tournament.userTeamId
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-panel border-b border-border px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigateTo('HOME')}
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-sm"
            >
              <ChevronLeft size={16} /> Home
            </button>
            <h1 className="text-xl font-black gradient-text">FA Cup</h1>
            <div className="text-xs text-text-muted">
              {tournament.currentStage?.replace('_', ' ') ?? 'Complete'}
            </div>
          </div>

          {/* Tournament stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Goals For',     value: tournament.stats.userGoalsScored,   icon: <Target size={14} />,  color: 'text-success' },
              { label: 'Goals Against', value: tournament.stats.userGoalsConceded, icon: <Shield size={14} />,  color: 'text-danger' },
              { label: 'Matches Won',   value: tournament.stats.userMatchesWon,    icon: <Trophy size={14} />,  color: 'text-warning' },
              { label: 'Played',        value: tournament.stats.userMatchesPlayed, icon: <Zap size={14} />,     color: 'text-primary' },
            ].map(stat => (
              <div key={stat.label} className="bg-panel-light rounded-lg p-2.5 text-center">
                <div className={clsx('flex items-center justify-center gap-1 mb-1', stat.color)}>
                  {stat.icon}
                  <span className="text-xs text-text-muted">{stat.label}</span>
                </div>
                <p className={clsx('text-xl font-black', stat.color)}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Action card for user */}
        {userMatch && userMatch.status === 'PENDING' && (
          <div className="bg-primary/10 border border-primary/30 rounded-xl p-5 animate-pulse-slow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-primary mb-1">
                  Your Next Match
                  {userMatch.stage === 'FINAL' && ' — The Final!'}
                </h3>
                <p className="text-text-secondary text-sm">
                  {userMatch.homeTeamName} vs {userMatch.awayTeamName}
                </p>
              </div>
              <Button
                variant="primary"
                size="lg"
                onClick={() => handlePlayMatch(userMatch)}
                icon={<Play size={18} className="fill-white" />}
              >
                Play Match
              </Button>
            </div>
          </div>
        )}

        {/* User eliminated */}
        {tournament.teams.find(t => t.id === tournament.userTeamId)?.eliminated && (
          <div className="bg-danger/10 border border-danger/30 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <AlertCircle size={24} className="text-danger shrink-0" />
              <div>
                <h3 className="font-black text-danger mb-1">You've Been Eliminated</h3>
                <p className="text-text-secondary text-sm">
                  The tournament continues. Watch the remaining matches or start a new game.
                </p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="danger" onClick={() => navigateTo('HOME')}>
                New Game
              </Button>
            </div>
          </div>
        )}

        {/* Simulate AI matches */}
        {pendingAIMatches.length > 0 && (!userMatch || userMatch.status === 'COMPLETED') && (
          <div className="bg-panel border border-border rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-text-primary text-sm">
                {pendingAIMatches.length} AI match{pendingAIMatches.length > 1 ? 'es' : ''} pending
              </p>
              <p className="text-text-muted text-xs">Simulate to advance the bracket</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSimulateAI}
              loading={simulating}
              icon={<Zap size={14} />}
            >
              Simulate AI Matches
            </Button>
          </div>
        )}

        {/* Bracket */}
        <div className="bg-panel border border-border rounded-xl p-4 md:p-6">
          <h2 className="font-bold text-text-primary mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-warning" />
            FA Cup Bracket
          </h2>
          <TournamentBracket
            tournament={tournament}
            onPlayMatch={handlePlayMatch}
          />
        </div>
      </div>
    </div>
  )
}