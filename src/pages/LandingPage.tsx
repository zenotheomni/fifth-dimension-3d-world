import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Music, Gamepad2, Users, Radio, Star, ArrowDown } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { InteractiveSplashScene } from '../components/3d/InteractiveSplashScene'

export const LandingPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [currentFeature, setCurrentFeature] = useState(0)
  const [sceneLoaded, setSceneLoaded] = useState(false)

  const features = [
    {
      icon: <Music className="w-8 h-8" />,
      title: "Record Store",
      description: "Discover and purchase vinyl, CDs, and digital music from emerging and established artists",
      color: "text-neon-pink"
    },
    {
      icon: <Gamepad2 className="w-8 h-8" />,
      title: "Arcade Games",
      description: "Play immersive 3D games, compete on leaderboards, and earn rewards",
      color: "text-neon-blue"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community Board",
      description: "Connect with other users, share experiences, and join discussions",
      color: "text-neon-green"
    },
    {
      icon: <Radio className="w-8 h-8" />,
      title: "Live Ballroom",
      description: "Experience live streams, concerts, and interactive events in real-time",
      color: "text-vegas-gold"
    }
  ]

  useEffect(() => {
    // Auto-rotate features every 4 seconds
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [features.length])

  useEffect(() => {
    // Redirect to world if already authenticated or in dev mode
    if (user || import.meta.env.DEV) {
      navigate('/world')
    }
  }, [user, navigate])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Interactive 3D Background Scene */}
      <InteractiveSplashScene 
        onSceneLoaded={() => setSceneLoaded(true)}
        className="absolute inset-0"
      />
      
      {/* Content Overlay with improved readability */}
      <div className="relative z-20">
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60 pointer-events-none"></div>
        
        {/* Main content */}
        <div className="relative z-10">
        {/* Hero section */}
        <section className="pt-20 pb-32 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <h1 className="text-6xl md:text-8xl font-orbitron font-black mb-6">
                <span className="bg-gradient-to-r from-neon-pink via-vegas-gold to-neon-blue bg-clip-text text-transparent animate-neon-pulse">
                  FIFTH
                </span>
                <br />
                <span className="bg-gradient-to-r from-neon-blue via-neon-green to-neon-pink bg-clip-text text-transparent animate-neon-pulse" style={{ animationDelay: '1s' }}>
                  DIMENSION
                </span>
              </h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: sceneLoaded ? 1 : 0.5 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="text-xl md:text-2xl text-white mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-lg"
              >
                Enter a Vegas-style 3D world where music, gaming, and community collide. 
                <br />
                <span className="text-purple-300">Experience the future of digital entertainment in an interactive dimension.</span>
              </motion.p>

              {/* Scene interaction hint */}
              {sceneLoaded && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2, duration: 1 }}
                  className="mb-8"
                >
                  <p className="text-cyan-300 text-sm animate-pulse">
                    🖱️ Drag to explore • ✨ Move your mouse for magic
                  </p>
                </motion.div>
              )}

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link 
                  to="/auth" 
                  className="btn-vegas flex items-center gap-3 text-lg px-8 py-4"
                >
                  <Play className="w-6 h-6" />
                  Enter the Dimension
                </Link>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 text-gray-400"
                >
                  <Star className="w-5 h-5 text-vegas-gold" />
                  <span>Free to explore</span>
                </motion.div>
              </div>
              
              {/* Scroll indicator */}
              {sceneLoaded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 3, duration: 1 }}
                  className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                >
                  <div className="flex flex-col items-center text-white/60">
                    <span className="text-sm mb-2">Explore the Dimension</span>
                    <ArrowDown className="w-6 h-6 animate-bounce" />
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Features section with glassmorphism */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-orbitron font-bold mb-6 neon-text text-neon-blue">
                Explore Four Unique Worlds
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Each space offers a different experience, from shopping for music to competing in games
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className={`glass-card p-6 text-center cursor-pointer transition-all duration-300 ${
                    currentFeature === index ? 'ring-2 ring-neon-blue shadow-lg shadow-neon-blue/25' : ''
                  }`}
                  onClick={() => setCurrentFeature(index)}
                >
                  <div className={`${feature.color} mb-4 flex justify-center`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-orbitron font-bold mb-3 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Feature spotlight */}
            <motion.div
              key={currentFeature}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mt-16 glass-card p-8 text-center"
            >
              <div className={`${features[currentFeature].color} mb-4 flex justify-center`}>
                <div className="p-4 rounded-full bg-white/10">
                  {React.cloneElement(features[currentFeature].icon, { className: 'w-12 h-12' })}
                </div>
              </div>
              <h3 className="text-3xl font-orbitron font-bold mb-4 text-white">
                {features[currentFeature].title}
              </h3>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                {features[currentFeature].description}
              </p>
            </motion.div>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="glass-card p-12"
            >
              <h2 className="text-4xl font-orbitron font-bold mb-6 neon-text text-neon-pink">
                Ready to Enter?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join thousands of users already exploring the Fifth Dimension
              </p>
              <Link 
                to="/auth" 
                className="btn-neon text-lg px-8 py-4 inline-flex items-center gap-3"
              >
                <Play className="w-6 h-6" />
                Start Your Journey
              </Link>
            </motion.div>
          </div>
        </section>
        </div>
      </div>
    </div>
  )
}