import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';

interface GameState {
  isPlaying: boolean;
  score: number;
  health: number;
  currentLane: number;
  gameSpeed: number;
  isInvincible: boolean;
  activePowerUps: string[];
}

const NeonRunner: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  
  // 3D Scene refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const playerRef = useRef<THREE.Group | null>(null);
  const obstaclesRef = useRef<THREE.Mesh[]>([]);
  const trackRef = useRef<THREE.Mesh | null>(null);
  const animationIdRef = useRef<number>();
  
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    score: 0,
    health: 3,
    currentLane: 1,
    gameSpeed: 20,
    isInvincible: false,
    activePowerUps: []
  });

  // Initialize 3D scene
  const initScene = useCallback(() => {
    if (!mountRef.current) {
      console.error('Mount ref not available');
      return;
    }

    console.log('Initializing 3D scene...');
    console.log('Mount element dimensions:', mountRef.current.clientWidth, 'x', mountRef.current.clientHeight);

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000011);
    scene.fog = new THREE.Fog(0x000011, 50, 200);
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 15, 30);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x001122, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ffff, 0.8);
    directionalLight.position.set(0, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xff00ff, 1.0, 20);
    pointLight.position.set(0, 5, 0);
    scene.add(pointLight);

    // Create neon track
    const trackGeometry = new THREE.PlaneGeometry(12, 1000);
    const trackMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x001122,
      transparent: true,
      opacity: 0.8
    });
    const track = new THREE.Mesh(trackGeometry, trackMaterial);
    track.rotation.x = -Math.PI / 2;
    track.position.z = -500;
    track.receiveShadow = true;
    scene.add(track);
    trackRef.current = track;

    // Add neon lines on track
    for (let i = 0; i < 1000; i += 10) {
      const lineGeometry = new THREE.PlaneGeometry(12, 0.1);
      const lineMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ffff,
        transparent: true,
        opacity: 0.6
      });
      const line = new THREE.Mesh(lineGeometry, lineMaterial);
      line.rotation.x = -Math.PI / 2;
      line.position.set(0, 0.01, -i);
      scene.add(line);
    }

    // Create player character
    const playerGroup = new THREE.Group();
    
    // Player body
    const bodyGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.4);
    const bodyMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 0.3
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    body.position.y = 0.6;
    playerGroup.add(body);

    // Player head
    const headGeometry = new THREE.SphereGeometry(0.3, 8, 6);
    const headMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 0.2
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.castShadow = true;
    head.position.y = 1.8;
    playerGroup.add(head);

    // Player trail effect
    for (let i = 0; i < 10; i++) {
      const trailGeometry = new THREE.SphereGeometry(0.1, 4, 4);
      const trailMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ffff,
        transparent: true,
        opacity: 0.5 - (i * 0.05)
      });
      const trail = new THREE.Mesh(trailGeometry, trailMaterial);
      trail.position.set(0, 0.3, 0.5 + i * 0.3);
      trail.scale.setScalar(1 - i * 0.1);
      playerGroup.add(trail);
    }

    playerGroup.position.set(0, 0, 0);
    scene.add(playerGroup);
    playerRef.current = playerGroup;

    // Add background particles
    const particleCount = 500;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = Math.random() * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

      colors[i * 3] = 0.0;     // R
      colors[i * 3 + 1] = 1.0; // G
      colors[i * 3 + 2] = 1.0; // B
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.6
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Add a simple test cube to verify rendering
    const testCubeGeometry = new THREE.BoxGeometry(2, 2, 2);
    const testCubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const testCube = new THREE.Mesh(testCubeGeometry, testCubeMaterial);
    testCube.position.set(0, 5, 0);
    scene.add(testCube);
    console.log('Added test cube at position:', testCube.position);

    // Add to DOM
    console.log('Adding renderer to DOM...');
    try {
      mountRef.current.appendChild(renderer.domElement);
      console.log('Renderer added to DOM successfully');
    } catch (error) {
      console.error('Failed to add renderer to DOM:', error);
      throw error;
    }
    
    console.log('3D scene initialized successfully');
    console.log('Scene objects count:', scene.children.length);
    console.log('Player created:', !!playerRef.current);
    console.log('Track created:', !!trackRef.current);
    
    // Test render to see if it works
    try {
      renderer.render(scene, camera);
      console.log('Test render successful');
    } catch (error) {
      console.error('Test render failed:', error);
    }
  }, []);

  // Game loop
  const gameLoop = useCallback(() => {
    if (!sceneRef.current || !rendererRef.current || !cameraRef.current) {
      console.error('Game loop: Missing required refs');
      return;
    }

    console.log('Game loop running...', Date.now());

    // Update player position based on current lane
    if (playerRef.current) {
      const targetX = (gameState.currentLane - 1) * 4; // 4 units per lane
      playerRef.current.position.x += (targetX - playerRef.current.position.x) * 0.1; // Smooth movement
      
      // Add running animation
      playerRef.current.rotation.y = Math.sin(Date.now() * 0.01) * 0.1;
      playerRef.current.position.y = Math.sin(Date.now() * 0.02) * 0.1;
      
      console.log('Player position:', playerRef.current.position.x, playerRef.current.position.y, playerRef.current.position.z);
    } else {
      console.error('Player ref not available in game loop');
    }

    // Move track to create running effect
    if (trackRef.current) {
      trackRef.current.position.z += gameState.gameSpeed * 0.1;
      if (trackRef.current.position.z > 50) {
        trackRef.current.position.z = -950;
      }
    }

    // Spawn obstacles randomly
    if (Math.random() < 0.02) {
      spawnObstacle();
    }

    // Update obstacles
    updateObstacles();

    // Render scene
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    animationIdRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.currentLane, gameState.gameSpeed]);

  // Spawn obstacle
  const spawnObstacle = () => {
    if (!sceneRef.current) return;

    const lane = Math.floor(Math.random() * 3);
    const laneX = (lane - 1) * 4;

    const obstacleGeometry = new THREE.BoxGeometry(1, 2, 0.3);
    const obstacleMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 0.5
    });

    const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
    obstacle.position.set(laneX, 1, -100);
    obstacle.castShadow = true;
    obstacle.receiveShadow = true;

    sceneRef.current.add(obstacle);
    obstaclesRef.current.push(obstacle);
  };

  // Update obstacles
  const updateObstacles = () => {
    obstaclesRef.current.forEach((obstacle, index) => {
      obstacle.position.z += gameState.gameSpeed * 0.1;
      
      // Remove obstacles that are too far behind
      if (obstacle.position.z > 50) {
        sceneRef.current?.remove(obstacle);
        obstaclesRef.current.splice(index, 1);
      }

      // Animate obstacles
      obstacle.rotation.y += 0.02;
      if (obstacle.material instanceof THREE.MeshLambertMaterial) {
        obstacle.material.emissiveIntensity = 0.5 + Math.sin(Date.now() * 0.01) * 0.3;
      }
    });
  };

  // Simple initialization check
  useEffect(() => {
    console.log('NeonRunner: Component mounted');
    
    // Check WebGL support
    if (!window.WebGLRenderingContext) {
      setError('WebGL not supported in this browser');
      setIsLoading(false);
      return;
    }

    // Initialize 3D scene
    try {
      initScene();
      
      // Simulate loading time and then show game
      const timer = setTimeout(() => {
        console.log('NeonRunner: Loading complete');
        setIsLoading(false);
        setGameStarted(true);
        setGameState(prev => ({ ...prev, isPlaying: true }));
      }, 1000);

      return () => clearTimeout(timer);
    } catch (error) {
      console.error('Error initializing scene:', error);
      setError('Failed to initialize 3D scene');
      setIsLoading(false);
    }
  }, [initScene]);

  // Start game loop using started ref pattern
  useEffect(() => {
    if (!started.current && mountRef.current) {
      started.current = true;
      console.log('Starting game loop...');
      console.log('Scene ref:', !!sceneRef.current);
      console.log('Renderer ref:', !!rendererRef.current);
      console.log('Camera ref:', !!cameraRef.current);
      
      // Add a small delay to ensure everything is ready
      setTimeout(() => {
        console.log('Starting animation loop...');
        if (gameStarted && sceneRef.current && rendererRef.current && cameraRef.current) {
          animationIdRef.current = requestAnimationFrame(gameLoop);
        }
      }, 100);
    }

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [gameStarted, gameLoop]);

  // Handle keyboard input
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    console.log('Key pressed:', event.code);
    
    switch (event.code) {
      case 'ArrowLeft':
        if (gameState.currentLane > 0) {
          setGameState(prev => ({ ...prev, currentLane: prev.currentLane - 1 }));
          console.log('Moved left, current lane:', gameState.currentLane - 1);
        }
        break;
      case 'ArrowRight':
        if (gameState.currentLane < 2) {
          setGameState(prev => ({ ...prev, currentLane: prev.currentLane + 1 }));
          console.log('Moved right, current lane:', gameState.currentLane + 1);
        }
        break;
      case 'Space':
        console.log('Jump!');
        setGameState(prev => ({ ...prev, score: prev.score + 10 }));
        break;
      case 'ArrowDown':
        console.log('Slide!');
        setGameState(prev => ({ ...prev, score: prev.score + 5 }));
        break;
    }
  }, [gameState.currentLane]);

  // Add keyboard listener
  useEffect(() => {
    if (gameStarted) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [gameStarted, handleKeyDown]);

  // Game loop to increase score and speed over time
  useEffect(() => {
    if (!gameStarted) return;

    const gameInterval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        score: prev.score + 1,
        gameSpeed: prev.gameSpeed + 0.01
      }));
    }, 100);

    return () => clearInterval(gameInterval);
  }, [gameStarted]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-black via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-6 animate-pulse">🎮</div>
          <div className="text-3xl font-bold mb-4 text-cyan-400">Loading Neon Runner...</div>
          <div className="text-xl text-gray-300 mb-6">Initializing 3D scene</div>
          <div className="w-64 bg-gray-700 rounded-full h-2">
            <div className="bg-cyan-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-black via-red-900 to-red-800 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-6">❌</div>
          <div className="text-3xl font-bold mb-4">Error Loading Game</div>
          <div className="text-xl text-red-300 mb-6">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors"
          >
            🔄 Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Show game UI
  return (
    <div className="w-full h-screen bg-gradient-to-br from-black via-purple-900 to-blue-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, #00ffff 0%, transparent 50%), radial-gradient(circle at 75% 75%, #ff00ff 0%, transparent 50%)',
          backgroundSize: '100px 100px'
        }}></div>
      </div>

      {/* Game Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-black bg-opacity-50 backdrop-blur-sm p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-cyan-400">🌟 Neon Runner</h1>
          <div className="flex gap-6">
            <div className="text-white">
              Score: <span className="text-yellow-400 font-bold text-xl">{gameState.score}</span>
            </div>
            <div className="text-white">
              Health: <span className="text-red-400 font-bold text-xl">{'❤️'.repeat(gameState.health)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex items-center justify-center pt-20">
        <div className="text-center text-white">
          {/* Lane Display */}
          <div className="mb-8">
            <div className="text-2xl mb-4 text-cyan-400">Current Lane</div>
            <div className="flex gap-4 justify-center">
              {[0, 1, 2].map((lane) => (
                <div
                  key={lane}
                  className={`w-16 h-16 rounded-lg border-4 flex items-center justify-center text-2xl font-bold transition-all ${
                    lane === gameState.currentLane
                      ? 'border-cyan-400 bg-cyan-400 bg-opacity-20 text-cyan-400'
                      : 'border-gray-600 bg-gray-800 text-gray-400'
                  }`}
                >
                  {lane + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Game Stats */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="text-center">
              <div className="text-lg text-gray-300">Speed</div>
              <div className="text-3xl font-bold text-green-400">{Math.floor(gameState.gameSpeed)}</div>
            </div>
            <div className="text-center">
              <div className="text-lg text-gray-300">Power-ups</div>
              <div className="text-3xl font-bold text-purple-400">
                {gameState.activePowerUps.length > 0 ? gameState.activePowerUps.join(', ') : 'None'}
              </div>
            </div>
          </div>

          {/* Controls Info */}
          <div className="bg-black bg-opacity-50 rounded-lg p-6 border border-cyan-500">
            <div className="text-lg text-cyan-400 mb-4">🎮 Game Controls</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-gray-300">
                <span className="text-yellow-400">← →</span> Move between lanes
              </div>
              <div className="text-gray-300">
                <span className="text-yellow-400">Space</span> Jump
              </div>
              <div className="text-gray-300">
                <span className="text-yellow-400">↓</span> Slide
              </div>
              <div className="text-gray-300">
                <span className="text-yellow-400">ESC</span> Pause
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex gap-4">
          <button
            onClick={() => {
              if (gameState.currentLane > 0) {
                setGameState(prev => ({ ...prev, currentLane: prev.currentLane - 1 }));
                console.log('Moved left, current lane:', gameState.currentLane - 1);
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            ← Left
          </button>
          <button
            onClick={() => {
              if (gameState.currentLane < 2) {
                setGameState(prev => ({ ...prev, currentLane: prev.currentLane + 1 }));
                console.log('Moved right, current lane:', gameState.currentLane + 1);
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Right →
          </button>
        </div>
      </div>

      {/* 3D Scene Container */}
      <div ref={mountRef} className="absolute inset-0 z-10" />
      
      {/* Debug Info */}
      <div className="absolute top-20 right-4 text-xs text-gray-500 bg-black bg-opacity-50 p-2 rounded z-30">
        <div>Debug: Component rendered</div>
        <div>Game started: {gameStarted ? 'Yes' : 'No'}</div>
        <div>Current lane: {gameState.currentLane + 1}</div>
        <div>3D Scene: {sceneRef.current ? 'Active' : 'Inactive'}</div>
        <div>Player: {playerRef.current ? 'Visible' : 'Hidden'}</div>
      </div>
    </div>
  );
};

export default NeonRunner;
