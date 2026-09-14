'use client'

import React from 'react'
import clsx from 'clsx'
import { Position } from '@/types'
import { getPositionBgColor } from '@/data/playerGenerator'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'success' | 'danger' | 'warning' | 'secondary'
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({ children, variant = 'default', size = 'md', className }: BadgeProps) {
  const variants = {
    default:   'bg-panel-light text-text-secondary border border-border',
    primary:   'bg-primary/20 text-primary border border-primary/30',
    success:   'bg-success/20 text-success border border-success/30',
    danger:    'bg-danger/20 text-danger border border-danger/30',
    warning:   'bg-warning/20 text-warning border border-warning/30',
    secondary: 'bg-panel-lighter text-text-secondary border border-border',
  }

  const sizes = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-0.5 text-xs',
  }

  return (
    <span className={clsx(
      'inline-flex items-center rounded font-medium',
      variants[variant],
      sizes[size],
      className
    )}>
      {children}
    </span>
  )
}

interface PositionBadgeProps {
  position: Position
  size?: 'sm' | 'md'
}

export function PositionBadge({ position, size = 'md' }: PositionBadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center rounded font-bold border',
      getPositionBgColor(position),
      size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-0.5 text-xs'
    )}>
      {position}
    </span>
  )
}