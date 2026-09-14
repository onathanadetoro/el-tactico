'use client'

import React from 'react'

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 mx-auto">
            <div className="spinner w-20 h-20" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-black tracking-[0.2em]">FT</span>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold gradient-text mb-2">FUT Draft</h2>
          <p className="text-text-muted text-sm animate-pulse">Loading your game...</p>
        </div>
        <div className="flex gap-1 justify-center">
          {[0,1,2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}