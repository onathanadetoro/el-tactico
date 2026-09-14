'use client'

import React, { useEffect, useState } from 'react'
import { GameProvider, useGame } from '@/lib/gameContext'
import HomePage from '@/components/home/HomePage'
import SquadBuilder from '@/components/squad/SquadBuilder'
import TournamentPage from '@/components/tournament/TournamentPage'
import LoadingScreen from '@/components/ui/LoadingScreen'

function GameRouter() {
  const { state } = useGame()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || state.players.length === 0) {
    return <LoadingScreen />
  }

  switch (state.currentPage) {
    case 'HOME':
      return <HomePage />
    case 'SQUAD_BUILDER':
    case 'FORMATION':
      return <SquadBuilder />
    case 'TOURNAMENT':
    case 'MATCH':
    case 'RESULTS':
      return <TournamentPage />
    default:
      return <HomePage />
  }
}

export default function App() {
  return (
    <GameProvider>
      <GameRouter />
    </GameProvider>
  )
}