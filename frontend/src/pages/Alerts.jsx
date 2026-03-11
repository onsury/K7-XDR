import React, { useState, useEffect } from 'react'
import { api } from '../lib/api'

const SEV_COLORS = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-blue-100 text-blue-700 border-blue-200',
}

const STATUS_COLORS = {
  open: 'bg-red-50 text-red-600',
  investigating: 'bg-yellow-50 text-yellow-600',
  resolved: 'bg-green-50 text-green-600',
  dismissed: 'bg-gray-100 text-gray-500',
}

function Badge({ text, colors }) {
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors}`}>{text}</span>
}

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [sevFilter, setSevFilter] = useState('all')
  const [srcFilter, setSrcFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 20

  useEffect(() => {
    api('/api/alerts').then(d => {
      const list = d.alerts || d
      setAlerts(list)
      setFiltered(list)
    })
  }, [])

  useEffect(() => {
    let f = [...alerts]
    if (sevFilter !== 'all') f = f.filter(a => a.severity === sevFilter)
    if (srcFilter !== 'all') f = f.filter(a => a.source === srcFilter)
    if (statusFilter !== 'all') f = f.filter(a => a.status === statusFilter)
    if (search) f = f.filter(a => (a.title || a.message || '').toLowerCase().includes(search.toLowerCase()) || (a.source || '').toLowerCase().includes(search.toLowerCase()))
    setFiltered(f)
    setPage(1)
  }, [sevFilter, srcFilter, statusFilter, search, alerts])

  const sources = [...new Set(alerts.map(a => a.source))].filter(Boolean)
  const statuses = [...new Set(alerts.map(a => a.status))].filter(Boolean)
  const pageAlerts = filtered.slice((page - 1) * perPage, page * perPage)
  const totalPages = Math.ceil(filtered.length / perPage)

  const sevCounts = { critical: 0, high: 0, medium: 0, low: 0 }
  alerts.forEach(a => { if (sevCounts[a.severity] !== undefined) sevCounts[a.severity]++ })

  return (
    <div className="p-5 space-y-4 bg-gray-50 min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
        <p className="text-sm text-gray-400">{filtered.length} of {alerts.length} alerts shown</p>
      </div>

      {/* Severity Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(sevCounts).map(([sev, count]) => (
          <button
            key={sev}
            onClick={() => setSevFilter(sevFilter === sev ? 'all' : sev)}
            className={`p-3 rounded-xl border-2 text-left transition-all ${
              sevFilter === sev ? 'ring-2 ring-k7-500 ' + SEV_COLORS[sev] : 'bg-white border-gray-200 hover:shadow'
            }`}
          >
            <div className="text-xs uppercase font-medium text-gray-400">{sev}</div>
            <div className={`text-2xl font-bold ${SEV_COLORS[sev].split(' ')[1]}`}>{count}</div>
          </button>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search alerts..."
          className="flex-1 min-w-48 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-k7-500 outline-none"
        />
        <select value={srcFilter} onChange={e => setSrcFilter(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none">
          <option value="all">All Sources</option>
          {sources.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none">
          <option value="all">All Status</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {(sevFilter !== 'all' || srcFilter !== 'all' || statusFilter !== 'all' || search) && (
          <button onClick={() => { setSevFilter('all'); setSrcFilter('all'); setStatusFilter('all'); setSearch('') }} className="text-xs text-red-500 hover:underline">
            Clear filters
          </button>
        )}
      </div>

      {/* Alerts Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
              <th className="px-4 py-3">Alert</th>
              <th className="px-4 py-3 w-24">Severity</th>
              <th className="px-4 py-3 w-24">Source</th>
              <th className="px-4 py-3 w-28">Status</th>
              <th className="px-4 py-3 w-40">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {pageAlerts.map((alert, i) => (
              <tr key={alert.id || i} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-900">{alert.title || alert.message}</div>
                  {alert.deviceId && <div className="text-xs text-gray-400 mt-0.5">{alert.deviceId}</div>}
                </td>
                <td className="px-4 py-3">
                  <Badge text={alert.severity} colors={SEV_COLORS[alert.severity] || 'bg-gray-100 text-gray-600'} />
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-gray-600 bg-gray-50 px-2 py-0.5 rounded">{alert.source}</span>
                </td>
                <td className="px-4 py-3">
                  <Badge text={alert.status} colors={STATUS_COLORS[alert.status] || 'bg-gray-100 text-gray-500'} />
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {new Date(alert.timestamp || alert.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">Page {page} of {totalPages}</span>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-30">Prev</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-30">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}