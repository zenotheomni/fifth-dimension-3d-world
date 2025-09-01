import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Trophy, Users, Clock, Star, X } from 'lucide-react'
import { ArcadeGame } from '../components/arcade/ArcadeGame'
import { Leaderboard } from '../components/arcade/Leaderboard'

export const Arcade: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [gameMode, setGameMode] = useState<'menu' | 'playing' | 'leaderboard'>('menu')

  // Real game data for Three.js implementations
  const games = [
    {
      id: 'neon-runner',
      title: 'Neon Runner',
      description: 'Race through cyberpunk tunnels avoiding neon obstacles',
      type: 'neon-runner' as const,
      icon: '🏃‍♂️',
      players: 1,
      difficulty: 'Medium',
      tags: ['Runner', 'Cyberpunk', 'Arcade'],
      instructions: 'Use ARROW KEYS to dodge obstacles in the neon tunnel!'
    },
    {
      id: 'space-defense',
      title: 'Space Defense',
      description: 'Defend your ship against alien invaders from space',
      type: 'space-defense' as const,
      icon: '🚀',
      players: 1,
      difficulty: 'Hard',
      tags: ['Shooter', 'Strategy', 'Sci-Fi'],
      instructions: 'Move with MOUSE, CLICK to shoot enemies!'
    },
    {
      id: 'crystal-collector',
      title: 'Crystal Collector',
      description: 'Gather glowing crystals in mysterious dimensional caves',
      type: 'crystal-collector' as const,
      icon: '💎',
      players: 1,
      difficulty: 'Easy',
      tags: ['Puzzle', 'Adventure', 'Casual'],
      instructions: 'Use WASD to collect glowing crystals!'
    }
  ]

  const leaderboard = [
    { rank: 1, player: 'CyberGamer', score: 123400, game: 'Quantum Racing' },
    { rank: 2, player: 'NeonMaster', score: 89400, game: 'Crystal Collector' },
    { rank: 3, player: 'StarDefender', score: 45600, game: 'Space Defense' },
    { rank: 4, player: 'RunnerPro', score: 15420, game: 'Neon Runner' },
    { rank: 5, player: 'QuantumRacer', score: 12890, game: 'Quantum Racing' }
  ]

  const handleGameSelect = (gameId: string) => {
    setSelectedGame(gameId)
    setGameMode('playing')
  }

  const handleBackToMenu = () => {
    setSelectedGame(null)
    setGameMode('menu')
  }

  const handleShowLeaderboard = () => {
    setGameMode('leaderboard')
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-neon-green'
      case 'Medium': return 'text-vegas-gold'
      case 'Hard': return 'text-neon-pink'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-orbitron font-bold mb-4 neon-text text-neon-blue">
            🎮 Fifth Dimension Arcade 🎮
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Experience Vegas-style gaming with real Three.js arcade games and compete on live leaderboards
          </p>
          
          {/* Navigation Tabs */}
          <div className="flex justify-center space-x-4 mt-8">
            <button
              onClick={() => setGameMode('menu')}
              className={`px-6 py-3 rounded-lg font-bold transition-all duration-200 ${
                gameMode === 'menu' 
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🎯 Games
            </button>
            <button
              onClick={handleShowLeaderboard}
              className={`px-6 py-3 rounded-lg font-bold transition-all duration-200 ${
                gameMode === 'leaderboard' 
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🏆 Leaderboard
            </button>
            {gameMode === 'playing' && (
              <button
                onClick={handleBackToMenu}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                ← Back to Games
              </button>
            )}
          </div>
        </motion.div>

        {/* Game Menu Mode */}
        {gameMode === 'menu' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Games Grid */}
            <div className="lg:col-span-2">
              <div className="grid md:grid-cols-2 gap-6">
                {games.map((game, index) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -10 }}
                    onClick={() => handleGameSelect(game.id)}
                    className="glass-card p-4 cursor-pointer transition-all duration-300 hover:ring-2 hover:ring-neon-blue hover:shadow-lg hover:shadow-neon-blue/25"
                  >
                    {/* Game Icon */}
                    <div className="relative mb-4 overflow-hidden rounded-lg group">
                      <div className="w-full h-32 bg-gradient-to-br from-neon-blue/20 to-neon-pink/20 flex items-center justify-center">
                        <div className="text-6xl">{game.icon}</div>
                      </div>
                      
                      {/* Play Overlay */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center"
                      >
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="w-12 h-12 bg-neon-blue rounded-full flex items-center justify-center text-white"
                        >
                          <Play className="w-6 h-6 ml-1" />
                        </motion.button>
                      </motion.div>

                      {/* Difficulty Badge */}
                      <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${getDifficultyColor(game.difficulty)} bg-black/50`}>
                        {game.difficulty}
                      </div>
                    </div>

                    {/* Game Info */}
                    <div className="space-y-2">
                      <h3 className="font-orbitron font-bold text-lg text-white">
                        {game.title}
                      </h3>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {game.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {game.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Instructions */}
                      <div className="text-xs text-blue-400 mt-2">
                        {game.instructions}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Info Section */}
              <div className="mt-8">
                <div className="glass-card p-6">
                  <h3 className="text-2xl font-orbitron font-bold text-white mb-4">🌟 How Vegas Scoring Works</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="text-pink-400">
                      <strong>⚡ Neon Multipliers:</strong> Higher scores unlock bonus multipliers up to 1.5x
                    </div>
                    <div className="text-purple-400">
                      <strong>💎 Game Bonuses:</strong> Crystal Collector gives 20% bonus, others 10%
                    </div>
                    <div className="text-blue-400">
                      <strong>🏆 Real-time Leaderboards:</strong> Compete instantly with other players
                    </div>
                    <div className="text-green-400">
                      <strong>🎯 Progressive Difficulty:</strong> Games get harder and more rewarding over time
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Leaderboard Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="glass-card p-6 sticky top-28"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-vegas-gold" />
                    <h2 className="text-xl font-orbitron font-bold text-white">
                      Top Players
                    </h2>
                  </div>
                  <button
                    onClick={handleShowLeaderboard}
                    className="text-xs text-neon-blue hover:text-white transition-colors"
                  >
                    View All →
                  </button>
                </div>

                <div className="space-y-3">
                  {leaderboard.slice(0, 5).map((entry) => (
                    <div
                      key={entry.rank}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        entry.rank <= 3 ? 'bg-gradient-to-r from-vegas-gold/10 to-neon-pink/10 border border-vegas-gold/20' : 'bg-white/5'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        entry.rank === 1 ? 'bg-vegas-gold text-black' :
                        entry.rank === 2 ? 'bg-gray-300 text-black' :
                        entry.rank === 3 ? 'bg-orange-400 text-black' :
                        'bg-gray-600 text-white'
                      }`}>
                        {entry.rank}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white truncate">
                          {entry.player}
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          {entry.game}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-neon-blue font-semibold">
                          {entry.score.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-neon-green">{games.length}</div>
                      <div className="text-xs text-gray-400">Games Live</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-neon-pink">∞</div>
                      <div className="text-xs text-gray-400">Active Players</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Playing Mode */}
        {gameMode === 'playing' && selectedGame && (
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              {(() => {
                const game = games.find(g => g.id === selectedGame)
                return game ? (
                  <ArcadeGame
                    gameName={game.title}
                    gameType={game.type}
                    className="mx-auto"
                  />
                ) : null
              })()}
            </motion.div>
          </div>
        )}

        {/* Leaderboard Mode */}
        {gameMode === 'leaderboard' && (
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Leaderboard limit={50} className="w-full" />
            </motion.div>
          </div>
        )}

      </div>
    </div>
  )
}