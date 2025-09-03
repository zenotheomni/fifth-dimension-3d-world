import React, { useState, useEffect } from 'react'
import { useUnity } from '@/contexts/UnityContext'

export const UnityTestPage: React.FC = () => {
  const { unityInstance, isUnityLoaded, focusDoor, startGame } = useUnity()
  const [testResults, setTestResults] = useState<string[]>([])
  const [unityReady, setUnityReady] = useState(false)

  useEffect(() => {
    if (unityInstance && isUnityLoaded) {
      setUnityReady(true)
      addTestResult('✅ Unity instance loaded successfully')
    }
  }, [unityInstance, isUnityLoaded])

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const testUnityCommunication = () => {
    if (!unityInstance) {
      addTestResult('❌ Unity instance not available')
      return
    }

    try {
      // Test sending message to Unity
      unityInstance.SendMessage('LobbyManager', 'FocusDoor', 'arcade')
      addTestResult('✅ Sent FocusDoor message to Unity')
      
      // Test other Unity methods
      setTimeout(() => {
        unityInstance.SendMessage('LobbyManager', 'StartGame', 'neon-runner')
        addTestResult('✅ Sent StartGame message to Unity')
      }, 1000)
      
    } catch (err) {
      addTestResult(`❌ Error communicating with Unity: ${err}`)
    }
  }

  const testUnityEvents = () => {
    // Test Unity event listeners
    const testEvent = new CustomEvent('fd:open', { detail: 'test-door' })
    document.dispatchEvent(testEvent)
    addTestResult('✅ Dispatched test Unity event')
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Unity Integration Test Page
        </h1>

        {/* Status Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Unity Status */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">Unity Status</h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Unity Instance:</span>
                <span className={unityReady ? 'text-green-400' : 'text-red-400'}>
                  {unityReady ? '✅ Ready' : '❌ Not Ready'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Loading State:</span>
                <span className={!isUnityLoaded ? 'text-yellow-400' : 'text-green-400'}>
                  {!isUnityLoaded ? '⏳ Loading...' : '✅ Loaded'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Unity Loaded:</span>
                <span className={isUnityLoaded ? 'text-green-400' : 'text-red-400'}>
                  {isUnityLoaded ? '✅ Yes' : '❌ No'}
                </span>
              </div>
            </div>
          </div>

          {/* Test Controls */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">Test Controls</h2>
            
            <div className="space-y-3">
              <button
                onClick={testUnityCommunication}
                disabled={!unityReady}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                Test Unity Communication
              </button>
              
              <button
                onClick={testUnityEvents}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                Test Unity Events
              </button>
              
              <button
                onClick={clearResults}
                className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Clear Results
              </button>
            </div>
          </div>
        </div>

        {/* Unity Scene Container */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-purple-300">Unity Scene</h2>
          
          {!isUnityLoaded ? (
            <div className="h-96 bg-gray-700/50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-purple-300">Loading Unity scene...</p>
              </div>
            </div>
          ) : unityReady ? (
            <div className="h-96 bg-gray-700/50 rounded-lg flex items-center justify-center">
              <p className="text-green-400 text-lg">Unity scene loaded successfully!</p>
            </div>
          ) : (
            <div className="h-96 bg-gray-700/50 rounded-lg flex items-center justify-center">
              <p className="text-yellow-400 text-lg">Unity not ready yet...</p>
            </div>
          )}
        </div>

        {/* Test Results */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-purple-300">Test Results</h2>
            <span className="text-sm text-gray-400">
              {testResults.length} test(s) run
            </span>
          </div>
          
          <div className="max-h-64 overflow-y-auto space-y-2">
            {testResults.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No tests run yet. Use the test controls above.</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="p-3 bg-gray-700/30 rounded-lg border-l-4 border-purple-500/50">
                  <p className="text-sm font-mono">{result}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Unity Build Info */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Unity Build Path: <code className="bg-gray-700 px-2 py-1 rounded">/UnityBuild/Build/</code></p>
          <p>Expected Files: <code className="bg-gray-700 px-2 py-1 rounded">FifthDimension.*</code></p>
        </div>
      </div>
    </div>
  )
} 