import React from 'react'
import { motion } from 'framer-motion'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  fullScreen?: boolean
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Loading...', 
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-20 h-20'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl'
  }

  const container = fullScreen 
    ? 'fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex flex-col items-center justify-center z-50'
    : 'flex flex-col items-center justify-center p-8'

  return (
    <div className={container}>
      {/* Animated background for full screen */}
      {fullScreen && (
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-neon-pink/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-neon-blue/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center">
        {/* Spinning loader */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className={`${sizeClasses[size]} border-4 border-neon-blue/20 border-t-neon-blue rounded-full mb-4`}
        />

        {/* Loading text */}
        <motion.p
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
          className={`${textSizeClasses[size]} font-orbitron font-semibold neon-text text-neon-blue`}
        >
          {text}
        </motion.p>

        {/* Additional effect for full screen */}
        {fullScreen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-center max-w-md"
          >
            <p className="text-gray-300 text-sm">
              Preparing your dimensional experience...
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}