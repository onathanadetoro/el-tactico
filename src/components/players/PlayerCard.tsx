'use client'

import React, { useState } from 'react'
import clsx from 'clsx'
import { Player } from '@/types'
import {
  getOverallColor, getPositionColor, getStatColor,
  getVisibleStats
} from '@/data/playerGenerator'
import { PositionBadge } from '@/components/ui/Badge'
import StatBar from '@/components/ui/StatBar'
import { Star, Zap, AlertTriangle, X, ChevronRight } from 'lucide-react'

interface PlayerCardProps {
  player: Player
  isSelected?: boolean
  isCaptain?: boolean
  onClick?: () => void
  onSelect?: () => void
  onSetCaptain?: () => void
  compact?: boolean
  selectable?: boolean
  disabled?: boolean
  assignedPosition?: string
  teamPlaystyle?: string
}

// ── Full player detail panel shown in a modal when clicked ──
function PlayerDetailPanel({
  player,
  onClose,
  onSelect,
  onSetCaptain,
  isSelected,
  isCaptain,
  selectable,
  disabled,
}: {
  player: Player
  onClose: () => void
  onSelect?: () => void
  onSetCaptain?: () => void
  isSelected?: boolean
  isCaptain?: boolean
  selectable?: boolean
  disabled?: boolean
}) {
  const overallColor = getOverallColor(player.overall)
  const visibleStats = getVisibleStats(player.position as string)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full max-w-sm bg-panel border border-border rounded-2xl shadow-xl overflow-hidden animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-panel-light border border-border text-text-muted hover:text-text-primary transition-colors"
        >
          <X size={14} />
        </button>

        {/* Header */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-4">
            {/* Overall circle */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shrink-0"
              style={{
                backgroundColor: `${overallColor}20`,
                color: overallColor,
                border: `2px solid ${overallColor}50`,
              }}
            >
              {player.overall}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="font-black text-text-primary text-lg leading-tight truncate">
                {player.name}
              </h2>
              <p className="text-text-muted text-xs mb-2">
                {player.nationality} · Age {player.age}
              </p>
              <PositionBadge position={player.position} />
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto max-h-[60vh]">

          {/* Strength & Weakness */}
          <div className="p-4 border-b border-border space-y-2">
            <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-2">
              Profile
            </p>

            <div className="bg-success/10 border border-success/20 rounded-xl p-3">
              <p className="text-xs font-black text-success flex items-center gap-1.5 mb-1">
                <Zap size={11} /> Strength
              </p>
              <p className="text-sm text-text-primary leading-relaxed">
                {player.trait}
              </p>
            </div>

            <div className="bg-warning/10 border border-warning/20 rounded-xl p-3">
              <p className="text-xs font-black text-warning flex items-center gap-1.5 mb-1">
                <AlertTriangle size={11} /> Weakness
              </p>
              <p className="text-sm text-text-primary leading-relaxed">
                {player.weaknesses}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="p-4">
            <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-3">
              Attributes
            </p>
            <div className="space-y-2">
              {visibleStats.map(({ key, label }) => {
                const value = (player.stats as any)[key]
                if (!value) return null
                return (
                  <StatBar
                    key={key}
                    label={label}
                    value={value}
                    size="md"
                    animated
                  />
                )
              })}
            </div>

            {/* Universal stats */}
            <div className="mt-3 pt-3 border-t border-border space-y-2">
              <p className="text-xs text-text-muted font-medium mb-2">Universal</p>
              <StatBar label="Pace"        value={player.stats.pace}        size="sm" />
              <StatBar label="Physicality" value={player.stats.physicality} size="sm" />
              <StatBar label="Composure"   value={player.stats.composure}   size="sm" />
              <StatBar label="Work Rate"   value={player.stats.workRate}     size="sm" />
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-border flex gap-2">
          {onSetCaptain && (
            <button
              onClick={() => { onSetCaptain(); onClose() }}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-colors',
                isCaptain
                  ? 'bg-warning/20 text-warning border-warning/40'
                  : 'bg-panel-light text-text-secondary border-border hover:border-warning hover:text-warning'
              )}
            >
              <Star size={12} className={isCaptain ? 'fill-warning' : ''} />
              {isCaptain ? 'Captain ✓' : 'Set Captain'}
            </button>
          )}

          {selectable && onSelect && (
            <button
              onClick={() => { if (!disabled) { onSelect(); onClose() } }}
              className={clsx(
                'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-black transition-colors',
                isSelected
                  ? 'bg-danger/20 text-danger border border-danger/30 hover:bg-danger/30'
                  : disabled
                    ? 'bg-panel text-text-muted cursor-not-allowed border border-border'
                    : 'bg-primary text-white hover:bg-primary-hover'
              )}
            >
              {isSelected ? 'Remove Player' : 'Select Player'}
              {!isSelected && !disabled && <ChevronRight size={16} />}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// MAIN PLAYER CARD
// ============================================================

export default function PlayerCard({
  player,
  isSelected   = false,
  isCaptain    = false,
  onClick,
  onSelect,
  onSetCaptain,
  compact      = false,
  selectable   = false,
  disabled     = false,
  assignedPosition,
  teamPlaystyle,
}: PlayerCardProps) {
  const [detailOpen, setDetailOpen] = useState(false)

  const overallColor = getOverallColor(player.overall)
  const isOOP = assignedPosition && assignedPosition !== player.position

  const openDetail = () => setDetailOpen(true)
  const closeDetail = () => setDetailOpen(false)

  // ── COMPACT ROW (used in PlayerBrowser) ─────────────────
  if (compact) {
    return (
      <>
        <div className={clsx(
          'rounded-lg border transition-all duration-150',
          isSelected
            ? 'border-primary bg-primary/10'
            : 'border-border bg-panel-light hover:border-border-light',
          disabled && !isSelected && 'opacity-50',
          isCaptain && 'ring-1 ring-warning',
        )}>
          <div className="flex items-center gap-2.5 p-2.5">

            {/* Overall */}
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm shrink-0"
              style={{
                backgroundColor: `${overallColor}20`,
                color: overallColor,
                border: `1px solid ${overallColor}40`,
              }}
            >
              {player.overall}
            </div>

            {/* Info — clicking this opens detail */}
            <div
              className="flex-1 min-w-0 cursor-pointer"
              onClick={openDetail}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <p className="text-sm font-semibold text-text-primary truncate">
                  {player.name}
                </p>
                {isCaptain && (
                  <Star size={11} className="text-warning fill-warning shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <PositionBadge position={player.position} size="sm" />
                {isOOP && (
                  <span className="text-xs text-warning font-bold">⚠ OOP</span>
                )}
              </div>
            </div>

            {/* Tap to view */}
            <button
              onClick={openDetail}
              className="text-xs text-text-muted hover:text-primary transition-colors px-1 shrink-0"
              title="View player details"
            >
              <ChevronRight size={14} />
            </button>

            {/* Select button */}
            {selectable && onSelect && (
              <button
                onClick={e => {
                  e.stopPropagation()
                  if (!disabled) onSelect()
                }}
                className={clsx(
                  'text-xs px-2.5 py-1.5 rounded-lg font-black transition-colors shrink-0 border',
                  isSelected
                    ? 'bg-danger/20 text-danger border-danger/30 hover:bg-danger/30'
                    : disabled
                      ? 'bg-panel text-text-muted cursor-not-allowed border-border'
                      : 'bg-primary text-white hover:bg-primary-hover border-transparent'
                )}
              >
                {isSelected ? '✓' : '+'}
              </button>
            )}

            {/* Captain button */}
            {onSetCaptain && (
              <button
                onClick={e => { e.stopPropagation(); onSetCaptain() }}
                className={clsx(
                  'p-1.5 rounded-lg transition-colors shrink-0',
                  isCaptain
                    ? 'text-warning bg-warning/10'
                    : 'text-text-muted hover:text-warning'
                )}
                title="Set as captain"
              >
                <Star size={13} className={isCaptain ? 'fill-warning' : ''} />
              </button>
            )}
          </div>
        </div>

        {/* Detail panel */}
        {detailOpen && (
          <PlayerDetailPanel
            player={player}
            onClose={closeDetail}
            onSelect={onSelect}
            onSetCaptain={onSetCaptain}
            isSelected={isSelected}
            isCaptain={isCaptain}
            selectable={selectable}
            disabled={disabled}
          />
        )}
      </>
    )
  }

  // ── FULL CARD ────────────────────────────────────────────
  return (
    <>
      <div
        className={clsx(
          'rounded-xl border transition-all duration-200 card-shine overflow-hidden cursor-pointer',
          isSelected
            ? 'border-primary bg-gradient-to-b from-primary/10 to-panel'
            : 'border-border bg-panel hover:border-border-light',
          disabled && !isSelected && 'opacity-50',
          isCaptain && 'ring-1 ring-warning shadow-glow-gold',
        )}
        onClick={openDetail}
      >
        <div className="p-4">
          {/* Top row */}
          <div className="flex items-start justify-between mb-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shrink-0"
              style={{
                backgroundColor: `${overallColor}20`,
                color: overallColor,
                border: `2px solid ${overallColor}50`,
              }}
            >
              {player.overall}
            </div>
            <div className="flex flex-col items-end gap-1">
              <PositionBadge position={player.position} />
              {isCaptain && (
                <span className="flex items-center gap-1 text-warning text-xs font-bold">
                  <Star size={10} className="fill-warning" /> Captain
                </span>
              )}
            </div>
          </div>

          <h3 className="font-bold text-text-primary mb-0.5 truncate">{player.name}</h3>
          <p className="text-xs text-text-muted mb-3">
            {player.nationality} · Age {player.age}
          </p>

          {/* Trait preview */}
          <div className="bg-success/10 border border-success/20 rounded-lg p-2 mb-2">
            <p className="text-xs text-success font-semibold flex items-center gap-1 leading-tight">
              <Zap size={10} className="shrink-0" /> {player.trait}
            </p>
          </div>

          <p className="text-xs text-text-muted text-center mt-2">
            Tap to view full stats →
          </p>
        </div>

        {/* Action bar */}
        {(selectable || onSetCaptain) && (
          <div
            className="px-4 pb-4 flex gap-2"
            onClick={e => e.stopPropagation()}
          >
            {onSetCaptain && (
              <button
                onClick={onSetCaptain}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border',
                  isCaptain
                    ? 'bg-warning/20 text-warning border-warning/30'
                    : 'bg-panel-light text-text-secondary border-border hover:border-warning hover:text-warning'
                )}
              >
                <Star size={12} className={isCaptain ? 'fill-warning' : ''} />
                {isCaptain ? 'Captain' : 'Captain'}
              </button>
            )}
            {selectable && onSelect && (
              <button
                onClick={() => { if (!disabled) onSelect() }}
                className={clsx(
                  'flex-1 py-1.5 rounded-lg text-xs font-black transition-colors border',
                  isSelected
                    ? 'bg-danger/20 text-danger border-danger/30'
                    : disabled
                      ? 'bg-panel text-text-muted cursor-not-allowed border-border'
                      : 'bg-primary text-white hover:bg-primary-hover border-transparent'
                )}
              >
                {isSelected ? 'Remove' : 'Select Player'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Detail panel */}
      {detailOpen && (
        <PlayerDetailPanel
          player={player}
          onClose={closeDetail}
          onSelect={onSelect}
          onSetCaptain={onSetCaptain}
          isSelected={isSelected}
          isCaptain={isCaptain}
          selectable={selectable}
          disabled={disabled}
        />
      )}
    </>
  )
}