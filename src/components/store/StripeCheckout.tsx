import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Loader2, CheckCircle } from 'lucide-react'
import { createCheckoutSession, CheckoutItem, formatPrice } from '../../lib/stripe'

interface StripeCheckoutProps {
  items: CheckoutItem[]
  onSuccess?: (sessionId: string) => void
  onCancel?: () => void
  className?: string
}

export const StripeCheckout: React.FC<StripeCheckoutProps> = ({
  items,
  onSuccess,
  onCancel,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const handleCheckout = async () => {
    try {
      setIsLoading(true)
      
      const session = await createCheckoutSession({
        items,
        successUrl: `${window.location.origin}/success`,
        cancelUrl: `${window.location.origin}/store`
      })

      // Simulate successful payment for demo
      setTimeout(() => {
        setIsLoading(false)
        setIsSuccess(true)
        onSuccess?.(session.sessionId)
      }, 2000)

    } catch (error) {
      console.error('Checkout error:', error)
      setIsLoading(false)
      alert('Payment failed. Please try again.')
    }
  }

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-green-500/20 border border-green-500/30 rounded-lg p-6 text-center ${className}`}
      >
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Payment Successful!</h3>
        <p className="text-green-300">Your digital music collection is being prepared.</p>
      </motion.div>
    )
  }

  return (
    <div className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 ${className}`}>
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <CreditCard className="w-5 h-5" />
        Checkout
      </h3>
      
      {/* Order Summary */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-3">Order Summary</h4>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-sm">
              <span className="text-gray-300">
                {item.name} x {item.quantity}
              </span>
              <span className="text-white font-semibold">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-white/20 mt-3 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-white">Total</span>
            <span className="text-lg font-bold text-vegas-gold">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {/* Payment Form (Mock) */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Card Number
          </label>
          <input
            type="text"
            placeholder="4242 4242 4242 4242"
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Expiry
            </label>
            <input
              type="text"
              placeholder="12/25"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              CVC
            </label>
            <input
              type="text"
              placeholder="123"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          onClick={handleCheckout}
          disabled={isLoading || items.length === 0}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-md font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Pay {formatPrice(total)}
            </>
          )}
        </button>
      </div>

      {/* Security Notice */}
      <div className="mt-4 text-xs text-gray-400 text-center">
        🔒 Your payment information is secure and encrypted
        <br />
        <span className="text-yellow-400">Demo Mode: No real payment will be processed</span>
      </div>
    </div>
  )
}