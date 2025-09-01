import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Users, 
  Send, 
  Heart, 
  Star,
  Radio,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Settings
} from 'lucide-react'
import { useSupabase } from '../contexts/SupabaseContext'
import { useAuth } from '../contexts/AuthContext'

interface StreamChat {
  id: string
  user_id: string
  message: string
  created_at: string
  user_name?: string
  user_level?: number
}

interface LiveStream {
  id: string
  title: string
  description: string
  thumbnail: string
  viewer_count: number
  is_live: boolean
  streamer_name: string
  category: string
}

export const Ballroom: React.FC = () => {
  const { supabase } = useSupabase()
  const { user } = useAuth()
  const [currentStream, setCurrentStream] = useState<LiveStream | null>(null)
  const [chatMessages, setChatMessages] = useState<StreamChat[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(100)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [viewerCount, setViewerCount] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)

  // Mock streams for demo
  const mockStreams: LiveStream[] = [
    {
      id: '1',
      title: 'Fifth Dimension Live: Cosmic Beats & Neon Dreams',
      description: 'Join us for an interdimensional music experience',
      thumbnail: 'https://images.unsplash.com/photo-1571266028243-d220bc560fdd?w=600&h=400&fit=crop',
      viewer_count: 1247,
      is_live: true,
      streamer_name: 'CosmicDJ_Nova',
      category: 'Music & Performance'
    },
    {
      id: '2', 
      title: 'Vegas Nights: Casino Culture Deep Dive',
      description: 'Exploring the glittering world of casino culture',
      thumbnail: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=600&h=400&fit=crop',
      viewer_count: 892,
      is_live: true,
      streamer_name: 'VegasVirtuoso',
      category: 'Talk & Discussion'
    }
  ]

  useEffect(() => {
    // Set default stream
    setCurrentStream(mockStreams[0])
    setViewerCount(mockStreams[0].viewer_count)
    
    // Simulate viewer count changes
    const interval = setInterval(() => {
      setViewerCount(prev => prev + Math.floor(Math.random() * 10) - 5)
    }, 5000)

    // Set up real-time chat
    const channel = supabase
      .channel('ballroom_chat')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'stream_chat'
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newMsg = payload.new as StreamChat
          setChatMessages(prev => [...prev, newMsg])
          scrollToBottom()
        }
      })
      .subscribe()

    return () => {
      clearInterval(interval)
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return

    try {
      // In a real app, this would save to the database
      const mockMessage: StreamChat = {
        id: Date.now().toString(),
        user_id: user.id,
        message: newMessage.trim(),
        created_at: new Date().toISOString(),
        user_name: user.email?.split('@')[0] || 'Anonymous',
        user_level: Math.floor(Math.random() * 50) + 1
      }

      setChatMessages(prev => [...prev, mockMessage])
      setNewMessage('')
      scrollToBottom()
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const formatViewerCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  const getLevelColor = (level: number = 1) => {
    if (level >= 50) return 'text-yellow-400'
    if (level >= 25) return 'text-orange-400' 
    if (level >= 10) return 'text-purple-400'
    return 'text-blue-400'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
      {/* Vegas-style background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-20 w-96 h-96 bg-neon-pink/3 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 right-20 w-80 h-80 bg-vegas-gold/3 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-neon-blue/3 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-orbitron font-black mb-4">
            <span className="bg-gradient-to-r from-neon-pink via-vegas-gold to-neon-blue bg-clip-text text-transparent animate-neon-pulse">
              The Ballroom
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Live streaming from the heart of the Fifth Dimension 🎭✨
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Stream Area */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="glass-card overflow-hidden">
              {/* Video Player */}
              <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
                {/* Mock Video Stream */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-500/20 to-blue-600/20">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
                        <Radio className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">Live Stream</h3>
                      <p className="text-gray-300">Cosmic Beats Broadcasting...</p>
                    </div>
                  </div>
                  
                  {/* Live indicator */}
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    LIVE
                  </div>
                  
                  {/* Viewer count */}
                  <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {formatViewerCount(viewerCount)}
                  </div>
                </div>

                {/* Video Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                      >
                        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                      </motion.button>
                      
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => setIsMuted(!isMuted)}
                          className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                        >
                          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </motion.button>
                        
                        <div className="w-20 h-1 bg-white/20 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-white transition-all"
                            style={{ width: `${isMuted ? 0 : volume}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                      <Maximize className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </div>
              
              {/* Stream Info */}
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2">{currentStream?.title}</h2>
                <p className="text-gray-300 mb-4">{currentStream?.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="font-bold text-lg">
                        {currentStream?.streamer_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{currentStream?.streamer_name}</h3>
                      <p className="text-sm text-gray-400">{currentStream?.category}</p>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="btn-vegas px-6 py-2"
                  >
                    Follow
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Chat Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="glass-card h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Live Chat
                </h3>
                <p className="text-sm text-gray-400">
                  {formatViewerCount(viewerCount)} viewers
                </p>
              </div>
              
              {/* Chat Messages */}
              <div 
                ref={chatRef}
                className="flex-1 overflow-y-auto p-4 space-y-3"
              >
                <AnimatePresence>
                  {chatMessages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex items-start gap-2"
                    >
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                        {message.user_name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-semibold text-sm ${getLevelColor(message.user_level)}`}>
                            {message.user_name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {message.user_level && `L${message.user_level}`}
                          </span>
                        </div>
                        <p className="text-sm text-gray-200 break-words">
                          {message.message}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {chatMessages.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Chat will appear here</p>
                    <p className="text-xs">Be the first to say something!</p>
                  </div>
                )}
              </div>
              
              {/* Chat Input */}
              {user ? (
                <div className="p-4 border-t border-white/10">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Say something cosmic..."
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      maxLength={200}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="btn-vegas px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="p-4 border-t border-white/10 text-center">
                  <p className="text-sm text-gray-400 mb-2">Join the conversation</p>
                  <button className="btn-neon text-sm px-4 py-2">
                    Sign In to Chat
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Other Live Streams */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <h2 className="text-2xl font-bold mb-6">Other Live Streams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockStreams.slice(1).map((stream) => (
              <motion.div
                key={stream.id}
                whileHover={{ scale: 1.02 }}
                className="glass-card overflow-hidden cursor-pointer"
                onClick={() => setCurrentStream(stream)}
              >
                <div className="relative">
                  <img 
                    src={stream.thumbnail} 
                    alt={stream.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                    LIVE
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    {formatViewerCount(stream.viewer_count)}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold mb-2 line-clamp-2">{stream.title}</h3>
                  <p className="text-sm text-gray-400 mb-2">{stream.streamer_name}</p>
                  <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                    {stream.category}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}