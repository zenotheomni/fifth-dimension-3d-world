import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Heart, MessageCircle, Star, Zap, Crown, Flame } from 'lucide-react'
import { useSupabase } from '../contexts/SupabaseContext'
import { useAuth } from '../contexts/AuthContext'

interface CommunityMessage {
  id: string
  user_id: string
  message: string
  created_at: string
  likes: number
  user_name?: string
  user_level?: number
}

export const CommunityBoard: React.FC = () => {
  const { supabase } = useSupabase()
  const { user } = useAuth()
  const [messages, setMessages] = useState<CommunityMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [likedMessages, setLikedMessages] = useState<Set<string>>(new Set())

  // Vegas-style emojis and effects
  const vegasEmojis = ['🎰', '🎲', '💎', '🍸', '🎭', '💫', '✨', '🎪', '🎊', '🎉']
  const getRandomVegasEmoji = () => vegasEmojis[Math.floor(Math.random() * vegasEmojis.length)]

  const getLevelIcon = (level: number = 1) => {
    if (level >= 50) return <Crown className="w-4 h-4 text-yellow-400" />
    if (level >= 25) return <Flame className="w-4 h-4 text-orange-400" />
    if (level >= 10) return <Zap className="w-4 h-4 text-purple-400" />
    return <Star className="w-4 h-4 text-blue-400" />
  }

  const getLevelColor = (level: number = 1) => {
    if (level >= 50) return 'from-yellow-400 to-orange-500'
    if (level >= 25) return 'from-orange-400 to-red-500'
    if (level >= 10) return 'from-purple-400 to-pink-500'
    return 'from-blue-400 to-cyan-500'
  }

  useEffect(() => {
    fetchMessages()
    
    // Set up real-time subscription
    const channel = supabase
      .channel('community_messages')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'community_messages' 
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newMsg = payload.new as CommunityMessage
          setMessages(prev => [newMsg, ...prev])
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('community_messages')
        .select(`
          *,
          profiles:user_id (
            display_name,
            cosmic_level
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      const formattedMessages = data?.map(msg => ({
        ...msg,
        user_name: msg.profiles?.display_name || 'Anonymous Cosmic Traveler',
        user_level: msg.profiles?.cosmic_level || 1
      })) || []

      setMessages(formattedMessages)
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return

    try {
      const { error } = await supabase
        .from('community_messages')
        .insert([
          {
            user_id: user.id,
            message: newMessage.trim(),
            likes: 0
          }
        ])

      if (error) throw error

      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleLike = async (messageId: string) => {
    if (!user || likedMessages.has(messageId)) return

    try {
      // Update the message likes count
      const { error } = await supabase
        .from('community_messages')
        .update({ likes: messages.find(m => m.id === messageId)?.likes || 0 + 1 })
        .eq('id', messageId)

      if (error) throw error

      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, likes: msg.likes + 1 } : msg
      ))
      setLikedMessages(prev => new Set([...prev, messageId]))
    } catch (error) {
      console.error('Error liking message:', error)
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diff = now.getTime() - time.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
    return `${Math.floor(minutes / 1440)}d ago`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
      {/* Vegas-style background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-neon-pink/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-vegas-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-neon-blue/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-orbitron font-black mb-4">
            <span className="bg-gradient-to-r from-neon-pink via-vegas-gold to-neon-blue bg-clip-text text-transparent animate-neon-pulse">
              Community Board
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Share your cosmic journey with fellow dimension travelers {getRandomVegasEmoji()}
          </p>
        </motion.div>

        {/* Message Input */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="glass-card p-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full bg-gradient-to-r ${getLevelColor(1)} flex items-center justify-center`}>
                  {getLevelIcon(1)}
                </div>
                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Share your cosmic thoughts..."
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                    maxLength={280}
                  />
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-sm text-gray-400">
                      {newMessage.length}/280 characters
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="btn-vegas px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send to the Cosmos
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Messages Feed */}
        <div className="max-w-2xl mx-auto">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400">Loading cosmic messages...</p>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card p-6 mb-4 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full bg-gradient-to-r ${getLevelColor(message.user_level)} flex items-center justify-center flex-shrink-0`}>
                      {getLevelIcon(message.user_level)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-white">
                          {message.user_name}
                        </span>
                        <span className="text-xs text-gray-400">
                          Level {message.user_level}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(message.created_at)}
                        </span>
                      </div>
                      
                      <p className="text-gray-200 mb-3 leading-relaxed">
                        {message.message}
                      </p>
                      
                      <div className="flex items-center gap-4">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleLike(message.id)}
                          disabled={likedMessages.has(message.id)}
                          className={`flex items-center gap-1 text-sm transition-colors ${
                            likedMessages.has(message.id) 
                              ? 'text-red-400' 
                              : 'text-gray-400 hover:text-red-400'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${likedMessages.has(message.id) ? 'fill-current' : ''}`} />
                          <span>{message.likes}</span>
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          className="flex items-center gap-1 text-sm text-gray-400 hover:text-blue-400 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Reply</span>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {messages.length === 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">{getRandomVegasEmoji()}</div>
              <h3 className="text-xl font-bold text-white mb-2">No messages yet</h3>
              <p className="text-gray-400">Be the first to share something cosmic!</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}