import React, { createContext, useContext, useState, useRef, ReactNode, useCallback, useEffect } from 'react'
import { getUnityBuildConfig, getUnityFileUrl } from '@/config/unity'

interface UnityContextType {
  unityInstance: any | null
  isUnityLoaded: boolean
  loadUnity: () => Promise<void>
  unloadUnity: () => void
  sendMessageToUnity: (gameObject: string, methodName: string, value?: any) => void
  isUnityVisible: boolean
  setUnityVisible: (visible: boolean) => void
  unityContainerRef: React.RefObject<HTMLDivElement>
  focusDoor: (doorKey: string) => void
  startGame: (gameName: string) => void
}

const UnityContext = createContext<UnityContextType | undefined>(undefined)

interface UnityProviderProps {
  children: ReactNode
}

export function UnityProvider({ children }: UnityProviderProps) {
  const [unityInstance, setUnityInstance] = useState<any | null>(null)
  const [isUnityLoaded, setIsUnityLoaded] = useState(false)
  const [isUnityVisible, setUnityVisible] = useState(false)
  const unityContainerRef = useRef<HTMLDivElement>(null)

  // Set up Unity event handlers once on mount
  useEffect(() => {
    // Door navigation handler
    ;(window as any).onDoorEnter = (key: string) => {
      console.log('🚪 Door entered:', key)
      document.dispatchEvent(new CustomEvent('fd:open', { detail: key }))
      
      // You can also handle navigation here directly
      // window.location.hash = `#/${key}`
    }

    // Game start handler
    ;(window as any).onGameStart = (gameName: string) => {
      console.log('🎮 Game started:', gameName)
      document.dispatchEvent(new CustomEvent('fd:game-start', { detail: gameName }))
    }

    // Purchase request handler
    ;(window as any).onPurchaseRequest = (productId: string) => {
      console.log('💰 Purchase request:', productId)
      document.dispatchEvent(new CustomEvent('fd:purchase', { detail: productId }))
    }

    // Unity ready handler
    ;(window as any).onUnityReady = () => {
      console.log('✅ Unity is ready')
      document.dispatchEvent(new CustomEvent('fd:unity-ready'))
    }

    // Scene loaded handler
    ;(window as any).onSceneLoaded = (sceneName: string) => {
      console.log('🎬 Scene loaded:', sceneName)
      document.dispatchEvent(new CustomEvent('fd:scene-loaded', { detail: sceneName }))
    }

    // Cleanup function
    return () => {
      delete (window as any).onDoorEnter
      delete (window as any).onGameStart
      delete (window as any).onPurchaseRequest
      delete (window as any).onUnityReady
      delete (window as any).onSceneLoaded
    }
  }, [])

  const loadUnity = useCallback(async () => {
    if (isUnityLoaded || !unityContainerRef.current) return

    try {
      // Unity WebGL build configuration
      const config = getUnityBuildConfig()

      // Load Unity bridge handlers first
      if (!(window as any).onDoorEnter) {
        const bridgeScript = document.createElement('script')
        bridgeScript.src = '/bridge.js'
        bridgeScript.onload = () => {
          console.log('Unity bridge handlers loaded, now loading Unity...')
          loadUnityLoader(config)
        }
        document.head.appendChild(bridgeScript)
      } else {
        loadUnityLoader(config)
      }

      function loadUnityLoader(config: any) {
        // Load Unity WebGL loader
        if (!(window as any).UnityLoader) {
          const script = document.createElement('script')
          script.src = getUnityFileUrl('loader')
          script.onload = () => {
            initializeUnity(config)
          }
          document.head.appendChild(script)
        } else {
          initializeUnity(config)
        }
      }

      function initializeUnity(config: any) {
        if (unityContainerRef.current) {
          const canvas = document.createElement('canvas')
          canvas.id = 'unity-canvas'
          canvas.style.width = '100%'
          canvas.style.height = '100%'
          canvas.style.display = 'block'
          
          // Clear container and add canvas
          unityContainerRef.current.innerHTML = ''
          unityContainerRef.current.appendChild(canvas)

          // Create Unity instance
          ;(window as any).createUnityInstance(canvas, config, (progress: number) => {
            // Loading progress callback
            console.log(`Unity loading progress: ${progress * 100}%`)
          }).then((instance: any) => {
            setUnityInstance(instance)
            setIsUnityLoaded(true)
            console.log('Unity instance loaded successfully')
            
            // Register Unity instance with bridge for bidirectional communication
            if ((window as any).FDBridge && (window as any).FDBridge.registerUnityInstance) {
              (window as any).FDBridge.registerUnityInstance(instance)
            }
            
            // Set up message listeners from Unity
            window.addEventListener('UnityMessage', handleUnityMessage)
          }).catch((error: any) => {
            console.error('Failed to load Unity instance:', error)
          })
        }
      }
    } catch (error) {
      console.error('Error loading Unity:', error)
    }
  }, [isUnityLoaded])

  const unloadUnity = useCallback(() => {
    if (unityInstance) {
      unityInstance.Quit(() => {
        setUnityInstance(null)
        setIsUnityLoaded(false)
        setUnityVisible(false)
        
        // Clean up event listeners
        window.removeEventListener('UnityMessage', handleUnityMessage)
        
        // Clear container
        if (unityContainerRef.current) {
          unityContainerRef.current.innerHTML = ''
        }
      })
    }
  }, [unityInstance])

  const sendMessageToUnity = useCallback((gameObject: string, methodName: string, value?: any) => {
    if (unityInstance && isUnityLoaded) {
      unityInstance.SendMessage(gameObject, methodName, value || '')
    } else {
      console.warn('Unity instance not loaded, cannot send message')
    }
  }, [unityInstance, isUnityLoaded])

  const focusDoor = useCallback((doorKey: string) => {
    if (unityInstance && isUnityLoaded) {
      console.log(`🎯 Focusing door: ${doorKey}`)
      unityInstance.SendMessage('LobbyManager', 'FocusDoor', doorKey)
    } else {
      console.warn('Unity instance not loaded, cannot focus door')
    }
  }, [unityInstance, isUnityLoaded])

  const startGame = useCallback((gameName: string) => {
    if (unityInstance && isUnityLoaded) {
      console.log(`🎮 Starting game: ${gameName}`)
      unityInstance.SendMessage('LobbyManager', 'StartGame', gameName)
    } else {
      console.warn('Unity instance not loaded, cannot start game')
    }
  }, [unityInstance, isUnityLoaded])

  const handleUnityMessage = useCallback((event: any) => {
    // Handle messages from Unity
    const { data } = event.detail || event
    
    try {
      const message = typeof data === 'string' ? JSON.parse(data) : data
      
      switch (message.type) {
        case 'NAVIGATION_REQUEST':
          // Handle navigation requests from Unity (e.g., go to record store)
          if (message.destination) {
            window.location.hash = `#/${message.destination}`
          }
          break
          
        case 'PURCHASE_REQUEST':
          // Handle purchase requests from Unity
          console.log('Purchase request from Unity:', message.productId)
          break
          
        case 'ARCADE_GAME_START':
          // Handle arcade game start
          console.log('Arcade game started:', message.gameName)
          break
          
        case 'UNITY_READY':
          // Unity has finished loading and is ready
          console.log('Unity is ready')
          break
          
        default:
          console.log('Unknown message from Unity:', message)
      }
    } catch (error) {
      console.error('Error parsing Unity message:', error)
    }
  }, [])

  const value = {
    unityInstance,
    isUnityLoaded,
    loadUnity,
    unloadUnity,
    sendMessageToUnity,
    isUnityVisible,
    setUnityVisible,
    unityContainerRef,
    focusDoor,
    startGame,
  }

  return (
    <UnityContext.Provider value={value}>
      {children}
    </UnityContext.Provider>
  )
}

export function useUnity() {
  const context = useContext(UnityContext)
  if (context === undefined) {
    throw new Error('useUnity must be used within a UnityProvider')
  }
  return context
}

// Utility function to detect if device can run Unity WebGL well
export function canRunUnity(): boolean {
  // Check for WebGL support
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
  
  if (!gl) return false
  
  // Check for minimum memory (Unity WebGL needs at least 1GB)
  const memory = (navigator as any).deviceMemory
  if (memory && memory < 1) return false
  
  // Check for mobile devices (might want to show simplified version)
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  
  return !isMobile // For now, disable Unity on mobile
}