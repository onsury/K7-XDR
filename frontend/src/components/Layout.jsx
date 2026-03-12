import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../App'

const NAV = [
  { path: '/app', label: 'Dashboard', icon: '📊' },
  { path: '/app/incidents', label: 'Incidents', icon: '🚨' },
  { path: '/app/devices', label: 'Devices', icon: '💻' },
  { path: '/app/alerts', label: 'Alerts', icon: '🔔' },
  { path: '/app/compliance', label: 'Compliance', icon: '📋' },
  { path: '/app/threat-hunt', label: 'Threat Hunt', icon: '🔍' },
  { path: '/app/attack-coverage', label: 'ATT&CK Coverage', icon: '🗺' },
  { path: '/app/rules', label: 'Rules', icon: '⚙' },
  { path: '/app/playbooks', label: 'Playbooks', icon: '📖' },
  { path: '/app/reports', label: 'Reports', icon: '📄' },
  { path: '/app/integrations', label: 'Integrations', icon: '🔗' },
  { path : '/compliance-timers', label: 'CERT-In/DPDPA', icon: '⏱'},
  { path: '/app/settings', label: 'Settings', icon: '⚡' },
]

export default function Layout() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const logout = () => {
    setUser(null)
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className={`${collapsed ? 'w-16' : 'w-56'} bg-k7-700 text-white flex flex-col transition-all duration-200`}>
        <div className="p-4 border-b border-k7-600">
          <div className="flex items-center justify-between">
            {!collapsed && <span className="text-lg font-bold">K7 XDR</span>}
            <button onClick={() => setCollapsed(!collapsed)} className="text-white hover:bg-k7-600 rounded p-1">
              {collapsed ? '▶' : '◀'}
            </button>
          </div>
        </div>
        <nav className="flex-1 py-2 overflow-y-auto">
          {NAV.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center px-4 py-2.5 text-sm transition-colors ${
                  isActive ? 'bg-k7-600 text-white border-r-3 border-white' : 'text-blue-100 hover:bg-k7-600 hover:text-white'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {!collapsed && <span className="ml-3">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-k7-600">
          {!collapsed && (
            <div className="text-xs text-blue-200 mb-2">
              <div>{user?.name}</div>
              <div>{user?.role}</div>
            </div>
          )}
          <button onClick={logout} className="w-full text-xs text-blue-200 hover:text-white py-1">
            {collapsed ? '🚪' : 'Logout'}
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}