import React, { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { useSupabase } from '../../contexts/SupabaseContext'
import { useAuth } from '../../contexts/AuthContext'
import type { ArcadeScore } from '../../contexts/SupabaseContext'

interface ArcadeGameProps {
  gameName: string
  gameType: 'neon-runner' | 'space-defense' | 'crystal-collector'
  onScoreUpdate?: (score: number) => void
  className?: string
}

export const ArcadeGame: React.FC<ArcadeGameProps> = ({ 
  gameName, 
  gameType, 
  onScoreUpdate,
  className = '' 
}) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<any>(null)
  const { supabase } = useSupabase()
  const { user } = useAuth()
  const [score, setScore] = useState(0)
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'gameOver'>('waiting')
  const [highScore, setHighScore] = useState(0)

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    
    renderer.setSize(800, 600)
    renderer.setClearColor(0x000011, 1)
    mountRef.current.appendChild(renderer.domElement)

    // Create game based on type
    let game: any
    switch (gameType) {
      case 'neon-runner':
        game = createNeonRunner(scene, camera, renderer)
        break
      case 'space-defense':
        game = createSpaceDefense(scene, camera, renderer)
        break
      case 'crystal-collector':
        game = createCrystalCollector(scene, camera, renderer)
        break
    }

    gameRef.current = game

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      
      if (game && gameState === 'playing') {
        game.update()
        setScore(game.getScore())
      }
      
      renderer.render(scene, camera)
    }
    animate()

    // Cleanup
    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [gameType, gameState])

  // Load high score from database
  useEffect(() => {
    if (user) {
      loadHighScore()
    }
  }, [user, gameName])

  const loadHighScore = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('arcade_scores')
        .select('score')
        .eq('user_id', user.id)
        .eq('game_name', gameName)
        .order('score', { ascending: false })
        .limit(1)

      if (error) throw error
      if (data && data.length > 0) {
        setHighScore(data[0].score)
      }
    } catch (error) {
      console.error('Error loading high score:', error)
    }
  }

  const saveScore = async (finalScore: number) => {
    if (!user) return

    try {
      const neonMultiplier = calculateNeonMultiplier(finalScore, gameType)
      const adjustedScore = Math.floor(finalScore * neonMultiplier)

      const { error } = await supabase
        .from('arcade_scores')
        .insert({
          user_id: user.id,
          game_name: gameName,
          score: adjustedScore,
          neon_multiplier: neonMultiplier,
          game_data: {
            base_score: finalScore,
            game_type: gameType,
            timestamp: new Date().toISOString()
          }
        })

      if (error) throw error

      if (adjustedScore > highScore) {
        setHighScore(adjustedScore)
      }
    } catch (error) {
      console.error('Error saving score:', error)
    }
  }

  const startGame = () => {
    setGameState('playing')
    setScore(0)
    if (gameRef.current) {
      gameRef.current.start()
    }
  }

  const endGame = () => {
    setGameState('gameOver')
    if (gameRef.current) {
      const finalScore = gameRef.current.getScore()
      saveScore(finalScore)
      onScoreUpdate?.(finalScore)
    }
  }

  const resetGame = () => {
    setGameState('waiting')
    setScore(0)
    if (gameRef.current) {
      gameRef.current.reset()
    }
  }

  // Handle score updates
  useEffect(() => {
    onScoreUpdate?.(score)
  }, [score, onScoreUpdate])

  return (
    <div className={`arcade-game-container ${className}`}>
      <div className="game-header mb-4 text-center">
        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-blue-500">
          {gameName}
        </h3>
        <div className="flex justify-between items-center mt-2">
          <div className="text-yellow-400">
            Score: <span className="font-mono text-lg">{score.toLocaleString()}</span>
          </div>
          <div className="text-purple-400">
            High Score: <span className="font-mono text-lg">{highScore.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div 
        ref={mountRef} 
        className="game-canvas border-2 border-purple-500 rounded-lg overflow-hidden shadow-lg shadow-purple-500/20"
        style={{ width: '800px', height: '600px' }}
      />

      <div className="game-controls mt-4 text-center">
        {gameState === 'waiting' && (
          <button
            onClick={startGame}
            className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
          >
            🎮 START GAME
          </button>
        )}
        
        {gameState === 'playing' && (
          <div className="text-center">
            <div className="text-yellow-300 mb-2 animate-pulse">🎯 GAME IN PROGRESS 🎯</div>
            <button
              onClick={endGame}
              className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              End Game
            </button>
          </div>
        )}
        
        {gameState === 'gameOver' && (
          <div className="text-center">
            <div className="text-yellow-400 text-xl mb-4">🎉 GAME OVER! 🎉</div>
            <div className="text-lg mb-4">
              Final Score: <span className="text-green-400 font-bold">{score.toLocaleString()}</span>
            </div>
            <button
              onClick={resetGame}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
            >
              🔄 PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      <div className="game-instructions mt-4 text-sm text-gray-400 text-center">
        {getGameInstructions(gameType)}
      </div>
    </div>
  )
}

// Game creation functions
function createNeonRunner(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
  let score = 0
  let speed = 0.05
  let obstacles: THREE.Mesh[] = []
  let player: THREE.Mesh
  let isRunning = false

  // Setup Vegas lighting
  const ambientLight = new THREE.AmbientLight(0x404040, 0.3)
  scene.add(ambientLight)

  const neonLight1 = new THREE.PointLight(0xff00ff, 1.5, 100)
  neonLight1.position.set(-10, 10, 0)
  scene.add(neonLight1)

  const neonLight2 = new THREE.PointLight(0x00ffff, 1.5, 100)
  neonLight2.position.set(10, 10, 0)
  scene.add(neonLight2)

  // Create player (neon cube)
  const playerGeometry = new THREE.BoxGeometry(1, 1, 1)
  const playerMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x00ff00,
    emissive: 0x002200,
    transparent: true,
    opacity: 0.9
  })
  player = new THREE.Mesh(playerGeometry, playerMaterial)
  player.position.z = 5
  scene.add(player)

  camera.position.z = 10

  // Create tunnel walls
  const wallGeometry = new THREE.PlaneGeometry(50, 20)
  const wallMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x220044,
    transparent: true,
    opacity: 0.3
  })
  
  const leftWall = new THREE.Mesh(wallGeometry, wallMaterial)
  leftWall.position.set(-15, 0, -10)
  leftWall.rotation.y = Math.PI / 2
  scene.add(leftWall)

  const rightWall = new THREE.Mesh(wallGeometry, wallMaterial)
  rightWall.position.set(15, 0, -10)
  rightWall.rotation.y = -Math.PI / 2
  scene.add(rightWall)

  // Game controls
  const keys = { left: false, right: false, up: false, down: false }
  
  const handleKeyDown = (event: KeyboardEvent) => {
    switch(event.code) {
      case 'ArrowLeft': keys.left = true; break
      case 'ArrowRight': keys.right = true; break
      case 'ArrowUp': keys.up = true; break
      case 'ArrowDown': keys.down = true; break
    }
  }

  const handleKeyUp = (event: KeyboardEvent) => {
    switch(event.code) {
      case 'ArrowLeft': keys.left = false; break
      case 'ArrowRight': keys.right = false; break
      case 'ArrowUp': keys.up = false; break
      case 'ArrowDown': keys.down = false; break
    }
  }

  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('keyup', handleKeyUp)

  return {
    start() {
      isRunning = true
      score = 0
      speed = 0.05
    },
    
    update() {
      if (!isRunning) return

      // Move player
      if (keys.left && player.position.x > -10) player.position.x -= 0.3
      if (keys.right && player.position.x < 10) player.position.x += 0.3
      if (keys.up && player.position.y < 8) player.position.y += 0.3
      if (keys.down && player.position.y > -8) player.position.y -= 0.3

      // Move obstacles toward player
      obstacles.forEach((obstacle, index) => {
        obstacle.position.z += speed * 2
        
        if (obstacle.position.z > 10) {
          scene.remove(obstacle)
          obstacles.splice(index, 1)
          score += 100
        }

        // Collision detection
        if (obstacle.position.z > 4 && obstacle.position.z < 6 &&
            Math.abs(obstacle.position.x - player.position.x) < 1 &&
            Math.abs(obstacle.position.y - player.position.y) < 1) {
          isRunning = false
        }
      })

      // Spawn new obstacles
      if (Math.random() < 0.02) {
        const obstacleGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5)
        const obstacleMaterial = new THREE.MeshPhongMaterial({ 
          color: 0xff0000,
          emissive: 0x220000
        })
        const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial)
        obstacle.position.set(
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 16,
          -20
        )
        obstacles.push(obstacle)
        scene.add(obstacle)
      }

      // Animate neon lights
      neonLight1.intensity = 1.5 + Math.sin(Date.now() * 0.01) * 0.5
      neonLight2.intensity = 1.5 + Math.cos(Date.now() * 0.01) * 0.5

      speed += 0.0001 // Gradually increase difficulty
    },
    
    getScore() {
      return score
    },
    
    reset() {
      isRunning = false
      score = 0
      speed = 0.05
      obstacles.forEach(obstacle => scene.remove(obstacle))
      obstacles = []
      player.position.set(0, 0, 5)
      
      // Cleanup event listeners
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }
}

function createSpaceDefense(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
  let score = 0
  let enemies: THREE.Mesh[] = []
  let bullets: THREE.Mesh[] = []
  let player: THREE.Mesh
  let isPlaying = false

  // Setup space environment
  const ambientLight = new THREE.AmbientLight(0x404040, 0.2)
  scene.add(ambientLight)

  const starLight = new THREE.PointLight(0xffffff, 2, 50)
  starLight.position.set(0, 20, 10)
  scene.add(starLight)

  // Create player ship
  const playerGeometry = new THREE.ConeGeometry(0.5, 2, 6)
  const playerMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x00ff00,
    emissive: 0x003300 
  })
  player = new THREE.Mesh(playerGeometry, playerMaterial)
  player.position.set(0, -8, 0)
  player.rotation.x = Math.PI
  scene.add(player)

  camera.position.set(0, 0, 15)

  // Mouse controls
  let mouseX = 0
  const handleMouseMove = (event: MouseEvent) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1
    player.position.x = mouseX * 10
  }

  const handleClick = () => {
    if (!isPlaying) return
    
    // Create bullet
    const bulletGeometry = new THREE.SphereGeometry(0.1, 8, 8)
    const bulletMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xffff00,
      emissive: 0x444400 
    })
    const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial)
    bullet.position.copy(player.position)
    bullet.position.y += 1
    bullets.push(bullet)
    scene.add(bullet)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('click', handleClick)

  return {
    start() {
      isPlaying = true
      score = 0
    },
    
    update() {
      if (!isPlaying) return

      // Move bullets
      bullets.forEach((bullet, bulletIndex) => {
        bullet.position.y += 0.5
        
        if (bullet.position.y > 15) {
          scene.remove(bullet)
          bullets.splice(bulletIndex, 1)
        }

        // Check bullet-enemy collisions
        enemies.forEach((enemy, enemyIndex) => {
          if (bullet.position.distanceTo(enemy.position) < 1) {
            scene.remove(bullet)
            scene.remove(enemy)
            bullets.splice(bulletIndex, 1)
            enemies.splice(enemyIndex, 1)
            score += 200
          }
        })
      })

      // Move enemies
      enemies.forEach((enemy, index) => {
        enemy.position.y -= 0.1
        enemy.rotation.z += 0.05
        
        if (enemy.position.y < -10) {
          scene.remove(enemy)
          enemies.splice(index, 1)
        }

        // Check player collision
        if (enemy.position.distanceTo(player.position) < 1) {
          isPlaying = false
        }
      })

      // Spawn enemies
      if (Math.random() < 0.03) {
        const enemyGeometry = new THREE.OctahedronGeometry(0.8)
        const enemyMaterial = new THREE.MeshPhongMaterial({ 
          color: 0xff0000,
          emissive: 0x330000 
        })
        const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial)
        enemy.position.set(
          (Math.random() - 0.5) * 20,
          15,
          0
        )
        enemies.push(enemy)
        scene.add(enemy)
      }
    },
    
    getScore() {
      return score
    },
    
    reset() {
      isPlaying = false
      score = 0
      enemies.forEach(enemy => scene.remove(enemy))
      bullets.forEach(bullet => scene.remove(bullet))
      enemies = []
      bullets = []
      player.position.set(0, -8, 0)
      
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('click', handleClick)
    }
  }
}

function createCrystalCollector(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
  let score = 0
  let crystals: THREE.Mesh[] = []
  let player: THREE.Mesh
  let isPlaying = false

  // Setup crystal cave lighting
  const ambientLight = new THREE.AmbientLight(0x301030, 0.4)
  scene.add(ambientLight)

  const crystalLight1 = new THREE.PointLight(0x8080ff, 2, 20)
  crystalLight1.position.set(-5, 5, 5)
  scene.add(crystalLight1)

  const crystalLight2 = new THREE.PointLight(0xff8080, 2, 20)
  crystalLight2.position.set(5, -5, 5)
  scene.add(crystalLight2)

  // Create player
  const playerGeometry = new THREE.SphereGeometry(0.5, 16, 16)
  const playerMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xffffff,
    emissive: 0x111111,
    transparent: true,
    opacity: 0.9
  })
  player = new THREE.Mesh(playerGeometry, playerMaterial)
  scene.add(player)

  camera.position.set(0, 0, 10)

  // WASD controls
  const keys = { w: false, a: false, s: false, d: false }
  
  const handleKeyDown = (event: KeyboardEvent) => {
    switch(event.code) {
      case 'KeyW': keys.w = true; break
      case 'KeyA': keys.a = true; break
      case 'KeyS': keys.s = true; break
      case 'KeyD': keys.d = true; break
    }
  }

  const handleKeyUp = (event: KeyboardEvent) => {
    switch(event.code) {
      case 'KeyW': keys.w = false; break
      case 'KeyA': keys.a = false; break
      case 'KeyS': keys.s = false; break
      case 'KeyD': keys.d = false; break
    }
  }

  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('keyup', handleKeyUp)

  return {
    start() {
      isPlaying = true
      score = 0
    },
    
    update() {
      if (!isPlaying) return

      // Move player
      if (keys.w && player.position.y < 8) player.position.y += 0.2
      if (keys.s && player.position.y > -8) player.position.y -= 0.2
      if (keys.a && player.position.x > -10) player.position.x -= 0.2
      if (keys.d && player.position.x < 10) player.position.x += 0.2

      // Rotate and animate crystals
      crystals.forEach((crystal, index) => {
        crystal.rotation.x += 0.02
        crystal.rotation.y += 0.03
        
        // Pulsing effect
        const scale = 1 + Math.sin(Date.now() * 0.01 + index) * 0.2
        crystal.scale.setScalar(scale)

        // Check collection
        if (crystal.position.distanceTo(player.position) < 1.5) {
          scene.remove(crystal)
          crystals.splice(index, 1)
          score += 150
        }
      })

      // Spawn new crystals
      if (Math.random() < 0.02 && crystals.length < 8) {
        const crystalGeometry = new THREE.OctahedronGeometry(0.8)
        const crystalMaterial = new THREE.MeshPhongMaterial({ 
          color: Math.random() > 0.5 ? 0x8080ff : 0xff8080,
          emissive: 0x202020,
          transparent: true,
          opacity: 0.8
        })
        const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial)
        crystal.position.set(
          (Math.random() - 0.5) * 18,
          (Math.random() - 0.5) * 14,
          (Math.random() - 0.5) * 4
        )
        crystals.push(crystal)
        scene.add(crystal)
      }

      // Animate lights
      crystalLight1.intensity = 2 + Math.sin(Date.now() * 0.005) * 0.8
      crystalLight2.intensity = 2 + Math.cos(Date.now() * 0.005) * 0.8
    },
    
    getScore() {
      return score
    },
    
    reset() {
      isPlaying = false
      score = 0
      crystals.forEach(crystal => scene.remove(crystal))
      crystals = []
      player.position.set(0, 0, 0)
      
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }
}

// Helper functions
function calculateNeonMultiplier(score: number, gameType: string): number {
  const baseMultiplier = 1.0
  const scoreBonus = Math.min(score / 10000, 0.5) // Up to 0.5x bonus for high scores
  const gameTypeBonus = gameType === 'crystal-collector' ? 0.2 : 0.1
  
  return baseMultiplier + scoreBonus + gameTypeBonus
}

function getGameInstructions(gameType: string): string {
  switch (gameType) {
    case 'neon-runner':
      return '🏃 Use ARROW KEYS to dodge obstacles in the neon tunnel! Higher speeds = more points!'
    case 'space-defense':
      return '🚀 Move with MOUSE, CLICK to shoot enemies! Protect your ship and rack up points!'
    case 'crystal-collector':
      return '💎 Use WASD to collect glowing crystals! Gather them all before they disappear!'
    default:
      return '🎮 Follow the on-screen instructions to play!'
  }
}