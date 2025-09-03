// Unity WebGL Build Configuration
export const UNITY_CONFIG = {
  // Unity build path structure
  buildPath: '/UnityBuild/Build',
  
  // Unity product name (this should match your Unity project settings)
  productName: 'FifthDimension',
  
  // Unity file extensions
  fileExtensions: {
    data: '.data',
    framework: '.framework.js',
    loader: '.loader.js',
    wasm: '.wasm'
  },
  
  // Build company and version info
  companyName: 'FifthDimension',
  productVersion: '1.0.0',
  
  // WebGL settings
  webgl: {
    showBanner: false,
    matchWebGLToCanvasSize: true,
    devicePixelRatio: window.devicePixelRatio || 1
  }
}

// Helper function to get Unity file URLs
export function getUnityFileUrl(fileType: keyof typeof UNITY_CONFIG.fileExtensions): string {
  const { buildPath, productName, fileExtensions } = UNITY_CONFIG
  return `${buildPath}/${productName}${fileExtensions[fileType]}`
}

// Unity build configuration object for UnityLoader
export function getUnityBuildConfig() {
  return {
    dataUrl: getUnityFileUrl('data'),
    frameworkUrl: getUnityFileUrl('framework'),
    codeUrl: getUnityFileUrl('wasm'),
    streamingAssetsUrl: 'StreamingAssets',
    companyName: UNITY_CONFIG.companyName,
    productName: 'Fifth Dimension World',
    productVersion: UNITY_CONFIG.productVersion,
    showBanner: UNITY_CONFIG.webgl.showBanner,
    matchWebGLToCanvasSize: UNITY_CONFIG.webgl.matchWebGLToCanvasSize,
    devicePixelRatio: UNITY_CONFIG.webgl.devicePixelRatio,
  }
} 