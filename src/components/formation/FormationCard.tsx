'use client'

import React from 'react'
import clsx from 'clsx'
import { Formation } from '@/types'
import { Shield, Zap, Target, Users } from 'lucide-react'

interface FormationCardProps {
  formation: Formation
  isSelected: boolean
  onClick: () => void
}

export default function FormationCard({ formation, isSelected, onClick }: FormationCardProps) {
  const { bonuses } = formation

  const bonusItems = [
    bonuses.attack         && { icon: <Target size={12} />,  label: `+${Math.round((bonuses.attack ?? 0) * 100)}% Attack`,        color: 'text-red-400' },
    bonuses.defense        && { icon: <Shield size={12} />,  label: `+${Math.round((bonuses.defense ?? 0) * 100)}% Defense`,       color: 'text-blue-400' },
    bonuses.midfield       && { icon: <Zap size={12} />,     label: `+${Math.round((bonuses.midfield ?? 0) * 100)}% Midfield`,     color: 'text-green-400' },
    bonuses.possession     && { icon: <Users size={12} />,   label: `+${Math.round((bonuses.possession ?? 0) * 100)}% Possession`,  color: 'text-cyan-400' },
    bonuses.chemistry      && { icon: <Users size={12} />,   label: `+${Math.round((bonuses.chemistry ?? 0) * 100)}% Chemistry`,   color: 'text-purple-400' },
    bonuses.chanceCreation && { icon: <Target size={12} />,  label: `+${Math.round((bonuses.chanceCreation ?? 0) * 100)}% Chance Creation`, color: 'text-orange-400' },
    bonuses.defensiveStability && { icon: <Shield size={12} />, label: `${Math.round((bonuses.defensiveStability ?? 0) * 100)}% Def Stability`, color: 'text-red-400' },
    bonuses.defensiveWidth     && { icon: <Shield size={12} />, label: `${Math.round((bonuses.defensiveWidth ?? 0) * 100)}% Def Width`,    color: 'text-red-400' },
    (bonuses.attack ?? 0) < 0  && { icon: <Target size={12} />, label: `${Math.round((bonuses.attack ?? 0) * 100)}% Attack`, color: 'text-red-400' },
    (bonuses.defense ?? 0) < 0 && { icon: <Shield size={12} />, label: `${Math.round((bonuses.defense ?? 0) * 100)}% Defense`, color: 'text-red-400' },
  ].filter(Boolean) as Array<{ icon: React.ReactNode; label: string; color: string }>

  const { requirements: req } = formation

  return (
    <div
      onClick={onClick}
      className={clsx(
        'formation-card relative p-4 rounded-xl border cursor-pointer transition-all duration-200 hover-card',
        isSelected
          ? 'active border-primary shadow-glow-primary'
          : 'border-border bg-panel hover:border-border-light hover:bg-panel-light'
      )}
    >
      {isSelected && (
        <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
          <span className="text-white text-[10px] font-bold">S</span>
        </div>
      )}

      {/* Formation Name */}
      <h3 className={clsx(
        'text-lg font-black mb-1',
        isSelected ? 'text-primary' : 'text-text-primary'
      )}>
        {formation.name}
      </h3>

      <p className="text-xs text-text-muted mb-3 leading-relaxed">{formation.description}</p>

      {/* Requirements */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {req.GK > 0 && (
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            {req.GK} GK
          </span>
        )}
        {req.DEF > 0 && (
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            {req.DEF} DEF
          </span>
        )}
        {req.MID > 0 && (
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30">
            {req.MID} MID
          </span>
        )}
        {req.ATT > 0 && (
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
            {req.ATT} ATT
          </span>
        )}
      </div>

      {/* Bonuses */}
      <div className="space-y-1">
        {bonusItems.slice(0, 4).map((item, i) => (
          <div key={i} className={clsx('flex items-center gap-1.5 text-xs font-medium', item.color)}>
            {item.icon}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}