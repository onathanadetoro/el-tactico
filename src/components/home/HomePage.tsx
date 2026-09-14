'use client'

import React from 'react'
import clsx from 'clsx'
import { useGame } from '@/lib/gameContext'
import Button from '@/components/ui/Button'
import { Trophy, Users, Zap, Play, RotateCcw, Star, Shield, Target } from 'lucide-react'
import { getLastSaved } from '@/lib/storage'
import { clearStorage } from '@/lib/storage'
import { generatePlayers } from '@/data/playerGenerator'
import { savePlayers } from '@/lib/storage'

export default function HomePage() {
  const { state, navigateTo, resetGame } = useGame()
  const { userTeam, tournament, players } = state

  const hasSave    = !!userTeam || !!tournament
  const lastSaved  = typeof window !== 'undefined' ? getLastSaved() : null
  const isComplete = tournament?.status === 'COMPLETED'

  const features = [
    { icon: <Users size={20} />,   title: '100 Players',      desc: 'Full database of unique players with detailed stats',    color: 'text-primary' },
    { icon: <Trophy size={20} />,  title: '7 Formations',     desc: 'Choose from 4-3-3, 4-4-2, 3-5-2, and more',             color: 'text-warning' },
    { icon: <Zap size={20} />,     title: 'Live Simulation',  desc: 'Animated match with real-time events and stats',         color: 'text-success' },
    { icon: <Star size={20} />,    title: 'Tournament Mode',  desc: 'Quarter Finals, Semi Finals, and the Grand Final',       color: 'text-danger' },
    { icon: <Target size={20} />,  title: 'Tactics Engine',   desc: 'Formation bonuses, captain boosts & team chemistry',     color: 'text-purple-400' },
    { icon: <Shield size={20} />,  title: 'Auto Save',        desc: 'Progress saved automatically to local storage',          color: 'text-cyan-400' },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-success/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 mb-6">
            <span className="live-dot w-2 h-2 rounded-full bg-success inline-block" />
            <span className="text-primary text-sm font-semibold">Football Management Game</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-black mb-4 leading-none">
            <span className="gradient-text">El</span>
            <br />
            <span className="text-text-primary">Tactico</span>
          </h1>

          <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Build your squad, choose your formation, and lead your team to tournament glory.
            Every decision matters on the pitch.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {hasSave ? (
              <>
                <Button
                  variant="primary"
                  size="xl"
                  onClick={() => navigateTo(tournament ? 'TOURNAMENT' : 'SQUAD_BUILDER')}
                  icon={<Play size={22} className="fill-white" />}
                >
                  Continue Game
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={resetGame}
                  icon={<RotateCcw size={18} />}
                >
                  New Game
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                size="xl"
                onClick={() => navigateTo('SQUAD_BUILDER')}
                icon={<Play size={22} className="fill-white" />}
              >
                Start Playing
              </Button>
            )}
          </div>

          {/* Last saved */}
          {hasSave && lastSaved && (
            <p className="mt-4 text-text-muted text-xs">
              Last saved: {lastSaved}
              {isComplete && ' • Tournament completed!'}
            </p>
          )}
        </div>
      </div>

      {/* Save status card */}
      {hasSave && (
        <div className="max-w-3xl mx-auto px-4 mb-12">
          <div className="bg-panel border border-border rounded-xl p-5">
            <h2 className="font-bold text-text-primary mb-3 flex items-center gap-2">
              <span className="text-warning font-semibold">Saved</span> Current Game
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-panel-light rounded-lg p-3 text-center">
                <p className="text-xs text-text-muted">Team</p>
                <p className="font-bold text-text-primary text-sm truncate">{userTeam?.name ?? '—'}</p>
              </div>
              <div className="bg-panel-light rounded-lg p-3 text-center">
                <p className="text-xs text-text-muted">Formation</p>
                <p className="font-bold text-text-primary">{userTeam?.formation ?? '—'}</p>
              </div>
              <div className="bg-panel-light rounded-lg p-3 text-center">
                <p className="text-xs text-text-muted">Stage</p>
                <p className="font-bold text-text-primary text-sm">
                  {tournament?.currentStage?.replace('_', ' ') ?? (tournament ? 'Done' : 'Setup')}
                </p>
              </div>
              <div className="bg-panel-light rounded-lg p-3 text-center">
                <p className="text-xs text-text-muted">Wins</p>
                <p className="font-bold text-success">{tournament?.stats.userMatchesWon ?? 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Features grid */}
      <div className="max-w-5xl mx-auto px-4 pb-20">
        <h2 className="text-2xl font-black text-text-primary text-center mb-8">
          What's in the Game
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-panel border border-border rounded-xl p-5 hover-card card-shine"
            >
              <div className={clsx('mb-3', f.color)}>{f.icon}</div>
              <h3 className="font-bold text-text-primary mb-1">{f.title}</h3>
              <p className="text-text-secondary text-sm">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Quick start */}
        {!hasSave && (
          <div className="mt-10 bg-gradient-to-r from-primary/10 to-success/10 border border-primary/20 rounded-xl p-6 text-center">
            <h3 className="text-xl font-black text-text-primary mb-2">Ready to play?</h3>
            <p className="text-text-secondary mb-4 text-sm">
              Pick a formation, draft 11 players, and lead your team to glory.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigateTo('SQUAD_BUILDER')}
              icon={<Trophy size={18} />}
            >
              Build Your Squad
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border py-6 text-center">
        <p className="text-text-muted text-xs">
          FUT Draft · Built with Next.js & Tailwind CSS · Soccer
        </p>
      </div>
    </div>
  )
}