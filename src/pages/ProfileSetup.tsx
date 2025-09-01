import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { ProfileCreation } from '../components/ProfileCreation'

export const ProfileSetup: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect if not authenticated
    if (!user) {
      navigate('/auth')
    }
  }, [user, navigate])

  const handleProfileComplete = () => {
    // Navigate to the main world after profile creation
    navigate('/world')
  }

  if (!user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
      {/* Interactive background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-neon-pink/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-neon-blue/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-vegas-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-orbitron font-black mb-4">
            <span className="bg-gradient-to-r from-neon-pink via-vegas-gold to-neon-blue bg-clip-text text-transparent animate-neon-pulse">
              Welcome to the Fifth Dimension
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Let's create your cosmic profile and prepare you for interdimensional adventures ✨
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ProfileCreation onComplete={handleProfileComplete} />
        </motion.div>
      </div>
    </div>
  )
}