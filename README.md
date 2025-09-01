# 🌟 Fifth Dimension - Immersive 3D Interactive World

A cutting-edge, Vegas-style 3D world built with **Three.js**, **React**, and **TypeScript** that creates an immersive digital entertainment experience.

## 🚀 Features

### ✨ **Enhanced 3D Environment**
- **Dynamic Skybox**: 300-unit spherical environment for infinite depth perception
- **Animated Terrain**: 200x200 terrain with height variations using sine wave algorithms
- **Interactive Water**: 150x150 animated water plane with wave effects
- **Floating Platforms**: 8 cylindrical platforms at various heights for exploration

### 🏗️ **Futuristic Cityscape**
- **20+ Buildings**: Varied architectural styles with random dimensions and heights
- **Glowing Windows**: Dynamic neon lighting effects on building facades
- **Antennas & Spires**: Architectural details added to 30% of buildings
- **Shadow Casting**: Realistic shadows with 4096x4096 resolution shadow maps

### 💫 **Advanced Particle System**
- **2000 Particles**: Atmospheric effects with dynamic wave motion
- **Variable Sizing**: Random particle sizes with size attenuation
- **Color Variations**: HSL-based color system for vibrant visual effects
- **Performance Optimized**: Efficient buffer geometry with minimal draw calls

### 🎭 **Dynamic Lighting System**
- **Hemisphere Lighting**: Natural sky/ground color influence
- **6 Neon Spot Lights**: Vegas-style rotating lights with dynamic intensity
- **12 Floating Point Lights**: Atmospheric lighting with shadow casting
- **Enhanced Shadows**: PCF soft shadows with optimized bias settings

### 🎮 **Interactive Elements**
- **30 Floating Shapes**: Octahedrons, tetrahedrons, torus knots, and more
- **Mouse Interaction**: Dynamic camera movement based on mouse position
- **Smooth Controls**: OrbitControls with damping and auto-rotation
- **Responsive Design**: Adapts to window resizing with proper aspect ratios

### 🎨 **Visual Enhancements**
- **ACES Filmic Tone Mapping**: Cinematic color grading
- **sRGB Color Space**: Proper color management
- **High-Performance Rendering**: WebGL with antialiasing and depth testing
- **Smooth Animations**: 60fps animation loop with optimized updates

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **3D Engine**: Three.js v0.169.0
- **Controls**: OrbitControls from three-stdlib
- **Styling**: Tailwind CSS + Framer Motion
- **Build Tool**: Vite 5
- **Package Manager**: pnpm
- **Database**: Supabase (ready for integration)
- **Payment**: Stripe integration ready

## 📦 Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd fifth-dimension

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## 🎯 Usage

### **Development Mode**
```bash
pnpm dev
```
The app will be available at `http://localhost:3000` (or next available port)

### **Production Build**
```bash
pnpm build
pnpm preview
```

### **3D Scene Controls**
- **🖱️ Drag**: Rotate the camera around the 3D world
- **🔍 Scroll**: Zoom in/out
- **✨ Mouse Movement**: Dynamic camera effects
- **🔄 Auto-rotation**: Continuous world exploration

## 🏗️ Project Structure

```
src/
├── components/
│   ├── 3d/
│   │   └── InteractiveSplashScene.tsx  # Enhanced 3D world
│   ├── arcade/                          # Gaming components
│   ├── store/                           # E-commerce features
│   └── Navigation.tsx                   # Main navigation
├── contexts/                             # React contexts
├── pages/                               # Route components
├── types/                               # TypeScript definitions
└── lib/                                 # Utility functions
```

## 🌟 Key Components

### **InteractiveSplashScene.tsx**
The heart of the 3D experience featuring:
- **Scene Management**: Three.js scene with optimized rendering
- **Lighting System**: Multi-layered lighting with shadows
- **Animation Loop**: 60fps updates with smooth transitions
- **Performance Optimization**: Efficient geometry and material management

## 🚀 Performance Features

- **Optimized Rendering**: Efficient draw calls and geometry batching
- **Shadow Optimization**: High-quality shadows with minimal performance impact
- **Memory Management**: Proper disposal of Three.js resources
- **Responsive Design**: Adapts to different screen sizes and devices

## 🔧 Configuration

### **Environment Variables**
Create a `.env` file with:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

### **Three.js Settings**
- **Shadow Quality**: 4096x4096 shadow maps
- **Antialiasing**: Enabled for smooth edges
- **Tone Mapping**: ACES Filmic for cinematic look
- **Color Space**: sRGB for accurate colors

## 🎨 Customization

### **Adding New 3D Elements**
```typescript
// Example: Add a new floating element
const newGeometry = new THREE.SphereGeometry(1, 32, 32)
const newMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 })
const newElement = new THREE.Mesh(newGeometry, newMaterial)
scene.add(newElement)
```

### **Modifying Lighting**
```typescript
// Adjust spot light intensity
lights.spotLights.forEach(light => {
  light.intensity = 5 // Increase brightness
})
```

## 🐛 Troubleshooting

### **Common Issues**
1. **WebGL Not Supported**: Check browser compatibility
2. **Performance Issues**: Reduce particle count or shadow quality
3. **Import Errors**: Ensure all dependencies are installed

### **Debug Mode**
Open browser console to see detailed 3D scene initialization logs:
- 🚀 Scene initialization progress
- ✅ Component creation status
- ❌ Error details with stack traces

## 🚀 Future Enhancements

- **Post-Processing Effects**: Bloom, chromatic aberration, vignette
- **VR/AR Support**: WebXR integration
- **Physics Engine**: Realistic object interactions
- **Audio Integration**: 3D spatial audio
- **Multiplayer**: Real-time collaborative experiences

## 📱 Browser Support

- **Chrome**: 90+ (Recommended)
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Three.js Community**: For the amazing 3D library
- **React Team**: For the powerful frontend framework
- **Vite Team**: For the fast build tool
- **Tailwind CSS**: For the utility-first CSS framework

---

**🌟 Experience the future of digital entertainment in an immersive 3D dimension! 🌟**