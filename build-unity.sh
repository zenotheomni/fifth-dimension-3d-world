#!/bin/bash

echo "🚀 Unity WebGL Build Script"
echo "=========================="

# Check if Unity is available
if [ -d "/Applications/Unity" ]; then
    echo "✅ Unity found at /Applications/Unity"
    UNITY_PATH="/Applications/Unity"
elif [ -d "/Applications/Unity Hub.app" ]; then
    echo "✅ Unity Hub found"
    echo "⚠️  Please open Unity Hub and create a new project or open existing project"
    echo "⚠️  Then build to WebGL manually"
    exit 1
else
    echo "❌ Unity not found. Please install Unity first."
    exit 1
fi

# Check if Unity project exists
if [ ! -d "UnityProject" ]; then
    echo "❌ UnityProject directory not found"
    echo "Creating Unity project structure..."
    mkdir -p UnityProject/Assets/{Scripts,Plugins/WebGL,Scenes,Materials,Prefabs}
    echo "✅ Unity project structure created"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Open Unity Hub"
echo "2. Click 'Open' and select the 'UnityProject' folder"
echo "3. Wait for Unity to open the project"
echo "4. In Unity, go to File > Build Settings"
echo "5. Select 'WebGL' platform"
echo "6. Click 'Switch Platform' if needed"
echo "7. Set build path to: $(pwd)/public/UnityBuild"
echo "8. Click 'Build'"
echo ""
echo "🔧 Alternative: Use Unity command line build"
echo "If you have Unity command line tools:"
echo "unity -batchmode -quit -projectPath $(pwd)/UnityProject -buildTarget WebGL -buildPath $(pwd)/public/UnityBuild"
echo ""

# Create the target directory
mkdir -p public/UnityBuild

echo "✅ Ready for Unity build!"
echo "📁 Target directory: public/UnityBuild"
echo "📁 Unity will create: public/UnityBuild/Build/"
echo "📁 Expected files: FifthDimension.data, FifthDimension.framework.js, etc."
echo ""
echo "🎯 After building, run: npm run dev"
echo "🎯 Then test Unity integration in the browser" 