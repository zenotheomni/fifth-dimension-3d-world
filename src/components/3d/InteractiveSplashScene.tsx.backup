import React, { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import * as THREE from 'three'
import { OrbitControls } from 'three-stdlib'

interface InteractiveSplashSceneProps {
  onSceneLoaded?: () => void
  className?: string
}

export const InteractiveSplashScene: React.FC<InteractiveSplashSceneProps> = ({
  onSceneLoaded,
  className = ''
}) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    controls: OrbitControls
    lights: {
      ambient: THREE.AmbientLight
      directional: THREE.DirectionalLight
      spotLights: THREE.SpotLight[]
      pointLights: THREE.PointLight[]
      hemisphere: THREE.HemisphereLight
    }
    objects: {
      environment: THREE.Group
      particles: THREE.Points
      buildings: THREE.Group
      floatingElements: THREE.Group
      skybox: THREE.Mesh
      terrain: THREE.Mesh
      water: THREE.Mesh
    }
    animationId: number | null
    clock: THREE.Clock
  } | null>(null)
  
  const [isLoaded, setIsLoaded] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!mountRef.current) return

    console.log('🚀 Starting 3D scene initialization...')

    // Check WebGL support first
    if (!window.WebGLRenderingContext) {
      console.error('❌ WebGL not supported in this browser')
      setIsLoaded(true)
      onSceneLoaded?.()
      return
    }

    try {
      // Initialize Three.js scene with enhanced settings
      const scene = new THREE.Scene()
      console.log('✅ Scene created successfully')
      
      scene.fog = new THREE.Fog(0x0a0015, 50, 200)
      
      // Camera setup with better positioning
      const camera = new THREE.PerspectiveCamera(
        60, // Reduced FOV for more realistic perspective
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      )
      camera.position.set(0, 20, 40)
      console.log('✅ Camera created successfully')

      // Enhanced renderer setup
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true
      })
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.0
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.setClearColor(0x000510, 1)
      
      mountRef.current.appendChild(renderer.domElement)
      console.log('✅ Renderer created and attached successfully')

      // Enhanced camera controls
      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.dampingFactor = 0.05
      controls.autoRotate = true
      controls.autoRotateSpeed = 0.3
      controls.minDistance = 15
      controls.maxDistance = 100
      controls.enablePan = true
      controls.maxPolarAngle = Math.PI / 2.1
      controls.minPolarAngle = 0.1
      console.log('✅ OrbitControls created successfully')

      // Clock for animations
      const clock = new THREE.Clock()

      // === ENHANCED LIGHTING SETUP ===
      
      // Hemisphere light for sky/ground color influence
      const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x3a3a3a, 0.6)
      scene.add(hemisphereLight)

      // Ambient light for base illumination
      const ambientLight = new THREE.AmbientLight(0x404080, 0.4)
      scene.add(ambientLight)

      // Main directional light (sun/moon) with enhanced shadows
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5)
      directionalLight.position.set(20, 30, 20)
      directionalLight.castShadow = true
      directionalLight.shadow.camera.near = 0.1
      directionalLight.shadow.camera.far = 200
      directionalLight.shadow.camera.left = -50
      directionalLight.shadow.camera.right = 50
      directionalLight.shadow.camera.top = 50
      directionalLight.shadow.camera.bottom = -50
      directionalLight.shadow.mapSize.width = 4096
      directionalLight.shadow.mapSize.height = 4096
      directionalLight.shadow.bias = -0.0005
      directionalLight.shadow.normalBias = 0.02
      scene.add(directionalLight)
      console.log('✅ Lighting setup completed')

      // Enhanced Vegas-style neon spot lights
      const spotLights: THREE.SpotLight[] = []
      const spotLightColors = [0xff0080, 0x00ff80, 0x8000ff, 0xff8000, 0xffff00, 0x00ffff]
      
      for (let i = 0; i < 6; i++) {
        const spotLight = new THREE.SpotLight(spotLightColors[i], 4, 80, Math.PI / 8, 0.3, 1.5)
        const angle = (i / 6) * Math.PI * 2
        spotLight.position.set(
          Math.cos(angle) * 35,
          25,
          Math.sin(angle) * 35
        )
        spotLight.target.position.set(0, 0, 0)
        spotLight.castShadow = true
        spotLight.shadow.mapSize.width = 1024
        spotLight.shadow.mapSize.height = 1024
        scene.add(spotLight)
        scene.add(spotLight.target)
        spotLights.push(spotLight)
      }

      // Enhanced floating point lights for atmosphere
      const pointLights: THREE.PointLight[] = []
      for (let i = 0; i < 12; i++) {
        const pointLight = new THREE.PointLight(
          new THREE.Color().setHSL(Math.random(), 0.8, 0.6),
          3,
          25,
          2
        )
        pointLight.position.set(
          (Math.random() - 0.5) * 60,
          Math.random() * 30 + 10,
          (Math.random() - 0.5) * 60
        )
        pointLight.castShadow = true
        pointLight.shadow.mapSize.width = 512
        pointLight.shadow.mapSize.height = 512
        scene.add(pointLight)
        pointLights.push(pointLight)
      }

      // === ENHANCED ENVIRONMENT CREATION ===
      
      // Create skybox using a large sphere
      const skyboxGeometry = new THREE.SphereGeometry(300, 32, 32)
      const skyboxMaterial = new THREE.MeshBasicMaterial({
        color: 0x0a0015,
        side: THREE.BackSide
      })
      const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial)
      scene.add(skybox)

      // Enhanced terrain with height variation
      const terrainGeometry = new THREE.PlaneGeometry(200, 200, 64, 64)
      const terrainVertices = terrainGeometry.attributes.position.array as Float32Array
      
      for (let i = 0; i < terrainVertices.length; i += 3) {
        const x = terrainVertices[i]
        const z = terrainVertices[i + 2]
        terrainVertices[i + 1] = Math.sin(x * 0.05) * 2 + Math.sin(z * 0.03) * 3
      }
      
      terrainGeometry.attributes.position.needsUpdate = true
      terrainGeometry.computeVertexNormals()
      
      const terrainMaterial = new THREE.MeshLambertMaterial({
        color: 0x1a1a2e,
        transparent: true,
        opacity: 0.9
      })
      const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial)
      terrain.rotation.x = -Math.PI / 2
      terrain.receiveShadow = true
      scene.add(terrain)

      // Water plane with animated material
      const waterGeometry = new THREE.PlaneGeometry(150, 150, 32, 32)
      const waterMaterial = new THREE.MeshPhongMaterial({
        color: 0x006994,
        shininess: 100,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      })
      const water = new THREE.Mesh(waterGeometry, waterMaterial)
      water.rotation.x = -Math.PI / 2
      water.position.y = -0.5
      water.receiveShadow = true
      scene.add(water)

      // Enhanced futuristic buildings with more variety
      const buildings = new THREE.Group()
      const buildingTypes = [
        { width: 4, depth: 4, height: 25 },
        { width: 6, depth: 3, height: 35 },
        { width: 3, depth: 6, height: 20 },
        { width: 5, depth: 5, height: 40 },
        { width: 2, depth: 8, height: 30 }
      ]
      
      for (let i = 0; i < 20; i++) {
        const type = buildingTypes[Math.floor(Math.random() * buildingTypes.length)]
        const height = type.height + Math.random() * 15
        const width = type.width + Math.random() * 2
        const depth = type.depth + Math.random() * 2
        
        const buildingGeometry = new THREE.BoxGeometry(width, height, depth)
        const buildingMaterial = new THREE.MeshPhongMaterial({
          color: new THREE.Color().setHSL(Math.random() * 0.1 + 0.6, 0.5, 0.3),
          shininess: 80,
          transparent: true,
          opacity: 0.9
        })
        
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial)
        const angle = (i / 20) * Math.PI * 2
        const radius = 25 + Math.random() * 25
        
        building.position.set(
          Math.cos(angle) * radius,
          height / 2,
          Math.sin(angle) * radius
        )
        building.castShadow = true
        building.receiveShadow = true
        
        buildings.add(building)

        // Add glowing windows with better placement
        if (Math.random() > 0.2) {
          const windowGeometry = new THREE.PlaneGeometry(width * 0.7, height * 0.08)
          const windowMaterial = new THREE.MeshBasicMaterial({
            color: 0x80ff80,
            transparent: true,
            opacity: 0.9
          })
          const windowCount = Math.floor(height / 4)
          
          for (let j = 0; j < windowCount; j++) {
            const window1 = new THREE.Mesh(windowGeometry, windowMaterial)
            window1.position.set(width / 2 + 0.01, -height / 2 + (j + 1) * 4, 0)
            window1.rotation.y = Math.PI / 2
            building.add(window1)
            
            // Add windows on other sides
            if (Math.random() > 0.5) {
              const window2 = new THREE.Mesh(windowGeometry, windowMaterial)
              window2.position.set(-width / 2 - 0.01, -height / 2 + (j + 1) * 4, 0)
              window2.rotation.y = -Math.PI / 2
              building.add(window2)
            }
          }
        }

        // Add antenna/spire to some buildings
        if (Math.random() > 0.7) {
          const antennaGeometry = new THREE.CylinderGeometry(0.1, 0.1, height * 0.3)
          const antennaMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 })
          const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial)
          antenna.position.set(0, height / 2 + height * 0.15, 0)
          building.add(antenna)
        }
      }
      scene.add(buildings)

      // Enhanced particle system for atmospheric effects
      const particleCount = 2000
      const particleGeometry = new THREE.BufferGeometry()
      const particlePositions = new Float32Array(particleCount * 3)
      const particleColors = new Float32Array(particleCount * 3)
      const particleSizes = new Float32Array(particleCount)
      
      for (let i = 0; i < particleCount; i++) {
        particlePositions[i * 3] = (Math.random() - 0.5) * 150
        particlePositions[i * 3 + 1] = Math.random() * 80
        particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 150
        
        const color = new THREE.Color().setHSL(Math.random(), 0.8, 0.7)
        particleColors[i * 3] = color.r
        particleColors[i * 3 + 1] = color.g
        particleColors[i * 3 + 2] = color.b
        
        particleSizes[i] = Math.random() * 2 + 0.5
      }
      
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
      particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3))
      particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1))
      
      const particleMaterial = new THREE.PointsMaterial({
        size: 1,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
      })
      
      const particles = new THREE.Points(particleGeometry, particleMaterial)
      scene.add(particles)

      // Enhanced floating geometric elements with more variety
      const floatingElements = new THREE.Group()
      const geometries = [
        new THREE.OctahedronGeometry(0.8),
        new THREE.TetrahedronGeometry(1.2),
        new THREE.IcosahedronGeometry(1.0),
        new THREE.DodecahedronGeometry(0.7),
        new THREE.TorusGeometry(0.5, 0.2, 8, 16),
        new THREE.TorusKnotGeometry(0.6, 0.2, 64, 8)
      ]
      
      for (let i = 0; i < 30; i++) {
        const geometry = geometries[Math.floor(Math.random() * geometries.length)]
        const material = new THREE.MeshPhongMaterial({
          color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6),
          shininess: 100,
          transparent: true,
          opacity: 0.7
        })
        
        const element = new THREE.Mesh(geometry, material)
        element.position.set(
          (Math.random() - 0.5) * 80,
          Math.random() * 40 + 15,
          (Math.random() - 0.5) * 80
        )
        element.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        )
        element.scale.setScalar(Math.random() * 0.5 + 0.5)
        
        floatingElements.add(element)
      }
      scene.add(floatingElements)

      // Add floating platforms
      for (let i = 0; i < 8; i++) {
        const platformGeometry = new THREE.CylinderGeometry(3, 3, 0.5, 8)
        const platformMaterial = new THREE.MeshPhongMaterial({
          color: new THREE.Color().setHSL(Math.random(), 0.6, 0.5),
          transparent: true,
          opacity: 0.8
        })
        
        const platform = new THREE.Mesh(platformGeometry, platformMaterial)
        const angle = (i / 8) * Math.PI * 2
        const radius = 45 + Math.random() * 20
        
        platform.position.set(
          Math.cos(angle) * radius,
          Math.random() * 15 + 5,
          Math.sin(angle) * radius
        )
        platform.castShadow = true
        platform.receiveShadow = true
        
        scene.add(platform)
      }

      console.log('✅ 3D environment created successfully')

      // Store scene reference
      sceneRef.current = {
        scene,
        camera,
        renderer,
        controls,
        lights: {
          ambient: ambientLight,
          directional: directionalLight,
          spotLights,
          pointLights,
          hemisphere: hemisphereLight
        },
        objects: {
          environment: buildings,
          particles,
          buildings,
          floatingElements,
          skybox,
          terrain,
          water
        },
        animationId: null,
        clock
      }

      // Enhanced animation loop
      const animate = () => {
        if (!sceneRef.current) return
        
        const { 
          scene, 
          camera, 
          renderer, 
          controls, 
          lights, 
          objects, 
          clock
        } = sceneRef.current
        
        const elapsedTime = clock.getElapsedTime()
        
        // Update controls
        controls.update()
        
        // Animate spot lights with more complex patterns
        lights.spotLights.forEach((light, index) => {
          const angle = elapsedTime * 0.3 + (index / lights.spotLights.length) * Math.PI * 2
          light.position.x = Math.cos(angle) * 35
          light.position.z = Math.sin(angle) * 35
          light.intensity = 3 + Math.sin(elapsedTime * 2 + index) * 1.5
          light.angle = Math.PI / 8 + Math.sin(elapsedTime + index) * 0.1
        })
        
        // Animate point lights with floating motion
        lights.pointLights.forEach((light, index) => {
          light.position.y += Math.sin(elapsedTime + index) * 0.03
          light.intensity = 2 + Math.sin(elapsedTime * 3 + index) * 1
          light.position.x += Math.cos(elapsedTime * 0.5 + index) * 0.02
          light.position.z += Math.sin(elapsedTime * 0.5 + index) * 0.02
        })
        
        // Animate floating elements with more varied motion
        objects.floatingElements.children.forEach((element, index) => {
          element.rotation.x += 0.005 + Math.sin(elapsedTime + index) * 0.001
          element.rotation.y += 0.008 + Math.cos(elapsedTime + index) * 0.001
          element.position.y += Math.sin(elapsedTime * 0.5 + index) * 0.02
          element.position.x += Math.cos(elapsedTime * 0.3 + index) * 0.01
          element.position.z += Math.sin(elapsedTime * 0.4 + index) * 0.01
        })
        
        // Animate particles with wave motion
        const positions = objects.particles.geometry.attributes.position.array as Float32Array
        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 1] += Math.sin(elapsedTime * 0.5 + i * 0.1) * 0.02
          positions[i] += Math.cos(elapsedTime * 0.5 + i * 0.1) * 0.01
          positions[i + 2] += Math.sin(elapsedTime * 0.4 + i * 0.1) * 0.01
        }
        objects.particles.geometry.attributes.position.needsUpdate = true
        
        // Rotate particle system slowly
        objects.particles.rotation.y = elapsedTime * 0.05
        
        // Animate water with wave effect
        const waterPositions = objects.water.geometry.attributes.position.array as Float32Array
        for (let i = 0; i < waterPositions.length; i += 3) {
          waterPositions[i + 1] = Math.sin(elapsedTime + waterPositions[i] * 0.1) * 0.3
        }
        objects.water.geometry.attributes.position.needsUpdate = true
        
        // Animate terrain with subtle movement
        const terrainPositions = objects.terrain.geometry.attributes.position.array as Float32Array
        for (let i = 0; i < terrainPositions.length; i += 3) {
          terrainPositions[i + 1] += Math.sin(elapsedTime * 0.2 + terrainPositions[i] * 0.02) * 0.001
        }
        objects.terrain.geometry.attributes.position.needsUpdate = true
        
        // Mouse interaction effect with smoother camera movement
        const mouseInfluence = new THREE.Vector3(mousePosition.x * 8, 0, mousePosition.y * 8)
        camera.position.x += (mouseInfluence.x - camera.position.x) * 0.01
        camera.position.z += (mouseInfluence.z - camera.position.z) * 0.01
        
        // Rotate skybox slowly
        objects.skybox.rotation.y = elapsedTime * 0.02
        
        renderer.render(scene, camera)
        sceneRef.current.animationId = requestAnimationFrame(animate)
      }
      
      console.log('🚀 Starting animation loop...')
      animate()

      // Handle window resize
      const handleResize = () => {
        if (!sceneRef.current) return
        
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
      }
      
      window.addEventListener('resize', handleResize)
      
      // Mark as loaded
      setTimeout(() => {
        console.log('✅ 3D scene fully loaded and ready!')
        setIsLoaded(true)
        onSceneLoaded?.()
      }, 1500)

      // Cleanup
      return () => {
        console.log('🧹 Cleaning up 3D scene...')
        window.removeEventListener('resize', handleResize)
        
        if (sceneRef.current?.animationId) {
          cancelAnimationFrame(sceneRef.current.animationId)
        }
        
        if (sceneRef.current?.renderer && mountRef.current) {
          mountRef.current.removeChild(sceneRef.current.renderer.domElement)
          sceneRef.current.renderer.dispose()
        }
        
        // Dispose of geometries and materials
        if (sceneRef.current?.scene) {
          sceneRef.current.scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
              object.geometry.dispose()
              if (Array.isArray(object.material)) {
                object.material.forEach(material => material.dispose())
              } else {
                object.material.dispose()
              }
            }
          })
        }
      }
    } catch (error) {
      console.error('❌ Error initializing 3D scene:', error)
      // Fallback: show a simple message
      setIsLoaded(true)
      onSceneLoaded?.()
    }
  }, [onSceneLoaded])

  // Handle mouse movement for interactivity
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className={`interactive-splash-scene ${className}`}>
      <div 
        ref={mountRef} 
        className="scene-container absolute inset-0 w-full h-full"
        style={{ zIndex: 1 }}
      />
      
      {/* Enhanced loading overlay */}
      {!isLoaded && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: isLoaded ? 0 : 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center z-50"
        >
          <div className="text-center">
            <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-white text-2xl font-light mb-2">Initializing Fifth Dimension</p>
            <p className="text-purple-300 text-sm opacity-75">Creating immersive 3D world...</p>
          </div>
        </motion.div>
      )}

      {/* Enhanced interactive hints */}
      {isLoaded && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 left-8 text-white z-10"
        >
          <div className="bg-black/60 backdrop-blur-md rounded-xl p-5 space-y-3 border border-purple-500/20">
            <h3 className="text-sm font-medium text-purple-300">🎮 Controls</h3>
            <div className="space-y-2 text-xs opacity-80">
              <p>🖱️ Drag to explore the 3D world</p>
              <p>🔄 Auto-rotating view</p>
              <p>✨ Move mouse for dynamic effects</p>
              <p>🔍 Scroll to zoom in/out</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}