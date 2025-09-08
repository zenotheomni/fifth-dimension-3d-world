import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Ticket, 
  CreditCard, 
  Shield, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle,
  QrCode,
  Download,
  Share2,
  AlertCircle,
  Star
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useSupabase } from '../../contexts/SupabaseContext'

interface TheatreEvent {
  id: string
  event_id: string
  title: string
  subtitle?: string
  start_at_iso: string
  end_at_iso: string
  access_mode: 'ticket_required' | 'invite_only' | 'public_free'
  max_capacity: number
  price?: number
  currency?: string
}

interface Ticket {
  id: string
  ticket_id: string
  event_id: string
  user_id: string
  type: 'free' | 'paid'
  price: number
  currency: string
  purchased_at_iso: string
  admit_from_iso?: string
  admit_until_iso?: string
  seat_label?: string
  transferable: boolean
  used_at_iso?: string
  qr_code_data?: string
  stripe_payment_intent_id?: string
  created_at: string
  updated_at: string
}

interface TicketingSystemProps {
  event: TheatreEvent
  onTicketPurchased?: (ticket: Ticket) => void
  onClose?: () => void
}

export const TicketingSystem: React.FC<TicketingSystemProps> = ({
  event,
  onTicketPurchased,
  onClose
}) => {
  const { user } = useAuth()
  const { supabase } = useSupabase()
  const [userTicket, setUserTicket] = useState<Ticket | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showQRCode, setShowQRCode] = useState(false)
  const [ticketCount, setTicketCount] = useState(1)
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Mock pricing tiers
  const pricingTiers = [
    { name: 'General Admission', price: event.access_mode === 'public_free' ? 0 : 25, description: 'Standard viewing experience' },
    { name: 'VIP', price: event.access_mode === 'public_free' ? 0 : 75, description: 'Premium seating + exclusive chat access' },
    { name: 'Backstage Pass', price: event.access_mode === 'public_free' ? 0 : 150, description: 'Meet & greet + signed merchandise' }
  ]

  const [selectedTier, setSelectedTier] = useState(pricingTiers[0])

  useEffect(() => {
    if (user && event.access_mode === 'ticket_required') {
      checkUserTicket()
    }
  }, [user, event])

  const checkUserTicket = async () => {
    try {
      setIsLoading(true)
      // In a real app, this would query the database
      // const { data, error } = await supabase
      //   .from('tickets')
      //   .select('*')
      //   .eq('event_id', event.id)
      //   .eq('user_id', user.id)
      //   .single()
      
      // Mock data for demo
      setUserTicket(null)
    } catch (error) {
      console.error('Error checking ticket:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePurchaseTicket = async () => {
    if (!user) {
      setError('Please sign in to purchase tickets')
      return
    }

    if (event.access_mode === 'public_free') {
      // Handle free ticket
      await createFreeTicket()
    } else {
      // Handle paid ticket
      await processPaidTicket()
    }
  }

  const createFreeTicket = async () => {
    try {
      setIsProcessing(true)
      setError(null)

      // In a real app, this would create a ticket in the database
      const mockTicket: Ticket = {
        id: Date.now().toString(),
        ticket_id: `FD-${Date.now()}`,
        event_id: event.id,
        user_id: user!.id,
        type: 'free',
        price: 0,
        currency: 'USD',
        purchased_at_iso: new Date().toISOString(),
        admit_from_iso: new Date(event.start_at_iso).toISOString(),
        admit_until_iso: new Date(event.end_at_iso).toISOString(),
        transferable: false,
        qr_code_data: `FD-${Date.now()}-${user!.id}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      setUserTicket(mockTicket)
      onTicketPurchased?.(mockTicket)
    } catch (error) {
      setError('Failed to create free ticket')
      console.error('Error creating free ticket:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const processPaidTicket = async () => {
    try {
      setIsProcessing(true)
      setError(null)

      // In a real app, this would integrate with Stripe
      // const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      //   body: {
      //     amount: selectedTier.price * ticketCount * 100, // Convert to cents
      //     currency: 'usd',
      //     event_id: event.id,
      //     user_id: user.id,
      //     ticket_count: ticketCount,
      //     tier: selectedTier.name
      //   }
      // })

      // Mock successful payment
      await new Promise(resolve => setTimeout(resolve, 2000))

      const mockTicket: Ticket = {
        id: Date.now().toString(),
        ticket_id: `FD-${Date.now()}`,
        event_id: event.id,
        user_id: user!.id,
        type: 'paid',
        price: selectedTier.price * ticketCount,
        currency: 'USD',
        purchased_at_iso: new Date().toISOString(),
        admit_from_iso: new Date(event.start_at_iso).toISOString(),
        admit_until_iso: new Date(event.end_at_iso).toISOString(),
        seat_label: selectedSeat || undefined,
        transferable: true,
        qr_code_data: `FD-${Date.now()}-${user!.id}`,
        stripe_payment_intent_id: `pi_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      setUserTicket(mockTicket)
      onTicketPurchased?.(mockTicket)
    } catch (error) {
      setError('Payment failed. Please try again.')
      console.error('Error processing payment:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const generateQRCode = (data: string) => {
    // In a real app, this would generate an actual QR code
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <text x="100" y="100" text-anchor="middle" font-family="monospace" font-size="12">${data}</text>
      </svg>
    `)}`
  }

  if (userTicket) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="bg-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center mb-6">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Ticket Confirmed!</h2>
            <p className="text-gray-300">Your ticket for {event.title} is ready</p>
          </div>

          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-white">{event.title}</h3>
                {event.subtitle && (
                  <p className="text-gray-300 text-sm">{event.subtitle}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Ticket ID</p>
                <p className="font-mono text-sm text-white">{userTicket.ticket_id}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Date & Time:</span>
                <span className="text-white">{formatDate(event.start_at_iso)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Type:</span>
                <span className="text-white capitalize">{userTicket.type}</span>
              </div>
              {userTicket.price > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Price:</span>
                  <span className="text-white">{formatPrice(userTicket.price)}</span>
                </div>
              )}
              {userTicket.seat_label && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Seat:</span>
                  <span className="text-white">{userTicket.seat_label}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setShowQRCode(!showQRCode)}
              className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition-colors"
            >
              <QrCode className="w-5 h-5" />
              {showQRCode ? 'Hide' : 'Show'} QR Code
            </button>

            {showQRCode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-white p-4 rounded-lg text-center"
              >
                <img 
                  src={generateQRCode(userTicket.qr_code_data || '')} 
                  alt="Ticket QR Code"
                  className="mx-auto mb-2"
                />
                <p className="text-xs text-gray-600">Scan at venue entrance</p>
              </motion.div>
            )}

            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                Download
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-colors">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-neon-pink hover:bg-neon-pink/80 text-white px-4 py-3 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Get Your Ticket</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Event Info */}
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-white text-lg mb-2">{event.title}</h3>
          {event.subtitle && (
            <p className="text-gray-300 mb-3">{event.subtitle}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDate(event.start_at_iso)}
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {event.max_capacity.toLocaleString()} capacity
            </div>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6 flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}

        {event.access_mode === 'public_free' ? (
          <div className="text-center">
            <div className="bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Free Event</span>
              </div>
              <p className="text-sm">No payment required. Click below to get your free ticket.</p>
            </div>
            
            <button
              onClick={handlePurchaseTicket}
              disabled={isProcessing}
              className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Ticket className="w-5 h-5" />
                  Get Free Ticket
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pricing Tiers */}
            <div>
              <h3 className="font-semibold text-white mb-4">Select Ticket Type</h3>
              <div className="space-y-3">
                {pricingTiers.map((tier, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedTier(tier)}
                    className={`w-full p-4 rounded-lg border-2 transition-all ${
                      selectedTier === tier
                        ? 'border-neon-pink bg-neon-pink/10'
                        : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-white">{tier.name}</h4>
                          {tier.name === 'VIP' && <Star className="w-4 h-4 text-yellow-400" />}
                        </div>
                        <p className="text-sm text-gray-400">{tier.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-white">{formatPrice(tier.price)}</p>
                        <p className="text-xs text-gray-400">per ticket</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="font-semibold text-white mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                  className="w-10 h-10 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center transition-colors"
                >
                  -
                </button>
                <span className="text-white font-semibold text-lg">{ticketCount}</span>
                <button
                  onClick={() => setTicketCount(Math.min(4, ticketCount + 1))}
                  className="w-10 h-10 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center transition-colors"
                >
                  +
                </button>
                <span className="text-gray-400 text-sm">(Max 4 per person)</span>
              </div>
            </div>

            {/* Total */}
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-white font-semibold">Total</span>
                <span className="text-2xl font-bold text-neon-pink">
                  {formatPrice(selectedTier.price * ticketCount)}
                </span>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePurchaseTicket}
              disabled={isProcessing || !user}
              className="w-full bg-neon-pink hover:bg-neon-pink/80 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing Payment...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Purchase Tickets
                </>
              )}
            </button>

            {!user && (
              <p className="text-center text-gray-400 text-sm">
                Please sign in to purchase tickets
              </p>
            )}

            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <Shield className="w-4 h-4" />
              Secure payment powered by Stripe
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
