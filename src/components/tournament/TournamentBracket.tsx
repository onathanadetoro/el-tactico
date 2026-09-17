'use client'

import React from 'react'
import clsx from 'clsx'
import { Tournament, Match, TournamentStage } from '@/types'
import { Trophy, ChevronRight, Clock, CheckCircle2, Play } from 'lucide-react'

interface TournamentBracketProps {
  tournament: Tournament
  onPlayMatch: (match: Match) => void
}

function MatchCard({
  match,
  tournament,
  onPlay,
}: {
  match: Match
  tournament: Tournament
  onPlay: () => void
}) {
  const isUserMatch = 
    match.homeTeamId === tournament.userTeamId ||
    match.awayTeamId === tournament.userTeamId
  const userIsHome  = match.homeTeamId === tournament.userTeamId
  const homeTeam = tournament.teams.find(t => t.id === match.homeTeamId)
  const awayTeam = tournament.teams.find(t => t.id === match.awayTeamId)
  const homeWon     = match.winnerId === match.homeTeamId
  const awayWon     = match.winnerId === match.awayTeamId

  const stageLabels: Record<TournamentStage, string> = {
    ROUND_OF_32:   'R32',
    ROUND_OF_16:   'R16',
    QUARTER_FINAL: 'QF',
    SEMI_FINAL:    'SF',
    FINAL:         'F',
  }

  return (
    <div className={clsx(
      'rounded-xl border p-3 transition-all duration-200',
      match.status === 'COMPLETED'
        ? 'border-border bg-panel'
        : isUserMatch && match.status === 'PENDING'
          ? 'border-primary bg-primary/5 shadow-glow-primary animate-pulse-slow'
          : 'border-border bg-panel',
    )}>
      {/* Stage badge */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-text-muted">
          {stageLabels[match.stage]}
        </span>
        {match.status === 'COMPLETED' && (
          <CheckCircle2 size={12} className="text-success" />
        )}
        {match.status === 'PENDING' && isUserMatch && (
          <span className="flex items-center gap-1 text-xs text-primary font-bold">
            <span className="live-dot w-1.5 h-1.5 rounded-full bg-primary inline-block" />
            Your Match
          </span>
        )}
      </div>

      {/* Home team */}
      <div className={clsx(
        'flex items-center justify-between py-1.5 px-2 rounded-lg mb-1',
        homeWon ? 'bg-success/10' : 'bg-panel-light'
      )}>
        <div className="flex items-center gap-1.5">
          {match.homeTeamId === tournament.userTeamId && (
            <span className="text-primary text-xs">You</span>
          )}
          <span className={clsx(
            'text-sm font-semibold truncate max-w-28',
            homeWon ? 'text-success' : 'text-text-primary'
          )}>
            {match.homeTeamName}
          </span>
        </div>
        {match.score && (
          <span className={clsx(
            'text-sm font-black tabular-nums',
            homeWon ? 'text-success' : 'text-text-secondary'
          )}>
            {match.score[0]}
          </span>
        )}
      </div>

      {/* Away team */}
      <div className={clsx(
        'flex items-center justify-between py-1.5 px-2 rounded-lg',
        awayWon ? 'bg-success/10' : 'bg-panel-light'
      )}>
        <div className="flex items-center gap-1.5">
          {match.awayTeamId === tournament.userTeamId && (
            <span className="text-primary text-xs">You</span>
          )}
          <span className={clsx(
            'text-sm font-semibold truncate max-w-28',
            awayWon ? 'text-success' : 'text-text-primary'
          )}>
            {match.awayTeamName}
          </span>
        </div>
        {match.score && (
          <span className={clsx(
            'text-sm font-black tabular-nums',
            awayWon ? 'text-success' : 'text-text-secondary'
          )}>
            {match.score[1]}
          </span>
        )}
      </div>

      {isUserMatch && match.status === 'PENDING' && (
        <div className="mt-2 text-[10px] text-text-muted text-center">
          Opponent strength {homeTeam?.id === tournament.userTeamId ? awayTeam?.strength?.toFixed(0) : homeTeam?.strength?.toFixed(0)} · {homeTeam?.id === tournament.userTeamId ? (awayTeam?.difficulty ?? 'medium') : (homeTeam?.difficulty ?? 'medium')} tier
        </div>
      )}

      {/* Play button */}
      {match.status === 'PENDING' && isUserMatch && (
        <button
          onClick={onPlay}
          className="w-full mt-2 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
        >
          <Play size={12} className="fill-white" /> Play Match
        </button>
      )}
      {match.status === 'PENDING' && !isUserMatch && (
        <div className="mt-2 flex items-center justify-center gap-1 text-xs text-text-muted">
          <Clock size={10} /> Awaiting simulation
        </div>
      )}
    </div>
  )
}

export default function TournamentBracket({ tournament, onPlayMatch }: TournamentBracketProps) {
  const stages: TournamentStage[] = ['ROUND_OF_32', 'ROUND_OF_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'FINAL']
  const stageNames: Record<TournamentStage, string> = {
    ROUND_OF_32:   'Round of 32',
    ROUND_OF_16:   'Round of 16',
    QUARTER_FINAL: 'Quarter Finals',
    SEMI_FINAL:    'Semi Finals',
    FINAL:         'Final',
  }

  const getStageMatches = (stage: TournamentStage) =>
    tournament.matches.filter(m => m.stage === stage)

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {stages.map((stage, stageIdx) => {
          const matches = getStageMatches(stage)
          if (matches.length === 0) return null

          const isCurrentStage = tournament.currentStage === stage

          return (
            <div key={stage} className="flex flex-col">
              {/* Stage header */}
              <div className={clsx(
                'text-center mb-3 px-4 py-2 rounded-lg font-bold text-sm',
                isCurrentStage
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'text-text-secondary'
              )}>
                {stageNames[stage]}
                {isCurrentStage && (
                  <span className="block text-xs font-normal opacity-80">Current Stage</span>
                )}
              </div>

              {/* Matches */}
              <div className={clsx(
                'flex flex-col justify-around',
                stage === 'QUARTER_FINAL' ? 'gap-3' : stage === 'SEMI_FINAL' ? 'gap-16' : 'gap-0 mt-16'
              )}>
                {matches.map(match => (
                  <div key={match.id} className="w-56">
                    <MatchCard
                      match={match}
                      tournament={tournament}
                      onPlay={() => onPlayMatch(match)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* Trophy */}
        {tournament.status === 'COMPLETED' && (
          <div className="flex flex-col items-center justify-center px-8">
            <div className="trophy-glow text-3xl font-black mb-2">Trophy</div>
            <p className="text-xs text-text-muted text-center">
              {tournament.teams.find(t => t.id === tournament.winnerId)?.name}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}