import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

export default function Incidents() {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const navigate = useNavigate()

  useEffect(() => {
    api('/api/incidents/')
      .then(d => setIncidents(d.incidents || d || []))
      .catch(() => setIncidents([]))
      .finally(() => setLoading(false))
  }, [])

  const severityColor = (s) => s === 'critical' ? 'bg-red-100 text-red-700' : s === 'high' ? 'bg-orange-100 text-orange-700' : s === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
  const statusColor = (s) => s === 'open' ? 'bg-blue-100 text-blue-700' : s === 'investigating' ? 'bg-purple-100 text-purple-700' : s === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'

  const filtered = filter === 'all' ? incidents : incidents.filter(i => i.severity === filter || i.status === filter)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Incidents</h1>
        <div className="flex gap-2">
          {['all','critical','high','medium','open','resolved'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${filter === f ? 'bg-k7-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">ID</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Severity</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Assigned</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : filtered.map((inc, i) => (
              <tr key={i} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate('/incidents/' + (inc.id || inc.incident_id))}>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{inc.id || inc.incident_id}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{inc.title}</td>
                <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs font-medium ${severityColor(inc.severity)}`}>{inc.severity}</span></td>
                <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs font-medium ${statusColor(inc.status)}`}>{inc.status}</span></td>
                <td className="px-4 py-3 text-gray-600">{inc.assigned_to || '-'}</td>
                <td className="px-4 py-3 text-gray-500">{inc.created_at ? new Date(inc.created_at).toLocaleString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
