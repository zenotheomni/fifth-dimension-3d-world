import React, { useState, useEffect } from 'react'
import { useSupabase } from '../../contexts/SupabaseContext'
import type { ArcadeScore } from '../../contexts/SupabaseContext'

interface LeaderboardEntry extends ArcadeScore {
  user_username?: string
  rank: number
}

interface LeaderboardProps {
  gameName?: string
  limit?: number
  className?: string
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ 
  gameName, 
  limit = 10,
  className = '' 
}) => {
  const { supabase } = useSupabase()
  const [scores, setScores] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGame, setSelectedGame] = useState(gameName || 'all')
  const [availableGames, setAvailableGames] = useState<string[]>([])

  useEffect(() => {
    loadLeaderboard()
    loadAvailableGames()
  }, [selectedGame, limit])

  const loadLeaderboard = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('arcade_scores')
        .select(`
          *,
          profiles!arcade_scores_user_id_fkey(username)
        `)
        .order('score', { ascending: false })
        .limit(limit)

      if (selectedGame !== 'all') {
        query = query.eq('game_name', selectedGame)
      }

      const { data, error } = await query

      if (error) throw error

      const rankedScores = data?.map((score, index) => ({
        ...score,
        user_username: score.profiles?.username || 'Anonymous',
        rank: index + 1
      })) || []

      setScores(rankedScores)
    } catch (error) {
      console.error('Error loading leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableGames = async () => {
    try {
      const { data, error } = await supabase
        .from('arcade_scores')
        .select('game_name')
        .order('game_name')

      if (error) throw error

      const games = [...new Set(data?.map(item => item.game_name) || [])]
      setAvailableGames(games)
    } catch (error) {
      console.error('Error loading games:', error)
    }
  }

  const formatScore = (score: number) => {
    return score.toLocaleString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return '🎮'
    }
  }

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900'
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500 text-gray-900'
      case 3: return 'bg-gradient-to-r from-orange-400 to-orange-600 text-orange-900'
      default: return 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
    }
  }

  const getNeonMultiplierStyle = (multiplier: number) => {
    if (multiplier >= 1.5) return 'text-pink-400 animate-pulse'
    if (multiplier >= 1.3) return 'text-purple-400'
    if (multiplier >= 1.1) return 'text-blue-400'
    return 'text-gray-400'
  }

  if (loading) {
    return (
      <div className={`leaderboard-container ${className}`}>
        <div className="animate-pulse text-center py-8">
          <div className="text-purple-400 text-xl">⚡ Loading Scores ⚡</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`leaderboard-container ${className}`}>
      <div className="leaderboard-header mb-6">
        <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
          🏆 ARCADE LEADERBOARD 🏆
        </h2>
        
        {availableGames.length > 0 && (
          <div className="game-filter mt-4 text-center">
            <select
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              className="bg-gray-800 border border-purple-500 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="all">🎮 All Games</option>
              {availableGames.map(game => (
                <option key={game} value={game}>
                  {game}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {scores.length === 0 ? (
        <div className="no-scores text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <div className="text-xl text-gray-400 mb-2">No scores yet!</div>
          <div className="text-gray-500">Be the first to set a high score!</div>
        </div>
      ) : (
        <div className="scores-list space-y-3">
          {scores.map((entry) => (
            <div
              key={`${entry.id}-${entry.rank}`}
              className={`score-entry p-4 rounded-lg border transition-all duration-200 hover:scale-105 ${getRankStyle(entry.rank)} border-purple-400 shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="rank-section text-2xl">
                    {getRankEmoji(entry.rank)}
                    <span className="ml-2 font-bold">#{entry.rank}</span>
                  </div>
                  
                  <div className="player-info">
                    <div className="player-name font-bold text-lg">
                      {entry.user_username}
                    </div>
                    <div className="game-name text-sm opacity-75">
                      {entry.game_name}
                    </div>
                  </div>
                </div>

                <div className="score-section text-right">
                  <div className="score text-2xl font-mono font-bold">
                    {formatScore(entry.score)}
                  </div>
                  
                  <div className="score-details text-xs space-x-2">
                    {entry.neon_multiplier && entry.neon_multiplier > 1 && (
                      <span className={`neon-multiplier ${getNeonMultiplierStyle(entry.neon_multiplier)}`}>
                        ⚡{entry.neon_multiplier.toFixed(2)}x
                      </span>
                    )}
                    <span className="date opacity-75">
                      {formatDate(entry.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              {entry.level_reached && (
                <div className="additional-stats mt-2 text-sm opacity-75">
                  🎯 Level: {entry.level_reached}
                  {entry.time_played && (
                    <span className="ml-4">⏱️ Time: {Math.floor(entry.time_played / 60)}:{(entry.time_played % 60).toString().padStart(2, '0')}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="leaderboard-footer mt-6 text-center text-sm text-gray-500">
        <div className="vegas-info">
          💎 Neon Multipliers boost your scores based on skill and game type! 💎
        </div>
        <div className="refresh-info mt-2">
          🔄 Scores update in real-time as players compete!
        </div>
      </div>
    </div>
  )
}