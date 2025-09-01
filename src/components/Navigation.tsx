import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Music, Gamepad2, Users, Radio, User, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export const Navigation: React.FC = () => {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
    setIsMobileMenuOpen(false)
  }

  const navItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Lobby', path: '/world' },
    { icon: <Music className="w-5 h-5" />, label: 'Records', path: '/record-store' },
    { icon: <Gamepad2 className="w-5 h-5" />, label: 'Arcade', path: '/arcade' },
    { icon: <Users className="w-5 h-5" />, label: 'Community', path: '/community' },
    { icon: <Radio className="w-5 h-5" />, label: 'Ballroom', path: '/ballroom' },
  ]

  // Don't show navigation on landing and auth pages
  if (!user || location.pathname === '/' || location.pathname.startsWith('/auth')) {
    return null
  }

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="hidden md:block fixed top-0 left-0 right-0 z-50 glass-card mx-4 mt-4 rounded-2xl"
      >
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link to="/world" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-neon-pink to-neon-blue rounded-lg flex items-center justify-center">
              <span className="text-white font-orbitron font-bold text-sm">5D</span>
            </div>
            <span className="font-orbitron font-bold text-lg neon-text text-neon-blue">
              Fifth Dimension
            </span>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  location.pathname === item.path
                    ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <Link
              to="/profile"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                location.pathname === '/profile'
                  ? 'bg-neon-pink/20 text-neon-pink border border-neon-pink/30'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="font-medium">Profile</span>
            </Link>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Exit</span>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Mobile Header */}
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="fixed top-0 left-0 right-0 z-50 glass-card mx-4 mt-4 rounded-2xl"
        >
          <div className="flex items-center justify-between px-4 py-3">
            <Link to="/world" className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-r from-neon-pink to-neon-blue rounded-lg flex items-center justify-center">
                <span className="text-white font-orbitron font-bold text-xs">5D</span>
              </div>
              <span className="font-orbitron font-bold text-sm neon-text text-neon-blue">
                Fifth Dimension
              </span>
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-300 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </motion.div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Menu */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: isMobileMenuOpen ? 0 : '100%' }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed top-0 right-0 bottom-0 z-50 w-80 glass-card m-4 rounded-2xl overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-orbitron font-bold text-lg neon-text text-neon-blue">
                Navigation
              </h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-300 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                    location.pathname === item.path
                      ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}

              <hr className="border-white/10 my-4" />

              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  location.pathname === '/profile'
                    ? 'bg-neon-pink/20 text-neon-pink border border-neon-pink/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Profile</span>
              </Link>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Exit Dimension</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Spacer for fixed navigation */}
      <div className="h-20"></div>
    </>
  )
}