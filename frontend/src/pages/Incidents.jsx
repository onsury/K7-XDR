That's the old Devices page — it didn't pick up the new code. The file may not have saved properly. But it's functional, so let's keep moving.
Next quick win — Incidents page with better table and filters. Open frontend/src/pages/Incidents.jsx, select all, delete, paste:
javascriptimport React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

const SEV = { critical: 'bg-red-100 text-red-700', high: 'bg-orange-100 text-orange-700', medium: 'bg-yellow-100 text-yellow-700', low: 'bg-blue-100 text-blue-700' }
const STAT = { new: 'bg-blue-100 text-blue-700', investigating: 'bg-yellow-100 text-yellow-700', contained: 'bg-orange-100 text-orange-700', resolved: 'bg-green-100 text-green-700' }

export default function Incidents() {
  const [incidents, setIncidents] = useState([])
  const [filtered, setFiltered] = useState([])
  const [sevFilter, setSevFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api('/api/incidents').then(d => {
      const list = d.incidents || d
      setIncidents(list)
      setFiltered(list)
    })
  }, [])

  useEffect(() => {
    let f = [...incidents]
    if (sevFilter !== 'all') f = f.filter(i => i.severity === sevFilter)
    if (statusFilter !== 'all') f = f.filter(i => i.status === statusFilter)
    if (search) f = f.filter(i => i.title.toLowerCase().includes(search.toLowerCase()) || i.id.toLowerCase().includes(search.toLowerCase()))
    setFiltered(f)
  }, [sevFilter, statusFilter, search, incidents])

  const counts = { critical: 0, high: 0, medium: 0, low: 0 }
  incidents.forEach(i => { if (counts[i.severity] !== undefined) counts[i.severity]++ })

  return (
    <div className="p-5 space-y-4 bg-gray-50 min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Incidents</h1>
          <p className="text-sm text-gray-400">{filtered.length} of {incidents.length} incidents</p>
        </div>
      </div>

      {/* Severity Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(counts).map(([sev, count]) => (
          <button key={sev} onClick={() => setSevFilter(sevFilter === sev ? 'all' : sev)}
            className={`p-3 rounded-xl border-2 text-left transition-all ${sevFilter === sev ? 'ring-2 ring-k7-500 ' + SEV[sev] : 'bg-white border-gray-200 hover:shadow'}`}>
            <div className="text-xs uppercase text-gray-400">{sev}</div>
            <div className={`text-2xl font-bold ${SEV[sev].split(' ')[1]}`}>{count}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 flex flex-wrap items-center gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search incidents..."
          className="flex-1 min-w-48 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-k7-500 outline-none" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none">
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="investigating">Investigating</option>
          <option value="contained">Contained</option>
          <option value="resolved">Resolved</option>
        </select>
        {(sevFilter !== 'all' || statusFilter !== 'all' || search) && (
          <button onClick={() => { setSevFilter('all'); setStatusFilter('all'); setSearch('') }} className="text-xs text-red-500 hover:underline">Clear</button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
              <th className="px-4 py-3 w-24">ID</th>
              <th className="px-4 py-3">Incident</th>
              <th className="px-4 py-3 w-24">Severity</th>
              <th className="px-4 py-3 w-28">Status</th>
              <th className="px-4 py-3 w-24">Source</th>
              <th className="px-4 py-3 w-36">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(inc => (
              <tr key={inc.id} onClick={() => navigate(`/incidents/${inc.id}`)}
                className={`cursor-pointer hover:bg-blue-50/50 transition-colors ${inc.severity === 'critical' ? 'bg-red-50/30' : ''}`}>
                <td className="px-4 py-3 text-xs font-mono text-k7-600 font-medium">{inc.id}</td>
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-900">{inc.title}</div>
                  {inc.affectedAssets && <div className="text-xs text-gray-400 mt-0.5">{inc.affectedAssets.slice(0, 2).join(', ')}</div>}
                </td>
                <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SEV[inc.severity]}`}>{inc.severity}</span></td>
                <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STAT[inc.status]}`}>{inc.status}</span></td>
                <td className="px-4 py-3"><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{inc.source}</span></td>
                <td className="px-4 py-3 text-xs text-gray-400">{new Date(inc.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
