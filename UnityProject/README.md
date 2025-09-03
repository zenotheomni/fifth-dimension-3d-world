# Unity Project for Fifth Dimension

This Unity project provides the 3D world and WebGL integration for the Fifth Dimension React app.

## 🚀 Quick Start

### 1. Open in Unity
1. Open Unity Hub
2. Click "Open" 
3. Select the `UnityProject` folder
4. Wait for Unity to open the project

### 2. Build to WebGL
1. In Unity, go to `File > Build Settings`
2. Select `WebGL` platform
3. Click `Switch Platform` if needed
4. Set build path to: `../public/unity-build`
5. Click `Build`

## 📁 Project Structure

```
UnityProject/
├── Assets/
│   ├── Scripts/
│   │   ├── SimpleDoor.cs          # Simple door interaction
│   │   ├── TestSceneSetup.cs      # Auto-scene setup
│   │   ├── DoorPortal.cs          # Advanced door system
│   │   └── LobbyManager.cs        # Scene management
│   ├── Plugins/
│   │   └── WebGL/
│   │       └── FDBridge.jslib     # Unity-React bridge
│   ├── Scenes/
│   │   └── Lobby.unity            # Main lobby scene
│   ├── Materials/                  # Materials and textures
│   └── Prefabs/                   # Reusable objects
└── ProjectSettings/                # Unity project settings
```

## 🎮 Scene Setup

The `TestSceneSetup.cs` script automatically creates:
- **Floor**: Large plane as the base
- **Walls**: 4 walls around the scene
- **Doors**: Interactive doors to different areas:
  - 🎮 **Arcade Door** (Cyan) → `arcade`
  - 🎵 **Record Store Door** (Magenta) → `record-store`
  - 💃 **Ballroom Door** (Green) → `ballroom`
- **Decorations**: Center platform and colored cubes

## 🔧 Scripts

### SimpleDoor.cs
- Basic door interaction with mouse clicks
- Color pulsing animation
- WebGL bridge integration
- Hover effects

### TestSceneSetup.cs
- Automatically sets up the test scene
- Creates all necessary objects
- Configurable materials
- Can be run manually via context menu

### DoorPortal.cs (Advanced)
- Proximity-based interaction
- Visual feedback systems
- Particle effects
- Advanced camera control

### LobbyManager.cs
- Camera management
- Door focusing system
- Input handling
- Game coordination

## 🌐 WebGL Integration

### Bridge Functions
The `FDBridge.jslib` provides these functions:
- `FD_OnDoorEnter(key)` - Door navigation
- `FD_OnGameStart(gameName)` - Game start
- `FD_OnPurchaseRequest(productId)` - Purchase requests
- `FD_OnUnityReady()` - Unity ready notification
- `FD_OnSceneLoaded(sceneName)` - Scene loading

### React Communication
Unity communicates with React through:
1. **Direct function calls** via the bridge
2. **Custom events** dispatched to the DOM
3. **Message passing** through the Unity context

## 🎯 Testing

### In Unity Editor
1. Open the Lobby scene
2. The scene will auto-setup
3. Click on doors to test interaction
4. Check console for debug messages

### In WebGL Build
1. Build to WebGL
2. Open in browser
3. Test door navigation
4. Verify Unity-React communication

## 🔧 Customization

### Adding New Doors
1. Create a new GameObject
2. Add `SimpleDoor` component
3. Set `destinationKey` to match React route
4. Position in the scene

### Modifying Scene
1. Edit `TestSceneSetup.cs`
2. Add new objects in appropriate methods
3. Customize materials and colors
4. Test in Unity editor

### WebGL Settings
1. Go to `Edit > Project Settings > Player`
2. Select WebGL platform
3. Configure compression and quality
4. Set memory limits appropriately

## 🐛 Troubleshooting

### Common Issues
1. **Scripts not working**: Check console for errors
2. **WebGL build fails**: Verify WebGL module is installed
3. **Bridge not working**: Check file paths and names
4. **Performance issues**: Reduce polygon count and textures

### Debug Tips
1. Use Unity console for debugging
2. Check browser console for WebGL errors
3. Verify file paths in build settings
4. Test with simple scenes first

## 📚 Next Steps

1. **Design scenes**: Create detailed environments
2. **Add animations**: Implement character movement
3. **Sound integration**: Add ambient audio
4. **Performance optimization**: Use LOD and occlusion culling
5. **Mobile support**: Optimize for mobile devices

## 🎨 Design Guidelines

- Keep polygon counts reasonable for WebGL
- Use compressed textures (DXT, ETC)
- Implement LOD systems for complex objects
- Test performance on target devices
- Maintain consistent art style with React UI 