import { BrowserRouter, Route, Routes } from 'react-router'
import { RequireAuth } from './components/RequireAuth'
import { LandingPage } from './features/landing/LandingPage'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { ChatPlaceholder } from './features/chat/ChatPlaceholder'

/** App routes (docs/routing.md). `/` is public; `/dashboard` and `/chat/:sessionId`
 *  are guarded by RequireAuth, which redirects to Clerk's hosted sign-in. */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="/chat/:sessionId"
          element={
            <RequireAuth>
              <ChatPlaceholder />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
