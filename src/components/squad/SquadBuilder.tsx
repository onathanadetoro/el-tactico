'use client'

import React, { useState, useCallback, useMemo } from 'react'
import clsx from 'clsx'
import {
  Player, Formation, PitchPosition, SquadSlot,
  Team, FormationType, TeamPlaystyle
} from '@/types'
import { getFormation, getAllFormations } from '@/data/formations'
import FootballPitch from '@/components/formation/FootballPitch'
import FormationCard from '@/components/formation/FormationCard'
import PlayerBrowser from '@/components/players/PlayerBrowser'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { useGame } from '@/lib/gameContext'
import { calculateTeamStrength } from '@/lib/simulationEngine'
import { calculateChemistry } from '@/lib/chemistryEngine'
import {
  ChevronLeft, ChevronRight, Trophy, Star, AlertCircle,
  CheckCircle2, Shield, Target, Zap, Users, Flame
} from 'lucide-react'

type BuildStep = 'FORMATION' | 'SQUAD' | 'REVIEW'

const PLAYSTYLES: TeamPlaystyle[] = [
  'Attacking',
  'Defensive',
  'Possession',
  'Counter Attack',
  'Pressing',
  'Balanced',
]

const PLAYSTYLE_DESCRIPTIONS: Record<TeamPlaystyle, string> = {
  'Attacking':      'High scoring, aggressive, leaves space at the back',
  'Defensive':      'Hard to beat, low scoring, clinical on the counter',
  'Possession':     'Control the ball, wear teams down, patient build up',
  'Counter Attack': 'Sit deep, absorb pressure, punish teams on the break',
  'Pressing':       'Win the ball high, intense energy, high risk high reward',
  'Balanced':       'No obvious weakness, solid in all areas',
}

const PLAYSTYLE_ICONS: Record<TeamPlaystyle, React.ReactNode> = {
  'Attacking':      <Target size={16} />,
  'Defensive':      <Shield size={16} />,
  'Possession':     <Users size={16} />,
  'Counter Attack': <Zap size={16} />,
  'Pressing':       <Flame size={16} />,
  'Balanced':       <Star size={16} />,
}

const PLAYSTYLE_COLORS: Record<TeamPlaystyle, string> = {
  'Attacking':      'border-red-500 bg-red-500/10 text-red-400',
  'Defensive':      'border-blue-500 bg-blue-500/10 text-blue-400',
  'Possession':     'border-green-500 bg-green-500/10 text-green-400',
  'Counter Attack': 'border-orange-500 bg-orange-500/10 text-orange-400',
  'Pressing':       'border-purple-500 bg-purple-500/10 text-purple-400',
  'Balanced':       'border-cyan-500 bg-cyan-500/10 text-cyan-400',
}

const PLAYSTYLE_INACTIVE = 'border-border bg-panel-light text-text-secondary hover:border-border-light hover:text-text-primary'

export default function SquadBuilder() {
  const { state, setUserTeam, navigateTo } = useGame()
  const { players } = state

  const [step, setStep]               = useState<BuildStep>('FORMATION')
  const [formation, setFormation]     = useState<FormationType>('4-3-3')
  const [squad, setSquad]             = useState<SquadSlot[]>([])
  const [captainId, setCaptainId]     = useState<string | null>(null)
  const [teamName, setTeamName]       = useState('My FC')
  const [playstyle, setPlaystyle]     = useState<TeamPlaystyle>('Balanced')
  const [selectedPos, setSelectedPos] = useState<PitchPosition | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const currentFormation = getFormation(formation)
  const allFormations    = getAllFormations()

  // ── Init squad slots when formation changes ──────────────────
  const initSquad = useCallback((form: Formation) => {
    const newSquad: SquadSlot[] = form.positions.map(pos => ({
      positionId: pos.id,
      position:   pos.position,
      playerId:   null,
    }))
    setSquad(newSquad)
    setCaptainId(null)
  }, [])

  const handleFormationChange = useCallback((type: FormationType) => {
    setFormation(type)
    initSquad(getFormation(type))
  }, [initSquad])

  // ── Derived values ───────────────────────────────────────────
  const selectedPlayerIds = useMemo(
    () => new Set(squad.map(s => s.playerId).filter(Boolean) as string[]),
    [squad]
  )

  const filledSlots = squad.filter(s => s.playerId).length
  const totalSlots  = currentFormation.positions.length
  const isComplete  = filledSlots === totalSlots
  const hasCaptain  = !!captainId

  // ── Chemistry preview ────────────────────────────────────────
  const chemistryPreview = useMemo(() => {
    if (filledSlots < 3) return null
    try {
      return calculateChemistry(squad, players, playstyle)
    } catch {
      return null
    }
  }, [squad, players, playstyle, filledSlots])

  // ── Strength preview ─────────────────────────────────────────
  const strengthPreview = useMemo(() => {
    if (filledSlots < 6) return null
    const mockTeam = {
      id: 'preview', name: teamName,
      formation, playstyle, squad, captainId,
      isUserTeam: true,
    }
    try {
      return calculateTeamStrength(mockTeam as any, players)
    } catch {
      return null
    }
  }, [squad, formation, playstyle, captainId, teamName, players, filledSlots])

  // ── Pitch interaction ────────────────────────────────────────
  const handlePositionClick = useCallback((pitchPos: PitchPosition) => {
    setSelectedPos(pitchPos)
    setIsModalOpen(true)
  }, [])

  const handleSelectPlayer = useCallback((player: Player) => {
    if (!selectedPos) return
    setSquad(prev => {
      const cleaned = prev.map(s =>
        s.playerId === player.id ? { ...s, playerId: null } : s
      )
      return cleaned.map(s =>
        s.positionId === selectedPos.id ? { ...s, playerId: player.id } : s
      )
    })
    if (!captainId) setCaptainId(player.id)
    setIsModalOpen(false)
    setSelectedPos(null)
  }, [selectedPos, captainId])

  const handleRemovePlayer = useCallback((positionId: string) => {
    setSquad(prev =>
      prev.map(s => s.positionId === positionId ? { ...s, playerId: null } : s)
    )
  }, [])

  const handleSetCaptain = useCallback((playerId: string) => {
    setCaptainId(playerId)
  }, [])

  // ── Players sorted for modal ─────────────────────────────────
  const availablePlayersForModal = useMemo(() => {
    if (!selectedPos) return players
    return [...players].sort((a, b) => {
      const aMatch = a.position === selectedPos.position ? 0 : 1
      const bMatch = b.position === selectedPos.position ? 0 : 1
      if (aMatch !== bMatch) return aMatch - bMatch
      return b.overall - a.overall
    })
  }, [players, selectedPos])

  // ── Save team ────────────────────────────────────────────────
  const handleSaveTeam = useCallback(() => {
    const team: Team = {
      id:          `user_team_${Date.now()}`,
      name:        teamName,
      formation,
      playstyle,
      squad,
      captainId,
      isUserTeam:  true,
    }
    setUserTeam(team)
    navigateTo('TOURNAMENT')
  }, [teamName, formation, playstyle, squad, captainId, setUserTeam, navigateTo])

  // ── Step helpers ─────────────────────────────────────────────
  const steps: Array<{ id: BuildStep; label: string }> = [
    { id: 'FORMATION', label: 'Formation' },
    { id: 'SQUAD',     label: 'Build Squad' },
    { id: 'REVIEW',    label: 'Review' },
  ]
  const stepIndex = steps.findIndex(s => s.id === step)

  // ── Out of position check ────────────────────────────────────
  const hasOutOfPosition = squad.some(s => {
    if (!s.playerId) return false
    const p  = players.find(pl => pl.id === s.playerId)
    const fp = currentFormation.positions.find(fp => fp.id === s.positionId)
    return p && fp && p.position !== fp.position
  })

  // ============================================================
  return (
    <div className="min-h-screen bg-background">

      {/* ── Sticky header ───────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigateTo('HOME')}
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-sm"
            >
              <ChevronLeft size={16} /> Back
            </button>
            <h1 className="text-xl font-black gradient-text">Squad Builder</h1>
            <div className="text-xs text-text-muted">
              {filledSlots}/{totalSlots} players
            </div>
          </div>

          {/* Step progress */}
          <div className="flex items-center gap-0">
            {steps.map((s, i) => (
              <React.Fragment key={s.id}>
                <button
                  onClick={() => {
                    if (i < stepIndex) setStep(s.id)
                  }}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                    step === s.id
                      ? 'bg-primary text-white'
                      : i < stepIndex
                        ? 'text-success cursor-pointer hover:bg-success/10'
                        : 'text-text-muted cursor-not-allowed'
                  )}
                >
                  {i < stepIndex
                    ? <CheckCircle2 size={12} />
                    : <span>{i + 1}.</span>}
                  {s.label}
                </button>
                {i < steps.length - 1 && (
                  <ChevronRight size={14} className="text-text-muted mx-1" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ════════════════════════════════════════════════════
            STEP 1 — FORMATION
        ════════════════════════════════════════════════════ */}
        {step === 'FORMATION' && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-text-primary mb-2">
                Choose Your Formation
              </h2>
              <p className="text-text-secondary">
                Select a tactical formation that suits your playing style
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              {allFormations.map(f => (
                <FormationCard
                  key={f.type}
                  formation={f}
                  isSelected={formation === f.type}
                  onClick={() => handleFormationChange(f.type)}
                />
              ))}
            </div>

            {/* Selected formation preview */}
            <div className="bg-panel border border-border rounded-xl p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="w-full md:w-48 shrink-0">
                  <FootballPitch
                    formation={currentFormation}
                    squad={squad}
                    players={players}
                    captainId={captainId}
                    onPositionClick={() => {}}
                    onRemovePlayer={() => {}}
                    onSetCaptain={() => {}}
                    readOnly
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-black text-text-primary mb-1">
                    {currentFormation.name}
                  </h3>
                  <p className="text-text-secondary mb-4">
                    {currentFormation.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(currentFormation.bonuses).map(([key, value]) => {
                      if (!value) return null
                      const isPositive = value > 0
                      return (
                        <div
                          key={key}
                          className={clsx(
                            'flex items-center gap-2 text-sm p-2 rounded-lg',
                            isPositive
                              ? 'bg-success/10 text-success'
                              : 'bg-danger/10 text-danger'
                          )}
                        >
                          <span>{isPositive ? '↑' : '↓'}</span>
                          <span className="font-semibold capitalize">
                            {Math.abs(Math.round(value * 100))}%{' '}
                            {key.replace(/([A-Z])/g, ' $1')}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="primary"
                size="lg"
                onClick={() => { initSquad(currentFormation); setStep('SQUAD') }}
                icon={<ChevronRight size={18} />}
                iconPosition="right"
              >
                Continue to Squad
              </Button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════
            STEP 2 — SQUAD
        ════════════════════════════════════════════════════ */}
        {step === 'SQUAD' && (
          <div className="animate-fade-in">

            {/* Team name */}
            <div className="mb-4 bg-panel border border-border rounded-xl p-4">
              <label className="block text-xs text-text-muted mb-1 font-medium uppercase tracking-wide">
                Team Name
              </label>
              <input
                type="text"
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                maxLength={30}
                className={clsx(
                  'bg-panel-light border border-border rounded-lg px-3 py-2',
                  'text-text-primary font-bold text-lg w-full',
                  'focus:outline-none focus:border-primary transition-colors'
                )}
                placeholder="Enter your team name"
              />
            </div>

            {/* Playstyle selector */}
            <div className="mb-6 bg-panel border border-border rounded-xl p-4">
              <label className="block text-xs text-text-muted mb-3 font-medium uppercase tracking-wide">
                Team Playstyle
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                {PLAYSTYLES.map(ps => (
                  <button
                    key={ps}
                    onClick={() => setPlaystyle(ps)}
                    className={clsx(
                      'flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold border transition-all',
                      playstyle === ps
                        ? PLAYSTYLE_COLORS[ps]
                        : PLAYSTYLE_INACTIVE
                    )}
                  >
                    {PLAYSTYLE_ICONS[ps]}
                    {ps}
                  </button>
                ))}
              </div>

              {/* Description of selected playstyle */}
              <div className={clsx(
                'p-3 rounded-lg border text-xs font-medium',
                PLAYSTYLE_COLORS[playstyle]
              )}>
                <div className="flex items-center gap-2 mb-1">
                  {PLAYSTYLE_ICONS[playstyle]}
                  <span className="font-bold">{playstyle}</span>
                </div>
                <p className="opacity-90 leading-relaxed">
                  {PLAYSTYLE_DESCRIPTIONS[playstyle]}
                </p>
              </div>

              {/* Chemistry hint */}
              {chemistryPreview && (
                <div className="mt-2 flex items-center gap-2 text-xs text-text-muted">
                  <span>Chemistry:</span>
                  <span
                    className="font-bold"
                    style={{ color: chemistryPreview.color }}
                  >
                    {chemistryPreview.overall}% — {chemistryPreview.label}
                  </span>
                  <span className="text-text-muted">
                    (pick players whose style suits {playstyle})
                  </span>
                </div>
              )}
            </div>

            {/* Pitch + Player list */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Pitch */}
              <div className="bg-panel border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-text-primary">
                    {currentFormation.name} Formation
                  </h3>
                  <span className="text-xs text-text-muted">
                    Click a position to assign a player
                  </span>
                </div>

                <FootballPitch
                  formation={currentFormation}
                  squad={squad}
                  players={players}
                  captainId={captainId}
                  onPositionClick={handlePositionClick}
                  onRemovePlayer={handleRemovePlayer}
                  onSetCaptain={handleSetCaptain}
                  readOnly={false}
                />

                {/* Status messages */}
                <div className="mt-4 space-y-2">
                  {!isComplete && (
                    <div className="flex items-center gap-2 text-warning text-sm p-2 bg-warning/10 rounded-lg">
                      <AlertCircle size={14} />
                      <span>
                        {totalSlots - filledSlots} position
                        {totalSlots - filledSlots !== 1 ? 's' : ''} still need players
                      </span>
                    </div>
                  )}
                  {isComplete && !hasCaptain && (
                    <div className="flex items-center gap-2 text-warning text-sm p-2 bg-warning/10 rounded-lg">
                      <Star size={14} />
                      <span>Don't forget to set a captain!</span>
                    </div>
                  )}
                  {isComplete && hasCaptain && (
                    <div className="flex items-center gap-2 text-success text-sm p-2 bg-success/10 rounded-lg">
                      <CheckCircle2 size={14} />
                      <span>Squad is complete and ready!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Squad slot list */}
              <div className="bg-panel border border-border rounded-xl p-4">
                <h3 className="font-bold text-text-primary mb-3">Your Squad</h3>
                <div className="space-y-1 max-h-[540px] overflow-y-auto pr-1">
                  {currentFormation.positions.map(pitchPos => {
                    const slot   = squad.find(s => s.positionId === pitchPos.id)
                    const player = slot?.playerId
                      ? players.find(p => p.id === slot.playerId)
                      : null
                    const isOOP  = player && player.position !== pitchPos.position
                    const suitsPlaystyle = player
                      ? player.preferredPlaystyle === playstyle
                      : null

                    return (
                      <div
                        key={pitchPos.id}
                        className={clsx(
                          'flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors',
                          player
                            ? isOOP
                              ? 'border-warning/50 bg-warning/5 hover:bg-warning/10'
                              : 'border-border bg-panel-light hover:bg-panel-lighter'
                            : 'border-dashed border-border hover:border-primary/50 hover:bg-primary/5'
                        )}
                        onClick={() => handlePositionClick(pitchPos)}
                      >
                        {/* Position label */}
                        <span className={clsx(
                          'text-xs font-bold w-10 text-center px-1.5 py-0.5 rounded shrink-0',
                          pitchPos.position === 'GK'  && 'bg-amber-500/20 text-amber-400',
                          pitchPos.position === 'DEF' && 'bg-blue-500/20 text-blue-400',
                          pitchPos.position === 'MID' && 'bg-green-500/20 text-green-400',
                          pitchPos.position === 'ATT' && 'bg-red-500/20 text-red-400',
                        )}>
                          {pitchPos.label}
                        </span>

                        {player ? (
                          <>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-semibold text-text-primary truncate">
                                  {player.name}
                                </span>
                                {captainId === player.id && (
                                  <Star size={10} className="text-warning fill-warning shrink-0" />
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs text-text-secondary">
                                  {player.style}
                                </span>
                                {isOOP && (
                                  <span className="text-xs text-warning">⚠ OOP</span>
                                )}
                                {suitsPlaystyle === true && (
                                  <span className="text-xs text-success">✓ Fits</span>
                                )}
                                {suitsPlaystyle === false && (
                                  <span className="text-xs text-text-muted">~ OK</span>
                                )}
                              </div>
                            </div>
                            <span
                              className="text-sm font-black shrink-0"
                              style={{
                                color: player.overall >= 93 ? '#FFD700'
                                  : player.overall >= 89 ? '#22C55E'
                                  : '#3B82F6',
                              }}
                            >
                              {player.overall}
                            </span>
                          </>
                        ) : (
                          <span className="text-text-muted text-sm flex items-center gap-1">
                            <span className="text-primary">+</span> Assign player
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <Button
                variant="secondary"
                onClick={() => setStep('FORMATION')}
                icon={<ChevronLeft size={16} />}
              >
                Back
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={() => setStep('REVIEW')}
                disabled={filledSlots < Math.ceil(totalSlots * 0.7)}
                icon={<ChevronRight size={18} />}
                iconPosition="right"
              >
                Review Team
              </Button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════
            STEP 3 — REVIEW
        ════════════════════════════════════════════════════ */}
        {step === 'REVIEW' && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-text-primary mb-1">
                {teamName}
              </h2>
              <p className="text-text-secondary">
                {currentFormation.name} · {playstyle}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Pitch preview */}
              <div className="bg-panel border border-border rounded-xl p-4">
                <h3 className="font-bold text-text-primary mb-3 text-center">Formation</h3>
                <FootballPitch
                  formation={currentFormation}
                  squad={squad}
                  players={players}
                  captainId={captainId}
                  onPositionClick={() => setStep('SQUAD')}
                  onRemovePlayer={() => {}}
                  onSetCaptain={() => {}}
                  readOnly
                />
              </div>

              {/* Stats & Chemistry */}
              <div className="lg:col-span-2 space-y-4">

                {/* Strength stats */}
                {strengthPreview && (
                  <div className="bg-panel border border-border rounded-xl p-5">
                    <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                      <Zap size={16} className="text-primary" />
                      Team Analysis
                    </h3>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {[
                        { label: 'Overall',  value: Math.round(strengthPreview.overall  || 0), color: '#F59E0B', icon: <Star size={14} /> },
                        { label: 'Attack',   value: Math.round(strengthPreview.attack   || 0), color: '#EF4444', icon: <Target size={14} /> },
                        { label: 'Midfield', value: Math.round(strengthPreview.midfield || 0), color: '#22C55E', icon: <Zap size={14} /> },
                        { label: 'Defense',  value: Math.round(strengthPreview.defense  || 0), color: '#3B82F6', icon: <Shield size={14} /> },
                      ].map(stat => (
                        <div
                          key={stat.label}
                          className="bg-panel-light rounded-xl p-4 text-center"
                        >
                          <div
                            className="flex items-center justify-center gap-1.5 mb-2"
                            style={{ color: stat.color }}
                          >
                            {stat.icon}
                            <span className="text-xs font-medium text-text-secondary">
                              {stat.label}
                            </span>
                          </div>
                          <div
                            className="text-3xl font-black"
                            style={{ color: stat.color }}
                          >
                            {stat.value}
                          </div>
                          <div className="mt-2 h-1.5 bg-panel-lighter rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${(stat.value / 99) * 100}%`,
                                backgroundColor: stat.color,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-panel-light rounded-lg p-3">
                        <p className="text-xs text-text-muted mb-1">Captain Bonus</p>
                        <p className="text-lg font-black text-success">
                          +{(strengthPreview.captainBonus * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="bg-panel-light rounded-lg p-3">
                        <p className="text-xs text-text-muted mb-1">Playstyle</p>
                        <p className="text-lg font-black text-primary">{playstyle}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Chemistry breakdown */}
                {chemistryPreview && (
                  <div className="bg-panel border border-border rounded-xl p-5">
                    <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                      <Users size={16} className="text-primary" />
                      Team Chemistry
                    </h3>

                    {/* Overall chemistry score */}
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center font-black text-2xl shrink-0"
                        style={{
                          backgroundColor: `${chemistryPreview.color}20`,
                          color: chemistryPreview.color,
                          border: `2px solid ${chemistryPreview.color}50`,
                        }}
                      >
                        {chemistryPreview.overall}
                      </div>
                      <div>
                        <p
                          className="text-xl font-black"
                          style={{ color: chemistryPreview.color }}
                        >
                          {chemistryPreview.label}
                        </p>
                        <p className="text-xs text-text-muted">
                          Overall Chemistry Score
                        </p>
                      </div>
                    </div>

                    {/* Chemistry breakdown bars */}
                    <div className="space-y-2.5 mb-4">
                      {[
                        { label: 'Playstyle Sync',      value: chemistryPreview.playstyleSync },
                        { label: 'Positional Balance',  value: chemistryPreview.positionalBalance },
                        { label: 'Style Consistency',   value: chemistryPreview.styleConsistency },
                      ].map(item => (
                        <div key={item.label}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-text-secondary">{item.label}</span>
                            <span
                              className="font-bold"
                              style={{ color: chemistryPreview.color }}
                            >
                              {item.value}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-panel-lighter rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${item.value}%`,
                                backgroundColor: chemistryPreview.color,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Chemistry bonuses */}
                    <div className="bg-panel-light rounded-lg p-3">
                      <p className="text-xs font-bold text-text-secondary mb-2">
                        Chemistry Bonuses Applied
                      </p>
                      <div className="grid grid-cols-2 gap-1.5 text-xs">
                        {[
                          { label: 'Attack',    value: chemistryPreview.bonuses.attackBoost },
                          { label: 'Defense',   value: chemistryPreview.bonuses.defenseBoost },
                          { label: 'Possession',value: chemistryPreview.bonuses.possessionBoost },
                          { label: 'Pressing',  value: chemistryPreview.bonuses.pressingBoost },
                          { label: 'Counter',   value: chemistryPreview.bonuses.counterBoost },
                        ].map(b => (
                          <div key={b.label} className="flex justify-between">
                            <span className="text-text-muted">{b.label}</span>
                            <span className={b.value >= 0 ? 'text-success font-bold' : 'text-danger font-bold'}>
                              {b.value >= 0 ? '+' : ''}{(b.value * 100).toFixed(0)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Warnings */}
                <div className="bg-panel border border-border rounded-xl p-4 space-y-2">
                  <h3 className="font-bold text-text-primary mb-3 flex items-center gap-2">
                    <AlertCircle size={16} className="text-warning" />
                    Team Notes
                  </h3>

                  {!isComplete && (
                    <div className="flex items-center gap-2 text-warning text-sm p-2 bg-warning/10 rounded-lg">
                      <AlertCircle size={14} />
                      {totalSlots - filledSlots} position
                      {totalSlots - filledSlots !== 1 ? 's' : ''} unfilled
                    </div>
                  )}

                  {!hasCaptain && (
                    <div className="flex items-center gap-2 text-warning text-sm p-2 bg-warning/10 rounded-lg">
                      <Star size={14} />
                      No captain selected
                    </div>
                  )}

                  {hasOutOfPosition && (
                    <div className="flex items-center gap-2 text-warning text-sm p-2 bg-warning/10 rounded-lg">
                      <AlertCircle size={14} />
                      Some players are out of position — rating penalty applied
                    </div>
                  )}

                  {isComplete && hasCaptain && !hasOutOfPosition && (
                    <div className="flex items-center gap-2 text-success text-sm p-2 bg-success/10 rounded-lg">
                      <CheckCircle2 size={14} />
                      Team is ready for the tournament!
                    </div>
                  )}

                  {isComplete && hasCaptain && (chemistryPreview?.overall ?? 0) < 60 && (
                    <div className="flex items-center gap-2 text-warning text-sm p-2 bg-warning/10 rounded-lg">
                      <AlertCircle size={14} />
                      Low chemistry — try picking players that suit {playstyle} playstyle
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <Button
                variant="secondary"
                onClick={() => setStep('SQUAD')}
                icon={<ChevronLeft size={16} />}
              >
                Edit Squad
              </Button>
              <Button
                variant="success"
                size="xl"
                onClick={handleSaveTeam}
                disabled={filledSlots < Math.ceil(totalSlots * 0.7)}
                icon={<Trophy size={20} />}
              >
                Enter Tournament!
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Player selection modal ───────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedPos(null) }}
        title={
          selectedPos
            ? `Assign ${selectedPos.label} (${selectedPos.position}) — ${playstyle} team`
            : 'Select Player'
        }
        size="lg"
      >
        <div className="p-4 h-[60vh]">
          <PlayerBrowser
            players={availablePlayersForModal}
            selectedPlayerIds={selectedPlayerIds}
            captainId={captainId}
            onSelectPlayer={handleSelectPlayer}
            onSetCaptain={handleSetCaptain}
            compact
            allowedPosition={selectedPos?.position ?? null}
            maxSelectable={totalSlots}
            currentSelectionCount={filledSlots}
            teamPlaystyle={playstyle}
          />
        </div>
      </Modal>
    </div>
  )
}