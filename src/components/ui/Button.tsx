'use client'

import React from 'react'
import clsx from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base = clsx(
    'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background',
    'select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
    fullWidth && 'w-full'
  )

  const variants = {
    primary:   'bg-primary hover:bg-primary-hover active:scale-95 text-white focus:ring-primary shadow-lg hover:shadow-glow-primary',
    secondary: 'bg-panel-light hover:bg-panel-lighter active:scale-95 text-text-primary border border-border hover:border-border-light focus:ring-border',
    success:   'bg-success hover:bg-green-400 active:scale-95 text-white focus:ring-success shadow-lg hover:shadow-glow-success',
    danger:    'bg-danger hover:bg-red-400 active:scale-95 text-white focus:ring-danger',
    ghost:     'bg-transparent hover:bg-panel-light active:scale-95 text-text-secondary hover:text-text-primary focus:ring-border',
    outline:   'bg-transparent border border-primary hover:bg-primary/10 active:scale-95 text-primary focus:ring-primary',
  }

  const sizes = {
    sm:  'px-3 py-1.5 text-xs',
    md:  'px-4 py-2 text-sm',
    lg:  'px-6 py-3 text-base',
    xl:  'px-8 py-4 text-lg',
  }

  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="spinner w-4 h-4" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </button>
  )
}