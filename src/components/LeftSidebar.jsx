import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FaHome, FaUser, FaBook } from 'react-icons/fa'
import './LeftSidebar.css'

function LeftSidebar() {
  const location = useLocation()
  const { user } = useAuth()

  const menuItems = [
    { id: 'Home', path: '/', icon: <FaHome />, label: 'Home' },
    { id: 'Profile', path: '/profile', icon: <FaUser />, label: 'Profile' },
    { id: 'Stories', path: '/stories', icon: <FaBook />, label: 'Stories' },
  ]

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <aside className="left-sidebar glass-effect">
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const active = isActive(item.path)
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={`nav-item ${active ? 'active' : ''}`}
            >
              <div className="nav-item-content">
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </div>
              {active && <div className="active-indicator"></div>}
            </NavLink>
          )
        })}
      </nav>
      <div className="sidebar-footer glass-effect">
        <div className="user-info">
          <div className="user-avatar">
            {user?.full_name?.charAt(0) || user?.username?.charAt(0) || <FaUser />}
          </div>
          <div className="user-details">
            <div className="user-name">{user?.full_name || user?.username || 'User'}</div>
            <div className="user-email">{user?.email || 'user@example.com'}</div>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default LeftSidebar