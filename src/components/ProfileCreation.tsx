import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Star, Palette, Save, Sparkles } from 'lucide-react'
import { useSupabase } from '../contexts/SupabaseContext'
import { useAuth } from '../contexts/AuthContext'

interface ProfileCreationProps {
  onComplete: () => void
  className?: string
}

export const ProfileCreation: React.FC<ProfileCreationProps> = ({
  onComplete,
  className = ''
}) => {
  const { supabase } = useSupabase()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [profileData, setProfileData] = useState({
    display_name: '',
    avatar_style: 'cosmic',
    favorite_color: '#8B5CF6',
    bio: '',
    interests: [] as string[],
    cosmic_level: 1
  })

  const avatarStyles = [
    { id: 'cosmic', name: 'Cosmic Explorer', emoji: '🌌', description: 'For interstellar travelers' },
    { id: 'neon', name: 'Neon Dreamer', emoji: '✨', description: 'Vegas vibes and electric nights' },
    { id: 'mystical', name: 'Mystical Entity', emoji: '🔮', description: 'Magic and mystery' },
    { id: 'cyber', name: 'Cyber Punk', emoji: '🤖', description: 'Digital dimension dweller' },
    { id: 'royal', name: 'Royal Presence', emoji: '👑', description: 'Regal and refined' },
    { id: 'wild', name: 'Wild Spirit', emoji: '🔥', description: 'Untamed energy' }
  ]

  const interests = [
    'Music Production', 'Gaming', 'Digital Art', 'Live Streaming', 'Community Building',
    'Virtual Reality', 'Crypto/NFTs', 'Fashion', 'Technology', 'Philosophy',
    'Space & Astronomy', 'Psychology', 'Meditation', 'Adventure Sports', 'Photography'
  ]

  const colors = [
    '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444',
    '#3B82F6', '#8B5A2B', '#14B8A6', '#F97316', '#A855F7'
  ]

  const handleInterestToggle = (interest: string) => {
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest].slice(0, 5) // Max 5 interests
    }))
  }

  const handleSubmit = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profileData,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      onComplete()
    } catch (error) {
      console.error('Error creating profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Choose Your Cosmic Identity</h2>
        <p className="text-gray-300">How do you want to be known in the Fifth Dimension?</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Display Name
        </label>
        <input
          type="text"
          value={profileData.display_name}
          onChange={(e) => setProfileData(prev => ({ ...prev, display_name: e.target.value }))}
          placeholder="Enter your cosmic name..."
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          maxLength={30}
        />
        <div className="text-right text-xs text-gray-400 mt-1">
          {profileData.display_name.length}/30
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-4">
          Avatar Style
        </label>
        <div className="grid grid-cols-2 gap-3">
          {avatarStyles.map((style) => (
            <motion.button
              key={style.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setProfileData(prev => ({ ...prev, avatar_style: style.id }))}
              className={`p-4 rounded-lg border-2 transition-all ${
                profileData.avatar_style === style.id
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-white/20 bg-white/5 hover:border-white/40'
              }`}
            >
              <div className="text-2xl mb-2">{style.emoji}</div>
              <div className="font-semibold text-sm">{style.name}</div>
              <div className="text-xs text-gray-400">{style.description}</div>
            </motion.button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-4">
          Signature Color
        </label>
        <div className="grid grid-cols-5 gap-3">
          {colors.map((color) => (
            <motion.button
              key={color}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setProfileData(prev => ({ ...prev, favorite_color: color }))}
              className={`w-12 h-12 rounded-full border-4 transition-all ${
                profileData.favorite_color === color
                  ? 'border-white scale-110'
                  : 'border-white/20 hover:border-white/60'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Tell Us About Yourself</h2>
        <p className="text-gray-300">Help other travelers discover your cosmic essence</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Bio
        </label>
        <textarea
          value={profileData.bio}
          onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
          placeholder="Share something about your journey through the dimensions..."
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          rows={4}
          maxLength={200}
        />
        <div className="text-right text-xs text-gray-400 mt-1">
          {profileData.bio.length}/200
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-4">
          Interests (Select up to 5)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {interests.map((interest) => (
            <motion.button
              key={interest}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleInterestToggle(interest)}
              disabled={!profileData.interests.includes(interest) && profileData.interests.length >= 5}
              className={`p-3 rounded-lg text-sm transition-all ${
                profileData.interests.includes(interest)
                  ? 'bg-purple-500/30 border-purple-500 text-white'
                  : 'bg-white/5 border-white/20 text-gray-300 hover:border-white/40 disabled:opacity-50 disabled:cursor-not-allowed'
              } border`}
            >
              {interest}
            </motion.button>
          ))}
        </div>
        <div className="text-center text-xs text-gray-400 mt-2">
          {profileData.interests.length}/5 selected
        </div>
      </div>
    </motion.div>
  )

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6 text-center"
    >
      <div className="mb-8">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold mb-2">Profile Complete!</h2>
        <p className="text-gray-300">Welcome to your cosmic journey, {profileData.display_name}!</p>
      </div>

      {/* Profile Preview */}
      <div className="glass-card p-6 max-w-md mx-auto">
        <div 
          className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl"
          style={{ backgroundColor: profileData.favorite_color }}
        >
          {avatarStyles.find(s => s.id === profileData.avatar_style)?.emoji}
        </div>
        <h3 className="text-xl font-bold mb-2">{profileData.display_name}</h3>
        <p className="text-gray-300 text-sm mb-4">{profileData.bio}</p>
        <div className="flex flex-wrap gap-1 justify-center">
          {profileData.interests.slice(0, 3).map((interest) => (
            <span 
              key={interest}
              className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs"
            >
              {interest}
            </span>
          ))}
          {profileData.interests.length > 3 && (
            <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">
              +{profileData.interests.length - 3} more
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      <div className="glass-card p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">Step {step} of 3</span>
            <span className="text-sm text-gray-400">{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          {step > 1 && step < 3 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setStep(step - 1)}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Back
            </motion.button>
          )}
          
          <div className="ml-auto">
            {step < 3 ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && !profileData.display_name.trim()}
                className="btn-vegas px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {step === 2 ? 'Complete Profile' : 'Next'}
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleSubmit}
                disabled={isLoading}
                className="btn-vegas px-8 py-3 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Enter the Fifth Dimension
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}