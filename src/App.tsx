import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { SupabaseProvider } from './contexts/SupabaseContext'
import { UnityProvider } from './contexts/UnityContext'
import { LandingPage } from './pages/LandingPage'
import { AuthPage } from './pages/AuthPage'
import { MainWorld } from './pages/MainWorld'
import { RecordStore } from './pages/RecordStore'
import { Arcade } from './pages/Arcade'
import { CommunityBoard } from './pages/CommunityBoard'
import { Ballroom } from './pages/Ballroom'
import { Profile } from './pages/Profile'
import { ProfileSetup } from './pages/ProfileSetup'
import { UnityTestPage } from './pages/UnityTestPage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Navigation } from './components/Navigation'
import './App.css'

function App() {
  return (
    <SupabaseProvider>
      <AuthProvider>
        <UnityProvider>
          <div className="App min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
            <Navigation />
            
            <main className="relative">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/unity-test" element={<UnityTestPage />} />
                
                {/* Profile setup route */}
                <Route path="/profile-setup" element={
                  <ProtectedRoute>
                    <ProfileSetup />
                  </ProtectedRoute>
                } />
                
                {/* Protected routes */}
                <Route path="/world" element={
                  <ProtectedRoute>
                    <MainWorld />
                  </ProtectedRoute>
                } />
                
                <Route path="/record-store" element={
                  <ProtectedRoute>
                    <RecordStore />
                  </ProtectedRoute>
                } />
                
                <Route path="/arcade" element={
                  <ProtectedRoute>
                    <Arcade />
                  </ProtectedRoute>
                } />
                
                <Route path="/community" element={
                  <ProtectedRoute>
                    <CommunityBoard />
                  </ProtectedRoute>
                } />
                
                <Route path="/ballroom" element={
                  <ProtectedRoute>
                    <Ballroom />
                  </ProtectedRoute>
                } />
                
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
          </div>
        </UnityProvider>
      </AuthProvider>
    </SupabaseProvider>
  )
}

export default App