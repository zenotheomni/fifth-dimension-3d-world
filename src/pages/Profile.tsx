import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Settings, Trophy, Music, Gamepad2, Heart, Edit } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export const Profile: React.FC = () => {
  const { user, profile, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    phone: profile?.phone || '',
    opted_in_promotions: profile?.opted_in_promotions || false
  })

  // Mock user stats - replace with real data from Supabase
  const userStats = {
    songsOwned: 47,
    gamesPlayed: 23,
    highScore: 98700,
    favoritesCount: 156,
    joinDate: 'January 2024',
    streamsWatched: 89
  }

  const recentActivity = [
    { type: 'purchase', description: 'Purchased "Neon Dreams" vinyl', timestamp: '2 hours ago' },
    { type: 'game', description: 'New high score in Quantum Racing: 98,700', timestamp: '1 day ago' },
    { type: 'social', description: 'Liked post by CyberExplorer', timestamp: '2 days ago' },
    { type: 'stream', description: 'Watched DJ Synthwave live stream', timestamp: '3 days ago' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateProfile(formData)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 pt-24 pb-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-orbitron font-bold mb-4 neon-text text-neon-pink">
            Profile
          </h1>
          <p className="text-xl text-gray-300">
            Manage your dimensional identity and preferences
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-orbitron font-bold text-white">Basic Information</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(!isEditing)}
                  className="btn-neon flex items-center gap-2 px-4 py-2"
                >
                  <Edit className="w-4 h-4" />
                  {isEditing ? 'Cancel' : 'Edit'}
                </motion.button>
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-neon-pink focus:ring-2 focus:ring-neon-pink/20 transition-all"
                      placeholder="Enter username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-neon-pink focus:ring-2 focus:ring-neon-pink/20 transition-all"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="opted_in_promotions"
                      checked={formData.opted_in_promotions}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-neon-pink bg-white/5 border-white/20 rounded focus:ring-neon-pink focus:ring-2"
                    />
                    <label className="ml-3 text-sm text-gray-300">
                      Receive promotional emails and event notifications
                    </label>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-vegas px-6 py-2"
                    >
                      Save Changes
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-neon px-6 py-2"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-neon-pink/20 to-neon-blue/20 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-neon-pink" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        {profile?.username || 'Set Username'}
                      </h3>
                      <p className="text-gray-400">Dimensional Traveler</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 pt-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-400">Email</div>
                        <div className="text-white">{user?.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-400">Phone</div>
                        <div className="text-white">{profile?.phone || 'Not set'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-400">Promotions</div>
                        <div className="text-white">
                          {profile?.opted_in_promotions ? 'Enabled' : 'Disabled'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-400">Member Since</div>
                        <div className="text-white">{userStats.joinDate}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="glass-card p-6"
            >
              <h2 className="text-2xl font-orbitron font-bold text-white mb-6">Recent Activity</h2>
              
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === 'purchase' ? 'bg-vegas-gold/20 text-vegas-gold' :
                      activity.type === 'game' ? 'bg-neon-blue/20 text-neon-blue' :
                      activity.type === 'social' ? 'bg-neon-pink/20 text-neon-pink' :
                      'bg-neon-green/20 text-neon-green'
                    }`}>
                      {activity.type === 'purchase' && <Music className="w-5 h-5" />}
                      {activity.type === 'game' && <Gamepad2 className="w-5 h-5" />}
                      {activity.type === 'social' && <Heart className="w-5 h-5" />}
                      {activity.type === 'stream' && <User className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-white">{activity.description}</div>
                      <div className="text-sm text-gray-400">{activity.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <Trophy className="w-6 h-6 text-vegas-gold" />
                <h3 className="text-xl font-orbitron font-bold text-white">Your Stats</h3>
              </div>

              <div className="space-y-4">
                <div className="text-center p-4 bg-neon-pink/10 rounded-lg border border-neon-pink/20">
                  <div className="text-3xl font-bold text-neon-pink">{userStats.songsOwned}</div>
                  <div className="text-sm text-gray-400">Songs Owned</div>
                </div>

                <div className="text-center p-4 bg-neon-blue/10 rounded-lg border border-neon-blue/20">
                  <div className="text-3xl font-bold text-neon-blue">{userStats.gamesPlayed}</div>
                  <div className="text-sm text-gray-400">Games Played</div>
                </div>

                <div className="text-center p-4 bg-vegas-gold/10 rounded-lg border border-vegas-gold/20">
                  <div className="text-3xl font-bold text-vegas-gold">{userStats.highScore.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">High Score</div>
                </div>

                <div className="text-center p-4 bg-neon-green/10 rounded-lg border border-neon-green/20">
                  <div className="text-3xl font-bold text-neon-green">{userStats.favoritesCount}</div>
                  <div className="text-sm text-gray-400">Favorites</div>
                </div>
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="glass-card p-6"
            >
              <h3 className="text-xl font-orbitron font-bold text-white mb-4">Achievements</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 bg-vegas-gold/10 rounded-lg">
                  <div className="w-8 h-8 bg-vegas-gold rounded-full flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">First Purchase</div>
                    <div className="text-xs text-gray-400">Buy your first song</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 bg-neon-blue/10 rounded-lg">
                  <div className="w-8 h-8 bg-neon-blue rounded-full flex items-center justify-center">
                    <Gamepad2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Arcade Master</div>
                    <div className="text-xs text-gray-400">Score 50,000+ points</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 bg-gray-600/10 rounded-lg opacity-50">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-400">Social Butterfly</div>
                    <div className="text-xs text-gray-500">Make 10 community posts</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}