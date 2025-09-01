import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useUnity, canRunUnity } from '../contexts/UnityContext'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { Music, Gamepad2, Users, Radio, Smartphone, Monitor } from 'lucide-react'

export const MainWorld: React.FC = () => {
  const { user } = useAuth()
  const { 
    loadUnity, 
    unityInstance, 
    isUnityLoaded, 
    isUnityVisible, 
    setUnityVisible, 
    unityContainerRef,
    sendMessageToUnity 
  } = useUnity()
  
  const [isLoading, setIsLoading] = useState(false)
  const [unitySupported, setUnitySupported] = useState(true)
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)

  useEffect(() => {
    // Check if Unity is supported
    setUnitySupported(canRunUnity())
  }, [])

  useEffect(() => {
    // Send user data to Unity when it loads
    if (isUnityLoaded && user) {
      sendMessageToUnity('GameManager', 'SetUserData', JSON.stringify({
        userId: user.id,
        email: user.email,
        username: user.user_metadata?.username || 'Player'
      }))
    }
  }, [isUnityLoaded, user, sendMessageToUnity])

  const handleLoadUnity = async () => {
    setIsLoading(true)
    try {
      await loadUnity()
      setUnityVisible(true)
    } catch (error) {
      console.error('Failed to load Unity:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const rooms = [
    {
      id: 'record-store',
      name: 'Record Store',
      description: 'Discover and purchase music from artists worldwide',
      icon: <Music className="w-8 h-8" />,
      color: 'neon-pink',
      route: '/record-store'
    },
    {
      id: 'arcade',
      name: 'Arcade',
      description: 'Play immersive games and compete on leaderboards',
      icon: <Gamepad2 className="w-8 h-8" />,
      color: 'neon-blue',
      route: '/arcade'
    },
    {
      id: 'community',
      name: 'Community Board',
      description: 'Connect with other dimensional travelers',
      icon: <Users className="w-8 h-8" />,
      color: 'neon-green',
      route: '/community'
    },
    {
      id: 'ballroom',
      name: 'Live Ballroom',
      description: 'Experience live streams and events',
      icon: <Radio className="w-8 h-8" />,
      color: 'vegas-gold',
      route: '/ballroom'
    }
  ]

  const handleRoomSelect = (roomId: string, route: string) => {
    setSelectedRoom(roomId)
    
    // If Unity is loaded, send navigation message
    if (isUnityLoaded) {
      sendMessageToUnity('NavigationManager', 'NavigateToRoom', roomId)
    } else {
      // Fallback to direct navigation
      window.location.hash = route
    }
  }

  if (!unitySupported) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center px-4">
        <div className="max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8"
          >
            <Smartphone className="w-16 h-16 text-neon-pink mx-auto mb-6" />
            <h1 className="text-3xl font-orbitron font-bold mb-4 neon-text text-neon-pink">
              Experience Optimized
            </h1>
            <p className="text-gray-300 mb-6 leading-relaxed">
              For the best 3D experience, we recommend using a desktop or laptop computer. 
              Don't worry - you can still explore all our rooms using the navigation menu!
            </p>
            <div className="grid grid-cols-2 gap-4">
              {rooms.map((room) => (
                <motion.a
                  key={room.id}
                  href={room.route}
                  whileHover={{ scale: 1.05 }}
                  className={`glass-card p-4 text-center text-${room.color} hover:bg-white/5 transition-all`}
                >
                  <div className="flex justify-center mb-2">
                    {room.icon}
                  </div>
                  <h3 className="font-semibold text-sm">{room.name}</h3>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 relative">
      {/* Unity Container */}
      <div 
        ref={unityContainerRef}
        className={`absolute inset-0 ${isUnityVisible ? 'block' : 'hidden'}`}
        style={{ zIndex: isUnityVisible ? 10 : 0 }}
      />

      {/* Welcome Screen / Fallback UI */}
      {!isUnityVisible && (
        <div className="relative z-20 min-h-screen flex flex-col">
          {/* Hero Section */}
          <section className="flex-1 flex items-center justify-center px-4 py-20">
            <div className="max-w-6xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-4xl md:text-6xl font-orbitron font-bold mb-6">
                  <span className="neon-text text-neon-blue">Welcome to the</span>
                  <br />
                  <span className="bg-gradient-to-r from-neon-pink via-vegas-gold to-neon-green bg-clip-text text-transparent">
                    Fifth Dimension
                  </span>
                </h1>
                
                <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                  Hello, {user?.email}! You've entered a Vegas-style digital world. 
                  Choose how you'd like to explore.
                </p>

                {/* 3D World Option */}
                <div className="mb-12">
                  <motion.button
                    onClick={handleLoadUnity}
                    disabled={isLoading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-vegas text-xl px-8 py-4 flex items-center gap-3 mx-auto mb-4"
                  >
                    <Monitor className="w-6 h-6" />
                    {isLoading ? 'Loading 3D World...' : 'Enter 3D World'}
                  </motion.button>
                  <p className="text-sm text-gray-400">
                    Full immersive experience with Unity 3D graphics
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-gray-900 text-gray-400">or explore rooms directly</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Room Grid */}
          <section className="px-4 pb-20">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {rooms.map((room, index) => (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -10, scale: 1.02 }}
                    onClick={() => handleRoomSelect(room.id, room.route)}
                    className={`glass-card p-6 cursor-pointer transition-all duration-300 group hover:shadow-lg hover:shadow-${room.color}/25 ${
                      selectedRoom === room.id ? `ring-2 ring-${room.color}` : ''
                    }`}
                  >
                    <div className={`text-${room.color} mb-4 flex justify-center group-hover:animate-pulse`}>
                      {room.icon}
                    </div>
                    <h3 className="text-xl font-orbitron font-bold mb-3 text-white text-center">
                      {room.name}
                    </h3>
                    <p className="text-gray-300 text-sm text-center leading-relaxed">
                      {room.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm">
          <LoadingSpinner 
            fullScreen 
            size="lg" 
            text="Loading 3D World..." 
          />
        </div>
      )}

      {/* Unity UI Overlay (when Unity is loaded) */}
      {isUnityVisible && (
        <div className="absolute top-4 right-4 z-30">
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setUnityVisible(false)}
            className="btn-neon px-4 py-2 text-sm"
          >
            Exit 3D View
          </motion.button>
        </div>
      )}
    </div>
  )
}