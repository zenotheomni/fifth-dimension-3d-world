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
  Settings,
  MessageCircle,
  Clock,
  Ticket,
  Shield,
  Crown,
  Zap,
  Eye,
  EyeOff,
  BarChart3
} from 'lucide-react'
import { useSupabase } from '../contexts/SupabaseContext'
import { useAuth } from '../contexts/AuthContext'
import { VideoPlayer } from '../components/venue5/VideoPlayer'
import { TicketingSystem } from '../components/venue5/TicketingSystem'
import { AdvancedTicketingSystem } from '../components/venue5/AdvancedTicketingSystem'
import { AuthModal } from '../components/venue5/AuthModal'
import { EventManager } from '../components/venue5/EventManager'
import { ModerationPanel } from '../components/venue5/ModerationPanel'
import { AnalyticsDashboard } from '../components/venue5/AnalyticsDashboard'
import { theatreApi, TheatreEvent, TheatreTicket, ChatMessage } from '../services/theatreApi'

// Use types from theatreApi service
type Ticket = TheatreTicket;
type TheatreChatMessage = ChatMessage & {
  user_name?: string
  user_level?: number
  user_badge?: 'Host' | 'Mod' | 'Artist' | 'VIP'
}

export const Venue5: React.FC = () => {
  const { supabase } = useSupabase()
  const { user } = useAuth()
  const [currentEvent, setCurrentEvent] = useState<TheatreEvent | null>(null)
  const [userTicket, setUserTicket] = useState<Ticket | null>(null)
  const [chatMessages, setChatMessages] = useState<TheatreChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(100)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [viewerCount, setViewerCount] = useState(0)
  const [guestUsername, setGuestUsername] = useState('')
  const [showGuestModal, setShowGuestModal] = useState(false)
  const [layoutMode, setLayoutMode] = useState<'fullscreen' | 'three_quarter'>('three_quarter')
  const [isSlowMode, setIsSlowMode] = useState(false)
  const [slowModeDelay, setSlowModeDelay] = useState(0)
  const [showTicketing, setShowTicketing] = useState(false)
  const [useAdvancedTicketing, setUseAdvancedTicketing] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showCaptions, setShowCaptions] = useState(false)
  
  // New state for additional features
  const [showAuth, setShowAuth] = useState(false)
  const [showEventManager, setShowEventManager] = useState(false)
  const [showModeration, setShowModeration] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)
  const lastMessageTime = useRef<number>(0)

  // Mock events for demo - in real app, fetch from database
  const mockEvents: TheatreEvent[] = [
    {
      id: '1',
      event_id: 'fd-theatre-0001',
      title: 'ZENO RELOADED Live',
      subtitle: 'Immersive Concert Stream',
      description_md: 'Join us for an interdimensional music experience featuring the legendary ZENO RELOADED in a never-before-seen virtual performance.',
      start_at_iso: '2025-12-13T01:00:00Z',
      end_at_iso: '2025-12-13T02:30:00Z',
      visibility: 'listed',
      age_restriction: '13+',
      tags: ['concert', 'hip-hop', 'fifth-dimension'],
      poster_image_url: 'https://images.unsplash.com/photo-1571266028243-d220bc560fdd?w=600&h=400&fit=crop',
      access_mode: 'ticket_required',
      max_capacity: 5000,
      record_vod: true,
      enable_drm: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      event_id: 'fd-theatre-0002',
      title: 'Vegas Nights: Casino Culture Deep Dive',
      subtitle: 'Interactive Documentary',
      description_md: 'Exploring the glittering world of casino culture with live Q&A and behind-the-scenes footage.',
      start_at_iso: '2025-12-15T20:00:00Z',
      end_at_iso: '2025-12-15T21:30:00Z',
      visibility: 'listed',
      age_restriction: '18+',
      tags: ['documentary', 'casino', 'culture'],
      poster_image_url: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=600&h=400&fit=crop',
      access_mode: 'public_free',
      max_capacity: 3000,
      record_vod: true,
      enable_drm: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]

  const checkAuthentication = async () => {
    const token = localStorage.getItem('theatre_token')
    const userData = localStorage.getItem('theatre_user')
    
    if (token && userData) {
      try {
        const response = await fetch('http://localhost:4000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setCurrentUser(data.user)
          setIsAuthenticated(true)
        } else {
          // Token expired or invalid
          localStorage.removeItem('theatre_token')
          localStorage.removeItem('theatre_user')
        }
      } catch (err) {
        console.error('Auth check failed:', err)
        localStorage.removeItem('theatre_token')
        localStorage.removeItem('theatre_user')
      }
    }
  }

  const handleAuthSuccess = (user: any) => {
    setCurrentUser(user)
    setIsAuthenticated(true)
    setShowAuth(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('theatre_token')
    localStorage.removeItem('theatre_user')
    setCurrentUser(null)
    setIsAuthenticated(false)
  }

  useEffect(() => {
    // Set default event
    setCurrentEvent(mockEvents[0])
    setViewerCount(1247)
    checkAuthentication()
    
    // Simulate viewer count changes
    const interval = setInterval(() => {
      setViewerCount(prev => prev + Math.floor(Math.random() * 10) - 5)
    }, 5000)

    // Set up real-time chat for theatre events
    const channel = supabase
      .channel('venue5_chat')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'theatre_chat_messages'
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newMsg = payload.new as TheatreChatMessage
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
    if (!newMessage.trim()) return

    // Check slow mode
    const now = Date.now()
    if (isSlowMode && now - lastMessageTime.current < slowModeDelay * 1000) {
      return
    }

    try {
      const messageData = {
        event_id: currentEvent?.id,
        user_id: user?.id || 'guest',
        message: newMessage.trim(),
        message_type: 'message' as const
      }

      // In a real app, this would save to the database
      const mockMessage: TheatreChatMessage = {
        id: Date.now().toString(),
        event_id: currentEvent?.id || '',
        user_id: user?.id || 'guest',
        message: newMessage.trim(),
        message_type: 'message',
        is_pinned: false,
        created_at: new Date().toISOString(),
        user_name: user?.email?.split('@')[0] || guestUsername || 'Anonymous',
        user_level: Math.floor(Math.random() * 50) + 1,
        user_badge: Math.random() > 0.9 ? 'VIP' : undefined
      }

      setChatMessages(prev => [...prev, mockMessage])
      setNewMessage('')
      lastMessageTime.current = now
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

  const getBadgeColor = (badge?: string) => {
    switch (badge) {
      case 'Host': return 'bg-red-500 text-white'
      case 'Mod': return 'bg-green-500 text-white'
      case 'Artist': return 'bg-purple-500 text-white'
      case 'VIP': return 'bg-yellow-500 text-black'
      default: return 'bg-gray-500 text-white'
    }
  }

  const formatTimeUntilEvent = (startTime: string) => {
    const now = new Date()
    const start = new Date(startTime)
    const diff = start.getTime() - now.getTime()
    
    if (diff <= 0) return 'Live Now'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const canAccessEvent = () => {
    if (!currentEvent) return false
    if (currentEvent.access_mode === 'public_free') return true
    if (currentEvent.access_mode === 'ticket_required') return userTicket !== null
    return false
  }

  const handleTicketPurchased = (ticket: Ticket) => {
    setUserTicket(ticket)
    setShowTicketing(false)
  }

  const handleSeek = (time: number) => {
    setCurrentTime(time)
    if (videoRef.current) {
      videoRef.current.currentTime = time
    }
  }

  if (!currentEvent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neon-pink mx-auto mb-4"></div>
          <p className="text-xl">Loading Venue 5...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
      {/* Vegas-style background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-20 w-96 h-96 bg-neon-pink/3 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 right-20 w-80 h-80 bg-vegas-gold/3 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-neon-blue/3 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10">
        {/* Header Region */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/20 backdrop-blur-sm border-b border-white/10 p-4"
        >
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-orbitron font-bold">
                <span className="bg-gradient-to-r from-neon-pink via-vegas-gold to-neon-blue bg-clip-text text-transparent">
                  Venue 5
                </span>
              </h1>
              <div className="h-6 w-px bg-white/20"></div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">
                  {formatTimeUntilEvent(currentEvent.start_at_iso)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-full">
                <Users className="w-4 h-4" />
                <span className="text-sm">{formatViewerCount(viewerCount)}</span>
              </div>
              
              {currentEvent.access_mode === 'ticket_required' && (
                <div className="flex items-center gap-2">
                  {userTicket ? (
                    <div className="flex items-center gap-2 bg-green-500/20 text-green-300 px-3 py-1 rounded-full">
                      <Ticket className="w-4 h-4" />
                      <span className="text-sm">Ticket Valid</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-red-500/20 text-red-300 px-3 py-1 rounded-full">
                      <Ticket className="w-4 h-4" />
                      <span className="text-sm">Ticket Required</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Authentication */}
              {!isAuthenticated ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setShowAuth(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Sign In
                </motion.button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-300">{currentUser?.display_name}</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handleLogout}
                    className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
                  >
                    Logout
                  </motion.button>
                </div>
              )}

              {/* Feature Buttons */}
              {isAuthenticated && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setShowEventManager(true)}
                    className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                    title="Event Manager"
                  >
                    <Settings className="w-4 h-4" />
                  </motion.button>
                  
                  {(currentUser?.role === 'admin' || currentUser?.role === 'moderator') && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setShowModeration(true)}
                      className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                      title="Moderation Panel"
                    >
                      <Shield className="w-4 h-4" />
                    </motion.button>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setShowAnalytics(true)}
                    className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                    title="Analytics Dashboard"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </motion.button>
                </>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setLayoutMode(layoutMode === 'fullscreen' ? 'three_quarter' : 'fullscreen')}
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                {layoutMode === 'fullscreen' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className={`container mx-auto px-4 py-6 ${layoutMode === 'fullscreen' ? 'grid grid-cols-1' : 'grid grid-cols-1 lg:grid-cols-4 gap-6'}`}>
          {/* Stage Region */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className={layoutMode === 'fullscreen' ? 'col-span-1' : 'lg:col-span-3'}
          >
            <div className="glass-card overflow-hidden">
              {/* Video Player */}
              {canAccessEvent() ? (
                <VideoPlayer
                  streamUrl={currentEvent.trailer_video_url}
                  isLive={true}
                  isPlaying={isPlaying}
                  isMuted={isMuted}
                  volume={volume}
                  isFullscreen={isFullscreen}
                  onPlayPause={() => setIsPlaying(!isPlaying)}
                  onMuteToggle={() => setIsMuted(!isMuted)}
                  onVolumeChange={setVolume}
                  onFullscreenToggle={() => setIsFullscreen(!isFullscreen)}
                  onSeek={handleSeek}
                  currentTime={currentTime}
                  duration={duration}
                  showCaptions={showCaptions}
                  onCaptionsToggle={() => setShowCaptions(!showCaptions)}
                  enableDRM={currentEvent.enable_drm}
                  className="aspect-video"
                />
              ) : (
                <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-center">
                      <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">Access Required</h3>
                      <p className="text-gray-300 mb-4">
                        {currentEvent.access_mode === 'ticket_required' 
                          ? 'A valid ticket is required to view this event'
                          : 'This event is invite-only'
                        }
                      </p>
                      {currentEvent.access_mode === 'ticket_required' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          onClick={() => setShowTicketing(true)}
                          className="btn-vegas px-6 py-2"
                        >
                          Get Ticket
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Event Info */}
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2">{currentEvent.title}</h2>
                {currentEvent.subtitle && (
                  <p className="text-lg text-gray-300 mb-2">{currentEvent.subtitle}</p>
                )}
                <p className="text-gray-300 mb-4">{currentEvent.description_md}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                      {currentEvent.tags.map((tag, index) => (
                        <span key={index} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Age: {currentEvent.age_restriction}</span>
                    {currentEvent.enable_drm && (
                      <Crown className="w-4 h-4 text-yellow-400" title="DRM Protected" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sidebar Region */}
          {layoutMode === 'three_quarter' && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="glass-card h-[600px] flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      Live Chat
                    </h3>
                    {isSlowMode && (
                      <div className="flex items-center gap-1 text-xs text-yellow-400">
                        <Zap className="w-3 h-3" />
                        Slow Mode
                      </div>
                    )}
                  </div>
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
                        className={`flex items-start gap-2 ${message.is_pinned ? 'bg-yellow-500/10 border-l-2 border-yellow-500 pl-2' : ''}`}
                      >
                        <div className={`w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                          {message.user_name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-semibold text-sm ${getLevelColor(message.user_level)}`}>
                              {message.user_name}
                            </span>
                            {message.user_badge && (
                              <span className={`text-xs px-1 py-0.5 rounded ${getBadgeColor(message.user_badge)}`}>
                                {message.user_badge}
                              </span>
                            )}
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
                {canAccessEvent() ? (
                  <div className="p-4 border-t border-white/10">
                    {!user && !guestUsername && (
                      <div className="mb-3">
                        <button
                          onClick={() => setShowGuestModal(true)}
                          className="w-full text-sm text-center text-gray-400 hover:text-white transition-colors"
                        >
                          Join as guest to chat
                        </button>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder={isSlowMode ? "Slow mode active..." : "Say something cosmic..."}
                        disabled={isSlowMode && Date.now() - lastMessageTime.current < slowModeDelay * 1000}
                        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                        maxLength={200}
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || (isSlowMode && Date.now() - lastMessageTime.current < slowModeDelay * 1000)}
                        className="btn-vegas px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border-t border-white/10 text-center">
                    <p className="text-sm text-gray-400 mb-2">Access required to chat</p>
                    <button className="btn-neon text-sm px-4 py-2">
                      Get Access
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer Region */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/20 backdrop-blur-sm border-t border-white/10 p-4"
        >
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="text-sm text-gray-400 hover:text-white transition-colors">
                Help
              </button>
              <button className="text-sm text-gray-400 hover:text-white transition-colors">
                Report Issue
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">
                Venue 5 • Fifth Dimension
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Guest Username Modal */}
      <AnimatePresence>
        {showGuestModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowGuestModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">Join as Guest</h3>
              <p className="text-gray-300 mb-4">
                Choose a username to participate in the chat (3-20 characters, letters, numbers, and underscores only).
              </p>
              <input
                type="text"
                value={guestUsername}
                onChange={(e) => setGuestUsername(e.target.value.replace(/[^A-Za-z0-9_]/g, ''))}
                placeholder="Enter username..."
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
                maxLength={20}
                minLength={3}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowGuestModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (guestUsername.length >= 3) {
                      setShowGuestModal(false)
                    }
                  }}
                  disabled={guestUsername.length < 3}
                  className="flex-1 btn-vegas disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Join
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ticketing System Modal */}
      {showTicketing && currentEvent && (
        useAdvancedTicketing ? (
          <AdvancedTicketingSystem
            event={currentEvent}
            onTicketPurchased={handleTicketPurchased}
            onClose={() => setShowTicketing(false)}
            currentUser={currentUser}
          />
        ) : (
          <TicketingSystem
            event={currentEvent}
            onTicketPurchased={handleTicketPurchased}
            onClose={() => setShowTicketing(false)}
          />
        )
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onAuthSuccess={handleAuthSuccess}
        mode="login"
      />

      {/* Event Manager Modal */}
      {showEventManager && currentEvent && (
        <EventManager
          isOpen={showEventManager}
          onClose={() => setShowEventManager(false)}
          onEventCreated={(event) => {
            console.log('Event created:', event)
            setShowEventManager(false)
          }}
          onEventUpdated={(event) => {
            console.log('Event updated:', event)
            setShowEventManager(false)
          }}
          onEventDeleted={(eventId) => {
            console.log('Event deleted:', eventId)
            setShowEventManager(false)
          }}
          currentUser={currentUser}
        />
      )}

      {/* Moderation Panel Modal */}
      {showModeration && currentEvent && (
        <ModerationPanel
          isOpen={showModeration}
          onClose={() => setShowModeration(false)}
          eventId={currentEvent.id}
          currentUser={currentUser}
          chatMessages={chatMessages}
          onMessageDeleted={(messageId) => {
            setChatMessages(prev => prev.filter(msg => msg.id !== messageId))
          }}
          onUserMuted={(userId, duration) => {
            console.log(`User ${userId} muted for ${duration} minutes`)
          }}
          onUserBanned={(userId, reason, isPermanent) => {
            console.log(`User ${userId} banned: ${reason} (permanent: ${isPermanent})`)
          }}
        />
      )}

      {/* Analytics Dashboard Modal */}
      {showAnalytics && currentEvent && (
        <AnalyticsDashboard
          isOpen={showAnalytics}
          onClose={() => setShowAnalytics(false)}
          eventId={currentEvent.id}
          currentUser={currentUser}
        />
      )}
    </div>
  )
}
