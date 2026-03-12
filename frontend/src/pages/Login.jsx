import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../App'
import { api } from '../lib/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [demoUsers, setDemoUsers] = useState([])
  const { setUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    api('/api/auth/login').then(d => setDemoUsers(d.users || []))
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await api('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      if (res.success) {
        setUser(res.user)
        navigate('/app')
      } else {
        setError(res.error || 'Login failed')
      }
    } catch {
      setError('Connection error')
    }
  }

  const quickLogin = (u) => {
    setEmail(u.email)
    setPassword(u.password)
  }

  return (
    <div className="min-h-screen bg-k7-700 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-k7-700">K7 XDR</h1>
          <p className="text-gray-500 mt-2">Enterprise Extended Detection & Response</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-k7-500 focus:border-transparent outline-none"
              placeholder="Enter email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-k7-500 focus:border-transparent outline-none"
              placeholder="Enter password"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full bg-k7-500 text-white py-2.5 rounded-lg hover:bg-k7-600 font-medium transition-colors">
            Sign In
          </button>
        </form>
        <div className="mt-6 border-t pt-4">
          <p className="text-xs text-gray-400 mb-3">Quick login (demo):</p>
          <div className="grid grid-cols-2 gap-2">
            {demoUsers.map(u => (
              <button
                key={u.email}
                onClick={() => quickLogin(u)}
                className="text-left p-2 rounded border border-gray-200 hover:border-k7-300 hover:bg-k7-50 transition-colors"
              >
                <div className="text-xs font-medium text-gray-800">{u.name}</div>
                <div className="text-xs text-gray-400">{u.role}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}