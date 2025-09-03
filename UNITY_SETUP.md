# Unity WebGL Setup Guide

This guide explains how to set up Unity WebGL integration with your React app.

## Prerequisites

- Unity 2022.3 LTS or later
- WebGL Build Support module installed
- Git LFS installed

## Git LFS Setup

First, install and configure Git LFS for large Unity assets:

```bash
# Install Git LFS
git lfs install

# Track large binary files
git lfs track "*.mp4" "*.wav" "*.fbx" "*.psd" "*.unity" "*.prefab"

# Add and commit .gitattributes
git add .gitattributes
git commit -m "chore: enable Git LFS for Unity assets"
```

## Unity Project Setup

### 1. Create Unity Project

1. Create a new 3D project in Unity
2. Set target platform to WebGL
3. Configure WebGL settings for optimal performance

### 2. Add WebGL Bridge

1. Copy `public/unity-build/Assets/Plugins/WebGL/FDBridge.jslib` to your Unity project
2. Place it in `Assets/Plugins/WebGL/` folder
3. This enables communication between Unity and React

### 3. Add Scripts

1. Copy `public/unity-build/Assets/Scripts/DoorPortal.cs` to your Unity project
2. Copy `public/unity-build/Assets/Scripts/LobbyManager.cs` to your Unity project
3. Attach these scripts to appropriate GameObjects in your scene

### 4. Configure Door Portals

1. Create empty GameObjects for each portal
2. Attach `DoorPortal` script
3. Set `destinationKey` to match your React routes:
   - `"record-store"` for record store
   - `"arcade"` for arcade games
   - `"ballroom"` for ballroom
   - `"community-board"` for community features

### 5. Build Settings

1. Go to `File > Build Settings`
2. Select WebGL platform
3. Set build path to `public/unity-build/`
4. Click "Build" to generate WebGL files

## React Integration

### 1. Event Handlers

The Unity context automatically sets up these event handlers:

```typescript
// Door navigation
window.onDoorEnter = (key: string) => {
  document.dispatchEvent(new CustomEvent('fd:open', { detail: key }));
};

// Game start
window.onGameStart = (gameName: string) => {
  document.dispatchEvent(new CustomEvent('fd:game-start', { detail: gameName }));
};

// Unity ready
window.onUnityReady = () => {
  document.dispatchEvent(new CustomEvent('fd:unity-ready'));
};
```

### 2. Sending Messages to Unity

```typescript
import { useUnity } from '@/contexts/UnityContext';

const { focusDoor, startGame } = useUnity();

// Focus on a specific door
focusDoor('arcade');

// Start a game
startGame('neon-runner');
```

### 3. Listening for Unity Events

```typescript
useEffect(() => {
  const handleDoorOpen = (event: CustomEvent) => {
    const destination = event.detail;
    // Navigate to destination
    navigate(`/${destination}`);
  };

  const handleGameStart = (event: CustomEvent) => {
    const gameName = event.detail;
    // Handle game start
    console.log(`Starting game: ${gameName}`);
  };

  document.addEventListener('fd:open', handleDoorOpen);
  document.addEventListener('fd:game-start', handleGameStart);

  return () => {
    document.removeEventListener('fd:open', handleDoorOpen);
    document.removeEventListener('fd:game-start', handleGameStart);
  };
}, []);
```

## Vite Configuration

The Vite config includes necessary headers for Unity WebGL:

```typescript
server: {
  headers: {
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp'
  }
}
```

These headers enable SharedArrayBuffer support required by Unity WebGL.

## Troubleshooting

### Unity Not Loading

1. Check browser console for errors
2. Verify WebGL support: `window.WebGLRenderingContext`
3. Check Unity build files are in correct location
4. Ensure CORS headers are set correctly

### Communication Issues

1. Verify `FDBridge.jslib` is in Unity project
2. Check Unity console for script errors
3. Ensure GameObject names match in `SendMessage` calls
4. Test with simple messages first

### Performance Issues

1. Reduce polygon count in Unity models
2. Optimize textures and materials
3. Use LOD (Level of Detail) systems
4. Enable Unity's built-in optimizations

## File Structure

```
public/
  unity-build/
    Build.data
    Build.framework.js
    Build.loader.js
    Build.wasm
    Assets/
      Plugins/
        WebGL/
          FDBridge.jslib
      Scripts/
        DoorPortal.cs
        LobbyManager.cs
```

## Next Steps

1. Build your Unity project to WebGL
2. Test door navigation between scenes
3. Implement game-specific logic
4. Add visual effects and animations
5. Optimize for mobile devices

## Support

For issues with Unity WebGL:
- Check Unity WebGL documentation
- Review browser compatibility
- Test in different browsers
- Check Unity forum for WebGL-specific issues 