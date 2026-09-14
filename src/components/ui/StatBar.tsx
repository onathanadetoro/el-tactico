'use client'

import React from 'react'
import clsx from 'clsx'
import { getStatColor } from '@/data/playerGenerator'

interface StatBarProps {
  label: string
  value: number
  max?: number
  showValue?: boolean
  size?: 'sm' | 'md'
  animated?: boolean
}

export default function StatBar({
  label,
  value,
  max = 99,
  showValue = true,
  size = 'md',
  animated = true,
}: StatBarProps) {
  const percentage = Math.min(100, (value / max) * 100)
  const color = getStatColor(value)

  return (
    <div className="flex items-center gap-2 w-full">
      <span className={clsx(
        'text-text-secondary shrink-0 font-medium',
        size === 'sm' ? 'text-xs w-20' : 'text-xs w-24'
      )}>
        {label}
      </span>

      <div className={clsx(
        'flex-1 bg-panel-lighter rounded-full overflow-hidden',
        size === 'sm' ? 'h-1.5' : 'h-2'
      )}>
        <div
          className={clsx(
            'h-full rounded-full transition-all',
            animated ? 'duration-700 ease-out' : ''
          )}
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
            boxShadow: `0 0 6px ${color}40`,
          }}
        />
      </div>

      {showValue && (
        <span
          className={clsx(
            'font-bold tabular-nums shrink-0',
            size === 'sm' ? 'text-xs w-6 text-right' : 'text-sm w-7 text-right'
          )}
          style={{ color }}
        >
          {value}
        </span>
      )}
    </div>
  )
}