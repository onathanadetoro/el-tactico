'use client'

import React, { useEffect, useState } from 'react'
import clsx from 'clsx'
import { Tournament, Player } from '@/types'
import Button from '@/components/ui/Button'
import { RotateCcw, Star, Target, Shield, Users, Trophy } from 'lucide-react'

interface TrophyScreenProps {
  tournament: Tournament
  players: Player[]
  onPlayAgain: () => void
}

const CONFETTI_COLORS = [
  '#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#A855F7',
  '#EC4899', '#14B8A6', '#F97316',
]

function Confetti({ isWinner }: { isWinner: boolean }) {
  const [pieces, setPieces] = useState<Array<{
    id: number; left: number; color: string; duration: number; delay: number; size: number
  }>>([])

  useEffect(() => {
    if (!isWinner) return
    const newPieces = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left:     Math.random() * 100,
      color:    CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      duration: 2 + Math.random() * 3,
      delay:    Math.random() * 2,
      size:     6 + Math.random() * 8,
    }))
    setPieces(newPieces)
  }, [isWinner])

  if (!isWinner) return null

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece rounded-sm absolute"
          style={{
            left:             `${p.left}%`,
            top:              '-20px',
            width:            `${p.size}px`,
            height:           `${p.size}px`,
            backgroundColor:  p.color,
            animationDuration:`${p.duration}s`,
            animationDelay:   `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

export default function TrophyScreen({ tournament, players, onPlayAgain }: TrophyScreenProps) {
  const [visible, setVisible] = useState(false)

  const winner      = tournament.teams.find(t => t.id === tournament.winnerId)
  const isUserWinner = tournament.winnerId === tournament.userTeamId
  const userTeam    = tournament.teams.find(t => t.id === tournament.userTeamId)

  const { stats } = tournament
  const gd = stats.userGoalsScored - stats.userGoalsConceded

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  const finalMatch = tournament.matches.find(m => m.stage === 'FINAL' && m.status === 'COMPLETED')

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative">
      <Confetti isWinner={isUserWinner} />

      <div className={clsx(
        'w-full max-w-2xl transition-all duration-700',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      )}>

        {/* Main trophy card */}
        <div className={clsx(
          'rounded-2xl border p-8 text-center mb-6',
          isUserWinner
            ? 'border-warning bg-gradient-to-b from-warning/10 to-panel shadow-glow-gold'
            : 'border-border bg-panel'
        )}>
          {isUserWinner ? (
            <>
              <div className="trophy-glow text-4xl font-black mb-4">Champion</div>
              <h1 className="text-4xl font-black gradient-text-gold mb-2">
                Champion!
              </h1>
              <p className="text-2xl font-bold text-text-primary mb-1">
                {winner?.name}
              </p>
              <p className="text-text-secondary mb-6">
                Congratulations! You conquered the tournament!
              </p>

              <div className="flex justify-center gap-2 mb-6">
                {['1', '2', '3', '4', '5'].map((badge, i) => (
                  <span key={i} className="text-lg font-black animate-bounce-subtle" style={{ animationDelay: `${i * 0.1}s` }}>
                    {badge}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="text-3xl font-black mb-4">Trophy</div>
              <h1 className="text-3xl font-black text-text-primary mb-2">Tournament Over</h1>
              <p className="text-text-secondary mb-2">
                <span className="text-warning font-bold">{winner?.name}</span> won the tournament
              </p>
              <p className="text-text-muted mb-6">
                {userTeam?.name} — a solid effort!
              </p>
            </>
          )}

          {/* Final match result */}
          {finalMatch && finalMatch.score && (
            <div className="inline-flex items-center gap-4 bg-panel-light rounded-xl px-6 py-3 mb-4">
              <span className="font-bold text-text-primary">{finalMatch.homeTeamName}</span>
              <span className="text-3xl font-black">
                <span className={finalMatch.score[0] > finalMatch.score[1] ? 'text-success' : 'text-text-secondary'}>
                  {finalMatch.score[0]}
                </span>
                <span className="text-text-muted mx-2">:</span>
                <span className={finalMatch.score[1] > finalMatch.score[0] ? 'text-success' : 'text-text-secondary'}>
                  {finalMatch.score[1]}
                </span>
              </span>
              <span className="font-bold text-text-primary">{finalMatch.awayTeamName}</span>
            </div>
          )}
        </div>

        {/* User stats */}
        <div className="bg-panel border border-border rounded-xl p-5 mb-6">
          <h2 className="font-bold text-text-primary mb-4 flex items-center gap-2">
            <Star size={16} className="text-warning" />
            Your Tournament Stats
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Matches Played',  value: stats.userMatchesPlayed,    icon: <Users size={16} />,   color: 'text-primary' },
              { label: 'Wins',            value: stats.userMatchesWon,       icon: <Trophy size={16} />,  color: 'text-success' },
              { label: 'Goals Scored',    value: stats.userGoalsScored,      icon: <Target size={16} />,  color: 'text-warning' },
              { label: 'Goals Conceded',  value: stats.userGoalsConceded,    icon: <Shield size={16} />,  color: 'text-danger' },
            ].map(s => (
              <div key={s.label} className="bg-panel-light rounded-lg p-3 text-center">
                <div className={clsx('flex items-center justify-center gap-1 mb-1.5', s.color)}>
                  {s.icon}
                </div>
                <p className={clsx('text-2xl font-black', s.color)}>{s.value}</p>
                <p className="text-xs text-text-muted mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-center gap-4 text-sm">
            <span className="text-text-secondary">
              Goal Difference: <span className={clsx('font-bold', gd >= 0 ? 'text-success' : 'text-danger')}>
                {gd >= 0 ? '+' : ''}{gd}
              </span>
            </span>
            <span className="text-text-secondary">
              Total Goals in Tournament: <span className="font-bold text-text-primary">{stats.totalGoals}</span>
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <Button
            variant="primary"
            size="xl"
            onClick={onPlayAgain}
            icon={<RotateCcw size={20} />}
          >
            Play Again
          </Button>
        </div>
      </div>
    </div>
  )
}