import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Play, Pause, Star } from 'lucide-react'
import type { Product } from '../../contexts/SupabaseContext'

interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product, quantity: number) => void
  onToggleFavorite?: (productId: string) => void
  isFavorite?: boolean
  className?: string
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
  className = ''
}) => {
  const [quantity, setQuantity] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vinyl': return '💿'
      case 'cd': return '💽'
      case 'digital': return '🎵'
      case 'merchandise': return '🎁'
      default: return '🎼'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vinyl': return 'from-purple-500 to-pink-500'
      case 'cd': return 'from-blue-500 to-cyan-500'
      case 'digital': return 'from-green-500 to-emerald-500'
      case 'merchandise': return 'from-yellow-500 to-orange-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const renderVegasRating = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(10)].map((_, index) => (
          <Star
            key={index}
            className={`w-3 h-3 ${
              index < rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-600'
            }`}
          />
        ))}
        <span className="text-xs text-yellow-400 ml-1">{rating}/10</span>
      </div>
    )
  }

  const handlePlayPreview = () => {
    if (product.audio_preview_url) {
      setIsPlaying(!isPlaying)
      // In a real implementation, you'd handle audio playback here
      console.log(`${isPlaying ? 'Stopping' : 'Playing'} preview for ${product.name}`)
    }
  }

  const handleAddToCart = () => {
    onAddToCart?.(product, quantity)
  }

  const handleToggleFavorite = () => {
    onToggleFavorite?.(product.id)
  }

  const isInStock = product.stock_quantity === null || product.stock_quantity > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`product-card group relative bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-purple-500/30 rounded-xl overflow-hidden hover:border-purple-400/60 transition-all duration-300 ${className}`}
    >
      {/* Vegas Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        <div className={`w-full h-full bg-gradient-to-br ${getTypeColor(product.type)} opacity-20 flex items-center justify-center`}>
          <div className="text-6xl opacity-60">
            {getTypeIcon(product.type)}
          </div>
        </div>
        
        {/* Overlay Controls */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
          {product.audio_preview_url && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePlayPreview}
              className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleFavorite}
            className={`w-12 h-12 backdrop-blur-sm rounded-full flex items-center justify-center transition-all ${
              isFavorite 
                ? 'bg-red-500/80 text-white' 
                : 'bg-white/20 text-white hover:bg-red-500/50'
            }`}
          >
            <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
          </motion.button>
        </div>

        {/* Type Badge */}
        <div className={`absolute top-3 left-3 px-2 py-1 bg-gradient-to-r ${getTypeColor(product.type)} rounded-lg text-white text-xs font-bold uppercase tracking-wide`}>
          {product.type}
        </div>

        {/* Stock Status */}
        {!isInStock && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-red-600 rounded-lg text-white text-xs font-bold">
            OUT OF STOCK
          </div>
        )}

        {/* Vegas Rating */}
        {product.vegas_style_rating && (
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
            {renderVegasRating(product.vegas_style_rating)}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-bold text-lg text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
            {product.name}
          </h3>
          <p className="text-gray-300 text-sm font-medium">
            by {product.artist}
          </p>
          {product.genre && (
            <p className="text-gray-400 text-xs">
              {product.genre}
            </p>
          )}
        </div>

        {product.description && (
          <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Price and Controls */}
        <div className="flex items-center justify-between pt-2">
          <div className="price">
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              ${product.price.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Quantity Selector */}
            <div className="flex items-center border border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm transition-colors"
                disabled={!isInStock}
              >
                -
              </button>
              <span className="px-3 py-1 bg-gray-800 text-white text-sm min-w-[40px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm transition-colors"
                disabled={!isInStock}
              >
                +
              </button>
            </div>

            {/* Add to Cart Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              disabled={!isInStock}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 flex items-center space-x-2 ${
                isInStock
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{isInStock ? 'Add' : 'Sold Out'}</span>
            </motion.button>
          </div>
        </div>

        {/* Stock Info */}
        {isInStock && product.stock_quantity !== null && (
          <div className="text-xs text-gray-500 text-center">
            {product.stock_quantity} in stock
          </div>
        )}
      </div>

      {/* Vegas Sparkle Effect */}
      {isHovered && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-pink-400 rounded-full animate-ping animation-delay-300" />
          <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping animation-delay-600" />
        </div>
      )}
    </motion.div>
  )
}