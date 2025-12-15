import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { useSidebar } from './contexts/SidebarContext'
import Header from './components/Header'
import LeftSidebar from './components/LeftSidebar'
import Home from './pages/Home'
import Profile from './pages/Profile'
import UserProfile from './pages/UserProfile'
import Stories from './pages/Stories'
import WriteStory from './pages/WriteStory'
import ArticleDetail from './pages/ArticleDetail'
import SearchResults from './pages/SearchResults'
import Login from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'
import './styles/CommonStyles.css'

function AppContent() {
  const { isLeftSidebarOpen } = useSidebar()

  return (
    <>
      <Header />
      <div className="app-body">
        {isLeftSidebarOpen && <LeftSidebar />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/user/:userId" element={<UserProfile />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/write" element={<WriteStory />} />
          <Route path="/write/:id" element={<WriteStory />} />
          <Route path="/article/:id" element={<ArticleDetail />} />
          <Route path="/search" element={<SearchResults />} />
        </Routes>
      </div>
    </>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <AppContent />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App