'use client'

import React, { useState, useMemo, useCallback } from 'react'
import clsx from 'clsx'
import { Player, Position, FilterOptions, TeamPlaystyle } from '@/types'
import PlayerCard from './PlayerCard'
import SearchInput from '@/components/ui/SearchInput'
import { ChevronUp, ChevronDown, SlidersHorizontal, Users } from 'lucide-react'

interface PlayerBrowserProps {
  players: Player[]
  selectedPlayerIds?: Set<string>
  captainId?: string | null
  onSelectPlayer?: (player: Player) => void
  onSetCaptain?: (playerId: string) => void
  compact?: boolean
  allowedPosition?: Position | null
  maxSelectable?: number
  currentSelectionCount?: number
  teamPlaystyle?: TeamPlaystyle
}

const POSITION_OPTIONS: Array<{ value: Position | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All Positions' },
  { value: 'GK',  label: 'Goalkeepers' },
  { value: 'DEF', label: 'Defenders' },
  { value: 'MID', label: 'Midfielders' },
  { value: 'ATT', label: 'Attackers' },
]

const SORT_OPTIONS: Array<{ value: FilterOptions['sortBy']; label: string }> = [
  { value: 'overall',     label: 'Overall' },
  { value: 'finishing',   label: 'Finishing' },
  { value: 'pace',        label: 'Pace' },
  { value: 'ballControl', label: 'Ball Control' },
  { value: 'dribbling',   label: 'Dribbling' },
  { value: 'defending',   label: 'Defending' },
  { value: 'physicality', label: 'Physicality' },
  { value: 'name',        label: 'Name (A-Z)' },
]

export default function PlayerBrowser({
  players,
  selectedPlayerIds = new Set(),
  captainId,
  onSelectPlayer,
  onSetCaptain,
  compact = false,
  allowedPosition,
  maxSelectable,
  currentSelectionCount = 0,
  teamPlaystyle,
}: PlayerBrowserProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    position: allowedPosition ?? 'ALL',
    sortBy: 'overall',
    sortOrder: 'desc',
  })
  const [showFilters, setShowFilters] = useState(false)

  const updateFilter = useCallback(<K extends keyof FilterOptions>(
    key: K,
    value: FilterOptions[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const toggleSort = useCallback((sortBy: FilterOptions['sortBy']) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'desc' ? 'asc' : 'desc',
    }))
  }, [])

  const filteredPlayers = useMemo(() => {
    let result = [...players]

    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.nationality.toLowerCase().includes(q)
      )
    }

    // Position filter
    if (filters.position !== 'ALL') {
      result = result.filter(p => p.position === filters.position)
    }

    // Sort
    result.sort((a, b) => {
      let valA: number | string
      let valB: number | string

      if (filters.sortBy === 'overall') {
        valA = a.overall; valB = b.overall
      } else if (filters.sortBy === 'name') {
        valA = a.name; valB = b.name
      } else {
        valA = a.stats[filters.sortBy as keyof typeof a.stats] ?? 0
        valB = b.stats[filters.sortBy as keyof typeof b.stats] ?? 0
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return filters.sortOrder === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA)
      }

      return filters.sortOrder === 'asc'
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number)
    })

    return result
  }, [players, filters])

  const canSelectMore = maxSelectable === undefined || currentSelectionCount < maxSelectable

  return (
    <div className="flex flex-col h-full">
      {/* Search & Filter Bar */}
      <div className="space-y-2 mb-3 shrink-0">
        <div className="flex gap-2">
          <SearchInput
            value={filters.search}
            onChange={v => updateFilter('search', v)}
            className="flex-1"
          />
          <button
            onClick={() => setShowFilters(f => !f)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors',
              showFilters
                ? 'bg-primary/20 border-primary/50 text-primary'
                : 'bg-panel-light border-border text-text-secondary hover:text-text-primary hover:border-border-light'
            )}
          >
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="p-3 bg-panel-light rounded-lg border border-border space-y-3 animate-fade-in">
            {/* Position Filter */}
            <div>
              <p className="text-xs text-text-muted mb-1.5 font-medium">Position</p>
              <div className="flex flex-wrap gap-1.5">
                {POSITION_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateFilter('position', opt.value)}
                    className={clsx(
                      'px-2.5 py-1 rounded text-xs font-semibold transition-colors border',
                      filters.position === opt.value
                        ? 'bg-primary/20 border-primary/50 text-primary'
                        : 'bg-panel border-border text-text-secondary hover:border-border-light hover:text-text-primary'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <p className="text-xs text-text-muted mb-1.5 font-medium">Sort By</p>
              <div className="flex flex-wrap gap-1.5">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => toggleSort(opt.value)}
                    className={clsx(
                      'flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-colors border',
                      filters.sortBy === opt.value
                        ? 'bg-primary/20 border-primary/50 text-primary'
                        : 'bg-panel border-border text-text-secondary hover:border-border-light hover:text-text-primary'
                    )}
                  >
                    {opt.label}
                    {filters.sortBy === opt.value && (
                      filters.sortOrder === 'desc'
                        ? <ChevronDown size={10} />
                        : <ChevronUp size={10} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results count */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-muted">
            <span className="text-text-secondary font-medium">{filteredPlayers.length}</span> players found
          </p>
          {maxSelectable !== undefined && (
            <p className="text-xs text-text-muted">
              Selected: <span className="text-primary font-medium">{currentSelectionCount}</span>/{maxSelectable}
            </p>
          )}
        </div>
      </div>

      {/* Player List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {filteredPlayers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users size={40} className="text-text-muted mb-3" />
            <p className="text-text-secondary font-medium">No players found</p>
            <p className="text-text-muted text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredPlayers.map(player => (
            <PlayerCard
              key={player.id}
              player={player}
              compact={compact}
              isSelected={selectedPlayerIds.has(player.id)}
              isCaptain={captainId === player.id}
              onSelect={onSelectPlayer ? () => onSelectPlayer(player) : undefined}
              onSetCaptain={onSetCaptain ? () => onSetCaptain(player.id) : undefined}
              selectable={!!onSelectPlayer}
              disabled={!selectedPlayerIds.has(player.id) && !canSelectMore}
              teamPlaystyle={teamPlaystyle}
            />
          ))
        )}
      </div>
    </div>
  )
}