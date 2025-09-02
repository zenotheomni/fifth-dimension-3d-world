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

interface Obstacle {
  mesh: THREE.Mesh;
  type: string;
  lane: number;
  position: number;
}

interface PowerUp {
  mesh: THREE.Mesh;
  type: string;
  lane: number;
  position: number;
}

interface Collectible {
  mesh: THREE.Mesh;
  type: string;
  value: number;
  lane: number;
  position: number;
}

const NeonRunner: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  
  const gameStateRef = useRef<GameState>({
    isPlaying: false,
    score: 0,
    health: 3,
    currentLane: 1,
    gameSpeed: 20,
    isInvincible: false,
    activePowerUps: []
  });

  const playerRef = useRef<THREE.Group | null>(null);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const collectiblesRef = useRef<Collectible[]>([]);
  const particlesRef = useRef<THREE.Points | null>(null);
  
  const animationIdRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const obstacleSpawnTimerRef = useRef<number>(0);
  const powerUpSpawnTimerRef = useRef<number>(0);
  const collectibleSpawnTimerRef = useRef<number>(0);

  // Game configuration
  const config = {
    playerSpeed: 15,
    gameSpeed: 20,
    laneWidth: 4,
    maxLanes: 3,
    gravity: -25,
    jumpForce: 15,
    slideDuration: 0.5,
    invincibilityTime: 2.0,
    trackLength: 1000,
    trackWidth: 12
  };

  // Initialize the 3D scene
  const initScene = useCallback(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000011);
    scene.fog = new THREE.Fog(0x000011, 50, 200);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 15, 30);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = false; // Disable for runner game
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x001122, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ffff, 0.8);
    directionalLight.position.set(0, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xff00ff, 1.0, 20);
    pointLight.position.set(0, 5, 0);
    pointLight.castShadow = true;
    scene.add(pointLight);

    // Create track
    createTrack(scene);

    // Create player
    createPlayer(scene);

    // Create background particles
    createBackgroundParticles(scene);

    // Create skybox
    createSkybox(scene);

    mountRef.current.appendChild(renderer.domElement);
  }, []);

  // Create the neon track
  const createTrack = (scene: THREE.Scene) => {
    const trackGeometry = new THREE.PlaneGeometry(config.trackWidth, config.trackLength);
    const trackMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x001122,
      transparent: true,
      opacity: 0.8
    });
    
    const track = new THREE.Mesh(trackGeometry, trackMaterial);
    track.rotation.x = -Math.PI / 2;
    track.position.z = -config.trackLength / 2;
    track.receiveShadow = true;
    scene.add(track);

    // Add neon lines on track
    for (let i = 0; i < config.trackLength; i += 10) {
      const lineGeometry = new THREE.PlaneGeometry(config.trackWidth, 0.1);
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
  };

  // Create the player character
  const createPlayer = (scene: THREE.Scene) => {
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
    const trailGeometry = new THREE.SphereGeometry(0.1, 4, 4);
    const trailMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00ffff,
      transparent: true,
      opacity: 0.5
    });
    
    for (let i = 0; i < 10; i++) {
      const trail = new THREE.Mesh(trailGeometry, trailMaterial);
      trail.position.set(0, 0.3, 0.5 + i * 0.3);
      trail.scale.setScalar(1 - i * 0.1);
      playerGroup.add(trail);
    }

    playerGroup.position.set(0, 0, 0);
    scene.add(playerGroup);
    playerRef.current = playerGroup;
  };

  // Create background particles
  const createBackgroundParticles = (scene: THREE.Scene) => {
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = Math.random() * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;

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
    particlesRef.current = particles;
  };

  // Create skybox
  const createSkybox = (scene: THREE.Scene) => {
    const skyboxGeometry = new THREE.SphereGeometry(300, 32, 32);
    const skyboxMaterial = new THREE.MeshBasicMaterial({
      color: 0x000033,
      side: THREE.BackSide
    });
    
    const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
    scene.add(skybox);
  };

  // Spawn obstacles
  const spawnObstacle = () => {
    if (!sceneRef.current) return;

    const obstacleTypes = [
      { name: 'neon_barrier', scale: [1.0, 2.0, 0.3], color: 0xff0000 },
      { name: 'laser_wall', scale: [4.0, 0.1, 0.1], color: 0xff00ff },
      { name: 'energy_field', scale: [3.0, 3.0, 0.1], color: 0xffff00 }
    ];

    const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    const lane = Math.floor(Math.random() * config.maxLanes);
    const laneX = (lane - 1) * config.laneWidth;

    const geometry = new THREE.BoxGeometry(...type.scale);
    const material = new THREE.MeshLambertMaterial({ 
      color: type.color,
      emissive: type.color,
      emissiveIntensity: 0.5
    });

    const obstacle = new THREE.Mesh(geometry, material);
    obstacle.position.set(laneX, type.scale[1] / 2, -100);
    obstacle.castShadow = true;
    obstacle.receiveShadow = true;

    sceneRef.current.add(obstacle);
    
    obstaclesRef.current.push({
      mesh: obstacle,
      type: type.name,
      lane: lane,
      position: -100
    });
  };

  // Spawn power-ups
  const spawnPowerUp = () => {
    if (!sceneRef.current) return;

    const powerUpTypes = [
      { name: 'speed_boost', scale: [0.5, 0.5, 0.5], color: 0x00ff00 },
      { name: 'shield', scale: [0.6, 0.6, 0.6], color: 0x0088ff },
      { name: 'magnet', scale: [0.5, 0.5, 0.5], color: 0xff8800 }
    ];

    const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
    const lane = Math.floor(Math.random() * config.maxLanes);
    const laneX = (lane - 1) * config.laneWidth;

    const geometry = new THREE.SphereGeometry(0.3, 8, 6);
    const material = new THREE.MeshLambertMaterial({ 
      color: type.color,
      emissive: type.color,
      emissiveIntensity: 0.8
    });

    const powerUp = new THREE.Mesh(geometry, material);
    powerUp.position.set(laneX, 1, -100);
    powerUp.castShadow = true;

    sceneRef.current.add(powerUp);
    
    powerUpsRef.current.push({
      mesh: powerUp,
      type: type.name,
      lane: lane,
      position: -100
    });
  };

  // Spawn collectibles
  const spawnCollectible = () => {
    if (!sceneRef.current) return;

    const collectibleTypes = [
      { name: 'coin', scale: [0.3, 0.3, 0.1], color: 0xffff00, value: 10 },
      { name: 'gem', scale: [0.4, 0.4, 0.4], color: 0xff00ff, value: 50 }
    ];

    const type = collectibleTypes[Math.floor(Math.random() * collectibleTypes.length)];
    const lane = Math.floor(Math.random() * config.maxLanes);
    const laneX = (lane - 1) * config.laneWidth;

    const geometry = type.name === 'coin' 
      ? new THREE.CylinderGeometry(0.15, 0.15, 0.1, 8)
      : new THREE.OctahedronGeometry(0.2);
    
    const material = new THREE.MeshLambertMaterial({ 
      color: type.color,
      emissive: type.color,
      emissiveIntensity: 0.6
    });

    const collectible = new THREE.Mesh(geometry, material);
    collectible.position.set(laneX, 1, -100);
    collectible.castShadow = true;

    sceneRef.current.add(collectible);
    
    collectiblesRef.current.push({
      mesh: collectible,
      type: type.name,
      value: type.value,
      lane: lane,
      position: -100
    });
  };

  // Game loop
  const gameLoop = useCallback((time: number) => {
    if (!sceneRef.current || !rendererRef.current || !cameraRef.current) return;

    const deltaTime = (time - lastTimeRef.current) / 1000;
    lastTimeRef.current = time;

    if (gameStateRef.current.isPlaying) {
      // Update game speed
      gameStateRef.current.gameSpeed += deltaTime * 0.1;

      // Spawn obstacles
      obstacleSpawnTimerRef.current += deltaTime;
      if (obstacleSpawnTimerRef.current > 2.0 / gameStateRef.current.gameSpeed) {
        spawnObstacle();
        obstacleSpawnTimerRef.current = 0;
      }

      // Spawn power-ups
      powerUpSpawnTimerRef.current += deltaTime;
      if (powerUpSpawnTimerRef.current > 5.0) {
        spawnPowerUp();
        powerUpSpawnTimerRef.current = 0;
      }

      // Spawn collectibles
      collectibleSpawnTimerRef.current += deltaTime;
      if (collectibleSpawnTimerRef.current > 1.0) {
        spawnCollectible();
        collectibleSpawnTimerRef.current = 0;
      }

      // Update obstacles
      updateObstacles(deltaTime);

      // Update power-ups
      updatePowerUps(deltaTime);

      // Update collectibles
      updateCollectibles(deltaTime);

      // Update score
      gameStateRef.current.score += Math.floor(deltaTime * 10);

      // Check collisions
      checkCollisions();
    }

    // Update particles
    if (particlesRef.current) {
      particlesRef.current.rotation.y += deltaTime * 0.1;
    }

    // Render
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    animationIdRef.current = requestAnimationFrame(gameLoop);
  }, []);

  // Update obstacles
  const updateObstacles = (deltaTime: number) => {
    obstaclesRef.current.forEach((obstacle, index) => {
      obstacle.position += gameStateRef.current.gameSpeed * deltaTime;
      obstacle.mesh.position.z = obstacle.position;

      // Remove obstacles that are too far behind
      if (obstacle.position > 50) {
        sceneRef.current?.remove(obstacle.mesh);
        obstaclesRef.current.splice(index, 1);
      }

             // Animate obstacles
       obstacle.mesh.rotation.y += deltaTime * 2;
       if (obstacle.type === 'laser_wall') {
         obstacle.mesh.material.emissiveIntensity = 0.5 + Math.sin(Date.now() * 0.01) * 0.3;
       }
    });
  };

  // Update power-ups
  const updatePowerUps = (deltaTime: number) => {
    powerUpsRef.current.forEach((powerUp, index) => {
      powerUp.position += gameStateRef.current.gameSpeed * deltaTime;
      powerUp.mesh.position.z = powerUp.position;

      // Remove power-ups that are too far behind
      if (powerUp.position > 50) {
        sceneRef.current?.remove(powerUp.mesh);
        powerUpsRef.current.splice(index, 1);
      }

      // Animate power-ups
      powerUp.mesh.rotation.y += deltaTime * 3;
      powerUp.mesh.position.y = 1 + Math.sin(time * 5) * 0.2;
    });
  };

  // Update collectibles
  const updateCollectibles = (deltaTime: number) => {
    collectiblesRef.current.forEach((collectible, index) => {
      collectible.position += gameStateRef.current.gameSpeed * deltaTime;
      collectible.mesh.position.z = collectible.position;

      // Remove collectibles that are too far behind
      if (collectible.position > 50) {
        sceneRef.current?.remove(collectible.mesh);
        collectiblesRef.current.splice(index, 1);
      }

      // Animate collectibles
      collectible.mesh.rotation.y += deltaTime * 4;
      collectible.mesh.position.y = 1 + Math.sin(time * 6) * 0.3;
    });
  };

  // Check collisions
  const checkCollisions = () => {
    if (!playerRef.current || gameStateRef.current.isInvincible) return;

    const playerPosition = playerRef.current.position;
    const playerBounds = new THREE.Box3().setFromObject(playerRef.current);

    // Check obstacle collisions
    obstaclesRef.current.forEach(obstacle => {
      const obstacleBounds = new THREE.Box3().setFromObject(obstacle.mesh);
      if (playerBounds.intersectsBox(obstacleBounds)) {
        handleCollision('obstacle');
      }
    });

    // Check power-up collisions
    powerUpsRef.current.forEach((powerUp, index) => {
      const powerUpBounds = new THREE.Box3().setFromObject(powerUp.mesh);
      if (playerBounds.intersectsBox(powerUpBounds)) {
        handlePowerUp(powerUp.type);
        sceneRef.current?.remove(powerUp.mesh);
        powerUpsRef.current.splice(index, 1);
      }
    });

    // Check collectible collisions
    collectiblesRef.current.forEach((collectible, index) => {
      const collectibleBounds = new THREE.Box3().setFromObject(collectible.mesh);
      if (playerBounds.intersectsBox(collectibleBounds)) {
        gameStateRef.current.score += collectible.value;
        sceneRef.current?.remove(collectible.mesh);
        collectiblesRef.current.splice(index, 1);
      }
    });
  };

  // Handle collisions
  const handleCollision = (type: string) => {
    if (gameStateRef.current.isInvincible) return;

    gameStateRef.current.health--;
    
    if (gameStateRef.current.health <= 0) {
      gameOver();
    } else {
      // Make player invincible temporarily
      gameStateRef.current.isInvincible = true;
      setTimeout(() => {
        gameStateRef.current.isInvincible = false;
      }, gameStateRef.current.invincibilityTime * 1000);
    }
  };

  // Handle power-ups
  const handlePowerUp = (type: string) => {
    switch (type) {
      case 'speed_boost':
        gameStateRef.current.gameSpeed *= 1.5;
        setTimeout(() => {
          gameStateRef.current.gameSpeed /= 1.5;
        }, 5000);
        break;
      case 'shield':
        gameStateRef.current.isInvincible = true;
        setTimeout(() => {
          gameStateRef.current.isInvincible = false;
        }, 8000);
        break;
      case 'magnet':
        // Attract nearby collectibles
        break;
    }
    
    gameStateRef.current.activePowerUps.push(type);
  };

  // Game over
  const gameOver = () => {
    gameStateRef.current.isPlaying = false;
    console.log('Game Over! Final Score:', gameStateRef.current.score);
  };

  // Start game
  const startGame = () => {
    gameStateRef.current.isPlaying = true;
    gameStateRef.current.score = 0;
    gameStateRef.current.health = 3;
    gameStateRef.current.gameSpeed = 20;
    gameStateRef.current.isInvincible = false;
    gameStateRef.current.activePowerUps = [];
  };

  // Handle keyboard input
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!playerRef.current) return;

    switch (event.code) {
      case 'ArrowLeft':
        if (gameStateRef.current.currentLane > 0) {
          gameStateRef.current.currentLane--;
          const targetX = (gameStateRef.current.currentLane - 1) * config.laneWidth;
          playerRef.current.position.x = targetX;
        }
        break;
      case 'ArrowRight':
        if (gameStateRef.current.currentLane < config.maxLanes - 1) {
          gameStateRef.current.currentLane++;
          const targetX = (gameStateRef.current.currentLane - 1) * config.laneWidth;
          playerRef.current.position.x = targetX;
        }
        break;
      case 'Space':
        // Jump logic would go here
        break;
      case 'ArrowDown':
        // Slide logic would go here
        break;
    }
  }, []);

  // Handle window resize
  const handleResize = useCallback(() => {
    if (!cameraRef.current || !rendererRef.current) return;

    cameraRef.current.aspect = window.innerWidth / window.innerHeight;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
  }, []);

  // Initialize scene and start game loop
  useEffect(() => {
    initScene();
    startGame();
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, [initScene, handleKeyDown, handleResize]);

  // Start game loop
  useEffect(() => {
    if (sceneRef.current && rendererRef.current && cameraRef.current) {
      animationIdRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [gameLoop]);

  return (
    <div className="w-full h-screen relative">
      {/* Game UI */}
      <div className="absolute top-4 left-4 z-10 text-white font-bold text-xl">
        Score: {gameStateRef.current.score}
      </div>
      
      <div className="absolute top-4 right-4 z-10 text-white font-bold text-xl">
        Health: {'❤️'.repeat(gameStateRef.current.health)}
      </div>
      
      <div className="absolute bottom-4 left-4 z-10 text-white font-bold text-lg">
        Speed: {Math.floor(gameStateRef.current.gameSpeed)}
      </div>
      
      <div className="absolute bottom-4 right-4 z-10 text-white font-bold text-lg">
        Lane: {gameStateRef.current.currentLane + 1}
      </div>
      
      {/* Power-up indicators */}
      {gameStateRef.current.activePowerUps.length > 0 && (
        <div className="absolute bottom-20 left-4 z-10 text-white font-bold text-sm">
          Power-ups: {gameStateRef.current.activePowerUps.join(', ')}
        </div>
      )}
      
      {/* Game controls info */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 text-white text-sm text-center">
        <div>← → Move | Space Jump | ↓ Slide</div>
      </div>
      
      {/* 3D Scene Container */}
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Game Over Screen */}
      {!gameStateRef.current.isPlaying && gameStateRef.current.health <= 0 && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-20">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">Game Over!</h1>
            <p className="text-2xl mb-6">Final Score: {gameStateRef.current.score}</p>
            <button 
              onClick={startGame}
              className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg text-xl transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NeonRunner;
