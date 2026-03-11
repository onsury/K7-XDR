import React, { useState, useEffect } from 'react'
import { api } from '../lib/api'

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/api/users/')
      .then(d => setUsers(d.users || d || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }, [])

  const roleColor = (r) => r === 'ciso' ? 'bg-purple-100 text-purple-700' : r === 'soc_manager' ? 'bg-blue-100 text-blue-700' : r === 'soc_analyst' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Users</h1>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No users found</td></tr>
            ) : users.map((u, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs font-medium ${roleColor(u.role)}`}>{u.role}</span></td>
                <td className="px-4 py-3"><span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">{u.status || 'active'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
