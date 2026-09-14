'use client'

import React, { useState, useCallback } from 'react'
import clsx from 'clsx'
import { Formation, PitchPosition, Player, SquadSlot } from '@/types'
import { getPositionColor, getOverallColor } from '@/data/playerGenerator'
import { Star, Plus, X } from 'lucide-react'

interface FootballPitchProps {
  formation: Formation
  squad: SquadSlot[]
  players: Player[]
  captainId: string | null
  onPositionClick: (position: PitchPosition) => void
  onRemovePlayer: (positionId: string) => void
  onSetCaptain: (playerId: string) => void
  readOnly?: boolean
}

interface PositionNodeProps {
  pitchPos: PitchPosition
  player: Player | null
  isCaptain: boolean
  onClick: () => void
  onRemove: () => void
  onSetCaptain: (playerId: string) => void
  readOnly: boolean
  assignedPosition: string
}

function PositionNode({
  pitchPos,
  player,
  isCaptain,
  onClick,
  onRemove,
  onSetCaptain,
  readOnly,
  assignedPosition,
}: PositionNodeProps) {
  const [hovered, setHovered] = useState(false)
  const posColor = getPositionColor(pitchPos.position)

  const isOutOfPosition = player && player.position !== pitchPos.position
  const overallColor = player ? getOverallColor(player.overall) : null

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${pitchPos.x}%`, top: `${pitchPos.y}%` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Remove button */}
      {!readOnly && player && hovered && (
        <button
          onClick={e => { e.stopPropagation(); onRemove() }}
          className="absolute -top-2 -right-2 z-20 w-5 h-5 rounded-full bg-danger flex items-center justify-center shadow-lg border border-background"
        >
          <X size={10} className="text-white" />
        </button>
      )}

      {/* Captain star */}
      {isCaptain && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20">
          <Star size={12} className="text-warning fill-warning drop-shadow-lg" />
        </div>
      )}

      {/* Main circle */}
      <div
        onClick={onClick}
        className={clsx(
          'relative flex flex-col items-center justify-center rounded-full',
          'transition-all duration-200 select-none',
          readOnly ? 'cursor-default' : 'cursor-pointer',
          player
            ? 'w-12 h-12 shadow-lg'
            : 'w-10 h-10 border-2 border-dashed hover:scale-110',
        )}
        style={player ? {
          background: `radial-gradient(circle at 30% 30%, ${posColor}40, ${posColor}15)`,
          border: `2px solid ${isOutOfPosition ? '#F59E0B' : posColor}`,
          boxShadow: hovered && !readOnly
            ? `0 0 16px ${posColor}80`
            : `0 0 8px ${posColor}30`,
        } : {
          borderColor: `${posColor}60`,
          backgroundColor: `${posColor}10`,
        }}
      >
        {player ? (
          <>
            {/* Overall rating */}
            <span
              className="text-xs font-black leading-none"
              style={{ color: overallColor ?? posColor }}
            >
              {player.overall}
            </span>
            {/* Out-of-position indicator */}
            {isOutOfPosition && (
              <span className="text-warning text-xs leading-none">!</span>
            )}
          </>
        ) : (
          !readOnly && (
            <Plus
              size={16}
              style={{ color: `${posColor}80` }}
            />
          )
        )}
      </div>

      {/* Label below */}
      <div className="mt-1 text-center">
        <div
          className="text-xs font-bold leading-none"
          style={{ color: posColor }}
        >
          {pitchPos.label}
        </div>
        {player && (
          <div className="text-xs text-white leading-tight max-w-16 truncate font-medium mt-0.5"
            style={{ fontSize: '9px', maxWidth: '56px' }}
          >
            {player.name.split(' ').slice(-1)[0]}
          </div>
        )}
        {!player && !readOnly && (
          <div className="text-xs text-text-muted leading-none mt-0.5" style={{ fontSize: '9px' }}>
            Empty
          </div>
        )}
      </div>

      {/* Hover tooltip */}
      {hovered && player && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div className="bg-panel border border-border rounded-lg p-2 text-xs whitespace-nowrap shadow-xl">
            <p className="font-bold text-text-primary">{player.name}</p>
            <p className="text-text-secondary">{player.position} • OVR {player.overall}</p>
            {isOutOfPosition && (
              <p className="text-warning mt-0.5">! Out of position</p>
            )}
            {!readOnly && (
              <p className="text-text-muted mt-1">Click to change</p>
            )}
            {!readOnly && !isCaptain && (
              <button
                onClick={e => { e.stopPropagation(); player && onSetCaptain(player.id) }}
                className="mt-1 text-warning hover:text-yellow-300 flex items-center gap-1 pointer-events-auto"
              >
                <Star size={10} /> Set Captain
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function FootballPitch({
  formation,
  squad,
  players,
  captainId,
  onPositionClick,
  onRemovePlayer,
  onSetCaptain,
  readOnly = false,
}: FootballPitchProps) {
  const playerMap = new Map(players.map(p => [p.id, p]))
  const squadMap = new Map(squad.map(s => [s.positionId, s]))

  const filledCount = squad.filter(s => s.playerId).length
  const totalSlots  = formation.positions.length

  return (
    <div className="w-full flex flex-col items-center">
      {/* Pitch container */}
      <div
        className="relative w-full rounded-xl overflow-hidden"
        style={{
          aspectRatio: '2/3',
          maxWidth: '400px',
          background: 'linear-gradient(180deg, #1a5c1a 0%, #1f6b1f 25%, #1d651d 50%, #1f6b1f 75%, #1a5c1a 100%)',
        }}
      >
        {/* Pitch markings SVG */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 150"
          preserveAspectRatio="none"
        >
          {/* Outer boundary */}
          <rect x="3" y="3" width="94" height="144" className="pitch-line" />

          {/* Centre line */}
          <line x1="3" y1="75" x2="97" y2="75" className="pitch-line" />

          {/* Centre circle */}
          <circle cx="50" cy="75" r="15" className="pitch-line" />
          <circle cx="50" cy="75" r="1" fill="rgba(255,255,255,0.4)" />

          {/* Top penalty area */}
          <rect x="22" y="3" width="56" height="25" className="pitch-line" />
          {/* Top goal area */}
          <rect x="35" y="3" width="30" height="10" className="pitch-line" />
          {/* Top goal */}
          <rect x="41" y="1" width="18" height="4" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
          {/* Top penalty spot */}
          <circle cx="50" cy="20" r="0.8" fill="rgba(255,255,255,0.4)" />
          {/* Top penalty arc */}
          <path d="M 36 28 A 14 14 0 0 1 64 28" className="pitch-line" />

          {/* Bottom penalty area */}
          <rect x="22" y="122" width="56" height="25" className="pitch-line" />
          {/* Bottom goal area */}
          <rect x="35" y="137" width="30" height="10" className="pitch-line" />
          {/* Bottom goal */}
          <rect x="41" y="145" width="18" height="4" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
          {/* Bottom penalty spot */}
          <circle cx="50" cy="130" r="0.8" fill="rgba(255,255,255,0.4)" />
          {/* Bottom penalty arc */}
          <path d="M 36 122 A 14 14 0 0 0 64 122" className="pitch-line" />

          {/* Corner arcs */}
          <path d="M 3 10 A 7 7 0 0 0 10 3"   className="pitch-line" />
          <path d="M 90 3 A 7 7 0 0 0 97 10"  className="pitch-line" />
          <path d="M 3 140 A 7 7 0 0 1 10 147" className="pitch-line" />
          <path d="M 97 140 A 7 7 0 0 0 90 147" className="pitch-line" />

          {/* Grass stripes */}
          {[0,1,2,3,4,5,6,7,8,9].map(i => (
            <rect
              key={i}
              x="0" y={i * 15} width="100" height="15"
              fill={i % 2 === 0 ? 'rgba(0,0,0,0.04)' : 'transparent'}
            />
          ))}
        </svg>

        {/* Player positions */}
        {formation.positions.map(pitchPos => {
          const slot = squadMap.get(pitchPos.id)
          const player = slot?.playerId ? playerMap.get(slot.playerId) ?? null : null

          return (
            <PositionNode
              key={pitchPos.id}
              pitchPos={pitchPos}
              player={player}
              isCaptain={!!player && player.id === captainId}
              onClick={() => onPositionClick(pitchPos)}
              onRemove={() => onRemovePlayer(pitchPos.id)}
              onSetCaptain={() => player && onSetCaptain(player.id)}
              readOnly={readOnly}
              assignedPosition={pitchPos.position}
            />
          )
        })}

        {/* Fill indicator */}
        {!readOnly && (
          <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2">
            <div className="flex-1 bg-black/30 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(filledCount / totalSlots) * 100}%` }}
              />
            </div>
            <span className="text-xs text-white font-medium bg-black/40 px-1.5 py-0.5 rounded">
              {filledCount}/{totalSlots}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}