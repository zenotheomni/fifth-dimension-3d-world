import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Phone, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export const AuthPage: React.FC = () => {
  const { user, signUp, signIn, signInWithMagicLink, resetPassword } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode') || 'signin'

  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    optInPromotions: true
  })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Redirect if already authenticated
    if (user) {
      navigate('/world')
    }
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      if (mode === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match')
          return
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters')
          return
        }
        
        const { error } = await signUp(
          formData.email, 
          formData.password, 
          formData.phone, 
          formData.optInPromotions
        )
        
        if (error) {
          setError(error.message)
        } else {
          setMessage('Account created! Check your email to verify your account.')
        }
      } else if (mode === 'signin') {
        const { error } = await signIn(formData.email, formData.password)
        
        if (error) {
          setError(error.message)
        } else {
          navigate('/world')
        }
      } else if (mode === 'magic') {
        const { error } = await signInWithMagicLink(formData.email)
        
        if (error) {
          setError(error.message)
        } else {
          setMessage('Magic link sent! Check your email to sign in.')
        }
      } else if (mode === 'reset') {
        const { error } = await resetPassword(formData.email)
        
        if (error) {
          setError(error.message)
        } else {
          setMessage('Password reset link sent! Check your email.')
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center px-4 py-8">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-neon-pink/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-neon-blue/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-card p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-orbitron font-bold mb-2 neon-text text-neon-blue">
              {mode === 'signup' && 'Join the Dimension'}
              {mode === 'signin' && 'Welcome Back'}
              {mode === 'magic' && 'Magic Link Sign In'}
              {mode === 'reset' && 'Reset Password'}
            </h1>
            <p className="text-gray-300">
              {mode === 'signup' && 'Create your account to enter the Fifth Dimension'}
              {mode === 'signin' && 'Sign in to continue your journey'}
              {mode === 'magic' && 'We\'ll send you a magic link to sign in'}
              {mode === 'reset' && 'Enter your email to reset your password'}
            </p>
          </div>

          {/* Error/Success messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm"
            >
              {error}
            </motion.div>
          )}

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-sm"
            >
              {message}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20 transition-all"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Password (not for magic link or reset) */}
            {mode !== 'magic' && mode !== 'reset' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password (signup only) */}
            {mode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            {/* Phone (signup only) */}
            {mode === 'signup' && (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20 transition-all"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            )}

            {/* Opt-in for promotions (signup only) */}
            {mode === 'signup' && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="optInPromotions"
                  name="optInPromotions"
                  checked={formData.optInPromotions}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-neon-blue bg-white/5 border-white/20 rounded focus:ring-neon-blue focus:ring-2"
                />
                <label htmlFor="optInPromotions" className="ml-3 text-sm text-gray-300">
                  I want to receive promotional emails and updates about events
                </label>
              </div>
            )}

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full btn-vegas py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                <>
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'signin' && 'Sign In'}
                  {mode === 'magic' && 'Send Magic Link'}
                  {mode === 'reset' && 'Send Reset Link'}
                </>
              )}
            </motion.button>
          </form>

          {/* Mode switcher */}
          <div className="mt-6 text-center space-y-2">
            {mode === 'signin' && (
              <>
                <p className="text-gray-400">
                  Don't have an account?{' '}
                  <button
                    onClick={() => navigate('/auth?mode=signup')}
                    className="text-neon-blue hover:text-neon-pink transition-colors"
                  >
                    Sign up
                  </button>
                </p>
                <p className="text-gray-400">
                  <button
                    onClick={() => navigate('/auth?mode=magic')}
                    className="text-neon-green hover:text-neon-pink transition-colors"
                  >
                    Use magic link instead
                  </button>
                </p>
                <p className="text-gray-400">
                  <button
                    onClick={() => navigate('/auth?mode=reset')}
                    className="text-vegas-gold hover:text-neon-pink transition-colors"
                  >
                    Forgot password?
                  </button>
                </p>
              </>
            )}

            {mode === 'signup' && (
              <p className="text-gray-400">
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/auth?mode=signin')}
                  className="text-neon-blue hover:text-neon-pink transition-colors"
                >
                  Sign in
                </button>
              </p>
            )}

            {(mode === 'magic' || mode === 'reset') && (
              <p className="text-gray-400">
                <button
                  onClick={() => navigate('/auth?mode=signin')}
                  className="text-neon-blue hover:text-neon-pink transition-colors"
                >
                  Back to sign in
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}