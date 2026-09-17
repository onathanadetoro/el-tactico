'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import clsx from 'clsx'
import { Match, Tournament, Player } from '@/types'
import { simulateTournamentMatch, advanceTournament } from '@/lib/tournamentEngine'
import { useGame } from '@/lib/gameContext'
import Button from '@/components/ui/Button'
import { Play, Clock, Zap, Shield, Target, ChevronRight } from 'lucide-react'

interface MatchSimulationProps {
  match: Match
  tournament: Tournament
  onMatchComplete: (updatedTournament: Tournament, completedMatch: Match) => void
}

type SimPhase = 'PRE' | 'SIMULATING' | 'HALF_TIME' | 'SECOND_HALF' | 'COMPLETE'

export default function MatchSimulation({ match, tournament, onMatchComplete }: MatchSimulationProps) {
  const { state } = useGame()
  const { players } = state

  const [phase, setPhase]           = useState<SimPhase>('PRE')
  const [currentMinute, setCurrentMinute] = useState(0)
  const [displayedEvents, setDisplayedEvents] = useState<NonNullable<Match['events']>>([])
  const [liveScore, setLiveScore]   = useState<[number, number]>([0, 0])
  const [completedMatch, setCompletedMatch] = useState<Match | null>(null)
  const [updatedTournament, setUpdatedTournament] = useState<Tournament | null>(null)
  const eventsRef = useRef<HTMLDivElement>(null)

  const isUserHome  = match.homeTeamId === tournament.userTeamId
  const userTeamName = isUserHome ? match.homeTeamName : match.awayTeamName
  const oppTeamName  = isUserHome ? match.awayTeamName : match.homeTeamName
  const opponent = tournament.teams.find(t => t.id === (isUserHome ? match.awayTeamId : match.homeTeamId))
  const userTeam = tournament.teams.find(t => t.id === tournament.userTeamId)

  // Simulate the match result upfront
  const simulatedMatch = React.useMemo(() => {
    return simulateTournamentMatch(match, tournament, players)
  }, [match, tournament, players])

  // Run simulation animation
  const runSimulation = useCallback(() => {
    if (!simulatedMatch.events) return
    const events = simulatedMatch.events

    setPhase('SIMULATING')
    setCurrentMinute(0)
    setDisplayedEvents([])
    setLiveScore([0, 0])

    let minute = 0
    let eventIndex = 0
    const scoreTrack: [number, number] = [0, 0]

    const interval = setInterval(() => {
      minute += 1
      setCurrentMinute(minute)

      // Add events that occur at this minute
      while (eventIndex < events.length && events[eventIndex].minute <= minute) {
        const evt = events[eventIndex]
        if (evt.type === 'GOAL') {
          if (evt.teamId === match.homeTeamId) {
            scoreTrack[0]++
          } else {
            scoreTrack[1]++
          }
          setLiveScore([...scoreTrack])
        }
        setDisplayedEvents(prev => [...prev, evt])
        eventIndex++
      }

      // Half time pause
      if (minute === 45) {
        clearInterval(interval)
        setPhase('HALF_TIME')
        return
      }

      // End of match
      if (minute >= 90) {
        clearInterval(interval)

        const advanced = advanceTournament(tournament, simulatedMatch, players)
        setCompletedMatch(simulatedMatch)
        setUpdatedTournament(advanced)
        setPhase('COMPLETE')
      }
    }, 60) // 60ms per minute = ~5.4 seconds per half

    return () => clearInterval(interval)
  }, [simulatedMatch, match, tournament, players])

  // Continue to second half
  const continueSecondHalf = useCallback(() => {
    if (!simulatedMatch.events) return
    setPhase('SECOND_HALF')
    const events = simulatedMatch.events
    let minute = 45
    let eventIndex = displayedEvents.length
    const scoreTrack: [number, number] = [...liveScore]

    const interval = setInterval(() => {
      minute += 1
      setCurrentMinute(minute)

      while (eventIndex < events.length && events[eventIndex].minute <= minute) {
        const evt = events[eventIndex]
        if (evt.type === 'GOAL') {
          if (evt.teamId === match.homeTeamId) scoreTrack[0]++
          else scoreTrack[1]++
          setLiveScore([...scoreTrack])
        }
        setDisplayedEvents(prev => [...prev, evt])
        eventIndex++
      }

      if (minute >= 90) {
        clearInterval(interval)
        const advanced = advanceTournament(tournament, simulatedMatch, players)
        setCompletedMatch(simulatedMatch)
        setUpdatedTournament(advanced)
        setPhase('COMPLETE')
      }
    }, 60)

    return () => clearInterval(interval)
  }, [simulatedMatch, displayedEvents, liveScore, match, tournament, players])

  // Auto-scroll events
  useEffect(() => {
    if (eventsRef.current) {
      eventsRef.current.scrollTop = eventsRef.current.scrollHeight
    }
  }, [displayedEvents])

  const userScore = isUserHome ? liveScore[0] : liveScore[1]
  const oppScore  = isUserHome ? liveScore[1] : liveScore[0]
  const isWinning = userScore > oppScore
  const isLosing  = userScore < oppScore

  const stats = simulatedMatch.stats
  const penaltyData = (stats as any)?.penaltyShootout
  const userPenalties = penaltyData ? (isUserHome ? penaltyData.homeGoals : penaltyData.awayGoals) : 0
  const oppPenalties = penaltyData ? (isUserHome ? penaltyData.awayGoals : penaltyData.homeGoals) : 0
  const userStats = {
    possession:    isUserHome ? stats?.possession[0] : stats?.possession[1],
    shots:         isUserHome ? stats?.shots[0]       : stats?.shots[1],
    shotsOnTarget: isUserHome ? stats?.shotsOnTarget[0] : stats?.shotsOnTarget[1],
    saves:         isUserHome ? stats?.saves[0]       : stats?.saves[1],
  }
  const isDraw = (simulatedMatch.score?.[0] ?? 0) === (simulatedMatch.score?.[1] ?? 0)
  const oppStats = {
    possession:    isUserHome ? stats?.possession[1] : stats?.possession[0],
    shots:         isUserHome ? stats?.shots[1]       : stats?.shots[0],
    shotsOnTarget: isUserHome ? stats?.shotsOnTarget[1] : stats?.shotsOnTarget[0],
    saves:         isUserHome ? stats?.saves[1]       : stats?.saves[0],
  }

  const handleContinue = () => {
    if (completedMatch && updatedTournament) {
      onMatchComplete(updatedTournament, completedMatch)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto space-y-4">

        {/* Scoreboard */}
        <div className={clsx(
          'relative overflow-hidden rounded-2xl border p-6 text-center',
          phase === 'COMPLETE'
            ? isDraw
              ? 'border-warning bg-warning/5'
              : isUserHome
                ? (simulatedMatch.score?.[0] ?? 0) > (simulatedMatch.score?.[1] ?? 0)
                  ? 'border-success bg-success/5'
                  : 'border-danger bg-danger/5'
                : (simulatedMatch.score?.[1] ?? 0) > (simulatedMatch.score?.[0] ?? 0)
                  ? 'border-success bg-success/5'
                  : 'border-danger bg-danger/5'
            : 'border-border bg-panel'
        )}>
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none">
            {(phase === 'SIMULATING' || phase === 'SECOND_HALF') && (
              <div className="absolute inset-0 bg-gradient-radial from-primary/5 to-transparent animate-pulse-slow" />
            )}
          </div>

          {/* Stage badge */}
          <div className="mb-3">
            <span className={clsx(
              'inline-block px-3 py-1 rounded-full text-xs font-bold',
              match.stage === 'FINAL'
                ? 'bg-warning/20 text-warning border border-warning/30'
                : 'bg-primary/20 text-primary border border-primary/30'
            )}>
              {match.stage === 'ROUND_OF_32' ? 'FA Cup — Round of 32'
                : match.stage === 'ROUND_OF_16' ? 'FA Cup — Round of 16'
                : match.stage === 'QUARTER_FINAL' ? 'FA Cup — Quarter Final'
                : match.stage === 'SEMI_FINAL' ? 'FA Cup — Semi Final'
                : 'FA Cup — Final'}
            </span>
          </div>

          {/* Teams & Score */}
          <div className="flex items-center justify-center gap-6">
            {/* Home */}
            <div className="flex-1 text-right">
              <p className={clsx(
                'font-black text-lg',
                match.homeTeamId === tournament.userTeamId ? 'text-primary' : 'text-text-primary'
              )}>
                {match.homeTeamName}
              </p>
              {match.homeTeamId === tournament.userTeamId && (
                <p className="text-xs text-primary">Your Team</p>
              )}
            </div>

            {/* Score */}
            <div className="flex items-center gap-3">
              <span className={clsx(
                'text-5xl font-black tabular-nums',
                liveScore[0] > liveScore[1] ? 'text-success' : 'text-text-primary'
              )}>
                {liveScore[0]}
              </span>
              <span className="text-text-muted text-2xl font-light">:</span>
              <span className={clsx(
                'text-5xl font-black tabular-nums',
                liveScore[1] > liveScore[0] ? 'text-success' : 'text-text-primary'
              )}>
                {liveScore[1]}
              </span>
            </div>

            {/* Away */}
            <div className="flex-1 text-left">
              <p className={clsx(
                'font-black text-lg',
                match.awayTeamId === tournament.userTeamId ? 'text-primary' : 'text-text-primary'
              )}>
                {match.awayTeamName}
              </p>
              {match.awayTeamId === tournament.userTeamId && (
                <p className="text-xs text-primary">Your Team</p>
              )}
            </div>
          </div>

          {/* Minute / Status */}
          <div className="mt-3 flex items-center justify-center gap-2">
            {(phase === 'SIMULATING' || phase === 'SECOND_HALF') && (
              <>
                <span className="live-dot w-2 h-2 rounded-full bg-danger inline-block" />
                <span className="text-danger text-sm font-bold">{currentMinute}'</span>
              </>
            )}
            {phase === 'HALF_TIME' && (
              <span className="text-warning text-sm font-bold">Half Time</span>
            )}
            {phase === 'COMPLETE' && (
              <span className="text-text-secondary text-sm font-bold">Full Time</span>
            )}
            {phase === 'PRE' && (
              <span className="text-text-muted text-sm">Pre-match</span>
            )}
          </div>

          {/* Progress bar */}
          {(phase === 'SIMULATING' || phase === 'SECOND_HALF') && (
            <div className="mt-3 mx-auto w-48 h-1 bg-panel-lighter rounded-full overflow-hidden">
              <div
                className="h-full bg-danger rounded-full transition-all duration-200"
                style={{ width: `${(currentMinute / 90) * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* PRE-MATCH */}
        {phase === 'PRE' && (
          <div className="bg-panel border border-border rounded-xl p-6 text-center animate-fade-in">
            <h3 className="text-xl font-black text-text-primary mb-2">
              {match.stage === 'FINAL' ? 'The Final!' : 'Match Preview'}
            </h3>
            <p className="text-text-secondary mb-2">
              {match.homeTeamName} vs {match.awayTeamName}
            </p>
            <p className="text-xs text-text-muted mb-6">
              Your team {userTeam?.strength ?? '—'} OVR · {oppTeamName} {opponent?.strength ?? '—'} OVR · {(opponent?.difficulty ?? 'medium').toUpperCase()} difficulty
            </p>
            <Button variant="primary" size="xl" onClick={runSimulation} icon={<Play size={20} className="fill-white" />}>
              Kick Off!
            </Button>
          </div>
        )}

        {/* HALF TIME */}
        {phase === 'HALF_TIME' && (
          <div className="bg-panel border border-border rounded-xl p-6 text-center animate-fade-in">
            <h3 className="text-lg font-black text-warning mb-2">⏸ Half Time</h3>
            <p className="text-text-secondary mb-4">
              {liveScore[0]} - {liveScore[1]} at the break
            </p>
            <Button variant="primary" size="lg" onClick={continueSecondHalf}>
              Continue — Second Half
            </Button>
          </div>
        )}

        {/* COMPLETE */}
        {phase === 'COMPLETE' && simulatedMatch && (
          <div>
            <div className={clsx(
              'bg-panel border rounded-xl p-6 text-center animate-celebration',
              simulatedMatch.winnerId === tournament.userTeamId
                ? 'border-success'
                : 'border-danger'
            )}>
              {simulatedMatch.winnerId === tournament.userTeamId ? (
                <div>
                  <div className="text-2xl font-black mb-2">Victory</div>
                  <h3 className="text-xl font-black text-success mb-1">Victory!</h3>
                  <p className="text-text-secondary mb-4">
                    {userTeamName} advances to the next round!
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-2xl font-black mb-2">Defeat</div>
                  <h3 className="text-xl font-black text-danger mb-1">Eliminated</h3>
                  <p className="text-text-secondary mb-4">
                    {oppTeamName} wins. Better luck next time.
                  </p>
                </div>
              )}
              <Button variant="primary" size="lg" onClick={handleContinue}>
                Continue
              </Button>
            </div>
            <div className="bg-panel-light border border-border rounded-xl p-4 mt-4 text-left">
              <p className="text-xs font-bold text-primary uppercase tracking-wide mb-1">Tactical verdict</p>
              <p className="text-sm text-text-secondary">{String((stats as any)?.tacticalVerdict ?? 'The result reflected team quality, chemistry and key moments.')}</p>
            </div>
            {penaltyData && (
              <div className="bg-panel border border-warning rounded-xl p-4 mt-4 text-center">
                <h3 className="font-bold text-warning mb-2 text-sm">Penalty Shootout</h3>
                <span className="text-text-primary font-black">{userTeamName} {userPenalties} — {oppPenalties} {oppTeamName}</span>
              </div>
            )}
          </div>
        )}

        {/* MATCH STATS */}
        {(phase === 'SIMULATING' || phase === 'SECOND_HALF' || phase === 'COMPLETE' || phase === 'HALF_TIME') && stats && (
          <div className="bg-panel border border-border rounded-xl p-4 animate-fade-in">
            <h3 className="font-bold text-text-primary mb-3 text-sm">Match Statistics</h3>
            {[
              { label: 'Possession', home: stats.possession[0], away: stats.possession[1], unit: '%' },
              { label: 'Shots',      home: stats.shots[0],      away: stats.shots[1] },
              { label: 'On Target',  home: stats.shotsOnTarget[0], away: stats.shotsOnTarget[1] },
              { label: 'Saves',      home: stats.saves[0],      away: stats.saves[1] },
              { label: 'Corners',    home: stats.corners[0],    away: stats.corners[1] },
              { label: 'Fouls',      home: stats.fouls[0],      away: stats.fouls[1] },
            ].map(stat => {
              const total = stat.home + stat.away || 1
              const homePct = (stat.home / total) * 100
              return (
                <div key={stat.label} className="mb-2.5">
                  <div className="flex justify-between text-xs text-text-secondary mb-1">
                    <span className="font-bold text-text-primary">{stat.home}{stat.unit ?? ''}</span>
                    <span className="text-text-muted">{stat.label}</span>
                    <span className="font-bold text-text-primary">{stat.away}{stat.unit ?? ''}</span>
                  </div>
                  <div className="flex h-1.5 rounded-full overflow-hidden bg-panel-lighter">
                    <div
                      className="bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${homePct}%` }}
                    />
                    <div
                      className="bg-danger rounded-full transition-all duration-500 flex-1"
                      style={{ width: `${100 - homePct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* EVENTS TIMELINE */}
        {displayedEvents.length > 0 && (
          <div className="bg-panel border border-border rounded-xl p-4">
            <h3 className="font-bold text-text-primary mb-3 text-sm">Match Events</h3>
            <div ref={eventsRef} className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
              {displayedEvents.map((evt, i) => {
                const isHome   = evt.teamId === match.homeTeamId
                const isGoal   = evt.type === 'GOAL'
                const isUser   = evt.teamId === tournament.userTeamId
                return (
                  <div
                    key={i}
                    className={clsx(
                      'flex items-center gap-2 p-2 rounded-lg text-xs timeline-event',
                      isGoal
                        ? isUser
                          ? 'bg-success/15 border border-success/30'
                          : 'bg-danger/15 border border-danger/30'
                        : 'bg-panel-light border border-border'
                    )}
                  >
                    <span className="text-text-muted font-mono w-8 shrink-0">{evt.minute}'</span>
                    <span className="flex-1 text-text-primary">{evt.description}</span>
                    <span className={clsx(
                      'text-xs font-semibold shrink-0',
                      isHome ? 'text-primary' : 'text-danger'
                    )}>
                      {isHome ? match.homeTeamName.split(' ')[0] : match.awayTeamName.split(' ')[0]}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}