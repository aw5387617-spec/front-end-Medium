import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSidebar } from '../contexts/SidebarContext'
import { FaBars, FaSearch, FaPen, FaSignOutAlt } from 'react-icons/fa'
import './Header.css'

function Header() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { toggleBothSidebars } = useSidebar()
  const [searchQuery, setSearchQuery] = useState('')

  const handleWriteClick = () => {
    navigate('/write')
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <header className="header glass-effect">
      <div className="header-left">
        <button className="hamburger-menu" onClick={toggleBothSidebars}>
          <FaBars />
        </button>
        <div className="logo-container">
          <span className="code-wars-logo">Clone Medium</span>
        </div>
        <form className="search-bar glass-effect" onSubmit={handleSearch}>
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search"
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>
      <div className="header-right">
        <button className="write-button glass-effect" onClick={handleWriteClick}>
          <FaPen />
          <span className="write-text">Write</span>
        </button>
        <button className="logout-button glass-effect" onClick={handleLogout}>
          <FaSignOutAlt />
          <span className="logout-text">Logout</span>
        </button>
      </div>
    </header>
  )
}

export default Header