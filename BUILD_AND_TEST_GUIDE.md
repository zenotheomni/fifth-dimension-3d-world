# 🚀 Unity Integration Build & Test Guide

This guide will walk you through building the Unity project to WebGL and testing the integration with your React app.

## 📋 Prerequisites

- ✅ Unity 2022.3 LTS or later installed
- ✅ WebGL Build Support module installed
- ✅ Git LFS configured
- ✅ All Unity scripts and bridge files created

## 🎯 Step 1: Build Unity Project

### Option A: Manual Build (Recommended for first time)

1. **Open Unity Hub**
   ```bash
   # Unity Hub should be in your Applications folder
   open /Applications/Unity\ Hub.app
   ```

2. **Open the Project**
   - Click "Open" in Unity Hub
   - Navigate to your project folder
   - Select the `UnityProject` folder
   - Wait for Unity to open the project

3. **Configure Build Settings**
   - In Unity, go to `File > Build Settings`
   - Select `WebGL` platform
   - Click `Switch Platform` if needed
   - Set build path to: `../public/unity-build`
   - Click `Build`

### Option B: Command Line Build (Advanced)

If you have Unity command line tools:
```bash
cd /Users/jenks5/Documents/5du
unity -batchmode -quit -projectPath UnityProject -buildTarget WebGL -buildPath public/unity-build
```

## 🔧 Step 2: Verify Build Output

After building, check that these files exist in `public/unity-build/`:

```bash
ls -la public/unity-build/
```

**Required Files:**
- ✅ `Build.data` - Unity data file
- ✅ `Build.framework.js` - Unity framework
- ✅ `Build.loader.js` - Unity loader
- ✅ `Build.wasm` - WebAssembly binary

**Optional Files:**
- `StreamingAssets/` - Audio/video assets
- `index.html` - Unity's default HTML (we'll use our own)

## 🧪 Step 3: Test Unity Integration

### Quick Test (HTML)
1. **Open the test file:**
   ```bash
   open test-unity-integration.html
   ```

2. **Run tests:**
   - Click "Test Unity Context"
   - Click "Test Event Handlers"
   - Click on doors to test navigation
   - Check the test log for results

### Full Test (React App)
1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Open in browser:**
   - Navigate to `http://localhost:3000`
   - Test Unity integration in your app

## 🎮 Step 4: Test Unity-React Communication

### Test Door Navigation
1. **In Unity scene:**
   - Click on the cyan arcade door
   - Click on the magenta record store door
   - Click on the green ballroom door

2. **Expected behavior:**
   - Unity should call `FD_OnDoorEnter(key)`
   - React should receive `fd:open` event
   - App should navigate to corresponding route

### Test Game Start
1. **In Unity scene:**
   - Use the `startGame` method from Unity context
   - Or trigger game start through Unity scripts

2. **Expected behavior:**
   - Unity should call `FD_OnGameStart(gameName)`
   - React should receive `fd:game-start` event
   - App should handle game initialization

## 🔍 Step 5: Debug Common Issues

### Unity Not Loading
```bash
# Check browser console for errors
# Verify WebGL support
# Check CORS headers in Vite config
```

### Communication Not Working
```bash
# Verify FDBridge.jslib is in Unity project
# Check Unity console for script errors
# Verify GameObject names match SendMessage calls
```

### Build Errors
```bash
# Check Unity console for build errors
# Verify WebGL module is installed
# Check build path permissions
```

## 📊 Step 6: Run Integration Tests

### File Structure Test
```bash
npm run test:unity
```

**Expected Output:**
```
🧪 Testing Unity Integration Setup...

1. Checking Unity Build Files...
   📁 Unity build directory exists
   ✅ Build.data exists
   ✅ Build.framework.js exists
   ✅ Build.loader.js exists
   ✅ Build.wasm exists

2. Checking Unity Bridge Files...
   ✅ Assets/Plugins/WebGL/FDBridge.jslib exists
   ✅ Assets/Scripts/DoorPortal.cs exists
   ✅ Assets/Scripts/LobbyManager.cs exists

3. Checking Vite Configuration...
   ✅ CORS headers are configured
   ✅ COEP headers are configured

4. Checking Unity Context...
   ✅ focusDoor method is implemented
   ✅ startGame method is implemented
   ✅ onDoorEnter handler is implemented

5. Checking Git LFS Configuration...
   ✅ MP4 files are tracked with LFS
   ✅ FBX files are tracked with LFS
   ✅ Unity scene files are tracked with LFS

6. Checking NeonRunner Component...
   ✅ useRef pattern is implemented
   ✅ mountRef is properly configured

🏁 Unity Integration Setup Test Complete!
```

### Browser Test
1. **Open test HTML file**
2. **Run all test functions**
3. **Verify event handling**
4. **Check Unity communication**

## 🎯 Step 7: Integration Verification

### Unity Scene Test
- [ ] Scene loads without errors
- [ ] Doors are visible and clickable
- [ ] Camera controls work properly
- [ ] Performance is acceptable

### React Integration Test
- [ ] Unity context loads properly
- [ ] Door navigation works
- [ ] Game start coordination works
- [ ] Events are properly dispatched

### WebGL Performance Test
- [ ] Scene renders at 60fps
- [ ] Memory usage is reasonable
- [ ] Loading time is acceptable
- [ ] Mobile performance is good

## 🚀 Step 8: Production Deployment

### Build Production Version
```bash
# Build React app
npm run build

# Unity build should already be in public/unity-build/
# Deploy the entire dist/ folder
```

### Performance Optimization
1. **Unity Settings:**
   - Reduce texture quality
   - Enable compression
   - Set appropriate memory limits
   - Use LOD systems

2. **WebGL Settings:**
   - Enable compression
   - Optimize build size
   - Test on target devices

## 🐛 Troubleshooting Guide

### Build Issues
| Issue | Solution |
|-------|----------|
| WebGL module missing | Install via Unity Hub |
| Build path error | Check permissions and path |
| Script compilation errors | Fix C# syntax errors |
| Missing dependencies | Verify all scripts are in Assets |

### Runtime Issues
| Issue | Solution |
|-------|----------|
| Unity not loading | Check WebGL support and CORS |
| Communication failing | Verify bridge files and names |
| Performance problems | Reduce polygon count and textures |
| Mobile issues | Test on actual devices |

### Integration Issues
| Issue | Solution |
|-------|----------|
| React not receiving events | Check event listener setup |
| Navigation not working | Verify route configuration |
| Context not available | Check Unity provider setup |

## 📚 Additional Resources

### Unity Documentation
- [Unity WebGL Build Guide](https://docs.unity3d.com/Manual/webgl.html)
- [WebGL Performance Tips](https://docs.unity3d.com/Manual/webgl-performance.html)
- [WebGL Troubleshooting](https://docs.unity3d.com/Manual/webgl-troubleshooting.html)

### React Integration
- [Unity Context Documentation](UNITY_SETUP.md)
- [Implementation Summary](IMPLEMENTATION_SUMMARY.md)
- [Test Scripts](scripts/test-unity-integration.js)

### Testing Tools
- [Unity Integration Test](test-unity-integration.html)
- [File Structure Test](npm run test:unity)
- [Browser DevTools](Console, Network, Performance tabs)

## 🎉 Success Criteria

Your Unity integration is working when:

1. ✅ Unity WebGL build loads in browser
2. ✅ Unity-React communication works
3. ✅ Door navigation functions properly
4. ✅ Game coordination is functional
5. ✅ Performance meets requirements
6. ✅ All tests pass successfully

## 🚀 Next Steps

After successful integration:

1. **Design detailed Unity scenes**
2. **Add animations and effects**
3. **Implement game mechanics**
4. **Optimize for production**
5. **Add mobile support**
6. **Create deployment pipeline**

---

**Need Help?** Check the troubleshooting section or run the test scripts to identify specific issues. 