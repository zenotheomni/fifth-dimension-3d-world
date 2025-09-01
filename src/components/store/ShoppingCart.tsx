import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart as ShoppingCartIcon, X, Plus, Minus, Trash2, CreditCard } from 'lucide-react'
import type { Product } from '../../contexts/SupabaseContext'
import { StripeCheckout } from './StripeCheckout'
import { CheckoutItem } from '../../lib/stripe'

export interface CartItem extends Product {
  quantity: number
}

interface ShoppingCartProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemoveItem: (productId: string) => void
  onCheckout?: () => void
  className?: string
}

export const ShoppingCart: React.FC<ShoppingCartProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  className = ''
}) => {
  const [isAnimating, setIsAnimating] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)

  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0)
  const shipping = subtotal > 50 ? 0 : 5.99
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + shipping + tax

  const totalItems = items.reduce((total, item) => total + item.quantity, 0)

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      onRemoveItem(productId)
    } else {
      onUpdateQuantity(productId, newQuantity)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vinyl': return '💿'
      case 'cd': return '💽'
      case 'digital': return '🎵'
      case 'merchandise': return '🎁'
      default: return '🎼'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Cart Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed right-0 top-0 h-full w-full max-w-md bg-gradient-to-br from-gray-900 via-purple-900/50 to-black border-l border-purple-500/30 backdrop-blur-xl z-50 flex flex-col ${className}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-purple-500/20">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <ShoppingCartIcon className="w-6 h-6 text-purple-400" />
                  {totalItems > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                    >
                      {totalItems}
                    </motion.div>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white">Shopping Cart</h2>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="text-6xl mb-4 opacity-50">🛒</div>
                  <h3 className="text-xl font-bold text-white mb-2">Your cart is empty</h3>
                  <p className="text-gray-400 mb-6">
                    Discover amazing music and merchandise in our store!
                  </p>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-lg p-4 hover:border-purple-400/40 transition-all"
                      >
                        <div className="flex items-start space-x-3">
                          {/* Product Icon */}
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center text-2xl">
                            {getTypeIcon(item.type)}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white text-sm truncate">
                              {item.name}
                            </h4>
                            <p className="text-gray-400 text-xs truncate">
                              by {item.artist}
                            </p>
                            <p className="text-yellow-400 font-bold text-sm mt-1">
                              ${item.price.toFixed(2)}
                            </p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex flex-col items-end space-y-2">
                            <button
                              onClick={() => onRemoveItem(item.id)}
                              className="p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            
                            <div className="flex items-center border border-gray-600 rounded overflow-hidden">
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2 py-1 bg-gray-800 text-white text-xs min-w-[32px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            
                            <div className="text-purple-400 font-bold text-sm">
                              ${(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Free Shipping Notice */}
                  {subtotal < 50 && subtotal > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-3 text-center"
                    >
                      <p className="text-blue-400 text-sm">
                        Add ${(50 - subtotal).toFixed(2)} more for FREE shipping! 🚚
                      </p>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Checkout Section */}
            {items.length > 0 && (
              <div className="border-t border-purple-500/20 p-6 space-y-4">
                {/* Order Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-300 text-sm">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-300 text-sm">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? 'text-green-400' : ''}>
                      {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-gray-300 text-sm">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t border-gray-600 pt-2">
                    <div className="flex justify-between text-white font-bold text-lg">
                      <span>Total</span>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                {!showCheckout ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCheckout(true)}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Proceed to Checkout</span>
                  </motion.button>
                ) : (
                  <StripeCheckout
                    items={items.map(item => ({
                      id: item.id,
                      name: item.title,
                      price: Math.round(item.price * 100), // Convert to cents
                      quantity: item.quantity,
                      image: item.image_url || undefined
                    }))}
                    onSuccess={(sessionId) => {
                      console.log('Payment successful:', sessionId)
                      onCheckout?.()
                      setShowCheckout(false)
                      onClose()
                    }}
                    onCancel={() => setShowCheckout(false)}
                  />
                )}

                <div className="text-center text-xs text-gray-500">
                  🔒 Secure checkout powered by Stripe
                </div>
              </div>
            )}

            {/* Vegas Glow Effects */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-50" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}