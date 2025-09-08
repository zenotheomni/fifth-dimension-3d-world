import React, { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  Settings,
  Captions,
  PictureInPicture,
  RotateCcw
} from 'lucide-react'

interface VideoPlayerProps {
  streamUrl?: string
  isLive?: boolean
  isPlaying: boolean
  isMuted: boolean
  volume: number
  isFullscreen: boolean
  onPlayPause: () => void
  onMuteToggle: () => void
  onVolumeChange: (volume: number) => void
  onFullscreenToggle: () => void
  onSeek?: (time: number) => void
  currentTime?: number
  duration?: number
  quality?: string
  onQualityChange?: (quality: string) => void
  availableQualities?: string[]
  showCaptions?: boolean
  onCaptionsToggle?: () => void
  enableDRM?: boolean
  className?: string
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  streamUrl,
  isLive = false,
  isPlaying,
  isMuted,
  volume,
  isFullscreen,
  onPlayPause,
  onMuteToggle,
  onVolumeChange,
  onFullscreenToggle,
  onSeek,
  currentTime = 0,
  duration = 0,
  quality = 'auto',
  onQualityChange,
  availableQualities = ['auto', '1080p', '720p', '480p', '360p'],
  showCaptions = false,
  onCaptionsToggle,
  enableDRM = false,
  className = ''
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [showControls, setShowControls] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showQualityMenu, setShowQualityMenu] = useState(false)
  const [showPlaybackRateMenu, setShowPlaybackRateMenu] = useState(false)
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume / 100
      videoRef.current.muted = isMuted
    }
  }, [volume, isMuted])

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(console.error)
      } else {
        videoRef.current.pause()
      }
    }
  }, [isPlaying])

  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
    }, 3000)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (videoRef.current && onSeek) {
      videoRef.current.currentTime = time
      onSeek(time)
    }
  }

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = Math.floor(time % 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handlePictureInPicture = async () => {
    if (videoRef.current && document.pictureInPictureEnabled) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture()
        } else {
          await videoRef.current.requestPictureInPicture()
        }
      } catch (error) {
        console.error('Picture-in-picture failed:', error)
      }
    }
  }

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate)
    if (videoRef.current) {
      videoRef.current.playbackRate = rate
    }
    setShowPlaybackRateMenu(false)
  }

  const handleQualityChange = (newQuality: string) => {
    if (onQualityChange) {
      onQualityChange(newQuality)
    }
    setShowQualityMenu(false)
  }

  return (
    <div 
      className={`relative bg-black rounded-lg overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        src={streamUrl}
        poster={!isLive ? '/api/placeholder/800/450' : undefined}
        onLoadStart={() => setIsBuffering(true)}
        onCanPlay={() => setIsBuffering(false)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onError={(e) => {
          console.error('Video error:', e)
          setIsBuffering(false)
        }}
        playsInline
        preload="metadata"
      />

      {/* DRM Indicator */}
      {enableDRM && (
        <div className="absolute top-4 right-4 bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded text-xs flex items-center gap-1">
          <Shield className="w-3 h-3" />
          DRM
        </div>
      )}

      {/* Live Indicator */}
      {isLive && (
        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          LIVE
        </div>
      )}

      {/* Buffering Indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}

      {/* Controls Overlay */}
      <motion.div
        initial={false}
        animate={{ opacity: showControls ? 1 : 0 }}
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"
      >
        {/* Top Controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-auto">
          <div className="flex items-center gap-2">
            {quality && (
              <button
                onClick={() => setShowQualityMenu(!showQualityMenu)}
                className="bg-black/50 text-white px-2 py-1 rounded text-sm hover:bg-black/70 transition-colors"
              >
                {quality}
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {onCaptionsToggle && (
              <button
                onClick={onCaptionsToggle}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  showCaptions ? 'bg-white/30 text-white' : 'bg-black/50 text-white hover:bg-black/70'
                }`}
              >
                <Captions className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center Play Button */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onPlayPause}
              className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors backdrop-blur-sm"
            >
              <Play className="w-8 h-8 text-white ml-1" />
            </motion.button>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
          {/* Progress Bar */}
          {!isLive && duration > 0 && (
            <div className="mb-4">
              <input
                type="range"
                min="0"
                max={duration}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #3AB0FF 0%, #3AB0FF ${(currentTime / duration) * 100}%, rgba(255,255,255,0.2) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.2) 100%)`
                }}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Play/Pause */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onPlayPause}
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
              </motion.button>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={onMuteToggle}
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
                </motion.button>
                
                <div className="w-20 h-1 bg-white/20 rounded-full overflow-hidden">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => onVolumeChange(parseInt(e.target.value))}
                    className="w-full h-full appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #3AB0FF 0%, #3AB0FF ${isMuted ? 0 : volume}%, rgba(255,255,255,0.2) ${isMuted ? 0 : volume}%, rgba(255,255,255,0.2) 100%)`
                    }}
                  />
                </div>
              </div>

              {/* Time Display */}
              {!isLive && (
                <div className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Playback Rate */}
              <button
                onClick={() => setShowPlaybackRateMenu(!showPlaybackRateMenu)}
                className="bg-white/20 text-white px-2 py-1 rounded text-sm hover:bg-white/30 transition-colors"
              >
                {playbackRate}x
              </button>

              {/* Picture in Picture */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={handlePictureInPicture}
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <PictureInPicture className="w-4 h-4 text-white" />
              </motion.button>

              {/* Fullscreen */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={onFullscreenToggle}
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                {isFullscreen ? <Minimize className="w-4 h-4 text-white" /> : <Maximize className="w-4 h-4 text-white" />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Quality Menu */}
        {showQualityMenu && (
          <div className="absolute top-12 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-2 min-w-32">
            {availableQualities.map((q) => (
              <button
                key={q}
                onClick={() => handleQualityChange(q)}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  quality === q ? 'bg-white/20 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Playback Rate Menu */}
        {showPlaybackRateMenu && (
          <div className="absolute bottom-16 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-2 min-w-24">
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
              <button
                key={rate}
                onClick={() => handlePlaybackRateChange(rate)}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  playbackRate === rate ? 'bg-white/20 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        )}

        {/* Settings Menu */}
        {showSettings && (
          <div className="absolute top-12 right-12 bg-black/80 backdrop-blur-sm rounded-lg p-4 min-w-48">
            <h3 className="text-white font-semibold mb-3">Settings</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Captions</span>
                <button
                  onClick={onCaptionsToggle}
                  className={`w-8 h-4 rounded-full transition-colors ${
                    showCaptions ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                    showCaptions ? 'translate-x-4' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Auto Quality</span>
                <button
                  onClick={() => handleQualityChange(quality === 'auto' ? '1080p' : 'auto')}
                  className={`w-8 h-4 rounded-full transition-colors ${
                    quality === 'auto' ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                    quality === 'auto' ? 'translate-x-4' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3AB0FF;
          cursor: pointer;
          border: 2px solid white;
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3AB0FF;
          cursor: pointer;
          border: 2px solid white;
        }
      `}</style>
    </div>
  )
}
