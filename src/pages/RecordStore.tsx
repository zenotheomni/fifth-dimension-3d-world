import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart as ShoppingCartIcon, Search, Filter, SortAsc } from 'lucide-react'
import { useSupabase } from '../contexts/SupabaseContext'
import { ProductCard } from '../components/store/ProductCard'
import { ShoppingCart as Cart, CartItem } from '../components/store/ShoppingCart'
import type { Product } from '../contexts/SupabaseContext'

export const RecordStore: React.FC = () => {
  const { supabase } = useSupabase()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'vegas_style_rating'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [availableGenres, setAvailableGenres] = useState<string[]>([])
  const [availableTypes, setAvailableTypes] = useState<string[]>([])

  useEffect(() => {
    loadProducts()
  }, [sortBy, sortOrder])

  useEffect(() => {
    if (products.length > 0) {
      const genres = [...new Set(products.map(p => p.genre).filter(Boolean))] as string[]
      const types = [...new Set(products.map(p => p.type))]
      setAvailableGenres(genres)
      setAvailableTypes(types)
    }
  }, [products])

  const loadProducts = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order(sortBy, { ascending: sortOrder === 'asc' })

      const { data, error } = await query

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  // Cart Management
  const handleAddToCart = (product: Product, quantity: number) => {
    const existingItem = cartItems.find(item => item.id === product.id)
    
    if (existingItem) {
      setCartItems(cartItems.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ))
    } else {
      setCartItems([...cartItems, { ...product, quantity }])
    }
  }

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    setCartItems(cartItems.map(item => 
      item.id === productId 
        ? { ...item, quantity }
        : item
    ))
  }

  const handleRemoveFromCart = (productId: string) => {
    setCartItems(cartItems.filter(item => item.id !== productId))
  }

  const handleToggleFavorite = (productId: string) => {
    if (favorites.includes(productId)) {
      setFavorites(favorites.filter(id => id !== productId))
    } else {
      setFavorites([...favorites, productId])
    }
  }

  const handleCheckout = () => {
    console.log('Proceeding to checkout with items:', cartItems)
    // In a real implementation, this would integrate with Stripe
    alert('Checkout functionality will be implemented with Stripe integration!')
  }

  // Filtering and Sorting
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.genre?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

    const matchesGenre = selectedGenre === 'all' || product.genre === selectedGenre
    const matchesType = selectedType === 'all' || product.type === selectedType

    return matchesSearch && matchesGenre && matchesType
  })

  const totalCartItems = cartItems.reduce((total, item) => total + item.quantity, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-orbitron font-bold mb-4 neon-text text-neon-pink">
            🎵 Fifth Dimension Record Store 🎵
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover Vegas-style music and merchandise from artists across the dimensions
          </p>
        </motion.div>

        {/* Search and Controls */}
        <div className="space-y-4 mb-8">
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search music, artists, genres, or merchandise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
            />
          </div>

          {/* Filters and Cart */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center">
              {/* Genre Filter */}
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="bg-gray-800 border border-purple-500/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="all">All Genres</option>
                {availableGenres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>

              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-gray-800 border border-purple-500/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="all">All Types</option>
                {availableTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>

              {/* Sort Options */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-')
                  setSortBy(field as 'name' | 'price' | 'vegas_style_rating')
                  setSortOrder(order as 'asc' | 'desc')
                }}
                className="bg-gray-800 border border-purple-500/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="price-asc">Price Low-High</option>
                <option value="price-desc">Price High-Low</option>
                <option value="vegas_style_rating-desc">Vegas Rating</option>
              </select>
            </div>

            {/* Cart Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCartOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center space-x-2 relative"
            >
              <ShoppingCartIcon className="w-5 h-5" />
              <span>Cart</span>
              {totalCartItems > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
                >
                  {totalCartItems}
                </motion.div>
              )}
            </motion.button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading Vegas-style products...</p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={favorites.includes(product.id)}
                className="transition-all duration-300"
              />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl text-gray-600 mb-4">🎵</div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search terms or filters</p>
          </motion.div>
        )}

        {/* Featured Products Info */}
        {!loading && filteredProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-16 bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-blue-900/30 backdrop-blur-sm border border-purple-500/20 rounded-xl p-8"
          >
            <h3 className="text-2xl font-bold text-center text-white mb-6">
              🌟 Why Shop in the Fifth Dimension? 🌟
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl mb-3">💿</div>
                <h4 className="text-lg font-bold text-purple-400 mb-2">Premium Quality</h4>
                <p className="text-gray-300 text-sm">
                  High-quality vinyl, CDs, and digital formats with Vegas-style ratings
                </p>
              </div>
              <div>
                <div className="text-4xl mb-3">⚡</div>
                <h4 className="text-lg font-bold text-pink-400 mb-2">Instant Digital</h4>
                <p className="text-gray-300 text-sm">
                  Digital downloads available immediately after purchase
                </p>
              </div>
              <div>
                <div className="text-4xl mb-3">🚚</div>
                <h4 className="text-lg font-bold text-blue-400 mb-2">Fast Shipping</h4>
                <p className="text-gray-300 text-sm">
                  Free shipping on orders over $50 to anywhere in the dimensions
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Shopping Cart */}
        <Cart
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveFromCart}
          onCheckout={handleCheckout}
        />
      </div>
    </div>
  )
}